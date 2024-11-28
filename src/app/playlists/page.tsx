"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

const Playlists = () => {
  const { isSignedIn } = useAuth(); // Clerk hook to check authentication state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    if (!isSignedIn) {
      setError("You must be signed in to export playlists.");
      return;
    }

    setLoading(true);
    setError(null);

    // Example hardcoded tracks
    const hardCodedTracks = [
      { uri: "spotify:track:4uLU6hMCjMI75M1A2tKUQC", name: "Bohemian Rhapsody" },
      { uri: "spotify:track:7dt6x5M1jzdTEt8oCbisTK", name: "Blinding Lights" },
    ];

    try {
      const response = await fetch("/api/export-playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playlistName: "My Hardcoded Playlist",
          tracks: hardCodedTracks,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to export playlist");
      }

      alert("Playlist exported successfully!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // If the user is not signed in, show a message
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <h1 className="text-2xl font-bold mb-4">Playlists</h1>
        <p>Please sign in to view and export your playlists.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Playlists</h1>
      <button
        onClick={handleExport}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? "Exporting..." : "Export Playlists"}
      </button>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default Playlists;
