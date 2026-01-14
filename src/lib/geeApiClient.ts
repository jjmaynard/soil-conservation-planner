// ============================================================================
// GEE API v2.1.0 Client - Unified Endpoint Architecture
// ============================================================================
// Complete client for Google Earth Engine API with RUSLE calculations,
// CSB field boundaries, terrain analysis, NDVI, drought assessment, and more.
// Reference: Property_Panel_Guide/gee-api-docs/nextjs-erosion-module/

import axios, { AxiosInstance, AxiosError } from 'axios'
import type {
  RUSLECalculateRequest,
  RUSLEResponse,
  RFactorRequest,
  RFactorResponse,
  LSFactorRequest,
  LSFactorResponse,
  CSBBounds,
  CSBFieldDetails,
  CSBQueryParams,
  CSBTileUrlRequest,
  CSBTileUrlResponse,
  TerrainRequest,
  TerrainResponse,
  SentinelRequest,
  SentinelResponse,
  ClimateRequest,
  ClimateResponse,
  DroughtAssessmentRequest,
  DroughtAssessment,
  ResourceConcernRequest,
  ComprehensiveAssessment,
  ErosionAssessment,
  PondingAssessment,
  ProductivityAssessment,
} from '#types/geeApi'

// ============================================================================
// Configuration
// ============================================================================

export interface GEEClientConfig {
  baseURL?: string
  timeout?: number
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
    const data = error.response?.data
    
    // Log full error details for debugging
    console.error('[GEE API Error]:', data)
    
    // Extract error message
    let message = 'API request failed'
    
    if (data?.detail) {
      if (Array.isArray(data.detail)) {
        // FastAPI validation errors
        message = data.detail.map((err: any) => 
          `${err.loc?.join('.') || 'Field'}: ${err.msg}`
        ).join('; ')
      } else if (typeof data.detail === 'string') {
        message = data.detail
      } else {
        message = JSON.stringify(data.detail)
      }
    } else if (error.message) {
      message = error.message
    }
    
    throw new GEEAPIError(message, status, data)
  }
  throw new GEEAPIError('An unexpected error occurred')
}

// ============================================================================
// Main API Client
// ============================================================================

class GEEAPIClient {
  private client: AxiosInstance

  constructor(config: GEEClientConfig = {}) {
    // Use local Next.js API routes as proxy to avoid CORS issues
    const baseURL = config.baseURL || 
      (typeof window !== 'undefined' ? '/api/gee' : 
        process.env.NEXT_PUBLIC_GEE_API_URL || 
        'https://gee-api-production.up.railway.app')
    
    this.client = axios.create({
      baseURL,
      timeout: config.timeout || 150000, // 150s for multi-scenario RUSLE processing
      headers: { 'Content-Type': 'application/json' },
    })

    // Request interceptor
    this.client.interceptors.request.use((config) => {
      console.log(`[GEE API] ${config.method?.toUpperCase()} ${config.url}`)
      return config
    })

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
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
   * 
   * @param request - RUSLE calculation parameters including geometry and dates
   * @returns Complete RUSLE response with spatial statistics for all factors
   */
  async calculateRUSLE(request: RUSLECalculateRequest): Promise<RUSLEResponse> {
    try {
      // Log the request as-is (year should already be a number from frontend)
      console.log('[GEE API] Sending request:', {
        year: request.year,
        yearType: typeof request.year,
        startDate: request.start_date,
        endDate: request.end_date,
        wktLength: request.wkt?.length || 0,
        practices: request.conservation_practices,
        detectTerraces: request.detect_terraces,
        detectContours: request.detect_contours,
        includeScenarios: request.include_scenarios,
        includeFactorMaps: request.include_factor_maps,
        includeUncertainty: request.include_uncertainty,
      })
      
      const { data } = await this.client.post<RUSLEResponse>(
        '/api/rusle/calculate',
        request  // Send as-is, backend will validate
      )
      
      console.log('[GEE API] Success! Received response with soil_loss_rate:', data.soil_loss_rate_tons_acre_yr)
      
      return data
    } catch (error) {
      console.error('[GEE API] Request failed. Error details:', {
        message: (error as any)?.message,
        response: (error as any)?.response?.data,
        status: (error as any)?.response?.status,
      })
      return handleAPIError(error)
    }
  }

  // ==========================================================================
  // Individual Factor Endpoints (Optional - for specialized use)
  // ==========================================================================

  async getRFactor(request: RFactorRequest): Promise<RFactorResponse> {
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

  async getLSFactor(request: LSFactorRequest): Promise<LSFactorResponse> {
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

  /**
   * Get CSB tile URL template from API
   */
  async getCSBTileURL(options: CSBTileUrlRequest = {}): Promise<CSBTileUrlResponse> {
    try {
      const { data } = await this.client.get<CSBTileUrlResponse>('/api/csb/tiles', {
        params: {
          opacity: options.opacity || 0.7,
          min_complexity: options.min_complexity || 1,
          max_complexity: options.max_complexity || 4,
        },
      })
      return data
    } catch (error) {
      return handleAPIError(error)
    }
  }

  /**
   * Get CSB field boundaries within a bounding box
   */
  async getCSBBounds(params: CSBQueryParams): Promise<CSBBounds> {
    try {
      const response = await this.client.get<CSBBounds>('/api/csb/bounds', {
        params: {
          min_lon: params.minLon,
          min_lat: params.minLat,
          max_lon: params.maxLon,
          max_lat: params.maxLat,
          zoom: params.zoom,
          limit: params.limit,
        },
      })
      return response.data
    } catch (error) {
      return handleAPIError(error)
    }
  }

  /**
   * Get detailed field information for a specific CSB ID
   */
  async getFieldDetails(csbid: string): Promise<CSBFieldDetails> {
    try {
      const response = await this.client.get<CSBFieldDetails>(
        `/api/csb/field/${csbid}`
      )
      return response.data
    } catch (error) {
      return handleAPIError(error)
    }
  }

  /**
   * Query CSB field at a specific point (for click handlers)
   * Creates a small bounding box around the point
   */
  async queryFieldAtPoint(lat: number, lng: number): Promise<CSBFieldDetails | null> {
    try {
      // Create small bounding box (approx 100m at mid-latitudes)
      const buffer = 0.001 // ~111m
      const bounds = await this.getCSBBounds({
        minLon: lng - buffer,
        minLat: lat - buffer,
        maxLon: lng + buffer,
        maxLat: lat + buffer,
        limit: 1,
      })

      if (bounds.features.length === 0) {
        return null
      }

      // Return the first (nearest) field
      const feature = bounds.features[0]
      console.log('[GEE API] Raw feature from bounds:', feature)
      console.log('[GEE API] Feature properties:', feature.properties)

      return {
        clu_id: feature.properties.CSBID || feature.id,
        acres: feature.properties.CSBACRES || feature.properties.ACRES,
        state: feature.properties.STATEFIPS,
        county: feature.properties.CNTY,
        farm_number: feature.properties.farm_number,
        tract_number: feature.properties.tract_number,
        field_number: feature.properties.field_number,
        geometry: feature.geometry,
        centroid: {
          lat: lat,
          lng: lng,
        },
      }
    } catch (error) {
      console.error('Error querying field at point:', error)
      return null
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
  // Vegetation / Sentinel-2 NDVI
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
      const { data } = await this.client.get<SentinelResponse>('/api/sentinel/point', {
        params: { lat, lon, start_date, end_date },
      })
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
      const { data } = await this.client.get<ClimateResponse>('/api/climate/point', {
        params: { lat, lon, start_year, end_year },
      })
      return data
    } catch (error) {
      return handleAPIError(error)
    }
  }

  // ==========================================================================
  // Health Check
  // ==========================================================================

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await this.client.get('/health')
      return response.data
    } catch (error) {
      throw new Error('GEE API is not available')
    }
  }
}

// ============================================================================
// Factory Function (v2.1.0 Pattern)
// ============================================================================

/**
 * Create a new GEE API client instance
 * @param config - Optional configuration (baseURL, timeout)
 * @returns GEEAPIClient instance
 */
export function createGEEClient(config?: GEEClientConfig): GEEAPIClient {
  return new GEEAPIClient(config)
}

// Export singleton for convenience
export const geeApi = createGEEClient()
