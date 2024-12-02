import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const savePlaylist = mutation(async (ctx, playlist: { name: string; tracks: string[] }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new Error("Authentication required");
    }
    await ctx.db.insert("playlists", {
        name: playlist.name,
        tracks: playlist.tracks,
        owner: identity.id,
    });
});

export const getPlaylist = query({
    args: { userDBID: v.id("users") },
    handler: async ( ctx , { userDBID }) => {
        return await ctx.db
            .query("playlists")
            .filter((q) => q.eq(q.field("owner"), userDBID))
            .first();
    },
});