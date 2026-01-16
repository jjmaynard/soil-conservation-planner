// Map Layer Types for GEE Tile Services
// Supports Soil Properties (29) and Terrain Properties (11)

export interface PropertyMetadata {
  id: string
  name: string
  description: string
  units: string
  palette: string[]
  min: number
  max: number
  category: 'soil' | 'terrain'
  subcategory: string
}

export interface PropertyTileResponse {
  property_id: string
  name: string
  description: string
  units: string
  tile_url: string
  visualization: {
    min: number
    max: number
    palette: string[]
  }
}

export interface PropertiesListResponse {
  properties: PropertyMetadata[]
  total_count: number
}

export type PropertyCategory = 'soil' | 'terrain'

export interface MapLayer {
  id: string
  category: PropertyCategory
  subcategory: string
  name: string
  description: string
  tileUrl: string | null
  opacity: number
  visible: boolean
  metadata: PropertyMetadata
}

export interface LayerGroup {
  id: string
  name: string
  category: PropertyCategory
  layers: MapLayer[]
  expanded: boolean
}

// Layer subcategories for organization
export const SOIL_SUBCATEGORIES = {
  TEXTURE: 'Soil Texture',
  ORGANIC: 'Organic Matter',
  WATER: 'Water Relations',
  CHEMICAL: 'Chemical Properties',
  PHYSICAL: 'Physical Properties',
  VULNERABILITY: 'Nutrient Vulnerability',
  PRODUCTIVITY: 'Productivity & Quality',
} as const

export const TERRAIN_SUBCATEGORIES = {
  SLOPE: 'Slope & Aspect',
  HYDROLOGY: 'Hydrologic Indices',
  CURVATURE: 'Curvature',
  POSITION: 'Topographic Position',
} as const
