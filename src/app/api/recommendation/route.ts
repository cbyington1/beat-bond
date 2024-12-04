/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/recommendation/route.ts
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

    // Fetch the user's top tracks from Spotify
    const spotifyUrl = `https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${timeRange}`;
    const spotifyResponse = await fetch(spotifyUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!spotifyResponse.ok) {
      const errorData = await spotifyResponse.json();
      console.error("Spotify API Error:", errorData);
      return NextResponse.json(
        { message: "Failed to fetch Spotify data", error: errorData },
        { status: spotifyResponse.status }
      );
    }

    const spotifyData = await spotifyResponse.json();

    // Get recommendations from backend
    const backendResponse = await fetch(
      'http://127.0.0.1:4000/api/recommendation',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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

    const recIds = await backendResponse.json();
    
    // Check if we have any recommendation IDs
    if (!recIds || !Array.isArray(recIds) || recIds.length === 0) {
      return NextResponse.json({
        topTracks: spotifyData.items,
        recommendations: [],
      });
    }

    // Fetch full track information for recommendations
    const recommendationsResponse = await fetch(
      `https://api.spotify.com/v1/tracks?ids=${recIds.join(",")}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!recommendationsResponse.ok) {
      const errorData = await recommendationsResponse.json();
      console.error("Spotify Error:", errorData);
      return NextResponse.json(
        { message: "Failed to fetch recommendations from spotify", error: errorData },
        { status: recommendationsResponse.status }
      );
    }

    const trackInfo = await recommendationsResponse.json();

    // Return both top tracks and recommendations
    return NextResponse.json({
      topTracks: spotifyData.items,
      recommendations: trackInfo.tracks,
    });

  } catch (error) {
    console.error("Error fetching Spotify data:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: String(error) },
      { status: 500 }
    );
  }
}