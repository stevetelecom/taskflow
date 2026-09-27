import { useCallback, useEffect, useRef, useState } from 'react';
import { getUsername, clearSession, getNotifications, getUnreadCount, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, updateProfile } from '../api';
import { toast } from '../toast';
import { t, useLang, setLanguage, LANGUAGES } from '../i18n';
import { useTheme, setTheme } from '../theme';
import ProfileModal from './ProfileModal';

/** Drapeau Francais (SVG inline, pas d'emoji). */
function FlagFR() {
  return (
    <svg viewBox="0 0 24 16" className="flag-svg" aria-hidden="true">
      <rect width="8" height="16" fill="#0055A4" />
      <rect x="8" width="8" height="16" fill="#F4F4F4" />
      <rect x="16" width="8" height="16" fill="#EF4135" />
    </svg>
  );
}

/** Drapeau Britannique simplifie (SVG inline, pas d'emoji). */
function FlagEN() {
  return (
    <svg viewBox="0 0 24 16" className="flag-svg" aria-hidden="true">
      <rect width="24" height="16" fill="#012169" />
      <path d="M0,0 L24,16 M24,0 L0,16" stroke="#F4F4F4" strokeWidth="3.2" />
      <path d="M0,0 L24,16 M24,0 L0,16" stroke="#C8102E" strokeWidth="1.4" />
      <path d="M12,0 V16 M0,8 H24" stroke="#F4F4F4" strokeWidth="5.2" />
      <path d="M12,0 V16 M0,8 H24" stroke="#C8102E" strokeWidth="3" />
    </svg>
  );
}

/** Dictionnaire icone + couleur selon le type de notification. */
const NOTIF_ICONS = {
  task_created: { icon: 'add_circle', cls: 'notif-icon-created' },
  task_updated: { icon: 'edit', cls: 'notif-icon-updated' },
  task_completed: { icon: 'check_circle', cls: 'notif-icon-completed' },
  task_reopened: { icon: 'radio_button_unchecked', cls: 'notif-icon-reopened' },
  task_deleted: { icon: 'delete', cls: 'notif-icon-deleted' },
};

/**
 * Barre de navigation connectee.
 * - Burger : ouvre la sidebar (mobile)
 * - Cloche : notifications in-app avec badge non-lues
 * - Toggle langue FR/EN avec drapeaux
 * - Toggle theme sombre/clair
 * - Avatar : ouvre le modal CRUD du profil
 */
export default function Navbar({ profile, onLogout, onToggleSidebar, onProfileChange }) {
  const lang = useLang();
  const theme = useTheme();
  const username = getUsername();

  // Notifications
  const [unread, setUnread] = useState(0);
  const [notifs, setNotifs] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  // Profil : modal CRUD
  const [profileOpen, setProfileOpen] = useState(false);

  // Fermeture du dropdown au clic ailleurs
  const notifRef = useRef(null);

  /** Nombre de notifications non lues. */
  const loadUnread = useCallback(async () => {
    try {
      const data = await getUnreadCount();
      setUnread(data?.count ?? 0);
    } catch {
      // Silencieux : le badge est non bloquant
    }
  }, []);

  /** Liste complete des notifications. */
  const loadNotifs = useCallback(async () => {
    try {
      setNotifs(await getNotifications());
    } catch {
      // Silencieux
    }
  }, []);

  // Badge : chargement initial + rafraichissement toutes les 30 s
  useEffect(() => {
    loadUnread();
    const id = setInterval(loadUnread, 30000);
    return () => clearInterval(id);
  }, [loadUnread]);

  // Ouverture du panneau : recharge la liste
  useEffect(() => {
    if (notifOpen) loadNotifs();
  }, [notifOpen, loadNotifs]);

  // Fermeture par Echap ou clic en dehors
  useEffect(() => {
    if (!notifOpen) return undefined;
    function onKey(e) {
      if (e.key === 'Escape') setNotifOpen(false);
    }
    function onClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [notifOpen]);

  /** Marque une notification comme lue. */
  async function handleMarkRead(n) {
    if (n.read) return;
    try {
      await markNotificationAsRead(n.id);
      setNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      loadUnread();
    } catch (e) {
      toast.error(e.message || t('common.error'));
    }
  }

  /** Marque tout comme lu. */
  async function handleMarkAll() {
    try {
      await markAllNotificationsAsRead();
      setNotifs((prev) => prev.map((x) => ({ ...x, read: true })));
      setUnread(0);
      toast.success(t('notifications.allRead'));
    } catch (e) {
      toast.error(e.message || t('common.error'));
    }
  }

  /** Supprime une notification. */
  async function handleDeleteNotif(id, e) {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifs((prev) => prev.filter((x) => x.id !== id));
      loadUnread();
      toast.success(t('notifications.deleted'));
    } catch (err) {
      toast.error(err.message || t('common.error'));
    }
  }

  /** Bascule la langue : UI reactive + persistance backend (PUT /api/profile). */
  async function handleLangChange(code) {
    if (code === lang) return;
    setLanguage(code); // UI reactive instantanement + localStorage
    try {
      const updated = await updateProfile({ language: code });
      onProfileChange?.(updated || { language: code });
      toast.success(t('profile.saved'));
    } catch {
      // Le choix reste actif localement meme si la persistance echoue
    }
  }

  /** Bascule le theme : UI reactive + persistance backend (PUT /api/profile). */
  async function handleThemeChange(code) {
    if (code === theme) return;
    setTheme(code); // UI reactive instantanement + localStorage
    try {
      const updated = await updateProfile({ theme: code });
      onProfileChange?.(updated || { theme: code });
    } catch {
      // Le choix reste actif localement meme si la persistance echoue
    }
  }

  /** Deconnexion. */
  function handleLogout() {
    clearSession();
    toast.info(t('nav.logout'));
    onLogout();
  }

  /** Initiales pour l'avatar (fallback si pas de photo). */
  const initials = (profile?.displayName || username || '?')
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Burger : ouvre la sidebar (mobile) */}
        <button
          className="btn-icon navbar-burger"
          onClick={onToggleSidebar}
          aria-label={t('nav.menu')}
          title={t('nav.menu')}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* Marque : logo + nom en degrade aux couleurs du logo */}
        <a className="brand" href="/" aria-label="TaskFlow, accueil">
          <img src="/logo.svg" alt="" className="brand-logo" />
          <span className="brand-name">TaskFlow</span>
        </a>

        <div className="navbar-actions">
          {/* --- Cloche de notifications --- */}
          <div className="notif-wrap" ref={notifRef}>
            <button
              className="btn-icon"
              onClick={() => setNotifOpen((o) => !o)}
              aria-label={t('nav.notifications')}
              title={t('nav.notifications')}
            >
              <span className="material-symbols-outlined">
                {unread > 0 ? 'notifications' : 'notifications_none'}
              </span>
              {unread > 0 && <span className="notif-badge">{unread > 99 ? '99+' : unread}</span>}
            </button>

            {notifOpen && (
              <div className="notif-dropdown" role="dialog" aria-label={t('nav.notifications')}>
                <div className="notif-head">
                  <strong>{t('nav.notifications')}</strong>
                  {unread > 0 && (
                    <button className="notif-markall" onClick={handleMarkAll}>
                      <span className="material-symbols-outlined">done_all</span>
                      {t('notifications.markAllRead')}
                    </button>
                  )}
                </div>

                <div className="notif-list">
                  {notifs.length === 0 && (
                    <div className="notif-empty">
                      <span className="material-symbols-outlined">notifications_off</span>
                      <p>{t('notifications.empty')}</p>
                    </div>
                  )}

                  {notifs.map((n) => {
                    const meta = NOTIF_ICONS[n.type] || NOTIF_ICONS.task_updated;
                    return (
                      <div
                        key={n.id}
                        className={`notif-item ${n.read ? 'is-read' : 'is-unread'}`}
                        onClick={() => handleMarkRead(n)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && handleMarkRead(n)}
                      >
                        <span className={`material-symbols-outlined notif-icon ${meta.cls}`}>
                          {meta.icon}
                        </span>
                        <div className="notif-body">
                          <p className="notif-message">{n.message}</p>
                          <span className="notif-date">
                            {new Date(n.createdAt).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-GB')}
                          </span>
                        </div>
                        <button
                          className="notif-delete"
                          onClick={(e) => handleDeleteNotif(n.id, e)}
                          aria-label={t('common.delete')}
                          title={t('common.delete')}
                        >
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* --- Toggle langue avec drapeaux --- */}
          <div className="lang-toggle" role="group" aria-label={t('nav.language')}>
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                className={`lang-btn ${lang === l.code ? 'is-active' : ''}`}
                onClick={() => handleLangChange(l.code)}
                aria-pressed={lang === l.code}
                title={l.label}
              >
                {l.code === 'fr' ? <FlagFR /> : <FlagEN />}
                <span className="lang-code">{l.short}</span>
              </button>
            ))}
          </div>

          {/* --- Toggle theme sombre / clair --- */}
          <button
            className="btn-icon theme-toggle"
            onClick={() => handleThemeChange(theme === 'dark' ? 'light' : 'dark')}
            aria-label={t('nav.theme')}
            title={theme === 'dark' ? t('nav.theme.light') : t('nav.theme.dark')}
          >
            <span className="material-symbols-outlined">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* --- Avatar : ouvre le modal profil --- */}
          <button
            className="avatar-btn"
            onClick={() => setProfileOpen(true)}
            aria-label={t('nav.profile')}
            title={t('nav.profile')}
          >
            {profile?.photo ? (
              <img src={profile.photo} alt="" className="avatar-img" />
            ) : (
              <span className="avatar-initials">{initials}</span>
            )}
          </button>

          {/* --- Deconnexion --- */}
          <button
            className="btn-icon navbar-logout"
            onClick={handleLogout}
            aria-label={t('nav.logout')}
            title={t('nav.logout')}
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>

      {/* --- Modal CRUD profil --- */}
      {profileOpen && (
        <ProfileModal
          profile={profile}
          onClose={() => setProfileOpen(false)}
          onSaved={(updated) => {
            onProfileChange?.(updated);
            setProfileOpen(false);
          }}
        />
      )}
    </header>
  );
}
