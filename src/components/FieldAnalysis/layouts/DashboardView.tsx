// Dashboard View - Summary KPIs and Quick Stats Layout

'use client'

import { TrendingUp, AlertTriangle, Droplets, Layers, Sprout, CloudRain } from 'lucide-react'
import type { ProcessedFieldData } from '#hooks/useFieldSSURGO'
import type { EnhancedFieldData } from '#hooks/useComprehensiveFieldAssessment'
import RankedConcernsList from '../RankedConcernsList'
import PracticeRecommendations from '../PracticeRecommendations'
import DroughtDashboard from '../DroughtDashboard'

interface DashboardViewProps {
  fieldData: any
  ssurgoData: ProcessedFieldData | null
  geeData: EnhancedFieldData | null
  onCardClick: (section: string) => void
}

export default function DashboardView({ fieldData, ssurgoData, geeData, onCardClick }: DashboardViewProps) {
  // Calculate key metrics
  const dominantSoil = ssurgoData?.soils?.[0]
  const erosionRisk = geeData?.combined?.erosion?.combined_risk || 'Unknown'
  const drainageClass = ssurgoData?.soils?.[0]?.drainageClass || 'Unknown'
  const productivity = geeData?.combined?.productivity?.ndvi_peak_mean
  const droughtRisk = geeData?.combined?.drought_risk?.water_balance_mm
  const sviRisk = geeData?.combined?.svi?.surface_loss_mean

  console.log('[DashboardView] Rendering with data:')
  console.log('  - ssurgoData:', ssurgoData)
  console.log('  - ssurgoData.soils:', ssurgoData?.soils)
  console.log('  - soils length:', ssurgoData?.soils?.length)
  console.log('  - dominantSoil:', dominantSoil)
  console.log('  - geeData:', geeData)

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return { bg: '#dcfce7', text: '#166534', border: '#86efac' }
      case 'Moderate': return { bg: '#fef3c7', text: '#92400e', border: '#fde68a' }
      case 'High': return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' }
      default: return { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' }
    }
  }

  const erosionColors = getRiskColor(erosionRisk)

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Field Analysis Dashboard</h2>
        <p className="text-sm text-gray-600">
          Comprehensive overview of soil, productivity, and resource concerns
        </p>
      </div>

      {/* KPI Cards - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Soil Composition Card */}
        <button
          onClick={() => onCardClick('soil')}
          className="p-4 sm:p-6 rounded-xl text-left transition-all hover:shadow-lg"
          style={{ backgroundColor: '#f0fdf4', border: '2px solid #86efac' }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#dcfce7' }}>
              <Layers className="w-6 h-6" style={{ color: '#16a34a' }} />
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
              {ssurgoData?.soils?.length || 0} Components
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Dominant Soil</h3>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 break-words">
            {dominantSoil?.mapunit_name || 'Loading...'}
          </div>
          <div className="text-sm text-gray-600">
            {dominantSoil?.percent ? `${Number(dominantSoil.percent).toFixed(1)}%` : '-'} of field
          </div>
        </button>

        {/* Erosion Risk Card */}
        <button
          onClick={() => onCardClick('erosion')}
          className="p-4 sm:p-6 rounded-xl text-left transition-all hover:shadow-lg"
          style={{ backgroundColor: erosionColors.bg, border: `2px solid ${erosionColors.border}` }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>
              <TrendingUp className="w-6 h-6" style={{ color: erosionColors.text }} />
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.8)', color: erosionColors.text }}>
              {erosionRisk}
            </span>
          </div>
          <h3 className="text-sm font-medium" style={{ color: erosionColors.text, opacity: 0.8 }}>Erosion Risk</h3>
          <div className="text-xl sm:text-2xl font-bold mb-1" style={{ color: erosionColors.text }}>
            {geeData?.combined?.erosion?.high_risk_area_pct !== null && geeData?.combined?.erosion?.high_risk_area_pct !== undefined
              ? `${Number(geeData.combined.erosion.high_risk_area_pct).toFixed(1)}%`
              : '-'
            }
          </div>
          <div className="text-sm" style={{ color: erosionColors.text, opacity: 0.8 }}>
            High risk area
          </div>
        </button>

        {/* Drainage Card */}
        <button
          onClick={() => onCardClick('drainage')}
          className="p-4 sm:p-6 rounded-xl text-left transition-all hover:shadow-lg"
          style={{ backgroundColor: '#e0f2fe', border: '2px solid #7dd3fc' }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#bae6fd' }}>
              <Droplets className="w-6 h-6" style={{ color: '#0369a1' }} />
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor: '#bae6fd', color: '#0c4a6e' }}>
              {geeData?.combined?.drainage?.combined_concern === true ? 'Concern' : 'Normal'}
            </span>
          </div>
          <h3 className="text-sm font-medium text-sky-700 mb-1">Drainage Class</h3>
          <div className="text-xl sm:text-2xl font-bold text-sky-900 mb-1">
            {drainageClass.split(' ').slice(0, 2).join(' ')}
          </div>
          <div className="text-sm text-sky-700">
            {geeData?.combined?.drainage?.depression_area_pct !== null && geeData?.combined?.drainage?.depression_area_pct !== undefined
              ? `${Number(geeData.combined.drainage.depression_area_pct).toFixed(1)}% depressions`
              : 'Ponding analysis pending'
            }
          </div>
        </button>
      </div>

      {/* GEE Analysis Cards - Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Productivity Card */}
        <button
          onClick={() => onCardClick('productivity')}
          className="p-4 sm:p-6 rounded-xl text-left transition-all hover:shadow-lg"
          style={{ backgroundColor: '#f0fdf4', border: '2px solid #bbf7d0' }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#dcfce7' }}>
              <Sprout className="w-6 h-6" style={{ color: '#166534' }} />
            </div>
            {geeData?.combined?.productivity?.stability_cv !== null && geeData?.combined?.productivity?.stability_cv !== undefined && (
              <span className="text-xs font-medium px-2 py-1 rounded" style={{ 
                backgroundColor: (geeData.combined.productivity.stability_cv ?? 0) > 20 ? '#fef3c7' : '#dcfce7',
                color: (geeData.combined.productivity.stability_cv ?? 0) > 20 ? '#92400e' : '#166534'
              }}>
                {(geeData.combined.productivity.stability_cv ?? 0) > 20 ? 'Variable' : 'Stable'}
              </span>
            )}
          </div>
          <h3 className="text-sm font-medium text-green-700 mb-1">Productivity (NDVI Peak)</h3>
          <div className="text-xl sm:text-2xl font-bold text-green-900 mb-1">
            {productivity !== null ? Number(productivity).toFixed(2) : '-'}
          </div>
          <div className="text-sm text-green-700">
            {geeData?.combined?.productivity?.yield_gap_pct !== null && geeData?.combined?.productivity?.yield_gap_pct !== undefined
              ? `${Number(geeData.combined.productivity.yield_gap_pct).toFixed(0)}% yield gap`
              : 'Analysis pending'
            }
          </div>
        </button>

        {/* SVI Card */}
        <button
          onClick={() => onCardClick('svi')}
          className="p-4 sm:p-6 rounded-xl text-left transition-all hover:shadow-lg"
          style={{ backgroundColor: '#fef3c7', border: '2px solid #fde68a' }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#fde68a' }}>
              <AlertTriangle className="w-6 h-6" style={{ color: '#ea580c' }} />
            </div>
            {sviRisk !== null && sviRisk !== undefined && (
              <span className="text-xs font-bold px-2 py-1 rounded" style={{ 
                backgroundColor: (sviRisk ?? 0) > 0.5 ? '#fee2e2' : '#fef3c7',
                color: (sviRisk ?? 0) > 0.5 ? '#991b1b' : '#92400e'
              }}>
                {(sviRisk ?? 0) > 0.5 ? 'High' : 'Moderate'}
              </span>
            )}
          </div>
          <h3 className="text-sm font-medium text-amber-700 mb-1">Soil Vulnerability</h3>
          <div className="text-xl sm:text-2xl font-bold text-amber-900 mb-1">
            {sviRisk !== null ? Number(sviRisk).toFixed(2) : '-'}
          </div>
          <div className="text-sm text-amber-700">
            Surface loss index
          </div>
        </button>

        {/* Drought Risk Card */}
        <button
          onClick={() => onCardClick('drought')}
          className="p-4 sm:p-6 rounded-xl text-left transition-all hover:shadow-lg"
          style={{ 
            backgroundColor: droughtRisk !== null && droughtRisk !== undefined && droughtRisk < 0 ? '#fee2e2' : '#e0f2fe',
            border: droughtRisk !== null && droughtRisk !== undefined && droughtRisk < 0 ? '2px solid #fecaca' : '2px solid #7dd3fc'
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ 
              backgroundColor: droughtRisk !== null && droughtRisk !== undefined && droughtRisk < 0 ? '#fecaca' : '#bae6fd'
            }}>
              <CloudRain className="w-6 h-6" style={{ 
                color: droughtRisk !== null && droughtRisk !== undefined && droughtRisk < 0 ? '#991b1b' : '#0369a1'
              }} />
            </div>
            {droughtRisk !== null && droughtRisk !== undefined && (
              <span className="text-xs font-bold px-2 py-1 rounded" style={{ 
                backgroundColor: (droughtRisk ?? 0) < -100 ? '#fee2e2' : (droughtRisk ?? 0) < 0 ? '#fef3c7' : '#dcfce7',
                color: (droughtRisk ?? 0) < -100 ? '#991b1b' : (droughtRisk ?? 0) < 0 ? '#92400e' : '#166534'
              }}>
                {(droughtRisk ?? 0) < -100 ? 'Severe' : (droughtRisk ?? 0) < 0 ? 'Moderate' : 'Low'}
              </span>
            )}
          </div>
          <h3 className="text-sm font-medium" style={{ 
            color: droughtRisk !== null && droughtRisk !== undefined && droughtRisk < 0 ? '#991b1b' : '#0369a1'
          }}>Water Balance</h3>
          <div className="text-xl sm:text-2xl font-bold mb-1" style={{ 
            color: droughtRisk !== null && droughtRisk !== undefined && droughtRisk < 0 ? '#991b1b' : '#0c4a6e'
          }}>
            {droughtRisk !== null ? `${Number(droughtRisk).toFixed(0)} mm` : '-'}
          </div>
          <div className="text-sm" style={{ 
            color: droughtRisk !== null && droughtRisk !== undefined && droughtRisk < 0 ? '#991b1b' : '#0369a1'
          }}>
            {droughtRisk !== null && droughtRisk !== undefined ? ((droughtRisk ?? 0) < 0 ? 'Deficit' : 'Surplus') : 'Analysis pending'}
          </div>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => onCardClick('practices')}
            className="p-4 rounded-lg text-center transition-all hover:shadow-md"
            style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac' }}
          >
            <div className="text-sm font-semibold" style={{ color: '#15803d' }}>
              Conservation Practices
            </div>
            <div className="text-xs text-gray-600 mt-1">View recommendations</div>
          </button>

          <button
            onClick={() => onCardClick('concerns')}
            className="p-4 rounded-lg text-center transition-all hover:shadow-md"
            style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}
          >
            <div className="text-sm font-semibold" style={{ color: '#92400e' }}>
              Resource Concerns
            </div>
            <div className="text-xs text-gray-600 mt-1">Identify priorities</div>
          </button>

          <button
            onClick={() => onCardClick('flow')}
            className="p-4 rounded-lg text-center transition-all hover:shadow-md"
            style={{ backgroundColor: '#e0f2fe', border: '1px solid #7dd3fc' }}
          >
            <div className="text-sm font-semibold" style={{ color: '#0369a1' }}>
              Concentrated Flow
            </div>
            <div className="text-xs text-gray-600 mt-1">Gully risk analysis</div>
          </button>

          <button
            onClick={() => onCardClick('zones')}
            className="p-4 rounded-lg text-center transition-all hover:shadow-md"
            style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff' }}
          >
            <div className="text-sm font-semibold" style={{ color: '#6b21a8' }}>
              Management Zones
            </div>
            <div className="text-xs text-gray-600 mt-1">Identify variability</div>
          </button>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${ssurgoData ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-xs text-gray-600">SSURGO Data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${geeData ? 'bg-green-500' : 'bg-yellow-400 animate-pulse'}`}></div>
            <span className="text-xs text-gray-600">GEE Analysis</span>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Enhanced Analysis Sections */}
      {geeData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6">
          {/* Priority Resource Concerns */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <RankedConcernsList geeData={geeData} />
          </div>

          {/* Conservation Practice Recommendations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <PracticeRecommendations geeData={geeData} compact={true} />
          </div>
        </div>
      )}

      {/* Drought Assessment Section */}
      {geeData?.geeAssessment?.drought && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mt-6">
          <DroughtDashboard geeData={geeData} />
        </div>
      )}
    </div>
  )
}
