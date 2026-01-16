// React Hooks for Map Layer Management

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { mapLayerApi } from '#src/lib/mapLayerApi'
import type {
  PropertyMetadata,
  PropertyTileResponse,
  PropertyCategory,
  MapLayer,
  LayerGroup,
} from '#src/types/mapLayers'
import { SOIL_SUBCATEGORIES, TERRAIN_SUBCATEGORIES } from '#src/types/mapLayers'

/**
 * Get all available soil properties with caching
 */
export function useSoilProperties() {
  return useQuery<PropertyMetadata[]>({
    queryKey: ['soil-properties'],
    queryFn: () => mapLayerApi.getAllProperties(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - properties don't change often
  })
}

/**
 * Get all available terrain properties with caching
 */
export function useTerrainProperties() {
  return useQuery<PropertyMetadata[]>({
    queryKey: ['terrain-properties'],
    queryFn: () => mapLayerApi.getAllProperties(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  })
}

/**
 * Get all available properties (soil + terrain)
 */
export function useAllProperties() {
  return useQuery<PropertyMetadata[]>({
    queryKey: ['all-properties'],
    queryFn: () => mapLayerApi.getAllProperties(),
    staleTime: 24 * 60 * 60 * 1000,
  })
}

/**
 * Get tile URL for a specific property
 */
export function usePropertyTiles(
  category: PropertyCategory | null,
  propertyId: string | null
) {
  return useQuery<PropertyTileResponse>({
    queryKey: ['property-tiles', propertyId],
    queryFn: () => mapLayerApi.getPropertyTiles(propertyId!),
    enabled: !!propertyId,
    staleTime: 60 * 60 * 1000, // 1 hour - tile URLs expire
  })
}

/**
 * Categorize property into subcategory based on ID
 */
function categorizeProperty(property: PropertyMetadata): string {
  const id = property.id.toLowerCase()

  if (property.category === 'soil') {
    // SOLUS properties
    if (id.includes('solus')) {
      if (id.includes('sand') || id.includes('clay') || id.includes('silt')) {
        return SOIL_SUBCATEGORIES.TEXTURE
      }
      if (id.includes('soc')) {
        return SOIL_SUBCATEGORIES.ORGANIC
      }
    }

    // ACPF SVI properties
    if (id.includes('svi')) {
      return SOIL_SUBCATEGORIES.VULNERABILITY
    }

    // gNATSGO properties
    if (id.includes('sand') || id.includes('clay') || id.includes('silt')) {
      return SOIL_SUBCATEGORIES.TEXTURE
    }
    if (id.includes('soc') || id.includes('om')) {
      return SOIL_SUBCATEGORIES.ORGANIC
    }
    if (id.includes('aws') || id.includes('ksat') || id.includes('drainage')) {
      return SOIL_SUBCATEGORIES.WATER
    }
    if (id.includes('ph') || id.includes('cec') || id.includes('ec')) {
      return SOIL_SUBCATEGORIES.CHEMICAL
    }
    if (id.includes('bulk') || id.includes('density') || id.includes('porosity')) {
      return SOIL_SUBCATEGORIES.PHYSICAL
    }
    if (id.includes('nccpi') || id.includes('yield') || id.includes('productivity')) {
      return SOIL_SUBCATEGORIES.PRODUCTIVITY
    }

    return SOIL_SUBCATEGORIES.PHYSICAL // Default
  }

  if (property.category === 'terrain') {
    if (id.includes('slope') || id.includes('aspect')) {
      return TERRAIN_SUBCATEGORIES.SLOPE
    }
    if (id.includes('twi') || id.includes('spi') || id.includes('convergence')) {
      return TERRAIN_SUBCATEGORIES.HYDROLOGY
    }
    if (id.includes('curvature')) {
      return TERRAIN_SUBCATEGORIES.CURVATURE
    }
    if (
      id.includes('elevation') ||
      id.includes('tpi') ||
      id.includes('hillshade')
    ) {
      return TERRAIN_SUBCATEGORIES.POSITION
    }

    return TERRAIN_SUBCATEGORIES.POSITION // Default
  }

  return 'Other'
}

/**
 * Organize properties into layer groups by category and subcategory
 */
export function useLayerGroups() {
  const { data: properties, isLoading } = useAllProperties()
  const [layerGroups, setLayerGroups] = useState<LayerGroup[]>([])
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!properties) return

    // Group properties by category and subcategory
    const soilGroups = new Map<string, PropertyMetadata[]>()
    const terrainGroups = new Map<string, PropertyMetadata[]>()

    properties.forEach((prop) => {
      const subcategory = categorizeProperty(prop)
      const groups = prop.category === 'soil' ? soilGroups : terrainGroups

      if (!groups.has(subcategory)) {
        groups.set(subcategory, [])
      }
      groups.get(subcategory)!.push(prop)
    })

    // Create layer groups
    const groups: LayerGroup[] = []

    // Add soil groups
    soilGroups.forEach((props, subcategory) => {
      groups.push({
        id: `soil-${subcategory.toLowerCase().replace(/\s+/g, '-')}`,
        name: subcategory,
        category: 'soil',
        expanded: false,
        layers: props.map((prop) => ({
          id: prop.id,
          category: 'soil',
          subcategory,
          name: prop.name,
          description: prop.description,
          tileUrl: null,
          opacity: 0.7,
          visible: false,
          metadata: prop,
        })),
      })
    })

    // Add terrain groups
    terrainGroups.forEach((props, subcategory) => {
      groups.push({
        id: `terrain-${subcategory.toLowerCase().replace(/\s+/g, '-')}`,
        name: subcategory,
        category: 'terrain',
        expanded: false,
        layers: props.map((prop) => ({
          id: prop.id,
          category: 'terrain',
          subcategory,
          name: prop.name,
          description: prop.description,
          tileUrl: null,
          opacity: 0.7,
          visible: false,
          metadata: prop,
        })),
      })
    })

    setLayerGroups(groups)
  }, [properties])

  const toggleGroup = useCallback((groupId: string) => {
    setLayerGroups((prev) =>
      prev.map((group) =>
        group.id === groupId ? { ...group, expanded: !group.expanded } : group
      )
    )
  }, [])

  const toggleLayer = useCallback((layerId: string) => {
    setActiveLayers((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(layerId)) {
        newSet.delete(layerId)
      } else {
        newSet.add(layerId)
      }
      return newSet
    })

    setLayerGroups((prev) =>
      prev.map((group) => ({
        ...group,
        layers: group.layers.map((layer) =>
          layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
        ),
      }))
    )
  }, [])

  const setLayerOpacity = useCallback((layerId: string, opacity: number) => {
    setLayerGroups((prev) =>
      prev.map((group) => ({
        ...group,
        layers: group.layers.map((layer) =>
          layer.id === layerId ? { ...layer, opacity } : layer
        ),
      }))
    )
  }, [])

  // Create a Map of active layer data for easy access (memoized to prevent infinite loops)
  const activeLayerData = useMemo(() => {
    const dataMap = new Map<string, MapLayer>()
    layerGroups.forEach((group) => {
      group.layers.forEach((layer) => {
        if (layer.visible) {
          dataMap.set(layer.id, layer)
        }
      })
    })
    return dataMap
  }, [layerGroups])

  return {
    layerGroups,
    isLoading,
    activeLayers,
    activeLayerData,
    toggleGroup,
    toggleLayer,
    setLayerOpacity,
  }
}
