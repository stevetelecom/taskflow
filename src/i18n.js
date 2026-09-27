/**
 * Internationalisation FR/EN de TaskFlow.
 * - Module pub/sub : toute la page se met a jour quand la langue change.
 * - Persistance locale (localStorage) pour la reactivite instantanee.
 * - Synchronisation avec le profil backend (PUT /api/profile) via setLanguage().
 * - Pas d'emojis : les drapeaux sont des caracteres regionaux (FR/EN) rendus
 *   en pur CSS/SVG dans la Navbar, ce module ne fournit que les textes.
 */

import { useSyncExternalStore } from 'react';

// Cles de langue et stockage local
export const LANG_KEY = 'taskflow.lang';
export const DEFAULT_LANG = 'fr';

// Langues supportees
export const LANGUAGES = [
  { code: 'fr', label: 'Francais', short: 'FR' },
  { code: 'en', label: 'English', short: 'EN' },
];

/**
 * Dictionnaire de traductions.
 * Structure plate : chaque entree est une cle -> { fr, en }.
 */
const translations = {
  // --- Generique ---
  'app.name': { fr: 'TaskFlow', en: 'TaskFlow' },
  'app.loading': { fr: 'Chargement...', en: 'Loading...' },
  'common.cancel': { fr: 'Annuler', en: 'Cancel' },
  'common.save': { fr: 'Enregistrer', en: 'Save' },
  'common.delete': { fr: 'Supprimer', en: 'Delete' },
  'common.close': { fr: 'Fermer', en: 'Close' },
  'common.confirm': { fr: 'Confirmer', en: 'Confirm' },
  'common.yes': { fr: 'Oui', en: 'Yes' },
  'common.no': { fr: 'Non', en: 'No' },
  'common.error': { fr: 'Une erreur est survenue', en: 'An error occurred' },
  'common.loading': { fr: 'Chargement...', en: 'Loading...' },

  // --- Navigation / sidebar ---
  'nav.tasks': { fr: 'Mes taches', en: 'My tasks' },
  'nav.dashboard': { fr: 'Tableau de bord', en: 'Dashboard' },
  'nav.logout': { fr: 'Se deconnecter', en: 'Sign out' },
  'nav.profile': { fr: 'Mon profil', en: 'My profile' },
  'nav.notifications': { fr: 'Notifications', en: 'Notifications' },
  'nav.language': { fr: 'Langue', en: 'Language' },
  'nav.theme': { fr: 'Theme', en: 'Theme' },
  'nav.theme.dark': { fr: 'Sombre', en: 'Dark' },
  'nav.theme.light': { fr: 'Clair', en: 'Light' },
  'nav.menu': { fr: 'Menu', en: 'Menu' },

  // --- Notifications ---
  'notifications.empty': { fr: 'Aucune notification', en: 'No notifications' },
  'notifications.markAllRead': { fr: 'Tout marquer comme lu', en: 'Mark all as read' },
  'notifications.unread': { fr: 'non lue(s)', en: 'unread' },
  'notifications.deleted': { fr: 'Notification supprimee', en: 'Notification deleted' },
  'notifications.allRead': { fr: 'Toutes les notifications sont lues', en: 'All notifications marked as read' },
  'notifications.title.task_created': { fr: 'Tache creee', en: 'Task created' },
  'notifications.title.task_updated': { fr: 'Tache modifiee', en: 'Task updated' },
  'notifications.title.task_completed': { fr: 'Tache terminee', en: 'Task completed' },
  'notifications.title.task_reopened': { fr: 'Tache rouverte', en: 'Task reopened' },
  'notifications.title.task_deleted': { fr: 'Tache supprimee', en: 'Task deleted' },

  // --- Profil ---
  'profile.title': { fr: 'Mon profil', en: 'My profile' },
  'profile.username': { fr: "Nom d'utilisateur", en: 'Username' },
  'profile.displayName': { fr: 'Nom affiche', en: 'Display name' },
  'profile.photo': { fr: 'Photo de profil', en: 'Profile photo' },
  'profile.photo.hint': { fr: 'Formats acceptes : PNG, JPG (max 500 Ko)', en: 'Accepted formats: PNG, JPG (max 500 KB)' },
  'profile.photo.change': { fr: 'Changer la photo', en: 'Change photo' },
  'profile.photo.remove': { fr: 'Retirer la photo', en: 'Remove photo' },
  'profile.language': { fr: 'Langue de l interface', en: 'Interface language' },
  'profile.theme': { fr: 'Theme de l interface', en: 'Interface theme' },
  'profile.timezone': { fr: 'Fuseau horaire', en: 'Timezone' },
  'profile.saved': { fr: 'Profil mis a jour', en: 'Profile updated' },
  'profile.section.security': { fr: 'Securite : changer le mot de passe', en: 'Security: change password' },
  'profile.password.current': { fr: 'Mot de passe actuel', en: 'Current password' },
  'profile.password.new': { fr: 'Nouveau mot de passe', en: 'New password' },
  'profile.password.confirm': { fr: 'Confirmer le nouveau mot de passe', en: 'Confirm new password' },
  'profile.password.changed': { fr: 'Mot de passe change avec succes', en: 'Password changed successfully' },
  'profile.password.mismatch': { fr: 'Les deux mots de passe ne correspondent pas', en: 'The two passwords do not match' },
  'profile.password.incorrect': { fr: 'Mot de passe actuel incorrect', en: 'Current password is incorrect' },

  // --- Tableau de bord ---
  'dashboard.title': { fr: 'Tableau de bord', en: 'Dashboard' },
  'dashboard.hello': { fr: 'Bonjour', en: 'Hello' },
  'dashboard.total': { fr: 'Taches totales', en: 'Total tasks' },
  'dashboard.active': { fr: 'En cours', en: 'In progress' },
  'dashboard.done': { fr: 'Terminees', en: 'Completed' },
  'dashboard.progress': { fr: 'Avancement global', en: 'Overall progress' },
  'dashboard.recent': { fr: 'Taches recentes', en: 'Recent tasks' },
  'dashboard.recent.empty': { fr: 'Aucune tache recente', en: 'No recent tasks' },

  // --- Taches (deja utilisees par TasksPage : completes les textes) ---
  'tasks.title': { fr: 'Mes taches', en: 'My tasks' },
  'tasks.add': { fr: 'Nouvelle tache', en: 'New task' },
  'tasks.empty': { fr: 'Aucune tache pour le moment', en: 'No tasks yet' },
  'tasks.filter.all': { fr: 'Toutes', en: 'All' },
  'tasks.filter.active': { fr: 'En cours', en: 'Active' },
  'tasks.filter.done': { fr: 'Terminees', en: 'Completed' },
};

/** Langue courante (module, hors React). */
let currentLang = safeGetLang();

/** Liste des abonnes au changement de langue. */
const listeners = new Set();

/**
 * Lecture sure de la langue stockee : retombe sur le defaut si
 * localStorage indisponible ou valeur inconnue (defense en profondeur).
 */
function safeGetLang() {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    return stored === 'en' || stored === 'fr' ? stored : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

/**
 * Traduit une cle dans la langue courante.
 * Retourne la cle elle-meme si aucune traduction n'existe (debug facile).
 */
export function t(key) {
  const entry = translations[key];
  if (!entry) return key;
  return entry[currentLang] ?? entry[DEFAULT_LANG] ?? key;
}

/** Langue courante. */
export function getLang() {
  return currentLang;
}

/**
 * Change la langue : notifie tous les abonnes et persiste localement.
 * La synchronisation avec le backend est faite par l'appelant (Navbar/Profil)
 * via l'API PUT /api/profile.
 */
export function setLanguage(lang) {
  if (lang !== 'fr' && lang !== 'en') return;
  currentLang = lang;
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    // localStorage indisponible : on continue en memoire
  }
  listeners.forEach((fn) => {
    try {
      fn(lang);
    } catch {
      // Un abonne defectueux ne doit pas casser les autres
    }
  });
}

/** S'abonne aux changements de langue. Retourne la fonction de desabonnement. */
export function onLanguageChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Hook React : force le re-render du composant a chaque changement de langue.
 * Exemple : const lang = useLang(); puis t('nav.tasks') dans le JSX.
 */
export function useLang() {
  const subscribe = (cb) => onLanguageChange(cb);
  const getSnapshot = () => currentLang;
  return useSyncExternalStore(subscribe, getSnapshot);
}
