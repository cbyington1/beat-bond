"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const Page = () => {
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
    return <div>Please sign in to view your Spotify profile.</div>;
  }

  return (
    // buttons 
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-950 text-white p-6">
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
          onClick={fetchTopTracks}
          disabled={isLoading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Pull Stats"}
        </button>
      </div>

      {error && <div className="text-red-500 mb-4">Error: {error}</div>}

      {data && (
        <>
        <div className="grid grid-cols-2 gap-4">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-4">Top Tracks</h1>
            <div className="bg-neutral-800 rounded-lg p-4 max-h-[500px] overflow-y-auto ">
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
            <ResponsiveContainer width="100%" >
              <PieChart>
                <Pie data={Object.entries(data.genres).map(([name, value]) => ({ name, value: Math.round(value * 100)/100 }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8">
                  {Object.entries(data.genres).map(([genre], index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 360 / Object.keys(data.genres).length}, 70%, 50%)`} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Page;

 