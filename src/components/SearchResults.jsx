import { useState } from 'react';
import Album from './Album';

const SearchResults = ({ results, onTrackPlay, currentTrack, isPlaying }) => {
  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div className="SearchResults">
      <div className="PlaylistType">
        <div className="MadeForYouFrame">
          Search Results
        </div>
        <div className="RecentlyPlayed">
          {results.map(track => (
            <Album
              key={track.id}
              track={track}
              isPlaying={currentTrack === track.file && isPlaying}
              onClick={() => onTrackPlay(track)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;