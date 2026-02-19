// Concentrated Flow / Gully Erosion Risk Component - GEE Analysis

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Droplets, AlertTriangle, Info } from 'lucide-react'
import type { EnhancedFieldData } from '#hooks/useComprehensiveFieldAssessment'

interface ConcentratedFlowProps {
  fieldId: string
  geeData?: EnhancedFieldData | null
}

export default function ConcentratedFlowAnalysis({ fieldId, geeData }: ConcentratedFlowProps) {
  const [flowData, setFlowData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadFlowData = useCallback(async () => {
    setLoading(true)
    try {
      if (geeData?.geeAssessment?.concentrated_flow) {
        const flow = geeData.geeAssessment.concentrated_flow
        
        setFlowData({
          channelDensity: flow.flow_metrics.channel_density_m_per_ha,
          gullyRiskPct: flow.flow_metrics.high_gully_risk_pct,
          convergentAreaPct: flow.flow_metrics.convergent_area_pct,
          spiMean: flow.spi_stats.mean,
          spiMax: flow.spi_stats.max,
          spiP90: flow.spi_stats.p90,
          twiMean: flow.twi_stats.mean,
          twiP90: flow.twi_stats.p90,
          methodology: flow.methodology || '',
          visualization: flow.visualization,
          hasData: true,
        })
      } else {
        // Try session storage
        const stored = sessionStorage.getItem('comprehensiveFieldAssessment')
        if (stored) {
          const parsed = JSON.parse(stored) as EnhancedFieldData
          if (parsed.geeAssessment?.concentrated_flow) {
            const flow = parsed.geeAssessment.concentrated_flow
            
            setFlowData({
              channelDensity: flow.flow_metrics.channel_density_m_per_ha,
              gullyRiskPct: flow.flow_metrics.high_gully_risk_pct,
              convergentAreaPct: flow.flow_metrics.convergent_area_pct,
              spiMean: flow.spi_stats.mean,
              spiMax: flow.spi_stats.max,
              spiP90: flow.spi_stats.p90,
              twiMean: flow.twi_stats.mean,
              twiP90: flow.twi_stats.p90,
              methodology: flow.methodology || '',
              visualization: flow.visualization,
              hasData: true,
            })
            return
          }
        }
        
        setFlowData({ hasData: false })
      }
    } catch (error) {
      console.error('Error loading concentrated flow data:', error)
      setFlowData({ hasData: false })
    } finally {
      setLoading(false)
    }
  }, [fieldId, geeData])

  useEffect(() => {
    loadFlowData()
  }, [loadFlowData])

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 mx-auto mb-2" style={{ border: '2px solid #e5e7eb', borderTopColor: '#06b6d4' }}></div>
        <p className="text-sm text-gray-600">Analyzing flow patterns...</p>
      </div>
    )
  }

  if (!flowData?.hasData) {
    return (
      <div className="text-center py-8">
        <Droplets className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">Flow analysis data not available</p>
        <p className="text-xs text-gray-500 mt-1">Select a field to analyze</p>
      </div>
    )
  }

  const getGullyRiskRating = (pct: number) => {
    if (pct < 5) return { label: 'Low', color: '#166534', bg: '#dcfce7' }
    if (pct < 10) return { label: 'Moderate', color: '#92400e', bg: '#fef3c7' }
    if (pct < 20) return { label: 'High', color: '#ea580c', bg: '#ffedd5' }
    return { label: 'Severe', color: '#991b1b', bg: '#fee2e2' }
  }

  const gullyRating = getGullyRiskRating(flowData.gullyRiskPct)

  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="flex items-start gap-2 p-2 rounded" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <Info className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: '#2563eb' }} />
        <p className="text-xs" style={{ color: '#1e40af' }}>
          {flowData.methodology || 'Stream Power Index (SPI) and terrain convergence analysis'}
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg text-center" style={{ backgroundColor: gullyRating.bg, border: `2px solid ${gullyRating.color}` }}>
          <div className="text-xs text-gray-700 mb-1">Gully Risk Area</div>
          <div className="text-3xl font-bold mb-1" style={{ color: gullyRating.color }}>
            {flowData.gullyRiskPct.toFixed(1)}%
          </div>
          <div className="text-xs font-semibold" style={{ color: gullyRating.color }}>
            {gullyRating.label}
          </div>
        </div>

        <div className="p-3 rounded-lg text-center" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <div className="text-xs text-gray-700 mb-1">Channel Density</div>
          <div className="text-3xl font-bold mb-1" style={{ color: '#166534' }}>
            {flowData.channelDensity.toFixed(1)}
          </div>
          <div className="text-xs text-gray-600">m/ha</div>
        </div>
      </div>

      {/* Flow Concentration Metrics */}
      <div className="p-3 rounded-lg" style={{ backgroundColor: '#fafafa', border: '1px solid #e5e7eb' }}>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Flow Concentration</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-700">Convergent flow areas</span>
            <span className="font-medium text-gray-900">{flowData.convergentAreaPct.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(flowData.convergentAreaPct, 100)}%`,
                backgroundColor: flowData.convergentAreaPct > 20 ? '#f97316' : flowData.convergentAreaPct > 10 ? '#fbbf24' : '#60a5fa'
              }}
            />
          </div>
        </div>
      </div>

      {/* Stream Power Index Stats */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Stream Power Index</h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded bg-gray-50 border border-gray-200">
            <div className="text-xs text-gray-600">Mean</div>
            <div className="text-lg font-bold text-gray-900">{flowData.spiMean.toFixed(2)}</div>
          </div>
          <div className="p-2 rounded bg-gray-50 border border-gray-200">
            <div className="text-xs text-gray-600">Max</div>
            <div className="text-lg font-bold text-gray-900">{flowData.spiMax.toFixed(2)}</div>
          </div>
          <div className="p-2 rounded bg-gray-50 border border-gray-200">
            <div className="text-xs text-gray-600">90th %</div>
            <div className="text-lg font-bold text-gray-900">{flowData.spiP90.toFixed(2)}</div>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Higher SPI values indicate greater flow energy and erosive potential
        </p>
      </div>

      {/* High Risk Alert */}
      {flowData.gullyRiskPct > 10 && (
        <div className="flex items-start gap-2 p-3 rounded" style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca' }}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: '#991b1b' }} />
          <div>
            <div className="text-sm font-semibold" style={{ color: '#991b1b' }}>
              High Gully Risk Detected
            </div>
            <div className="text-xs" style={{ color: '#991b1b' }}>
              {flowData.gullyRiskPct.toFixed(1)}% of field has concentrated flow potential
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="p-3 rounded-lg" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
        <h4 className="text-sm font-semibold mb-2" style={{ color: '#92400e' }}>Management Recommendations</h4>
        <ul className="text-xs space-y-1" style={{ color: '#92400e' }}>
          {flowData.gullyRiskPct > 15 && (
            <>
              <li>• Priority for grassed waterways in high-risk flow paths</li>
              <li>• Consider diversions to redirect concentrated flow</li>
            </>
          )}
          {flowData.gullyRiskPct > 10 && flowData.gullyRiskPct <= 15 && (
            <>
              <li>• Design water management structures for moderate flow risk areas</li>
              <li>• Monitor for channel development</li>
            </>
          )}
          {flowData.channelDensity > 3 && (
            <li>• High channel density - evaluate existing drainage patterns</li>
          )}
          {flowData.convergentAreaPct > 20 && (
            <li>• Significant flow convergence - target critical areas for stabilization</li>
          )}
          {flowData.gullyRiskPct < 5 && (
            <li>• Low gully risk - maintain current management</li>
          )}
        </ul>
      </div>
    </div>
  )
}
