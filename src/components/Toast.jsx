import { useEffect, useState } from 'react';
import { subscribe } from '../toast';

/**
 * Affiche les notifications toast en haut a droite.
 * Chaque toast disparait automatiquement apres 3,5 secondes.
 */
export default function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Abonnement au bus de notifications
    const unsubscribe = subscribe((toast) => {
      setToasts((prev) => [...prev, toast]);
      // Suppression automatique apres 3,5 s
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 3500);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span className="material-symbols-outlined">
            {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
          </span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
