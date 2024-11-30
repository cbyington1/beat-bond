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
REDIRECT_URI = 'http://localhost:4000/api'

AUTH_URL = 'https://accounts.spotify.com/authorize'
TOKEN_URL = 'https://accounts.spotify.com/api/token'
API_BASE_URL = 'https://api.spotify.com/v1'
SCOPE = 'user-read-private user-read-email user-top-read'

sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id=CLIENT_ID,
                                               client_secret=CLIENT_SECRET,
                                               redirect_uri=REDIRECT_URI,
                                               scope=SCOPE,
                                               show_dialog=True))   

# add cache
track_features_cache = {}
track_info_cache = {}

def create_embedding(features):
    # Create an embedding from audio features.
    return features / np.linalg.norm(features)

def get_track_features(track_id):
    # check cache for dupes
    if track_id in track_features_cache:
        return track_features_cache[track_id]
    
    # api call
    features = sp.audio_features(track_id)[0]
    result = np.array([
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
    
    # store in cache
    track_features_cache[track_id] = result
    return result

def get_recommendations(seed_tracks, limit=50):
    # batch processing
    recommendations = sp.recommendations(seed_tracks=seed_tracks, limit=limit)
    return [track['id'] for track in recommendations['tracks']]

@app.route('/')
def home():
    return "Flask is working!"

@app.route('/api/recommendation', methods=['POST'])
@cross_origin(supports_credentials=True, origins="http://localhost:3000")
def recommendation():
    global generated
    global formatted_tracks

    # if generated or formatted_tracks is not None:
    #     return jsonify(formatted_tracks), 200
    
    try:
        data = request.get_json()
        top_tracks = data.get('topTracks')
        
        print("Received top tracks:", top_tracks)
        print(f"Fetched {len(top_tracks)} top tracks for the user.")
    
        # Get recommendations
        recommended_tracks = get_recommendations(top_tracks[:5], limit=50)
        print(f"Fetched {len(recommended_tracks)} recommended tracks.")
    
        # batch processing
        all_tracks = top_tracks + recommended_tracks
        features_list = sp.audio_features(all_tracks)
        
        # update cache
        for track_id, features in zip(all_tracks, features_list):
            if features:  
                track_features_cache[track_id] = np.array([
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
    
        # Create embeddings 
        user_embeddings = np.array([create_embedding(track_features_cache[track]) for track in top_tracks])
        recommended_embeddings = np.array([create_embedding(track_features_cache[track]) for track in recommended_tracks])
    
        # Calculate similarities
        avg_user_embedding = np.mean(user_embeddings, axis=0)
        similarities = cosine_similarity([avg_user_embedding], recommended_embeddings)[0]
    
        # Sort and format results
        sorted_recommendations = [x for _, x in sorted(zip(similarities, recommended_tracks), reverse=True)]
        
        # batch processing for track info
        tracks_info = sp.tracks(sorted_recommendations)['tracks']
        formatted_tracks = [track["id"] for track in tracks_info[:50]]
        
        generated = True
        return jsonify(formatted_tracks), 200
        
    except Exception as e:
        print(f"Error in recommendation: {str(e)}")
        return jsonify({"error": str(e)}), 500

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
    app.run(host='0.0.0.0', port=4000, debug = True)
