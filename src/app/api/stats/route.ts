// app/api/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSpotifyAuthToken } from "../getAuthToken";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('time_range') || 'long_term';

    const token = await getSpotifyAuthToken();

    if (!token) {
      return NextResponse.json(
        { message: "Access token is undefined" },
        { status: 500 }
      );
    }

    // Fetch the user data from the Spotify API
    const spotifyUrl = `https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${timeRange}`;

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

    const backendResponse = await fetch(
      'http://localhost:3450/api/stats',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
  
        body: JSON.stringify({
          topTracks: spotifyData.items.map((track: any) => track.id),
        }),
  
      }
    );
  
    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      console.error("Backend Error:", errorData);
      return NextResponse.json(
        { message: "Failed to fetch recommendations from backend", error: errorData },
        { status: backendResponse.status }
      );
    }

    const genres = await backendResponse.json();


    console.log(genres)

    // Return both top tracks and recommendations
    return NextResponse.json({
      topTracks: spotifyData.items,
      genres: genres
    });
  } catch (error) {
    console.error("Error fetching Spotify data:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: String(error) },
      { status: 500 }
    );
  }
  
  
}