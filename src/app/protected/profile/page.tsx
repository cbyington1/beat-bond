"use client";
import MainPage from '@/components/mainpage';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import Image from 'next/image';
import React from 'react'

export default function Homepage() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-full w-full bg-gradient-to-b from-gray-900 to-gray-800 p-6">
        <Card className="mx-auto max-w-4xl rounded-2xl border-gray-700 bg-gray-800/50 backdrop-blur-sm">
          <div className="p-8 flex flex-col items-center space-y-6">
            <div className="relative">
              <Image 
                src='/bblogo.jpeg' 
                alt="bblogo" 
                width={180} 
                height={180} 
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent rounded-2xl" />
            </div>
            <div className="space-y-4 w-full max-w-sm">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4 rounded-full mx-auto" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-full w-full bg-gradient-to-b from-gray-900 to-gray-800 p-6">
        <Card className="mx-auto max-w-4xl rounded-2xl border-gray-700 bg-gray-800/50 backdrop-blur-sm">
          <div className="p-8 flex flex-col items-center space-y-8">
            <div className="relative">
              <Image 
                src='/bblogo.jpeg' 
                alt="bblogo" 
                width={180} 
                height={180} 
                className="rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent rounded-2xl" />
            </div>
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Welcome to BB
              </h1>
              <p className="text-gray-400 text-lg">
                Please sign in to continue
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const UserProfile = () => {
    const { user } = useUser();

    const userID = user?.id as string;
    const userName = user?.username || user?.fullName || 'User';

    const userStats = useQuery(api.stats.getStats, { userID: userID });
    const userPlaylists = useQuery(api.playlists.getPlaylist);

    return (
      <div className="min-h-full w-full bg-gradient-to-b from-gray-900 to-gray-800 p-6">
        <Card className="mx-auto max-w-4xl rounded-2xl border-gray-700 bg-gray-800/50 backdrop-blur-sm">
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="space-y-6 flex-1 w-full">
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold text-gray-400">
                    My Profile
                  </h1>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-gray-400">
                    <div className="space-y-2">
                      <h2 className="text-xl font-semibold text-gray-300">User Information</h2>
                      <p><strong>Name:</strong> {user?.fullName || 'N/A'}</p>
                      <p><strong>Username:</strong> {userName}</p>
                      <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                        Edit Profile
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-xl font-semibold text-gray-300">Music Stats</h2>
                      {userStats ? (
                        <>
                          <p><strong>Top Genre:</strong> {userStats.topGenre}</p>
                          <p><strong>Top Tracks:</strong></p>
                          <ul className="list-disc pl-5">
                            {userStats.topTracks.map((track, index) => (
                              <li key={index} className="truncate">{track}</li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <p className="text-gray-500">No stats available</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <h2 className="text-xl font-semibold text-gray-300 mb-2">Playlists</h2>
                    {userPlaylists ? (
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <p className="text-gray-400">
                          <strong>Playlist Name:</strong> {userPlaylists.name}
                        </p>
                        <p className="text-gray-400">
                          <strong>Tracks:</strong> {userPlaylists.tracks.length}
                        </p>
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

  return <UserProfile />;
}