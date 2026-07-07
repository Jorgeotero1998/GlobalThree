import { useEffect, useState } from 'react';
import type { CountryRecord } from '@/types';
import { fetchCountryDetail } from '@/data/countries';

export function useCountryDetail(code: string | null) {
  const [record, setRecord] = useState<CountryRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setRecord(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchCountryDetail(code)
      .then((data) => {
        if (cancelled) return;
        if (!data) setError('Country data unavailable');
        setRecord(data);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load country data');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  return { record, loading, error };
}
