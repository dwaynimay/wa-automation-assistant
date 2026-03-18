import { sidebarAnchorSelector } from './uiConstants';

export function findSidebarAnchor(): HTMLButtonElement | null {
  const anchor = document.querySelector(sidebarAnchorSelector);
  return anchor instanceof HTMLButtonElement ? anchor : null;
}