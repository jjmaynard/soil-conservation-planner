// Data Transformation Layer
// Transforms complex EDIT API responses into farmer-friendly data structures

import type { EcologicalSiteData } from './edit-api';

export interface FarmerFriendlyESD {
  basicInfo: {
    siteName: string;
    location: string;
    suitability: string;
    keyMessage: string;
    ecoclassConcept: string;
  };
  landCharacteristics: {
    terrain: string;
    landforms: string;
    soils: string;
    climate: string;
    elevation: string;
    slopes: string;
  };
  productivity: {
    dominantVegetation: string;
    expectedYields?: string;
    bestUses: string[];
    limitations: string[];
  };
  management: {
    opportunities: string[];
    challenges: string[];
    considerations: string[];
  };
  resources: {
    images: Array<{url: string; caption: string}>;
    additionalInfo?: string;
  };
  rawData?: EcologicalSiteData; // Full raw data for detailed modal
}

export function formatESDForFarmers(esdData: EcologicalSiteData): FarmerFriendlyESD {
  const { generalInformation, physiographicFeatures, climaticFeatures, 
          soilFeatures, ecologicalDynamics, interpretations } = esdData;

  // Collect all images from different sections
  const allImages = [
    ...(physiographicFeatures?.images || []),
    ...(soilFeatures?.images || []),
    ...(ecologicalDynamics?.images || [])
  ];
  
  console.log('ESD Formatter: Total images found:', allImages.length);
  if (allImages.length > 0) {
    console.log('ESD Formatter: Sample image data:', allImages[0]);
  }

  return {
    basicInfo: {
      siteName: generalInformation?.narratives?.ecoclassName || 'Unknown Site',
      location: formatLocation(generalInformation?.geoUnitName, generalInformation?.geoUnitSymbol),
      suitability: extractSuitability(generalInformation?.narratives?.ecoclassConcept),
      keyMessage: summarizeKeyMessage(generalInformation?.narratives?.ecoclassConcept),
      ecoclassConcept: generalInformation?.narratives?.ecoclassConcept || ''
    },
    
    landCharacteristics: {
      terrain: formatTerrain(physiographicFeatures),
      landforms: formatLandforms(physiographicFeatures),
      soils: formatSoils(soilFeatures),
      climate: formatClimate(climaticFeatures),
      elevation: formatElevation(physiographicFeatures?.intervalProperties),
      slopes: formatSlopes(physiographicFeatures?.intervalProperties)
    },
    
    productivity: {
      dominantVegetation: formatDominantSpecies(generalInformation?.dominantSpecies),
      expectedYields: formatProductivity(interpretations?.siteProductivity),
      bestUses: extractBestUses(interpretations),
      limitations: extractLimitations(soilFeatures, physiographicFeatures)
    },
    
    management: {
      opportunities: extractOpportunities(ecologicalDynamics?.narratives, interpretations),
      challenges: extractChallenges(ecologicalDynamics?.narratives),
      considerations: extractManagementConsiderations(interpretations)
    },
    
    resources: {
      images: formatImages([
        ...(physiographicFeatures?.images || []),
        ...(soilFeatures?.images || []),
        ...(ecologicalDynamics?.images || [])
      ]),
      additionalInfo: generalInformation?.narratives?.classification
    },
    
    rawData: esdData // Include full raw data for detailed modal
  };
}

// Helper functions for data transformation
function formatLocation(geoUnitName?: string, geoUnitSymbol?: string): string {
  const name = geoUnitName?.trim() || '';
  const symbol = geoUnitSymbol?.trim() || '';
  
  if (name && symbol) {
    return `${name} (${symbol})`;
  } else if (name) {
    return name;
  } else if (symbol) {
    return symbol;
  }
  return 'Location information not available';
}

function extractSuitability(concept?: string): string {
  if (!concept) return 'Suitability information not available';
  
  const suitabilityKeywords = [
    { keyword: 'forested', label: 'forestry and timber production' },
    { keyword: 'grassland', label: 'grazing and grassland management' },
    { keyword: 'pasture', label: 'pasture and livestock grazing' },
    { keyword: 'cropland', label: 'crop production' },
    { keyword: 'grazing', label: 'livestock grazing' },
    { keyword: 'timber', label: 'timber production' },
    { keyword: 'wildlife', label: 'wildlife habitat' },
    { keyword: 'conservation', label: 'conservation and habitat management' },
    { keyword: 'rangeland', label: 'rangeland management' },
    { keyword: 'wetland', label: 'wetland conservation' }
  ];
  
  const found = suitabilityKeywords.find(item => 
    concept.toLowerCase().includes(item.keyword)
  );
  
  if (found) {
    return `Primarily suitable for ${found.label}`;
  }
  
  // If no specific keyword found, extract first meaningful sentence about the site
  const firstSentence = concept.split('.')[0].trim();
  if (firstSentence.length > 20 && firstSentence.length < 150) {
    return firstSentence;
  }
  
  return 'Multiple land use potential - see description below';
}

function summarizeKeyMessage(concept?: string): string {
  if (!concept) return '';
  
  // Extract first sentence or first 200 characters
  const firstSentence = concept.split('.')[0] + '.';
  return firstSentence.length > 200 ? 
    concept.substring(0, 197) + '...' : 
    firstSentence;
}

function formatTerrain(physiographic: any): string {
  const aspects = physiographic?.aspect?.join(', ') || '';
  
  if (aspects) {
    return `Aspects: ${aspects}`;
  }
  
  return 'Terrain information not available';
}

function formatLandforms(physiographic: any): string {
  const landforms = physiographic?.landforms?.map((lf: any) => lf.landform).join(', ') || '';
  
  if (landforms) {
    return landforms;
  }
  
  return 'Landform information not available';
}

function formatSoils(soilFeatures: any): string {
  const drainage = soilFeatures?.ordinalProperties?.find((prop: any) => 
    prop.property === 'Drainage class'
  );
  const texture = soilFeatures?.texture?.[0];
  const depth = soilFeatures?.intervalProperties?.find((prop: any) => 
    prop.property === 'Soil depth'
  );
  
  let soilDesc = '';
  if (drainage) {
    soilDesc += `${drainage.representativeLow} to ${drainage.representativeHigh} drainage`;
  }
  if (texture) {
    const textureDesc = `${texture.modifier1 || ''} ${texture.texture}`.trim();
    soilDesc += soilDesc ? `, ${textureDesc} texture` : `${textureDesc} texture`;
  }
  if (depth) {
    soilDesc += soilDesc ? `, ${depth.representativeLow}-${depth.representativeHigh} ${depth.unit} deep` : 
               `${depth.representativeLow}-${depth.representativeHigh} ${depth.unit} deep`;
  }
  
  return soilDesc || 'Soil information not available';
}

function formatClimate(climaticFeatures: any): string {
  const precip = climaticFeatures?.map;
  const frostFree = climaticFeatures?.frostFreeDays;
  
  let climate = '';
  if (precip?.average) {
    climate += `${precip.average}" annual precipitation`;
  }
  if (frostFree?.average) {
    climate += climate ? `, ${frostFree.average} frost-free days` : 
               `${frostFree.average} frost-free days`;
  }
  
  return climate || 'Climate information not available';
}

function formatElevation(intervalProps?: any[]): string {
  const elevProp = intervalProps?.find(prop => prop.property === 'Elevation');
  if (!elevProp) return 'Elevation data not available';
  
  return `${elevProp.representativeLow}-${elevProp.representativeHigh} ${elevProp.unit}`;
}

function formatSlopes(intervalProps?: any[]): string {
  const slopeProp = intervalProps?.find(prop => prop.property === 'Slope');
  if (!slopeProp) return 'Slope data not available';
  
  return `${slopeProp.representativeLow}-${slopeProp.representativeHigh}${slopeProp.unit}`;
}

function formatDominantSpecies(dominantSpecies: any): string {
  if (!dominantSpecies) return 'Vegetation information not available';
  
  const species = [];
  if (dominantSpecies.dominantTree1) species.push(`Trees: ${dominantSpecies.dominantTree1}`);
  if (dominantSpecies.dominantShrub1) species.push(`Shrubs: ${dominantSpecies.dominantShrub1}`);
  if (dominantSpecies.dominantHerb1) species.push(`Herbs: ${dominantSpecies.dominantHerb1}`);
  
  return species.join(', ') || 'Vegetation data not available';
}

function formatProductivity(productivity?: any[]): string {
  if (!productivity?.length) return '';
  
  return productivity.map(prod => 
    `${prod.commonName}: Site Index ${prod.indexMin}-${prod.indexMax}`
  ).join(', ');
}

function extractBestUses(interpretations: any): string[] {
  const uses = [];
  
  if (interpretations?.narratives?.woodProducts) {
    uses.push('Timber/Forestry');
  }
  if (interpretations?.narratives?.animalCommunity) {
    uses.push('Wildlife Habitat');
  }
  if (interpretations?.narratives?.recreationalUses) {
    uses.push('Recreation');
  }
  
  return uses.length ? uses : ['Land use information not available'];
}

function extractLimitations(soilFeatures: any, physiographicFeatures: any): string[] {
  const limitations = [];
  
  // Check for steep slopes
  const slope = physiographicFeatures?.intervalProperties?.find((prop: any) => 
    prop.property === 'Slope'
  );
  if (slope && slope.representativeHigh > 30) {
    limitations.push('Steep slopes limit machinery access');
  }
  
  // Check for drainage issues
  const drainage = soilFeatures?.ordinalProperties?.find((prop: any) => 
    prop.property === 'Drainage class'
  );
  if (drainage?.representativeLow?.toLowerCase().includes('poor')) {
    limitations.push('Poor drainage may limit use');
  }
  
  // Check for shallow soils
  const depth = soilFeatures?.intervalProperties?.find((prop: any) => 
    prop.property === 'Soil depth'
  );
  if (depth && depth.representativeLow < 20) {
    limitations.push('Shallow soils limit root development');
  }
  
  return limitations.length ? limitations : ['No major limitations identified'];
}

function extractOpportunities(ecologicalDynamics: any, interpretations: any): string[] {
  const opportunities = [];
  
  if (interpretations?.narratives?.woodProducts) {
    opportunities.push('Timber production potential');
  }
  if (interpretations?.narratives?.animalCommunity) {
    opportunities.push('Wildlife habitat enhancement');
  }
  if (ecologicalDynamics?.ecologicalDynamics?.toLowerCase().includes('restoration')) {
    opportunities.push('Habitat restoration potential');
  }
  
  return opportunities.length ? opportunities : ['Contact local extension for opportunities'];
}

function extractChallenges(ecologicalDynamics: any): string[] {
  const challenges = [];
  const dynamics = ecologicalDynamics?.ecologicalDynamics || '';
  
  if (dynamics.toLowerCase().includes('invasive')) {
    challenges.push('Invasive species management needed');
  }
  if (dynamics.toLowerCase().includes('fire')) {
    challenges.push('Fire management considerations');
  }
  if (dynamics.toLowerCase().includes('erosion')) {
    challenges.push('Erosion control needed');
  }
  
  return challenges.length ? challenges : ['No major challenges identified'];
}

function extractManagementConsiderations(interpretations: any): string[] {
  const considerations = [];
  
  if (interpretations?.narratives?.hydrologicalFunctions) {
    considerations.push('Consider water quality impacts');
  }
  if (interpretations?.narratives?.animalCommunity) {
    considerations.push('Wildlife timing considerations');
  }
  
  return considerations.length ? considerations : ['Follow best management practices'];
}

function formatImages(images: any[]): Array<{url: string; caption: string}> {
  if (!images || images.length === 0) return [];
  
  return images
    .filter(img => img && (img.path || img.url))
    .map(img => {
      let imageUrl = img.path || img.url || '';
      
      // If the path is relative, prepend the EDIT base URL
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `https://edit.jornada.nmsu.edu${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }
      
      return {
        url: imageUrl,
        caption: img.caption || img.title || 'Site image'
      };
    })
    .filter(img => img.url); // Remove any images without valid URLs
}
