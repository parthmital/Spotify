const JIOSAAVN_API_BASE = 'https://jiosaavn-api-2-harsh-patel.vercel.app';

class MusicApiService {
  async searchSongs(query, limit = 10) {
    try {
      const response = await fetch(`${JIOSAAVN_API_BASE}/search/songs?query=${encodeURIComponent(query)}&page=1&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch songs');
      const data = await response.json();
      return this.transformSongsData(data.data?.results || []);
    } catch (error) {
      console.error('Error searching songs:', error);
      return [];
    }
  }

  async getTopSongs(limit = 10) {
    try {
      // Get trending songs
      const response = await fetch(`${JIOSAAVN_API_BASE}/search/songs?query=trending&page=1&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch top songs');
      const data = await response.json();
      return this.transformSongsData(data.data?.results || []);
    } catch (error) {
      console.error('Error fetching top songs:', error);
      return this.getFallbackSongs();
    }
  }

  async getPopularPlaylists(limit = 10) {
    try {
      const response = await fetch(`${JIOSAAVN_API_BASE}/search/playlists?query=bollywood&page=1&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch playlists');
      const data = await response.json();
      return this.transformPlaylistsData(data.data?.results || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      return this.getFallbackPlaylists();
    }
  }

  async getRecommendedSongs(limit = 10) {
    try {
      const queries = ['hindi hits', 'punjabi songs', 'english songs', 'tamil hits'];
      const randomQuery = queries[Math.floor(Math.random() * queries.length)];
      const response = await fetch(`${JIOSAAVN_API_BASE}/search/songs?query=${randomQuery}&page=1&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch recommended songs');
      const data = await response.json();
      return this.transformSongsData(data.data?.results || []);
    } catch (error) {
      console.error('Error fetching recommended songs:', error);
      return this.getFallbackSongs();
    }
  }

  async getSongDetails(songId) {
    try {
      const response = await fetch(`${JIOSAAVN_API_BASE}/songs?id=${songId}`);
      if (!response.ok) throw new Error('Failed to fetch song details');
      const data = await response.json();
      return this.transformSongData(data.data?.[0]);
    } catch (error) {
      console.error('Error fetching song details:', error);
      return null;
    }
  }

  transformSongsData(songs) {
    return songs.map(song => ({
      id: song.id,
      song: song.name || song.title || 'Unknown Song',
      artist: this.extractArtists(song.primaryArtists || song.artists),
      cover: this.getBestImageQuality(song.image),
      file: song.downloadUrl?.[4]?.link || song.downloadUrl?.[3]?.link || song.downloadUrl?.[2]?.link || '',
      duration: song.duration || '0:00',
      year: song.year || new Date().getFullYear(),
      album: song.album?.name || 'Unknown Album'
    }));
  }

  transformPlaylistsData(playlists) {
    return playlists.map(playlist => ({
      id: playlist.id,
      name: playlist.name || playlist.title || 'Unknown Playlist',
      info: `${playlist.songCount || 0} songs`,
      cover: this.getBestImageQuality(playlist.image),
      songCount: playlist.songCount || 0
    }));
  }

  transformSongData(song) {
    if (!song) return null;
    return {
      id: song.id,
      song: song.name || song.title || 'Unknown Song',
      artist: this.extractArtists(song.primaryArtists || song.artists),
      cover: this.getBestImageQuality(song.image),
      file: song.downloadUrl?.[4]?.link || song.downloadUrl?.[3]?.link || song.downloadUrl?.[2]?.link || '',
      duration: song.duration || '0:00',
      year: song.year || new Date().getFullYear(),
      album: song.album?.name || 'Unknown Album'
    };
  }

  extractArtists(artistsData) {
    if (typeof artistsData === 'string') return artistsData;
    if (Array.isArray(artistsData)) {
      return artistsData.map(artist => artist.name || artist).join(', ');
    }
    return 'Unknown Artist';
  }

  getBestImageQuality(imageUrl) {
    if (!imageUrl) return 'https://via.placeholder.com/300x300?text=No+Image';
    // JioSaavn images come in different qualities, get the highest
    return imageUrl.replace('150x150', '500x500').replace('50x50', '500x500');
  }

  getFallbackSongs() {
    return [
      {
        id: 'fallback-1',
        song: "Blinding Lights",
        artist: "The Weeknd",
        cover: "https://via.placeholder.com/300x300?text=Blinding+Lights",
        file: "",
        duration: "3:20",
        year: 2019,
        album: "After Hours"
      },
      {
        id: 'fallback-2',
        song: "Stay",
        artist: "The Kid LAROI, Justin Bieber",
        cover: "https://via.placeholder.com/300x300?text=Stay",
        file: "",
        duration: "2:21",
        year: 2021,
        album: "F*CK LOVE 3: OVER YOU"
      },
      {
        id: 'fallback-3',
        song: "good 4 u",
        artist: "Olivia Rodrigo",
        cover: "https://via.placeholder.com/300x300?text=good+4+u",
        file: "",
        duration: "2:58",
        year: 2021,
        album: "SOUR"
      }
    ];
  }

  getFallbackPlaylists() {
    return [
      {
        id: 'fallback-playlist-1',
        name: "Discover Weekly",
        info: "Your weekly mixtape of fresh music",
        cover: "https://via.placeholder.com/300x300?text=Discover+Weekly",
        songCount: 30
      },
      {
        id: 'fallback-playlist-2',
        name: "Release Radar",
        info: "Catch all the latest releases",
        cover: "https://via.placeholder.com/300x300?text=Release+Radar",
        songCount: 25
      },
      {
        id: 'fallback-playlist-3',
        name: "Daily Mix 1",
        info: "Made for your listening habits",
        cover: "https://via.placeholder.com/300x300?text=Daily+Mix+1",
        songCount: 50
      }
    ];
  }
}

export const musicApi = new MusicApiService();