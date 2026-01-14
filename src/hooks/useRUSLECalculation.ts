// ============================================================================
// useRUSLECalculation Hook - v2.1.0 Unified Endpoint
// ============================================================================
// Simplified hook leveraging GEE API v2.1.0 unified RUSLE endpoint
// Reference: Property_Panel_Guide/gee-api-docs/nextjs-erosion-module/

import { useState, useCallback } from 'react'
import { geeApi } from '#lib/geeApiClient'
import type { RUSLECalculateRequest, RUSLEResponse } from '#types/geeApi'

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

  const compareScenarios = useCallback(
    async (
      geometry: string,
      startDate: string,
      endDate: string,
      baselinePractice: 'none' | 'contour' | 'strip_cropping' | 'terracing',
      proposedPractice: 'none' | 'contour' | 'strip_cropping' | 'terracing'
    ) => {
      // Calculate baseline scenario
      const baselineResult = await calculate({
        geometry,
        start_date: startDate,
        end_date: endDate,
        p_factor_params: { practice_type: baselinePractice },
      })

      // Calculate proposed scenario
      const proposedResult = await calculate({
        geometry,
        start_date: startDate,
        end_date: endDate,
        p_factor_params: { practice_type: proposedPractice },
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
        meets_t_value: !proposedResult.erosion_risk.exceeds_t_value,
      }
    },
    [calculate]
  )

  return {
    result,
    loading,
    error,
    calculate,
    compareScenarios,
    reset: () => {
      setResult(null)
      setError(null)
    },
  }
}

/**
 * Key Simplifications from v1:
 * ✅ No tier fallback logic needed (server handles this)
 * ✅ No SSURGO client dependency
 * ✅ No local C-factor calculation
 * ✅ No multi-step data fetching
 * ✅ 80% less code (~40 lines vs ~200 lines)
 */
