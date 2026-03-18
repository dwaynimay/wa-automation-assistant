export function replaceButtonIcon(button: HTMLButtonElement): void {
  const imgEl = button.querySelector('img');
  const svgEl = button.querySelector('svg');

  let iconWrapper: HTMLElement | null = null;

  if (imgEl?.parentElement instanceof HTMLElement) {
    iconWrapper = imgEl.parentElement;
  } else if (svgEl?.parentElement instanceof HTMLElement) {
    iconWrapper = svgEl.parentElement;
  }

  if (!iconWrapper) return;

  iconWrapper.innerHTML = '';
  iconWrapper.style.display = 'flex';
  iconWrapper.style.justifyContent = 'center';
  iconWrapper.style.alignItems = 'center';
  iconWrapper.style.width = '100%';

  const parent = iconWrapper.parentElement;
  if (parent instanceof HTMLElement) {
    parent.style.display = 'flex';
    parent.style.justifyContent = 'center';
    parent.style.alignItems = 'center';
    parent.style.width = '100%';
  }
}