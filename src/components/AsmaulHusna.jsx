import { useState, useEffect } from 'react';
import axios from 'axios';

function AsmaulHusna() {
  const [asmaulHusna, setAsmaulHusna] = useState([]);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null);

  useEffect(() => {
    const fetchAsmaulHusna = async () => {
      try {
        const response = await axios.get('https://asmaul-husna-api.vercel.app/api/all');
        if (response.data.statusCode === 200) {
          setAsmaulHusna(response.data.data);
          setSuggestions(response.data.data);
        } else {
          setError('Gagal mengambil data Asmaul Husna');
        }
      } catch (err) {
        setError('Gagal mengambil data Asmaul Husna: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAsmaulHusna();
  }, []);

  const getLevenshteinDistance = (a, b) => {
    const matrix = Array(b.length + 1).fill().map(() => Array(a.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    return matrix[b.length][a.length];
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length === 0) {
      setSuggestions(asmaulHusna);
      return;
    }

    const filtered = asmaulHusna
      .map((item) => ({
        ...item,
        distance: Math.min(
          getLevenshteinDistance(value.toLowerCase(), item.latin.toLowerCase()),
          getLevenshteinDistance(value.toLowerCase(), item.arti.toLowerCase())
        ),
      }))
      .filter((item) => item.distance <= 5 || item.latin.toLowerCase().includes(value.toLowerCase()))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);

    setSuggestions(filtered);
  };

  const toggleExpand = (urutan) => {
    setExpandedItem(expandedItem === urutan ? null : urutan);
  };

  if (loading) {
    return (
      <div className="loading-container flex justify-center items-center h-screen">
        <div className="loading-spinner" />
        <p className="loading-text ml-2">Memuat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container text-center p-4">
        <p className="error-text text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="back-button mt-4"
        >
          <i className="fas fa-redo-alt mr-2" /> Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="search-container flex flex-col items-center p-4">
      <h1 className="search-title">Cari Asmaul Husna</h1>
      <div className="search-input-container">
        <i className="fas fa-search search-icon"></i>
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Masukkan nama atau arti Asmaul Husna..."
          className="search-input"
        />
      </div>
      <div className="suggestion-list">
        {suggestions.map((item) => (
          <div
            key={item.urutan}
            className="suggestion-item"
            onClick={() => toggleExpand(item.urutan)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="suggestion-title">
                  {item.urutan}. {item.latin}
                </h2>
                <p className="suggestion-meaning">{item.arti}</p>
              </div>
              <i className={`fas fa-chevron-${expandedItem === item.urutan ? 'up' : 'down'} text-gray-500`}></i>
            </div>
            {expandedItem === item.urutan && (
              <div className="ayat-card transition-all duration-300 mt-2 p-1.5 border-b border-gray-200">
                <div className="ayat-header flex justify-between items-center mb-1 pb-0.5 border-b border-dashed border-gray-200">
                  <h3 className="ayat-number flex items-center gap-0.5 text-base font-bold text-green-800">
                    <i className="fas fa-bookmark" /> {item.urutan}
                  </h3>
                </div>
                <p className="ayat-arabic">{item.arab}</p>
                <p className="ayat-latin">{item.latin}</p>
                <p className="ayat-translation">{item.arti}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AsmaulHusna;