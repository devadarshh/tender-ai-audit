import { createGoogleGenerativeAI } from "@ai-sdk/google";


if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.warn("⚠️ Warning: GOOGLE_GENERATIVE_AI_API_KEY is missing from .env. Construction analysis will fail.");
}

export const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
});

export const geminiModel = google("gemini-2.5-flash");
