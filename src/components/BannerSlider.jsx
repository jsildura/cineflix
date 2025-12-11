import React, { useState, useEffect } from 'react';
import { useTMDB } from '../hooks/useTMDB';

const BannerSlider = ({ movies, onItemClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [movieDetails, setMovieDetails] = useState({});
  const { BACKDROP_URL, movieGenres, fetchCredits } = useTMDB();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % movies.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [movies.length]);

  useEffect(() => {
    // Fetch additional details for current movie
    const fetchDetails = async () => {
      const movie = movies[currentSlide];
      if (!movie) return;

      try {
        const type = movie.media_type || 'movie';
        const cast = await fetchCredits(type, movie.id);

        setMovieDetails({
          cast: cast.slice(0, 3) // Get top 3 cast members
        });
      } catch (error) {
        console.error('Failed to fetch movie details:', error);
      }
    };

    fetchDetails();
  }, [currentSlide, movies, fetchCredits]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  if (!movies.length) return null;

  const currentMovie = movies[currentSlide];
  const rating = currentMovie.vote_average || 0;
  const fullStars = Math.floor(rating / 2);
  const hasHalfStar = (rating / 2) % 1 >= 0.5;

  // Get genre names from IDs
  const genreNames = currentMovie.genre_ids
    ?.map(id => movieGenres.get(id))
    .filter(Boolean)
    .slice(0, 3) || [];

  return (
    <div className="banner-slider">
      <div
        className="banner-slide"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.85) 40%, transparent 70%), 
                           linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%),
                           url(${BACKDROP_URL}${currentMovie.backdrop_path})`
        }}
      >
        <div className="banner-content">
          <h1 className="banner-title texture-text">{currentMovie.title || currentMovie.name}</h1>

          <div className="banner-meta-enhanced">
            <span className="slider-badge">Now Playing in Theater</span>

            <div className="slider-ratting">
              {[...Array(5)].map((_, i) => (
                <i
                  key={i}
                  className={`fa${i < fullStars ? 's' : (i === fullStars && hasHalfStar ? 's' : 'r')} fa-star`}
                  style={{ color: i < fullStars || (i === fullStars && hasHalfStar) ? '#ffc107' : '#666' }}
                >★</i>
              ))}
            </div>

            <div className="imdb-ratting">
              <span className="imdb-logo">IMDb</span>
              <span className="imdb-score">{rating.toFixed(1)}</span>
            </div>

            <div className="duration-display">
              <i className="far fa-clock">⏱</i>
              <span>{currentMovie.release_date?.substring(0, 4) || currentMovie.first_air_date?.substring(0, 4)}</span>
            </div>
          </div>

          <p className="banner-description line-count-3">
            {currentMovie.overview?.length > 200
              ? `${currentMovie.overview.substring(0, 200)}...`
              : currentMovie.overview
            }
          </p>

          {(genreNames.length > 0 || movieDetails.cast?.length > 0) && (
            <div className="gener-tag trending-list">
              {genreNames.length > 0 && (
                <div className="metadata-row">
                  <span className="metadata-label">Genres:</span>
                  <span className="metadata-value">
                    {genreNames.map((genre, idx) => (
                      <span key={idx}>
                        {genre}{idx < genreNames.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </span>
                </div>
              )}

              {movieDetails.cast?.length > 0 && (
                <div className="metadata-row">
                  <span className="metadata-label">Starring:</span>
                  <span className="metadata-value">
                    {movieDetails.cast.map((actor, idx) => (
                      <span key={idx}>
                        {actor}{idx < movieDetails.cast.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="banner-buttons">
            <a
              href={`/watch?type=${currentMovie.media_type || 'movie'}&id=${currentMovie.id}`}
              className="btn btn-primary btn-play-now"
            >
              <span className="d-flex align-items-center gap-2">
                <span>Play Now</span>
                <i className="play-icon-arrow">▶</i>
              </span>
            </a>
            <button
              className="btn btn-secondary"
              onClick={() => onItemClick(currentMovie)}
            >
              <span className="info-icon">ⓘ</span>
              More Info
            </button>
          </div>
        </div>
      </div>

      <div className="banner-dots">
        {movies.map((_, index) => (
          <button
            key={index}
            className={`banner-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerSlider;