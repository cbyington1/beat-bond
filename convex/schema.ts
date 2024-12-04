import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  playlists: defineTable({
    name: v.string(),
    ownerTo: v.id("users"),
    tracks: v.array(v.string()),
  }),
  stats: defineTable({
    ownerTo: v.id("users"),
    topGenre: v.string(),
    topTracks: v.array(v.string()),
  }),
  users: defineTable({
    friends: v.array(v.string()),
    name: v.string(),
    userID: v.string(),
    username: v.string(),
  }).searchIndex("searchUser", { searchField: "username" }),
});