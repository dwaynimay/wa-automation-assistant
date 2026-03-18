import { STATE } from '../config';
import { createToggleButton } from './createToggleButton';
import { findSidebarAnchor } from './findSidebarAnchor';
import { injectIntervalMs, toggleButtonId } from './uiConstants';

export function injectSidebarUi(): void {
  const intervalId = window.setInterval(() => {
    const anchorButton = findSidebarAnchor();
    if (!anchorButton) return;

    if (document.getElementById(toggleButtonId)) {
      window.clearInterval(intervalId);
      return;
    }

    const outerSpan = anchorButton.closest('span');
    const originalContainer = outerSpan?.parentElement;

    if (!(originalContainer instanceof HTMLElement)) {
      return;
    }

    const toggleButtonElement = createToggleButton(originalContainer, {
      isActive: STATE.botAktif,
      onToggle: () => {
        STATE.botAktif = !STATE.botAktif;
        return STATE.botAktif;
      },
    });

    if (!toggleButtonElement) return;

    originalContainer.after(toggleButtonElement);
    window.clearInterval(intervalId);
  }, injectIntervalMs);
}