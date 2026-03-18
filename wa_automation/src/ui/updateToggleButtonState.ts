export function updateToggleButtonState(
  button: HTMLButtonElement,
  isActive: boolean,
): void {
  button.style.transition = 'all 0.2s ease';
  button.style.opacity = isActive ? '1' : '0.4';
  button.style.transform = isActive ? 'scale(1.3)' : 'scale(1.1)';
}