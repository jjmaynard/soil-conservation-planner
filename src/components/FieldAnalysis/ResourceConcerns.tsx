// Resource Concerns Component - GEE Integration

'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import type { EnhancedFieldData } from '#hooks/useComprehensiveFieldAssessment'

interface ResourceConcernsProps {
  fieldId: string
  geeData?: EnhancedFieldData | null
  fieldAcres?: number
}

interface Concern {
  id: string
  category: string
  concern: string
  severity: 'High' | 'Moderate' | 'Low'
  affectedAcres: number
  affectedPct: number
  detected: boolean
  practices: string[]
  metrics?: Record<string, number | string>
}

export default function ResourceConcerns({ fieldId, geeData, fieldAcres = 0 }: ResourceConcernsProps) {
  const [concerns, setConcerns] = useState<Concern[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadResourceConcerns()
  }, [fieldId, geeData])

  const loadResourceConcerns = async () => {
    setLoading(true)
    try {
      const detectedConcerns: Concern[] = []
      
      // Try to get data from props or session storage
      let assessmentData = geeData
      if (!assessmentData) {
        const stored = sessionStorage.getItem('comprehensiveFieldAssessment')
        if (stored) {
          assessmentData = JSON.parse(stored) as EnhancedFieldData
        }
      }

      if (!assessmentData?.geeAssessment) {
        console.warn('No GEE assessment data available')
        setConcerns([])
        setLoading(false)
        return
      }

      const assessment = assessmentData.geeAssessment
      const combined = assessmentData.combined

      // 1. EROSION CONCERN
      if (combined.erosion.high_risk_area_pct > 10) {
        const severity = 
          combined.erosion.high_risk_area_pct > 30 ? 'High' :
          combined.erosion.high_risk_area_pct > 15 ? 'Moderate' : 'Low'
        
        detectedConcerns.push({
          id: 'erosion',
          category: 'Soil Erosion',
          concern: 'Sheet and Rill Erosion',
          severity,
          affectedPct: combined.erosion.high_risk_area_pct,
          affectedAcres: (fieldAcres * combined.erosion.high_risk_area_pct / 100),
          detected: true,
          practices: ['Cover Crops (340)', 'Contour Farming (330)', 'Terraces (600)', 'Residue Management (329)'],
          metrics: {
            'Mean Risk': combined.erosion.gee_terrain_risk?.toFixed(2) || 'N/A',
            'High Risk Area': `${combined.erosion.high_risk_area_pct.toFixed(1)}%`
          }
        })
      }

      // 2. PONDING/DRAINAGE CONCERN
      if (combined.drainage.gee_ponding_risk_pct > 10 || combined.drainage.combined_concern) {
        const severity = 
          combined.drainage.gee_ponding_risk_pct > 25 ? 'High' :
          combined.drainage.gee_ponding_risk_pct > 15 ? 'Moderate' : 'Low'
        
        detectedConcerns.push({
          id: 'ponding',
          category: 'Water Management',
          concern: 'Ponding and Poor Drainage',
          severity,
          affectedPct: combined.drainage.gee_ponding_risk_pct,
          affectedAcres: (fieldAcres * combined.drainage.gee_ponding_risk_pct / 100),
          detected: true,
          practices: ['Drainage Water Management (554)', 'Surface Drainage (607)', 'Subsurface Drain (606)'],
          metrics: {
            'Ponding Risk Area': `${combined.drainage.gee_ponding_risk_pct.toFixed(1)}%`,
            'Depression Area': `${combined.drainage.depression_area_pct?.toFixed(1) || 'N/A'}%`
          }
        })
      }

      // 3. CONCENTRATED FLOW / GULLY CONCERN
      if (combined.concentrated_flow.gully_risk_pct > 5) {
        const severity = 
          combined.concentrated_flow.gully_risk_pct > 15 ? 'High' :
          combined.concentrated_flow.gully_risk_pct > 8 ? 'Moderate' : 'Low'
        
        detectedConcerns.push({
          id: 'concentrated_flow',
          category: 'Soil Erosion',
          concern: 'Concentrated Flow and Gully Formation',
          severity,
          affectedPct: combined.concentrated_flow.gully_risk_pct,
          affectedAcres: (fieldAcres * combined.concentrated_flow.gully_risk_pct / 100),
          detected: true,
          practices: ['Grassed Waterway (412)', 'Grade Stabilization (410)', 'Diversion (362)', 'Contour Farming (330)'],
          metrics: {
            'Gully Risk Area': `${combined.concentrated_flow.gully_risk_pct.toFixed(1)}%`,
            'Channel Density': `${combined.concentrated_flow.channel_density?.toFixed(1) || 'N/A'} m/ha`
          }
        })
      }

      // 4. DROUGHT / WATER DEFICIT CONCERN
      if (combined.drought_risk.water_balance_mm !== null && combined.drought_risk.water_balance_mm < -50) {
        const severity = 
          combined.drought_risk.water_balance_mm < -150 ? 'High' :
          combined.drought_risk.water_balance_mm < -100 ? 'Moderate' : 'Low'
        
        detectedConcerns.push({
          id: 'drought',
          category: 'Water Management',
          concern: 'Drought and Water Deficit',
          severity,
          affectedPct: 100, // Affects whole field
          affectedAcres: fieldAcres,
          detected: true,
          practices: ['Irrigation System (442)', 'Mulching (484)', 'Cover Crops (340)', 'Conservation Crop Rotation (328)'],
          metrics: {
            'Water Balance': `${combined.drought_risk.water_balance_mm.toFixed(0)} mm`,
            'PDSI': combined.drought_risk.pdsi_mean?.toFixed(2) || 'N/A'
          }
        })
      }

      // 5. PRODUCTIVITY / YIELD GAP CONCERN
      if (combined.productivity.yield_gap_pct > 15) {
        const severity = 
          combined.productivity.yield_gap_pct > 30 ? 'High' :
          combined.productivity.yield_gap_pct > 20 ? 'Moderate' : 'Low'
        
        detectedConcerns.push({
          id: 'productivity',
          category: 'Soil Quality',
          concern: 'Below-Average Productivity',
          severity,
          affectedPct: 100,
          affectedAcres: fieldAcres,
          detected: true,
          practices: ['Nutrient Management (590)', 'Soil Testing', 'Cover Crops (340)', 'Conservation Crop Rotation (328)'],
          metrics: {
            'Yield Gap': `${combined.productivity.yield_gap_pct.toFixed(1)}%`,
            'NDVI Stability (CV)': `${combined.productivity.stability_cv?.toFixed(1) || 'N/A'}%`
          }
        })
      }

      // 6. SOIL QUALITY (SVI) CONCERN
      // Supports both legacy normalized means (0-1) and class-based means (1-4)
      const sviMean = combined.svi.surface_loss_mean
      const isClassScale = sviMean > 1.2
      const isSviConcern = isClassScale ? sviMean > 2.0 : sviMean > 0.5

      if (isSviConcern) {
        const severity = isClassScale
          ? (sviMean > 3.2 ? 'High' : sviMean > 2.5 ? 'Moderate' : 'Low')
          : (sviMean > 0.7 ? 'High' : sviMean > 0.6 ? 'Moderate' : 'Low')
        
        detectedConcerns.push({
          id: 'svi',
          category: 'Soil Quality',
          concern: 'Soil Vulnerability to Degradation',
          severity,
          affectedPct: 100,
          affectedAcres: fieldAcres,
          detected: true,
          practices: ['Residue Management (329)', 'Cover Crops (340)', 'Reduced Till (345)', 'No-Till (329A)'],
          metrics: {
            'Surface Loss Index': combined.svi.surface_loss_mean.toFixed(2),
            'Subsurface Drained': combined.svi.subsurface_drained_mean?.toFixed(2) || 'N/A'
          }
        })
      }

      // Sort by severity (High > Moderate > Low)
      const severityOrder = { 'High': 0, 'Moderate': 1, 'Low': 2 }
      detectedConcerns.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

      setConcerns(detectedConcerns)
    } catch (error) {
      console.error('Error loading resource concerns:', error)
      setConcerns([])
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High':
        return { bg: '#fee2e2', border: '#fecaca', text: '#991b1b', icon: '#dc2626' }
      case 'Moderate':
        return { bg: '#fef3c7', border: '#fde68a', text: '#92400e', icon: '#f59e0b' }
      case 'Low':
        return { bg: '#dbeafe', border: '#bfdbfe', text: '#1e40af', icon: '#3b82f6' }
      default:
        return { bg: '#f3f4f6', border: '#e5e7eb', text: '#1f2937', icon: '#6b7280' }
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 mx-auto mb-2" style={{ border: '2px solid #e5e7eb', borderTopColor: '#dc2626' }}></div>
        <p className="text-sm text-gray-600">Analyzing resource concerns...</p>
      </div>
    )
  }

  const detectedConcerns = concerns.filter(c => c.detected)
  const highSeverity = detectedConcerns.filter(c => c.severity === 'High').length

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg" style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca' }}>
          <div className="text-xs text-gray-600 mb-1">Total Concerns</div>
          <div className="text-2xl font-bold" style={{ color: '#991b1b' }}>
            {detectedConcerns.length}
          </div>
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}>
          <div className="text-xs text-gray-600 mb-1">High Severity</div>
          <div className="text-2xl font-bold" style={{ color: '#92400e' }}>
            {highSeverity}
          </div>
        </div>
      </div>

      {/* Alert if high severity concerns */}
      {highSeverity > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-lg" style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca' }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#dc2626' }} />
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: '#991b1b' }}>High Priority Concerns Detected</p>
            <p className="text-xs" style={{ color: '#991b1b' }}>
              {highSeverity} concern{highSeverity > 1 ? 's require' : ' requires'} immediate attention. Review conservation practices below.
            </p>
          </div>
        </div>
      )}

      {/* Concerns List */}
      <div className="space-y-3">
        {detectedConcerns.map((concern) => {
          const colors = getSeverityColor(concern.severity)
          return (
            <div 
              key={concern.id} 
              className="border rounded-lg p-3"
              style={{ backgroundColor: colors.bg, borderColor: colors.border }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: colors.icon }} />
                    <h4 className="text-sm font-semibold" style={{ color: colors.text }}>
                      {concern.concern}
                    </h4>
                  </div>
                  <div className="text-xs" style={{ color: colors.text }}>
                    {concern.category} • {concern.affectedAcres.toFixed(1)} acres affected
                  </div>
                </div>
                <div 
                  className="px-2 py-1 rounded text-xs font-semibold"
                  style={{ backgroundColor: '#ffffff', color: colors.text }}
                >
                  {concern.severity}
                </div>
              </div>

              {/* Metrics Display */}
              {concern.metrics && (
                <div className="mt-2 pt-2 border-t" style={{ borderColor: colors.border }}>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(concern.metrics).map(([key, value]) => (
                      <div key={key} className="text-xs">
                        <span className="opacity-75">{key}: </span>
                        <span className="font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-2">
                <h5 className="text-xs font-semibold mb-1" style={{ color: colors.text }}>
                  Recommended Practices:
                </h5>
                <ul className="space-y-1">
                  {concern.practices.map((practice, idx) => (
                    <li key={idx} className="text-xs flex items-start gap-1" style={{ color: colors.text }}>
                      <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: colors.icon }} />
                      <span>{practice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>

      {/* No Concerns Message */}
      {detectedConcerns.length === 0 && (
        <div className="flex items-center justify-center gap-2 p-6 rounded-lg" style={{ backgroundColor: '#dcfce7', border: '1px solid #bbf7d0' }}>
          <CheckCircle className="w-5 h-5" style={{ color: '#16a34a' }} />
          <p className="text-sm font-medium" style={{ color: '#166534' }}>
            No significant resource concerns detected
          </p>
        </div>
      )}
    </div>
  )
}
