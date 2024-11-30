import requests
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import random

# Spotify credentials
SPOTIPY_CLIENT_ID = "341ac69690c54b2bbe1187b67ea062c8"
SPOTIPY_CLIENT_SECRET = "4a62134c42ff4cdd8e3b4a6502b7caba"
SPOTIPY_REDIRECT_URI = "http://localhost:4000/callback"
SPOTIPY_SCOPE = "user-top-read"

# Last.fm API URL and key
LASTFM_API_URL = "http://ws.audioscrobbler.com/2.0/"
LASTFM_API_KEY = "67051887b21d801412236d9d03f7c314"

# Authenticate with Spotify API
sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
    client_id=SPOTIPY_CLIENT_ID,
    client_secret=SPOTIPY_CLIENT_SECRET,
    redirect_uri=SPOTIPY_REDIRECT_URI,
    scope=SPOTIPY_SCOPE
))

def get_spotify_top_tracks():
    results = sp.current_user_top_tracks(limit=50, time_range="medium_term")
    return [(track['name'], track['artists'][0]['name'], track['id']) for track in results['items']]

def get_similar_artists(seed_artists):
    """Get similar artists from Last.fm, with some possibility of including seed artists."""
    all_similar_artists = set()
    seed_artists_set = {artist.lower() for artist in seed_artists}
    
    # Keep track of original artists separately
    original_artists = set(seed_artists)
    
    for artist in seed_artists:
        params = {
            "method": "artist.getSimilar",
            "artist": artist,
            "api_key": LASTFM_API_KEY,
            "format": "json",
            "limit": 50  # Get more similar artists to have a larger pool
        }
        
        try:
            response = requests.get(LASTFM_API_URL, params=params)
            if response.status_code == 200:
                data = response.json()
                if 'similarartists' in data:
                    for similar in data['similarartists']['artist']:
                        artist_name = similar['name']
                        # Add all similar artists
                        all_similar_artists.add(artist_name)
        except Exception as e:
            print(f"Error fetching similar artists for {artist}: {e}")
    
    # Create final list with mostly new artists but some originals
    final_artists = list(all_similar_artists - original_artists)  # New artists
    # Add back some random original artists (about 20% of the pool)
    num_originals = min(len(original_artists) // 5, 10)  # 20% of originals, max 10
    if num_originals > 0:
        final_artists.extend(random.sample(list(original_artists), num_originals))
    
    random.shuffle(final_artists)  # Shuffle to mix original and new artists
    return final_artists

def get_recommended_tracks(similar_artists):
    """Get tracks from similar artists."""
    recommendations = []
    
    # Shuffle the similar artists to get more variety
    shuffled_artists = list(similar_artists)
    random.shuffle(shuffled_artists)
    
    # Try to get one track from each artist until we have enough recommendations
    for artist in shuffled_artists:
        if len(recommendations) >= 10:
            break
            
        params = {
            "method": "artist.getTopTracks",
            "artist": artist,
            "api_key": LASTFM_API_KEY,
            "format": "json",
            "limit": 1  # Only get the top track from each artist
        }
        
        try:
            response = requests.get(LASTFM_API_URL, params=params)
            if response.status_code == 200:
                data = response.json()
                if 'toptracks' in data and data['toptracks']['track']:
                    track = data['toptracks']['track'][0]
                    recommendations.append(f"{track['name']} by {artist}")
        except Exception as e:
            print(f"Error fetching tracks for {artist}: {e}")
    
    return recommendations

def main():
    # Get top 50 Spotify tracks
    top_tracks = get_spotify_top_tracks()
    
    # Print the top 50 Spotify songs with their artists
    print("Your Top 50 Spotify Tracks:")
    for track in top_tracks:
        print(f"- {track[0]} by {track[1]}")
    
    # Get unique artists from top tracks
    top_artists = list(set(track[1] for track in top_tracks))
    
    # Get similar artists, excluding those in top tracks
    similar_artists = get_similar_artists(top_artists)
    
    # Get recommended tracks from similar artists
    recommended_tracks = get_recommended_tracks(similar_artists)
    
    # Print recommendations
    print("\nRecommended tracks (mostly new artists, with some familiar ones):")
    for track in recommended_tracks:
        print(f"- {track}")

if __name__ == "__main__":
    main()