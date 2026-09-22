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
