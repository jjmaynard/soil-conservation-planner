'use client'

import {
  AlertTriangle,
  Award,
  BarChart3,
  Beaker,
  CheckCircle,
  ChevronDown,
  Database,
  Download,
  Droplets,
  Eye,
  FileText,
  Gauge,
  Info,
  Layers,
  Leaf,
  MapPin,
  Microscope,
  Mountain,
  Printer,
  Share2,
  Shield,
  Sprout,
  TrendingUp,
  Wheat,
  X,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import {
  Bar,
  BarChart,
  Tooltip as BarTooltip,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { SSURGOData } from '#src/types/soil'
import type { CDLYearData } from '#src/utils/cdlQuery'
import { getSoilOrderColor, getTextureColor } from '#src/utils/soilColors'
import { getDescriptionText } from '#src/utils/osdDescriptionLoader'
import { LCCFormatter } from '#src/lib/lcc-formatter'
import {
  LAND_CAPABILITY_INTERPRETATIONS,
  HYDROLOGIC_GROUP_INTERPRETATIONS,
  DRAINAGE_CLASS_INTERPRETATIONS,
  getHydrologyColor,
  getDrainageColor,
  type DrainageClassKey,
} from '#src/utils/soilInterpretations'

interface SoilDashboardProps {
  ssurgoData: SSURGOData
  cdlHistory?: CDLYearData[] | null
  onClose: () => void
}

export default function SoilDashboard({ ssurgoData, cdlHistory, onClose }: SoilDashboardProps) {
  const [selectedComponent, setSelectedComponent] = useState(0)
  const [osdDescription, setOsdDescription] = useState<string | null>(null)
  const [osdLoading, setOsdLoading] = useState(false)
  const [showIrrigatedLCC, setShowIrrigatedLCC] = useState(false)
  const [profileProperty, setProfileProperty] = useState<'texture' | 'clay' | 'om' | 'ph' | 'awc' | 'ksat'>('texture')

  // Get major component or first component
  const majorComp = ssurgoData.components?.find(c => c.majcompflag === 'Yes') || ssurgoData.components?.[0]
  const surfaceHz = majorComp?.horizons?.[0]

  // Load OSD description when component series name is available
  useEffect(() => {
    const seriesName = majorComp?.compname
    if (seriesName) {
      setOsdLoading(true)
      getDescriptionText(seriesName)
        .then(text => {
          setOsdDescription(text)
          setOsdLoading(false)
        })
        .catch(error => {
          console.error('Failed to load OSD description:', error)
          setOsdLoading(false)
        })
    }
  }, [majorComp?.compname])

  // Enhanced property ranges with classification system from PropertyPanel
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
  const classifyProperty = (value: number, property: string): { color: string; label: string } => {
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
  const getTextureClass = (sand: number, silt: number, clay: number): string => {
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
  const getTextureClassColor = (textureClass: string): string => {
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

  const propertyData = surfaceHz
    ? [
        {
          name: 'Clay',
          value: Number(surfaceHz.claytotal_r || 0),
          unit: '%',
          key: 'clay',
          ideal: '20-35',
        },
        {
          name: 'Sand',
          value: Number(surfaceHz.sandtotal_r || 0),
          unit: '%',
          key: 'sand',
          ideal: '10-30',
        },
        { 
          name: 'OM', 
          value: Number(surfaceHz.om_r || 0), 
          unit: '%',
          key: 'om',
          ideal: '2-5',
        },
        {
          name: 'pH',
          value: Number(surfaceHz.ph1to1h2o_r || 0),
          unit: '',
          key: 'ph',
          ideal: '5.5-7.0',
        },
        {
          name: 'AWC',
          value: Number(surfaceHz.awc_r || 0),
          unit: '',
          key: 'awc',
          ideal: '0.10-0.20',
        },
        {
          name: 'Ksat',
          value: Number(surfaceHz.ksat_r || 0),
          unit: 'µm/s',
          key: 'ksat',
          ideal: '1-10',
        },
      ]
        .filter(p => p.value > 0)
        .map(p => {
          const classification = classifyProperty(p.value, p.key)
          return {
            ...p,
            classification: classification.label,
            classificationColor: classification.color,
          }
        })
    : []

  // Radar chart data
  const radarData = propertyData.slice(0, 5).map(p => {
    // Define max values for radar chart normalization
    const maxValues: Record<string, number> = {
      clay: 100,
      sand: 100,
      om: 20,
      ph: 10.5,
      awc: 0.4,
      ksat: 400,
    }
    const maxValue = maxValues[p.key] || 100
    
    return {
      property: p.name,
      value: Math.min(100, (p.value / maxValue) * 100),
      fullMark: 100,
    }
  })

  // Horizon depth data for stacked bar
  const horizonData =
    majorComp?.horizons?.map(hz => ({
      name: hz.hzname,
      depth: Number(hz.hzdepb_r || 0) - Number(hz.hzdept_r || 0),
      clay: Number(hz.claytotal_r || 0),
      sand: Number(hz.sandtotal_r || 0),
      om: Number(hz.om_r || 0),
    })) || []

  // Component composition data
  const compositionData =
    ssurgoData.components?.map(comp => ({
      name: comp.compname,
      value: Number(comp.comppct_r) || 0,
      major: comp.majcompflag === 'Yes',
    })) || []

  return (
    <div className="fixed inset-0 overflow-auto" style={{ backgroundColor: 'var(--color-cream-100)', zIndex: 10000 }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 shadow-lg"
        style={{ background: 'linear-gradient(to right, var(--color-charcoal-800), var(--color-charcoal-700), var(--color-charcoal-800))', color: 'white' }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: 'linear-gradient(to bottom right, var(--color-earth-500), var(--color-earth-600))' }}
              >
                <Layers className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="mb-1 flex items-center space-x-3 text-xs" style={{ color: 'var(--color-sand-200)' }}>
                  <Database className="h-3 w-3" />
                  <span>USDA NRCS Soil Data Access</span>
                </div>
                <h1 className="text-xl font-bold" style={{ color: 'white' }}>
                  {ssurgoData.musym} - {ssurgoData.muname}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm transition-colors"
                style={{ backgroundColor: 'var(--color-charcoal-600)', color: 'white' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-charcoal-500)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-charcoal-600)')}
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <button
                className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm transition-colors"
                style={{ backgroundColor: 'var(--color-charcoal-600)', color: 'white' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-charcoal-500)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-charcoal-600)')}
              >
                <Printer className="h-4 w-4" />
                <span>Print</span>
              </button>
              <button
                className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm transition-colors"
                style={{ backgroundColor: 'var(--color-charcoal-600)', color: 'white' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-charcoal-500)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-charcoal-600)')}
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
              <button
                onClick={onClose}
                className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm transition-colors"
                style={{ backgroundColor: 'var(--color-charcoal-600)', color: 'white' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-charcoal-500)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-charcoal-600)')}
              >
                <X className="h-4 w-4" />
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="container mx-auto min-h-screen space-y-6 px-6 py-6" style={{ backgroundColor: 'var(--color-cream-100)' }}>
        {/* Key Metrics Row */}
        <div className="grid grid-cols-5 gap-4">
          <div className="rounded-xl border-l-4 bg-white p-6 shadow-lg" style={{ borderLeftColor: 'var(--color-ocean-500)' }}>
            <div className="mb-2 flex items-center justify-between">
              <MapPin className="h-8 w-8" style={{ color: 'var(--color-ocean-500)' }} />
              <TrendingUp className="h-4 w-4" style={{ color: 'var(--color-forest-500)' }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-charcoal-800)' }}>
              {ssurgoData.muacres ? `${(Number(ssurgoData.muacres) / 1000).toFixed(1)}K` : 'N/A'}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-slate-600)' }}>Total Acres</div>
          </div>

          <div className="rounded-xl border-l-4 bg-white p-6 shadow-lg" style={{ borderLeftColor: 'var(--color-forest-600)' }}>
            <div className="mb-2 flex items-center justify-between">
              <Layers className="h-8 w-8" style={{ color: 'var(--color-forest-600)' }} />
              <span className="rounded-full px-2 py-1 text-xs font-medium" style={{ backgroundColor: 'var(--color-forest-100)', color: 'var(--color-forest-800)' }}>
                Active
              </span>
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-charcoal-800)' }}>{ssurgoData.components?.length || 0}</div>
            <div className="text-sm" style={{ color: 'var(--color-slate-600)' }}>Components</div>
          </div>

          <div className="rounded-xl border-l-4 bg-white p-6 shadow-lg" style={{ borderLeftColor: 'var(--color-lavender-600)' }}>
            <div className="mb-2 flex items-center justify-between">
              <Mountain className="h-8 w-8" style={{ color: 'var(--color-lavender-600)' }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-charcoal-800)' }}>{majorComp?.horizons?.length || 0}</div>
            <div className="text-sm" style={{ color: 'var(--color-slate-600)' }}>Soil Horizons</div>
          </div>

          <div className="rounded-xl border-l-4 bg-white p-6 shadow-lg" style={{ borderLeftColor: 'var(--color-sunset-500)' }}>
            <div className="mb-2 flex items-center justify-between">
              <Beaker className="h-8 w-8" style={{ color: 'var(--color-sunset-500)' }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-charcoal-800)' }}>
              {surfaceHz?.ph1to1h2o_r ? Number(surfaceHz.ph1to1h2o_r).toFixed(1) : 'N/A'}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-slate-600)' }}>pH Level</div>
          </div>

          <div className="rounded-xl border-l-4 bg-white p-6 shadow-lg" style={{ borderLeftColor: 'var(--color-amber-600)' }}>
            <div className="mb-2 flex items-center justify-between">
              <Gauge className="h-8 w-8" style={{ color: 'var(--color-amber-600)' }} />
              <span className="rounded-full px-2 py-1 text-xs font-medium" style={{ backgroundColor: 'var(--color-forest-100)', color: 'var(--color-forest-800)' }}>
                92%
              </span>
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-charcoal-800)' }}>High</div>
            <div className="text-sm" style={{ color: 'var(--color-slate-600)' }}>Data Quality</div>
          </div>
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-3 gap-6">
          {/* Component Composition */}
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h3 className="mb-4 flex items-center space-x-2 text-lg font-bold" style={{ color: 'var(--color-charcoal-900)' }}>
              <BarChart3 className="h-5 w-5" style={{ color: 'var(--color-ocean-600)' }} />
              <span>Component Composition</span>
            </h3>
            <div style={{ width: '100%', height: '280px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <PieChart width={380} height={280}>
                <Pie
                  data={compositionData}
                  cx={190}
                  cy={140}
                  labelLine={false}
                  outerRadius={120}
                  dataKey="value"
                >
                  {compositionData.map((entry, index) => {
                    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#a78bfa', '#ef4444']
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.major ? colors[0] : colors[(index % 4) + 1]}
                      />
                    )
                  })}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
            <div className="mt-4 space-y-2">
              {compositionData.map((comp, idx) => {
                const colors = ['#10b981', '#3b82f6', '#f59e0b', '#a78bfa', '#ef4444']
                return (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: comp.major ? colors[0] : colors[(idx % 4) + 1] }}
                      />
                      <span style={{ color: 'var(--color-charcoal-800)' }}>{comp.name}</span>
                      {comp.major && (
                        <span className="rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: 'var(--color-forest-100)', color: 'var(--color-forest-800)' }}>
                          Major
                        </span>
                      )}
                    </div>
                    <span className="font-semibold" style={{ color: 'var(--color-charcoal-800)' }}>{comp.value}%</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Property Radar */}
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h3 className="mb-4 flex items-center space-x-2 text-lg font-bold" style={{ color: 'var(--color-charcoal-900)' }}>
              <TrendingUp className="h-5 w-5" style={{ color: 'var(--color-forest-600)' }} />
              <span>Property Analysis</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="property" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Properties"
                    dataKey="value"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center text-sm" style={{ color: 'var(--color-slate-600)' }}>Values shown as % of ideal range</div>
          </div>

          {/* Horizon Property Trends */}
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h3 className="mb-6 flex items-center space-x-2 text-lg font-bold" style={{ color: 'var(--color-charcoal-900)' }}>
              <Mountain className="h-5 w-5" style={{ color: 'var(--color-ocean-600)' }} />
              <span>Horizon Property Trends</span>
            </h3>
            <div className="h-64">
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
        </div>

        {/* Component Profile Comparison - Full Width Row */}
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center space-x-2 text-lg font-bold" style={{ color: 'var(--color-charcoal-900)' }}>
              <Mountain className="h-5 w-5" style={{ color: 'var(--color-lavender-600)' }} />
              <span>Component Profile Comparison</span>
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium" style={{ color: 'var(--color-slate-700)' }}>Display Property:</span>
              <select
                value={profileProperty}
                onChange={e => setProfileProperty(e.target.value as any)}
                className="border rounded px-3 py-1 text-sm"
                style={{ borderColor: 'var(--color-slate-300)', backgroundColor: 'white' }}
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

          {/* Component profiles side by side */}
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(ssurgoData.components?.length || 0, 4)}, 1fr)` }}>
            {ssurgoData.components?.slice(0, 4).map((comp, compIdx) => {
              const colors = [
                'var(--color-forest-600)', 'var(--color-ocean-500)', 'var(--color-amber-500)',
                'var(--color-lavender-600)'
              ]
              const bgColor = colors[compIdx % colors.length]
              
              return (
                <div key={compIdx} className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--color-slate-200)' }}>
                  {/* Component header */}
                  <div className="p-3 text-white" style={{ backgroundColor: bgColor }}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-bold text-sm">{comp.compname}</h4>
                      {comp.majcompflag === 'Yes' && (
                        <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
                          Major
                        </span>
                      )}
                    </div>
                    <p className="text-xs opacity-90">{comp.comppct_r}% of map unit</p>
                  </div>

                  {/* Profile visualization */}
                  <div className="p-3 bg-white">
                    <svg width="100%" height="400" viewBox="0 0 300 400">
                      {/* Depth scale on left */}
                      <g>
                        {[0, 50, 100, 150, 200].map((depth, idx) => (
                          <g key={idx}>
                            <text x="10" y={depth * 2 + 5} fontSize="10" fill="var(--color-slate-600)">
                              {depth}
                            </text>
                            <line x1="35" y1={depth * 2} x2="265" y2={depth * 2} stroke="var(--color-slate-300)" strokeWidth="0.5" strokeDasharray="2,2" />
                          </g>
                        ))}
                      </g>

                      {/* Horizon layers */}
                      {comp.horizons?.map((hz, hzIdx) => {
                        const topDepth = Number(hz.hzdept_r || 0)
                        const bottomDepth = Number(hz.hzdepb_r || 0)
                        const thickness = bottomDepth - topDepth
                        
                        // Calculate color based on selected property
                        let fillColor = 'var(--color-slate-300)'
                        
                        if (profileProperty === 'texture') {
                          const clay = Number(hz.claytotal_r || 0)
                          const sand = Number(hz.sandtotal_r || 0)
                          const silt = Number(hz.silttotal_r || 0)
                          const textureClass = getTextureClass(sand, silt, clay)
                          fillColor = getTextureClassColor(textureClass)
                        } else if (profileProperty === 'clay') {
                          const clay = Number(hz.claytotal_r || 0)
                          fillColor = classifyProperty(clay, 'clay').color
                        } else if (profileProperty === 'om') {
                          const om = Number(hz.om_r || 0)
                          fillColor = classifyProperty(om, 'om').color
                        } else if (profileProperty === 'ph') {
                          const ph = Number(hz.ph1to1h2o_r || 0)
                          fillColor = classifyProperty(ph, 'ph').color
                        } else if (profileProperty === 'awc') {
                          const awc = Number(hz.awc_r || 0)
                          fillColor = classifyProperty(awc, 'awc').color
                        } else if (profileProperty === 'ksat') {
                          const ksat = Number(hz.ksat_r || 0)
                          fillColor = classifyProperty(ksat, 'ksat').color
                        }

                        return (
                          <g key={hzIdx}>
                            <rect
                              x="40"
                              y={topDepth * 2}
                              width="220"
                              height={thickness * 2}
                              fill={fillColor}
                              stroke="var(--color-slate-400)"
                              strokeWidth="1"
                            />
                            <text
                              x="150"
                              y={topDepth * 2 + thickness}
                              textAnchor="middle"
                              fontSize="12"
                              fontWeight="bold"
                              fill="white"
                              style={{ textShadow: '0 0 3px rgba(0,0,0,0.5)' }}
                            >
                              {hz.hzname}
                            </text>
                          </g>
                        )
                      })}
                    </svg>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Texture class legend (only show when texture is selected) */}
          {profileProperty === 'texture' && (
            <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--color-slate-200)' }}>
              <h5 className="text-sm font-bold mb-3" style={{ color: 'var(--color-charcoal-800)' }}>USDA Texture Classes:</h5>
              <div className="grid grid-cols-4 gap-3 text-xs">
                {[
                  { name: 'Sand', color: 'var(--color-sand-200)' },
                  { name: 'Loamy sand', color: 'var(--color-sand-300)' },
                  { name: 'Sandy loam', color: 'var(--color-sand-400)' },
                  { name: 'Loam', color: 'var(--color-sand-600)' },
                  { name: 'Silt loam', color: 'var(--color-earth-400)' },
                  { name: 'Silt', color: 'var(--color-earth-500)' },
                  { name: 'Sandy clay loam', color: 'var(--color-earth-600)' },
                  { name: 'Clay loam', color: 'var(--color-clay-600)' },
                  { name: 'Silty clay loam', color: 'var(--color-clay-500)' },
                  { name: 'Sandy clay', color: 'var(--color-clay-700)' },
                  { name: 'Silty clay', color: 'var(--color-clay-800)' },
                  { name: 'Clay', color: 'var(--color-clay-900)' },
                ].map((texture, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border" style={{ backgroundColor: texture.color, borderColor: 'var(--color-slate-400)' }} />
                    <span style={{ color: 'var(--color-slate-700)' }}>{texture.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Property Status Cards */}
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h3 className="mb-6 flex items-center space-x-2 text-lg font-bold" style={{ color: 'var(--color-charcoal-900)' }}>
            <Beaker className="h-5 w-5" style={{ color: 'var(--color-sunset-600)' }} />
            <span>Detailed Property Status</span>
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {propertyData.map((prop, idx) => (
              <div
                key={idx}
                className="rounded-lg border-2 p-4"
                style={{ borderColor: prop.classificationColor, backgroundColor: 'white' }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-slate-700)' }}>{prop.name}</div>
                    <div className="text-xs mb-2" style={{ color: 'var(--color-slate-500)' }}>
                      Ideal: {prop.ideal} {prop.unit}
                    </div>
                    <div 
                      className="text-xs font-semibold px-2 py-1 rounded inline-block"
                      style={{ 
                        backgroundColor: prop.classificationColor,
                        color: 'white'
                      }}
                    >
                      {prop.classification}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold" style={{ color: prop.classificationColor }}>
                      {prop.value.toFixed(prop.key === 'awc' ? 3 : 1)}
                    </div>
                    <div className="text-xs font-medium" style={{ color: 'var(--color-slate-600)' }}>
                      {prop.unit}
                    </div>
                  </div>
                </div>
                
                <div className="h-2 w-full rounded-full" style={{ backgroundColor: 'var(--color-slate-200)' }}>
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (prop.value / (prop.key === 'ph' ? 10.5 : prop.key === 'awc' ? 0.4 : 100)) * 100)}%`,
                      backgroundColor: prop.classificationColor,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Official Series Description */}
        {majorComp && (
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h3 className="mb-4 flex items-center space-x-2 text-lg font-bold" style={{ color: 'var(--color-charcoal-900)' }}>
              <FileText className="h-5 w-5" style={{ color: 'var(--color-ocean-600)' }} />
              <span>Official Series Description - {majorComp.compname}</span>
            </h3>
            {osdLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-ocean-500)' }} />
                <span className="ml-3" style={{ color: 'var(--color-slate-600)' }}>Loading description...</span>
              </div>
            ) : osdDescription ? (
              <div className="prose prose-sm max-w-none">
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--color-slate-700)' }}>
                  {osdDescription}
                </p>
              </div>
            ) : (
              <p className="text-sm italic" style={{ color: 'var(--color-slate-500)' }}>
                No official series description available for this soil.
              </p>
            )}
          </div>
        )}

        {/* Land Capability Classification */}
        {ssurgoData.components && ssurgoData.components.length > 0 && (() => {
          const lccData = LCCFormatter.formatLCCData(ssurgoData.components);
          
          if (!lccData || !lccData.components || lccData.components.length === 0) {
            return null;
          }
          
          const dominantComp = ssurgoData.components.find((c: any) => c.majcompflag === 'Yes') || ssurgoData.components[0];
          const nirrcapcl = dominantComp.nirrcapcl;
          const irrcapcl = dominantComp.irrcapcl;
          
          const nonIrrigatedClass = nirrcapcl?.toString().replace(/[a-z]/gi, '') || null;
          const nonIrrigatedSubclass = nirrcapcl?.toString().replace(/\d/g, '') || null;
          const irrigatedClass = irrcapcl?.toString().replace(/[a-z]/gi, '') || null;
          const irrigatedSubclass = irrcapcl?.toString().replace(/\d/g, '') || null;
          
          const displayClass = showIrrigatedLCC ? irrigatedClass : nonIrrigatedClass;
          const displaySubclass = showIrrigatedLCC ? irrigatedSubclass : nonIrrigatedSubclass;
          
          const classInfo = displayClass && displayClass in LAND_CAPABILITY_INTERPRETATIONS.classes 
            ? LAND_CAPABILITY_INTERPRETATIONS.classes[displayClass as '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8']
            : null;
          
          const getSeverityFromClass = (classNum: string): 'slight' | 'moderate' | 'severe' | 'very_severe' => {
            const num = parseInt(classNum);
            if (num >= 7) return 'very_severe';
            if (num >= 5) return 'severe';
            if (num >= 3) return 'moderate';
            return 'slight';
          };

          const getSeverityColors = (severity: string) => {
            const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
              'slight': { bg: 'var(--color-forest-100)', text: 'var(--color-forest-800)', icon: 'var(--color-forest-600)' },
              'moderate': { bg: 'var(--color-amber-100)', text: 'var(--color-amber-800)', icon: 'var(--color-amber-600)' },
              'severe': { bg: 'var(--color-sunset-100)', text: 'var(--color-sunset-800)', icon: 'var(--color-sunset-600)' },
              'very_severe': { bg: 'var(--color-clay-100)', text: 'var(--color-clay-800)', icon: 'var(--color-clay-600)' },
            };
            return colorMap[severity] || { bg: 'var(--color-slate-100)', text: 'var(--color-slate-800)', icon: 'var(--color-slate-600)' };
          };

          const currentSeverity = displayClass ? getSeverityFromClass(displayClass) : 'slight';
          const severityColors = getSeverityColors(currentSeverity);
          
          return (
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 flex items-center space-x-2 text-lg font-bold" style={{ color: 'var(--color-charcoal-900)' }}>
                <Shield className="h-5 w-5" style={{ color: 'var(--color-earth-600)' }} />
                <span>Land Capability Classification</span>
              </h3>
              
              {/* Toggle for Irrigated/Dryland */}
              {irrigatedClass && nonIrrigatedClass && (
                <div className="flex items-center gap-2 mb-4 p-2 rounded" style={{ backgroundColor: 'var(--color-slate-50)' }}>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-slate-700)' }}>View:</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setShowIrrigatedLCC(false)}
                      className="px-3 py-1 text-sm rounded transition-colors"
                      style={{
                        backgroundColor: !showIrrigatedLCC ? 'var(--color-earth-600)' : 'white',
                        color: !showIrrigatedLCC ? 'white' : 'var(--color-charcoal-800)',
                        border: '1px solid var(--color-slate-300)'
                      }}
                    >
                      Dryland
                    </button>
                    <button
                      onClick={() => setShowIrrigatedLCC(true)}
                      className="px-3 py-1 text-sm rounded transition-colors"
                      style={{
                        backgroundColor: showIrrigatedLCC ? 'var(--color-earth-600)' : 'white',
                        color: showIrrigatedLCC ? 'white' : 'var(--color-charcoal-800)',
                        border: '1px solid var(--color-slate-300)'
                      }}
                    >
                      Irrigated
                    </button>
                  </div>
                </div>
              )}

              {displayClass && classInfo && (
                <div className="border rounded-lg p-4 shadow-sm mb-4" style={{ borderColor: 'var(--color-slate-200)' }}>
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
                      <h4 className="text-sm font-bold mb-1" style={{ color: 'var(--color-charcoal-800)' }}>
                        {dominantComp.compname || 'Unknown'} - {dominantComp.comppct_r || 0}%
                      </h4>
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-slate-700)' }}>
                        {classInfo.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <p className="leading-relaxed" style={{ color: 'var(--color-slate-700)' }}>
                      {classInfo.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Water Management & Hydrology */}
        {majorComp && (majorComp.hydgrp || majorComp.drainagecl || majorComp.hydricrating) && (
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h3 className="mb-4 flex items-center space-x-2 text-lg font-bold" style={{ color: 'var(--color-charcoal-900)' }}>
              <Droplets className="h-5 w-5" style={{ color: 'var(--color-ocean-600)' }} />
              <span>Water Management & Hydrology</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Hydrologic Group */}
              {majorComp.hydgrp && HYDROLOGIC_GROUP_INTERPRETATIONS[majorComp.hydgrp as 'A' | 'B' | 'C' | 'D'] && (
                <div className="border rounded-lg p-4" style={{ borderColor: 'var(--color-slate-200)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold"
                      style={{ backgroundColor: getHydrologyColor(majorComp.hydgrp as 'A' | 'B' | 'C' | 'D') }}
                    >
                      {majorComp.hydgrp}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold" style={{ color: 'var(--color-charcoal-900)' }}>
                        {HYDROLOGIC_GROUP_INTERPRETATIONS[majorComp.hydgrp as 'A' | 'B' | 'C' | 'D'].name}
                      </h5>
                      <p className="text-sm" style={{ color: 'var(--color-slate-600)' }}>Hydrologic Group</p>
                    </div>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--color-slate-700)' }}>
                    {HYDROLOGIC_GROUP_INTERPRETATIONS[majorComp.hydgrp as 'A' | 'B' | 'C' | 'D'].description}
                  </p>
                </div>
              )}

              {/* Drainage Class */}
              {majorComp.drainagecl && DRAINAGE_CLASS_INTERPRETATIONS[majorComp.drainagecl as DrainageClassKey] && (
                <div className="border rounded-lg p-4" style={{ borderColor: 'var(--color-slate-200)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <Droplets 
                      className="h-8 w-8" 
                      style={{ color: getDrainageColor(majorComp.drainagecl as DrainageClassKey) }}
                    />
                    <div className="flex-1">
                      <h5 className="font-semibold" style={{ color: 'var(--color-charcoal-900)' }}>
                        {DRAINAGE_CLASS_INTERPRETATIONS[majorComp.drainagecl as DrainageClassKey].name}
                      </h5>
                      <p className="text-sm" style={{ color: 'var(--color-slate-600)' }}>Drainage Class</p>
                    </div>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--color-slate-700)' }}>
                    {DRAINAGE_CLASS_INTERPRETATIONS[majorComp.drainagecl as DrainageClassKey].description}
                  </p>
                </div>
              )}

              {/* Hydric Rating */}
              {majorComp.hydricrating && (
                <div className="border rounded-lg p-4" style={{ borderColor: 'var(--color-slate-200)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    {majorComp.hydricrating === 'Yes' ? (
                      <CheckCircle className="h-8 w-8" style={{ color: 'var(--color-ocean-600)' }} />
                    ) : (
                      <AlertTriangle className="h-8 w-8" style={{ color: 'var(--color-slate-500)' }} />
                    )}
                    <div className="flex-1">
                      <h5 className="font-semibold" style={{ color: 'var(--color-charcoal-900)' }}>
                        Hydric Soil: {majorComp.hydricrating}
                      </h5>
                      <p className="text-sm" style={{ color: 'var(--color-slate-600)' }}>Wetland Indicator</p>
                    </div>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--color-slate-700)' }}>
                    {majorComp.hydricrating === 'Yes' 
                      ? 'This soil is classified as hydric, indicating wetland conditions or frequent saturation.'
                      : 'This soil is not classified as hydric.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ecological Site Information */}
        {majorComp && majorComp.ecoclassid && (
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h3 className="mb-4 flex items-center space-x-2 text-lg font-bold" style={{ color: 'var(--color-charcoal-900)' }}>
              <Leaf className="h-5 w-5" style={{ color: 'var(--color-forest-600)' }} />
              <span>Ecological Site</span>
            </h3>
            <div className="border rounded-lg p-4" style={{ borderColor: 'var(--color-slate-200)' }}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-forest-100)' }}>
                  <Leaf className="h-6 w-6" style={{ color: 'var(--color-forest-700)' }} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1" style={{ color: 'var(--color-charcoal-900)' }}>
                    {majorComp.ecoclassname || 'Ecological Site'}
                  </h4>
                  <p className="text-sm mb-2" style={{ color: 'var(--color-slate-600)' }}>
                    ID: <span className="font-mono">{majorComp.ecoclassid}</span>
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-slate-700)' }}>
                    Ecological sites are distinctive kinds of land with specific physical characteristics that differ from other kinds of land in their ability to produce distinctive kinds and amounts of vegetation and in their response to management.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Agricultural Productivity */}
        {majorComp && (majorComp.cropprodindex !== null || majorComp.rsprod_r !== null) && (
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h3 className="mb-4 flex items-center space-x-2 text-lg font-bold" style={{ color: 'var(--color-charcoal-900)' }}>
              <Wheat className="h-5 w-5" style={{ color: 'var(--color-amber-600)' }} />
              <span>Agricultural Productivity</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {majorComp.cropprodindex !== null && majorComp.cropprodindex !== undefined && (
                <div className="border rounded-lg p-4" style={{ borderColor: 'var(--color-slate-200)' }}>
                  <Wheat className="h-6 w-6 mb-2" style={{ color: 'var(--color-forest-600)' }} />
                  <div className="text-3xl font-bold mb-1" style={{ color: 'var(--color-charcoal-900)' }}>
                    {majorComp.cropprodindex}
                  </div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-slate-700)' }}>
                    Crop Productivity Index
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-slate-600)' }}>
                    Scale: 0-100 (higher is better)
                  </p>
                </div>
              )}

              {majorComp.rsprod_r !== null && majorComp.rsprod_r !== undefined && (
                <div className="border rounded-lg p-4" style={{ borderColor: 'var(--color-slate-200)' }}>
                  <Mountain className="h-6 w-6 mb-2" style={{ color: 'var(--color-amber-600)' }} />
                  <div className="text-3xl font-bold mb-1" style={{ color: 'var(--color-charcoal-900)' }}>
                    {majorComp.rsprod_r.toLocaleString()}
                  </div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-slate-700)' }}>
                    Range Production
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-slate-600)' }}>
                    lbs/acre/year
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cropland History Section */}
        {cdlHistory && cdlHistory.length > 0 ? (
          <div className="rounded-xl border-2 bg-white p-6 shadow-lg" style={{ borderColor: 'var(--color-forest-200)', background: 'linear-gradient(to bottom right, var(--color-forest-50), var(--color-cream-50))' }}>
            <div className="flex items-start space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--color-forest-600)' }}>
                <Sprout className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-lg font-bold" style={{ color: 'var(--color-forest-900)' }}>Cropland Data Layer History</h3>
                <p className="mb-4 text-sm" style={{ color: 'var(--color-forest-700)' }}>
                  {cdlHistory.length} years of USDA NASS crop rotation data (2008-2023) showing agricultural
                  land use patterns and crop diversity.
                </p>

                <div className="mb-4 grid grid-cols-4 gap-4">
                  <div className="rounded-lg bg-white p-4">
                    <div className="mb-1 text-xs" style={{ color: 'var(--color-forest-600)' }}>Years of Data</div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--color-forest-900)' }}>{cdlHistory.length}</div>
                  </div>
                  <div className="rounded-lg bg-white p-4">
                    <div className="mb-1 text-xs" style={{ color: 'var(--color-forest-600)' }}>Unique Crops</div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--color-forest-900)' }}>
                      {new Set(cdlHistory.map(d => d.cropName)).size}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white p-4">
                    <div className="mb-1 text-xs" style={{ color: 'var(--color-forest-600)' }}>Rotation Type</div>
                    <div className="text-lg font-bold" style={{ color: 'var(--color-forest-900)' }}>
                      {(() => {
                        const uniqueCrops = new Set(cdlHistory.map(d => d.cropName)).size
                        return uniqueCrops === 1 ? 'Mono' : uniqueCrops === 2 ? '2-Crop' : 'Complex'
                      })()}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white p-4">
                    <div className="mb-1 text-xs" style={{ color: 'var(--color-forest-600)' }}>Avg Confidence</div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--color-forest-900)' }}>
                      {Math.round(
                        cdlHistory.reduce((sum, d) => sum + (d.confidence || 0), 0) / cdlHistory.length,
                      )}
                      %
                    </div>
                  </div>
                </div>

                {/* Rotation Flow Graph */}
                <div className="rounded-lg bg-white p-4">
                  <h4 className="mb-3 text-sm font-semibold" style={{ color: 'var(--color-forest-900)' }}>Crop Rotation Flow</h4>
                  <div className="relative" style={{ height: '300px' }}>
                    {/* Y-axis labels (crop names) */}
                    <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between pr-4">
                      {(() => {
                        const uniqueCrops = [...new Set(cdlHistory.map(d => d.cropName))].sort()
                        return uniqueCrops.map(crop => (
                          <div key={crop} className="text-gray-700 text-right text-xs font-medium">
                            {crop.length > 20 ? `${crop.substring(0, 20)}...` : crop}
                          </div>
                        ))
                      })()}
                    </div>

                    {/* Chart area */}
                    <div className="absolute left-40 right-0 top-0 bottom-12">
                      {/* Grid lines */}
                      <div className="absolute inset-0 flex flex-col justify-between">
                        {[...new Set(cdlHistory.map(d => d.cropName))].map((crop, idx) => (
                          <div key={idx} className="border-gray-200 border-t" />
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
                                  className="absolute left-1/2 h-4 w-4 cursor-pointer rounded-full border-2 border-white shadow-md transition-all group-hover:z-10 group-hover:scale-125"
                                  style={{
                                    backgroundColor: yearData.color,
                                    top: `${yPosition}%`,
                                    transform: 'translate(-50%, -50%)',
                                  }}
                                />
                                {/* Tooltip on hover */}
                                <div
                                  className="bg-gray-900 pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 transform whitespace-nowrap rounded px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                                  style={{ top: `${yPosition}%`, marginTop: '-40px' }}
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
                                        className="bg-emerald-300 absolute left-1/2 w-0.5 opacity-60"
                                        style={{
                                          top: `${topPos}%`,
                                          height: `${height}%`,
                                          right: '-50%',
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
                    <div className="text-gray-700 absolute left-40 right-0 bottom-0 flex justify-between text-xs font-medium">
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

                {/* Crop frequency chart */}
                <div className="mt-4 rounded-lg bg-white p-4">
                  <h4 className="mb-3 text-sm font-semibold" style={{ color: 'var(--color-forest-900)' }}>Crop Distribution</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={(() => {
                        const cropData: Record<string, { count: number; color: string }> = {}
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
                      })()}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis label={{ value: 'Years', angle: -90, position: 'insideLeft' }} />
                      <BarTooltip />
                      <Bar dataKey="years" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Recent crops timeline */}
                <div className="mt-4 rounded-lg bg-white p-4">
                  <h4 className="mb-3 text-sm font-semibold" style={{ color: 'var(--color-forest-900)' }}>Recent Years (Last 5)</h4>
                  <div className="space-y-2">
                    {/* Header row */}
                    <div className="border-gray-200 flex items-center space-x-3 border-b pb-2">
                      <span className="text-gray-600 w-12 text-xs font-semibold">Year</span>
                      <span className="text-gray-600 w-6 text-xs font-semibold">Type</span>
                      <span className="text-gray-600 flex-1 text-xs font-semibold">Crop</span>
                      <span className="text-gray-600 text-xs font-semibold">Estimated Confidence</span>
                    </div>
                    {cdlHistory
                      .slice(-5)
                      .reverse()
                      .map(yearData => (
                        <div key={yearData.year} className="flex items-center space-x-3">
                          <span className="text-gray-700 w-12 text-xs font-bold">{yearData.year}</span>
                          {yearData.cropType && (
                            <span
                              className={`rounded px-1.5 py-0.5 text-xs font-bold ${
                                yearData.cropType === 'annual'
                                  ? 'bg-ocean-100 text-ocean-800'
                                  : yearData.cropType === 'perennial'
                                  ? 'bg-lavender-100 text-lavender-800'
                                  : yearData.cropType === 'permanent'
                                  ? 'bg-clay-100 text-clay-800'
                                  : yearData.cropType === 'pasture'
                                  ? 'bg-forest-100 text-forest-800'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {yearData.cropType === 'annual'
                                ? 'A'
                                : yearData.cropType === 'perennial'
                                ? 'P'
                                : yearData.cropType === 'permanent'
                                ? '🌳'
                                : yearData.cropType === 'pasture'
                                ? '🌾'
                                : '?'}
                            </span>
                          )}
                          <div className="flex flex-1 items-center space-x-2">
                            <div
                              className="border-gray-300 h-4 w-4 rounded border"
                              style={{ backgroundColor: yearData.color }}
                            />
                            <span className="text-gray-900 text-sm">{yearData.cropName}</span>
                          </div>
                          {yearData.confidence && (
                            <span
                              className={`rounded px-2 py-0.5 text-xs font-semibold ${
                                yearData.confidence >= 80
                                  ? 'bg-forest-100 text-forest-800'
                                  : yearData.confidence >= 50
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-clay-100 text-clay-800'
                              }`}
                            >
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
          <div className="rounded-xl border-2 bg-white p-6 shadow-lg" style={{ borderColor: 'var(--color-slate-200)', background: 'linear-gradient(to bottom right, var(--color-slate-50), var(--color-cream-50))' }}>
            <div className="flex items-start space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--color-slate-400)' }}>
                <Sprout className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-lg font-bold" style={{ color: 'var(--color-charcoal-900)' }}>Cropland Data Layer History</h3>
                <p className="mb-4 text-sm" style={{ color: 'var(--color-slate-700)' }}>
                  Click on the map to query USDA NASS Cropland Data Layer history for this location. View 16
                  years of crop rotation patterns and agricultural land use.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between text-sm" style={{ color: 'var(--color-slate-600)' }}>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <span>
                  Map Unit Key:{' '}
                  <span className="font-mono font-medium" style={{ color: 'var(--color-charcoal-900)' }}>{ssurgoData.mukey}</span>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>
                  {ssurgoData.coordinates[0].toFixed(4)}, {ssurgoData.coordinates[1].toFixed(4)}
                </span>
              </div>
            </div>
            <div style={{ color: 'var(--color-slate-500)' }}>Generated: {new Date().toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
