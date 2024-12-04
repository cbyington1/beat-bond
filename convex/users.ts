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
    .filter((q) => q.eq(q.field("userID"), identity.subject))
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
      username: identity.nickname!,
      userID: identity.subject,
      name: identity.name!,
      friends: [],
    });
  }
});

// Define a query to fetch a user by email
export const getUserByUserID = query({
  args: { userID: v.string() },
  handler: async (ctx, args) => {
    const userDoc = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userID"), args.userID))
      .first();
    
      if (!userDoc) {
        throw new Error("User not found");
      }
      return userDoc;
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
    const users = await ctx.db
      .query("users")
      .withSearchIndex("searchUser", (q) =>
        q.search("username", args.name)
      )
      .collect();
    
      if (!users) {
        throw new Error("No users found");
      }
      console.log("searching for users with username: ", args.name);
      console.log(users);
      return users;
  },
});

// Define a query to fetch all users
export const getAllUsers = query(async ({ db }) => {
  return await db.query("users").collect();
});

export const addFriend = mutation(async (ctx, args: { friendID: string }) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required");
  }
  const userDoc = await ctx.db.query("users").filter((q) => q.eq(q.field("userID"), identity.subject)).first();
  if (!userDoc) {
    throw new Error("User not found");
  }
  const friendDoc = await ctx.db
    .query("users")
    .filter((q) => q.eq(q.field("userID"), args.friendID))
    .first();
  if (!friendDoc) {
    throw new Error("Friend not found");
  }

  if (userDoc?.friends.includes(friendDoc._id)) {
    return "Friend already added";
  }

  await ctx.db.patch(userDoc._id, {
    friends: [...userDoc.friends, friendDoc._id],
  });
  return "Friend added successfully";
});

export const getFriends = query(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required");
  }
  const userDoc = await ctx.db.query("users").filter((q) => q.eq(q.field("userID"), identity.subject)).first();
  if (!userDoc) {
    throw new Error("User not found");
  }
  const friends = userDoc.friends;
  const friendsDocs = [];
  for (const friend of friends) {
    const friendDoc = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), friend))
      .first()
    ;
    friendsDocs.push(friendDoc);
  }
  return friendsDocs;
});