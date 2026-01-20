// SVI (Soil Vulnerability Index) Analysis Component - GEE-based assessment

'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Shield, TrendingUp, Info } from 'lucide-react'
import type { EnhancedFieldData } from '#hooks/useComprehensiveFieldAssessment'

interface SVIAnalysisProps {
  fieldId: string
  geeData?: EnhancedFieldData | null
}

export default function SVIAnalysis({ fieldId, geeData }: SVIAnalysisProps) {
  const [sviData, setSviData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSVIData()
  }, [fieldId, geeData])

  const loadSVIData = async () => {
    setLoading(true)
    try {
      if (geeData?.geeAssessment?.svi) {
        const svi = geeData.geeAssessment.svi
        const combined = geeData.combined.svi
        
        setSviData({
          surfaceLossMean: combined.surface_loss_mean || 0,
          subsurfaceDrainedMean: combined.subsurface_drained_mean || 0,
          surfaceLossHighPct: svi.svi_metrics.surface_loss_high_pct || 0,
          subsurfaceDrainedHighPct: svi.svi_metrics.subsurface_drained_high_pct || 0,
          subsurfaceUndrainedMean: svi.svi_metrics.subsurface_undrained_mean || 0,
          subsurfaceUndrainedHighPct: svi.svi_metrics.subsurface_undrained_high_pct || 0,
          methodology: svi.methodology || '',
          visualization: svi.visualization,
          hasData: true,
        })
      } else {
        // Try session storage
        const stored = sessionStorage.getItem('comprehensiveFieldAssessment')
        if (stored) {
          const parsed = JSON.parse(stored) as EnhancedFieldData
          if (parsed.geeAssessment?.svi) {
            const svi = parsed.geeAssessment.svi
            const combined = parsed.combined.svi
            
            setSviData({
              surfaceLossMean: combined.surface_loss_mean || 0,
              subsurfaceDrainedMean: combined.subsurface_drained_mean || 0,
              surfaceLossHighPct: svi.svi_metrics.surface_loss_high_pct || 0,
              subsurfaceDrainedHighPct: svi.svi_metrics.subsurface_drained_high_pct || 0,
              subsurfaceUndrainedMean: svi.svi_metrics.subsurface_undrained_mean || 0,
              subsurfaceUndrainedHighPct: svi.svi_metrics.subsurface_undrained_high_pct || 0,
              methodology: svi.methodology || '',
              visualization: svi.visualization,
              hasData: true,
            })
            return
          }
        }
        
        // No data available
        setSviData({ hasData: false })
      }
    } catch (error) {
      console.error('Error loading SVI data:', error)
      setSviData({ hasData: false })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 mx-auto mb-2" style={{ border: '2px solid #e5e7eb', borderTopColor: '#10b981' }}></div>
        <p className="text-sm text-gray-600">Analyzing soil vulnerability...</p>
      </div>
    )
  }

  if (!sviData?.hasData) {
    return (
      <div className="text-center py-8">
        <Shield className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">SVI data not available</p>
        <p className="text-xs text-gray-500 mt-1">Select a field to analyze</p>
      </div>
    )
  }

  const getSVIRating = (svi: number) => {
    if (svi < 3) return { label: 'Low', color: '#166534', bg: '#dcfce7' }
    if (svi < 5) return { label: 'Moderate', color: '#92400e', bg: '#fef3c7' }
    if (svi < 7) return { label: 'High', color: '#ea580c', bg: '#ffedd5' }
    return { label: 'Very High', color: '#991b1b', bg: '#fee2e2' }
  }

  const sviRating = getSVIRating(sviData.surfaceLossMean)

  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="flex items-start gap-2 p-2 rounded" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <Info className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: '#2563eb' }} />
        <p className="text-xs" style={{ color: '#1e40af' }}>
          {sviData.methodology || 'SVI = Soil Vulnerability Index based on erosion susceptibility'}
        </p>
      </div>

      {/* Main SVI Scores */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg text-center" style={{ backgroundColor: sviRating.bg, border: `2px solid ${sviRating.color}` }}>
          <div className="text-xs text-gray-700 mb-1">Surface Loss</div>
          <div className="text-3xl font-bold mb-1" style={{ color: sviRating.color }}>
            {sviData.surfaceLossMean.toFixed(1)}
          </div>
          <div className="text-xs font-semibold" style={{ color: sviRating.color }}>
            {sviRating.label} Risk
          </div>
        </div>
        
        <div className="p-3 rounded-lg text-center" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <div className="text-xs text-gray-700 mb-1">Subsurface (Drained)</div>
          <div className="text-3xl font-bold mb-1" style={{ color: '#166534' }}>
            {sviData.subsurfaceDrainedMean.toFixed(1)}
          </div>
        </div>
      </div>

      {/* High Risk Areas */}
      <div className="space-y-2">
        {sviData.surfaceLossHighPct > 0 && (
          <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca' }}>
            <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#991b1b' }} />
            <div className="text-xs" style={{ color: '#991b1b' }}>
              <span className="font-semibold">{sviData.surfaceLossHighPct.toFixed(1)}%</span> high surface erosion risk
            </div>
          </div>
        )}
        
        {sviData.subsurfaceDrainedHighPct > 0 && (
          <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}>
            <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#92400e' }} />
            <div className="text-xs" style={{ color: '#92400e' }}>
              <span className="font-semibold">{sviData.subsurfaceDrainedHighPct.toFixed(1)}%</span> high subsurface risk (drained)
            </div>
          </div>
        )}
      </div>

      {/* SVI Metrics Detail */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Vulnerability Metrics</h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-700">Surface Erosion Loss</span>
              <span className="text-xs font-medium text-gray-900">{sviData.surfaceLossMean.toFixed(2)}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min((sviData.surfaceLossMean / 10) * 100, 100)}%`,
                  backgroundColor: sviData.surfaceLossMean > 5 ? '#f97316' : sviData.surfaceLossMean > 3 ? '#fbbf24' : '#22c55e'
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-700">Subsurface (Drained)</span>
              <span className="text-xs font-medium text-gray-900">{sviData.subsurfaceDrainedMean.toFixed(2)}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min((sviData.subsurfaceDrainedMean / 10) * 100, 100)}%`,
                  backgroundColor: '#22c55e'
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-700">Subsurface (Undrained)</span>
              <span className="text-xs font-medium text-gray-900">{sviData.subsurfaceUndrainedMean.toFixed(2)}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min((sviData.subsurfaceUndrainedMean / 10) * 100, 100)}%`,
                  backgroundColor: sviData.subsurfaceUndrainedMean > 5 ? '#fbbf24' : '#22c55e'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Risk Interpretation */}
      <div className="p-3 rounded-lg" style={{ backgroundColor: '#fafafa', border: '1px solid #e5e7eb' }}>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Risk Factors</h4>
        <div className="space-y-1 text-xs text-gray-700">
          {sviData.surfaceLossMean > 5 && (
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5 text-orange-600" />
              <span>High surface erosion vulnerability - implement conservation practices</span>
            </div>
          )}
          {sviData.surfaceLossHighPct > 20 && (
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5 text-orange-600" />
              <span>Large portion of field at high risk - priority for intervention</span>
            </div>
          )}
          {sviData.subsurfaceUndrainedMean > 5 && (
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5 text-orange-600" />
              <span>Subsurface loss risk in undrained conditions</span>
            </div>
          )}
          {sviData.surfaceLossMean < 3 && sviData.subsurfaceDrainedMean < 3 && (
            <div className="flex items-start gap-2">
              <Shield className="w-3 h-3 flex-shrink-0 mt-0.5 text-green-600" />
              <span>Low overall vulnerability - maintain current practices</span>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="p-3 rounded-lg" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
        <h4 className="text-sm font-semibold mb-2" style={{ color: '#92400e' }}>Management Recommendations</h4>
        <ul className="text-xs space-y-1" style={{ color: '#92400e' }}>
          {sviData.surfaceLossMean >= 5 && (
            <>
              <li>• High surface loss risk - priority for erosion control practices</li>
              <li>• Consider terracing, contour farming, or buffer strips</li>
            </>
          )}
          {sviData.surfaceLossMean >= 7 && (
            <li>• Critical vulnerability - immediate conservation action required</li>
          )}
          {sviData.subsurfaceUndrainedMean > 5 && (
            <li>• Evaluate drainage system to reduce subsurface vulnerability</li>
          )}
          {sviData.surfaceLossMean < 3 && (
            <li>• Maintain current management practices</li>
          )}
        </ul>
      </div>
    </div>
  )
}
