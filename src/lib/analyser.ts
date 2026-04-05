import { generateText } from "ai";
import { prisma } from "./prisma";
import { geminiModel } from "./gemini";

/**
 * SENIOR AI WORKER: 
 * This contains the shared 'Expert Construction Analyst' logic. 
 * Can be called from the background worker or an API. 
 */
export async function runConstructionAnalysis(documentId: string, context: string) {
    console.log(`🧠 AI PHASE: Running Expert Construction Analysis for ${documentId}...`);
    
    const PROMPT = `
      You are an expert construction estimator and risk analyst. Analyze the following document context:
      ${context}

      STRICT RULES:
      - Return ONLY valid JSON matching this output format.
      - No extra text or conversational filler.
      
      OUTPUT FORMAT:
      {
        "project_snapshot": { "project_type": "string", "scope": ["string"], "timeline": "string" },
        "scope_gaps": ["string"],
        "risks": [ { "issue": "string", "category": "Scope | Timeline | Cost | Contract", "severity": "Low | Medium | High" } ],
        "risk_summary": { "Scope": 0, "Timeline": 0, "Cost": 0, "Contract": 0 },
        "cost_signals": [ { "type": "Material | Labor | Logistics | Equipment", "description": "string", "impact": "Low | Medium | High" } ],
        "cost_breakdown": { "Material": 0, "Labor": 0, "Logistics": 0, "Equipment": 0 },
        "recommendation": "string",
        "confidence": { "level": "Low | Medium | High", "score": 85 },
        "completeness_score": 75
      }
    `;

    const { text: analyzeOutput } = await generateText({
      model: geminiModel,
      prompt: PROMPT,
      temperature: 0.1, // Fixed for extraction stability
    });

    // Parse with a safe format clean
    const jsonStr = analyzeOutput.replace(/```json|```/g, "").trim();
    const parsedData = JSON.parse(jsonStr);

    console.log(`💾 Persisting Analysis to database...`);
    return await prisma.analysis.upsert({
        where: { documentId: documentId },
        update: {
            projectSnapshot: parsedData.project_snapshot,
            scopeGaps: parsedData.scope_gaps,
            risks: parsedData.risks,
            riskSummary: parsedData.risk_summary,
            costSignals: parsedData.cost_signals,
            costBreakdown: parsedData.cost_breakdown,
            recommendation: parsedData.recommendation,
            confidence: parsedData.confidence,
            completenessScore: parsedData.completeness_score,
        },
        create: {
            documentId: documentId,
            projectSnapshot: parsedData.project_snapshot,
            scopeGaps: parsedData.scope_gaps,
            risks: parsedData.risks,
            riskSummary: parsedData.risk_summary,
            costSignals: parsedData.cost_signals,
            costBreakdown: parsedData.cost_breakdown,
            recommendation: parsedData.recommendation,
            confidence: parsedData.confidence,
            completenessScore: parsedData.completeness_score,
        }
    });
}
