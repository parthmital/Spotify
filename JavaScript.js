document.addEventListener('DOMContentLoaded', function () {
    const CONFIG = {
        paths: { images: 'Images/', songs: 'Songs/' },
        defaultHue: 145
    };

    const elements = {
        hueSliderButton: document.querySelector('.HueSliderButton'),
        recentlyPlayedContainer: document.getElementById('recentlyPlayed'),
        pauseButtons: document.querySelectorAll('.PauseButton'),
        playButtons: document.querySelectorAll('.PlayButton3'),
        playBars: document.querySelectorAll('.PlayBar'),
        songNameElements: document.querySelectorAll('.SongName'),
        songArtistElements: document.querySelectorAll('.SongArtist'),
        songCoverElements: document.querySelectorAll('.SongCover'),
        currentTimeElement: document.querySelector('.CurrentTime'),
        durationElement: document.querySelector('.Duration'),
        playlistContainers: [
            document.getElementById('madeForYouPlaylists'),
            document.getElementById('popularPlaylists'),
            document.getElementById('recommendedPlaylists')
        ],
        scrollContainers: document.querySelectorAll('.RecentlyPlayed, .Playlists')
    };

    const playerState = {
        currentTrack: null,
        isPlaying: false,
        isDragging: false,
        currentHue: CONFIG.defaultHue,
        audioPlayer: new Audio()
    };

    const createPlaylistData = (name, info, coverIndex) => ({
        name,
        info,
        cover: `${CONFIG.paths.images}${coverIndex}.jpeg`
    });

    const musicDatabase = {
        sharedPlaylists: [
            createPlaylistData("Discover Weekly", "Your weekly mixtape of fresh music", 1),
            createPlaylistData("Release Radar", "Catch all the latest releases", 2),
            createPlaylistData("Daily Mix 1", "Made for your listening habits", 3),
            createPlaylistData("Time Capsule", "Songs from your past", 4),
            createPlaylistData("On Repeat", "Songs you can't stop playing", 5),
            createPlaylistData("Repeat Rewind", "Your recent favorites", 6),
            createPlaylistData("Your Top Mix", "Your most played tracks", 7),
            createPlaylistData("Chill Mix", "Your relaxing favorites", 8),
            createPlaylistData("Focus Mix", "Music to concentrate to", 9),
            createPlaylistData("Energy Boost", "Get pumped with these tracks", 10)
        ],
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
    };

    function createTrackData(song, artist, coverFile) {
        const fileName = song.includes(" - ") ? song : `${artist.split(',')[0]} - ${song}`;
        return {
            song, artist,
            cover: `${CONFIG.paths.images}${coverFile}`,
            file: `${CONFIG.paths.songs}${fileName}.mp3`
        };
    }

    function hslToHex(h, s, l) {
        h /= 360; s /= 100; l /= 100;
        let r, g, b;

        if (s === 0) { r = g = b = l; }
        else {
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

        const toHex = x => {
            const hex = Math.round(x * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
    }

    function updateBackgroundColor(hue) {
        const hexColor = hslToHex(hue, 100, 50);
        const accentColor = hslToHex(hue, 80, 50);

        document.body.style.background = `linear-gradient(180deg, rgba(0, 0, 0, 0.75) 0%, #000 100%), linear-gradient(0deg, ${hexColor} 0%, ${hexColor} 100%)`;
        document.documentElement.style.setProperty('--accent-color', accentColor);
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    function updateTimeDisplay() {
        const { audioPlayer } = playerState;
        if (audioPlayer.duration && !isNaN(audioPlayer.duration)) {
            elements.durationElement.textContent = formatTime(audioPlayer.duration);
        }
        elements.currentTimeElement.textContent = formatTime(audioPlayer.currentTime);
    }

    function updatePlayBar() {
        const { audioPlayer } = playerState;
        if (audioPlayer.duration && !isNaN(audioPlayer.duration)) {
            const percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            elements.playBars.forEach(bar => {
                bar.style.setProperty('--progress', `${percentage}%`);
            });
            updateTimeDisplay();
        }
    }

    function togglePlayPauseButton(isPlaying) {
        elements.pauseButtons.forEach(btn => btn.style.display = isPlaying ? 'flex' : 'none');
        elements.playButtons.forEach(btn => btn.style.display = isPlaying ? 'none' : 'flex');
    }

    function updateNowPlaying(track) {
        if (track) {
            elements.songNameElements.forEach(el => el.textContent = track.song);
            elements.songArtistElements.forEach(el => el.textContent = track.artist);
            elements.songCoverElements.forEach(el => el.style.backgroundImage = `url('${track.cover}')`);
        }
        togglePlayPauseButton(playerState.isPlaying);
    }

    function updateActivePlayButtons(currentTrackFile = null) {
        document.querySelectorAll('.Album').forEach(album => {
            album.classList.remove('playing');
        });

        if (currentTrackFile && playerState.isPlaying) {
            const playingAlbum = document.querySelector(`.Album[data-file="${currentTrackFile}"]`);
            if (playingAlbum) playingAlbum.classList.add('playing');
        }
    }

    function updateRecentlyPlayed(track) {
        const { recentlyPlayedContainer } = elements;
        musicDatabase.recentlyPlayed = musicDatabase.recentlyPlayed.filter(t => t.file !== track.file);
        musicDatabase.recentlyPlayed.unshift(track);
        if (musicDatabase.recentlyPlayed.length > 10) musicDatabase.recentlyPlayed.pop();

        recentlyPlayedContainer.innerHTML = '';
        musicDatabase.recentlyPlayed.forEach(track => {
            recentlyPlayedContainer.appendChild(createAlbumElement(track));
        });

        updateActivePlayButtons(track.file);
    }

    function playTrack(track) {
        try {
            const { audioPlayer } = playerState;

            if (playerState.currentTrack === track.file && playerState.isPlaying) {
                audioPlayer.pause();
                playerState.isPlaying = false;
                togglePlayPauseButton(playerState.isPlaying);
                updateActivePlayButtons();
                return;
            }

            audioPlayer.src = track.file;
            audioPlayer.play()
                .then(() => {
                    playerState.currentTrack = track.file;
                    playerState.isPlaying = true;
                    togglePlayPauseButton(playerState.isPlaying);
                    updateNowPlaying(track);
                    updateRecentlyPlayed(track);
                    updateActivePlayButtons(playerState.currentTrack);

                    elements.playBars.forEach(bar => {
                        bar.style.setProperty('--progress', '0%');
                    });
                    elements.currentTimeElement.textContent = '0:00';
                })
                .catch(error => {
                    console.error("Playback failed:", error);
                });
        } catch (error) {
            console.error("Audio error:", error);
        }
    }

    function handlePlayBarClick(e) {
        const { audioPlayer } = playerState;
        if (!audioPlayer.duration) return;

        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        if (!clientX) return;

        const bar = e.currentTarget;
        const rect = bar.getBoundingClientRect();
        const clickPosition = clientX - rect.left;
        const percentageClicked = clickPosition / rect.width;

        audioPlayer.currentTime = percentageClicked * audioPlayer.duration;
        if (!playerState.isPlaying) {
            audioPlayer.play();
            playerState.isPlaying = true;
            togglePlayPauseButton(playerState.isPlaying);
        }
    }

    function createAlbumElement(track) {
        const album = document.createElement('div');
        album.className = 'Album';
        album.dataset.file = track.file;
        album.innerHTML = `
            <div class="AlbumCover" style="background-image: url('${track.cover}')"></div>
            <div class="AlbumDescription">
                <div class="AlbumName">${track.song}</div>
                <div class="AlbumArtist">${track.artist}</div>
            </div>
            <div class="PlayButton">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="17" viewBox="0 0 14 17" fill="none">
                    <path d="M13.0573 6.86731C14.3141 7.59294 14.3141 9.40704 13.0573 10.1327L3.15968 15.8471C1.90284 16.5727 0.331787 15.6657 0.331787 14.2144L0.331788 2.78559C0.331788 1.33432 1.90284 0.427275 3.15968 1.15291L13.0573 6.86731Z" fill="black"/>
                </svg>
            </div>
            <div class="PauseButton">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="13" viewBox="0 0 10 13" fill="none">
                    <path d="M1.83203 1.74786V11.2521M8.16808 1.74791V11.2522" stroke="black" stroke-width="3.16809" stroke-linecap="round"/>
                </svg>
            </div>
        `;

        album.addEventListener('click', () => playTrack(track));
        return album;
    }

    function createPlaylistElement(playlist) {
        const playlistElement = document.createElement('div');
        playlistElement.className = 'Playlist';
        playlistElement.innerHTML = `
            <div class="PlaylistCover" style="background-image: url('${playlist.cover}')">
                <div class="PlayButton2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="17" viewBox="0 0 14 17" fill="none">
                        <path d="M13.0573 6.86731C14.3141 7.59294 14.3141 9.40704 13.0573 10.1327L3.15968 15.8471C1.90284 16.5727 0.331787 15.6657 0.331787 14.2144L0.331788 2.78559C0.331788 1.33432 1.90284 0.427275 3.15968 1.15291L13.0573 6.86731Z" fill="black"/>
                    </svg>
                </div>
            </div>
            <div class="PlaylistDescription">
                <div class="PlaylistName">${playlist.name}</div>
                <div class="PlaylistInfo">${playlist.info}</div>
            </div>
        `;
        return playlistElement;
    }

    elements.hueSliderButton.addEventListener('click', () => {
        playerState.currentHue = (playerState.currentHue + 30) % 360;
        updateBackgroundColor(playerState.currentHue);
    });

    elements.pauseButtons.forEach(button => {
        button.addEventListener('click', () => {
            playerState.audioPlayer.pause();
            playerState.isPlaying = false;
            togglePlayPauseButton(playerState.isPlaying);
            updateActivePlayButtons();
        });
    });

    elements.playButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (playerState.currentTrack) {
                if (!playerState.isPlaying) {
                    playerState.audioPlayer.play();
                    playerState.isPlaying = true;
                    togglePlayPauseButton(playerState.isPlaying);
                }
            } else {
                playTrack(musicDatabase.currentlyPlaying);
            }
        });
    });

    elements.playBars.forEach(bar => {
        bar.addEventListener('click', handlePlayBarClick);

        bar.addEventListener('mouseenter', () => {
            bar.style.setProperty('--playhead-opacity', '1');
        });

        bar.addEventListener('mouseleave', () => {
            if (!playerState.isDragging) {
                bar.style.setProperty('--playhead-opacity', '0');
            }
        });

        bar.addEventListener('touchstart', (e) => {
            playerState.isDragging = true;
            bar.style.setProperty('--playhead-opacity', '1');
            handlePlayBarClick(e);
        });
    });

    document.addEventListener('touchend', () => {
        playerState.isDragging = false;
        elements.playBars.forEach(bar => {
            bar.style.setProperty('--playhead-opacity', '0');
        });
    });

    elements.scrollContainers.forEach(container => {
        container.addEventListener('wheel', function (e) {
            e.preventDefault();
            this.scrollLeft += e.deltaY;
        }, { passive: false });
    });

    playerState.audioPlayer.addEventListener('timeupdate', updatePlayBar);
    playerState.audioPlayer.addEventListener('loadedmetadata', updateTimeDisplay);
    playerState.audioPlayer.addEventListener('ended', () => {
        playerState.isPlaying = false;
        togglePlayPauseButton(playerState.isPlaying);
    });

    updateBackgroundColor(playerState.currentHue);

    elements.playlistContainers.forEach(container => {
        musicDatabase.sharedPlaylists.forEach(playlist => {
            container.appendChild(createPlaylistElement(playlist));
        });
    });

    musicDatabase.recentlyPlayed.forEach(track => {
        elements.recentlyPlayedContainer.appendChild(createAlbumElement(track));
    });

    updateNowPlaying(musicDatabase.currentlyPlaying);
    togglePlayPauseButton(false);
});