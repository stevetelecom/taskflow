import { useState } from 'react';
import { login, register, saveSession } from '../api';
import { toast } from '../toast';

/**
 * Landing page + authentification (split-screen).
 * - Gauche : video de demonstration (Pexels, licence libre) en lecture
 *   permanente : autoplay, boucle, muet (autoplay interdit le son).
 * - Droite : formulaire connexion / inscription.
 * Le champ mot de passe possede une icone "oeil" (exigence du guide).
 */
export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login'); // login | register
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data =
        mode === 'login'
          ? await login(username.trim(), password)
          : await register(username.trim(), password);

      saveSession(data.token, data.username);
      toast.success(mode === 'login' ? 'Connexion reussie' : 'Compte cree avec succes');
      onLogin(data.username);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-split">
      {/* ===== Panneau gauche : video + accroche ===== */}
      <section className="hero-video" aria-label="Presentation de TaskFlow">
        {/* Lecture permanente : autoplay + loop + muted + playsInline */}
        <video
          className="hero-video-el"
          src="/videos/hero.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
        {/* Voile degrade pour la lisibilite du texte par-dessus la video */}
        <div className="hero-overlay" />

        <div className="hero-content">
          <span className="hero-badge">
            <span className="material-symbols-outlined">bolt</span>
            Organisez votre quotidien
          </span>
          <h1 className="hero-title">
            Vos taches, <br />
            <span className="hero-title-accent">enfin sous controle.</span>
          </h1>
          <p className="hero-text">
            TaskFlow simplifie la gestion de vos projets : creez, suivez et
            terminez vos taches en quelques clics, seul ou en equipe.
          </p>

          <ul className="hero-features">
            <li>
              <span className="material-symbols-outlined">check_circle</span>
              Suivi en temps reel de votre avance
            </li>
            <li>
              <span className="material-symbols-outlined">security</span>
              Donnees chiffrees et espace personnel securise
            </li>
            <li>
              <span className="material-symbols-outlined">devices</span>
              Interface moderne, rapide et responsive
            </li>
          </ul>
        </div>
      </section>

      {/* ===== Panneau droite : formulaire ===== */}
      <section className="auth-panel">
        <div className="auth-card">
          <img src="/logo.svg" alt="Logo TaskFlow" className="auth-logo" />
          <h2 className="auth-title">TaskFlow</h2>
          <p className="auth-subtitle">
            {mode === 'login' ? 'Connectez-vous a votre espace' : 'Creez votre compte'}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="username">Nom d'utilisateur</label>
              <div className="input-wrap">
                <span className="material-symbols-outlined input-icon">person</span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ex. johndoe"
                  minLength={3}
                  maxLength={50}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="password">Mot de passe</label>
              <div className="input-wrap">
                <span className="material-symbols-outlined input-icon">lock</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6 caracteres minimum"
                  minLength={6}
                  maxLength={100}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                {/* Icône oeil : affiche / masque le mot de passe */}
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  title={showPassword ? 'Masquer' : 'Afficher'}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary btn-block" disabled={loading}>
              {loading ? 'Patientez...' : mode === 'login' ? 'Se connecter' : 'Creer mon compte'}
            </button>
          </form>

          <p className="auth-switch">
            {mode === 'login' ? 'Pas encore de compte ?' : 'Deja inscrit ?'}{' '}
            <button
              type="button"
              className="link-btn"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' ? 'Inscrivez-vous' : 'Connectez-vous'}
            </button>
          </p>
        </div>
      </section>
    </div>
  );
}
