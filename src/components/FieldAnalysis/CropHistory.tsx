// Crop History Component - 5-year CDL timeline

'use client'

import { useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'

interface CropHistoryProps {
  fieldId: string
}

export default function CropHistory({ fieldId }: CropHistoryProps) {
  const [cropData, setCropData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCropHistory()
  }, [fieldId])

  const loadCropHistory = async () => {
    setLoading(true)
    try {
      // Placeholder data - replace with CDL API call
      const mockHistory = [
        { year: 2023, crop: 'Corn', color: '#fbbf24', percent: 92 },
        { year: 2022, crop: 'Soybeans', color: '#10b981', percent: 88 },
        { year: 2021, crop: 'Corn', color: '#fbbf24', percent: 95 },
        { year: 2020, crop: 'Soybeans', color: '#10b981', percent: 91 },
        { year: 2019, crop: 'Corn', color: '#fbbf24', percent: 87 },
      ]
      setCropData(mockHistory)
    } catch (error) {
      console.error('Error loading crop history:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 mx-auto mb-2" style={{ border: '2px solid #e5e7eb', borderTopColor: '#2563eb' }}></div>
        <p className="text-sm text-gray-600">Loading crop history...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Timeline */}
      <div className="space-y-3">
        {cropData.map((year, idx) => (
          <div key={year.year} className="flex items-center gap-3">
            <div className="text-sm font-semibold text-gray-700 w-12">
              {year.year}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">{year.crop}</span>
                <span className="text-xs text-gray-600">{year.percent}% coverage</span>
              </div>
              <div className="h-8 rounded-lg overflow-hidden relative" style={{ backgroundColor: '#f3f4f6' }}>
                <div
                  className="h-full transition-all flex items-center px-3"
                  style={{
                    width: `${year.percent}%`,
                    backgroundColor: year.color,
                  }}
                >
                  <Calendar className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rotation Summary */}
      <div className="p-3 rounded-lg" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <h4 className="text-sm font-semibold mb-2" style={{ color: '#1e40af' }}>Rotation Pattern</h4>
        <p className="text-xs" style={{ color: '#1e40af' }}>
          Corn-Soybean rotation detected. This 2-year rotation cycle is common in Iowa and provides good soil health benefits.
        </p>
      </div>
    </div>
  )
}
