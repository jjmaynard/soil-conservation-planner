// Soil Composition Component - Pie chart and table

'use client'

import { useState, useEffect } from 'react'
import { Info } from 'lucide-react'

interface SoilCompositionProps {
  fieldId: string
  onSoilSelect?: (soil: any) => void
}

export default function SoilComposition({ fieldId, onSoilSelect }: SoilCompositionProps) {
  const [soils, setSoils] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSoilData()
  }, [fieldId])

  const loadSoilData = async () => {
    setLoading(true)
    try {
      // Placeholder data - replace with API call
      const mockSoils = [
        { 
          id: 1, 
          mapunit_name: 'Clarion loam, 2-5% slopes', 
          symbol: 'CIC2',
          area: 18.5, 
          percent: 40.8,
          lcc: 'IIe',
          slope: 3.2,
          color: '#10b981'
        },
        { 
          id: 2, 
          mapunit_name: 'Nicollet loam, 1-3% slopes', 
          symbol: 'NcB',
          area: 12.3, 
          percent: 27.2,
          lcc: 'I',
          slope: 1.8,
          color: '#60a5fa'
        },
        { 
          id: 3, 
          mapunit_name: 'Webster clay loam, 0-2% slopes', 
          symbol: 'WeA',
          area: 10.2, 
          percent: 22.5,
          lcc: 'IIw',
          slope: 0.9,
          color: '#fbbf24'
        },
        { 
          id: 4, 
          mapunit_name: 'Canisteo clay loam, 0-2% slopes', 
          symbol: 'CaA',
          area: 4.3, 
          percent: 9.5,
          lcc: 'IIw',
          slope: 1.1,
          color: '#a78bfa'
        },
      ]
      setSoils(mockSoils)
    } catch (error) {
      console.error('Error loading soil data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 mx-auto mb-2" style={{ border: '2px solid #e5e7eb', borderTopColor: '#16a34a' }}></div>
        <p className="text-sm text-gray-600">Loading soil data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-start gap-2 p-3 rounded-lg" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#2563eb' }} />
        <p className="text-xs" style={{ color: '#1e40af' }}>
          This field contains {soils.length} different soil map units with varying properties and capabilities.
        </p>
      </div>

      {/* Simple Visual Bar Chart */}
      <div className="space-y-2">
        {soils.map((soil) => (
          <div key={soil.id}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-gray-700 truncate flex-1">{soil.symbol}</span>
              <span className="text-gray-600 ml-2">{soil.percent.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ 
                  width: `${soil.percent}%`,
                  backgroundColor: soil.color
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th className="text-left p-2 font-semibold text-gray-700">Soil</th>
              <th className="text-right p-2 font-semibold text-gray-700">Area</th>
              <th className="text-right p-2 font-semibold text-gray-700">LCC</th>
            </tr>
          </thead>
          <tbody>
            {soils.map((soil, idx) => (
              <tr 
                key={soil.id}
                className="border-t border-gray-200 cursor-pointer transition-colors"
                style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}
                onClick={() => onSoilSelect?.(soil)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#fafafa'}
              >
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: soil.color }}
                    />
                    <span className="truncate">{soil.mapunit_name}</span>
                  </div>
                </td>
                <td className="p-2 text-right">{soil.area} ac</td>
                <td className="p-2 text-right">
                  <span 
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{ backgroundColor: '#f0fdf4', color: '#166534' }}
                  >
                    {soil.lcc}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
