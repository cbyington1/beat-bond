"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
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
    genres: { [key: string]: number };
  }

  const [data, setData] = useState<SpotifyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopTracks = async () => {
      try {
        const response = await fetch("/api/stats");
        const jsondata = await response.json();

        if (response.ok) {
          setData(jsondata);
        } else {
          setError(jsondata.message || "Failed to fetch top tracks");
        }
      } catch {
        setError("An error occurred while fetching top tracks");
      }
    };

    if (isSignedIn) {
      fetchTopTracks();
    }
  }, [isSignedIn]); // Ensure this effect only runs if the user is signed in

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
         <div>
            {data.topTracks.slice(0,5).map((track) => (
                <li key={track.id} className="p-2 list-none">
                <div className="inline-flex items-center">
                    {track.album.images && track.album.images.length > 0 && (<img src={track.album.images[0]?.url} alt="albumCover" width={100} />)} &nbsp;&nbsp; {track.name} by&nbsp; <Link href={track.artists[0].href}>{track.artists[0].name}</Link>
                </div>
                </li>
            ))}
        </div>
      </div>

      <div className="mt-8">
        <h1 className="text-2xl font-bold mb-4">Genres</h1>
        <ul>
          {Object.entries(data.genres).map(([genre, percent]) => (
            <li key={genre} className="p-2 list-none">
              <div>
                {genre} - {percent}%
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Page;

 