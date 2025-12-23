// Management Zones Component

'use client'

import { useState, useEffect } from 'react'
import { Layers, Info, Circle } from 'lucide-react'

interface ManagementZonesProps {
  fieldId: string
}

export default function ManagementZones({ fieldId }: ManagementZonesProps) {
  const [zones, setZones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadManagementZones()
  }, [fieldId])

  const loadManagementZones = async () => {
    setLoading(true)
    try {
      // Placeholder data - replace with zone delineation algorithm
      const mockZones = [
        {
          id: 1,
          name: 'High Productivity',
          acres: 18.5,
          percent: 40.8,
          color: '#10b981',
          characteristics: ['Well drained', 'Level terrain', 'Optimal soil depth'],
          recommendations: ['Standard fertility rates', 'High yield expectations']
        },
        {
          id: 2,
          name: 'Moderate Productivity',
          acres: 20.3,
          percent: 44.8,
          color: '#60a5fa',
          characteristics: ['Moderate drainage', 'Gentle slopes', 'Good soil quality'],
          recommendations: ['Adjusted fertility', 'Moderate yield target']
        },
        {
          id: 3,
          name: 'Low Productivity',
          acres: 6.5,
          percent: 14.4,
          color: '#fbbf24',
          characteristics: ['Poorly drained', 'Wet conditions', 'Yield limitations'],
          recommendations: ['Reduced inputs', 'Focus on drainage improvement']
        },
      ]
      setZones(mockZones)
    } catch (error) {
      console.error('Error loading management zones:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 mx-auto mb-2" style={{ border: '2px solid #e5e7eb', borderTopColor: '#a78bfa' }}></div>
        <p className="text-sm text-gray-600">Delineating management zones...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Info Box */}
      <div className="flex items-start gap-2 p-3 rounded-lg" style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff' }}>
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#7c3aed' }} />
        <p className="text-xs" style={{ color: '#6b21a8' }}>
          Management zones group areas with similar characteristics for targeted input application.
        </p>
      </div>

      {/* Zone Distribution */}
      <div className="space-y-2">
        {zones.map((zone) => (
          <div key={zone.id}>
            <div className="flex items-center justify-between text-xs mb-1">
              <div className="flex items-center gap-2">
                <Layers className="w-3 h-3" style={{ color: zone.color }} />
                <span className="font-medium text-gray-700">{zone.name}</span>
              </div>
              <span className="text-gray-600">{zone.acres.toFixed(1)} ac ({zone.percent.toFixed(1)}%)</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${zone.percent}%`,
                  backgroundColor: zone.color
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Zone Details */}
      <div className="space-y-3">
        {zones.map((zone) => (
          <div key={zone.id} className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: zone.color }} />
              <h4 className="text-sm font-semibold text-gray-900">{zone.name}</h4>
            </div>
            
            <div className="mb-2">
              <h5 className="text-xs font-semibold text-gray-700 mb-1">Characteristics:</h5>
              <ul className="space-y-1">
                {zone.characteristics.map((char: string, idx: number) => (
                  <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                    <Circle className="w-2 h-2 mt-1 flex-shrink-0" style={{ color: zone.color, fill: zone.color }} />
                    <span>{char}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-semibold text-gray-700 mb-1">Recommendations:</h5>
              <ul className="space-y-1">
                {zone.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                    <Circle className="w-2 h-2 mt-1 flex-shrink-0" style={{ color: '#16a34a', fill: '#16a34a' }} />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
