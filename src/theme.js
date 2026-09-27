/**
 * Gestion du theme clair / sombre de TaskFlow.
 * - Un attribut data-theme sur <html> bascule toutes les variables CSS
 *   definies dans index.css (sombre par defaut, comme la maquette).
 * - Persistance locale (localStorage) pour la reactivite instantanee.
 * - Synchronisation avec le profil backend (PUT /api/profile) via setTheme().
 */

import { useSyncExternalStore } from 'react';

// Cle de stockage local et valeur par defaut
export const THEME_KEY = 'taskflow.theme';
export const DEFAULT_THEME = 'dark';

// Themes supportes
export const THEMES = [
  { code: 'dark', label: 'theme.dark', icon: 'dark_mode' },
  { code: 'light', label: 'theme.light', icon: 'light_mode' },
];

/** Theme courant (module, hors React). */
let currentTheme = safeGetTheme();

/** Liste des abonnes au changement de theme. */
const listeners = new Set();

/**
 * Lecture sure du theme stocke : retombe sur le defaut si
 * localStorage indisponible ou valeur inconnue (defense en profondeur).
 */
function safeGetTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'light' || stored === 'dark' ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

/**
 * Applique le theme au DOM : attribut data-theme sur <html>.
 * Surtout utilise au demarrage (initTheme) et a chaque bascule.
 */
function applyTheme(theme) {
  try {
    document.documentElement.setAttribute('data-theme', theme);
  } catch {
    // DOM indisponible (SSR/tests) : on ignore silencieusement
  }
}

/** Theme courant. */
export function getTheme() {
  return currentTheme;
}

/**
 * Change le theme : notifie tous les abonnes, applique l'attribut DOM
 * et persiste localement. La synchronisation avec le backend est faite
 * par l'appelant (Navbar/Profil) via l'API PUT /api/profile.
 */
export function setTheme(theme) {
  if (theme !== 'dark' && theme !== 'light') return;
  currentTheme = theme;
  applyTheme(theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // localStorage indisponible : on continue en memoire
  }
  listeners.forEach((fn) => {
    try {
      fn(theme);
    } catch {
      // Un abonne defectueux ne doit pas casser les autres
    }
  });
}

/** S'abonne aux changements de theme. Retourne la fonction de desabonnement. */
export function onThemeChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Hook React : force le re-render du composant a chaque changement de theme.
 * Exemple : const theme = useTheme(); puis className conditionnelle.
 */
export function useTheme() {
  const subscribe = (cb) => onThemeChange(cb);
  const getSnapshot = () => currentTheme;
  return useSyncExternalStore(subscribe, getSnapshot);
}

/**
 * Initialisation au demarrage de l'app : applique le theme stocke
 * (ou le defaut) avant le premier rendu, sans flash visuel.
 */
export function initTheme() {
  applyTheme(currentTheme);
}
