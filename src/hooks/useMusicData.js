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

      // Load data with individual error handling
      const results = await Promise.allSettled([
        musicApi.getTopSongs(10),
        musicApi.getPopularPlaylists(10),
        musicApi.getRecommendedSongs(10)
      ]);

      const [topSongsResult, playlistsResult, recommendedResult] = results;

      const topSongs = topSongsResult.status === 'fulfilled' ? topSongsResult.value : musicApi.getFallbackSongs();
      const playlists = playlistsResult.status === 'fulfilled' ? playlistsResult.value : musicApi.getFallbackPlaylists();
      const recommended = recommendedResult.status === 'fulfilled' ? recommendedResult.value : musicApi.getFallbackSongs();

      console.log('Loaded data:', { topSongs, playlists, recommended });

      setMusicDatabase({
        sharedPlaylists: playlists,
        recentlyPlayed: topSongs,
        recommendedSongs: recommended,
        popularPlaylists: playlists,
        currentlyPlaying: topSongs[0] || null
      });

      // Show warning if any API calls failed
      const failedCalls = results.filter(result => result.status === 'rejected');
      if (failedCalls.length > 0) {
        console.warn(`${failedCalls.length} API calls failed, using fallback data`);
        setError(`Some content may be limited due to API connectivity issues`);
      }

    } catch (err) {
      console.error('Error loading music data:', err);
      setError('Failed to load music data. Using demo content.');
      
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
      
      console.log(`Searching for: ${query}`);
      const results = await musicApi.searchSongs(query, 20);
      console.log(`Search results:`, results);
      
      return results;
    } catch (err) {
      console.error('Error searching music:', err);
      return musicApi.getFallbackSearchResults(query);
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