/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useMutation, useQuery } from "convex/react";
import {
  useState,
  useEffect,
  AwaitedReactNode,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
} from "react";
import { api } from "@/../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface TrackInfo {
  id: string;
  name: string;
  artists: { name: string }[];

  album: {
    name: string;
    images: { url: string }[];
  };
}

const UserProfile = () => {
  const params = useParams();
  const userID = params?.userId as string;
  const { toast } = useToast();

  // Fetch the profile user's information
  const user = useQuery(api.users.getUserByUserID, { userID: userID });
  const userStats = useQuery(api.stats.getStats, { userID: userID });
  const [trackDetails, setTrackDetails] = useState<TrackInfo[]>([]);
  const [isTrackLoading, setIsTrackLoading] = useState(false);
  const userPlaylists = useQuery(api.playlists.getPlaylist, { userID: userID });
  const addFriends = useMutation(api.users.addFriend);
  const handleAddFriend = async () => {
    const res = await addFriends({ friendID: userID });
    toast({
      description: res,
    });
  };
  useEffect(() => {
    const fetchTrackDetails = async () => {
      if (userPlaylists && userPlaylists.tracks.length > 0) {
        setIsTrackLoading(true);
        try {
          // Use multiple track IDs in a single request
          const trackIds = userPlaylists.tracks.join(",");
          const response = await fetch(`/api/trackinfo?trackIds=${trackIds}`);

          if (!response.ok) {
            console.error("Failed to fetch track details");
            return;
          }

          const data = await response.json();
          setTrackDetails(data.tracks);
        } catch (error) {
          console.error("Error fetching track details:", error);
        } finally {
          setIsTrackLoading(false);
        }
      }
    };

    fetchTrackDetails();
  }, [userPlaylists]);

  if (!user) {
    return (
      <div className="min-h-full w-full bg-gradient-to-b from-gray-900 to-gray-800 p-6">
        <Card className="mx-auto max-w-4xl rounded-2xl border-gray-700 bg-gray-800/50 backdrop-blur-sm">
          <div className="p-8 flex flex-col items-center space-y-6">
            <Skeleton className="h-48 w-48 rounded-2xl" />
            <div className="space-y-4 w-full max-w-sm">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4 rounded-full mx-auto" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full bg-gradient-to-b from-gray-900 to-gray-800 p-6">
      <Card className="mx-auto max-w-4xl rounded-2xl border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="space-y-6 flex-1 w-full">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-gray-400">
                  {`${user.username}'s Profile`}
                </h1>

                <div className="grid md:grid-cols-2 gap-4 text-gray-400">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-gray-300">
                      User Information
                    </h2>
                    <p>
                      <strong>Name:</strong> {user.name}
                    </p>
                    <p>
                      <strong>Username:</strong> {user.username}
                    </p>
                    <Button
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handleAddFriend}
                    >
                      Add Friend
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-gray-300">
                      Music Stats
                    </h2>
                    {userStats ? (
                      <>
                        <p>
                          <strong>Top Genre:</strong> {userStats.topGenre}
                        </p>
                        <p>
                          <strong>Top Tracks:</strong>
                        </p>
                        <ul className="list-disc pl-5">
                          {userStats.topTracks.map((track, index) => (
                            <li key={index} className="truncate">
                              {track}
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p className="text-gray-500">No stats available</p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <h2 className="text-xl font-semibold text-gray-300 mb-2">
                    Playlists
                  </h2>
                  {userPlaylists ? (
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <p className="text-gray-400">
                        <strong>Playlist Name:</strong> {userPlaylists.name}
                      </p>
                      <p className="text-gray-400">
                        <strong>Tracks:</strong> {userPlaylists.tracks.length}
                      </p>
                      {isTrackLoading ? (
                        <p className="text-gray-500">
                          Loading track details...
                        </p>
                      ) : (
                        <ul className="text-gray-400 space-y-2 h-96 overflow-y-auto space-y-4 bg-gray-800 rounded p-4">
                          {trackDetails.map(
                            (track: {
                              id: Key | null | undefined;
                              album: { images: { url: string | undefined }[] };
                              name:
                                | string
                                | number
                                | bigint
                                | boolean
                                | ReactElement<
                                    any,
                                    string | JSXElementConstructor<any>
                                  >
                                | Iterable<ReactNode>
                                | ReactPortal
                                | Promise<AwaitedReactNode>
                                | null
                                | undefined;
                              artists: any[];
                            }) => (
                              <li
                                key={track.id}
                                className="flex items-center space-x-3"
                              >
                                {track.album.images[0] && (
                                  <Image
                                    src={track.album.images[0].url || ""}
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 rounded"
                                    alt="albumCover"
                                  />
                                )}
                                <div>
                                  <p className="text-cyan-400 font-medium truncate text-sm">
                                    {track.name}
                                  </p>
                                  <p className="flex items-center gap-1 text-gray-400 text-sm">
                                    {track.artists
                                      .map((artist) => artist.name)
                                      .join(", ")}
                                  </p>
                                </div>
                              </li>
                            )
                          )}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">No playlists available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserProfile;
