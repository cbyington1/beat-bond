"use client";

import { useEffect, useState } from "react";
import { useAuth, ClerkProvider } from "@clerk/nextjs";
import Link from "next/link";

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
    recommendations: Track[];
  }

  const [data, setData] = useState<SpotifyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpotifyData = async () => {
      try {
        const response = await fetch("/api/recommendation");
        const jsondata = await response.json();

        if (response.ok) {
          setData(jsondata);
        } else {
          setError(jsondata.message || "Failed to fetch Spotify data");
        }
      } catch {
        setError("An error occurred while fetching Spotify data");
      }
    };

    if (isSignedIn) {
      fetchSpotifyData();
    }
  }, [isSignedIn]);

  if (!isSignedIn) {
    return <div>Please sign in to view your Spotify profile.</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-950 text-white p-6">
      <div className="flex gap-8 h-[calc(100vh-6rem)]">
        <div className="flex-1 flex flex-col">
          <h1 className="text-2xl font-bold mb-4">Top Tracks</h1>
          <div className="bg-neutral-800 rounded-lg p-4 flex-1 overflow-y-auto">
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

        <div className="flex-1 flex flex-col">
          <h1 className="text-2xl font-bold mb-4">Recommended Tracks</h1>
          <div className="bg-neutral-800 rounded-lg p-4 flex-1 overflow-y-auto">
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
      </div>
    </div>
  );
};

export default Page;