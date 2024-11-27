import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";

const URL = "http://127.0.0.1:3450/recommendation";

const GenRecommendations = () => {
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
    items: Track[];
  }

  const [error, setError] = useState<string | null>(null);
  const [recData, setRecData] = useState<SpotifyData | null>(null);
  
  useEffect(() => {
  // Fetch top tracks first
    const fetchTopTracks = async () => {
      try {
        const response = await fetch("/api/top-tracks");
        const jsondata = await response.json();

        if (response.ok) {
          // After getting top tracks, fetch recommendations
          fetchRecFromFlask(jsondata.message);
        } else {
          setError(jsondata.message || "Failed to fetch top tracks");
        }
      } catch {
        setError("An error occurred while fetching top tracks");
      }
    };

    // Modified to include top tracks data in URL
    const fetchRecFromFlask = async (topTracks: SpotifyData) => {
      try {
        // Create URL with top tracks as query parameter
        const tracksParam = topTracks.items
          .slice(0, 5)
          .map(track => track.id)
          .join(',');
        
        const recommendationUrl = `${URL}?tracks=${tracksParam}`;
        const response = await fetch(recommendationUrl);
        const jsondata = await response.json();

        if (response.ok) {
          setRecData(jsondata.message);
        } else {
          setError(jsondata.message || "Failed to fetch recommendations");
        }
      } catch {
        setError("An error occurred while fetching recommendations");
      }
    };
    if (isSignedIn) {
      fetchTopTracks();
    }
  }, [isSignedIn]);

  if (error) {
    return <div>Error: {error}</div>;
  }
  if (!recData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {recData.items.slice(0, 5).map((track) => (
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
export default GenRecommendations;
