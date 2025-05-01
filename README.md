### Quran Digital App

Quran Digital App adalah aplikasi berbasis web yang dibangun menggunakan React dan Vite. Aplikasi ini memungkinkan pengguna untuk membaca Al-Qur'an secara digital, melihat daftar surah, dan menampilkan detail surah dengan terjemahan dan audio. Data diambil dari API [EQuran](https://equran.id/apidev/v2).

### Fitur
- Daftar semua surah dalam Al-Qur'an.
- Detail surah termasuk teks Arab, transliterasi, terjemahan, dan audio.
- Fitur pencarian surah.

### Teknologi
- **React**: Library JavaScript untuk membangun antarmuka pengguna.
- **Vite**: Build tool untuk pengembangan frontend yang cepat dengan Hot Module Replacement (HMR).
- **Axios**: Untuk mengambil data dari API eQuran.
- **FontAwesome**: Ikon untuk elemen UI seperti footer.

### Cara Menjalankan
1. Clone repository ini:
   ```bash
   git clone https://github.com/hostinger-bot/quran-digital
   ```
2. Masuk ke direktori proyek:
   ```bash
   cd quran-digital
   ```
3. Install dependensi:
   ```bash
   npm install
   ```
4. Jalankan aplikasi dalam mode development:
   ```bash
   npm run dev
   ```
5. Buka `http://localhost:5173` di browser untuk melihat aplikasi.

### Struktur Proyek
- `src/components/`: Berisi komponen React seperti `SurahList`, `SurahDetail`, dan `SearchSurah`.
- `src/App.jsx`: Komponen utama aplikasi.
- `src/index.css`: File CSS global untuk styling aplikasi.

### Kontribusi
Jika Anda ingin berkontribusi, silakan buat pull request atau hubungi pengembang melalui email: <support@tioprm.eu.org>.



### Lisensi
Proyek ini dilisensi di bawah [MIT License](LICENSE).
