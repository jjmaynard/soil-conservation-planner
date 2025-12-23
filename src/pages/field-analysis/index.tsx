// Field Analysis - Landing Page with Field Selection

'use client'

import { useState, useCallback, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { Search, Map as MapIcon, Edit3, Upload, ChevronRight, Zap, Eye, Pencil, FileUp, ArrowLeft } from 'lucide-react'

const FieldMap = dynamic(() => import('#components/FieldAnalysis/FieldMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 flex h-full w-full items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 mx-auto mb-4" style={{ border: '3px solid #e5e7eb', borderTopColor: '#16a34a' }}></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
})

type SelectionMethod = 'search' | 'browse' | 'draw' | 'upload' | null

export default function FieldAnalysisLanding() {
  const router = useRouter()
  const [selectionMethod, setSelectionMethod] = useState<SelectionMethod>('browse')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCLULayer, setShowCLULayer] = useState(true)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isFromPlanningWizard, setIsFromPlanningWizard] = useState(false)

  // Check if we're coming from planning wizard
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const returnFlag = sessionStorage.getItem('returnToPlanningWizard')
      setIsFromPlanningWizard(returnFlag === 'true')
    }
  }, [])

  const handleFieldSelected = useCallback((fieldData: any) => {
    // Check if we're in planning wizard mode
    const returnToPlanningWizard = typeof window !== 'undefined' 
      ? sessionStorage.getItem('returnToPlanningWizard') === 'true'
      : false

    if (returnToPlanningWizard) {
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
      
      // Return to planning wizard
      router.push('/conservation/planning-wizard')
    } else {
      // Normal flow - navigate to detailed analysis
      const fieldId = fieldData.clu_id || `field-${Date.now()}`
      
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('selectedField', JSON.stringify(fieldData))
      }
      
      router.push(`/field-analysis/${fieldId}`)
    }
  }, [router])

  const handleMethodSelect = (method: SelectionMethod) => {
    setSelectionMethod(method)
    if (method === 'browse') {
      setShowCLULayer(true)
    } else {
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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // TODO: Implement geocoding search
      console.log('Searching for:', searchQuery)
    }
  }

  return (
    <>
      <Head>
        <title>Field Analysis - Soil Conservation Explorer</title>
        <meta 
          name="description" 
          content="Comprehensive field-level soil assessment and analysis" 
        />
      </Head>

      <div className="h-screen flex flex-col">
        {/* Planning Wizard Banner */}
        {isFromPlanningWizard && (
          <div 
            className="px-6 py-2 text-white flex items-center justify-between"
            style={{ background: 'linear-gradient(to right, #3b82f6, #2563eb)' }}
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
              className="text-sm underline hover:text-blue-100"
            >
              Cancel & Return
            </button>
          </div>
        )}

        {/* Compact Header */}
        <div 
          className="px-6 py-3 text-white flex-shrink-0"
          style={{ background: 'linear-gradient(to right, #16a34a, #15803d)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Field Analysis</h1>
              <p className="text-xs" style={{ color: '#dcfce7' }}>
                {isFromPlanningWizard 
                  ? 'Click on a field to add it to your conservation plan'
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
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', border: '1px solid #e5e7eb', maxWidth: '320px' }}
          >
            <div className="px-4 py-3" style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <h3 className="font-semibold text-gray-900 text-sm">Selection Method</h3>
            </div>
            
            {/* Method Tabs */}
            <div className="grid grid-cols-4 border-b border-gray-200">
              <button
                onClick={() => handleMethodSelect('search')}
                className="px-3 py-2.5 text-xs font-medium transition-colors border-b-2"
                style={{ 
                  color: selectionMethod === 'search' ? '#16a34a' : '#6b7280',
                  borderBottomColor: selectionMethod === 'search' ? '#16a34a' : 'transparent',
                  backgroundColor: selectionMethod === 'search' ? '#f0fdf4' : 'transparent'
                }}
              >
                <Search className="w-4 h-4 mx-auto mb-1" />
                Search
              </button>
              <button
                onClick={() => handleMethodSelect('browse')}
                className="px-3 py-2.5 text-xs font-medium transition-colors border-b-2"
                style={{ 
                  color: selectionMethod === 'browse' ? '#2563eb' : '#6b7280',
                  borderBottomColor: selectionMethod === 'browse' ? '#2563eb' : 'transparent',
                  backgroundColor: selectionMethod === 'browse' ? '#eff6ff' : 'transparent'
                }}
              >
                <MapIcon className="w-4 h-4 mx-auto mb-1" />
                Browse
              </button>
              <button
                onClick={() => handleMethodSelect('draw')}
                className="px-3 py-2.5 text-xs font-medium transition-colors border-b-2"
                style={{ 
                  color: selectionMethod === 'draw' ? '#d97706' : '#6b7280',
                  borderBottomColor: selectionMethod === 'draw' ? '#d97706' : 'transparent',
                  backgroundColor: selectionMethod === 'draw' ? '#fef3c7' : 'transparent'
                }}
              >
                <Edit3 className="w-4 h-4 mx-auto mb-1" />
                Draw
              </button>
              <button
                onClick={() => handleMethodSelect('upload')}
                className="px-3 py-2.5 text-xs font-medium transition-colors border-b-2"
                style={{ 
                  color: selectionMethod === 'upload' ? '#7c3aed' : '#6b7280',
                  borderBottomColor: selectionMethod === 'upload' ? '#7c3aed' : 'transparent',
                  backgroundColor: selectionMethod === 'upload' ? '#f3e8ff' : 'transparent'
                }}
              >
                <Upload className="w-4 h-4 mx-auto mb-1" />
                Upload
              </button>
            </div>

            {/* Method-Specific Controls */}
            <div className="p-4">
              {selectionMethod === 'search' && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-600 mb-2">
                    Enter CLU ID, tract number, or physical address
                  </p>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="e.g., IA-169-123-001 or 123 Farm Rd"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={!searchQuery.trim()}
                    className="w-full px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
                    style={{ backgroundColor: '#16a34a' }}
                  >
                    Search Location
                  </button>
                  <div className="flex items-center gap-1 text-xs" style={{ color: '#16a34a' }}>
                    <Zap className="w-3 h-3" />
                    <span>Fastest method</span>
                  </div>
                </div>
              )}

              {selectionMethod === 'browse' && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-600 mb-2">
                    Navigate the map and click on a CLU boundary to select
                  </p>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showCLULayer}
                      onChange={(e) => setShowCLULayer(e.target.checked)}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: '#2563eb' }}
                    />
                    <span className="text-gray-700">Show CLU Boundaries</span>
                  </label>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#eff6ff' }}>
                    <p className="text-xs" style={{ color: '#1e40af' }}>
                      💡 Zoom in to see field boundaries. Click any field to analyze it.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs" style={{ color: '#2563eb' }}>
                    <Eye className="w-3 h-3" />
                    <span>Visual & Interactive</span>
                  </div>
                </div>
              )}

              {selectionMethod === 'draw' && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-600 mb-2">
                    Use drawing tools to create a custom field boundary
                  </p>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}>
                    <p className="text-xs mb-2" style={{ color: '#92400e' }}>
                      <strong>Instructions:</strong>
                    </p>
                    <ol className="text-xs space-y-1" style={{ color: '#92400e' }}>
                      <li>1. Click polygon tool on map</li>
                      <li>2. Click points to draw boundary</li>
                      <li>3. Double-click to finish</li>
                    </ol>
                  </div>
                  <div className="flex items-center gap-1 text-xs" style={{ color: '#d97706' }}>
                    <Pencil className="w-3 h-3" />
                    <span>Custom & Flexible</span>
                  </div>
                </div>
              )}

              {selectionMethod === 'upload' && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-600 mb-2">
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
                      <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: '#7c3aed' }} />
                      {uploadedFile ? (
                        <p className="text-xs font-medium text-gray-900">{uploadedFile.name}</p>
                      ) : (
                        <>
                          <p className="text-xs font-medium text-gray-700">Click to upload</p>
                          <p className="text-xs text-gray-500 mt-1">Shapefile, KML, or GeoJSON</p>
                        </>
                      )}
                    </label>
                  </div>
                  {uploadedFile && (
                    <button
                      className="w-full px-4 py-2 text-sm font-medium text-white rounded-lg"
                      style={{ backgroundColor: '#7c3aed' }}
                    >
                      Process File
                    </button>
                  )}
                  <div className="flex items-center gap-1 text-xs" style={{ color: '#7c3aed' }}>
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
            onFieldSelected={handleFieldSelected}
          />
        </div>
      </div>
    </>
  )
}
