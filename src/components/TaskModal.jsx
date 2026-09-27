import { useState, useEffect } from 'react';

/**
 * Modal de creation / edition d'une tache (action CRUD en modal,
 * conformement au guide). Fermeture par Escape ou clic sur l'overlay.
 */
export default function TaskModal({ task, onSave, onClose, saving }) {
  const isEdit = Boolean(task?.id);
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');

  // Fermeture au clavier (Escape)
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), description: description.trim() });
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <span className="material-symbols-outlined">
              {isEdit ? 'edit' : 'add_task'}
            </span>
            {isEdit ? 'Modifier la tache' : 'Nouvelle tache'}
          </h2>
          <button className="btn-icon" onClick={onClose} aria-label="Fermer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="task-title">Titre *</label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex. Finaliser le rapport"
              maxLength={200}
              required
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="task-desc">Description</label>
            <textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details optionnels..."
              maxLength={500}
              rows={3}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={!title.trim() || saving}>
              {saving ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Creer la tache'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
