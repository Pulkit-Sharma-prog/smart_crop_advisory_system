import { useCallback, useEffect, useRef, useState } from "react";

type CacheEntry<T> = {
  data: T;
  cachedAt: number;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();

interface AsyncOptions {
  cacheKey?: string;
  ttlMs?: number;
}

export function useAsyncData<T>(loader: () => Promise<T>, options: AsyncOptions = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (options.cacheKey) {
      const cached = memoryCache.get(options.cacheKey) as CacheEntry<T> | undefined;
      const ttlMs = options.ttlMs ?? 30_000;

      if (cached && Date.now() - cached.cachedAt < ttlMs) {
        setData(cached.data);
        setLoading(false);
        return;
      }
    }

    try {
      const nextData = await loader();

      if (!mountedRef.current) {
        return;
      }

      setData(nextData);

      if (options.cacheKey) {
        memoryCache.set(options.cacheKey, {
          data: nextData,
          cachedAt: Date.now(),
        });
      }
    } catch {
      if (mountedRef.current) {
        setError("Unable to load data");
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [loader, options.cacheKey, options.ttlMs]);

  useEffect(() => {
    mountedRef.current = true;
    void load();

    return () => {
      mountedRef.current = false;
    };
  }, [load]);

  return { data, loading, error, reload: load };
}
