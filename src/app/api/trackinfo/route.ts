import { NextRequest, NextResponse } from "next/server";
import { getSpotifyAuthToken } from "../getAuthToken";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackIds = searchParams.get('trackIds');
    
    if (!trackIds) {
      return NextResponse.json(
        { message: "No track IDs provided" },
        { status: 400 }
      );
    }

    const token = await getSpotifyAuthToken();
    
    if (!token) {
      return NextResponse.json(
        { message: "Access token is undefined" },
        { status: 500 }
      );
    }

    const trackResponse = await fetch(
      `https://api.spotify.com/v1/tracks?ids=${trackIds}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!trackResponse.ok) {
      const errorData = await trackResponse.json();
      console.error("Spotify Track Error:", errorData);
      return NextResponse.json(
        { message: "Failed to fetch track details", error: errorData },
        { status: trackResponse.status }
      );
    }

    const trackInfo = await trackResponse.json();

    return NextResponse.json(trackInfo);

  } catch (error) {
    console.error("Error fetching track data:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: String(error) },
      { status: 500 }
    );
  }
}

