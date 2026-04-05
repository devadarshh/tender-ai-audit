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

            await prisma.document.update({
                where: { id: documentId },
                data: { status: "downloading" }
            });

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
                data: { status: "embedding" }
            });

            const chunks = await splitter.splitDocuments([
                new Document({
                    pageContent: pdfData.text,
                    metadata: { documentId, fileName: docRecord.fileName }
                })
            ]);

            console.log(`🧠 Status: Generating embeddings for ${chunks.length} chunks...`);
            
            // --- SENIOR ENGINEER FIX: Batching Embeddings ---
            // Large documents will timeout the HF API if sent in one payload.
            const BATCH_SIZE = 25;
            const points = [];
            
            for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
                const batchChunks = chunks.slice(i, i + BATCH_SIZE);
                console.log(`   └> Progress: ${i}/${chunks.length} chunks...`);
                
                const batchEmbeddings = (await hf.featureExtraction({
                    model: "sentence-transformers/all-MiniLM-L6-v2",
                    inputs: batchChunks.map((c) => c.pageContent),
                })) as number[][];

                const batchPoints = batchChunks.map((chunk, j) => ({
                    id: uuidv4(),
                    vector: batchEmbeddings[j]!,
                    payload: { ...chunk.metadata, content: chunk.pageContent },
                }));
                
                points.push(...batchPoints);
            }

            console.log(`💾 STATUS: Storing ${points.length} points in Qdrant...`);
            await qdrantClient.upsert(COLLECTION_NAME, { points });
            
            // --- AUTOMATIC AI ANALYSIS STAGE ---
            await prisma.document.update({
                where: { id: documentId },
                data: { status: "analyzing" }
            });

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
    { connection: redis as any, concurrency: 2 }
);

// Explicit Event Listeners for Better Terminal Visibility
pdfWorker.on("ready", () => console.log("✅ Worker engine online."));
pdfWorker.on("active", (job) => console.log(`👉 Job ${job.id} picked up by this worker.`));
pdfWorker.on("failed", (job, err) => console.error(`🚨 Job ${job?.id} FAILED:`, err.message));
pdfWorker.on("error", (err) => console.error(`⚠️ Worker Error:`, err.message));
