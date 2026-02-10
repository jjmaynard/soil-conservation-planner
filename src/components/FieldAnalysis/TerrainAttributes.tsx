// Terrain Attributes Component - Detailed Terrain Analysis with Charts

'use client'

import { Mountain, Wind, Droplets, TrendingUp, Info, AlertTriangle } from 'lucide-react'
import type { EnhancedFieldData } from '#hooks/useComprehensiveFieldAssessment'

interface TerrainAttributesProps {
  fieldId?: string
  geeData: EnhancedFieldData | null
}

export default function TerrainAttributes({ fieldId, geeData }: TerrainAttributesProps) {
  if (!geeData?.geeAssessment) {
    return (
      <div className="text-center py-8">
        <Mountain className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-sm text-gray-600">No terrain data available</p>
        <p className="text-xs text-gray-500 mt-1">GEE assessment required</p>
      </div>
    )
  }

  const erosion = geeData.geeAssessment.erosion_risk
  const flow = geeData.geeAssessment.concentrated_flow
  const ponding = geeData.geeAssessment.ponding

  // Erosion statistics with defensive null checks
  const meanSlope = erosion?.statistics?.mean_risk ?? 0
  const maxSlope = erosion?.statistics?.max_risk ?? 0
  const highRiskPct = erosion?.statistics?.high_risk_area_pct ?? 0

  // Flow metrics with defensive null checks
  const channelDensity = flow?.flow_metrics?.channel_density_m_per_ha ?? 0
  const convergentPct = flow?.flow_metrics?.convergent_area_pct ?? 0
  const gullyRiskPct = flow?.flow_metrics?.high_gully_risk_pct ?? 0

  // TWI (Topographic Wetness Index) with defensive null checks
  const twiMean = flow?.twi_stats?.mean ?? 0
  const twiP75 = flow?.twi_stats?.p75 ?? 0
  const twiP90 = flow?.twi_stats?.p90 ?? 0

  // SPI (Stream Power Index) with defensive null checks
  const spiMean = flow?.spi_stats?.mean ?? 0
  const spiMax = flow?.spi_stats?.max ?? 0
  const spiP90 = flow?.spi_stats?.p90 ?? 0
  const spiP95 = flow?.spi_stats?.p95 ?? 0

  // Ponding metrics with defensive null checks
  const depressionPct = ponding?.ponding_metrics?.depression_area_pct ?? 0
  const wetAreaPct = ponding?.ponding_metrics?.twi_above_12_pct ?? 0

  // Classification helpers
  const getChannelDensityClass = (density: number) => {
    if (density < 50) return { label: 'Low', color: '#16a34a', bg: '#dcfce7' }
    if (density < 100) return { label: 'Moderate', color: '#f59e0b', bg: '#fef3c7' }
    return { label: 'High', color: '#dc2626', bg: '#fee2e2' }
  }

  const getSlopeRiskClass = (pct: number) => {
    if (pct < 10) return { label: 'Low Risk', color: '#16a34a' }
    if (pct < 25) return { label: 'Moderate Risk', color: '#f59e0b' }
    return { label: 'High Risk', color: '#dc2626' }
  }

  const channelClass = getChannelDensityClass(channelDensity)
  const slopeRiskClass = getSlopeRiskClass(highRiskPct)

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac' }}>
        <div className="flex items-start gap-3">
          <Mountain className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#16a34a' }} />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Terrain Analysis</h3>
            <p className="text-sm text-gray-700">
              Comprehensive topographic assessment including slope, flow accumulation, and channel networks.
            </p>
          </div>
        </div>
      </div>

      {/* Slope Analysis */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Slope Profile
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-gray-200 bg-white">
            <div className="text-xs text-gray-600 mb-1">Average Slope</div>
            <div className="text-2xl font-bold text-gray-900">{meanSlope.toFixed(1)}%</div>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-white">
            <div className="text-xs text-gray-600 mb-1">Maximum Slope</div>
            <div className="text-2xl font-bold text-gray-900">{maxSlope.toFixed(1)}%</div>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-white">
            <div className="text-xs text-gray-600 mb-1">High Risk Area</div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-gray-900">{highRiskPct.toFixed(1)}%</div>
              <span 
                className="text-xs font-semibold px-2 py-0.5 rounded"
                style={{ backgroundColor: `${slopeRiskClass.color}22`, color: slopeRiskClass.color }}
              >
                {slopeRiskClass.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Flow Accumulation & Channel Network */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Wind className="w-4 h-4" />
          Concentrated Flow Analysis
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Channel Density</span>
              <span 
                className="text-xs font-semibold px-2 py-1 rounded"
                style={{ backgroundColor: channelClass.bg, color: channelClass.color }}
              >
                {channelClass.label}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {channelDensity.toFixed(0)}
            </div>
            <div className="text-xs text-gray-500">m/ha of flow channels</div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-white">
            <div className="text-sm font-medium text-gray-600 mb-2">Convergent Areas</div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {convergentPct.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">of field area</div>
          </div>
        </div>

        {/* Stream Power Index */}
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
          <div className="text-sm font-semibold text-blue-900 mb-3">Stream Power Index (SPI)</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <div className="text-xs text-blue-700">Mean</div>
              <div className="text-lg font-bold text-blue-900">{spiMean.toFixed(1)}</div>
            </div>
            <div>
              <div className="text-xs text-blue-700">Maximum</div>
              <div className="text-lg font-bold text-blue-900">{spiMax.toFixed(1)}</div>
            </div>
            <div>
              <div className="text-xs text-blue-700">90th %ile</div>
              <div className="text-lg font-bold text-blue-900">{spiP90.toFixed(1)}</div>
            </div>
            <div>
              <div className="text-xs text-blue-700">95th %ile</div>
              <div className="text-lg font-bold text-blue-900">{spiP95.toFixed(1)}</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-blue-700">
            Higher SPI values indicate greater erosive power of concentrated flow
          </div>
        </div>
      </div>

      {/* Topographic Wetness Index */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Droplets className="w-4 h-4" />
          Topographic Wetness Index (TWI)
        </h4>
        
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">Mean TWI</span>
              <span className="font-semibold text-gray-900">{twiMean.toFixed(1)}</span>
            </div>
            <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                style={{ width: `${Math.min((twiMean / 20) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">75th Percentile</span>
              <span className="font-semibold text-gray-900">{twiP75.toFixed(1)}</span>
            </div>
            <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"
                style={{ width: `${Math.min((twiP75 / 20) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">90th Percentile (wettest areas)</span>
              <span className="font-semibold text-gray-900">{twiP90.toFixed(1)}</span>
            </div>
            <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-blue-800 rounded-full"
                style={{ width: `${Math.min((twiP90 / 20) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="text-xs text-blue-700 mb-1">Depression Areas</div>
            <div className="text-xl font-bold text-blue-900">{depressionPct.toFixed(1)}%</div>
          </div>
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="text-xs text-blue-700 mb-1">Very Wet Areas (TWI &gt; 12)</div>
            <div className="text-xl font-bold text-blue-900">{wetAreaPct.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Gully Risk Assessment */}
      {gullyRiskPct > 5 && (
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca' }}>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#dc2626' }} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900 mb-1">High Gully Risk Detected</p>
              <p className="text-xs text-red-800">
                {gullyRiskPct.toFixed(1)}% of field shows high gully erosion risk due to concentrated flow patterns. 
                Consider installing grassed waterways or diversions in high-risk areas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 rounded-lg" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#2563eb' }} />
          <div className="flex-1 text-sm" style={{ color: '#1e40af' }}>
            <p className="font-medium mb-1">Terrain Metrics Explained</p>
            <ul className="space-y-1 text-xs">
              <li>• <strong>TWI:</strong> Predicts soil moisture patterns; higher values indicate wetter areas prone to saturation</li>
              <li>• <strong>SPI:</strong> Estimates erosive power of overland flow; channels with high SPI need protection</li>
              <li>• <strong>Channel Density:</strong> Length of flow channels per hectare; indicates drainage network complexity</li>
              <li>• <strong>Convergent Areas:</strong> Locations where multiple flow paths converge, increasing erosion risk</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Data Source */}
      <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
        {flow?.methodology && <p>Data Source: {flow.methodology}</p>}
        <p>DEM Resolution: 30m SRTM / 10m USGS 3DEP</p>
      </div>
    </div>
  )
}
