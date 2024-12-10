# BeatBond

BeatBond is a social music discovery platform that combines personalized music recommendations with social networking features. Connect with friends, share music tastes, and discover new tracks based on your Spotify listening history. The platform uses a hybrid recommendation system combining Spotify and Last.fm APIs while enabling users to build a community around their musical interests.

## Features

- **Personalized Music Discovery**: Get tailored music recommendations based on your Spotify listening history
- **Social Networking**: Connect with friends, follow other users, and discover music through your network
- **User Profiles**: Customizable user profiles showcasing music tastes and listening statistics
- **User Search**: Find and connect with other users who share your musical interests
- **Time-Based Analysis**: View your top tracks across different time ranges (short-term, medium-term, long-term)
- **Genre Analysis**: Visualize your music taste through genre distribution statistics
- **Protected Routes**: Secure user authentication and protected pages using Clerk
- **Real-time Updates**: Live social features powered by Convex DB
- **Responsive Design**: Full mobile and desktop support with adaptive sidebar navigation

## Tech Stack

### Frontend
- Next.js 14 with TypeScript
- Tailwind CSS for styling
- Clerk for authentication
- shadcn/ui for UI components
- React Hooks for state management

### Database
- Convex DB for real-time data storage
- Built-in reactive queries and mutations
- Automatic cache management

### Backend
- Flask server for recommendation logic
- Last.fm API for similar artist discovery
- Spotify Web API for music data
- Cross-Origin Resource Sharing (CORS) support

## Social Features & Convex Integration

BeatBond leverages Convex DB to power its social networking features and real-time updates:

### User Management
- User profiles with customizable information
- Friend connections and following system
- Real-time user search functionality
- Profile viewing and interaction

### Real-time Features
- Live user search updates
- Instant friend request notifications
- Real-time profile updates
- Social activity feed

### Technical Integration
- Real-time data synchronization using Convex
- Automatic cache invalidation
- Type-safe database queries and mutations
- Efficient state management with reactive queries
- Seamless integration via `convexClientProvider.tsx`

The social features are built using Convex's real-time capabilities, enabling instant updates and interactions between users without page refreshes.

## Project Structure

```
src/
├── app/                    # Next.js application routes
│   ├── api/               # API route handlers
│   └── protected/         # Protected pages requiring authentication
├── components/            # Reusable React components
│   └── ui/               # UI component library
├── hooks/                # Custom React hooks
└── lib/                  # Utility functions
```

## API Endpoints

- `/api/recommendation`: Generates personalized track recommendations
- `/api/stats`: Analyzes user's genre preferences
- `/api/spotify`: Handles Spotify API interactions
- `/api/top-tracks`: Retrieves user's top tracks
- `/api/trackinfo`: Fetches detailed track information

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```env
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   LASTFM_API_KEY=your_lastfm_api_key
   CONVEX_DEPLOYMENT=your_convex_deployment_url
   NEXT_PUBLIC_CONVEX_URL=your_public_convex_url
   ```
4. Start the development servers:
   ```bash
   # Start Next.js frontend
   npm run dev
   
   # Start Flask backend
   python app.py
   ```

## Authentication Flow

BeatBond uses Clerk for user authentication and manages Spotify API tokens through a secure middleware layer. The application maintains session persistence and handles token refresh automatically.

## Recommendation System

The recommendation engine works in three steps:

1. Analyzes user's top tracks to identify favorite artists
2. Uses Last.fm API to find similar artists
3. Combines data from both Spotify and Last.fm to generate personalized track recommendations
