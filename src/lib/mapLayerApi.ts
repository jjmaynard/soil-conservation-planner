// GEE Map Layer API Client
// Handles Soil Properties (gNATSGO, SOLUS, ACPF SVI) and Terrain Properties (STEDUS30)
// Proxies requests through Next.js API routes to avoid CORS issues

import axios from 'axios'
import type {
  PropertyMetadata,
  PropertyTileResponse,
} from '#src/types/mapLayers'

class MapLayerAPIClient {
  /**
   * Get all available properties (soil + terrain = 40 total)
   * Proxied through /api/gee-properties/list to avoid CORS
   */
  async getAllProperties(): Promise<PropertyMetadata[]> {
    try {
      const { data } = await axios.get<PropertyMetadata[]>('/api/gee-properties/list')
      console.log('[Map Layers] Fetched all properties:', data.length)
      return data
    } catch (error) {
      console.error('[Map Layers] Error fetching all properties:', error)
      return []
    }
  }

  /**
   * Get tile URL for a specific property
   * Proxied through /api/gee-properties/tiles/[propertyId] to avoid CORS
   */
  async getPropertyTiles(propertyId: string): Promise<PropertyTileResponse | null> {
    try {
      const { data } = await axios.get<PropertyTileResponse>(
        `/api/gee-properties/tiles/${propertyId}`
      )
      console.log(`[Map Layers] Fetched tiles for ${propertyId}`)
      return data
    } catch (error) {
      console.error(`[Map Layers] Error fetching tiles for ${propertyId}:`, error)
      return null
    }
  }
}

// Export singleton instance
export const mapLayerApi = new MapLayerAPIClient()
