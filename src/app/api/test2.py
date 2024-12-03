from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import requests
import random
import os
import time
from dotenv import load_dotenv
from datetime import datetime, timedelta
from collections import OrderedDict
from typing import Dict, Any
from concurrent.futures import ThreadPoolExecutor
from functools import partial

load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True, origins="http://localhost:3000")

# API Configuration
LASTFM_API_URL = "http://ws.audioscrobbler.com/2.0/"
LASTFM_API_KEY = "790ea4fcfc5291f40bdaf3d5ec723511"
API_BASE_URL = 'https://api.spotify.com/v1'

class TimedCache(OrderedDict):
    """
    A cache implementation with expiration time and size limits
    """
    def __init__(self, max_size=1000, expiration_time=3600):
        super().__init__()
        self.max_size = max_size
        self.expiration_time = expiration_time

    def __setitem__(self, key: str, value: Any):
        if len(self) >= self.max_size:
            self.popitem(last=False)  # Remove oldest item
        super().__setitem__(key, {
            'value': value,
            'timestamp': datetime.now()
        })

    def __getitem__(self, key: str) -> Any:
        item = super().__getitem__(key)
        if (datetime.now() - item['timestamp']).total_seconds() > self.expiration_time:
            del self[key]
            raise KeyError
        return item['value']

    def get(self, key: str, default=None) -> Any:
        try:
            return self[key]
        except (KeyError, AttributeError):
            return default

# Initialize caches with appropriate expiration times
artist_cache = TimedCache(max_size=500, expiration_time=86400)  # 24 hour expiration
track_cache = TimedCache(max_size=1000, expiration_time=43200)  # 12 hour expiration

class RateLimitExceeded(Exception):
    pass

class APIRateLimiter:
    def __init__(self, calls_per_second=1):
        self.calls_per_second = calls_per_second
        self.last_call_time = datetime.now()

    def wait_if_needed(self):
        now = datetime.now()
        elapsed = (now - self.last_call_time).total_seconds()
        if elapsed < 1.0 / self.calls_per_second:
            time.sleep((1.0 / self.calls_per_second) - elapsed)
        self.last_call_time = datetime.now()

# Initialize rate limiters
spotify_limiter = APIRateLimiter(calls_per_second=2)  # 2 calls per second
lastfm_limiter = APIRateLimiter(calls_per_second=4)   # 4 calls per second

def make_spotify_request(url, headers, params=None, max_retries=3, initial_backoff=1):
    """Make a request to Spotify API with exponential backoff"""
    spotify_limiter.wait_if_needed()
    
    for attempt in range(max_retries):
        try:
            response = requests.get(url, headers=headers, params=params)
            
            if response.status_code == 200:
                return response.json()
            
            if response.status_code == 429:
                retry_after = int(response.headers.get('Retry-After', initial_backoff * (2 ** attempt)))
                print(f"Rate limited, waiting {retry_after} seconds...")
                time.sleep(retry_after)
                continue
                
            response.raise_for_status()
            
        except requests.exceptions.RequestException as e:
            if attempt == max_retries - 1:
                raise e
            time.sleep(initial_backoff * (2 ** attempt))
            
    raise RateLimitExceeded("Max retries exceeded")

def get_spotify_headers(token):
    """Get headers for Spotify API requests"""
    return {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }

def batch_get_tracks(track_ids, token, batch_size=20):
    """Get track information in optimal batch sizes"""
    if not track_ids:
        return []

    headers = get_spotify_headers(token)
    all_tracks = []
    
    for i in range(0, len(track_ids), batch_size):
        batch = track_ids[i:i + batch_size]
        batch_ids = ','.join(batch)
        
        try:
            data = make_spotify_request(
                f"{API_BASE_URL}/tracks",
                headers=headers,
                params={'ids': batch_ids}
            )
            valid_tracks = [t for t in data['tracks'] if t is not None]
            all_tracks.extend(valid_tracks)
            
        except Exception as e:
            print(f"Error fetching batch of tracks: {e}")
            continue
            
    return all_tracks

def get_similar_artists(seed_artists):
    """Get similar artists from Last.fm, with caching"""
    if not seed_artists:
        return []
        
    all_similar_artists = set()
    original_artists = set(seed_artists)
    
    for artist in seed_artists:
        cached_similar = artist_cache.get(artist)
        if cached_similar is not None:
            similar_artists = cached_similar
        else:
            lastfm_limiter.wait_if_needed()
            params = {
                "method": "artist.getSimilar",
                "artist": artist,
                "api_key": LASTFM_API_KEY,
                "format": "json",
                "limit": 50
            }
            
            try:
                response = requests.get(LASTFM_API_URL, params=params)
                response.raise_for_status()
                data = response.json()
                if 'similarartists' in data and 'artist' in data['similarartists']:
                    similar_artists = [similar['name'] for similar in data['similarartists']['artist']]
                    artist_cache[artist] = similar_artists
                else:
                    similar_artists = []
            except Exception as e:
                print(f"Error fetching similar artists for {artist}: {e}")
                similar_artists = []
                
        all_similar_artists.update(similar_artists)
    
    if not all_similar_artists and original_artists:
        return list(original_artists)
        
    final_artists = list(all_similar_artists - original_artists)
    num_originals = min(len(original_artists) // 5, 10)
    if num_originals > 0:
        final_artists.extend(random.sample(list(original_artists), num_originals))
    
    random.shuffle(final_artists)
    return final_artists

def get_lastfm_artist_tracks(artist: str) -> list:
    """Get top tracks for an artist from Last.fm"""
    lastfm_limiter.wait_if_needed()
    params = {
        "method": "artist.getTopTracks",
        "artist": artist,
        "api_key": LASTFM_API_KEY,
        "format": "json",
        "limit": 3
    }
    
    try:
        response = requests.get(LASTFM_API_URL, params=params)
        if response.status_code == 200:
            data = response.json()
            if 'toptracks' in data and data['toptracks']['track']:
                return [{
                    'name': track['name'],
                    'artist': artist
                } for track in data['toptracks']['track'][:2]]
    except Exception as e:
        print(f"Error fetching tracks for {artist}: {e}")
    return []

def get_recommendations_parallel(similar_artists: list, max_tracks: int = 30) -> list:
    """Get recommended tracks in parallel"""
    with ThreadPoolExecutor(max_workers=5) as executor:
        all_tracks = []
        for tracks in executor.map(get_lastfm_artist_tracks, similar_artists[:20]):
            all_tracks.extend(tracks)
            if len(all_tracks) >= max_tracks:
                break
        return all_tracks[:max_tracks]

def search_spotify_track(track_name, artist_name, token):
    """Search for a track on Spotify with caching and rate limiting"""
    cache_key = f"{track_name}::{artist_name}"
    cached_id = track_cache.get(cache_key)
    if cached_id is not None:
        return cached_id

    query = f"track:{track_name} artist:{artist_name}"
    headers = get_spotify_headers(token)
    
    try:
        data = make_spotify_request(
            f"{API_BASE_URL}/search",
            headers=headers,
            params={'q': query, 'type': 'track', 'limit': 1}
        )
        
        if data['tracks']['items']:
            track_id = data['tracks']['items'][0]['id']
            track_cache[cache_key] = track_id
            return track_id
            
    except Exception as e:
        print(f"Error searching for track '{track_name}' by {artist_name}: {e}")
    return None

@app.route('/')
def home():
    return "Flask server is running!"

@app.route('/api/recommendation', methods=['POST'])
@cross_origin(supports_credentials=True, origins="http://localhost:3000")
def recommendation():
    """Generate music recommendations based on user's top tracks"""
    try:
        data = request.get_json()
        top_tracks = data.get('topTracks', [])[:20]  # Limit input
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({"error": "No authorization token provided"}), 401
            
        token = token.replace('Bearer ', '')
        
        # Get track info in optimized batches
        track_info = batch_get_tracks(top_tracks, token)
        top_artists = list(set(track['artists'][0]['name'] for track in track_info if track))
        
        if not top_artists:
            return jsonify({"error": "No valid artists found from top tracks"}), 400
        
        # Get similar artists (limited to 10 seed artists)
        similar_artists = get_similar_artists(top_artists[:10])
        if not similar_artists:
            return jsonify({"error": "No similar artists found"}), 400
        
        # Get recommended tracks in parallel
        recommended_tracks = get_recommendations_parallel(similar_artists, max_tracks=30)
        random.shuffle(recommended_tracks)
        
        # Batch process Spotify track searches
        track_ids = []
        search_batch = []
        for track in recommended_tracks[:20]:
            cache_key = f"{track['name']}::{track['artist']}"
            cached_id = track_cache.get(cache_key)
            if cached_id:
                track_ids.append(cached_id)
                continue
                
            search_batch.append(track)
            
            if len(search_batch) >= 5 or track == recommended_tracks[-1]:
                for t in search_batch:
                    track_id = search_spotify_track(t['name'], t['artist'], token)
                    if track_id:
                        track_ids.append(track_id)
                    if len(track_ids) >= 10:
                        break
                search_batch = []
            
            if len(track_ids) >= 10:
                break
        
        if not track_ids:
            return jsonify({"error": "No tracks found for recommendation"}), 400
            
        return jsonify(track_ids)

    except Exception as e:
        print(f"Error processing recommendation: {e}")
        return jsonify({"error": "An error occurred while generating recommendations"}), 500

if __name__ == '__main__':
    app.run(debug=True)