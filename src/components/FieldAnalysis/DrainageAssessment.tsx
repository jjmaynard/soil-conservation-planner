// Drainage Assessment Component

'use client'

import { useState, useEffect } from 'react'
import { Droplet, AlertCircle } from 'lucide-react'

interface DrainageAssessmentProps {
  fieldId: string
}

export default function DrainageAssessment({ fieldId }: DrainageAssessmentProps) {
  const [drainageData, setDrainageData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDrainageData()
  }, [fieldId])

  const loadDrainageData = async () => {
    setLoading(true)
    try {
      // Placeholder data - replace with API call
      const mockData = {
        hydricSoils: 14.5, // acres
        hydricPercent: 32.0,
        wetlandAreas: [
          { type: 'Palustrine Emergent', acres: 2.1 },
        ],
        drainageClasses: [
          { class: 'Well Drained', acres: 18.5, percent: 40.8, color: '#10b981' },
          { class: 'Moderately Well', acres: 12.3, percent: 27.2, color: '#60a5fa' },
          { class: 'Somewhat Poorly', acres: 10.2, percent: 22.5, color: '#fbbf24' },
          { class: 'Poorly Drained', acres: 4.3, percent: 9.5, color: '#f97316' },
        ],
        recommendations: [
          'Consider tile drainage in poorly drained areas',
          'Monitor drainage system performance annually',
          'Maintain buffer zones around wetland areas',
        ]
      }
      setDrainageData(mockData)
    } catch (error) {
      console.error('Error loading drainage data:', error)
    } finally {
      setLoading(false)
    }
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
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Drainage Classes</h4>
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

      {/* Wetland Areas */}
      {drainageData.wetlandAreas.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Wetland Areas</h4>
          <div className="space-y-2">
            {drainageData.wetlandAreas.map((wetland: any, idx: number) => (
              <div key={idx} className="p-2 rounded border border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">{wetland.type}</span>
                  <span className="text-xs text-gray-600">{wetland.acres.toFixed(1)} acres</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
