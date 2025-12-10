/**
 * API endpoint to retrieve Official Series Description (OSD) data
 * GET /api/osd?component=ABBOTT
 */

import type { NextApiRequest, NextApiResponse } from 'next'

import { loadOSDFile, parseOSD, formatOSDForDisplay } from '#src/utils/osdParser'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { component } = req.query

  if (!component || typeof component !== 'string') {
    return res.status(400).json({ error: 'Component name is required' })
  }

  try {
    // Load OSD file
    const osdText = await loadOSDFile(component)

    if (!osdText) {
      return res.status(404).json({ error: `OSD not found for component: ${component}` })
    }

    // Parse OSD
    const osdData = parseOSD(osdText)

    if (!osdData) {
      return res.status(500).json({ error: 'Failed to parse OSD data' })
    }

    // Format for display
    const formatted = formatOSDForDisplay(osdData)

    res.status(200).json({
      success: true,
      component: component.toUpperCase(),
      data: osdData,
      formatted,
    })
  } catch (error) {
    console.error('Error processing OSD request:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
