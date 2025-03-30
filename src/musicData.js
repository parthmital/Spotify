export const CONFIG = {
    paths: {
        images: process.env.PUBLIC_URL + '/Images/',
        songs: process.env.PUBLIC_URL + '/Songs/'
    },
    defaultHue: 145
};

export const createPlaylistData = (name, info, coverIndex) => ({
    name,
    info,
    cover: `${CONFIG.paths.images}${coverIndex}.jpeg`
});

export const createTrackData = (song, artist, coverFile) => {
    const fileName = song.includes(" - ") ? song : `${artist.split(',')[0]} - ${song}`;
    return {
        song,
        artist,
        cover: `${CONFIG.paths.images}${encodeURIComponent(coverFile)}`,
        file: `${CONFIG.paths.songs}${encodeURIComponent(fileName)}.mp3`
    };
};

export const musicDatabase = {
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