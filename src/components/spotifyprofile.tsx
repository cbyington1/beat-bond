"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

const SpotifyProfile = () => {
  const { isSignedIn } = useAuth(); // Clerk hook to check authentication state
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpotifyProfile = async () => {
      try {
        const response = await fetch("/api/top-tracks");
        const jsondata = await response.json();

        if (response.ok) {
          setData(jsondata.message);
        } else {
          setError(jsondata.message || "Failed to fetch Spotify profile");
        }
      } catch (err) {
        setError("An error occurred while fetching Spotify profile");
      }
    };

    if (isSignedIn) {
      fetchSpotifyProfile();
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
    <div>
      <h1>Top Tracks</h1>
      {data.items.map((track, index) => (
        <li key={track.id} className="p-2">
          <span className="font-bold">{index + 1}. {track.name}</span> by {track.artists[0].name}
        </li>
      ))}
    </div>
  );
};

export default SpotifyProfile;