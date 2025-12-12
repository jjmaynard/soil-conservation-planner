// React Hook for Ecological Site Data
// Custom hook for fetching and managing ecological site data

import { useState, useEffect } from 'react';
import type { FarmerFriendlyESD } from '#src/lib/esd-formatter';

export function useEcologicalSite(ecoclassid: string | null | undefined) {
  const [data, setData] = useState<FarmerFriendlyESD | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ecoclassid) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchESD = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/ecological-site/${ecoclassid}`);
        if (!response.ok) {
          throw new Error('Failed to fetch ecological site data');
        }
        
        const esdData = await response.json();
        setData(esdData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchESD();
  }, [ecoclassid]);

  return { data, loading, error };
}
