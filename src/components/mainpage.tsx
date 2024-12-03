'use client';
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Skeleton } from "./ui/skeleton";
import Image from "next/image";

const MainPage = () => {
  const { isSignedIn } = useAuth(); // Clerk hook to check authentication state
  interface Track {
    id: string;
    name: string;
    album: {
      images: { url: string }[];
    };
    artists: { name: string }[];
  }

  interface SpotifyData {
    items: Track[];
  }

  const [data, setData] = useState<SpotifyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const savePlaylistMutation = useMutation(api.playlists.savePlaylist);
  const savePlaylist = async (data: SpotifyData) => {
    const tracks = data.items.map((track) => track.id);

    savePlaylistMutation({ name: "testPlaylist", tracks: tracks });
    console.log("Playlist saved!");
  }

  useEffect(() => {
    const fetchTopTracks = async () => {
      try {
        const response = await fetch("/api/top-tracks");
        const jsondata = await response.json();

        if (response.ok) {
          setData(jsondata.message);
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
    return (
      <Card className="p-4 bg-gray-800/50 border-gray-700">
        <p className="text-gray-400 text-center">
          Please sign in to view your Spotify profile.
        </p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 bg-gray-800/50 border-gray-700">
        <p className="text-red-400 text-center">Error: {error}</p>
      </Card>
    );
  }

  if (!data) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-gray-400">Top Tracks</h1>
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
    );
  }

  return (
    <div className="space-y-3 w-full max-w-5xl">
      <h1 className="text-xl font-semibold text-gray-400">Top Tracks</h1>
      <div className="grid gap-2">
        {data.items.map((track) => (
          <Card 
            key={track.id} 
            className="p-2 bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 transition-colors group"
          >
            <div className="flex items-center gap-6">
              {track.album.images && track.album.images.length > 0 && (
                <div className="relative shrink-0">
                  <Image 
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
                  <span className="truncate">
                    {track.artists[0].name}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MainPage;
