'use client'

import { useState } from 'react'
import { X, Download, Printer, Share2, TrendingUp, MapPin, Database, Beaker, Mountain, Droplets, Gauge, Microscope, Eye, BarChart3, Layers, Sprout } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { getSoilOrderColor, getTextureColor } from '#src/utils/soilColors'
import type { SSURGOData } from '#src/types/soil'
import type { CDLYearData } from '#src/utils/cdlQuery'

interface SoilDashboardProps {
  ssurgoData: SSURGOData
  cdlHistory?: CDLYearData[] | null
  onClose: () => void
}

export default function SoilDashboard({ ssurgoData, cdlHistory, onClose }: SoilDashboardProps) {
  const [selectedComponent, setSelectedComponent] = useState(0)

  // Get major component or first component
  const majorComp = ssurgoData.components?.find(c => c.majcompflag === 'Yes') || ssurgoData.components?.[0]
  const surfaceHz = majorComp?.horizons?.[0]

  // Prepare property data with status
  const getPropertyStatus = (value: number, ideal: [number, number]): { status: string, color: string } => {
    const [min, max] = ideal
    const midpoint = (min + max) / 2
    const range = max - min
    
    if (value >= min && value <= max) {
      if (Math.abs(value - midpoint) < range * 0.2) {
        return { status: 'Excellent', color: '#10b981' }
      }
      return { status: 'Good', color: '#3b82f6' }
    } else if (Math.abs(value - midpoint) < range * 0.8) {
      return { status: 'Fair', color: '#f59e0b' }
    }
    return { status: 'Poor', color: '#ef4444' }
  }

  const propertyData = surfaceHz ? [
    { name: 'Clay', value: Number(surfaceHz.claytotal_r || 0), unit: '%', ideal: [20, 35] as [number, number] },
    { name: 'Sand', value: Number(surfaceHz.sandtotal_r || 0), unit: '%', ideal: [10, 30] as [number, number] },
    { name: 'OM', value: Number(surfaceHz.om_r || 0), unit: '%', ideal: [2, 5] as [number, number] },
    { name: 'pH', value: Number(surfaceHz.ph1to1h2o_r || 0), unit: '', ideal: [5.5, 7.0] as [number, number] },
    { name: 'AWC', value: Number(surfaceHz.awc_r || 0) * 100, unit: '%', ideal: [10, 20] as [number, number] },
    { name: 'Ksat', value: Number(surfaceHz.ksat_r || 0), unit: 'µm/s', ideal: [1, 10] as [number, number] }
  ].filter(p => p.value > 0).map(p => ({
    ...p,
    ...getPropertyStatus(p.value, p.ideal)
  })) : []

  // Radar chart data
  const radarData = propertyData.slice(0, 5).map(p => ({
    property: p.name,
    value: Math.min(100, (p.value / p.ideal[1]) * 100),
    fullMark: 100
  }))

  // Horizon depth data for stacked bar
  const horizonData = majorComp?.horizons?.map(hz => ({
    name: hz.hzname,
    depth: Number(hz.hzdepb_r || 0) - Number(hz.hzdept_r || 0),
    clay: Number(hz.claytotal_r || 0),
    sand: Number(hz.sandtotal_r || 0),
    om: Number(hz.om_r || 0)
  })) || []

  // Component composition data
  const compositionData = ssurgoData.components?.map(comp => ({
    name: comp.compname,
    value: comp.comppct_r || 0,
    major: comp.majcompflag === 'Yes'
  })) || []

  return (
    <div className="fixed inset-0 z-[2000] overflow-auto" style={{ backgroundColor: '#f1f5f9' }}>
      {/* Header */}
      <div className="shadow-lg sticky top-0 z-10" style={{ background: 'linear-gradient(to right, #0f172a, #1e293b, #0f172a)', color: 'white' }}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #f97316, #ea580c)' }}>
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-3 text-xs mb-1" style={{ color: '#cbd5e1' }}>
                  <Database className="w-3 h-3" />
                  <span>USDA NRCS Soil Data Access</span>
                </div>
                <h1 className="text-xl font-bold" style={{ color: 'white' }}>
                  {ssurgoData.musym} - {ssurgoData.muname}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="px-3 py-2 rounded-lg text-sm flex items-center space-x-2 transition-colors" style={{ backgroundColor: '#334155', color: 'white' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#475569'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#334155'}>
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button className="px-3 py-2 rounded-lg text-sm flex items-center space-x-2 transition-colors" style={{ backgroundColor: '#334155', color: 'white' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#475569'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#334155'}>
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
              <button className="px-3 py-2 rounded-lg text-sm flex items-center space-x-2 transition-colors" style={{ backgroundColor: '#334155', color: 'white' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#475569'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#334155'}>
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-lg text-sm flex items-center space-x-2 transition-colors" style={{ backgroundColor: '#334155', color: 'white' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#475569'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#334155'}
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="container mx-auto px-6 py-6 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        
        {/* Key Metrics Row */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <MapPin className="w-8 h-8 text-blue-500" />
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{ssurgoData.muacres ? `${(Number(ssurgoData.muacres) / 1000).toFixed(1)}K` : 'N/A'}</div>
            <div className="text-sm text-gray-600">Total Acres</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <Layers className="w-8 h-8 text-green-500" />
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Active</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{ssurgoData.components?.length || 0}</div>
            <div className="text-sm text-gray-600">Components</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <Mountain className="w-8 h-8 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{majorComp?.horizons?.length || 0}</div>
            <div className="text-sm text-gray-600">Soil Horizons</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <Beaker className="w-8 h-8 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{surfaceHz?.ph1to1h2o_r ? Number(surfaceHz.ph1to1h2o_r).toFixed(1) : 'N/A'}</div>
            <div className="text-sm text-gray-600">pH Level</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between mb-2">
              <Gauge className="w-8 h-8 text-amber-500" />
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">92%</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">High</div>
            <div className="text-sm text-gray-600">Data Quality</div>
          </div>
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-3 gap-6">
          
          {/* Component Composition */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Component Composition</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={compositionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {compositionData.map((entry, index) => {
                      const colors = ['#10b981', '#3b82f6', '#f59e0b', '#a78bfa', '#ef4444']
                      return <Cell key={`cell-${index}`} fill={entry.major ? colors[0] : colors[index % 4 + 1]} />
                    })}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {compositionData.map((comp, idx) => {
                const colors = ['#10b981', '#3b82f6', '#f59e0b', '#a78bfa', '#ef4444']
                return (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: comp.major ? colors[0] : colors[idx % 4 + 1] }} />
                      <span>{comp.name}</span>
                      {comp.major && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Major</span>}
                    </div>
                    <span className="font-semibold">{comp.value}%</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Property Radar */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span>Property Analysis</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="property" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Properties" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center text-sm text-gray-600">
              Values shown as % of ideal range
            </div>
          </div>

          {/* Horizon Profile */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Mountain className="w-5 h-5 text-purple-600" />
              <span>Horizon Depths</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={horizonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" label={{ value: 'Depth (cm)', position: 'bottom' }} />
                  <YAxis dataKey="name" type="category" width={50} />
                  <BarTooltip />
                  <Bar dataKey="depth" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Property Status Cards */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <Beaker className="w-5 h-5 text-orange-600" />
            <span>Detailed Property Status</span>
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {propertyData.map((prop, idx) => (
              <div key={idx} className="border-2 rounded-lg p-4" style={{ borderColor: prop.color + '40', backgroundColor: prop.color + '10' }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-medium text-gray-600">{prop.name}</div>
                    <div className="text-xs text-gray-500">Ideal: {prop.ideal[0]}-{prop.ideal[1]} {prop.unit}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold" style={{ color: prop.color }}>{prop.value.toFixed(1)}{prop.unit}</div>
                    <div className="text-xs font-medium uppercase tracking-wide" style={{ color: prop.color }}>{prop.status}</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (prop.value / prop.ideal[1]) * 100)}%`,
                      backgroundColor: prop.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Horizon Composition Trends */}
        {horizonData.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <Mountain className="w-5 h-5 text-blue-600" />
              <span>Horizon Property Trends</span>
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={horizonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <BarTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="clay" stroke="#8b5cf6" strokeWidth={2} name="Clay %" />
                  <Line type="monotone" dataKey="sand" stroke="#f59e0b" strokeWidth={2} name="Sand %" />
                  <Line type="monotone" dataKey="om" stroke="#10b981" strokeWidth={2} name="OM %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Cropland History Section */}
        {cdlHistory && cdlHistory.length > 0 ? (
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl shadow-lg p-6 border-2 border-emerald-200">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-emerald-900 mb-2">Cropland Data Layer History</h3>
                <p className="text-sm text-emerald-700 mb-4">
                  {cdlHistory.length} years of USDA NASS crop rotation data (2008-2023) showing agricultural land use patterns and crop diversity.
                </p>
                
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-xs text-emerald-600 mb-1">Years of Data</div>
                    <div className="text-2xl font-bold text-emerald-900">{cdlHistory.length}</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-xs text-emerald-600 mb-1">Unique Crops</div>
                    <div className="text-2xl font-bold text-emerald-900">
                      {new Set(cdlHistory.map(d => d.cropName)).size}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-xs text-emerald-600 mb-1">Rotation Type</div>
                    <div className="text-lg font-bold text-emerald-900">
                      {(() => {
                        const uniqueCrops = new Set(cdlHistory.map(d => d.cropName)).size
                        return uniqueCrops === 1 ? 'Mono' : uniqueCrops === 2 ? '2-Crop' : 'Complex'
                      })()}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-xs text-emerald-600 mb-1">Avg Confidence</div>
                    <div className="text-2xl font-bold text-emerald-900">
                      {Math.round(cdlHistory.reduce((sum, d) => sum + (d.confidence || 0), 0) / cdlHistory.length)}%
                    </div>
                  </div>
                </div>

                {/* Rotation Flow Graph */}
                <div className="bg-white rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-emerald-900 mb-3">Crop Rotation Flow</h4>
                  <div className="relative" style={{ height: '300px' }}>
                    {/* Y-axis labels (crop names) */}
                    <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between pr-4">
                      {(() => {
                        const uniqueCrops = [...new Set(cdlHistory.map(d => d.cropName))].sort()
                        return uniqueCrops.map((crop) => (
                          <div key={crop} className="text-right text-xs font-medium text-gray-700">
                            {crop.length > 20 ? crop.substring(0, 20) + '...' : crop}
                          </div>
                        ))
                      })()}
                    </div>
                    
                    {/* Chart area */}
                    <div className="absolute left-40 right-0 top-0 bottom-12">
                      {/* Grid lines */}
                      <div className="absolute inset-0 flex flex-col justify-between">
                        {[...new Set(cdlHistory.map(d => d.cropName))].map((crop, idx) => (
                          <div key={idx} className="border-t border-gray-200" />
                        ))}
                      </div>
                      
                      {/* Data points */}
                      <div className="absolute inset-0 flex items-stretch">
                        {cdlHistory.sort((a, b) => a.year - b.year).map((yearData, idx) => {
                          const uniqueCrops = [...new Set(cdlHistory.map(d => d.cropName))].sort()
                          const cropIndex = uniqueCrops.indexOf(yearData.cropName)
                          const totalCrops = uniqueCrops.length
                          const yPosition = totalCrops > 1 ? (cropIndex / (totalCrops - 1)) * 100 : 50
                          
                          return (
                            <div key={yearData.year} className="flex-1 relative group">
                              <div 
                                className="absolute left-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md transition-all group-hover:scale-125 group-hover:z-10 cursor-pointer"
                                style={{ 
                                  backgroundColor: yearData.color,
                                  top: `${yPosition}%`,
                                  transform: 'translate(-50%, -50%)'
                                }}
                              />
                              {/* Tooltip on hover */}
                              <div className="absolute left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap pointer-events-none z-20 shadow-lg"
                                style={{ top: `${yPosition}%`, marginTop: '-40px' }}>
                                <div className="font-bold">{yearData.year}</div>
                                <div>{yearData.cropName}</div>
                              </div>
                              {/* Connect lines */}
                              {idx < cdlHistory.length - 1 && (() => {
                                const sortedHistory = cdlHistory.sort((a, b) => a.year - b.year)
                                const nextYear = sortedHistory[idx + 1]
                                const nextCropIndex = uniqueCrops.indexOf(nextYear.cropName)
                                const nextYPosition = totalCrops > 1 ? (nextCropIndex / (totalCrops - 1)) * 100 : 50
                                const height = Math.abs(nextYPosition - yPosition)
                                const topPos = Math.min(yPosition, nextYPosition)
                                
                                return (
                                  <div 
                                    className="absolute left-1/2 w-0.5 bg-emerald-300 opacity-60"
                                    style={{
                                      top: `${topPos}%`,
                                      height: `${height}%`,
                                      right: '-50%'
                                    }}
                                  />
                                )
                              })()}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    
                    {/* X-axis (years) */}
                    <div className="absolute left-40 right-0 bottom-0 flex justify-between text-xs font-medium text-gray-700">
                      {cdlHistory.sort((a, b) => a.year - b.year).map((yearData) => (
                        <div key={yearData.year} className="flex-1 text-center">
                          {yearData.year}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Crop frequency chart */}
                <div className="bg-white rounded-lg p-4 mt-4">
                  <h4 className="text-sm font-semibold text-emerald-900 mb-3">Crop Distribution</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={(() => {
                      const cropData: Record<string, { count: number, color: string }> = {}
                      cdlHistory.forEach(d => {
                        if (!cropData[d.cropName]) {
                          cropData[d.cropName] = { count: 0, color: d.color }
                        }
                        cropData[d.cropName].count++
                      })
                      return Object.entries(cropData)
                        .map(([name, data]) => ({ name, years: data.count, fill: data.color }))
                        .sort((a, b) => b.years - a.years)
                        .slice(0, 5)
                    })()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                      <YAxis label={{ value: 'Years', angle: -90, position: 'insideLeft' }} />
                      <BarTooltip />
                      <Bar dataKey="years" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Recent crops timeline */}
                <div className="bg-white rounded-lg p-4 mt-4">
                  <h4 className="text-sm font-semibold text-emerald-900 mb-3">Recent Years (Last 5)</h4>
                  <div className="space-y-2">
                    {/* Header row */}
                    <div className="flex items-center space-x-3 pb-2 border-b border-gray-200">
                      <span className="text-xs font-semibold text-gray-600 w-12">Year</span>
                      <span className="text-xs font-semibold text-gray-600 w-6">Type</span>
                      <span className="text-xs font-semibold text-gray-600 flex-1">Crop</span>
                      <span className="text-xs font-semibold text-gray-600">Estimated Confidence</span>
                    </div>
                    {cdlHistory.slice(-5).reverse().map((yearData) => (
                      <div key={yearData.year} className="flex items-center space-x-3">
                        <span className="text-xs font-bold text-gray-700 w-12">{yearData.year}</span>
                        {yearData.cropType && (
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                            yearData.cropType === 'annual' ? 'bg-blue-100 text-blue-800' :
                            yearData.cropType === 'perennial' ? 'bg-purple-100 text-purple-800' :
                            yearData.cropType === 'permanent' ? 'bg-red-100 text-red-800' :
                            yearData.cropType === 'pasture' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {yearData.cropType === 'annual' ? 'A' :
                             yearData.cropType === 'perennial' ? 'P' :
                             yearData.cropType === 'permanent' ? '🌳' :
                             yearData.cropType === 'pasture' ? '🌾' : '?'}
                          </span>
                        )}
                        <div className="flex-1 flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded border border-gray-300"
                            style={{ backgroundColor: yearData.color }}
                          />
                          <span className="text-sm text-gray-900">{yearData.cropName}</span>
                        </div>
                        {yearData.confidence && (
                          <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                            yearData.confidence >= 80 ? 'bg-green-100 text-green-800' :
                            yearData.confidence >= 50 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {yearData.confidence}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg p-6 border-2 border-gray-200">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-400 rounded-lg flex items-center justify-center">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Cropland Data Layer History</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Click on the map to query USDA NASS Cropland Data Layer history for this location. View 16 years of crop rotation patterns and agricultural land use.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span>Map Unit Key: <span className="font-mono font-medium text-gray-900">{ssurgoData.mukey}</span></span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>{ssurgoData.coordinates[0].toFixed(4)}, {ssurgoData.coordinates[1].toFixed(4)}</span>
              </div>
            </div>
            <div className="text-gray-500">
              Generated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
