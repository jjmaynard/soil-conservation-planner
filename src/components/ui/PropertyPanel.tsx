// Property Panel Component for Displaying Soil Profile Data

'use client'

import { useState, useEffect } from 'react'
import { X, MapPin, Database, BarChart3, PieChart, Eye, Download, Microscope, Beaker, Mountain, Droplets, Gauge, TrendingUp, Layers, Maximize2 } from 'lucide-react'
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line } from 'recharts'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip, ResponsiveContainer as BarResponsiveContainer } from 'recharts'
import { getSoilOrderColor, getTextureColor } from '#src/utils/soilColors'
import { formatCoordinates } from '#src/utils/geoUtils'
import type { SoilProfile, SSURGOData } from '#src/types/soil'
import type { CDLYearData } from '#src/utils/cdlQuery'
import dynamic from 'next/dynamic'

// Dynamically import the full-screen dashboard
const SoilDashboard = dynamic(() => import('./SoilDashboard'), { ssr: false })

// Helper function to group interpretations by category
function groupInterpretations(interpretations: any[]) {
  const groups: Record<string, any[]> = {
    agricultural: [],
    engineering: [],
    environmental: [],
    development: [],
    other: []
  };

  interpretations.forEach(interp => {
    const name = (interp.rulename || '').toLowerCase();
    
    if (name.includes('agr') || name.includes('crop') || name.includes('farm') || name.includes('irrigation')) {
      groups.agricultural.push(interp);
    } else if (name.includes('eng') || name.includes('construct') || name.includes('build') || name.includes('foundation')) {
      groups.engineering.push(interp);
    } else if (name.includes('env') || name.includes('wildlife') || name.includes('habitat') || name.includes('wetland')) {
      groups.environmental.push(interp);
    } else if (name.includes('dwel') || name.includes('septic') || name.includes('road') || name.includes('path')) {
      groups.development.push(interp);
    } else {
      groups.other.push(interp);
    }
  });

  return groups;
}

// Helper component for displaying grouped interpretations
function InterpretationsDisplay({ interpretations }: { interpretations: any[] }) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const groups = groupInterpretations(interpretations);
  
  // Group metadata
  const groupInfo: Record<string, { name: string, icon: string, color: string }> = {
    agricultural: { name: 'Agricultural', icon: '🌾', color: '#059669' },
    engineering: { name: 'Engineering', icon: '🏗️', color: '#7c3aed' },
    environmental: { name: 'Environmental', icon: '🌿', color: '#10b981' },
    development: { name: 'Development', icon: '🏘️', color: '#3b82f6' },
    other: { name: 'Other', icon: '📋', color: '#6b7280' }
  };

  // Rating color function
  const getRatingStyle = (rating: string) => {
    const r = rating.toLowerCase();
    if (r.includes('not') || r.includes('severe') || r.includes('very limited')) {
      return { backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' };
    } else if (r.includes('slight') || r.includes('well') || r.includes('not limited')) {
      return { backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0' };
    } else {
      return { backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' };
    }
  };

  return (
    <div className="space-y-2">
      {Object.entries(groups).map(([key, groupInterps]) => {
        if (groupInterps.length === 0) return null;
        const info = groupInfo[key];
        const isExpanded = expandedGroup === key;
        
        return (
          <div key={key} className="border border-gray-200 rounded">
            <button
              onClick={() => setExpandedGroup(isExpanded ? null : key)}
              className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
              style={{ borderLeft: `3px solid ${info.color}` }}
            >
              <div className="flex items-center gap-2">
                <span>{info.icon}</span>
                <span className="text-xs font-semibold text-gray-800">{info.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                  {groupInterps.length}
                </span>
                <svg
                  className="w-3 h-3 transition-transform"
                  style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6 6L14 10L6 14V6Z" />
                </svg>
              </div>
            </button>
            
            {isExpanded && (
              <div className="px-3 pb-2 space-y-1.5">
                {groupInterps.map((interp, idx) => (
                  <div key={idx} className="bg-gray-50 rounded p-2 text-xs">
                    <div className="font-medium text-gray-800 mb-1">{interp.rulename}</div>
                    {interp.interphrc && (
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-gray-600">Rating:</span>
                        <span
                          className="px-1.5 py-0.5 rounded font-medium"
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
                  className="w-full px-2 py-1.5 mt-2 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center justify-center gap-1"
                >
                  <svg
                    className="w-3 h-3 rotate-90"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6 6L14 10L6 14V6Z" />
                  </svg>
                  <span>Collapse</span>
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Soil Property Ranges for Classification
const soilPropertyRanges: Record<string, Array<{min: number, max: number, label: string, color: string}>> = {
  clay: [
    { min: 0, max: 5, label: 'Very Low', color: '#fef3c7' },
    { min: 5, max: 15, label: 'Low', color: '#fde68a' },
    { min: 15, max: 25, label: 'Moderate', color: '#fcd34d' },
    { min: 25, max: 35, label: 'Moderately High', color: '#f59e0b' },
    { min: 35, max: 45, label: 'High', color: '#d97706' },
    { min: 45, max: 55, label: 'Very High', color: '#b45309' },
    { min: 55, max: 70, label: 'Extremely High', color: '#92400e' },
    { min: 70, max: 100, label: 'Maximum', color: '#78350f' }
  ],
  om: [
    { min: 0, max: 0.5, label: 'Very Low', color: '#fee2e2' },
    { min: 0.5, max: 1, label: 'Low', color: '#fecaca' },
    { min: 1, max: 2, label: 'Moderate', color: '#fca5a5' },
    { min: 2, max: 4, label: 'Moderate-High', color: '#f87171' },
    { min: 4, max: 6, label: 'High', color: '#ef4444' },
    { min: 6, max: 10, label: 'Very High', color: '#dc2626' },
    { min: 10, max: 20, label: 'Extremely High', color: '#b91c1c' },
    { min: 20, max: 100, label: 'Organic', color: '#991b1b' }
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
    { min: 8.5, max: 10.5, label: 'Strongly Alkaline', color: '#8b5cf6' }
  ],
  awc: [
    { min: 0.00, max: 0.05, label: 'Very Low', color: '#fee2e2' },
    { min: 0.05, max: 0.10, label: 'Low', color: '#fecaca' },
    { min: 0.10, max: 0.15, label: 'Moderately Low', color: '#bfdbfe' },
    { min: 0.15, max: 0.20, label: 'Moderate', color: '#93c5fd' },
    { min: 0.20, max: 0.25, label: 'Moderately High', color: '#60a5fa' },
    { min: 0.25, max: 0.30, label: 'High', color: '#3b82f6' },
    { min: 0.30, max: 0.40, label: 'Very High', color: '#2563eb' },
    { min: 0.40, max: 0.60, label: 'Extremely High', color: '#1d4ed8' }
  ],
  ksat: [
    { min: 0.001, max: 0.1, label: 'Very Slow', color: '#1e1b4b' },
    { min: 0.1, max: 1, label: 'Slow', color: '#312e81' },
    { min: 1, max: 4, label: 'Moderately Slow', color: '#4c1d95' },
    { min: 4, max: 14, label: 'Moderate', color: '#7c3aed' },
    { min: 14, max: 40, label: 'Moderately Rapid', color: '#8b5cf6' },
    { min: 40, max: 140, label: 'Rapid', color: '#a78bfa' },
    { min: 140, max: 400, label: 'Very Rapid', color: '#c4b5fd' },
    { min: 400, max: 2000, label: 'Extremely Rapid', color: '#e0e7ff' }
  ]
};

// Classify property value
function classifyProperty(value: number, property: string): {color: string, label: string} {
  const ranges = soilPropertyRanges[property];
  if (!ranges) return { color: '#d1d5db', label: 'Unknown' };
  
  for (let i = 0; i < ranges.length - 1; i++) {
    if (value >= ranges[i].min && value < ranges[i].max) {
      return { color: ranges[i].color, label: ranges[i].label };
    }
  }
  
  const lastRange = ranges[ranges.length - 1];
  if (value >= lastRange.min && value <= lastRange.max) {
    return { color: lastRange.color, label: lastRange.label };
  }
  
  return { color: '#d1d5db', label: 'Unknown' };
}

// USDA Texture Classification Function
function getTextureClass(sand: number, silt: number, clay: number): string {
  const silt_clay = silt + 1.5 * clay;
  const silt_2_clay = silt + 2.0 * clay;

  if (silt_clay < 15) {
    return "Sand";
  } else if (silt_clay < 30) {
    return "Loamy sand";
  } else if ((clay >= 7 && clay <= 20 && sand > 52 && silt_2_clay >= 30) || (clay < 7 && silt < 50 && silt_2_clay >= 30)) {
    return "Sandy loam";
  } else if (clay >= 7 && clay <= 27 && silt >= 28 && silt < 50 && sand <= 52) {
    return "Loam";
  } else if ((silt >= 50 && clay >= 12 && clay < 27) || (silt >= 50 && silt < 80 && clay < 12)) {
    return "Silt loam";
  } else if (silt >= 80 && clay < 12) {
    return "Silt";
  } else if (clay >= 20 && clay < 35 && silt < 28 && sand > 45) {
    return "Sandy clay loam";
  } else if (clay >= 27 && clay < 40 && sand > 20 && sand <= 45) {
    return "Clay loam";
  } else if (clay >= 27 && clay < 40 && sand <= 20) {
    return "Silty clay loam";
  } else if (clay >= 35 && sand >= 45) {
    return "Sandy clay";
  } else if (clay >= 40 && silt >= 40) {
    return "Silty clay";
  } else if (clay >= 40 && sand <= 45 && silt < 40) {
    return "Clay";
  } else {
    return "Unknown";
  }
}

// Get color for texture class
function getTextureClassColor(textureClass: string): string {
  const colorMap: Record<string, string> = {
    "Sand": "#f4e4c1",
    "Loamy sand": "#e6d4a8",
    "Sandy loam": "#d9c48f",
    "Loam": "#8b7355",
    "Silt loam": "#a0826d",
    "Silt": "#c8b597",
    "Sandy clay loam": "#9d7f5c",
    "Clay loam": "#7a5c3f",
    "Silty clay loam": "#8d6e4f",
    "Sandy clay": "#6b4e3d",
    "Silty clay": "#5c4033",
    "Clay": "#4a3728",
    "Unknown": "#d1d5db"
  };
  return colorMap[textureClass] || "#d1d5db";
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
  const [activeTab, setActiveTab] = useState<'profile' | 'ssurgo' | 'components' | 'taxonomy' | 'horizons' | 'cropland'>('ssurgo')
  const [compositionView, setCompositionView] = useState<'bar' | 'pie'>('bar')
  const [chartKey, setChartKey] = useState(0)
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [showFullDashboard, setShowFullDashboard] = useState(false)
  const [dashboardHover, setDashboardHover] = useState(false)
  const [profileProperty, setProfileProperty] = useState<'texture' | 'clay' | 'om' | 'ph' | 'awc' | 'ksat'>('texture')
  const [showExpandedCDLChart, setShowExpandedCDLChart] = useState(false)
  
  // Force chart re-render when composition view changes
  useEffect(() => {
    if (compositionView === 'pie') {
      setTimeout(() => setChartKey(prev => prev + 1), 100)
    }
  }, [compositionView])

  // Helper function for property status classification
  const getPropertyStatus = (value: number, ideal: [number, number]): { status: string, color: string } => {
    const [min, max] = ideal;
    const midpoint = (min + max) / 2;
    const range = max - min;
    
    if (value >= min && value <= max) {
      if (Math.abs(value - midpoint) < range * 0.2) {
        return { status: 'excellent', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
      }
      return { status: 'good', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    } else if (Math.abs(value - midpoint) < range * 0.8) {
      return { status: 'fair', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    }
    return { status: 'poor', color: 'text-red-600 bg-red-50 border-red-200' };
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
      className={`absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col border border-gray-200 ${className}`}
    >
      {/* Enhanced Header with Gradient */}
      <div 
        className="border-b p-6"
        style={{
          background: 'linear-gradient(to right, #fffbeb, #ffedd5)',
          borderBottomColor: '#fed7aa'
        }}
      >
        {/* Panel/Dashboard Toggle at Top */}
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center space-x-0 bg-white rounded-lg p-1 border-2 border-green-700 shadow-sm">
            <button
              className="px-4 py-2 text-base font-bold rounded-md transition-all"
              style={{ backgroundColor: '#15803d', color: 'white' }}
            >
              Panel
            </button>
            <button
              onClick={() => setShowFullDashboard(true)}
              onMouseEnter={() => setDashboardHover(true)}
              onMouseLeave={() => setDashboardHover(false)}
              className="px-4 py-2 text-base font-bold rounded-md transition-all"
              style={{
                backgroundColor: dashboardHover ? '#fff7ed' : 'transparent',
                color: dashboardHover ? '#ea580c' : '#374151'
              }}
            >
              Dashboard
            </button>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            
            {/* Main title */}
            {ssurgoData && (
              <>
                <h2 className="text-lg font-bold text-gray-900 leading-tight">
                  {ssurgoData.musym} - {ssurgoData.muname}
                </h2>
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                  <span 
                    className="px-2 py-1 rounded font-mono text-xs"
                    style={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #fed7aa' 
                    }}
                  >
                    {ssurgoData.mukey}
                  </span>
                  {ssurgoData.muacres && (
                    <span className="font-medium">
                      {ssurgoData.muacres.toLocaleString()} acres
                    </span>
                  )}
                </div>
              </>
            )}
            
            {profile && !ssurgoData && (
              <h2 className="text-lg font-bold text-gray-900">Soil Profile Data</h2>
            )}
            
            {/* Coordinates with icon */}
            <div className="flex items-center space-x-2 mt-2 text-xs text-gray-600">
              <MapPin className="w-3 h-3" />
              <span>
                {formatCoordinates(
                  profile?.coordinates[0] || ssurgoData?.coordinates[0] || 0,
                  profile?.coordinates[1] || ssurgoData?.coordinates[1] || 0
                )}
              </span>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-xl ml-4"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto" style={{ backgroundColor: '#f9fafb' }}>
        {profile && (
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className="flex-1 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap"
            style={
              activeTab === 'profile'
                ? {
                    backgroundColor: 'white',
                    color: '#b45309',
                    borderBottom: '2px solid #d97706',
                    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                  }
                : {
                    backgroundColor: '#f9fafb',
                    color: '#4b5563'
                  }
            }
            onMouseEnter={(e) => {
              if (activeTab !== 'profile') {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.color = '#111827';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'profile') {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.color = '#4b5563';
              }
            }}
          >
            Profiles
          </button>
        )}
        {ssurgoData && (
          <>
            <button
              type="button"
              onClick={() => setActiveTab('ssurgo')}
              className="flex-1 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap"
              style={
                activeTab === 'ssurgo'
                  ? {
                      backgroundColor: 'white',
                      color: '#b45309',
                      borderBottom: '2px solid #d97706',
                      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                    }
                  : {
                      backgroundColor: '#f9fafb',
                      color: '#4b5563'
                    }
              }
              onMouseEnter={(e) => {
                if (activeTab !== 'ssurgo') {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.color = '#111827';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'ssurgo') {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.color = '#4b5563';
                }
              }}
            >
              Map Unit
            </button>
            {ssurgoData.components && ssurgoData.components.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('components')}
                  className="flex-1 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap"
                  style={
                    activeTab === 'components'
                      ? {
                          backgroundColor: 'white',
                          color: '#b45309',
                          borderBottom: '2px solid #d97706',
                          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                        }
                      : {
                          backgroundColor: '#f9fafb',
                          color: '#4b5563'
                        }
                  }
                  onMouseEnter={(e) => {
                    if (activeTab !== 'components') {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.color = '#111827';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== 'components') {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.color = '#4b5563';
                    }
                  }}
                >
                  Components
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('taxonomy')}
                  className="flex-1 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap"
                  style={
                    activeTab === 'taxonomy'
                      ? {
                          backgroundColor: 'white',
                          color: '#b45309',
                          borderBottom: '2px solid #d97706',
                          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                        }
                      : {
                          backgroundColor: '#f9fafb',
                          color: '#4b5563'
                        }
                  }
                  onMouseEnter={(e) => {
                    if (activeTab !== 'taxonomy') {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.color = '#111827';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== 'taxonomy') {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.color = '#4b5563';
                    }
                  }}
                >
                  Taxonomy
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('horizons')}
                  className="flex-1 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap"
                  style={
                    activeTab === 'horizons'
                      ? {
                          backgroundColor: 'white',
                          color: '#b45309',
                          borderBottom: '2px solid #d97706',
                          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                        }
                      : {
                          backgroundColor: '#f9fafb',
                          color: '#4b5563'
                        }
                  }
                  onMouseEnter={(e) => {
                    if (activeTab !== 'horizons') {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.color = '#111827';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== 'horizons') {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.color = '#4b5563';
                    }
                  }}
                >
                  Profile
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('cropland')}
                  className="flex-1 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap"
                  style={
                    activeTab === 'cropland'
                      ? {
                          backgroundColor: 'white',
                          color: '#b45309',
                          borderBottom: '2px solid #d97706',
                          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                        }
                      : {
                          backgroundColor: '#f9fafb',
                          color: '#4b5563'
                        }
                  }
                  onMouseEnter={(e) => {
                    if (activeTab !== 'cropland') {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.color = '#111827';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== 'cropland') {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.color = '#4b5563';
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
      <div className="flex-1 p-4 space-y-4" style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
        
        {/* Profile Tab */}
        {activeTab === 'profile' && profile && properties && (
          <>
            {/* Classification */}
            <section>
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            Classification
          </h3>
          <div className="space-y-2">
            <PropertyRow label="Soil Order" value={profile.soil_order}>
              <div
                className="w-4 h-4 rounded border border-gray-300"
                style={{ backgroundColor: getSoilOrderColor(profile.soil_order) }}
              />
            </PropertyRow>
            <PropertyRow label="Map Unit" value={profile.map_unit} />
            <PropertyRow label="Survey Area" value={profile.survey_area} />
          </div>
        </section>

        {/* Soil Properties */}
        <section>
          <h3 className="font-semibold text-gray-900 mb-2">
            Properties at {firstDepth}
          </h3>
          <div className="space-y-2">
            <PropertyRow
              label="Organic Carbon"
              value={`${properties.organic_carbon.toFixed(2)}%`}
            />
            <PropertyRow
              label="pH"
              value={properties.ph.toFixed(2)}
            />
            <PropertyRow
              label="Bulk Density"
              value={`${properties.bulk_density.toFixed(2)} g/cm³`}
            />
            <PropertyRow label="Texture Class" value={properties.texture_class}>
              <div
                className="w-4 h-4 rounded border border-gray-300"
                style={{ backgroundColor: getTextureColor(properties.texture_class) }}
              />
            </PropertyRow>
          </div>
        </section>

        {/* Particle Size Distribution */}
        <section>
          <h3 className="font-semibold text-gray-900 mb-2">
            Particle Size Distribution
          </h3>
          <div className="space-y-2">
            <PropertyRow
              label="Clay"
              value={`${properties.clay_percent.toFixed(1)}%`}
            />
            <PropertyRow
              label="Silt"
              value={`${properties.silt_percent.toFixed(1)}%`}
            />
            <PropertyRow
              label="Sand"
              value={`${properties.sand_percent.toFixed(1)}%`}
            />
          </div>
          {/* Texture Triangle Visualization */}
          <div className="mt-3 p-3 bg-gray-50 rounded">
            <div className="flex gap-1 h-6">
              <div
                className="bg-orange-900 flex items-center justify-center text-white text-xs"
                style={{ width: `${properties.clay_percent}%` }}
                title={`Clay: ${properties.clay_percent.toFixed(1)}%`}
              >
                {properties.clay_percent > 15 ? 'Clay' : ''}
              </div>
              <div
                className="bg-yellow-700 flex items-center justify-center text-white text-xs"
                style={{ width: `${properties.silt_percent}%` }}
                title={`Silt: ${properties.silt_percent.toFixed(1)}%`}
              >
                {properties.silt_percent > 15 ? 'Silt' : ''}
              </div>
              <div
                className="bg-yellow-300 flex items-center justify-center text-gray-800 text-xs"
                style={{ width: `${properties.sand_percent}%` }}
                title={`Sand: ${properties.sand_percent.toFixed(1)}%`}
              >
                {properties.sand_percent > 15 ? 'Sand' : ''}
              </div>
            </div>
          </div>
        </section>

        {/* MIR Data */}
        {profile.mir_data && (
          <section>
            <h3 className="font-semibold text-gray-900 mb-2">
              MIR Spectroscopy
            </h3>
            <div className="space-y-2">
              <PropertyRow
                label="Prediction Confidence"
                value={`${(profile.mir_data.prediction_confidence * 100).toFixed(1)}%`}
              />
              <PropertyRow
                label="Andic Properties"
                value={profile.mir_data.andic_properties ? 'Detected' : 'Not Detected'}
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    profile.mir_data.andic_properties
                      ? 'bg-green-500'
                      : 'bg-gray-400'
                  }`}
                />
              </PropertyRow>
            </div>
          </section>
        )}

        {/* All Depths */}
        {depths.length > 1 && (
          <section>
            <h3 className="font-semibold text-gray-900 mb-2">
              Available Depths
            </h3>
            <div className="flex flex-wrap gap-2">
              {depths.map((depth) => (
                <span
                  key={depth}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {depth}
                </span>
              ))}
            </div>
          </section>
        )}
          </>
        )}

        {/* SSURGO Tab */}
        {activeTab === 'ssurgo' && ssurgoData && (
          <div className="-mt-4 -mx-4">
            {/* Map Unit Header */}
            <div className="bg-white px-6 py-4 border-b-4 border-black">
              <h2 className="text-base font-bold text-gray-900">
                {ssurgoData.musym} - {ssurgoData.muname}
              </h2>
            </div>

            {/* Map Unit Composition */}
            <details open className="group border-b border-gray-300">
              <summary className="cursor-pointer list-none px-6 py-3 bg-gray-100 hover:bg-gray-200">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-3 h-3 text-black transition-transform group-open:rotate-90"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6 6L14 10L6 14V6Z" />
                  </svg>
                  <h3 className="font-bold text-gray-900 text-sm">Map Unit Composition</h3>
                </div>
              </summary>
              <div className="px-6 pb-4 pt-3 bg-white">
                {ssurgoData.components && ssurgoData.components.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-1 bg-gray-200 rounded p-0.5 ml-auto">
                        <button
                          onClick={() => setCompositionView('bar')}
                          className="p-1.5 rounded transition-colors"
                          style={{
                            backgroundColor: compositionView === 'bar' ? '#ffffff' : 'transparent',
                            color: compositionView === 'bar' ? '#b45309' : '#6b7280'
                          }}
                          title="Bar chart view"
                        >
                          <BarChart3 size={16} />
                        </button>
                        <button
                          onClick={() => setCompositionView('pie')}
                          className="p-1.5 rounded transition-colors"
                          style={{
                            backgroundColor: compositionView === 'pie' ? '#ffffff' : 'transparent',
                            color: compositionView === 'pie' ? '#b45309' : '#6b7280'
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
                        <div className="bg-gray-200 rounded-full h-8 overflow-hidden border border-gray-300 shadow-inner">
                          <div className="h-full flex">
                            {ssurgoData.components
                              .sort((a, b) => (b.comppct_r || 0) - (a.comppct_r || 0))
                              .map((comp, idx) => {
                                const colors = ['#10b981', '#60a5fa', '#fbbf24', '#a78bfa'];
                                const bgColor = comp.majcompflag === 'Yes' ? colors[0] : colors[idx % 3 + 1];
                                
                                return (
                                  <div
                                    key={idx}
                                    className="h-full transition-all duration-700"
                                    style={{ 
                                      width: `${comp.comppct_r || 0}%`,
                                      backgroundColor: bgColor
                                    }}
                                    title={`${comp.compname}: ${comp.comppct_r}%`}
                                  />
                                );
                              })}
                          </div>
                        </div>
                        
                        {/* Legend */}
                        <div className="mt-3 flex flex-wrap gap-3 text-xs">
                          {ssurgoData.components
                            .sort((a, b) => (b.comppct_r || 0) - (a.comppct_r || 0))
                            .map((comp, idx) => {
                              const colors = ['#10b981', '#60a5fa', '#fbbf24', '#a78bfa'];
                              const bgColor = comp.majcompflag === 'Yes' ? colors[0] : colors[idx % 3 + 1];
                              
                              return (
                                <div key={idx} className="flex items-center gap-1.5">
                                  <div 
                                    className="w-3 h-3 rounded" 
                                    style={{ backgroundColor: bgColor }}
                                  />
                                  <span className="text-gray-700">
                                    {comp.compname} <span className="font-semibold">{comp.comppct_r}%</span>
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </>
                    ) : (
                      <div key={chartKey}>
                        {/* Pie Chart */}
                        <div className="h-64 w-full" style={{ minHeight: '256px' }}>
                          <ResponsiveContainer width="100%" height={256}>
                            <RechartsPie>
                              <Pie
                                data={ssurgoData.components.map((comp) => ({
                                  name: comp.compname,
                                  value: comp.comppct_r || 0
                                }))}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                dataKey="value"
                              >
                                {ssurgoData.components.map((comp, idx) => {
                                  const colors = ['#10b981', '#60a5fa', '#fbbf24', '#a78bfa'];
                                  const fillColor = comp.majcompflag === 'Yes' ? colors[0] : colors[idx % 3 + 1];
                                  return <Cell key={`cell-${idx}`} fill={fillColor} />;
                                })}
                              </Pie>
                              <Tooltip 
                                formatter={(value: any) => `${value}%`}
                              />
                            </RechartsPie>
                          </ResponsiveContainer>
                        </div>
                        
                        {/* Legend */}
                        <div className="mt-3 flex flex-wrap gap-3 text-xs justify-center">
                          {ssurgoData.components.map((comp, idx) => {
                            const colors = ['#10b981', '#60a5fa', '#fbbf24', '#a78bfa'];
                            const bgColor = comp.majcompflag === 'Yes' ? colors[0] : colors[idx % 3 + 1];
                            
                            return (
                              <div key={idx} className="flex items-center gap-1.5">
                                <div 
                                  className="w-3 h-3 rounded" 
                                  style={{ backgroundColor: bgColor }}
                                />
                                <span className="text-gray-700">
                                  {comp.compname} <span className="font-semibold">{comp.comppct_r}%</span>
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">Map Unit Key: </span>
                    <span className="italic text-gray-600">{ssurgoData.mukey}</span>
                  </div>
                )}
              </div>
            </details>

            {/* Map Unit Data */}
            <details open className="group border-b border-gray-300">
              <summary className="cursor-pointer list-none px-6 py-3 bg-gray-100 hover:bg-gray-200">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-3 h-3 text-black transition-transform group-open:rotate-90"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6 6L14 10L6 14V6Z" />
                  </svg>
                  <h3 className="font-bold text-gray-900 text-sm">Map Unit Data</h3>
                </div>
              </summary>
              <div className="px-6 pb-4 pt-3 bg-white">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-300">
                      <td className="py-2.5 pr-4 text-gray-900 font-semibold align-top">Map Unit Key:</td>
                      <td className="py-2.5 text-gray-700">
                        {ssurgoData.mukey}
                        <button
                          onClick={() => setShowSummaryModal(true)}
                          className="ml-2 text-blue-600 hover:underline text-xs cursor-pointer bg-transparent border-none p-0"
                        >
                          [View Summary]
                        </button>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="py-2.5 pr-4 text-gray-900 font-semibold align-top">Map Unit Symbol:</td>
                      <td className="py-2.5 text-gray-700">{ssurgoData.musym}</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="py-2.5 pr-4 text-gray-900 font-semibold align-top">Map Unit Name:</td>
                      <td className="py-2.5 text-gray-700">{ssurgoData.muname}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 text-gray-900 font-semibold align-top">Total Acres:</td>
                      <td className="py-2.5 text-gray-700">{Number(ssurgoData.muacres).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </details>

            {/* Survey Metadata */}
            <details open className="group border-b border-gray-300">
              <summary className="cursor-pointer list-none px-6 py-3 bg-gray-100 hover:bg-gray-200">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-3 h-3 text-black transition-transform group-open:rotate-90"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6 6L14 10L6 14V6Z" />
                  </svg>
                  <h3 className="font-bold text-gray-900 text-sm">Survey Metadata</h3>
                </div>
              </summary>
              <div className="px-6 pb-4 pt-3 bg-white">
                <table className="w-full text-sm">
                  <tbody>
                    {ssurgoData.surveyArea && (
                      <tr className="border-b border-gray-300">
                        <td className="py-2.5 pr-4 text-gray-900 font-semibold align-top">Soil Survey Area:</td>
                        <td className="py-2.5 text-gray-700">
                          {ssurgoData.surveyArea}
                          <span className="ml-1 text-blue-600 cursor-help" title="More information">
                            ?
                          </span>
                        </td>
                      </tr>
                    )}
                    {ssurgoData.spatialVersion && (
                      <tr className="border-b border-gray-300">
                        <td className="py-2.5 pr-4 text-gray-900 font-semibold align-top">Spatial Version:</td>
                        <td className="py-2.5 text-gray-700">
                          {ssurgoData.spatialVersion}
                          <span className="ml-1 text-blue-600 cursor-help" title="More information">
                            ?
                          </span>
                        </td>
                      </tr>
                    )}
                    {ssurgoData.scale && (
                      <tr className="border-b border-gray-300">
                        <td className="py-2.5 pr-4 text-gray-900 font-semibold align-top">Scale:</td>
                        <td className="py-2.5 text-gray-700">
                          {ssurgoData.scale}
                          <span className="ml-1 text-blue-600 cursor-help" title="More information">
                            ?
                          </span>
                        </td>
                      </tr>
                    )}
                    {ssurgoData.published && (
                      <tr className="border-b border-gray-300">
                        <td className="py-2.5 pr-4 text-gray-900 font-semibold align-top">Published:</td>
                        <td className="py-2.5 text-gray-700">
                          {ssurgoData.published}
                          <span className="ml-1 text-blue-600 cursor-help" title="More information">
                            ?
                          </span>
                        </td>
                      </tr>
                    )}
                    {ssurgoData.lastExport && (
                      <tr className="border-b border-gray-300">
                        <td className="py-2.5 pr-4 text-gray-900 font-semibold align-top">Last Export:</td>
                        <td className="py-2.5 text-gray-700">
                          {ssurgoData.lastExport}
                          <span className="ml-1 text-blue-600 cursor-help" title="More information">
                            ?
                          </span>
                        </td>
                      </tr>
                    )}
                    <tr className="border-b border-gray-300">
                      <td className="py-2.5 pr-4 text-gray-900 font-semibold align-top">Coordinates:</td>
                      <td className="py-2.5 text-gray-700">
                        {ssurgoData.coordinates[0].toFixed(6)}, {ssurgoData.coordinates[1].toFixed(6)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 text-gray-900 font-semibold align-top">Data Source:</td>
                      <td className="py-2.5 text-gray-700">USDA NRCS SDA</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </details>

            {/* Info box */}
            <div className="mx-6 my-4 bg-gray-100 border-l-4 border-gray-700 p-3">
              <p className="text-xs text-gray-900">
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
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <span>Map Unit Composition</span>
                </h3>
                <div className="flex gap-1 bg-gray-200 rounded p-0.5">
                  <button
                    onClick={() => setCompositionView('bar')}
                    className="p-1.5 rounded transition-colors"
                    style={{
                      backgroundColor: compositionView === 'bar' ? '#ffffff' : 'transparent',
                      color: compositionView === 'bar' ? '#b45309' : '#6b7280'
                    }}
                    title="Bar chart view"
                  >
                    <BarChart3 size={16} />
                  </button>
                  <button
                    onClick={() => setCompositionView('pie')}
                    className="p-1.5 rounded transition-colors"
                    style={{
                      backgroundColor: compositionView === 'pie' ? '#ffffff' : 'transparent',
                      color: compositionView === 'pie' ? '#b45309' : '#6b7280'
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
                  <div className="bg-gray-200 rounded-full h-8 overflow-hidden border border-gray-300 shadow-inner">
                    <div className="h-full flex">
                      {ssurgoData.components
                        .sort((a, b) => (b.comppct_r || 0) - (a.comppct_r || 0))
                        .map((comp, idx) => {
                          const colors = ['#10b981', '#60a5fa', '#fbbf24', '#a78bfa'];
                          const bgColor = comp.majcompflag === 'Yes' ? colors[0] : colors[idx % 3 + 1];
                          
                          return (
                            <div
                              key={idx}
                              className="h-full transition-all duration-700"
                              style={{ 
                                width: `${comp.comppct_r || 0}%`,
                                backgroundColor: bgColor
                              }}
                              title={`${comp.compname}: ${comp.comppct_r}%`}
                            />
                          );
                        })}
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-3 flex flex-wrap gap-3 text-xs">
                    {ssurgoData.components
                      .sort((a, b) => (b.comppct_r || 0) - (a.comppct_r || 0))
                      .map((comp, idx) => {
                        const colors = ['#10b981', '#60a5fa', '#fbbf24', '#a78bfa'];
                        const bgColor = comp.majcompflag === 'Yes' ? colors[0] : colors[idx % 3 + 1];
                        
                        return (
                          <div key={idx} className="flex items-center gap-1.5">
                            <div 
                              className="w-3 h-3 rounded" 
                              style={{ backgroundColor: bgColor }}
                            />
                            <span className="text-gray-700">
                              {comp.compname} <span className="font-semibold">{comp.comppct_r}%</span>
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </>
              ) : (
                <>
                  {/* Pie Chart */}
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={ssurgoData.components.map((comp, idx) => {
                            const colors = ['#10b981', '#60a5fa', '#fbbf24', '#a78bfa'];
                            return {
                              name: comp.compname,
                              value: comp.comppct_r || 0,
                              color: comp.majcompflag === 'Yes' ? colors[0] : colors[idx % 3 + 1]
                            };
                          })}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {ssurgoData.components.map((comp, idx) => {
                            const colors = ['#10b981', '#60a5fa', '#fbbf24', '#a78bfa'];
                            const fillColor = comp.majcompflag === 'Yes' ? colors[0] : colors[idx % 3 + 1];
                            return <Cell key={`cell-${idx}`} fill={fillColor} />;
                          })}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => `${value}%`}
                          contentStyle={{ 
                            backgroundColor: '#ffffff', 
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            padding: '8px'
                          }}
                        />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>
            
            {/* Component Details */}
            {ssurgoData.components.map((comp, idx) => (
              <details key={idx} open={idx === 0} className="group border-b border-gray-300">
                <summary className="cursor-pointer list-none px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-3 h-3 text-amber-600 transition-transform group-open:rotate-90"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6 6L14 10L6 14V6Z" />
                      </svg>
                      <h3 className="font-bold text-gray-900 text-sm">
                        {comp.compname}
                      </h3>
                      {comp.majcompflag === 'Yes' && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium border border-emerald-200">
                          Major
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-amber-700">
                      {comp.comppct_r}%
                    </span>
                  </div>
                </summary>
                <div className="px-2 pb-4 pt-3 bg-white">
                  <table className="w-full text-xs">
                    <tbody>
                      {comp.slope_r != null && (
                        <tr className="border-b border-gray-200">
                          <td className="py-1.5 pr-4 text-gray-700 font-semibold">Local Phase:</td>
                          <td className="py-1.5 text-gray-600">{comp.localphase}</td>
                        </tr>
                      )}
                      {comp.slope_r !== undefined && (
                        <tr className="border-b border-gray-200">
                          <td className="py-1.5 pr-4 text-gray-700 font-semibold">Slope (%):</td>
                          <td className="py-1.5 text-gray-600">{comp.slope_r}</td>
                        </tr>
                      )}
                      {comp.runoff && (
                        <tr className="border-b border-gray-200">
                          <td className="py-1.5 pr-4 text-gray-700 font-semibold">Runoff:</td>
                          <td className="py-1.5 text-gray-600">{comp.runoff}</td>
                        </tr>
                      )}
                      {comp.elev_r !== undefined && (
                        <tr className="border-b border-gray-200">
                          <td className="py-1.5 pr-4 text-gray-700 font-semibold">Elevation (m):</td>
                          <td className="py-1.5 text-gray-600">{comp.elev_r}</td>
                        </tr>
                      )}
                      {comp.landform && (
                        <tr className="border-b border-gray-200">
                          <td className="py-1.5 pr-4 text-gray-700 font-semibold">Landform:</td>
                          <td className="py-1.5 text-gray-600">{comp.landform}</td>
                        </tr>
                      )}
                      {comp.pmorigin && (
                        <tr className="border-b border-gray-200">
                          <td className="py-1.5 pr-4 text-gray-700 font-semibold">Parent Material Origin:</td>
                          <td className="py-1.5 text-gray-600">{comp.pmorigin}</td>
                        </tr>
                      )}
                      {comp.pmkind && (
                        <tr>
                          <td className="py-1.5 pr-4 text-gray-700 font-semibold">Parent Material Kind:</td>
                          <td className="py-1.5 text-gray-600">{comp.pmkind}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  
                  {/* Interpretations Section */}
                  {comp.interpretations && comp.interpretations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-gray-900">Interpretations</h4>
                        <span className="text-xs text-gray-500">{comp.interpretations.length} total</span>
                      </div>
                      <InterpretationsDisplay interpretations={comp.interpretations} />
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        )}

        {/* Taxonomy Tab */}
        {activeTab === 'taxonomy' && ssurgoData?.components && (
          <div className="space-y-4">
            {ssurgoData.components.map((comp, idx) => (
              <details key={idx} open={idx === 0} className="group border-b border-gray-300">
                <summary className="cursor-pointer list-none px-6 py-3 bg-gray-100 hover:bg-gray-200 -mx-4 -mt-4">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-3 h-3 text-black transition-transform group-open:rotate-90"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6 6L14 10L6 14V6Z" />
                    </svg>
                    <h3 className="font-bold text-gray-900 text-sm">
                      {comp.compname} ({comp.comppct_r}%)
                    </h3>
                  </div>
                </summary>
                <div className="px-2 pb-4 pt-3 bg-white">
                  <table className="w-full text-xs">
                    <tbody>
                      {comp.taxclname && (
                        <tr className="border-b border-gray-200">
                          <td className="py-1.5 pr-4 text-gray-700 font-semibold">Taxonomic Class:</td>
                          <td className="py-1.5 text-gray-600 italic">{comp.taxclname}</td>
                        </tr>
                      )}
                      {comp.taxorder && (
                        <tr className="border-b border-gray-200">
                          <td className="py-1.5 pr-4 text-gray-700 font-semibold">Order:</td>
                          <td className="py-1.5 text-gray-600">{comp.taxorder}</td>
                        </tr>
                      )}
                      {comp.taxsuborder && (
                        <tr className="border-b border-gray-200">
                          <td className="py-1.5 pr-4 text-gray-700 font-semibold">Suborder:</td>
                          <td className="py-1.5 text-gray-600">{comp.taxsuborder}</td>
                        </tr>
                      )}
                      {comp.taxgrtgroup && (
                        <tr className="border-b border-gray-200">
                          <td className="py-1.5 pr-4 text-gray-700 font-semibold">Great Group:</td>
                          <td className="py-1.5 text-gray-600">{comp.taxgrtgroup}</td>
                        </tr>
                      )}
                      {comp.taxsubgrp && (
                        <tr className="border-b border-gray-200">
                          <td className="py-1.5 pr-4 text-gray-700 font-semibold">Subgroup:</td>
                          <td className="py-1.5 text-gray-600">{comp.taxsubgrp}</td>
                        </tr>
                      )}
                      {comp.taxpartsize && (
                        <tr className="border-b border-gray-200">
                          <td className="py-1.5 pr-4 text-gray-700 font-semibold">Particle Size:</td>
                          <td className="py-1.5 text-gray-600">{comp.taxpartsize}</td>
                        </tr>
                      )}
                      {comp.taxtempcl && (
                        <tr className="border-b border-gray-200">
                          <td className="py-1.5 pr-4 text-gray-700 font-semibold">Temperature Class:</td>
                          <td className="py-1.5 text-gray-600">{comp.taxtempcl}</td>
                        </tr>
                      )}
                      {comp.taxmoistscl && (
                        <tr>
                          <td className="py-1.5 pr-4 text-gray-700 font-semibold">Moisture Regime:</td>
                          <td className="py-1.5 text-gray-600">{comp.taxmoistscl}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </details>
            ))}
          </div>
        )}

        {/* Horizons Tab */}
        {activeTab === 'horizons' && ssurgoData?.components && (
          <div className="space-y-4">
            {/* Property Selector */}
            <div className="px-6 pt-4 pb-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Display Property:
                </h3>
                <select
                  value={profileProperty}
                  onChange={(e) => setProfileProperty(e.target.value as any)}
                  className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
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
            {ssurgoData.components.map((comp, compIdx) => (
              comp.horizons && comp.horizons.length > 0 && (
                <details key={compIdx} open={compIdx === 0} className="group border-b border-gray-300">
                  <summary className="cursor-pointer list-none px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-3 h-3 text-amber-600 transition-transform group-open:rotate-90"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6 6L14 10L6 14V6Z" />
                      </svg>
                      <h3 className="font-bold text-gray-900 text-sm">
                        {comp.compname} - Soil Profile
                      </h3>
                      {comp.majcompflag === 'Yes' && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium border border-emerald-200">
                          Major
                        </span>
                      )}
                      <span className="text-sm text-gray-600 ml-auto">
                        {comp.comppct_r}%
                      </span>
                    </div>
                  </summary>
                  <div className="px-6 pb-4 pt-3 bg-white">
                    <div className="h-80 bg-gray-50 rounded border border-gray-300 p-4 flex items-center justify-center" style={{ position: 'relative' }}>
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
                          whiteSpace: 'nowrap'
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
                          opacity: 0.5
                        }} />
                        {comp.horizons.map((hz, index) => {
                          const top = Number(hz.hzdept_r) || 0;
                          const bottom = Number(hz.hzdepb_r) || 0;
                          const thickness = bottom - top;
                          const maxDepth = comp.horizons ? Math.max(...comp.horizons.map(h => Number(h.hzdepb_r) || 0)) : 0;
                          const topPercent = (top / maxDepth) * 100;
                          const heightPercent = (thickness / maxDepth) * 100;
                          
                          // Get color based on selected property
                          let displayColor = "#d1d5db";
                          let displayLabel = "Unknown";
                          let textColor = 'white';
                          
                          const sand = Number(hz.sandtotal_r);
                          const silt = Number(hz.silttotal_r);
                          const clay = Number(hz.claytotal_r);
                          
                          if (profileProperty === 'texture') {
                            if (!isNaN(sand) && !isNaN(silt) && !isNaN(clay)) {
                              displayLabel = getTextureClass(sand, silt, clay);
                              displayColor = getTextureClassColor(displayLabel);
                              textColor = displayLabel === 'Sand' || displayLabel === 'Loamy sand' || displayLabel === 'Silt' ? '#333' : 'white';
                            }
                          } else {
                            const propertyMap: Record<string, string> = {
                              clay: 'claytotal_r',
                              om: 'om_r',
                              ph: 'ph1to1h2o_r',
                              awc: 'awc_r',
                              ksat: 'ksat_r'
                            };
                            
                            const fieldName = propertyMap[profileProperty];
                            const value = Number((hz as any)[fieldName]);
                            
                            if (!isNaN(value)) {
                              const classification = classifyProperty(value, profileProperty);
                              displayColor = classification.color;
                              displayLabel = classification.label;
                              const isDark = profileProperty === 'ksat' || (profileProperty === 'clay' && value > 25) || (profileProperty === 'om' && value > 1);
                              textColor = isDark ? 'white' : '#333';
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
                                textShadow: textColor === 'white' ? '1px 1px 2px rgba(0,0,0,0.8)' : 'none'
                              }}
                              title={`${hz.hzname || `Horizon ${index + 1}`} (${top}-${bottom} cm)\nTexture: ${!isNaN(sand) && !isNaN(silt) && !isNaN(clay) ? getTextureClass(sand, silt, clay) : 'N/A'}\nClay: ${!isNaN(clay) ? clay.toFixed(1) : 'N/A'}%\nOM: ${!isNaN(Number(hz.om_r)) ? Number(hz.om_r).toFixed(2) : 'N/A'}%\npH: ${!isNaN(Number(hz.ph1to1h2o_r)) ? Number(hz.ph1to1h2o_r).toFixed(1) : 'N/A'}\nAWC: ${!isNaN(Number(hz.awc_r)) ? Number(hz.awc_r).toFixed(2) : 'N/A'}\nKsat: ${!isNaN(Number(hz.ksat_r)) ? Number(hz.ksat_r).toFixed(1) : 'N/A'} µm/s`}
                            >
                              {hz.hzname || `H${index + 1}`}
                            </div>
                          );
                        })}
                        {/* Depth scale with horizon breaks */}
                        <div style={{
                          position: 'absolute',
                          left: '-50px',
                          top: '0',
                          height: '100%',
                          width: '40px',
                          fontSize: '10px',
                          color: '#666'
                        }}>
                          {/* Collect all unique depths */}
                          {(() => {
                            const maxDepth = Math.max(...comp.horizons.map(h => Number(h.hzdepb_r) || 0));
                            const depths = new Set<number>();
                            depths.add(0);
                            comp.horizons.forEach(h => {
                              const top = Number(h.hzdept_r);
                              const bottom = Number(h.hzdepb_r);
                              if (!isNaN(top)) depths.add(top);
                              if (!isNaN(bottom)) depths.add(bottom);
                            });
                            
                            return Array.from(depths).sort((a, b) => a - b).map((depth, idx) => {
                              const topPercent = (depth / maxDepth) * 100;
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
                                    gap: '2px'
                                  }}
                                >
                                  <span style={{ fontWeight: depth === 0 || depth === maxDepth ? 'bold' : 'normal' }}>
                                    {depth}
                                  </span>
                                  <div style={{
                                    width: '8px',
                                    height: '1px',
                                    backgroundColor: '#666',
                                    opacity: 0.5
                                  }} />
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </div>
                    {/* Legend */}
                    <div className="mt-2 text-xs text-gray-600">
                      {profileProperty === 'texture' ? (
                        <>
                          <div className="font-semibold mb-1">USDA Texture Classes:</div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            <div className="flex items-center gap-1.5">
                              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f4e4c1' }} />
                              <span>Sand</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#8b7355' }} />
                              <span>Loam</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#d9c48f' }} />
                              <span>Sandy loam</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#7a5c3f' }} />
                              <span>Clay loam</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#a0826d' }} />
                              <span>Silt loam</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#4a3728' }} />
                              <span>Clay</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-semibold mb-1">
                            {profileProperty === 'clay' && 'Clay Content (%)'}
                            {profileProperty === 'om' && 'Organic Matter (%)'}
                            {profileProperty === 'ph' && 'pH'}
                            {profileProperty === 'awc' && 'Available Water Capacity'}
                            {profileProperty === 'ksat' && 'Saturated Hydraulic Conductivity (µm/s)'}
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            {soilPropertyRanges[profileProperty]?.slice(0, 6).map((range, idx) => (
                              <div key={idx} className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded" style={{ backgroundColor: range.color }} />
                                <span>{range.label} ({range.min}{idx === soilPropertyRanges[profileProperty].length - 1 ? '+' : `-${range.max}`})</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </details>
              )
            ))}
          </div>
        )}

        {/* Cropland History Tab */}
        {activeTab === 'cropland' && cdlHistory && cdlHistory.length > 0 && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-200">
              <h3 className="text-lg font-bold text-emerald-900 mb-2">Cropland Data Layer History</h3>
              <p className="text-sm text-emerald-700">
                Showing {cdlHistory.length} years of crop rotation data from USDA NASS CropScape
              </p>
            </div>

            {/* Crop Timeline Chart */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">Crop Timeline</h4>
                <button
                  onClick={() => setShowExpandedCDLChart(true)}
                  className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                  title="Expand chart"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Expand</span>
                </button>
              </div>
              
              {/* Horizontal bar chart style - best for categorical time series */}
              <div className="space-y-1">
                {cdlHistory.sort((a, b) => b.year - a.year).map((yearData) => (
                  <div key={yearData.year} className="space-y-1">
                    <div className="flex items-center space-x-2 group">
                      <span className="text-xs font-medium text-gray-600 w-10 text-right">{yearData.year}</span>
                      {/* Crop type icon */}
                      {yearData.cropType && (
                        <span className={`text-[10px] font-bold px-1 py-0.5 rounded ${
                          yearData.cropType === 'annual' ? 'bg-blue-100 text-blue-800' :
                          yearData.cropType === 'perennial' ? 'bg-purple-100 text-purple-800' :
                          yearData.cropType === 'permanent' ? 'bg-red-100 text-red-800' :
                          yearData.cropType === 'pasture' ? 'bg-green-100 text-green-800' :
                          yearData.cropType === 'forest' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-gray-100 text-gray-800'
                        }`} title={`Crop type: ${yearData.cropType}`}>
                          {yearData.cropType === 'annual' ? 'A' :
                           yearData.cropType === 'perennial' ? 'P' :
                           yearData.cropType === 'permanent' ? '🌳' :
                           yearData.cropType === 'pasture' ? '🌾' :
                           yearData.cropType === 'forest' ? '🌲' :
                           '?'}
                        </span>
                      )}
                      <div className="flex-1 relative">
                        <div 
                          className={`h-6 rounded flex items-center px-2 border transition-all group-hover:shadow-md ${
                            yearData.transitionWarning ? 'border-orange-400 border-2' : 'border-gray-200 group-hover:border-gray-300'
                          }`}
                          style={{ backgroundColor: yearData.color }}
                          title={yearData.transitionWarning || undefined}
                        >
                          <span className="text-xs font-medium text-gray-900 drop-shadow-sm flex-1">
                            {yearData.cropName}
                          </span>
                          {yearData.confidence && (
                            <span className={`text-[10px] px-1 py-0.5 rounded ${
                              yearData.confidence >= 80 ? 'bg-green-100 text-green-800' :
                              yearData.confidence >= 50 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {yearData.confidence}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {yearData.transitionWarning && (
                      <div className="ml-12 text-[10px] text-orange-600 flex items-start space-x-1">
                        <span className="mt-0.5">⚠</span>
                        <span>{yearData.transitionWarning}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Legend for crop types */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex flex-wrap gap-2 text-[10px]">
                  <div className="flex items-center space-x-1">
                    <span className="bg-blue-100 text-blue-800 font-bold px-1 py-0.5 rounded">A</span>
                    <span className="text-gray-600">Annual</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="bg-purple-100 text-purple-800 font-bold px-1 py-0.5 rounded">P</span>
                    <span className="text-gray-600">Perennial</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="bg-red-100 text-red-800 font-bold px-1 py-0.5 rounded">🌳</span>
                    <span className="text-gray-600">Permanent</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="bg-green-100 text-green-800 font-bold px-1 py-0.5 rounded">🌾</span>
                    <span className="text-gray-600">Pasture</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Crop Frequency Distribution */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Crop Frequency</h4>
              <div className="space-y-2">
                {(() => {
                  // Count occurrences of each crop
                  const cropCounts: Record<string, { count: number; color: string }> = {}
                  cdlHistory.forEach((yearData) => {
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
                              className="w-4 h-4 rounded border border-gray-300"
                              style={{ backgroundColor: data.color }}
                            />
                            <span className="text-gray-900">{cropName}</span>
                          </div>
                          <span className="text-gray-600 font-medium">
                            {data.count} {data.count === 1 ? 'year' : 'years'} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: data.color
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
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Rotation Pattern</h4>
              <div className="text-sm text-blue-800 space-y-1">
                {(() => {
                  const crops = cdlHistory.map(d => d.cropName)
                  const uniqueCrops = [...new Set(crops)]
                  
                  if (uniqueCrops.length === 1) {
                    return <p>Monoculture: {uniqueCrops[0]} grown consistently</p>
                  } else if (uniqueCrops.length === 2) {
                    return <p>2-crop rotation between {uniqueCrops.join(' and ')}</p>
                  } else {
                    return (
                      <>
                        <p>Complex rotation with {uniqueCrops.length} different crops:</p>
                        <p className="text-xs mt-1">{uniqueCrops.join(', ')}</p>
                      </>
                    )
                  }
                })()}
              </div>
            </div>

            {/* Data Source Footer */}
            <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
              Data: USDA NASS Cropland Data Layer (2008-2023)
            </div>
          </div>
        )}

        {activeTab === 'cropland' && (!cdlHistory || cdlHistory.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">No Cropland Data</h3>
              <p className="text-sm text-gray-600 max-w-xs">
                Click on the map to query cropland history for that location
              </p>
            </div>
          </div>
        )}
      </div>
      {/* Summary Modal Popup */}
      {showSummaryModal && ssurgoData && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowSummaryModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-11/12 h-5/6 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300">
              <div>
                <h2 className="text-lg font-bold text-gray-900">UC Davis SoilWeb Summary</h2>
                <p className="text-sm text-gray-600">MUKEY: {ssurgoData.mukey}</p>
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
                className="w-full h-full border-0"
                title="UC Davis SoilWeb Summary"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Dashboard */}
      {showFullDashboard && ssurgoData && (
        <SoilDashboard 
          ssurgoData={ssurgoData}
          cdlHistory={cdlHistory}
          onClose={() => setShowFullDashboard(false)}
        />
      )}

      {/* Expanded CDL Chart Modal */}
      {showExpandedCDLChart && cdlHistory && cdlHistory.length > 0 && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Crop Rotation History</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {cdlHistory.length} years of USDA NASS Cropland Data Layer
                </p>
              </div>
              <button
                onClick={() => setShowExpandedCDLChart(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Close"
              >
                <X size={24} />
              </button>
            </div>

            {/* Chart Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-6">
                {/* Horizontal Bar Chart - Full Size */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Year-by-Year Timeline</h3>
                    {/* Legend */}
                    <div className="flex gap-3 text-xs">
                      <div className="flex items-center space-x-1">
                        <span className="bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">A</span>
                        <span className="text-gray-600">Annual</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded">P</span>
                        <span className="text-gray-600">Perennial</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded">🌳</span>
                        <span className="text-gray-600">Permanent</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="bg-green-100 text-green-800 font-bold px-1.5 py-0.5 rounded">🌾</span>
                        <span className="text-gray-600">Pasture</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {cdlHistory.sort((a, b) => b.year - a.year).map((yearData) => (
                      <div key={yearData.year} className="space-y-1">
                        <div className="flex items-center space-x-3 group">
                          <span className="text-sm font-bold text-gray-700 w-12 text-right">{yearData.year}</span>
                          {/* Crop type badge */}
                          {yearData.cropType && (
                            <span className={`text-xs font-bold px-1.5 py-1 rounded ${
                              yearData.cropType === 'annual' ? 'bg-blue-100 text-blue-800' :
                              yearData.cropType === 'perennial' ? 'bg-purple-100 text-purple-800' :
                              yearData.cropType === 'permanent' ? 'bg-red-100 text-red-800' :
                              yearData.cropType === 'pasture' ? 'bg-green-100 text-green-800' :
                              yearData.cropType === 'forest' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-gray-100 text-gray-800'
                            }`} title={`Crop type: ${yearData.cropType}`}>
                              {yearData.cropType === 'annual' ? 'A' :
                               yearData.cropType === 'perennial' ? 'P' :
                               yearData.cropType === 'permanent' ? '🌳' :
                               yearData.cropType === 'pasture' ? '🌾' :
                               yearData.cropType === 'forest' ? '🌲' :
                               '?'}
                            </span>
                          )}
                          <div className="flex-1 relative">
                            <div 
                              className={`h-10 rounded-lg flex items-center justify-between px-4 shadow-sm transition-all group-hover:shadow-lg group-hover:scale-[1.02] ${
                                yearData.transitionWarning ? 'border-2 border-orange-400' : 'border-2 border-gray-300'
                              }`}
                              style={{ backgroundColor: yearData.color }}
                              title={yearData.transitionWarning || undefined}
                            >
                              <span className="text-sm font-semibold text-gray-900 drop-shadow-sm">
                                {yearData.cropName}
                              </span>
                              {yearData.confidence && (
                                <span className={`text-xs px-2 py-1 rounded font-bold ${
                                  yearData.confidence >= 80 ? 'bg-green-200 text-green-900' :
                                  yearData.confidence >= 50 ? 'bg-yellow-200 text-yellow-900' :
                                  'bg-red-200 text-red-900'
                                }`}>
                                  {yearData.confidence}% confidence
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {yearData.transitionWarning && (
                          <div className="ml-16 text-sm text-orange-600 flex items-start space-x-2 bg-orange-50 p-2 rounded">
                            <span className="text-lg">⚠</span>
                            <span>{yearData.transitionWarning}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flow Diagram Style */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Rotation Flow</h3>
                  <div className="relative" style={{ height: '400px' }}>
                    {/* Y-axis labels (crop names) */}
                    <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between pr-4">
                      {(() => {
                        const uniqueCrops = [...new Set(cdlHistory.map(d => d.cropName))].sort()
                        return uniqueCrops.map((crop) => (
                          <div key={crop} className="text-right text-sm font-medium text-gray-700">
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
                                className="absolute left-1/2 w-5 h-5 rounded-full border-3 border-white shadow-lg transition-all group-hover:scale-150 group-hover:z-10 cursor-pointer"
                                style={{ 
                                  backgroundColor: yearData.color,
                                  top: `${yPosition}%`,
                                  transform: 'translate(-50%, -50%)'
                                }}
                              />
                              {/* Tooltip on hover */}
                              <div className="absolute left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap pointer-events-none z-20 shadow-xl"
                                style={{ top: `${yPosition}%`, marginTop: '-50px' }}>
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
                                    className="absolute left-1/2 w-1 bg-gray-400 opacity-50"
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
                    <div className="absolute left-40 right-0 bottom-0 flex justify-between text-sm font-medium text-gray-700">
                      {cdlHistory.sort((a, b) => a.year - b.year).map((yearData) => (
                        <div key={yearData.year} className="flex-1 text-center">
                          {yearData.year}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Crop Frequency */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Crop Frequency</h3>
                    <div className="space-y-3">
                      {(() => {
                        const cropCounts: Record<string, { count: number; color: string }> = {}
                        cdlHistory.forEach((yearData) => {
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
                                    className="w-5 h-5 rounded border-2 border-gray-300"
                                    style={{ backgroundColor: data.color }}
                                  />
                                  <span className="font-medium text-gray-900">{cropName}</span>
                                </div>
                                <span className="text-gray-600 font-semibold">
                                  {data.count} yr ({percentage.toFixed(0)}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                  className="h-3 rounded-full transition-all shadow-sm"
                                  style={{ 
                                    width: `${percentage}%`,
                                    backgroundColor: data.color
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
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Rotation Pattern</h3>
                    <div className="text-sm text-blue-800 space-y-2">
                      {(() => {
                        const crops = cdlHistory.map(d => d.cropName)
                        const uniqueCrops = [...new Set(crops)]
                        
                        if (uniqueCrops.length === 1) {
                          return (
                            <>
                              <p className="font-semibold">Monoculture</p>
                              <p>{uniqueCrops[0]} grown consistently across all {cdlHistory.length} years</p>
                            </>
                          )
                        } else if (uniqueCrops.length === 2) {
                          return (
                            <>
                              <p className="font-semibold">2-Crop Rotation</p>
                              <p>Alternating between {uniqueCrops.join(' and ')}</p>
                            </>
                          )
                        } else {
                          return (
                            <>
                              <p className="font-semibold">Complex Rotation</p>
                              <p>{uniqueCrops.length} different crops over {cdlHistory.length} years</p>
                              <div className="mt-3 text-xs">
                                <p className="font-medium mb-1">Crops:</p>
                                <p>{uniqueCrops.join(', ')}</p>
                              </div>
                            </>
                          )
                        }
                      })()}
                    </div>
                  </div>

                  {/* Transition Analysis */}
                  <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                    <h3 className="text-lg font-semibold text-purple-900 mb-4">Transitions</h3>
                    <div className="text-sm text-purple-800 space-y-2">
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
                            <p className="font-semibold">{totalTransitions} crop changes</p>
                            {topTransitions.length > 0 && (
                              <div className="mt-3 space-y-1">
                                <p className="font-medium text-xs">Most common:</p>
                                {topTransitions.map(([trans, count]) => (
                                  <div key={trans} className="text-xs flex justify-between">
                                    <span>{trans}</span>
                                    <span className="font-semibold">{count}×</span>
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
            <div className="p-4 border-t border-gray-200 text-center text-sm text-gray-600">
              Data source: USDA NASS Cropland Data Layer (CropScape) • 30m resolution • 2008-2023
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface PropertyRowProps {
  label: string
  value: string | number
  children?: React.ReactNode
}

function PropertyRow({ label, value, children }: PropertyRowProps) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        {children}
        <span className="text-sm font-medium text-gray-900">{value}</span>
      </div>
    </div>
  )
}
