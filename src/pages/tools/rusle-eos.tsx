// ============================================================================
// RUSLE-EOS (RUSLE Earth Observation System)
// ============================================================================
// Next-generation erosion assessment combining traditional RUSLE methodology
// with real-time satellite imagery and Google Earth Engine processing.

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import {
  Mountain,
  MapPin,
  Calendar,
  Layers,
  TrendingDown,
  Shield,
  DollarSign,
  FileText,
  AlertTriangle,
  CheckCircle,
  Info,
  Download,
  BarChart,
  Waves,
  Leaf,
  Grid,
  Droplets,
  Clipboard,
} from 'lucide-react'
import { useRUSLECalculation } from '#hooks/useRUSLECalculation'
import type { RUSLEResponse, ScenarioResult } from '#types/geeApi'
import { geoJsonToWkt } from '#utils/geoJsonToWkt'

// ============================================================================
// Conservation Practices Data
// ============================================================================

interface ConservationPractice {
  id: string
  name: string
  description: string
  pFactor: number
  effectivenessPercent: number
  costPerAcre: { low: number; typical: number; high: number }
  suitability: string[]
  type: 'none' | 'contour_farming' | 'strip_cropping' | 'terracing' | 'grassed_waterway' | 'cover_crop'
}

const CONSERVATION_PRACTICES: ConservationPractice[] = [
  {
    id: 'none',
    name: 'No Conservation Practices',
    description: 'Current baseline without conservation',
    pFactor: 1.0,
    effectivenessPercent: 0,
    costPerAcre: { low: 0, typical: 0, high: 0 },
    suitability: [],
    type: 'none',
  },
  {
    id: 'contour',
    name: 'Contour Farming',
    description: 'Plowing and planting across the slope rather than up and down',
    pFactor: 0.5,
    effectivenessPercent: 50,
    costPerAcre: { low: 30, typical: 50, high: 70 },
    suitability: ['Slopes 2-8%', 'Row crops', 'Annual crops'],
    type: 'contour_farming',
  },
  {
    id: 'strip_cropping',
    name: 'Strip Cropping',
    description: 'Alternating strips of row crops with close-growing crops',
    pFactor: 0.3,
    effectivenessPercent: 70,
    costPerAcre: { low: 20, typical: 30, high: 50 },
    suitability: ['Slopes 2-12%', 'Mixed cropping systems'],
    type: 'strip_cropping',
  },
  {
    id: 'terracing',
    name: 'Terracing',
    description: 'Earth embankments constructed across the slope',
    pFactor: 0.1,
    effectivenessPercent: 90,
    costPerAcre: { low: 300, typical: 500, high: 800 },
    suitability: ['Slopes >8%', 'Long-term investment'],
    type: 'terracing',
  },
  {
    id: 'grassed_waterway',
    name: 'Grassed Waterway',
    description: 'Natural or constructed channels with erosion-resistant grass cover',
    pFactor: 0.2,
    effectivenessPercent: 80,
    costPerAcre: { low: 150, typical: 250, high: 400 },
    suitability: ['Concentrated flow areas', 'Natural drainage paths', 'Gully prevention'],
    type: 'grassed_waterway',
  },
  {
    id: 'cover_crop',
    name: 'Cover Crops',
    description: 'Crops planted primarily to manage soil health and erosion',
    pFactor: 0.4,
    effectivenessPercent: 60,
    costPerAcre: { low: 25, typical: 45, high: 75 },
    suitability: ['All slopes', 'Between cash crops', 'Soil health improvement'],
    type: 'cover_crop',
  },
]

// ============================================================================
// Main Component
// ============================================================================

export default function RUSLEEOSCalculator() {
  const router = useRouter()
  const { fieldId } = router.query

  // State
  const [selectedField, setSelectedField] = useState<string | null>(
    fieldId as string || null
  )
  const [fieldGeometry, setFieldGeometry] = useState<any>(null)
  const [fieldAcres, setFieldAcres] = useState<number>(0)
  const [startDate, setStartDate] = useState('2023-01-01')
  const [endDate, setEndDate] = useState('2023-12-31')
  const [selectedPractice, setSelectedPractice] = useState<ConservationPractice>(
    CONSERVATION_PRACTICES[0]
  )
  const [showComparison, setShowComparison] = useState(false)
  const [activeTab, setActiveTab] = useState<'results' | 'scenarios'>('results')
  const [selectedFactorMap, setSelectedFactorMap] = useState<'soil_loss' | 'r' | 'k' | 'ls' | 'c' | 'p'>('soil_loss')
  const [debugMode, setDebugMode] = useState(false)

  // Hooks
  const { result, loading, error, calculate, compareScenarios, reset } =
    useRUSLECalculation()

  // ============================================================================
  // Effects
  // ============================================================================

  // Load field data from sessionStorage when returning from field-analysis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rusleFieldData = sessionStorage.getItem('rusleSelectedField')
      if (rusleFieldData) {
        try {
          const fieldData = JSON.parse(rusleFieldData)
          setSelectedField(fieldData.clu_id || fieldData.csb_id || 'Selected Field')
          setFieldGeometry(fieldData.geometry) // Store as object
          setFieldAcres(fieldData.acres || 0)
          
          // Clear the sessionStorage
          sessionStorage.removeItem('rusleSelectedField')
        } catch (err) {
          console.error('Error loading field data:', err)
        }
      }
    }
  }, [])

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleFieldSelect = (field: any) => {
    setSelectedField(field.clu_id)
    setFieldGeometry(field.geometry) // Store as object
    setFieldAcres(field.acres)
  }

  const handleCalculate = async () => {
    if (!fieldGeometry) {
      alert('Please select a field first')
      return
    }

    try {
      // Convert GeoJSON to WKT format
      console.log('[RUSLE] Field geometry:', fieldGeometry)
      const wkt = geoJsonToWkt(fieldGeometry)
      
      // Validate WKT
      if (!wkt || wkt.trim().length === 0 || !wkt.startsWith('POLYGON')) {
        alert('Invalid field geometry. Please select a different field.')
        return
      }
      
      console.log('[RUSLE] Converted WKT:', wkt)
      
      // Validate dates
      const startDateObj = new Date(startDate)
      const endDateObj = new Date(endDate)
      
      if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
        alert('Invalid date format. Please select valid dates.')
        return
      }
      
      if (startDateObj >= endDateObj) {
        alert('Start date must be before end date.')
        return
      }
      
      // Parse year from end date and validate
      const yearValue = endDateObj.getFullYear()
      if (!yearValue || isNaN(yearValue) || yearValue < 2010 || yearValue > 2024) {
        alert(`Invalid year: ${yearValue}. Please select a date between 2010-2024.`)
        return
      }
      
      // Warn if using 2024 (CDL data may be incomplete)
      if (yearValue === 2024) {
        const proceed = confirm(
          'Warning: 2024 CDL (Cropland Data Layer) data may be incomplete or unavailable.\n\n' +
          'For best results, use 2023 or earlier.\n\n' +
          'Continue with 2024?'
        )
        if (!proceed) return
      }
      
      // Build request with all features enabled
      const request: RUSLECalculateRequest = {
        wkt: wkt.trim(),
        start_date: startDate,
        end_date: endDate,
        year: yearValue,
        conservation_practices: [selectedPractice.type],
        detect_terraces: selectedPractice.type === 'terracing',
        detect_contours: selectedPractice.type === 'contour_farming',
        use_multiyear_r_factor: true,
        include_scenarios: true,
        include_factor_maps: true,
        include_events: true,
      }
      
      console.log('[RUSLE] Calculating with request:', request)


      await calculate(request)
    } catch (err: any) {
      console.error('Calculation error:', err)
      
      // Extract detailed error message
      let errorMsg = 'Failed to calculate erosion. Please try again.'
      
      if (err?.data?.detail) {
        if (Array.isArray(err.data.detail)) {
          errorMsg = err.data.detail.map((e: any) => 
            `${e.loc?.join('.') || 'Error'}: ${e.msg}`
          ).join('\n')
        } else if (typeof err.data.detail === 'string') {
          errorMsg = err.data.detail
        } else {
          errorMsg = JSON.stringify(err.data.detail, null, 2)
        }
      } else if (err?.message) {
        errorMsg = err.message
      }
      
      // Check if it's the known backend null handling bug
      if (errorMsg.includes('Number.gt') && errorMsg.includes('null')) {
        const errorContext = `Backend GEE API Error

${errorMsg}

This is a known issue with the backend's factor calculation services (K-factor, LS-factor, or C-factor). The backend is passing null values to Google Earth Engine comparison operations.

Possible workarounds:
• Try a different field (especially from Iowa or Illinois)
• Try changing the date range to a full calendar year
• The backend team needs to implement null handling fixes

See RUSLE_GEE_API_TROUBLESHOOTING.md for technical details.`
        
        alert(errorContext)
      } else {
        alert('Calculation Error:\n\n' + errorMsg)
      }
    }
  }

  const handleCompareScenarios = () => {
    // Baseline is already available from the multi-scenario API response
    setShowComparison(true)
  }

  const handleReset = () => {
    reset()
    setShowComparison(false)
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F1E8' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #4A7C9E 0%, #345770 100%)' }} className="text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Mountain className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">RUSLE-EOS</h1>
                <p style={{ color: '#BDD7E5' }}>
                  RUSLE Earth Observation System - Satellite-Assisted Erosion Assessment
                </p>
              </div>
            </div>
            {selectedField && (
              <div className="text-right">
                <p className="text-sm" style={{ color: '#BDD7E5' }}>Selected Field</p>
                <p className="text-lg font-semibold">{selectedField}</p>
                <p className="text-sm" style={{ color: '#BDD7E5' }}>{fieldAcres.toFixed(1)} acres</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {!result ? (
          /* ===== CONDENSED INPUT FORM ===== */
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Erosion Analysis Setup</h2>
              
              {/* Condensed 3-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Field Selection */}
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center" style={{ color: '#3E4A4A' }}>
                    <MapPin className="w-4 h-4 mr-1" style={{ color: '#4A7C9E' }} />
                    Field
                  </label>
                  {!selectedField ? (
                    <button
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          sessionStorage.setItem('returnToRUSLE', 'true')
                          sessionStorage.removeItem('returnToPlanningWizard')
                        }
                        router.push('/field-analysis')
                      }}
                      className="w-full px-4 py-3 border-2 border-dashed rounded-lg transition-all text-gray-600"
                      style={{ borderColor: '#D8DBDB' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#4A7C9E'
                        e.currentTarget.style.backgroundColor = '#F0F6F9'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#D8DBDB'
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      Select Field
                    </button>
                  ) : (
                    <div className="relative">
                      <div className="flex items-center justify-between p-3 border-2 rounded-lg" style={{ backgroundColor: '#F2F6F2', borderColor: '#C7D9C6' }}>
                        <div className="flex-1">
                          <p className="font-semibold text-sm" style={{ color: '#2C2C31' }}>{selectedField}</p>
                          <p className="text-xs" style={{ color: '#5C6C6C' }}>{fieldAcres.toFixed(1)} acres</p>
                        </div>
                        <CheckCircle className="w-5 h-5" style={{ color: '#5C8D5A' }} />
                      </div>
                      <button
                        onClick={() => {
                          setSelectedField(null)
                          setFieldGeometry(null)
                          handleReset()
                        }}
                        className="text-xs mt-1 hover:underline"
                        style={{ color: '#4A7C9E' }}
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center" style={{ color: '#3E4A4A' }}>
                    <Calendar className="w-4 h-4 mr-1" style={{ color: '#4A7C9E' }} />
                    Analysis Period
                  </label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#BFC4C4', backgroundColor: '#FCFAF6' }}
                      onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px #BDD7E5'}
                      onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                    />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#BFC4C4', backgroundColor: '#FCFAF6' }}
                      onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px #BDD7E5'}
                      onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                    />
                  </div>
                </div>

                {/* Conservation Practice */}
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center" style={{ color: '#3E4A4A' }}>
                    <Shield className="w-4 h-4 mr-1" style={{ color: '#5C8D5A' }} />
                    Conservation Practice
                  </label>
                  <select
                    value={selectedPractice.id}
                    onChange={(e) => {
                      const practice = CONSERVATION_PRACTICES.find(p => p.id === e.target.value)
                      if (practice) setSelectedPractice(practice)
                    }}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#BFC4C4', backgroundColor: '#FCFAF6' }}
                    onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px #BDD7E5'}
                    onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                  >
                    {CONSERVATION_PRACTICES.map((practice) => (
                      <option key={practice.id} value={practice.id}>
                        {practice.name} (P={practice.pFactor})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs mt-2" style={{ color: '#5C6C6C' }}>
                    {selectedPractice.description}
                  </p>
                  <p className="text-xs font-medium mt-1" style={{ color: '#5C8D5A' }}>
                    {selectedPractice.effectivenessPercent}% reduction
                    {selectedPractice.costPerAcre.typical > 0 && 
                      ` • $${selectedPractice.costPerAcre.typical}/ac`
                    }
                  </p>
                </div>
              </div>

              {/* Calculate Button */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleCalculate}
                  disabled={!selectedField || loading}
                  className="flex-1 py-4 rounded-lg font-semibold text-white transition-all shadow-lg"
                  style={{
                    background: !selectedField || loading 
                      ? '#A1A9A9' 
                      : 'linear-gradient(135deg, #4A7C9E 0%, #345770 100%)',
                    cursor: !selectedField || loading ? 'not-allowed' : 'pointer',
                    opacity: !selectedField || loading ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!(!selectedField || loading)) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #3F6A87 0%, #294559 100%)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!(!selectedField || loading)) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #4A7C9E 0%, #345770 100%)'
                    }
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Calculating with GEE (70-100s)...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Mountain className="w-5 h-5" />
                      Calculate Erosion & Multi-Scenario Analysis
                    </span>
                  )}
                </button>
                
                {selectedField && !loading && (
                  <div className="text-sm px-4 py-2 rounded-lg" style={{ backgroundColor: '#F0F6F9', color: '#345770' }}>
                    <Info className="w-4 h-4 inline mr-1" style={{ color: '#4A7C9E' }} />
                    Full calendar year recommended
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 rounded-lg p-4 border" style={{ backgroundColor: '#FDF7F6', borderColor: '#F1D7D5' }}>
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 mr-3 mt-0.5" style={{ color: '#A0453D' }} />
                    <div className="flex-1">
                      <h3 className="font-semibold" style={{ color: '#5F2A25' }}>Calculation Error</h3>
                      <p className="text-sm mt-1" style={{ color: '#8B3C35' }}>{error}</p>
                      
                      {error.includes('Number.gt') && (
                        <div className="mt-3 p-3 rounded" style={{ backgroundColor: '#FDF7F6', borderColor: '#E6BCB9' }}>
                          <p className="text-xs font-bold mb-2" style={{ color: '#A0453D' }}>
                            ⚠️ BACKEND GEE API BUG - Server Issue
                          </p>
                          <p className="text-xs mb-3" style={{ color: '#8B3C35' }}>
                            The GEE backend Python code is passing null values to Earth Engine. 
                            This is NOT a frontend issue - the backend needs to be fixed.
                          </p>
                          <div className="border-t pt-2 mt-2" style={{ borderColor: '#F1D7D5' }}>
                            <p className="text-xs font-semibold mb-1" style={{ color: '#75332D' }}>
                              IMMEDIATE WORKAROUND:
                            </p>
                            <ol className="text-xs space-y-1 ml-4 list-decimal" style={{ color: '#8B3C35' }}>
                              <li>✅ Enable "Emergency Fallback Mode" above</li>
                              <li>Select a different field (preferably Iowa)</li>
                              <li>Click Calculate again</li>
                            </ol>
                          </div>
                          <div className="border-t pt-2 mt-3" style={{ borderColor: '#F1D7D5' }}>
                            <p className="text-xs font-semibold mb-1" style={{ color: '#75332D' }}>
                              FOR BACKEND TEAM:
                            </p>
                            <p className="text-xs" style={{ color: '#8B3C35' }}>
                              See <code className="bg-white px-1 rounded">RUSLE_GEE_API_TROUBLESHOOTING.md</code> for Python fixes needed in c_factor.py, ls_factor.py, or rusle.py
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!loading && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center mt-6">
                <Layers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Ready to Calculate
                </h3>
                <p className="text-gray-600">
                  Select a field and click "Calculate" to perform comprehensive RUSLE erosion analysis
                  with multi-scenario comparison powered by Google Earth Engine.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* ===== SPLIT-SCREEN RESULTS VIEW ===== */
          <div className="flex flex-col h-[calc(100vh-180px)]">
            {/* Tabs */}
            <div className="flex items-center justify-between mb-4 bg-white rounded-lg shadow-md p-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('results')}
                  className="px-6 py-2 rounded-lg font-medium transition-all"
                  style={{
                    backgroundColor: activeTab === 'results' ? '#4A7C9E' : 'transparent',
                    color: activeTab === 'results' ? 'white' : '#5C6C6C',
                    boxShadow: activeTab === 'results' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== 'results') e.currentTarget.style.backgroundColor = '#EDEEEE'
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== 'results') e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  Results & Maps
                </button>
                <button
                  onClick={() => setActiveTab('scenarios')}
                  className="px-6 py-2 rounded-lg font-medium transition-all"
                  style={{
                    backgroundColor: activeTab === 'scenarios' ? '#8B7AA8' : 'transparent',
                    color: activeTab === 'scenarios' ? 'white' : '#5C6C6C',
                    boxShadow: activeTab === 'scenarios' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== 'scenarios') e.currentTarget.style.backgroundColor = '#EDEEEE'
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== 'scenarios') e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  Scenario Comparison
                </button>
              </div>
              
              <button
                onClick={() => {
                  handleReset()
                  setActiveTab('results')
                }}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
              >
                New Analysis
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'results' ? (
              <SplitScreenResults 
                result={result} 
                fieldAcres={fieldAcres}
                fieldGeometry={fieldGeometry}
                selectedFactorMap={selectedFactorMap}
                setSelectedFactorMap={setSelectedFactorMap}
              />
            ) : (
              <ScenarioComparisonTab 
                result={result}
                fieldAcres={fieldAcres}
                selectedPractice={selectedPractice}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Split-Screen Results Component
// ============================================================================

interface SplitScreenResultsProps {
  result: RUSLEResponse
  fieldAcres: number
  fieldGeometry: any
  selectedFactorMap: 'soil_loss' | 'r' | 'k' | 'ls' | 'c' | 'p'
  setSelectedFactorMap: (map: 'soil_loss' | 'r' | 'k' | 'ls' | 'c' | 'p') => void
}

function SplitScreenResults({ result, fieldAcres, fieldGeometry, selectedFactorMap, setSelectedFactorMap }: SplitScreenResultsProps) {
  // Listen for factor selection events from the interactive equation
  useEffect(() => {
    const handleFactorSelection = (event: any) => {
      const factor = event.detail
      if (factor && ['r', 'k', 'ls', 'c', 'p', 'soil_loss'].includes(factor)) {
        setSelectedFactorMap(factor as any)
      }
    }

    window.addEventListener('selectFactor', handleFactorSelection)
    return () => window.removeEventListener('selectFactor', handleFactorSelection)
  }, [setSelectedFactorMap])

  return (
    <div className="flex flex-1 gap-4 overflow-hidden">
      {/* Left Panel - Factor Details */}
      <div className="w-96 bg-white rounded-lg shadow-md overflow-y-auto flex-shrink-0">
        <div className="p-6">
          <FactorDetailsPanel 
            result={result} 
            fieldAcres={fieldAcres}
            selectedFactorMap={selectedFactorMap}
          />
        </div>
      </div>

      {/* Right Panel - Map */}
      <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden">
        <ComprehensiveMapGalleryFullScreen 
          result={result} 
          fieldGeometry={fieldGeometry}
          selectedFactorMap={selectedFactorMap}
          setSelectedFactorMap={setSelectedFactorMap}
        />
      </div>
    </div>
  )
}

// ============================================================================
// Scenario Comparison Tab
// ============================================================================

interface ScenarioComparisonTabProps {
  result: RUSLEResponse
  fieldAcres: number
  selectedPractice: ConservationPractice
}

function ScenarioComparisonTab({ result, fieldAcres, selectedPractice }: ScenarioComparisonTabProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Baseline Comparison */}
        {result.baseline && (
          <ScenarioComparisonCard
            baseline={result.baseline}
            proposed={result}
            fieldAcres={fieldAcres}
            proposedPractice={selectedPractice}
          />
        )}

        {/* All Scenarios Explorer */}
        {result.scenarios && result.scenarios.length > 0 && (
          <AllScenariosExplorerCard result={result} />
        )}

        {/* Recommendations */}
        <RecommendationsCard result={result} />
      </div>
    </div>
  )
}

// ============================================================================
// Interactive Factor Equation Component
// ============================================================================

interface FactorBubbleProps {
  value: number
  letter: string
  color: string
  unit?: string
  onClick?: () => void
}

function FactorBubble({ value, letter, color, unit, onClick }: FactorBubbleProps) {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: '#DCE9F1', text: '#345770', border: '#4A7C9E' },
    yellow: { bg: '#F5F1EB', text: '#856436', border: '#D4A574' },
    purple: { bg: '#DDD7EA', text: '#564D66', border: '#8B7AA8' },
    green: { bg: '#E2EBE1', text: '#355433', border: '#5C8D5A' },
    orange: { bg: '#F3EAE2', text: '#70462B', border: '#B8794F' },
  }

  const colors = colorMap[color] || colorMap.blue

  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg p-2"
      style={{
        backgroundColor: colors.bg,
        border: `2px solid ${colors.border}`,
        minWidth: '60px',
      }}
    >
      <span className="text-xs font-medium" style={{ color: colors.text }}>
        {letter}
      </span>
      <span className="text-lg font-bold" style={{ color: colors.text }}>
        {value < 1 ? value.toFixed(2) : value.toFixed(1)}
      </span>
      {unit && <span className="text-[10px]" style={{ color: colors.text }}>{unit}</span>}
    </div>
  )
}

function InteractiveFactorEquation({ result, onFactorClick }: { result: RUSLEResponse; onFactorClick: (factor: string) => void }) {
  const X = ({ className = "" }: { className?: string }) => (
    <svg className={`w-4 h-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
  
  const Equal = ({ className = "" }: { className?: string }) => (
    <span className={`text-2xl font-bold ${className}`}>=</span>
  )

  return (
    <div className="rounded-lg p-4 mb-4" style={{ background: 'linear-gradient(135deg, #F6F8F7 0%, #EBF0ED 100%)' }}>
      <p className="text-xs font-medium mb-3" style={{ color: '#5C6C6C' }}>RUSLE EQUATION</p>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <FactorBubble value={result.r_factor.factor_value} letter="R" color="blue" />
        <X style={{ color: '#6B7D7D' }} />
        <FactorBubble value={result.k_factor.factor_value} letter="K" color="yellow" />
        <X style={{ color: '#6B7D7D' }} />
        <FactorBubble value={result.ls_factor.factor_value} letter="LS" color="purple" />
        <X style={{ color: '#6B7D7D' }} />
        <FactorBubble value={result.c_factor.factor_value} letter="C" color="green" />
        <X style={{ color: '#6B7D7D' }} />
        <FactorBubble value={result.p_factor.factor_value} letter="P" color="orange" />
        <Equal style={{ color: '#6B7D7D' }} />
        <div className="flex flex-col items-center justify-center rounded-lg p-3" style={{ backgroundColor: '#FDF7F6', border: '3px solid #A0453D', minWidth: '80px' }}>
          <span className="text-xs font-medium" style={{ color: '#5F2A25' }}>Soil Loss</span>
          <span className="text-2xl font-bold" style={{ color: '#A0453D' }}>
            {result.soil_loss_rate_tons_acre_yr.toFixed(1)}
          </span>
          <span className="text-[10px]" style={{ color: '#8B3C35' }}>t/ac/yr</span>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Risk Interpretation Scale Component
// ============================================================================

function RiskInterpretationScale({ soilLoss, tValue }: { soilLoss: number; tValue: number }) {
  const maxScale = 15 // tons/ac/yr
  const position = Math.min((soilLoss / maxScale) * 100, 100)
  const tPosition = tValue ? Math.min((tValue / maxScale) * 100, 100) : 0
  
  // Determine risk category
  const getRiskCategory = (value: number) => {
    if (value <= 2) return { level: 'Low Risk', color: '#5C8D5A', icon: '✓' }
    if (value <= 5) return { level: 'Moderate Risk', color: '#D4A853', icon: '!' }
    if (value <= 10) return { level: 'High Risk', color: '#B8794F', icon: '⚠' }
    return { level: 'Severe Risk', color: '#A0453D', icon: '✕' }
  }
  
  const riskInfo = getRiskCategory(soilLoss)
  const exceedsT = tValue && soilLoss > tValue

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold" style={{ color: '#3E4A4A' }}>Erosion Risk Assessment</p>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg shadow-sm" style={{ backgroundColor: riskInfo.color + '15', border: `2px solid ${riskInfo.color}` }}>
          <span className="text-lg">{riskInfo.icon}</span>
          <span className="text-sm font-bold" style={{ color: riskInfo.color }}>{riskInfo.level}</span>
        </div>
      </div>
      
      <div className="relative pt-14 pb-14">
        {/* Current field value indicator with arrow pointer */}
        <div 
          className="absolute top-0 transition-all duration-500 z-20"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        >
          <div className="flex flex-col items-center gap-1">
            <div className="px-2 py-1 rounded-md shadow-lg font-semibold text-white text-xs whitespace-nowrap" style={{ backgroundColor: '#2C2C31' }}>
              {soilLoss.toFixed(1)} t/ac/yr
            </div>
            <div className="h-3 w-0.5" style={{ backgroundColor: '#2C2C31' }}></div>
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px]" style={{ borderTopColor: '#2C2C31' }}></div>
          </div>
        </div>
        
        {/* Scale bar with zones */}
        <div className="relative h-12 rounded-lg overflow-hidden flex shadow-lg border-2" style={{ borderColor: '#E5E7EB' }}>
          <div className="relative flex-[2] flex flex-col items-center justify-center text-xs font-semibold text-white z-10" style={{ backgroundColor: '#5C8D5A' }}>
            <span className="relative z-30">Low</span>
            <span className="relative z-30 text-[10px] opacity-90">0-2</span>
          </div>
          <div className="relative flex-[3] flex flex-col items-center justify-center text-xs font-semibold text-white z-10" style={{ backgroundColor: '#D4A853' }}>
            <span className="relative z-30">Moderate</span>
            <span className="relative z-30 text-[10px] opacity-90">2-5</span>
          </div>
          <div className="relative flex-[5] flex flex-col items-center justify-center text-xs font-semibold text-white z-10" style={{ backgroundColor: '#B8794F' }}>
            <span className="relative z-30">High</span>
            <span className="relative z-30 text-[10px] opacity-90">5-10</span>
          </div>
          <div className="relative flex-[5] flex flex-col items-center justify-center text-xs font-semibold text-white z-10" style={{ backgroundColor: '#A0453D' }}>
            <span className="relative z-30">Severe</span>
            <span className="relative z-30 text-[10px] opacity-90">&gt;10</span>
          </div>
          
          {/* Vertical bar marker for current soil loss value */}
          <div 
            className="absolute top-0 h-full w-1.5 transition-all duration-500 shadow-lg opacity-70"
            style={{ left: `${position}%`, backgroundColor: '#2C2C31', transform: 'translateX(-50%)', zIndex: 15 }}
          ></div>
          
          {/* Vertical bar marker for T-value */}
          {tValue && tValue < maxScale && (
            <div 
              className="absolute top-0 h-full w-1.5 transition-all duration-500 shadow-lg opacity-70"
              style={{ left: `${tPosition}%`, backgroundColor: '#4A7C9E', transform: 'translateX(-50%)', zIndex: 15 }}
            ></div>
          )}
        </div>
        
        {/* T-value threshold line with arrow pointer */}
        {tValue && tValue < maxScale && (
          <div 
            className="absolute bottom-0 transition-all duration-500 z-5"
            style={{ left: `${tPosition}%`, transform: 'translateX(-50%)' }}
          >
            <div className="flex flex-col items-center gap-1">
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px]" style={{ borderBottomColor: '#4A7C9E' }}></div>
              <div className="h-3 w-0.5" style={{ backgroundColor: '#4A7C9E' }}></div>
              <div className="px-2 py-1 rounded-md shadow-lg font-semibold text-white text-xs whitespace-nowrap" style={{ backgroundColor: '#4A7C9E' }}>
                T-value: {tValue.toFixed(1)} t/ac/yr
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Interpretation text */}
      <div className="mt-2 p-3 rounded-lg" style={{ backgroundColor: exceedsT ? '#FEF3C7' : '#F0F9FF' }}>
        <p className="text-xs leading-relaxed" style={{ color: '#3E4A4A' }}>
          {exceedsT ? (
            <>
              <span className="font-bold" style={{ color: '#A0453D' }}>⚠ Exceeds sustainable threshold:</span> Your field's erosion rate of <strong>{soilLoss.toFixed(1)} t/ac/yr</strong> is above the T-value of <strong>{tValue.toFixed(1)} t/ac/yr</strong>. Conservation practices are strongly recommended to prevent long-term soil degradation.
            </>
          ) : (
            <>
              <span className="font-bold" style={{ color: '#5C8D5A' }}>✓ Within sustainable threshold:</span> Your field's erosion rate of <strong>{soilLoss.toFixed(1)} t/ac/yr</strong> is at or below the T-value of <strong>{tValue.toFixed(1)} t/ac/yr</strong>, indicating sustainable soil management.
            </>
          )}
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// Factor Details Panel (Left Side)
// ============================================================================

interface FactorDetailsPanelProps {
  result: RUSLEResponse
  fieldAcres: number
  selectedFactorMap: string
}

function FactorDetailsPanel({ result, fieldAcres, selectedFactorMap }: FactorDetailsPanelProps) {
  const [showHelp, setShowHelp] = React.useState<string | null>(null)
  
  // Map overview
  if (selectedFactorMap === 'soil_loss') {
    const tValue = result.scenario_comparison?.t_value_used || result.p_factor.uncertainty?.p_factor_range?.max || 5.0
    
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#2C2C31' }}>Soil Loss Analysis</h2>
          <p className="text-sm" style={{ color: '#5C6C6C' }}>
            Total annual soil erosion across your field
          </p>
        </div>

        <RUSLEResultsCard result={result} fieldAcres={fieldAcres} />
        
        <InteractiveFactorEquation 
          result={result} 
          onFactorClick={(factor) => {
            // This will be handled by parent component
            const factorMap = { r: 'r', k: 'k', ls: 'ls', c: 'c', p: 'p' }
            const event = new CustomEvent('selectFactor', { detail: factorMap[factor as keyof typeof factorMap] })
            window.dispatchEvent(event)
          }} 
        />

        <RiskInterpretationScale soilLoss={result.soil_loss_rate_tons_acre_yr} tValue={tValue} />

        <RFactorTimeseriesChart result={result} />
      </div>
    )
  }

  // Individual factor details
  const factorData = {
    r: {
      title: 'R-Factor',
      name: 'Rainfall Erosivity',
      factor: result.r_factor,
      description: 'Measures the erosive power of rainfall based on intensity and duration of storms.',
      interpretation: `Mean R-factor of ${result.r_factor.factor_value.toFixed(0)} indicates ${
        result.r_factor.factor_value > 1500 ? 'high' : result.r_factor.factor_value > 1000 ? 'moderate' : 'low'
      } rainfall erosivity for your region.`,
    },
    k: {
      title: 'K-Factor',
      name: 'Soil Erodibility',
      factor: result.k_factor,
      description: 'Represents soil\'s susceptibility to erosion based on texture, organic matter, and structure.',
      interpretation: `K-factor of ${result.k_factor.factor_value.toFixed(3)} indicates ${
        result.k_factor.factor_value > 0.3 ? 'highly erodible' : result.k_factor.factor_value > 0.2 ? 'moderately erodible' : 'resistant'
      } soil.`,
    },
    ls: {
      title: 'LS-Factor',
      name: 'Slope Length & Steepness',
      factor: result.ls_factor,
      description: 'Topographic factor combining slope length (L) and slope steepness (S).',
      interpretation: `LS-factor of ${result.ls_factor.factor_value.toFixed(2)} with ${
        result.ls_factor.mean_slope_percent?.toFixed(1)
      }% mean slope.`,
    },
    c: {
      title: 'C-Factor',
      name: 'Cover Management',
      factor: result.c_factor,
      description: 'Reflects vegetation and crop management effects on erosion rates.',
      interpretation: `C-factor of ${result.c_factor.factor_value.toFixed(3)} with ${
        result.c_factor.vegetation_cover_percent?.toFixed(0)
      }% vegetation cover.`,
    },
    p: {
      title: 'P-Factor',
      name: 'Support Practice',
      factor: result.p_factor,
      description: 'Accounts for conservation practices like contouring, terracing, and strip cropping.',
      interpretation: `P-factor of ${result.p_factor.factor_value.toFixed(2)} achieving ${
        result.p_factor.erosion_reduction_percent
      }% erosion reduction.`,
    },
  }

  const currentFactor = factorData[selectedFactorMap as keyof typeof factorData]
  if (!currentFactor) return null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentFactor.name}</h2>
        <p className="text-sm text-gray-600">{currentFactor.description}</p>
      </div>

      {/* Factor Value */}
      <div className="border-2 rounded-lg p-6" style={{
        background: selectedFactorMap === 'r' ? 'linear-gradient(135deg, #DCE9F1 0%, #BDD7E5 100%)' :
                   selectedFactorMap === 'k' ? 'linear-gradient(135deg, #F5F1EB 0%, #EDE6D9 100%)' :
                   selectedFactorMap === 'ls' ? 'linear-gradient(135deg, #EFECF5 0%, #DDD7EA 100%)' :
                   selectedFactorMap === 'c' ? 'linear-gradient(135deg, #E2EBE1 0%, #C7D9C6 100%)' :
                   'linear-gradient(135deg, #F3EAE2 0%, #E9D7C7 100%)',
        borderColor: selectedFactorMap === 'r' ? '#4A7C9E' :
                    selectedFactorMap === 'k' ? '#D4A574' :
                    selectedFactorMap === 'ls' ? '#8B7AA8' :
                    selectedFactorMap === 'c' ? '#5C8D5A' :
                    '#B8794F'
      }}>
        <p className="text-sm font-medium mb-1" style={{
          color: selectedFactorMap === 'r' ? '#345770' :
                selectedFactorMap === 'k' ? '#856436' :
                selectedFactorMap === 'ls' ? '#564D66' :
                selectedFactorMap === 'c' ? '#355433' :
                '#70462B'
        }}>Factor Value</p>
        <p className="text-4xl font-bold" style={{
          color: selectedFactorMap === 'r' ? '#294559' :
                selectedFactorMap === 'k' ? '#674E28' :
                selectedFactorMap === 'ls' ? '#443E50' :
                selectedFactorMap === 'c' ? '#284126' :
                '#58351F'
        }}>
          {currentFactor.factor.factor_value.toFixed(selectedFactorMap === 'k' || selectedFactorMap === 'c' ? 3 : 2)}
        </p>
        <p className="text-xs mt-1" style={{
          color: selectedFactorMap === 'r' ? '#345770' :
                selectedFactorMap === 'k' ? '#856436' :
                selectedFactorMap === 'ls' ? '#564D66' :
                selectedFactorMap === 'c' ? '#355433' :
                '#70462B'
        }}>{currentFactor.factor.unit}</p>
      </div>

      {/* Statistics */}
      {currentFactor.factor.statistics && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Spatial Variation</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-50 rounded p-3">
              <p className="text-xs text-gray-600">Min</p>
              <p className="font-semibold text-gray-900">
                {currentFactor.factor.statistics.min?.toFixed(3) || 'N/A'}
              </p>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <p className="text-xs text-gray-600">Mean</p>
              <p className="font-semibold text-gray-900">
                {currentFactor.factor.statistics.mean?.toFixed(3) || 'N/A'}
              </p>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <p className="text-xs text-gray-600">Max</p>
              <p className="font-semibold text-gray-900">
                {currentFactor.factor.statistics.max?.toFixed(3) || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interpretation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-900 mb-2">Interpretation</p>
        <p className="text-sm text-blue-800">{currentFactor.interpretation}</p>
      </div>

      {/* Data Source */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Data Source</h3>
        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
          {currentFactor.factor.data_source}
        </p>
        <p className="text-xs text-gray-600 mt-2">
          {currentFactor.factor.methodology}
        </p>
      </div>

      {/* Quality Control */}
      {currentFactor.factor.qc && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Quality Control</h3>
          <div className="bg-gray-50 rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700">QC Score</span>
              <span className={`font-semibold ${
                currentFactor.factor.qc.qc_score > 90 ? 'text-green-600' :
                currentFactor.factor.qc.qc_score > 70 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {currentFactor.factor.qc.qc_score}/100
              </span>
            </div>
            {currentFactor.factor.qc.qc_flags.map((flag, idx) => (
              <p key={idx} className="text-xs text-gray-600 mt-1">• {flag}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Full-Screen Map Gallery (Right Side)
// ============================================================================

interface ComprehensiveMapGalleryFullScreenProps {
  result: RUSLEResponse
  fieldGeometry: any
  selectedFactorMap: 'soil_loss' | 'r' | 'k' | 'ls' | 'c' | 'p'
  setSelectedFactorMap: (map: 'soil_loss' | 'r' | 'k' | 'ls' | 'c' | 'p') => void
}

function ComprehensiveMapGalleryFullScreen({ 
  result, 
  fieldGeometry, 
  selectedFactorMap, 
  setSelectedFactorMap 
}: ComprehensiveMapGalleryFullScreenProps) {
  const mapRef = useRef<L.Map | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const fieldLayerRef = useRef<L.GeoJSON | null>(null)
  
  const maps = [
    {
      id: 'soil_loss' as const,
      name: 'Soil Loss Distribution',
      url: result.soil_loss_map_url,
      legend: 'Blue = low loss, Red = high loss',
    },
    {
      id: 'r' as const,
      name: 'R-factor (Rainfall)',
      url: result.r_factor.map_url,
      legend: 'Blue = low erosivity, Red = high erosivity',
    },
    {
      id: 'k' as const,
      name: 'K-factor (Soil)',
      url: result.k_factor.map_url,
      legend: 'Blue = resistant, Red = erodible',
    },
    {
      id: 'ls' as const,
      name: 'LS-factor (Topography)',
      url: result.ls_factor.map_url,
      legend: 'Blue = gentle, Red = steep',
    },
    {
      id: 'c' as const,
      name: 'C-factor (Cover)',
      url: result.c_factor.map_url,
      legend: 'Green = good cover, Red = bare',
    },
    {
      id: 'p' as const,
      name: 'P-factor (Practice)',
      url: result.p_factor.map_url,
      legend: 'Blue = effective, Red = none',
    },
  ].filter(map => map.url)

  const currentMap = maps.find(m => m.id === selectedFactorMap) || maps[0]

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined') return

    const container = document.getElementById('rusle-fullscreen-map')
    if (!container) return

    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    const map = L.map(container, {
      center: [41.798, -94.336],
      zoom: 14,
      zoomControl: true,
    })

    mapRef.current = map

    // Esri satellite basemap
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles © Esri',
        maxZoom: 19,
      }
    ).addTo(map)

    // Labels overlay
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Labels © Esri',
        maxZoom: 19,
      }
    ).addTo(map)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Update GEE tile layer
  useEffect(() => {
    if (!mapRef.current || !currentMap.url) return

    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current)
    }

    const tileLayer = L.tileLayer(currentMap.url, {
      opacity: 0.7,
      maxZoom: 19,
    })
    tileLayer.addTo(mapRef.current)
    tileLayerRef.current = tileLayer

    return () => {
      if (tileLayerRef.current && mapRef.current) {
        mapRef.current.removeLayer(tileLayerRef.current)
        tileLayerRef.current = null
      }
    }
  }, [currentMap.url])

  // Update field boundary
  useEffect(() => {
    if (!mapRef.current || !fieldGeometry) return

    if (fieldLayerRef.current) {
      mapRef.current.removeLayer(fieldLayerRef.current)
    }

    const fieldLayer = L.geoJSON(fieldGeometry, {
      style: {
        color: '#FFD700',
        weight: 3,
        fillOpacity: 0,
        dashArray: '10, 5',
      },
    })
    fieldLayer.addTo(mapRef.current)
    fieldLayerRef.current = fieldLayer

    const bounds = fieldLayer.getBounds()
    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50] })
    }

    return () => {
      if (fieldLayerRef.current && mapRef.current) {
        mapRef.current.removeLayer(fieldLayerRef.current)
        fieldLayerRef.current = null
      }
    }
  }, [fieldGeometry])

  return (
    <div className="flex flex-col h-full">
      {/* Map Layer Selector */}
      <div className="p-4 border-b border-gray-200">
        <select
          value={selectedFactorMap}
          onChange={(e) => setSelectedFactorMap(e.target.value as any)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-medium"
        >
          {maps.map((map) => (
            <option key={map.id} value={map.id}>
              {map.name}
            </option>
          ))}
        </select>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <div id="rusle-fullscreen-map" className="absolute inset-0" />
      </div>

      {/* Legend */}
      <div className="p-4 bg-blue-50 border-t border-blue-200">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-900">{currentMap.legend}</p>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Results Card Component
// ============================================================================

function RUSLEResultsCard({
  result,
  fieldAcres,
}: {
  result: RUSLEResponse
  fieldAcres: number
}) {
  const soilLoss = result.soil_loss_rate_tons_acre_yr
  const totalLoss = soilLoss * fieldAcres
  
  // Derive risk level from erosion_class
  const getRiskLevelFromClass = (erosionClass: string): string => {
    const lower = erosionClass.toLowerCase()
    if (lower.includes('slight')) return 'minimal'
    if (lower.includes('moderate')) return 'moderate'
    if (lower.includes('severe') || lower.includes('very severe')) return 'severe'
    return 'moderate'
  }
  
  const riskLevel = getRiskLevelFromClass(result.erosion_class)
  const tValue = result.scenario_comparison?.t_value_used || 5.0 // Use API T-value or default
  const exceedsTValue = soilLoss > tValue

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'minimal':
        return 'text-green-600 bg-green-50'
      case 'moderate':
        return 'text-yellow-600 bg-yellow-50'
      case 'high':
        return 'text-orange-600 bg-orange-50'
      case 'severe':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <TrendingDown className="w-5 h-5 mr-2 text-orange-600" />
        Erosion Assessment Results
      </h2>

      {/* Main Soil Loss Number */}
      <div className="text-center py-6 mb-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">Average Soil Loss</p>
        <p className="text-5xl font-bold text-gray-900">{soilLoss.toFixed(1)}</p>
        <p className="text-lg text-gray-600 mt-2">tons/acre/year</p>
        <p className="text-sm text-gray-500 mt-1">
          Total: {totalLoss.toFixed(0)} tons/year across {fieldAcres.toFixed(1)} acres
        </p>
      </div>

      {/* T-Value Comparison */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Soil Tolerance (T-value)</p>
            <p className="text-2xl font-semibold text-gray-900">{tValue.toFixed(1)} T/A/Y</p>
          </div>
          {exceedsTValue ? (
            <div className="text-right">
              <AlertTriangle className="w-8 h-8 text-red-600 ml-auto mb-1" />
              <p className="text-sm font-semibold text-red-600">EXCEEDS</p>
              <p className="text-xs text-red-600">
                {((soilLoss / tValue) * 100).toFixed(0)}% of T-value
              </p>
            </div>
          ) : (
            <div className="text-right">
              <CheckCircle className="w-8 h-8 text-green-600 ml-auto mb-1" />
              <p className="text-sm font-semibold text-green-600">ACCEPTABLE</p>
              <p className="text-xs text-green-600">
                {((soilLoss / tValue) * 100).toFixed(0)}% of T-value
              </p>
            </div>
          )}
        </div>

        {/* Risk Level */}
        <div className={`p-4 rounded-lg ${getRiskColor(riskLevel)}`}>
          <p className="text-sm font-medium">Erosion Risk Level</p>
          <p className="text-2xl font-bold capitalize mt-1">{riskLevel}</p>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// RUSLE Factors Card
// ============================================================================

function RUSLEFactorsCard({ result }: { result: RUSLEResponse }) {
  const factors = [
    {
      letter: 'R',
      name: 'Rainfall Erosivity',
      value: result.r_factor.factor_value,
      unit: '',
      color: 'bg-blue-100 text-blue-800',
      description: result.r_factor.data_source || 'Rainfall erosivity factor',
      mapUrl: result.r_factor.map_url,
      stats: result.r_factor.statistics,
    },
    {
      letter: 'K',
      name: 'Soil Erodibility',
      value: result.k_factor.factor_value,
      unit: '',
      color: 'bg-amber-100 text-amber-800',
      description: result.k_factor.data_source || 'Soil erodibility factor',
      mapUrl: result.k_factor.map_url,
      stats: result.k_factor.statistics,
    },
    {
      letter: 'LS',
      name: 'Slope Length & Steepness',
      value: result.ls_factor.factor_value,
      unit: '',
      color: 'bg-green-100 text-green-800',
      description: result.ls_factor.data_source || 'Topographic factor',
      mapUrl: result.ls_factor.map_url,
      stats: result.ls_factor.statistics,
    },
    {
      letter: 'C',
      name: 'Cover Management',
      value: result.c_factor.factor_value,
      unit: '',
      color: 'bg-emerald-100 text-emerald-800',
      description: result.c_factor.data_source || 'Cover management factor',
      mapUrl: result.c_factor.map_url,
      stats: result.c_factor.statistics,
    },
    {
      letter: 'P',
      name: 'Support Practice',
      value: result.p_factor.factor_value,
      unit: '',
      color: 'bg-purple-100 text-purple-800',
      description: result.p_factor.data_source || 'Conservation practice factor',
      mapUrl: result.p_factor.map_url,
      stats: result.p_factor.statistics,
    },
  ]

  const [expandedFactor, setExpandedFactor] = useState<string | null>(null)

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">RUSLE Factors Breakdown</h2>
      <p className="text-sm text-gray-600 mb-4">A = R × K × LS × C × P</p>

      <div className="space-y-3">
        {factors.map((factor) => (
          <div key={factor.letter} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center flex-1">
                  <div className={`w-10 h-10 rounded-lg ${factor.color} flex items-center justify-center font-bold text-lg mr-3`}>
                    {factor.letter}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{factor.name}</p>
                    <p className="text-xs text-gray-500">{factor.description}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {factor.value.toFixed(2)}
                      {factor.unit}
                    </p>
                  </div>
                  {factor.mapUrl && (
                    <button
                      onClick={() => setExpandedFactor(expandedFactor === factor.letter ? null : factor.letter)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View spatial distribution map"
                    >
                      <Layers className={`w-5 h-5 ${expandedFactor === factor.letter ? 'text-blue-600' : 'text-gray-400'}`} />
                    </button>
                  )}
                </div>
              </div>

              {/* Statistics */}
              {factor.stats && (
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-600">Min</p>
                    <p className="font-semibold text-gray-900">{factor.stats.min?.toFixed(3) || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-600">Mean</p>
                    <p className="font-semibold text-gray-900">{factor.stats.mean?.toFixed(3) || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-600">Max</p>
                    <p className="font-semibold text-gray-900">{factor.stats.max?.toFixed(3) || 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Expanded Map View */}
            {expandedFactor === factor.letter && factor.mapUrl && (
              <div className="border-t border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  {factor.name} Spatial Distribution
                </p>
                <div className="bg-white rounded-lg border border-gray-300 p-3">
                  <div className="aspect-video bg-gray-100 rounded flex items-center justify-center relative overflow-hidden">
                    {/* GEE Tile Layer Preview */}
                    <iframe
                      src={`data:text/html,${encodeURIComponent(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                          <style>
                            body { margin: 0; padding: 0; }
                            #map { width: 100%; height: 100vh; }
                          </style>
                        </head>
                        <body>
                          <div id="map"></div>
                          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                          <script>
                            const map = L.map('map').setView([41.798, -94.336], 15);
                            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                              attribution: '© OpenStreetMap'
                            }).addTo(map);
                            L.tileLayer('${factor.mapUrl}', {
                              opacity: 0.7
                            }).addTo(map);
                          </script>
                        </body>
                        </html>
                      `)}`}
                      className="w-full h-full border-0"
                      title={`${factor.name} Map`}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {factor.letter === 'K' && 'Blue = low erodibility, Red = high erodibility'}
                    {factor.letter === 'LS' && 'Blue = gentle slopes, Red = steep slopes'}
                    {factor.letter === 'C' && 'Green = good cover, Red = bare soil'}
                    {factor.letter === 'R' && 'Blue = low erosivity, Red = high erosivity'}
                    {factor.letter === 'P' && 'Detected conservation practices'}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Data Sources */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          <strong>Data Sources:</strong> K: {result.k_factor.data_source || 'SSURGO'}, R: {result.r_factor.data_source || 'DAYMET/GPM'}, LS: {result.ls_factor.data_source || 'NCSS 30m'}, C: {result.c_factor.data_source || 'Sentinel-2'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Calculated: {new Date(result.calculation_date).toLocaleString()}
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// Scenario Comparison Card
// ============================================================================

function ScenarioComparisonCard({
  baseline,
  proposed,
  fieldAcres,
  proposedPractice,
}: {
  baseline: ScenarioResult // Changed from RUSLEResponse
  proposed: RUSLEResponse
  fieldAcres: number
  proposedPractice: ConservationPractice
}) {
  // Use direct rate values
  const baselineErosion = baseline.soil_loss_rate_tons_acre_yr
  const proposedErosion = proposed.soil_loss_rate_tons_acre_yr
  const reduction = baselineErosion - proposedErosion
  const reductionPercent = (reduction / baselineErosion) * 100

  const baselineTotalLoss = baselineErosion * fieldAcres
  const proposedTotalLoss = proposedErosion * fieldAcres
  const totalReduction = baselineTotalLoss - proposedTotalLoss

  const estimatedCost = proposedPractice.costPerAcre.typical * fieldAcres
  const costPerTonSaved = totalReduction > 0 ? estimatedCost / totalReduction : 0

  // Get T-value from scenario comparison (correct location) or use default
  const tValue = proposed.scenario_comparison?.t_value_used || 5.0
  const exceedsTValue = proposedErosion > tValue

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <DollarSign className="w-5 h-5 mr-2 text-orange-600" />
        Scenario Comparison
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Baseline */}
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 font-medium mb-2">Baseline (No Practice)</p>
          <p className="text-3xl font-bold text-red-900">{baselineErosion.toFixed(1)}</p>
          <p className="text-sm text-red-700">tons/acre/year</p>
          <p className="text-xs text-red-600 mt-2">
            Total: {baselineTotalLoss.toFixed(0)} tons/year
          </p>
        </div>

        {/* Proposed */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium mb-2">
            With {proposedPractice.name}
          </p>
          <p className="text-3xl font-bold text-green-900">{proposedErosion.toFixed(1)}</p>
          <p className="text-sm text-green-700">tons/acre/year</p>
          <p className="text-xs text-green-600 mt-2">
            Total: {proposedTotalLoss.toFixed(0)} tons/year
          </p>
        </div>
      </div>

      {/* Reduction Summary */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-800 font-medium">Annual Reduction</p>
            <p className="text-2xl font-bold text-blue-900">{reduction.toFixed(1)} T/A/Y</p>
            <p className="text-sm text-blue-700">{totalReduction.toFixed(0)} tons/year total</p>
          </div>
          <div className="text-right">
            <div className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg">
              <p className="text-3xl font-bold">{reductionPercent.toFixed(0)}%</p>
              <p className="text-xs">reduction</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Analysis */}
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <span className="text-sm text-gray-700">Estimated Implementation Cost</span>
          <span className="font-semibold text-gray-900">${estimatedCost.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <span className="text-sm text-gray-700">Cost per Ton Saved (Annual)</span>
          <span className="font-semibold text-gray-900">
            ${costPerTonSaved.toFixed(2)}/ton
          </span>
        </div>
        {exceedsTValue ? (
          <div className="flex items-center p-3 rounded border" style={{ backgroundColor: '#F9F5E8', borderColor: '#E8DBB8' }}>
            <AlertTriangle className="w-5 h-5 mr-2" style={{ color: '#D4A853' }} />
            <span className="text-sm" style={{ color: '#826930' }}>
              Still exceeds T-value ({tValue.toFixed(1)} T/A/Y) - consider additional practices
            </span>
          </div>
        ) : (
          <div className="flex items-center p-3 rounded border" style={{ backgroundColor: '#F2F6F2', borderColor: '#9FB89E' }}>
            <CheckCircle className="w-5 h-5 mr-2" style={{ color: '#5C8D5A' }} />
            <span className="text-sm" style={{ color: '#355433' }}>
              Meets soil tolerance goals (T-value: {tValue.toFixed(1)} T/A/Y)
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Comprehensive Map Gallery Component
// ============================================================================

function ComprehensiveMapGallery({ result, fieldGeometry }: { result: RUSLEResponse; fieldGeometry: any }) {
  const [activeMap, setActiveMap] = useState<'soil_loss' | 'r' | 'k' | 'ls' | 'c' | 'p'>('soil_loss')
  const mapRef = useRef<L.Map | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const fieldLayerRef = useRef<L.GeoJSON | null>(null)
  
  const maps = [
    {
      id: 'soil_loss' as const,
      name: 'Soil Loss Distribution',
      url: result.soil_loss_map_url,
      description: 'Total annual soil loss (tons/acre/year)',
      legend: 'Blue = low loss, Red = high loss',
    },
    {
      id: 'r' as const,
      name: 'R-factor (Rainfall Erosivity)',
      url: result.r_factor.map_url,
      description: 'Rainfall erosive power',
      legend: 'Blue = low erosivity, Red = high erosivity',
    },
    {
      id: 'k' as const,
      name: 'K-factor (Soil Erodibility)',
      url: result.k_factor.map_url,
      description: 'Soil susceptibility to erosion',
      legend: 'Blue = resistant soils, Red = erodible soils',
    },
    {
      id: 'ls' as const,
      name: 'LS-factor (Topography)',
      url: result.ls_factor.map_url,
      description: 'Slope length and steepness',
      legend: 'Blue = gentle slopes, Red = steep slopes',
    },
    {
      id: 'c' as const,
      name: 'C-factor (Cover Management)',
      url: result.c_factor.map_url,
      description: 'Vegetation and crop cover',
      legend: 'Green = good cover, Red = bare soil',
    },
    {
      id: 'p' as const,
      name: 'P-factor (Support Practices)',
      url: result.p_factor.map_url,
      description: 'Conservation practice effectiveness',
      legend: 'Blue = effective practices, Red = no practices',
    },
  ].filter(map => map.url) // Only show maps with URLs

  if (maps.length === 0) return null

  const currentMap = maps.find(m => m.id === activeMap) || maps[0]

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined') return

    const container = document.getElementById('rusle-map-gallery')
    if (!container) return

    // Clear existing map
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    // Create new map
    const map = L.map(container, {
      center: [41.798, -94.336],
      zoom: 14,
      zoomControl: true,
    })

    mapRef.current = map

    // Add Esri satellite basemap
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles © Esri',
        maxZoom: 19,
      }
    ).addTo(map)

    // Add labels overlay
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Labels © Esri',
        maxZoom: 19,
      }
    ).addTo(map)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Update GEE tile layer when map changes
  useEffect(() => {
    if (!mapRef.current || !currentMap.url) return

    // Remove existing tile layer
    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current)
    }

    // Add new GEE tile layer
    const tileLayer = L.tileLayer(currentMap.url, {
      opacity: 0.7,
      maxZoom: 19,
    })
    tileLayer.addTo(mapRef.current)
    tileLayerRef.current = tileLayer

    return () => {
      if (tileLayerRef.current && mapRef.current) {
        mapRef.current.removeLayer(tileLayerRef.current)
        tileLayerRef.current = null
      }
    }
  }, [currentMap.url])

  // Update field boundary
  useEffect(() => {
    if (!mapRef.current || !fieldGeometry) return

    // Remove existing field layer
    if (fieldLayerRef.current) {
      mapRef.current.removeLayer(fieldLayerRef.current)
    }

    // Add field boundary
    const fieldLayer = L.geoJSON(fieldGeometry, {
      style: {
        color: '#FFD700',
        weight: 3,
        fillOpacity: 0,
        dashArray: '10, 5',
      },
    })
    fieldLayer.addTo(mapRef.current)
    fieldLayerRef.current = fieldLayer

    // Fit bounds to field
    const bounds = fieldLayer.getBounds()
    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50] })
    }

    return () => {
      if (fieldLayerRef.current && mapRef.current) {
        mapRef.current.removeLayer(fieldLayerRef.current)
        fieldLayerRef.current = null
      }
    }
  }, [fieldGeometry])

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Layers className="w-5 h-5 mr-2 text-blue-600" />
        Spatial Distribution Maps
      </h2>

      {/* Map Selector Dropdown */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Map Layer
        </label>
        <select
          value={activeMap}
          onChange={(e) => setActiveMap(e.target.value as any)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {maps.map((map) => (
            <option key={map.id} value={map.id}>
              {map.name}
            </option>
          ))}
        </select>
      </div>

      {/* Active Map Display */}
      <div className="space-y-3">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm font-medium text-gray-900 mb-1">{currentMap.name}</p>
          <p className="text-xs text-gray-600">{currentMap.description}</p>
        </div>

        {/* Map Viewer */}
        <div 
          id="rusle-map-gallery" 
          className="h-96 bg-gray-100 rounded-lg border-2 border-gray-300 relative overflow-hidden"
        />

        {/* Legend */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-900">{currentMap.legend}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-4 h-4 border-2 border-yellow-500 rounded" style={{ borderStyle: 'dashed' }} />
            <span className="text-xs text-gray-600">
              Yellow dashed line = field boundary
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// R-Factor Timeseries Chart Component
// ============================================================================

function RFactorTimeseriesChart({ result }: { result: RUSLEResponse }) {
  if (!result.r_factor.yearly_values) return null

  const years = Object.keys(result.r_factor.yearly_values).sort()
  const values = years.map(year => result.r_factor.yearly_values![year])
  const mean = result.r_factor.statistics?.mean || result.r_factor.factor_value
  
  const maxValue = Math.max(...values)
  const minValue = Math.min(...values)

  // Categorize years
  const droughtYears = values.filter(v => v < mean * 0.8).length
  const normalYears = values.filter(v => v >= mean * 0.8 && v <= mean * 1.2).length
  const wetYears = values.filter(v => v > mean * 1.2).length

  return (
    <div className="border rounded-lg p-4" style={{ borderColor: '#D8DBDB', backgroundColor: '#FEFDFB' }}>
      <h2 className="text-xl font-semibold mb-3 flex items-center" style={{ color: '#3E4A4A' }}>
        <TrendingDown className="w-5 h-5 mr-2" style={{ color: '#4A7C9E' }} />
        15-Year Rainfall Erosivity Trends
      </h2>

      <div className="space-y-4">
        {/* Summary Stats with natural colors */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg p-3 text-center" style={{ backgroundColor: '#E9D7C7' }}>
            <p className="text-xs mb-1" style={{ color: '#70462B' }}>Mean R-factor</p>
            <p className="text-2xl font-bold" style={{ color: '#885737' }}>{mean.toFixed(0)}</p>
            <p className="text-xs" style={{ color: '#A06843' }}>MJ·mm/(ha·h·yr)</p>
          </div>
          <div className="rounded-lg p-3 text-center" style={{ backgroundColor: '#F9EDEC' }}>
            <p className="text-xs mb-1" style={{ color: '#8B3C35' }}>Maximum</p>
            <p className="text-2xl font-bold" style={{ color: '#A0453D' }}>{maxValue.toFixed(0)}</p>
            <p className="text-xs" style={{ color: '#A0453D' }}>Wettest year</p>
          </div>
          <div className="rounded-lg p-3 text-center" style={{ backgroundColor: '#DCE9F1' }}>
            <p className="text-xs mb-1" style={{ color: '#345770' }}>Minimum</p>
            <p className="text-2xl font-bold" style={{ color: '#4A7C9E' }}>{minValue.toFixed(0)}</p>
            <p className="text-xs" style={{ color: '#3F6A87' }}>Driest year</p>
          </div>
        </div>

        {/* Enhanced Bar Chart */}
        <div className="relative h-64 border rounded-lg p-4" style={{ borderColor: '#D8DBDB', backgroundColor: 'white' }}>
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs" style={{ color: '#6B7D7D' }}>
            <span>{maxValue.toFixed(0)}</span>
            <span>{(maxValue * 0.75).toFixed(0)}</span>
            <span>{(maxValue * 0.5).toFixed(0)}</span>
            <span>{(maxValue * 0.25).toFixed(0)}</span>
            <span>0</span>
          </div>

          {/* Bars with natural color coding */}
          <div className="absolute left-12 right-0 top-0 bottom-8 flex items-end justify-between gap-1">
            {years.map((year, idx) => {
              const value = values[idx]
              const heightPercent = (value / maxValue) * 100
              const isDrought = value < mean * 0.8
              const isWet = value > mean * 1.2
              
              return (
                <div key={year} className="flex-1 flex flex-col items-center">
                  <div className="relative w-full group">
                    <div
                      className="w-full rounded-t transition-all hover:opacity-90 cursor-pointer"
                      style={{ 
                        height: `${heightPercent * 2}px`,
                        backgroundColor: isDrought ? '#4A7C9E' : isWet ? '#A0453D' : '#D4A574'
                      }}
                      title={`${year}: ${value.toFixed(0)}`}
                    />
                    {/* Enhanced Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10 shadow-lg" style={{ backgroundColor: '#2C2C31' }}>
                      {year}: {value.toFixed(0)}
                      <div className="text-[10px]" style={{ color: '#D8DBDB' }}>
                        {isDrought ? 'Drought' : isWet ? 'Wet' : 'Normal'}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mean line */}
          <div
            className="absolute left-12 right-0 border-t-2 border-dashed"
            style={{ 
              bottom: `${8 + (mean / maxValue) * 200}px`,
              borderColor: '#6B7D7D'
            }}
          >
            <span className="absolute right-0 -top-3 text-xs px-1 rounded" style={{ color: '#6B7D7D', backgroundColor: 'white' }}>
              Mean: {mean.toFixed(0)}
            </span>
          </div>

          {/* X-axis labels */}
          <div className="absolute left-12 right-0 bottom-0 h-8 flex items-end justify-between text-xs" style={{ color: '#6B7D7D' }}>
            {years.map((year, idx) => (
              <span key={year} className={idx % 2 === 0 ? '' : 'opacity-0'}>
                {year}
              </span>
            ))}
          </div>
        </div>

        {/* Climate Variability Analysis */}
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#F6F8F7' }}>
          <p className="text-sm font-medium mb-3" style={{ color: '#3E4A4A' }}>Climate Variability Analysis</p>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center">
              <div className="w-3 h-3 rounded mx-auto mb-1" style={{ backgroundColor: '#4A7C9E' }} />
              <p className="text-xs font-medium" style={{ color: '#345770' }}>{droughtYears} Dry Years</p>
              <p className="text-[10px]" style={{ color: '#6B7D7D' }}>&lt;80% of mean</p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 rounded mx-auto mb-1" style={{ backgroundColor: '#D4A574' }} />
              <p className="text-xs font-medium" style={{ color: '#856436' }}>{normalYears} Normal Years</p>
              <p className="text-[10px]" style={{ color: '#6B7D7D' }}>80-120% of mean</p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 rounded mx-auto mb-1" style={{ backgroundColor: '#A0453D' }} />
              <p className="text-xs font-medium" style={{ color: '#75332D' }}>{wetYears} Wet Years</p>
              <p className="text-[10px]" style={{ color: '#6B7D7D' }}>&gt;120% of mean</p>
            </div>
          </div>
          <p className="text-xs" style={{ color: '#5C6C6C' }}>
            <Info className="w-3 h-3 inline mr-1" style={{ color: '#4A7C9E' }} />
            High variability shows importance of multi-year conservation planning. Data: {result.r_factor.methodology}
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// All Scenarios Explorer Card
// ============================================================================

function AllScenariosExplorerCard({ result }: { result: RUSLEResponse }) {
  if (!result.scenarios || result.scenarios.length === 0) {
    return null
  }

  const [viewMode, setViewMode] = React.useState<'cards' | 'table' | 'chart'>('chart')
  const [sortBy, setSortBy] = React.useState<'effectiveness' | 'soilLoss' | 'pFactor'>('effectiveness')
  const [showOnlyCompliant, setShowOnlyCompliant] = React.useState(false)

  const tValue = result.scenario_comparison?.t_value_used || 5.0
  const mostEffective = result.scenario_comparison?.most_effective_practice
  const baselineLoss = result.baseline?.soil_loss_rate_tons_acre_yr || 0
  
  // Sort scenarios based on selected criteria
  const getSortedScenarios = () => {
    let scenarios = [...result.scenarios]
    
    if (showOnlyCompliant) {
      scenarios = scenarios.filter(s => s.soil_loss_rate_tons_acre_yr <= tValue)
    }
    
    switch (sortBy) {
      case 'effectiveness':
        return scenarios.sort((a, b) => (b.erosion_reduction_percent || 0) - (a.erosion_reduction_percent || 0))
      case 'soilLoss':
        return scenarios.sort((a, b) => a.soil_loss_rate_tons_acre_yr - b.soil_loss_rate_tons_acre_yr)
      case 'pFactor':
        return scenarios.sort((a, b) => a.p_factor.factor_value - b.p_factor.factor_value)
      default:
        return scenarios
    }
  }
  
  const sortedScenarios = getSortedScenarios()

  const getPracticeDisplayName = (practice: string): string => {
    const names: Record<string, string> = {
      'none': 'No Practice',
      'contour_farming': 'Contour Farming',
      'strip_cropping': 'Strip Cropping',
      'terracing': 'Terracing',
      'grassed_waterway': 'Grassed Waterway',
      'cover_crop': 'Cover Crop',
    }
    return names[practice] || practice
  }

  const getPracticeIcon = (practice: string) => {
    const iconProps = { className: "w-5 h-5", style: { color: '#5C8D5A' } }
    
    switch (practice) {
      case 'terracing':
        return <Mountain {...iconProps} />
      case 'contour_farming':
        return <Waves {...iconProps} />
      case 'strip_cropping':
        return <Grid {...iconProps} />
      case 'grassed_waterway':
        return <Droplets {...iconProps} />
      case 'cover_crop':
        return <Leaf {...iconProps} />
      default:
        return <Clipboard {...iconProps} />
    }
  }

  const getErosionRiskBadge = (soilLoss: number, tValue: number) => {
    const ratio = soilLoss / tValue
    if (ratio <= 0.5)
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
          Excellent
        </span>
      )
    if (ratio <= 1.0)
      return (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
          Acceptable
        </span>
      )
    if (ratio <= 1.5)
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
          Moderate
        </span>
      )
    return (
      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
        High Risk
      </span>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <BarChart className="w-5 h-5 mr-2" style={{ color: '#8B7AA8' }} />
          Conservation Practice Comparison
        </h2>
        
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('chart')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all ${
              viewMode === 'chart'
                ? 'text-white font-medium'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            style={{
              backgroundColor: viewMode === 'chart' ? '#8B7AA8' : undefined,
              color: viewMode === 'chart' ? 'white' : '#6B7676',
            }}
          >
            <BarChart className="w-4 h-4" />
            Chart
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all ${
              viewMode === 'table'
                ? 'text-white font-medium'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            style={{
              backgroundColor: viewMode === 'table' ? '#8B7AA8' : undefined,
              color: viewMode === 'table' ? 'white' : '#6B7676',
            }}
          >
            <Layers className="w-4 h-4" />
            Table
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all ${
              viewMode === 'cards'
                ? 'text-white font-medium'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            style={{
              backgroundColor: viewMode === 'cards' ? '#8B7AA8' : undefined,
              color: viewMode === 'cards' ? 'white' : '#6B7676',
            }}
          >
            <Clipboard className="w-4 h-4" />
            Cards
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium" style={{ color: '#3E4A4A' }}>
            Sort by:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 text-sm border rounded-lg"
            style={{ borderColor: '#BFC4C4', color: '#3E4A4A' }}
          >
            <option value="effectiveness">Effectiveness (%)</option>
            <option value="soilLoss">Soil Loss (tons/ac/yr)</option>
            <option value="pFactor">P-Factor Value</option>
          </select>
        </div>
        
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showOnlyCompliant}
            onChange={(e) => setShowOnlyCompliant(e.target.checked)}
            className="w-4 h-4"
            style={{ accentColor: '#5C8D5A' }}
          />
          <span className="text-sm" style={{ color: '#3E4A4A' }}>
            Show only T-value compliant ({tValue} T/A/Y)
          </span>
        </label>
      </div>

      {/* Baseline Reference */}
      {result.baseline && (
        <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: '#FDF7F6', border: '1px solid #E6BCB9' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold" style={{ color: '#75332D' }}>Current Conditions (Baseline)</p>
              <p className="text-sm mt-1" style={{ color: '#8B3C35' }}>
                Soil Loss: {result.baseline.soil_loss_rate_tons_acre_yr.toFixed(2)} tons/acre/year
              </p>
            </div>
            {getErosionRiskBadge(result.baseline.soil_loss_rate_tons_acre_yr, tValue)}
          </div>
        </div>
      )}

      {/* Best Practice Recommendation */}
      {mostEffective && (
        <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: '#F2F6F2', border: '2px solid #5C8D5A' }}>
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" style={{ color: '#5C8D5A' }} />
            <div>
              <p className="font-semibold" style={{ color: '#355433' }}>
                Most Effective: {getPracticeDisplayName(mostEffective)}
              </p>
              <p className="text-sm mt-1" style={{ color: '#5C8D5A' }}>
                {result.scenario_comparison?.max_reduction_percent?.toFixed(1)}% soil loss reduction
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CHART VIEW - Visual Bar Comparison */}
      {viewMode === 'chart' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#F6F8F7' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: '#3E4A4A' }}>
              Soil Loss Comparison (Lower is Better)
            </h3>
            <div className="space-y-3">
              {sortedScenarios.map((scenario, idx) => {
                const isRecommended = scenario.practice === mostEffective
                const maxLoss = Math.max(...sortedScenarios.map(s => s.soil_loss_rate_tons_acre_yr), baselineLoss)
                const barWidth = (scenario.soil_loss_rate_tons_acre_yr / maxLoss) * 100
                const meetsT = scenario.soil_loss_rate_tons_acre_yr <= tValue
                
                return (
                  <div key={scenario.practice} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {getPracticeIcon(scenario.practice)}
                        <span className="font-medium" style={{ color: '#3E4A4A' }}>
                          {getPracticeDisplayName(scenario.practice)}
                        </span>
                        {idx === 0 && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded" style={{ backgroundColor: '#DDD7EA', color: '#564D66' }}>
                            #1 Best
                          </span>
                        )}
                      </div>
                      <span className="font-semibold" style={{ color: meetsT ? '#5C8D5A' : '#A0453D' }}>
                        {scenario.soil_loss_rate_tons_acre_yr.toFixed(2)} T/A/Y
                      </span>
                    </div>
                    
                    {/* Bar */}
                    <div className="relative h-8 rounded-lg overflow-hidden" style={{ backgroundColor: '#E8ECE8' }}>
                      <div
                        className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                        style={{
                          width: `${barWidth}%`,
                          background: isRecommended 
                            ? 'linear-gradient(135deg, #5C8D5A 0%, #7BAD79 100%)'
                            : meetsT
                            ? 'linear-gradient(135deg, #4A7C9E 0%, #5D92B3 100%)'
                            : 'linear-gradient(135deg, #B8794F 0%, #C99168 100%)',
                        }}
                      >
                        <span className="text-xs font-semibold text-white">
                          {scenario.erosion_reduction_percent?.toFixed(0) || 0}% reduction
                        </span>
                      </div>
                      
                      {/* T-value marker - Enhanced visibility */}
                      {tValue < maxLoss && (
                        <div
                          className="absolute top-0 bottom-0 flex items-center"
                          style={{ left: `${(tValue / maxLoss) * 100}%` }}
                        >
                          {/* Thicker red line */}
                          <div
                            className="absolute top-0 bottom-0 w-1"
                            style={{ 
                              backgroundColor: '#A0453D',
                              boxShadow: '0 0 4px rgba(160, 69, 61, 0.6)',
                            }}
                          />
                          {/* Label above line */}
                          <div
                            className="absolute -top-6 -left-12 px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap"
                            style={{ 
                              backgroundColor: '#A0453D',
                              color: 'white',
                            }}
                          >
                            T-value: {tValue.toFixed(1)}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Quick stats */}
                    <div className="flex items-center gap-4 text-xs" style={{ color: '#6B7676' }}>
                      <span>P-Factor: {scenario.p_factor.factor_value.toFixed(2)}</span>
                      <span>•</span>
                      <span>Saved: {(baselineLoss - scenario.soil_loss_rate_tons_acre_yr).toFixed(2)} T/A/Y</span>
                      <span>•</span>
                      {getErosionRiskBadge(scenario.soil_loss_rate_tons_acre_yr, tValue)}
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* T-value legend */}
            <div className="mt-4 pt-4 border-t" style={{ borderColor: '#D4DAD4' }}>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-1 h-4" style={{ backgroundColor: '#A0453D', boxShadow: '0 0 4px rgba(160, 69, 61, 0.6)' }} />
                  <span className="text-xs font-semibold" style={{ color: '#A0453D' }}>
                    T-value Threshold: {tValue.toFixed(1)} tons/acre/year
                  </span>
                </div>
                <span className="text-xs" style={{ color: '#6B7676' }}>
                  (Maximum sustainable annual erosion rate)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABLE VIEW - Detailed Comparison Table */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2" style={{ borderColor: '#4A7C9E', backgroundColor: '#F0F6F9' }}>
                <th className="text-left p-3 font-semibold" style={{ color: '#345770' }}>Practice</th>
                <th className="text-right p-3 font-semibold" style={{ color: '#345770' }}>Soil Loss (T/A/Y)</th>
                <th className="text-right p-3 font-semibold" style={{ color: '#345770' }}>Reduction %</th>
                <th className="text-right p-3 font-semibold" style={{ color: '#345770' }}>Saved (T/A/Y)</th>
                <th className="text-right p-3 font-semibold" style={{ color: '#345770' }}>P-Factor</th>
                <th className="text-center p-3 font-semibold" style={{ color: '#345770' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedScenarios.map((scenario, idx) => {
                const isRecommended = scenario.practice === mostEffective
                const meetsT = scenario.soil_loss_rate_tons_acre_yr <= tValue
                const reduction = baselineLoss - scenario.soil_loss_rate_tons_acre_yr
                
                return (
                  <tr
                    key={scenario.practice}
                    className="border-b transition-colors hover:bg-gray-50"
                    style={{
                      borderColor: '#E8ECE8',
                      backgroundColor: isRecommended ? '#F2F6F2' : undefined,
                    }}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getPracticeIcon(scenario.practice)}
                        <span className="font-medium" style={{ color: '#3E4A4A' }}>
                          {getPracticeDisplayName(scenario.practice)}
                        </span>
                        {idx === 0 && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded" style={{ backgroundColor: '#DDD7EA', color: '#564D66' }}>
                            #1
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right font-semibold" style={{ color: meetsT ? '#5C8D5A' : '#A0453D' }}>
                      {scenario.soil_loss_rate_tons_acre_yr.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-semibold" style={{ color: '#4A7C9E' }}>
                      {scenario.erosion_reduction_percent?.toFixed(1) || 0}%
                    </td>
                    <td className="p-3 text-right" style={{ color: '#5C8D5A' }}>
                      {reduction.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-mono" style={{ color: '#6B7676' }}>
                      {scenario.p_factor.factor_value.toFixed(3)}
                    </td>
                    <td className="p-3 text-center">
                      {getErosionRiskBadge(scenario.soil_loss_rate_tons_acre_yr, tValue)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CARDS VIEW - Original Card Layout */}
      {viewMode === 'cards' && (
        <div className="space-y-2">
        
        {sortedScenarios.map((scenario, idx) => {
          const isRecommended = scenario.practice === mostEffective
          const baselineLoss = result.baseline?.soil_loss_rate_tons_acre_yr || 0
          const reduction = baselineLoss - scenario.soil_loss_rate_tons_acre_yr
          
          return (
            <div
              key={scenario.practice}
              className={`p-4 rounded-lg border-2 transition-all ${
                isRecommended
                  ? 'shadow-md'
                  : 'hover:border-gray-300'
              }`}
              style={{
                backgroundColor: isRecommended ? '#F2F6F2' : 'white',
                borderColor: isRecommended ? '#5C8D5A' : '#D4DAD4',
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getPracticeIcon(scenario.practice)}
                    <p className="font-semibold" style={{ color: '#2C3838' }}>
                      {getPracticeDisplayName(scenario.practice)}
                    </p>
                    {idx === 0 && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded" style={{ backgroundColor: '#DDD7EA', color: '#564D66' }}>
                        #1 Best
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-xs" style={{ color: '#6B7676' }}>Soil Loss</p>
                      <p className="text-lg font-bold" style={{ color: '#2C3838' }}>
                        {scenario.soil_loss_rate_tons_acre_yr.toFixed(2)}
                      </p>
                      <p className="text-xs" style={{ color: '#8B9494' }}>tons/acre/year</p>
                    </div>
                    
                    <div>
                      <p className="text-xs" style={{ color: '#6B7676' }}>Reduction from Baseline</p>
                      <p className="text-lg font-bold" style={{ color: '#5C8D5A' }}>
                        {scenario.erosion_reduction_percent?.toFixed(1) || 0}%
                      </p>
                      <p className="text-xs" style={{ color: '#8B9494' }}>
                        ({reduction.toFixed(2)} tons saved/year)
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-xs" style={{ color: '#6B7676' }}>P-Factor:</p>
                      <span className="px-2 py-0.5 text-xs font-mono rounded" style={{ backgroundColor: '#DCE9F1', color: '#345770' }}>
                        {scenario.p_factor.factor_value.toFixed(2)}
                      </span>
                    </div>
                    {getErosionRiskBadge(scenario.soil_loss_rate_tons_acre_yr, tValue)}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        </div>
      )}

      {/* Summary Stats */}
      {result.scenario_comparison && (
        <div className="mt-4 p-4 rounded-lg border" style={{ backgroundColor: '#F0F6F9', borderColor: '#9CB8CC' }}>
          <p className="text-sm font-semibold mb-2" style={{ color: '#345770' }}>Quick Stats</p>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p style={{ color: '#4A7C9E' }}>Max Reduction</p>
              <p className="font-bold text-lg" style={{ color: '#345770' }}>
                {result.scenario_comparison.max_reduction_percent?.toFixed(1)}%
              </p>
              <p className="text-xs" style={{ color: '#6B7676' }}>
                {result.scenario_comparison.most_effective_practice && getPracticeDisplayName(result.scenario_comparison.most_effective_practice)}
              </p>
            </div>
            <div>
              <p style={{ color: '#4A7C9E' }}>Avg Reduction</p>
              <p className="font-bold text-lg" style={{ color: '#345770' }}>
                {result.scenario_comparison.average_reduction_percent?.toFixed(1)}%
              </p>
              <p className="text-xs" style={{ color: '#6B7676' }}>All practices</p>
            </div>
            <div>
              <p style={{ color: '#4A7C9E' }}>T-Value Compliant</p>
              <p className="font-bold text-lg" style={{ color: '#345770' }}>
                {sortedScenarios.filter(s => s.soil_loss_rate_tons_acre_yr <= tValue).length}/{sortedScenarios.length}
              </p>
              <p className="text-xs" style={{ color: '#6B7676' }}>practices</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Recommendations Card
// ============================================================================

function RecommendationsCard({ result }: { result: RUSLEResponse }) {
  const exceedsTValue = result.soil_loss_rate_tons_acre_yr > 5.0
  const recommendations = result.p_factor.recommendations || []
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-orange-600" />
        Recommendations
      </h2>

      <div className="space-y-3">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="font-semibold text-blue-900 mb-2">Erosion Classification</p>
          <p className="text-sm text-blue-800">{result.erosion_class_description}</p>
        </div>

        {recommendations.length > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="font-semibold text-green-900 mb-2">Conservation Recommendations</p>
            <ul className="text-sm text-green-800 space-y-1">
              {recommendations.map((rec, idx) => (
                <li key={idx}>• {rec}</li>
              ))}
            </ul>
          </div>
        )}

        {exceedsTValue && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="font-semibold text-yellow-900 mb-2">Next Steps</p>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Contact NRCS for technical assistance and cost-share programs</li>
              <li>• Consider combining multiple conservation practices</li>
              <li>• Schedule field assessment with conservation specialist</li>
              <li>• Develop comprehensive conservation plan</li>
            </ul>
          </div>
        )}

        <button
          className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-colors flex items-center justify-center"
          onClick={() => alert('Report generation coming soon!')}
        >
          <Download className="w-4 h-4 mr-2" />
          Download Full Assessment Report
        </button>
      </div>
    </div>
  )
}
