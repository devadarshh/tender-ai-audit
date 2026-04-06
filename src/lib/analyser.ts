import { generateText } from "ai";
import { prisma } from "./prisma";
import { geminiModel } from "./gemini";

export interface AuditAnalysisSchema {
  projectSnapshot: {
    projectType: string;
    scope: string[];
    timeline: string;
  };
  scopeGaps: string[];
  risks: Array<{
    issue: string;
    category: "Scope" | "Timeline" | "Cost" | "Contract";
    severity: "Low" | "Medium" | "High";
  }>;
  riskSummary: Record<string, number>;
  costSignals: Array<{
    type: "Material" | "Labor" | "Logistics" | "Equipment";
    description: string;
    impact: "Low" | "Medium" | "High";
  }>;
  costBreakdown: Record<string, number>;
  recommendation: string;
  confidence: {
    level: "Low" | "Medium" | "High";
    score: number;
  };
  completenessScore: number;
}

/**
 * SENIOR AI WORKER: 
 * This contains the shared 'Expert Construction Analyst' logic. 
 * Can be called from the background worker or an API. 
 */
export async function runConstructionAnalysis(documentId: string, context: string) {
  console.log(`🧠 AI PHASE: Running Expert Construction Analysis for ${documentId}...`);

  // const PROMPT = `
  //   You are an expert construction estimator and risk analyst. Analyze the following document context:
  //   ${context}

  //   STRICT RULES:
  //   - Return ONLY valid JSON matching this output format.
  //   - No extra text or conversational filler.

  //   OUTPUT FORMAT:
  //   {
  //     "project_snapshot": { "project_type": "string", "scope": ["string"], "timeline": "string" },
  //     "scope_gaps": ["string"],
  //     "risks": [ { "issue": "string", "category": "Scope | Timeline | Cost | Contract", "severity": "Low | Medium | High" } ],
  //     "risk_summary": { "Scope": 0, "Timeline": 0, "Cost": 0, "Contract": 0 },
  //     "cost_signals": [ { "type": "Material | Labor | Logistics | Equipment", "description": "string", "impact": "Low | Medium | High" } ],
  //     "cost_breakdown": { "Material": 0, "Labor": 0, "Logistics": 0, "Equipment": 0 },
  //     "recommendation": "string",
  //     "confidence": { "level": "Low | Medium | High", "score": 85 },
  //     "completeness_score": 75
  //   }
  // `;
  const PROMPT = `
You are a senior construction estimator, contract auditor, and risk analyst specializing in European construction tenders.

Analyze the following document context carefully:

---------------------
${context}
---------------------

=====================
STRICT INSTRUCTIONS
=====================

1. Output ONLY valid JSON. No explanations, no markdown, no extra text.
2. Do NOT hallucinate. If information is missing, explicitly state "Not specified".
3. Be concise, precise, and structured.
4. Use domain knowledge from construction, procurement, and compliance (EU standards, safety, contracts).
5. Extract ONLY what is supported by the document.

=====================
EXTRACTION RULES
=====================

PROJECT SNAPSHOT:
- project_type → infer (e.g., Residential, Commercial, Infrastructure)
- scope → list of clearly defined work items
- timeline → exact or inferred (else "Not specified")

SCOPE GAPS:
- Identify missing critical systems:
  HVAC, Fire Safety, Structural details, Compliance, Documentation, etc.

RISKS:
- Each risk must include:
  - issue (clear problem)
  - category: Scope | Timeline | Cost | Contract
  - severity: Low | Medium | High
- Only include REAL risks, not generic statements

RISK SUMMARY:
- Count number of risks per category

COST SIGNALS:
- Identify cost-impacting signals:
  - Missing scope
  - Undefined materials
  - Contractor responsibility ambiguity
  - Logistics complexity

COST BREAKDOWN:
- Estimate relative impact distribution (0–100 total)
- Must sum approximately to 100

RECOMMENDATION:
- Provide 1–2 actionable insights (not generic advice)

CONFIDENCE:
- High → clear structured tender
- Medium → partial data
- Low → vague/ambiguous document

COMPLETENESS SCORE:
- 0–100 based on:
  - scope clarity
  - compliance presence
  - risk coverage

=====================
OUTPUT FORMAT (STRICT)
=====================

{
  "projectSnapshot": {
    "projectType": "string",
    "scope": ["string"],
    "timeline": "string"
  },
  "scopeGaps": ["string"],
  "risks": [
    {
      "issue": "string",
      "category": "Scope | Timeline | Cost | Contract",
      "severity": "Low | Medium | High"
    }
  ],
  "riskSummary": {
    "Scope": 0,
    "Timeline": 0,
    "Cost": 0,
    "Contract": 0
  },
  "costSignals": [
    {
      "type": "Material | Labor | Logistics | Equipment",
      "description": "string",
      "impact": "Low | Medium | High"
    }
  ],
  "costBreakdown": {
    "Material": 0,
    "Labor": 0,
    "Logistics": 0,
    "Equipment": 0
  },
  "recommendation": "string",
  "confidence": {
    "level": "Low | Medium | High",
    "score": number
  },
  "completenessScore": number
}
`;

  const { text: analyzeOutput } = await generateText({
    model: geminiModel,
    prompt: PROMPT,
    temperature: 0.1, // Fixed for extraction stability
  });

  // Parse with a safe format clean
  const jsonStr = analyzeOutput.replace(/```json|```/g, "").trim();
  const parsedData = JSON.parse(jsonStr) as AuditAnalysisSchema;

  console.log(`💾 Persisting Analysis to database...`);
  return await prisma.analysis.upsert({
    where: { documentId: documentId },
    update: {
      ...parsedData,
    },
    create: {
      documentId: documentId,
      ...parsedData,
    }
  });
}
