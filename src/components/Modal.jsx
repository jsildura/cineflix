import React, { useState, useEffect, useCallback, memo } from 'react';
import { useTMDB } from '../hooks/useTMDB';

const Modal = memo(({ item, onClose, recommendations = [], collection = [] }) => {
  const { BACKDROP_URL, POSTER_URL, fetchVideos } = useTMDB();
  const [isTrailerPlaying, setIsTrailerPlaying] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);

  // Fetch trailer when modal opens
  useEffect(() => {
    const loadTrailer = async () => {
      if (item?.id) {
        const type = item.media_type || item.type || 'movie';
        const key = await fetchVideos(type, item.id);
        setTrailerKey(key);
      }
    };
    loadTrailer();
  }, [item?.id, item?.media_type, item?.type, fetchVideos]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const playButtonClick = useCallback(() => {
    window.location.href = `/watch?type=${item.type}&id=${item.id}`;
  }, [item.type, item.id]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: item.title || item.name,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }, [item.title, item.name]);

  // Toggle trailer playback
  const toggleTrailer = useCallback(() => {
    if (trailerKey) {
      setIsTrailerPlaying(prev => !prev);
    }
  }, [trailerKey]);

  // Get year from release date
  const year = item.release_date?.substring(0, 4) ||
    item.first_air_date?.substring(0, 4) || '';

  // Format runtime
  const runtime = item.runtime ? `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m` : '';

  // Format rating
  const rating = item.vote_average ? `${(item.vote_average).toFixed(1)}/10` : '';

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content-new">
        {/* Close Button */}
        <button className="modal-close-new" onClick={onClose}>✕</button>

        {/* Scrollable Content */}
        <div className="modal-scroll-container">
          {/* Hero Header with Backdrop/Trailer */}
          <div className="modal-hero">
            <div className="modal-backdrop-container">
              {isTrailerPlaying && trailerKey ? (
                /* YouTube Trailer Iframe */
                <iframe
                  className="modal-trailer-video"
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                  title={`${item.title || item.name} Trailer`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                /* Backdrop Image */
                <img
                  src={`${BACKDROP_URL}${item.backdrop_path}`}
                  alt={item.title || item.name}
                  className="modal-backdrop-img"
                />
              )}
            </div>
            {/* Movie Logo/Title Overlay - hide when trailer is playing */}
            {!isTrailerPlaying && (
              <div className="modal-logo-overlay">
                {item.logo_path ? (
                  <img
                    src={`${POSTER_URL}${item.logo_path}`}
                    alt={item.title || item.name}
                    className="modal-logo-img"
                  />
                ) : (
                  <h2 className="modal-title-overlay">{item.title || item.name}</h2>
                )}
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="modal-body-new">
            {/* Two Column Main Layout */}
            <div className="modal-main-layout">
              {/* Left Column */}
              <div className="modal-left-col">
                {/* Action Buttons Row */}
                <div className="modal-actions-row">
                  <button onClick={playButtonClick} className="modal-btn-play">
                    <span className="modal-btn-icon">▷</span>
                    Watch Now
                  </button>
                  <button onClick={handleShare} className="modal-btn-icon-only" title="Share">
                    <span>⤴</span>
                  </button>
                  <button
                    onClick={toggleTrailer}
                    className={`modal-btn-icon-only ${isTrailerPlaying ? 'active' : ''} ${!trailerKey ? 'disabled' : ''}`}
                    title={isTrailerPlaying ? "Stop Trailer" : "Play Trailer"}
                    disabled={!trailerKey}
                  >
                    {isTrailerPlaying ? (
                      /* Monitor-X icon when playing */
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m14.5 12.5-5-5"></path>
                        <path d="m9.5 12.5 5-5"></path>
                        <rect width="20" height="14" x="2" y="3" rx="2"></rect>
                        <path d="M12 17v4"></path>
                        <path d="M8 21h8"></path>
                      </svg>
                    ) : (
                      /* Monitor-Play icon when stopped */
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M10 7.75a.75.75 0 0 1 1.142-.638l3.664 2.249a.75.75 0 0 1 0 1.278l-3.664 2.25a.75.75 0 0 1-1.142-.64z"></path>
                        <path d="M12 17v4"></path>
                        <path d="M8 21h8"></path>
                        <rect x="2" y="3" width="20" height="14" rx="2"></rect>
                      </svg>
                    )}
                  </button>
                </div>

                {/* Metadata Row */}
                <div className="modal-meta-row">
                  {year && <span>{year}</span>}
                  {runtime && <><span className="meta-dot">·</span><span>{runtime}</span></>}
                  {rating && (
                    <>
                      <span className="meta-dot">·</span>
                      <span className="modal-rating">
                        <span className="star-icon">☆</span>
                        {rating}
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                <p className="modal-description-new">{item.overview}</p>
              </div>

              {/* Right Column - Info */}
              <div className="modal-right-col">
                <div className="modal-info-item">
                  <span className="modal-info-label">Genres:</span>
                  <span className="modal-info-value">{item.genres?.join(', ') || 'N/A'}</span>
                </div>
                <div className="modal-info-item">
                  <span className="modal-info-label">Cast:</span>
                  <span className="modal-info-value">{item.cast || 'N/A'}</span>
                </div>
                <div className="modal-info-item">
                  <span className="modal-info-label">Status:</span>
                  <span className="modal-info-value">{item.status || 'Released'}</span>
                </div>
              </div>
            </div>

            {/* Collection Section */}
            {collection.length > 0 && (
              <div className="modal-section">
                <h3 className="modal-section-title">{item.collection_name || 'Collection'}</h3>
                <div className="modal-collection-grid">
                  {collection.map((movie, index) => (
                    <div key={index} className="modal-collection-item">
                      <img
                        src={`${BACKDROP_URL}${movie.backdrop_path}`}
                        alt={movie.title || movie.name}
                        className="modal-collection-img"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* You May Also Like Section */}
            {recommendations.length > 0 && (
              <div className="modal-section">
                <h3 className="modal-section-title">You may also like</h3>
                <div className="modal-recommendations-scroll">
                  {recommendations.map((movie, index) => (
                    <div key={index} className="modal-recommendation-item">
                      <img
                        src={`${POSTER_URL}${movie.poster_path}`}
                        alt={movie.title || movie.name}
                        className="modal-recommendation-img"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';
export default Modal;