// Soil Conservation Explorer - Interactive Soil Map

'use client'

import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useRef, useState } from 'react'
import type L from 'leaflet'

import CroplandLegend from '#components/Map/CroplandLegend'
import LayerControl from '#components/Map/LayerControl'
import MapSearch from '#components/Map/MapSearch'
import LoadingSpinner from '#components/ui/LoadingSpinner'
import PropertyPanel from '#components/ui/PropertyPanel'
import { useDepthSelection } from '#src/hooks/useDepthSelection'
import type { SoilLayer, SoilProfile, SSURGOData } from '#src/types/soil'
import { queryCDLHistory, type CDLYearData } from '#src/utils/cdlQuery'

// Lazy load map to avoid SSR issues with Leaflet
const SoilMap = dynamic(() => import('#components/Map/SoilMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 flex h-full w-full items-center justify-center">
      <LoadingSpinner message="Loading soil maps..." />
    </div>
  ),
})

export default function SoilMapPage() {
  const router = useRouter()
  const isSelectMode = router.query.selectMode === 'true'
  const { selectedDepth, changeDepth } = useDepthSelection('0-5cm')
  const [selectedProfile, setSelectedProfile] = useState<SoilProfile | null>(null)
  const [ssurgoData, setSSURGOData] = useState<SSURGOData | null>(null)
  const [cdlHistory, setCdlHistory] = useState<CDLYearData[] | null>(null)
  const [activeLayers, setActiveLayers] = useState<string[]>(['ssurgo-mapunits'])
  const [cdlYear, setCdlYear] = useState<number>(2023)
  const [layerOpacities, setLayerOpacities] = useState<Record<string, number>>({})
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [layerControlHeight, setLayerControlHeight] = useState<number>(0)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const mapRef = useRef<L.Map | null>(null)

  // Define available soil layers
  const soilLayers: SoilLayer[] = [
    {
      id: 'ssurgo-mapunits',
      name: 'SSURGO Map Units',
      type: 'wms',
      url: process.env.NEXT_PUBLIC_NRCS_WMS_URL || 'https://sdmdataaccess.nrcs.usda.gov/Spatial/SDM.wms',
      visible: true,
      opacity: layerOpacities['ssurgo-mapunits'] ?? 0.6,
    },
    {
      id: 'cdl',
      name: 'Cropland Data Layer',
      type: 'wms',
      url: '/api/cropscape',
      visible: false,
      opacity: layerOpacities.cdl ?? 0.7,
      year: cdlYear,
    },
    {
      id: 'organic-carbon',
      name: 'Organic Carbon',
      type: 'raster',
      url: '/api/soil-tiles/carbon',
      visible: false,
      opacity: layerOpacities['organic-carbon'] ?? 0.8,
    },
    {
      id: 'soil-ph',
      name: 'Soil pH',
      type: 'raster',
      url: '/api/soil-tiles/ph',
      visible: false,
      opacity: layerOpacities['soil-ph'] ?? 0.8,
    },
    {
      id: 'bulk-density',
      name: 'Bulk Density',
      type: 'raster',
      url: '/api/soil-tiles/bulk-density',
      visible: false,
      opacity: layerOpacities['bulk-density'] ?? 0.8,
    },
    {
      id: 'clay-content',
      name: 'Clay Content',
      type: 'raster',
      url: '/api/soil-tiles/clay',
      visible: false,
      opacity: layerOpacities['clay-content'] ?? 0.8,
    },
  ]

  const handleSoilClick = useCallback((profile: SoilProfile) => {
    console.log('[SoilMap] handleSoilClick - coordinates:', profile.coordinates);
    if (isSelectMode && profile.coordinates) {
      // In select mode, capture the location
      // coordinates array is [lat, lng]
      const location = { lat: profile.coordinates[0], lng: profile.coordinates[1] };
      console.log('[SoilMap] Setting selectedLocation:', location);
      setSelectedLocation(location)
    } else {
      setSelectedProfile(profile)
      setSSURGOData(null)
      setIsProcessing(false)
    }
  }, [isSelectMode])

  const handleSSURGOClick = useCallback(async (data: SSURGOData) => {
    if (isSelectMode && data.coordinates) {
      // In select mode, capture the location  
      // coordinates array is [lat, lng]
      setSelectedLocation({ lat: data.coordinates[0], lng: data.coordinates[1] })
      return
    }
    
    setSSURGOData(data)
    setSelectedProfile(null)

    // Query CDL history for the clicked location
    if (data.coordinates) {
      console.log('[SoilMap] Querying CDL history for coordinates:', data.coordinates)
      try {
        const history = await queryCDLHistory(data.coordinates[0], data.coordinates[1])
        console.log('[SoilMap] CDL history results:', history)
        setCdlHistory(history)
      } catch (error) {
        console.error('[SoilMap] Error querying CDL history:', error)
        setCdlHistory(null)
      }
    }
    
    setIsProcessing(false)
  }, [isSelectMode])

  const handleProcessingStart = useCallback(() => {
    setIsProcessing(true)
    setSelectedProfile(null)
    setSSURGOData(null)
    setCdlHistory(null)
  }, [])

  const handleLayerToggle = useCallback((layerId: string) => {
    setActiveLayers(prev => (prev.includes(layerId) ? prev.filter(id => id !== layerId) : [...prev, layerId]))
  }, [])

  const layersWithVisibility = soilLayers.map(layer => ({
    ...layer,
    visible: activeLayers.includes(layer.id),
  }))

  const handleOpacityChange = useCallback((layerId: string, opacity: number) => {
    setLayerOpacities(prev => ({
      ...prev,
      [layerId]: opacity,
    }))
  }, [])

  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map
  }, [])

  const handleLocationSearch = useCallback((lat: number, lng: number, zoom?: number) => {
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], zoom || 12, {
        duration: 1.5,
      })
    }
  }, [])

  // Force CDL layer refresh when year changes
  useEffect(() => {
    if (activeLayers.includes('cdl')) {
      setActiveLayers(prev => prev.filter(id => id !== 'cdl'))
      setTimeout(() => {
        setActiveLayers(prev => [...prev, 'cdl'])
      }, 10)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cdlYear])

  return (
    <>
      <Head>
        <title>Interactive Soil Map - Soil Conservation Explorer</title>
        <meta
          name="description"
          content="Interactive SSURGO soil mapping tool with layer controls and property analysis"
        />
      </Head>

      <div className="h-full w-full">
        <div className="relative h-full w-full">
          {/* Selection Mode Banner */}
          {isSelectMode && (
            <div className="absolute top-4 left-4 right-4 z-[2000] flex justify-center">
              <div className="rounded-lg shadow-lg p-4 max-w-2xl" style={{ backgroundColor: '#eff6ff', borderLeft: '4px solid #3b82f6' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold" style={{ color: '#1e40af' }}>
                      📍 Location Selection Mode
                    </div>
                    <p className="text-sm mt-1" style={{ color: '#1e40af' }}>
                      Click on the map to select a location for crop suitability assessment
                    </p>
                  </div>
                  <button
                    onClick={() => router.push('/suitability/crop-suitability')}
                    className="ml-4 px-3 py-1 rounded text-sm"
                    style={{ backgroundColor: '#3b82f6', color: 'white' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Map Search Navigation - Positioned at top center */}
          {!isSelectMode && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[2000]">
              <MapSearch onLocationSelect={handleLocationSearch} />
            </div>
          )}

          {/* Location Confirmation Panel */}
          {isSelectMode && selectedLocation && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-[2000]">
              <div className="rounded-lg shadow-xl p-6" style={{ backgroundColor: 'white' }}>
                <div className="text-center mb-4">
                  <div className="font-bold text-lg mb-2" style={{ color: '#111827' }}>
                    Location Selected
                  </div>
                  <div className="text-sm" style={{ color: '#6b7280' }}>
                    Latitude: {selectedLocation.lat.toFixed(6)}, Longitude: {selectedLocation.lng.toFixed(6)}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedLocation(null)}
                    className="flex-1 px-4 py-2 border rounded-lg transition-colors"
                    style={{ borderColor: '#d1d5db', color: '#374151' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    Choose Different Location
                  </button>
                  <button
                    onClick={() => {
                      const returnPath = localStorage.getItem('returnToPath') || '/suitability/crop-suitability'
                      localStorage.removeItem('returnToPath')
                      router.push(`${returnPath}?lat=${selectedLocation.lat}&lng=${selectedLocation.lng}`)
                    }}
                    className="flex-1 px-4 py-2 rounded-lg font-semibold"
                    style={{ backgroundColor: '#10b981', color: 'white' }}
                  >
                    Use This Location
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Map Search Navigation - Positioned at top center */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[2000]">
            <MapSearch onLocationSelect={handleLocationSearch} />
          </div>

          <SoilMap
            initialCenter={[39.8283, -98.5795]}
            initialZoom={5}
            selectedDepth={selectedDepth}
            activeLayers={activeLayers}
            soilLayers={soilLayers}
            onSoilClick={handleSoilClick}
            onSSURGOClick={handleSSURGOClick}
            onMapReady={handleMapReady}
            onProcessingStart={handleProcessingStart}
            isSelectMode={isSelectMode}
          />

          <LayerControl
            layers={layersWithVisibility}
            onLayerToggle={handleLayerToggle}
            onOpacityChange={handleOpacityChange}
            selectedDepth={selectedDepth}
            onDepthChange={changeDepth}
            cdlYear={cdlYear}
            onCdlYearChange={setCdlYear}
            onHeightChange={setLayerControlHeight}
          />

          {activeLayers.includes('cdl') && <CroplandLegend topOffset={layerControlHeight} />}

          {isProcessing && (
            <div className="absolute right-4 top-24 z-[3000] bg-white rounded-lg shadow-2xl border border-gray-200 p-6 w-64">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Processing...</p>
                  <p className="text-xs text-gray-600 mt-1">Loading soil data</p>
                </div>
              </div>
            </div>
          )}

          {(selectedProfile || ssurgoData) && (
            <PropertyPanel
              profile={selectedProfile}
              ssurgoData={ssurgoData}
              cdlHistory={cdlHistory}
              onClose={() => {
                setSelectedProfile(null)
                setSSURGOData(null)
                setCdlHistory(null)
              }}
            />
          )}
        </div>
      </div>
    </>
  )
}
