const JIOSAAVN_API_BASE = 'https://jiosaavn-api-2-harsh-patel.vercel.app';

class MusicApiService {
  constructor() {
    this.currentApiBase = JIOSAAVN_API_BASE;
  }

  async makeRequest(endpoint) {
    try {
      console.log(`Making request to: ${this.currentApiBase}${endpoint}`);
      
      const response = await fetch(`${this.currentApiBase}${endpoint}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      return data;
      
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async searchSongs(query, limit = 10) {
    try {
      const endpoint = `/search/songs?query=${encodeURIComponent(query)}&page=1&limit=${limit}`;
      const data = await this.makeRequest(endpoint);
      
      // JioSaavn API returns data in data.results format
      const songs = data.data?.results || [];
      return this.transformSongsData(songs);
    } catch (error) {
      console.error('Error searching songs:', error);
      return [];
    }
  }

  async getTopSongs(limit = 10) {
    try {
      // Use trending endpoint
      const endpoint = `/modules?language=hindi`;
      const data = await this.makeRequest(endpoint);
      
      // Extract songs from trending modules
      let songs = [];
      if (data.data?.trending) {
        songs = data.data.trending.slice(0, limit);
      } else if (data.data?.charts) {
        songs = data.data.charts.slice(0, limit);
      }
      
      return this.transformSongsData(songs);
    } catch (error) {
      console.error('Error fetching top songs:', error);
      // Fallback to search
      return this.searchSongs('hindi hits', limit);
    }
  }

  async getPopularPlaylists(limit = 10) {
    try {
      const endpoint = `/search/playlists?query=bollywood&page=1&limit=${limit}`;
      const data = await this.makeRequest(endpoint);
      
      const playlists = data.data?.results || [];
      return this.transformPlaylistsData(playlists);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      return [];
    }
  }

  async getRecommendedSongs(limit = 10) {
    try {
      return this.searchSongs('latest hindi songs', limit);
    } catch (error) {
      console.error('Error fetching recommended songs:', error);
      return [];
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
        return null;
      }
    }).filter(Boolean);
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

  extractArtists(artistsData) {
    try {
      if (typeof artistsData === 'string') {
        return this.cleanText(artistsData);
      }
      if (Array.isArray(artistsData)) {
        return artistsData.map(artist => 
          this.cleanText(typeof artist === 'string' ? artist : artist.name || 'Unknown')
        ).join(', ');
      }
      if (artistsData && typeof artistsData === 'object') {
        return this.cleanText(artistsData.name || 'Unknown Artist');
      }
      return 'Unknown Artist';
    } catch (error) {
      console.error('Error extracting artists:', error);
      return 'Unknown Artist';
    }
  }

  extractAudioUrl(song) {
    try {
      // JioSaavn API structure for download URLs
      if (song.downloadUrl) {
        if (Array.isArray(song.downloadUrl)) {
          // Get highest quality available
          const highQuality = song.downloadUrl.find(url => url.quality === '320kbps') ||
                             song.downloadUrl.find(url => url.quality === '160kbps') ||
                             song.downloadUrl.find(url => url.quality === '96kbps') ||
                             song.downloadUrl[0];
          return highQuality?.link || highQuality?.url || '';
        }
        return song.downloadUrl;
      }
      
      // Alternative URL fields
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
}

export const musicApi = new MusicApiService();