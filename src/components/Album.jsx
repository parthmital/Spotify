const Album = ({ track, isPlaying, onClick }) => (
    <div
        className={`Album ${isPlaying ? 'playing' : ''}`}
        data-file={track.file}
        onClick={onClick}
    >
        <div className="AlbumCover" style={{ backgroundImage: `url('${track.cover}')` }} />
        <div className="AlbumDescription">
            <div className="AlbumName">{track.song}</div>
            <div className="AlbumArtist">{track.artist}</div>
        </div>
        <div className="PlayButton">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="17" viewBox="0 0 14 17" fill="none">
                <path d="M13.0573 6.86731C14.3141 7.59294 14.3141 9.40704 13.0573 10.1327L3.15968 15.8471C1.90284 16.5727 0.331787 15.6657 0.331787 14.2144L0.331788 2.78559C0.331788 1.33432 1.90284 0.427275 3.15968 1.15291L13.0573 6.86731Z" fill="black" />
            </svg>
        </div>
        <div className="PauseButton" style={{ display: isPlaying ? 'flex' : 'none' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="13" viewBox="0 0 10 13" fill="none">
                <path d="M1.83203 1.74786V11.2521M8.16808 1.74791V11.2522" stroke="black" strokeWidth="3.16809" strokeLinecap="round" />
            </svg>
        </div>
    </div>
);
export default Album;