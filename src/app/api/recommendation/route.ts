// app/api/recommendation/route.ts
import { NextResponse } from "next/server";
import { getSpotifyAuthToken } from "../getAuthToken";

interface Track {
  id: string;
  name: string;
  album: {
    images: { url: string }[];
  };
  artists: { href: string; name: string }[];
}

export async function GET() {
  try {
    const token = await getSpotifyAuthToken();

    if (!token) {
      return NextResponse.json(
        { message: "Access token is undefined" },
        { status: 500 }
      );
    }

    // Fetch the user data from the Spotify API
    const spotifyUrl = "https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=short_term";

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

    

    // Get track IDs for recommendations
    // const seedTracks = spotifyData.items.map((track: any) => track.id).join(',');

    // // Fetch recommendations using the top tracks as seeds
    // const recommendationsResponse = await fetch(
    //   `https://api.spotify.com/v1/recommendations?limit=50&seed_tracks=${seedTracks}`,
    //   {
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //       'Content-Type': 'application/json',
    //     },
    //   }
    // );

    // if (!recommendationsResponse.ok) {
    //   const errorData = await recommendationsResponse.json();
    //   console.error("Recommendations API Error:", errorData);
    //   return NextResponse.json(
    //     { message: "Failed to fetch recommendations", error: errorData },
    //     { status: recommendationsResponse.status }
    //   );
    // }

    // const recommendationsData = await recommendationsResponse.json();

    const backendResponse = await fetch(
      'http://localhost:3450/api/recommendation',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
  
        body: JSON.stringify({
          topTracks: spotifyData.items.map((track: Track) => track.id),
          // recommendations: recommendationsData.tracks,
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

    console.log("hi")
    // Return both top tracks and recommendations
    return NextResponse.json({
      topTracks: spotifyData.items,
      recommendations: trackInfo.tracks
    });
  } catch (error) {
    console.error("Error fetching Spotify data:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: String(error) },
      { status: 500 }
    );
  }
  
  
}