import { GoogleGenerativeAI } from '@google/generative-ai';
import { CausalGraph } from './CausalGraphBuilder';

export class GeminiIntegration {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        // Using gemini-1.5-pro for reasoning tasks like processing graphs and explaining root causes
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    }

    /**
     * Passes the causal graph to Gemini and gets back a human-readable diagnosis and story.
     */
    public async generateHumanStory(graph: CausalGraph): Promise<string> {
        const graphJson = JSON.stringify(graph, null, 2);

        const prompt = `
You are the brain of DebugDNA, an advanced crash analysis tool. 
Your job is to take a causal graph representing a software crash and turn it into a simple, human-readable story.
You need to figure out WHAT caused the crash and explain it clearly to a developer so they can easily fix it.

Here is the Causal Graph in JSON format containing environment data, preceding events (breadcrumbs), the specific error, and stack trace frames.
Wait relation types include CAUSED_BY, FOLLOWED_BY, EXECUTED_IN, and PART_OF.
---
${graphJson}
---

Please provide your analysis in the following Markdown format:
### 📖 The Story
What exactly happened leading up to the crash? Connect the breadcrumb events, the environment context, and the eventual error. Make it read like a narrative.
(Example: "The user loaded the application on Chrome, navigated to the dashboard, clicked the 'Submit' button, and then the app crashed because...")

### 🔍 Root Cause
Provide a technical but clear explanation of the exact point of failure based on the error and the stack trace function calls. What is the fundamental issue here?

### 🛠️ Actionable Fix
Give a solid suggestion on how the developer can prevent this error from happening again, including potential code adjustments, null checks, or edge case testing.

Keep it professional, deeply informative, and actionable. Do not output anything except the structured response above.
`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Error communicating with Gemini API:", error);
            throw new Error("Failed to generate crash story from Gemini.");
        }
    }
}
