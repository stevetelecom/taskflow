/**
 * Client API : toutes les communications avec le backend Spring Boot.
 * Le token JWT est stocke dans localStorage et envoye dans l'en-tete
 * Authorization de chaque requete protegee.
 */

// En dev, base relative '/api' : Vite proxy vers le backend (voir vite.config.js).
// En production, on peut definir VITE_API_URL (ex. https://mon-api.com/api).
const API_BASE = import.meta.env.VITE_API_URL || '/api';

const TOKEN_KEY = 'taskflow.token';
const USER_KEY = 'taskflow.username';

// --- Gestion du token ---

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUsername() {
  return localStorage.getItem(USER_KEY);
}

export function saveSession(token, username) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, username);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Requete generique. Renvoie les donnees JSON ou leve une Error
 * avec le message renvoye par le backend (ex. "Identifiants invalides").
 */
async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // 204 No Content : pas de corps a lire
  if (response.status === 204) return null;

  let data = null;
  try {
    data = await response.json();
  } catch {
    // Reponse non JSON : on ignore
  }

  if (!response.ok) {
    const message = data?.message || `Erreur ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

// --- Endpoints publics ---

/** Inscription : renvoie { token, username }. */
export function register(username, password) {
  return request('/auth/register', { method: 'POST', body: { username, password }, auth: false });
}

/** Connexion : renvoie { token, username }. */
export function login(username, password) {
  return request('/auth/login', { method: 'POST', body: { username, password }, auth: false });
}

// --- Endpoints proteges (JWT) ---

/** Liste des taches. filter : "all" | "active" | "done". */
export function getTasks(filter = 'all') {
  return request(`/tasks?filter=${encodeURIComponent(filter)}`);
}

/** Cree une tache. */
export function createTask(task) {
  return request('/tasks', { method: 'POST', body: task });
}

/** Modifie une tache existante. */
export function updateTask(id, task) {
  return request(`/tasks/${id}`, { method: 'PUT', body: task });
}

/** Bascule l'etat d'une tache. */
export function toggleTask(id) {
  return request(`/tasks/${id}/toggle`, { method: 'PATCH' });
}

/** Supprime une tache. */
export function deleteTask(id) {
  return request(`/tasks/${id}`, { method: 'DELETE' });
}

/** Supprime toutes les taches terminees. Renvoie { deleted }. */
export function deleteCompleted() {
  return request('/tasks/completed', { method: 'DELETE' });
}

// --- Endpoints profil (JWT) ---

/** Recupere le profil de l'utilisateur connecte. */
export function getProfile() {
  return request('/profile');
}

/** Met a jour le profil (displayName, photo, language, theme, timezone). */
export function updateProfile(profile) {
  return request('/profile', { method: 'PUT', body: profile });
}

/** Change le mot de passe (currentPassword, newPassword). */
export function changePassword(currentPassword, newPassword) {
  return request('/profile/password', { method: 'PUT', body: { currentPassword, newPassword } });
}

// --- Endpoints notifications (JWT) ---

/** Liste les notifications de l'utilisateur (les plus recentes d'abord). */
export function getNotifications() {
  return request('/notifications');
}

/** Nombre de notifications non lues. Renvoie { count }. */
export function getUnreadCount() {
  return request('/notifications/unread');
}

/** Marque une notification comme lue. */
export function markNotificationAsRead(id) {
  return request(`/notifications/${id}/read`, { method: 'PUT' });
}

/** Marque toutes les notifications comme lues. */
export function markAllNotificationsAsRead() {
  return request('/notifications/read-all', { method: 'PUT' });
}

/** Supprime une notification. */
export function deleteNotification(id) {
  return request(`/notifications/${id}`, { method: 'DELETE' });
}
