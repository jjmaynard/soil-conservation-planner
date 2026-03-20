// Field Analysis - Landing Page with Field Selection

'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import * as LucideIcons from 'lucide-react'
import { Search, Map as MapIcon, Edit3, Upload, ChevronRight, Zap, Eye, Pencil, FileUp, ArrowLeft, TrendingDown, Sprout, Droplets, FileCheck, List } from 'lucide-react'
import type { FieldMapRef } from '#components/FieldAnalysis/FieldMap'
import { LandTypeSelector } from '#components/FieldAnalysis/LandTypeSelector'
import { FieldUseCaseSelector } from '#components/FieldAnalysis/FieldUseCaseSelector'
import { getLandType } from '@/config/land-types'
import { getUseCase } from '@/config/use-cases'

const FieldMap = dynamic(() => import('#components/FieldAnalysis/FieldMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 flex h-full w-full items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 mx-auto mb-4" style={{ border: '3px solid #e5e7eb', borderTopColor: 'var(--color-conservation)' }}></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
}) as any

type SelectionMethod = 'search' | 'browse' | 'draw' | 'upload' | null

export default function FieldAnalysisLanding() {
  const router = useRouter()
  const [selectedLandType, setSelectedLandType] = useState<string | null>(null)
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null)
  const [selectionMethod, setSelectionMethod] = useState<SelectionMethod>('browse')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCLULayer, setShowCLULayer] = useState(false)
  const [showCSBLayer, setShowCSBLayer] = useState(true)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isFromPlanningWizard, setIsFromPlanningWizard] = useState(false)
  const [isFromRUSLE, setIsFromRUSLE] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [mapControls, setMapControls] = useState<{ panToLocation?: (lat: number, lng: number, zoom?: number) => void }>({})

  // Check if we're coming from planning wizard or RUSLE-EOS
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const planningFlag = sessionStorage.getItem('returnToPlanningWizard')
      const rusleFlag = sessionStorage.getItem('returnToRUSLE')
      setIsFromPlanningWizard(planningFlag === 'true')
      setIsFromRUSLE(rusleFlag === 'true')
      
      // Only auto-select use case for special modes or explicit query params
      // Don't use session storage to allow fresh selection each time
      const queryUseCase = router.query.useCase as string | undefined
      
      if (queryUseCase) {
        // Direct link with use case in URL
        setSelectedUseCase(queryUseCase)
      } else if (planningFlag === 'true' || rusleFlag === 'true') {
        // Auto-select comprehensive for special modes
        setSelectedUseCase('comprehensive')
      }
      // Otherwise, show use case selector (selectedUseCase remains null)
    }
  }, [router.query.useCase])

  const handleFieldSelected = useCallback((fieldData: any) => {
    // Check if we're in planning wizard or RUSLE-EOS mode
    const returnToPlanningWizard = typeof window !== 'undefined' 
      ? sessionStorage.getItem('returnToPlanningWizard') === 'true'
      : false
    
    const returnToRUSLE = typeof window !== 'undefined'
      ? sessionStorage.getItem('returnToRUSLE') === 'true'
      : false

    if (returnToRUSLE) {
      // Return to RUSLE-EOS with selected field
      sessionStorage.removeItem('returnToRUSLE')
      sessionStorage.removeItem('returnToPlanningWizard')
      
      // Navigate to RUSLE-EOS with field data in query params
      const fieldId = fieldData.clu_id || fieldData.csb_id || `field-${Date.now()}`
      
      // Store field data for RUSLE-EOS to retrieve
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('rusleSelectedField', JSON.stringify(fieldData))
      }
      
      router.push(`/tools/rusle-eos?fieldId=${encodeURIComponent(fieldId)}`)
    } else if (returnToPlanningWizard) {
      // Add field to planning wizard and return
      const wizardState = JSON.parse(sessionStorage.getItem('planningWizardState') || '{}')
      const selectedFields = wizardState.selectedFields || []
      
      // Add new field with relevant data
      selectedFields.push({
        clu_id: fieldData.clu_id,
        name: fieldData.name || fieldData.clu_id,
        acres: fieldData.acres,
        geometry: fieldData.geometry,
        addedAt: new Date().toISOString()
      })
      
      wizardState.selectedFields = selectedFields
      sessionStorage.setItem('planningWizardState', JSON.stringify(wizardState))
      
      // Clear flags and return to planning wizard
      sessionStorage.removeItem('returnToPlanningWizard')
      sessionStorage.removeItem('returnToRUSLE')
      router.push('/conservation/planning-wizard')
    } else {
      // Normal flow - navigate to detailed analysis with use case
      const fieldId = fieldData.clu_id || `field-${Date.now()}`
      
      if (typeof window !== 'undefined') {
        // Add selected land type to field data before storing
        const fieldDataToStore = {
          ...fieldData,
          landType: selectedLandType
        }
        
        sessionStorage.setItem('selectedField', JSON.stringify(fieldDataToStore))
        
        // Store selected use case for analysis page
        if (selectedUseCase) {
          sessionStorage.setItem('analysisUseCase', selectedUseCase)
        }
        
        // Store selected land type separately as well
        if (selectedLandType) {
          sessionStorage.setItem('analysisLandType', selectedLandType)
        }
      }
      
      // Include use case in URL
      const url = selectedUseCase 
        ? `/field-analysis/${fieldId}?useCase=${selectedUseCase}`
        : `/field-analysis/${fieldId}`
      
      router.push(url)
    }
  }, [router, selectedUseCase, selectedLandType])

  const handleMethodSelect = (method: SelectionMethod) => {
    setSelectionMethod(method)
    if (method === 'browse') {
      setShowCSBLayer(true)
      setShowCLULayer(false)
    } else {
      setShowCSBLayer(false)
      setShowCLULayer(false)
    }
    setSearchQuery('')
    setUploadedFile(null)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      // TODO: Process file (shapefile/KML/GeoJSON)
      console.log('File uploaded:', file.name)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setSearchSuggestions([])

    try {
      // Check if input is coordinates (lat,lng format)
      const coordMatch = searchQuery.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/)
      if (coordMatch) {
        const lat = parseFloat(coordMatch[1])
        const lng = parseFloat(coordMatch[2])
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          // Pan map to coordinates
          if (mapControls.panToLocation) {
            mapControls.panToLocation(lat, lng, 15)
          }
          setSearchQuery('')
          setShowSuggestions(false)
          setIsSearching(false)
          return
        }
      }

      // Use Nominatim (OpenStreetMap) geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=us&limit=5`
      )
      
      if (response.ok) {
        const results = await response.json()
        if (results.length > 0) {
          setSearchSuggestions(results)
          setShowSuggestions(true)
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSuggestionClick = (result: any) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    
    // Log the result to see what fields are available
    console.log('Search result object:', result)
    console.log('Type:', result.type, 'Class:', result.class, 'OSM Type:', result.osm_type)
    
    // Determine appropriate zoom level based on place type
    let zoom = 15 // Default for addresses and specific locations
    
    // Check for state/boundary (administrative boundaries)
    if (result.class === 'boundary' && result.type === 'administrative') {
      // Use address rank to distinguish state vs county vs other
      if (result.addresstype === 'state' || (result.address?.state && !result.address?.city)) {
        zoom = 7 // State level
      } else if (result.addresstype === 'county') {
        zoom = 10 // County level
      } else {
        zoom = 12 // Other administrative
      }
    }
    // Check for cities/towns
    else if (result.class === 'place' && (result.type === 'city' || result.type === 'town' || result.type === 'village')) {
      zoom = 13 // City/town level
    }
    // Check for neighborhoods, suburbs
    else if (result.class === 'place' && (result.type === 'suburb' || result.type === 'neighbourhood')) {
      zoom = 14 // Neighborhood level
    }

    console.log('Panning to location:', lat, lng, zoom)
    console.log('Map controls available:', !!mapControls.panToLocation)
    
    // Pan map to location
    if (mapControls.panToLocation) {
      console.log('Calling panToLocation')
      mapControls.panToLocation(lat, lng, zoom)
    } else {
      console.warn('Map controls not available yet')
    }

    setSearchQuery('')
    setShowSuggestions(false)
    setSearchSuggestions([])
  }

  return (
    <>
      <Head>
        <title>Field Analysis - Soil Interpretation Explorer</title>
        <meta 
          name="description" 
          content="Comprehensive field-level soil assessment and analysis" 
        />
      </Head>

      {/* Show Two-Stage Selector if land type or use case not selected and not in special modes */}
      {(!selectedLandType || !selectedUseCase) && !isFromPlanningWizard && !isFromRUSLE ? (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f9fafb' }}>
          {/* Header */}
          <div 
            className="px-6 py-2 text-white flex-shrink-0 rounded-lg mt-2"
            style={{ background: 'linear-gradient(to right, var(--color-conservation), var(--color-forest-700))' }}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <MapIcon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Field Analysis</h1>
                <p className="text-sm" style={{ color: 'var(--color-forest-100)' }}>
                  Select your analysis goal to get started
                </p>
              </div>
            </div>
          </div>

          {/* Two-Stage Selection: Land Type then Use Case */}
          <div className="flex-1 px-6 pt-6">
            {!selectedLandType ? (
              <LandTypeSelector
                onSelect={(landType) => {
                  setSelectedLandType(landType)
                  if (typeof window !== 'undefined') {
                    sessionStorage.setItem('analysisLandType', landType)
                  }
                }}
                selectedLandType={selectedLandType}
              />
            ) : (
              <div className="w-full max-w-6xl mx-auto">
                {/* Land Type Header with Badge */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-3 rounded-lg"
                        style={{ 
                          backgroundColor: getLandType(selectedLandType)?.color || '#6B7F39',
                          color: '#ffffff'
                        }}
                      >
                        {(() => {
                          const iconName = getLandType(selectedLandType)?.icon || 'Sprout';
                          const Icon = (LucideIcons as any)[iconName] || Sprout;
                          return <Icon className="w-6 h-6" />;
                        })()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-gray-900">
                            {getLandType(selectedLandType)?.display_name}
                          </h2>
                          <span 
                            className="text-xs px-2.5 py-1 rounded font-semibold"
                            style={{ 
                              backgroundColor: `${getLandType(selectedLandType)?.color}20`,
                              color: getLandType(selectedLandType)?.color
                            }}
                          >
                            Selected
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {getLandType(selectedLandType)?.description}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedLandType(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Change Land Type
                    </button>
                  </div>
                </div>

                <FieldUseCaseSelector
                  landTypeId={selectedLandType}
                  selectedUseCase={selectedUseCase}
                  onSelect={(useCase) => {
                    setSelectedUseCase(useCase)
                    if (typeof window !== 'undefined') {
                      sessionStorage.setItem('analysisUseCase', useCase)
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        // Show Field Selection Interface after use case is selected
        <div className="h-full min-h-0 flex flex-col overflow-hidden">
        {/* Planning Wizard Banner */}
        {isFromPlanningWizard && (
          <div 
            className="px-6 py-2 text-white flex items-center justify-between"
            style={{ background: 'linear-gradient(to right, var(--color-ocean-600), var(--color-ocean-700))' }}
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">
                Planning Wizard Mode: Select a field to add to your conservation plan
              </span>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem('returnToPlanningWizard')
                router.push('/conservation/planning-wizard')
              }}
              className="text-sm underline hover:text-ocean-100"
            >
              Cancel & Return
            </button>
          </div>
        )}

        {/* RUSLE-EOS Mode Banner */}
        {isFromRUSLE && (
          <div 
            className="px-6 py-2 text-white flex items-center justify-between"
            style={{ background: 'linear-gradient(to right, var(--color-conservation), var(--color-forest-700))' }}
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">
                RUSLE-EOS Mode: Select a field for erosion analysis
              </span>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem('returnToRUSLE')
                router.push('/tools/rusle-eos')
              }}
              className="text-sm underline hover:opacity-80"
            >
              Cancel & Return
            </button>
          </div>
        )}

        {/* Compact Header */}
        <div 
          className="px-6 py-2 text-white flex-shrink-0 rounded-lg"
          style={{ background: 'linear-gradient(to right, var(--color-conservation), var(--color-forest-700))' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight">Field Analysis</h1>
                {selectedLandType && selectedUseCase && (() => {
                  const landType = getLandType(selectedLandType)
                  const useCase = getUseCase(selectedUseCase)
                  return (
                    <span 
                      className="text-xs px-3 py-1 rounded-full font-medium"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                    >
                      {landType?.name} - {useCase?.short_name}
                    </span>
                  )
                })()}
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--color-forest-100)' }}>
                {isFromPlanningWizard 
                  ? 'Click on a field to add it to your conservation plan'
                  : isFromRUSLE
                  ? 'Click on a field for erosion analysis'
                  : 'Select a field using one of the methods below'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Main Content: Map + Controls */}
        <div className="flex-1 relative">
          {/* Method Selector - Top Left */}
          <div 
            className="absolute top-4 left-4 z-[1000] rounded-lg shadow-2xl overflow-hidden"
            style={{ backgroundColor: '#ffffff', border: '2px solid #d1d5db', maxWidth: '360px' }}
          >
            <div className="px-4 py-3" style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Field Selection</h3>
              <p className="text-xs text-gray-600">
                Navigate to your field by entering an address, city, state, or coordinates, 
                or manually navigate by scrolling and panning the map.
              </p>
            </div>

            {/* Search Section - Always Visible */}
            <div className="px-4 py-3" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder='e.g., "Lincoln, NE" or "41.25, -95.95"'
                    className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ 
                      backgroundColor: '#ffffff',
                      color: '#111827',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}
                  />
                  
                  {/* Suggestions dropdown */}
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div 
                      className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto"
                    >
                      {searchSuggestions.map((result, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(result)}
                          className="w-full text-left px-3 py-2.5 border-b border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <MapIcon className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate text-gray-900">
                                {result.display_name.split(',')[0]}
                              </div>
                              <div className="text-xs truncate text-gray-600">
                                {result.display_name.split(',').slice(1).join(',').trim()}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || isSearching}
                  className="w-full px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all disabled:opacity-50 shadow-sm"
                  style={{ backgroundColor: 'var(--color-conservation)' }}
                  onMouseEnter={(e) => {
                    if (searchQuery.trim() && !isSearching) {
                      e.currentTarget.style.backgroundColor = 'var(--color-forest-700)'
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-conservation)'
                    e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}
                >
                  {isSearching ? 'Searching...' : 'Search Location'}
                </button>
              </div>
            </div>

            {/* Selection Method Instructions */}
            <div className="px-4 py-3 text-center" style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <p className="text-xs font-medium text-gray-700">
                Then select your field using one of the methods below
              </p>
            </div>
            
            {/* Selection Method Tabs */}
            <div className="grid grid-cols-3 border-b border-gray-200" style={{ backgroundColor: '#ffffff' }}>
              <button
                onClick={() => handleMethodSelect('browse')}
                className="px-3 py-2.5 text-xs font-medium transition-colors border-b-2"
                style={{ 
                  color: selectionMethod === 'browse' ? '#1f2937' : '#6b7280',
                  borderBottomColor: selectionMethod === 'browse' ? 'var(--color-conservation)' : 'transparent',
                  backgroundColor: selectionMethod === 'browse' ? '#ffffff' : '#f3f4f6'
                }}
              >
                <Eye className="w-4 h-4 mx-auto mb-1" />
                Browse
              </button>
              <button
                onClick={() => handleMethodSelect('draw')}
                className="px-3 py-2.5 text-xs font-medium transition-colors border-b-2"
                style={{ 
                  color: selectionMethod === 'draw' ? '#1f2937' : '#6b7280',
                  borderBottomColor: selectionMethod === 'draw' ? 'var(--color-conservation)' : 'transparent',
                  backgroundColor: selectionMethod === 'draw' ? '#ffffff' : '#f3f4f6'
                }}
              >
                <Pencil className="w-4 h-4 mx-auto mb-1" />
                Draw
              </button>
              <button
                onClick={() => handleMethodSelect('upload')}
                className="px-3 py-2.5 text-xs font-medium transition-colors border-b-2"
                style={{ 
                  color: selectionMethod === 'upload' ? '#1f2937' : '#6b7280',
                  borderBottomColor: selectionMethod === 'upload' ? 'var(--color-conservation)' : 'transparent',
                  backgroundColor: selectionMethod === 'upload' ? '#ffffff' : '#f3f4f6'
                }}
              >
                <FileUp className="w-4 h-4 mx-auto mb-1" />
                Upload
              </button>
            </div>

            {/* Method-Specific Controls */}
            <div className="p-4">
              {selectionMethod === 'browse' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-900 mb-2">
                    Navigate the map and click on a field boundary to select it for analysis.
                  </p>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-ocean-50)' }}>
                    <p className="text-xs" style={{ color: '#111827' }}>
                      💡 Zoom in to level 13+ to see interactive field boundaries. Click any field to analyze it.
                    </p>
                  </div>
                </div>
              )}

              {selectionMethod === 'draw' && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-900 mb-2">
                    Use drawing tools to create a custom field boundary
                  </p>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-amber-50)', border: '1px solid var(--color-amber-200)' }}>
                    <p className="text-xs mb-2" style={{ color: '#111827' }}>
                      <strong>Instructions:</strong>
                    </p>
                    <ol className="text-xs space-y-1" style={{ color: '#111827' }}>
                      <li>1. Click polygon tool on map</li>
                      <li>2. Click points to draw boundary</li>
                      <li>3. Double-click to finish</li>
                    </ol>
                  </div>
                  <div className="flex items-center gap-1 text-xs" style={{ color: '#111827' }}>
                    <Pencil className="w-3 h-3" />
                    <span>Custom & Flexible</span>
                  </div>
                </div>
              )}

              {selectionMethod === 'upload' && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-900 mb-2">
                    Import existing field boundaries from file
                  </p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept=".zip,.shp,.kml,.geojson,.json"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-lavender-700)' }} />
                      {uploadedFile ? (
                        <p className="text-xs font-medium text-gray-900">{uploadedFile.name}</p>
                      ) : (
                        <>
                          <p className="text-xs font-medium text-gray-900">Click to upload</p>
                          <p className="text-xs text-gray-900 mt-1">Shapefile, KML, or GeoJSON</p>
                        </>
                      )}
                    </label>
                  </div>
                  {uploadedFile && (
                    <button
                      className="w-full px-4 py-2 text-sm font-medium text-white rounded-lg"
                      style={{ backgroundColor: 'var(--color-lavender-700)' }}
                    >
                      Process File
                    </button>
                  )}
                  <div className="flex items-center gap-1 text-xs" style={{ color: '#111827' }}>
                    <FileUp className="w-3 h-3" />
                    <span>Shapefile, KML, GeoJSON</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Full-Screen Map */}
          <FieldMap
            mode={selectionMethod || 'browse'}
            searchQuery={searchQuery}
            showCLULayer={showCLULayer}
            showCSBLayer={showCSBLayer}
            onCSBLayerToggle={() => setShowCSBLayer(!showCSBLayer)}
            onFieldSelected={handleFieldSelected}
            onMapReady={(controls: { panToLocation?: (lat: number, lng: number, zoom?: number) => void }) => setMapControls(controls)}
          />
        </div>
      </div>
      )}
    </>
  )
}
