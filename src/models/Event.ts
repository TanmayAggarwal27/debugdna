// ============================================================
// DebugDNA — Event Sub-document Schema
// This is NOT a standalone collection — it's embedded inside Session
// ============================================================

import { Schema } from "mongoose";

/**
 * Mongoose sub-document schema for a single captured event.
 * Imported and embedded as an array in the Session model.
 */
export const EventSchema = new Schema(
    {
        /** Timestamp offset in ms from session start */
        t: { type: Number, required: true },

        /** Event category */
        type: {
            type: String,
            required: true,
            enum: ["api_call", "user_action", "state_change", "console_error", "CRASH"],
        },

        /** For api_call — the fetched URL */
        endpoint: { type: String },

        /** For api_call — HTTP method */
        method: { type: String },

        /** For api_call — HTTP response status code */
        status: { type: Number },

        /** Captured return value / state / response body */
        value: { type: Schema.Types.Mixed },

        /** For state_change — function name */
        fn: { type: String },

        /** For state_change — function arguments */
        args: { type: [Schema.Types.Mixed] },

        /** For CRASH / console_error — error message */
        error: { type: String },

        /** For CRASH — raw stack trace */
        stack: { type: String },
    },
    {
        // Disable _id on sub-documents to keep things lightweight
        _id: false,
    }
);
