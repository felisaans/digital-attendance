// ================================================================
// KONFIGURASI — dipakai di semua halaman (index, dosen, mahasiswa)
// ================================================================
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbw5ZR13L2Ima8sAjx1Xn_WrNE722RyMSbef3EaVTdhtmQJB8t8jGbB9Yrcw7PK5y1JNlg/exec'; // GANTI DI SINI: URL deploy Apps Script (Code.gs) punya kamu sendiri
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/170c9j3SqP2jX-inMkgptjZFQfTjEHAuXa3_YcbiEoEc/edit?'; // GANTI DI SINI: link spreadsheet punya kamu sendiri
const MATA_KULIAH = 'Rekayasa Perangkat Lunak'; // GANTI DI SINI: nama mata kuliah — dipakai otomatis di semua halaman
const JURUSAN_DEFAULT = 'Teknik Informatika'; // GANTI DI SINI kalau ada prodi lain

const SCAN_COOLDOWN_MS = 1000;
const SYNC_INTERVAL_MS = 15000;   // dosen: refresh roster + status tiap 15 detik
const MHS_POLL_MS = 3000;         // mahasiswa: polling status sendiri tiap 3 detik
