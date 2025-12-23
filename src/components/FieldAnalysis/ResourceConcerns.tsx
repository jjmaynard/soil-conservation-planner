// Resource Concerns Component

'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface ResourceConcernsProps {
  fieldId: string
}

interface Concern {
  id: string
  category: string
  concern: string
  severity: 'High' | 'Moderate' | 'Low'
  affectedAcres: number
  detected: boolean
  practices: string[]
}

export default function ResourceConcerns({ fieldId }: ResourceConcernsProps) {
  const [concerns, setConcerns] = useState<Concern[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadResourceConcerns()
  }, [fieldId])

  const loadResourceConcerns = async () => {
    setLoading(true)
    try {
      // Placeholder data - replace with automated concern detection
      const mockConcerns: Concern[] = [
        {
          id: '1',
          category: 'Soil Erosion',
          concern: 'Sheet and Rill Erosion',
          severity: 'Moderate',
          affectedAcres: 26.8,
          detected: true,
          practices: ['Cover Crops (340)', 'Contour Farming (330)', 'Terraces (600)']
        },
        {
          id: '2',
          category: 'Water Quality',
          concern: 'Nutrients in Surface Water',
          severity: 'Moderate',
          affectedAcres: 45.3,
          detected: true,
          practices: ['Nutrient Management (590)', 'Filter Strip (393)', 'Grassed Waterway (412)']
        },
        {
          id: '3',
          category: 'Soil Quality',
          concern: 'Soil Organic Matter Depletion',
          severity: 'Low',
          affectedAcres: 45.3,
          detected: true,
          practices: ['Cover Crops (340)', 'Residue Management (329)', 'Conservation Crop Rotation (328)']
        },
        {
          id: '4',
          category: 'Water Management',
          concern: 'Ponding and Flooding',
          severity: 'High',
          affectedAcres: 14.5,
          detected: true,
          practices: ['Drainage Water Management (554)', 'Surface Drainage (607)', 'Subsurface Drain (606)']
        },
      ]
      setConcerns(mockConcerns)
    } catch (error) {
      console.error('Error loading resource concerns:', error)
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

              <div>
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
