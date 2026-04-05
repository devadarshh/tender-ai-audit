import { Queue } from "bullmq";
import { redis } from "./redis";

export const fileQueue = new Queue("file-upload-queue", {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
    },
});
