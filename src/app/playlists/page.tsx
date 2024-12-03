"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ListMusic } from "lucide-react";

interface Track {
  uri: string;
  name: string;
}

interface ExportResponse {
  success: boolean;
  playlist_id: string;
  playlist_url: string;
  error?: string;
}

interface RecommendationsResponse {
  recommendations: Track[];
  error?: string;
}

const Playlists = (): JSX.Element => {
  const { isSignedIn } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [fetchingRecommendations, setFetchingRecommendations] = useState<boolean>(false);
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);

  const fetchRecommendations = async (): Promise<void> => {
    setFetchingRecommendations(true);
    setError(null);
    setExportSuccess(false);
    setPlaylistUrl(null);

    try {
      const response = await fetch('/api/recommendation?time_range=long_term');

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations. Please try again.');
    } finally {
      setFetchingRecommendations(false);
    }
  };

  const handleExport = async (): Promise<void> => {
    if (!isSignedIn) {
      setError("You must be signed in to export playlists.");
      return;
    }

    if (recommendations.length === 0) {
      setError("No recommendations available to export.");
      return;
    }

    setLoading(true);
    setError(null);
    setExportSuccess(false);
    setPlaylistUrl(null);

    try {
      const response = await fetch("/api/export-playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playlistName: "AI Recommended Playlist",
          tracks: recommendations,
        }),
      });

      const data: ExportResponse = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to export playlist");
      }

      setExportSuccess(true);
      setPlaylistUrl(data.playlist_url);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn) {
    return (
      <Card className="p-4 bg-gray-800/50 border-gray-700">
        <p className="text-gray-400 text-center">
          Please sign in to view and export your recommendations.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-3xl mx-auto p-6">
      {!recommendations.length && !fetchingRecommendations && (
        <Card className="p-8 bg-gray-800/50 border-gray-700">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <ListMusic className="w-16 h-16 text-cyan-500/50" />
            <h2 className="text-xl font-semibold text-gray-400">
              Ready to Create a Playlist?
            </h2>
            <p className="text-gray-500 max-w-md">
              Click the button below to get personalized song recommendations based on your listening history.
            </p>
            <button 
              onClick={() => void fetchRecommendations()}
              className="mt-4 bg-cyan-600 text-white px-6 py-2 rounded hover:bg-cyan-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50"
              disabled={fetchingRecommendations}
            >
              Get Recommendations
            </button>
          </div>
        </Card>
      )}

      {fetchingRecommendations && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-400">Finding Songs For You...</h2>
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>
      )}

      {recommendations.length > 0 && !fetchingRecommendations && (
        <div className="space-y-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-400">Recommended Tracks</h2>
                <button
                  onClick={() => void fetchRecommendations()}
                  className="text-sm bg-gray-700/50 text-gray-300 px-3 py-1 rounded hover:bg-gray-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
              <ul className="space-y-2">
                {recommendations.map((track, index) => (
                  <li 
                    key={track.uri} 
                    className="flex items-center gap-3 p-2 rounded hover:bg-gray-700/50 transition-colors group"
                  >
                    <span className="text-gray-500 w-6">{index + 1}.</span>
                    <span className="text-gray-300 group-hover:text-cyan-400 transition-colors">{track.name}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => void handleExport()}
                className="w-full mt-4 bg-cyan-600 text-white px-6 py-2 rounded hover:bg-cyan-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Creating Playlist..." : "Create Spotify Playlist"}
              </button>
            </div>
          </Card>

          {error && (
            <Card className="p-4 bg-gray-800/50 border-red-900/50">
              <p className="text-red-400 text-center">{error}</p>
            </Card>
          )}

          {exportSuccess && (
            <Card className="p-4 bg-gray-800/50 border-cyan-900/50">
              <div className="text-center space-y-2">
                <p className="text-cyan-400">Playlist successfully created!</p>
                {playlistUrl && (
                  <a 
                    href={playlistUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-cyan-500 hover:text-cyan-400 transition-colors underline"
                  >
                    Open in Spotify
                  </a>
                )}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Playlists;