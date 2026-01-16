import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  maxDuration: 60, // Can take 15-30 seconds
};

interface ComprehensiveAssessment {
  location: {
    latitude: number;
    longitude: number;
  };
  assessment_year: number;
  erosion_risk?: {
    erosion_risk_score: number;
    risk_class: string;
    slope_degrees: number;
    stream_power_index: number;
    soil_erodibility_k: number;
  };
  concentrated_flow?: {
    gully_risk_score: number;
    risk_class: string;
    flow_accumulation: number;
    convergence_index: number;
  };
  ponding?: {
    ponding_risk_score: number;
    risk_class: string;
    wetness_index: number;
    drainage_class: string;
  };
  drought?: {
    drought_stress_score: number;
    risk_class: string;
    water_balance_mm: number;
    growing_season_deficit_mm: number;
  };
  soil_quality?: {
    quality_score: number;
    class: string;
    ndvi_trend_5yr: number;
    productivity_stability: number;
  };
  productivity?: {
    yield_gap_percent: number;
    performance_class: string;
    avg_ndvi_5yr: number;
    peak_ndvi_5yr: number;
  };
  svi?: {
    surface_vulnerability: number;
    subsurface_drained_vulnerability: number;
    subsurface_undrained_vulnerability: number;
  };
  nccpi?: {
    corn: number;
    soybeans: number;
    cotton: number;
    small_grains: number;
    all_crops: number;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ComprehensiveAssessment | { error: string }>
) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get parameters from query string or body
    const latitude = req.method === 'POST' 
      ? req.body.latitude 
      : parseFloat(req.query.latitude as string);
    const longitude = req.method === 'POST'
      ? req.body.longitude
      : parseFloat(req.query.longitude as string);
    const year = req.method === 'POST'
      ? req.body.year || 2023
      : parseInt(req.query.year as string) || 2023;

    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: 'Valid latitude and longitude required' });
    }

    console.log(`[Point Assessment] Fetching comprehensive assessment for (${latitude}, ${longitude}) year ${year}`);

    // Call GEE API - parameters in query string, not body
    const geeUrl = `https://gee-api-production.up.railway.app/api/point-assessment/comprehensive?latitude=${latitude}&longitude=${longitude}&year=${year}`;
    
    console.log(`[Point Assessment] Request URL:`, geeUrl);
    
    const response = await fetch(geeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`[Point Assessment] Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorText = await response.text();
      
      // If HTML error page, try to extract useful info
      if (contentType?.includes('text/html')) {
        console.error(`[Point Assessment] GEE API returned HTML error page (${response.status})`);
        console.error(`[Point Assessment] First 500 chars:`, errorText.substring(0, 500));
        throw new Error(`GEE API error (${response.status}): Service returned HTML instead of JSON. The endpoint may not exist or requires different parameters.`);
      }
      
      // Try to parse JSON error for 422
      try {
        const errorJson = JSON.parse(errorText);
        console.error(`[Point Assessment] GEE API validation error:`, errorJson);
        throw new Error(`GEE API validation error (${response.status}): ${JSON.stringify(errorJson)}`);
      } catch (parseError) {
        console.error(`[Point Assessment] GEE API error (non-JSON):`, errorText);
        throw new Error(`GEE API returned ${response.status}: ${errorText}`);
      }
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      console.error(`[Point Assessment] Expected JSON but got ${contentType}`);
      console.error(`[Point Assessment] Response:`, text.substring(0, 500));
      throw new Error(`GEE API returned non-JSON response: ${contentType}`);
    }

    const data = await response.json();
    console.log(`[Point Assessment] Successfully fetched assessment data`);
    console.log(`[Point Assessment] Response keys:`, Object.keys(data));
    console.log(`[Point Assessment] Full response:`, JSON.stringify(data, null, 2));

    res.status(200).json(data);
  } catch (error) {
    console.error('[Point Assessment] Error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}
