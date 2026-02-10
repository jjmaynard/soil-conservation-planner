// Climate History Component - Comprehensive Climate Analysis via GEE
'use client'

import { useEffect } from 'react'
import { 
  CloudRain, 
  Thermometer, 
  Droplets, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  Calendar,
  Sun,
  Snowflake,
  Wind,
  Sprout,
  Layers,
  Info
} from 'lucide-react'
import type { EnhancedFieldData } from '#hooks/useComprehensiveFieldAssessment'
import { useClimateHistory } from '@/hooks/useClimateHistory'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area
} from 'recharts'

interface ClimateHistoryProps {
  fieldId?: string
  geeData: EnhancedFieldData | null
  wkt?: string
}

export default function ClimateHistory({ fieldId, geeData, wkt }: ClimateHistoryProps) {
  const { data, loading, error, refetch } = useClimateHistory({
    wkt,
    autoFetch: true
  })

  useEffect(() => {
    if (wkt && !data && !loading) {
      refetch()
    }
  }, [wkt])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500">Retrieving comprehensive climate history...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="font-semibold">Error Loading Climate Data</h3>
        </div>
        <p className="text-sm">{error.message}</p>
        <button 
          onClick={() => refetch()}
          className="mt-3 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-sm font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <CloudRain className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-gray-600">No climate data available.</p>
        {!wkt && <p className="text-sm text-gray-500 mt-1">Field boundary (WKT) is missing.</p>}
      </div>
    )
  }

  const { 
    precipitation, 
    temperature, 
    soil_conditions, 
    crop_suitability, 
    temporal_coverage,
    management_windows,
    conservation_planning
  } = data

  // Prepare chart data
  const monthlyData = Object.keys(precipitation.monthly_normals_mm).map(month => ({
    name: month,
    precip: precipitation.monthly_normals_mm[month],
    tmax: temperature.monthly_normals.tmax[month],
    tmin: temperature.monthly_normals.tmin[month],
    tmean: temperature.monthly_normals.tmean[month],
    gdd: temperature.thermal_time.accumulated_by_month[month]
  }))

  const sourceText = data.data_sources.precipitation === data.data_sources.temperature 
    ? data.data_sources.precipitation
    : `${data.data_sources.precipitation} & ${data.data_sources.temperature}`

  return (
    <div className="space-y-8">
      {/* Header Summary */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Climate Analysis Summary</h3>
            <p className="text-sm text-gray-600 mt-1">
              Based on {temporal_coverage.years} years of record ({temporal_coverage.period_of_record})
              with {temporal_coverage.data_completeness_pct}% data completeness.
              Source: {sourceText}.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white p-3 rounded border border-blue-100">
            <p className="text-xs text-gray-500 mb-1">Annual Precip</p>
            <p className="text-lg font-bold text-gray-900">{precipitation.annual.mean.toFixed(1)} mm</p>
            <p className="text-xs text-blue-600">{precipitation.annual.current_year_percentile}th percentile (Current)</p>
          </div>
          <div className="bg-white p-3 rounded border border-blue-100">
            <p className="text-xs text-gray-500 mb-1">Mean Temp</p>
            <p className="text-lg font-bold text-gray-900">{temperature.annual.mean_c.toFixed(1)}°C</p>
            <p className="text-xs text-gray-400">Range: {temperature.annual.min_c}°C - {temperature.annual.max_c}°C</p>
          </div>
          <div className="bg-white p-3 rounded border border-blue-100">
            <p className="text-xs text-gray-500 mb-1">Frost-Free Days</p>
            <p className="text-lg font-bold text-gray-900">{temperature.growing_season.frost_free_days}</p>
            <p className="text-xs text-green-600">80% Prob: {temperature.growing_season.frost_free_days_80pct_probability} days</p>
          </div>
          <div className="bg-white p-3 rounded border border-blue-100">
            <p className="text-xs text-gray-500 mb-1">GDD (Base 10°C)</p>
            <p className="text-lg font-bold text-gray-900">{temperature.thermal_time.gdd_base_10c.toFixed(0)}</p>
            <p className="text-xs text-orange-600">Apr-Oct: {temperature.thermal_time.gdd_apr_oct.toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gray-500" />
          Monthly Climate Normals
        </h4>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" orientation="left" label={{ value: 'Precip (mm)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Temp (°C)', angle: 90, position: 'insideRight' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar yAxisId="left" dataKey="precip" name="Precipitation" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
              <Line yAxisId="right" type="monotone" dataKey="tmax" name="Max Temp" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="tmin" name="Min Temp" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="tmean" name="Mean Temp" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Precipitation Details */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-blue-500" />
            Precipitation & Water
          </h4>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden text-sm">
            <table className="w-full">
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50">
                  <td className="p-3 text-gray-600">Growing Season (Apr-Oct)</td>
                  <td className="p-3 font-medium text-right">{precipitation.growing_season.apr_oct_mean_mm} mm</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3 text-gray-600">Maximum Daily Precip</td>
                  <td className="p-3 font-medium text-right text-orange-600">{precipitation.intensity_statistics.max_daily_mm} mm</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3 text-gray-600">Days > 25mm (1 inch)</td>
                  <td className="p-3 font-medium text-right">{precipitation.intensity_statistics.days_over_25mm_per_year}/yr</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3 text-gray-600">Max Consecutive Dry Days</td>
                  <td className="p-3 font-medium text-right text-red-600">{precipitation.drought_metrics.consecutive_dry_days_max} days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Temperature Details */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-red-500" />
            Temperature & Extremes
          </h4>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden text-sm">
            <table className="w-full">
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50">
                  <td className="p-3 text-gray-600">Last Spring Freeze</td>
                  <td className="p-3 font-medium text-right">{temperature.growing_season.last_spring_freeze_date}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3 text-gray-600">First Fall Freeze</td>
                  <td className="p-3 font-medium text-right">{temperature.growing_season.first_fall_freeze_date}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3 text-gray-600">Days > 32°C (90°F)</td>
                  <td className="p-3 font-medium text-right text-orange-600">{temperature.critical_thresholds.days_above_32c}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3 text-gray-600">Extreme Min Temp</td>
                  <td className="p-3 font-medium text-right text-blue-600">{temperature.annual.extreme_min_c}°C</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Crop Suitability & Conditions */}
      <h4 className="font-semibold text-gray-800 pt-4 flex items-center gap-2">
        <Sprout className="w-5 h-5 text-green-600" />
        Crop Suitability & Management
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(crop_suitability).map(([crop, info]) => (
          <div key={crop} className="bg-green-50 rounded-lg p-4 border border-green-100">
            <h5 className="font-bold text-green-900 capitalize mb-2">{crop.replace('_', ' ')}</h5>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">GDD Adequacy:</span>
                <span className="font-medium">{info.gdd_adequacy}</span>
              </div>
              {info.planting_window && (
                 <div className="flex justify-between">
                 <span className="text-green-700">Planting:</span>
                 <span className="font-medium">{info.planting_window}</span>
               </div>
              )}
               {info.spring_planting_window && (
                 <div className="flex justify-between">
                 <span className="text-green-700">Spring Planting:</span>
                 <span className="font-medium">{info.spring_planting_window}</span>
               </div>
              )}
               {info.risk_level && (
                 <div className="flex justify-between">
                 <span className="text-green-700">Risk:</span>
                 <span className={`font-medium ${info.risk_level === 'low' ? 'text-green-600' : 'text-orange-600'}`}>{info.risk_level}</span>
               </div>
               )}
            </div>
          </div>
        ))}
      </div>

      {/* Management Windows - Accordion style or Cards */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-600" />
          Field Operations Windows
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div>
            <span className="font-medium text-slate-700 block mb-1">Spring Field Work</span>
            <ul className="list-disc list-inside text-slate-600 space-y-0.5">
              <li>Earliest Safe Date: <span className="font-medium text-slate-800">{management_windows.spring_field_work?.earliest_safe_date || 'N/A'}</span></li>
              <li>Optimal Start: <span className="font-medium text-slate-800">{management_windows.spring_field_work?.optimal_start_date || 'N/A'}</span></li>
            </ul>
          </div>
          <div>
            <span className="font-medium text-slate-700 block mb-1">Conservation Planning</span>
            <ul className="list-disc list-inside text-slate-600 space-y-0.5">
              <li>Critical Erosion Period: <span className="font-medium text-red-600">{conservation_planning.critical_erosion_period}</span></li>
              <li>Cover Needed: <span className="font-medium text-slate-800">{conservation_planning.cover_needed_period}</span></li>
            </ul>
          </div>
           <div>
            <span className="font-medium text-slate-700 block mb-1">Soil Workability</span>
            <ul className="list-disc list-inside text-slate-600 space-y-0.5">
              <li>Spring Median: <span className="font-medium text-slate-800">{soil_conditions.workability.spring_workable_date_median}</span></li>
              <li>Fall Median: <span className="font-medium text-slate-800">{soil_conditions.workability.fall_workable_date_median}</span></li>
            </ul>
          </div>
          <div>
            <span className="font-medium text-slate-700 block mb-1">Erosion Risk</span>
            <ul className="list-disc list-inside text-slate-600 space-y-0.5">
              <li>High Risk Period: <span className="font-medium text-slate-800">{soil_conditions.erosion_risk.high_risk_period}</span></li>
              <li>Erosive Rain Days: <span className="font-medium text-slate-800">{soil_conditions.erosion_risk.erosive_rainfall_days_per_year}/yr</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

