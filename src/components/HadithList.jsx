import { useState, useEffect } from 'react';
import axios from 'axios';

function HadithList() {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [hadithNumber, setHadithNumber] = useState('');
  const [hadithData, setHadithData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('https://api.hadith.gading.dev/books');
        if (response.data.code === 200) {
          setBooks(response.data.data);
        } else {
          setError('Gagal mengambil daftar buku hadis');
        }
      } catch (err) {
        setError('Error fetching books: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const fetchHadith = async () => {
    if (!selectedBook || !hadithNumber) {
      setError('Pilih buku dan nomor hadis terlebih dahulu');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`https://api.hadith.gading.dev/books/${selectedBook.id}/${hadithNumber}`);
      if (response.data.code === 200) {
        setHadithData(response.data.data.contents);
        setError(null);
      } else {
        setError('Hadis tidak ditemukan');
      }
    } catch (err) {
      setError('Error fetching hadith: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNumberChange = (e) => {
    const value = e.target.value;
    if (value === '' || (Number(value) >= 1 && Number(value) <= (selectedBook ? selectedBook.available : Infinity))) {
      setHadithNumber(value);
      setError(null);
    } else {
      setError(`Nomor harus antara 1 dan ${selectedBook ? selectedBook.available : 'pilih buku'}`);
    }
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
        <button onClick={() => window.location.reload()} className="back-button mt-4">
          <i className="fas fa-redo-alt mr-2" /> Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="hadith-container flex flex-col items-center p-4">
      <h1 className="hadith-title">Daftar Hadis</h1>
      <div className="hadith-selector mb-4">
        <select
          value={selectedBook ? selectedBook.id : ''}
          onChange={(e) => {
            const book = books.find(b => b.id === e.target.value);
            setSelectedBook(book);
            setHadithNumber('');
            setHadithData(null);
          }}
          className="reciter-dropdown"
        >
          <option value="">Pilih Buku Hadis</option>
          {books.map((book) => (
            <option key={book.id} value={book.id}>
              {book.name} ({book.available} Hadis)
            </option>
          ))}
        </select>
        {selectedBook && (
          <div className="mt-2">
            <input
              type="number"
              value={hadithNumber}
              onChange={handleNumberChange}
              placeholder={`Masukkan nomor (1-${selectedBook.available})`}
              className="search-input w-full max-w-xs mt-2"
              min="1"
              max={selectedBook.available}
            />
            <button
              onClick={fetchHadith}
              className="full-audio-button mt-2 px-4 py-2"
              disabled={!hadithNumber}
            >
              <i className="fas fa-play mr-2" /> Tampilkan Hadis
            </button>
          </div>
        )}
      </div>
      {hadithData && (
        <div className="hadith-detail mt-4 p-4 bg-white rounded-lg shadow-md max-w-2xl w-full">
          <h2 className="hadith-number text-xl font-bold text-1A3C34 mb-4">
            Hadis No. {hadithData.number}
          </h2>
          <div className="hadith-content space-y-4">
            <div className="ayat-container bg-yellow-100 border-l-4 border-yellow-600 p-4 rounded transition-all duration-300">
              <p className="ayat-arabic text-right text-2xl font-arabic">{hadithData.arab}</p>
            </div>
            <div className="hadith-translation-container bg-yellow-100 border-l-4 border-yellow-600 p-4 rounded transition-all duration-300">
              <p className="hadith-text text-gray-700 italic">{hadithData.id}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HadithList;