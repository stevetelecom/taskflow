import { t, useLang } from '../i18n';

/**
 * Barre laterale de navigation (connectee).
 * - Desktop : colonne fixe a gauche du contenu.
 * - Mobile : tiroir (drawer) ouvert depuis le burger de la Navbar.
 * - Les elements se desactivent en mode lecture si le module n'existe pas.
 */
export default function Sidebar({ currentView = 'tasks', onNavigate, open, onClose }) {
  const lang = useLang();

  // Les vues disponibles (dashboard recharge les taches, filtrage cote client)
  const items = [
    { id: 'tasks', icon: 'checklist', label: t('nav.tasks') },
    { id: 'dashboard', icon: 'space_dashboard', label: t('nav.dashboard') },
  ];

  return (
    <>
      {/* Fond assombri mobile : clic pour fermer le tiroir */}
      {open && <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />}

      <aside
        className={`sidebar ${open ? 'is-open' : ''}`}
        aria-label={t('nav.menu')}
      >
        <div className="sidebar-head">
          <span className="material-symbols-outlined sidebar-logo">checklist</span>
          <span className="sidebar-title">{t('app.name')}</span>
          {/* Fermeture (mobile) */}
          <button className="btn-icon sidebar-close" onClick={onClose} aria-label={t('common.close')}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="sidebar-nav">
          {items.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${currentView === item.id ? 'is-active' : ''}`}
              onClick={() => {
                onNavigate?.(item.id);
                onClose?.(); // referme le tiroir mobile apres navigation
              }}
              aria-current={currentView === item.id ? 'page' : undefined}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-foot">
          <span className="sidebar-version">TaskFlow v1.0</span>
        </div>
      </aside>
    </>
  );
}
