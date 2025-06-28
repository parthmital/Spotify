import Album from './Album';
import LoadingSpinner from './LoadingSpinner';

const SearchResults = ({ results, onTrackPlay, currentTrack, isPlaying, isSearching, searchQuery }) => {
  console.log('SearchResults component rendered:', {
    resultsCount: results.length,
    isSearching,
    searchQuery,
    results: results.slice(0, 3) // Log first 3 results for debugging
  });

  return (
    <div className="SearchResults">
      {isSearching ? (
        <div className="RecentlyPlayed">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: '40px',
            color: 'var(--grey)'
          }}>
            <LoadingSpinner />
            <span style={{ marginLeft: '10px' }}>Searching for "{searchQuery}"...</span>
          </div>
        </div>
      ) : results.length > 0 ? (
        <div className="RecentlyPlayed">
          {results.map(track => {
            console.log('Rendering track:', track.song, track.artist);
            return (
              <Album
                key={track.id}
                track={track}
                isPlaying={currentTrack === track.file && isPlaying}
                onClick={() => onTrackPlay(track)}
              />
            );
          })}
        </div>
      ) : searchQuery ? (
        <div className="RecentlyPlayed">
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            color: 'var(--grey)',
            fontSize: '16px'
          }}>
            <p>No results found for "{searchQuery}"</p>
            <p style={{ fontSize: '14px', marginTop: '10px', opacity: 0.7 }}>
              Try searching for popular artists like "arijit singh", "shreya ghoshal", or "bollywood"
            </p>
          </div>
        </div>
      ) : (
        <div className="RecentlyPlayed">
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            color: 'var(--grey)',
            fontSize: '16px'
          }}>
            Start typing to search for songs...
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;