import React, { useState, useEffect } from 'react';
import { useTMDB } from '../hooks/useTMDB';

const BannerSlider = ({ movies, onItemClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const { BACKDROP_URL } = useTMDB();

  // Auto-advance slides with progress tracking
  useEffect(() => {
    const slideDuration = 5000;
    const progressInterval = 50;
    let progressTimer;
    let slideTimer;

    const startProgress = () => {
      setProgress(0);
      progressTimer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 100;
          return prev + (progressInterval / slideDuration) * 100;
        });
      }, progressInterval);

      slideTimer = setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % movies.length);
      }, slideDuration);
    };

    startProgress();

    return () => {
      clearInterval(progressTimer);
      clearTimeout(slideTimer);
    };
  }, [currentSlide, movies.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setProgress(0);
  };

  if (!movies.length) return null;

  const currentMovie = movies[currentSlide];

  // Split title for last word highlight
  const titleWords = (currentMovie.title || currentMovie.name || '').split(' ');
  const titleMain = titleWords.slice(0, -1).join(' ');
  const titleHighlight = titleWords[titleWords.length - 1];

  // Get media type badge text
  const mediaType = currentMovie.media_type === 'tv' ? 'TV' : 'Movie';

  // Get year
  const year = currentMovie.release_date?.substring(0, 4) ||
    currentMovie.first_air_date?.substring(0, 4) || 'N/A';

  // Get content rating (simplified - you may want to fetch actual ratings)
  const contentRating = currentMovie.adult ? 'R' : 'PG-13';

  return (
    <div className="banner-slider">
      {/* Progress Bar */}
      <div className="banner-progress">
        <div
          className="banner-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="banner-slide">
        {/* Background Image with Mask */}
        <div
          className="banner-backdrop"
          style={{
            backgroundImage: `url(${BACKDROP_URL}${currentMovie.backdrop_path})`
          }}
        />

        <div className="banner-content">
          {/* Title with Last Word Highlighted */}
          <h1 className="banner-title-new">
            {titleMain} <span className="title-highlight">{titleHighlight}</span>
          </h1>

          {/* Outline Badges */}
          <div className="banner-badges">
            <span className="banner-badge">{mediaType}</span>
            <span className="banner-badge">{year}</span>
            <span className="banner-badge">{contentRating}</span>
          </div>

          {/* Description */}
          <p className="banner-description-new">
            {currentMovie.overview?.length > 250
              ? `${currentMovie.overview.substring(0, 250)}...`
              : currentMovie.overview
            }
          </p>

          {/* Buttons */}
          <div className="banner-buttons-new">
            <a
              href={`/watch?type=${currentMovie.media_type || 'movie'}&id=${currentMovie.id}`}
              className="btn-play-now-new"
            >
              <span className="btn-icon">▶</span>
              Play Now
            </a>
            <button
              className="btn-outline-new"
              onClick={() => onItemClick(currentMovie)}
            >
              <span className="btn-icon">ⓘ</span>
              More Info
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        className="banner-nav-btn banner-nav-prev"
        onClick={() => goToSlide((currentSlide - 1 + movies.length) % movies.length)}
        aria-label="Previous slide"
      >
        ❮
      </button>
      <button
        className="banner-nav-btn banner-nav-next"
        onClick={() => goToSlide((currentSlide + 1) % movies.length)}
        aria-label="Next slide"
      >
        ❯
      </button>
    </div>
  );
};

export default BannerSlider;