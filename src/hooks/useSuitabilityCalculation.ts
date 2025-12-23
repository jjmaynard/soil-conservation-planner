'use client';

import { useState } from 'react';
import { CalculationRequest, CalculationResponse } from '../lib/crop-suitability/types';
import { calculateSoilQuality } from '../lib/crop-suitability/api';

export function useSuitabilityCalculation() {
  const [result, setResult] = useState<CalculationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = async (request: CalculationRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await calculateSoilQuality(request);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return { result, loading, error, calculate, reset };
}
