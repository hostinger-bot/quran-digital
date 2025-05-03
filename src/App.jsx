import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SurahList from './components/SurahList';
import SurahDetail from './components/SurahDetail';
import SearchSurah from './components/SearchSurah';
import PrayerTimes from './components/PrayerTimes';
import AsmaulHusna from './components/AsmaulHusna';
import HadithList from './components/HadithList';

function App() {
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showPrayerTimes, setShowPrayerTimes] = useState(false);
  const [showAsmaulHusna, setShowAsmaulHusna] = useState(false);
  const [showHadithList, setShowHadithList] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
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

  useEffect(() => {
    const handleScroll = () => {
      if (appContainerRef.current) {
        const scrollTop = window.scrollY;
        const scrollHeight = appContainerRef.current.scrollHeight - window.innerHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        setScrollProgress(progress > 100 ? 100 : progress < 0 ? 0 : progress);
        setIsScrolled(scrollTop > 50);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showSearch, selectedSurah, showPrayerTimes, showAsmaulHusna, showHadithList]);

  const handleSelectSurah = (nomor) => {
    setLoading(true);
    axios
      .get(`https://equran.id/api/v2/surat/${nomor}`)
      .then((response) => {
        if (response.data.code === 200) {
          setSelectedSurah(response.data.data);
          setShowSearch(false);
          setShowPrayerTimes(false);
          setShowAsmaulHusna(false);
          setShowHadithList(false);
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
    setShowPrayerTimes(false);
    setShowAsmaulHusna(false);
    setShowHadithList(false);
  };

  const togglePrayerTimes = () => {
    setShowPrayerTimes(!showPrayerTimes);
    setShowSearch(false);
    setSelectedSurah(null);
    setShowAsmaulHusna(false);
    setShowHadithList(false);
    window.scrollTo(0, 0);
  };

  const toggleAsmaulHusna = () => {
    setShowAsmaulHusna(!showAsmaulHusna);
    setShowSearch(false);
    setSelectedSurah(null);
    setShowPrayerTimes(false);
    setShowHadithList(false);
    window.scrollTo(0, 0);
  };

  const toggleHadithList = () => {
    setShowHadithList(!showHadithList);
    setShowSearch(false);
    setSelectedSurah(null);
    setShowPrayerTimes(false);
    setShowAsmaulHusna(false);
    window.scrollTo(0, 0);
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
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-left">
          <button onClick={togglePrayerTimes} className="prayer-button">
            <i className={showPrayerTimes ? "fas fa-times" : "fas fa-pray"}></i>
          </button>
          <button onClick={toggleAsmaulHusna} className="prayer-button">
            <i className={showAsmaulHusna ? "fas fa-times" : "fas fa-book"}></i>
          </button>
        </div>
        <div className="navbar-center">
          <h1 className="navbar-title">Al-Qur'an Digital</h1>
          <p className="navbar-subtitle">Lengkap Dengan Terjamahan</p>
        </div>
        <div className="navbar-right">
          <button onClick={toggleSearch} className="search-button">
            <i className={showSearch ? "fas fa-times" : "fas fa-search"}></i>
          </button>
          <button onClick={toggleHadithList} className="search-button">
            <i className={showHadithList ? "fas fa-times" : "fas fa-book-open"}></i>
          </button>
        </div>
      </nav>
      <div className="main-content">
        {showPrayerTimes ? (
          <PrayerTimes />
        ) : showAsmaulHusna ? (
          <AsmaulHusna />
        ) : showHadithList ? (
          <HadithList />
        ) : showSearch ? (
          <SearchSurah surahs={surahs} onSelectSurah={handleSelectSurah} />
        ) : selectedSurah ? (
          <SurahDetail surah={selectedSurah} onSelectSurah={handleSelectSurah} />
        ) : (
          <SurahList surahs={surahs} onSelectSurah={handleSelectSurah} />
        )}
      </div>
      <div className="scroll-indicator fixed right-2 top-1/2 transform -translate-y-1/2 h-32 w-2 bg-gray-200 rounded">
        <div
          className="scroll-cursor bg-blue-500 rounded"
          style={{ height: `${scrollProgress}%`, width: '100%' }}
        ></div>
      </div>
      <footer className="footer">
        <div className="footer-links">
          <a href="#" onClick={(e) => { e.preventDefault(); window.location.reload(); }} className="footer-link">
            <i className="fas fa-home mr-2"></i> Kembali
          </a>
          <a href="//github.com/hostinger-bot/quran-digital" className="footer-link">
            <i className="fas fa-file-code mr-2"></i> Script
          </a>
        </div>
        <p className="footer-date">
          <i className="fas fa-calendar-alt mr-2"></i> {new Date().toLocaleDateString()} BOTCAHX
        </p>
      </footer>
    </div>
  );
}

export default App;