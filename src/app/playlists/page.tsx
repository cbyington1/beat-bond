"use client";
 
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
 
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
 
  useEffect(() => {
    if (isSignedIn) {
      void fetchRecommendations();
    }
  }, [isSignedIn]);
 
  const fetchRecommendations = async (): Promise<void> => {
    setFetchingRecommendations(true);
    setError(null);
 
    try {
      // Updated to use Next.js API route with time_range parameter
      const response = await fetch('/api/recommendation?time_range=long_term');
 
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
 
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
 
      // Update to handle the new response structure
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
      <div className="min-h-screen bg-black text-white p-6">
        <h1 className="text-2xl font-bold mb-4">AI Recommended Playlist</h1>
        <p>Please sign in to view and export your recommendations.</p>
      </div>
    );
  }
 
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-4">AI Recommended Playlist</h1>
      {fetchingRecommendations ? (
        <div className="text-center py-8">
          <p>Fetching recommendations...</p>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="space-y-6">
          <div className="bg-gray-900 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Recommended Tracks</h2>
            <ul className="space-y-2">
              {recommendations.map((track, index) => (
                <li key={track.uri} className="flex items-center space-x-2">
                  <span className="text-gray-400">{index + 1}.</span>
                  <span>{track.name}</span>
                </li>
              ))}
            </ul>
          </div>
 
          <button
            onClick={() => void handleExport()}
            className="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Exporting..." : "Export to Spotify"}
          </button>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400">No recommendations available.</p>
          <button 
            onClick={() => void fetchRecommendations()}
            className="mt-4 bg-white/10 text-white px-4 py-2 rounded-full hover:bg-white/20 transition-colors"
          >
            Refresh Recommendations
          </button>
        </div>
      )}
 
      {error && (
        <div className="mt-4 p-4 bg-red-900/50 text-red-200 rounded-lg">
          {error}
        </div>
      )}
 
      {exportSuccess && (
        <div className="mt-4 p-4 bg-green-900/50 text-green-200 rounded-lg">
          <p>Playlist successfully exported to Spotify!</p>
          {playlistUrl && (
            <a 
              href={playlistUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-green-300 hover:text-green-100 underline"
            >
              Open in Spotify
            </a>
          )}
        </div>
      )}
    </div>
  );
};
 
export default Playlists;