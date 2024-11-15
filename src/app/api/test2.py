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
REDIRECT_URI = 'http://localhost:3450/api/callback'

AUTH_URL = 'https://accounts.spotify.com/authorize'
TOKEN_URL = 'https://accounts.spotify.com/api/token'
API_BASE_URL = 'https://api.spotify.com/v1'
SCOPE = 'user-read-private user-read-email user-top-read'

sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id=CLIENT_ID,
                                               client_secret=CLIENT_SECRET,
                                               redirect_uri=REDIRECT_URI,
                                               scope=SCOPE,
                                               show_dialog=True))
    
# @app.route('/api')
# def index():
#     return "<a href='/login'>Login with Spotify</a>"

# @app.route("/api/login")
# @cross_origin(supports_credentials=True, origins="http://localhost:3000")
# def login():
#     auth_url = sp.auth_manager.get_authorize_url()
#     return redirect(auth_url)

# @app.route("/api/callback")
# def callback():
#     if 'error' in request.args:
#         return jsonify({"error": request.args['error']})
    
#     code = request.args.get('code')
#     if code:
#         # Retrieve token using the authorization code
#         token_info = sp.auth_manager.get_access_token(code)
        
#         # Store tokens in session
#         session['access_token'] = token_info['access_token']
#         session['refresh_token'] = token_info.get('refresh_token')
#         session['expires_at'] = datetime.now().timestamp() + token_info['expires_in']

#         return redirect('/playlists')
#     else:
#         return jsonify({"error": "Authorization code missing"})

# @app.route('/api/playlists', methods=['GET'])

# def get_playlists():
#         if 'access_token' not in session:
#              return redirect('/login')
        
#         if datetime.now().timestamp() > session['expires_at']:
#              return redirect('/refresh-token')
        
#         headers = {
#              'Authorization': f"Bearer {session['access_token']}"
#         }

#         response = requests.get(f"{API_BASE_URL}/me/playlists", headers=headers)
#         playlists = response.json()

#         return jsonify(playlists)

# @app.route('/api/top-tracks', methods=['GET'])
# @cross_origin(supports_credentials=True, origins="http://localhost:3000")
# def get_top_tracks(limit=10):
#         if 'access_token' not in session:
#              return redirect('/api/login')
        
#         if datetime.now().timestamp() > session['expires_at']:
#              return redirect('/api/refresh-token')
        
#         # Get user's top tracks from Spotify.
#         results = sp.current_user_top_tracks(limit=limit, time_range='short_term')
#         return jsonify(results)

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

def get_recommendations(seed_tracks, limit=20):
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
        
        # You can process, store, or use the data as needed
        print("Received top tracks:", top_tracks)
        # print("Received recommendations:", recommendations)

        # # Get user's top tracks
        user_top_tracks = top_tracks
        print(f"Fetched {len(user_top_tracks)} top tracks for the user.")
    
        # # Get recommendations based on user's top tracks
        recommended_tracks = get_recommendations(top_tracks[:5])  # Use top 5 tracks as seeds
        print(f"Fetched {len(recommended_tracks)} recommended tracks.")
    
        # # Create embeddings for user's top tracks and recommended tracks
        user_embeddings = np.array([create_embedding(get_track_features(track)) for track in user_top_tracks])
        recommended_embeddings = np.array([create_embedding(get_track_features(track)) for track in recommended_tracks])
    
        # # Calculate average user embedding
        avg_user_embedding = np.mean(user_embeddings, axis=0)
    
        # # Calculate cosine similarity
        similarities = cosine_similarity([avg_user_embedding], recommended_embeddings)[0]
    
        # # Sort recommendations by similarity
        sorted_recommendations = [x for _, x in sorted(zip(similarities, recommended_tracks), reverse=True)]
        tracks = [sp.track(track_id) for track_id in sorted_recommendations]
        formatted_tracks = [track["id"] for track in tracks]
        
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

# @app.route('/api/refresh-token')
# def refresh_token():
#         if 'refresh_token' not in session:
#              return redirect('/api/login')
        
#         if datetime.now().timestamp() > session['expires_at']:
#              req_body = {
#                   'grant_type': 'refresh_token',
#                   'refresh_token': session['refresh_token'],
#                   'client_id': CLIENT_ID,
#                   'client_secret': CLIENT_SECRET
#              }

#         response = requests.post(TOKEN_URL, data=req_body)
#         new_token_info = response.json()
        
#         session['access_token'] = new_token_info.get('access_token')
#         session['expires_at'] = datetime.now().timestamp() + new_token_info['expires_in'] 

#         return redirect('/api/playlists')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3450, debug = True)
