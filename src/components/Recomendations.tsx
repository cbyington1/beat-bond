'use client';
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";

const Recommendations = () => {
  const { isSignedIn } = useAuth(); // Clerk hook to check authentication state
  
  interface Track {
    id: string;
    name: string;
    album: {
      images: { url: string }[];
    };
    artists: { href: string; name: string }[];
  }

  interface SpotifyData {
    topTracks: Track[];
    recommendations: Track[];
  }

  const [data, setData] = useState<SpotifyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>("long_term");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resultsDisplayed, setResultsDisplayed] = useState<boolean>(false);

  const fetchSpotifyData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/recommendation?time_range=${timeRange}`);
      const jsondata = await response.json();

      if (response.ok) {
        setData(jsondata);
        setResultsDisplayed(true);
      } else {
        setError(jsondata.message || "Failed to fetch Spotify data");
      }
    } catch {
      setError("An error occurred while fetching Spotify data");
    } finally {
      setIsLoading(false);
    }
  };

  const savePlaylistMutation = useMutation(api.playlists.savePlaylist);
  const savePlaylist = async (data: SpotifyData) => {
    const tracks = data.recommendations.map((track) => track.id);

    savePlaylistMutation({ name: "testPlaylist", tracks: tracks });
    console.log("Playlist saved!");
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <h1 className="text-2xl font-bold mb-4">AI Recommendations</h1>
        <p>Please sign in to view your recommendations.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center space-x-4">
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-neutral-800 text-white p-2 rounded"
        >
          <option value="long_term">Long Term</option>
          <option value="medium_term">Medium Term</option>
          <option value="short_term">Short Term</option>
        </select>
        
        <button 
          onClick={fetchSpotifyData}
          disabled={isLoading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Generate Recommendations"}
        </button>
        {resultsDisplayed ? (
          <button 
            onClick={() => savePlaylist(data!)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Save Playlist
          </button>
        ) : null}
      </div>

      {error && <div className="text-red-500 mb-4">Error: {error}</div>}

      {data && (
        <>
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-4">Top Tracks</h1>
            <div className="bg-neutral-800 rounded-lg p-4 max-h-[400px] overflow-y-auto">
              {data.topTracks.map((track) => (
                <li key={track.id} className="p-2 list-none hover:bg-neutral-700 rounded-md transition-colors">
                  <div className="inline-flex items-center">
                    {track.album.images && track.album.images.length > 0 && (
                      <img src={track.album.images[0]?.url} alt="albumCover" width={100} className="rounded-md" />
                    )} 
                    <div className="ml-4">
                      <div className="font-semibold">{track.name}</div>
                      <Link href={track.artists[0].href} className="text-gray-300 hover:text-white">
                        {track.artists[0].name}
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold mb-4">Recommended Tracks</h1>
            <div className="bg-neutral-800 rounded-lg p-4 max-h-[400px] overflow-y-auto">
              {data.recommendations.map((track) => (
                <li key={track.id} className="p-2 list-none hover:bg-neutral-700 rounded-md transition-colors">
                  <div className="inline-flex items-center">
                    {track.album.images && track.album.images.length > 0 && (
                      <img src={track.album.images[0]?.url} alt="albumCover" width={100} className="rounded-md" />
                    )}
                    <div className="ml-4">
                      <div className="font-semibold">{track.name}</div>
                      <Link href={track.artists[0].href} className="text-gray-300 hover:text-white">
                        {track.artists[0].name}
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};
export default Recommendations;