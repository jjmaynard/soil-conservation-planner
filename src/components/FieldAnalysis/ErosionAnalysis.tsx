// Erosion Analysis Component - RUSLE2-based erosion risk

'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react'

interface ErosionAnalysisProps {
  fieldId: string
}

export default function ErosionAnalysis({ fieldId }: ErosionAnalysisProps) {
  const [erosionData, setErosionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadErosionData()
  }, [fieldId])

  const loadErosionData = async () => {
    setLoading(true)
    try {
      // Placeholder data - replace with API calculation
      const mockData = {
        avgErosion: 4.2, // tons/acre/year
        maxErosion: 8.1,
        tolerable: 5.0, // T value
        riskLevel: 'Moderate',
        areas: [
          { risk: 'Low', acres: 18.5, percent: 40.8, color: '#dcfce7', textColor: '#166534' },
          { risk: 'Moderate', acres: 20.3, percent: 44.8, color: '#fef3c7', textColor: '#92400e' },
          { risk: 'High', acres: 6.5, percent: 14.4, color: '#fee2e2', textColor: '#991b1b' },
        ],
        factors: {
          rainfall: 'High',
          slope: 'Moderate',
          soilK: 'Moderate',
          coverManagement: 'Good',
        }
      }
      setErosionData(mockData)
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

  const isAboveTolerable = erosionData.avgErosion > erosionData.tolerable

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg" style={{ backgroundColor: isAboveTolerable ? '#fee2e2' : '#dcfce7', border: `1px solid ${isAboveTolerable ? '#fecaca' : '#bbf7d0'}` }}>
          <div className="text-xs text-gray-600 mb-1">Average Erosion</div>
          <div className="text-2xl font-bold" style={{ color: isAboveTolerable ? '#991b1b' : '#166534' }}>
            {erosionData.avgErosion} <span className="text-sm font-normal">T/A/Y</span>
          </div>
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }}>
          <div className="text-xs text-gray-600 mb-1">Tolerable (T)</div>
          <div className="text-2xl font-bold text-gray-900">
            {erosionData.tolerable} <span className="text-sm font-normal">T/A/Y</span>
          </div>
        </div>
      </div>

      {/* Status Alert */}
      {isAboveTolerable && (
        <div className="flex items-start gap-2 p-3 rounded-lg" style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#d97706' }} />
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: '#92400e' }}>Action Recommended</p>
            <p className="text-xs" style={{ color: '#92400e' }}>
              Average erosion exceeds soil tolerance. Consider implementing conservation practices.
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

      {/* RUSLE Factors */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Contributing Factors</h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(erosionData.factors).map(([factor, level]: [string, any]) => (
            <div key={factor} className="p-2 rounded border border-gray-200">
              <div className="text-xs text-gray-600 capitalize">
                {factor.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div className="text-sm font-semibold text-gray-900">{level}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
