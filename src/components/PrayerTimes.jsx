import { useState, useEffect } from 'react';
import axios from 'axios';

function PrayerTimes() {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [monthlyPrayerTimes, setMonthlyPrayerTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocationAndPrayerTimes = async () => {
      try {
        // Ambil lokasi berdasarkan IP
        const ipResponse = await axios.get('https://freeipapi.com/api/json/');
        const { latitude, longitude, cityName, countryName } = ipResponse.data;

        // Ambil waktu lokal dari browser
        const now = new Date();
        const formattedToday = now.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).split('/').join('-'); // Format DD-MM-YYYY

        // Fetch jadwal sholat untuk hari ini
        const prayerResponse = await axios.get(
          `https://api.aladhan.com/v1/timings/${formattedToday}?latitude=${latitude}&longitude=${longitude}&method=15&adjustment=1`
        );
        setPrayerTimes({
          ...prayerResponse.data.data,
          location: `${cityName}, ${countryName}`,
          latitude,
          longitude,
        });

        // Ambil jadwal sholat untuk 30 hari ke depan
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const monthResponse = await axios.get(
          `https://api.aladhan.com/v1/calendar?latitude=${latitude}&longitude=${longitude}&method=15&month=${currentMonth}&year=${currentYear}&adjustment=1`
        );
        const monthlyData = monthResponse.data.data;
        const todayIndex = monthlyData.findIndex(day => day.date.readable === prayerResponse.data.data.date.readable);
        const next30Days = monthlyData.slice(todayIndex, todayIndex + 30);
        setMonthlyPrayerTimes(next30Days);
      } catch (err) {
        setError('Gagal mengambil jadwal sholat: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationAndPrayerTimes();
  }, []);

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

  if (!prayerTimes) return null;

  const { timings, date, location, latitude, longitude } = prayerTimes;

  return (
    <div className="prayer-times-container max-w-4xl mx-auto p-6">
      <h1 className="search-title mb-4">Jadwal Sholat</h1>
      <p className="text-center text-gray-700 mb-2">
        {date.readable} ({date.hijri.date})
      </p>
      <p className="text-center text-gray-600 mb-6">
        Lokasi: {location} (Lat: {latitude}, Long: {longitude})
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

      <h2 className="text-2xl font-semibold mb-4">Jadwal Sholat 30 Hari ke Depan</h2>
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