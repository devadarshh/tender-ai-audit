import "dotenv/config";
import { Worker, Job } from "bullmq";
import { Document } from "@langchain/core/documents";
import { v4 as uuidv4 } from "uuid";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

import { prisma } from "../lib/prisma";
import { supabase } from "../lib/supabase";
import { splitter } from "../lib/splitter";
import { hf } from "../lib/hfClient";
import { COLLECTION_NAME, qdrantClient, ensureCollection } from "../lib/qdrant";
import { redis } from "../lib/redis";
import { runConstructionAnalysis } from "../lib/analyser";

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
            await ensureCollection();

            const docRecord = await prisma.document.findUnique({
                where: { id: documentId }
            });

            if (!docRecord) throw new Error(`Document ${documentId} not found.`);

            console.log(`📦 Status: Downloading ${docRecord.fileName}...`);
            const { data: blob, error: downloadError } = await supabase.storage
                .from("Files")
                .download(docRecord.fileUrl);

            if (downloadError || !blob) throw new Error(`Download Error: ${downloadError?.message}`);

            console.log(`📄 Status: Extracting text from PDF...`);
            const buffer = Buffer.from(await blob.arrayBuffer());
            const pdfData = await pdf(buffer);

            if (!pdfData?.text) throw new Error("Empty PDF.");

            await prisma.document.update({
                where: { id: documentId },
                data: { status: "processing" }
            });

            const chunks = await splitter.splitDocuments([
                new Document({
                    pageContent: pdfData.text,
                    metadata: { documentId, fileName: docRecord.fileName }
                })
            ]);

            console.log(`🧠 Status: Generating embeddings for ${chunks.length} chunks...`);
            const embeddings = (await hf.featureExtraction({
                model: "sentence-transformers/all-MiniLM-L6-v2",
                inputs: chunks.map((c) => c.pageContent),
            })) as number[][];

            const points = chunks.map((chunk, i) => ({
                id: uuidv4(),
                vector: embeddings[i]!,
                payload: { ...chunk.metadata, content: chunk.pageContent },
            }));

            await qdrantClient.upsert(COLLECTION_NAME, { points });
            
            // --- AUTOMATIC AI ANALYSIS STAGE ---
            console.log(`🔍 AI Status: Analyzing ${docRecord.fileName} for construction risks...`);
            const analysisContext = pdfData.text.slice(0, 30000); 
            await runConstructionAnalysis(documentId, analysisContext);

            await prisma.document.update({
                where: { id: documentId },
                data: { status: "completed" }
            });

            console.log(`✨ [Job ${job.id}] Finalized: Full RAG and Analysis is READY.`);

        } catch (err: any) {
            console.error(`❌ [Job ${job.id}] Critical Failure:`, err.message);
            await prisma.document.update({ where: { id: documentId }, data: { status: "failed" } });
            throw err;
        }
    },
    { connection: redis as any, concurrency: 5 }
);

pdfWorker.on("ready", () => console.log("✅ Worker engine online."));
