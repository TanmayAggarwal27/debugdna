import { GoogleGenAI } from "@google/genai";
import { CausalGraph, Event, Analysis } from "@/types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeWithGemini(
  causalGraph: CausalGraph,
  events: Event[]
): Promise<Analysis> {
  try {
    const prompt = `You are a senior software engineer analyzing a production crash.

Here is the causal chain summary:
${causalGraph.summary}

Here is the origin event where the problem started:
${JSON.stringify(causalGraph.originEvent, null, 2)}

Here is the crash event:
${JSON.stringify(causalGraph.crashEvent, null, 2)}

Here is the full event sequence (${events.length} events):
${JSON.stringify(events, null, 2)}

Your job is to return a JSON object with exactly these fields:
{
  "story": "A 2-3 sentence plain English explanation of what happened and why, written for a developer. Mention the specific endpoint, function, or value involved. Be specific, not generic.",
  "rootCause": "One sentence identifying the exact root cause. Example: resizeImage() has no null guard and assumes user.avatar always exists.",
  "fix": "The minimal code fix as a code snippet. Show before and after. Use JavaScript/TypeScript.",
  "test": "A unit test using Jest syntax that would have caught this bug.",
  "affectedFunction": "${causalGraph.affectedFunction}"
}

Return ONLY valid JSON. No markdown, no explanation, no backticks. Just the raw JSON object.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    // Clean up markdown markers if Gemini ignores the instruction and outputs json blocks
    const cleanedText = text.replace(/```json/gi, "").replace(/```/g, "").trim();

    return JSON.parse(cleanedText) as Analysis;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      story: "We couldn't generate a story for this crash.",
      rootCause: "Unknown root cause due to analysis failure.",
      fix: "N/A",
      test: "N/A",
      affectedFunction: causalGraph.affectedFunction
    };
  }
}
