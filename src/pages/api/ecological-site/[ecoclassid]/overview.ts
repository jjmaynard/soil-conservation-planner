// Next.js API Route for Ecological Site Overview (Fast/Lightweight)
// Returns basic ESD info quickly without full details

import { NextApiRequest, NextApiResponse } from 'next';
import { EditApiService } from '#src/lib/edit-api';

// Increase API route timeout to 60 seconds for slow EDIT API
export const config = {
  api: {
    responseLimit: false,
    externalResolver: true,
  },
  maxDuration: 60, // 60 seconds max execution time
};

// Server-side cache for overview data
const overviewCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour (overview data changes rarely)

// Format overview data into a simplified structure
function formatOverview(overviewData: any) {
  const generalInfo = overviewData.generalInformation || {};
  const narratives = generalInfo.narratives || {};
  const model = overviewData.model || {};
  
  // Extract key criteria text
  const keyCriteria = (generalInfo.keyCriteria || []).join(' ');
  
  // Combine narratives for concept preview
  const conceptText = keyCriteria || 
    narratives.physiographicFeatures || 
    narratives.ecologicalDynamics || 
    '';
  
  return {
    ecoclassId: generalInfo.ecoclassId || '',
    ecoclassName: generalInfo.ecoclassName || 'Unknown Ecological Site',
    location: generalInfo.geoUnitName || '',
    geoUnitSymbol: generalInfo.geoUnitSymbol || '',
    developmentStage: generalInfo.developmentStage || '',
    publicationDate: generalInfo.publicationDate || '',
    keyCriteria: generalInfo.keyCriteria || [],
    concept: conceptText,
    narratives: {
      physiographicFeatures: narratives.physiographicFeatures || '',
      climaticFeatures: narratives.climaticFeatures || '',
      soilFeatures: narratives.soilFeatures || '',
      ecologicalDynamics: narratives.ecologicalDynamics || ''
    },
    image: model.images && model.images.length > 0 ? {
      url: model.images[0].path || '',
      caption: model.images[0].caption || ''
    } : null,
    mlraSymbol: generalInfo.mlraSymbol || '',
    lruSymbol: generalInfo.lruSymbol || '',
  };
}

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
    const cached = overviewCache.get(ecoclassid);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`[Overview Cache] Using cached overview for ${ecoclassid}`);
      return res.status(200).json(cached.data);
    }

    console.log('API Route: Fetching overview for', ecoclassid);
    const editService = new EditApiService();
    const overviewData = await editService.getEcologicalSiteOverview(ecoclassid);
    console.log('API Route: Successfully fetched overview data');
    
    // Format the overview data
    const formattedOverview = formatOverview(overviewData);
    
    // Cache the result
    overviewCache.set(ecoclassid, { data: formattedOverview, timestamp: Date.now() });
    console.log(`[Overview Cache] Cached overview for ${ecoclassid}`);
    
    res.status(200).json(formattedOverview);
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      console.log('API Route: Overview not found for', ecoclassid);
      return res.status(404).json({ 
        error: 'Ecological site overview not available',
        details: 'This ecological site does not have a published description in the EDIT database.'
      });
    }
    
    console.error('API Route Error fetching overview:', error);
    res.status(500).json({ 
      error: 'Failed to fetch ecological site overview',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
