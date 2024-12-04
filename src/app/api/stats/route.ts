/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getSpotifyAuthToken } from "../getAuthToken";

export async function GET(request: Request) {

  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('time_range') || 'long_term';
    const token = await getSpotifyAuthToken();

    if (!token) {
      return NextResponse.json(
        { message: "Please Connect A Spotify Account!" },
        { status: 500 }
      );
    }

    const topTracksUrl = `https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${timeRange}`;
    const topTracksResponse = await fetch(topTracksUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!topTracksResponse.ok) {
      const errorData = await topTracksResponse.json();
      console.error("Spotify API Error:", errorData);
      return NextResponse.json(
        { message: "Failed to fetch Spotify data", error: errorData },
        { status: topTracksResponse.status }
      );
    }

    const topTracksData = await topTracksResponse.json();

    // Get unique artist IDs
    const artistIds = Array.from(
      new Set(
        topTracksData.items.flatMap((track: any) => 
          track.artists.map((artist: any) => artist.id)
        )
      )
    );

    // Fetch artist details in batches of 50
    const artistGenres = new Map<string, string[]>();
    for (let i = 0; i < artistIds.length; i += 50) {
      const batch = artistIds.slice(i, i + 50);
      const artistsResponse = await fetch(
        `https://api.spotify.com/v1/artists?ids=${batch.join(',')}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (artistsResponse.ok) {
        const artistsData = await artistsResponse.json();
        artistsData.artists.forEach((artist: any) => {
          artistGenres.set(artist.id, artist.genres);
        });
      }
    }

    // Count genre occurrences
    const genreCounts: { [key: string]: number } = {};
    let totalGenreCounts = 0;
    
    topTracksData.items.forEach((track: any) => {
      track.artists.forEach((artist: any) => {
        const artistGenreList = artistGenres.get(artist.id) || [];
        artistGenreList.forEach((genre: string) => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
          totalGenreCounts++;
        });
      });
    });

    // Convert to percentages and sort
    const genrePercentages = Object.entries(genreCounts)
      .map(([genre, count]) => [
        genre,
        Number(((count / totalGenreCounts) * 100).toFixed(1))
      ])
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10)
      .reduce((obj, [key, value]) => ({
        ...obj,
        [key]: value
      }), {});

    return NextResponse.json({
      topTracks: topTracksData.items,
      genres: genrePercentages
    });

  } catch (error) {
    console.error("Error fetching Spotify data:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: String(error) },
      { status: 500 }
    );
  }
}