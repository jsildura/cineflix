import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import './Viu.css';

const Viu = () => {
    const navigate = useNavigate();
    const [movies, setMovies] = useState([]);
    const [tvShows, setTVShows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [moviesPage, setMoviesPage] = useState(1);
    const [tvPage, setTVPage] = useState(1);
    const [moviesTotalPages, setMoviesTotalPages] = useState(1);
    const [tvTotalPages, setTVTotalPages] = useState(1);
    const [loadingMoreMovies, setLoadingMoreMovies] = useState(false);
    const [loadingMoreTV, setLoadingMoreTV] = useState(false);

    useEffect(() => {
        const fetchInitialContent = async () => {
            try {
                // VIU provider ID is 158 - available in Asia (HK, SG, MY, PH, IN)
                const regions = ['HK', 'SG', 'MY', 'PH', 'IN'];
                const moviePromises = [];
                const tvPromises = [];

                for (const region of regions) {
                    for (let page = 1; page <= 2; page++) {
                        moviePromises.push(fetch(`/api/discover/movie?with_watch_providers=158&watch_region=${region}&sort_by=popularity.desc&page=${page}`));
                        tvPromises.push(fetch(`/api/discover/tv?with_watch_providers=158&watch_region=${region}&sort_by=popularity.desc&page=${page}`));
                    }
                }

                const [movieResponses, tvResponses] = await Promise.all([Promise.all(moviePromises), Promise.all(tvPromises)]);
                const movieData = await Promise.all(movieResponses.map(res => res.json()));
                const tvData = await Promise.all(tvResponses.map(res => res.json()));

                setMoviesTotalPages(movieData[0]?.total_pages || 1);
                setTVTotalPages(tvData[0]?.total_pages || 1);

                const allMovies = [];
                const movieIds = new Set();
                movieData.forEach(data => {
                    (data.results || []).forEach(movie => {
                        if (!movieIds.has(movie.id)) {
                            movieIds.add(movie.id);
                            allMovies.push({ ...movie, media_type: 'movie' });
                        }
                    });
                });

                const allTVShows = [];
                const tvIds = new Set();
                tvData.forEach(data => {
                    (data.results || []).forEach(show => {
                        if (!tvIds.has(show.id)) {
                            tvIds.add(show.id);
                            allTVShows.push({ ...show, media_type: 'tv' });
                        }
                    });
                });

                setMovies(allMovies);
                setTVShows(allTVShows);
                setMoviesPage(5);
                setTVPage(5);
            } catch (err) {
                console.error('Error fetching VIU content:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialContent();
    }, []);

    const loadMoreMovies = async () => {
        if (loadingMoreMovies || moviesPage >= moviesTotalPages) return;
        setLoadingMoreMovies(true);
        try {
            const nextPages = [];
            const startPage = moviesPage + 1;
            const endPage = Math.min(moviesPage + 3, moviesTotalPages);
            for (let page = startPage; page <= endPage; page++) {
                nextPages.push(fetch(`/api/discover/movie?with_watch_providers=158&watch_region=HK&sort_by=popularity.desc&page=${page}`));
            }
            const responses = await Promise.all(nextPages);
            const data = await Promise.all(responses.map(res => res.json()));
            const existingIds = new Set(movies.map(m => m.id));
            const newMovies = [];
            data.forEach(d => {
                (d.results || []).forEach(movie => {
                    if (!existingIds.has(movie.id)) {
                        existingIds.add(movie.id);
                        newMovies.push({ ...movie, media_type: 'movie' });
                    }
                });
            });
            setMovies(prev => [...prev, ...newMovies]);
            setMoviesPage(endPage);
        } catch (err) {
            console.error('Error loading more movies:', err);
        } finally {
            setLoadingMoreMovies(false);
        }
    };

    const loadMoreTV = async () => {
        if (loadingMoreTV || tvPage >= tvTotalPages) return;
        setLoadingMoreTV(true);
        try {
            const nextPages = [];
            const startPage = tvPage + 1;
            const endPage = Math.min(tvPage + 3, tvTotalPages);
            for (let page = startPage; page <= endPage; page++) {
                nextPages.push(fetch(`/api/discover/tv?with_watch_providers=158&watch_region=HK&sort_by=popularity.desc&page=${page}`));
            }
            const responses = await Promise.all(nextPages);
            const data = await Promise.all(responses.map(res => res.json()));
            const existingIds = new Set(tvShows.map(s => s.id));
            const newShows = [];
            data.forEach(d => {
                (d.results || []).forEach(show => {
                    if (!existingIds.has(show.id)) {
                        existingIds.add(show.id);
                        newShows.push({ ...show, media_type: 'tv' });
                    }
                });
            });
            setTVShows(prev => [...prev, ...newShows]);
            setTVPage(endPage);
        } catch (err) {
            console.error('Error loading more TV shows:', err);
        } finally {
            setLoadingMoreTV(false);
        }
    };

    const handleItemClick = (item) => navigate(`/watch?type=${item.media_type || 'movie'}&id=${item.id}`);
    const handleBack = () => navigate(-1);

    if (loading) {
        return (
            <div className="viu-page">
                <div className="viu-page-header">
                    <button onClick={handleBack} className="back-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path>
                        </svg>
                        Back
                    </button>
                    <div className="viu-page-title-section">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a8/Viu_logo.svg" alt="VIU" className="viu-page-logo" />
                        <h1 className="viu-page-title">VIU Originals</h1>
                    </div>
                </div>
                <div className="viu-page-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading VIU content...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="viu-page">
            <div className="viu-page-header">
                <button onClick={handleBack} className="back-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path>
                    </svg>
                    Back
                </button>
                <div className="viu-page-title-section">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a8/Viu_logo.svg" alt="VIU" className="viu-page-logo" />
                    <h1 className="viu-page-title">VIU Originals</h1>
                </div>
                <p className="viu-page-subtitle">Popular movies and TV shows available on VIU</p>
            </div>

            <section className="viu-content-section">
                <div className="viu-section-header">
                    <div className="viu-section-accent"></div>
                    <h2 className="viu-section-title">Movies</h2>
                    <span className="viu-section-count">{movies.length} titles</span>
                </div>
                <div className="viu-grid">
                    {movies.map(movie => (<MovieCard key={movie.id} item={movie} onClick={() => handleItemClick(movie)} />))}
                </div>
                {moviesPage < moviesTotalPages && (
                    <div className="load-more-container">
                        <button className="load-more-btn viu-load-more" onClick={loadMoreMovies} disabled={loadingMoreMovies}>
                            {loadingMoreMovies ? <><div className="btn-spinner"></div>Loading...</> : <>Load More Movies<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg></>}
                        </button>
                    </div>
                )}
            </section>

            <section className="viu-content-section">
                <div className="viu-section-header">
                    <div className="viu-section-accent"></div>
                    <h2 className="viu-section-title">TV Shows</h2>
                    <span className="viu-section-count">{tvShows.length} titles</span>
                </div>
                <div className="viu-grid">
                    {tvShows.map(show => (<MovieCard key={show.id} item={show} onClick={() => handleItemClick(show)} />))}
                </div>
                {tvPage < tvTotalPages && (
                    <div className="load-more-container">
                        <button className="load-more-btn viu-load-more" onClick={loadMoreTV} disabled={loadingMoreTV}>
                            {loadingMoreTV ? <><div className="btn-spinner"></div>Loading...</> : <>Load More TV Shows<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg></>}
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Viu;
