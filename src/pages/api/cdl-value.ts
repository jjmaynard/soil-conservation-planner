// CORS Proxy for CropScape GetCDLValue API
// Queries crop type at a specific point for a given year

import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * Transform WGS84 coordinates to Albers Equal Area Conic (EPSG:5070)
 * CropScape requires coordinates in USA Contiguous Albers Equal Area Conic projection
 * Using simplified transformation formula for CONUS region
 */
function wgs84ToAlbers(lon: number, lat: number): { x: number; y: number } {
  // Constants for Albers Equal Area Conic (USGS version) EPSG:5070
  const a = 6378137.0 // Semi-major axis
  const e = 0.08181919084262 // Eccentricity
  const lat0 = (23.0 * Math.PI) / 180 // Latitude of origin
  const lat1 = (29.5 * Math.PI) / 180 // First standard parallel
  const lat2 = (45.5 * Math.PI) / 180 // Second standard parallel
  const lon0 = (-96.0 * Math.PI) / 180 // Central meridian
  const x0 = 0.0 // False easting
  const y0 = 0.0 // False northing

  // Convert input to radians
  const lambda = (lon * Math.PI) / 180
  const phi = (lat * Math.PI) / 180

  // Calculate n
  const m1 = Math.cos(lat1) / Math.sqrt(1 - e * e * Math.sin(lat1) * Math.sin(lat1))
  const m2 = Math.cos(lat2) / Math.sqrt(1 - e * e * Math.sin(lat2) * Math.sin(lat2))

  const q0 =
    (1 - e * e) *
    (Math.sin(lat0) / (1 - e * e * Math.sin(lat0) * Math.sin(lat0)) -
      (1 / (2 * e)) * Math.log((1 - e * Math.sin(lat0)) / (1 + e * Math.sin(lat0))))
  const q1 =
    (1 - e * e) *
    (Math.sin(lat1) / (1 - e * e * Math.sin(lat1) * Math.sin(lat1)) -
      (1 / (2 * e)) * Math.log((1 - e * Math.sin(lat1)) / (1 + e * Math.sin(lat1))))
  const q2 =
    (1 - e * e) *
    (Math.sin(lat2) / (1 - e * e * Math.sin(lat2) * Math.sin(lat2)) -
      (1 / (2 * e)) * Math.log((1 - e * Math.sin(lat2)) / (1 + e * Math.sin(lat2))))
  const q =
    (1 - e * e) *
    (Math.sin(phi) / (1 - e * e * Math.sin(phi) * Math.sin(phi)) -
      (1 / (2 * e)) * Math.log((1 - e * Math.sin(phi)) / (1 + e * Math.sin(phi))))

  const n = (m1 * m1 - m2 * m2) / (q2 - q1)
  const C = m1 * m1 + n * q1
  const rho0 = (a * Math.sqrt(C - n * q0)) / n
  const rho = (a * Math.sqrt(C - n * q)) / n
  const theta = n * (lambda - lon0)

  const x = x0 + rho * Math.sin(theta)
  const y = y0 + rho0 - rho * Math.cos(theta)

  return { x, y }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set global CORS headers early
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Cache-Control', 'public, max-age=86400') // Cache CDL data for 24 hours (it's annual)

  if (req.method === 'OPTIONS') {
    // Handle preflight requests
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { year, lat, lon } = req.query

    if (!year || !lat || !lon) {
      return res.status(400).json({
        error: 'Missing required parameters: year, lat, lon',
      })
    }

    // CropScape GetCDLValue API uses x/y in Albers Equal Area Conic projection (EPSG:5070)
    // Convert WGS84 lat/lon to Albers coordinates
    const lonNum = parseFloat(lon as string)
    const latNum = parseFloat(lat as string)
    const albers = wgs84ToAlbers(lonNum, latNum)

    const apiUrl = new URL('https://nassgeodata.gmu.edu/axis2/services/CDLService/GetCDLValue')
    apiUrl.searchParams.set('year', year as string)
    apiUrl.searchParams.set('x', albers.x.toFixed(2)) // Albers X coordinate
    apiUrl.searchParams.set('y', albers.y.toFixed(2)) // Albers Y coordinate

    console.log(
      `[CDL Value Proxy] Transforming WGS84 (${latNum}, ${lonNum}) to Albers (${albers.x.toFixed(
        2,
      )}, ${albers.y.toFixed(2)})`,
    )
    console.log(`[CDL Value Proxy] Fetching: ${apiUrl.toString()}`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      const response = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: {
          // Setting a specific User-Agent is good practice for external APIs
          'User-Agent': 'SoilViz-Pro/1.0',
          Accept: 'text/xml,application/xml,*/*',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[CDL Value Proxy] HTTP ${response.status}: ${response.statusText}`)
        console.error(`[CDL Value Proxy] Error body:`, errorText.substring(0, 200))

        // Check if it's a "no data" error (location outside CDL coverage/service area)
        if (errorText.includes('Failed to get value') || errorText.includes('No data')) {
          console.log(
            `[CDL Value Proxy] No CDL data available for year ${year} at this location. Returning 0.`,
          )
          // Return empty result instead of error, using XML structure expected by front end
          res.setHeader('Content-Type', 'text/xml')
          return res.status(200).send('<Result>0</Result>') // 0 = No Data
        }

        throw new Error(`CropScape API error: ${response.status} ${response.statusText}`)
      }

      // Get the XML response
      const xmlData = await response.text()

      console.log(`[CDL Value Proxy] Success for year ${year}: ${xmlData.substring(0, 200)}...`)

      // Set Content-Type specifically for the response body
      res.setHeader('Content-Type', 'text/xml')

      // Return the XML
      res.status(200).send(xmlData)
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        console.error(`[CDL Value Proxy] Request timeout for year ${year}`)
        throw new Error('Request timeout - CropScape API is taking too long to respond')
      }
      throw fetchError
    }
  } catch (error: any) {
    console.error('[CDL Value Proxy] Error:', error)

    // Ensure that in case of a 500 error, we return JSON, not XML (default might be something else)
    res.setHeader('Content-Type', 'application/json')
    res.status(500).json({
      error: 'Failed to fetch CDL value',
      details: error.message,
    })
  }
}
