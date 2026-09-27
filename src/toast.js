/**
 * Systeme de notifications toast (pattern pub/sub leger).
 * Usage : toast.success('Tache creee'); toast.error('...');
 */

let listeners = [];

function emit(type, message) {
  const id = Date.now() + Math.random();
  listeners.forEach((fn) => fn({ id, type, message }));
}

export const toast = {
  success: (message) => emit('success', message),
  error: (message) => emit('error', message),
  info: (message) => emit('info', message),
};

/** Abonne un composant (ToastHost) aux notifications. Renvoie la fonction de desabonnement. */
export function subscribe(listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((fn) => fn !== listener);
  };
}
