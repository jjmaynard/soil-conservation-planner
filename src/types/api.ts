// API response type definitions

import type { SoilProfile } from './soil'

export interface APIResponse<T> {
  success: boolean
  data: T
  error?: string
  message?: string
}

export interface SoilPredictionRequest {
  coordinates: [number, number]
  depth: string
  include_mir?: boolean
}

export interface SoilPredictionResponse extends APIResponse<SoilProfile> {
  processing_time_ms: number
  model_version: string
}

export interface SSURGOQueryRequest {
  bbox: [number, number, number, number] // [west, south, east, north]
  attributes?: string[]
}

export interface MIRAnalysisRequest {
  coordinates: [number, number]
  spectrum_data?: number[]
}

export interface MIRAnalysisResponse {
  andic_properties: boolean
  prediction_confidence: number
  spectral_features: {
    [key: string]: number
  }
  recommended_tests: string[]
}
