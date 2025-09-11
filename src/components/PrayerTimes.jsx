import { useState, useEffect } from 'react';
import axios from 'axios';

function PrayerTimes() {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [monthlyPrayerTimes, setMonthlyPrayerTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCity, setSelectedCity] = useState('');

  // Daftar kota-kota di Indonesia dengan koordinat
  const cities = [
    { name: 'Jakarta', latitude: -6.200000, longitude: 106.816666, province: 'DKI Jakarta' },
    { name: 'Surabaya', latitude: -7.24917, longitude: 112.63667, province: 'Jawa Timur' },
    { name: 'Bandung', latitude: -6.92222, longitude: 107.5714, province: 'Jawa Barat' },
    { name: 'Medan', latitude: 3.58333, longitude: 98.66667, province: 'Sumatera Utara' },
    { name: 'Semarang', latitude: -6.99320, longitude: 110.4208, province: 'Jawa Tengah' },
    { name: 'Makassar', latitude: -5.135399, longitude: 119.423790, province: 'Sulawesi Selatan' },
    { name: 'Yogyakarta', latitude: -7.7956, longitude: 110.3695, province: 'DI Yogyakarta' },
    { name: 'Denpasar', latitude: -8.6705, longitude: 115.2126, province: 'Bali' },
    { name: 'Palembang', latitude: -2.9761, longitude: 104.7754, province: 'Sumatera Selatan' },
    { name: 'Banda Aceh', latitude: 5.548290, longitude: 95.323753, province: 'Aceh' },
    { name: 'Pekanbaru', latitude: 0.5333, longitude: 101.4500, province: 'Riau' },
    { name: 'Batam', latitude: 1.0449, longitude: 103.9573, province: 'Kepulauan Riau' },
    { name: 'Bogor', latitude: -6.5944, longitude: 106.7891, province: 'Jawa Barat' },
    { name: 'Malang', latitude: -7.9828, longitude: 112.6304, province: 'Jawa Timur' },
    { name: 'Depok', latitude: -6.4023, longitude: 106.8181, province: 'Jawa Barat' },
    { name: 'Tangerang', latitude: -6.178306, longitude: 106.631889, province: 'Banten' },
    { name: 'South Tangerang', latitude: -6.2971, longitude: 106.7153, province: 'Banten' },
    { name: 'Bekasi', latitude: -6.2340, longitude: 106.9925, province: 'Jawa Barat' },
    { name: 'Bandar Lampung', latitude: -5.3673, longitude: 105.2565, province: 'Lampung' },
    { name: 'Padang', latitude: -0.9493, longitude: 100.3551, province: 'Sumatera Barat' },
    // Tambahkan kota lain jika diperlukan
  ];

  const retryRequest = async (url, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.get(url);
        return response;
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        setLoading(true);
        setError(null);
        let latitude, longitude, cityName;

        if (selectedCity) {
          const selectedCityData = cities.find(city => city.name === selectedCity);
          if (!selectedCityData) {
            throw new Error('Kota tidak ditemukan');
          }
          latitude = selectedCityData.latitude;
          longitude = selectedCityData.longitude;
          cityName = `${selectedCityData.name}, ${selectedCityData.province}`;
        } else {
          try {
            const ipResponse = await retryRequest('https://freeipapi.com/api/json/');
            ({ latitude, longitude, cityName } = ipResponse.data);
            cityName = cityName || 'Lokasi Anda';
          } catch {
            latitude = -6.200000;
            longitude = 106.816666;
            cityName = 'Jakarta, DKI Jakarta (Fallback)';
          }
        }

        const now = new Date();
        const formattedToday = now.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).split('/').join('-');

        const prayerUrl = `https://api.aladhan.com/v1/timings/${formattedToday}?latitude=${latitude}&longitude=${longitude}&method=15&adjustment=1`;
        const prayerResponse = await retryRequest(prayerUrl);
        setPrayerTimes({
          ...prayerResponse.data.data,
          location: cityName,
          latitude,
          longitude,
        });

        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const monthUrl = `https://api.aladhan.com/v1/calendar?latitude=${latitude}&longitude=${longitude}&method=15&month=${currentMonth}&year=${currentYear}&adjustment=1`;
        const monthResponse = await retryRequest(monthUrl);
        const monthlyData = monthResponse.data.data;
        const todayIndex = monthlyData.findIndex(day => day.date.readable === prayerResponse.data.data.date.readable);
        const next30Days = monthlyData.slice(todayIndex, todayIndex + 30);
        setMonthlyPrayerTimes(next30Days);
      } catch (err) {
        setError(`Gagal mengambil jadwal sholat: ${err.message}. Pastikan koneksi internet stabil atau coba pilih kota secara manual.`);
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerTimes();
  }, [selectedCity]);

  const handleCityChange = (event) => {
    setSelectedCity(event.target.value);
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
          className="back-button mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          <i className="fas fa-redo-alt mr-2" /> Coba Lagi
        </button>
      </div>
    );
  }

  if (!prayerTimes) return null;

  const { timings, date, location, latitude, longitude } = prayerTimes;

  return (
    <div className="prayer-times-container max-w-4xl mx-auto p-6">
      <h1 className="search-title mb-4 text-3xl font-bold text-green-800">Jadwal Sholat</h1>
      <div className="mb-4 flex flex-col sm:flex-row items-center justify-center gap-2">
        <label htmlFor="city-select" className="text-gray-700 font-medium">Pilih Kota:</label>
        <select
          id="city-select"
          value={selectedCity}
          onChange={handleCityChange}
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-64"
        >
          <option value="">Deteksi Lokasi Otomatis (IP)</option>
          {cities
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(city => (
              <option key={city.name} value={city.name}>
                {city.name} ({city.province})
              </option>
            ))}
        </select>
      </div>
      <p className="text-center text-gray-700 mb-2">
        {date.readable} ({date.hijri.date})
      </p>
      <p className="text-center text-gray-600 mb-6">
        Lokasi: {location} (Lat: {latitude.toFixed(4)}, Long: {longitude.toFixed(4)})
      </p>
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-green-50">
              <th className="border-b border-green-200 p-3 text-green-800 font-semibold">Sholat</th>
              <th className="border-b border-green-200 p-3 text-green-800 font-semibold">Waktu</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(timings).map(([key, value]) =>
              key !== 'Midnight' && key !== 'Firstthird' && key !== 'Lastthird' && (
                <tr key={key} className="hover:bg-green-50 transition-colors">
                  <td className="border-b border-green-100 p-3 capitalize text-gray-800">{key.toLowerCase()}</td>
                  <td className="border-b border-green-100 p-3 text-gray-800">{value}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-green-800">Jadwal Sholat 30 Hari ke Depan</h2>
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-green-50">
              <th className="border-b border-green-200 p-3 text-green-800 font-semibold min-w-[120px]">Tanggal</th>
              <th className="border-b border-green-200 p-3 text-green-800 font-semibold min-w-[80px]">Fajr</th>
              <th className="border-b border-green-200 p-3 text-green-800 font-semibold min-w-[80px]">Dhuhr</th>
              <th className="border-b border-green-200 p-3 text-green-800 font-semibold min-w-[80px]">Asr</th>
              <th className="border-b border-green-200 p-3 text-green-800 font-semibold min-w-[80px]">Maghrib</th>
              <th className="border-b border-green-200 p-3 text-green-800 font-semibold min-w-[80px]">Isha</th>
            </tr>
          </thead>
          <tbody>
            {monthlyPrayerTimes.map((day, index) => (
              <tr key={index} className="hover:bg-green-50 transition-colors">
                <td className="border-b border-green-100 p-3 text-gray-800 whitespace-nowrap">{day.date.readable}</td>
                <td className="border-b border-green-100 p-3 text-gray-800">{day.timings.Fajr}</td>
                <td className="border-b border-green-100 p-3 text-gray-800">{day.timings.Dhuhr}</td>
                <td className="border-b border-green-100 p-3 text-gray-800">{day.timings.Asr}</td>
                <td className="border-b border-green-100 p-3 text-gray-800">{day.timings.Maghrib}</td>
                <td className="border-b border-green-100 p-3 text-gray-800">{day.timings.Isha}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PrayerTimes;