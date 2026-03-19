// src/ui/replace-button-icon.ts
//
// Mengganti ikon bawaan tombol WhatsApp dengan ikon robot milik bot kita.
// Strategi: cari elemen img atau svg di dalam tombol, lalu ganti isinya.

export function replaceButtonIcon(button: HTMLButtonElement): void {
  const imgEl = button.querySelector('img');
  const svgEl = button.querySelector('svg');

  // Cari wrapper ikon — bisa parent dari img atau svg
  let iconWrapper: HTMLElement | null = null;
  if (imgEl?.parentElement instanceof HTMLElement) {
    iconWrapper = imgEl.parentElement;
  } else if (svgEl?.parentElement instanceof HTMLElement) {
    iconWrapper = svgEl.parentElement;
  }

  if (!iconWrapper) return;

  // Kosongkan wrapper dan isi dengan ikon robot kita
  iconWrapper.innerHTML = '';

  const robotIcon = document.createElement('span');
  robotIcon.textContent = '𖠌';
  robotIcon.setAttribute('aria-hidden', 'true');
  robotIcon.style.cssText = 'font-size: 22px; line-height: 1;';

  iconWrapper.appendChild(robotIcon);

  // Pastikan ikon berada di tengah wrapper
  iconWrapper.style.cssText =
    'display: flex; justify-content: center; align-items: center; width: 100%;';

  // Terapkan juga ke parent wrapper jika ada
  const parent = iconWrapper.parentElement;
  if (parent instanceof HTMLElement) {
    parent.style.cssText =
      'display: flex; justify-content: center; align-items: center; width: 100%;';
  }
}
