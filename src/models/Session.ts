// ============================================================
// DebugDNA — Session Mongoose Model
// Each document represents one browser session with embedded events
// ============================================================

import mongoose, { Schema, type Document } from "mongoose";
import { EventSchema } from "./Event";

/**
 * TypeScript interface for a Session document (Mongoose hydrated).
 */
export interface ISession extends Document {
    sessionId: string;
    projectId: string;
    status: "pending" | "analyzed";
    createdAt: Date;
    crashedAt: Date | null;
    events: Array<{
        t: number;
        type: string;
        endpoint?: string;
        method?: string;
        status?: number;
        value?: unknown;
        fn?: string;
        args?: unknown[];
        error?: string;
        stack?: string;
    }>;
    analysis: {
        story: string;
        rootCause: string;
        fix: string;
        test: string;
        affectedFunction: string;
    } | null;
}

const SessionSchema = new Schema<ISession>(
    {
        sessionId: { type: String, required: true, unique: true },
        projectId: { type: String, required: true },
        status: {
            type: String,
            enum: ["pending", "analyzed"],
            default: "pending",
        },
        crashedAt: { type: Date, default: null },
        events: { type: [EventSchema], default: [] },
        analysis: {
            type: new Schema(
                {
                    story: { type: String, required: true },
                    rootCause: { type: String, required: true },
                    fix: { type: String, required: true },
                    test: { type: String, required: true },
                    affectedFunction: { type: String, required: true },
                },
                { _id: false }
            ),
            default: null,
        },
    },
    {
        // Automatically add createdAt and updatedAt fields
        timestamps: true,
    }
);

// ── Indexes ──────────────────────────────────────────────────
SessionSchema.index({ createdAt: -1 });

// ── Export ────────────────────────────────────────────────────
// Use the cached model pattern to avoid OverwriteModelError in Next.js dev HMR
const Session =
    mongoose.models.Session ||
    mongoose.model<ISession>("Session", SessionSchema);

export default Session;
