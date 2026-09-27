import { useState, useEffect } from 'react';
import { getToken } from './api';
import Header from './components/Header';
import Footer from './components/Footer';
import ToastHost from './components/Toast';
import AuthPage from './components/AuthPage';
import TasksPage from './components/TasksPage';

/**
 * Composant racine.
 * - Session JWT present -> page des taches
 * - Sinon -> page d'authentification
 * - Header + Footer communs, notifications toast globales
 */
export default function App() {
  // Etat initial derive de la presence du token JWT
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getToken()));

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

  return (
    <div className="app-shell">
      <ToastHost />
      <Header onLogout={() => setIsAuthenticated(false)} />

      <main className="main">
        {isAuthenticated ? <TasksPage /> : <AuthPage onLogin={() => setIsAuthenticated(true)} />}
      </main>

      <Footer />
    </div>
  );
}
