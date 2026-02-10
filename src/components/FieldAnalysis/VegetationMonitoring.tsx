// Vegetation Monitoring Component - NDVI Time Series and Productivity Analysis

'use client'

import { TrendingUp, TrendingDown, Activity, Info } from 'lucide-react'
import type { EnhancedFieldData } from '#hooks/useComprehensiveFieldAssessment'

interface VegetationMonitoringProps {
  fieldId?: string
  geeData: EnhancedFieldData | null
}

export default function VegetationMonitoring({ fieldId, geeData }: VegetationMonitoringProps) {
  if (!geeData?.geeAssessment) {
    return (
      <div className="text-center py-8">
        <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-sm text-gray-600">No vegetation data available</p>
        <p className="text-xs text-gray-500 mt-1">GEE assessment required</p>
      </div>
    )
  }

  const productivity = geeData.geeAssessment.productivity
  const stability = geeData.geeAssessment.soil_quality.productivity_stability
  
  // Add defensive null checks for all metrics
  const ndviMean = productivity?.productivity_metrics?.ndvi_peak_mean ?? 0
  const ndviStd = productivity?.productivity_metrics?.ndvi_peak_std ?? 0
  const ndviCV = stability?.ndvi_peak_cv ?? 0
  const yearsAnalyzed = stability?.years_analyzed ?? 0
  
  const yieldGapMean = productivity?.yield_gap?.mean_gap_pct ?? 0
  const yieldGapP75 = productivity?.yield_gap?.p75_gap_pct ?? 0
  const yieldGapP90 = productivity?.yield_gap?.p90_gap_pct ?? 0

  // Classify productivity stability
  const getStabilityRating = (cv: number) => {
    if (cv < 0.1) return { label: 'Excellent', color: '#16a34a', bg: '#dcfce7' }
    if (cv < 0.15) return { label: 'Good', color: '#65a30d', bg: '#ecfccb' }
    if (cv < 0.20) return { label: 'Fair', color: '#f59e0b', bg: '#fef3c7' }
    return { label: 'Poor', color: '#dc2626', bg: '#fee2e2' }
  }

  const stabilityRating = getStabilityRating(ndviCV)

  // Classify NDVI performance
  const getNDVIPerformance = (ndvi: number) => {
    if (ndvi > 0.7) return { label: 'Excellent', color: '#16a34a' }
    if (ndvi > 0.6) return { label: 'Good', color: '#65a30d' }
    if (ndvi > 0.5) return { label: 'Moderate', color: '#f59e0b' }
    if (ndvi > 0.4) return { label: 'Low', color: '#ea580c' }
    return { label: 'Very Low', color: '#dc2626' }
  }

  const ndviPerformance = getNDVIPerformance(ndviMean)

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac' }}>
        <div className="flex items-start gap-3">
          <Activity className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#16a34a' }} />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Vegetation Health Analysis</h3>
            <p className="text-sm text-gray-700">
              Multi-year NDVI productivity assessment based on {yearsAnalyzed} years of satellite imagery data.
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Average NDVI */}
        <div className="p-4 rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Peak NDVI</span>
            <span 
              className="text-xs font-semibold px-2 py-1 rounded"
              style={{ backgroundColor: `${ndviPerformance.color}22`, color: ndviPerformance.color }}
            >
              {ndviPerformance.label}
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {ndviMean.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">
            ± {ndviStd.toFixed(3)} std dev
          </div>
        </div>

        {/* Stability */}
        <div className="p-4 rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Stability</span>
            <span 
              className="text-xs font-semibold px-2 py-1 rounded"
              style={{ backgroundColor: stabilityRating.bg, color: stabilityRating.color }}
            >
              {stabilityRating.label}
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {(ndviCV * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">
            Coefficient of variation
          </div>
        </div>

        {/* Yield Gap */}
        <div className="p-4 rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Yield Gap</span>
            {yieldGapMean > 15 ? (
              <TrendingUp className="w-4 h-4 text-orange-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-green-600" />
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {yieldGapMean.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">
            Average underperformance
          </div>
        </div>
      </div>

      {/* Yield Gap Distribution */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Yield Gap Distribution</h4>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">Average (50th percentile)</span>
              <span className="font-semibold text-gray-900">{yieldGapMean.toFixed(1)}%</span>
            </div>
            <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-yellow-500 rounded-full"
                style={{ width: `${Math.min(yieldGapMean, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">75th percentile</span>
              <span className="font-semibold text-gray-900">{yieldGapP75.toFixed(1)}%</span>
            </div>
            <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                style={{ width: `${Math.min(yieldGapP75, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">90th percentile (worst areas)</span>
              <span className="font-semibold text-gray-900">{yieldGapP90.toFixed(1)}%</span>
            </div>
            <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                style={{ width: `${Math.min(yieldGapP90, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interpretation */}
      <div className="p-4 rounded-lg" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#2563eb' }} />
          <div className="flex-1 text-sm" style={{ color: '#1e40af' }}>
            <p className="font-medium mb-1">Vegetation Health Insights</p>
            <ul className="space-y-1 text-xs">
              <li>• NDVI values range from -1 to 1, with higher values indicating healthier, denser vegetation</li>
              <li>• Stability (CV) below 15% indicates consistent year-to-year productivity</li>
              <li>• Yield gap represents underperformance relative to field potential</li>
              <li>• High yield gaps may indicate soil variability, drainage issues, or nutrient deficiencies</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {(ndviCV > 0.15 || yieldGapMean > 15) && (
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}>
          <h4 className="text-sm font-semibold text-amber-900 mb-2">Management Recommendations</h4>
          <ul className="space-y-1 text-sm text-amber-800">
            {ndviCV > 0.15 && (
              <li>• <strong>Variable Productivity:</strong> Consider management zones to address field variability</li>
            )}
            {yieldGapMean > 20 && (
              <li>• <strong>Significant Yield Gap:</strong> Investigate limiting factors (nutrients, drainage, compaction)</li>
            )}
            {yieldGapMean > 15 && yieldGapMean <= 20 && (
              <li>• <strong>Moderate Yield Gap:</strong> Optimize inputs and practices to close productivity gaps</li>
            )}
            {yieldGapP90 > 30 && (
              <li>• <strong>Problem Areas:</strong> Target worst-performing zones (90th percentile) for soil testing and remediation</li>
            )}
          </ul>
        </div>
      )}

      {/* Data Source */}
      <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
        {productivity?.methodology && <p>Data Source: {productivity.methodology}</p>}
        <p>Satellite Data: Landsat 8/9 and Sentinel-2 (10-30m resolution)</p>
      </div>
    </div>
  )
}
