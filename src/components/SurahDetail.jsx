import { useState, useEffect, useRef } from 'react';

function SurahDetail({ surah, onSelectSurah }) {
  const [currentAudio, setCurrentAudio] = useState(null);
  const [selectedReciter, setSelectedReciter] = useState('05');
  const [isFullAudioPlaying, setIsFullAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [expandDescription, setExpandDescription] = useState(false);
  const ayatRefs = useRef([]);
  const audioRef = useRef(null);

  const reciters = {
    '01': 'Abdullah Al-Juhany',
    '02': 'Abdul-Muhsin Al-Qasim',
    '03': 'Abdurrahman as-Sudais',
    '04': 'Ibrahim Al-Dossari',
    '05': 'Misyari Rasyid Al-Afasi',
  };

  const playAyatAudio = (url, ayatIndex) => {
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

    const ayatElement = ayatRefs.current[ayatIndex];
    if (ayatElement) {
      ayatElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

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
        setCurrentTime(audioRef.current.currentTime);
        setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
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

  return (
    <div className="surah-detail-container flex flex-col items-center p-4 pt-16">
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
        <div className="ayat-list">
          {surah.ayat.map((ayat, index) => (
            <div
              key={ayat.nomorAyat}
              ref={(el) => (ayatRefs.current[index] = el)}
              className="ayat-card"
            >
              <div className="ayat-header">
                <h3 className="ayat-number">
                  <i className="fas fa-bookmark mr-2"></i>
                  {ayat.nomorAyat}
                </h3>
                <button
                  onClick={() => playAyatAudio(ayat.audio[selectedReciter], index)}
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