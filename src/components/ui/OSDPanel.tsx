// Official Series Description (OSD) Display Panel Component

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  X,
} from 'lucide-react'
import type { FormattedOSDData } from '#src/types/osd'
import { getDescriptionText } from '#src/utils/osdDescriptionLoader'
import { useEcologicalSite } from '#src/hooks/useEcologicalSite'
import { LCCFormatter } from '#src/lib/lcc-formatter'
import type { FormattedLCCData } from '#src/types/lcc'
import ESDDetailModal from '#src/components/ui/ESDDetailModal'

// Simple Munsell to RGB approximation
// This is a basic approximation - full conversion requires lookup tables
function munsellToRGB(munsell: string): string | null {
  try {
    // Parse Munsell notation like "10YR 5/3"
    const match = munsell.match(/(\d+\.?\d*)?([A-Z]+)\s+(\d+\.?\d*)\/(\d+\.?\d*)/)
    if (!match) return null
    
    const hue = match[2] // e.g., "YR", "Y", "R"
    const value = parseFloat(match[3]) // Lightness (0-10)
    const chroma = parseFloat(match[4]) // Color intensity (0-8+)
    
    // Base hue colors (approximations)
    const hueColors: Record<string, [number, number, number]> = {
      'R': [255, 0, 0],
      'YR': [255, 140, 0],
      'Y': [255, 255, 0],
      'GY': [173, 255, 47],
      'G': [0, 255, 0],
      'BG': [0, 255, 255],
      'B': [0, 0, 255],
      'PB': [75, 0, 130],
      'P': [128, 0, 128],
      'RP': [255, 0, 128],
      'N': [128, 128, 128], // Neutral
    }
    
    const baseColor = hueColors[hue] || [128, 128, 128]
    
    // Adjust for value (lightness) - scale towards white or black
    const lightnessFactor = value / 10
    const adjustedForValue = baseColor.map(c => 
      lightnessFactor > 0.5 
        ? c + (255 - c) * (lightnessFactor - 0.5) * 2
        : c * lightnessFactor * 2
    )
    
    // Adjust for chroma (saturation) - scale towards gray
    const chromaFactor = Math.min(chroma / 8, 1)
    const gray = 128 * lightnessFactor * 2
    const finalColor = adjustedForValue.map(c =>
      gray + (c - gray) * chromaFactor
    )
    
    return `rgb(${Math.round(finalColor[0])}, ${Math.round(finalColor[1])}, ${Math.round(finalColor[2])})`
  } catch (e) {
    return null
  }
}

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
  componentEcoSite?: {
    ecoclassid?: string
    ecoclassname?: string
  }
  components?: any[]
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

function DataRow({ label, value, unit, block = false }: { label: string; value: string | number | null; unit?: string; block?: boolean }) {
  if (value === null || value === undefined) return null

  if (block) {
    return (
      <div className="py-1 flex">
        <span className="text-sm text-gray-600 flex-shrink-0">{label}:</span>
        <span className="text-sm font-medium text-gray-900 ml-8 flex-1">
          {value}
          {unit && <span className="text-gray-500 ml-1">{unit}</span>}
        </span>
      </div>
    )
  }

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

// Component to display Land Capability Classification
const LCCContent: React.FC<{ components: any[] }> = ({ components }) => {
  // Format the LCC data
  const lccData: FormattedLCCData | null = components ? LCCFormatter.formatLCCData(components) : null
  
  // Determine what data is available
  const hasIrrigated = !!lccData?.dominant_lcc.irrigated
  const hasNonirrigated = !!lccData?.dominant_lcc.nonirrigated
  
  // Default to showing whichever is available (prefer non-irrigated)
  // MUST call useState at top level, before any conditional returns
  const [showIrrigated, setShowIrrigated] = useState(hasNonirrigated ? false : true)
  
  if (!lccData) {
    return (
      <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded">
        <p>No Land Capability Classification data available for this soil.</p>
      </div>
    )
  }
  
  // If neither is available, show message
  if (!hasIrrigated && !hasNonirrigated) {
    return (
      <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded">
        <p>No Land Capability Classification data available for this soil.</p>
      </div>
    )
  }
  
  const currentLCC = showIrrigated ? lccData.dominant_lcc.irrigated : lccData.dominant_lcc.nonirrigated

  // Get description for current class
  const description = showIrrigated 
    ? lccData.irrigated_description 
    : lccData.nonirrigated_description

  // Get subclass modifiers (only if currentLCC exists)
  const subclassModifiers = currentLCC?.subclass 
    ? LCCFormatter.getSubclassDescriptions(currentLCC.subclass, currentLCC.class)
    : []

  // Get the appropriate limitations and management for the current view
  const currentLimitations = showIrrigated ? lccData.irrigated_limitations : lccData.nonirrigated_limitations
  const currentManagement = showIrrigated ? lccData.irrigated_management : lccData.nonirrigated_management

  // Color mapping for LCC classes - using hex colors for inline styles
  const getClassColors = (lccClass: string): { bg: string; text: string; border: string } => {
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
      'I': { bg: '#dcfce7', text: '#166534', border: '#86efac' },      // green
      'II': { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },     // lighter green
      'III': { bg: '#fef9c3', text: '#854d0e', border: '#fde047' },    // yellow
      'IV': { bg: '#fefce8', text: '#a16207', border: '#fef08a' },     // lighter yellow
      'V': { bg: '#ffedd5', text: '#9a3412', border: '#fed7aa' },      // orange
      'VI': { bg: '#fff7ed', text: '#c2410c', border: '#fdba74' },     // lighter orange
      'VII': { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },    // red
      'VIII': { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },   // lighter red
    };
    return colorMap[lccClass] || { bg: '#f3f4f6', text: '#1f2937', border: '#d1d5db' };
  };

  const getSeverityColor = (severity: string): { bg: string; text: string } => {
    const severityMap: Record<string, { bg: string; text: string }> = {
      'slight': { bg: '#dcfce7', text: '#166534' },
      'moderate': { bg: '#fef9c3', text: '#854d0e' },
      'severe': { bg: '#ffedd5', text: '#9a3412' },
      'very_severe': { bg: '#fee2e2', text: '#991b1b' },
    };
    return severityMap[severity] || { bg: '#f3f4f6', text: '#1f2937' };
  };

  return (
    <div className="space-y-4">
      {/* Toggle between irrigated/non-irrigated - only show if both are available */}
      {hasIrrigated && hasNonirrigated && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
          <span className="text-sm font-medium text-gray-700">View:</span>
          <div className="flex gap-1">
            <button
              onClick={() => setShowIrrigated(false)}
              className="px-3 py-1 text-sm rounded transition-colors"
              style={{
                backgroundColor: !showIrrigated ? '#2563eb' : '#ffffff',
                color: !showIrrigated ? '#ffffff' : '#374151',
                border: '1px solid #d1d5db'
              }}
              onMouseEnter={(e) => {
                if (showIrrigated) e.currentTarget.style.backgroundColor = '#f3f4f6'
              }}
              onMouseLeave={(e) => {
                if (showIrrigated) e.currentTarget.style.backgroundColor = '#ffffff'
              }}
            >
              Dryland
            </button>
            <button
              onClick={() => setShowIrrigated(true)}
              className="px-3 py-1 text-sm rounded transition-colors"
              style={{
                backgroundColor: showIrrigated ? '#2563eb' : '#ffffff',
                color: showIrrigated ? '#ffffff' : '#374151',
                border: '1px solid #d1d5db'
              }}
              onMouseEnter={(e) => {
                if (!showIrrigated) e.currentTarget.style.backgroundColor = '#f3f4f6'
              }}
              onMouseLeave={(e) => {
                if (!showIrrigated) e.currentTarget.style.backgroundColor = '#ffffff'
              }}
            >
              Irrigated
            </button>
          </div>
        </div>
      )}
      
      {/* Show single type indicator if only one is available */}
      {(hasIrrigated && !hasNonirrigated) && (
        <div className="text-sm text-gray-600 p-2 bg-blue-50 rounded border border-blue-200">
          <p className="font-medium">Irrigated conditions only</p>
        </div>
      )}
      {(!hasIrrigated && hasNonirrigated) && (
        <div className="text-sm text-gray-600 p-2 bg-green-50 rounded border border-green-200">
          <p className="font-medium">Dryland (non-irrigated) conditions only</p>
        </div>
      )}

      {/* Combined Class Description, Limitations, and Management Recommendations */}
      {currentLCC && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-start gap-3 mb-3">
          <div 
            className="px-4 py-2 rounded-lg border-2 font-bold text-2xl"
            style={{
              backgroundColor: getClassColors(currentLCC.class).bg,
              color: getClassColors(currentLCC.class).text,
              borderColor: getClassColors(currentLCC.class).border
            }}
          >
            {currentLCC.class}{currentLCC.subclass}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-gray-800 mb-1">
              Class {currentLCC.class} {showIrrigated ? '(Irrigated)' : '(Dryland)'}
            </h4>
            {description && (
              <p className="text-sm font-semibold text-gray-700">
                {description.summary.replace(' with irrigation', '').replace(' without irrigation', '')}
              </p>
            )}
          </div>
        </div>
        
        {description && (
          <div className="space-y-3 text-sm mb-4">
            <p className="text-gray-700 leading-relaxed">
              {description.description}
              {currentLCC && currentLCC.subclass && subclassModifiers.length > 0 && (
                <> {subclassModifiers.map((mod: any) => mod.description).join(' ')}</>
              )}
            </p>
          </div>
        )}

        {/* Soil Limitations Section */}
        {currentLimitations && currentLimitations.length > 0 && (
          <>
            <div className="border-t border-gray-200 pt-4 mb-4">
              <h5 className="text-sm font-bold text-gray-800 mb-3">Limitation Details</h5>
              
              {/* Visual Severity Bars */}
              <div className="space-y-3">
                {(() => {
                  // Group limitations by type
                  const limitationsByType = currentLimitations.reduce((acc: any, lim) => {
                    if (!acc[lim.type]) acc[lim.type] = [];
                    acc[lim.type].push(lim);
                    return acc;
                  }, {});

                  // Severity to numeric value for visualization
                  const severityValue = (severity: string) => {
                    switch(severity) {
                      case 'slight': return 25;
                      case 'moderate': return 50;
                      case 'severe': return 75;
                      case 'very_severe': return 100;
                      default: return 0;
                    }
                  };

                  // Get bar color based on severity
                  const getBarColor = (severity: string) => {
                    switch(severity) {
                      case 'slight': return '#22c55e';
                      case 'moderate': return '#eab308';
                      case 'severe': return '#f97316';
                      case 'very_severe': return '#ef4444';
                      default: return '#9ca3af';
                    }
                  };

                  return Object.entries(limitationsByType).map(([type, lims]: [string, any]) => {
                    const highestSeverityLim = lims.reduce((prev: any, curr: any) => 
                      severityValue(curr.severity) > severityValue(prev.severity) ? curr : prev
                    );
                    const sevValue = severityValue(highestSeverityLim.severity);
                    const sevColors = getSeverityColor(highestSeverityLim.severity);

                    // Get subclass info for this type
                    const typeCode = type === 'erosion' ? 'e' : type === 'wetness' ? 'w' : type === 'soil' ? 's' : type === 'climate' ? 'c' : '';
                    const subclassInfo = subclassModifiers.find((m: any) => m.code === typeCode);

                    return (
                      <div key={type} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-gray-700 text-sm">{typeCode}:</span>
                            <span className="text-sm font-semibold text-gray-800 capitalize">
                              {subclassInfo?.name || type.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <span 
                            className="text-xs font-semibold px-2 py-0.5 rounded"
                            style={{
                              backgroundColor: sevColors.bg,
                              color: sevColors.text
                            }}
                          >
                            {highestSeverityLim.severity.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden mb-2">
                          <div 
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${sevValue}%`,
                              backgroundColor: getBarColor(highestSeverityLim.severity)
                            }}
                          />
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-1">{highestSeverityLim.description}</p>
                        
                        {highestSeverityLim.value !== undefined && (() => {
                          // Determine property label based on type and value
                          let propertyLabel = 'Value';
                          
                          if (type === 'erosion' && typeof highestSeverityLim.value === 'number') {
                            propertyLabel = 'Slope';
                          } else if (type === 'wetness') {
                            const valueStr = String(highestSeverityLim.value).toLowerCase();
                            if (valueStr.includes('flood')) {
                              propertyLabel = 'Flooding Frequency';
                            } else if (valueStr.includes('pond')) {
                              propertyLabel = 'Ponding Frequency';
                            } else if (valueStr.includes('drain')) {
                              propertyLabel = 'Drainage Class';
                            }
                          } else if (type === 'soil') {
                            const valueStr = String(highestSeverityLim.value);
                            if (valueStr.includes('cm') || valueStr.includes('depth')) {
                              propertyLabel = 'Restrictive Depth';
                            } else {
                              propertyLabel = 'Restriction Type';
                            }
                          } else if (type === 'climate') {
                            const valueStr = String(highestSeverityLim.value).toLowerCase();
                            if (valueStr.includes('frost')) {
                              propertyLabel = 'Frost Action';
                            } else if (valueStr.includes('temp')) {
                              propertyLabel = 'Temperature Regime';
                            }
                          }
                          
                          return (
                            <p className="text-xs text-gray-500">
                              <span className="font-semibold">{propertyLabel}:</span> {typeof highestSeverityLim.value === 'number' 
                                ? `${highestSeverityLim.value}${type === 'erosion' ? '%' : ''}`
                                : highestSeverityLim.value
                              }
                            </p>
                          );
                        })()}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </>
        )}

        {/* Management Recommendations Section */}
        {currentManagement && (
          <>
            <div className="border-t border-gray-200 pt-4">
              <h5 className="text-sm font-bold text-gray-800 mb-3">Management Recommendations</h5>
              
              {/* Combined management guidance from class and subclass */}
              {description && (
                <div className="mb-3">
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {description.management}
                    {currentLCC && currentLCC.subclass && subclassModifiers.length > 0 && (
                      <> {subclassModifiers.map((mod: any) => mod.management).join(' ')}</>
                    )}
                  </p>
                </div>
              )}

              {currentManagement.suitable_crops && currentManagement.suitable_crops.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-700 mb-1">Suitable Crops:</p>
                  <div className="flex flex-wrap gap-1">
                    {currentManagement.suitable_crops.map((crop, idx) => (
                      <span key={idx} className="inline-block bg-green-100 text-green-800 px-2 py-0.5 text-xs rounded">
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {currentManagement.conservation_practices && currentManagement.conservation_practices.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-700 mb-1">Conservation Practices:</p>
                  <ul className="text-xs text-gray-600 space-y-0.5 list-disc list-inside">
                    {currentManagement.conservation_practices.map((practice, idx) => (
                      <li key={idx}>{practice}</li>
                    ))}
                  </ul>
                </div>
              )}

              {currentManagement.key_considerations && currentManagement.key_considerations.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">Key Considerations:</p>
                  <ul className="text-xs text-gray-600 space-y-0.5 list-disc list-inside">
                    {currentManagement.key_considerations.map((consideration, idx) => (
                      <li key={idx}>{consideration}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}
        </div>
      )}

      {/* Component breakdown */}
      {lccData.components && lccData.components.length > 1 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h4 className="text-sm font-bold text-gray-800 mb-3">LCC by Component</h4>
          <div className="space-y-2">
            {lccData.components.map((comp, idx) => {
              const compClass = showIrrigated ? comp.irrigated_class : comp.nonirrigated_class
              const compSubclass = showIrrigated ? comp.irrigated_subclass : comp.nonirrigated_subclass
              if (!compClass) return null
              
              // Parse class from numeric or Roman format
              const parsedClass = LCCFormatter.parseLCCClass(compClass)
              const displayText = parsedClass + (compSubclass || '')
              
              return (
                <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                  <span 
                    className="px-2 py-1 rounded font-bold"
                    style={parsedClass ? {
                      backgroundColor: getClassColors(parsedClass).bg,
                      color: getClassColors(parsedClass).text,
                      borderColor: getClassColors(parsedClass).border,
                      borderWidth: '1px',
                      borderStyle: 'solid'
                    } : {
                      backgroundColor: '#f3f4f6',
                      color: '#1f2937'
                    }}
                  >
                    {displayText}
                  </span>
                  <span className="text-gray-700">{comp.name}</span>
                  <span className="text-gray-500 text-xs ml-auto">{comp.percent}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function OSDPanel({ osdData, isLoading, className = '', interpretations, ssurgoHorizons, componentEcoSite, components }: OSDPanelProps) {
  const [allExpanded, setAllExpanded] = useState(false)
  const [description, setDescription] = useState<string | null>(null)
  const [descriptionLoading, setDescriptionLoading] = useState(false)
  const [profileProperty, setProfileProperty] = useState<'texture' | 'clay' | 'om' | 'ph' | 'awc' | 'ksat'>('texture')
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [galleryImages, setGalleryImages] = useState<Array<{url: string; caption: string}>>([])
  const [showESDDetail, setShowESDDetail] = useState(false)
  const [selectedESDData, setSelectedESDData] = useState<any>(null)
  const [sectionStates, setSectionStates] = useState({
    description: true,
    profile: true,
    classification: false,
    properties: false,
    interpretations: false,
    extent: false,
    horizons: false,
    parentMaterial: false,
    climate: false,
    ecological: false,
    lcc: true,  // Open LCC section by default
    associated: false,
  })

  // Fetch ecological site data using the hook
  const { data: esdData, loading: esdLoading, error: esdError } = useEcologicalSite(componentEcoSite?.ecoclassid)

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
      lcc: newState,
      associated: newState,
    })
  }

  const toggleSection = (section: keyof typeof sectionStates) => {
    setSectionStates(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const openImageGallery = (images: Array<{url: string; caption: string}>, startIndex: number) => {
    setGalleryImages(images)
    setCurrentImageIndex(startIndex)
    setImageGalleryOpen(true)
  }

  const closeImageGallery = () => {
    setImageGalleryOpen(false)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
  }

  // Keyboard navigation for image gallery
  useEffect(() => {
    if (!imageGalleryOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeImageGallery();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageGalleryOpen, galleryImages.length]);

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
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Dry:</span>
                        <div 
                          className="w-6 h-6 rounded border border-gray-300 flex-shrink-0"
                          style={{ backgroundColor: munsellToRGB(hz.color.dry) || '#e5e7eb' }}
                          title={hz.color.dry}
                        />
                        <span className="font-mono">{hz.color.dry}</span>
                      </div>
                    )}
                    {hz.color.moist && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Moist:</span>
                        <div 
                          className="w-6 h-6 rounded border border-gray-300 flex-shrink-0"
                          style={{ backgroundColor: munsellToRGB(hz.color.moist) || '#e5e7eb' }}
                          title={hz.color.moist}
                        />
                        <span className="font-mono">{hz.color.moist}</span>
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
        {componentEcoSite?.ecoclassid && (
          <CollapsibleSection 
            title="Ecological Site Description" 
            icon={<Leaf className="w-5 h-5 text-green-600" />}
            isOpen={sectionStates.ecological}
            onToggle={() => toggleSection('ecological')}
          >
            {esdLoading && !esdData && (
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                  <p className="font-medium text-blue-900 mb-1">📍 Basic Ecological Site Information</p>
                  <div className="text-blue-800 space-y-1">
                    <div><span className="font-semibold">ID:</span> {componentEcoSite.ecoclassid}</div>
                    {componentEcoSite.ecoclassname && (
                      <div><span className="font-semibold">Name:</span> {componentEcoSite.ecoclassname}</div>
                    )}
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded p-4">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                    <div className="text-sm text-green-800">
                      <p className="font-medium">Loading detailed ecological site description...</p>
                      <p className="text-xs mt-1">This may take 1-2 minutes. Please be patient.</p>
                    </div>
                  </div>
                  <div className="mt-3 bg-white rounded p-2 text-xs text-gray-600">
                    <p>💡 <span className="font-medium">What&apos;s being loaded:</span></p>
                    <ul className="ml-4 mt-1 list-disc space-y-0.5">
                      <li>Site characteristics and suitability</li>
                      <li>Vegetation and productivity data</li>
                      <li>Management recommendations</li>
                      <li>Site images and resources</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {esdError && (
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                  <p className="font-medium text-blue-900 mb-1">📍 Basic Ecological Site Information</p>
                  <div className="text-blue-800 space-y-1">
                    <div><span className="font-semibold">ID:</span> {componentEcoSite.ecoclassid}</div>
                    {componentEcoSite.ecoclassname && (
                      <div><span className="font-semibold">Name:</span> {componentEcoSite.ecoclassname}</div>
                    )}
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                  <p className="font-medium mb-1">ℹ️ Detailed Description Unavailable</p>
                  <p className="text-xs">This ecological site does not have a published description in the USDA EDIT database. This may be because it is newly classified or pending documentation.</p>
                </div>
              </div>
            )}
            
            {!esdLoading && !esdData && !esdError && (
              <div className="border border-gray-200 rounded p-3 bg-gray-50">
                <div className="text-sm font-semibold text-gray-900 mb-1">
                  {componentEcoSite.ecoclassid}
                </div>
                {componentEcoSite.ecoclassname && (
                  <div className="text-sm text-gray-700">
                    {componentEcoSite.ecoclassname}
                  </div>
                )}
              </div>
            )}
            
            {esdData && (
              <div className="space-y-4">
                {/* View Full Details Button */}
                <button
                  onClick={() => {
                    setSelectedESDData(esdData.rawData)
                    setShowESDDetail(true)
                  }}
                  style={{
                    background: 'linear-gradient(to right, #5a7241, #6b8650)',
                  }}
                  className="w-full px-4 py-3 hover:brightness-90 text-white rounded-lg font-semibold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                  onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #4a5f35, #5a7241)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #5a7241, #6b8650)'}
                >
                  <FileText className="w-5 h-5" />
                  View Full Ecological Site Details
                </button>

                {/* Basic Info */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 shadow-sm">
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-green-900 mb-1">
                      {esdData.basicInfo.siteName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                        {componentEcoSite?.ecoclassid}
                      </span>
                      {esdData.basicInfo.location && esdData.basicInfo.location !== 'Location information not available' && (
                        <>
                          <span>•</span>
                          <span>{esdData.basicInfo.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {esdData.basicInfo.ecoclassConcept && (
                    <div className="bg-white rounded-lg p-3 border border-green-100 shadow-sm">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{esdData.basicInfo.ecoclassConcept}</p>
                    </div>
                  )}
                </div>

                {/* Land Characteristics */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                    <Mountain className="w-4 h-4 text-blue-600" />
                    Land Characteristics
                  </h4>
                  <div className="space-y-2.5">
                    <DataRow label="Landforms" value={esdData.landCharacteristics.landforms} />
                    <DataRow label="Soils" value={esdData.landCharacteristics.soils} block={true} />
                    <DataRow label="Climate" value={esdData.landCharacteristics.climate} />
                    <DataRow label="Elevation" value={esdData.landCharacteristics.elevation} />
                    <DataRow label="Slopes" value={esdData.landCharacteristics.slopes} />
                  </div>
                </div>

                {/* Productivity */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                    <Leaf className="w-4 h-4 text-green-600" />
                    Productivity & Vegetation
                  </h4>
                  <div className="space-y-2.5 mb-3">
                    <DataRow label="Dominant Vegetation" value={esdData.productivity.dominantVegetation} />
                    {esdData.productivity.expectedYields && (
                      <DataRow label="Expected Yields" value={esdData.productivity.expectedYields} />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100">
                    <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                      <h5 className="text-xs font-semibold text-green-800 mb-2 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Best Uses
                      </h5>
                      <ul className="text-xs text-gray-700 space-y-1">
                        {esdData.productivity.bestUses.map((use, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-green-600 mt-0.5">•</span>
                            <span>{use}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                      <h5 className="text-xs font-semibold text-red-800 mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Limitations
                      </h5>
                      <ul className="text-xs text-gray-700 space-y-1">
                        {esdData.productivity.limitations.map((limitation, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-red-600 mt-0.5">•</span>
                            <span>{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Management */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    Management Insights
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <h5 className="text-xs font-semibold text-blue-800 mb-2">Opportunities</h5>
                      <ul className="text-xs text-gray-700 space-y-1">
                        {esdData.management.opportunities.map((opp, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>{opp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                      <h5 className="text-xs font-semibold text-amber-800 mb-2">Challenges</h5>
                      <ul className="text-xs text-gray-700 space-y-1">
                        {esdData.management.challenges.map((challenge, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-600 mt-0.5">•</span>
                            <span>{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                      <h5 className="text-xs font-semibold text-purple-800 mb-2">Considerations</h5>
                      <ul className="text-xs text-gray-700 space-y-1">
                        {esdData.management.considerations.map((consideration, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-purple-600 mt-0.5">•</span>
                            <span>{consideration}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Images */}
                {esdData.resources.images.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b border-gray-200">Site Images ({esdData.resources.images.length})</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {esdData.resources.images.slice(0, 4).map((image, idx) => (
                        <div 
                          key={idx} 
                          className="relative cursor-pointer group"
                          onClick={() => openImageGallery(esdData.resources.images, idx)}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={image.url} 
                            alt={image.caption}
                            className="w-full h-24 object-cover rounded border border-gray-200 group-hover:opacity-80 transition-opacity"
                            onError={(e) => {
                              console.error('Failed to load image:', image.url);
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage unavailable%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-30 rounded">
                            <span className="text-white text-xs font-medium">Click to view</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 truncate" title={image.caption}>{image.caption}</p>
                        </div>
                      ))}
                    </div>
                    {esdData.resources.images.length > 4 && (
                      <button
                        onClick={() => openImageGallery(esdData.resources.images, 0)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View all {esdData.resources.images.length} images →
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </CollapsibleSection>
        )}

        {/* Land Capability Classification */}
        {components && components.length > 0 && (
          <CollapsibleSection 
            title="Land Capability Classification (LCC)" 
            icon={<Award className="w-5 h-5 text-amber-600" />}
            isOpen={sectionStates.lcc}
            onToggle={() => toggleSection('lcc')}
          >
            <LCCContent components={components} />
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

      {/* Image Gallery Modal */}
      {imageGalleryOpen && galleryImages.length > 0 && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 flex items-center justify-center p-8"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 10000 }}
          onClick={closeImageGallery}
        >
          <div 
            className="relative bg-white rounded-xl shadow-2xl flex flex-col"
            style={{ 
              maxWidth: '90vw',
              maxHeight: '90vh',
              width: 'fit-content'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeImageGallery}
              className="absolute -top-3 -right-3 bg-white text-gray-700 hover:text-gray-900 rounded-full p-2 z-10 transition-colors shadow-lg border border-gray-200"
              aria-label="Close gallery"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image container */}
            <div 
              className="relative flex items-center justify-center overflow-hidden rounded-t-xl"
              style={{ 
                maxHeight: 'calc(90vh - 140px)',
                minHeight: '400px'
              }}
            >
              {/* Previous button */}
              {galleryImages.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 text-white hover:text-gray-300 rounded-full p-3 z-10 transition-colors"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                  aria-label="Previous image"
                >
                  <ChevronDown className="w-8 h-8 transform -rotate-90" />
                </button>
              )}

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={galleryImages[currentImageIndex].url}
                alt={galleryImages[currentImageIndex].caption}
                className="max-w-full max-h-full object-contain"
                style={{ maxHeight: 'calc(90vh - 140px)' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23333" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage unavailable%3C/text%3E%3C/svg%3E';
                }}
              />

              {/* Next button */}
              {galleryImages.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 text-white hover:text-gray-300 rounded-full p-3 z-10 transition-colors"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                  aria-label="Next image"
                >
                  <ChevronDown className="w-8 h-8 transform rotate-90" />
                </button>
              )}
            </div>

            {/* Caption and Counter */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200"
              style={galleryImages.length > 1 ? { borderRadius: '0' } : { borderBottomLeftRadius: '0.75rem', borderBottomRightRadius: '0.75rem' }}
            >
              <p className="text-sm font-medium text-gray-800 text-center">{galleryImages[currentImageIndex].caption}</p>
              <p className="text-xs text-gray-600 mt-1 text-center">
                Image {currentImageIndex + 1} of {galleryImages.length}
              </p>
            </div>

            {/* Thumbnail navigation */}
            {galleryImages.length > 1 && (
              <div className="bg-white border-t border-gray-200 px-4 py-3 flex gap-2 overflow-x-auto rounded-b-xl justify-center">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(idx);
                    }}
                    className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex
                        ? 'border-blue-500 scale-105 shadow-md'
                        : 'border-gray-300 opacity-70 hover:opacity-100 hover:border-blue-300'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.caption}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23ddd" width="64" height="64"/%3E%3C/svg%3E';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* ESD Detail Modal */}
      {showESDDetail && selectedESDData && (
        <ESDDetailModal
          esdData={selectedESDData}
          onClose={() => {
            setShowESDDetail(false)
            setSelectedESDData(null)
          }}
        />
      )}
    </div>
  )
}
