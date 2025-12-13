import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTMDB } from '../hooks/useTMDB';

const Watch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  const type = searchParams.get('type');
  const id = searchParams.get('id');

  const [currentServer, setCurrentServer] = useState(0);
  const [currentSeason, setCurrentSeason] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [contentInfo, setContentInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // New state for fullscreen UI
  const [serverDrawerOpen, setServerDrawerOpen] = useState(false);
  const [sandboxEnabled, setSandboxEnabled] = useState(true);
  const [drawerTranslateY, setDrawerTranslateY] = useState(0);

  // Refs for drag handling
  const dragStartY = useRef(0);
  const isDragging = useRef(false);

  const { POSTER_URL } = useTMDB();

  // Server configuration with sandbox support flags
  const servers = [
    {
      name: 'Server 1',
      description: 'Fast and ad-free streaming. Primary recommended server.',
      isRecommended: true,
      sandboxSupport: true,
      getUrl: (s, e) => `https://vidsrc.cc/v2/embed/${type}/${id}${type === 'tv' ? `/${s}/${e}` : ''}?autoPlay=true`
    },
    {
      name: 'Server 2',
      description: 'Good quality with wide movie selection.',
      isRecommended: false,
      sandboxSupport: true,
      getUrl: (s, e) => `https://vidsrc.to/embed/${type}/${id}/${type === 'tv' ? `${s}-${e}` : ''}`
    },
    {
      name: 'Server 3',
      description: '4K support with autoplay and next episode features.',
      isRecommended: true,
      sandboxSupport: false,
      getUrl: (s, e) => `https://player.videasy.net/${type}/${id}${type === 'tv' ? `/${s}/${e}` : ''}?nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true`
    },
    {
      name: 'Server 4',
      description: 'Alternative streaming source.',
      isRecommended: false,
      sandboxSupport: false,
      getUrl: (s, e) => `https://www.2embed.cc/embed/${type}/${id}${type === 'tv' ? `/${s}/${e}` : ''}`
    },
    {
      name: 'Server 5',
      description: 'High-quality streaming with customizable player.',
      isRecommended: false,
      sandboxSupport: false,
      getUrl: (s, e) => `https://vidlink.pro/embed/${type}/${id}${type === 'tv' ? `/${s}/${e}` : ''}`
    },
    {
      name: 'Server 6',
      description: 'Extensive movie collection with fast streaming.',
      isRecommended: false,
      sandboxSupport: false,
      getUrl: (s, e) => `https://vidsrc.xyz/embed/${type}/${id}${type === 'tv' ? `/${s}/${e}` : ''}`
    }
  ];

  useEffect(() => {
    if (type && id) {
      fetchContentData();
    } else {
      setLoading(false);
    }
  }, [type, id]);

  // Update sandbox when server changes
  useEffect(() => {
    setSandboxEnabled(servers[currentServer].sandboxSupport);
  }, [currentServer]);

  const fetchContentData = async () => {
    try {
      setLoading(true);
      const contentRes = await fetch(`/api/${type}/${id}`);
      const contentData = await contentRes.json();
      setContentInfo(contentData);

      if (type === 'tv') {
        await fetchSeasons();
      }
    } catch (error) {
      console.error('Failed to fetch content data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeasons = async () => {
    try {
      const res = await fetch(`/api/tv/${id}`);
      const data = await res.json();
      const validSeasons = data.seasons || [];
      setSeasons(validSeasons);

      if (validSeasons.length > 0) {
        setCurrentSeason(validSeasons[0].season_number);
        await fetchEpisodes(validSeasons[0].season_number);
      }
    } catch (error) {
      console.error('Failed to fetch seasons:', error);
    }
  };

  const fetchEpisodes = async (seasonNumber) => {
    try {
      const res = await fetch(`/api/tv/${id}/season/${seasonNumber}`);
      const data = await res.json();
      setEpisodes(data.episodes || []);
      setCurrentEpisode(1);
    } catch (error) {
      console.error('Failed to fetch episodes:', error);
    }
  };

  const handleSeasonChange = async (seasonNumber) => {
    setCurrentSeason(seasonNumber);
    await fetchEpisodes(seasonNumber);
  };

  const getVideoUrl = () => {
    return servers[currentServer].getUrl(currentSeason, currentEpisode);
  };

  const handleServerSelect = (index) => {
    setCurrentServer(index);
    setSandboxEnabled(servers[index].sandboxSupport);
    setServerDrawerOpen(false);
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Drawer drag handlers
  const drawerTranslateRef = useRef(0);

  const handleDragStart = (clientY) => {
    isDragging.current = true;
    dragStartY.current = clientY;
    drawerTranslateRef.current = 0;
  };

  const handleDragMove = (clientY) => {
    if (!isDragging.current) return;
    const deltaY = clientY - dragStartY.current;
    if (deltaY > 0) {
      drawerTranslateRef.current = deltaY;
      setDrawerTranslateY(deltaY);
    }
  };

  const handleDragEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    // Close drawer if dragged more than 100px down
    if (drawerTranslateRef.current > 100) {
      setServerDrawerOpen(false);
    }
    drawerTranslateRef.current = 0;
    setDrawerTranslateY(0);
  };

  // Mouse events for drawer handle
  const handleMouseDown = (e) => {
    e.preventDefault();
    handleDragStart(e.clientY);

    const onMouseMove = (moveEvent) => {
      handleDragMove(moveEvent.clientY);
    };

    const onMouseUp = () => {
      handleDragEnd();
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Touch events for drawer handle
  const handleTouchStart = (e) => {
    handleDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    handleDragMove(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  if (loading) {
    return (
      <div className="watch-fullscreen">
        <div className="watch-loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading player...</p>
        </div>
      </div>
    );
  }

  if (!type || !id) {
    return (
      <div className="watch-fullscreen">
        <div className="watch-error-overlay">
          <h1>Content Not Found</h1>
          <p>The requested content could not be loaded.</p>
          <button className="watch-overlay-btn" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="watch-fullscreen">
      {/* Video Player - Full Screen */}
      <iframe
        key={`${currentServer}-${currentSeason}-${currentEpisode}-${sandboxEnabled}`}
        src={getVideoUrl()}
        className="watch-video-player"
        allowFullScreen
        title="Video Player"
        {...(sandboxEnabled && {
          sandbox: "allow-scripts allow-same-origin allow-forms"
        })}
      />

      {/* Overlay Buttons */}
      <button className="watch-overlay-btn watch-back-btn" onClick={handleBack}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 19-7-7 7-7"></path>
          <path d="M19 12H5"></path>
        </svg>
        Back
      </button>

      <button className="watch-overlay-btn watch-server-btn" onClick={() => setServerDrawerOpen(true)}>
        Server
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m7 15 5 5 5-5"></path>
          <path d="m7 9 5-5 5 5"></path>
        </svg>
      </button>

      {/* TV Episode Badge */}
      {type === 'tv' && (
        <div className="watch-episode-badge">
          S{currentSeason} • E{currentEpisode}
        </div>
      )}

      {/* Server Drawer Overlay */}
      {serverDrawerOpen && (
        <div className="watch-drawer-overlay" onClick={() => setServerDrawerOpen(false)}>
          <div
            className="watch-drawer"
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: `translateY(${drawerTranslateY}px)`,
              transition: isDragging.current ? 'none' : 'transform 0.3s ease'
            }}
          >
            {/* Drawer Handle */}
            <div
              className="watch-drawer-handle"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            ></div>

            {/* Sandbox Toggle */}
            <div className="watch-sandbox-row">
              <div className="watch-sandbox-info">
                <p className="watch-sandbox-title">
                  Sandbox <span className="watch-sandbox-label">(Adblocker)</span>
                </p>
                <p className="watch-sandbox-desc">
                  Some servers do not support sandbox. Turn it off if video doesn't load.
                </p>
              </div>
              <label className="watch-toggle">
                <input
                  type="checkbox"
                  checked={sandboxEnabled}
                  onChange={(e) => setSandboxEnabled(e.target.checked)}
                />
                <span className="watch-toggle-slider"></span>
              </label>
            </div>

            {/* Server List */}
            <div className="watch-server-list">
              <p className="watch-server-list-title">Select Server</p>
              {servers.map((server, index) => (
                <div
                  key={server.name}
                  className={`watch-server-card ${currentServer === index ? 'active' : ''}`}
                  onClick={() => handleServerSelect(index)}
                >
                  <div className="watch-server-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32">
                      <circle cx="16" cy="16" r="16" fill="#090A15" />
                      <path
                        fill="#fff"
                        fillRule="evenodd"
                        d="M8.004 19.728a.996.996 0 0 1-.008-1.054l7.478-12.199a.996.996 0 0 1 1.753.104l6.832 14.82a.996.996 0 0 1-.618 1.37l-10.627 3.189a.996.996 0 0 1-1.128-.42l-3.682-5.81Zm8.333-9.686a.373.373 0 0 1 .709-.074l4.712 10.904a.374.374 0 0 1-.236.506L14.18 23.57a.373.373 0 0 1-.473-.431l2.63-13.097Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="watch-server-details">
                    <p className="watch-server-name">
                      {server.name}
                      {server.isRecommended && (
                        <span className="watch-server-recommended"> (Recommended)</span>
                      )}
                    </p>
                    <p className="watch-server-desc">{server.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* TV Show Episode Selector */}
            {type === 'tv' && seasons.length > 0 && (
              <div className="watch-episode-section">
                <div className="watch-season-row">
                  <label className="watch-season-label">Season</label>
                  <select
                    value={currentSeason}
                    onChange={(e) => handleSeasonChange(Number(e.target.value))}
                    className="watch-season-select"
                  >
                    {seasons.map(season => (
                      <option key={season.season_number} value={season.season_number}>
                        {season.name} ({season.episode_count} eps)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="watch-episodes-grid">
                  {episodes.map(episode => (
                    <button
                      key={episode.episode_number}
                      className={`watch-episode-btn ${currentEpisode === episode.episode_number ? 'active' : ''}`}
                      onClick={() => setCurrentEpisode(episode.episode_number)}
                    >
                      E{episode.episode_number}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Close Button */}
            <button className="watch-drawer-close" onClick={() => setServerDrawerOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Watch;