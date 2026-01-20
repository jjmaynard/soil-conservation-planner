// Productivity Analysis Component - GEE NDVI-based productivity assessment

'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, BarChart3, Info } from 'lucide-react'
import type { EnhancedFieldData } from '#hooks/useComprehensiveFieldAssessment'

interface ProductivityAnalysisProps {
  fieldId: string
  geeData?: EnhancedFieldData | null
}

export default function ProductivityAnalysis({ fieldId, geeData }: ProductivityAnalysisProps) {
  const [productivityData, setProductivityData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProductivityData()
  }, [fieldId, geeData])

  const loadProductivityData = async () => {
    setLoading(true)
    try {
      if (geeData?.geeAssessment?.productivity) {
        const prod = geeData.geeAssessment.productivity
        const combined = geeData.combined.productivity
        
        setProductivityData({
          ndviPeakMean: combined.ndvi_peak_mean || 0,
          yieldGap: combined.yield_gap_pct || 0,
          stability: combined.stability_cv || 0,
          p75Gap: prod.yield_gap.p75_gap_pct || 0,
          p90Gap: prod.yield_gap.p90_gap_pct || 0,
          ndviStd: prod.productivity_metrics.ndvi_peak_std || 0,
          visualization: prod.visualization,
          hasData: true,
        })
      } else {
        // Try session storage
        const stored = sessionStorage.getItem('comprehensiveFieldAssessment')
        if (stored) {
          const parsed = JSON.parse(stored) as EnhancedFieldData
          if (parsed.geeAssessment?.productivity) {
            const prod = parsed.geeAssessment.productivity
            const combined = parsed.combined.productivity
            
            setProductivityData({
              ndviPeakMean: combined.ndvi_peak_mean || 0,
              yieldGap: combined.yield_gap_pct || 0,
              stability: combined.stability_cv || 0,
              p75Gap: prod.yield_gap.p75_gap_pct || 0,
              p90Gap: prod.yield_gap.p90_gap_pct || 0,
              ndviStd: prod.productivity_metrics.ndvi_peak_std || 0,
              visualization: prod.visualization,
              hasData: true,
            })
            return
          }
        }
        
        // No data available
        setProductivityData({ hasData: false })
      }
    } catch (error) {
      console.error('Error loading productivity data:', error)
      setProductivityData({ hasData: false })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 mx-auto mb-2" style={{ border: '2px solid #e5e7eb', borderTopColor: '#10b981' }}></div>
        <p className="text-sm text-gray-600">Analyzing productivity...</p>
      </div>
    )
  }

  if (!productivityData?.hasData) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">Productivity data not available</p>
        <p className="text-xs text-gray-500 mt-1">Select a field to analyze</p>
      </div>
    )
  }

  const getYieldGapColor = (gap: number) => {
    if (gap < 10) return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' }
    if (gap < 20) return { bg: '#fef3c7', text: '#92400e', border: '#fde68a' }
    return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' }
  }

  const gapColors = getYieldGapColor(productivityData.yieldGap)

  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="flex items-start gap-2 p-2 rounded" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <Info className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: '#2563eb' }} />
        <p className="text-xs" style={{ color: '#1e40af' }}>
          Multi-year NDVI analysis from Landsat 8 (peak growing season)
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <div className="text-xs text-gray-600 mb-1">Peak NDVI</div>
          <div className="text-2xl font-bold" style={{ color: '#166534' }}>
            {productivityData.ndviPeakMean.toFixed(3)}
          </div>
          <div className="text-xs text-gray-500 mt-1">±{productivityData.ndviStd.toFixed(3)}</div>
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: gapColors.bg, border: `1px solid ${gapColors.border}` }}>
          <div className="text-xs text-gray-600 mb-1">Yield Gap</div>
          <div className="text-2xl font-bold" style={{ color: gapColors.text }}>
            {productivityData.yieldGap.toFixed(1)}%
          </div>
          <div className="text-xs" style={{ color: gapColors.text }}>vs. field potential</div>
        </div>
      </div>

      {/* Stability Indicator */}
      <div className="p-3 rounded-lg" style={{ backgroundColor: '#fafafa', border: '1px solid #e5e7eb' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Productivity Stability</span>
          <span className="text-sm font-bold text-gray-900">{(productivityData.stability * 100).toFixed(1)}% CV</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(productivityData.stability * 200, 100)}%`,
              backgroundColor: productivityData.stability < 0.15 ? '#10b981' : productivityData.stability < 0.25 ? '#fbbf24' : '#f97316'
            }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {productivityData.stability < 0.15 ? 'High stability' : productivityData.stability < 0.25 ? 'Moderate stability' : 'Variable productivity'}
        </p>
      </div>

      {/* Yield Gap Distribution */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Yield Gap Distribution</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-700">Average (mean)</span>
            <span className="font-medium text-gray-900">{productivityData.yieldGap.toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-700">75th percentile</span>
            <span className="font-medium text-gray-900">{productivityData.p75Gap.toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-700">90th percentile (worst areas)</span>
            <span className="font-medium text-gray-900">{productivityData.p90Gap.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="p-3 rounded-lg" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
        <h4 className="text-sm font-semibold mb-2" style={{ color: '#92400e' }}>Recommendations</h4>
        <ul className="text-xs space-y-1" style={{ color: '#92400e' }}>
          {productivityData.yieldGap > 15 && (
            <li>• Significant yield gap detected - investigate limiting factors</li>
          )}
          {productivityData.stability > 0.25 && (
            <li>• High variability - consider zone management</li>
          )}
          {productivityData.p90Gap > 25 && (
            <li>• Some areas severely underperforming - targeted intervention recommended</li>
          )}
          {productivityData.yieldGap < 10 && (
            <li>• Field performing near potential - maintain current practices</li>
          )}
        </ul>
      </div>
    </div>
  )
}
