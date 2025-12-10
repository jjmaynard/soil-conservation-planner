// SoilViz Pro - Main Application Page

'use client'

import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useCallback, useEffect, useState } from 'react'

import Header from '#components/layout/Header'
import CroplandLegend from '#components/Map/CroplandLegend'
import LayerControl from '#components/Map/LayerControl'
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

export default function Home() {
  const { selectedDepth, changeDepth } = useDepthSelection('0-5cm')
  const [selectedProfile, setSelectedProfile] = useState<SoilProfile | null>(null)
  const [ssurgoData, setSSURGOData] = useState<SSURGOData | null>(null)
  const [cdlHistory, setCdlHistory] = useState<CDLYearData[] | null>(null)
  const [activeLayers, setActiveLayers] = useState<string[]>([])
  const [cdlYear, setCdlYear] = useState<number>(2023)
  const [layerOpacities, setLayerOpacities] = useState<Record<string, number>>({})

  // Define available soil layers
  const soilLayers: SoilLayer[] = [
    {
      id: 'ssurgo-mapunits',
      name: 'SSURGO Map Units',
      type: 'wms',
      url: process.env.NEXT_PUBLIC_NRCS_WMS_URL || 'https://sdmdataaccess.nrcs.usda.gov/Spatial/SDM.wms',
      visible: false,
      opacity: layerOpacities['ssurgo-mapunits'] ?? 0.6,
    },
    {
      id: 'cdl',
      name: 'Cropland Data Layer',
      type: 'wms',
      url: '/api/cropscape',
      visible: false,
      opacity: layerOpacities.cdl ?? 0.7,
      year: cdlYear, // Store year in layer config
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
    setSelectedProfile(profile)
    setSSURGOData(null) // Clear SSURGO data when showing profile
  }, [])

  const handleSSURGOClick = useCallback(async (data: SSURGOData) => {
    setSSURGOData(data)
    setSelectedProfile(null) // Clear profile when showing SSURGO

    // Query CDL history for the clicked location
    if (data.coordinates) {
      console.log('[Home] Querying CDL history for coordinates:', data.coordinates)
      try {
        const history = await queryCDLHistory(data.coordinates[0], data.coordinates[1])
        console.log('[Home] CDL history results:', history)
        setCdlHistory(history)
      } catch (error) {
        console.error('[Home] Error querying CDL history:', error)
        setCdlHistory(null)
      }
    }
  }, [])

  const handleLayerToggle = useCallback((layerId: string) => {
    setActiveLayers(prev => (prev.includes(layerId) ? prev.filter(id => id !== layerId) : [...prev, layerId]))
  }, [])

  // Create layers with visibility based on activeLayers
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

  // Force CDL layer refresh when year changes
  useEffect(() => {
    if (activeLayers.includes('cdl')) {
      // Toggle layer off and on to force refresh
      setActiveLayers(prev => prev.filter(id => id !== 'cdl'))
      setTimeout(() => {
        setActiveLayers(prev => [...prev, 'cdl'])
      }, 10)
    }
  }, [cdlYear])

  return (
    <>
      <Head>
        <title>SoilViz Pro - Interactive Soil Survey Platform</title>
        <meta
          name="description"
          content="Professional web application for visualizing soil properties, classifications, and environmental factors across survey areas"
        />
      </Head>

      <div className="flex h-screen flex-col overflow-hidden">
        <Header />

        <div className="relative flex-1">
          <SoilMap
            initialCenter={[44.5, -123.5]} // Oregon coordinates - change to your study area
            initialZoom={8}
            selectedDepth={selectedDepth}
            activeLayers={activeLayers}
            soilLayers={soilLayers}
            onSoilClick={handleSoilClick}
            onSSURGOClick={handleSSURGOClick}
          />

          <LayerControl
            layers={layersWithVisibility}
            onLayerToggle={handleLayerToggle}
            onOpacityChange={handleOpacityChange}
            selectedDepth={selectedDepth}
            onDepthChange={changeDepth}
            cdlYear={cdlYear}
            onCdlYearChange={setCdlYear}
          />

          {/* CDL Legend - shown when CDL layer is active */}
          {activeLayers.includes('cdl') && <CroplandLegend />}

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
