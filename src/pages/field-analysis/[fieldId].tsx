// Field Analysis - Detailed Analysis Dashboard

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
  Layers,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

import FieldStats from '#components/FieldAnalysis/FieldStats'
import SoilComposition from '#components/FieldAnalysis/SoilComposition'
import CropHistory from '#components/FieldAnalysis/CropHistory'
import ErosionAnalysis from '#components/FieldAnalysis/ErosionAnalysis'
import DrainageAssessment from '#components/FieldAnalysis/DrainageAssessment'
import ManagementZones from '#components/FieldAnalysis/ManagementZones'
import ResourceConcerns from '#components/FieldAnalysis/ResourceConcerns'
import ConservationPractices from '#components/FieldAnalysis/ConservationPractices'

const FieldMap = dynamic(() => import('#components/FieldAnalysis/FieldMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 flex h-full w-full items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12" style={{ border: '3px solid #e5e7eb', borderTopColor: '#16a34a' }}></div>
    </div>
  ),
})

type AnalysisSection = 'soil' | 'crops' | 'erosion' | 'drainage' | 'zones' | 'concerns' | 'practices'

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
}

export default function FieldAnalysisDetail() {
  const router = useRouter()
  const { fieldId } = router.query
  
  const [fieldData, setFieldData] = useState<FieldData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Set<AnalysisSection>>(
    new Set(['soil', 'erosion', 'concerns', 'practices'])
  )
  const [selectedSoil, setSelectedSoil] = useState<any>(null)
  const [activeLayers, setActiveLayers] = useState<string[]>(['soil-boundaries'])
  const [showCSBLayer, setShowCSBLayer] = useState(true)

  useEffect(() => {
    if (fieldId) {
      loadFieldData(fieldId as string)
    }
  }, [fieldId])

  const loadFieldData = async (id: string) => {
    setLoading(true)
    try {
      // Try to get data from session storage first
      const storedData = sessionStorage.getItem('selectedField')
      if (storedData) {
        const parsed = JSON.parse(storedData)
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
          hydrologicGroup: parsed.hydrologicGroup || 'B'
        })
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

  const toggleSection = (section: AnalysisSection) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
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

  return (
    <>
      <Head>
        <title>{fieldData.name} - Field Analysis</title>
        <meta name="description" content={`Comprehensive analysis for field ${fieldData.name}`} />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div 
          className="p-4 text-white flex-shrink-0"
          style={{ background: 'linear-gradient(to right, var(--color-conservation), var(--color-forest-700), var(--color-forest-800))' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/field-analysis"
                className="transition-colors"
                style={{ color: '#ffffff' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-forest-100)'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{fieldData.name}</h1>
                <p className="text-sm" style={{ color: 'var(--color-forest-100)' }}>
                  {fieldData.area} acres • CLU: {fieldData.clu_id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportReport}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: '#ffffff', color: 'var(--color-forest-700)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-forest-50)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
              <button
                className="p-2 rounded-lg transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <FieldStats fieldData={fieldData} />

        {/* Main Content - Split Screen */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Analysis Panels */}
          <div className="w-full lg:w-96 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
            <div className="p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5" style={{ color: 'var(--color-conservation)' }} />
                Field Analysis
              </h2>

              {/* Soil Composition Section */}
              <div className="mb-4">
                <button
                  onClick={() => toggleSection('soil')}
                  className="w-full flex items-center justify-between p-3 rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: expandedSections.has('soil') ? 'var(--color-forest-50)' : '#f9fafb',
                    border: expandedSections.has('soil') ? '1px solid var(--color-forest-200)' : '1px solid #e5e7eb'
                  }}
                >
                  <h3 className="font-semibold" style={{ color: 'var(--color-forest-800)' }}>
                    Soil Composition
                  </h3>
                  {expandedSections.has('soil') ? (
                    <ChevronDown className="w-5 h-5" style={{ color: 'var(--color-forest-600)' }} />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedSections.has('soil') && (
                  <div className="mt-2 p-4 rounded-lg" style={{ backgroundColor: '#fafafa', border: '1px solid #e5e7eb' }}>
                    <SoilComposition 
                      fieldId={fieldData.id}
                      onSoilSelect={setSelectedSoil}
                    />
                  </div>
                )}
              </div>

              {/* Crop History Section */}
              <div className="mb-4">
                <button
                  onClick={() => toggleSection('crops')}
                  className="w-full flex items-center justify-between p-3 rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: expandedSections.has('crops') ? 'var(--color-ocean-50)' : '#f9fafb',
                    border: expandedSections.has('crops') ? '1px solid var(--color-ocean-200)' : '1px solid #e5e7eb'
                  }}
                >
                  <h3 className="font-semibold" style={{ color: 'var(--color-ocean-800)' }}>
                    Crop History (5 Years)
                  </h3>
                  {expandedSections.has('crops') ? (
                    <ChevronDown className="w-5 h-5" style={{ color: 'var(--color-ocean-600)' }} />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedSections.has('crops') && (
                  <div className="mt-2 p-4 rounded-lg" style={{ backgroundColor: '#fafafa', border: '1px solid #e5e7eb' }}>
                    <CropHistory fieldId={fieldData.id} />
                  </div>
                )}
              </div>

              {/* Erosion Analysis Section */}
              <div className="mb-4">
                <button
                  onClick={() => toggleSection('erosion')}
                  className="w-full flex items-center justify-between p-3 rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: expandedSections.has('erosion') ? 'var(--color-clay-50)' : '#f9fafb',
                    border: expandedSections.has('erosion') ? '1px solid var(--color-clay-200)' : '1px solid #e5e7eb'
                  }}
                >
                  <h3 className="font-semibold" style={{ color: 'var(--color-clay-800)' }}>
                    Erosion Analysis
                  </h3>
                  {expandedSections.has('erosion') ? (
                    <ChevronDown className="w-5 h-5" style={{ color: 'var(--color-clay-600)' }} />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedSections.has('erosion') && (
                  <div className="mt-2 p-4 rounded-lg" style={{ backgroundColor: '#fafafa', border: '1px solid #e5e7eb' }}>
                    <ErosionAnalysis fieldId={fieldData.id} />
                  </div>
                )}
              </div>

              {/* Drainage Assessment Section */}
              <div className="mb-4">
                <button
                  onClick={() => toggleSection('drainage')}
                  className="w-full flex items-center justify-between p-3 rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: expandedSections.has('drainage') ? 'var(--color-sky-50)' : '#f9fafb',
                    border: expandedSections.has('drainage') ? '1px solid var(--color-sky-200)' : '1px solid #e5e7eb'
                  }}
                >
                  <h3 className="font-semibold" style={{ color: 'var(--color-sky-800)' }}>
                    Drainage Assessment
                  </h3>
                  {expandedSections.has('drainage') ? (
                    <ChevronDown className="w-5 h-5" style={{ color: 'var(--color-sky-600)' }} />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedSections.has('drainage') && (
                  <div className="mt-2 p-4 rounded-lg" style={{ backgroundColor: '#fafafa', border: '1px solid #e5e7eb' }}>
                    <DrainageAssessment fieldId={fieldData.id} />
                  </div>
                )}
              </div>

              {/* Management Zones Section */}
              <div className="mb-4">
                <button
                  onClick={() => toggleSection('zones')}
                  className="w-full flex items-center justify-between p-3 rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: expandedSections.has('zones') ? '#faf5ff' : '#f9fafb',
                    border: expandedSections.has('zones') ? '1px solid #e9d5ff' : '1px solid #e5e7eb'
                  }}
                >
                  <h3 className="font-semibold" style={{ color: '#6b21a8' }}>
                    Management Zones
                  </h3>
                  {expandedSections.has('zones') ? (
                    <ChevronDown className="w-5 h-5" style={{ color: '#7c3aed' }} />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedSections.has('zones') && (
                  <div className="mt-2 p-4 rounded-lg" style={{ backgroundColor: '#fafafa', border: '1px solid #e5e7eb' }}>
                    <ManagementZones fieldId={fieldData.id} />
                  </div>
                )}
              </div>

              {/* Resource Concerns Section */}
              <div className="mb-4">
                <button
                  onClick={() => toggleSection('concerns')}
                  className="w-full flex items-center justify-between p-3 rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: expandedSections.has('concerns') ? 'var(--color-assessment-light)' : '#f9fafb',
                    border: expandedSections.has('concerns') ? '1px solid var(--color-amber-200)' : '1px solid #e5e7eb'
                  }}
                >
                  <h3 className="font-semibold" style={{ color: 'var(--color-assessment)' }}>
                    Resource Concerns
                  </h3>
                  {expandedSections.has('concerns') ? (
                    <ChevronDown className="w-5 h-5" style={{ color: 'var(--color-assessment)' }} />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedSections.has('concerns') && (
                  <div className="mt-2 p-4 rounded-lg" style={{ backgroundColor: '#fafafa', border: '1px solid #e5e7eb' }}>
                    <ResourceConcerns fieldId={fieldData.id} />
                  </div>
                )}
              </div>

              {/* Conservation Practices Section */}
              <div className="mb-4">
                <button
                  onClick={() => toggleSection('practices')}
                  className="w-full flex items-center justify-between p-3 rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: expandedSections.has('practices') ? '#f0fdf4' : '#f9fafb',
                    border: expandedSections.has('practices') ? '1px solid #86efac' : '1px solid #e5e7eb'
                  }}
                >
                  <h3 className="font-semibold" style={{ color: '#15803d' }}>
                    Conservation Practices
                  </h3>
                  {expandedSections.has('practices') ? (
                    <ChevronDown className="w-5 h-5" style={{ color: '#16a34a' }} />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedSections.has('practices') && (
                  <div className="mt-2 p-4 rounded-lg" style={{ backgroundColor: '#fafafa', border: '1px solid #e5e7eb' }}>
                    <ConservationPractices fieldData={fieldData} />
                  </div>
                )}
              </div>

              {/* Generate Report Button */}
              <button
                onClick={handleExportReport}
                className="w-full mt-6 py-3 px-4 rounded-lg font-semibold transition-colors shadow-md flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(to right, #16a34a, #15803d)', color: '#ffffff' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #15803d, #166534)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #16a34a, #15803d)'}
              >
                <Download className="w-5 h-5" />
                Generate Full Report
              </button>
            </div>
          </div>

          {/* Right Panel - Interactive Map */}
          <div className="flex-1 flex flex-col" style={{ minHeight: 0 }}>
            <FieldMap
              mode="analysis"
              fieldData={fieldData}
              selectedSoil={selectedSoil}
              activeLayers={activeLayers}
              showCSBLayer={showCSBLayer}
              onCSBLayerToggle={() => setShowCSBLayer(!showCSBLayer)}
              onLayerToggle={(layerId) => {
                setActiveLayers(prev => 
                  prev.includes(layerId) 
                    ? prev.filter(id => id !== layerId)
                    : [...prev, layerId]
                )
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
