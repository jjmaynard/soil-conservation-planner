// Next.js API Route for Ecological Site Data
// Server-side endpoint to fetch and format EDIT API data

import { NextApiRequest, NextApiResponse } from 'next';
import { EditApiService } from '#src/lib/edit-api';
import { formatESDForFarmers } from '#src/lib/esd-formatter';

// Increase API route timeout to 90 seconds for full descriptions
export const config = {
  api: {
    responseLimit: false,
    externalResolver: true,
  },
  maxDuration: 90, // 90 seconds max execution time
};

// Server-side cache to reduce EDIT API calls
const serverCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { ecoclassid } = req.query;
  
  if (!ecoclassid || typeof ecoclassid !== 'string') {
    return res.status(400).json({ error: 'Invalid ecoclassid' });
  }

  try {
    // Check server-side cache first
    const cached = serverCache.get(ecoclassid);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`[Server Cache] Using cached ESD for ${ecoclassid}`);
      return res.status(200).json(cached.data);
    }

    console.log('API Route: Fetching full ESD for', ecoclassid);
    const editService = new EditApiService();
    const esdData = await editService.getEcologicalSiteDescription(ecoclassid);
    console.log('API Route: Successfully fetched full ESD data');
    const farmerFriendly = formatESDForFarmers(esdData);
    
    // Cache the result
    serverCache.set(ecoclassid, { data: farmerFriendly, timestamp: Date.now() });
    console.log(`[Server Cache] Cached ESD for ${ecoclassid}`);
    
    res.status(200).json(farmerFriendly);
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      console.log('API Route: ESD not found for', ecoclassid);
      return res.status(404).json({ 
        error: 'Ecological site description not available',
        details: 'This ecological site does not have a published description in the EDIT database.'
      });
    }
    
    console.error('API Route Error fetching ESD:', error);
    res.status(500).json({ 
      error: 'Failed to fetch ecological site description',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
