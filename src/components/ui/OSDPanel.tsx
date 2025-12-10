// Official Series Description (OSD) Display Panel Component

import React, { useState, useEffect } from 'react'
import {
  Info,
  Layers,
  Thermometer,
  Droplets,
  MapPin,
  Calendar,
  Award,
  ChevronDown,
  ChevronRight,
  Mountain,
  Leaf,
  FileText,
} from 'lucide-react'
import type { FormattedOSDData } from '#src/types/osd'
import { getDescriptionText } from '#src/utils/osdDescriptionLoader'

// Soil Property Ranges for Classification
const soilPropertyRanges: Record<
  string,
  Array<{ min: number; max: number; label: string; color: string }>
> = {
  clay: [
    { min: 0, max: 5, label: 'Very Low', color: '#fef3c7' },
    { min: 5, max: 15, label: 'Low', color: '#fde68a' },
    { min: 15, max: 25, label: 'Moderate', color: '#fcd34d' },
    { min: 25, max: 35, label: 'Moderately High', color: '#f59e0b' },
    { min: 35, max: 45, label: 'High', color: '#d97706' },
    { min: 45, max: 55, label: 'Very High', color: '#b45309' },
    { min: 55, max: 70, label: 'Extremely High', color: '#92400e' },
    { min: 70, max: 100, label: 'Maximum', color: '#78350f' },
  ],
  om: [
    { min: 0, max: 0.5, label: 'Very Low', color: '#fee2e2' },
    { min: 0.5, max: 1, label: 'Low', color: '#fecaca' },
    { min: 1, max: 2, label: 'Moderate', color: '#fca5a5' },
    { min: 2, max: 4, label: 'Moderate-High', color: '#f87171' },
    { min: 4, max: 6, label: 'High', color: '#ef4444' },
    { min: 6, max: 10, label: 'Very High', color: '#dc2626' },
    { min: 10, max: 20, label: 'Extremely High', color: '#b91c1c' },
    { min: 20, max: 100, label: 'Organic', color: '#991b1b' },
  ],
  ph: [
    { min: 3.0, max: 4.5, label: 'Extremely Acid', color: '#fee2e2' },
    { min: 4.5, max: 5.0, label: 'Very Strongly Acid', color: '#fecaca' },
    { min: 5.0, max: 5.5, label: 'Strongly Acid', color: '#fca5a5' },
    { min: 5.5, max: 6.0, label: 'Moderately Acid', color: '#f87171' },
    { min: 6.0, max: 6.5, label: 'Slightly Acid', color: '#fbbf24' },
    { min: 6.5, max: 7.3, label: 'Neutral', color: '#10b981' },
    { min: 7.3, max: 8.0, label: 'Slightly Alkaline', color: '#3b82f6' },
    { min: 8.0, max: 8.5, label: 'Moderately Alkaline', color: '#6366f1' },
    { min: 8.5, max: 10.5, label: 'Strongly Alkaline', color: '#8b5cf6' },
  ],
  awc: [
    { min: 0.0, max: 0.05, label: 'Very Low', color: '#fee2e2' },
    { min: 0.05, max: 0.1, label: 'Low', color: '#fecaca' },
    { min: 0.1, max: 0.15, label: 'Moderately Low', color: '#bfdbfe' },
    { min: 0.15, max: 0.2, label: 'Moderate', color: '#93c5fd' },
    { min: 0.2, max: 0.25, label: 'Moderately High', color: '#60a5fa' },
    { min: 0.25, max: 0.3, label: 'High', color: '#3b82f6' },
    { min: 0.3, max: 0.4, label: 'Very High', color: '#2563eb' },
    { min: 0.4, max: 0.6, label: 'Extremely High', color: '#1d4ed8' },
  ],
  ksat: [
    { min: 0.001, max: 0.1, label: 'Very Slow', color: '#1e1b4b' },
    { min: 0.1, max: 1, label: 'Slow', color: '#312e81' },
    { min: 1, max: 4, label: 'Moderately Slow', color: '#4c1d95' },
    { min: 4, max: 14, label: 'Moderate', color: '#7c3aed' },
    { min: 14, max: 40, label: 'Moderately Rapid', color: '#8b5cf6' },
    { min: 40, max: 140, label: 'Rapid', color: '#a78bfa' },
    { min: 140, max: 400, label: 'Very Rapid', color: '#c4b5fd' },
    { min: 400, max: 2000, label: 'Extremely Rapid', color: '#e0e7ff' },
  ],
}

// Classify property value
function classifyProperty(value: number, property: string): { color: string; label: string } {
  const ranges = soilPropertyRanges[property]
  if (!ranges) return { color: '#d1d5db', label: 'Unknown' }

  for (let i = 0; i < ranges.length - 1; i++) {
    if (value >= ranges[i].min && value < ranges[i].max) {
      return { color: ranges[i].color, label: ranges[i].label }
    }
  }

  const lastRange = ranges[ranges.length - 1]
  if (value >= lastRange.min && value <= lastRange.max) {
    return { color: lastRange.color, label: lastRange.label }
  }

  return { color: '#d1d5db', label: 'Unknown' }
}

// USDA Texture Classification Function
function getTextureClass(sand: number, silt: number, clay: number): string {
  const silt_clay = silt + 1.5 * clay
  const silt_2_clay = silt + 2.0 * clay

  if (silt_clay < 15) return 'Sand'
  if (silt_clay < 30) return 'Loamy sand'
  if (
    (clay >= 7 && clay <= 20 && sand > 52 && silt_2_clay >= 30) ||
    (clay < 7 && silt < 50 && silt_2_clay >= 30)
  ) {
    return 'Sandy loam'
  }
  if (clay >= 7 && clay <= 27 && silt >= 28 && silt < 50 && sand <= 52) return 'Loam'
  if ((silt >= 50 && clay >= 12 && clay < 27) || (silt >= 50 && silt < 80 && clay < 12)) return 'Silt loam'
  if (silt >= 80 && clay < 12) return 'Silt'
  if (clay >= 20 && clay < 35 && silt < 28 && sand > 45) return 'Sandy clay loam'
  if (clay >= 27 && clay < 40 && sand > 20 && sand <= 45) return 'Clay loam'
  if (clay >= 27 && clay < 40 && sand <= 20) return 'Silty clay loam'
  if (clay >= 35 && sand >= 45) return 'Sandy clay'
  if (clay >= 40 && silt >= 40) return 'Silty clay'
  else if (clay >= 40 && sand <= 45 && silt < 40) return 'Clay'
  else return 'Unknown'
}

// Get color for texture class
function getTextureClassColor(textureClass: string): string {
  const colorMap: Record<string, string> = {
    Sand: '#f4e4c1',
    'Loamy sand': '#e6d4a8',
    'Sandy loam': '#d9c48f',
    Loam: '#8b7355',
    'Silt loam': '#a0826d',
    Silt: '#c8b597',
    'Sandy clay loam': '#9d7f5c',
    'Clay loam': '#7a5c3f',
    'Silty clay loam': '#8d6e4f',
    'Sandy clay': '#6b4e3d',
    'Silty clay': '#5c4033',
    Clay: '#4a3728',
    Unknown: '#d1d5db',
  }
  return colorMap[textureClass] || '#d1d5db'
}

// Helper function to group interpretations by category
function groupInterpretations(interpretations: any[]) {
  const groups: Record<string, any[]> = {
    agricultural: [],
    engineering: [],
    environmental: [],
    development: [],
    other: [],
  }

  interpretations.forEach(interp => {
    const name = (interp.rulename || '').toLowerCase()

    if (
      name.includes('agr') ||
      name.includes('crop') ||
      name.includes('farm') ||
      name.includes('irrigation')
    ) {
      groups.agricultural.push(interp)
    } else if (
      name.includes('eng') ||
      name.includes('construct') ||
      name.includes('build') ||
      name.includes('foundation')
    ) {
      groups.engineering.push(interp)
    } else if (
      name.includes('env') ||
      name.includes('wildlife') ||
      name.includes('habitat') ||
      name.includes('wetland')
    ) {
      groups.environmental.push(interp)
    } else if (
      name.includes('dwel') ||
      name.includes('septic') ||
      name.includes('road') ||
      name.includes('path')
    ) {
      groups.development.push(interp)
    } else {
      groups.other.push(interp)
    }
  })

  return groups
}

// Component to display interpretations
function InterpretationsContent({ interpretations }: { interpretations: any[] }) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const groups = groupInterpretations(interpretations)

  // Group metadata
  const groupInfo: Record<string, { name: string; icon: string; color: string }> = {
    agricultural: { name: 'Agricultural', icon: '🌾', color: '#059669' },
    engineering: { name: 'Engineering', icon: '🏗️', color: '#7c3aed' },
    environmental: { name: 'Environmental', icon: '🌿', color: '#10b981' },
    development: { name: 'Development', icon: '🏘️', color: '#3b82f6' },
    other: { name: 'Other', icon: '📋', color: '#6b7280' },
  }

  // Rating color function
  const getRatingStyle = (rating: string) => {
    const r = rating.toLowerCase()
    if (r.includes('not') || r.includes('severe') || r.includes('very limited')) {
      return { backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }
    }
    if (r.includes('slight') || r.includes('well') || r.includes('not limited')) {
      return { backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0' }
    }
    return { backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }
  }

  return (
    <div className="space-y-2">
      {Object.entries(groups).map(([key, groupInterps]) => {
        if (groupInterps.length === 0) return null
        const info = groupInfo[key]
        const isExpanded = expandedGroup === key

        return (
          <div key={key} className="border-gray-200 rounded border">
            <button
              onClick={() => setExpandedGroup(isExpanded ? null : key)}
              className="hover:bg-gray-100 flex w-full items-center justify-between px-3 py-2 transition-colors"
              style={{ borderLeft: `3px solid ${info.color}` }}
            >
              <div className="flex items-center gap-2">
                <span>{info.icon}</span>
                <span className="text-gray-800 text-xs font-semibold">{info.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-gray-100 rounded-full px-2 py-0.5 text-xs font-medium">
                  {groupInterps.length}
                </span>
                <svg
                  className="h-3 w-3 transition-transform"
                  style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6 6L14 10L6 14V6Z" />
                </svg>
              </div>
            </button>

            {isExpanded && (
              <div className="space-y-1.5 px-3 pb-2">
                {groupInterps.map((interp, idx) => (
                  <div key={idx} className="bg-white rounded p-2 text-xs">
                    <div className="text-gray-800 mb-1 font-medium">{interp.rulename}</div>
                    {interp.interphrc && (
                      <div className="mb-0.5 flex items-center gap-1">
                        <span className="text-gray-600">Rating:</span>
                        <span
                          className="rounded px-1.5 py-0.5 font-medium"
                          style={getRatingStyle(interp.interphrc)}
                        >
                          {interp.interphrc}
                        </span>
                      </div>
                    )}
                    {interp.ruledepth != null && (
                      <div className="text-gray-500">Depth: {interp.ruledepth} cm</div>
                    )}
                    {interp.interphr && (
                      <div className="text-gray-600 mt-1 text-xs leading-tight">{interp.interphr}</div>
                    )}
                  </div>
                ))}

                {/* Collapse button at bottom */}
                <button
                  onClick={() => setExpandedGroup(null)}
                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 mt-2 flex w-full items-center justify-center gap-1 rounded px-2 py-1.5 text-xs transition-colors"
                >
                  <svg className="h-3 w-3 rotate-90" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 6L14 10L6 14V6Z" />
                  </svg>
                  <span>Collapse</span>
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}


interface OSDPanelProps {
  osdData: FormattedOSDData | null
  isLoading?: boolean
  className?: string
  interpretations?: any[]
  ssurgoHorizons?: any[]
}

interface CollapsibleSectionProps {
  title: string
  icon: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
  isOpen?: boolean
  onToggle?: () => void
}

function CollapsibleSection({ title, icon, defaultOpen = false, children, isOpen: controlledIsOpen, onToggle }: CollapsibleSectionProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen)
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen
  
  const handleToggle = () => {
    if (onToggle) {
      onToggle()
    } else {
      setInternalIsOpen(!internalIsOpen)
    }
  }

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-3 bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        {isOpen ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
      </button>
      {isOpen && <div className="p-3 bg-gray-50">{children}</div>}
    </div>
  )
}

function DataRow({ label, value, unit }: { label: string; value: string | number | null; unit?: string }) {
  if (value === null || value === undefined) return null

  return (
    <div className="flex justify-between py-1">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className="text-sm font-medium text-gray-900">
        {value}
        {unit && <span className="text-gray-500 ml-1">{unit}</span>}
      </span>
    </div>
  )
}

export default function OSDPanel({ osdData, isLoading, className = '', interpretations, ssurgoHorizons }: OSDPanelProps) {
  const [allExpanded, setAllExpanded] = useState(false)
  const [description, setDescription] = useState<string | null>(null)
  const [descriptionLoading, setDescriptionLoading] = useState(false)
  const [profileProperty, setProfileProperty] = useState<'texture' | 'clay' | 'om' | 'ph' | 'awc' | 'ksat'>('texture')
  const [sectionStates, setSectionStates] = useState({
    description: true,
    profile: false,
    classification: false,
    properties: false,
    interpretations: false,
    extent: false,
    horizons: false,
    parentMaterial: false,
    climate: false,
    ecological: false,
    associated: false,
  })

  const toggleAll = () => {
    const newState = !allExpanded
    setAllExpanded(newState)
    setSectionStates({
      description: newState,
      profile: newState,
      classification: newState,
      properties: newState,
      interpretations: newState,
      extent: newState,
      horizons: newState,
      parentMaterial: newState,
      climate: newState,
      ecological: newState,
      associated: newState,
    })
  }

  const toggleSection = (section: keyof typeof sectionStates) => {
    setSectionStates(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Load description when OSD data changes
  useEffect(() => {
    if (osdData?.seriesName) {
      setDescriptionLoading(true)
      getDescriptionText(osdData.seriesName)
        .then(text => {
          setDescription(text)
          setDescriptionLoading(false)
        })
        .catch(error => {
          console.error('Failed to load description:', error)
          setDescriptionLoading(false)
        })
    } else {
      setDescription(null)
    }
  }, [osdData?.seriesName])

  if (isLoading) {
    return (
      <div className={`bg-gray-100 rounded-lg shadow p-4 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <span className="ml-3 text-gray-600">Loading OSD data...</span>
        </div>
      </div>
    )
  }

  if (!osdData) {
    return (
      <div className={`bg-gray-100 rounded-lg shadow p-4 ${className}`}>
        <div className="text-center py-8 text-gray-500">
          <Info className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No Official Series Description available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gray-100 rounded-lg shadow overflow-hidden ${className}`} style={{ backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg" style={{ backgroundColor: '#2563eb', color: '#ffffff' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm" style={{ color: '#ffffff', opacity: 0.9 }}>{osdData.classification.family}</p>
          </div>
          <button
            onClick={toggleAll}
            className="px-3 py-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-sm font-medium transition-colors"
          >
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="divide-y divide-gray-200">
        {/* Description Section - FIRST */}
        <CollapsibleSection 
          title="Description" 
          icon={<FileText className="w-5 h-5 text-blue-600" />} 
          isOpen={sectionStates.description}
          onToggle={() => toggleSection('description')}
        >
          {descriptionLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
              <span className="ml-2 text-sm text-gray-600">Loading description...</span>
            </div>
          ) : description ? (
            <div className="prose prose-sm max-w-none">
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {description}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No description available for this soil series.</p>
          )}
        </CollapsibleSection>

        {/* Soil Profile Visualization */}
        {ssurgoHorizons && ssurgoHorizons.length > 0 && (
          <CollapsibleSection
            title="Soil Profile"
            icon={<Layers className="w-5 h-5 text-amber-600" />}
            isOpen={sectionStates.profile}
            onToggle={() => toggleSection('profile')}
          >
            <div className="space-y-3">
              {/* Property Selector */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Display Property:</span>
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

              {/* Profile Visualization */}
              <div className="bg-gray-50 border-gray-300 flex h-80 items-center justify-center rounded border p-4" style={{ position: 'relative' }}>
                <div style={{ width: '200px', height: '100%', position: 'relative', marginLeft: '60px' }}>
                  {/* Y-axis label */}
                  <div style={{
                    position: 'absolute',
                    left: '-75px',
                    top: '50%',
                    transform: 'translateY(-50%) rotate(-90deg)',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#374151',
                    whiteSpace: 'nowrap',
                  }}>
                    Depth (cm)
                  </div>
                  {/* Y-axis line */}
                  <div style={{
                    position: 'absolute',
                    left: '-10px',
                    top: '0',
                    bottom: '0',
                    width: '1px',
                    backgroundColor: '#666',
                    opacity: 0.5,
                  }} />
                  {ssurgoHorizons.map((hz, index) => {
                    const top = Number(hz.hzdept_r) || 0
                    const bottom = Number(hz.hzdepb_r) || 0
                    const thickness = bottom - top
                    const maxDepth = Math.max(...ssurgoHorizons.map(h => Number(h.hzdepb_r) || 0))
                    const topPercent = (top / maxDepth) * 100
                    const heightPercent = (thickness / maxDepth) * 100

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
                        textColor = ['Sand', 'Loamy sand', 'Silt'].includes(displayLabel) ? '#333' : 'white'
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
                        const isDark = profileProperty === 'ksat' || (profileProperty === 'clay' && value > 25) || (profileProperty === 'om' && value > 1)
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
                        title={`${hz.hzname || `Horizon ${index + 1}`} (${top}-${bottom} cm)\nTexture: ${
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
                        {hz.hzname || `H${index + 1}`}
                      </div>
                    )
                  })}
                  {/* Depth scale with horizon breaks */}
                  <div style={{
                    position: 'absolute',
                    left: '-50px',
                    top: '0',
                    height: '100%',
                    width: '40px',
                    fontSize: '10px',
                    color: '#666',
                  }}>
                    {(() => {
                      const maxDepth = Math.max(...ssurgoHorizons.map(h => Number(h.hzdepb_r) || 0))
                      const depths = new Set<number>()
                      depths.add(0)
                      ssurgoHorizons.forEach(h => {
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
                              <span style={{ fontWeight: depth === 0 || depth === maxDepth ? 'bold' : 'normal' }}>
                                {depth}
                              </span>
                              <div style={{
                                width: '8px',
                                height: '1px',
                                backgroundColor: '#666',
                                opacity: 0.5,
                              }} />
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
                        <div className="h-3 w-3 rounded" style={{ backgroundColor: '#f4e4c1' }} />
                        <span>Sand</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded" style={{ backgroundColor: '#8b7355' }} />
                        <span>Loam</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded" style={{ backgroundColor: '#d9c48f' }} />
                        <span>Sandy loam</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded" style={{ backgroundColor: '#7a5c3f' }} />
                        <span>Clay loam</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded" style={{ backgroundColor: '#a0826d' }} />
                        <span>Silt loam</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded" style={{ backgroundColor: '#4a3728' }} />
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
                            {idx === soilPropertyRanges[profileProperty].length - 1 ? '+' : `-${range.max}`})
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </CollapsibleSection>
        )}

        {/* Classification */}
        <CollapsibleSection 
          title="Taxonomic Classification" 
          icon={<Layers className="w-5 h-5 text-blue-600" />} 
          isOpen={sectionStates.classification}
          onToggle={() => toggleSection('classification')}
        >
          <div className="space-y-1">
            <DataRow label="Order" value={osdData.classification.order} />
            <DataRow label="Suborder" value={osdData.classification.suborder} />
            <DataRow label="Great Group" value={osdData.classification.greatGroup} />
            <DataRow label="Subgroup" value={osdData.classification.subGroup} />
            {osdData.classification.particleSize && (
              <DataRow label="Particle Size" value={osdData.classification.particleSize} />
            )}
            {osdData.classification.mineralogy && (
              <DataRow label="Mineralogy" value={osdData.classification.mineralogy} />
            )}
            {osdData.classification.temperatureRegime && (
              <DataRow label="Temperature Regime" value={osdData.classification.temperatureRegime} />
            )}
            {osdData.classification.reaction && <DataRow label="Reaction" value={osdData.classification.reaction} />}
          </div>
        </CollapsibleSection>

        {/* Horizons */}
        <CollapsibleSection 
          title="OSD Horizon Descriptions" 
          icon={<Layers className="w-5 h-5 text-orange-600" />} 
          isOpen={sectionStates.horizons}
          onToggle={() => toggleSection('horizons')}
        >
          <div className="space-y-3">
            {osdData.horizons.map((hz, idx) => (
              <div key={idx} className="border border-gray-200 rounded p-2 bg-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{hz.name}</span>
                    <span className="text-sm text-gray-600">{hz.depth}</span>
                  </div>
                  {hz.texture && <span className="text-xs text-gray-600 italic">{hz.texture}</span>}
                </div>

                {(hz.color.dry || hz.color.moist) && (
                  <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                    {hz.color.dry && (
                      <div>
                        <span className="text-gray-500">Dry:</span>
                        <span className="ml-1 font-mono">{hz.color.dry}</span>
                      </div>
                    )}
                    {hz.color.moist && (
                      <div>
                        <span className="text-gray-500">Moist:</span>
                        <span className="ml-1 font-mono">{hz.color.moist}</span>
                      </div>
                    )}
                  </div>
                )}

                {hz.ph && (
                  <div className="text-xs mb-2">
                    <span className="text-gray-500">pH:</span>
                    <span className="ml-1 font-medium">{hz.ph}</span>
                    {hz.phClass && <span className="ml-1 text-gray-600">({hz.phClass})</span>}
                  </div>
                )}

                {hz.narrative && (
                  <p className="text-xs text-gray-700 leading-relaxed border-t border-gray-100 pt-2 mt-2">
                    {hz.narrative}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* Parent Material */}
        {osdData.parentMaterial.length > 0 && (
          <CollapsibleSection 
            title="Parent Material" 
            icon={<Mountain className="w-5 h-5 text-amber-600" />}
            isOpen={sectionStates.parentMaterial}
            onToggle={() => toggleSection('parentMaterial')}
          >
            <div className="space-y-2">
              {osdData.parentMaterial.map((pm, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-900">{pm.material}</span>
                  <span className="text-sm font-medium text-gray-700">{pm.percentage}%</span>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Climate */}
        <CollapsibleSection 
          title="Climate Summary" 
          icon={<Thermometer className="w-5 h-5 text-purple-600" />}
          isOpen={sectionStates.climate}
          onToggle={() => toggleSection('climate')}
        >
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-700 block mb-1">Elevation</span>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Min: {osdData.climate.elevation.min} {osdData.climate.elevation.unit}</span>
                <span>Median: {osdData.climate.elevation.median} {osdData.climate.elevation.unit}</span>
                <span>Max: {osdData.climate.elevation.max} {osdData.climate.elevation.unit}</span>
              </div>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-700 block mb-1">Mean Annual Precipitation</span>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Min: {osdData.climate.precipitation.min} {osdData.climate.precipitation.unit}</span>
                <span>Median: {osdData.climate.precipitation.median} {osdData.climate.precipitation.unit}</span>
                <span>Max: {osdData.climate.precipitation.max} {osdData.climate.precipitation.unit}</span>
              </div>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-700 block mb-1">Mean Annual Temperature</span>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Min: {osdData.climate.temperature.min.toFixed(1)} {osdData.climate.temperature.unit}</span>
                <span>Median: {osdData.climate.temperature.median.toFixed(1)} {osdData.climate.temperature.unit}</span>
                <span>Max: {osdData.climate.temperature.max.toFixed(1)} {osdData.climate.temperature.unit}</span>
              </div>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-700 block mb-1">Frost-Free Days</span>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Min: {osdData.climate.frostFreeDays.min}</span>
                <span>Median: {osdData.climate.frostFreeDays.median}</span>
                <span>Max: {osdData.climate.frostFreeDays.max}</span>
              </div>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-700 block mb-1">Growing Degree Days</span>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Min: {osdData.climate.growingDegreeDays.min}</span>
                <span>Median: {osdData.climate.growingDegreeDays.median}</span>
                <span>Max: {osdData.climate.growingDegreeDays.max}</span>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Ecological Sites */}
        {osdData.ecologicalSites.length > 0 && (
          <CollapsibleSection 
            title="Ecological Sites" 
            icon={<Leaf className="w-5 h-5 text-green-600" />}
            isOpen={sectionStates.ecological}
            onToggle={() => toggleSection('ecological')}
          >
            <div className="space-y-2">
              {osdData.ecologicalSites.map((site, idx) => (
                <div key={idx} className="border border-gray-200 rounded p-2 bg-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{site.ecoclassid}</span>
                    <span className="text-xs text-gray-600">{(site.proportion * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-600 mt-1">
                    <span>{site.area_ac.toLocaleString()} acres</span>
                    <span>{site.n_components} components</span>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Interpretations */}
        {interpretations && interpretations.length > 0 && (
          <CollapsibleSection 
            title="Soil Interpretations" 
            icon={<FileText className="w-5 h-5 text-purple-600" />} 
            isOpen={sectionStates.interpretations}
            onToggle={() => toggleSection('interpretations')}
          >
            <InterpretationsContent interpretations={interpretations} />
          </CollapsibleSection>
        )}

        {/* Properties */}
        <CollapsibleSection 
          title="Series Properties" 
          icon={<Info className="w-5 h-5 text-green-600" />} 
          isOpen={sectionStates.properties}
          onToggle={() => toggleSection('properties')}
        >
          <div className="space-y-1">
            <DataRow label="Drainage Class" value={osdData.properties.drainage} />
            <DataRow label="Status" value={osdData.properties.status} />
            {osdData.properties.established && <DataRow label="Established" value={osdData.properties.established} />}
            {osdData.properties.benchmark && (
              <div className="flex items-center gap-2 py-1">
                <Award className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-gray-900">Benchmark Soil</span>
              </div>
            )}
            <DataRow label="Type Location" value={osdData.properties.typeLocation} />
            <DataRow label="MLRA Office" value={osdData.properties.mlraOffice} />
          </div>
        </CollapsibleSection>

        {/* Extent */}
        <CollapsibleSection 
          title="Geographic Extent" 
          icon={<MapPin className="w-5 h-5 text-red-600" />}
          isOpen={sectionStates.extent}
          onToggle={() => toggleSection('extent')}
        >
          <div className="space-y-1">
            <DataRow label="Area" value={osdData.extent.acres.toLocaleString()} unit="acres" />
            <DataRow label="Polygons" value={osdData.extent.polygons.toLocaleString()} />
            {osdData.extent.mlra.length > 0 && (
              <div className="py-1">
                <span className="text-sm text-gray-600">MLRAs:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {osdData.extent.mlra.map((mlra) => (
                    <span key={mlra} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {mlra}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* Associated Soils */}
        {osdData.associatedSoils.length > 0 && (
          <CollapsibleSection 
            title="Associated Soils" 
            icon={<Info className="w-5 h-5 text-teal-600" />}
            isOpen={sectionStates.associated}
            onToggle={() => toggleSection('associated')}
          >
            <div className="flex flex-wrap gap-2">
              {osdData.associatedSoils.map((soil) => (
                <span key={soil} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                  {soil}
                </span>
              ))}
            </div>
          </CollapsibleSection>
        )}
      </div>
    </div>
  )
}
