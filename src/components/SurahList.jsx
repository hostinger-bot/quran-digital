function SurahList({ surahs, onSelectSurah }) {
  return (
    <>
      <div className="surah-list-container flex flex-col items-center p-4">
        <h1 className="surah-list-title">Daftar Surah</h1>
        <div className="surah-grid">
          {surahs.map((surah) => (
            <div
              key={surah.nomor}
              className="surah-card"
              onClick={() => onSelectSurah(surah.nomor)}
            >
              <h2 className="surah-card-title">
                {surah.nomor}. {surah.namaLatin}
              </h2>
              <p className="surah-card-meaning">{surah.arti}</p>
              <p className="surah-card-info">
                <i className="fas fa-book-open mr-2"></i>
                {surah.jumlahAyat} Ayat | {surah.tempatTurun}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default SurahList;