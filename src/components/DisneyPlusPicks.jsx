import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './DisneyPlusPicks.css';

const BACKDROP_URL = 'https://image.tmdb.org/t/p/w780';

// TMDB Genre IDs
const GENRE_IDS = {
    action: 28,
    romance: 10749,
    comedy: 35,
    horror: 27
};

// TV Genre IDs (different from movie genres in TMDB)
const TV_GENRE_IDS = {
    action: 10759, // Action & Adventure
    romance: 10749,
    comedy: 35,
    horror: 9648 // Mystery (closest to horror for TV)
};

const DisneyPlusPicks = () => {
    const navigate = useNavigate();
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerView, setItemsPerView] = useState(5);
    const [selectedGenre, setSelectedGenre] = useState(null);

    // Fetch Disney+ content based on selected genre
    const fetchDisneyContent = async (genre = null) => {
        try {
            setLoading(true);

            // Disney+ provider ID is 337 in TMDB
            let movieUrl = '/api/discover/movie?with_watch_providers=337&watch_region=US&sort_by=popularity.desc';
            let tvUrl = '/api/discover/tv?with_watch_providers=337&watch_region=US&sort_by=popularity.desc';

            // Add genre filter if selected
            if (genre && GENRE_IDS[genre]) {
                movieUrl += `&with_genres=${GENRE_IDS[genre]}`;
                tvUrl += `&with_genres=${TV_GENRE_IDS[genre]}`;
            }

            const [moviesRes, tvRes] = await Promise.all([
                fetch(movieUrl),
                fetch(tvUrl)
            ]);

            if (!moviesRes.ok || !tvRes.ok) {
                throw new Error('Failed to fetch Disney+ content');
            }

            const moviesData = await moviesRes.json();
            const tvData = await tvRes.json();

            // Combine and interleave movies and TV shows
            const combinedContent = [];
            const maxItems = Math.max(moviesData.results?.length || 0, tvData.results?.length || 0);

            for (let i = 0; i < maxItems && combinedContent.length < 20; i++) {
                if (moviesData.results?.[i]) {
                    combinedContent.push({ ...moviesData.results[i], media_type: 'movie' });
                }
                if (tvData.results?.[i] && combinedContent.length < 20) {
                    combinedContent.push({ ...tvData.results[i], media_type: 'tv' });
                }
            }

            setContent(combinedContent);
            setCurrentIndex(0);
        } catch (err) {
            console.error('Error fetching Disney+ content:', err);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchDisneyContent();
    }, []);

    // Fetch when genre changes
    useEffect(() => {
        fetchDisneyContent(selectedGenre);
    }, [selectedGenre]);

    // Calculate items per view based on screen width
    useEffect(() => {
        const updateItemsPerView = () => {
            const width = window.innerWidth;
            if (width >= 3840) {
                setItemsPerView(5); // 4K
            } else if (width >= 1280) {
                setItemsPerView(5); // Desktop XL
            } else if (width >= 1024) {
                setItemsPerView(4); // Desktop
            } else if (width >= 768) {
                setItemsPerView(3); // Tablet
            } else if (width >= 640) {
                setItemsPerView(2); // Small tablet
            } else {
                setItemsPerView(1); // Mobile
            }
        };

        updateItemsPerView();
        window.addEventListener('resize', updateItemsPerView);
        return () => window.removeEventListener('resize', updateItemsPerView);
    }, []);

    const maxIndex = Math.max(0, content.length - itemsPerView);

    const handlePrevious = () => {
        setCurrentIndex(prev => Math.max(0, prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
    };

    const handleItemClick = (item) => {
        const type = item.media_type || 'movie';
        navigate(`/watch?type=${type}&id=${item.id}`);
    };

    const handleGenreClick = (genre) => {
        setSelectedGenre(selectedGenre === genre ? null : genre);
    };

    const translateX = currentIndex * (100 / itemsPerView);



    return (
        <div className="disneyplus-section">
            {/* Header with Disney+ branding */}
            <div className="disneyplus-header">
                <div className="disneyplus-header-left">
                    <div className="disneyplus-header-accent"></div>
                    <h2 className="disneyplus-title">Disney+ Picks</h2>
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Disney%2B_logo.svg/1280px-Disney%2B_logo.svg.png"
                        alt="Disney+"
                        className="disneyplus-logo"
                    />
                </div>

                {/* Genre Filter Buttons */}
                <div className="disneyplus-genre-filters">
                    <button
                        className={`disneyplus-genre-btn ${selectedGenre === 'action' ? 'active' : ''}`}
                        onClick={() => handleGenreClick('action')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
                        </svg>
                        <span className="genre-label">Action</span>
                    </button>
                    <button
                        className={`disneyplus-genre-btn ${selectedGenre === 'romance' ? 'active' : ''}`}
                        onClick={() => handleGenreClick('romance')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                        </svg>
                        <span className="genre-label">Romance</span>
                    </button>
                    <button
                        className={`disneyplus-genre-btn ${selectedGenre === 'comedy' ? 'active' : ''}`}
                        onClick={() => handleGenreClick('comedy')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M18 13a6 6 0 0 1-6 5 6 6 0 0 1-6-5h12Z"></path>
                            <line x1="9" x2="9.01" y1="9" y2="9"></line>
                            <line x1="15" x2="15.01" y1="9" y2="9"></line>
                        </svg>
                        <span className="genre-label">Comedy</span>
                    </button>
                    <button
                        className={`disneyplus-genre-btn ${selectedGenre === 'horror' ? 'active' : ''}`}
                        onClick={() => handleGenreClick('horror')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m12.5 17-.5-1-.5 1h1z"></path>
                            <path d="M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z"></path>
                            <circle cx="15" cy="12" r="1"></circle>
                            <circle cx="9" cy="12" r="1"></circle>
                        </svg>
                        <span className="genre-label">Horror</span>
                    </button>
                </div>

                <Link to="/disney" className="disneyplus-view-all">
                    View all
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                </Link>
            </div>

            {/* Carousel */}
            {loading ? (
                <div className="disneyplus-loading">
                    <div className="loading-spinner"></div>
                </div>
            ) : (
                <div className="disneyplus-carousel" role="region" aria-roledescription="carousel">
                    <div className="disneyplus-carousel-viewport">
                        <div
                            className="disneyplus-carousel-track"
                            style={{ transform: `translate3d(-${translateX}%, 0px, 0px)` }}
                        >
                            {content.map((item) => (
                                <div
                                    key={`${item.media_type}-${item.id}`}
                                    className="disneyplus-carousel-slide"
                                    role="group"
                                    aria-roledescription="slide"
                                >
                                    <div
                                        className="disneyplus-card"
                                        onClick={() => handleItemClick(item)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                handleItemClick(item);
                                            }
                                        }}
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`Play ${item.title || item.name}`}
                                    >
                                        <div className="disneyplus-card-gradient"></div>
                                        <img
                                            src={item.backdrop_path ? `${BACKDROP_URL}${item.backdrop_path}` : '/placeholder-backdrop.jpg'}
                                            alt={item.title || item.name}
                                            className="disneyplus-card-image"
                                            loading="lazy"
                                        />
                                        <div className="disneyplus-card-info">
                                            <h3 className="disneyplus-card-title">{item.title || item.name}</h3>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation buttons */}
                    <button
                        className="disneyplus-carousel-btn disneyplus-carousel-prev"
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        aria-label="Previous slide"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m12 19-7-7 7-7"></path>
                            <path d="M19 12H5"></path>
                        </svg>
                    </button>

                    <button
                        className="disneyplus-carousel-btn disneyplus-carousel-next"
                        onClick={handleNext}
                        disabled={currentIndex >= maxIndex}
                        aria-label="Next slide"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
};

export default DisneyPlusPicks;
