/* eslint-disable @typescript-eslint/no-explicit-any */
// Assuming this function is used for exporting a playlist
import { getSpotifyAuthToken } from "../getAuthToken";
import { NextResponse } from "next/server";  // Import NextResponse
 
interface ExportPlaylistRequest {
  playlistName: string;
  tracks: { uri: string }[];
}
 
export async function POST(req: Request) {
  if (req.method !== "POST") {
    return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 });
  }
 
  const { playlistName, tracks }: ExportPlaylistRequest = await req.json();  // Parse the incoming JSON body
  console.log("Exporting playlist:", playlistName, tracks);

  // Get the Spotify access token using the helper function
  try {
    const accessToken = await getSpotifyAuthToken();
 
    if (!accessToken) {
      return NextResponse.json({ message: "Access token is missing" }, { status: 500 });
    }
    console.log(playlistName, tracks);
 
    if (!playlistName || !tracks || tracks.length === 0) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }
 
    // Step 1: Create a new playlist (public)
    const playlistResponse = await fetch("https://api.spotify.com/v1/me/playlists", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: playlistName,
        description: "Exported playlist",
        public: true,  // Ensure playlist is public
      }),
    });
 
    if (!playlistResponse.ok) {
      const errorData = await playlistResponse.json();
      throw new Error(errorData.error?.message || "Failed to create playlist");
    }
 
    const playlistData = await playlistResponse.json();
    const playlistId: string = playlistData.id;
 
    // Step 2: Add tracks to the playlist (public playlist)
    const addTracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris: tracks }),
    });
 
    if (!addTracksResponse.ok) {
      const errorData = await addTracksResponse.json();
      throw new Error(errorData.error?.message || "Failed to add tracks to playlist");
    }
 
    return NextResponse.json({ message: "Playlist exported successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error in POST request:", error);  // Log the error
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}