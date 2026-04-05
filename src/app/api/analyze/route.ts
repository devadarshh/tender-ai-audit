import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COLLECTION_NAME, qdrantClient } from "@/lib/qdrant";
import { runConstructionAnalysis } from "@/lib/analyser";

/**
 * API ROUTE: Trigger a manual analysis or re-run an existing one. 
 */
export async function POST(req: NextRequest) {
    try {
        const { documentId } = await req.json();

        // 1. Fetch Document metadata
        const document = await prisma.document.findUnique({
            where: { id: documentId },
        });

        if (!document) return NextResponse.json({ error: "File not found" }, { status: 404 });

        // 2. RAG Retrieval Logic: Pull chunks for this document
        const searchResult = await qdrantClient.search(COLLECTION_NAME, {
            vector: new Array(384).fill(0), // Scan for the document's structure
            limit: 15,
            with_payload: true,
            filter: { must: [{ key: "documentId", match: { value: documentId } }] },
        });

        const context = searchResult
            .map((r, i) => `--- Chunk ${i + 1} ---\n${r.payload?.content}\n---`)
            .join("\n\n");

        // 3. Delegate to the Analyst Lib
        const savedAnalysis = await runConstructionAnalysis(documentId, context);

        return NextResponse.json({ success: true, analysisId: savedAnalysis.id });

    } catch (err) {
        console.error("Manual Analysis Pipeline Error:", err);
        return NextResponse.json({ error: "AI Pipeline Calculation Failed" }, { status: 500 });
    }
}
