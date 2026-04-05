import "dotenv/config";
import { Worker, Job } from "bullmq";
import { Document } from "@langchain/core/documents";
import { v4 as uuidv4 } from "uuid";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

// Import local libs using relative paths for standalone tsx execution
// Fixed: Using correct relative paths and ensuring imports are clean
import { prisma } from "../lib/prisma";
import { supabase } from "../lib/supabase";
import { splitter } from "../lib/splitter";
import { hf } from "../lib/hfClient";
import { COLLECTION_NAME, qdrantClient, ensureCollection } from "../lib/qdrant";
import { redis } from "../lib/redis";

interface FileJobData {
    documentId: string;
}

const REDIS_URL = process.env.UPSTASH_REDIS_URL;

console.log("🛠️  Initializing RAG Worker (Senior Mode)...");
if (!REDIS_URL) {
    console.error("❌ ERROR: UPSTASH_REDIS_URL is not defined in .env");
}

export const pdfWorker = new Worker<FileJobData>(
    "file-upload-queue",
    async (job: Job<FileJobData>) => {
        const { documentId } = job.data;

        console.log(`\n---------------------------------------------------------`);
        console.log(`🚀 [Job ${job.id}] Processing Pipeline Started: ${documentId}`);

        try {
            // 0. Infrastructure Check
            await ensureCollection();

            // 1. Fetch Document Record
            const docRecord = await prisma.document.findUnique({
                where: { id: documentId }
            });

            if (!docRecord) {
                throw new Error(`Document ${documentId} not found in database.`);
            }

            // 2. Download from Supabase
            console.log(`📦 Status: Downloading ${docRecord.fileName}...`);
            const { data: blob, error: downloadError } = await supabase.storage
                .from("Files")
                .download(docRecord.fileUrl);

            if (downloadError || !blob) {
                throw new Error(`Supabase Download Error: ${downloadError?.message || 'Empty file response'}`);
            }

            // 3. Text Extraction
            console.log(`📄 Status: Extracting text from PDF (Buffer size: ${blob.size} bytes)...`);
            const arrayBuffer = await blob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Standard pdf-parse 1.1.1 usage
            const pdfData = await pdf(buffer);

            if (!pdfData || !pdfData.text || pdfData.text.trim().length === 0) {
                throw new Error("PDF extraction resulted in no text content.");
            }

            console.log(`📝 Total text extracted: ${pdfData.text.length} characters.`);

            // 4. Status Tracking: Processing
            await prisma.document.update({
                where: { id: documentId },
                data: { status: "processing" }
            });

            // 5. NLP Processing: Chunking
            console.log(`✂️  Status: Splitting text into ${pdfData.numpages} pages/chunks...`);
            const chunks = await splitter.splitDocuments([
                new Document({
                    pageContent: pdfData.text,
                    metadata: {
                        documentId,
                        fileName: docRecord.fileName,
                        totalPages: pdfData.numpages
                    }
                })
            ]);

            // 6. AI Engine: Vector Embeddings
            console.log(`🧠 Status: Generating embeddings for ${chunks.length} chunks...`);
            const embeddings = (await hf.featureExtraction({
                model: "sentence-transformers/all-MiniLM-L6-v2",
                inputs: chunks.map((c) => c.pageContent),
            })) as number[][];

            // 7. Persistence: Vector Storage
            console.log(`💾 Status: Syncing vectors to Qdrant collection...`);
            const points = chunks.map((chunk, index) => ({
                id: uuidv4(),
                vector: embeddings[index]!,
                payload: {
                    ...chunk.metadata,
                    content: chunk.pageContent,
                    part: index + 1
                },
            }));

            await qdrantClient.upsert(COLLECTION_NAME, { points });

            // 8. Finalization
            await prisma.document.update({
                where: { id: documentId },
                data: { status: "completed" }
            });

            console.log(`✨ [Job ${job.id}] Finalized: ${docRecord.fileName} is READY.`);
            console.log(`---------------------------------------------------------\n`);

        } catch (err: any) {
            console.error(`❌ [Job ${job.id}] Critical Pipeline Failure:`, err.message);

            try {
                await prisma.document.update({
                    where: { id: documentId },
                    data: { status: "failed" }
                });
            } catch (dbErr) {
                console.error("Infrastructure Error: Could not update status in DB.");
            }

            throw err;
        }
    },
    {
        connection: redis as any,
        concurrency: 5
    }
);

pdfWorker.on("ready", () => {
    console.log("✅ Worker engine online. Listening for 'file-upload-queue' events...");
});

pdfWorker.on("error", (err) => {
    console.error("📛 Worker connection error:", err);
});
