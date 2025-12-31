// Property Panel Component for Displaying Soil Profile Data

'use client'

import {
  BarChart3,
  Beaker,
  Building2,
  Calendar,
  Clover,
  Database,
  Download,
  Droplets,
  Eye,
  Gauge,
  HelpCircle,
  Layers,
  MapPin,
  Maximize2,
  Microscope,
  Minimize2,
  MinusCircle,
  Mountain,
  PieChart,
  Repeat,
  TreeDeciduous,
  TrendingUp,
  Waves,
  X,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useOSDData } from '#src/hooks/useOSDData'
import OSDPanel from '#src/components/ui/OSDPanel'
import { getDescriptionText } from '#src/utils/osdDescriptionLoader'
import { LCCFormatter } from '#src/lib/lcc-formatter'
import {
  Bar,
  BarChart,
  ResponsiveContainer as BarResponsiveContainer,
  Tooltip as BarTooltip,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { SoilProfile, SSURGOData } from '#src/types/soil'
import type { CDLYearData } from '#src/utils/cdlQuery'
import { formatCoordinates } from '#src/utils/geoUtils'
import { getSoilOrderColor, getTextureColor } from '#src/utils/soilColors'
import { LAND_CAPABILITY_INTERPRETATIONS } from '#src/utils/soilInterpretations'

// Dynamically import the full-screen dashboard
const SoilDashboard = dynamic(() => import('./SoilDashboard'), { ssr: false })

// Soil Property Ranges for Classification
const soilPropertyRanges: Record<
  string,
  Array<{ min: number; max: number; label: string; color: string }>
> = {
  clay: [
    { min: 0, max: 5, label: 'Very Low', color: 'var(--color-amber-100)' },
    { min: 5, max: 15, label: 'Low', color: 'var(--color-amber-200)' },
    { min: 15, max: 25, label: 'Moderate', color: 'var(--color-amber-300)' },
    { min: 25, max: 35, label: 'Moderately High', color: 'var(--color-amber-400)' },
    { min: 35, max: 45, label: 'High', color: 'var(--color-amber-500)' },
    { min: 45, max: 55, label: 'Very High', color: 'var(--color-amber-600)' },
    { min: 55, max: 70, label: 'Extremely High', color: 'var(--color-amber-700)' },
    { min: 70, max: 100, label: 'Maximum', color: 'var(--color-amber-800)' },
  ],
  om: [
    { min: 0, max: 0.5, label: 'Very Low', color: 'var(--color-clay-100)' },
    { min: 0.5, max: 1, label: 'Low', color: 'var(--color-clay-200)' },
    { min: 1, max: 2, label: 'Moderate', color: 'var(--color-clay-300)' },
    { min: 2, max: 4, label: 'Moderate-High', color: 'var(--color-clay-400)' },
    { min: 4, max: 6, label: 'High', color: 'var(--color-clay-500)' },
    { min: 6, max: 10, label: 'Very High', color: 'var(--color-clay-600)' },
    { min: 10, max: 20, label: 'Extremely High', color: 'var(--color-clay-700)' },
    { min: 20, max: 100, label: 'Organic', color: 'var(--color-clay-800)' },
  ],
  ph: [
    { min: 3.0, max: 4.5, label: 'Extremely Acid', color: 'var(--color-clay-600)' },
    { min: 4.5, max: 5.0, label: 'Very Strongly Acid', color: 'var(--color-sunset-500)' },
    { min: 5.0, max: 5.5, label: 'Strongly Acid', color: 'var(--color-sunset-400)' },
    { min: 5.5, max: 6.0, label: 'Moderately Acid', color: 'var(--color-amber-500)' },
    { min: 6.0, max: 6.5, label: 'Slightly Acid', color: 'var(--color-amber-400)' },
    { min: 6.5, max: 7.3, label: 'Neutral', color: 'var(--color-forest-500)' },
    { min: 7.3, max: 8.0, label: 'Slightly Alkaline', color: 'var(--color-ocean-400)' },
    { min: 8.0, max: 8.5, label: 'Moderately Alkaline', color: 'var(--color-ocean-600)' },
    { min: 8.5, max: 10.5, label: 'Strongly Alkaline', color: 'var(--color-lavender-600)' },
  ],
  awc: [
    { min: 0.0, max: 0.05, label: 'Very Low', color: 'var(--color-clay-200)' },
    { min: 0.05, max: 0.1, label: 'Low', color: 'var(--color-sunset-300)' },
    { min: 0.1, max: 0.15, label: 'Moderately Low', color: 'var(--color-amber-400)' },
    { min: 0.15, max: 0.2, label: 'Moderate', color: 'var(--color-sky-400)' },
    { min: 0.2, max: 0.25, label: 'Moderately High', color: 'var(--color-ocean-500)' },
    { min: 0.25, max: 0.3, label: 'High', color: 'var(--color-ocean-600)' },
    { min: 0.3, max: 0.4, label: 'Very High', color: 'var(--color-ocean-700)' },
    { min: 0.4, max: 0.6, label: 'Extremely High', color: 'var(--color-ocean-800)' },
  ],
  ksat: [
    { min: 0.001, max: 0.1, label: 'Very Slow', color: 'var(--color-charcoal-900)' },
    { min: 0.1, max: 1, label: 'Slow', color: 'var(--color-charcoal-800)' },
    { min: 1, max: 4, label: 'Moderately Slow', color: 'var(--color-lavender-800)' },
    { min: 4, max: 14, label: 'Moderate', color: 'var(--color-lavender-600)' },
    { min: 14, max: 40, label: 'Moderately Rapid', color: 'var(--color-lavender-500)' },
    { min: 40, max: 140, label: 'Rapid', color: 'var(--color-lavender-400)' },
    { min: 140, max: 400, label: 'Very Rapid', color: 'var(--color-lavender-300)' },
    { min: 400, max: 2000, label: 'Extremely Rapid', color: 'var(--color-lavender-100)' },
  ],
}

// Classify property value
function classifyProperty(value: number, property: string): { color: string; label: string } {
  const ranges = soilPropertyRanges[property]
  if (!ranges) return { color: 'var(--color-slate-300)', label: 'Unknown' }

  for (let i = 0; i < ranges.length - 1; i++) {
    if (value >= ranges[i].min && value < ranges[i].max) {
      return { color: ranges[i].color, label: ranges[i].label }
    }
  }

  const lastRange = ranges[ranges.length - 1]
  if (value >= lastRange.min && value <= lastRange.max) {
    return { color: lastRange.color, label: lastRange.label }
  }

  return { color: 'var(--color-slate-300)', label: 'Unknown' }
}

// USDA Texture Classification Function
function getTextureClass(sand: number, silt: number, clay: number): string {
  const silt_clay = silt + 1.5 * clay
  const silt_2_clay = silt + 2.0 * clay

  if (silt_clay < 15) {
    return 'Sand'
  }
  if (silt_clay < 30) {
    return 'Loamy sand'
  }
  if (
    (clay >= 7 && clay <= 20 && sand > 52 && silt_2_clay >= 30) ||
    (clay < 7 && silt < 50 && silt_2_clay >= 30)
  ) {
    return 'Sandy loam'
  }
  if (clay >= 7 && clay <= 27 && silt >= 28 && silt < 50 && sand <= 52) {
    return 'Loam'
  }
  if ((silt >= 50 && clay >= 12 && clay < 27) || (silt >= 50 && silt < 80 && clay < 12)) {
    return 'Silt loam'
  }
  if (silt >= 80 && clay < 12) {
    return 'Silt'
  }
  if (clay >= 20 && clay < 35 && silt < 28 && sand > 45) {
    return 'Sandy clay loam'
  }
  if (clay >= 27 && clay < 40 && sand > 20 && sand <= 45) {
    return 'Clay loam'
  }
  if (clay >= 27 && clay < 40 && sand <= 20) {
    return 'Silty clay loam'
  }
  if (clay >= 35 && sand >= 45) {
    return 'Sandy clay'
  }
  if (clay >= 40 && silt >= 40) {
    return 'Silty clay'
  } else if (clay >= 40 && sand <= 45 && silt < 40) {
    return 'Clay'
  } else {
    return 'Unknown'
  }
}

// Get color for texture class
function getTextureClassColor(textureClass: string): string {
  const colorMap: Record<string, string> = {
    Sand: 'var(--color-sand-200)',
    'Loamy sand': 'var(--color-sand-300)',
    'Sandy loam': 'var(--color-sand-400)',
    Loam: 'var(--color-sand-600)',
    'Silt loam': 'var(--color-earth-400)',
    Silt: 'var(--color-earth-500)',
    'Sandy clay loam': 'var(--color-earth-600)',
    'Clay loam': 'var(--color-clay-600)',
    'Silty clay loam': 'var(--color-clay-500)',
    'Sandy clay': 'var(--color-clay-700)',
    'Silty clay': 'var(--color-clay-800)',
    Clay: 'var(--color-clay-900)',
    Unknown: 'var(--color-slate-300)',
  }
  return colorMap[textureClass] || 'var(--color-slate-300)'
}

// Component to display just the OSD text description at the top of each component
// Component to display just the OSD text description at the top of each component
function ComponentOSDDescription({ componentName }: { componentName: string }) {
  const [descriptionText, setDescriptionText] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (componentName) {
      setLoading(true)
      getDescriptionText(componentName)
        .then(text => {
          setDescriptionText(text)
          setLoading(false)
        })
        .catch(error => {
          console.error('Failed to load description:', error)
          setLoading(false)
        })
    }
  }, [componentName])

  if (!descriptionText || loading) return null

  return (
    <div className="p-3 mb-4 rounded-r" style={{ backgroundColor: '#eff6ff', borderLeft: '4px solid #60a5fa' }}>
      <h4 className="text-xs font-bold mb-2" style={{ color: '#1e3a8a' }}>Soil Description</h4>
      <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: '#1e40af' }}>{descriptionText}</p>
    </div>
  )
}

// Component for comparing all component profiles side-by-side
function ProfileComparisonModal({ 
  components, 
  onClose 
}: { 
  components: any[]
  onClose: () => void 
}) {
  const [compareProperty, setCompareProperty] = useState<'texture' | 'clay' | 'om' | 'ph' | 'awc' | 'ksat'>('texture')

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 10000 }}
      onClick={onClose}
    >
      <div 
        className="rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        style={{ backgroundColor: '#ffffff' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ background: 'linear-gradient(to right, var(--color-ocean-600), var(--color-ocean-500))', color: '#ffffff' }}>
          <div>
            <h2 className="text-xl" style={{ fontWeight: 'bold', fontSize: '20px' }}>Component Profile Comparison</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded p-2 transition-colors"
            style={{ color: '#ffffff' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '24px', height: '24px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Property Selector */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Display Property:</span>
            <select
              value={compareProperty}
              onChange={e => setCompareProperty(e.target.value as any)}
              className="border-gray-300 rounded border bg-white px-3 py-1.5 text-sm"
            >
              <option value="texture">Texture</option>
              <option value="clay">Clay %</option>
              <option value="om">Organic Matter %</option>
              <option value="ph">pH</option>
              <option value="awc">AWC</option>
              <option value="ksat">Ksat</option>
            </select>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6">
          {(() => {
            // Calculate the maximum depth across ALL components for consistent y-axis
            const globalMaxDepth = Math.max(
              ...components
                .filter(comp => comp.horizons && comp.horizons.length > 0)
                .map(comp => Math.max(...comp.horizons.map((h: any) => Number(h.hzdepb_r) || 0)))
            )

            return (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: `repeat(${Math.min(components.length, 4)}, minmax(200px, 1fr))`,
                gap: '24px',
                alignItems: 'start'
              }}>
                {components.map((comp, compIdx) => {
                  if (!comp.horizons || comp.horizons.length === 0) return null

                  return (
                    <div key={compIdx} style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Component Header */}
                  <div 
                    className="px-3 py-2 rounded-t-lg"
                    style={{ 
                      backgroundColor: 'var(--color-ocean-600)', 
                      color: '#ffffff',
                      background: 'var(--color-ocean-600)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{comp.compname}</span>
                      {comp.majcompflag === 'Yes' && (
                        <span 
                          style={{ 
                            backgroundColor: '#d97706',
                            color: '#ffffff',
                            fontSize: '12px',
                            fontWeight: '500',
                            borderRadius: '9999px',
                            paddingLeft: '8px',
                            paddingRight: '8px',
                            paddingTop: '2px',
                            paddingBottom: '2px',
                            display: 'inline-block'
                          }}
                        >
                          Major
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.9 }}>{comp.comppct_r}% of map unit</div>
                  </div>

                  {/* Profile Visualization */}
                  <div className="border border-t-0 border-gray-300 rounded-b-lg p-3" style={{ backgroundColor: '#f9fafb', flex: 1 }}>
                    <div className="relative h-96">
                      <div style={{ width: '100%', height: '100%', position: 'relative', paddingLeft: '40px' }}>
                        {/* Y-axis line */}
                        <div style={{
                          position: 'absolute',
                          left: '35px',
                          top: '0',
                          bottom: '0',
                          width: '1px',
                          backgroundColor: '#666',
                          opacity: 0.3,
                        }} />
                        
                        {comp.horizons.map((hz: any, hzIdx: number) => {
                          const top = Number(hz.hzdept_r) || 0
                          const bottom = Number(hz.hzdepb_r) || 0
                          const thickness = bottom - top
                          const topPercent = (top / globalMaxDepth) * 100
                          const heightPercent = (thickness / globalMaxDepth) * 100

                          let displayColor = '#d1d5db'
                          let textColor = 'white'

                          const sand = Number(hz.sandtotal_r)
                          const silt = Number(hz.silttotal_r)
                          const clay = Number(hz.claytotal_r)

                          if (compareProperty === 'texture') {
                            if (!isNaN(sand) && !isNaN(silt) && !isNaN(clay)) {
                              const textureClass = getTextureClass(sand, silt, clay)
                              displayColor = getTextureClassColor(textureClass)
                              textColor = ['Sand', 'Loamy sand', 'Silt'].includes(textureClass) ? '#333' : 'white'
                            }
                          } else {
                            const propertyMap: Record<string, string> = {
                              clay: 'claytotal_r',
                              om: 'om_r',
                              ph: 'ph1to1h2o_r',
                              awc: 'awc_r',
                              ksat: 'ksat_r',
                            }

                            const fieldName = propertyMap[compareProperty]
                            const value = Number((hz as any)[fieldName])

                            if (!isNaN(value)) {
                              const classification = classifyProperty(value, compareProperty)
                              displayColor = classification.color
                              const isDark = compareProperty === 'ksat' || (compareProperty === 'clay' && value > 25) || (compareProperty === 'om' && value > 1)
                              textColor = isDark ? 'white' : '#333'
                            }
                          }

                          return (
                            <div
                              key={hzIdx}
                              style={{
                                position: 'absolute',
                                top: `${topPercent}%`,
                                left: '40px',
                                right: '0',
                                height: `${heightPercent}%`,
                                background: displayColor,
                                backgroundColor: displayColor,
                                border: '1px solid #666',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: textColor,
                                fontWeight: 'bold',
                                fontSize: '11px',
                                textShadow: textColor === 'white' ? '1px 1px 2px rgba(0,0,0,0.8)' : 'none',
                              }}
                              title={`${hz.hzname || `H${hzIdx + 1}`} (${top}-${bottom} cm)\nTexture: ${
                                !isNaN(sand) && !isNaN(silt) && !isNaN(clay) ? getTextureClass(sand, silt, clay) : 'N/A'
                              }\nClay: ${!isNaN(clay) ? clay.toFixed(1) : 'N/A'}%\nOM: ${
                                !isNaN(Number(hz.om_r)) ? Number(hz.om_r).toFixed(2) : 'N/A'
                              }%\npH: ${
                                !isNaN(Number(hz.ph1to1h2o_r)) ? Number(hz.ph1to1h2o_r).toFixed(1) : 'N/A'
                              }\nAWC: ${
                                !isNaN(Number(hz.awc_r)) ? Number(hz.awc_r).toFixed(2) : 'N/A'
                              }\nKsat: ${
                                !isNaN(Number(hz.ksat_r)) ? Number(hz.ksat_r).toFixed(1) : 'N/A'
                              } µm/s`}
                            >
                              {hz.hzname || `H${hzIdx + 1}`}
                            </div>
                          )
                        })}

                        {/* Depth scale */}
                        <div style={{
                          position: 'absolute',
                          left: '0',
                          top: '0',
                          height: '100%',
                          width: '35px',
                          fontSize: '9px',
                          color: '#666',
                        }}>
                          {(() => {
                            const depths = new Set<number>()
                            depths.add(0)
                            depths.add(globalMaxDepth)
                            comp.horizons.forEach((h: any) => {
                              const top = Number(h.hzdept_r)
                              const bottom = Number(h.hzdepb_r)
                              if (!isNaN(top)) depths.add(top)
                              if (!isNaN(bottom)) depths.add(bottom)
                            })

                            return Array.from(depths)
                              .sort((a, b) => a - b)
                              .map((depth, idx) => {
                                const topPercent = (depth / globalMaxDepth) * 100
                                return (
                                  <div
                                    key={idx}
                                    style={{
                                      position: 'absolute',
                                      top: `${topPercent}%`,
                                      right: '0',
                                      width: '100%',
                                      textAlign: 'right',
                                      transform: 'translateY(-50%)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'flex-end',
                                      gap: '2px',
                                    }}
                                  >
                                    <span style={{ fontWeight: depth === 0 || depth === globalMaxDepth ? 'bold' : 'normal' }}>
                                      {depth}
                                    </span>
                                    <div style={{
                                      width: '5px',
                                      height: '1px',
                                      backgroundColor: '#666',
                                      opacity: 0.3,
                                    }} />
                                  </div>
                                )
                              })
                          })()}
                        </div>
                      </div>
                    </div>
                    </div>
                  </div>
                )
              })}
              </div>
            )
          })()}
          {/* Legend */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-gray-600 text-sm">
              {compareProperty === 'texture' ? (
                <>
                  <div className="mb-2 font-semibold">USDA Texture Classes:</div>
                  <div className="grid grid-cols-3 gap-x-6 gap-y-2">
                    {[
                      { color: 'var(--color-sand-200)', label: 'Sand' },
                      { color: 'var(--color-sand-300)', label: 'Loamy sand' },
                      { color: 'var(--color-sand-400)', label: 'Sandy loam' },
                      { color: 'var(--color-sand-600)', label: 'Loam' },
                      { color: 'var(--color-earth-400)', label: 'Silt loam' },
                      { color: 'var(--color-earth-500)', label: 'Silt' },
                      { color: 'var(--color-earth-600)', label: 'Sandy clay loam' },
                      { color: 'var(--color-clay-600)', label: 'Clay loam' },
                      { color: 'var(--color-clay-500)', label: 'Silty clay loam' },
                      { color: 'var(--color-clay-700)', label: 'Sandy clay' },
                      { color: 'var(--color-clay-800)', label: 'Silty clay' },
                      { color: 'var(--color-clay-900)', label: 'Clay' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded" style={{ backgroundColor: item.color }} />
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-2 font-semibold">
                    {compareProperty === 'clay' && 'Clay Content (%)'}
                    {compareProperty === 'om' && 'Organic Matter (%)'}
                    {compareProperty === 'ph' && 'pH'}
                    {compareProperty === 'awc' && 'Available Water Capacity'}
                    {compareProperty === 'ksat' && 'Saturated Hydraulic Conductivity (µm/s)'}
                  </div>
                  <div className="grid grid-cols-4 gap-x-6 gap-y-2">
                    {soilPropertyRanges[compareProperty]?.map((range, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded" style={{ backgroundColor: range.color }} />
                        <span>
                          {range.label} ({range.min}
                          {idx === soilPropertyRanges[compareProperty].length - 1 ? '+' : `-${range.max}`})
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Component for individual component details with OSD integration
function ComponentDetailsSection({ 
  comp, 
  idx,
  allComponents,
  isExpanded,
  onToggle
}: { 
  comp: any
  idx: number 
  allComponents: any[]
  isExpanded: boolean
  onToggle: () => void
}) {
  const { osdData, isLoading: osdLoading } = useOSDData(comp.compname, true)
  
  // Use the same color assignment logic as Map Unit Composition - 12 unique colors
  const colors = [
    'var(--color-forest-600)',   // Green
    'var(--color-ocean-500)',    // Blue
    'var(--color-amber-500)',    // Orange
    'var(--color-lavender-600)', // Purple
    'var(--color-copper-500)',   // Brown
    'var(--color-sunset-500)',   // Red-orange
    'var(--color-sky-500)',      // Light blue
    'var(--color-moss-600)',     // Olive
    'var(--color-clay-600)',     // Red
    'var(--color-sage-600)',     // Gray-green
    'var(--color-earth-500)',    // Tan
    'var(--color-slate-600)'     // Gray-blue
  ]
  const bgColor = colors[idx % colors.length]
  
  return (
    <details key={idx} open={isExpanded} className="group">
      <summary
        onClick={(e) => {
          e.preventDefault()
          onToggle()
        }}
        className="rounded-lg border-2 p-4 cursor-pointer list-none transition-all hover:shadow-md mb-2 relative overflow-hidden"
        style={{ borderColor: bgColor }}
      >
        {/* Background layer with opacity */}
        <div 
          className="absolute inset-0 -z-10"
          style={{ 
            backgroundColor: bgColor,
            opacity: 0.08
          }}
        />
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <svg
            className="h-5 w-5 transition-transform group-open:rotate-90 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            style={{ color: bgColor }}
          >
            <path d="M6 6L14 10L6 14V6Z" />
          </svg>
          <div className="flex items-center justify-between flex-1 min-w-0 gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-gray-900">{comp.compname}</h3>
              {comp.majcompflag === 'Yes' && (
                <span 
                  className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                  style={{ backgroundColor: '#d97706', color: 'white' }}
                >
                  Major
                </span>
              )}
            </div>
            <span className="text-base font-semibold text-gray-700 whitespace-nowrap">{comp.comppct_r}%</span>
          </div>
        </div>
      </summary>
      <div className="bg-gray-50 pt-2">
        {/* OSD Panel Content - Direct Integration */}
        <div className="pb-4">
          <OSDPanel 
            osdData={osdData} 
            isLoading={osdLoading} 
            interpretations={comp.interpretations}
            ssurgoHorizons={comp.horizons}
            componentEcoSite={comp.ecoclassid ? {
              ecoclassid: comp.ecoclassid,
              ecoclassname: comp.ecoclassname
            } : undefined}
            components={[comp]}
            componentColor={bgColor}
          />
        </div>
      </div>
    </details>
  )
}

interface PropertyPanelProps {
  profile?: SoilProfile | null
  ssurgoData?: SSURGOData | null
  cdlHistory?: CDLYearData[] | null
  onClose: () => void
  className?: string
}

export default function PropertyPanel({
  profile,
  ssurgoData,
  cdlHistory,
  onClose,
  className = '',
}: PropertyPanelProps) {
  const [activeTab, setActiveTab] = useState<
    'profile' | 'ssurgo' | 'components' | 'horizons' | 'cropland'
  >('components')
  const [compositionView, setCompositionView] = useState<'bar' | 'pie'>('bar')
  const [chartKey, setChartKey] = useState(0)
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [showFullDashboard, setShowFullDashboard] = useState(false)
  const [dashboardHover, setDashboardHover] = useState(false)
  const [profileProperty, setProfileProperty] = useState<'texture' | 'clay' | 'om' | 'ph' | 'awc' | 'ksat'>(
    'texture',
  )
  const [showExpandedCDLChart, setShowExpandedCDLChart] = useState(false)
  const [showProfileComparison, setShowProfileComparison] = useState(false)
  const [showIrrigatedLCC, setShowIrrigatedLCC] = useState(false)
  const [expandedComponents, setExpandedComponents] = useState<Set<number>>(new Set())
  
  // Draggable state
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isExpanded, setIsExpanded] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Force chart re-render when composition view changes
  useEffect(() => {
    if (compositionView === 'pie') {
      setTimeout(() => setChartKey(prev => prev + 1), 100)
    }
  }, [compositionView])

  // Toggle component expansion state
  const toggleComponentExpansion = (idx: number) => {
    setExpandedComponents(prev => {
      const newSet = new Set(prev)
      if (newSet.has(idx)) {
        newSet.delete(idx)
      } else {
        newSet.add(idx)
      }
      return newSet
    })
  }

  // Helper function for property status classification
  const getPropertyStatus = (value: number, ideal: [number, number]): { status: string; styles: { color: string; backgroundColor: string; borderColor: string } } => {
    const [min, max] = ideal
    const midpoint = (min + max) / 2
    const range = max - min

    if (value >= min && value <= max) {
      if (Math.abs(value - midpoint) < range * 0.2) {
        return { status: 'excellent', styles: { color: '#059669', backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' } }
      }
      return { status: 'good', styles: { color: '#2563eb', backgroundColor: '#eff6ff', borderColor: '#bfdbfe' } }
    }
    if (Math.abs(value - midpoint) < range * 0.8) {
      return { status: 'fair', styles: { color: '#d97706', backgroundColor: '#fffbeb', borderColor: '#fde68a' } }
    }
    return { status: 'poor', styles: { color: '#dc2626', backgroundColor: '#fef2f2', borderColor: '#fecaca' } }
  }

  // Expand/Maximize handler
  const handleExpand = () => {
    if (!isExpanded) {
      // Expanding: maximize to screen dimensions with margins
      setIsExpanded(true)
      setPosition({ x: 0, y: 0 })
    } else {
      // Collapsing: return to default
      setIsExpanded(false)
      setPosition({ x: 0, y: 0 })
    }
  }

  // Dragging handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only start dragging if clicking on the header (not on buttons)
    if ((e.target as HTMLElement).closest('button')) return
    // Disable dragging when expanded
    if (isExpanded) return
    
    e.preventDefault() // Prevent text selection
    
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      
      e.preventDefault() // Prevent text selection during drag
      
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      
      // Keep panel within viewport bounds
      const panel = panelRef.current
      if (panel) {
        const rect = panel.getBoundingClientRect()
        const panelWidth = rect.width
        const panelHeight = rect.height
        
        // Calculate min/max bounds - use initial position to avoid feedback loop
        // Get the original position without the transform
        const computedStyle = window.getComputedStyle(panel)
        const matrix = new DOMMatrix(computedStyle.transform)
        const currentTransformX = matrix.m41
        const currentTransformY = matrix.m42
        
        // Calculate bounds based on where panel would be without any restrictions
        const wouldBeLeft = rect.left - currentTransformX + newX
        const wouldBeRight = wouldBeLeft + panelWidth
        const wouldBeTop = rect.top - currentTransformY + newY
        const wouldBeBottom = wouldBeTop + panelHeight
        
        // Constrain to viewport
        let constrainedX = newX
        let constrainedY = newY
        
        if (wouldBeLeft < 16) {
          constrainedX = newX + (16 - wouldBeLeft)
        } else if (wouldBeRight > window.innerWidth - 16) {
          constrainedX = newX - (wouldBeRight - (window.innerWidth - 16))
        }
        
        if (wouldBeTop < 16) {
          constrainedY = newY + (16 - wouldBeTop)
        } else if (wouldBeBottom > window.innerHeight - 16) {
          constrainedY = newY - (wouldBeBottom - (window.innerHeight - 16))
        }
        
        setPosition({
          x: constrainedX,
          y: constrainedY
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      // Disable text selection globally while dragging
      document.body.style.userSelect = 'none'
      document.body.style.webkitUserSelect = 'none'
      
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      // Re-enable text selection
      document.body.style.userSelect = ''
      document.body.style.webkitUserSelect = ''
      
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragStart])

  // Helper function for LCC class colors
  const getLCCClassColors = (lccClass: string): { bg: string; text: string; border: string } => {
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
      '1': { bg: '#dcfce7', text: '#166534', border: '#86efac' },
      '2': { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
      '3': { bg: '#fef9c3', text: '#854d0e', border: '#fde047' },
      '4': { bg: '#fefce8', text: '#a16207', border: '#fef08a' },
      '5': { bg: '#ffedd5', text: '#9a3412', border: '#fed7aa' },
      '6': { bg: '#fff7ed', text: '#c2410c', border: '#fdba74' },
      '7': { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
      '8': { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
    }
    return colorMap[lccClass] || { bg: '#f3f4f6', text: '#1f2937', border: '#d1d5db' }
  }

  const [hoveredTabs, setHoveredTabs] = useState<Record<string, boolean>>({
    profile: false,
    ssurgo: false,
    components: false,
    taxonomy: false,
    horizons: false,
  })

  const depths = profile ? Object.keys(profile.properties) : []
  const firstDepth = depths[0]
  const properties = profile ? profile.properties[firstDepth] : null

  return (
    <div
      ref={panelRef}
      className={`border-gray-200 flex flex-col overflow-hidden rounded-lg border bg-white shadow-2xl ${className} ${isDragging ? 'cursor-grabbing' : ''}`}
      style={{ 
        position: isExpanded ? 'fixed' : 'absolute',
        ...(isExpanded ? {
          // Expanded mode: fixed positioning to cover entire viewport including header
          right: '1rem',
          top: '0',
          bottom: '0.5rem',
          width: '100%',
          maxWidth: '42rem',
          height: 'auto',
          maxHeight: 'calc(100vh - 0.5rem)',
          transform: 'none',
          zIndex: 9999,
        } : {
          // Normal mode: absolute positioning within container
          right: '1rem',
          top: '5rem',
          width: '100%',
          maxWidth: '28rem',
          height: 'auto',
          maxHeight: 'calc(100vh - 12rem)',
          transform: `translate(${position.x}px, ${position.y}px)`,
          zIndex: 2000,
        }),
        transition: isDragging ? 'none' : 'all 0.3s ease-out',
      }}
    >
      {/* Enhanced Header with Gradient - Draggable */}
      <div
        className={`border-b flex-shrink-0 ${isExpanded ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
        style={{
          background: 'linear-gradient(to right, #fffbeb, #ffedd5)',
          borderBottomColor: '#fed7aa',
          padding: '20px 24px 20px 24px',
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            {/* Main title */}
            {ssurgoData && (
              <h2 className="text-gray-900 font-bold leading-tight" style={{ fontSize: '18px' }}>
                {ssurgoData.musym} - {ssurgoData.muname}
              </h2>
            )}

            {profile && !ssurgoData && (
              <h2 className="text-gray-900 font-bold" style={{ fontSize: '18px' }}>
                Soil Profile Data
              </h2>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0" style={{ marginTop: '-4px' }}>
            {/* Expand/Collapse Button */}
            <button
              type="button"
              onClick={handleExpand}
              className="hover:bg-white/50 rounded-full p-1 transition-colors"
              title={isExpanded ? 'Restore size' : 'Expand to full screen'}
              aria-label={isExpanded ? 'Restore size' : 'Expand to full screen'}
            >
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" style={{ color: '#6b7280' }} />
              ) : (
                <Maximize2 className="h-4 w-4" style={{ color: '#6b7280' }} />
              )}
            </button>
            
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="hover:bg-white/50 rounded-full p-1 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" style={{ color: '#6b7280' }} />
            </button>
          </div>
        </div>

        {/* Metadata and Button Row */}
        {ssurgoData && (
          <div className="flex items-end justify-between">
            {/* Left: Compact Metadata Stack */}
            <div className="flex flex-col gap-1">
              {/* Coordinates */}
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {formatCoordinates(
                    ssurgoData.coordinates[0] || 0,
                    ssurgoData.coordinates[1] || 0,
                  )}
                </span>
              </div>
              
              {/* Map Unit Key and Acreage */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Database className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                  <span
                    className="rounded px-2 py-0.5 font-mono truncate"
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #fed7aa',
                      fontSize: '11px',
                      color: '#1f2937',
                    }}
                  >
                    {ssurgoData.mukey}
                  </span>
                </div>
                
                {/* Acreage */}
                {ssurgoData.muacres && (
                  <div className="flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                    <span className="font-medium truncate" style={{ fontSize: '13px', color: '#374151' }}>
                      {ssurgoData.muacres.toLocaleString()} acres
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Compact Dashboard Button (bottom aligned) */}
            <button
              onClick={() => setShowFullDashboard(true)}
              onMouseEnter={() => setDashboardHover(true)}
              onMouseLeave={() => setDashboardHover(false)}
              className="rounded-md px-3 py-1.5 font-semibold transition-all shadow-sm flex items-center gap-1.5 flex-shrink-0"
              style={{
                backgroundColor: dashboardHover ? '#4a5f35' : '#5a7241',
                color: 'white',
                fontSize: '12px',
              }}
              title="Open full dashboard view"
            >
              <Eye className="h-3.5 w-3.5" />
              View Dashboard
            </button>
          </div>
        )}

        {/* Profile coordinates */}
        {profile && !ssurgoData && (
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              {formatCoordinates(
                profile?.coordinates[0] || 0,
                profile?.coordinates[1] || 0,
              )}
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-gray-200 flex overflow-x-auto border-b flex-shrink-0" style={{ backgroundColor: '#f9fafb' }}>
        {ssurgoData && (
          <>
            {ssurgoData.components && ssurgoData.components.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('components')}
                  className="flex-shrink-0 whitespace-nowrap px-4 py-3 transition-all"
                  style={
                    activeTab === 'components'
                      ? {
                          backgroundColor: 'var(--color-forest-50)',
                          color: 'var(--color-forest-800)',
                          borderBottom: '3px solid var(--color-forest-600)',
                          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                          fontSize: '16px',
                          fontWeight: 'bold',
                        }
                      : {
                          backgroundColor: '#f9fafb',
                          color: '#4b5563',
                          fontSize: '16px',
                          fontWeight: 'bold',
                        }
                  }
                  onMouseEnter={e => {
                    if (activeTab !== 'components') {
                      e.currentTarget.style.backgroundColor = '#f3f4f6'
                      e.currentTarget.style.color = '#111827'
                    }
                  }}
                  onMouseLeave={e => {
                    if (activeTab !== 'components') {
                      e.currentTarget.style.backgroundColor = '#f9fafb'
                      e.currentTarget.style.color = '#4b5563'
                    }
                  }}
                >
                  Soil Components
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('ssurgo')}
              className="flex-shrink-0 whitespace-nowrap px-4 py-3 transition-all"
              style={
                activeTab === 'ssurgo'
                  ? {
                      backgroundColor: 'var(--color-forest-50)',
                      color: 'var(--color-forest-800)',
                      borderBottom: '3px solid var(--color-forest-600)',
                      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                      fontSize: '16px',
                      fontWeight: 'bold',
                    }
                  : {
                      backgroundColor: '#f9fafb',
                      color: '#4b5563',
                      fontSize: '16px',
                      fontWeight: 'bold',
                    }
              }
              onMouseEnter={e => {
                if (activeTab !== 'ssurgo') {
                  e.currentTarget.style.backgroundColor = '#f3f4f6'
                  e.currentTarget.style.color = '#111827'
                }
              }}
              onMouseLeave={e => {
                if (activeTab !== 'ssurgo') {
                  e.currentTarget.style.backgroundColor = '#f9fafb'
                  e.currentTarget.style.color = '#4b5563'
                }
              }}
            >
              Map Unit
            </button>
            {ssurgoData.components && ssurgoData.components.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('cropland')}
                  className="flex-shrink-0 whitespace-nowrap px-4 py-3 transition-all"
                  style={
                    activeTab === 'cropland'
                      ? {
                          backgroundColor: 'var(--color-forest-50)',
                          color: 'var(--color-forest-800)',
                          borderBottom: '3px solid var(--color-forest-600)',
                          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                          fontSize: '16px',
                          fontWeight: 'bold',
                        }
                      : {
                          backgroundColor: '#f9fafb',
                          color: '#4b5563',
                          fontSize: '16px',
                          fontWeight: 'bold',
                        }
                  }
                  onMouseEnter={e => {
                    if (activeTab !== 'cropland') {
                      e.currentTarget.style.backgroundColor = '#f3f4f6'
                      e.currentTarget.style.color = '#111827'
                    }
                  }}
                  onMouseLeave={e => {
                    if (activeTab !== 'cropland') {
                      e.currentTarget.style.backgroundColor = '#f9fafb'
                      e.currentTarget.style.color = '#4b5563'
                    }
                  }}
                >
                  Cropland History
                </button>
              </>
            )}
          </>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 space-y-4 p-4 overflow-y-auto min-h-0">
        {/* SSURGO Tab */}
        {activeTab === 'ssurgo' && ssurgoData && (
          <div className="-mx-4 -mt-4">
            {/* Map Unit Composition */}
            <details open className="group mb-4">
              <summary className="cursor-pointer list-none rounded-lg px-6 py-3.5 transition-all"
                style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb'
                }}>
                <div className="flex items-center gap-3">
                  <svg
                    className="h-4 w-4 transition-transform group-open:rotate-90"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    style={{ color: '#15803d' }}
                  >
                    <path d="M6 6L14 10L6 14V6Z" />
                  </svg>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', letterSpacing: '-0.01em' }}>Map Unit Composition</h3>
                </div>
              </summary>
              <div className="bg-white px-6 pb-4 pt-3">
                {ssurgoData.components && ssurgoData.components.length > 0 ? (
                  <>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="bg-gray-200 ml-auto flex gap-1 rounded p-0.5">
                        <button
                          onClick={() => setCompositionView('bar')}
                          className="rounded p-1.5 transition-colors"
                          style={{
                            backgroundColor: compositionView === 'bar' ? '#ffffff' : 'transparent',
                            color: compositionView === 'bar' ? '#b45309' : '#6b7280',
                          }}
                          title="Bar chart view"
                        >
                          <BarChart3 size={16} />
                        </button>
                        <button
                          onClick={() => setCompositionView('pie')}
                          className="rounded p-1.5 transition-colors"
                          style={{
                            backgroundColor: compositionView === 'pie' ? '#ffffff' : 'transparent',
                            color: compositionView === 'pie' ? '#b45309' : '#6b7280',
                          }}
                          title="Pie chart view"
                        >
                          <PieChart size={16} />
                        </button>
                      </div>
                    </div>

                    {compositionView === 'bar' ? (
                      <>
                        {/* Bar Chart */}
                        <div className="bg-gray-200 border-gray-300 h-8 overflow-hidden rounded-full border shadow-inner">
                          <div className="flex h-full">
                            {ssurgoData.components
                              .sort((a, b) => (b.comppct_r || 0) - (a.comppct_r || 0))
                              .map((comp, idx) => {
                                const colors = [
                                  'var(--color-forest-600)', 'var(--color-ocean-500)', 'var(--color-amber-500)',
                                  'var(--color-lavender-600)', 'var(--color-copper-500)', 'var(--color-sunset-500)',
                                  'var(--color-sky-500)', 'var(--color-moss-600)', 'var(--color-clay-600)',
                                  'var(--color-sage-600)', 'var(--color-earth-500)', 'var(--color-slate-600)'
                                ]
                                const bgColor = colors[idx % colors.length]

                                return (
                                  <div
                                    key={idx}
                                    className="h-full transition-all duration-700"
                                    style={{
                                      width: `${comp.comppct_r || 0}%`,
                                      backgroundColor: bgColor,
                                    }}
                                    title={`${comp.compname}: ${comp.comppct_r}%`}
                                  />
                                )
                              })}
                          </div>
                        </div>

                        {/* Legend */}
                        <div className="mt-3 flex flex-wrap gap-3 text-xs">
                          {ssurgoData.components
                            .sort((a, b) => (b.comppct_r || 0) - (a.comppct_r || 0))
                            .map((comp, idx) => {
                              const colors = [
                                'var(--color-forest-600)', 'var(--color-ocean-500)', 'var(--color-amber-500)',
                                'var(--color-lavender-600)', 'var(--color-copper-500)', 'var(--color-sunset-500)',
                                'var(--color-sky-500)', 'var(--color-moss-600)', 'var(--color-clay-600)',
                                'var(--color-sage-600)', 'var(--color-earth-500)', 'var(--color-slate-600)'
                              ]
                              const bgColor = colors[idx % colors.length]

                              return (
                                <div key={idx} className="flex items-center gap-1.5">
                                  <div className="h-3 w-3 rounded" style={{ backgroundColor: bgColor }} />
                                  <span className="text-gray-700">
                                    {comp.compname} <span className="font-semibold">{comp.comppct_r}%</span>
                                  </span>
                                </div>
                              )
                            })}
                        </div>
                      </>
                    ) : (
                      <div key={chartKey}>
                        {/* Pie Chart */}
                        <div style={{ width: '100%', height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <RechartsPieChart width={440} height={300}>
                            <Pie
                              data={ssurgoData.components.map((comp, idx) => {
                                const colors = [
                                  'var(--color-forest-600)', 'var(--color-ocean-500)', 'var(--color-amber-500)',
                                  'var(--color-lavender-600)', 'var(--color-copper-500)', 'var(--color-sunset-500)',
                                  'var(--color-sky-500)', 'var(--color-moss-600)', 'var(--color-clay-600)',
                                  'var(--color-sage-600)', 'var(--color-earth-500)', 'var(--color-slate-600)'
                                ]
                                return {
                                  name: comp.compname,
                                  value: Number(comp.comppct_r) || 0,
                                  fill: colors[idx % colors.length],
                                }
                              })}
                              dataKey="value"
                              cx="50%"
                              cy="50%"
                              outerRadius={130}
                            />
                            <Tooltip />
                          </RechartsPieChart>
                        </div>

                        {/* Legend */}
                        <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs">
                          {ssurgoData.components.map((comp, idx) => {
                            const colors = [
                              'var(--color-forest-600)', 'var(--color-ocean-500)', 'var(--color-amber-500)',
                              'var(--color-lavender-600)', 'var(--color-copper-500)', 'var(--color-sunset-500)',
                              'var(--color-sky-500)', 'var(--color-moss-600)', 'var(--color-clay-600)',
                              'var(--color-sage-600)', 'var(--color-earth-500)', 'var(--color-slate-600)'
                            ]
                            const bgColor = colors[idx % colors.length]

                            return (
                              <div key={idx} className="flex items-center gap-1.5">
                                <div className="h-3 w-3 rounded" style={{ backgroundColor: bgColor }} />
                                <span className="text-gray-700">
                                  {comp.compname} <span className="font-semibold">{comp.comppct_r}%</span>
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Compare Profiles Button */}
                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={() => setShowProfileComparison(true)}
                        className="px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
                        style={{ backgroundColor: '#5a7241', color: '#ffffff' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#4a5f35'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#5a7241'}
                        title="Compare all component profiles side-by-side"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                        <span>Compare Profiles</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-700 text-sm">
                    <span className="font-semibold">Map Unit Key: </span>
                    <span className="text-gray-600 italic">{ssurgoData.mukey}</span>
                  </div>
                )}
              </div>
            </details>

            {/* Land Capability Classification - Combined */}
            {ssurgoData.components && ssurgoData.components.length > 0 && (() => {
              const lccData = LCCFormatter.formatLCCData(ssurgoData.components);
              
              if (!lccData || !lccData.components || lccData.components.length === 0) {
                return null;
              }
              
              const dominantComp = ssurgoData.components.find((c: any) => c.majcompflag === 'Yes') || ssurgoData.components[0];
              const nirrcapcl = dominantComp.nirrcapcl;
              const nirrcapscl = dominantComp.nirrcapscl;
              const irrcapcl = dominantComp.irrcapcl;
              const irrcapscl = dominantComp.irrcapscl;
              
              const nonIrrigatedClass = nirrcapcl?.toString().replace(/[a-z]/gi, '') || null;
              const nonIrrigatedSubclass = nirrcapscl || nirrcapcl?.toString().replace(/\d/g, '') || null;
              const irrigatedClass = irrcapcl?.toString().replace(/[a-z]/gi, '') || null;
              const irrigatedSubclass = irrcapscl || irrcapcl?.toString().replace(/\d/g, '') || null;
              
              const displayClass = showIrrigatedLCC ? irrigatedClass : nonIrrigatedClass;
              const displaySubclass = showIrrigatedLCC ? irrigatedSubclass : nonIrrigatedSubclass;
              
              const classInfo = displayClass && displayClass in LAND_CAPABILITY_INTERPRETATIONS.classes 
                ? LAND_CAPABILITY_INTERPRETATIONS.classes[displayClass as '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8']
                : null;
              
              // Determine severity color based on class number
              const getSeverityFromClass = (classNum: string): 'slight' | 'moderate' | 'severe' | 'very_severe' => {
                const num = parseInt(classNum);
                if (num >= 7) return 'very_severe';
                if (num >= 5) return 'severe';
                if (num >= 3) return 'moderate';
                return 'slight';
              };

              const getSeverityColors = (severity: string) => {
                const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
                  'slight': { bg: '#dcfce7', text: '#166534', icon: '#16a34a' },
                  'moderate': { bg: '#fef9c3', text: '#854d0e', icon: '#ca8a04' },
                  'severe': { bg: '#ffedd5', text: '#9a3412', icon: '#ea580c' },
                  'very_severe': { bg: '#fee2e2', text: '#991b1b', icon: '#dc2626' },
                };
                return colorMap[severity] || { bg: '#f3f4f6', text: '#1f2937', icon: '#6b7280' };
              };

              const currentSeverity = displayClass ? getSeverityFromClass(displayClass) : 'slight';
              const severityColors = getSeverityColors(currentSeverity);
              
              return (
                <details open className="group mb-4">
                  <summary className="cursor-pointer list-none rounded-lg px-6 py-3.5 transition-all"
                    style={{
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb'
                    }}>
                    <div className="flex items-center gap-3">
                      <svg
                        className="h-4 w-4 transition-transform group-open:rotate-90"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        style={{ color: '#15803d' }}
                      >
                        <path d="M6 6L14 10L6 14V6Z" />
                      </svg>
                      <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', letterSpacing: '-0.01em' }}>
                        Land Capability Classification
                      </h3>
                    </div>
                  </summary>
                  <div className="bg-white px-6 pb-4 pt-3">
                    {/* Toggle for Irrigated/Dryland */}
                    {lccData.components.some(c => c.irrigated_class) && lccData.components.some(c => c.nonirrigated_class) && (
                      <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium text-gray-700">View:</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setShowIrrigatedLCC(false)}
                            className="px-3 py-1 text-sm rounded transition-colors"
                            style={{
                              backgroundColor: !showIrrigatedLCC ? '#2b3d6c' : '#ffffff',
                              color: !showIrrigatedLCC ? '#ffffff' : '#374151',
                              border: '1px solid #d1d5db'
                            }}
                          >
                            Dryland
                          </button>
                          <button
                            onClick={() => setShowIrrigatedLCC(true)}
                            className="px-3 py-1 text-sm rounded transition-colors"
                            style={{
                              backgroundColor: showIrrigatedLCC ? '#2b3d6c' : '#ffffff',
                              color: showIrrigatedLCC ? '#ffffff' : '#374151',
                              border: '1px solid #d1d5db'
                            }}
                          >
                            Irrigated
                          </button>
                        </div>
                      </div>
                    )}
                    <h4 className="text-sm font-bold text-gray-800 mb-2">Dominant Land Capability Class</h4>
                    {/* Dominant Component Class Description with Badge */}
                    {displayClass && classInfo && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div 
                            className="px-4 py-2 rounded-lg border-2 font-bold text-2xl"
                            style={{
                              backgroundColor: severityColors.bg,
                              color: severityColors.text,
                              borderColor: severityColors.icon
                            }}
                          >
                            {displayClass}{displaySubclass || ''}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-gray-800 mb-1">
                              {dominantComp.compname || 'Unknown'} - {dominantComp.comppct_r || 0}%
                            </h4>
                            <p className="text-sm font-semibold text-gray-700">
                              {classInfo.name}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-3 text-sm">
                          <p className="text-gray-700 leading-relaxed">
                            {classInfo.description}
                          </p>
                        </div>

                        {/* Subclass limitations */}
                        {displaySubclass && (
                          <div className="border-t border-gray-200 pt-3 mt-3">
                            <h5 className="text-sm font-bold text-gray-800 mb-3">Limitation Details</h5>
                            <div className="space-y-2">
                              {displaySubclass.split('').map((subChar: string) => {
                                const subKey = subChar as 'e' | 'w' | 's' | 'c';
                                const subInfo = LAND_CAPABILITY_INTERPRETATIONS.subclasses[subKey];
                                if (!subInfo) return null;

                                return (
                                  <div
                                    key={subChar}
                                    className="rounded p-3"
                                    style={{
                                      backgroundColor: severityColors.bg,
                                      border: `1px solid ${severityColors.icon}`
                                    }}
                                  >
                                    <div className="flex items-start gap-2">
                                      <AlertTriangle 
                                        className="h-5 w-5 flex-shrink-0 mt-0.5" 
                                        style={{ color: severityColors.icon }}
                                      />
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span 
                                            className="font-mono font-bold"
                                            style={{ color: severityColors.text }}
                                          >
                                            {subChar}:
                                          </span>
                                          <span 
                                            className="font-semibold"
                                            style={{ color: severityColors.text }}
                                          >
                                            {subInfo.name}
                                          </span>
                                        </div>
                                        <p 
                                          className="text-sm mb-2"
                                          style={{ color: severityColors.text }}
                                        >
                                          {subInfo.description}
                                        </p>
                                        <p 
                                          className="text-sm"
                                          style={{ color: severityColors.text }}
                                        >
                                          <strong>Management:</strong> {subInfo.management}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Recommended Practices */}
                        {classInfo.recommendations && (
                          <div className="border-t border-gray-200 pt-3 mt-3">
                            <div className="rounded p-3" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <h6 className="font-semibold mb-2 flex items-center gap-2" style={{ color: '#14532d' }}>
                                <CheckCircle className="h-4 w-4" />
                                Recommended Practices
                              </h6>
                              <ul className="space-y-1">
                                {classInfo.recommendations.map((rec: string, idx: number) => (
                                  <li key={idx} className="text-sm flex items-start gap-2" style={{ color: '#166534' }}>
                                    <span className="mt-0.5" style={{ color: '#16a34a' }}>•</span>
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Component LCC List */}
                    {lccData.components.length > 1 && (() => {
                      // Count components with and without LCC data
                      const componentsWithLCC = lccData.components.filter((comp) => {
                        const compClass = showIrrigatedLCC ? comp.irrigated_class : comp.nonirrigated_class;
                        return compClass !== null && compClass !== undefined;
                      });
                      const totalComponents = ssurgoData.components.length;
                      const hasMissingLCC = componentsWithLCC.length < totalComponents;

                      return (
                        <>
                          <h4 className="text-sm font-bold text-gray-800 mb-2">LCC by Component</h4>
                          {hasMissingLCC && (
                            <div className="mb-2 p-2 rounded text-xs" style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a', color: '#92400e' }}>
                              <p>
                                <strong>Note:</strong> LCC information is missing for some components. 
                                Showing {componentsWithLCC.length} of {totalComponents} components.
                              </p>
                            </div>
                          )}
                          <div className="space-y-2">
                            {lccData.components.map((comp, idx) => {
                              const compClass = showIrrigatedLCC ? comp.irrigated_class : comp.nonirrigated_class;
                              const compSubclass = showIrrigatedLCC ? comp.irrigated_subclass : comp.nonirrigated_subclass;
                              
                              if (!compClass) return null;
                              
                              const parsedClass = LCCFormatter.parseLCCClass(compClass);
                              const displayText = parsedClass + (compSubclass || '');
                              
                              return (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                                  <span 
                                    className="px-4 py-2 rounded-lg border-2 font-bold text-xl flex-shrink-0"
                                    style={parsedClass ? {
                                      backgroundColor: getLCCClassColors(parsedClass).bg,
                                      color: getLCCClassColors(parsedClass).text,
                                      borderColor: getLCCClassColors(parsedClass).border
                                    } : {
                                      backgroundColor: '#f3f4f6',
                                      color: '#1f2937',
                                      borderColor: '#d1d5db'
                                    }}
                                  >
                                    {displayText}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <span className="font-semibold text-gray-900 text-sm">{comp.name}</span>
                                  </div>
                                  <span className="text-gray-500 font-medium text-sm flex-shrink-0">{comp.percent}%</span>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </details>
              );
            })()}

            {/* Map Unit Data */}
            <details open className="group mb-4">
              <summary className="cursor-pointer list-none rounded-lg px-6 py-3.5 transition-all"
                style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb'
                }}>
                <div className="flex items-center gap-3">
                  <svg
                    className="h-4 w-4 transition-transform group-open:rotate-90"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    style={{ color: '#15803d' }}
                  >
                    <path d="M6 6L14 10L6 14V6Z" />
                  </svg>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', letterSpacing: '-0.01em' }}>Map Unit Data</h3>
                </div>
              </summary>
              <div className="bg-white px-6 pb-4 pt-3">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-gray-300 border-b">
                      <td className="text-gray-900 py-2.5 pr-4 align-top font-semibold">Map Unit Key:</td>
                      <td className="text-gray-700 py-2.5">
                        {ssurgoData.mukey}
                        <button
                          onClick={() => setShowSummaryModal(true)}
                          className="text-blue-600 ml-2 cursor-pointer border-none bg-transparent p-0 text-xs hover:underline"
                        >
                          [View Summary]
                        </button>
                      </td>
                    </tr>
                    <tr className="border-gray-300 border-b">
                      <td className="text-gray-900 py-2.5 pr-4 align-top font-semibold">Map Unit Symbol:</td>
                      <td className="text-gray-700 py-2.5">{ssurgoData.musym}</td>
                    </tr>
                    <tr className="border-gray-300 border-b">
                      <td className="text-gray-900 py-2.5 pr-4 align-top font-semibold">Map Unit Name:</td>
                      <td className="text-gray-700 py-2.5">{ssurgoData.muname}</td>
                    </tr>
                    <tr>
                      <td className="text-gray-900 py-2.5 pr-4 align-top font-semibold">Total Acres:</td>
                      <td className="text-gray-700 py-2.5">{Number(ssurgoData.muacres).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </details>

            {/* Survey Metadata */}
            <details open className="group mb-4">
              <summary className="cursor-pointer list-none rounded-lg px-6 py-3.5 transition-all"
                style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb'
                }}>
                <div className="flex items-center gap-3">
                  <svg
                    className="h-4 w-4 transition-transform group-open:rotate-90"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    style={{ color: '#15803d' }}
                  >
                    <path d="M6 6L14 10L6 14V6Z" />
                  </svg>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', letterSpacing: '-0.01em' }}>Survey Metadata</h3>
                </div>
              </summary>
              <div className="bg-white px-6 pb-4 pt-3">
                <table className="w-full text-sm">
                  <tbody>
                    {ssurgoData.surveyArea && (
                      <tr className="border-gray-300 border-b">
                        <td className="text-gray-900 py-2.5 pr-4 align-top font-semibold">
                          Soil Survey Area:
                        </td>
                        <td className="text-gray-700 py-2.5">
                          {ssurgoData.surveyArea}
                          <span className="text-blue-600 ml-1 cursor-help" title="More information">
                            ?
                          </span>
                        </td>
                      </tr>
                    )}
                    {ssurgoData.spatialVersion && (
                      <tr className="border-gray-300 border-b">
                        <td className="text-gray-900 py-2.5 pr-4 align-top font-semibold">
                          Spatial Version:
                        </td>
                        <td className="text-gray-700 py-2.5">
                          {ssurgoData.spatialVersion}
                          <span className="text-blue-600 ml-1 cursor-help" title="More information">
                            ?
                          </span>
                        </td>
                      </tr>
                    )}
                    {ssurgoData.scale && (
                      <tr className="border-gray-300 border-b">
                        <td className="text-gray-900 py-2.5 pr-4 align-top font-semibold">Scale:</td>
                        <td className="text-gray-700 py-2.5">
                          {ssurgoData.scale}
                          <span className="text-blue-600 ml-1 cursor-help" title="More information">
                            ?
                          </span>
                        </td>
                      </tr>
                    )}
                    {ssurgoData.published && (
                      <tr className="border-gray-300 border-b">
                        <td className="text-gray-900 py-2.5 pr-4 align-top font-semibold">Published:</td>
                        <td className="text-gray-700 py-2.5">
                          {ssurgoData.published}
                          <span className="text-blue-600 ml-1 cursor-help" title="More information">
                            ?
                          </span>
                        </td>
                      </tr>
                    )}
                    {ssurgoData.lastExport && (
                      <tr className="border-gray-300 border-b">
                        <td className="text-gray-900 py-2.5 pr-4 align-top font-semibold">Last Export:</td>
                        <td className="text-gray-700 py-2.5">
                          {ssurgoData.lastExport}
                          <span className="text-blue-600 ml-1 cursor-help" title="More information">
                            ?
                          </span>
                        </td>
                      </tr>
                    )}
                    <tr className="border-gray-300 border-b">
                      <td className="text-gray-900 py-2.5 pr-4 align-top font-semibold">Coordinates:</td>
                      <td className="text-gray-700 py-2.5">
                        {ssurgoData.coordinates[0].toFixed(6)}, {ssurgoData.coordinates[1].toFixed(6)}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-gray-900 py-2.5 pr-4 align-top font-semibold">Data Source:</td>
                      <td className="text-gray-700 py-2.5">USDA NRCS SDA</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </details>

            {/* Info box */}
            <div className="bg-gray-100 border-gray-700 mx-6 my-4 border-l-4 p-3">
              <p className="text-gray-900 text-xs">
                <strong>Note:</strong> Data retrieved from USDA NRCS Soil Data Access (SDA) Web Service
              </p>
            </div>
          </div>
        )}

        {/* Components Tab */}
        {activeTab === 'components' && ssurgoData?.components && (
          <div className="space-y-4">
            {/* Composition Visual - Bar or Pie Chart */}
            <div className="px-6 pt-4 pb-2">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-gray-900 flex items-center gap-2 text-sm font-semibold">
                  <span>Map Unit Composition</span>
                </h3>
                <div className="bg-gray-200 flex gap-1 rounded p-0.5">
                    <button
                      onClick={() => setCompositionView('bar')}
                      className="rounded p-1.5 transition-colors"
                      style={{
                        backgroundColor: compositionView === 'bar' ? '#ffffff' : 'transparent',
                        color: compositionView === 'bar' ? '#b45309' : '#6b7280',
                      }}
                      title="Bar chart view"
                    >
                      <BarChart3 size={16} />
                    </button>
                    <button
                      onClick={() => setCompositionView('pie')}
                      className="rounded p-1.5 transition-colors"
                      style={{
                        backgroundColor: compositionView === 'pie' ? '#ffffff' : 'transparent',
                        color: compositionView === 'pie' ? '#b45309' : '#6b7280',
                      }}
                      title="Pie chart view"
                    >
                      <PieChart size={16} />
                    </button>
                  </div>
              </div>

              {compositionView === 'bar' ? (
                <>
                  {/* Bar Chart */}
                  <div className="bg-gray-200 border-gray-300 h-8 overflow-hidden rounded-full border shadow-inner">
                    <div className="flex h-full">
                      {ssurgoData.components
                        .sort((a, b) => (b.comppct_r || 0) - (a.comppct_r || 0))
                        .map((comp, idx) => {
                          const colors = [
                            'var(--color-forest-600)', 'var(--color-ocean-500)', 'var(--color-amber-500)',
                            'var(--color-lavender-600)', 'var(--color-copper-500)', 'var(--color-sunset-500)',
                            'var(--color-sky-500)', 'var(--color-moss-600)', 'var(--color-clay-600)',
                            'var(--color-sage-600)', 'var(--color-earth-500)', 'var(--color-slate-600)'
                          ]
                          const bgColor = colors[idx % colors.length]

                          return (
                            <div
                              key={idx}
                              className="h-full transition-all duration-700"
                              style={{
                                width: `${comp.comppct_r || 0}%`,
                                backgroundColor: bgColor,
                              }}
                              title={`${comp.compname}: ${comp.comppct_r}%`}
                            />
                          )
                        })}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="mt-3 flex flex-wrap gap-3 text-xs">
                    {ssurgoData.components
                      .sort((a, b) => (b.comppct_r || 0) - (a.comppct_r || 0))
                      .map((comp, idx) => {
                        const colors = [
                          'var(--color-forest-600)', 'var(--color-ocean-500)', 'var(--color-amber-500)',
                          'var(--color-lavender-600)', 'var(--color-copper-500)', 'var(--color-sunset-500)',
                          'var(--color-sky-500)', 'var(--color-moss-600)', 'var(--color-clay-600)',
                          'var(--color-sage-600)', 'var(--color-earth-500)', 'var(--color-slate-600)'
                        ]
                        const bgColor = colors[idx % colors.length]

                        return (
                          <div key={idx} className="flex items-center gap-1.5">
                            <div className="h-3 w-3 rounded" style={{ backgroundColor: bgColor }} />
                            <span className="text-gray-700">
                              {comp.compname} <span className="font-semibold">{comp.comppct_r}%</span>
                            </span>
                          </div>
                        )
                      })}
                  </div>
                </>
              ) : (
                <div>
                  {/* Pie Chart */}
                  <div style={{ width: '100%', height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <RechartsPieChart width={440} height={300}>
                      <Pie
                        data={ssurgoData.components.map((comp, idx) => {
                          const colors = [
                            'var(--color-forest-600)', 'var(--color-ocean-500)', 'var(--color-amber-500)',
                            'var(--color-lavender-600)', 'var(--color-copper-500)', 'var(--color-sunset-500)',
                            'var(--color-sky-500)', 'var(--color-moss-600)', 'var(--color-clay-600)',
                            'var(--color-sage-600)', 'var(--color-earth-500)', 'var(--color-slate-600)'
                          ]
                          return {
                            name: comp.compname,
                            value: Number(comp.comppct_r) || 0,
                            fill: colors[idx % colors.length],
                          }
                        })}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        outerRadius={130}
                      />
                      <Tooltip />
                    </RechartsPieChart>
                  </div>                  {/* Legend */}
                  <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs">
                    {ssurgoData.components.map((comp, idx) => {
                      const colors = [
                        'var(--color-forest-600)', 'var(--color-ocean-500)', 'var(--color-amber-500)',
                        'var(--color-lavender-600)', 'var(--color-copper-500)', 'var(--color-sunset-500)',
                        'var(--color-sky-500)', 'var(--color-moss-600)', 'var(--color-clay-600)',
                        'var(--color-sage-600)', 'var(--color-earth-500)', 'var(--color-slate-600)'
                      ]
                      const bgColor = colors[idx % colors.length]

                      return (
                        <div key={idx} className="flex items-center gap-1.5">
                          <div className="h-3 w-3 rounded" style={{ backgroundColor: bgColor }} />
                          <span className="text-gray-700">
                            {comp.compname} <span className="font-semibold">{comp.comppct_r}%</span>
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Compare Profiles Button */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setShowProfileComparison(true)}
                  className="px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
                  style={{ backgroundColor: '#5a7241', color: '#ffffff' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#4a5f35'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#5a7241'}
                  title="Compare all component profiles side-by-side"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <span>Compare Profiles</span>
                </button>
              </div>
            </div>

            {/* Component Details */}
            {ssurgoData.components && ssurgoData.components.map((comp, idx) => (
              <ComponentDetailsSection 
                key={idx} 
                comp={comp} 
                idx={idx} 
                allComponents={ssurgoData.components!}
                isExpanded={expandedComponents.has(idx)}
                onToggle={() => toggleComponentExpansion(idx)}
              />
            ))}
          </div>
        )}

        {/* Horizons Tab */}
        {activeTab === 'horizons' && ssurgoData?.components && (
          <div className="space-y-4">
            {/* Property Selector */}
            <div className="px-6 pt-4 pb-2">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-gray-900 text-sm font-semibold">Display Property:</h3>
                <select
                  value={profileProperty}
                  onChange={e => setProfileProperty(e.target.value as any)}
                  className="border-gray-300 rounded border bg-white px-2 py-1 text-xs"
                >
                  <option value="texture">Texture</option>
                  <option value="clay">Clay %</option>
                  <option value="om">Organic Matter %</option>
                  <option value="ph">pH</option>
                  <option value="awc">AWC</option>
                  <option value="ksat">Ksat</option>
                </select>
              </div>
            </div>

            {/* Profile Plot for Each Component */}
            {ssurgoData.components.map(
              (comp, compIdx) =>
                comp.horizons &&
                comp.horizons.length > 0 && (
                  <details key={compIdx} open={compIdx === 0} className="border-gray-300 group border-b">
                    <summary className="from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150 cursor-pointer list-none bg-gradient-to-r px-6 py-3">
                      <div className="flex items-center gap-2">
                        <svg
                          className="text-amber-600 h-3 w-3 transition-transform group-open:rotate-90"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M6 6L14 10L6 14V6Z" />
                        </svg>
                        <h3 className="text-gray-900 text-sm font-bold">{comp.compname} - Soil Profile</h3>
                        {comp.majcompflag === 'Yes' && (
                          <span 
                            className="rounded-full px-2 py-0.5 text-xs font-medium"
                            style={{ backgroundColor: '#d97706', color: '#ffffff' }}
                          >
                            Major
                          </span>
                        )}
                        <span className="text-gray-600 ml-auto text-sm">{comp.comppct_r}%</span>
                      </div>
                    </summary>
                    <div className="bg-white px-6 pb-4 pt-3">
                      <div
                        className="bg-gray-50 border-gray-300 flex h-80 items-center justify-center rounded border p-4"
                        style={{ position: 'relative' }}
                      >
                        <div
                          style={{ width: '200px', height: '100%', position: 'relative', marginLeft: '60px' }}
                        >
                          {/* Y-axis label */}
                          <div
                            style={{
                              position: 'absolute',
                              left: '-75px',
                              top: '50%',
                              transform: 'translateY(-50%) rotate(-90deg)',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#374151',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Depth (cm)
                          </div>
                          {/* Y-axis line */}
                          <div
                            style={{
                              position: 'absolute',
                              left: '-10px',
                              top: '0',
                              bottom: '0',
                              width: '1px',
                              backgroundColor: '#666',
                              opacity: 0.5,
                            }}
                          />
                          {comp.horizons.map((hz, index) => {
                            const top = Number(hz.hzdept_r) || 0
                            const bottom = Number(hz.hzdepb_r) || 0
                            const thickness = bottom - top
                            const maxDepth = comp.horizons
                              ? Math.max(...comp.horizons.map(h => Number(h.hzdepb_r) || 0))
                              : 0
                            const topPercent = (top / maxDepth) * 100
                            const heightPercent = (thickness / maxDepth) * 100

                            // Get color based on selected property
                            let displayColor = '#d1d5db'
                            let displayLabel = 'Unknown'
                            let textColor = 'white'

                            const sand = Number(hz.sandtotal_r)
                            const silt = Number(hz.silttotal_r)
                            const clay = Number(hz.claytotal_r)

                            if (profileProperty === 'texture') {
                              if (!isNaN(sand) && !isNaN(silt) && !isNaN(clay)) {
                                displayLabel = getTextureClass(sand, silt, clay)
                                displayColor = getTextureClassColor(displayLabel)
                                textColor =
                                  displayLabel === 'Sand' ||
                                  displayLabel === 'Loamy sand' ||
                                  displayLabel === 'Silt'
                                    ? '#333'
                                    : 'white'
                              }
                            } else {
                              const propertyMap: Record<string, string> = {
                                clay: 'claytotal_r',
                                om: 'om_r',
                                ph: 'ph1to1h2o_r',
                                awc: 'awc_r',
                                ksat: 'ksat_r',
                              }

                              const fieldName = propertyMap[profileProperty]
                              const value = Number((hz as any)[fieldName])

                              if (!isNaN(value)) {
                                const classification = classifyProperty(value, profileProperty)
                                displayColor = classification.color
                                displayLabel = classification.label
                                const isDark =
                                  profileProperty === 'ksat' ||
                                  (profileProperty === 'clay' && value > 25) ||
                                  (profileProperty === 'om' && value > 1)
                                textColor = isDark ? 'white' : '#333'
                              }
                            }

                            return (
                              <div
                                key={index}
                                style={{
                                  position: 'absolute',
                                  top: `${topPercent}%`,
                                  left: '0',
                                  width: '100%',
                                  height: `${heightPercent}%`,
                                  backgroundColor: displayColor,
                                  border: '1px solid #666',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: textColor,
                                  fontWeight: 'bold',
                                  fontSize: '14px',
                                  textShadow: textColor === 'white' ? '1px 1px 2px rgba(0,0,0,0.8)' : 'none',
                                }}
                                title={`${
                                  hz.hzname || `Horizon ${index + 1}`
                                } (${top}-${bottom} cm)\nTexture: ${
                                  !isNaN(sand) && !isNaN(silt) && !isNaN(clay)
                                    ? getTextureClass(sand, silt, clay)
                                    : 'N/A'
                                }\nClay: ${!isNaN(clay) ? clay.toFixed(1) : 'N/A'}%\nOM: ${
                                  !isNaN(Number(hz.om_r)) ? Number(hz.om_r).toFixed(2) : 'N/A'
                                }%\npH: ${
                                  !isNaN(Number(hz.ph1to1h2o_r)) ? Number(hz.ph1to1h2o_r).toFixed(1) : 'N/A'
                                }\nAWC: ${
                                  !isNaN(Number(hz.awc_r)) ? Number(hz.awc_r).toFixed(2) : 'N/A'
                                }\nKsat: ${
                                  !isNaN(Number(hz.ksat_r)) ? Number(hz.ksat_r).toFixed(1) : 'N/A'
                                } µm/s`}
                              >
                                {hz.hzname || `H${index + 1}`}
                              </div>
                            )
                          })}
                          {/* Depth scale with horizon breaks */}
                          <div
                            style={{
                              position: 'absolute',
                              left: '-50px',
                              top: '0',
                              height: '100%',
                              width: '40px',
                              fontSize: '10px',
                              color: '#666',
                            }}
                          >
                            {/* Collect all unique depths */}
                            {(() => {
                              const maxDepth = Math.max(...comp.horizons.map(h => Number(h.hzdepb_r) || 0))
                              const depths = new Set<number>()
                              depths.add(0)
                              comp.horizons.forEach(h => {
                                const top = Number(h.hzdept_r)
                                const bottom = Number(h.hzdepb_r)
                                if (!isNaN(top)) depths.add(top)
                                if (!isNaN(bottom)) depths.add(bottom)
                              })

                              return Array.from(depths)
                                .sort((a, b) => a - b)
                                .map((depth, idx) => {
                                  const topPercent = (depth / maxDepth) * 100
                                  return (
                                    <div
                                      key={idx}
                                      style={{
                                        position: 'absolute',
                                        top: `${topPercent}%`,
                                        right: '0',
                                        width: '100%',
                                        textAlign: 'right',
                                        transform: 'translateY(-50%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                        gap: '2px',
                                      }}
                                    >
                                      <span
                                        style={{
                                          fontWeight: depth === 0 || depth === maxDepth ? 'bold' : 'normal',
                                        }}
                                      >
                                        {depth}
                                      </span>
                                      <div
                                        style={{
                                          width: '8px',
                                          height: '1px',
                                          backgroundColor: '#666',
                                          opacity: 0.5,
                                        }}
                                      />
                                    </div>
                                  )
                                })
                            })()}
                          </div>
                        </div>
                      </div>
                      {/* Legend */}
                      <div className="text-gray-600 mt-2 text-xs">
                        {profileProperty === 'texture' ? (
                          <>
                            <div className="mb-1 font-semibold">USDA Texture Classes:</div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                              <div className="flex items-center gap-1.5">
                                <div className="h-3 w-3 rounded" style={{ backgroundColor: 'var(--color-sand-200)' }} />
                                <span>Sand</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="h-3 w-3 rounded" style={{ backgroundColor: 'var(--color-sand-600)' }} />
                                <span>Loam</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="h-3 w-3 rounded" style={{ backgroundColor: 'var(--color-sand-400)' }} />
                                <span>Sandy loam</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="h-3 w-3 rounded" style={{ backgroundColor: 'var(--color-clay-600)' }} />
                                <span>Clay loam</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="h-3 w-3 rounded" style={{ backgroundColor: 'var(--color-earth-400)' }} />
                                <span>Silt loam</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="h-3 w-3 rounded" style={{ backgroundColor: 'var(--color-clay-900)' }} />
                                <span>Clay</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="mb-1 font-semibold">
                              {profileProperty === 'clay' && 'Clay Content (%)'}
                              {profileProperty === 'om' && 'Organic Matter (%)'}
                              {profileProperty === 'ph' && 'pH'}
                              {profileProperty === 'awc' && 'Available Water Capacity'}
                              {profileProperty === 'ksat' && 'Saturated Hydraulic Conductivity (µm/s)'}
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                              {soilPropertyRanges[profileProperty]?.slice(0, 6).map((range, idx) => (
                                <div key={idx} className="flex items-center gap-1.5">
                                  <div className="h-3 w-3 rounded" style={{ backgroundColor: range.color }} />
                                  <span>
                                    {range.label} ({range.min}
                                    {idx === soilPropertyRanges[profileProperty].length - 1
                                      ? '+'
                                      : `-${range.max}`}
                                    )
                                  </span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </details>
                ),
            )}
          </div>
        )}

        {/* Cropland History Tab */}
        {activeTab === 'cropland' && cdlHistory && cdlHistory.length > 0 && (
          <div className="space-y-4">
            <div className="rounded-lg border p-4" style={{ background: 'linear-gradient(to right, var(--color-forest-50), var(--color-moss-50))', borderColor: 'var(--color-forest-200)' }}>
              <h3 className="mb-2 text-lg font-bold" style={{ color: 'var(--color-forest-900)' }}>Cropland Data Layer History</h3>
              <p className="text-sm" style={{ color: 'var(--color-forest-700)' }}>
                Showing {cdlHistory.length} years of crop rotation data from USDA NASS CropScape
              </p>
            </div>

            {/* Crop Timeline Chart */}
            <div className="border-gray-200 rounded-lg border bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-gray-900 text-sm font-semibold">Crop Timeline</h4>
                <button
                  onClick={() => setShowExpandedCDLChart(true)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex items-center space-x-1 rounded px-2 py-1 text-xs font-medium transition-colors"
                  title="Expand chart"
                >
                  <Maximize2 className="h-3 w-3" />
                  <span>Expand</span>
                </button>
              </div>

              {/* Horizontal bar chart style - best for categorical time series */}
              <div className="space-y-1">
                {cdlHistory
                  .sort((a, b) => b.year - a.year)
                  .map(yearData => (
                    <div key={yearData.year} className="space-y-1">
                      <div className="group flex items-center space-x-2">
                        <span className="text-gray-600 w-10 text-right text-xs font-medium">
                          {yearData.year}
                        </span>
                        {/* Crop type icon */}
                        {yearData.cropType && (
                          <span
                            className="rounded px-1.5 py-0.5 font-bold flex items-center"
                            style={{
                              backgroundColor: yearData.cropType === 'annual' ? '#dbeafe' :
                                             yearData.cropType === 'perennial' ? '#f3e8ff' :
                                             yearData.cropType === 'permanent' ? '#fee2e2' :
                                             yearData.cropType === 'pasture' ? '#dcfce7' :
                                             yearData.cropType === 'fallow' ? '#fef3c7' :
                                             yearData.cropType === 'forest' ? '#d1fae5' :
                                             yearData.cropType === 'developed' ? '#ffedd5' :
                                             yearData.cropType === 'water' ? '#cffafe' : '#f3f4f6',
                              color: yearData.cropType === 'annual' ? '#1e40af' :
                                    yearData.cropType === 'perennial' ? '#6b21a8' :
                                    yearData.cropType === 'permanent' ? '#991b1b' :
                                    yearData.cropType === 'pasture' ? '#166534' :
                                    yearData.cropType === 'fallow' ? '#92400e' :
                                    yearData.cropType === 'forest' ? '#065f46' :
                                    yearData.cropType === 'developed' ? '#9a3412' :
                                    yearData.cropType === 'water' ? '#155e75' : '#1f2937'
                            }}
                            title={`Crop type: ${yearData.cropType}`}
                          >
                            {yearData.cropType === 'annual' ? (
                              <Calendar size={14} style={{ color: '#1e40af' }} />
                            ) : yearData.cropType === 'perennial' ? (
                              <Repeat size={14} style={{ color: '#6b21a8' }} />
                            ) : yearData.cropType === 'permanent' ? (
                              <TreeDeciduous size={14} style={{ color: '#991b1b' }} />
                            ) : yearData.cropType === 'pasture' ? (
                              <Clover size={14} style={{ color: '#166534' }} />
                            ) : yearData.cropType === 'fallow' ? (
                              <MinusCircle size={14} style={{ color: '#a16207' }} />
                            ) : yearData.cropType === 'forest' ? (
                              <TreeDeciduous size={14} style={{ color: '#065f46' }} />
                            ) : yearData.cropType === 'developed' ? (
                              <Building2 size={14} style={{ color: '#c2410c' }} />
                            ) : yearData.cropType === 'water' ? (
                              <Waves size={14} style={{ color: '#155e75' }} />
                            ) : (
                              <HelpCircle size={14} style={{ color: '#374151' }} />
                            )}
                          </span>
                        )}
                        <div className="relative flex-1">
                          <div
                            className={`flex h-6 items-center rounded border px-2 transition-all group-hover:shadow-md ${
                              yearData.transitionWarning
                                ? 'border-orange-400 border-2'
                                : 'border-gray-200 group-hover:border-gray-300'
                            }`}
                            style={{ backgroundColor: yearData.color }}
                            title={yearData.transitionWarning || undefined}
                          >
                            <span className="text-gray-900 flex-1 text-xs font-medium drop-shadow-sm">
                              {yearData.cropName}
                            </span>
                            {yearData.confidence && (
                              <span
                                className="rounded px-1 py-0.5 text-[10px]"
                                style={{
                                  backgroundColor: yearData.confidence >= 80 ? '#dcfce7' :
                                                 yearData.confidence >= 50 ? '#fef3c7' : '#fee2e2',
                                  color: yearData.confidence >= 80 ? '#166534' :
                                        yearData.confidence >= 50 ? '#92400e' : '#991b1b'
                                }}
                              >
                                {yearData.confidence}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {yearData.transitionWarning && (
                        <div className="text-orange-600 ml-12 flex items-start space-x-1 text-[10px]">
                          <span className="mt-0.5">⚠</span>
                          <span>{yearData.transitionWarning}</span>
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {/* Legend for crop types */}
              <div className="border-gray-200 mt-3 border-t pt-3">
                <div className="flex flex-wrap gap-2 text-[10px]">
                  <div className="flex items-center space-x-1">
                    <span className="rounded px-1.5 py-0.5 font-bold flex items-center" style={{ backgroundColor: '#dbeafe' }}>
                      <Calendar size={14} style={{ color: '#1e40af' }} />
                    </span>
                    <span className="text-gray-600">Annual</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="rounded px-1.5 py-0.5 font-bold flex items-center" style={{ backgroundColor: '#f3e8ff' }}>
                      <Repeat size={14} style={{ color: '#6b21a8' }} />
                    </span>
                    <span className="text-gray-600">Perennial</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="rounded px-1.5 py-0.5 font-bold flex items-center" style={{ backgroundColor: '#fee2e2' }}>
                      <TreeDeciduous size={14} style={{ color: '#991b1b' }} />
                    </span>
                    <span className="text-gray-600">Permanent</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="rounded px-1.5 py-0.5 font-bold flex items-center" style={{ backgroundColor: '#dcfce7' }}>
                      <Clover size={14} style={{ color: '#166534' }} />
                    </span>
                    <span className="text-gray-600">Pasture</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="rounded px-1.5 py-0.5 font-bold flex items-center" style={{ backgroundColor: '#fef3c7' }}>
                      <MinusCircle size={14} style={{ color: '#a16207' }} />
                    </span>
                    <span className="text-gray-600">Fallow</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="rounded px-1.5 py-0.5 font-bold flex items-center" style={{ backgroundColor: '#d1fae5' }}>
                      <TreeDeciduous size={14} style={{ color: '#065f46' }} />
                    </span>
                    <span className="text-gray-600">Forest</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="rounded px-1.5 py-0.5 font-bold flex items-center" style={{ backgroundColor: '#ffedd5' }}>
                      <Building2 size={14} style={{ color: '#c2410c' }} />
                    </span>
                    <span className="text-gray-600">Developed</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="bg-cyan-100 rounded px-1.5 py-0.5 font-bold flex items-center">
                      <Waves size={14} style={{ color: '#155e75' }} />
                    </span>
                    <span className="text-gray-600">Water</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="bg-gray-100 rounded px-1.5 py-0.5 font-bold flex items-center">
                      <HelpCircle size={14} style={{ color: '#374151' }} />
                    </span>
                    <span className="text-gray-600">Non-Cropland</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Crop Frequency Distribution */}
            <div className="border-gray-200 rounded-lg border bg-white p-4">
              <h4 className="text-gray-900 mb-3 text-sm font-semibold">Crop Frequency</h4>
              <div className="space-y-2">
                {(() => {
                  // Count occurrences of each crop
                  const cropCounts: Record<string, { count: number; color: string }> = {}
                  cdlHistory.forEach(yearData => {
                    if (!cropCounts[yearData.cropName]) {
                      cropCounts[yearData.cropName] = { count: 0, color: yearData.color }
                    }
                    cropCounts[yearData.cropName].count++
                  })

                  // Sort by frequency
                  const sortedCrops = Object.entries(cropCounts).sort((a, b) => b[1].count - a[1].count)

                  return sortedCrops.map(([cropName, data]) => {
                    const percentage = (data.count / cdlHistory.length) * 100
                    return (
                      <div key={cropName} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <div
                              className="border-gray-300 h-4 w-4 rounded border"
                              style={{ backgroundColor: data.color }}
                            />
                            <span className="text-gray-900">{cropName}</span>
                          </div>
                          <span className="text-gray-600 font-medium">
                            {data.count} {data.count === 1 ? 'year' : 'years'} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="bg-gray-200 h-2 w-full rounded-full">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: data.color,
                            }}
                          />
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>
            </div>

            {/* Rotation Pattern Analysis */}
            <div className="rounded-lg p-4" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <h4 className="mb-2 text-sm font-semibold" style={{ color: '#1e3a8a' }}>Rotation Pattern</h4>
              <div className="space-y-1 text-sm" style={{ color: '#1e40af' }}>
                {(() => {
                  const crops = cdlHistory.map(d => d.cropName)
                  const uniqueCrops = [...new Set(crops)]

                  if (uniqueCrops.length === 1) {
                    return <p>Monoculture: {uniqueCrops[0]} grown consistently</p>
                  }
                  if (uniqueCrops.length === 2) {
                    return <p>2-crop rotation between {uniqueCrops.join(' and ')}</p>
                  }
                  return (
                    <>
                      <p>Complex rotation with {uniqueCrops.length} different crops:</p>
                      <p className="mt-1 text-xs">{uniqueCrops.join(', ')}</p>
                    </>
                  )
                })()}
              </div>
            </div>

            {/* Data Source Footer */}
            <div className="text-gray-500 border-gray-200 border-t pt-2 text-center text-xs">
              Data: USDA NASS Cropland Data Layer (2008-2023)
            </div>
          </div>
        )}

        {activeTab === 'cropland' && (!cdlHistory || cdlHistory.length === 0) && (
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <div className="bg-gray-100 flex h-16 w-16 items-center justify-center rounded-full">
              <BarChart3 className="text-gray-400 h-8 w-8" />
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-gray-900 text-lg font-semibold">No Cropland Data</h3>
              <p className="text-gray-600 max-w-xs text-sm">
                Click on the map to query cropland history for that location
              </p>
            </div>
          </div>
        )}


      </div>
      {/* Summary Modal Popup */}
      {showSummaryModal && ssurgoData && (
        <div
          className="bg-black fixed inset-0 z-50 flex items-center justify-center bg-opacity-50"
          onClick={() => setShowSummaryModal(false)}
        >
          <div
            className="flex h-5/6 w-11/12 flex-col rounded-lg bg-white shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="border-gray-300 flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-gray-900 text-lg font-bold">UC Davis SoilWeb Summary</h2>
                <p className="text-gray-600 text-sm">MUKEY: {ssurgoData.mukey}</p>
              </div>
              <button
                onClick={() => setShowSummaryModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Close"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={`https://casoilresource.lawr.ucdavis.edu/soil_web/list_components.php?mukey=${ssurgoData.mukey}`}
                className="h-full w-full border-0"
                title="UC Davis SoilWeb Summary"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Dashboard - Render in portal outside PropertyPanel */}
      {showFullDashboard && ssurgoData && typeof document !== 'undefined' && createPortal(
        <SoilDashboard
          ssurgoData={ssurgoData}
          cdlHistory={cdlHistory}
          onClose={() => setShowFullDashboard(false)}
        />,
        document.body
      )}

      {/* Expanded CDL Chart Modal - Render in portal outside PropertyPanel */}
      {showExpandedCDLChart && cdlHistory && cdlHistory.length > 0 && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 flex items-center justify-center p-4" 
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)', 
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 10000 
          }}
        >
          <div 
            className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden"
            style={{
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.98), rgba(249, 250, 251, 0.98))',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.9)'
            }}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                padding: '20px 24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <div>
                <h2 style={{ fontSize: '22px', color: '#ffffff', marginBottom: '4px', fontWeight: 'bold' }}>
                  Crop Rotation History
                </h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px' }}>
                  {cdlHistory.length} years of USDA NASS Cropland Data Layer
                </p>
              </div>
              <button
                onClick={() => setShowExpandedCDLChart(false)}
                className="rounded-lg p-2 transition-all"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                title="Close"
              >
                <X size={24} />
              </button>
            </div>

            {/* Chart Content */}
            <div className="flex-1 overflow-auto" style={{ padding: '24px' }}>
              <div className="space-y-6">
                {/* Horizontal Bar Chart - Full Size */}
                <div 
                  className="rounded-xl p-6"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid rgba(229, 231, 235, 0.8)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 style={{ fontSize: '17px', color: '#111827', fontWeight: '600' }}>
                      Year-by-Year Timeline
                    </h3>
                    {/* Legend - Dynamic based on actual crop types */}
                    <div className="flex gap-3 text-xs flex-wrap">
                      {(() => {
                        const uniqueCropTypes = [...new Set(cdlHistory.map(d => d.cropType).filter(Boolean))];
                        return uniqueCropTypes.map(cropType => {
                          if (cropType === 'annual') {
                            return (
                              <div key="annual" className="flex items-center space-x-1">
                                <span className="rounded px-1.5 py-0.5 font-bold flex items-center" style={{ backgroundColor: '#dbeafe' }}>
                                  <Calendar size={14} style={{ color: '#1e40af' }} />
                                </span>
                                <span className="text-gray-600">Annual</span>
                              </div>
                            );
                          } else if (cropType === 'perennial') {
                            return (
                              <div key="perennial" className="flex items-center space-x-1">
                                <span className="rounded px-1.5 py-0.5 font-bold flex items-center" style={{ backgroundColor: '#f3e8ff' }}>
                                  <Repeat size={14} style={{ color: '#6b21a8' }} />
                                </span>
                                <span className="text-gray-600">Perennial</span>
                              </div>
                            );
                          } else if (cropType === 'permanent') {
                            return (
                              <div key="permanent" className="flex items-center space-x-1">
                                <span className="rounded px-1.5 py-0.5 font-bold flex items-center" style={{ backgroundColor: '#fee2e2' }}>
                                  <TreeDeciduous size={14} style={{ color: '#991b1b' }} />
                                </span>
                                <span className="text-gray-600">Permanent</span>
                              </div>
                            );
                          } else if (cropType === 'pasture') {
                            return (
                              <div key="pasture" className="flex items-center space-x-1">
                                <span className="rounded px-1.5 py-0.5 font-bold flex items-center" style={{ backgroundColor: '#dcfce7' }}>
                                  <Clover size={14} style={{ color: '#166534' }} />
                                </span>
                                <span className="text-gray-600">Pasture</span>
                              </div>
                            );
                          } else if (cropType === 'fallow') {
                            return (
                              <div key="fallow" className="flex items-center space-x-1">
                                <span className="rounded px-1.5 py-0.5 font-bold flex items-center" style={{ backgroundColor: '#fef3c7' }}>
                                  <MinusCircle size={14} style={{ color: '#a16207' }} />
                                </span>
                                <span className="text-gray-600">Fallow</span>
                              </div>
                            );
                          } else if (cropType === 'forest') {
                            return (
                              <div key="forest" className="flex items-center space-x-1">
                                <span className="rounded px-1.5 py-0.5 font-bold flex items-center" style={{ backgroundColor: '#d1fae5' }}>
                                  <TreeDeciduous size={14} style={{ color: '#065f46' }} />
                                </span>
                                <span className="text-gray-600">Forest</span>
                              </div>
                            );
                          } else if (cropType === 'developed') {
                            return (
                              <div key="developed" className="flex items-center space-x-1">
                                <span className="rounded px-1.5 py-0.5 font-bold flex items-center" style={{ backgroundColor: '#ffedd5' }}>
                                  <Building2 size={14} style={{ color: '#c2410c' }} />
                                </span>
                                <span className="text-gray-600">Developed</span>
                              </div>
                            );
                          } else if (cropType === 'water') {
                            return (
                              <div key="water" className="flex items-center space-x-1">
                                <span className="rounded px-1.5 py-0.5 font-bold flex items-center" style={{ backgroundColor: '#cffafe' }}>
                                  <Waves size={14} style={{ color: '#155e75' }} />
                                </span>
                                <span className="text-gray-600">Water</span>
                              </div>
                            );
                          } else if (cropType === 'non-cropland') {
                            return (
                              <div key="non-cropland" className="flex items-center space-x-1">
                                <span className="bg-gray-100 rounded px-1.5 py-0.5 font-bold flex items-center">
                                  <HelpCircle size={14} style={{ color: '#374151' }} />
                                </span>
                                <span className="text-gray-600">Non-Cropland</span>
                              </div>
                            );
                          }
                          return null;
                        });
                      })()}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {cdlHistory
                      .sort((a, b) => b.year - a.year)
                      .map(yearData => (
                        <div key={yearData.year} className="space-y-1">
                          <div className="group flex items-center space-x-3">
                            <span className="text-gray-700 w-12 text-right text-sm font-bold">
                              {yearData.year}
                            </span>
                            {/* Crop type badge */}
                            {yearData.cropType && (
                              <span
                                className={`rounded px-1.5 py-1 text-xs font-bold ${
                                  yearData.cropType === 'annual'
                                    ? 'bg-ocean-100 text-ocean-800'
                                    : yearData.cropType === 'perennial'
                                    ? 'bg-lavender-100 text-lavender-800'
                                    : yearData.cropType === 'permanent'
                                    ? 'bg-clay-100 text-clay-800'
                                    : yearData.cropType === 'pasture'
                                    ? 'bg-forest-100 text-forest-800'
                                    : yearData.cropType === 'fallow'
                                    ? 'bg-amber-100 text-amber-800'
                                    : yearData.cropType === 'forest'
                                    ? 'bg-moss-100 text-moss-800'
                                    : yearData.cropType === 'developed'
                                    ? 'bg-copper-100 text-copper-800'
                                    : yearData.cropType === 'water'
                                    ? 'bg-sky-100 text-sky-800'
                                    : 'bg-slate-100 text-slate-800'
                                }`}
                                title={`Crop type: ${yearData.cropType}`}
                              >
                                {yearData.cropType === 'annual' ? (
                                  <Calendar size={14} style={{ color: 'var(--color-ocean-800)' }} />
                                ) : yearData.cropType === 'perennial' ? (
                                  <Repeat size={14} style={{ color: 'var(--color-lavender-800)' }} />
                                ) : yearData.cropType === 'permanent' ? (
                                  <TreeDeciduous size={14} style={{ color: 'var(--color-clay-800)' }} />
                                ) : yearData.cropType === 'pasture' ? (
                                  <Clover size={14} style={{ color: 'var(--color-forest-800)' }} />
                                ) : yearData.cropType === 'fallow' ? (
                                  <MinusCircle size={14} style={{ color: 'var(--color-amber-800)' }} />
                                ) : yearData.cropType === 'forest' ? (
                                  <TreeDeciduous size={14} style={{ color: 'var(--color-moss-800)' }} />
                                ) : yearData.cropType === 'developed' ? (
                                  <Building2 size={14} style={{ color: 'var(--color-copper-800)' }} />
                                ) : yearData.cropType === 'water' ? (
                                  <Waves size={14} style={{ color: 'var(--color-sky-800)' }} />
                                ) : (
                                  <HelpCircle size={14} style={{ color: 'var(--color-slate-800)' }} />
                                )}
                              </span>
                            )}
                            <div className="relative flex-1">
                              <div
                                className={`flex h-10 items-center justify-between rounded-lg px-4 shadow-sm transition-all group-hover:scale-[1.02] group-hover:shadow-lg ${
                                  yearData.transitionWarning
                                    ? 'border-orange-400 border-2'
                                    : 'border-gray-300 border-2'
                                }`}
                                style={{ backgroundColor: yearData.color }}
                                title={yearData.transitionWarning || undefined}
                              >
                                <span className="text-gray-900 text-sm font-semibold drop-shadow-sm">
                                  {yearData.cropName}
                                </span>
                                {yearData.confidence && (
                                  <span
                                    className={`rounded px-2 py-1 text-xs font-bold ${
                                      yearData.confidence >= 80
                                        ? 'bg-forest-200 text-forest-900'
                                        : yearData.confidence >= 50
                                        ? 'bg-amber-200 text-amber-900'
                                        : 'bg-clay-200 text-clay-900'
                                    }`}
                                  >
                                    {yearData.confidence}% confidence
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {yearData.transitionWarning && (
                            <div className="alert-caution ml-16 flex items-start space-x-2 rounded p-2 text-sm">
                              <span className="text-lg">⚠</span>
                              <span>{yearData.transitionWarning}</span>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Flow Diagram Style */}
                <div 
                  className="rounded-xl p-6"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid rgba(229, 231, 235, 0.8)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <h3 className="mb-4" style={{ fontSize: '17px', color: '#111827', fontWeight: '600' }}>
                    Rotation Pattern
                  </h3>
                  <div className="relative" style={{ height: '400px' }}>
                    {/* Y-axis labels (crop names) */}
                    <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between pr-4">
                      {(() => {
                        const uniqueCrops = [...new Set(cdlHistory.map(d => d.cropName))].sort()
                        return uniqueCrops.map(crop => (
                          <div key={crop} className="text-right text-sm font-medium" style={{ color: '#374151' }}>
                            {crop}
                          </div>
                        ))
                      })()}
                    </div>

                    {/* Chart area */}
                    <div className="absolute left-40 right-0 top-0 bottom-12">
                      {/* Grid lines */}
                      <div className="absolute inset-0 flex flex-col justify-between">
                        {[...new Set(cdlHistory.map(d => d.cropName))].map((crop, idx) => (
                          <div key={idx} style={{ borderTop: '1px solid rgba(229, 231, 235, 0.5)' }} />
                        ))}
                      </div>

                      {/* Data points */}
                      <div className="absolute inset-0 flex items-stretch">
                        {cdlHistory
                          .sort((a, b) => a.year - b.year)
                          .map((yearData, idx) => {
                            const uniqueCrops = [...new Set(cdlHistory.map(d => d.cropName))].sort()
                            const cropIndex = uniqueCrops.indexOf(yearData.cropName)
                            const totalCrops = uniqueCrops.length
                            const yPosition = totalCrops > 1 ? (cropIndex / (totalCrops - 1)) * 100 : 50

                            return (
                              <div key={yearData.year} className="group relative flex-1">
                                <div
                                  className="absolute left-1/2 h-5 w-5 cursor-pointer rounded-full transition-all group-hover:z-10 group-hover:scale-150"
                                  style={{
                                    backgroundColor: yearData.color,
                                    top: `${yPosition}%`,
                                    transform: 'translate(-50%, -50%)',
                                    border: '3px solid white',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)'
                                  }}
                                />
                                {/* Tooltip on hover */}
                                <div
                                  className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 transform whitespace-nowrap rounded-lg px-3 py-2 text-sm opacity-0 shadow-xl transition-opacity group-hover:opacity-100"
                                  style={{ 
                                    top: `${yPosition}%`, 
                                    marginTop: '-50px',
                                    backgroundColor: '#1f2937',
                                    color: '#ffffff'
                                  }}
                                >
                                  <div className="font-bold">{yearData.year}</div>
                                  <div>{yearData.cropName}</div>
                                </div>
                                {/* Connect lines */}
                                {idx < cdlHistory.length - 1 &&
                                  (() => {
                                    const sortedHistory = cdlHistory.sort((a, b) => a.year - b.year)
                                    const nextYear = sortedHistory[idx + 1]
                                    const nextCropIndex = uniqueCrops.indexOf(nextYear.cropName)
                                    const nextYPosition =
                                      totalCrops > 1 ? (nextCropIndex / (totalCrops - 1)) * 100 : 50
                                    const height = Math.abs(nextYPosition - yPosition)
                                    const topPos = Math.min(yPosition, nextYPosition)

                                    return (
                                      <div
                                        className="absolute left-1/2 w-1"
                                        style={{
                                          top: `${topPos}%`,
                                          height: `${height}%`,
                                          right: '-50%',
                                          backgroundColor: 'rgba(156, 163, 175, 0.4)'
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
                    <div className="absolute left-40 right-0 bottom-0 flex justify-between text-sm font-medium" style={{ color: '#374151' }}>
                      {cdlHistory
                        .sort((a, b) => a.year - b.year)
                        .map(yearData => (
                          <div key={yearData.year} className="flex-1 text-center">
                            {yearData.year}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {/* Crop Frequency */}
                  <div 
                    className="rounded-xl p-6"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(229, 231, 235, 0.8)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <h3 className="mb-4" style={{ fontSize: '17px', color: '#111827', fontWeight: '600' }}>
                      Crop Frequency
                    </h3>
                    <div className="space-y-3">
                      {(() => {
                        const cropCounts: Record<string, { count: number; color: string }> = {}
                        cdlHistory.forEach(yearData => {
                          if (!cropCounts[yearData.cropName]) {
                            cropCounts[yearData.cropName] = { count: 0, color: yearData.color }
                          }
                          cropCounts[yearData.cropName].count++
                        })

                        const sortedCrops = Object.entries(cropCounts).sort((a, b) => b[1].count - a[1].count)

                        return sortedCrops.map(([cropName, data]) => {
                          const percentage = (data.count / cdlHistory.length) * 100
                          return (
                            <div key={cropName} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-2">
                                  <div
                                    className="h-5 w-5 rounded border-2"
                                    style={{ 
                                      backgroundColor: data.color,
                                      borderColor: 'rgba(209, 213, 219, 0.5)'
                                    }}
                                  />
                                  <span style={{ color: '#111827', fontWeight: '500' }}>{cropName}</span>
                                </div>
                                <span style={{ color: '#6b7280', fontWeight: '600' }}>
                                  {data.count} yr ({percentage.toFixed(0)}%)
                                </span>
                              </div>
                              <div className="h-3 w-full rounded-full" style={{ backgroundColor: 'rgba(229, 231, 235, 0.6)' }}>
                                <div
                                  className="h-3 rounded-full shadow-sm transition-all"
                                  style={{
                                    width: `${percentage}%`,
                                    backgroundColor: data.color,
                                  }}
                                />
                              </div>
                            </div>
                          )
                        })
                      })()}
                    </div>
                  </div>

                  {/* Rotation Pattern */}
                  <div 
                    className="rounded-xl p-6"
                    style={{
                      backgroundColor: 'rgba(239, 246, 255, 0.6)',
                      border: '1px solid rgba(191, 219, 254, 0.8)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <h3 className="mb-4" style={{ fontSize: '17px', color: '#1e3a8a', fontWeight: '600' }}>
                      Rotation Pattern
                    </h3>
                    <div className="space-y-2 text-sm" style={{ color: '#1e40af' }}>
                      {(() => {
                        const crops = cdlHistory.map(d => d.cropName)
                        const uniqueCrops = [...new Set(crops)]

                        if (uniqueCrops.length === 1) {
                          return (
                            <>
                              <p style={{ fontWeight: '600' }}>Monoculture</p>
                              <p>
                                {uniqueCrops[0]} grown consistently across all {cdlHistory.length} years
                              </p>
                            </>
                          )
                        }
                        if (uniqueCrops.length === 2) {
                          return (
                            <>
                              <p style={{ fontWeight: '600' }}>2-Crop Rotation</p>
                              <p>Alternating between {uniqueCrops.join(' and ')}</p>
                            </>
                          )
                        }
                        return (
                          <>
                            <p style={{ fontWeight: '600' }}>Complex Rotation</p>
                            <p>
                              {uniqueCrops.length} different crops over {cdlHistory.length} years
                            </p>
                            <div className="mt-3 text-xs">
                              <p className="mb-1" style={{ fontWeight: '500' }}>Crops:</p>
                              <p>{uniqueCrops.join(', ')}</p>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </div>

                  {/* Transition Analysis */}
                  <div 
                    className="rounded-xl p-6"
                    style={{
                      backgroundColor: 'rgba(250, 245, 255, 0.6)',
                      border: '1px solid rgba(233, 213, 255, 0.8)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <h3 className="mb-4" style={{ fontSize: '17px', color: '#581c87', fontWeight: '600' }}>
                      Transitions
                    </h3>
                    <div className="space-y-2 text-sm" style={{ color: '#6b21a8' }}>
                      {(() => {
                        const sortedHistory = cdlHistory.sort((a, b) => a.year - b.year)
                        const transitions: Record<string, number> = {}

                        for (let i = 0; i < sortedHistory.length - 1; i++) {
                          const from = sortedHistory[i].cropName
                          const to = sortedHistory[i + 1].cropName
                          if (from !== to) {
                            const key = `${from} → ${to}`
                            transitions[key] = (transitions[key] || 0) + 1
                          }
                        }

                        const totalTransitions = Object.values(transitions).reduce((a, b) => a + b, 0)
                        const topTransitions = Object.entries(transitions)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 5)

                        return (
                          <>
                            <p style={{ fontWeight: '600' }}>{totalTransitions} crop changes</p>
                            {topTransitions.length > 0 && (
                              <div className="mt-3 space-y-1">
                                <p className="text-xs" style={{ fontWeight: '500' }}>Most common:</p>
                                {topTransitions.map(([trans, count]) => (
                                  <div key={trans} className="flex justify-between text-xs">
                                    <span>{trans}</span>
                                    <span style={{ fontWeight: '600' }}>{count}×</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div 
              className="text-center text-sm flex-shrink-0"
              style={{
                borderTop: '1px solid rgba(229, 231, 235, 0.6)',
                padding: '16px',
                color: '#6b7280',
                backgroundColor: 'rgba(249, 250, 251, 0.5)'
              }}
            >
              Data source: USDA NASS Cropland Data Layer (CropScape) • 30m resolution • 2008-2023
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Profile Comparison Modal - Render in portal outside PropertyPanel */}
      {showProfileComparison && ssurgoData?.components && typeof document !== 'undefined' && createPortal(
        <ProfileComparisonModal
          components={ssurgoData.components}
          onClose={() => setShowProfileComparison(false)}
        />,
        document.body
      )}
    </div>
  )
}

interface PropertyRowProps {
  label: string
  value: string | number
  children?: React.ReactNode
}

const PropertyRow = ({ label, value, children }: PropertyRowProps) => (
  <div className="border-gray-100 flex items-center justify-between border-b py-1 last:border-0">
    <span className="text-gray-600 text-sm">{label}</span>
    <div className="flex items-center gap-2">
      {children}
      <span className="text-gray-900 text-sm font-medium">{value}</span>
    </div>
  </div>
)
