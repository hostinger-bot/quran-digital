import { useState } from 'react';

function SearchSurah({ surahs, onSelectSurah }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

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
      setSuggestions([]);
      return;
    }

    const filtered = surahs
      .map((surah) => ({
        ...surah,
        distance: Math.min(
          getLevenshteinDistance(value.toLowerCase(), surah.namaLatin.toLowerCase()),
          getLevenshteinDistance(value.toLowerCase(), surah.arti.toLowerCase())
        ),
      }))
      .filter((surah) => surah.distance <= 5 || surah.namaLatin.toLowerCase().includes(value.toLowerCase()))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);

    setSuggestions(filtered);
  };

  return (
    <div className="search-container flex flex-col items-center p-4">
      <h1 className="search-title">Cari Surah</h1>
      <div className="search-input-container">
        <i className="fas fa-search search-icon"></i>
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Masukkan nama surah atau arti..."
          className="search-input"
        />
      </div>
      <div className="suggestion-list">
        {suggestions.map((surah) => (
          <div
            key={surah.nomor}
            className="suggestion-item"
            onClick={() => onSelectSurah(surah.nomor)}
          >
            <h2 className="suggestion-title">
              {surah.nomor}. {surah.namaLatin}
            </h2>
            <p className="suggestion-meaning">{surah.arti}</p>
            <p className="suggestion-info">
              <i className="fas fa-book-open mr-2"></i>
              {surah.jumlahAyat} Ayat | {surah.tempatTurun}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchSurah;