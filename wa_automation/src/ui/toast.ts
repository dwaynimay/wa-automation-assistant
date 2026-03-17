export function tampilkanNotifikasi(pesan: string, tipe: 'sukses' | 'error' = 'sukses') {
  const notifId = 'bot-toast-notif';
  let notif = document.getElementById(notifId);
  
  if (notif) {
    notif.remove();
  }

  notif = document.createElement('div');
  notif.id = notifId;
  notif.textContent = pesan;
  notif.style.cssText = `
    position: fixed; top: 20px; right: 20px;
    background: ${tipe === 'sukses' ? '#1DAA61' : '#f44336'};
    color: white; padding: 12px 20px; border-radius: 8px; 
    z-index: 10000; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    font-family: inherit; font-size: 14px;
    transition: opacity 0.5s ease;
  `;
  
  document.body.appendChild(notif);
  
  setTimeout(() => {
    if (notif) notif.style.opacity = '0';
    setTimeout(() => { if (notif) notif.remove(); }, 500);
  }, 2000);
}