import { getUsername, clearSession } from '../api';
import { toast } from '../toast';

/**
 * En-tete de l'application.
 * Identite visuelle : les couleurs du logo (degrade indigo -> emeraude)
 * sont reprises dans la ligne d'accent sous le bandeau et le nom de marque.
 */
export default function Header({ onLogout }) {
  const username = getUsername();

  function handleLogout() {
    clearSession();
    toast.info('Vous etes deconnecte');
    onLogout();
  }

  return (
    <header className="header">
      <div className="header-inner">
        {/* Marque : logo + nom en degrade aux couleurs du logo */}
        <a className="brand" href="/" aria-label="TaskFlow, accueil">
          <img src="/logo.svg" alt="" className="brand-logo" />
          <span className="brand-name">TaskFlow</span>
        </a>

        {username && (
          <nav className="header-user" aria-label="Session utilisateur">
            {/* Puce utilisateur style "grand compte pro" */}
            <span className="user-chip">
              <span className="material-symbols-outlined user-icon">account_circle</span>
              <span className="username">{username}</span>
            </span>
            <button
              className="btn-icon"
              onClick={handleLogout}
              title="Se deconnecter"
              aria-label="Se deconnecter"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
