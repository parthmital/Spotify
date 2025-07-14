# Spotify-Inspired React Music Player

A modern, responsive music player web app inspired by Spotify. Built with React and Vite, it features playlist and album browsing, a play bar, dynamic theming, and custom Spotify-like fonts. All music and images are served locally for a seamless, offline-friendly experience.

## Features
- 🎵 Browse and play a curated set of songs and playlists
- 🕒 Recently played and currently playing track management
- 🎨 Customizable accent color (hue slider)
- 💻 Responsive design and smooth UI interactions
- 🅰️ Custom "Spotify Mix" font family for authentic look

## Project Structure
```
Spotify/
├── public/
│   ├── Images/      # Album and playlist cover images
│   ├── Songs/       # MP3 files for playback
│   └── fonts/       # Custom Spotify Mix font (multiple weights/styles)
├── src/
│   ├── components/  # Album, Playlist, PlayBar React components
│   ├── constants/   # App configuration
│   ├── App.jsx      # Main app logic/UI
│   ├── App.css      # Main styles
│   └── main.jsx     # App entry point
├── index.html       # HTML entry point
├── package.json     # Scripts and dependencies
└── vite.config.js   # Vite and alias config
```

## Key Components
- **Album**: Displays an album/track with cover, name, artist, and play/pause button.
- **Playlist**: Displays a playlist with cover, name, and info.
- **PlayBar**: Interactive progress bar for the currently playing track.

## Setup & Usage
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at the local address provided by Vite (usually http://localhost:5173).

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview the production build:**
   ```bash
   npm run preview
   ```

5. **Lint the code:**
   ```bash
   npm run lint
   ```

## Deployment
- The app is configured for deployment to GitHub Pages with the base path `/Spotify/`.
- To deploy, run:
  ```bash
  npm run deploy
  ```

## Assets
- **Album and playlist covers:** `public/Images/`
- **Songs:** `public/Songs/`
- **Fonts:** `public/fonts/` (with a demo and stylesheet)

## Customization
- Add more songs and images by placing them in the respective folders and updating the playlist/track data in `src/App.jsx`.
- The accent color can be changed via the hue slider in the UI.

---

**Enjoy your own Spotify-inspired music experience!**
