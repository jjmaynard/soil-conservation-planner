import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

const GEE_API_BASE = 'https://gee-api-production.up.railway.app'

/**
 * Proxy endpoint for fetching GEE tile URLs for a specific property
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
    let lastError
    
    try {
      console.log(`[GEE Proxy] Trying soil endpoint for ${propertyId}`)
      response = await axios.get(`${GEE_API_BASE}/api/soil-properties/tiles/${propertyId}`)
      console.log(`[GEE Proxy] Soil endpoint succeeded for ${propertyId}`)
    } catch (soilErr) {
      lastError = soilErr
      console.log(`[GEE Proxy] Soil endpoint failed for ${propertyId}, trying terrain...`)
      try {
        response = await axios.get(`${GEE_API_BASE}/api/terrain-properties/tiles/${propertyId}`)
        console.log(`[GEE Proxy] Terrain endpoint succeeded for ${propertyId}`)
      } catch (terrainErr) {
        lastError = terrainErr
        console.error(`[GEE Proxy] Both endpoints failed for ${propertyId}`)
        throw terrainErr
      }
    }

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
