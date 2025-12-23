'use client';

import { useState, useEffect } from 'react';
import { Crop } from '../lib/crop-suitability/types';
import { fetchCrops } from '../lib/crop-suitability/api';

export function useCropList() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCrops() {
      try {
        const response = await fetchCrops();
        setCrops(response.crops);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load crops');
      } finally {
        setLoading(false);
      }
    }

    loadCrops();
  }, []);

  return { crops, loading, error };
}
