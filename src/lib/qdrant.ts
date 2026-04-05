import { QdrantClient } from "@qdrant/js-client-rest";

export const qdrantClient = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
});

export const COLLECTION_NAME = "tender_documents";

export async function ensureCollection() {
    try {
        const collections = await qdrantClient.getCollections();
        if (!collections.collections.some((c) => c.name === COLLECTION_NAME)) {
            await qdrantClient.createCollection(COLLECTION_NAME, {
                vectors: { size: 384, distance: "Cosine" },
            });
        }
    } catch (error) {
        console.error("Qdrant ensureCollection error:", error);
    }
}