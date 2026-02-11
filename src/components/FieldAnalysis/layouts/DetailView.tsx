// Detail View - Tabbed Analysis Layout

'use client'

import { useState } from 'react'
import { Layers, TrendingDown, Droplets, Target, Sprout, CloudRain, Wind, AlertTriangle, Eye, EyeOff, Maximize2, Map as MapIcon, TrendingUp, Mountain } from 'lucide-react'
import dynamic from 'next/dynamic'
import SoilComposition from '../SoilComposition'
import ErosionAnalysis from '../ErosionAnalysis'
import DrainageAssessment from '../DrainageAssessment'
import ProductivityAnalysis from '../ProductivityAnalysis'
import SVIAnalysis from '../SVIAnalysis'
import ConcentratedFlowAnalysis from '../ConcentratedFlowAnalysis'
import DroughtRiskAnalysis from '../DroughtRiskAnalysis'
import ResourceConcerns from '../ResourceConcerns'
import ConservationPractices from '../ConservationPractices'
import ManagementZones from '../ManagementZones'
import VegetationMonitoring from '../VegetationMonitoring'
import TerrainAttributes from '../TerrainAttributes'
import ClimateHistory from '../ClimateHistory'
import type { ProcessedFieldData } from '#hooks/useFieldSSURGO'
import type { EnhancedFieldData } from '#hooks/useComprehensiveFieldAssessment'
import { type UseCase } from '../UseCaseSelector'
import { useFilteredTabs, getDefaultTab } from '#hooks/useFilteredTabs'
import { geoJsonToWkt } from '#utils/geoJsonToWkt'

const FieldMap = dynamic(() => import('../FieldMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 flex h-full w-full items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8" style={{ border: '2px solid #e5e7eb', borderTopColor: '#16a34a' }}></div>
    </div>
  ),
})

interface DetailViewProps {
  fieldData: any
  ssurgoData: ProcessedFieldData | null
  geeData: EnhancedFieldData | null
  activeTab?: string
  onTabChange?: (tab: string) => void
  onSoilSelect?: (soil: any) => void
  selectedSoil?: any
  activeLayers?: string[]
  showCSBLayer?: boolean
  onCSBLayerToggle?: () => void
  onLayerToggle?: (layerId: string) => void
  selectedUseCase?: UseCase | null
}

export type TabId = 'soil' | 'erosion' | 'drainage' | 'productivity' | 'svi' | 'flow' | 'drought' | 'vegetation' | 'terrain' | 'climate' | 'concerns' | 'practices' | 'zones'

interface Tab {
  id: TabId
  label: string
  icon: any
  color: string
  bgColor: string
}

export const TAB_LAYER_CONFIG: Record<TabId, { id: string; label: string; default?: boolean }[]> = {
  soil: [{ id: 'soil-boundaries', label: 'Soil', default: true }],
  erosion: [
    { id: 'erosion-risk', label: 'Erosion Risk', default: true },
    { id: 'slope', label: 'Slope', default: false },
    { id: 'k-factor', label: 'K-Factor', default: false },
    { id: 'spi', label: 'Stream Power Index', default: false },
    { id: 'runoff', label: 'Runoff', default: false },
    { id: 't-value', label: 'T-Value', default: false }
  ],
  drainage: [
      { id: 'twi', label: 'TWI', default: true },
      { id: 'depressions', label: 'Depressions', default: false },
      { id: 'wet-areas', label: 'Wet Areas', default: false },
      { id: 'ponding-risk', label: 'Ponding Risk', default: false },
      { id: 'hydrologic-group', label: 'Hydrologic Group', default: false },
      { id: 'drainage-class', label: 'Drainage Class', default: false }
  ],
  productivity: [
      { id: 'nccpi-all', label: 'NCCPI All Crops', default: true },
      { id: 'nccpi-corn', label: 'NCCPI Corn', default: false },
      { id: 'nccpi-soy', label: 'NCCPI Soybean', default: false },
      { id: 'nccpi-sg', label: 'NCCPI Small Grains', default: false },
      { id: 'nccpi-cotton', label: 'NCCPI Cotton', default: false },
      { id: 'yield-gap', label: 'Yield Gap', default: false },
      { id: 'mean-ndvi', label: 'Mean NDVI', default: false },
      { id: 'max-ndvi', label: 'Max NDVI', default: false }
  ],
  svi: [
    { id: 'svi-surface', label: 'Surface Loss', default: true },
    { id: 'svi-subsurface-drained', label: 'Sub (Drained)' },
    { id: 'svi-subsurface-undrained', label: 'Sub (Undrained)' }
  ],
  flow: [{ id: 'flow-accumulation', label: 'Flow Accumulation', default: true }],
  drought: [{ id: 'drought-risk', label: 'Drought Risk', default: true }],
  vegetation: [{ id: 'ndvi', label: 'Vegetation (NDVI)', default: true }],
  terrain: [
      { id: 'elevation', label: 'Elevation', default: true },
      { id: 'slope', label: 'Slope', default: false },
      { id: 'aspect', label: 'Aspect', default: false }
  ],
  climate: [{ id: 'precip-grid', label: 'Precipitation', default: false }],
  concerns: [],
  practices: [],
  zones: [{ id: 'management-zones', label: 'Management Zones', default: true }]
}

const tabs: Tab[] = [
  { id: 'soil', label: 'Soil Composition', icon: Layers, color: '#16a34a', bgColor: '#f0fdf4' },
  { id: 'erosion', label: 'Erosion Risk', icon: TrendingDown, color: '#ea580c', bgColor: '#fff7ed' },
  { id: 'drainage', label: 'Drainage', icon: Droplets, color: '#0369a1', bgColor: '#e0f2fe' },
  { id: 'productivity', label: 'Productivity', icon: Sprout, color: '#16a34a', bgColor: '#f0fdf4' },
  { id: 'svi', label: 'Soil Vulnerability', icon: AlertTriangle, color: '#ea580c', bgColor: '#fef3c7' },
  { id: 'flow', label: 'Concentrated Flow', icon: Wind, color: '#0284c7', bgColor: '#e0f2fe' },
  { id: 'drought', label: 'Drought Risk', icon: CloudRain, color: '#f97316', bgColor: '#fff7ed' },
  { id: 'vegetation', label: 'Vegetation Monitoring', icon: TrendingUp, color: '#16a34a', bgColor: '#f0fdf4' },
  { id: 'terrain', label: 'Terrain Attributes', icon: Mountain, color: '#78716c', bgColor: '#fafaf9' },
  { id: 'climate', label: 'Climate History', icon: CloudRain, color: '#0369a1', bgColor: '#e0f2fe' },
  { id: 'concerns', label: 'Resource Concerns', icon: AlertTriangle, color: '#d97706', bgColor: '#fef3c7' },
  { id: 'practices', label: 'Conservation Practices', icon: Target, color: '#15803d', bgColor: '#f0fdf4' },
  { id: 'zones', label: 'Management Zones', icon: Layers, color: '#7c3aed', bgColor: '#faf5ff' },
]

export default function DetailView({ 
  fieldData, 
  ssurgoData, 
  geeData, 
  activeTab = 'soil',
  onTabChange,
  onSoilSelect,
  selectedSoil,
  activeLayers = [],
  showCSBLayer = true,
  onCSBLayerToggle,
  onLayerToggle,
  selectedUseCase = null
}: DetailViewProps) {
  
  // Filter tabs based on selected use case
  const filteredTabs = useFilteredTabs(tabs, selectedUseCase)
  
  // Get default tab based on use case
  const defaultTab = selectedUseCase ? getDefaultTab(selectedUseCase) : 'soil'
  
  const [selectedTab, setSelectedTab] = useState<TabId>(
    (activeTab && filteredTabs.some(t => t.id === activeTab)) ? activeTab as TabId : defaultTab
  )
  const [mapFullscreen, setMapFullscreen] = useState(false)

  const handleTabChange = (tabId: TabId) => {
    // Only allow tab change if it's in the filtered tabs
    if (filteredTabs.some(t => t.id === tabId)) {
      setSelectedTab(tabId)
      onTabChange?.(tabId)
    }
  }

  const currentTab = filteredTabs.find(t => t.id === selectedTab) || filteredTabs[0]

  if (mapFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        {/* Fullscreen Map Header */}
        <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <MapIcon className="w-5 h-5" style={{ color: '#16a34a' }} />
            <span className="text-sm font-semibold text-gray-700">Field Map - {fieldData?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Layer Controls */}
            <button
              onClick={onCSBLayerToggle}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors"
              style={{
                backgroundColor: showCSBLayer ? '#dcfce7' : '#f3f4f6',
                color: showCSBLayer ? '#166534' : '#6b7280'
              }}
            >
              {showCSBLayer ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              Fields
            </button>

            {/* Dynamic Layer Buttons based on Tab */}
            {TAB_LAYER_CONFIG[selectedTab]?.map(layer => (
                <button
                key={layer.id}
                onClick={() => onLayerToggle?.(layer.id)}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors"
                style={{
                    backgroundColor: activeLayers.includes(layer.id) ? '#dcfce7' : '#f3f4f6',
                    color: activeLayers.includes(layer.id) ? '#166534' : '#6b7280'
                }}
                >
                {activeLayers.includes(layer.id) ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                {layer.label}
                </button>
            ))}

            <button
              onClick={() => setMapFullscreen(false)}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700"
            >
              Exit Fullscreen
            </button>
          </div>
        </div>

        {/* Fullscreen Map */}
        <div className="flex-1 relative">
          <FieldMap
            mode="analysis"
            fieldData={fieldData}
            selectedSoil={selectedSoil}
            activeLayers={activeLayers}
            layerOptions={TAB_LAYER_CONFIG[selectedTab] || []}
            showCSBLayer={showCSBLayer}
            geeData={geeData}
            ssurgoData={ssurgoData} // Pass ssurgoData
            onCSBLayerToggle={onCSBLayerToggle}
            onLayerToggle={onLayerToggle}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation - Horizontal Scroll */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
          {filteredTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = selectedTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className="flex items-center gap-2 px-4 py-3 whitespace-nowrap font-medium text-sm transition-all border-b-2 flex-shrink-0"
                style={{
                  color: isActive ? tab.color : '#6b7280',
                  borderBottomColor: isActive ? tab.color : 'transparent',
                  backgroundColor: isActive ? tab.bgColor : 'transparent'
                }}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content and Map Side-by-Side */}
      <div className="flex-1 overflow-hidden bg-gray-50 flex gap-4 p-6">
        {/* Left: Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Tab Header */}
          <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: currentTab.bgColor, border: `2px solid ${currentTab.color}33` }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${currentTab.color}22` }}>
                <currentTab.icon className="w-6 h-6" style={{ color: currentTab.color }} />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: currentTab.color }}>
                {currentTab.label}
              </h2>
            </div>
            <p className="text-sm text-gray-600">
              {getTabDescription(selectedTab)}
            </p>
          </div>

          {/* Tab Content Area */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {selectedTab === 'soil' && (
              <SoilComposition 
                fieldId={fieldData?.id || fieldData?.clu_id}
                fieldData={ssurgoData}
                onSoilSelect={onSoilSelect}
              />
            )}

            {selectedTab === 'erosion' && (
              <ErosionAnalysis 
                fieldId={fieldData?.id || fieldData?.clu_id}
                ssurgoData={ssurgoData}
                geeData={geeData}
              />
            )}

            {selectedTab === 'drainage' && (
              <DrainageAssessment 
                fieldId={fieldData?.id || fieldData?.clu_id}
                ssurgoData={ssurgoData}
                geeData={geeData}
              />
            )}

            {selectedTab === 'productivity' && (
              <ProductivityAnalysis 
                fieldId={fieldData?.id || fieldData?.clu_id}
                geeData={geeData}
              />
            )}

            {selectedTab === 'svi' && (
              <SVIAnalysis 
                fieldId={fieldData?.id || fieldData?.clu_id}
                geeData={geeData}
              />
            )}

            {selectedTab === 'flow' && (
              <ConcentratedFlowAnalysis 
                fieldId={fieldData?.id || fieldData?.clu_id}
                geeData={geeData}
              />
            )}

            {selectedTab === 'drought' && (
              <DroughtRiskAnalysis 
                fieldId={fieldData?.id || fieldData?.clu_id}
                wkt={typeof fieldData?.boundary === 'string' ? fieldData.boundary : fieldData?.boundary ? geoJsonToWkt(fieldData.boundary) : undefined}
                geeData={geeData}
              />
            )}

            {selectedTab === 'concerns' && (
              <ResourceConcerns 
                fieldId={fieldData?.id || fieldData?.clu_id}
                geeData={geeData}
                fieldAcres={fieldData?.area || fieldData?.acres || 0}
              />
            )}

            {selectedTab === 'practices' && (
              <ConservationPractices fieldData={fieldData} />
            )}

            {selectedTab === 'zones' && (
              <ManagementZones fieldId={fieldData?.id || fieldData?.clu_id} />
            )}

            {selectedTab === 'vegetation' && (
              <VegetationMonitoring 
                fieldId={fieldData?.id || fieldData?.clu_id}
                geeData={geeData}
              />
            )}

            {selectedTab === 'terrain' && (
              <TerrainAttributes 
                fieldId={fieldData?.id || fieldData?.clu_id}
                geeData={geeData}
              />
            )}

            {selectedTab === 'climate' && (
              <ClimateHistory 
                fieldId={fieldData?.id || fieldData?.clu_id}
                geeData={geeData}
                wkt={typeof fieldData?.boundary === 'string' ? fieldData.boundary : fieldData?.boundary ? geoJsonToWkt(fieldData.boundary) : undefined}
              />
            )}
          </div>
        </div>

        {/* Right: Map Section */}
        <div className="w-[500px] flex-shrink-0 flex flex-col">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
            {/* Map Header with Layer Controls */}
            <div className="p-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <MapIcon className="w-5 h-5" style={{ color: '#16a34a' }} />
                  <span className="text-sm font-semibold text-gray-700">Field Map</span>
                </div>
                
                {/* Fullscreen Button - Always Visible */}
                <button
                  onClick={() => setMapFullscreen(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors text-xs font-medium text-gray-700 flex-shrink-0"
                >
                  <Maximize2 className="w-3 h-3" />
                  Expand
                </button>
              </div>
              
              {/* Layer Toggle Buttons - Scrollable */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
                <button
                  onClick={onCSBLayerToggle}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors flex-shrink-0"
                  style={{
                    backgroundColor: showCSBLayer ? '#dcfce7' : '#f3f4f6',
                    color: showCSBLayer ? '#166534' : '#6b7280'
                  }}
                >
                  {showCSBLayer ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  Fields
                </button>

                {/* Dynamic Layer Buttons based on Tab */}
                {TAB_LAYER_CONFIG[selectedTab]?.map(layer => (
                    <button
                    key={layer.id}
                    onClick={() => onLayerToggle?.(layer.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors flex-shrink-0"
                    style={{
                        backgroundColor: activeLayers.includes(layer.id) ? '#dcfce7' : '#f3f4f6',
                        color: activeLayers.includes(layer.id) ? '#166534' : '#6b7280'
                    }}
                    >
                    {activeLayers.includes(layer.id) ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {layer.label}
                    </button>
                ))}
              </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative">
              <FieldMap
                mode="analysis"
                fieldData={fieldData}
                selectedSoil={selectedSoil}
                activeLayers={activeLayers}
                layerOptions={TAB_LAYER_CONFIG[selectedTab] || []}
                showCSBLayer={showCSBLayer}
                geeData={geeData}
                onCSBLayerToggle={onCSBLayerToggle}
                onLayerToggle={onLayerToggle}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getTabDescription(tab: TabId): string {
  const descriptions: Record<TabId, string> = {
    soil: 'Detailed breakdown of soil components, textures, and properties from SSURGO data',
    erosion: 'Combined SSURGO slope analysis and GEE terrain-based erosion risk assessment',
    drainage: 'Soil drainage classification, ponding risk, and depression analysis',
    productivity: 'NDVI-based productivity metrics, yield gaps, and field stability analysis',
    svi: 'Soil Vulnerability Index - surface and subsurface loss potential assessment',
    flow: 'Concentrated flow pathways, channel density, and gully erosion risk',
    drought: 'Water balance, PDSI drought indices, and moisture deficit analysis',
    vegetation: 'NDVI time series analysis with peak performance, stability, and yield gap metrics',
    terrain: 'Detailed terrain analysis including slope, TWI, SPI, flow accumulation, and gully risk',
    climate: 'Growing season water balance, precipitation trends, and drought severity indices',
    concerns: 'Identified resource concerns based on NRCS criteria and field conditions',
    practices: 'Recommended conservation practices matched to field resource concerns',
    zones: 'Management zone delineation based on soil and productivity variability'
  }
  return descriptions[tab] || ''
}
