// Tab Data Fetcher - Utility for fetching tab data with caching and API integration

import { resilientFetch } from './api/resilient-fetch';
import { getCachedData, setCachedData, getStaleData } from './api/cache';
import { getDataSource } from './api/providers/registry';
import { getTabConfig } from '@/config/tab-configs';
import { getLandTypeParameters } from '@/config/land-type-parameters';

export interface TabDataRequest {
  tabId: string;
  landTypeId: string;
  fieldGeometry: any; // GeoJSON
  userInputs?: Record<string, any>;
}

export interface TabDataResponse<T = any> {
  data: T;
  metadata: {
    cached: boolean;
    timestamp: number;
    dataSource: string;
    cacheExpires?: number;
  };
  interpretation?: InterpretationResult;
}

export interface InterpretationResult {
  severity: 'low' | 'moderate' | 'high' | 'critical';
  interpretation: string;
  recommendation: string;
  thresholds?: Record<string, any>;
}

/**
 * Fetch data for a specific tab with caching and API integration
 */
export async function fetchTabData<T = any>(
  request: TabDataRequest
): Promise<TabDataResponse<T>> {
  const { tabId, landTypeId, fieldGeometry, userInputs } = request;

  // Get tab configuration
  const tabConfig = getTabConfig(tabId);
  if (!tabConfig) {
    throw new Error(`Tab configuration not found: ${tabId}`);
  }

  // Build cache key from request
  const cacheKey = buildCacheKey(request);

  // Try to get cached data
  const cached = await getCachedData<T>(cacheKey, tabConfig.cache_duration);
  if (cached) {
    console.log(`Cache hit for ${tabId} (${landTypeId})`);
    return {
      data: cached,
      metadata: {
        cached: true,
        timestamp: Date.now(),
        dataSource: 'cache'
      }
    };
  }

  // Fetch fresh data from appropriate API(s)
  try {
    const data = await fetchFromAPIs<T>(tabId, landTypeId, fieldGeometry, userInputs);

    // Cache the result
    const primarySource = Object.keys(tabConfig.api_dependencies)[0];
    await setCachedData(
      cacheKey,
      data,
      tabConfig.cache_duration,
      primarySource,
      tabId
    );

    // Apply interpretation rules if available
    const interpretation = applyInterpretation(tabId, landTypeId, data);

    return {
      data,
      metadata: {
        cached: false,
        timestamp: Date.now(),
        dataSource: primarySource,
        cacheExpires: Date.now() + (tabConfig.cache_duration * 1000)
      },
      interpretation
    };

  } catch (error) {
    console.error(`Error fetching data for ${tabId}:`, error);

    // Try to use stale cache as fallback
    const staleData = await getStaleData<T>(cacheKey);
    if (staleData) {
      console.warn(`Using stale cached data for ${tabId}`);
      return {
        data: staleData,
        metadata: {
          cached: true,
          timestamp: Date.now(),
          dataSource: 'stale-cache'
        }
      };
    }

    throw error;
  }
}

/**
 * Build cache key from request parameters
 */
function buildCacheKey(request: TabDataRequest): string {
  const { tabId, landTypeId, fieldGeometry } = request;
  
  // Use field geometry's bounding box or centroid for cache key
  const bounds = JSON.stringify(fieldGeometry.geometry?.coordinates || fieldGeometry);
  const hash = simpleHash(bounds);
  
  return `tab_${tabId}_${landTypeId}_${hash}`;
}

/**
 * Simple hash function for cache keys
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Fetch data from appropriate APIs based on tab configuration
 */
async function fetchFromAPIs<T>(
  tabId: string,
  landTypeId: string,
  fieldGeometry: any,
  userInputs?: Record<string, any>
): Promise<T> {
  const tabConfig = getTabConfig(tabId);
  if (!tabConfig) {
    throw new Error(`Tab configuration not found: ${tabId}`);
  }

  // Determine which API to call based on tab and land type
  const apiDeps = tabConfig.api_dependencies;

  // Handle different tab types
  switch (tabId) {
    case 'soil':
      return await fetchSoilData(fieldGeometry) as T;

    case 'erosion':
      return await fetchErosionData(fieldGeometry, landTypeId) as T;

    case 'productivity':
      return await fetchProductivityData(fieldGeometry, landTypeId) as T;

    case 'practices':
      return await fetchPracticesData(landTypeId, userInputs) as T;

    case 'site_index':
      return await fetchSiteIndexData(fieldGeometry) as T;

    case 'hydric':
      return await fetchHydricSoilData(fieldGeometry) as T;

    case 'infiltration':
      return await fetchInfiltrationData(fieldGeometry) as T;

    default:
      throw new Error(`No API implementation for tab: ${tabId}`);
  }
}

/**
 * Fetch soil properties from SSURGO API
 */
async function fetchSoilData(fieldGeometry: any): Promise<any> {
  const source = getDataSource('ssurgo');
  
  // Build SQL query for SSURGO
  const query = buildSSURGOQuery(fieldGeometry);

  return await resilientFetch(
    `${source.baseUrl}${source.endpoints!.properties}`,
    {
      method: 'POST',
      body: { query },
      sourceId: 'ssurgo',
      retries: 3
    }
  );
}

/**
 * Fetch erosion data from GEE RUSLE-EOS API
 */
async function fetchErosionData(fieldGeometry: any, landTypeId: string): Promise<any> {
  const source = getDataSource('gee_rusle');

  // Call GEE RUSLE-EOS API
  return await resilientFetch(
    `${source.baseUrl}${source.endpoints!.calculate}`,
    {
      method: 'POST',
      body: {
        geometry: fieldGeometry,
        landType: landTypeId
      },
      sourceId: 'gee_rusle',
      retries: 2
    }
  );
}

/**
 * Fetch productivity data (NCCPI for cropland, site index for forestry)
 */
async function fetchProductivityData(fieldGeometry: any, landTypeId: string): Promise<any> {
  if (landTypeId === 'forestry') {
    // Load from static FIA data
    return await resilientFetch('', { sourceId: 'fia' });
  } else {
    // Fetch NCCPI from SSURGO
    const source = getDataSource('ssurgo');
    const query = buildSSURGOProductivityQuery(fieldGeometry);

    return await resilientFetch(
      `${source.baseUrl}${source.endpoints!.properties}`,
      {
        method: 'POST',
        body: { query },
        sourceId: 'ssurgo'
      }
    );
  }
}

/**
 * Fetch conservation practices (static JSON)
 */
async function fetchPracticesData(landTypeId: string, userInputs?: Record<string, any>): Promise<any> {
  // Load from static JSON
  const practices = await resilientFetch('', { sourceId: 'nrcs_practices' });

  // Filter by land type and resource concerns
  return filterPractices(practices, landTypeId, userInputs);
}

/**
 * Fetch site index data for forestry (static JSON)
 */
async function fetchSiteIndexData(fieldGeometry: any): Promise<any> {
  // First get soil data from SSURGO
  const soilData = await fetchSoilData(fieldGeometry);

  // Then load FIA site index curves
  const siteIndexData = await resilientFetch('', { sourceId: 'fia' });

  // Match soil properties to site index curves
  return matchSoilToSiteIndex(soilData, siteIndexData);
}

/**
 * Fetch hydric soil indicators (static JSON + SSURGO)
 */
async function fetchHydricSoilData(fieldGeometry: any): Promise<any> {
  // Get soil components from SSURGO
  const soilData = await fetchSoilData(fieldGeometry);

  // Load hydric soil list
  const hydricList = await resilientFetch('', { sourceId: 'nrcs_hydric_soils' });

  // Match and return hydric indicators
  return matchHydricIndicators(soilData, hydricList);
}

/**
 * Fetch infiltration capacity for developed lands (SSURGO)
 */
async function fetchInfiltrationData(fieldGeometry: any): Promise<any> {
  const source = getDataSource('ssurgo');
  const query = buildSSURGOInfiltrationQuery(fieldGeometry);

  return await resilientFetch(
    `${source.baseUrl}${source.endpoints!.properties}`,
    {
      method: 'POST',
      body: { query },
      sourceId: 'ssurgo'
    }
  );
}

/**
 * Apply interpretation rules to data
 */
function applyInterpretation(
  tabId: string,
  landTypeId: string,
  data: any
): InterpretationResult | undefined {
  const params = getLandTypeParameters(landTypeId, tabId);
  if (!params || !params.interpretation_rules) {
    return undefined;
  }

  // Evaluate interpretation rules
  for (const rule of params.interpretation_rules) {
    if (evaluateCondition(rule.condition, data, params.thresholds)) {
      return {
        severity: rule.severity,
        interpretation: rule.interpretation,
        recommendation: rule.recommendation,
        thresholds: params.thresholds
      };
    }
  }

  return undefined;
}

/**
 * Evaluate interpretation condition
 */
function evaluateCondition(
  condition: string,
  data: any,
  thresholds: Record<string, any>
): boolean {
  // Simple condition evaluation (can be expanded)
  // Example: "erosionRate > tValue"
  try {
    // Create safe evaluation context
    const context = { ...data, ...thresholds };
    
    // This is a simplified evaluation - in production, use a proper expression parser
    const func = new Function(...Object.keys(context), `return ${condition}`);
    return func(...Object.values(context));
  } catch (error) {
    console.error('Error evaluating condition:', condition, error);
    return false;
  }
}

// Helper functions for building SSURGO queries
function buildSSURGOQuery(fieldGeometry: any): string {
  // Simplified - in production, build proper SQL
  return `
    SELECT 
      component.cokey,
      component.compname,
      component.comppct_r,
      chorizon.hzdept_r,
      chorizon.hzdepb_r,
      chorizon.texture,
      chorizon.om_r,
      chorizon.ph1to1h2o_r,
      chorizon.ksat_r
    FROM component
    INNER JOIN chorizon ON component.cokey = chorizon.cokey
    WHERE component.mukey IN (
      -- Spatial query would go here
      SELECT mukey FROM SDA_Get_Mukey_from_intersection_with_WktWgs84('${JSON.stringify(fieldGeometry)}')
    )
    ORDER BY component.comppct_r DESC, chorizon.hzdept_r
  `;
}

function buildSSURGOProductivityQuery(fieldGeometry: any): string {
  return `
    SELECT 
      component.cokey,
      component.compname,
      cointerp.interphr as nccpi_rating,
      cointerp.interphrc as nccpi_class
    FROM component
    INNER JOIN cointerp ON component.cokey = cointerp.cokey
    WHERE component.mukey IN (
      SELECT mukey FROM SDA_Get_Mukey_from_intersection_with_WktWgs84('${JSON.stringify(fieldGeometry)}')
    )
    AND cointerp.mrulename = 'NCCPI - National Commodity Crop Productivity Index'
  `;
}

function buildSSURGOInfiltrationQuery(fieldGeometry: any): string {
  return `
    SELECT 
      component.cokey,
      component.compname,
      component.hydgrp as hydrologic_group,
      chorizon.ksat_r as infiltration_rate
    FROM component
    INNER JOIN chorizon ON component.cokey = chorizon.cokey
    WHERE component.mukey IN (
      SELECT mukey FROM SDA_Get_Mukey_from_intersection_with_WktWgs84('${JSON.stringify(fieldGeometry)}')
    )
    AND chorizon.hzdept_r = 0
  `;
}

// Helper functions for data processing
function filterPractices(practices: any, landTypeId: string, userInputs?: Record<string, any>): any {
  // Filter practices by land type
  let filtered = practices.filter((p: any) => 
    p.applicable_land_types?.includes(landTypeId)
  );

  // Further filter by resource concerns if provided
  if (userInputs?.resourceConcerns) {
    filtered = filtered.filter((p: any) =>
      p.resource_concerns?.some((rc: string) => 
        userInputs.resourceConcerns.includes(rc)
      )
    );
  }

  return filtered;
}

function matchSoilToSiteIndex(soilData: any, siteIndexData: any): any {
  // Match soil properties to FIA site index curves
  // This is simplified - actual implementation would use soil drainage class,
  // texture, depth, etc. to find matching site index curves
  return {
    soilProperties: soilData,
    siteIndexCurves: siteIndexData,
    matchedCurves: [] // Would contain matched curves based on soil props
  };
}

function matchHydricIndicators(soilData: any, hydricList: any): any {
  // Match soil components to hydric soil list
  const components = soilData?.components || [];
  
  return components.map((comp: any) => {
    const hydricMatch = hydricList.find((h: any) => 
      h.map_unit_key === comp.mukey || h.component_name === comp.compname
    );

    return {
      ...comp,
      hydric_rating: hydricMatch?.hydric_rating || 'Unranked',
      hydric_criteria: hydricMatch?.hydric_criteria || [],
      field_indicators: hydricMatch?.field_indicators || []
    };
  });
}

/**
 * Batch fetch multiple tabs at once (for performance)
 */
export async function fetchMultipleTabs(
  requests: TabDataRequest[]
): Promise<TabDataResponse[]> {
  // Fetch all tabs in parallel
  const promises = requests.map(req => fetchTabData(req));
  
  try {
    return await Promise.all(promises);
  } catch (error) {
    console.error('Error fetching multiple tabs:', error);
    // Return partial results with errors
    const results = await Promise.allSettled(promises);
    return results
      .filter((r): r is PromiseFulfilledResult<TabDataResponse> => r.status === 'fulfilled')
      .map(r => r.value);
  }
}

/**
 * Prefetch tab data for better UX (call when workflow starts)
 */
export async function prefetchTabData(
  tabIds: string[],
  landTypeId: string,
  fieldGeometry: any
): Promise<void> {
  const requests = tabIds.map(tabId => ({
    tabId,
    landTypeId,
    fieldGeometry
  }));

  // Fire and forget - errors are logged but not thrown
  fetchMultipleTabs(requests).catch(error => 
    console.warn('Prefetch failed:', error)
  );
}
