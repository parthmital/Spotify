import React from 'react';

const Player = ({
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    onPlayPause,
    onNext,
    onPrevious,
    onPlayBarClick,
    progress
}) => {
    return (
        <div className="PlayerFrame">
            <div className="Player Desktop">
                <div className="Song">
                    <div className="SongCover" style={{ backgroundImage: currentTrack ? `url('${currentTrack.cover}')` : '' }}></div>
                    <div className="SongDetail">
                        <div className="SongName">{currentTrack?.song || ''}</div>
                        <div className="SongArtist">{currentTrack?.artist || ''}</div>
                    </div>
                </div>
                <svg onClick={onPrevious} xmlns="http://www.w3.org/2000/svg" width="11" height="13" viewBox="0 0 11 13" fill="none">
                    <path d="M1.88944 7.71205C1.00612 7.1454 1.00612 5.85454 1.88944 5.28789L8.47471 1.06344C9.43314 0.44861 10.6923 1.13683 10.6923 2.27552V10.7244C10.6923 11.8631 9.43314 12.5513 8.47471 11.9365L1.88944 7.71205Z" fill="#898989" />
                </svg>
                <div className="PauseButton" onClick={onPlayPause} style={{ display: isPlaying ? 'flex' : 'none' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="13" viewBox="0 0 10 13" fill="none">
                        <path d="M1.83203 1.74786V11.2521M8.16808 1.74791V11.2522" stroke="black" strokeWidth="3.16809" strokeLinecap="round" />
                    </svg>
                </div>
                <div className="PlayButton3" onClick={onPlayPause} style={{ display: isPlaying ? 'none' : 'flex' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="17" viewBox="0 0 14 17" fill="none">
                        <path d="M13.0573 6.86731C14.3141 7.59294 14.3141 9.40704 13.0573 10.1327L3.15968 15.8471C1.90284 16.5727 0.331787 15.6657 0.331787 14.2144L0.331788 2.78559C0.331788 1.33432 1.90284 0.427275 3.15968 1.15291L13.0573 6.86731Z" fill="black" />
                    </svg>
                </div>
                <svg onClick={onNext} xmlns="http://www.w3.org/2000/svg" width="12" height="13" viewBox="0 0 12 13" fill="none">
                    <path d="M9.49523 5.28789C10.3786 5.85454 10.3786 7.1454 9.49523 7.71205L2.90997 11.9365C1.95154 12.5513 0.692383 11.8631 0.692383 10.7244L0.692383 2.27552C0.692383 1.13683 1.95154 0.448611 2.90997 1.06344L9.49523 5.28789Z" fill="#898989" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="19" viewBox="0 0 22 19" fill="none">
                    <path d="M6.92867 14.2521H4.55261C2.80292 14.2521 1.38452 12.8337 1.38452 11.084V4.74786C1.38452 2.99818 2.80292 1.57977 4.55261 1.57977H17.225C18.9746 1.57977 20.393 2.99817 20.393 4.74786V11.084C20.393 12.8337 18.9746 14.2521 17.225 14.2521H10.8888M10.8888 14.2521L14.0569 11.084M10.8888 14.2521L14.0569 17.4202" stroke="#898989" strokeWidth="1.90085" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="CurrentTime">{currentTime}</div>
                <div className="PlayBar" onClick={onPlayBarClick}>
                    <div style={{ '--progress': `${progress}%`, height: '100%', backgroundColor: 'var(--accent-color)', borderRadius: '2px' }}></div>
                </div>
                <div className="Duration">{duration}</div>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="21" viewBox="0 0 24 21" fill="none">
                    <path d="M14.0365 3.11975L12.1727 4.92569L10.3089 3.11975C8.3545 1.22608 5.21935 1.33063 3.39549 3.35031C1.62573 5.31008 1.38208 8.24549 2.98465 10.3442C3.18158 10.6021 3.37521 10.8491 3.55949 11.0752C4.72593 12.5061 7.27094 15.0051 8.54608 16.3461C9.48817 17.3369 10.335 18.1633 10.973 18.7652C11.6467 19.4008 12.6867 19.3869 13.3617 18.7526C14.538 17.6473 16.3419 15.9255 17.6126 14.5892C18.8877 13.2481 19.6195 12.5061 20.7859 11.0752C20.9702 10.8491 21.1638 10.6021 21.3607 10.3442C22.9633 8.24549 22.7197 5.31008 20.9499 3.35031C19.126 1.33063 15.9909 1.22607 14.0365 3.11975Z" stroke="#898989" strokeWidth="2.02054" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="23" height="25" viewBox="0 0 23 25" fill="none">
                    <path d="M7.35676 13.9812H11.3068M11.3068 13.9812H15.2568M11.3068 13.9812V10.0312M11.3068 13.9812V17.9312M4.39426 4.10624H18.2193C19.8554 4.10624 21.1818 5.43259 21.1818 7.06874V20.8937C21.1818 22.5299 19.8554 23.8562 18.2193 23.8562H4.39426C2.75812 23.8562 1.43176 22.5299 1.43176 20.8937V7.06874C1.43176 5.4326 2.75812 4.10624 4.39426 4.10624ZM3.40676 4.10624H19.2068C19.2068 2.47009 17.8804 1.14374 16.2443 1.14374H6.36926C4.73312 1.14374 3.40676 2.47009 3.40676 4.10624Z" stroke="#898989" strokeWidth="1.99528" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="17" viewBox="0 0 20 17" fill="none">
                    <path d="M1.18179 2.08125H13.0318M1.18176 8.99371H9.08176M1.18176 15.9062H9.08176M18.9568 1.09375V9.9159M18.9568 9.9159V14.5233C18.9568 15.2638 18.4307 15.9049 17.6901 15.9062C16.2272 15.9089 14.0193 15.4786 14.0193 12.8566C14.0193 8.93566 18.9568 9.9159 18.9568 9.9159Z" stroke="#898989" strokeWidth="1.975" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
                    <path d="M1.95679 13.3063L18.7946 13.3063M1.95679 18.9189L18.7946 18.9189M4.76309 7.69367H15.9883C17.5382 7.69367 18.7946 6.43724 18.7946 4.88736C18.7946 3.33748 17.5382 2.08105 15.9883 2.08105H4.76309C3.21321 2.08105 1.95679 3.33748 1.95679 4.88736C1.95679 6.43724 3.21321 7.69367 4.76309 7.69367Z" stroke="#898989" strokeWidth="2.3573" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="21" height="5" viewBox="0 0 21 5" fill="none">
                    <path d="M4.16225 2.50001C4.16225 3.42994 3.40839 4.18379 2.47846 4.18379C1.54853 4.18379 0.794678 3.42994 0.794678 2.50001C0.794678 1.57008 1.54853 0.816223 2.47846 0.816223C3.40839 0.816223 4.16225 1.57008 4.16225 2.50001Z" fill="#898989" />
                    <path d="M12.5812 2.50001C12.5812 3.42994 11.8273 4.18379 10.8974 4.18379C9.96747 4.18379 9.21361 3.42994 9.21361 2.50001C9.21361 1.57008 9.96747 0.816223 10.8974 0.816223C11.8273 0.816223 12.5812 1.57008 12.5812 2.50001Z" fill="#898989" />
                    <path d="M21 2.50001C21 3.42994 20.2461 4.18379 19.3162 4.18379C18.3863 4.18379 17.6324 3.42994 17.6324 2.50001C17.6324 1.57008 18.3863 0.816223 19.3162 0.816223C20.2461 0.816223 21 1.57008 21 2.50001Z" fill="#898989" />
                </svg>
            </div>
            <div className="Player Mobile">
                <div className="PlayerTop">
                    <div className="Song">
                        <div className="SongCover" style={{ backgroundImage: currentTrack ? `url('${currentTrack.cover}')` : '' }}></div>
                        <div className="SongDetail">
                            <div className="SongName">{currentTrack?.song || ''}</div>
                            <div className="SongArtist">{currentTrack?.artist || ''}</div>
                        </div>
                    </div>
                    <div className="PlayerRight">
                        <svg onClick={onPrevious} xmlns="http://www.w3.org/2000/svg" width="11" height="13" viewBox="0 0 11 13" fill="none">
                            <path d="M1.88944 7.71205C1.00612 7.1454 1.00612 5.85454 1.88944 5.28789L8.47471 1.06344C9.43314 0.44861 10.6923 1.13683 10.6923 2.27552V10.7244C10.6923 11.8631 9.43314 12.5513 8.47471 11.9365L1.88944 7.71205Z" fill="#898989" />
                        </svg>
                        <div className="PauseButton" onClick={onPlayPause} style={{ display: isPlaying ? 'flex' : 'none' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="13" viewBox="0 0 10 13" fill="none">
                                <path d="M1.83203 1.74786V11.2521M8.16808 1.74791V11.2522" stroke="black" strokeWidth="3.16809" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div className="PlayButton3" onClick={onPlayPause} style={{ display: isPlaying ? 'none' : 'flex' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="17" viewBox="0 0 14 17" fill="none">
                                <path d="M13.0573 6.86731C14.3141 7.59294 14.3141 9.40704 13.0573 10.1327L3.15968 15.8471C1.90284 16.5727 0.331787 15.6657 0.331787 14.2144L0.331788 2.78559C0.331788 1.33432 1.90284 0.427275 3.15968 1.15291L13.0573 6.86731Z" fill="black" />
                            </svg>
                        </div>
                        <svg onClick={onNext} xmlns="http://www.w3.org/2000/svg" width="12" height="13" viewBox="0 0 12 13" fill="none">
                            <path d="M9.49523 5.28789C10.3786 5.85454 10.3786 7.1454 9.49523 7.71205L2.90997 11.9365C1.95154 12.5513 0.692383 11.8631 0.692383 10.7244L0.692383 2.27552C0.692383 1.13683 1.95154 0.448611 2.90997 1.06344L9.49523 5.28789Z" fill="#898989" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Player;