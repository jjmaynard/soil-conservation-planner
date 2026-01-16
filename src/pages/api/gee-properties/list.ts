import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

const GEE_API_BASE = 'https://gee-api-production.up.railway.app'

/**
 * Proxy endpoint for fetching GEE property list
 * Handles CORS by proxying requests server-side
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Fetch both soil and terrain properties in parallel
    const [soilResponse, terrainResponse] = await Promise.all([
      axios.get(`${GEE_API_BASE}/api/soil-properties/list`),
      axios.get(`${GEE_API_BASE}/api/terrain-properties/list`),
    ])

    // Extract properties arrays from response objects
    const soilProperties = Array.isArray(soilResponse.data)
      ? soilResponse.data
      : soilResponse.data?.properties || []
    
    const terrainProperties = Array.isArray(terrainResponse.data)
      ? terrainResponse.data
      : terrainResponse.data?.properties || []

    // Add category field to each property
    const soilWithCategory = soilProperties.map((p: any) => ({
      ...p,
      category: 'soil' as const,
    }))
    
    const terrainWithCategory = terrainProperties.map((p: any) => ({
      ...p,
      category: 'terrain' as const,
    }))

    // Combine and return
    const allProperties = [...soilWithCategory, ...terrainWithCategory]

    console.log(`[GEE Proxy] Returning ${allProperties.length} properties (${soilProperties.length} soil + ${terrainProperties.length} terrain)`)
    res.status(200).json(allProperties)
  } catch (error) {
    console.error('[GEE Proxy] Error fetching properties:', error)
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500
      const message = error.response?.data?.error || error.message
      return res.status(status).json({ error: message })
    }

    res.status(500).json({ error: 'Failed to fetch GEE properties' })
  }
}
