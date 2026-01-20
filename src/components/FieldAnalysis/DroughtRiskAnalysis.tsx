// Drought Risk / Soil Moisture Deficit Component - GEE Analysis

'use client'

import { useState, useEffect } from 'react'
import { CloudRain, AlertTriangle, Info, TrendingDown } from 'lucide-react'
import type { EnhancedFieldData } from '#hooks/useComprehensiveFieldAssessment'

interface DroughtRiskProps {
  fieldId: string
  geeData?: EnhancedFieldData | null
}

export default function DroughtRiskAnalysis({ fieldId, geeData }: DroughtRiskProps) {
  const [droughtData, setDroughtData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDroughtData()
  }, [fieldId, geeData])

  const loadDroughtData = async () => {
    setLoading(true)
    try {
      if (geeData?.geeAssessment?.drought) {
        const drought = geeData.geeAssessment.drought
        const combined = geeData.combined.drought_risk
        
        setDroughtData({
          waterBalanceMm: drought.water_balance?.balance_mm ?? null,
          pdsiMean: drought.drought_indices?.pdsi_mean ?? null,
          pdsiMin: drought.drought_indices?.pdsi_min ?? null,
          methodology: drought.methodology || '',
          visualization: drought.visualization,
          hasData: true,
        })
      } else {
        // Try session storage
        const stored = sessionStorage.getItem('comprehensiveFieldAssessment')
        if (stored) {
          const parsed = JSON.parse(stored) as EnhancedFieldData
          if (parsed.geeAssessment?.drought) {
            const drought = parsed.geeAssessment.drought
            
            setDroughtData({
              waterBalanceMm: drought.water_balance?.balance_mm ?? null,
              pdsiMean: drought.drought_indices?.pdsi_mean ?? null,
              pdsiMin: drought.drought_indices?.pdsi_min ?? null,
              methodology: drought.methodology || '',
              visualization: drought.visualization,
              hasData: true,
            })
            return
          }
        }
        
        setDroughtData({ hasData: false })
      }
    } catch (error) {
      console.error('Error loading drought data:', error)
      setDroughtData({ hasData: false })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 mx-auto mb-2" style={{ border: '2px solid #e5e7eb', borderTopColor: '#f59e0b' }}></div>
        <p className="text-sm text-gray-600">Analyzing drought risk...</p>
      </div>
    )
  }

  if (!droughtData?.hasData || droughtData.waterBalanceMm === null) {
    return (
      <div className="text-center py-8">
        <CloudRain className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">Drought data not available</p>
        <p className="text-xs text-gray-500 mt-1">Select a field to analyze</p>
      </div>
    )
  }

  const getDroughtSeverity = (balance: number) => {
    if (balance > 50) return { label: 'Low Risk', color: '#166534', bg: '#dcfce7' }
    if (balance > 0) return { label: 'Moderate', color: '#92400e', bg: '#fef3c7' }
    if (balance > -50) return { label: 'High Risk', color: '#ea580c', bg: '#ffedd5' }
    return { label: 'Severe', color: '#991b1b', bg: '#fee2e2' }
  }

  const getPDSICategory = (pdsi: number) => {
    if (pdsi >= 2) return 'Moderately Wet'
    if (pdsi >= 1) return 'Slightly Wet'
    if (pdsi >= -1) return 'Normal'
    if (pdsi >= -2) return 'Moderate Drought'
    if (pdsi >= -3) return 'Severe Drought'
    return 'Extreme Drought'
  }

  const droughtSeverity = getDroughtSeverity(droughtData.waterBalanceMm)
  const pdsiCategory = getPDSICategory(droughtData.pdsiMean)

  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="flex items-start gap-2 p-2 rounded" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <Info className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: '#2563eb' }} />
        <p className="text-xs" style={{ color: '#1e40af' }}>
          {droughtData.methodology || 'Growing season water balance and PDSI analysis from GridMET climate data'}
        </p>
      </div>

      {/* Water Balance */}
      <div className="p-4 rounded-lg text-center" style={{ backgroundColor: droughtSeverity.bg, border: `2px solid ${droughtSeverity.color}` }}>
        <div className="text-sm text-gray-700 mb-1">Water Balance (May-Sep)</div>
        <div className="text-4xl font-bold mb-1" style={{ color: droughtSeverity.color }}>
          {Number(droughtData.waterBalanceMm || 0).toFixed(0)} mm
        </div>
        <div className="text-sm font-semibold" style={{ color: droughtSeverity.color }}>
          {droughtSeverity.label}
        </div>
        <div className="text-xs text-gray-600 mt-2">
          {(droughtData.waterBalanceMm || 0) > 0 ? 'Surplus' : 'Deficit'} = Precipitation - Evapotranspiration
        </div>
      </div>

      {/* PDSI Grid */}
      {droughtData.pdsiMean !== null && droughtData.pdsiMin !== null ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg" style={{ backgroundColor: '#fafafa', border: '1px solid #e5e7eb' }}>
            <div className="text-xs text-gray-600 mb-1">PDSI Mean</div>
            <div className="text-2xl font-bold text-gray-900">{Number(droughtData.pdsiMean).toFixed(2)}</div>
            <div className="text-xs font-medium text-gray-700 mt-1">{pdsiCategory}</div>
          </div>

          <div className="p-3 rounded-lg" style={{ backgroundColor: '#fafafa', border: '1px solid #e5e7eb' }}>
            <div className="text-xs text-gray-600 mb-1">PDSI Minimum</div>
            <div className="text-2xl font-bold text-gray-900">{Number(droughtData.pdsiMin).toFixed(2)}</div>
            <div className="text-xs text-gray-700 mt-1">{getPDSICategory(droughtData.pdsiMin)}</div>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-lg text-center" style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}>
          <div className="text-xs text-gray-600">PDSI data unavailable for this location</div>
        </div>
      )}

      {/* Severe Drought Alert */}
      {droughtData.pdsiMean !== null && droughtData.pdsiMean < -2 && (
        <div className="flex items-start gap-2 p-3 rounded" style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca' }}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: '#991b1b' }} />
          <div>
            <div className="text-sm font-semibold" style={{ color: '#991b1b' }}>
              Drought Stress Detected
            </div>
            <div className="text-xs" style={{ color: '#991b1b' }}>
              PDSI indicates {(droughtData.pdsiMean || 0) < -3 ? 'severe' : 'moderate'} drought conditions during the growing season
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="p-3 rounded-lg" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
        <h4 className="text-sm font-semibold mb-2" style={{ color: '#92400e' }}>Management Recommendations</h4>
        <ul className="text-xs space-y-1" style={{ color: '#92400e' }}>
          {(droughtData.waterBalanceMm || 0) < -100 && (
            <>
              <li>• Severe water deficit - priority for irrigation infrastructure</li>
              <li>• Consider drought-tolerant crop varieties</li>
              <li>• Implement conservation tillage to preserve soil moisture</li>
            </>
          )}
          {(droughtData.waterBalanceMm || 0) < 0 && (droughtData.waterBalanceMm || 0) >= -100 && (
            <>
              <li>• Moderate deficit - implement water conservation practices</li>
              <li>• Mulching and residue management to reduce evaporation</li>
              <li>• Cover crops to improve water infiltration</li>
            </>
          )}
          {droughtData.pdsiMean !== null && droughtData.pdsiMean < -3 && (
            <li>• Severe drought conditions - evaluate supplemental irrigation needs</li>
          )}
          {(droughtData.waterBalanceMm || 0) > 50 && (
            <li>• Adequate moisture availability - maintain current practices</li>
          )}
        </ul>
      </div>
    </div>
  )
}
