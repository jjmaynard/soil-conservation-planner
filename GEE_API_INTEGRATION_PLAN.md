# GEE API Integration Plan
## Soil Conservation Explorer - Google Earth Engine API Integration Strategy

**Date:** January 7, 2026  
**API Version:** v2.1.0  
**API URL:** https://gee-api-production.up.railway.app  
**Target Modules:** soil-map, field-analysis, tools/rusle-eos  
**Status:** ✅ Updated for unified endpoint architecture

---

## Executive Summary

This document outlines a comprehensive integration strategy for connecting the GEE (Google Earth Engine) API v2.1.0 with the Soil Conservation Explorer app. The API provides **unified server-side RUSLE calculations**, CSB field boundaries, terrain analysis, vegetation monitoring (NDVI), drought assessment, resource concerns, and comprehensive climate data.

### Key Architecture Shift (v2.1.0)

**Old Approach:** Multi-endpoint client-side calculations (4+ API calls)  
**New Approach:** Single unified endpoint with complete server-side processing  

**Benefits:**
- ✅ 75% reduction in API calls (4+ → 1)
- ✅ Server-side GEE processing (faster, more accurate)
- ✅ Spatial statistics for every factor (min/max/mean/std/median)
- ✅ SSURGO 30m soil data 
- ✅ Built-in risk assessment and recommendations

### Integration Priorities

1. **tools/rusle-eos** (High Priority) - Complete RUSLE-EOS (RUSLE Earth Observation System) erosion calculator
2. **field-analysis** (High Priority) - Enhanced analysis with erosion, drought assessment, and resource concerns
3. **soil-map** (Medium Priority) - CSB tile layer and terrain visualization

### New Module: RUSLE-EOS

The RUSLE2 module will be renamed and enhanced as **RUSLE-EOS (RUSLE Earth Observation System)** - a comprehensive erosion assessment platform leveraging Google Earth Engine for real-time satellite-based analysis. This next-generation tool combines traditional RUSLE methodology with modern earth observation capabilities.

---

## Current State Analysis

### Existing Infrastructure

✅ **API Client Pattern Established**
- Location: `src/utils/apiClient.ts`
- Uses: Axios with interceptors
- Pattern: Singleton class-based client

✅ **TypeScript Types**
- Location: `src/types/api.ts`
- Current: Basic soil prediction types
- Need: GEE API types (RUSLE, CSB, Terrain, etc.)

✅ **Environment Configuration**
- File: `.env.local`
- Current var: `NEXT_PUBLIC_SOIL_API_URL`
- Need: `NEXT_PUBLIC_GEE_API_URL`

✅ **Component Structure**
- Soil Map: `src/pages/soil-map.tsx` (Leaflet-based, layer control ready)
- Field Analysis: `src/pages/field-analysis/[fieldId].tsx` (Dashboard with sections)
- RUSLE2 Tool: `src/pages/tools/rusle2.tsx` (Placeholder, ready for implementation of RUSLE-EOS: src/pages/tools/rusle-eos.tsx)

### Gaps Identified

✅ **GEE API Client** - Basic client implemented with unified endpoints  
✅ **CSB Integration** - Field boundary visualization with GeoJSON layers (Phase 1 complete)  
❌ **RUSLE-EOS Module** - Comprehensive erosion calculator not yet implemented  
❌ **Terrain Tiles** - No terrain attribute layers on map  
❌ **NDVI Time Series** - No vegetation monitoring component  
❌ **Conservation Practice Modeling** - P-factor scenario comparison not implemented  
❌ **Drought Assessment** - No GRIDMET drought monitoring integration  
❌ **Resource Concerns** - No comprehensive resource concern assessment framework  
❌ **Multi-Factor Analysis** - No integration of erosion, ponding, concentrated flow, and soil quality assessments

### Recently Completed (January 2026)

✅ **CSB Field Selection** - Interactive map-based field selection with click handlers  
✅ **CSB GeoJSON Layers** - Dynamic field boundary loading at zoom 13+  
✅ **Field Metadata Display** - CSBID, acreage, county, state information  
✅ **Selected Field Toggle** - Show/hide selected field boundary in analysis mode  

---

## Integration Architecture

### Layered Approach

```
┌─────────────────────────────────────────────────────────┐
│           React Components (UI Layer)                    │
│  • soil-map.tsx (Map visualization)                     │
│  • field-analysis/[fieldId].tsx (Dashboard)             │
│  • tools/rusle-eos.tsx (RUSLE-EOS Calculator)           │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│         Custom Hooks (State Management)                  │
│  • useRUSLECalculation                                  │
│  • useCSBFields                                         │
│  • useTerrainAnalysis                                   │
│  • useNDVITimeSeries                                    │
│  • useDroughtAssessment (NEW)                          │
│  • useResourceConcerns (NEW)                           │
│  • useFieldAnalysis (Comprehensive)                    │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│          GEE API Client (Data Layer)                     │
│  • lib/geeApiClient.ts                                  │
│  • Centralized GEE endpoint calls                       │
│  • Error handling & tier fallback                       │
│  • Drought assessment integration                       │
│  • Resource concern aggregation                         │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│       GEE API v2.1.0 (External Service)                 │
│  https://gee-api-production.up.railway.app              │
│  • Unified RUSLE endpoint (/api/rusle/calculate)       │
│  • SSURGO 30m soil data (K-factor)                    │
│  • DAYMET V4 + GPM IMERG (R-factor)                    │
│  • NCSS 30m DEM (LS-factor)                            │
│  • Sentinel-2 + CDL (C-factor)                         │
│  • GRIDMET drought indices (SPI, SPEI, EDDI, PDSI)     │
│  • Resource concern assessment (6 concern types)        │
│  • Terrain analysis with tile layers                    │
│  • CSB field boundaries & rotation analysis             │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Foundation (Week 1)

#### 1.1 Environment Configuration

**File:** `.env.local`

```bash
# Add GEE API URL
NEXT_PUBLIC_GEE_API_URL=https://gee-api-production.up.railway.app
```

#### 1.2 TypeScript Type Definitions

**File:** `src/types/geeApi.ts` (NEW)

Complete type definitions for GEE API v2.1.0 endpoints. Key changes from v1:
- **Unified RUSLE types** with complete spatial statistics
- **Updated field names** to snake_case (API standard)
- **Error responses** use `detail` instead of `error`
- **Spatial statistics** included for all factors (min/max/mean/std/median)

```typescript
// ============================================================================
// Core RUSLE Types (v2.1.0 Unified Endpoint)
// ============================================================================

export interface RUSLECalculateRequest {
  geometry: string; // WKT or GeoJSON
  start_date: string; // ISO format YYYY-MM-DD
  end_date: string;
  c_factor_params?: CFactorParams;
  p_factor_params?: PFactorParams;
  include_statistics?: boolean; // Default: true
}

export interface RUSLEResponse {
  // Main erosion results with spatial statistics
  soil_loss_statistics: SpatialStatistics;
  total_soil_loss_tons_year: number;
  area_acres: number;
  
  // Individual factors with statistics
  r_factor_statistics: SpatialStatistics;
  k_factor_statistics: SpatialStatistics;
  ls_factor_statistics: SpatialStatistics;
  c_factor_statistics: SpatialStatistics;
  p_factor_statistics: SpatialStatistics;
  
  // Risk assessment
  erosion_risk: {
    risk_level: 'minimal' | 'moderate' | 'high' | 'severe';
    t_value_tons_ac_yr: number;
    exceeds_t_value: boolean;
    percent_of_t_value: number;
    recommendation: string;
  };
  
  // Metadata
  metadata: {
    api_version: string;
    calculation_date: string;
    data_sources: {
      k_factor: string; // 'SSURGO'
      r_factor: string; // 'DAYMET_V4 + GPM_IMERG'
      ls_factor: string; // 'NCSS_30m_DEM'
      c_factor: string; // 'Sentinel-2 + CDL'
    };
  };
}

export interface SpatialStatistics {
  mean: number;
  min: number;
  max: number;
  std: number;
  median: number;
  total_tons_per_year?: number; // For soil loss only
}

export interface CFactorParams {
  crop_type?: string;
  tillage_practice?: 'conventional' | 'reduced' | 'no_till';
  residue_cover_pct?: number;
}

export interface PFactorParams {
  practice_type?: 'contour' | 'strip_cropping' | 'terracing' | 'none';
  slope_pct?: number;
}
```

*Reference: Complete types in `Property_Panel_Guide/gee-api-docs/nextjs-erosion-module/src/lib/gee-client/types.ts`*

#### 1.3 GEE API Client

**File:** `src/lib/geeApiClient.ts` (NEW)

Centralized client using factory pattern (v2.1.0 standard):

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios'
import type { RUSLECalculateRequest, RUSLEResponse } from '@/types/geeApi'

// ============================================================================
// Configuration
// ============================================================================

export interface GEEClientConfig {
  baseURL?: string;
  timeout?: number;
}

// ============================================================================
// Error Handling
// ============================================================================

export class GEEAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message)
    this.name = 'GEEAPIError'
  }
}

function handleAPIError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const detail = error.response?.data?.detail || error.message // v2.1.0 uses 'detail'
    throw new GEEAPIError(detail, status, error.response?.data)
  }
  throw new GEEAPIError('An unexpected error occurred')
}

// ============================================================================
// Main API Client
// ============================================================================

class GEEAPIClient {
  private client: AxiosInstance

  constructor(config: GEEClientConfig = {}) {
    this.client = axios.create({
      baseURL: config.baseURL || 
               process.env.NEXT_PUBLIC_GEE_API_URL || 
               'https://gee-api-production.up.railway.app',
      timeout: config.timeout || 60000,
      headers: { 'Content-Type': 'application/json' },
    })

    this.client.interceptors.request.use(config => {
      console.log(`[GEE API] ${config.method?.toUpperCase()} ${config.url}`)
      return config
    })

    this.client.interceptors.response.use(
      response => response,
      error => {
        console.error('[GEE API Error]:', error.response?.data || error.message)
        return Promise.reject(error)
      }
    )
  }

  // ==========================================================================
  // RUSLE v2.1.0 - Unified Endpoint (PRIMARY METHOD)
  // ==========================================================================

  /**
   * Calculate complete RUSLE analysis with all factors and statistics
   * This is the RECOMMENDED method - replaces old multi-endpoint approach
   */
  async calculateRUSLE(request: RUSLECalculateRequest): Promise<RUSLEResponse> {
    try {
      const { data } = await this.client.post<RUSLEResponse>(
        '/api/rusle/calculate',
        request
      )
      return data
    } catch (error) {
      return handleAPIError(error)
    }
  }

  // Individual factor endpoints (optional, for specialized use)
  async getRFactor(request: RFactorRequest): Promise<RFactorResponse> {
    try {
      const { data } = await this.client.post('/api/rusle/r-factor', request)
      return data
    } catch (error) {
      return handleAPIError(error)
    }
  }

  async getLSFactor(request: LSFactorRequest): Promise<LSFactorResponse> {
    try {
      const { data } = await this.client.post('/api/rusle/ls-factor', request)
      return data
    } catch (error) {
      return handleAPIError(error)
    }
  }

  // ... other endpoints (CSB, terrain, climate, assessments)
}

// ============================================================================
// Factory Function (v2.1.0 Pattern)
// ============================================================================

export function createGEEClient(config?: GEEClientConfig): GEEAPIClient {
  return new GEEAPIClient(config)
}

// Export singleton for convenience
export const geeApi = createGEEClient()
```

**Key Changes from v1:**
- \u2705 Factory function `createGEEClient()` instead of direct `new GEEClient()`
- \u2705 Error responses use `detail` field (not `error`)
- \u2705 Primary method is `calculateRUSLE()` for complete analysis
- \u2705 Individual factor methods available but optional
- \u2705 60-second timeout (GEE processing can be slow)
    try {
      const { data } = await this.client.post<RFactorResponse>(
        '/api/rusle/r-factor',
        request
      )
      return data
    } catch (error) {
      return handleAPIError(error)
    }
  }

  async calculateLSFactor(request: LSFactorRequest): Promise<LSFactorResponse> {
    try {
      const { data } = await this.client.post<LSFactorResponse>(
        '/api/rusle/ls-factor',
        request
      )
      return data
    } catch (error) {
      return handleAPIError(error)
    }
  }

  // ==========================================================================
  // Drought Assessment (GRIDMET)
  // ==========================================================================

  async getDroughtAssessment(request: DroughtAssessmentRequest): Promise<DroughtAssessment> {
    try {
      const params = new URLSearchParams()
      params.append('wkt', request.wkt)
      if (request.date) params.append('date', request.date)
      if (request.soil_awc) params.append('soil_awc', request.soil_awc.toString())
      if (request.soil_texture) params.append('soil_texture', request.soil_texture)
      params.append('include_technical', request.include_technical?.toString() || 'false')
      params.append('auto_adjust_date', request.auto_adjust_date?.toString() || 'true')

      const { data } = await this.client.post<DroughtAssessment>(
        `/api/climate/drought-assessment?${params}`
      )
      return data
    } catch (error) {
      return handleAPIError(error)
    }
  }

  // ==========================================================================
  // Resource Concerns
  // ==========================================================================

  async getResourceConcernAssessment(
    request: ResourceConcernRequest
  ): Promise<ComprehensiveAssessment> {
    try {
      const params = new URLSearchParams()
      if (request.year) params.append('year', request.year.toString())
      if (request.include_geojson !== undefined) {
        params.append('include_geojson', request.include_geojson.toString())
      }

      const { data } = await this.client.post<ComprehensiveAssessment>(
        `/api/resource-concerns/comprehensive?${params}`,
        { wkt: request.wkt }
      )
      return data
    } catch (error) {
      return handleAPIError(error)
    }
  }

  async getErosionConcern(wkt: string, year?: number): Promise<ErosionAssessment> {
    try {
      const params = year ? `?year=${year}` : ''
      const { data } = await this.client.post<ErosionAssessment>(
        `/api/resource-concerns/erosion${params}`,
        { wkt }
      )
      return data
    } catch (error) {
      return handleAPIError(error)
    }
  }

  async getPondingConcern(wkt: string): Promise<PondingAssessment> {
    try {
      const { data } = await this.client.post<PondingAssessment>(
        '/api/resource-concerns/ponding',
        { wkt }
      )
      return data
    } catch (error) {
      return handleAPIError(error)
    }
  }

  async getProductivityConcern(wkt: string, year?: number): Promise<ProductivityAssessment> {
    try {
      const params = year ? `?year=${year}` : ''
      const { data } = await this.client.post<ProductivityAssessment>(
        `/api/resource-concerns/productivity${params}`,
        { wkt }
      )
      return data
    } catch (error) {
      return handleAPIError(error)
    }
  }

  // ==========================================================================
  // CSB (Common Land Unit) Endpoints
  // ==========================================================================

  async getCSBTileUrl(options: CSBTileUrlRequest = {}): Promise<CSBTileUrlResponse> {
    try {
      const { data } = await this.client.get<CSBTileUrlResponse>(
        '/api/csb/tiles',
        {
          params: {
            opacity: options.opacity || 0.7,
            min_complexity: options.min_complexity || 1,
            max_complexity: options.max_complexity || 4,
          }
        }
      )
      return data
    } catch (error) {
      return handleAPIError(error)
    }
  }

  async getCSBFields(request: CSBBoundsRequest): Promise<CSBFeatureCollection> {
    try {
      const { data } = await this.client.get<CSBFeatureCollection>(
        '/api/csb/bounds',
        { params: request }
      )
      return data
    } catch (error) {
      return handleAPIError(error)
    }
  }

  async getCSBFieldDetails(fieldId: string): Promise<CSBFieldDetails> {
    try {
      const { data } = await this.client.get<CSBFieldDetails>(
        `/api/csb/field/${fieldId}`
      )
      return data
    } catch (error) {
      return handleAPIError(error)
    }
  }

  // ==========================================================================
  // Terrain Analysis
  // ==========================================================================

  async getTerrainAnalysis(request: TerrainRequest): Promise<TerrainResponse> {
    try {
      const { data } = await this.client.post<TerrainResponse>(
        '/api/terrain/polygon',
        request
      )
      return data
    } catch (error) {
      return handleAPIError(error)
    }
  }

  // ==========================================================================
  // Vegetation / Sentinel
  // ==========================================================================

  async getSentinelNDVI(request: SentinelRequest): Promise<SentinelResponse> {
    try {
      const { data } = await this.client.post<SentinelResponse>(
        '/api/sentinel/polygon',
        request
      )
      return data
    } catch (error) {
      return handleAPIError(error)
    }
  }

  async getSentinelPointNDVI(
    lat: number,
    lon: number,
    start_date: string,
    end_date: string
  ): Promise<SentinelResponse> {
    try {
      const { data } = await this.client.get<SentinelResponse>(
        '/api/sentinel/point',
        {
          params: { lat, lon, start_date, end_date }
        }
      )
      return data
    } catch (error) {
      return handleAPIError(error)
    }
  }

  // ==========================================================================
  // Climate Data
  // ==========================================================================

  async getClimateAnalysis(request: ClimateRequest): Promise<ClimateResponse> {
    try {
      const { data } = await this.client.post<ClimateResponse>(
        '/api/climate/polygon',
        request
      )
      return data
    } catch (error) {
      return handleAPIError(error)
    }
  }

  async getClimatePoint(
    lat: number,
    lon: number,
    start_year: number,
    end_year: number
  ): Promise<ClimateResponse> {
    try {
      const { data } = await this.client.get<ClimateResponse>(
        '/api/climate/point',
        {
          params: { lat, lon, start_year, end_year }
        }
      )
      return data
    } catch (error) {
      return handleAPIError(error)
    }
  }

  // ==========================================================================
  // Health Check
  // ==========================================================================

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const { data } = await this.client.get('/health')
      return data
    } catch (error) {
      return handleAPIError(error)
    }
  }
}

// Export singleton instance
export const GEEAPI = new GEEAPIClient()
```

#### 1.4 Error Handling Utilities

**File:** `src/lib/geeApiClient.ts` (within)

```typescript
export class GEEAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message)
    this.name = 'GEEAPIError'
  }
}

// Automatic tier fallback for RUSLE calculations
async function calculateWithFallback(wkt: string, year: number) {
  try {
    return await calculateRUSLE({ wkt, year, tier: 'tier_3' })
  } catch (error) {
    console.warn('Tier 3 failed, falling back to Tier 2')
    try {
      return await calculateRUSLE({ wkt, year, tier: 'tier_2' })
    } catch (error) {
      console.warn('Tier 2 failed, falling back to Tier 1')
      return await calculateRUSLE({ wkt, year, tier: 'tier_1' })
    }
  }
}
```

---

### Phase 2: RUSLE-EOS Module (Week 2-3)

**Target:** Complete implementation of `src/pages/tools/rusle-eos.tsx`

**RUSLE-EOS (RUSLE Earth Observation System)** is a next-generation erosion assessment platform that combines traditional RUSLE methodology with real-time satellite imagery and GEE processing power.

#### Key Features of RUSLE-EOS

1. **Real-Time Satellite Integration**
   - Sentinel-2 NDVI for dynamic C-factor calculation
   - NCSS 30m terrain for LS-factor
   - DAYMET/GPM hybrid R-factor
   - CDL crop type detection

2. **Multi-Tier Calculation**
   - **Tier 3**: Full subfactor C-factor (PLU × CC × SC × SR × SM) - 80-90% accuracy
   - **Tier 2**: NDVI-based C-factor - 70-80% accuracy
   - **Tier 1**: Lookup table C-factor - 60-70% accuracy
   - Automatic fallback between tiers

3. **Conservation Practice Modeling**
   - 6 primary practices with P-factor calculations
   - Before/after scenario comparison
   - Cost-benefit analysis
   - Practice effectiveness visualization

4. **Interactive Mapping**
   - Erosion risk heatmaps
   - Hotspot identification
   - Management zone delineation
   - Export capabilities

#### 2.1 RUSLE-EOS Type Definitions

**File:** `src/types/rusleEOS.ts` (NEW)

```typescript
/**
 * RUSLE-EOS (RUSLE Earth Observation System) Types
 * Enhanced RUSLE with satellite integration
 */

// ============================================================================
// Core RUSLE Types
// ============================================================================

export interface RUSLECalculateRequest {
  wkt: string;
  year: number;
  k_factor_ssurgo?: number;
  practice_factor?: number;
  tier?: 'tier_1' | 'tier_2' | 'tier_3';
}

export interface RUSLEResponse {
  // Main erosion estimate
  erosion_tons_acre_year: number;
  erosion_kg_ha_year: number;
  
  // Statistics
  statistics: {
    mean: number;
    median: number;
    min: number;
    max: number;
    std_dev: number;
    percentile_25: number;
    percentile_75: number;
  };
  
  // RUSLE Factors
  r_factor: number;
  k_factor: number;
  ls_factor: number;
  c_factor: number;
  p_factor: number;
  
  // Classification
  erosion_risk_category: 'Minimal' | 'Moderate' | 'High' | 'Severe';
  
  // Geospatial
  map_url: string;  // GEE tile URL for erosion visualization
  wkt: string;
  area_acres: number;
  area_hectares: number;
  pixel_count: number;
  
  // Temporal
  year: number;
  
  // Tier information
  tier_used?: 'tier_1' | 'tier_2' | 'tier_3';
  calculation_method?: string;
}

export interface CFactorResponse {
  factor_name: string;
  factor_value: number;
  tier: string;
  accuracy: string;
  
  // Tier 3 subfactors
  subfactors?: {
    PLU: number;  // Prior Land Use
    CC: number;   // Crop Canopy
    SC: number;   // Surface Cover
    SR: number;   // Surface Roughness
    SM: number;   // Soil Moisture
  };
  
  // Source data
  crop_type?: string;
  tillage_type?: string;
  mean_ndvi?: number;
  fractional_vegetation_cover?: number;
  
  // Validation
  method: string;
  year: number;
}

export interface ConservationPractice {
  code: string;
  name: string;
  description: string;
  p_factor: number;
  effectiveness_percent: number;
  cost_per_acre: {
    low: number;
    typical: number;
    high: number;
  };
  suitability_requirements: string[];
}

export interface ScenarioComparison {
  baseline: {
    practices: string[];
    p_factor: number;
    erosion_tons_acre_year: number;
    annual_soil_loss_tons: number;
  };
  proposed: {
    practices: string[];
    p_factor: number;
    erosion_tons_acre_year: number;
    annual_soil_loss_tons: number;
  };
  reduction: {
    tons_acre_year: number;
    percent: number;
    meets_tolerance: boolean;
  };
  cost_estimate: {
    total_cost: number;
    cost_per_ton_saved: number;
    roi_years: number;
  };
}

// ============================================================================
// Erosion Assessment Types
// ============================================================================

export interface ErosionAssessment {
  field_id: string;
  assessment_date: string;
  
  rusle_result: RUSLEResponse;
  
  // Field characteristics
  field_area_acres: number;
  total_annual_soil_loss_tons: number;
  
  // Risk classification
  priority: 'low' | 'medium' | 'high' | 'critical';
  conservation_needed: boolean;
  exceeds_tolerance: boolean;
  
  // T-value comparison
  t_value: number;
  soil_loss_ratio: number;
  
  // Recommendations
  recommended_practices: ConservationPractice[];
  priority_treatment_areas?: GeoJSON.Geometry;
  
  // Temporal trends (if multi-year)
  annual_erosion?: Array<{
    year: number;
    erosion_tons_acre_year: number;
    r_factor: number;
  }>;
}
```

#### 2.2 Custom Hook: useRUSLEEOS

#### 2.2 Custom Hook: useRUSLECalculation (v2.1.0 Simplified)

**File:** `src/hooks/useRUSLECalculation.ts` (NEW)

Simplified hook leveraging unified endpoint:

```typescript
import { useState, useCallback } from 'react'
import { geeApi } from '@/lib/geeApiClient'
import type { RUSLECalculateRequest, RUSLEResponse } from '@/types/geeApi'

export function useRUSLECalculation() {
  const [result, setResult] = useState<RUSLEResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculate = useCallback(async (request: RUSLECalculateRequest) => {
    setLoading(true)
    setError(null)
    
    try {
      // Single API call - server does all processing
      const response = await geeApi.calculateRUSLE(request)
      setResult(response)
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Calculation failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const compareScenarios = useCallback(async (
    geometry: string,
    startDate: string,
    endDate: string,
    baselinePractice: string,
    proposedPractice: string
  ) => {
    // Calculate baseline scenario
    const baselineResult = await calculate({
      geometry,
      start_date: startDate,
      end_date: endDate,
      p_factor_params: { practice_type: baselinePractice }
    })
    
    // Calculate proposed scenario
    const proposedResult = await calculate({
      geometry,
      start_date: startDate,
      end_date: endDate,
      p_factor_params: { practice_type: proposedPractice }
    })
    
    // Compare results
    const baselineErosion = baselineResult.soil_loss_statistics.mean
    const proposedErosion = proposedResult.soil_loss_statistics.mean
    const reduction = baselineErosion - proposedErosion
    const reductionPercent = (reduction / baselineErosion) * 100
    
    return {
      baseline: baselineResult,
      proposed: proposedResult,
      reduction_tons_ac_yr: reduction,
      reduction_percent: reductionPercent,
      meets_t_value: !proposedResult.erosion_risk.exceeds_t_value
    }
  }, [calculate])

  return { 
    result, 
    loading, 
    error,
    calculate,
    compareScenarios,
    reset: () => {
      setResult(null)
      setError(null)
    }
  }
}
```

**Key Simplifications from v1:**
- \u2705 No tier fallback logic needed (server handles this)
- \u2705 No SSURGO client dependency
- \u2705 No local C-factor calculation
- \u2705 No multi-step data fetching
- \u2705 80% less code (~40 lines vs ~200 lines)
  }
}

// Helper functions
function calculatePFactorForPractices(practices: string[]): number {
  // Simplified P-factor calculation
  // In production, use actual P-factor lookup tables
  if (practices.includes('terracing')) return 0.10
  if (practices.includes('contour_farming') && practices.includes('strip_cropping')) return 0.25
  if (practices.includes('contour_farming')) return 0.50
  return 1.0
}

function estimateCost(practices: string[], acres: number, reduction: number) {
  // Simplified cost estimation
  const costPerAcre = practices.reduce((sum, practice) => {
    const costs = {
      'terracing': 500,
      'contour_farming': 50,
      'strip_cropping': 30,
      'cover_crops': 60,
      'no_till': 20,
      'grassed_waterways': 200
    }
    return sum + (costs[practice as keyof typeof costs] || 0)
  }, 0)
  
  const totalCost = costPerAcre * acres
  const costPerTonSaved = reduction > 0 ? totalCost / (reduction * acres) : 0
  const roi_years = 10 // Estimate based on practice lifespan
  
  return { total_cost: totalCost, cost_per_ton_saved: costPerTonSaved, roi_years }
}

```typescript
export function useRUSLECalculation() {
  const [result, setResult] = useState<RUSLEResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculate = async (
    wkt: string,
    year: number,
    options?: {
      kFactorSSURGO?: number
      practiceFactor?: number
      tier?: 'tier_1' | 'tier_2' | 'tier_3'
    }
  ) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await GEEAPI.calculateRUSLE({
        wkt,
        year,
        k_factor_ssurgo: options?.kFactorSSURGO,
        practice_factor: options?.practiceFactor,
      })
      setResult(response)
      return response
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { result, loading, error, calculate }
}
```

#### 2.3 RUSLE-EOS Calculator Component Structure

**File:** `src/pages/tools/rusle-eos.tsx` (REPLACE rusle2.tsx)

**Core Components:**

1. **FieldSelectorMap** - Interactive map for field selection
   - Draw polygon tool (Leaflet Draw)
   - Click to select existing CSB field
   - Upload shapefile/GeoJSON/KML
   - WKT text input option

2. **RUSLEInputPanel** - Configuration inputs
   - Year selector (2008-2024)
   - K-factor override (auto-fetch from SSURGO)
   - Tier selection (manual or auto-fallback)
   - Tillage type selector (for Tier 3)

3. **ConservationPracticeSelector** - Practice selection UI
   - 6 primary practices with checkboxes
   - P-factor calculation display
   - Practice descriptions & requirements
   - Cost estimates per practice

4. **RUSLEFactorDisplay** - Factor breakdown visualization
   - R-factor (rainfall erosivity)
   - K-factor (soil erodibility)
   - LS-factor (slope length-steepness)
   - C-factor (cover management) with subfactors
   - P-factor (support practices)
   - Calculated A (soil loss)

5. **ErosionRiskMap** - GEE tile overlay visualization
   - Interactive Leaflet map
   - Erosion risk heatmap from GEE
   - Field boundary overlay
   - Hotspot identification
   - Export to PNG/PDF

6. **ScenarioComparison** - Before/After analysis
   - Side-by-side comparison
   - Erosion reduction metrics
   - Cost-benefit analysis
   - ROI calculator

7. **ConservationRecommendations** - Intelligent suggestions
   - Auto-recommendations when erosion > T-value
   - Practice suitability scoring
   - Priority ranking
   - Implementation timeline

**RUSLE-EOS Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  RUSLE-EOS: Earth Observation System for Erosion Analysis   │
│  🛰️ Real-time satellite integration • 🌍 Google Earth Engine │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐  ┌────────────────────────────┐  │
│  │  1️⃣  Field Selection  │  │  2️⃣  Input Configuration    │  │
│  │                       │  │                             │  │
│  │  [Interactive Map]    │  │  Year: [2024 ▼]            │  │
│  │   • Draw polygon      │  │  K-factor: [Auto-SSURGO ▼] │  │
│  │   • Select CSB field  │  │  Tier: [Auto-Fallback ▼]   │  │
│  │   • Upload boundary   │  │  Tillage: [No-Till ▼]      │  │
│  │                       │  │                             │  │
│  │  Selected Field:      │  │  [Advanced Options ▼]       │  │
│  │  • 45.3 acres         │  │                             │  │
│  │  • Center: 41.2°N     │  │  ┌─────────────────────┐  │  │
│  │           -96.0°W     │  │  │ [Calculate Erosion] │  │  │
│  └──────────────────────┘  │  └─────────────────────┘  │  │
│                             └────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  3️⃣  RUSLE Factors & Results                          │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Soil Loss: 6.2 tons/acre/year                       │  │
│  │  T-value: 5.0 ⚠️ EXCEEDS TOLERANCE (124% of T)       │  │
│  │                                                        │  │
│  │  ┌───────────────────────────────────────────────┐   │  │
│  │  │ R: 120.5  K: 0.32  LS: 2.15  C: 0.08  P: 1.00 │   │  │
│  │  └───────────────────────────────────────────────┘   │  │
│  │                                                        │  │
│  │  [Tier 3 Used] ✓ High Accuracy (80-90%)              │  │
│  │  C-factor subfactors: PLU×CC×SC×SR×SM                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  4️⃣  Conservation Practices                           │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  ☑ Contour Farming (P: 0.50) - $50/acre              │  │
│  │  ☐ Strip Cropping  (P: 0.30) - $30/acre              │  │
│  │  ☑ Terracing       (P: 0.10) - $500/acre             │  │
│  │  ☐ Cover Crops     (P: 0.90) - $60/acre              │  │
│  │  ☑ No-Till         (P: 0.95) - $20/acre              │  │
│  │  ☐ Grassed Waterways (P: 0.80) - $200/acre           │  │
│  │                                                        │  │
│  │  Combined P-factor: 0.05 (95% reduction potential)    │  │
│  │  [Update Calculation] [Compare Scenarios]            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  5️⃣  Scenario Comparison                              │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Current:   6.2 T/A/Y  (280 tons/year)               │  │
│  │  Proposed:  0.3 T/A/Y  (14 tons/year)                │  │
│  │  Reduction: 5.9 T/A/Y  (266 tons/year) [95%]         │  │
│  │                                                        │  │
│  │  ✅ Meets T-value  💰 Cost: $25,720                   │  │
│  │  📊 Cost per ton saved: $97                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  6️⃣  Erosion Risk Map (from Google Earth Engine)      │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ [Interactive Map with Erosion Heatmap]         │  │  │
│  │  │                                                  │  │  │
│  │  │ Legend:                                          │  │  │
│  │  │ 🟢 0-2 T/A/Y   (Minimal)                        │  │  │
│  │  │ 🟡 2-5 T/A/Y   (Moderate)                       │  │  │
│  │  │ 🟠 5-10 T/A/Y  (High)                           │  │  │
│  │  │ 🔴 >10 T/A/Y   (Severe)                         │  │  │
│  │  │                                                  │  │  │
│  │  │ [Export PNG] [Export PDF] [Download Data]      │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  7️⃣  Recommendations & Next Steps                     │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Priority: HIGH - Immediate action recommended       │  │
│  │                                                        │  │
│  │  Top Recommendations:                                 │  │
│  │  1. Terracing (High effectiveness, high cost)        │  │
│  │  2. Contour farming (Moderate effectiveness, low $)  │  │
│  │  3. No-till farming (Moderate effectiveness, low $)  │  │
│  │                                                        │  │
│  │  Next Steps:                                          │  │
│  │  • Contact NRCS for cost-share programs (EQIP)       │  │
│  │  • Schedule field assessment with conservationist    │  │
│  │  • Develop conservation plan with timeline           │  │
│  │                                                        │  │
│  │  [Generate PDF Report] [Schedule Consultation]       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

```typescript
export default function RUSLE2Calculator() {
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [year, setYear] = useState(2024)
  const [practices, setPractices] = useState<string[]>([])
  const { result, loading, calculate } = useRUSLECalculation()

  const handleCalculate = async () => {
    if (!selectedField) return
    
    await calculate(selectedField, year, {
      practiceFactor: calculatePFactor(practices)
    })
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left: Map + Inputs */}
      <div>
        <FieldSelectorMap 
          onFieldSelect={setSelectedField}
        />
        <RUSLEInputPanel
          year={year}
          onYearChange={setYear}
          practices={practices}
          onPracticesChange={setPractices}
        />
        <button onClick={handleCalculate} disabled={loading}>
          {loading ? 'Calculating...' : 'Calculate Erosion'}
        </button>
      </div>

      {/* Right: Results */}
      <div>
        {result && (
          <>
            <RUSLEFactorDisplay factors={result} />
            <ErosionRiskMap mapUrl={result.map_url} />
            {result.erosion_tons_acre_year > result.statistics.mean && (
              <ConservationRecommendations 
                erosion={result.erosion_tons_acre_year}
                tolerance={5.0}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
```

---

### Phase 3: Field Analysis Enhancement (Week 4)

**Target:** Enhance `src/pages/field-analysis/[fieldId].tsx` with comprehensive GEE data

Field Analysis will be transformed into a comprehensive assessment dashboard integrating:
- **Erosion Analysis** (RUSLE-EOS)
- **Drought Assessment** (GRIDMET indices)
- **Resource Concerns** (6 assessment types)
- **Vegetation Monitoring** (NDVI time series)
- **Terrain Attributes** (Slope, wetness, etc.)

#### 3.1 Drought Assessment Integration

**GRIDMET Drought Monitoring** provides farmer-focused drought information using standardized precipitation indices.

##### Drought Types & API Endpoint

**File:** `src/types/drought.ts` (NEW)

```typescript
/**
 * GRIDMET Drought Assessment Types
 * Based on SPI, SPEI, EDDI, and PDSI indices
 */

export interface DroughtAssessment {
  location: LocationInfo;
  assessment_date: string;
  current_status: CurrentStatus;
  conditions_by_timeframe: ConditionsByTimeframe;
  conservation_impacts: ConservationImpacts;
  technical_indices?: TechnicalIndices;
  metadata: Metadata;
  date_info?: DateInfo;
}

export interface CurrentStatus {
  severity: 'Normal' | 'Abnormally Dry' | 'Moderate Drought' | 'Severe Drought' | 'Extreme Drought';
  confidence: 'High' | 'Medium' | 'Low';
  trend: 'Improving' | 'Stable' | 'Worsening';
  summary: string;
  index_agreement?: {
    SPI_30d: string;
    SPEI_30d: string;
    PDSI: string;
  };
}

export interface ConditionsByTimeframe {
  immediate: TimeframeCondition;   // 30-day
  seasonal: TimeframeCondition;     // 90-day
  annual: TimeframeCondition;       // 365-day
  long_term: TimeframeCondition;    // 730-day
}

export interface TimeframeCondition {
  period: string;
  status: string;
  description: string;
  relevant_for: string[];  // ['planting', 'tillage', 'irrigation', etc.]
  key_indices: Record<string, number>;
}

export interface ConservationImpacts {
  primary_concerns: string[];
  affected_practices: Practice[];
  timing_considerations: TimingConsiderations;
  soil_interaction_note: string;
}

export interface Practice {
  practice_code: string;
  practice_name: string;
  impact: 'High' | 'Moderate' | 'Low';
  recommendation: string;
}

export interface TimingConsiderations {
  urgent: string[];        // Next 2 weeks
  near_term: string[];     // 1-2 months
  planning: string[];      // Long-term
}

export interface TechnicalIndices {
  SPI: IndexData;   // Standardized Precipitation Index
  SPEI: IndexData;  // Standardized Precipitation Evapotranspiration Index
  EDDI: IndexData;  // Evaporative Demand Drought Index
  PDSI: IndexData;  // Palmer Drought Severity Index
}

export interface IndexData {
  name: string;
  description: string;
  current_condition: string;
  values: Array<{
    time_scale: string;
    value: number;
    category: string;
    interpretation: string;
  }>;
}
```

##### Drought Assessment Hook

**File:** `src/hooks/useDroughtAssessment.ts` (NEW)

```typescript
import { useState, useEffect, useCallback } from 'react'
import { GEEAPI } from '@/lib/geeApiClient'
import type { DroughtAssessment } from '@/types/drought'

interface UseDroughtAssessmentOptions {
  wkt: string;
  date?: string;
  soilAWC?: number;
  soilTexture?: string;
  includeTechnical?: boolean;
  autoFetch?: boolean;
}

export function useDroughtAssessment(options: UseDroughtAssessmentOptions) {
  const {
    wkt,
    date,
    soilAWC,
    soilTexture,
    includeTechnical = false,
    autoFetch = true
  } = options;

  const [data, setData] = useState<DroughtAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDrought = useCallback(async () => {
    if (!wkt) {
      setError('Location (WKT) is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await GEEAPI.getDroughtAssessment({
        wkt,
        date,
        soil_awc: soilAWC,
        soil_texture: soilTexture,
        include_technical: includeTechnical,
        auto_adjust_date: true,
      });

      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch drought data';
      setError(message);
      console.error('Error fetching drought data:', err);
    } finally {
      setLoading(false);
    }
  }, [wkt, date, soilAWC, soilTexture, includeTechnical]);

  useEffect(() => {
    if (autoFetch && wkt) {
      fetchDrought();
    }
  }, [autoFetch, wkt, fetchDrought]);

  return {
    data,
    loading,
    error,
    refetch: fetchDrought,
  };
}
```

#### 3.2 Resource Concerns Integration

**Comprehensive Resource Concern Assessment** evaluates 6 major concern types:
1. **Soil Erosion** (Sheet & Rill)
2. **Concentrated Flow Erosion** (Ephemeral Gully)
3. **Ponding** (Excess Water)
4. **Drought** (Insufficient Water)
5. **Soil Quality Degradation**
6. **Plant Productivity**

##### Resource Concern Types

**File:** `src/types/resourceConcerns.ts` (NEW)

```typescript
/**
 * Resource Concern Assessment Types
 * Comprehensive field-level assessment framework
 */

export type SeverityLevel = 'none' | 'slight' | 'moderate' | 'severe' | 'very_severe';
export type TrendDirection = 'improving' | 'stable' | 'declining' | 'rapidly_declining';
export type ConfidenceLevel = 'high' | 'moderate' | 'low' | 'very_low';

export type ResourceConcernCategory =
  | 'soil_erosion'
  | 'soil_quality'
  | 'excess_water'
  | 'insufficient_water'
  | 'water_quality'
  | 'air_quality'
  | 'plant_productivity'
  | 'animal_habitat';

export interface BaseAssessment {
  concern_id: string;
  concern_name: string;
  category: ResourceConcernCategory;
  
  severity: SeverityLevel;
  confidence: ConfidenceLevel;
  trend: TrendDirection;
  
  contributing_factors: string[];
  
  assessment_date: string;
  data_sources: string[];
}

export interface ErosionAssessment extends BaseAssessment {
  estimated_soil_loss_tons_ac_yr: number;
  t_factor_tons_ac_yr: number;
  soil_loss_ratio: number;
  area_exceeding_t_pct: number;
  
  rusle_factors: {
    R: number;
    K: number;
    LS: number;
    C: number;
    P: number;
  };
  
  hotspot_zones: GeoJSON.Geometry | null;
  erosion_distribution: Record<string, number>;
}

export interface ConcentratedFlowAssessment extends BaseAssessment {
  channel_density_m_per_ha: number;
  convergent_area_pct: number;
  max_contributing_area_ha: number;
  
  twi_stats: { mean: number; p90: number };
  spi_stats: { mean: number; max: number; p90: number };
  
  gully_risk_zones: GeoJSON.Geometry | null;
  concentration_points: GeoJSON.Geometry | null;
  
  soil_erodibility: number;
  drainage_class: string;
}

export interface PondingAssessment extends BaseAssessment {
  depression_area_pct: number;
  twi_wet_area_pct: number;
  sar_wet_frequency: number | null;
  
  twi_stats: { mean: number; p75: number; p90: number };
  wet_areas: GeoJSON.Geometry | null;
  
  drainage_class: string;
  hydrologic_group: string;
  hydric_soil_pct: number;
  
  drainage_improvement_needed: boolean;
}

export interface ProductivityAssessment extends BaseAssessment {
  ndvi_peak_mean: number;
  ndvi_potential: number;
  
  yield_gap_pct: number;
  yield_gap_p90_pct: number;
  
  low_productivity_area_pct: number;
  declining_trend_area_pct: number;
  spatial_cv: number;
  
  ndvi_trend_per_year: number;
  years_analyzed: number;
  
  low_productivity_zones: GeoJSON.Geometry | null;
  management_zones: GeoJSON.FeatureCollection | null;
  
  land_capability_class: string;
  lcc_subclass: string;
  primary_limitation: string;
}

export interface RankedConcern {
  concern_id: string;
  concern_name: string;
  category: ResourceConcernCategory;
  
  severity: SeverityLevel;
  confidence: ConfidenceLevel;
  trend: TrendDirection;
  
  base_score: number;
  trend_adjustment: number;
  category_multiplier: number;
  confidence_multiplier: number;
  composite_score: number;
  
  rank: number;
  
  contributing_factors: string[];
  assessment_key: string;
}

export interface PracticeRecommendation {
  practice_code: string;
  practice_name: string;
  
  primary_concern_addressed: string;
  additional_concerns_addressed: string[];
  effectiveness_score: number;
  
  priority: 'high' | 'medium' | 'low';
  
  site_suitability: 'excellent' | 'good' | 'marginal' | 'unsuitable';
  suitability_notes: string[];
  
  estimated_cost: {
    low: number;
    typical: number;
    high: number;
    unit: string;
  };
  
  timeline: {
    planning_months: number;
    implementation_months: number;
    effectiveness_years: number;
  };
}

export interface ComprehensiveAssessment {
  field_id: string;
  field_name: string;
  assessment_date: string;
  
  // Individual assessments
  assessments: {
    erosion?: ErosionAssessment;
    concentrated_flow?: ConcentratedFlowAssessment;
    ponding?: PondingAssessment;
    drought?: DroughtAssessment;
    soil_quality?: SoilQualityAssessment;
    productivity?: ProductivityAssessment;
  };
  
  // Ranked priorities
  ranked_concerns: RankedConcern[];
  overall_severity: SeverityLevel;
  priority_score: number;
  
  // Recommendations
  recommended_practices: PracticeRecommendation[];
  priority_treatment_areas: GeoJSON.FeatureCollection | null;
  
  // Executive summary
  executive_summary: {
    top_3_concerns: string[];
    immediate_actions: string[];
    planning_actions: string[];
    conservation_priority: 'low' | 'medium' | 'high' | 'critical';
  };
  
  metadata: {
    data_sources: string[];
    gee_processing_time_ms: number;
    assessment_confidence: ConfidenceLevel;
  };
}
```

##### Resource Concerns Hook

**File:** `src/hooks/useResourceConcerns.ts` (NEW)

```typescript
import { useState, useEffect, useCallback } from 'react'
import { GEEAPI } from '@/lib/geeApiClient'
import type { ComprehensiveAssessment } from '@/types/resourceConcerns'

interface UseResourceConcernsOptions {
  fieldWkt: string;
  year?: number;
  includeGeoJSON?: boolean;
  autoFetch?: boolean;
}

export function useResourceConcerns(options: UseResourceConcernsOptions) {
  const {
    fieldWkt,
    year = new Date().getFullYear(),
    includeGeoJSON = true,
    autoFetch = true
  } = options;

  const [assessment, setAssessment] = useState<ComprehensiveAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssessment = useCallback(async () => {
    if (!fieldWkt) {
      setError('Field geometry (WKT) is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await GEEAPI.getResourceConcernAssessment({
        wkt: fieldWkt,
        year,
        include_geojson: includeGeoJSON,
      });

      setAssessment(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch resource concerns';
      setError(message);
      console.error('Error fetching resource concerns:', err);
    } finally {
      setLoading(false);
    }
  }, [fieldWkt, year, includeGeoJSON]);

  useEffect(() => {
    if (autoFetch && fieldWkt) {
      fetchAssessment();
    }
  }, [autoFetch, fieldWkt, fetchAssessment]);

  return {
    assessment,
    loading,
    error,
    refetch: fetchAssessment,
  };
}
```

#### 3.3 Update ErosionAnalysis Component

**File:** `src/components/FieldAnalysis/ErosionAnalysis.tsx` (REPLACE mock data)

```typescript
export default function ErosionAnalysis({ fieldId }: ErosionAnalysisProps) {
  const [erosionData, setErosionData] = useState<RUSLEResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRealErosionData()
  }, [fieldId])

  const loadRealErosionData = async () => {
    setLoading(true)
    try {
      // Get field geometry from session or API
      const fieldData = JSON.parse(sessionStorage.getItem('selectedField') || '{}')
      const wkt = fieldData.geometry // Convert to WKT
      
      // Calculate real erosion using GEE API
      const result = await GEEAPI.calculateRUSLE({
        wkt,
        year: 2024,
      })
      
      setErosionData(result)
    } catch (error) {
      console.error('Error calculating erosion:', error)
    } finally {
      setLoading(false)
    }
  }

  // Render real data instead of mock
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs">Average Erosion</div>
          <div className="text-2xl font-bold">
            {erosionData?.erosion_tons_acre_year.toFixed(1)} T/A/Y
          </div>
        </div>
        {/* More UI based on real data */}
      </div>
      
      {/* Add erosion map visualization */}
      {erosionData?.map_url && (
        <ErosionMapLayer tileUrl={erosionData.map_url} />
      )}
    </div>
  )
}
```

#### 3.2 Add New Components

**Files to create:**

1. `src/components/FieldAnalysis/VegetationMonitoring.tsx` - NDVI time series
2. `src/components/FieldAnalysis/TerrainAttributes.tsx` - Slope, elevation, TWI
3. `src/components/FieldAnalysis/ClimateHistory.tsx` - Precipitation, temperature

#### 3.3 Custom Hooks for Field Analysis

**File:** `src/hooks/useFieldAnalysis.ts` (NEW)

```typescript
export function useFieldAnalysis(fieldWkt: string, year: number) {
  const [data, setData] = useState({
    erosion: null,
    terrain: null,
    vegetation: null,
    climate: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAllData() {
      setLoading(true)
      
      // Load data in parallel
      const [erosion, terrain, vegetation, climate] = await Promise.all([
        GEEAPI.calculateRUSLE({ wkt: fieldWkt, year }),
        GEEAPI.getTerrainAnalysis({ wkt: fieldWkt }),
        GEEAPI.getSentinelNDVI({ 
          wkt: fieldWkt, 
          start_date: `${year}-01-01`, 
          end_date: `${year}-12-31` 
        }),
        GEEAPI.getClimateAnalysis({ 
          wkt: fieldWkt, 
          start_year: year - 5, 
          end_year: year 
        }),
      ])
      
      setData({ erosion, terrain, vegetation, climate })
      setLoading(false)
    }
    
    loadAllData()
  }, [fieldWkt, year])

  return { data, loading }
}
```

---

### Phase 4: Soil Map CSB Integration (Week 5)

**Target:** Add CSB field boundaries to `src/pages/soil-map.tsx`

#### 4.1 Add CSB Layer to Soil Map

**File:** `src/pages/soil-map.tsx` (UPDATE)

**Add to soilLayers array:**

```typescript
const soilLayers: SoilLayer[] = [
  // ... existing layers
  {
    id: 'csb-fields',
    name: 'CSB Field Boundaries (Rotation)',
    type: 'tile',
    url: '', // Dynamic from GEE API
    visible: false,
    opacity: 0.7,
    legend: {
      1: 'Monoculture (Red)',
      2: '2-crop rotation (Orange)',
      3: '3-crop rotation (Green)',
      4: '4+ crop rotation (Blue)',
    },
  },
]
```

#### 4.2 Load CSB Tiles Dynamically

```typescript
useEffect(() => {
  async function loadCSBLayer() {
    try {
      const tileData = await GEEAPI.getCSBTileUrl({
        opacity: 0.7,
        min_complexity: 1,
        max_complexity: 4,
      })
      
      // Update CSB layer URL
      setActiveLayers(prev => {
        const csbLayer = prev.find(l => l.id === 'csb-fields')
        if (csbLayer) {
          csbLayer.url = tileData.tile_url
        }
        return [...prev]
      })
    } catch (error) {
      console.error('Failed to load CSB tiles:', error)
    }
  }
  
  loadCSBLayer()
}, [])
```

#### 4.3 CSB Field Click Handler

**Add interactive field selection:**

```typescript
const handleCSBFieldClick = async (csbid: string) => {
  try {
    const fieldDetails = await GEEAPI.getCSBFieldDetails(csbid)
    
    // Show popup with rotation analysis
    setSelectedCSBField(fieldDetails)
  } catch (error) {
    console.error('Failed to load field details:', error)
  }
}
```

#### 4.4 Add Terrain Attribute Layers

**Add terrain visualization layers to map:**

```typescript
{
  id: 'elevation',
  name: 'Elevation',
  type: 'tile',
  url: '', // From terrain analysis endpoint
  visible: false,
  opacity: 0.8,
},
{
  id: 'slope',
  name: 'Slope Gradient',
  type: 'tile',
  url: '',
  visible: false,
  opacity: 0.8,
},
{
  id: 'wetness-index',
  name: 'Topographic Wetness Index',
  type: 'tile',
  url: '',
  visible: false,
  opacity: 0.8,
}
```

---

## Component Inventory

### New Components to Create

| Component | File Path | Purpose | Priority |
|-----------|-----------|---------|----------|
| **Core Infrastructure** |
| GEEAPIClient | `src/lib/geeApiClient.ts` | Centralized API client with all GEE endpoints | **P0** |
| Type Definitions (GEE) | `src/types/geeApi.ts` | TypeScript types for RUSLE, CSB, Terrain | **P0** |
| Type Definitions (RUSLE-EOS) | `src/types/rusleEOS.ts` | Enhanced RUSLE types with scenarios | **P0** |
| Type Definitions (Drought) | `src/types/drought.ts` | GRIDMET drought assessment types | **P0** |
| Type Definitions (Resource Concerns) | `src/types/resourceConcerns.ts` | Comprehensive assessment types | **P0** |
| **Custom Hooks** |
| useRUSLEEOS | `src/hooks/useRUSLEEOS.ts` | RUSLE-EOS calculation with tier fallback | **P1** |
| useDroughtAssessment | `src/hooks/useDroughtAssessment.ts` | GRIDMET drought monitoring | **P1** |
| useResourceConcerns | `src/hooks/useResourceConcerns.ts` | Multi-factor assessment hook | **P1** |
| useFieldAnalysis | `src/hooks/useFieldAnalysis.ts` | Comprehensive field data loader | **P1** |
| useCSBFields | `src/hooks/useCSBFields.ts` | CSB boundary & rotation data | **P2** |
| **RUSLE-EOS Module** |
| RUSLE-EOS Calculator | `src/pages/tools/rusle-eos.tsx` | Main calculator page (rename from rusle2) | **P1** |
| FieldSelectorMap | `src/components/RUSLE/FieldSelectorMap.tsx` | Interactive field drawing/selection | **P1** |
| RUSLEInputPanel | `src/components/RUSLE/RUSLEInputPanel.tsx` | Year, tier, K-factor inputs | **P1** |
| ConservationPracticeSelector | `src/components/RUSLE/ConservationPracticeSelector.tsx` | Practice selection UI | **P1** |
| RUSLEFactorDisplay | `src/components/RUSLE/RUSLEFactorDisplay.tsx` | Factor breakdown (R,K,LS,C,P) | **P1** |
| ErosionRiskMap | `src/components/RUSLE/ErosionRiskMap.tsx` | GEE tile overlay map | **P1** |
| ScenarioComparison | `src/components/RUSLE/ScenarioComparison.tsx` | Before/After comparison | **P1** |
| ConservationRecommendations | `src/components/RUSLE/ConservationRecommendations.tsx` | Intelligent practice suggestions | **P1** |
| TierIndicator | `src/components/RUSLE/TierIndicator.tsx` | Tier status & accuracy display | **P2** |
| CFactorSubfactorDisplay | `src/components/RUSLE/CFactorSubfactorDisplay.tsx` | PLU×CC×SC×SR×SM breakdown | **P2** |
| **Field Analysis Enhancements** |
| DroughtDashboard | `src/components/FieldAnalysis/DroughtDashboard.tsx` | GRIDMET drought visualization | **P1** |
| TimeframeCard | `src/components/FieldAnalysis/TimeframeCard.tsx` | Drought timeframe conditions | **P2** |
| PracticeCard | `src/components/FieldAnalysis/PracticeCard.tsx` | Drought-affected practices | **P2** |
| ResourceConcernsDashboard | `src/components/FieldAnalysis/ResourceConcernsDashboard.tsx` | Comprehensive concerns display | **P1** |
| RankedConcernsList | `src/components/FieldAnalysis/RankedConcernsList.tsx` | Priority-ranked concerns | **P1** |
| PracticeRecommendations | `src/components/FieldAnalysis/PracticeRecommendations.tsx` | Matched practices for concerns | **P1** |
| PriorityTreatmentMap | `src/components/FieldAnalysis/PriorityTreatmentMap.tsx` | Hotspot visualization | **P2** |
| VegetationMonitoring | `src/components/FieldAnalysis/VegetationMonitoring.tsx` | NDVI time series charts | **P2** |
| TerrainAttributes | `src/components/FieldAnalysis/TerrainAttributes.tsx` | Slope, elevation, TWI stats | **P2** |
| ClimateHistory | `src/components/FieldAnalysis/ClimateHistory.tsx` | Precipitation, temperature trends | **P2** |
| ErosionAnalysisEnhanced | `src/components/FieldAnalysis/ErosionAnalysis.tsx` | Replace mock data with RUSLE-EOS | **P1** |
| **Soil Map Enhancements** |
| CSBFieldPopup | `src/components/Map/CSBFieldPopup.tsx` | Field rotation analysis popup | **P2** |
| CSBLegend | `src/components/Map/CSBLegend.tsx` | CSB rotation complexity legend | **P2** |
| TerrainLayerControl | `src/components/Map/TerrainLayerControl.tsx` | Terrain attribute layer toggle | **P2** |
| ErosionHeatmapLayer | `src/components/Map/ErosionHeatmapLayer.tsx` | RUSLE erosion visualization | **P2** |

### Component Interaction Diagram

```
┌────────────────────────────────────────────────────────────┐
│                   RUSLE-EOS Page                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │FieldSelector │→│ RUSLEInput   │→│ Calculate    │     │
│  │Map           │  │Panel         │  │Button        │     │
│  └──────────────┘  └──────────────┘  └───────┬──────┘     │
│                                               │            │
│                                               ▼            │
│                                   ┌────────────────────┐   │
│                                   │ useRUSLEEOS Hook   │   │
│                                   │  • Tier fallback   │   │
│                                   │  • Error handling  │   │
│                                   └────────┬───────────┘   │
│                                            │               │
│  ┌─────────────────────────────────────────▼───────┐      │
│  │            GEE API Client                        │      │
│  │  POST /api/rusle/calculate                       │      │
│  └─────────────────┬────────────────────────────────┘      │
│                    │                                       │
│  ┌─────────────────▼─────────────────┐                    │
│  │  Results Display Components        │                    │
│  │  • RUSLEFactorDisplay             │                    │
│  │  • ErosionRiskMap (GEE tiles)     │                    │
│  │  • ScenarioComparison             │                    │
│  │  • ConservationRecommendations    │                    │
│  └───────────────────────────────────┘                    │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│              Field Analysis Dashboard                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Erosion      │  │ Drought      │  │ Resource     │     │
│  │ Analysis     │  │ Assessment   │  │ Concerns     │     │
│  │ (RUSLE-EOS)  │  │ (GRIDMET)    │  │ (Multi)      │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                  │             │
│         ├─────────────────┴──────────────────┘             │
│         │                                                  │
│         ▼                                                  │
│  ┌──────────────────────────────┐                         │
│  │  useFieldAnalysis Hook        │                         │
│  │  • Parallel API calls         │                         │
│  │  • Data aggregation           │                         │
│  └──────────┬───────────────────┘                         │
│             │                                              │
│  ┌──────────▼────────────────────────────────────┐        │
│  │  GEE API Client (Multiple Endpoints)           │        │
│  │  • /api/rusle/calculate                         │        │
│  │  • /api/climate/drought-assessment             │        │
│  │  • /api/resource-concerns/comprehensive        │        │
│  │  • /api/sentinel/polygon (NDVI)                │        │
│  │  • /api/terrain/polygon                         │        │
│  └──────────┬────────────────────────────────────┘        │
│             │                                              │
│  ┌──────────▼─────────────────────────────────────┐       │
│  │  Comprehensive Dashboard Display                │       │
│  │  • ErosionAnalysis (real data)                 │       │
│  │  • DroughtDashboard (timeframes & impacts)     │       │
│  │  • ResourceConcernsDashboard (ranked)          │       │
│  │  • VegetationMonitoring (NDVI trends)          │       │
│  │  • TerrainAttributes (slope, TWI, etc.)        │       │
│  │  • PracticeRecommendations (matched)           │       │
│  └────────────────────────────────────────────────┘       │
└────────────────────────────────────────────────────────────┘
```

---

## Data Flow Examples

### Example 1: RUSLE2 Calculation

```
User draws field polygon
     ↓
Convert L.Polygon → WKT string
     ↓
useRUSLECalculation.calculate(wkt, year)
     ↓
GEEAPIClient.calculateRUSLE()
     ↓
POST /api/rusle/calculate
     ↓
GEE API processes (R, K, LS, C, P factors)
     ↓
Returns: { erosion_tons_acre_year, statistics, map_url, factors }
     ↓
Display results + erosion risk map
```

### Example 2: Field Analysis Dashboard

```
User selects field from map
     ↓
Get field geometry (GeoJSON → WKT)
     ↓
useFieldAnalysis(wkt, 2024)
     ↓
Parallel API calls:
  • RUSLE calculation
  • Terrain analysis
  • NDVI time series
  • Climate history
     ↓
All data loaded → Update dashboard components
     ↓
User can view:
  • Real erosion calculations
  • Vegetation trends
  • Terrain attributes
  • Climate patterns
```

### Example 3: CSB Field Selection

```
User enables CSB layer on soil map
     ↓
Load CSB tile URL from GEE
     ↓
Display colored field boundaries (rotation complexity)
     ↓
User clicks field
     ↓
Get field CSBID from click event
     ↓
GEEAPI.getCSBFieldDetails(csbid)
     ↓
Display popup:
  • Rotation sequence (2017-2023)
  • Sustainability rating
  • Crop diversity score
```

---

## Performance Optimization

### 1. Caching Strategy

**Install React Query:**

```bash
npm install @tanstack/react-query
```

**Setup in `_app.tsx`:**

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  )
}
```

**Use in hooks:**

```typescript
// src/hooks/useRUSLECalculation.ts
import { useQuery } from '@tanstack/react-query'

export function useRUSLECalculation(wkt: string, year: number) {
  return useQuery({
    queryKey: ['rusle', wkt, year],
    queryFn: () => GEEAPI.calculateRUSLE({ wkt, year }),
    enabled: !!wkt,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  })
}
```

### 2. Debounce Map Interactions

```typescript
import { useCallback } from 'react'
import debounce from 'lodash/debounce'

const loadFieldsDebounced = useCallback(
  debounce(() => loadCSBFieldBoundaries(), 500),
  []
)
```

### 3. Lazy Load Map Components

```typescript
const ErosionMapLayer = dynamic(
  () => import('#components/RUSLE/ErosionMapLayer'),
  { ssr: false, loading: () => <div>Loading map...</div> }
)
```

### 4. Conditional API Calls

**Only load data when needed:**

```typescript
// Don't load NDVI if user hasn't expanded vegetation section
const { data: ndviData } = useQuery({
  queryKey: ['ndvi', fieldWkt],
  queryFn: () => GEEAPI.getSentinelNDVI({ wkt: fieldWkt, ... }),
  enabled: expandedSections.has('vegetation'), // Only when section is open
})
```

---

## Error Handling Strategy

### 1. User-Friendly Error Messages

```typescript
function getErrorMessage(error: unknown): string {
  if (error instanceof GEEAPIError) {
    switch (error.status) {
      case 400:
        return 'Invalid field geometry. Please redraw the field boundary.'
      case 404:
        return 'No satellite data available for this location and time period.'
      case 500:
        return 'Server error. Please try again in a moment.'
      case 503:
        return 'GEE service temporarily unavailable. Retrying...'
      default:
        return `Error: ${error.message}`
    }
  }
  return 'An unexpected error occurred.'
}
```

### 2. Automatic Tier Fallback

**For RUSLE calculations, automatically fall back to lower tiers:**

```typescript
async function calculateWithFallback(request: RUSLECalculateRequest) {
  const tiers: Array<'tier_3' | 'tier_2' | 'tier_1'> = ['tier_3', 'tier_2', 'tier_1']
  
  for (const tier of tiers) {
    try {
      const result = await GEEAPI.calculateRUSLE({ ...request, tier })
      return result
    } catch (error) {
      if (tier === 'tier_1') throw error // No more fallbacks
      console.warn(`${tier} failed, falling back to next tier`)
    }
  }
}
```

### 3. Loading States

```typescript
{loading && (
  <div className="flex items-center gap-2">
    <Loader className="w-4 h-4 animate-spin" />
    <span>Analyzing field with Google Earth Engine...</span>
  </div>
)}

{error && (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
    <p className="text-red-800">{getErrorMessage(error)}</p>
    <button onClick={retry}>Try Again</button>
  </div>
)}
```

---

## Testing Strategy

### 1. Unit Tests for API Client

```typescript
// __tests__/lib/geeApiClient.test.ts
describe('GEEAPIClient', () => {
  it('should calculate RUSLE for valid WKT', async () => {
    const result = await GEEAPI.calculateRUSLE({
      wkt: 'POLYGON((-95.5 41.5, -95.5 41.6, -95.4 41.6, -95.4 41.5, -95.5 41.5))',
      year: 2024,
    })
    
    expect(result).toHaveProperty('erosion_tons_acre_year')
    expect(result.erosion_tons_acre_year).toBeGreaterThan(0)
  })

  it('should handle invalid WKT gracefully', async () => {
    await expect(
      GEEAPI.calculateRUSLE({ wkt: 'INVALID', year: 2024 })
    ).rejects.toThrow(GEEAPIError)
  })
})
```

### 2. Integration Tests

```typescript
// __tests__/pages/rusle2.test.tsx
describe('RUSLE2 Calculator', () => {
  it('should calculate erosion when field is selected', async () => {
    render(<RUSLE2Calculator />)
    
    // Simulate field selection
    const wkt = 'POLYGON(...)'
    fireEvent.click(screen.getByText('Calculate'))
    
    await waitFor(() => {
      expect(screen.getByText(/Soil Loss:/)).toBeInTheDocument()
    })
  })
})
```

### 3. E2E Tests (Cypress)

```javascript
// cypress/e2e/rusle2-calculator.cy.js
describe('RUSLE2 Calculator E2E', () => {
  it('should complete full erosion calculation workflow', () => {
    cy.visit('/tools/rusle2')
    cy.get('[data-testid="map"]').click(300, 300)
    cy.get('button').contains('Calculate').click()
    cy.get('[data-testid="erosion-result"]').should('be.visible')
    cy.contains(/tons\/acre\/year/).should('exist')
  })
})
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] Set `NEXT_PUBLIC_GEE_API_URL` in production environment
- [ ] Test all GEE API endpoints with production URL
- [ ] Verify error handling for all API calls
- [ ] Test tier fallback mechanism
- [ ] Optimize bundle size (lazy loading, code splitting)
- [ ] Add loading skeletons for all async components
- [ ] Test on slow network connections
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness testing
- [ ] Add analytics tracking for GEE API usage

### Post-Deployment

- [ ] Monitor API error rates
- [ ] Track average response times
- [ ] Monitor GEE API quota usage
- [ ] Collect user feedback on RUSLE2 module
- [ ] Review caching effectiveness
- [ ] Optimize based on real usage patterns

---

## Migration Path

### Week 1: Foundation & Core Infrastructure
**Goal:** Establish solid foundation for all GEE integrations

- [ ] Create comprehensive `geeApiClient.ts` with all endpoints
- [ ] Add all TypeScript type definitions:
  - `geeApi.ts` (base types)
  - `rusleEOS.ts` (RUSLE-EOS specific)
  - `drought.ts` (GRIDMET drought)
  - `resourceConcerns.ts` (comprehensive assessment)
- [ ] Update `.env.local` with GEE API URL
- [ ] Test API connectivity and health check
- [ ] Implement error handling and tier fallback logic
- [ ] Set up request/response logging

**Deliverable:** Working API client ready for integration

### Week 2-3: RUSLE-EOS Module (Priority 1)
**Goal:** Complete, production-ready erosion calculator

**Week 2:**
- [ ] Rename `rusle2.tsx` → `rusle-eos.tsx`
- [ ] Build core hooks:
  - `useRUSLEEOS.ts` (with tier fallback)
  - `useConservationPractices.ts`
- [ ] Create UI components:
  - `FieldSelectorMap.tsx` (draw, click, upload)
  - `RUSLEInputPanel.tsx` (year, tier, K-factor)
  - `RUSLEFactorDisplay.tsx` (R, K, LS, C, P breakdown)
- [ ] Implement basic calculation workflow
- [ ] Test with real GEE API

**Week 3:**
- [ ] Add practice selection:
  - `ConservationPracticeSelector.tsx`
  - P-factor calculation logic
- [ ] Build comparison features:
  - `ScenarioComparison.tsx`
  - Cost-benefit analysis
- [ ] Add map visualizations:
  - `ErosionRiskMap.tsx` (GEE tile overlay)
  - Hotspot identification
- [ ] Implement recommendations:
  - `ConservationRecommendations.tsx`
  - Auto-suggestions when erosion > T-value
- [ ] Polish UI/UX and add loading states
- [ ] Write documentation and user guide

**Deliverable:** Fully functional RUSLE-EOS calculator

### Week 4: Field Analysis - Comprehensive Enhancement
**Goal:** Transform field analysis into multi-factor assessment dashboard

**Phase 4A: Erosion Integration (Days 1-2)**
- [ ] Replace mock data in `ErosionAnalysis.tsx`
- [ ] Connect to RUSLE-EOS API
- [ ] Add erosion map visualization
- [ ] Implement T-value comparison

**Phase 4B: Drought Assessment (Days 3-4)**
- [ ] Create `useDroughtAssessment.ts` hook
- [ ] Build `DroughtDashboard.tsx` component
- [ ] Add timeframe condition cards
- [ ] Implement practice impact display
- [ ] Add technical indices (collapsible)

**Phase 4C: Resource Concerns (Days 5-7)**
- [ ] Create `useResourceConcerns.ts` hook
- [ ] Build `ResourceConcernsDashboard.tsx`
- [ ] Implement `RankedConcernsList.tsx`
- [ ] Add `PracticeRecommendations.tsx` (matched to concerns)
- [ ] Create `PriorityTreatmentMap.tsx` (hotspot visualization)
- [ ] Integrate executive summary display

**Phase 4D: Supporting Data (Days 8-10)**
- [ ] Add `VegetationMonitoring.tsx` (NDVI charts)
- [ ] Create `TerrainAttributes.tsx` (slope, TWI, etc.)
- [ ] Build `ClimateHistory.tsx` (optional)
- [ ] Implement `useFieldAnalysis.ts` master hook
- [ ] Optimize parallel API calls
- [ ] Add comprehensive loading states

**Deliverable:** Feature-complete field analysis dashboard

### Week 5: Soil Map CSB & Terrain Integration
**Goal:** Enhanced soil map with field boundaries and terrain layers

- [ ] Add CSB layer to `soil-map.tsx`
- [ ] Implement dynamic tile loading (`useCSBFields.ts`)
- [ ] Create `CSBFieldPopup.tsx` with rotation analysis
- [ ] Build `CSBLegend.tsx` component
- [ ] Add terrain attribute layers:
  - Elevation overlay
  - Slope gradient
  - Topographic wetness index
- [ ] Implement layer toggle controls
- [ ] Add interactive field selection
- [ ] Optimize tile caching

**Deliverable:** Enhanced interactive soil map

### Week 6: Polish, Testing & Documentation
**Goal:** Production-ready, well-tested application

**Testing (Days 1-3)**
- [ ] Unit tests for API client
- [ ] Unit tests for hooks
- [ ] Component integration tests
- [ ] E2E tests for critical workflows:
  - RUSLE-EOS calculation
  - Field analysis loading
  - CSB field selection
- [ ] Cross-browser testing
- [ ] Mobile responsiveness testing
- [ ] Performance profiling and optimization

**Polish (Days 4-5)**
- [ ] Add loading skeletons for all async components
- [ ] Improve error messages (user-friendly)
- [ ] Add success notifications
- [ ] Implement retry logic for failed requests
- [ ] Add keyboard navigation support
- [ ] Accessibility audit (WCAG AA)

**Documentation (Days 6-7)**
- [ ] User guides for each module
- [ ] API integration documentation
- [ ] Troubleshooting guide
- [ ] Performance best practices
- [ ] Developer documentation
- [ ] Deployment guide

**Deliverable:** Production-ready application with comprehensive documentation

---

## API Endpoint Usage Matrix

| Module | Endpoint | Frequency | Priority | Description |
|--------|----------|-----------|----------|-------------|
| **RUSLE-EOS** |
| RUSLE-EOS | `/api/rusle/calculate` | Per calculation | **High** | Complete RUSLE with all factors |
| RUSLE-EOS | `/api/rusle/c-factor` | Optional (testing) | Medium | C-factor only (tier testing) |
| RUSLE-EOS | `/api/rusle/r-factor` | Rare | Low | R-factor only (diagnostic) |
| RUSLE-EOS | `/api/rusle/ls-factor` | Rare | Low | LS-factor only (diagnostic) |
| **Field Analysis - Erosion** |
| Field Analysis | `/api/rusle/calculate` | Once per field | **High** | Field erosion assessment |
| Field Analysis | `/api/terrain/polygon` | Once per field | **High** | Terrain attributes with tiles |
| **Field Analysis - Drought** |
| Field Analysis | `/api/climate/drought-assessment` | Once per field | **High** | GRIDMET drought indices |
| Field Analysis | `/api/climate/polygon` | Once per field | Medium | Climate history (optional) |
| **Field Analysis - Resource Concerns** |
| Field Analysis | `/api/resource-concerns/comprehensive` | Once per field | **High** | All 6 assessment types |
| Field Analysis | `/api/resource-concerns/erosion` | As needed | Medium | Erosion-specific detail |
| Field Analysis | `/api/resource-concerns/ponding` | As needed | Medium | Ponding-specific detail |
| Field Analysis | `/api/resource-concerns/productivity` | As needed | Medium | Productivity-specific detail |
| **Field Analysis - Vegetation** |
| Field Analysis | `/api/sentinel/polygon` | Once per field | **High** | NDVI time series & stats |
| Field Analysis | `/api/sentinel/point` | For spot checks | Low | Point NDVI time series |
| **Soil Map** |
| Soil Map | `/api/csb/tiles` | Once on load | **High** | CSB tile layer URL |
| Soil Map | `/api/csb/bounds` | Per map pan (zoom ≥13) | Medium | GeoJSON field boundaries |
| Soil Map | `/api/csb/field/{id}` | Per field click | Low | Detailed rotation analysis |
| Soil Map | `/api/terrain/polygon` | On-demand | Low | Terrain tile layers |
| **General** |
| All | `/health` | On app init | Low | API health check |

### API Call Patterns by Module

**RUSLE-EOS (typical session):**
- Initial calculation: 1 call to `/api/rusle/calculate`
- Practice changes: 2-4 calls (scenario comparison)
- Tier testing: 0-3 calls (optional)
- **Total: 3-8 calls per session**

**Field Analysis (comprehensive):**
- Erosion: 1 call to `/api/rusle/calculate`
- Drought: 1 call to `/api/climate/drought-assessment`
- Resource Concerns: 1 call to `/api/resource-concerns/comprehensive`
- Vegetation: 1 call to `/api/sentinel/polygon`
- Terrain: 1 call to `/api/terrain/polygon`
- **Total: 5 calls per field (parallel)**

**Soil Map (typical session):**
- CSB tiles: 1 call (cached indefinitely)
- CSB bounds: 5-10 calls (as user pans/zooms)
- Field details: 0-3 calls (user clicks)
- **Total: 6-14 calls per session**

### Parallel Request Optimization

**Field Analysis - Load All Data in Parallel:**

```typescript
// Instead of sequential:
const erosion = await GEEAPI.calculateRUSLE({wkt, year})
const drought = await GEEAPI.getDroughtAssessment({wkt})
const concerns = await GEEAPI.getResourceConcerns({wkt, year})
const vegetation = await GEEAPI.getSentinelNDVI({wkt, ...dates})
const terrain = await GEEAPI.getTerrainAnalysis({wkt})

// Do parallel:
const [erosion, drought, concerns, vegetation, terrain] = await Promise.all([
  GEEAPI.calculateRUSLE({wkt, year}),
  GEEAPI.getDroughtAssessment({wkt}),
  GEEAPI.getResourceConcerns({wkt, year}),
  GEEAPI.getSentinelNDVI({wkt, ...dates}),
  GEEAPI.getTerrainAnalysis({wkt}),
])
```

**Estimated Performance:**
- Sequential: ~15-20 seconds (5 endpoints × 3-4s each)
- Parallel: ~4-6 seconds (longest endpoint wait time)
- **Improvement: 70-75% faster**

---

## Cost & Performance Considerations

### API Call Optimization

**Batch requests where possible:**

```typescript
// Instead of multiple individual calls
const fields = ['field1', 'field2', 'field3']
const results = await Promise.all(
  fields.map(wkt => GEEAPI.calculateRUSLE({ wkt, year: 2024 }))
)
```

**Cache aggressively:**

```typescript
// CSB tile URL rarely changes
const { data: csbTileUrl } = useQuery({
  queryKey: ['csb-tiles'],
  queryFn: () => GEEAPI.getCSBTileUrl(),
  staleTime: Infinity, // Never refetch
})
```

### Estimated API Usage

**Per user session (typical):**
- RUSLE2 calculation: 2-5 calls (testing scenarios)
- Field analysis: 4 calls (erosion, terrain, NDVI, climate)
- CSB tiles: 1 call (cached)
- CSB field details: 0-3 calls (field clicks)

**Total: ~7-13 API calls per session**

---

## Success Metrics

### Technical Metrics
- API response time < 3 seconds (95th percentile)
- Error rate < 5%
- Cache hit rate > 60%
- Bundle size increase < 50kb (gzipped)

### User Metrics
- RUSLE2 calculator usage > 50% of field-analysis users
- Average time to complete erosion calculation < 30 seconds
- Bounce rate on RUSLE2 page < 30%
- User satisfaction rating > 4/5

---

## Future Enhancements

### Phase 2 Features (Post-Launch)

1. **Multi-Field Batch Processing**
   - Upload shapefile with multiple fields
   - Batch RUSLE calculations
   - Export report for all fields

2. **Temporal Analysis**
   - Year-over-year erosion trends
   - C-factor changes over time
   - Climate pattern analysis

3. **Practice Effectiveness Modeling**
   - Before/after scenarios with multiple practices
   - Cost-benefit analysis
   - ROI calculations

4. **Advanced Visualizations**
   - 3D terrain rendering
   - Erosion hotspot heatmaps
   - Vegetation health animations

5. **Export & Reporting**
   - PDF conservation plans
   - NRCS-compatible reports
   - Shapefile export with calculated attributes

---

## Appendix: Quick Reference

### GEE API Base URL
```
https://gee-api-production.up.railway.app
```

### Key Files to Create
```
# Core Infrastructure (P0)
src/lib/geeApiClient.ts
src/types/geeApi.ts
src/types/rusleEOS.ts
src/types/drought.ts
src/types/resourceConcerns.ts

# Custom Hooks (P1)
src/hooks/useRUSLEEOS.ts
src/hooks/useDroughtAssessment.ts
src/hooks/useResourceConcerns.ts
src/hooks/useFieldAnalysis.ts
src/hooks/useCSBFields.ts

# RUSLE-EOS Components (P1)
src/pages/tools/rusle-eos.tsx
src/components/RUSLE/FieldSelectorMap.tsx
src/components/RUSLE/RUSLEInputPanel.tsx
src/components/RUSLE/ConservationPracticeSelector.tsx
src/components/RUSLE/RUSLEFactorDisplay.tsx
src/components/RUSLE/ErosionRiskMap.tsx
src/components/RUSLE/ScenarioComparison.tsx
src/components/RUSLE/ConservationRecommendations.tsx
src/components/RUSLE/TierIndicator.tsx
src/components/RUSLE/CFactorSubfactorDisplay.tsx

# Field Analysis Components (P1)
src/components/FieldAnalysis/DroughtDashboard.tsx
src/components/FieldAnalysis/TimeframeCard.tsx
src/components/FieldAnalysis/PracticeCard.tsx
src/components/FieldAnalysis/ResourceConcernsDashboard.tsx
src/components/FieldAnalysis/RankedConcernsList.tsx
src/components/FieldAnalysis/PracticeRecommendations.tsx
src/components/FieldAnalysis/VegetationMonitoring.tsx
src/components/FieldAnalysis/TerrainAttributes.tsx

# Soil Map Components (P2)
src/components/Map/CSBFieldPopup.tsx
src/components/Map/CSBLegend.tsx
src/components/Map/TerrainLayerControl.tsx
src/components/Map/ErosionHeatmapLayer.tsx
```

### Key Files to Modify
```
# Environment
.env.local (add NEXT_PUBLIC_GEE_API_URL)

# Pages
src/pages/tools/rusle2.tsx → rusle-eos.tsx (rename & rebuild)
src/pages/field-analysis/[fieldId].tsx (add comprehensive data)
src/pages/soil-map.tsx (add CSB & terrain layers)

# Components
src/components/FieldAnalysis/ErosionAnalysis.tsx (replace mock data)
src/components/layout/SidebarLayout.tsx (update RUSLE2 → RUSLE-EOS)
src/components/Dashboard/ModuleGrid.tsx (update descriptions)

# App Setup
src/pages/_app.tsx (add React Query provider - optional)
```

### Documentation References
- API Docs: https://gee-api-production.up.railway.app/docs
- Architecture: `Property_Panel_Guide/gee-api-docs/architecture.md`
- Next.js Integration: `Property_Panel_Guide/gee-api-docs/nextjs-integration.md`
- Quick Start: `Property_Panel_Guide/gee-api-docs/quick-start-gee-api.md`

---

## Conclusion

---

## Migration from v1 to v2.1.0

### Key Architectural Changes

**Old Approach (v1):**
```
Client → getTerrainData()     → LS-factor
      → getClimateData()      → R-factor  
      → getVegetationData()   → C-factor (NDVI)
      → SSURGOClient          → K-factor
      → Local RUSLE calc      → A = R × K × LS × C × P
```

**New Approach (v2.1.0):**
```
Client → calculateRUSLE() → Complete analysis with all factors + statistics
```

### Benefits of Migration

| Metric | v1 | v2.1.0 | Improvement |
|--------|----|---------| ------------|
| API Calls | 4-5 | 1 | 75-80% reduction |
| Processing Time | ~10s | ~3s | 70% faster |
| Code Complexity | ~470 LOC | ~310 LOC | 34% reduction |
| Spatial Statistics | Single point | Min/max/mean/std/median | 5× more data |
| K-factor Source | SSURGO (gaps) | SSURGO 30m | Complete coverage |
| Error Handling | Client-side | Server-side | More robust |

### Migration Checklist

- [ ] Update environment variables (`NEXT_PUBLIC_GEE_API_URL`)
- [ ] Install updated type definitions (`src/types/geeApi.ts`)
- [ ] Replace `GEEClient` with `createGEEClient()` factory
- [ ] Update error handling (use `detail` field, not `error`)
- [ ] Replace multi-endpoint workflow with `calculateRUSLE()`
- [ ] Remove SSURGO client dependency (if not used elsewhere)
- [ ] Update response mapping (snake_case fields)
- [ ] Test against production API
- [ ] Update documentation and examples

**Reference:** Complete migration guide in `Property_Panel_Guide/gee-api-docs/nextjs-erosion-module/MIGRATION_GUIDE.md`

---

## Data Source Updates

### RUSLE Factor Data Sources (v2.1.0)

| Factor | Old Source (v1) | New Source (v2.1.0) | Improvement |
|--------|----------------|---------------------|-------------|
| **K-factor** | SSURGO Web Soil Survey | SSURGO 30m (GEE) | Complete coverage, consistent resolution |
| **R-factor** | DAYMET + GPM | DAYMET V4 + GPM IMERG (hybrid) | Better hybrid approach |
| **LS-factor** | NCSS 30m DEM | NCSS 30m DEM | Same (unchanged) |
| **C-factor** | Sentinel-2 NDVI (client calc) | Sentinel-2 + CDL (server) | Crop-type aware |
| **P-factor** | Lookup table (client) | Lookup table (server) | More practices |


---

## Conclusion

This integration plan transforms the soil-mapper application into a comprehensive soil conservation planning platform by leveraging the full capabilities of the GEE API v2.1.0:

### Major Enhancements

**1. RUSLE-EOS (RUSLE Earth Observation System) - v2.1.0**
- **Unified endpoint** with single API call for complete analysis
- **Spatial statistics** for every factor (min/max/mean/std/median)
- **SSURGO 30m** soil data for complete coverage
- **Built-in risk assessment** with T-value comparison
- Conservation practice scenario comparison
- Server-side GEE processing (70% faster than v1)

**2. Comprehensive Field Analysis**
- GRIDMET-based drought assessment (4 indices × 4 timeframes = 16 metrics)
- Multi-factor resource concern analysis (6 concern types)
- Integrated practice recommendations based on all factors
- Vegetation health monitoring with NDVI trends
- Terrain analysis with slope/aspect/TWI/TPI
- **All data from unified API endpoints**

**3. Enhanced Soil Mapping**
- \u2705 CSB 30m field boundaries (GeoJSON layers implemented)
- \u2705 Interactive field selection (click-to-select)
- Terrain attribute visualization (slope, aspect, TWI)
- Erosion risk heatmaps overlaid on soil data
- Integration with existing SSURGO/OSD data

### Technical Achievements

- **Performance**: Single API call reduces latency by 75%
- **Scalability**: Handles 100-acre fields with sub-30m resolution
- **Accuracy**: Server-side calculations with spatial statistics
- **Reliability**: Server-side error handling with detailed responses
- **Data Quality**: SSURGO 30m (complete coverage) vs SSURGO (gaps)
- **User Experience**: Progressive enhancement - works without GEE API, better with it

### Implementation Timeline

**4-5 week phased implementation** (Foundation Phase 1 Complete):
- \u2705 Foundation infrastructure (CSB integration complete)
- \u23f3 Core RUSLE-EOS with unified endpoint (Weeks 2-3)
- \u23f3 Enhanced field analysis with drought/resources (Week 4)
- \u23f3 Terrain visualization and polish (Week 5)

### Success Metrics

After full implementation, users will be able to:
1. \u2705 Calculate accurate erosion estimates using server-side GEE processing
2. \u2705 Get complete spatial statistics (not just averages) for every RUSLE factor
3. \u2705 Model conservation practice impacts with single API call
4. \u2705 Assess drought vulnerability with 16 different metrics
5. \u2705 Identify priority resource concerns for any field
6. \u2705 Get targeted practice recommendations based on comprehensive analysis
7. \u2705 Monitor vegetation health and temporal trends
8. \u2705 Visualize terrain attributes affecting conservation
9. \u2705 Define precise field boundaries using CSB data (IMPLEMENTED)
10. \u2705 Select fields interactively on map (IMPLEMENTED)

### Next Steps

1. **Review & Approve** this updated v2.1.0 plan
2. **Environment Setup**: Verify `NEXT_PUBLIC_GEE_API_URL` in `.env.local`
3. **Test Connectivity**: Verify GEE API health check (`/health` endpoint)
4. **Start RUSLE-EOS**: Build calculator using unified `calculateRUSLE()` endpoint
5. **Reference Migration Guide**: Use `nextjs-erosion-module/MIGRATION_GUIDE.md`

This integration represents a significant leap forward in providing farmers and conservation planners with actionable, data-driven insights for sustainable land management.

---

**Document Version**: 3.0 (Updated for GEE API v2.1.0)  
**API Version**: v2.1.0  
**Last Updated**: January 7, 2026  
**Status**: Foundation Phase Complete (CSB Integration) - RUSLE-EOS Ready to Begin  
**Estimated Completion**: 4-5 weeks for remaining phases

**Key Changes from v2.0:**
- \u2705 Updated for unified RUSLE endpoint (v2.1.0)
- \u2705 Added migration guide and checklist
- \u2705 Simplified architecture (server-side processing)
- \u2705 Documented CSB integration completion
- \u2705 Added performance metrics and comparisons

**References:**
- Migration Guide: `Property_Panel_Guide/gee-api-docs/nextjs-erosion-module/MIGRATION_GUIDE.md`
- Type Definitions: `Property_Panel_Guide/gee-api-docs/nextjs-erosion-module/src/lib/gee-client/types.ts`
- API Examples: `Property_Panel_Guide/gee-api-docs/nextjs-erosion-module/README.md`
3. ✅ Assess drought vulnerability with 16 different metrics
4. ✅ Identify priority resource concerns for any field
5. ✅ Get targeted practice recommendations based on comprehensive analysis
6. ✅ Monitor vegetation health and temporal trends
7. ✅ Visualize terrain attributes affecting conservation
8. ✅ Define precise field boundaries using CSB data

### Next Steps

1. **Review & Approve** this comprehensive plan
2. **Set Environment**: Add `NEXT_PUBLIC_GEE_API_URL=https://gee-api-production.up.railway.app` to `.env.local`
3. **Start Week 1**: Create foundation (types, API client, hooks)
4. **Test Connectivity**: Verify GEE API health check endpoint
5. **Begin RUSLE-EOS**: Build calculator interface and map integration

This integration represents a significant leap forward in providing farmers and conservation planners with actionable, data-driven insights for sustainable land management.

---

**Document Version**: 2.0  
**Last Updated**: January 7, 2026  
**Status**: Ready for Implementation  
**Estimated Completion**: 6 weeks from start date
