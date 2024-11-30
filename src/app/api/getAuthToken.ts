// app/api/getAuthToken.ts
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";

export async function getSpotifyAuthToken(): Promise<string> {
  try {
    // Retrieve the authenticated user's ID
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User is not authenticated. No userId found.");
    }

    // Specify the provider as configured in Clerk's OAuth settings
    const provider = "oauth_spotify";

    // Fetch the OAuth token for Spotify using the Clerk API
    const oauthAccessTokensResponse = await clerkClient.users.getUserOauthAccessToken(userId, provider);

    // Check if the OAuth token exists
    if (!oauthAccessTokensResponse.data || oauthAccessTokensResponse.data.length === 0) {
      throw new Error("No Spotify token found or insufficient scope to access the token.");
    }

    // Return the first available token (assuming only one token per provider)
    const accessToken = oauthAccessTokensResponse.data[0]?.token;
    
    if (!accessToken) {
      throw new Error("Spotify access token is missing from the response.");
    }

    return accessToken;
  } catch (error: unknown) {
    console.error("Error fetching Spotify OAuth token:", error);

    if (error instanceof Error) {
      if (error.message.includes("Insufficient client scope")) {
        console.error("Clerk API: Insufficient scope to fetch the Spotify OAuth token.");
        throw new Error("Insufficient permissions to retrieve Spotify OAuth token. Please check your Clerk API key permissions and OAuth provider settings.");
      }
      throw new Error(`Failed to retrieve Spotify OAuth token. Error: ${error.message}`);
    }

    throw new Error("An unknown error occurred while fetching the Spotify OAuth token.");
  }
}