import { useEffect, useState } from 'react';
import { getProfile, updateProfile, changePassword } from '../api';
import { toast } from '../toast';
import { t, useLang, setLanguage, LANGUAGES } from '../i18n';
import { useTheme, setTheme } from '../theme';

/** Taille maximale d'une photo (en base64 data-URL), alignee sur le backend. */
const MAX_PHOTO_SIZE = 500000;

/** Regex de mot de passe fort, alignee sur le backend. */
const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

/** Fuseaux proposes (les plus courants ; 'UTC' par defaut). */
const TIMEZONES = ['UTC', 'Europe/Paris', 'Europe/London', 'Africa/Douala', 'America/New_York', 'Asia/Tokyo'];

/**
 * Modal CRUD du profil utilisateur.
 * - Section infos : nom affiche, photo (data-URL), langue, theme, fuseau.
 * - Section securite : changement de mot de passe avec icone oeil.
 * Toute action validee produit un toast.
 */
export default function ProfileModal({ profile, onClose, onSaved }) {
  const lang = useLang();
  const theme = useTheme();

  // --- Etat du formulaire profil ---
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [photo, setPhoto] = useState(profile?.photo || '');
  const [timezone, setTimezone] = useState(profile?.timezone || 'UTC');
  const [saving, setSaving] = useState(false);

  // --- Etat du formulaire mot de passe ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fermeture au clavier (Echap)
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  /**
   * Lecture du fichier photo : convertie en data-URL base64.
   * Validation cote client : type image + taille max (le backend revalide).
   */
  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('profile.photo.hint'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      if (dataUrl.length > MAX_PHOTO_SIZE) {
        toast.error(t('profile.photo.hint'));
        return;
      }
      setPhoto(dataUrl);
    };
    reader.onerror = () => toast.error(t('common.error'));
    reader.readAsDataURL(file);
  }

  /** Enregistrement du profil (PUT /api/profile). */
  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProfile({
        displayName,
        photo,
        language: lang,
        theme,
        timezone,
      });
      // Applique immediatement langue et theme choisis dans le modal
      if (updated?.language) setLanguage(updated.language);
      if (updated?.theme) setTheme(updated.theme);
      toast.success(t('profile.saved'));
      onSaved?.(updated);
    } catch (err) {
      toast.error(err.message || t('common.error'));
    } finally {
      setSaving(false);
    }
  }

  /** Changement de mot de passe (PUT /api/profile/password). */
  async function handlePasswordChange(e) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error(t('profile.password.mismatch'));
      return;
    }
    if (!STRONG_PASSWORD.test(newPassword) || newPassword.length < 8) {
      toast.error(t('profile.password.incorrect') + ' (8+ Aa1)');
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      toast.success(t('profile.password.changed'));
      // Reinitialise les champs apres succes
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message || t('common.error'));
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={t('profile.title')}>
      <div className="modal profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <span className="material-symbols-outlined">manage_accounts</span>
            {t('profile.title')}
          </h2>
          <button className="btn-icon" onClick={onClose} aria-label={t('common.close')}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* --- Section 1 : informations du profil --- */}
        <form className="modal-body" onSubmit={handleSave}>
          {/* Nom affiche */}
          <label className="field">
            <span className="field-label">{t('profile.displayName')}</span>
            <div className="input-wrap">
              <span className="material-symbols-outlined input-icon">badge</span>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
                placeholder="Olivier"
                autoComplete="name"
              />
            </div>
          </label>

          {/* Photo : apercu + boutons changer / retirer */}
          <div className="field">
            <span className="field-label">{t('profile.photo')}</span>
            <div className="photo-row">
              <div className="photo-preview">
                {photo ? (
                  <img src={photo} alt="" />
                ) : (
                  <span className="material-symbols-outlined">account_circle</span>
                )}
              </div>
              <div className="photo-actions">
                <label className="btn btn-ghost btn-sm">
                  <span className="material-symbols-outlined">upload</span>
                  {t('profile.photo.change')}
                  <input type="file" accept="image/*" hidden onChange={handlePhotoChange} />
                </label>
                {photo && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm btn-danger-text"
                    onClick={() => setPhoto('')}
                  >
                    <span className="material-symbols-outlined">delete</span>
                    {t('profile.photo.remove')}
                  </button>
                )}
                <small className="field-hint">{t('profile.photo.hint')}</small>
              </div>
            </div>
          </div>

          {/* Langue : boutons drapeaux */}
          <div className="field">
            <span className="field-label">{t('profile.language')}</span>
            <div className="option-row">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  className={`option-btn ${lang === l.code ? 'is-active' : ''}`}
                  onClick={() => setLanguage(l.code)}
                  aria-pressed={lang === l.code}
                >
                  {l.code === 'fr' ? <FlagFR /> : <FlagEN />}
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme : boutons sombre / clair */}
          <div className="field">
            <span className="field-label">{t('profile.theme')}</span>
            <div className="option-row">
              <button
                type="button"
                className={`option-btn ${theme === 'dark' ? 'is-active' : ''}`}
                onClick={() => setTheme('dark')}
                aria-pressed={theme === 'dark'}
              >
                <span className="material-symbols-outlined">dark_mode</span>
                {t('nav.theme.dark')}
              </button>
              <button
                type="button"
                className={`option-btn ${theme === 'light' ? 'is-active' : ''}`}
                onClick={() => setTheme('light')}
                aria-pressed={theme === 'light'}
              >
                <span className="material-symbols-outlined">light_mode</span>
                {t('nav.theme.light')}
              </button>
            </div>
          </div>

          {/* Fuseau horaire */}
          <label className="field">
            <span className="field-label">{t('profile.timezone')}</span>
            <div className="input-wrap">
              <span className="material-symbols-outlined input-icon">schedule</span>
              <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <span className="material-symbols-outlined">save</span>
              {saving ? t('app.loading') : t('common.save')}
            </button>
          </div>
        </form>

        {/* --- Section 2 : securite (changement de mot de passe) --- */}
        <form className="modal-body profile-security" onSubmit={handlePasswordChange}>
          <h3 className="section-title">
            <span className="material-symbols-outlined">lock</span>
            {t('profile.section.security')}
          </h3>

          {/* Mot de passe actuel (avec oeil) */}
          <label className="field">
            <span className="field-label">{t('profile.password.current')}</span>
            <div className="input-wrap">
              <span className="material-symbols-outlined input-icon">password</span>
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowCurrent((s) => !s)}
                aria-label={showCurrent ? 'Masquer' : 'Afficher'}
              >
                <span className="material-symbols-outlined">
                  {showCurrent ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </label>

          {/* Nouveau mot de passe (avec oeil) */}
          <label className="field">
            <span className="field-label">{t('profile.password.new')}</span>
            <div className="input-wrap">
              <span className="material-symbols-outlined input-icon">key</span>
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowNew((s) => !s)}
                aria-label={showNew ? 'Masquer' : 'Afficher'}
              >
                <span className="material-symbols-outlined">
                  {showNew ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </label>

          {/* Confirmation (avec oeil) */}
          <label className="field">
            <span className="field-label">{t('profile.password.confirm')}</span>
            <div className="input-wrap">
              <span className="material-symbols-outlined input-icon">key</span>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowConfirm((s) => !s)}
                aria-label={showConfirm ? 'Masquer' : 'Afficher'}
              >
                <span className="material-symbols-outlined">
                  {showConfirm ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </label>

          <div className="modal-actions">
            <button type="submit" className="btn btn-primary">
              <span className="material-symbols-outlined">lock_reset</span>
              {t('common.confirm')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Drapeau Francais (SVG inline, partage avec la Navbar). */
function FlagFR() {
  return (
    <svg viewBox="0 0 24 16" className="flag-svg" aria-hidden="true">
      <rect width="8" height="16" fill="#0055A4" />
      <rect x="8" width="8" height="16" fill="#F4F4F4" />
      <rect x="16" width="8" height="16" fill="#EF4135" />
    </svg>
  );
}

/** Drapeau Britannique simplifie (SVG inline, partage avec la Navbar). */
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
