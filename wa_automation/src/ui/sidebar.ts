import { STATE } from '../config';

export function injectSidebarUI() {
  if (document.getElementById('btn-groq-bot')) return;

  const btnContainer = document.createElement('button');
  btnContainer.id = 'btn-groq-bot';
  btnContainer.setAttribute('title', 'Toggle Bot WA');

  btnContainer.style.cssText = `
    position: fixed; bottom: 20px; right: 20px;
    width: 60px; height: 60px; border-radius: 50%;
    border: 2px solid #25D366; background: #fff;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 28px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease; z-index: 9999;
  `;
  btnContainer.innerHTML = '🤖';

  const updateTampilan = () => {
    btnContainer.style.opacity = STATE.botAktif ? '1' : '0.5';
    btnContainer.style.background = STATE.botAktif ? '#E8F5E9' : '#f5f5f5';
    btnContainer.style.borderColor = STATE.botAktif ? '#25D366' : '#ccc';
  };

  btnContainer.onclick = (e) => {
    e.preventDefault(); e.stopPropagation();
    STATE.botAktif = !STATE.botAktif;
    updateTampilan();
    
    // Notifikasi toast
    const notif = document.createElement('div');
    notif.textContent = STATE.botAktif ? '✅ Bot Aktif' : '⛔ Bot Nonaktif';
    notif.style.cssText = `
      position: fixed; top: 20px; right: 20px;
      background: ${STATE.botAktif ? '#4CAF50' : '#f44336'};
      color: white; padding: 12px 20px; border-radius: 8px; z-index: 10000;
    `;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2000);
  };

  updateTampilan();
  document.body.appendChild(btnContainer);
}