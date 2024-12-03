"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartPieIcon } from "lucide-react";

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
    genres: { [key: string]: number };
  }

  const [data, setData] = useState<SpotifyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>("long_term");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchTopTracks = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/stats?time_range=${timeRange}`);
      const jsondata = await response.json();

      if (response.ok) {
        setData(jsondata);
      } else {
        setError(jsondata.message || "Failed to fetch top tracks");
      }
    } catch {
      setError("An error occurred while fetching top tracks");
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
    <div className="space-y-6 w-full max-w-7xl mx-auto p-6">
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
          onClick={fetchTopTracks}
          disabled={isLoading}
          className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        >
          {isLoading ? "Loading..." : "View Stats"}
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
            <ChartPieIcon className="w-16 h-16 text-cyan-500/50" />
            <h2 className="text-xl font-semibold text-gray-400">
              Ready to See Your Music Stats?
            </h2>
            <p className="text-gray-500 max-w-md">
              Choose a time range and click "View Stats" to analyze your listening habits and discover your most played genres.
            </p>
          </div>
        </Card>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-gray-400">Loading Tracks...</h1>
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
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-gray-400">Analyzing Genres...</h1>
            <Card className="aspect-square bg-gray-800/50 border-gray-700">
              <div className="p-8 flex items-center justify-center h-full">
                <Skeleton className="h-64 w-64 rounded-full" />
              </div>
            </Card>
          </div>
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h1 className="text-xl font-semibold text-gray-400">Top Tracks</h1>
            <Card className="bg-gray-800/50 border-gray-700 p-4">
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {data.topTracks.map((track) => (
                  <div
                    key={track.id}
                    className="p-2 hover:bg-gray-700/50 rounded-md transition-colors group"
                  >
                    <div className="flex items-center gap-4">
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
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-3">
            <h1 className="text-xl font-semibold text-gray-400">Genre Distribution</h1>
            <Card className="bg-gray-800/50 border-gray-700 p-4" style={{ height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={Object.entries(data.genres).map(([name, value]) => ({ 
                      name, 
                      value
                    }))} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={120}
                    fill="#8884d8"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {Object.entries(data.genres).map(([genre], index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`hsl(${(index * 137.5) % 360}, 70%, 60%)`}
                      />
                    ))}
                  </Pie>
                  /
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;