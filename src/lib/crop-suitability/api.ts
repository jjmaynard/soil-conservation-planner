import { CalculationRequest, CalculationResponse, CropListResponse } from './types';

const API_BASE_URL = 'https://us-gaez-api.vercel.app';

/**
 * Fetch list of available crops
 */
export async function fetchCrops(): Promise<CropListResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/crops`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch crops: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Calculate soil quality indices
 */
export async function calculateSoilQuality(
  request: CalculationRequest
): Promise<CalculationResponse> {
  console.log('[API] Sending calculation request:', JSON.stringify(request, null, 2));
  
  const response = await fetch(`${API_BASE_URL}/api/v1/calculate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('[API] Calculation error:', error);
    throw new Error(error.message || `Calculation failed: ${response.statusText}`);
  }

  const result = await response.json();
  console.log('[API] Calculation successful:', result);
  return result;
}
