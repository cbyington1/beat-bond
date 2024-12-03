"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { MusicIcon } from "lucide-react";

const Page = () => {
  const { isSignedIn } = useAuth();

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

  const fetchSpotifyData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/recommendation?time_range=${timeRange}`);
      const jsondata = await response.json();

      if (response.ok) {
        setData(jsondata);
      } else {
        setError(jsondata.message || "Failed to fetch Spotify data");
      }
    } catch {
      setError("An error occurred while fetching Spotify data");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSignedIn) {
    return (
      <Card className="p-4 bg-gray-800/50 border-gray-700">
        <p className="text-gray-400 text-center">
          Please sign in to view your Spotify profile.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto p-6">
      <div className="flex items-center gap-4">
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-gray-800/50 text-gray-200 p-2 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        >
          <option value="long_term">Long Term</option>
          <option value="medium_term">Medium Term</option>
          <option value="short_term">Short Term</option>
        </select>
        
        <button 
          onClick={fetchSpotifyData}
          disabled={isLoading}
          className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        >
          {isLoading ? "Loading..." : "Generate Recommendations"}
        </button>
      </div>

      {error && (
        <Card className="p-4 bg-gray-800/50 border-gray-700">
          <p className="text-red-400 text-center">Error: {error}</p>
        </Card>
      )}

      {!data && !error && !isLoading && (
        <Card className="p-8 bg-gray-800/50 border-gray-700">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <MusicIcon className="w-16 h-16 text-cyan-500/50" />
            <h2 className="text-xl font-semibold text-gray-400">
              Ready to Discover New Music?
            </h2>
            <p className="text-gray-500 max-w-md">
              Choose a time range and click "Generate Recommendations" to see your top tracks and get personalized music suggestions based on your listening history.
            </p>
          </div>
        </Card>
      )}

      {isLoading && (
        <div className="space-y-6">
          {['Loading Your Music...', 'Finding Recommendations...'].map((section) => (
            <div key={section} className="space-y-2">
              <h1 className="text-xl font-semibold text-gray-400">{section}</h1>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-16 w-16 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {data && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-xl font-semibold text-gray-400">Top Tracks</h1>
            <div className="grid gap-2">
              {data.topTracks.map((track) => (
                <Card
                  key={track.id}
                  className="p-2 bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 transition-colors group"
                >
                  <div className="flex items-center gap-6">
                    {track.album.images && track.album.images.length > 0 && (
                      <div className="relative shrink-0">
                        <img
                          src={track.album.images[0]?.url}
                          alt="albumCover"
                          width={64}
                          height={64}
                          className="rounded-lg shadow-lg group-hover:shadow-cyan-900/20 transition-all"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-lg transition-opacity" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-cyan-400 font-medium truncate text-sm">
                        {track.name}
                      </h3>
                      <div className="flex items-center gap-1 text-gray-400 text-sm">
                        <span>by</span>
                        <Link 
                          href={track.artists[0].href}
                          className="truncate hover:text-cyan-400 transition-colors"
                        >
                          {track.artists[0].name}
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-xl font-semibold text-gray-400">Recommended Tracks</h1>
            <div className="grid gap-2">
              {data.recommendations.map((track) => (
                <Card
                  key={track.id}
                  className="p-2 bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 transition-colors group"
                >
                  <div className="flex items-center gap-6">
                    {track.album.images && track.album.images.length > 0 && (
                      <div className="relative shrink-0">
                        <img
                          src={track.album.images[0]?.url}
                          alt="albumCover"
                          width={64}
                          height={64}
                          className="rounded-lg shadow-lg group-hover:shadow-cyan-900/20 transition-all"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-lg transition-opacity" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-cyan-400 font-medium truncate text-sm">
                        {track.name}
                      </h3>
                      <div className="flex items-center gap-1 text-gray-400 text-sm">
                        <span>by</span>
                        <Link 
                          href={track.artists[0].href}
                          className="truncate hover:text-cyan-400 transition-colors"
                        >
                          {track.artists[0].name}
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;