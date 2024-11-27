// app/api/spotify/route.ts
import { NextResponse } from "next/server";
import { getSpotifyAuthToken } from "../getAuthToken";

export async function GET() {

  try {
    const token = await getSpotifyAuthToken()

    // Check if the accessToken is undefined
    if (!token) {
      return NextResponse.json(
        { message: "Access token is undefined" },
        { status: 500 }
      );
    }

    // Fetch the user data from the Spotify API
    const spotifyUrl = "https://api.spotify.com/v1/me/top/tracks?limit=20&time_range=long_term";

    // Call the Spotify API with the access token
    const spotifyResponse = await fetch(spotifyUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Log the Spotify response status to debug
    console.log("Spotify Response Status:", spotifyResponse.status);

    // Handle the response from the Spotify API
    if (!spotifyResponse.ok) {
      const errorData = await spotifyResponse.json();
      console.error("Spotify API Error:", errorData);
      return NextResponse.json(
        { message: "Failed to fetch Spotify data", error: errorData },
        { status: spotifyResponse.status }
      );
    }

    const spotifyData = await spotifyResponse.json();

    // Log the Spotify data to debug
    console.log("Spotify Data:", spotifyData);

    // Return the Spotify data in the response
    return NextResponse.json({ message: spotifyData });
  } catch (error) {
    // Catch and handle any errors during the API request
    console.error("Error fetching Spotify data:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: "server error" },
      { status: 500 }
    );
  }
}