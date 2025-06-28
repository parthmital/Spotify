import { useState, useEffect } from 'react';
import { musicApi } from '../services/musicApi';

export const useMusicData = () => {
  const [musicDatabase, setMusicDatabase] = useState({
    sharedPlaylists: [],
    recentlyPlayed: [],
    recommendedSongs: [],
    popularPlaylists: [],
    currentlyPlaying: null
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading initial music data...');

      // Load data sequentially to avoid overwhelming the API
      const topSongs = await musicApi.getTopSongs(10);
      const playlists = await musicApi.getPopularPlaylists(10);
      const recommended = await musicApi.getRecommendedSongs(10);

      console.log('Loaded data:', { topSongs, playlists, recommended });

      setMusicDatabase({
        sharedPlaylists: playlists,
        recentlyPlayed: topSongs,
        recommendedSongs: recommended,
        popularPlaylists: playlists,
        currentlyPlaying: topSongs[0] || null
      });

    } catch (err) {
      console.error('Error loading music data:', err);
      setError('Failed to load music data from JioSaavn API');
    } finally {
      setLoading(false);
    }
  };

  const searchMusic = async (query) => {
    try {
      if (!query.trim()) return [];
      
      console.log(`Searching for: ${query}`);
      const results = await musicApi.searchSongs(query, 20);
      console.log(`Search results:`, results);
      
      return results;
    } catch (err) {
      console.error('Error searching music:', err);
      return [];
    }
  };

  const refreshData = () => {
    console.log('Refreshing music data...');
    loadInitialData();
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  return {
    musicDatabase,
    loading,
    error,
    searchMusic,
    refreshData,
    setMusicDatabase
  };
};