import React from 'react';

function TafsirSurah({ tafsir, arabicText, onClose }) {
  return (
    <div className="tafsir-container fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="tafsir-card bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="tafsir-title text-2xl font-semibold">Tafsir Ayat {tafsir.ayat}</h2>
          <button onClick={onClose} className="close-button text-gray-600 hover:text-gray-800">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="tafsir-content">
          <p className="ayat-arabic text-right text-2xl mb-4 font-arabic">{arabicText}</p>
          <p className="tafsir-text text-gray-700">{tafsir.teks}</p>
        </div>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

export default TafsirSurah;