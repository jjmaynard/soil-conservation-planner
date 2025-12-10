// Custom hook for managing map layers

'use client'

import type L from 'leaflet'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { SoilLayer } from '#src/types/soil'

export function useMapLayers() {
  const [layers, setLayers] = useState<SoilLayer[]>([])
  const mapLayersRef = useRef<Map<string, L.Layer>>(new Map())
  const mapRef = useRef<L.Map | null>(null)

  const setMap = useCallback((map: L.Map | null) => {
    mapRef.current = map
  }, [])

  const addSoilLayers = useCallback(
    (map: L.Map, activeLayers: string[]) => {
      if (!map) return

      // Remove layers that are no longer active
      mapLayersRef.current.forEach((layer, id) => {
        if (!activeLayers.includes(id)) {
          map.removeLayer(layer)
          mapLayersRef.current.delete(id)
        }
      })

      // Add new active layers
      activeLayers.forEach(layerId => {
        if (!mapLayersRef.current.has(layerId)) {
          const layerConfig = layers.find(l => l.id === layerId)
          if (layerConfig && layerConfig.visible) {
            const leafletLayer = createLeafletLayer(layerConfig)
            if (leafletLayer) {
              leafletLayer.addTo(map)
              mapLayersRef.current.set(layerId, leafletLayer)
            }
          }
        }
      })
    },
    [layers],
  )

  const updateLayerDepth = useCallback(
    (depth: string) => {
      // Update raster layers to show different depth
      mapLayersRef.current.forEach((layer, id) => {
        const layerConfig = layers.find(l => l.id === id)
        if (layerConfig && layerConfig.type === 'raster') {
          // Reload raster layer with new depth parameter
          // Implementation depends on your tile server setup
          console.log(`Updating layer ${id} to depth ${depth}`)
        }
      })
    },
    [layers],
  )

  const updateLayerOpacity = useCallback((layerId: string, opacity: number) => {
    const layer = mapLayersRef.current.get(layerId)
    if (layer && 'setOpacity' in layer) {
      ;(layer as any).setOpacity(opacity)
    }

    setLayers(prev => prev.map(l => (l.id === layerId ? { ...l, opacity } : l)))
  }, [])

  const toggleLayerVisibility = useCallback((layerId: string) => {
    setLayers(prev => prev.map(l => (l.id === layerId ? { ...l, visible: !l.visible } : l)))
  }, [])

  const setLayerConfig = useCallback((newLayers: SoilLayer[]) => {
    setLayers(newLayers)
  }, [])

  // Cleanup on unmount
  useEffect(
    () => () => {
      mapLayersRef.current.forEach(layer => {
        if (mapRef.current) {
          mapRef.current.removeLayer(layer)
        }
      })
      mapLayersRef.current.clear()
    },
    [],
  )

  return {
    layers,
    setMap,
    addSoilLayers,
    updateLayerDepth,
    updateLayerOpacity,
    toggleLayerVisibility,
    setLayerConfig,
  }
}

/**
 * Create a Leaflet layer from configuration
 */
function createLeafletLayer(config: SoilLayer): L.Layer | null {
  // This is a simplified implementation
  // You'll need to import leaflet and implement actual layer creation
  // based on the layer type (raster, vector, WMS)

  if (typeof window === 'undefined') return null

  const L = require('leaflet')

  switch (config.type) {
    case 'wms':
      // For SSURGO WMS, use MapunitPoly layer
      return L.tileLayer.wms(config.url, {
        layers: 'MapunitPoly', // SSURGO map unit polygons layer
        format: 'image/png',
        transparent: true,
        opacity: config.opacity,
        attribution: 'USDA-NRCS Soil Survey',
        // Additional SSURGO-specific parameters
        version: '1.1.1',
        styles: '',
      })

    case 'raster':
      return L.tileLayer(config.url, {
        opacity: config.opacity,
      })

    default:
      return null
  }
}
