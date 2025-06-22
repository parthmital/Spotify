const PlayBar = ({ progress, onClick, isDragging, setIsDragging }) => (
    <div
        className="PlayBar"
        onClick={onClick}
        onMouseEnter={() => document.querySelector('.PlayBar').style.setProperty('--playhead-opacity', '1')}
        onMouseLeave={() => !isDragging && document.querySelector('.PlayBar').style.setProperty('--playhead-opacity', '0')}
        onTouchStart={(e) => {
            setIsDragging(true);
            document.querySelector('.PlayBar').style.setProperty('--playhead-opacity', '1');
            onClick(e);
        }}
        style={{ '--progress': `${progress}%` }}
    />
);
export default PlayBar;