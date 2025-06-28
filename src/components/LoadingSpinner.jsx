const LoadingSpinner = () => (
  <div className="LoadingSpinner">
    <div className="spinner"></div>
    <style jsx>{`
      .LoadingSpinner {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 40px;
      }
      
      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--bg-light);
        border-top: 3px solid var(--accent-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export default LoadingSpinner;