/**
 * API endpoint to proxy OSD data requests to UC Davis API
 * GET /api/osd?series=ABBOTT
 * 
 * This proxy avoids CORS issues by making requests server-side
 */

import type { NextApiRequest, NextApiResponse } from 'next'

const OSD_API_BASE = 'https://casoilresource.lawr.ucdavis.edu/api/soil-series.php'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { series } = req.query

  if (!series || typeof series !== 'string') {
    return res.status(400).json({ error: 'Series name is required' })
  }

  try {
    const url = `${OSD_API_BASE}?q=all&s=${encodeURIComponent(series.toLowerCase())}`
    console.log(`[OSD API Proxy] Fetching data for series: ${series}`)

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Soil-Mapper-App/1.0',
      },
    })

    if (!response.ok) {
      console.error(`[OSD API Proxy] HTTP error: ${response.status} ${response.statusText}`)
      return res.status(response.status).json({ 
        error: `Failed to fetch OSD data: ${response.statusText}` 
      })
    }

    const data = await response.json()

    // Set cache headers (cache for 24 hours)
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200')

    return res.status(200).json(data)
  } catch (error) {
    console.error('[OSD API Proxy] Error:', error)
    return res.status(500).json({ error: 'Failed to fetch OSD data' })
  }
}
