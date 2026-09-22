/**
 * PRESENSI KELAS — BACKEND (Google Apps Script)
 * ================================================================
 * Ditulis ulang dari nol untuk memperbaiki bug: status kehadiran mahasiswa
 * kembali jadi "Belum" setiap kali halaman di-refresh.
 *
 * PENYEBAB BUG LAMA: tanggal presensi dibandingkan sebagai objek Date,
 * yang gampang meleset kalau timezone spreadsheet & timezone project
 * Apps Script beda (hasilnya: "hari ini" versi server != "hari ini"
 * versi yang baru saja ditulis, jadi query berikutnya gak nemu barisnya).
 *
 * PERBAIKAN: setiap kali menyimpan presensi, tanggal & jam ditulis
 * sebagai TEKS biasa (format "yyyy-MM-dd" & "HH:mm", zona Asia/Jakarta),
 * bukan objek Date. Saat membaca ulang, tanggal "hari ini" dihitung
 * dengan cara & zona waktu yang SAMA PERSIS, lalu dibandingkan sebagai
 * teks. Gak ada lagi celah perbedaan timezone. Jadi refresh berkali-kali
 * pun hasilnya tetap konsisten.
 * ================================================================
 *
 * CARA PASANG:
 * 1. Buat Google Spreadsheet baru (atau pakai yang lama).
 * 2. Buat 2 sheet dengan nama & kolom PERSIS seperti ini:
 *
 *    Sheet "Data Mahasiswa"  -> kolom A-D: NIM | Nama | Kelas | Jurusan
 *    Sheet "Presensi"        -> kolom A-H: Timestamp | NIM | Nama | Kelas | Mata Kuliah | Status | Tanggal | Waktu
 *
 *    (baris 1 = header, isi mulai baris 2. Sheet "Presensi" boleh kosong,
 *    nanti keisi otomatis tiap ada yang presensi)
 *
 * 3. Extensions > Apps Script, hapus isi default, paste seluruh file ini.
 * 4. Deploy > New deployment > pilih "Web app".
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy Web App URL yang muncul, paste ke WEB_APP_URL di index.html
 *    (cari komentar "GANTI DI SINI").
 * 6. Tiap kali edit kode ini, bikin deployment BARU (atau "Manage
 *    deployments" > edit > New version) supaya perubahan kepakai.
 */

// GANTI DI SINI kalau nama sheet kamu beda
const SHEET_MAHASISWA = 'Data Mahasiswa';
const SHEET_PRESENSI = 'Presensi';
const TIMEZONE = 'Asia/Jakarta'; // GANTI DI SINI kalau kampus di zona waktu lain (mis. 'Asia/Makassar', 'Asia/Jayapura')

// ================================================================
// ROUTER
// ================================================================
function doGet(e) {
  const action = e.parameter.action;
  try {
    if (action === 'ping') return jsonOut({ status: 'ok', time: new Date().toISOString() });
    if (action === 'get_all') return jsonOut(getAllMahasiswa());
    if (action === 'get_presensi_today') return jsonOut(getPresensiToday(e.parameter.matkul || ''));
    return jsonOut({ error: 'Aksi tidak dikenal: ' + action });
  } catch (err) {
    return jsonOut({ error: err.message });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    if (action === 'presensi') return jsonOut(catatPresensi(body.nim, body.mataKuliah));
    if (action === 'daftar_mahasiswa') return jsonOut(daftarMahasiswaBaru(body));
    return jsonOut({ success: false, message: 'Aksi tidak dikenal: ' + action });
  } catch (err) {
    return jsonOut({ success: false, message: err.message });
  }
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ================================================================
// HELPERS
// ================================================================
function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('Sheet "' + name + '" tidak ditemukan. Cek nama sheet-nya persis sama.');
  return sheet;
}

// Kunci tanggal "hari ini", format teks yyyy-MM-dd, di zona TIMEZONE.
// Dipakai SAMA PERSIS baik saat menulis maupun membaca presensi,
// supaya gak ada celah perbedaan timezone.
function todayKey() {
  return Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd');
}

// ================================================================
// DATA MAHASISWA
// ================================================================
function getAllMahasiswa() {
  const sheet = getSheet(SHEET_MAHASISWA);
  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1);
  return rows
    .filter(r => r[0] !== '' && r[0] !== null)
    .map(r => ({
      nim: String(r[0]).trim(),
      nama: String(r[1] || '').trim(),
      kelas: String(r[2] || '').trim(),
      jurusan: String(r[3] || '').trim()
    }));
}

function daftarMahasiswaBaru(body) {
  const nim = String(body.nim || '').trim();
  const nama = String(body.nama || '').trim();
  const kelas = String(body.kelas || '').trim();
  const jurusan = String(body.jurusan || 'Teknik Informatika').trim();

  if (!nim || !nama || !kelas) {
    return { success: false, message: 'Data belum lengkap (NIM, Nama, Kelas wajib diisi)' };
  }

  const sheet = getSheet(SHEET_MAHASISWA);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === nim) {
      return { success: false, message: 'NIM sudah terdaftar' };
    }
  }

  sheet.appendRow([nim, nama, kelas, jurusan]);
  return { success: true, data: { nim: nim, nama: nama, kelas: kelas, jurusan: jurusan } };
}

// ================================================================
// PRESENSI
// ================================================================

// Balikin daftar {nim, waktu} yang sudah presensi HARI INI untuk matkul
// tertentu (kalau matkul dikosongkan, ambil semua matkul hari ini).
function getPresensiToday(matkul) {
  const sheet = getSheet(SHEET_PRESENSI);
  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1);
  const key = todayKey();
  matkul = String(matkul || '').trim();

  const hasil = [];
  rows.forEach(r => {
    const nim = String(r[1] || '').trim();
    const mk = String(r[4] || '').trim();
    const tanggal = String(r[6] || '').trim(); // kolom G: Tanggal (teks yyyy-MM-dd)
    const waktu = String(r[7] || '').trim();   // kolom H: Waktu (teks HH:mm)
    if (!nim) return;
    if (tanggal === key && (!matkul || mk === matkul)) {
      hasil.push({ nim: nim, waktu: waktu });
    }
  });
  return hasil;
}

function catatPresensi(nim, mataKuliah) {
  nim = String(nim || '').trim();
  mataKuliah = String(mataKuliah || '').trim();
  if (!nim) return { success: false, message: 'NIM kosong' };

  // 1) Pastikan mahasiswa terdaftar
  const mahasiswaSheet = getSheet(SHEET_MAHASISWA);
  const mData = mahasiswaSheet.getDataRange().getValues();
  let mahasiswa = null;
  for (let i = 1; i < mData.length; i++) {
    if (String(mData[i][0]).trim() === nim) {
      mahasiswa = { nim: nim, nama: String(mData[i][1] || ''), kelas: String(mData[i][2] || '') };
      break;
    }
  }
  if (!mahasiswa) return { success: false, message: 'NIM ' + nim + ' tidak terdaftar' };

  // 2) Cek sudah presensi hari ini untuk matkul ini atau belum
  const presensiSheet = getSheet(SHEET_PRESENSI);
  const key = todayKey();
  const pData = presensiSheet.getDataRange().getValues();
  for (let i = 1; i < pData.length; i++) {
    const rNim = String(pData[i][1] || '').trim();
    const rMk = String(pData[i][4] || '').trim();
    const rTgl = String(pData[i][6] || '').trim();
    if (rNim === nim && rMk === mataKuliah && rTgl === key) {
      return {
        success: true,
        alreadyPresent: true,
        message: mahasiswa.nama + ' sudah presensi hari ini',
        waktu: String(pData[i][7] || '').trim()
      };
    }
  }

  // 3) Simpan baris baru — Tanggal & Waktu sebagai TEKS (bukan Date object)
  const now = new Date();
  const waktu = Utilities.formatDate(now, TIMEZONE, 'HH:mm');
  presensiSheet.appendRow([now, nim, mahasiswa.nama, mahasiswa.kelas, mataKuliah, 'Hadir', key, waktu]);

  return { success: true, alreadyPresent: false, message: mahasiswa.nama + ' berhasil presensi', waktu: waktu };
}
