import React from 'react';
import Playlist from './Playlist';

const PlaylistType = ({ title, playlists }) => {
    return (
        <div className="PlaylistType">
            <div className="MadeForYouFrame">
                {title}
                <div className="InfoIconFrame">
                    <svg xmlns="http://www.w3.org/2000/svg" width="21" height="4" viewBox="0 0 21 4" fill="none">
                        <path d="M4.16225 2.00001C4.16225 2.92994 3.40839 3.68379 2.47846 3.68379C1.54853 3.68379 0.794678 2.92994 0.794678 2.00001C0.794678 1.07008 1.54853 0.316223 2.47846 0.316223C3.40839 0.316223 4.16225 1.07008 4.16225 2.00001Z" fill="#898989" />
                        <path d="M12.5812 2.00001C12.5812 2.92994 11.8273 3.68379 10.8974 3.68379C9.96747 3.68379 9.21361 2.92994 9.21361 2.00001C9.21361 1.07008 9.96747 0.316223 10.8974 0.316223C11.8273 0.316223 12.5812 1.07008 12.5812 2.00001Z" fill="#898989" />
                        <path d="M21 2.00001C21 2.92994 20.2461 3.68379 19.3162 3.68379C18.3863 3.68379 17.6324 2.92994 17.6324 2.00001C17.6324 1.07008 18.3863 0.316223 19.3162 0.316223C20.2461 0.316223 21 1.07008 21 2.00001Z" fill="#898989" />
                    </svg>
                </div>
            </div>
            <div className="Playlists">
                {playlists.map((playlist, index) => (
                    <Playlist key={index} playlist={playlist} />
                ))}
            </div>
        </div>
    );
};

export default PlaylistType;