import { useCallback, useEffect, useRef, useState } from "react";
import { cacheGet, cacheHas, cacheSet, cacheSubscribe } from "./apiCache";

type FetchResult<T> = { data: T | null; error: unknown };

/**
 * Busca um recurso e guarda o resultado num cache em memória compartilhado
 * pela chave (`key`). Ao navegar entre páginas que usam a mesma chave, o
 * dado já buscado é reaproveitado — sem refetch e sem loading.
 *
 * `refetch(true)` ignora o cache e busca de novo (usado no botão "Atualizar").
 * `setData` atualiza tanto o estado local quanto o cache compartilhado,
 * então outras páginas que dependem da mesma chave já veem o dado novo.
 */
export function useCachedResource<T>(key: string, fetcher: () => Promise<FetchResult<T>>) {
  const [data, setDataState] = useState<T | null>(() => cacheGet<T>(key) ?? null);
  const [loading, setLoading] = useState(!cacheHas(key));
  const [error, setError] = useState<unknown>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(async (force = false) => {
    if (!force && cacheHas(key)) {
      setDataState(cacheGet<T>(key) ?? null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetcherRef.current();
    if (!res.error) {
      cacheSet(key, res.data);
    } else {
      setError(res.error);
    }
    setLoading(false);
  }, [key]);

  useEffect(() => {
    const unsub = cacheSubscribe(key, () => setDataState(cacheGet<T>(key) ?? null));
    load(false);
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setData = useCallback((updater: T | ((prev: T | null) => T)) => {
    const prev = cacheGet<T>(key) ?? null;
    const next = typeof updater === "function" ? (updater as (p: T | null) => T)(prev) : updater;
    cacheSet(key, next);
  }, [key]);

  const refetch = useCallback(() => load(true), [load]);

  return { data, loading, error, setData, refetch };
}
