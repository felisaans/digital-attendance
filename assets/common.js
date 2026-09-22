// ================================================================
// UTIL BERSAMA — dipakai di dosen.html & mahasiswa.html
// ================================================================

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function qrImageUrl(nim, size) {
  const qrText = JSON.stringify({ nim: nim });
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(qrText)}`;
}

function setConnectionStatus(status, message) {
  document.querySelectorAll('.conn .dot').forEach(dot => { dot.className = 'dot ' + status; });
  document.querySelectorAll('.conn .conn-label').forEach(label => { label.textContent = message; });
}

async function checkConnection() {
  setConnectionStatus('checking', 'Mengecek...');
  try {
    const response = await fetch(WEB_APP_URL + '?action=ping', {
      method: 'GET',
      signal: AbortSignal.timeout(6000)
    });
    if (!response.ok) throw new Error('Server tidak merespon');
    setConnectionStatus('online', 'Terhubung');
    return true;
  } catch (error) {
    setConnectionStatus('offline', 'Offline');
    return false;
  }
}

// ================================================================
// DOWNLOAD & SHARE QR (dipakai di dosen.html & mahasiswa.html)
// ================================================================
async function fetchImageBlob(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Gagal mengambil gambar QR');
  return await res.blob();
}

async function downloadQrImage(url, filename) {
  try {
    const blob = await fetchImageBlob(url);
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 4000);
  } catch (e) {
    // fallback: buka di tab baru biar bisa disimpan manual (long-press / klik kanan)
    window.open(url, '_blank');
  }
}

// Coba pakai Web Share API (buka share sheet asli HP, termasuk WhatsApp,
// dengan gambar QR terlampir langsung). Kalau browser gak dukung share
// file (kebanyakan desktop), QR didownload otomatis lalu WhatsApp Web
// dibuka dengan teksnya — tinggal lampirkan manual.
async function shareQrWhatsApp(url, filename, text) {
  try {
    const blob = await fetchImageBlob(url);
    const file = new File([blob], filename, { type: blob.type || 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: 'QR Presensi', text: text || '' });
      return;
    }
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 4000);
  } catch (e) {
    if (e && e.name === 'AbortError') return; // user batalin share sheet, gapapa
  }
  window.open('https://wa.me/?text=' + encodeURIComponent(text || ''), '_blank');
}

function showStatus(message, type = 'info', duration = 4000) {
  const el = document.getElementById('status');
  if (!el) return;
  const iconMap = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-triangle-exclamation', info: 'fa-info-circle' };
  el.innerHTML = `<i class="fas ${iconMap[type] || iconMap.info}"></i> ${message}`;
  el.className = type;
  clearTimeout(el._hideTimeout);
  if (type === 'success' || type === 'error' || type === 'warning') {
    el._hideTimeout = setTimeout(() => { el.className = ''; }, duration);
  }
}
