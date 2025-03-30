import React, { useState, useEffect, useRef, useCallback } from 'react';
import { musicDatabase, CONFIG } from './musicData';
import Album from './components/Album';
import PlaylistType from './components/PlaylistType';
import Player from './components/Player';
import NavBar from './components/NavBar';
import './App.css';

const App = () => {
  // State management
  const [currentTrack, setCurrentTrack] = useState(musicDatabase.currentlyPlaying);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [progress, setProgress] = useState(0);
  const [currentHue, setCurrentHue] = useState(CONFIG.defaultHue);
  const [recentlyPlayed, setRecentlyPlayed] = useState(musicDatabase.recentlyPlayed);

  // Refs
  const audioPlayerRef = useRef(new Audio());
  const isMountedRef = useRef(true);

  // Color conversion and background update
  const hslToHex = useCallback((h, s, l) => {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }, []);

  const updateBackgroundColor = useCallback((hue) => {
    const hexColor = hslToHex(hue, 100, 50);
    const accentColor = hslToHex(hue, 80, 50);
    document.body.style.background = `
      linear-gradient(180deg, rgba(0, 0, 0, 0.75) 0%, #000 100%),
      linear-gradient(0deg, ${hexColor} 0%, ${hexColor} 100%)
    `;
    document.documentElement.style.setProperty('--accent-color', accentColor);
  }, [hslToHex]);

  // Time formatting
  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }, []);

  // Playback control functions
  const updateTimeDisplay = useCallback(() => {
    const audioPlayer = audioPlayerRef.current;
    if (audioPlayer.duration && !isNaN(audioPlayer.duration)) {
      setDuration(formatTime(audioPlayer.duration));
    }
    setCurrentTime(formatTime(audioPlayer.currentTime));
  }, [formatTime]);

  const updatePlayBar = useCallback(() => {
    const audioPlayer = audioPlayerRef.current;
    if (audioPlayer.duration && !isNaN(audioPlayer.duration)) {
      const percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      setProgress(percentage);
      updateTimeDisplay();
    }
  }, [updateTimeDisplay]);

  const updateRecentlyPlayed = useCallback((track) => {
    setRecentlyPlayed(prev => {
      const updated = prev.filter(t => t.file !== track.file);
      updated.unshift(track);
      return updated.length > 10 ? updated.slice(0, 10) : updated;
    });
  }, []);

  const playTrack = useCallback(async (track) => {
    try {
      const audioPlayer = audioPlayerRef.current;

      // Toggle pause if same track is playing
      if (currentTrack?.file === track.file && isPlaying) {
        await audioPlayer.pause();
        return;
      }

      // Load new track
      audioPlayer.src = track.file;
      await audioPlayer.play();

      // Update state
      if (isMountedRef.current) {
        setCurrentTrack(track);
        setIsPlaying(true);
        updateRecentlyPlayed(track);
        setProgress(0);
        setCurrentTime('0:00');
      }
    } catch (error) {
      console.error("Playback error:", error);
      if (isMountedRef.current) {
        setIsPlaying(false);
      }
    }
  }, [currentTrack, isPlaying, updateRecentlyPlayed]);

  const handlePlayPause = useCallback(async () => {
    try {
      const audioPlayer = audioPlayerRef.current;

      if (isPlaying) {
        await audioPlayer.pause();
      } else {
        if (currentTrack) {
          await audioPlayer.play();
        } else {
          await playTrack(musicDatabase.currentlyPlaying);
          return;
        }
      }

      if (isMountedRef.current) {
        setIsPlaying(!isPlaying);
      }
    } catch (error) {
      console.error("Playback error:", error);
      if (isMountedRef.current) {
        setIsPlaying(false);
      }
    }
  }, [isPlaying, currentTrack, playTrack]);

  const handlePlayBarClick = useCallback((e) => {
    const audioPlayer = audioPlayerRef.current;
    if (!audioPlayer.duration) return;

    const clientX = e.clientX || (e.touches?.[0]?.clientX);
    if (!clientX) return;

    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const clickPosition = clientX - rect.left;
    const percentageClicked = clickPosition / rect.width;

    audioPlayer.currentTime = percentageClicked * audioPlayer.duration;
    if (!isPlaying && isMountedRef.current) {
      audioPlayer.play().then(() => {
        if (isMountedRef.current) {
          setIsPlaying(true);
        }
      });
    }
  }, [isPlaying]);

  const handleHueChange = useCallback(() => {
    const newHue = (currentHue + 30) % 360;
    setCurrentHue(newHue);
    updateBackgroundColor(newHue);
  }, [currentHue, updateBackgroundColor]);

  // Effect for setting up audio and scroll listeners
  useEffect(() => {
    isMountedRef.current = true;
    const audioPlayer = audioPlayerRef.current;

    // Audio event handlers
    const handleAudioPlay = () => isMountedRef.current && setIsPlaying(true);
    const handleAudioPause = () => isMountedRef.current && setIsPlaying(false);
    const handleAudioEnded = () => {
      if (isMountedRef.current) {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime('0:00');
      }
    };

    // Mouse wheel scroll handler
    const handleWheelScroll = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        e.currentTarget.scrollLeft += e.deltaY;
      }
    };

    // Set up event listeners
    audioPlayer.addEventListener('play', handleAudioPlay);
    audioPlayer.addEventListener('pause', handleAudioPause);
    audioPlayer.addEventListener('ended', handleAudioEnded);
    audioPlayer.addEventListener('timeupdate', updatePlayBar);
    audioPlayer.addEventListener('loadedmetadata', updateTimeDisplay);

    const scrollContainers = document.querySelectorAll('.RecentlyPlayed, .Playlists');
    scrollContainers.forEach(container => {
      container.addEventListener('wheel', handleWheelScroll, { passive: false });
    });

    // Initial setup
    updateBackgroundColor(currentHue);

    // Cleanup
    return () => {
      isMountedRef.current = false;

      audioPlayer.removeEventListener('play', handleAudioPlay);
      audioPlayer.removeEventListener('pause', handleAudioPause);
      audioPlayer.removeEventListener('ended', handleAudioEnded);
      audioPlayer.removeEventListener('timeupdate', updatePlayBar);
      audioPlayer.removeEventListener('loadedmetadata', updateTimeDisplay);

      scrollContainers.forEach(container => {
        container.removeEventListener('wheel', handleWheelScroll);
      });

      if (!audioPlayer.paused) {
        audioPlayer.pause();
      }
    };
  }, [currentHue, updateBackgroundColor, updatePlayBar, updateTimeDisplay]);

  return (
    <div className="HomePage">
      <div className="Top">
        <div className="TopTop">
          <div className="SearchBar">
            <input type="text" className="SearchInput" placeholder="What do you want to play?" />
            <div className="SearchIconFrame">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
                <path d="M14.415 14.8043C15.7989 13.3927 16.6522 11.4591 16.6522 9.32609C16.6522 5.00386 13.1483 1.5 8.82609 1.5C4.50386 1.5 1 5.00386 1 9.32609C1 13.6483 4.50386 17.1522 8.82609 17.1522C11.0154 17.1522 12.9947 16.2532 14.415 14.8043ZM14.415 14.8043L19 19.5" stroke="#898989" strokeOpacity="0.5" strokeWidth="1.77054" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <div className="FilterFrame">
            <div className="Filters">
              <button className="FilterButton">Music</button>
              <button className="FilterButton">Podcasts</button>
              <button className="FilterButton">Audiobooks</button>
            </div>
            <div className="LibraryIconFrame">
              <div className="HueSliderButton" onClick={handleHueChange}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
                  <path d="M9 14.3C11.651 14.3 13.8 12.151 13.8 9.5C13.8 6.84903 11.651 4.7 9 4.7C6.34903 4.7 4.2 6.84903 4.2 9.5C4.2 12.151 6.34903 14.3 9 14.3Z" stroke="#898989" strokeWidth="1.66667" />
                  <path d="M9 17.5C13.4182 17.5 17 13.9182 17 9.5C17 5.08172 13.4182 1.5 9 1.5C4.58172 1.5 1 5.08172 1 9.5C1 13.9182 4.58172 17.5 9 17.5Z" stroke="#898989" strokeWidth="1.66667" />
                  <path d="M9 11.9C10.3255 11.9 11.4 10.8255 11.4 9.5C11.4 8.17448 10.3255 7.1 9 7.1C7.67448 7.1 6.6 8.17448 6.6 9.5C6.6 10.8255 7.67448 11.9 9 11.9Z" stroke="#898989" strokeWidth="1.66667" />
                </svg>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="21" height="19" viewBox="0 0 21 19" fill="none">
                <path d="M10 2.48577H3C1.89543 2.48577 1 3.36846 1 4.45731C1 5.54616 1.89543 6.42885 3 6.42885H10M11 16.5142L18 16.5142C19.1046 16.5142 20 15.6315 20 14.5427C20 13.4538 19.1046 12.5711 18 12.5711L11 12.5711M16.8846 7.64211C15.164 7.64211 13.7692 6.26715 13.7692 4.57105C13.7692 2.87496 15.164 1.5 16.8846 1.5C18.6052 1.5 20 2.87496 20 4.57105C20 6.26715 18.6052 7.64211 16.8846 7.64211ZM4.11539 11.3579C5.83596 11.3579 7.23077 12.7328 7.23077 14.4289C7.23077 16.125 5.83596 17.5 4.11538 17.5C2.3948 17.5 1 16.125 1 14.4289C1 12.7328 2.39481 11.3579 4.11539 11.3579Z" stroke="#898989" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <div className="RecentlyPlayed">
            {recentlyPlayed.map((track, index) => (
              <Album
                key={index}
                track={track}
                isPlaying={isPlaying && currentTrack?.file === track.file}
                onClick={playTrack}
              />
            ))}
          </div>
        </div>
        <div className="Middle">
          <PlaylistType title="Made For You" playlists={musicDatabase.sharedPlaylists} />
          <PlaylistType title="Popular Playlists" playlists={musicDatabase.sharedPlaylists} />
          <PlaylistType title="Recommended" playlists={musicDatabase.sharedPlaylists} />
        </div>
      </div>
      <div className="Bottom">
        <Player
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          progress={progress}
          onPlayPause={handlePlayPause}
          onNext={() => { }}
          onPrevious={() => { }}
          onPlayBarClick={handlePlayBarClick}
        />
        <NavBar />
      </div>
    </div>
  );
};

export default App;