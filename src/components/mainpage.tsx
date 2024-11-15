import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
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
      {data.items.slice(0, 5).map((track) => (
        <li key={track.id} className="p-2 list-none">
          <div className="inline-flex items-center">
            {track.album.images && track.album.images.length > 0 && (
              <Image
                src={track.album.images[0]?.url}
                alt="albumCover"
                width={100}
                height={100}
              />
            )}{" "}
            &nbsp;&nbsp; {track.name} by {track.artists[0].name}
          </div>
        </li>
      ))}
    </div>
  );
};

export default MainPage;
