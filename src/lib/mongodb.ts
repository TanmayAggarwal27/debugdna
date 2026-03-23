// ============================================================
// DebugDNA — MongoDB Connection Utility
// Singleton pattern to avoid multiple connections in Next.js dev mode
// ============================================================

import mongoose from "mongoose";

const MONGOURL = process.env.MONGOURL;

if (!MONGOURL) {
    throw new Error(
        "❌ MONGOURL is not defined. Add it to your .env.local file.\n" +
        "   Example: MONGOURL=mongodb+srv://user:pass@cluster.mongodb.net/debugdna"
    );
}

/**
 * Global cache for the mongoose connection promise.
 * In Next.js dev mode, modules are re-evaluated on every HMR update.
 * Caching the promise on `globalThis` ensures we reuse the same
 * connection instead of opening a new one every time.
 */
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

// Extend globalThis so TypeScript doesn't complain
declare global {
    // eslint-disable-next-line no-var
    var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = globalThis._mongooseCache ?? {
    conn: null,
    promise: null,
};

if (!globalThis._mongooseCache) {
    globalThis._mongooseCache = cached;
}

/**
 * Connect to MongoDB Atlas (or return the existing connection).
 * Call this at the top of every API route handler.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGOURL as string, {
            bufferCommands: false,
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        // Reset so a subsequent call will retry
        cached.promise = null;
        throw error;
    }

    return cached.conn;
}
