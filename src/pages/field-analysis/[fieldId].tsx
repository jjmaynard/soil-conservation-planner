// Field Analysis - Detailed Analysis Dashboard with SSURGO Integration

'use client'

import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { 
  ArrowLeft, 
  Download, 
  Settings,
  LayoutDashboard,
  FileText,
  Map as MapIcon,
  TrendingDown,
  Sprout,
  Droplets,
  FileCheck,
  List,
  Wheat,
  Trees,
  Mountain,
  Building2
} from 'lucide-react'

import FieldStats from '#components/FieldAnalysis/FieldStats'
import DashboardView from '#components/FieldAnalysis/layouts/DashboardView'
import DetailView, { TAB_LAYER_CONFIG, type TabId } from '#components/FieldAnalysis/layouts/DetailView'
import { useFieldSSURGO, type ProcessedFieldData } from '#hooks/useFieldSSURGO'
import { useComprehensiveFieldAssessment } from '#hooks/useComprehensiveFieldAssessment'
import { getLandType } from '@/config/land-types'
import { getUseCase } from '@/config/use-cases'

const FieldMap = dynamic(() => import('#components/FieldAnalysis/FieldMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 flex h-full w-full items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8" style={{ border: '2px solid #e5e7eb', borderTopColor: '#16a34a' }}></div>
    </div>
  ),
})

type ViewMode = 'dashboard' | 'detail'

interface FieldData {
  id: string
  name: string
  area: number
  clu_id?: string
  boundary: any
  soils?: any[]
  cropHistory?: any[]
  // Conservation practice inputs
  erosionRate?: number
  slope?: number
  drainageClass?: string
  organicMatter?: number
  soilDepth?: number
  floodFrequency?: string
  landCapabilityClass?: string
  hydrologicGroup?: string
  acres?: number
  landType?: string
}

export default function FieldAnalysisDetail() {
  const router = useRouter()
  const { fieldId } = router.query
  
  const [fieldData, setFieldData] = useState<FieldData | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('detail')
  const [selectedSoil, setSelectedSoil] = useState<any>(null)
  const [activeLayers, setActiveLayers] = useState<string[]>(['soil-boundaries'])
  const [showCSBLayer, setShowCSBLayer] = useState(true)
  const [activeDetailTab, setActiveDetailTab] = useState('soil')
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null)
  const [selectedLandType, setSelectedLandType] = useState<string | null>(null)
  
  // SSURGO integration
  const { fieldData: ssurgoData, loading: ssurgoLoading, error: ssurgoError, queryField } = useFieldSSURGO()
  
  // GEE comprehensive assessment
  const { 
    data: geeData, 
    loading: geeLoading, 
    error: geeError, 
    assessField,
    assessCropProductivity
  } = useComprehensiveFieldAssessment()

  // Track if GEE assessment has been called to prevent duplicates
  const [geeAssessed, setGeeAssessed] = useState(false)

  // Debug: Log ssurgoData updates
  useEffect(() => {
    console.log('[FieldAnalysisDetail] SSURGO data updated:', ssurgoData)
    console.log('[FieldAnalysisDetail] ssurgoData.soils:', ssurgoData?.soils)
    console.log('[FieldAnalysisDetail] ssurgoLoading:', ssurgoLoading)
    console.log('[FieldAnalysisDetail] ssurgoError:', ssurgoError)
  }, [ssurgoData, ssurgoLoading, ssurgoError])

  useEffect(() => {
    if (fieldId) {
      loadFieldData(fieldId as string)
    }
    
    // Retrieve selected use case from session storage or query params
    const useCase = (router.query.useCase as string) || 
                    (typeof window !== 'undefined' ? sessionStorage.getItem('analysisUseCase') : null)
    
    if (useCase) {
      setSelectedUseCase(useCase)
    }
    
    // Retrieve selected land type from session storage
    const landType = typeof window !== 'undefined' ? sessionStorage.getItem('analysisLandType') : null
    if (landType) {
      setSelectedLandType(landType)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldId, router.query.useCase])

  // Separate effect to trigger GEE assessment after SSURGO data loads
  useEffect(() => {
    const runGeeAssessment = async () => {
      // Only run if:
      // 1. We have field data with a boundary
      // 2. SSURGO data has loaded
      // 3. We haven't already assessed this field
      // 4. We're not currently loading SSURGO
      if (fieldData?.boundary && ssurgoData && !geeAssessed && !ssurgoLoading) {
        console.log('Querying GEE comprehensive assessment...')
        setGeeAssessed(true) // Set flag before calling to prevent duplicates
        try {
          // Extract geometry from GeoJSON Feature if needed
          let geometry = fieldData.boundary
          if (geometry.type === 'Feature' && geometry.geometry) {
            geometry = geometry.geometry
          }
          
          // Pass fieldId for better cache management (crop-specific will be lazy loaded)
          await assessField(geometry, ssurgoData, new Date().getFullYear(), fieldData.id || fieldData.clu_id)
        } catch (error) {
          console.error('Failed to query GEE assessment:', error)
          setGeeAssessed(false) // Reset flag on error to allow retry
        }
      }
    }

    runGeeAssessment()
  }, [fieldData?.boundary, fieldData?.id, fieldData?.clu_id, ssurgoData, geeAssessed, ssurgoLoading, assessField])

  const loadFieldData = async (id: string) => {
    setLoading(true)
    setGeeAssessed(false) // Reset GEE assessment flag
    try {
      // Try to get data from session storage first
      const storedData = sessionStorage.getItem('selectedField')
      console.log('[LoadFieldData] sessionStorage data:', storedData ? 'found' : 'NOT FOUND')
      
      if (storedData) {
        const parsed = JSON.parse(storedData)
        console.log('[LoadFieldData] Parsed field data:', parsed)
        console.log('[LoadFieldData] Parsed boundary:', parsed.boundary)
        console.log('[LoadFieldData] Boundary exists?', !!parsed.boundary)
        
        // Add demo conservation data if not present
        setFieldData({
          ...parsed,
          acres: parsed.acres || parsed.area || 100,
          erosionRate: parsed.erosionRate || 6.2,
          slope: parsed.slope || 8.5,
          drainageClass: parsed.drainageClass || 'Moderately well drained',
          organicMatter: parsed.organicMatter || 2.3,
          soilDepth: parsed.soilDepth || 36,
          floodFrequency: parsed.floodFrequency || 'None',
          landCapabilityClass: parsed.landCapabilityClass || 'IIIe',
          hydrologicGroup: parsed.hydrologicGroup || 'B',
          landType: parsed.landType || (typeof window !== 'undefined' ? sessionStorage.getItem('analysisLandType') : null)
        })
        
        // Query SSURGO data if boundary is available
        console.log('[LoadFieldData] Checking if should query SSURGO...')
        if (parsed.boundary) {
          const expectedAcres = parsed.acres || parsed.area || 0
          console.log('[LoadFieldData] Querying SSURGO for field boundary...')
          console.log('[LoadFieldData] Field ID:', id)
          console.log('[LoadFieldData] Boundary:', parsed.boundary)
          console.log('[LoadFieldData] Expected acres:', expectedAcres)
          
          try {
            // Extract geometry from GeoJSON Feature if needed
            // Custom drawn fields save as Feature, CSB fields save as Polygon geometry
            let geometry = parsed.boundary
            if (geometry.type === 'Feature' && geometry.geometry) {
              console.log('[LoadFieldData] Extracting geometry from Feature object')
              geometry = geometry.geometry
            }
            console.log('[LoadFieldData] Final geometry type:', geometry.type)
            
            await queryField(geometry, expectedAcres, id)
            console.log('[LoadFieldData] ✅ SSURGO query completed successfully')
          } catch (error) {
            console.error('[LoadFieldData] ❌ Failed to query SSURGO:', error)
          }
          
          // GEE assessment will be triggered separately in useEffect after SSURGO loads
        } else {
          console.warn('[LoadFieldData] No field boundary available for analysis queries - cannot run GEE assessment')
        }
      } else {
        // Fetch from API
        // const response = await fetch(`/api/field-analysis/${id}`)
        // const data = await response.json()
        // setFieldData(data)
        
        // Placeholder data with conservation practice inputs
        setFieldData({
          id: id,
          name: 'North 40',
          area: 45.3,
          acres: 45.3,
          clu_id: '12-345-6789',
          boundary: null,
          // Conservation practice data
          erosionRate: 6.2,
          slope: 8.5,
          drainageClass: 'Moderately well drained',
          organicMatter: 2.3,
          soilDepth: 36,
          floodFrequency: 'None',
          landCapabilityClass: 'IIIe',
          hydrologicGroup: 'B'
        })
      }
    } catch (error) {
      console.error('Error loading field data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDetailTabChange = (tabId: string) => {
    setActiveDetailTab(tabId)
    
    // Update active layers based on the tab configuration
    // Use type assertion since tabId matches config keys
    const config = TAB_LAYER_CONFIG[tabId as TabId]
    if (config) {
      // Set active layers to the ones marked as default for this tab
      const defaultLayers = config
        .filter(layer => layer.default)
        .map(layer => layer.id)
      
      setActiveLayers(defaultLayers)
    }
  }

  const handleCardClick = (section: string) => {
    setViewMode('detail')
    // Use the comprehensive handler to ensure layers are synced
    handleDetailTabChange(section)
  }

  const handleExportReport = () => {
    console.log('Exporting field analysis report...')
    // Implement PDF export
  }

  if (loading || !fieldData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 mx-auto mb-4" style={{ border: '4px solid #e5e7eb', borderTopColor: 'var(--color-forest-600)' }}></div>
          <p className="text-gray-600">Loading field analysis...</p>
        </div>
      </div>
    )
  }

  const getLandTypeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wheat': return Wheat;
      case 'Trees': return Trees;
      case 'Mountain': return Mountain;
      case 'Droplets': return Droplets;
      case 'Building2': return Building2;
      case 'Sprout': return Sprout;
      default: return Sprout;
    }
  }

  const landTypeInfo = fieldData.landType ? getLandType(fieldData.landType) : null
  const LandIcon = landTypeInfo ? getLandTypeIcon(landTypeInfo.icon) : null

  return (
    <>
      <Head>
        <title>{fieldData.name} - Field Analysis</title>
        <meta name="description" content={`Comprehensive analysis for field ${fieldData.name}`} />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div 
          className="p-2 text-white flex-shrink-0 rounded-lg"
          style={{ background: 'linear-gradient(to right, var(--color-conservation), var(--color-forest-700))' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/field-analysis"
                className="transition-opacity hover:opacity-80"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold tracking-tight">{fieldData.name}</h1>
                  
                  {/* Combined Land Type and Use Case Badge */}
                  {landTypeInfo && selectedUseCase && (() => {
                    const useCaseInfo = getUseCase(selectedUseCase);
                    return useCaseInfo ? (
                      <span 
                        className="text-xs px-3 py-1 rounded-full font-medium"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
                      >
                        {landTypeInfo.name} - {useCaseInfo.short_name}
                      </span>
                    ) : null;
                  })()}
                </div>
                <p className="text-xs opacity-90">
                  {fieldData.area} acres • CSB: {fieldData.clu_id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <button
                  onClick={() => setViewMode('detail')}
                  className="flex items-center gap-2 px-3 py-2 rounded-md transition-all text-sm font-medium"
                  style={{
                    backgroundColor: viewMode === 'detail' ? '#ffffff' : 'transparent',
                    color: viewMode === 'detail' ? '#16a34a' : '#ffffff'
                  }}
                >
                  <FileText className="w-4 h-4" />
                  Detail
                </button>
                <button
                  onClick={() => setViewMode('dashboard')}
                  className="flex items-center gap-2 px-3 py-2 rounded-md transition-all text-sm font-medium"
                  style={{
                    backgroundColor: viewMode === 'dashboard' ? '#ffffff' : 'transparent',
                    color: viewMode === 'dashboard' ? '#16a34a' : '#ffffff'
                  }}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExportReport}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-white"
                style={{ color: '#16a34a' }}
              >
                <Download className="w-4 h-4" />
                Export
              </button>

              {/* Settings */}
              <button
                className="p-2 rounded-lg transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar - Only show in dashboard view */}
        {viewMode === 'dashboard' && (
          <FieldStats fieldData={fieldData} ssurgoData={ssurgoData} />
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'dashboard' ? (
            <DashboardView
              fieldData={fieldData}
              ssurgoData={ssurgoData}
              geeData={geeData}
              onCardClick={handleCardClick}
            />
          ) : (
            <>
              {/* Debug logging */}
              {console.log('[FieldAnalysisDetail] Rendering DetailView with ssurgoData:', ssurgoData)}
              <DetailView
                fieldData={fieldData}
                ssurgoData={ssurgoData}
                geeData={geeData}
                activeTab={activeDetailTab}
                onTabChange={handleDetailTabChange}
                onSoilSelect={setSelectedSoil}
                selectedSoil={selectedSoil}
                selectedUseCase={selectedUseCase}
                activeLayers={activeLayers}
                showCSBLayer={showCSBLayer}
                onCSBLayerToggle={() => setShowCSBLayer(!showCSBLayer)}
                onLayerToggle={(layerId) => {
                  setActiveLayers(prev =>
                    prev.includes(layerId) ? [] : [layerId]
                  )
                }}
                assessCropProductivity={assessCropProductivity}
              />
            </>
          )}
        </div>
      </div>
    </>
  )
}
