// Custom hook for fetching and managing soil data

'use client'

import { useCallback, useState } from 'react'

import type { MIRAnalysisResponse } from '#src/types/api'
import type { SoilDepth, SoilProfile } from '#src/types/soil'
import { SoilAPI } from '#src/utils/apiClient'

export function useSoilData() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentProfile, setCurrentProfile] = useState<SoilProfile | null>(null)

  const fetchSoilProfile = useCallback(
    async (lat: number, lon: number, depth?: SoilDepth): Promise<SoilProfile> => {
      setLoading(true)
      setError(null)

      try {
        const profile = await SoilAPI.predictSoilProperties(lat, lon, depth || '0-5cm', true)
        setCurrentProfile(profile)
        return profile
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch soil data'
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const fetchMIRData = useCallback(async (lat: number, lon: number): Promise<MIRAnalysisResponse | null> => {
    try {
      return await SoilAPI.getMIRAnalysis(lat, lon)
    } catch (err) {
      console.error('MIR analysis failed:', err)
      return null
    }
  }, [])

  const fetchMultipleDepths = useCallback(
    async (lat: number, lon: number, depths: string[]): Promise<SoilProfile[]> => {
      setLoading(true)
      setError(null)

      try {
        const profiles = await SoilAPI.getSoilProfileByDepth(lat, lon, depths)
        return profiles
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch soil profiles'
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearProfile = useCallback(() => {
    setCurrentProfile(null)
  }, [])

  return {
    fetchSoilProfile,
    fetchMIRData,
    fetchMultipleDepths,
    clearError,
    clearProfile,
    loading,
    error,
    currentProfile,
  }
}
