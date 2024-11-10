import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function getSpotifyAuthToken() {
    const { userId } = await auth();
  
    if (!userId) {
        return NextResponse.json(
            { message: "User ID is undefined" },
            { status: 400 }
        );
    }

    try {
        // Use the correct provider ID
        const provider = "oauth_spotify"; // Make sure this matches your Clerk configuration

        // Call the Clerk API to get the user's OAuth access tokens
        const clerkResponse = await (await clerkClient()).users.getUserOauthAccessToken(userId, provider)
        
        if (!clerkResponse) {
            throw new Error("No Spotify token found");
        }

        return clerkResponse.data[0]?.token;
    } catch (error) {
        console.error("Error getting Spotify auth token:", error);
        throw error;
    }
}