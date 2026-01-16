// Hook to fetch GEE layers and convert to SoilLayer format

import { useEffect, useState } from 'react'
import { mapLayerApi } from '#src/lib/mapLayerApi'
import type { SoilLayer } from '#src/types/soil'

export function useGEELayers() {
  const [geeLayers, setGeeLayers] = useState<SoilLayer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Only fetch once on mount
    let mounted = true

    async function fetchLayers() {
      try {
        const properties = await mapLayerApi.getAllProperties()
        
        if (!mounted) return

        // Convert GEE properties to SoilLayer format
        const layers: SoilLayer[] = properties.map(prop => ({
          id: `gee-${prop.id}`,
          name: prop.id === 'droughty' ? 'Drought Prone Soils' : prop.name,
          type: 'gee-tile' as any, // Custom type for GEE tiles
          url: '', // Will be fetched on demand
          visible: false,
          opacity: 0.7,
          category: prop.category,
          subcategory: prop.subcategory,
          metadata: prop,
        }))

        setGeeLayers(layers)
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to load GEE layers:', error)
        setIsLoading(false)
      }
    }

    fetchLayers()

    return () => {
      mounted = false
    }
  }, []) // Empty deps - only run once

  return { geeLayers, isLoading }
}
