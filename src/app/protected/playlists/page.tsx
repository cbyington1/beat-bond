'use client';

import { useState } from "react";
import { useUser } from '@clerk/nextjs';
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MusicIcon, DownloadIcon, TrashIcon } from "lucide-react";

interface Playlist {
  _id: string;
  name: string;
  tracks: string[];
}

const PlaylistsPage = () => {
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const userID = user?.id as string;

  const delPlaylist = useMutation(api.playlists.deletePlaylist);
  const handleDelPlaylistButton = async () => {
    if (!selectedPlaylist) return;
    delPlaylist({ playlistID: selectedPlaylist._id });
  }

  // Fetch the playlist
  const playlists = useQuery(api.playlists.getRecentPlaylist, {userID: userID});

  const handleExportToSpotify = async () => {
    if (!selectedPlaylist) return;

    console.log('Exporting playlistsss:', selectedPlaylist.name, selectedPlaylist.tracks);

    try {
      const response = await fetch('/api/export-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playlistName: selectedPlaylist.name,
          tracks: selectedPlaylist.tracks
        })
      });

      if (response.ok) {
        const result = await response.json();
        window.open(result.playlistUrl, '_blank');
      } else {
        const errorData = await response.json();
        alert(`Export failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export playlist');
    }
  };

  if (!isSignedIn) {
    return (
      <Card className="p-4 bg-gray-800/50 border-gray-700">
        <p className="text-gray-400 text-center">
          Please sign in to view your playlists.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-300 mb-4">My Playlists</h1>

      {!playlists && (
        <Card className="p-8 bg-gray-800/50 border-gray-700 flex flex-col items-center justify-center">
          <MusicIcon className="w-16 h-16 text-cyan-500/50 mb-4" />
          <p className="text-gray-400 text-center">
            No playlists found. Generate some recommendations to create your first playlist!
          </p>
        </Card>
      )}

      <div className="grid md:grid-cols-[300px_1fr] gap-6">
        {playlists && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-300">Saved Playlist</h2>
            <Card 
              key={playlists._id} 
              className={`p-4 bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 cursor-pointer transition-colors ${
                selectedPlaylist?._id === playlists._id ? 'ring-2 ring-cyan-500' : ''
              }`}
              onClick={() => setSelectedPlaylist(playlists)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-cyan-400">
                    {playlists.name}
                  </h2>
                  <p className="text-gray-400">
                    {playlists.tracks.length} tracks
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {selectedPlaylist && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-300">
                {selectedPlaylist.name}
              </h2>
              <div className="flex gap-2">
                <Button 
                  onClick={handleExportToSpotify} 
                  className="flex items-center gap-2"
                >
                  <DownloadIcon className="w-4 h-4" />
                  Export to Spotify
                </Button>
                <Button 
                  variant="destructive"
                  className="flex items-center gap-2"
                  onClick={handleDelPlaylistButton}
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-400">Tracks</h3>
              {selectedPlaylist.tracks.map((trackId, index) => (
                <Card 
                  key={trackId}
                  className="p-2 bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">{index + 1}. {trackId}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistsPage;