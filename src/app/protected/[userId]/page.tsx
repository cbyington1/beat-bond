'use client'
import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';


const UserProfile = () => {
    const params = useParams();
    const userID = params?.userId as string;

    const user = useQuery(api.users.getUserByUserID, { userID: userID });

    const userStats = useQuery(api.stats.getStats, { userID: userID });

    const userPlaylists = useQuery(api.playlists.getPlaylist);

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
                                        <h2 className="text-xl font-semibold text-gray-300">User Information</h2>
                                        <p><strong>Name:</strong> {user.name}</p>
                                        <p><strong>Username:</strong> {user.username}</p>
                                        <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                                            Add Friend
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

export default UserProfile;