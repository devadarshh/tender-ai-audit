import { fileQueue } from "../src/lib/queue";
import { pdfWorker } from "../src/workers/pdf-worker";

async function test() {
    console.log("🧪 Starting Worker Test...");
    
    // 1. Log worker status
    console.log("Worker is listening on 'file-upload-queue'...");

    // 2. Add a dummy job (Note: This will fail if the documentId doesn't exist in DB)
    // But we can at least see if it connects to Redis
    try {
        const job = await fileQueue.add("test-job", {
            documentId: "test-id-123"
        });
        console.log(`✅ Job added to queue: ${job.id}`);
    } catch (err) {
        console.error("❌ Failed to add job to Redis:", err);
    }
}

test();
