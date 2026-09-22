# Presensi Kelas — Update tema & multi-halaman

## Apa yang berubah
- **Tema diganti total** mengikuti referensi (studio biru dengan glass/glow effect): gradient biru langit, ring cahaya neon, tombol pill periwinkle, dan panel kaca (glassmorphism).
- **Landing disederhanakan** — cuma judul, satu baris subjudul, dan dua tombol besar (Dosen / Mahasiswa). Bagian penjelasan langkah 1-2-3 dan teks panjang dihapus.
- **Dipecah jadi halaman terpisah**, bukan satu file dengan toggle screen lagi:
  - `index.html` — landing
  - `dosen.html` — mode dosen
  - `mahasiswa.html` — mode mahasiswa
  - `assets/style.css` — semua styling (tema baru, dipakai bersama)
  - `assets/config.js` — WEB_APP_URL, SHEET_URL, MATA_KULIAH (edit di satu tempat, berlaku ke semua halaman)
  - `assets/common.js` — fungsi util yang dipakai dosen.html & mahasiswa.html
- **Halaman Dosen tidak digrid lagi.** Sebelumnya scanner + tabel mahasiswa side-by-side di layar lebar. Sekarang semuanya satu kolom dan area scanner dibuat besar (min-height 440px, bingkai scan 70%×60%) supaya mahasiswa gampang memposisikan QR ke kamera.
- Logika (scanner, presensi, polling, generate QR) tidak diubah — hanya dipindah ke file masing-masing.

## Isi folder
- `index.html`, `dosen.html`, `mahasiswa.html` — tiga halaman terpisah, tinggal host bareng di folder yang sama (GitHub Pages dll, tidak perlu server backend tambahan).
- `assets/` — CSS & JS bersama yang dipakai ketiga halaman.
- `Code.gs` — backend Apps Script (tidak diubah dari versi sebelumnya).

## Cara pasang (Apps Script) — sama seperti sebelumnya
1. Buka Google Spreadsheet kamu (boleh pakai yang lama, boleh baru).
2. Pastikan ada 2 sheet dengan nama & kolom PERSIS begini:
   - **Data Mahasiswa**: `NIM | Nama | Kelas | Jurusan`
   - **Presensi**: `Timestamp | NIM | Nama | Kelas | Mata Kuliah | Status | Tanggal | Waktu`
   (baris 1 = header; "Presensi" boleh kosong, nanti keisi otomatis)
3. Menu **Extensions > Apps Script**. Hapus isi default, paste seluruh isi `Code.gs`.
4. **Deploy > New deployment** → pilih tipe **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy **Web app URL** hasil deploy.
6. Buka `assets/config.js`, cari baris dengan komentar `GANTI DI SINI`, tempel URL tadi ke `WEB_APP_URL`. Cek juga `SHEET_URL` dan `MATA_KULIAH` — ini otomatis berlaku ke `index.html`, `dosen.html`, dan `mahasiswa.html` sekaligus.
7. Kalau nanti edit `Code.gs` lagi, jangan lupa **Manage deployments > Edit > New version** supaya perubahan beneran kepakai (bukan cuma auto-save).

## Catatan
- Mahasiswa yang belum terdaftar di sheet "Data Mahasiswa" akan diminta didaftarkan dulu oleh dosen lewat panel "Buat QR Mahasiswa" di `dosen.html` — `mahasiswa.html` sengaja tidak bisa daftar sendiri, biar data roster tetap dikontrol dosen.
- Kamera butuh HTTPS (GitHub Pages otomatis HTTPS, aman).
- Karena sekarang 3 file HTML terpisah + folder `assets/`, upload semuanya (jaga strukturnya) ke hosting kamu — jangan cuma `index.html`.
