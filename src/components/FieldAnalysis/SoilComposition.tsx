// Soil Composition Component - Pie chart and table with real SSURGO data

'use client'

import { useState, useEffect } from 'react'
import { Info } from 'lucide-react'
import type { ProcessedFieldData } from '#hooks/useFieldSSURGO'

interface SoilCompositionProps {
  fieldId: string
  fieldData?: ProcessedFieldData | null
  onSoilSelect?: (soil: any) => void
}

export default function SoilComposition({ fieldId, fieldData, onSoilSelect }: SoilCompositionProps) {
  const [soils, setSoils] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSoilData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldId, fieldData])

  const loadSoilData = async () => {
    setLoading(true)
    try {
      console.log('[SoilComposition] Loading data for fieldId:', fieldId)
      console.log('[SoilComposition] fieldData prop:', fieldData)
      console.log('[SoilComposition] fieldData.soils:', fieldData?.soils)
      console.log('[SoilComposition] soils length:', fieldData?.soils?.length)
      
      // Try to load from fieldData prop first (real SSURGO data)
      if (fieldData?.soils && fieldData.soils.length > 0) {
        console.log('[SoilComposition] ✅ Using fieldData prop with', fieldData.soils.length, 'soils')
        setSoils(fieldData.soils)
      } else {
        console.log('[SoilComposition] ❌ No valid fieldData prop, checking session storage')
        // Try session storage with field-specific key
        const storedData = sessionStorage.getItem(`fieldSSURGOData-${fieldId}`)
        console.log('[SoilComposition] Session storage key:', `fieldSSURGOData-${fieldId}`)
        console.log('[SoilComposition] Session storage has data:', !!storedData)
        if (storedData) {
          const parsed = JSON.parse(storedData) as ProcessedFieldData
          console.log('[SoilComposition] Parsed session data:', parsed)
          if (parsed.soils) {
            console.log('[SoilComposition] ✅ Using session storage with', parsed.soils.length, 'soils')
            setSoils(parsed.soils)
            return
          }
        }
        
        console.log('[SoilComposition] ⚠️ No data available, showing placeholder')
        // Fallback to placeholder data if no real data available
        const mockSoils = [
          { 
            id: '1', 
            mapunit_name: 'Loading real SSURGO data...', 
            symbol: 'N/A',
            area: 0, 
            percent: 100,
            lcc: 'N/A',
            slope: 0,
            drainageClass: 'N/A',
            hydric: false,
            color: '#9ca3af'
          },
        ]
        setSoils(mockSoils)
      }
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
      
      {/* Geometry Quality Warning */}
      {fieldData?.geometryWarning && (
        <div className="flex items-start gap-2 p-3 rounded-lg" style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}>
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
          <p className="text-xs" style={{ color: '#92400e' }}>
            {fieldData.geometryWarning}
          </p>
        </div>
      )}

      {/* Combined Table with Visual Bars */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
        <table className="min-w-[680px] w-full text-xs">
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th className="text-left p-2 sm:p-3 font-semibold text-gray-700">Soil Component</th>
              <th className="text-right p-2 sm:p-3 font-semibold text-gray-700">Area</th>
              <th className="text-left p-2 sm:p-3 font-semibold text-gray-700" style={{ minWidth: '200px' }}>Percent</th>
              <th className="text-right p-2 sm:p-3 font-semibold text-gray-700">Slope</th>
              <th className="text-right p-2 sm:p-3 font-semibold text-gray-700">LCC</th>
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
                {/* Soil Name with Color Indicator */}
                <td className="p-2 sm:p-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: soil.color }}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-gray-900 truncate">{soil.mapunit_name}</span>
                      <span className="text-gray-500 text-xs">{soil.symbol}</span>
                    </div>
                  </div>
                </td>
                
                {/* Area */}
                <td className="p-2 sm:p-3 text-right font-medium text-gray-900 whitespace-nowrap">
                  {Number(soil.area || 0).toFixed(2)} ac
                </td>
                
                {/* Percentage with Extended Visual Bar */}
                <td className="p-2 sm:p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-7 bg-gray-100 rounded-md overflow-hidden relative" style={{ minWidth: '140px' }}>
                      <div
                        className="h-full rounded-md transition-all flex items-center justify-end pr-2"
                        style={{ 
                          width: `${soil.percent}%`,
                          backgroundColor: soil.color,
                          minWidth: '35px'
                        }}
                      >
                        <span className="text-xs font-semibold text-white drop-shadow-sm">
                          {Number(soil.percent || 0).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                
                {/* Slope */}
                <td className="p-2 sm:p-3 text-right font-medium text-gray-700 whitespace-nowrap">
                  {Number(soil.slope || 0).toFixed(1)}%
                </td>
                
                {/* Land Capability Class */}
                <td className="p-2 sm:p-3 text-right">
                  <span 
                    className="px-2 py-1 rounded text-xs font-semibold"
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
    </div>
  )
}
