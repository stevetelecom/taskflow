import { useCallback, useEffect, useState } from 'react';
import { getToken, getProfile } from './api';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ToastHost from './components/Toast';
import AuthPage from './components/AuthPage';
import TasksPage from './components/TasksPage';
import Dashboard from './components/Dashboard';
import { initTheme } from './theme';

/**
 * Composant racine.
 * - Session JWT present -> Navbar + Sidebar + page des taches
 * - Sinon -> page d'authentification seule
 * - Profil charge une fois connecte (nom affiche, photo, langue, theme)
 */
export default function App() {
  // Etat initial derive de la presence du token JWT
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getToken()));

  // Profil utilisateur charge depuis l'API (null tant que non charge)
  const [profile, setProfile] = useState(null);

  // Sidebar : ouverte sur mobile (drawer), statique sur desktop
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Vue courante : 'tasks' ou 'dashboard'
  const [view, setView] = useState('tasks');

  // Applique le theme stocke avant le premier rendu (pas de flash)
  useEffect(() => {
    initTheme();
  }, []);

  // Synchronise l'onglet si la session change ailleurs (logout dans un autre onglet)
  useEffect(() => {
    function onStorage(e) {
      if (e.key === 'taskflow.token') {
        setIsAuthenticated(Boolean(getToken()));
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Charge le profil une fois connecte (et le remet a null si deconnecte)
  useEffect(() => {
    let cancelled = false;

    if (!isAuthenticated) {
      setProfile(null);
      return undefined;
    }

    getProfile()
      .then((p) => {
        if (!cancelled) setProfile(p);
      })
      .catch(() => {
        // Profil indisponible (token expire...) : on garde l'UI locale
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  /**
   * Applique une mise a jour partielle du profil (langue, theme depuis la
   * Navbar) ou remplace le profil complet (apres save du modal).
   * Persiste aussi cote backend quand la cle modifiee est langue ou theme.
   */
  const handleProfileChange = useCallback((partial) => {
    setProfile((prev) => ({ ...prev, ...partial }));
  }, []);

  return (
    <div className="app-shell">
      <ToastHost />

      {isAuthenticated ? (
        <div className="app-layout">
          <Sidebar
            currentView={view}
            onNavigate={setView}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <div className="app-main">
            <Navbar
              profile={profile}
              onLogout={() => setIsAuthenticated(false)}
              onToggleSidebar={() => setSidebarOpen((o) => !o)}
              onProfileChange={handleProfileChange}
            />
            <main className="main">
              {view === 'dashboard' ? <Dashboard /> : <TasksPage />}
            </main>
          </div>
        </div>
      ) : (
        <AuthPage onLogin={() => setIsAuthenticated(true)} />
      )}

      <Footer />
    </div>
  );
}
