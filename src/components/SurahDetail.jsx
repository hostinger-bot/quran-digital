import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import TafsirSurah from './TafsirSurah';

function SurahDetail({ surah, onSelectSurah }) {
  const [currentAudio, setCurrentAudio] = useState(null);
  const [selectedReciter, setSelectedReciter] = useState('05');
  const [isFullAudioPlaying, setIsFullAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [expandDescription, setExpandDescription] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);
  const [selectedTafsir, setSelectedTafsir] = useState(null);
  const [tafsirData, setTafsirData] = useState([]);
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const [tafsirError, setTafsirError] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const audioRef = useRef(null);
  const ayatListRef = useRef(null);

  const reciters = {
    '01': 'Abdullah Al-Juhany',
    '02': 'Abdul-Muhsin Al-Qasim',
    '03': 'Abdurrahman as-Sudais',
    '04': 'Ibrahim Al-Dossari',
    '05': 'Misyari Rasyid Al-Afasi',
  };

  // Update scroll progress sabtu, tgl 3 2025 (Tio)
  useEffect(() => {
    const handleScroll = () => {
      if (ayatListRef.current) {
        const scrollTop = window.scrollY;
        const scrollHeight = ayatListRef.current.scrollHeight - window.innerHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        setScrollProgress(progress > 100 ? 100 : progress < 0 ? 0 : progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [surah]);

  useEffect(() => {
    setTafsirLoading(true);
    axios
      .get(`https://equran.id/api/v2/tafsir/${surah.nomor}`)
      .then((response) => {
        if (response.data.code === 200) {
          setTafsirData(response.data.data.tafsir);
          setTafsirLoading(false);
        } else {
          setTafsirError('Failed to fetch tafsir');
          setTafsirLoading(false);
        }
      })
      .catch((err) => {
        setTafsirError('Error fetching tafsir: ' + err.message);
        setTafsirLoading(false);
      });
  }, [surah.nomor]);

  const playAyatAudio = (url) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsFullAudioPlaying(false);
    }
    const audio = new Audio(url);
    audio.play();
    setCurrentAudio(audio);

    audio.onended = () => {
      setCurrentAudio(null);
    };
  };

  const playFullAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    if (!audioRef.current) {
      audioRef.current = new Audio(surah.audioFull[selectedReciter]);
      audioRef.current.ontimeupdate = () => {
        const current = audioRef.current.currentTime;
        setCurrentTime(current);
        setAudioProgress((current / audioRef.current.duration) * 100);
      };
      audioRef.current.onloadedmetadata = () => {
        setDuration(audioRef.current.duration);
      };
      audioRef.current.onended = () => {
        setIsFullAudioPlaying(false);
        setAudioProgress(0);
        setCurrentTime(0);
      };
    }
    audioRef.current.play();
    setIsFullAudioPlaying(true);
  };

  const pauseFullAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsFullAudioPlaying(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [currentAudio, surah]);

  const toggleDescription = () => {
    setExpandDescription(!expandDescription);
  };

  const toggleTafsir = (ayatNumber) => {
    const tafsir = tafsirData.find((item) => item.ayat === parseInt(ayatNumber));
    const ayat = surah.ayat.find((item) => item.nomorAyat === ayatNumber);
    setSelectedTafsir({
      tafsir: tafsir || null,
      arabicText: ayat ? ayat.teksArab : 'Teks Arab tidak tersedia'
    });
    setShowTafsir(!!tafsir);
  };

  return (
    <div className="surah-detail-container flex flex-col items-center p-4 pt-16 relative">
      <div className="surah-detail-card">
        <h1 className="surah-detail-title">
          {surah.nomor}. {surah.namaLatin} ({surah.arti})
        </h1>
        <p className="surah-detail-info">
          <i className="fas fa-mosque mr-2"></i>
          {surah.jumlahAyat} Ayat | {surah.tempatTurun}
        </p>
        <div className={`surah-detail-description ${expandDescription ? 'description-expanded' : ''}`}
             dangerouslySetInnerHTML={{ __html: surah.deskripsi }}>
        </div>
        <button 
          className={`read-more-button ${expandDescription ? 'expanded' : ''}`}
          onClick={toggleDescription}
        >
          {expandDescription ? 'Sembunyikan' : 'Baca Selengkapnya'} 
          <i className={expandDescription ? 'fas fa-chevron-up ml-2' : 'fas fa-chevron-down ml-2'}></i>
        </button>
        
        <div className="reciter-selector mb-4">
          <label className="reciter-label">Select Reciter:</label>
          <select
            value={selectedReciter}
            onChange={(e) => setSelectedReciter(e.target.value)}
            className="reciter-dropdown"
          >
            {Object.entries(reciters).map(([key, name]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="full-audio-controls mb-6">
          <button
            onClick={isFullAudioPlaying ? pauseFullAudio : playFullAudio}
            className={`full-audio-button px-4 py-2 ${isFullAudioPlaying ? 'playing' : ''}`}
          >
            <i className={isFullAudioPlaying ? 'fas fa-pause mr-2' : 'fas fa-play mr-2'}></i>
            {isFullAudioPlaying ? 'Pause Full Audio' : 'Play Full Audio'}
          </button>
          <div className="audio-progress-container">
            <div className="audio-progress-bar" style={{ width: `${audioProgress}%` }}></div>
          </div>
          <div className="audio-time">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        <div className="ayat-list" ref={ayatListRef}>
          {surah.ayat.map((ayat, index) => (
            <div
              key={ayat.nomorAyat}
              className="ayat-card"
            >
              <div className="ayat-header">
                <h3 className="ayat-number">
                  <i className="fas fa-bookmark mr-2"></i>
                  {ayat.nomorAyat}
                  <button
                    onClick={() => toggleTafsir(ayat.nomorAyat)}
                    className="tafsir-button ml-2 px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    <i className="fas fa-book mr-1"></i>
                    Tafsir
                  </button>
                </h3>
                <button
                  onClick={() => playAyatAudio(ayat.audio[selectedReciter])}
                  className={`play-button px-3 py-1 ${currentAudio && currentAudio.src === ayat.audio[selectedReciter] ? 'playing' : ''}`}
                >
                  <i className={currentAudio && currentAudio.src === ayat.audio[selectedReciter] ? 'fas fa-pause mr-2' : 'fas fa-play mr-2'}></i>
                  {currentAudio && currentAudio.src === ayat.audio[selectedReciter] ? 'Playing' : 'Play'}
                </button>
              </div>
              <p className="ayat-arabic">{ayat.teksArab}</p>
              <p className="ayat-latin">{ayat.teksLatin}</p>
              <p className="ayat-translation">{ayat.teksIndonesia}</p>
            </div>
          ))}
        </div>
        <div className="scroll-indicator fixed right-2 top-1/2 transform -translate-y-1/2 h-32 w-2 bg-gray-200 rounded">
          <div
            className="scroll-cursor bg-blue-500 rounded"
            style={{ height: `${scrollProgress}%`, width: '100%' }}
          ></div>
        </div>
        {showTafsir && selectedTafsir && (
          <TafsirSurah
            tafsir={selectedTafsir.tafsir}
            arabicText={selectedTafsir.arabicText}
            onClose={() => setShowTafsir(false)}
          />
        )}
        {tafsirLoading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading tafsir data...</p>
          </div>
        )}
        {tafsirError && (
          <div className="error-container">
            <p className="error-text">{tafsirError}</p>
          </div>
        )}
        <div className="navigation-buttons flex justify-between mt-6">
          {surah.suratSebelumnya && (
            <button
              onClick={() => onSelectSurah(surah.suratSebelumnya.nomor)}
              className="modern-nav-button px-4 py-2"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              {surah.suratSebelumnya.namaLatin}
            </button>
          )}
          {surah.suratSelanjutnya && (
            <button
              onClick={() => onSelectSurah(surah.suratSelanjutnya.nomor)}
              className="modern-nav-button px-4 py-2"
            >
              {surah.suratSelanjutnya.namaLatin}
              <i className="fas fa-arrow-right ml-2"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default SurahDetail;