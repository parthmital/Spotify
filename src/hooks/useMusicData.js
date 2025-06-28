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

      // Load data with delays to avoid rate limiting
      const topSongs = await musicApi.getTopSongs(10);
      console.log('Top songs loaded:', topSongs.length);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const playlists = await musicApi.getPopularPlaylists(10);
      console.log('Playlists loaded:', playlists.length);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const recommended = await musicApi.getRecommendedSongs(10);
      console.log('Recommended loaded:', recommended.length);

      const newDatabase = {
        sharedPlaylists: playlists,
        recentlyPlayed: topSongs,
        recommendedSongs: recommended,
        popularPlaylists: playlists,
        currentlyPlaying: topSongs[0] || null
      };

      console.log('Final database:', newDatabase);
      setMusicDatabase(newDatabase);

    } catch (err) {
      console.error('Error loading music data:', err);
      setError(`Failed to load music data: ${err.message}`);
      
      // Set fallback data
      setMusicDatabase({
        sharedPlaylists: [],
        recentlyPlayed: [],
        recommendedSongs: [],
        popularPlaylists: [],
        currentlyPlaying: null
      });
    } finally {
      setLoading(false);
    }
  };

  const searchMusic = async (query) => {
    try {
      if (!query.trim()) return [];
      
      console.log(`Searching for: ${query}`);
      const results = await musicApi.searchSongs(query, 20);
      console.log(`Search results:`, results.length, 'songs found');
      
      return results;
    } catch (err) {
      console.error('Error searching music:', err);
      throw err;
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