// Try multiple JioSaavn API endpoints to find working one
const API_ENDPOINTS = [
  'https://jiosaavn-api-2-harsh-patel.vercel.app',
  'https://saavn.me',
  'https://jiosaavn-api.vercel.app',
  'https://jiosaavn-harsh-patel.vercel.app'
];

class MusicApiService {
  constructor() {
    this.currentApiBase = API_ENDPOINTS[0];
    this.workingEndpoint = null;
  }

  async findWorkingEndpoint() {
    if (this.workingEndpoint) {
      return this.workingEndpoint;
    }

    for (const endpoint of API_ENDPOINTS) {
      try {
        console.log(`Testing endpoint: ${endpoint}`);
        const response = await fetch(`${endpoint}/modules?language=hindi`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (response.ok) {
          console.log(`Working endpoint found: ${endpoint}`);
          this.workingEndpoint = endpoint;
          this.currentApiBase = endpoint;
          return endpoint;
        }
      } catch (error) {
        console.log(`Endpoint ${endpoint} failed:`, error.message);
        continue;
      }
    }
    
    throw new Error('No working JioSaavn API endpoint found');
  }

  async makeRequest(endpoint) {
    try {
      // Ensure we have a working endpoint
      await this.findWorkingEndpoint();
      
      const url = `${this.currentApiBase}${endpoint}`;
      console.log(`Making request to: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
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
      
      // Handle different response structures
      let songs = [];
      if (data.data?.results) {
        songs = data.data.results;
      } else if (data.results) {
        songs = data.results;
      } else if (Array.isArray(data.data)) {
        songs = data.data;
      } else if (Array.isArray(data)) {
        songs = data;
      }
      
      console.log('Search songs found:', songs.length);
      return this.transformSongsData(songs);
    } catch (error) {
      console.error('Error searching songs:', error);
      return [];
    }
  }

  async getTopSongs(limit = 10) {
    try {
      // Try different endpoints for trending songs
      let data;
      try {
        data = await this.makeRequest('/modules?language=hindi');
      } catch (error) {
        console.log('Modules endpoint failed, trying search fallback');
        return this.searchSongs('bollywood hits 2024', limit);
      }
      
      let songs = [];
      
      // Extract songs from different possible structures
      if (data.data) {
        if (data.data.trending?.songs) {
          songs = data.data.trending.songs;
        } else if (data.data.charts) {
          songs = data.data.charts;
        } else if (data.data.albums) {
          // Get songs from first album
          const firstAlbum = data.data.albums[0];
          if (firstAlbum?.songs) {
            songs = firstAlbum.songs;
          }
        }
      }
      
      if (songs.length === 0) {
        console.log('No trending songs found, using search fallback');
        return this.searchSongs('hindi songs 2024', limit);
      }
      
      console.log('Top songs found:', songs.length);
      return this.transformSongsData(songs.slice(0, limit));
    } catch (error) {
      console.error('Error fetching top songs:', error);
      return this.searchSongs('bollywood hits', limit);
    }
  }

  async getPopularPlaylists(limit = 10) {
    try {
      const endpoint = `/search/playlists?query=bollywood&page=1&limit=${limit}`;
      const data = await this.makeRequest(endpoint);
      
      let playlists = [];
      if (data.data?.results) {
        playlists = data.data.results;
      } else if (data.results) {
        playlists = data.results;
      } else if (Array.isArray(data.data)) {
        playlists = data.data;
      }
      
      console.log('Playlists found:', playlists.length);
      return this.transformPlaylistsData(playlists);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      // Return mock playlists if API fails
      return this.getMockPlaylists();
    }
  }

  async getRecommendedSongs(limit = 10) {
    try {
      return this.searchSongs('latest bollywood songs', limit);
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
        const songName = this.cleanText(song.name || song.title || song.song || 'Unknown Song');
        const artistName = this.extractArtists(song.primaryArtists || song.artists || song.artist || song.singers);
        
        return {
          id: song.id || `song-${Date.now()}-${index}`,
          song: songName,
          artist: artistName,
          cover: this.getBestImageQuality(song.image),
          file: this.extractAudioUrl(song),
          duration: this.formatDuration(song.duration),
          year: song.year || new Date().getFullYear(),
          album: this.cleanText(song.album?.name || song.album || 'Unknown Album')
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
      id: playlist.id || `playlist-${Date.now()}-${index}`,
      name: this.cleanText(playlist.name || playlist.title || 'Unknown Playlist'),
      info: `${playlist.songCount || playlist.song_count || playlist.songs?.length || 0} songs`,
      cover: this.getBestImageQuality(playlist.image),
      songCount: playlist.songCount || playlist.song_count || playlist.songs?.length || 0
    }));
  }

  extractArtists(artistsData) {
    try {
      if (!artistsData) return 'Unknown Artist';
      
      if (typeof artistsData === 'string') {
        return this.cleanText(artistsData);
      }
      
      if (Array.isArray(artistsData)) {
        return artistsData.map(artist => {
          if (typeof artist === 'string') return this.cleanText(artist);
          if (artist && typeof artist === 'object') {
            return this.cleanText(artist.name || artist.title || 'Unknown');
          }
          return 'Unknown';
        }).join(', ');
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
      // Try different possible audio URL fields
      const possibleUrls = [
        song.downloadUrl,
        song.download_url,
        song.media_preview_url,
        song.preview_url,
        song.stream_url,
        song.url,
        song.link
      ];

      for (const urlField of possibleUrls) {
        if (!urlField) continue;
        
        if (Array.isArray(urlField)) {
          // Get highest quality available
          const highQuality = urlField.find(url => url.quality === '320kbps') ||
                             urlField.find(url => url.quality === '160kbps') ||
                             urlField.find(url => url.quality === '96kbps') ||
                             urlField[0];
          
          if (highQuality) {
            return highQuality.link || highQuality.url || highQuality;
          }
        } else if (typeof urlField === 'string') {
          return urlField;
        } else if (urlField && typeof urlField === 'object') {
          return urlField.link || urlField.url || '';
        }
      }
      
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
               .replace(/&nbsp;/g, ' ')
               .trim();
  }

  getBestImageQuality(imageUrl) {
    if (!imageUrl) return this.getPlaceholderImage();
    
    try {
      // JioSaavn images come in different qualities, get the highest
      return imageUrl.replace('150x150', '500x500')
                     .replace('50x50', '500x500')
                     .replace('_150.jpg', '_500.jpg')
                     .replace('_150.webp', '_500.webp');
    } catch (error) {
      return this.getPlaceholderImage();
    }
  }

  getPlaceholderImage() {
    return 'https://via.placeholder.com/300x300/1ed760/000000?text=♪';
  }

  getMockPlaylists() {
    return [
      {
        id: 'mock-1',
        name: 'Bollywood Hits',
        info: '50 songs',
        cover: this.getPlaceholderImage(),
        songCount: 50
      },
      {
        id: 'mock-2',
        name: 'Latest Hindi Songs',
        info: '30 songs',
        cover: this.getPlaceholderImage(),
        songCount: 30
      },
      {
        id: 'mock-3',
        name: 'Romantic Songs',
        info: '40 songs',
        cover: this.getPlaceholderImage(),
        songCount: 40
      }
    ];
  }
}

export const musicApi = new MusicApiService();