// Field Stats Component - Quick statistics cards

'use client'

import { TrendingUp, Droplets, Mountain, AlertTriangle } from 'lucide-react'

interface FieldStatsProps {
  fieldData: any
}

export default function FieldStats({ fieldData }: FieldStatsProps) {
  // Calculate stats from field data
  const stats = {
    totalArea: fieldData.area || 0,
    soilTypes: fieldData.soils?.length || 4,
    avgSlope: fieldData.avgSlope || 3.2,
    erosionRisk: fieldData.erosionRisk || 'Moderate',
  }

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' }
      case 'moderate':
        return { bg: '#fef3c7', text: '#92400e', border: '#fde68a' }
      case 'high':
        return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' }
      default:
        return { bg: '#f3f4f6', text: '#1f2937', border: '#e5e7eb' }
    }
  }

  const riskColors = getRiskColor(stats.erosionRisk)

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4 flex-shrink-0">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Area */}
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: '#166534' }}>Total Area</span>
            <TrendingUp className="w-4 h-4" style={{ color: '#16a34a' }} />
          </div>
          <div className="text-2xl font-bold" style={{ color: '#14532d' }}>
            {stats.totalArea.toFixed(1)} <span className="text-base font-normal">acres</span>
          </div>
        </div>

        {/* Soil Types */}
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: '#92400e' }}>Soil Types</span>
            <Droplets className="w-4 h-4" style={{ color: '#d97706' }} />
          </div>
          <div className="text-2xl font-bold" style={{ color: '#78350f' }}>
            {stats.soilTypes} <span className="text-base font-normal">types</span>
          </div>
        </div>

        {/* Average Slope */}
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: '#1e40af' }}>Avg Slope</span>
            <Mountain className="w-4 h-4" style={{ color: '#2563eb' }} />
          </div>
          <div className="text-2xl font-bold" style={{ color: '#1e3a8a' }}>
            {stats.avgSlope.toFixed(1)}<span className="text-base font-normal">%</span>
          </div>
        </div>

        {/* Erosion Risk */}
        <div className="p-4 rounded-lg" style={{ backgroundColor: riskColors.bg, border: `1px solid ${riskColors.border}` }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: riskColors.text }}>Erosion Risk</span>
            <AlertTriangle className="w-4 h-4" style={{ color: riskColors.text }} />
          </div>
          <div className="text-2xl font-bold" style={{ color: riskColors.text }}>
            {stats.erosionRisk}
          </div>
        </div>
      </div>
    </div>
  )
}
