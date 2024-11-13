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
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Top Tracks</h1>
        {data.topTracks.map((track) => (
           <li key={track.id} className="p-2 list-none">
           <div className="inline-flex items-center">
             {track.album.images && track.album.images.length > 0 && (<img src={track.album.images[0]?.url} alt="albumCover" width={100} />)} &nbsp;&nbsp; {track.name} by&nbsp; <Link href={track.artists[0].href}>{track.artists[0].name}</Link>
           </div>
         </li>
        ))}
      </div>

      <div>
        <h1 className="text-2xl font-bold mb-4">Recommended Tracks</h1>
        {data.recommendations.map((track) => (
          <li key={track.id} className="p-2 list-none">
          <div className="inline-flex items-center">
            {track.album.images && track.album.images.length > 0 && (<img src={track.album.images[0]?.url} alt="albumCover" width={100} />)} &nbsp;&nbsp; {track.name} by&nbsp; <Link href={track.artists[0].href}>{track.artists[0].name}</Link>
          </div>
        </li>
        ))}
      </div>
    </div>
  );
};

export default Page;