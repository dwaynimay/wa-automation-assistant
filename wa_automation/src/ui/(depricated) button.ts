// File: src/ui/button.ts
import { STATE } from '../config';
import { tampilkanNotifikasi } from './toast';

export function createToggleButton(
  btnContainerAsli: HTMLElement,
): HTMLElement | null {
  // Kloning container bawaan WA
  const cloneContainer = btnContainerAsli.cloneNode(true) as HTMLElement;
  const newButton = cloneContainer.querySelector('button');

  if (!newButton) return null;

  newButton.id = 'btn-groq-bot';
  newButton.setAttribute('aria-label', 'Toggle Groq Bot');
  newButton.setAttribute('title', 'Nyalakan/Matikan Bot Balas Otomatis');

  // Ganti Ikon
  replaceIconWithCustom(newButton);

  // Animasi & Visual
  newButton.style.transition = 'all 0.2s ease';

  const updateTampilan = () => {
    if (STATE.botAktif) {
      newButton.style.opacity = '1';
      newButton.style.transform = 'scale(1.3)';
    } else {
      newButton.style.opacity = '0.4';
      newButton.style.transform = 'scale(1.1)';
    }
  };

  // Event Listener Klik
  newButton.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    STATE.botAktif = !STATE.botAktif;

    updateTampilan();

    const pesanNotif = STATE.botAktif ? 'Activated' : 'Deactivated';
    const tipeNotif = STATE.botAktif ? 'sukses' : 'error';
    tampilkanNotifikasi(pesanNotif, tipeNotif);
  };

  updateTampilan(); // Set tampilan awal
  return cloneContainer;
}

// Fungsi helper (Private) untuk ganti SVG/IMG WA menjadi teks
function replaceIconWithCustom(button: HTMLButtonElement) {
  const imgEl = button.querySelector('img');
  const svgEl = button.querySelector('svg');
  let iconWrapper: HTMLElement | null = null;

  if (imgEl && imgEl.parentElement) {
    iconWrapper = imgEl.parentElement;
  } else if (svgEl && svgEl.parentElement) {
    iconWrapper = svgEl.parentElement;
  }

  if (iconWrapper) {
    iconWrapper.innerHTML = '<span style="font-size: 22px;">𖠌</span>';
    iconWrapper.style.display = 'flex';
    iconWrapper.style.justifyContent = 'center';
    iconWrapper.style.alignItems = 'center';
    iconWrapper.style.width = '100%';

    if (iconWrapper.parentElement) {
      iconWrapper.parentElement.style.display = 'flex';
      iconWrapper.parentElement.style.justifyContent = 'center';
      iconWrapper.parentElement.style.alignItems = 'center';
      iconWrapper.parentElement.style.width = '100%';
    }
  }
}
