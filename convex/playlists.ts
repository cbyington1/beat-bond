import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUserDBID } from "./users";

export const savePlaylist = mutation(async (ctx, playlist: { name: string; tracks: string[] }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new Error("Authentication required");
    }
    const userDBID = await getUserDBID(ctx, { userID: identity.subject });
    console.log("Saving playlist for user", userDBID);
    await ctx.db.insert("playlists", {
        name: playlist.name,
        tracks: playlist.tracks,
        ownerTo: userDBID,
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