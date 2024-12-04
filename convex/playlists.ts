import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserDBID } from "./users";

export const savePlaylist = mutation({
    args: { 
        name: v.string(), 
        tracks: v.array(v.string()) 
    },
    handler: async (ctx, { name, tracks }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Authentication required");
        }
        const userDBID = await getUserDBID(ctx, { userID: identity.subject });
        
        // Optional: Check if a playlist with this name already exists and update it
        const existingPlaylist = await ctx.db
            .query("playlists")
            .filter((q) => q.eq(q.field("ownerTo"), userDBID))
            .filter((q) => q.eq(q.field("name"), name))
            .first();

        if (existingPlaylist) {
            // Update existing playlist
            await ctx.db.replace(existingPlaylist._id, {
                name: name,
                tracks: tracks,
                ownerTo: userDBID
            });
            return existingPlaylist._id;
        } else {
            // Insert new playlist
            return await ctx.db.insert("playlists", {
                name: name,
                tracks: tracks,
                ownerTo: userDBID,
            });
        }
    }
});

export const getRecentPlaylist = query({
    args: { userID: v.string() },
    handler: async (ctx, userID) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Authentication required");
        }
        const userDBID = await getUserDBID(ctx, userID);
        return await ctx.db
            .query("playlists")
            .filter((q) => q.eq(q.field("ownerTo"), userDBID))
            .first();
    },
});

export const getAllPlaylists = query({
    args: { userID: v.string() },
    handler: async (ctx, userID) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Authentication required");
        }
        const userDBID = await getUserDBID(ctx, userID);
        
        return await ctx.db
            .query("playlists")
            .filter((q) => q.eq(q.field("ownerTo"), userDBID))
            .collect();
    },
});

export const deletePlaylist = mutation({
    args: { playlistID: v.string() },
    handler: async (ctx, { playlistID }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Authentication required");
        }
        const userDBID = await getUserDBID(ctx, { userID: identity.subject });
        const normalizedPlaylistID = ctx.db.normalizeId("playlists", playlistID);
        if (!normalizedPlaylistID) {
            throw new Error("Invalid playlist ID");
        }
        const playlist = await ctx.db.get(normalizedPlaylistID);
        if (!playlist || playlist.ownerTo !== userDBID) {
            throw new Error("Playlist not found");
        }
        await ctx.db.delete(normalizedPlaylistID);
    },
});