import { useEffect, useRef, useState } from 'react';
import './App.css';
import { CONFIG } from '@/constants/config';
import Album from '@/components/Album';
import Playlist from '@/components/Playlist';
import PlayBar from '@/components/PlayBar';
function App() {
  const sanitize = str => str.replace(/[^a-z0-9\- ]/gi, '').trim();
  const createPlaylistData = (name, info, coverIndex) => ({
    name,
    info,
    cover: `${CONFIG.paths.images}${coverIndex}.jpeg`
  });
  const createTrackData = (song, artist, coverFile) => {
    const fileName = song.includes(" - ") ? song : `${artist.split(',')[0]} - ${song}`;
    const safeFileName = sanitize(fileName);
    return {
      song, artist,
      cover: `${CONFIG.paths.images}${coverFile}`,
      file: `${CONFIG.paths.songs}${safeFileName}.mp3`
    };
  };
  const [musicDatabase] = useState({
    sharedPlaylists: [...Array(10)].map((_, i) => createPlaylistData(
      ["Discover Weekly", "Release Radar", "Daily Mix 1", "Time Capsule", "On Repeat", "Repeat Rewind", "Your Top Mix", "Chill Mix", "Focus Mix", "Energy Boost"][i],
      ["Your weekly mixtape of fresh music", "Catch all the latest releases", "Made for your listening habits", "Songs from your past", "Songs you can't stop playing", "Your recent favorites", "Your most played tracks", "Your relaxing favorites", "Music to concentrate to", "Get pumped with these tracks"][i],
      i + 1
    )),
    recentlyPlayed: [
      createTrackData("Blinding Lights", "The Weeknd", "blinding-lights.jpg"),
      createTrackData("Stay", "The Kid LAROI, Justin Bieber", "stay.jpg"),
      createTrackData("good 4 u", "Olivia Rodrigo", "good-4-u.jpg"),
      createTrackData("Levitating", "Dua Lipa", "levitating.jpg"),
      createTrackData("Montero", "Lil Nas X", "montero.jpg"),
      createTrackData("Peaches", "Justin Bieber", "peaches.jpg"),
      createTrackData("Kiss Me More", "Doja Cat ft. SZA", "kiss-me-more.jpg"),
      createTrackData("Butter", "BTS", "butter.jpg"),
      createTrackData("Save Your Tears", "The Weeknd", "save-your-tears.jpg"),
      createTrackData("Deja Vu", "Olivia Rodrigo", "deja-vu.jpg")
    ],
    get currentlyPlaying() { return this.recentlyPlayed[0]; }
  });
  const [playerState, setPlayerState] = useState({
    currentTrack: null,
    isPlaying: false,
    isDragging: false,
    currentHue: CONFIG.defaultHue,
    progress: 0,
    currentTime: '0:00',
    duration: '0:00'
  });
  const [recentlyPlayed, setRecentlyPlayed] = useState(musicDatabase.recentlyPlayed);
  const [nowPlaying, setNowPlaying] = useState(musicDatabase.currentlyPlaying);
  const audioRef = useRef(new Audio());
  const scrollContainersRef = useRef([]);
  const hslToHex = (h, s, l) => {
    h /= 360; s /= 100; l /= 100;
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
    const r = hue2rgb(p, q, h + 1 / 3);
    const g = hue2rgb(p, q, h);
    const b = hue2rgb(p, q, h - 1 / 3);
    const toHex = x => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  };
  const updateBackgroundColor = (hue) => {
    const hexColor = hslToHex(hue, 100, 50);
    const accentColor = hslToHex(hue, 80, 50);
    document.body.style.background = `linear-gradient(180deg, rgba(0, 0, 0, 0.75) 0%, #000 100%), linear-gradient(0deg, ${hexColor} 0%, ${hexColor} 100%)`;
    document.documentElement.style.setProperty('--accent-color', accentColor);
  };
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  const updateTimeDisplay = () => {
    const audio = audioRef.current;
    if (audio.duration && !isNaN(audio.duration)) {
      setPlayerState(prev => ({
        ...prev,
        duration: formatTime(audio.duration),
        currentTime: formatTime(audio.currentTime)
      }));
    }
  };
  const updatePlayBar = () => {
    const audio = audioRef.current;
    if (audio.duration && !isNaN(audio.duration)) {
      const percentage = (audio.currentTime / audio.duration) * 100;
      setPlayerState(prev => ({ ...prev, progress: percentage }));
      updateTimeDisplay();
    }
  };
  const updateRecentlyPlayed = (track) => {
    const updated = recentlyPlayed.filter(t => t.file !== track.file);
    updated.unshift(track);
    if (updated.length > 10) updated.pop();
    setRecentlyPlayed(updated);
    setNowPlaying(track);
  };
  const playTrack = (track) => {
    try {
      const audio = audioRef.current;
      if (playerState.currentTrack === track.file) {
        if (playerState.isPlaying) {
          audio.pause();
          setPlayerState(prev => ({ ...prev, isPlaying: false }));
        } else {
          audio.play();
          setPlayerState(prev => ({ ...prev, isPlaying: true }));
        }
        return;
      }
      audio.src = track.file;
      audio.play().then(() => {
        setPlayerState(prev => ({
          ...prev,
          currentTrack: track.file,
          isPlaying: true,
          progress: 0,
          currentTime: '0:00'
        }));
        setNowPlaying(track);
        updateRecentlyPlayed(track);
      }).catch((err) => {
        console.error("Playback failed:", err);
        alert("⚠️ Failed to play this track. The audio file might be missing or blocked.");
      });
    } catch (error) {
      console.error("Audio error:", error);
    }
  };
  const handlePlayBarClick = (e) => {
    const audio = audioRef.current;
    if (!audio.duration) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    if (!clientX) return;
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const percentageClicked = (clientX - rect.left) / rect.width;
    audio.currentTime = percentageClicked * audio.duration;
    if (!playerState.isPlaying) {
      audio.play();
      setPlayerState(prev => ({ ...prev, isPlaying: true }));
    }
  };
  const handleHueChange = () => {
    const newHue = (playerState.currentHue + 30) % 360;
    setPlayerState(prev => ({ ...prev, currentHue: newHue }));
    updateBackgroundColor(newHue);
  };
  const handlePause = () => {
    audioRef.current.pause();
    setPlayerState(prev => ({ ...prev, isPlaying: false }));
  };
  const handlePlay = () => {
    if (playerState.currentTrack) {
      if (!playerState.isPlaying) {
        audioRef.current.play();
        setPlayerState(prev => ({ ...prev, isPlaying: true }));
      }
    } else {
      playTrack(musicDatabase.currentlyPlaying);
    }
  };
  useEffect(() => {
    updateBackgroundColor(playerState.currentHue);
    const audio = audioRef.current;
    const handleEnded = () => setPlayerState(prev => ({ ...prev, isPlaying: false }));
    audio.addEventListener('timeupdate', updatePlayBar);
    audio.addEventListener('loadedmetadata', updateTimeDisplay);
    audio.addEventListener('ended', handleEnded);
    const scrollContainers = document.querySelectorAll('.RecentlyPlayed, .Playlists');
    scrollContainersRef.current = scrollContainers;
    const handleWheel = function (e) {
      e.preventDefault();
      this.scrollLeft += e.deltaY;
    };
    scrollContainers.forEach(container => {
      container.addEventListener('wheel', handleWheel, { passive: false });
    });
    const handleTouchEnd = () => {
      setPlayerState(prev => ({ ...prev, isDragging: false }));
      const bar = document.querySelector('.PlayBar');
      if (bar) bar.style.setProperty('--playhead-opacity', '0');
    };
    document.addEventListener('touchend', handleTouchEnd);
    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', updatePlayBar);
      audio.removeEventListener('loadedmetadata', updateTimeDisplay);
      audio.removeEventListener('ended', handleEnded);
      scrollContainers.forEach(container => {
        container.removeEventListener('wheel', handleWheel);
      });
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);
  useEffect(() => {
    if (nowPlaying?.song && nowPlaying?.artist) {
      document.title = `${nowPlaying.song} · ${nowPlaying.artist}`;
    } else {
      document.title = 'Spotify Clone';
    }
  }, [nowPlaying]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        playerState.isPlaying ? handlePause() : handlePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [playerState.isPlaying]);
  return (
    <div className="HomePage">
      <div className="Top">
        <div className="TopTop">
          <div className="SearchBar">
            <input
              type="text"
              className="SearchInput"
              placeholder="What do you want to play?"
            />
            <div className="SearchIconFrame">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={20}
                height={21}
                viewBox="0 0 20 21"
                fill="none"
              >
                <path
                  d="M14.415 14.8043C15.7989 13.3927 16.6522 11.4591 16.6522 9.32609C16.6522 5.00386 13.1483 1.5 8.82609 1.5C4.50386 1.5 1 5.00386 1 9.32609C1 13.6483 4.50386 17.1522 8.82609 17.1522C11.0154 17.1522 12.9947 16.2532 14.415 14.8043ZM14.415 14.8043L19 19.5"
                  stroke="#898989"
                  strokeOpacity="0.5"
                  strokeWidth="1.77054"
                  strokeLinecap="round"
                />
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={19}
                  viewBox="0 0 18 19"
                  fill="none"
                >
                  <path
                    d="M9 14.3C11.651 14.3 13.8 12.151 13.8 9.5C13.8 6.84903 11.651 4.7 9 4.7C6.34903 4.7 4.2 6.84903 4.2 9.5C4.2 12.151 6.34903 14.3 9 14.3Z"
                    stroke="#898989"
                    strokeWidth="1.66667"
                  />
                  <path
                    d="M9 17.5C13.4182 17.5 17 13.9182 17 9.5C17 5.08172 13.4182 1.5 9 1.5C4.58172 1.5 1 5.08172 1 9.5C1 13.9182 4.58172 17.5 9 17.5Z"
                    stroke="#898989"
                    strokeWidth="1.66667"
                  />
                  <path
                    d="M9 11.9C10.3255 11.9 11.4 10.8255 11.4 9.5C11.4 8.17448 10.3255 7.1 9 7.1C7.67448 7.1 6.6 8.17448 6.6 9.5C6.6 10.8255 7.67448 11.9 9 11.9Z"
                    stroke="#898989"
                    strokeWidth="1.66667"
                  />
                </svg>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={21}
                height={19}
                viewBox="0 0 21 19"
                fill="none"
              >
                <path
                  d="M10 2.48577H3C1.89543 2.48577 1 3.36846 1 4.45731C1 5.54616 1.89543 6.42885 3 6.42885H10M11 16.5142L18 16.5142C19.1046 16.5142 20 15.6315 20 14.5427C20 13.4538 19.1046 12.5711 18 12.5711L11 12.5711M16.8846 7.64211C15.164 7.64211 13.7692 6.26715 13.7692 4.57105C13.7692 2.87496 15.164 1.5 16.8846 1.5C18.6052 1.5 20 2.87496 20 4.57105C20 6.26715 18.6052 7.64211 16.8846 7.64211ZM4.11539 11.3579C5.83596 11.3579 7.23077 12.7328 7.23077 14.4289C7.23077 16.125 5.83596 17.5 4.11538 17.5C2.3948 17.5 1 16.125 1 14.4289C1 12.7328 2.39481 11.3579 4.11539 11.3579Z"
                  stroke="#898989"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <div className="RecentlyPlayed" id="recentlyPlayed">
            {recentlyPlayed.map(track => (
              <Album
                key={track.file}
                track={track}
                isPlaying={playerState.currentTrack === track.file && playerState.isPlaying}
                onClick={() => playTrack(track)}
              />
            ))}
          </div>
        </div>
        <div className="Middle">
          <div className="PlaylistType">
            <div className="MadeForYouFrame">
              Made For You
              <div className="InfoIconFrame">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={21}
                  height={4}
                  viewBox="0 0 21 4"
                  fill="none"
                >
                  <path
                    d="M4.16225 2.00001C4.16225 2.92994 3.40839 3.68379 2.47846 3.68379C1.54853 3.68379 0.794678 2.92994 0.794678 2.00001C0.794678 1.07008 1.54853 0.316223 2.47846 0.316223C3.40839 0.316223 4.16225 1.07008 4.16225 2.00001Z"
                    fill="#898989"
                  />
                  <path
                    d="M12.5812 2.00001C12.5812 2.92994 11.8273 3.68379 10.8974 3.68379C9.96747 3.68379 9.21361 2.92994 9.21361 2.00001C9.21361 1.07008 9.96747 0.316223 10.8974 0.316223C11.8273 0.316223 12.5812 1.07008 12.5812 2.00001Z"
                    fill="#898989"
                  />
                  <path
                    d="M21 2.00001C21 2.92994 20.2461 3.68379 19.3162 3.68379C18.3863 3.68379 17.6324 2.92994 17.6324 2.00001C17.6324 1.07008 18.3863 0.316223 19.3162 0.316223C20.2461 0.316223 21 1.07008 21 2.00001Z"
                    fill="#898989"
                  />
                </svg>
              </div>
            </div>
            <div className="Playlists" id="madeForYouPlaylists">
              {musicDatabase.sharedPlaylists.map(playlist => (
                <Playlist key={playlist.name} playlist={playlist} />
              ))}
            </div>
          </div>
          <div className="PlaylistType">
            <div className="MadeForYouFrame">
              Popular Playlists
              <div className="InfoIconFrame">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={21}
                  height={4}
                  viewBox="0 0 21 4"
                  fill="none"
                >
                  <path
                    d="M4.16225 2.00001C4.16225 2.92994 3.40839 3.68379 2.47846 3.68379C1.54853 3.68379 0.794678 2.92994 0.794678 2.00001C0.794678 1.07008 1.54853 0.316223 2.47846 0.316223C3.40839 0.316223 4.16225 1.07008 4.16225 2.00001Z"
                    fill="#898989"
                  />
                  <path
                    d="M12.5812 2.00001C12.5812 2.92994 11.8273 3.68379 10.8974 3.68379C9.96747 3.68379 9.21361 2.92994 9.21361 2.00001C9.21361 1.07008 9.96747 0.316223 10.8974 0.316223C11.8273 0.316223 12.5812 1.07008 12.5812 2.00001Z"
                    fill="#898989"
                  />
                  <path
                    d="M21 2.00001C21 2.92994 20.2461 3.68379 19.3162 3.68379C18.3863 3.68379 17.6324 2.92994 17.6324 2.00001C17.6324 1.07008 18.3863 0.316223 19.3162 0.316223C20.2461 0.316223 21 1.07008 21 2.00001Z"
                    fill="#898989"
                  />
                </svg>
              </div>
            </div>
            <div className="Playlists" id="popularPlaylists">
              {musicDatabase.sharedPlaylists.map(playlist => (
                <Playlist key={`popular-${playlist.name}`} playlist={playlist} />
              ))}
            </div>
          </div>
          <div className="PlaylistType">
            <div className="MadeForYouFrame">
              Recommended
              <div className="InfoIconFrame">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={21}
                  height={4}
                  viewBox="0 0 21 4"
                  fill="none"
                >
                  <path
                    d="M4.16225 2.00001C4.16225 2.92994 3.40839 3.68379 2.47846 3.68379C1.54853 3.68379 0.794678 2.92994 0.794678 2.00001C0.794678 1.07008 1.54853 0.316223 2.47846 0.316223C3.40839 0.316223 4.16225 1.07008 4.16225 2.00001Z"
                    fill="#898989"
                  />
                  <path
                    d="M12.5812 2.00001C12.5812 2.92994 11.8273 3.68379 10.8974 3.68379C9.96747 3.68379 9.21361 2.92994 9.21361 2.00001C9.21361 1.07008 9.96747 0.316223 10.8974 0.316223C11.8273 0.316223 12.5812 1.07008 12.5812 2.00001Z"
                    fill="#898989"
                  />
                  <path
                    d="M21 2.00001C21 2.92994 20.2461 3.68379 19.3162 3.68379C18.3863 3.68379 17.6324 2.92994 17.6324 2.00001C17.6324 1.07008 18.3863 0.316223 19.3162 0.316223C20.2461 0.316223 21 1.07008 21 2.00001Z"
                    fill="#898989"
                  />
                </svg>
              </div>
            </div>
            <div className="Playlists" id="recommendedPlaylists">
              {musicDatabase.sharedPlaylists.map(playlist => (
                <Playlist key={`recommended-${playlist.name}`} playlist={playlist} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="Bottom">
        <div className="PlayerFrame">
          <div className="Player Desktop">
            <div className="Song">
              <div className="SongCover" style={{ backgroundImage: nowPlaying ? `url('${nowPlaying.cover}')` : '' }} />
              <div className="SongDetail">
                <div className="SongName">{nowPlaying?.song || 'No song playing'}</div>
                <div className="SongArtist">{nowPlaying?.artist || ''}</div>
              </div>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={11}
              height={13}
              viewBox="0 0 11 13"
              fill="none"
            >
              <path
                d="M1.88944 7.71205C1.00612 7.1454 1.00612 5.85454 1.88944 5.28789L8.47471 1.06344C9.43314 0.44861 10.6923 1.13683 10.6923 2.27552V10.7244C10.6923 11.8631 9.43314 12.5513 8.47471 11.9365L1.88944 7.71205Z"
                fill="#898989"
              />
            </svg>
            <div className="PauseButton" onClick={handlePause} style={{ display: playerState.isPlaying ? 'flex' : 'none' }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={10}
                height={13}
                viewBox="0 0 10 13"
                fill="none"
              >
                <path
                  d="M1.83203 1.74786V11.2521M8.16808 1.74791V11.2522"
                  stroke="black"
                  strokeWidth="3.16809"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="PlayButton3" onClick={handlePlay} style={{ display: playerState.isPlaying ? 'none' : 'flex' }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={14}
                height={17}
                viewBox="0 0 14 17"
                fill="none"
              >
                <path
                  d="M13.0573 6.86731C14.3141 7.59294 14.3141 9.40704 13.0573 10.1327L3.15968 15.8471C1.90284 16.5727 0.331787 15.6657 0.331787 14.2144L0.331788 2.78559C0.331788 1.33432 1.90284 0.427275 3.15968 1.15291L13.0573 6.86731Z"
                  fill="black"
                />
              </svg>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={12}
              height={13}
              viewBox="0 0 12 13"
              fill="none"
            >
              <path
                d="M9.49523 5.28789C10.3786 5.85454 10.3786 7.1454 9.49523 7.71205L2.90997 11.9365C1.95154 12.5513 0.692383 11.8631 0.692383 10.7244L0.692383 2.27552C0.692383 1.13683 1.95154 0.448611 2.90997 1.06344L9.49523 5.28789Z"
                fill="#898989"
              />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={22}
              height={19}
              viewBox="0 0 22 19"
              fill="none"
            >
              <path
                d="M6.92867 14.2521H4.55261C2.80292 14.2521 1.38452 12.8337 1.38452 11.084V4.74786C1.38452 2.99818 2.80292 1.57977 4.55261 1.57977H17.225C18.9746 1.57977 20.393 2.99817 20.393 4.74786V11.084C20.393 12.8337 18.9746 14.2521 17.225 14.2521H10.8888M10.8888 14.2521L14.0569 11.084M10.8888 14.2521L14.0569 17.4202"
                stroke="#898989"
                strokeWidth="1.90085"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="CurrentTime">{playerState.currentTime}</div>
            <PlayBar
              progress={playerState.progress}
              onClick={handlePlayBarClick}
              isDragging={playerState.isDragging}
              setIsDragging={(value) => setPlayerState(prev => ({ ...prev, isDragging: value }))}
            />
            <div className="Duration">{playerState.duration}</div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={21}
              viewBox="0 0 24 21"
              fill="none"
            >
              <path
                d="M14.0365 3.11975L12.1727 4.92569L10.3089 3.11975C8.3545 1.22608 5.21935 1.33063 3.39549 3.35031C1.62573 5.31008 1.38208 8.24549 2.98465 10.3442C3.18158 10.6021 3.37521 10.8491 3.55949 11.0752C4.72593 12.5061 7.27094 15.0051 8.54608 16.3461C9.48817 17.3369 10.335 18.1633 10.973 18.7652C11.6467 19.4008 12.6867 19.3869 13.3617 18.7526C14.538 17.6473 16.3419 15.9255 17.6126 14.5892C18.8877 13.2481 19.6195 12.5061 20.7859 11.0752C20.9702 10.8491 21.1638 10.6021 21.3607 10.3442C22.9633 8.24549 22.7197 5.31008 20.9499 3.35031C19.126 1.33063 15.9909 1.22607 14.0365 3.11975Z"
                stroke="#898989"
                strokeWidth="2.02054"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={23}
              height={25}
              viewBox="0 0 23 25"
              fill="none"
            >
              <path
                d="M7.35676 13.9812H11.3068M11.3068 13.9812H15.2568M11.3068 13.9812V10.0312M11.3068 13.9812V17.9312M4.39426 4.10624H18.2193C19.8554 4.10624 21.1818 5.43259 21.1818 7.06874V20.8937C21.1818 22.5299 19.8554 23.8562 18.2193 23.8562H4.39426C2.75812 23.8562 1.43176 22.5299 1.43176 20.8937V7.06874C1.43176 5.4326 2.75812 4.10624 4.39426 4.10624ZM3.40676 4.10624H19.2068C19.2068 2.47009 17.8804 1.14374 16.2443 1.14374H6.36926C4.73312 1.14374 3.40676 2.47009 3.40676 4.10624Z"
                stroke="#898989"
                strokeWidth="1.99528"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={20}
              height={17}
              viewBox="0 0 20 17"
              fill="none"
            >
              <path
                d="M1.18179 2.08125H13.0318M1.18176 8.99371H9.08176M1.18176 15.9062H9.08176M18.9568 1.09375V9.9159M18.9568 9.9159V14.5233C18.9568 15.2638 18.4307 15.9049 17.6901 15.9062C16.2272 15.9089 14.0193 15.4786 14.0193 12.8566C14.0193 8.93566 18.9568 9.9159 18.9568 9.9159Z"
                stroke="#898989"
                strokeWidth="1.975"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={20}
              height={21}
              viewBox="0 0 20 21"
              fill="none"
            >
              <path
                d="M1.95679 13.3063L18.7946 13.3063M1.95679 18.9189L18.7946 18.9189M4.76309 7.69367H15.9883C17.5382 7.69367 18.7946 6.43724 18.7946 4.88736C18.7946 3.33748 17.5382 2.08105 15.9883 2.08105H4.76309C3.21321 2.08105 1.95679 3.33748 1.95679 4.88736C1.95679 6.43724 3.21321 7.69367 4.76309 7.69367Z"
                stroke="#898989"
                strokeWidth="2.3573"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={21}
              height={5}
              viewBox="0 0 21 5"
              fill="none"
            >
              <path
                d="M4.16225 2.50001C4.16225 3.42994 3.40839 4.18379 2.47846 4.18379C1.54853 4.18379 0.794678 3.42994 0.794678 2.50001C0.794678 1.57008 1.54853 0.816223 2.47846 0.816223C3.40839 0.816223 4.16225 1.57008 4.16225 2.50001Z"
                fill="#898989"
              />
              <path
                d="M12.5812 2.50001C12.5812 3.42994 11.8273 4.18379 10.8974 4.18379C9.96747 4.18379 9.21361 3.42994 9.21361 2.50001C9.21361 1.57008 9.96747 0.816223 10.8974 0.816223C11.8273 0.816223 12.5812 1.57008 12.5812 2.50001Z"
                fill="#898989"
              />
              <path
                d="M21 2.50001C21 3.42994 20.2461 4.18379 19.3162 4.18379C18.3863 4.18379 17.6324 3.42994 17.6324 2.50001C17.6324 1.57008 18.3863 0.816223 19.3162 0.816223C20.2461 0.816223 21 1.57008 21 2.50001Z"
                fill="#898989"
              />
            </svg>
          </div>
          <div className="Player Mobile">
            <div className="PlayerTop">
              <div className="Song">
                <div className="SongCover" style={{ backgroundImage: nowPlaying ? `url('${nowPlaying.cover}')` : '' }} />
                <div className="SongDetail">
                  <div className="SongName">{nowPlaying?.song || 'No song playing'}</div>
                  <div className="SongArtist">{nowPlaying?.artist || ''}</div>
                </div>
              </div>
              <div className="PlayerRight">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={11}
                  height={13}
                  viewBox="0 0 11 13"
                  fill="none"
                >
                  <path
                    d="M1.88944 7.71205C1.00612 7.1454 1.00612 5.85454 1.88944 5.28789L8.47471 1.06344C9.43314 0.44861 10.6923 1.13683 10.6923 2.27552V10.7244C10.6923 11.8631 9.43314 12.5513 8.47471 11.9365L1.88944 7.71205Z"
                    fill="#898989"
                  />
                </svg>
                <div className="PauseButton" onClick={handlePause} style={{ display: playerState.isPlaying ? 'flex' : 'none' }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={10}
                    height={13}
                    viewBox="0 0 10 13"
                    fill="none"
                  >
                    <path
                      d="M1.83203 1.74786V11.2521M8.16808 1.74791V11.2522"
                      stroke="black"
                      strokeWidth="3.16809"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="PlayButton3" onClick={handlePlay} style={{ display: playerState.isPlaying ? 'none' : 'flex' }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={14}
                    height={17}
                    viewBox="0 0 14 17"
                    fill="none"
                  >
                    <path
                      d="M13.0573 6.86731C14.3141 7.59294 14.3141 9.40704 13.0573 10.1327L3.15968 15.8471C1.90284 16.5727 0.331787 15.6657 0.331787 14.2144L0.331788 2.78559C0.331788 1.33432 1.90284 0.427275 3.15968 1.15291L13.0573 6.86731Z"
                      fill="black"
                    />
                  </svg>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={12}
                  height={13}
                  viewBox="0 0 12 13"
                  fill="none"
                >
                  <path
                    d="M9.49523 5.28789C10.3786 5.85454 10.3786 7.1454 9.49523 7.71205L2.90997 11.9365C1.95154 12.5513 0.692383 11.8631 0.692383 10.7244L0.692383 2.27552C0.692383 1.13683 1.95154 0.448611 2.90997 1.06344L9.49523 5.28789Z"
                    fill="#898989"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="Buttons">
          <div className="NavBarButtons">
            <svg
              className="HomeIcon"
              xmlns="http://www.w3.org/2000/svg"
              width={23}
              height={24}
              viewBox="0 0 23 24"
              fill="none"
            >
              <path
                d="M11.4702 0.000446666C11.2747 0.00716809 11.0865 0.0766571 10.9331 0.19876L2.2474 7.08926C1.14501 7.96409 0.5 9.30089 0.5 10.7142V22.4616C0.5 23.3007 1.19447 24 2.02778 24H8.13889C8.9722 24 9.66667 23.3007 9.66667 22.4616V16.3078C9.66667 16.1263 9.79192 16.0002 9.97222 16.0002H13.0278C13.2081 16.0002 13.3333 16.1263 13.3333 16.3078V22.4616C13.3333 23.3007 14.0278 24 14.8611 24H20.9722C21.8055 24 22.5 23.3007 22.5 22.4616V10.7142C22.5 9.30089 21.855 7.96409 20.7526 7.08926L12.0669 0.19876C11.8974 0.0639168 11.6861 -0.00631706 11.4702 0.000446666ZM11.5 2.09897L19.6187 8.53995C20.2812 9.06571 20.6667 9.86538 20.6667 10.7142V22.1539H15.1667V16.3078C15.1667 15.1294 14.198 14.154 13.0278 14.154H9.97222C8.80197 14.154 7.83333 15.1294 7.83333 16.3078V22.1539H2.33333V10.7142C2.33333 9.86538 2.71879 9.06571 3.38129 8.53995L11.5 2.09897Z"
                fill="#898989"
              />
            </svg>
            Home
          </div>
          <div className="NavBarButtons">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={25}
              height={25}
              viewBox="0 0 25 25"
              fill="none"
            >
              <path
                d="M12.5 23.6006L11.5372 23.8709L12.5 23.6006L11.9963 21.8063C10.7707 17.441 7.35931 14.0296 2.99397 12.804L1.19971 12.3003L0.929416 11.3375L1.19971 12.3003L2.99398 11.7966C7.35932 10.571 10.7708 7.15961 11.9963 2.79427L12.5 0.999998L13.0037 2.79427C14.2293 7.15961 17.6407 10.571 22.0061 11.7966L23.8003 12.3003L22.0061 12.804C17.6407 14.0296 14.2293 17.441 13.0037 21.8064L12.5 23.6006Z"
                stroke="#898989"
                strokeWidth={2}
              />
            </svg>
            Discover
          </div>
          <div className="NavBarButtons">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M16.9056 16.7826C18.4432 15.2141 19.3913 13.0656 19.3913 10.6957C19.3913 5.89318 15.4981 2 10.6957 2C5.89318 2 2 5.89318 2 10.6957C2 15.4981 5.89318 19.3913 10.6957 19.3913C13.1282 19.3913 15.3274 18.3925 16.9056 16.7826ZM16.9056 16.7826L22 22"
                stroke="#898989"
                strokeWidth="2.02054"
                strokeLinecap="round"
              />
            </svg>
            Search
          </div>
          <div className="NavBarButtons">
            <svg
              className="LibraryIcon"
              xmlns="http://www.w3.org/2000/svg"
              width={21}
              height={21}
              viewBox="0 0 21 21"
              fill="none"
            >
              <path
                d="M1.85669 2V19.2868M7.619 2V19.2868M13.3813 2V19.2868H19.1435V5.98927L13.3813 2Z"
                stroke="#898989"
                strokeWidth="2.02054"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Library
          </div>
          <div className="NavBarButtons">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={19}
              height={22}
              viewBox="0 0 19 22"
              fill="none"
            >
              <path
                d="M12.8676 5.36757C12.8676 7.22742 11.3598 8.73514 9.49999 8.73514C7.64014 8.73514 6.13243 7.22742 6.13243 5.36757C6.13243 3.50771 7.64014 2 9.49999 2C11.3598 2 12.8676 3.50771 12.8676 5.36757Z"
                stroke="#898989"
                strokeWidth="2.02054"
                strokeLinecap="round"
              />
              <path
                d="M2.58063 14.4706L3.33042 13.9707C5.15746 12.7527 7.30415 12.1027 9.49997 12.1027C11.6958 12.1027 13.8425 12.7527 15.6695 13.9707L16.4193 14.4706C17.3562 15.0952 17.9189 16.1466 17.9189 17.2726V18.9501C17.9189 19.8181 17.2153 20.5217 16.3474 20.5217H2.65259C1.78465 20.5217 1.08105 19.8181 1.08105 18.9501V17.2726C1.08105 16.1466 1.64378 15.0952 2.58063 14.4706Z"
                stroke="#898989"
                strokeWidth="2.02054"
                strokeLinecap="round"
              />
            </svg>
            Profile
          </div>
        </div>
      </div>
    </div>
  );
}
export default App;