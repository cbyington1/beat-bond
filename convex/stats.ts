import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserDBID } from "./users";

export const updateStats = mutation(async (ctx, stats: { topTracks: string[]; topGenre: string }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new Error("Authentication required");
    }
    const userDBID = await getUserDBID(ctx, { userID: identity.subject });
    if (!userDBID) {
        throw new Error("User not found");
    }
    await ctx.db.insert("stats", {
        topTracks: stats.topTracks,
        topGenre: stats.topGenre,
        ownerTo: userDBID,
    });
});

export const getStats = query({
    args: { userID: v.string() },
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Authentication required");
        }
        const userDBID = await getUserDBID(ctx, { userID: identity.subject });
        return await ctx.db
            .query("stats")
            .filter((q) => q.eq(q.field("ownerTo"), userDBID))
            .first();
    }
});