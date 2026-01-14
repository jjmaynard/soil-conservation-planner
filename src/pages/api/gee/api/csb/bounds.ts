import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

const GEE_API_BASE_URL = process.env.GEE_API_URL || 'https://gee-api-production.up.railway.app'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { min_lon, min_lat, max_lon, max_lat, zoom, limit } = req.query

    const response = await axios.get(`${GEE_API_BASE_URL}/api/csb/bounds`, {
      params: {
        min_lon,
        min_lat,
        max_lon,
        max_lat,
        zoom,
        limit,
      },
      timeout: 30000,
    })

    res.status(200).json(response.data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500
      const data = error.response?.data || { error: 'Internal server error' }
      return res.status(status).json(data)
    }
    res.status(500).json({ error: 'Internal server error' })
  }
}
