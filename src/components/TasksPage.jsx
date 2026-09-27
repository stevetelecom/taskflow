import { useState, useEffect, useCallback } from 'react';
import {
  getTasks,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
  deleteCompleted,
} from '../api';
import { toast } from '../toast';
import TaskModal from './TaskModal';
import ConfirmModal from './ConfirmModal';

/**
 * Page principale : liste des taches de l'utilisateur connecte.
 * Toutes les actions CRUD passent par des modals et confirment
 * par un toast (exigences du guide).
 */
export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modals : creation/edition + confirmation de suppression
  const [modalTask, setModalTask] = useState(null); // null | {} | task
  const [confirmState, setConfirmState] = useState(null); // { type, task }
  const [busy, setBusy] = useState(false);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTasks(filter);
      setTasks(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Rechargement a l'ouverture et a chaque changement de filtre
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // --- Actions CRUD ---

  async function handleSave(formData) {
    setBusy(true);
    try {
      if (modalTask?.id) {
        await updateTask(modalTask.id, formData);
        toast.success('Tache modifiee avec succes');
      } else {
        await createTask(formData);
        toast.success('Tache creee avec succes');
      }
      setModalTask(null);
      loadTasks();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleToggle(task) {
    try {
      await toggleTask(task.id);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)));
      toast.success(task.done ? 'Tache reactivee' : 'Tache terminee, bravo');
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleConfirmDelete() {
    setBusy(true);
    try {
      if (confirmState.type === 'one') {
        await deleteTask(confirmState.task.id);
        toast.success('Tache supprimee');
      } else {
        const res = await deleteCompleted();
        toast.success(`${res.deleted} tache(s) terminee(s) supprimee(s)`);
      }
      setConfirmState(null);
      loadTasks();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  const activeCount = tasks.filter((t) => !t.done).length;
  const doneCount = tasks.length - activeCount;

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <div>
          <h1>Mes taches</h1>
          <p className="tasks-subtitle">
            {activeCount} active(s) · {doneCount} terminee(s)
          </p>
        </div>
        <button className="btn-primary" onClick={() => setModalTask({})}>
          <span className="material-symbols-outlined">add</span>
          Nouvelle tache
        </button>
      </div>

      {/* Filtres */}
      <div className="filters" role="tablist" aria-label="Filtres">
        {[
          ['all', 'Toutes'],
          ['active', 'Actives'],
          ['done', 'Terminees'],
        ].map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={filter === key}
            className={filter === key ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Liste des taches */}
      {loading ? (
        <div className="loading">
          <span className="material-symbols-outlined spin">progress_activity</span>
          Chargement...
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <span className="material-symbols-outlined">task_alt</span>
          <p>Aucune tache a afficher</p>
          <span className="empty-hint">Creez votre premiere tache pour commencer</span>
        </div>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id} className={`task ${task.done ? 'done' : ''}`}>
              <button
                className="check-btn"
                onClick={() => handleToggle(task)}
                aria-label={task.done ? 'Réactiver la tache' : 'Marquer comme terminee'}
                title={task.done ? 'Réactiver' : 'Terminer'}
              >
                <span className="material-symbols-outlined">
                  {task.done ? 'check_circle' : 'radio_button_unchecked'}
                </span>
              </button>

              <div className="task-content">
                <span className="task-title">{task.title}</span>
                {task.description && <span className="task-desc">{task.description}</span>}
                <span className="task-date">
                  <span className="material-symbols-outlined">schedule</span>
                  {new Date(task.createdAt).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="task-actions">
                <button className="btn-icon" onClick={() => setModalTask(task)} title="Modifier" aria-label="Modifier">
                  <span className="material-symbols-outlined">edit</span>
                </button>
                <button
                  className="btn-icon danger"
                  onClick={() => setConfirmState({ type: 'one', task })}
                  title="Supprimer"
                  aria-label="Supprimer"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Nettoyage des taches terminees */}
      {doneCount > 0 && (
        <button className="clear-btn" onClick={() => setConfirmState({ type: 'completed' })}>
          <span className="material-symbols-outlined">delete_sweep</span>
          Supprimer les taches terminees ({doneCount})
        </button>
      )}

      {/* Modals */}
      {modalTask !== null && (
        <TaskModal
          task={modalTask}
          saving={busy}
          onClose={() => setModalTask(null)}
          onSave={handleSave}
        />
      )}

      {confirmState !== null && (
        <ConfirmModal
          title={confirmState.type === 'one' ? 'Supprimer la tache' : 'Supprimer les taches terminees'}
          message={
            confirmState.type === 'one'
              ? `Supprimer definitivement "${confirmState.task.title}" ?`
              : `Supprimer definitivement ${doneCount} tache(s) terminee(s) ?`
          }
          busy={busy}
          onClose={() => setConfirmState(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
