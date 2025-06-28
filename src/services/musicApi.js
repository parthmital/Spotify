const JIOSAAVN_API_BASE = 'https://jiosaavn-api-2-harsh-patel.vercel.app';
const BACKUP_API_BASE = 'https://saavn.me';

class MusicApiService {
  constructor() {
    this.currentApiBase = JIOSAAVN_API_BASE;
  }

  async makeRequest(endpoint, retryWithBackup = true) {
    try {
      console.log(`Making request to: ${this.currentApiBase}${endpoint}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${this.currentApiBase}${endpoint}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      return data;
      
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      
      // Try backup API if available and not already tried
      if (retryWithBackup && this.currentApiBase === JIOSAAVN_API_BASE) {
        console.log('Trying backup API...');
        this.currentApiBase = BACKUP_API_BASE;
        return this.makeRequest(endpoint, false);
      }
      
      throw error;
    }
  }

  async searchSongs(query, limit = 10) {
    try {
      const endpoint = `/search/songs?query=${encodeURIComponent(query)}&page=1&limit=${limit}`;
      const data = await this.makeRequest(endpoint);
      
      // Handle different API response structures
      const songs = data.data?.results || data.results || data || [];
      return this.transformSongsData(songs);
    } catch (error) {
      console.error('Error searching songs:', error);
      return this.getFallbackSearchResults(query);
    }
  }

  async getTopSongs(limit = 10) {
    try {
      // Try multiple endpoints for trending songs
      const endpoints = [
        `/search/songs?query=trending&page=1&limit=${limit}`,
        `/search/songs?query=bollywood hits&page=1&limit=${limit}`,
        `/search/songs?query=top songs&page=1&limit=${limit}`
      ];
      
      for (const endpoint of endpoints) {
        try {
          const data = await this.makeRequest(endpoint);
          const songs = data.data?.results || data.results || data || [];
          if (songs.length > 0) {
            return this.transformSongsData(songs);
          }
        } catch (error) {
          console.log(`Endpoint ${endpoint} failed, trying next...`);
          continue;
        }
      }
      
      throw new Error('All endpoints failed');
    } catch (error) {
      console.error('Error fetching top songs:', error);
      return this.getFallbackSongs();
    }
  }

  async getPopularPlaylists(limit = 10) {
    try {
      const queries = ['bollywood', 'hindi hits', 'top playlists', 'trending'];
      
      for (const query of queries) {
        try {
          const endpoint = `/search/playlists?query=${query}&page=1&limit=${limit}`;
          const data = await this.makeRequest(endpoint);
          const playlists = data.data?.results || data.results || data || [];
          if (playlists.length > 0) {
            return this.transformPlaylistsData(playlists);
          }
        } catch (error) {
          console.log(`Playlist query ${query} failed, trying next...`);
          continue;
        }
      }
      
      throw new Error('All playlist queries failed');
    } catch (error) {
      console.error('Error fetching playlists:', error);
      return this.getFallbackPlaylists();
    }
  }

  async getRecommendedSongs(limit = 10) {
    try {
      const queries = ['hindi hits', 'punjabi songs', 'english songs', 'tamil hits', 'latest songs'];
      const randomQuery = queries[Math.floor(Math.random() * queries.length)];
      
      const endpoint = `/search/songs?query=${randomQuery}&page=1&limit=${limit}`;
      const data = await this.makeRequest(endpoint);
      const songs = data.data?.results || data.results || data || [];
      return this.transformSongsData(songs);
    } catch (error) {
      console.error('Error fetching recommended songs:', error);
      return this.getFallbackSongs();
    }
  }

  async getSongDetails(songId) {
    try {
      const endpoint = `/songs?id=${songId}`;
      const data = await this.makeRequest(endpoint);
      const song = data.data?.[0] || data[0] || data;
      return this.transformSongData(song);
    } catch (error) {
      console.error('Error fetching song details:', error);
      return null;
    }
  }

  transformSongsData(songs) {
    if (!Array.isArray(songs)) {
      console.warn('Songs data is not an array:', songs);
      return [];
    }

    return songs.map((song, index) => {
      try {
        return {
          id: song.id || `song-${index}`,
          song: this.cleanText(song.name || song.title || 'Unknown Song'),
          artist: this.extractArtists(song.primaryArtists || song.artists || song.artist),
          cover: this.getBestImageQuality(song.image),
          file: this.extractAudioUrl(song),
          duration: this.formatDuration(song.duration),
          year: song.year || new Date().getFullYear(),
          album: this.cleanText(song.album?.name || 'Unknown Album')
        };
      } catch (error) {
        console.error('Error transforming song:', song, error);
        return {
          id: `fallback-song-${index}`,
          song: 'Unknown Song',
          artist: 'Unknown Artist',
          cover: this.getPlaceholderImage(),
          file: '',
          duration: '0:00',
          year: new Date().getFullYear(),
          album: 'Unknown Album'
        };
      }
    }).filter(song => song.song !== 'Unknown Song' || song.artist !== 'Unknown Artist');
  }

  transformPlaylistsData(playlists) {
    if (!Array.isArray(playlists)) {
      console.warn('Playlists data is not an array:', playlists);
      return [];
    }

    return playlists.map((playlist, index) => ({
      id: playlist.id || `playlist-${index}`,
      name: this.cleanText(playlist.name || playlist.title || 'Unknown Playlist'),
      info: `${playlist.songCount || playlist.song_count || 0} songs`,
      cover: this.getBestImageQuality(playlist.image),
      songCount: playlist.songCount || playlist.song_count || 0
    }));
  }

  transformSongData(song) {
    if (!song) return null;
    
    try {
      return {
        id: song.id,
        song: this.cleanText(song.name || song.title || 'Unknown Song'),
        artist: this.extractArtists(song.primaryArtists || song.artists || song.artist),
        cover: this.getBestImageQuality(song.image),
        file: this.extractAudioUrl(song),
        duration: this.formatDuration(song.duration),
        year: song.year || new Date().getFullYear(),
        album: this.cleanText(song.album?.name || 'Unknown Album')
      };
    } catch (error) {
      console.error('Error transforming song data:', error);
      return null;
    }
  }

  extractArtists(artistsData) {
    try {
      if (typeof artistsData === 'string') {
        return this.cleanText(artistsData);
      }
      if (Array.isArray(artistsData)) {
        return artistsData.map(artist => 
          this.cleanText(typeof artist === 'string' ? artist : artist.name || artist.title || 'Unknown')
        ).join(', ');
      }
      if (artistsData && typeof artistsData === 'object') {
        return this.cleanText(artistsData.name || artistsData.title || 'Unknown Artist');
      }
      return 'Unknown Artist';
    } catch (error) {
      console.error('Error extracting artists:', error);
      return 'Unknown Artist';
    }
  }

  extractAudioUrl(song) {
    try {
      // Try different possible audio URL structures
      if (song.downloadUrl) {
        if (Array.isArray(song.downloadUrl)) {
          // Get highest quality available
          const highQuality = song.downloadUrl.find(url => url.quality === '320kbps') ||
                             song.downloadUrl.find(url => url.quality === '160kbps') ||
                             song.downloadUrl[song.downloadUrl.length - 1];
          return highQuality?.link || '';
        }
        return song.downloadUrl;
      }
      
      if (song.media_preview_url) return song.media_preview_url;
      if (song.preview_url) return song.preview_url;
      if (song.stream_url) return song.stream_url;
      
      return ''; // No audio URL available
    } catch (error) {
      console.error('Error extracting audio URL:', error);
      return '';
    }
  }

  formatDuration(duration) {
    try {
      if (!duration) return '0:00';
      if (typeof duration === 'string') return duration;
      
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } catch (error) {
      return '0:00';
    }
  }

  cleanText(text) {
    if (!text) return '';
    return text.replace(/&quot;/g, '"')
               .replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&#39;/g, "'")
               .trim();
  }

  getBestImageQuality(imageUrl) {
    if (!imageUrl) return this.getPlaceholderImage();
    
    try {
      // JioSaavn images come in different qualities, get the highest
      return imageUrl.replace('150x150', '500x500')
                     .replace('50x50', '500x500')
                     .replace('_150.jpg', '_500.jpg');
    } catch (error) {
      return this.getPlaceholderImage();
    }
  }

  getPlaceholderImage() {
    return 'https://via.placeholder.com/300x300/1ed760/000000?text=♪';
  }

  getFallbackSearchResults(query) {
    return [
      {
        id: `search-fallback-1`,
        song: `Search: ${query}`,
        artist: "No results found",
        cover: this.getPlaceholderImage(),
        file: "",
        duration: "0:00",
        year: new Date().getFullYear(),
        album: "Search Results"
      }
    ];
  }

  getFallbackSongs() {
    return [
      {
        id: 'fallback-1',
        song: "Demo Song 1",
        artist: "Demo Artist",
        cover: this.getPlaceholderImage(),
        file: "",
        duration: "3:20",
        year: 2024,
        album: "Demo Album"
      },
      {
        id: 'fallback-2',
        song: "Demo Song 2",
        artist: "Demo Artist",
        cover: this.getPlaceholderImage(),
        file: "",
        duration: "2:45",
        year: 2024,
        album: "Demo Album"
      },
      {
        id: 'fallback-3',
        song: "Demo Song 3",
        artist: "Demo Artist",
        cover: this.getPlaceholderImage(),
        file: "",
        duration: "4:10",
        year: 2024,
        album: "Demo Album"
      }
    ];
  }

  getFallbackPlaylists() {
    return [
      {
        id: 'fallback-playlist-1',
        name: "Demo Playlist 1",
        info: "Demo playlist with sample songs",
        cover: this.getPlaceholderImage(),
        songCount: 30
      },
      {
        id: 'fallback-playlist-2',
        name: "Demo Playlist 2",
        info: "Another demo playlist",
        cover: this.getPlaceholderImage(),
        songCount: 25
      },
      {
        id: 'fallback-playlist-3',
        name: "Demo Playlist 3",
        info: "Third demo playlist",
        cover: this.getPlaceholderImage(),
        songCount: 50
      }
    ];
  }
}

export const musicApi = new MusicApiService();