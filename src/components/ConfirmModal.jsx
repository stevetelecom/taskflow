import { useEffect } from 'react';

/**
 * Modal de confirmation generique (suppressions).
 */
export default function ConfirmModal({ title, message, confirmLabel, onConfirm, onClose, busy }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal modal-confirm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <span className="material-symbols-outlined danger">warning</span>
            {title}
          </h2>
          <button className="btn-icon" onClick={onClose} aria-label="Fermer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className="confirm-message">{message}</p>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Annuler
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Suppression...' : confirmLabel || 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  );
}
