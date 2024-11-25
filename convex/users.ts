import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Define a mutation to insert or update user information
export const updateUser = mutation(async ({ db }, user: { username?: string; userID?: string; name?: string; }) => {
  // Check if the user already exists
  const existingUser = await db
    .query("users")
    .filter((q) => q.eq(q.field("userID"), user.userID))
    .first();

  if (existingUser) {
    // Update the user's information if they already exist
    await db.patch(existingUser._id, {
      name: user.name,
    });
  } else {
    // Add a new user if they don't already exist
    await db.insert("users", {
      username: user.username,
      userID: user.userID,
      name: user.name,
    });
  }
});

// Define a query to fetch a user by email
export const getUserByUserID = query({
  args: { userID: v.string() },
  handler: async ({ db }, { userID }) => {
    return await db
      .query("users")
      .filter((q) => q.eq(q.field("email"), userID))
      .first();
  },
});

// Define a query to fetch all users
export const getAllUsers = query(async ({ db }) => {
  return await db.query("users").collect();
});
