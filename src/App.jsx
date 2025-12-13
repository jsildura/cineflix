import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Movies from './pages/Movies';
import TVShows from './pages/TVShows';
import Popular from './pages/Popular';
import Watch from './pages/Watch';
import About from './pages/About';
import Disclaimer from './pages/Disclaimer';
import CollectionDetails from './pages/CollectionDetails';
import Netflix from './pages/Netflix';
import Disney from './pages/Disney';
import PrimeVideo from './pages/PrimeVideo';
import AppleTV from './pages/AppleTV';
import HBO from './pages/HBO';
import Viu from './pages/Viu';
import { useTMDB } from './hooks/useTMDB';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { searchTMDB } = useTMDB();
  const navigate = useNavigate();

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchTMDB(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleItemClick = (item) => {
    // Navigate to Watch page with the selected item
    const type = item.media_type === 'tv' ? 'tv' : 'movie';
    navigate(`/watch?type=${type}&id=${item.id}`);
    setSearchResults([]); // Clear search results when item is clicked
  };

  return (
    <div className="App">
      <ScrollToTop />
      <Navbar
        onSearch={handleSearch} // Changed from onSearchClick to onSearch
        searchResults={searchResults}
        onItemClick={handleItemClick}
        isSearching={isSearching} // Added this prop
      />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/tv-shows" element={<TVShows />} />
          <Route path="/popular" element={<Popular />} />
          <Route path="/watch" element={<Watch />} />
          <Route path="/about" element={<About />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/collection/:id" element={<CollectionDetails />} />
          <Route path="/netflix" element={<Netflix />} />
          <Route path="/disney" element={<Disney />} />
          <Route path="/prime-video" element={<PrimeVideo />} />
          <Route path="/apple-tv" element={<AppleTV />} />
          <Route path="/hbo" element={<HBO />} />
          <Route path="/viu" element={<Viu />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;