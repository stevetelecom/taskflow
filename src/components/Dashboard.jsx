import { useEffect, useState } from 'react';
import { getTasks, getUsername } from '../api';
import { t, useLang } from '../i18n';
import { useTheme } from '../theme';

/**
 * Vue Tableau de bord : statistiques des taches et liste des taches recentes.
 * Reutilise l'endpoint GET /api/tasks?filter=all, calculs cote client.
 */
export default function Dashboard() {
  const lang = useLang();
  const username = getUsername();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getTasks('all');
        if (!cancelled) setTasks(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setTasks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Statistiques derivees
  const total = tasks.length;
  const done = tasks.filter((x) => x.completed).length;
  const active = total - done;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  // 5 taches les plus recentes (par date de creation decroissante)
  const recent = [...tasks]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="dashboard">
      <h1 className="page-title">
        <span className="material-symbols-outlined">space_dashboard</span>
        {t('dashboard.title')}
      </h1>
      <p className="page-subtitle">
        {t('dashboard.hello')}, <strong>{username}</strong> !
      </p>

      {/* Cartes de statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="material-symbols-outlined stat-icon stat-icon-total">list_alt</span>
          <div>
            <span className="stat-value">{total}</span>
            <span className="stat-label">{t('dashboard.total')}</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="material-symbols-outlined stat-icon stat-icon-active">pending_actions</span>
          <div>
            <span className="stat-value">{active}</span>
        <span className="stat-label">{t('dashboard.active')}</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="material-symbols-outlined stat-icon stat-icon-done">task_alt</span>
          <div>
            <span className="stat-value">{done}</span>
            <span className="stat-label">{t('dashboard.done')}</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="material-symbols-outlined stat-icon stat-icon-progress">trending_up</span>
          <div>
            <span className="stat-value">{progress}%</span>
            <span className="stat-label">{t('dashboard.progress')}</span>
          </div>
        </div>
  </div>

      {/* Taches recentes */}
      <div className="recent-card">
        <h2>
          <span className="material-symbols-outlined">history</span>
          {t('dashboard.recent')}
        </h2>

        {loading && <p className="recent-empty">{t('common.loading')}</p>}

        {!loading && recent.length === 0 && (
          <p className="recent-empty">{t('dashboard.recent.empty')}</p>
        )}

        {!loading &&
          recent.map((task) => (
            <div key={task.id} className={`recent-item ${task.completed ? 'is-done' : ''}`}>
              <span className="material-symbols-outlined">
                {task.completed ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <div className="recent-body">
                <p className="recent-title">{task.title}</p>
                {task.description && <p className="recent-desc">{task.description}</p>}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
