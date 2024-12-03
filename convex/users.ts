import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Define a mutation to insert or update user information
export const updateUser = mutation(async (ctx) => {
  // Check if the user already exists
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Authentication required');
  }

  const existingUser = await ctx.db
    .query("users")
    .filter((q) => q.eq(q.field("userID"), identity.nickname))
    .first();
  
  if (existingUser) {
    // Update the user's information if they already exist
    await ctx.db.patch(existingUser._id, {
      username: identity.nickname,
      userID: identity.subject,
      name: identity.name,
    });
  } else {
    // Add a new user if they don't already exist
    await ctx.db.insert("users", {
      username: identity.nickname,
      userID: identity.subject,
      name: identity.name,
      friends: [],
    });
  }
});

// Define a query to fetch a user by email
export const getUserByUserID = query({
  args: { userID: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userID"), args.userID))
      .first();
  },
});

export const getUserDBID = query({
  args: { userID: v.string() },
  handler: async (ctx, args) => {
    const userDoc = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userID"), args.userID))
      .first();

    if (!userDoc) {
      throw new Error("User not found");
    } else {
      return userDoc._id;
    }
  },
});

export const searchUsersByUsername = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("username"), args.name))
      .collect();
  },
});

// Define a query to fetch all users
export const getAllUsers = query(async ({ db }) => {
  return await db.query("users").collect();
});
