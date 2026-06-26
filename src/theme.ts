/**
 * Theme manager — supports system / light / dark modes.
 * Persists to localStorage. Sets data-theme attribute on <html>.
 *
 * @license SPDX-License-Identifier: Apache-2.0
 */

export type Theme = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'flowtime_theme';
const ATTR = 'data-theme';

let _theme: Theme = (localStorage.getItem(STORAGE_KEY) as Theme) || 'system';
let _listeners: Array<() => void> = [];

function applyDom(): void {
  const html = document.documentElement;
  if (_theme === 'system') {
    html.removeAttribute(ATTR);
  } else {
    html.setAttribute(ATTR, _theme);
  }
}

export function getTheme(): Theme {
  return _theme;
}

export function setTheme(theme: Theme): void {
  _theme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
  applyDom();
  _listeners.forEach((fn) => fn());
}

export function onThemeChange(fn: () => void): () => void {
  _listeners.push(fn);
  return () => {
    _listeners = _listeners.filter((f) => f !== fn);
  };
}

/** Call once on app startup to restore saved preference. */
export function initTheme(): void {
  applyDom();
}
