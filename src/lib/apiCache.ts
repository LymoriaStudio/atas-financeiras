// Cache em memória, vive enquanto o app SPA estiver rodando.
// Sobrevive à navegação entre páginas (react-router), mas é zerado
// automaticamente num reload completo (F5) porque o módulo é recarregado.

type Listener = () => void;

const store = new Map<string, unknown>();
const listeners = new Map<string, Set<Listener>>();

export function cacheGet<T>(key: string): T | undefined {
  return store.get(key) as T | undefined;
}

export function cacheHas(key: string): boolean {
  return store.has(key);
}

export function cacheSet<T>(key: string, value: T) {
  store.set(key, value);
  listeners.get(key)?.forEach((fn) => fn());
}

export function cacheInvalidate(key: string) {
  store.delete(key);
  listeners.get(key)?.forEach((fn) => fn());
}

export function cacheSubscribe(key: string, fn: Listener) {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(fn);
  return () => listeners.get(key)?.delete(fn);
}
