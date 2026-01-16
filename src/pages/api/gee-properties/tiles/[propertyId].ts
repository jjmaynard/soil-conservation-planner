import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

const GEE_API_BASE = 'https://gee-api-production.up.railway.app'

/**
 * Proxy endpoint for fetching GEE tile URLs for a specific property
 * Route: /api/gee-properties/tiles/[propertyId]
 * Handles CORS by proxying requests server-side
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { propertyId } = req.query

  if (!propertyId || typeof propertyId !== 'string') {
    return res.status(400).json({ error: 'Property ID is required' })
  }

  try {
    // Try both soil and terrain endpoints
    let response
    
    try {
      console.log(`[GEE Proxy] Trying soil endpoint: ${GEE_API_BASE}/api/soil-properties/tiles/${propertyId}`)
      response = await axios.get(`${GEE_API_BASE}/api/soil-properties/tiles/${propertyId}`)
      console.log(`[GEE Proxy] Soil endpoint succeeded for ${propertyId}`)
    } catch (soilErr) {
      if (axios.isAxiosError(soilErr)) {
        console.log(`[GEE Proxy] Soil endpoint failed (${soilErr.response?.status}): ${soilErr.response?.data?.error || soilErr.message}`)
      }
      
      console.log(`[GEE Proxy] Trying terrain endpoint: ${GEE_API_BASE}/api/terrain-properties/tiles/${propertyId}`)
      try {
        response = await axios.get(`${GEE_API_BASE}/api/terrain-properties/tiles/${propertyId}`)
        console.log(`[GEE Proxy] Terrain endpoint succeeded for ${propertyId}`)
      } catch (terrainErr) {
        if (axios.isAxiosError(terrainErr)) {
          console.error(`[GEE Proxy] Terrain endpoint failed (${terrainErr.response?.status}): ${terrainErr.response?.data?.error || terrainErr.message}`)
          console.error(`[GEE Proxy] Full terrain error:`, terrainErr.response?.data)
        }
        throw terrainErr
      }
    }

    console.log(`[GEE Proxy] Success! Returning tile data for ${propertyId}:`, response.data)
    res.status(200).json(response.data)
  } catch (error) {
    console.error(`[GEE Proxy] Error fetching tiles for ${propertyId}:`, error)
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500
      const message = error.response?.data?.error || error.message
      return res.status(status).json({ error: message })
    }

    res.status(500).json({ error: 'Failed to fetch GEE tiles' })
  }
}
