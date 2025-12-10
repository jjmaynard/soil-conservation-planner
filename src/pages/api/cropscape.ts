// CORS Proxy for CropScape WMS tiles
// This proxies requests to avoid CORS issues with CropScape service

import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'OPTIONS') {
    // Handle preflight requests
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // CropScape WMS base URL
    const cropscapeBaseUrl = 'https://nassgeodata.gmu.edu/CropScapeService/wms_cdlall.cgi'

    // Build the WMS request URL with all query parameters
    const wmsUrl = new URL(cropscapeBaseUrl)

    // Forward all query parameters from the original request
    Object.entries(req.query).forEach(([key, value]) => {
      if (value) {
        wmsUrl.searchParams.set(key, Array.isArray(value) ? value[0] : value)
      }
    })

    console.log(`[CropScape Proxy] Fetching: ${wmsUrl.toString()}`)

    const response = await fetch(wmsUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'SoilViz-Pro/1.0',
        Accept: 'image/png,image/*,*/*',
      },
    })

    if (!response.ok) {
      console.error(`[CropScape Proxy] HTTP ${response.status}: ${response.statusText}`)
      throw new Error(`CropScape WMS error: ${response.status} ${response.statusText}`)
    }

    // Get the content type from the response
    const contentType = response.headers.get('content-type') || 'image/png'

    // Get the image data as array buffer
    const imageData = await response.arrayBuffer()

    console.log(`[CropScape Proxy] Success: ${imageData.byteLength} bytes, type: ${contentType}`)

    // Set CORS headers to allow access from frontend
    res.setHeader('Content-Type', contentType)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    res.setHeader('Cache-Control', 'public, max-age=3600') // Cache for 1 hour

    // Return the image
    res.status(200).send(Buffer.from(imageData))
  } catch (error: any) {
    console.error('[CropScape Proxy] Error:', error)

    res.status(500).json({
      error: 'Failed to fetch CropScape data',
      details: error.message,
    })
  }
}
