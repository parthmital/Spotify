const Playlist = ({ playlist }) => (
    <div className="Playlist">
        <div className="PlaylistCover" style={{ backgroundImage: `url('${playlist.cover}')` }}>
            <div className="PlayButton2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="17" viewBox="0 0 14 17" fill="none">
                    <path d="M13.0573 6.86731C14.3141 7.59294 14.3141 9.40704 13.0573 10.1327L3.15968 15.8471C1.90284 16.5727 0.331787 15.6657 0.331787 14.2144L0.331788 2.78559C0.331788 1.33432 1.90284 0.427275 3.15968 1.15291L13.0573 6.86731Z" fill="black" />
                </svg>
            </div>
        </div>
        <div className="PlaylistDescription">
            <div className="PlaylistName">{playlist.name}</div>
            <div className="PlaylistInfo">{playlist.info}</div>
        </div>
    </div>
);
export default Playlist;