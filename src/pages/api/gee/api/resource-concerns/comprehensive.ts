import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

const GEE_API_BASE_URL = process.env.GEE_API_URL || 'https://gee-api-production.up.railway.app'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const queryString = req.url?.split('?')[1] || ''
    const response = await axios.post(
      `${GEE_API_BASE_URL}/api/resource-concerns/comprehensive${queryString ? '?' + queryString : ''}`,
      req.body,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 90000,
      }
    )

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
