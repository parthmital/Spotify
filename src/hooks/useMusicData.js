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

      // Load data in parallel
      const [topSongs, playlists, recommended] = await Promise.all([
        musicApi.getTopSongs(10),
        musicApi.getPopularPlaylists(10),
        musicApi.getRecommendedSongs(10)
      ]);

      setMusicDatabase({
        sharedPlaylists: playlists,
        recentlyPlayed: topSongs,
        recommendedSongs: recommended,
        popularPlaylists: playlists,
        currentlyPlaying: topSongs[0] || null
      });
    } catch (err) {
      console.error('Error loading music data:', err);
      setError('Failed to load music data');
      
      // Use fallback data
      setMusicDatabase({
        sharedPlaylists: musicApi.getFallbackPlaylists(),
        recentlyPlayed: musicApi.getFallbackSongs(),
        recommendedSongs: musicApi.getFallbackSongs(),
        popularPlaylists: musicApi.getFallbackPlaylists(),
        currentlyPlaying: musicApi.getFallbackSongs()[0]
      });
    } finally {
      setLoading(false);
    }
  };

  const searchMusic = async (query) => {
    try {
      if (!query.trim()) return [];
      const results = await musicApi.searchSongs(query, 20);
      return results;
    } catch (err) {
      console.error('Error searching music:', err);
      return [];
    }
  };

  const refreshData = () => {
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