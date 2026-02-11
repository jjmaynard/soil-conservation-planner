// Hybrid Field Analysis Layout - Main Component

'use client'

import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Download, 
  LayoutDashboard,
  FileText,
  Map as MapIcon,
  Settings
} from 'lucide-react'

import FieldStats from '#components/FieldAnalysis/FieldStats'
import DashboardView from '#components/FieldAnalysis/layouts/DashboardView'
import DetailView from '#components/FieldAnalysis/layouts/DetailView'
import { useFieldSSURGO, type ProcessedFieldData } from '#hooks/useFieldSSURGO'
import { useComprehensiveFieldAssessment } from '#hooks/useComprehensiveFieldAssessment'

type ViewMode = 'dashboard' | 'detail'

interface FieldData {
  id: string
  name: string
  area: number
  clu_id?: string
  boundary: any
  soils?: any[]
  cropHistory?: any[]
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

export default function HybridFieldAnalysis() {
  const router = useRouter()
  const { fieldId } = router.query
  
  const [fieldData, setFieldData] = useState<FieldData | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [selectedSoil, setSelectedSoil] = useState<any>(null)
  const [activeLayers, setActiveLayers] = useState<string[]>(['soil-boundaries'])
  const [showCSBLayer, setShowCSBLayer] = useState(true)
  const [activeDetailTab, setActiveDetailTab] = useState('soil')
  
  // SSURGO integration
  const { fieldData: ssurgoData, loading: ssurgoLoading, error: ssurgoError, queryField } = useFieldSSURGO()
  
  // GEE comprehensive assessment
  const { 
    data: geeData, 
    loading: geeLoading, 
    error: geeError, 
    assessField 
  } = useComprehensiveFieldAssessment()

  // Track if GEE assessment has been called to prevent duplicates
  const [geeAssessed, setGeeAssessed] = useState(false)

  const loadFieldData = useCallback(async (id: string) => {
    setLoading(true)
    setGeeAssessed(false)
    try {
      const storedData = sessionStorage.getItem('selectedField')
      if (storedData) {
        const parsed = JSON.parse(storedData)
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
        
        if (parsed.boundary) {
          console.log('Querying SSURGO for field boundary...')
          try {
            await queryField(parsed.boundary)
          } catch (error) {
            console.error('Failed to query SSURGO:', error)
          }
        } else {
          console.warn('No field boundary available for analysis queries')
        }
      } else {
        setFieldData({
          id: id,
          name: 'North 40',
          area: 45.3,
          acres: 45.3,
          clu_id: '12-345-6789',
          boundary: null,
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
  }, [queryField])

  useEffect(() => {
    if (fieldId) {
      loadFieldData(fieldId as string)
    }
  }, [fieldId, loadFieldData])

  // Separate effect to trigger GEE assessment after SSURGO data loads
  useEffect(() => {
    const runGeeAssessment = async () => {
      if (fieldData?.boundary && ssurgoData && !geeAssessed && !ssurgoLoading) {
        console.log('Querying GEE comprehensive assessment...')
        setGeeAssessed(true)
        try {
          await assessField(fieldData.boundary, ssurgoData, new Date().getFullYear())
        } catch (error) {
          console.error('Failed to query GEE assessment:', error)
          setGeeAssessed(false)
        }
      }
    }

    runGeeAssessment()
  }, [fieldData?.boundary, ssurgoData, geeAssessed, ssurgoLoading, assessField])



  const handleCardClick = (section: string) => {
    setViewMode('detail')
    setActiveDetailTab(section)
  }

  const handleExportReport = () => {
    console.log('Exporting field analysis report...')
  }

  if (loading || !fieldData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 mx-auto mb-4" style={{ border: '4px solid #e5e7eb', borderTopColor: '#16a34a' }}></div>
          <p className="text-gray-600">Loading field analysis...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{fieldData.name} - Field Analysis (Hybrid Layout)</title>
        <meta name="description" content={`Comprehensive analysis for field ${fieldData.name}`} />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div 
          className="p-4 text-white flex-shrink-0"
          style={{ background: 'linear-gradient(to right, #16a34a, #15803d, #166534)' }}
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
                <h1 className="text-2xl font-bold">{fieldData.name}</h1>
                <p className="text-sm opacity-90">
                  {fieldData.area} acres • CSB: {fieldData.clu_id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
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

        {/* Quick Stats Bar */}
        <FieldStats fieldData={fieldData} ssurgoData={ssurgoData} />

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'dashboard' ? (
            <DashboardView
              fieldData={fieldData}
              ssurgoData={ssurgoData}
              geeData={geeData}
              onCardClick={handleCardClick}
            />
          ) : (
            <DetailView
              fieldData={fieldData}
              ssurgoData={ssurgoData}
              geeData={geeData}
              activeTab={activeDetailTab}
              onTabChange={setActiveDetailTab}
              onSoilSelect={setSelectedSoil}
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
          )}
        </div>
      </div>
    </>
  )
}
