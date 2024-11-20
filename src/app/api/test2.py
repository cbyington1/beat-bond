import requests
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from datetime import datetime, timedelta
from flask import Flask, redirect, request, jsonify, session
from flask_cors import CORS, cross_origin
from dotenv import load_dotenv
import os

load_dotenv()

generated = False
formatted_tracks = None

app = Flask(__name__)
app.secret_key = 'abcdefg'
CORS(app, supports_credentials=True, origins="http://localhost:3000")

CLIENT_ID = os.getenv("SPOTIPY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIPY_ClIENT_SECRET")
REDIRECT_URI = 'http://localhost:3450/api'

AUTH_URL = 'https://accounts.spotify.com/authorize'
TOKEN_URL = 'https://accounts.spotify.com/api/token'
API_BASE_URL = 'https://api.spotify.com/v1'
SCOPE = 'user-read-private user-read-email user-top-read'

sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id=CLIENT_ID,
                                               client_secret=CLIENT_SECRET,
                                               redirect_uri=REDIRECT_URI,
                                               scope=SCOPE,
                                               show_dialog=True))   

def create_embedding(features):
    # Create an embedding from audio features.
    return features / np.linalg.norm(features)

def get_track_features(track_id):
    # Get audio features for a track from Spotify API.
    features = sp.audio_features(track_id)[0]
    return np.array([
        features['danceability'],
        features['energy'],
        features['loudness'],
        features['speechiness'],
        features['acousticness'],
        features['instrumentalness'],
        features['liveness'],
        features['valence'],
        features['tempo']
    ])

def get_recommendations(seed_tracks, limit=50):
    # Get track recommendations based on seed tracks.
    recommendations = sp.recommendations(seed_tracks=seed_tracks, limit=limit)
    return [track['id'] for track in recommendations['tracks']]

@app.route('/api/recommendation', methods=['POST'])
@cross_origin(supports_credentials=True, origins="http://localhost:3000")
def recommendation():
    global generated
    global formatted_tracks

    if generated or formatted_tracks != None:
        print(formatted_tracks)
        return jsonify(formatted_tracks), 200
    
    try:
        data = request.get_json()
        top_tracks = data.get('topTracks')
        # recommendations = data.get('recommendations')
        
        print("Received top tracks:", top_tracks)
        # print("Received recommendations:", recommendations)

        # # Get user's top tracks
        top_tracks = top_tracks
        print(f"Fetched {len(top_tracks)} top tracks for the user.")
    
        # # Get recommendations based on user's top tracks
        recommended_tracks = get_recommendations(top_tracks[:5])  # Use top 5 tracks as seeds
        print(f"Fetched {len(recommended_tracks)} recommended tracks.")
    
        # # Create embeddings for user's top tracks and recommended tracks
        user_embeddings = np.array([create_embedding(get_track_features(track)) for track in top_tracks])
        recommended_embeddings = np.array([create_embedding(get_track_features(track)) for track in recommended_tracks])
    
        # # Calculate average user embedding
        avg_user_embedding = np.mean(user_embeddings, axis=0)
    
        # # Calculate cosine similarity
        similarities = cosine_similarity([avg_user_embedding], recommended_embeddings)[0]
    
        # # Sort recommendations by similarity
        sorted_recommendations = [x for _, x in sorted(zip(similarities, recommended_tracks), reverse=True)]
        tracks = [sp.track(track_id) for track_id in sorted_recommendations]
        formatted_tracks = [track["id"] for i, track in enumerate(tracks[:10], 1)]
        
        generated = True
        print(formatted_tracks)
        return jsonify(formatted_tracks), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    # # Print top 10 recommendations
    # print("\nTop 10 Personalized Recommendations:")
    # for i, track_id in enumerate(sorted_recommendations[:20], 1):
    #     track_info = sp.track(track_id)
    #     print(f"{i}. {track_info['name']} by {track_info['artists'][0]['name']}")
    
    # return redirect('/api/top-tracks')

@app.route('/api/stats', methods=['POST'])
@cross_origin(supports_credentials=True, origins="http://localhost:3000")
def analyze_user_genres():
    data = request.get_json()
    top_tracks = data.get('topTracks')
   
    artist_ids = set()
    for track_id in top_tracks:
        track_info = sp.track(track_id)
        artist_ids.add(track_info['artists'][0]['id'])
   
    genre_counts = {}
    artist_ids = list(artist_ids)
   
    for i in range(0, len(artist_ids), 50):
        batch = artist_ids[i:i+50]
        artists_info = sp.artists(batch)['artists']
        for artist in artists_info:
            for genre in artist['genres']:
                genre_counts[genre] = genre_counts.get(genre, 0) + 1
   
    sorted_genres = sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)
    total_genres = sum(genre_counts.values())
    genre_percentages = {genre: (count / total_genres) * 100 for genre, count in sorted_genres}
    print(f"{genre}"for genre, count in sorted_genres)
    return jsonify(genre_percentages), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3450, debug = True)
