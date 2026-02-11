// Erosion Analysis Component - RUSLE2-based erosion risk with real SSURGO and GEE data

'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, TrendingDown, TrendingUp, Info } from 'lucide-react'
import type { ProcessedFieldData } from '#hooks/useFieldSSURGO'
import type { EnhancedFieldData } from '#hooks/useComprehensiveFieldAssessment'

interface ErosionAnalysisProps {
  fieldId: string
  ssurgoData?: ProcessedFieldData | null
  geeData?: EnhancedFieldData | null
}

export default function ErosionAnalysis({ fieldId, ssurgoData, geeData }: ErosionAnalysisProps) {
  const [erosionData, setErosionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadErosionData()
  }, [fieldId, ssurgoData, geeData])

  const loadErosionData = async () => {
    setLoading(true)
    try {
      // Prefer GEE comprehensive data if available
      if (geeData?.geeAssessment) {
        const geeErosion = geeData.geeAssessment.erosion_risk
        const combined = geeData.combined.erosion
        const stats = geeErosion.statistics
        
        setErosionData({
          avgErosion: stats.mean_risk, // Risk index (0-10 scale)
          minErosion: stats.min_risk,
          maxErosion: stats.max_risk,
          stdDev: stats.std_dev,
          riskLevel: combined.combined_risk,
          isIndex: true, // Flag to indicate this is an index, not T/A/Y
          meanTValue: stats.mean_t_value, // Actual T value from SSURGO
          areas: [
            {
              risk: 'Low',
              acres: 0,
              percent: 100 - combined.high_risk_area_pct,
              color: '#dcfce7',
              textColor: '#166534',
            },
            {
              risk: 'High',
              acres: 0,
              percent: combined.high_risk_area_pct,
              color: '#fee2e2',
              textColor: '#991b1b',
            },
          ].filter(a => a.percent > 0),
          factors: {
            slope: `${stats.mean_slope_pct?.toFixed(1) || 0}%`,
            kFactor: stats.mean_k_factor?.toFixed(3) || '0.000',
            spi: stats.mean_spi?.toFixed(1) || '0.0',
            runoffFactor: stats.mean_runoff_factor?.toFixed(2) || '0.00',
          },
          methodology: geeErosion.methodology,
          dataSource: 'GEE Terrain Analysis (Risk Index)',
          visualization: {
            erosionRisk: geeErosion.visualization.tile_url,
            slope: geeErosion.visualization.slope_tile_url,
            kFactor: geeErosion.visualization.k_factor_tile_url,
            spi: geeErosion.visualization.spi_tile_url,
            runoff: geeErosion.visualization.runoff_tile_url,
            tValue: geeErosion.visualization.t_value_tile_url,
            thumbnail: geeErosion.visualization.thumbnail_url,
            description: geeErosion.visualization.description,
          },
        })
      } else if (ssurgoData?.erosion) {
        // Use SSURGO data if available
        setErosionData({
          ...ssurgoData.erosion,
          areas: ssurgoData.erosion.areas.filter(a => a.acres > 0),
          dataSource: 'SSURGO Soil Data',
        })
      } else {
        // Try session storage
        const storedData = sessionStorage.getItem('comprehensiveFieldAssessment')
        if (storedData) {
          const parsed = JSON.parse(storedData) as EnhancedFieldData
          if (parsed.geeAssessment) {
            const geeErosion = parsed.geeAssessment.erosion_risk
            const combined = parsed.combined.erosion
            const stats = geeErosion.statistics
            
            setErosionData({
              avgErosion: stats.mean_risk, // Risk index (0-10 scale)
              minErosion: stats.min_risk,
              maxErosion: stats.max_risk,
              stdDev: stats.std_dev,
              riskLevel: combined.combined_risk,
              isIndex: true,
              meanTValue: stats.mean_t_value,
              areas: [
                {
                  risk: 'Low',
                  acres: 0,
                  percent: 100 - combined.high_risk_area_pct,
                  color: '#dcfce7',
                  textColor: '#166534',
                },
                {
                  risk: 'High',
                  acres: 0,
                  percent: combined.high_risk_area_pct,
                  color: '#fee2e2',
                  textColor: '#991b1b',
                },
              ].filter(a => a.percent > 0),
              factors: {
                slope: `${stats.mean_slope_pct?.toFixed(1) || 0}%`,
                kFactor: stats.mean_k_factor?.toFixed(3) || '0.000',
                spi: stats.mean_spi?.toFixed(1) || '0.0',
                runoffFactor: stats.mean_runoff_factor?.toFixed(2) || '0.00',
              },
              methodology: geeErosion.methodology,
              dataSource: 'GEE Terrain Analysis (Risk Index)',
              visualization: {
                erosionRisk: geeErosion.visualization.tile_url,
                slope: geeErosion.visualization.slope_tile_url,
                kFactor: geeErosion.visualization.k_factor_tile_url,
                spi: geeErosion.visualization.spi_tile_url,
                runoff: geeErosion.visualization.runoff_tile_url,
                tValue: geeErosion.visualization.t_value_tile_url,
                thumbnail: geeErosion.visualization.thumbnail_url,
                description: geeErosion.visualization.description,
              },
            })
            return
          }
        }
        
        // Fallback to placeholder data
        const mockData = {
          avgErosion: 0,
          maxErosion: 0,
          tolerable: 5.0,
          riskLevel: 'Unknown',
          areas: [],
          factors: {
            terrain: 'Unknown',
            soilK: 'Unknown',
            flowAccumulation: 'Unknown',
            hydrologicGroup: 'Unknown',
          },
          dataSource: 'No Data',
        }
        setErosionData(mockData)
      }
    } catch (error) {
      console.error('Error loading erosion data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 mx-auto mb-2" style={{ border: '2px solid #e5e7eb', borderTopColor: '#f97316' }}></div>
        <p className="text-sm text-gray-600">Calculating erosion risk...</p>
      </div>
    )
  }

  const isIndex = erosionData.isIndex
  const isHighRisk = isIndex 
    ? erosionData.avgErosion > 5.0  // For index: >5 is moderate-high risk
    : erosionData.avgErosion > (erosionData.tolerable || 5.0) // For T/A/Y: compare to T value

  return (
    <div className="space-y-4">
      {/* Data Source Indicator */}
      {erosionData.dataSource && (
        <div className="flex items-start gap-2 p-2 rounded" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <Info className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: '#2563eb' }} />
          <div className="flex-1">
            <p className="text-xs" style={{ color: '#1e40af' }}>
              <strong>Data source:</strong> {erosionData.dataSource}
            </p>
            {erosionData.methodology && (
              <p className="text-xs mt-1" style={{ color: '#1e40af' }}>
                <strong>Methodology:</strong> {erosionData.methodology}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      {isIndex ? (
        // Display as Risk Index (0-10 scale)
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg" style={{ backgroundColor: isHighRisk ? '#fee2e2' : '#dcfce7', border: `1px solid ${isHighRisk ? '#fecaca' : '#bbf7d0'}` }}>
              <div className="text-xs text-gray-600 mb-1">Average Risk Score</div>
              <div className="text-2xl font-bold" style={{ color: isHighRisk ? '#991b1b' : '#166534' }}>
                {erosionData.avgErosion.toFixed(1)} <span className="text-sm font-normal">/ 10</span>
              </div>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }}>
              <div className="text-xs text-gray-600 mb-1">Risk Classification</div>
              <div className="text-lg font-bold text-gray-900">
                {erosionData.riskLevel || 'Unknown'}
              </div>
            </div>
          </div>

          {/* Additional Statistics for Index */}
          {(erosionData.minErosion !== undefined || erosionData.maxErosion !== undefined || erosionData.stdDev !== undefined || erosionData.meanTValue !== undefined) && (
            <div className="grid grid-cols-2 gap-2">
              {erosionData.minErosion !== undefined && (
                <div className="p-2 rounded border border-gray-200 bg-white">
                  <div className="text-xs text-gray-600">Min Risk</div>
                  <div className="text-base font-semibold text-gray-900">{erosionData.minErosion.toFixed(1)} / 10</div>
                </div>
              )}
              {erosionData.maxErosion !== undefined && (
                <div className="p-2 rounded border border-gray-200 bg-white">
                  <div className="text-xs text-gray-600">Max Risk</div>
                  <div className="text-base font-semibold text-gray-900">{erosionData.maxErosion.toFixed(1)} / 10</div>
                </div>
              )}
              {erosionData.stdDev !== undefined && (
                <div className="p-2 rounded border border-gray-200 bg-white">
                  <div className="text-xs text-gray-600">Std Deviation</div>
                  <div className="text-base font-semibold text-gray-900">{erosionData.stdDev.toFixed(2)}</div>
                </div>
              )}
              {erosionData.meanTValue !== undefined && erosionData.meanTValue > 0 && (
                <div className="p-2 rounded border border-gray-200 bg-white">
                  <div className="text-xs text-gray-600">Mean T Value</div>
                  <div className="text-base font-semibold text-gray-900">{erosionData.meanTValue.toFixed(1)} T/A/Y</div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        // Display as T/A/Y (SSURGO data)
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg" style={{ backgroundColor: isHighRisk ? '#fee2e2' : '#dcfce7', border: `1px solid ${isHighRisk ? '#fecaca' : '#bbf7d0'}` }}>
            <div className="text-xs text-gray-600 mb-1">Average Erosion</div>
            <div className="text-2xl font-bold" style={{ color: isHighRisk ? '#991b1b' : '#166534' }}>
              {erosionData.avgErosion.toFixed(1)} <span className="text-sm font-normal">T/A/Y</span>
            </div>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }}>
            <div className="text-xs text-gray-600 mb-1">Tolerable (T)</div>
            <div className="text-2xl font-bold text-gray-900">
              {erosionData.tolerable?.toFixed(1) || '5.0'} <span className="text-sm font-normal">T/A/Y</span>
            </div>
          </div>
        </div>
      )}

      {/* Status Alert */}
      {isHighRisk && (
        <div className="flex items-start gap-2 p-3 rounded-lg" style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#d97706' }} />
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: '#92400e' }}>Action Recommended</p>
            <p className="text-xs" style={{ color: '#92400e' }}>
              {isIndex 
                ? 'Elevated erosion risk detected. Consider implementing conservation practices.'
                : 'Average erosion exceeds soil tolerance. Consider implementing conservation practices.'
              }
            </p>
          </div>
        </div>
      )}

      {/* Risk Distribution */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Risk Distribution</h4>
        <div className="space-y-2">
          {erosionData.areas.map((area: any) => (
            <div key={area.risk}>
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: area.textColor }} />
                  <span className="font-medium text-gray-700">{area.risk} Risk</span>
                </div>
                <span className="text-gray-600">{area.acres.toFixed(1)} ac ({area.percent.toFixed(1)}%)</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${area.percent}%`,
                    backgroundColor: area.textColor
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contributing Factors */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Contributing Factors</h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(erosionData.factors).map(([factor, level]: [string, any]) => {
            // Map factor keys to better labels
            const factorLabels: { [key: string]: string } = {
              slope: 'Slope',
              kFactor: 'K-Factor (Erodibility)',
              spi: 'Stream Power Index',
              runoffFactor: 'Runoff Factor',
              terrain: 'Terrain',
              soilK: 'Soil K-Factor',
              flowAccumulation: 'Flow Accumulation',
              hydrologicGroup: 'Hydrologic Group',
              rainfall: 'Rainfall',
              coverManagement: 'Cover Management',
            }
            
            return (
              <div key={factor} className="p-2 rounded border border-gray-200 bg-white">
                <div className="text-xs text-gray-600">
                  {factorLabels[factor] || factor.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="text-sm font-semibold text-gray-900">{level}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
