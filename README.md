# Presensi Kelas — Update

## Apa yang berubah
- **Landing page full-screen** dengan judul sistem + 2 tombol besar: **Mulai Absensi** (dosen) dan **Absen** (mahasiswa) — bukan langsung form di tengah lagi.
- **Mode Dosen**: scanner kamera + panel "Buat QR Mahasiswa" + daftar mahasiswa live (sekarang ada kolom cari, dan counter "X/Y hadir").
- **Mode Mahasiswa**: masukkan NIM sekali (diingat otomatis di device), QR pribadi langsung muncul besar untuk ditunjukkan ke kamera dosen, plus status "menunggu di-scan" → "Hadir jam segini" real-time.
- **Font & tombol diperbesar** di semua layar biar gampang dibaca dari jarak jauh (misal QR ditunjukkan dari depan kelas).
- **Bug status "Belum" walau sudah presensi (setelah refresh) — DIPERBAIKI.** Ini bug di backend lama, bukan di tampilan: tanggal presensi dulu dibandingkan sebagai objek Date yang rawan meleset timezone. Backend baru (`Code.gs`) menyimpan tanggal & jam sebagai teks biasa dengan zona waktu tetap (Asia/Jakarta), jadi pengecekan "sudah presensi hari ini atau belum" selalu konsisten walau di-refresh berkali-kali.

## Isi folder
- `index.html` — tampilan (landing + mode dosen + mode mahasiswa), satu file, tinggal host di mana saja (GitHub Pages dll).
- `Code.gs` — backend baru, ditulis ulang dari nol. **Wajib pasang ulang** (lihat langkah di bawah) — instruksi lengkap ada di komentar paling atas file ini juga.

## Cara pasang (Apps Script)
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
6. Buka `index.html`, cari baris dengan komentar `GANTI DI SINI`, tempel URL tadi ke `WEB_APP_URL`. Cek juga `SHEET_URL` dan `MATA_KULIAH` di baris yang sama.
7. Kalau nanti edit `Code.gs` lagi, jangan lupa **Manage deployments > Edit > New version** supaya perubahan beneran kepakai (bukan cuma auto-save).

## Catatan
- Mahasiswa yang belum terdaftar di sheet "Data Mahasiswa" akan diminta didaftarkan dulu oleh dosen lewat panel "Buat QR Mahasiswa" di Mode Dosen — mode Mahasiswa sengaja tidak bisa daftar sendiri, biar data roster tetap dikontrol dosen.
- Kamera butuh HTTPS (GitHub Pages otomatis HTTPS, aman).
