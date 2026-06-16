import { useState, useEffect, useRef, useCallback } from 'react';
import type { DataSource } from '@/types';
import { fetchData, generateMockData } from '@/utils/helpers';
import type { ComponentType } from '@/types';

export const useDataSource = (
  dataSource: DataSource,
  type: ComponentType,
  enabled: boolean = true
) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const loadData = useCallback(async () => {
    if (!enabled) return;

    if (!dataSource.url) {
      const mock = generateMockData(type);
      setData(mock);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchData(
        dataSource.url,
        dataSource.method,
        dataSource.params,
        dataSource.headers
      );
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [dataSource.url, dataSource.method, dataSource.params, dataSource.headers, type, enabled]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (dataSource.refreshInterval > 0 && dataSource.url && enabled) {
      timerRef.current = setInterval(loadData, dataSource.refreshInterval * 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [dataSource.refreshInterval, dataSource.url, loadData, enabled]);

  return { data, loading, error, refetch: loadData };
};
