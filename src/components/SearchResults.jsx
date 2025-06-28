import Album from './Album';
import LoadingSpinner from './LoadingSpinner';

const SearchResults = ({ results, onTrackPlay, currentTrack, isPlaying, isSearching, searchQuery }) => {
  return (
    <div className="SearchResults">
      <div className="PlaylistType">
        <div className="MadeForYouFrame">
          {isSearching ? 'Searching...' : `Search Results for "${searchQuery}"`}
        </div>
        
        {isSearching ? (
          <div className="RecentlyPlayed">
            <LoadingSpinner />
          </div>
        ) : results.length > 0 ? (
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
        ) : (
          <div className="RecentlyPlayed">
            <div style={{ 
              padding: '40px', 
              textAlign: 'center', 
              color: 'var(--grey)',
              fontSize: '16px'
            }}>
              No results found for "{searchQuery}"
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;