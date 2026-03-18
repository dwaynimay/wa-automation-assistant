import {
  toggleButtonAriaLabel,
  toggleButtonId,
  toggleButtonTitle,
} from './uiConstants';
import { replaceButtonIcon } from './replaceButtonIcon';
import { showToast } from './showToast';
import { updateToggleButtonState } from './updateToggleButtonState';

type CreateToggleButtonOptions = {
  isActive: boolean;
  onToggle: () => boolean;
};

export function createToggleButton(
  originalContainer: HTMLElement,
  options: CreateToggleButtonOptions,
): HTMLElement | null {
  const cloneContainer = originalContainer.cloneNode(true) as HTMLElement;
  const button = cloneContainer.querySelector('button');

  if (!(button instanceof HTMLButtonElement)) {
    return null;
  }

  button.id = toggleButtonId;
  button.setAttribute('aria-label', toggleButtonAriaLabel);
  button.setAttribute('title', toggleButtonTitle);

  replaceButtonIcon(button);
  updateToggleButtonState(button, options.isActive);

  button.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const nextIsActive = options.onToggle();
    updateToggleButtonState(button, nextIsActive);

    showToast(
      nextIsActive ? 'Activated' : 'Deactivated',
      nextIsActive ? 'success' : 'error',
    );
  };

  return cloneContainer;
}