// API Client for Soil Survey Backend Services

import axios, { type AxiosInstance } from 'axios'
import type {
  MIRAnalysisRequest,
  MIRAnalysisResponse,
  SoilPredictionRequest,
  SoilPredictionResponse,
  SSURGOQueryRequest,
} from '#src/types/api'
import type { SoilProfile } from '#src/types/soil'

class SoilAPIClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_SOIL_API_URL || 'http://localhost:8000',
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => Promise.reject(error)
    )

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message)
        return Promise.reject(error)
      }
    )
  }

  /**
   * Predict soil properties at a specific location and depth
   */
  async predictSoilProperties(
    lat: number,
    lon: number,
    depth: string,
    includeMIR = false
  ): Promise<SoilProfile> {
    const request: SoilPredictionRequest = {
      coordinates: [lat, lon],
      depth,
      include_mir: includeMIR,
    }

    const response = await this.client.post<SoilPredictionResponse>(
      '/predict/soil-properties',
      request
    )

    return response.data.data
  }

  /**
   * Query SSURGO soil survey data for a bounding box
   */
  async getSoilSurveyData(
    west: number,
    south: number,
    east: number,
    north: number,
    attributes?: string[]
  ): Promise<any> {
    const request: SSURGOQueryRequest = {
      bbox: [west, south, east, north],
      attributes,
    }

    const response = await this.client.post('/ssurgo/query', request)
    return response.data
  }

  /**
   * Get MIR spectroscopy analysis for a location
   */
  async getMIRAnalysis(
    lat: number,
    lon: number,
    spectrumData?: number[]
  ): Promise<MIRAnalysisResponse> {
    const request: MIRAnalysisRequest = {
      coordinates: [lat, lon],
      spectrum_data: spectrumData,
    }

    const response = await this.client.post<MIRAnalysisResponse>(
      '/mir/analyze',
      request
    )
    return response.data
  }

  /**
   * Get soil properties for multiple depths at once
   */
  async getSoilProfileByDepth(
    lat: number,
    lon: number,
    depths: string[]
  ): Promise<SoilProfile[]> {
    const requests = depths.map((depth) =>
      this.predictSoilProperties(lat, lon, depth)
    )
    return Promise.all(requests)
  }

  /**
   * Health check for the API
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health')
      return response.status === 200
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const SoilAPI = new SoilAPIClient()
