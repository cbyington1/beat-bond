# app.py - Your Flask Backend Server
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import requests
import random
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True, origins="http://localhost:3000")

# Last.fm Configuration
LASTFM_API_URL = "http://ws.audioscrobbler.com/2.0/"
LASTFM_API_KEY = "67051887b21d801412236d9d03f7c314"

# Spotify API Base URL
API_BASE_URL = 'https://api.spotify.com/v1'

# Caching
artist_cache = {}

def get_spotify_headers(token):
    return {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }

def get_similar_artists(seed_artists):
    """Get similar artists from Last.fm, with some possibility of including seed artists."""
    if not seed_artists:
        return []
        
    all_similar_artists = set()
    original_artists = set(seed_artists)
    
    for artist in seed_artists:
        if artist in artist_cache:
            similar_artists = artist_cache[artist]
        else:
            params = {
                "method": "artist.getSimilar",
                "artist": artist,
                "api_key": LASTFM_API_KEY,
                "format": "json",
                "limit": 10
            }
            
            try:
                response = requests.get(LASTFM_API_URL, params=params)
                response.raise_for_status()  # This will raise an exception for bad status codes
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
    
    # Ensure we have at least some artists
    if not all_similar_artists and original_artists:
        return list(original_artists)  # Return original artists if no similar ones found
        
    final_artists = list(all_similar_artists - original_artists)
    num_originals = min(len(original_artists) // 5, 10)
    if num_originals > 0:
        final_artists.extend(random.sample(list(original_artists), num_originals))
    
    random.shuffle(final_artists)
    return final_artists

def get_recommended_tracks(similar_artists, limit=10):
    """Get tracks from similar artists using Last.fm."""
    recommendations = []
    
    for artist in similar_artists:
        if len(recommendations) >= limit:
            break
            
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
                    for track in data['toptracks']['track'][:3]:
                        recommendations.append({
                            'name': track['name'],
                            'artist': artist
                        })
        except Exception as e:
            print(f"Error fetching tracks for {artist}: {e}")
    
    random.shuffle(recommendations)
    return recommendations[:limit]

def search_spotify_track(track_name, artist_name, token):
    """Search for a track on Spotify and return its ID."""
    query = f"track:{track_name} artist:{artist_name}"
    headers = get_spotify_headers(token)
    
    response = requests.get(
        f"{API_BASE_URL}/search",
        headers=headers,
        params={'q': query, 'type': 'track', 'limit': 1}
    )
    
    if response.status_code == 200:
        results = response.json()
        if results['tracks']['items']:
            return results['tracks']['items'][0]['id']
    return None

@app.route('/')
def home():
    return "Flask server is running!"

@app.route('/api/recommendation', methods=['POST'])
@cross_origin(supports_credentials=True, origins="http://localhost:3000")
def recommendation():
    try:
        data = request.get_json()
        top_tracks = data.get('topTracks', [])
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({"error": "No authorization token provided"}), 401
            
        token = token.replace('Bearer ', '')
        headers = get_spotify_headers(token)
        
        # Get artists from top tracks
        top_artists = []
        for track_id in top_tracks:
            try:
                response = requests.get(f"{API_BASE_URL}/tracks/{track_id}", headers=headers)
                response.raise_for_status()
                track_info = response.json()
                top_artists.append(track_info['artists'][0]['name'])
            except Exception as e:
                print(f"Error fetching track info for {track_id}: {e}")
                continue
        
        # Remove duplicates and check if we have any artists
        top_artists = list(set(top_artists))
        if not top_artists:
            return jsonify({"error": "No valid artists found from top tracks"}), 400
        
        # Get similar artists
        similar_artists = get_similar_artists(top_artists)
        if not similar_artists:
            return jsonify({"error": "No similar artists found"}), 400
        
        # Get recommended tracks from Last.fm
        lastfm_recommendations = get_recommended_tracks(similar_artists, limit=100)  # Increased limit for better chances
        if not lastfm_recommendations:
            return jsonify({"error": "No recommendations found from Last.fm"}), 400
        
        # Convert Last.fm recommendations to Spotify track IDs
        spotify_track_ids = []
        for rec in lastfm_recommendations:
            if len(spotify_track_ids) >= 10:  # Stop once we have enough tracks
                break
                
            track_id = search_spotify_track(rec['name'], rec['artist'], token)
            if track_id and track_id not in top_tracks and track_id not in spotify_track_ids:
                spotify_track_ids.append(track_id)
        
        # Check if we found any valid Spotify tracks
        if not spotify_track_ids:
            return jsonify({"error": "No valid Spotify tracks found from recommendations"}), 400
        
        return jsonify(spotify_track_ids), 200
        
    except Exception as e:
        print(f"Error in recommendation: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/stats', methods=['POST'])
@cross_origin(supports_credentials=True, origins="http://localhost:3000")
def analyze_user_genres():
        data = request.get_json()
        top_tracks = data.get('topTracks')
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({"error": "No authorization token provided"}), 401
            
        token = token.replace('Bearer ', '')
        headers = get_spotify_headers(token)
        
        artist_ids = set()
        for track_id in top_tracks:
            response = requests.get(f"{API_BASE_URL}/tracks/{track_id}", headers=headers)
            if response.status_code == 200:
                track_info = response.json()
                artist_ids.add(track_info['artists'][0]['id'])
        
        genre_counts = {}
        artist_ids = list(artist_ids)
        
        for i in range(0, len(artist_ids), 10):
            batch = artist_ids[i:i+10]
            response = requests.get(
                f"{API_BASE_URL}/artists",
                headers=headers,
                params={'ids': ','.join(batch)}
            )
            if response.status_code == 200:
                artists_info = response.json()['artists']
                for artist in artists_info:
                    for genre in artist['genres']:
                        genre_counts[genre] = genre_counts.get(genre, 0) + 1
        
        sorted_genres = sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)
        total_genres = sum(genre_counts.values())
        genre_percentages = {genre: (count / total_genres) * 100 for genre, count in sorted_genres}
        
        return jsonify(genre_percentages), 200
    

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000, debug=True)