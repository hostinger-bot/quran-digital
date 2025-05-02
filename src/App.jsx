import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SurahList from './components/SurahList';
import SurahDetail from './components/SurahDetail';
import SearchSurah from './components/SearchSurah';

function App() {
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const appContainerRef = useRef(null);

  useEffect(() => {
    axios
      .get('https://equran.id/api/v2/surat')
      .then((response) => {
        if (response.data.code === 200) {
          setSurahs(response.data.data);
          setLoading(false);
        } else {
          setError('Failed to fetch surah list');
          setLoading(false);
        }
      })
      .catch((err) => {
        setError('Error fetching surah list: ' + err.message);
        setLoading(false);
      });
  }, []);

  // Update scroll progress sabtu, tgl 3 2025 (Tio)
  useEffect(() => {
    const handleScroll = () => {
      if (appContainerRef.current) {
        const scrollTop = window.scrollY;
        const scrollHeight = appContainerRef.current.scrollHeight - window.innerHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        setScrollProgress(progress > 100 ? 100 : progress < 0 ? 0 : progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showSearch, selectedSurah]);

  const handleSelectSurah = (nomor) => {
    setLoading(true);
    axios
      .get(`https://equran.id/api/v2/surat/${nomor}`)
      .then((response) => {
        if (response.data.code === 200) {
          setSelectedSurah(response.data.data);
          setShowSearch(false);
          setLoading(false);
          window.scrollTo(0, 0);
        } else {
          setError('Failed to fetch surah details');
          setLoading(false);
        }
      })
      .catch((err) => {
        setError('Error fetching surah details: ' + err.message);
        setLoading(false);
      });
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    setSelectedSurah(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-text">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="back-button mt-4"
        >
          <i className="fas fa-redo-alt mr-2"></i> Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="app-container" ref={appContainerRef}>
      <nav className="navbar">
        <button onClick={toggleSearch} className="search-button">
          <i className={showSearch ? "fas fa-times" : "fas fa-search"}></i>
        </button>
      </nav>
      {showSearch ? (
        <SearchSurah surahs={surahs} onSelectSurah={handleSelectSurah} />
      ) : selectedSurah ? (
        <SurahDetail surah={selectedSurah} onSelectSurah={handleSelectSurah} />
      ) : (
        <SurahList surahs={surahs} onSelectSurah={handleSelectSurah} />
      )}
      <div className="scroll-indicator fixed right-2 top-1/2 transform -translate-y-1/2 h-32 w-2 bg-gray-200 rounded">
        <div
          className="scroll-cursor bg-blue-500 rounded"
          style={{ height: `${scrollProgress}%`, width: '100%' }}
        ></div>
      </div>
      <footer className="footer">
        <a href="/" className="footer-link">
          <i className="fas fa-home mr-2"></i> Back to Home
        </a>
        <p className="footer-date">
          <i className="fas fa-calendar-alt mr-2"></i> {new Date().toLocaleDateString()} BOTCAHX
        </p>
      </footer>
    </div>
  );
}

export default App;