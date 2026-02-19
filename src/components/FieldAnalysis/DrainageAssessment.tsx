// Drainage Assessment Component with SSURGO and GEE data

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Droplet, AlertCircle, Info } from 'lucide-react'
import type { ProcessedFieldData } from '#hooks/useFieldSSURGO'
import type { EnhancedFieldData } from '#hooks/useComprehensiveFieldAssessment'

interface DrainageAssessmentProps {
  fieldId: string
  ssurgoData?: ProcessedFieldData | null
  geeData?: EnhancedFieldData | null
}

export default function DrainageAssessment({ fieldId, ssurgoData, geeData }: DrainageAssessmentProps) {
  const [drainageData, setDrainageData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadDrainageData = useCallback(async () => {
    setLoading(true)
    try {
      // Prefer GEE ponding data, supplement with SSURGO
      const hasPondingData = geeData?.geeAssessment?.ponding
      
      if (hasPondingData || ssurgoData?.drainage) {
        const combinedDrainage = geeData?.combined?.drainage
        const pondingMetrics = geeData?.geeAssessment?.ponding?.ponding_metrics
        const twiStats = geeData?.geeAssessment?.ponding?.twi_stats
        const pondingData = geeData?.geeAssessment?.ponding
        
        setDrainageData({
          // SSURGO drainage data
          hydricSoils: ssurgoData?.drainage?.hydricSoils || 0,
          hydricPercent: ssurgoData?.drainage?.hydricPercent || 0,
          drainageClasses: ssurgoData?.drainage?.drainageClasses?.filter(dc => dc.acres > 0) || [],
          
          // GEE ponding data
          depressionAreaPct: pondingMetrics?.depression_area_pct || 0,
          twiAbove12Pct: pondingMetrics?.twi_above_12_pct || 0,
          highPondingRiskPct: pondingMetrics?.high_ponding_risk_pct || combinedDrainage?.gee_ponding_risk_pct || 0,
          twiMean: twiStats?.mean || 0,
          twiP75: twiStats?.p75 || 0,
          twiP90: twiStats?.p90 || 0,
          
          methodology: pondingData?.methodology,
          
          hasGEEData: !!hasPondingData,
          hasSSURGOData: !!ssurgoData?.drainage,
          recommendations: generateRecommendations(ssurgoData?.drainage, combinedDrainage, pondingMetrics),
        })
      } else {
        // Try session storage
        const stored = sessionStorage.getItem('comprehensiveFieldAssessment')
        if (stored) {
          const parsed = JSON.parse(stored) as EnhancedFieldData
          const combinedDrainage = parsed.combined?.drainage
          const pondingMetrics = parsed.geeAssessment?.ponding?.ponding_metrics
          const twiStats = parsed.geeAssessment?.ponding?.twi_stats
          
          setDrainageData({
            hydricSoils: parsed.ssurgoData?.drainage?.hydricSoils || 0,
            hydricPercent: parsed.ssurgoData?.drainage?.hydricPercent || 0,
            drainageClasses: parsed.ssurgoData?.drainage?.drainageClasses?.filter(dc => dc.acres > 0) || [],
            
            depressionAreaPct: pondingMetrics?.depression_area_pct || 0,
            twiAbove12Pct: pondingMetrics?.twi_above_12_pct || 0,
            highPondingRiskPct: pondingMetrics?.high_ponding_risk_pct || combinedDrainage?.gee_ponding_risk_pct || 0,
            twiMean: twiStats?.mean || 0,
            twiP75: twiStats?.p75 || 0,
            twiP90: twiStats?.p90 || 0,
            
            methodology: parsed.geeAssessment?.ponding?.methodology,
            
            hasGEEData: !!parsed.geeAssessment?.ponding,
            hasSSURGOData: !!parsed.ssurgoData?.drainage,
            recommendations: generateRecommendations(parsed.ssurgoData?.drainage, combinedDrainage, pondingMetrics),
          })
          return
        }
        
        // Fallback to placeholder data
        const mockData = {
          hydricSoils: 0,
          hydricPercent: 0,
          drainageClasses: [],
          depressionAreaPct: 0,
          twiAbove12Pct: 0,
          highPondingRiskPct: 0,
          hasGEEData: false,
          hasSSURGOData: false,
          recommendations: ['No drainage data available. Draw or select a field to analyze.'],
        }
        setDrainageData(mockData)
      }
    } catch (error) {
      console.error('Error loading drainage data:', error)
    } finally {
      setLoading(false)
    }
  }, [fieldId, ssurgoData, geeData])

  useEffect(() => {
    loadDrainageData()
  }, [loadDrainageData])

  function generateRecommendations(drainage: any, combinedDrainage: any, pondingMetrics: any): string[] {
    const recs: string[] = []
    
    // GEE ponding data
    if (combinedDrainage?.gee_ponding_risk_pct > 10) {
      recs.push(`${combinedDrainage.gee_ponding_risk_pct.toFixed(1)}% of field has high ponding risk - priority for drainage improvement`)
    }
    
    if (pondingMetrics?.twi_above_12_pct > 15) {
      recs.push('Significant wet areas detected - consider tile drainage or water management')
    }
    
    // SSURGO drainage class data
    if (drainage?.hydricPercent > 20) {
      recs.push('Significant hydric soils present - monitor for wetland compliance')
    }
    
    const poorlyDrained = drainage?.drainageClasses?.find((dc: any) => 
      dc.class.toLowerCase().includes('poorly')
    )
    if (poorlyDrained && poorlyDrained.percent > 15) {
      recs.push('Consider tile drainage in poorly drained areas')
    }
    
    if (recs.length === 0) {
      recs.push('Drainage conditions are generally favorable')
    }
    
    recs.push('Monitor drainage system performance annually')
    
    return recs
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 mx-auto mb-2" style={{ border: '2px solid #e5e7eb', borderTopColor: '#06b6d4' }}></div>
        <p className="text-sm text-gray-600">Loading drainage data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Data Source Indicator */}
      {(drainageData.hasGEEData || drainageData.hasSSURGOData) && (
        <div className="flex items-start gap-2 p-2 rounded" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <Info className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: '#2563eb' }} />
          <div className="flex-1">
            <p className="text-xs" style={{ color: '#1e40af' }}>
              <strong>Data source:</strong> {drainageData.hasGEEData && drainageData.hasSSURGOData 
                ? 'GEE terrain analysis + SSURGO drainage classification'
                : drainageData.hasGEEData 
                  ? 'GEE terrain-based ponding analysis'
                  : 'SSURGO soil drainage classification'}
            </p>
            {drainageData.methodology && (
              <p className="text-xs mt-1" style={{ color: '#1e40af' }}>
                <strong>Methodology:</strong> {drainageData.methodology}
              </p>
            )}
          </div>
        </div>
      )}

      {/* GEE Ponding Metrics */}
      {drainageData.hasGEEData && (
        <>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-lg text-center" style={{ backgroundColor: drainageData.depressionAreaPct > 5 ? '#fee2e2' : '#f0fdf4', border: `1px solid ${drainageData.depressionAreaPct > 5 ? '#fecaca' : '#bbf7d0'}` }}>
              <div className="text-xs text-gray-600 mb-1">Depressions</div>
              <div className="text-lg font-bold" style={{ color: drainageData.depressionAreaPct > 5 ? '#991b1b' : '#166534' }}>
                {drainageData.depressionAreaPct.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400 mt-1" title="Uses strict ≥0.15m depth threshold. The Depressions map layer may show visually prominent low areas that fall below this depth cutoff.">≥0.15m depth</div>
            </div>
            <div className="p-2 rounded-lg text-center" style={{ backgroundColor: drainageData.twiAbove12Pct > 15 ? '#fef3c7' : '#f0fdf4', border: `1px solid ${drainageData.twiAbove12Pct > 15 ? '#fde68a' : '#bbf7d0'}` }}>
              <div className="text-xs text-gray-600 mb-1">High TWI</div>
              <div className="text-lg font-bold" style={{ color: drainageData.twiAbove12Pct > 15 ? '#92400e' : '#166534' }}>
                {drainageData.twiAbove12Pct.toFixed(1)}%
              </div>
            </div>
            <div className="p-2 rounded-lg text-center" style={{ backgroundColor: drainageData.highPondingRiskPct > 10 ? '#fee2e2' : '#f0fdf4', border: `1px solid ${drainageData.highPondingRiskPct > 10 ? '#fecaca' : '#bbf7d0'}` }}>
              <div className="text-xs text-gray-600 mb-1">High Risk</div>
              <div className="text-lg font-bold" style={{ color: drainageData.highPondingRiskPct > 10 ? '#991b1b' : '#166534' }}>
                {drainageData.highPondingRiskPct.toFixed(1)}%
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 italic px-1">
            The <strong>Depressions %</strong> metric counts pixels where the 10m DEM is ≥0.15m below its neighborhood mean — a strict threshold. The <em>Depressions</em> map layer uses a separate visual contrast stretch and may highlight shallower low areas not counted here.
          </p>

          {drainageData.twiMean > 0 && (
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#fafafa', border: '1px solid #e5e7eb' }}>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">TWI (Topographic Wetness Index)</h4>
              <div className="space-y-1 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span>Mean:</span>
                  <span className="font-medium">{drainageData.twiMean.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>75th Percentile:</span>
                  <span className="font-medium">{drainageData.twiP75?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span>90th Percentile:</span>
                  <span className="font-medium">{drainageData.twiP90?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Hydric Soils Alert */}
      {drainageData.hydricPercent > 20 && (
        <div className="flex items-start gap-2 p-3 rounded-lg" style={{ backgroundColor: '#ecfeff', border: '1px solid #a5f3fc' }}>
          <Droplet className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#0891b2' }} />
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: '#155e75' }}>Hydric Soils Present</p>
            <p className="text-xs" style={{ color: '#155e75' }}>
              {drainageData.hydricPercent.toFixed(1)}% of field contains hydric soils ({drainageData.hydricSoils.toFixed(1)} acres).
            </p>
          </div>
        </div>
      )}

      {/* Drainage Class Distribution */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Drainage Classes (SSURGO Component Summary)</h4>
        {drainageData.hasGEEData && drainageData.hasSSURGOData && (
          <p className="text-xs text-gray-500 mb-2">
            Bars use SSURGO component-weighted acreage. The map &quot;Drainage Class&quot; layer is a GEE raster product and may differ spatially.
          </p>
        )}
        <div className="space-y-2">
          {drainageData.drainageClasses.map((drainage: any) => (
            <div key={drainage.class}>
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: drainage.color }} />
                  <span className="font-medium text-gray-700">{drainage.class}</span>
                </div>
                <span className="text-gray-600">{drainage.acres.toFixed(1)} ac</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${drainage.percent}%`,
                    backgroundColor: drainage.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Recommendations</h4>
        <div className="space-y-2">
          {drainageData.recommendations.map((rec: string, idx: number) => (
            <div key={idx} className="flex items-start gap-2 p-2 rounded" style={{ backgroundColor: '#f9fafb' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#6b7280' }} />
              <span className="text-xs text-gray-700">{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
