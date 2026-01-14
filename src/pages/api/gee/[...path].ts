import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

const GEE_API_BASE_URL = process.env.GEE_API_URL || 'https://gee-api-production.up.railway.app'

/**
 * Catch-all proxy for GEE API endpoints
 * This handles any GEE API routes not explicitly defined in other API route files
 * Path structure: /api/gee/[...path] where path starts with 'api/'
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Extract the path after /api/gee/
    const { path } = req.query
    const pathArray = Array.isArray(path) ? path : [path]
    
    // Join path segments - they already include 'api' prefix from the route structure
    const apiPath = pathArray.join('/')
    
    // Build the full URL - path already has /api prefix
    const url = `${GEE_API_BASE_URL}/${apiPath}`
    
    // Build query string from request query (excluding 'path' param)
    const queryParams = { ...req.query }
    delete queryParams.path
    
    // Forward the request
    const response = await axios({
      method: req.method as any,
      url,
      data: req.body,
      params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
      },
      timeout: 150000,
    })

    res.status(response.status).json(response.data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500
      const data = error.response?.data || { error: 'Internal server error' }
      return res.status(status).json(data)
    }
    res.status(500).json({ error: 'Internal server error' })
  }
}
