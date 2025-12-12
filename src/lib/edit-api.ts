// EDIT API Service Layer
// Handles communication with USDA NRCS EDIT (Ecological Dynamics Interpretive Tool) API

export interface EcoclassId {
  catalog: string;      // e.g., "esd"
  geoUnit: string;      // e.g., "128X" 
  ecoclass: string;     // e.g., "F128XY001TN"
}

export interface EcologicalSiteData {
  generalInformation?: {
    narratives?: {
      ecoclassName?: string;
      ecoclassConcept?: string;
      classification?: string;
    };
    geoUnitName?: string;
    geoUnitSymbol?: string;
    dominantSpecies?: {
      dominantTree1?: string;
      dominantShrub1?: string;
      dominantHerb1?: string;
    };
  };
  physiographicFeatures?: {
    landforms?: Array<{ landform: string }>;
    aspect?: string[];
    intervalProperties?: Array<{
      property: string;
      representativeLow: number;
      representativeHigh: number;
      unit: string;
    }>;
    images?: Array<{ path: string; caption?: string }>;
  };
  climaticFeatures?: {
    map?: { average?: number };
    frostFreeDays?: { average?: number };
  };
  soilFeatures?: {
    ordinalProperties?: Array<{
      property: string;
      representativeLow?: string;
      representativeHigh?: string;
    }>;
    texture?: Array<{
      texture: string;
      modifier1?: string;
    }>;
    intervalProperties?: Array<{
      property: string;
      representativeLow: number;
      representativeHigh: number;
      unit: string;
    }>;
    images?: Array<{ path: string; caption?: string }>;
  };
  ecologicalDynamics?: {
    narratives?: {
      ecologicalDynamics?: string;
    };
    images?: Array<{ path: string; caption?: string }>;
  };
  interpretations?: {
    siteProductivity?: Array<{
      commonName: string;
      indexMin: number;
      indexMax: number;
    }>;
    narratives?: {
      woodProducts?: string;
      animalCommunity?: string;
      recreationalUses?: string;
      hydrologicalFunctions?: string;
    };
  };
}

export class EditApiService {
  private baseUrl = 'https://edit.jornada.nmsu.edu/services';
  
  // Parse SSURGO ecoclassid into components
  static parseEcoclassId(ecoclassid: string): EcoclassId | null {
    // SSURGO ecoclassid format examples: 
    // F128XY001TN -> geoUnit: 128X, ecoclass: F128XY001TN
    // R039XA011NM -> geoUnit: 039X, ecoclass: R039XA011NM
    // R075XY058NE -> geoUnit: 075X, ecoclass: R075XY058NE
    // Pattern: [FR] + 3-4 digits + 1 letter (geoUnit) + remaining characters
    const match = ecoclassid.match(/^[FR](\d{3,4}[A-Z])[A-Z]\d{3}[A-Z]{2}$/);
    if (!match) {
      console.error('Failed to parse ecoclassid:', ecoclassid);
      return null;
    }
    
    const geoUnit = match[1];
    return {
      catalog: 'esd', // Always 'esd' for ecological site descriptions
      geoUnit,
      ecoclass: ecoclassid
    };
  }

  // Get full ecological site description
  async getEcologicalSiteDescription(
    ecoclassid: string, 
    measurementSystem: 'usc' | 'metric' = 'usc'
  ): Promise<EcologicalSiteData> {
    const parsed = EditApiService.parseEcoclassId(ecoclassid);
    if (!parsed) throw new Error(`Invalid ecoclassid format: ${ecoclassid}`);

    const { catalog, geoUnit, ecoclass } = parsed;
    const url = `${this.baseUrl}/descriptions/${catalog}/${geoUnit}/${ecoclass}.json?measurementSystem=${measurementSystem}`;
    
    console.log('EditApiService: Fetching full description from URL:', url);
    
    try {
      const response = await fetch(url);
      console.log('EditApiService: Response status:', response.status);
      
      if (response.status === 404) {
        throw new Error('NOT_FOUND');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('EditApiService: Error response:', errorText);
        throw new Error(`EDIT API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('EditApiService: Successfully parsed full description JSON data');
      return data;
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        throw error;
      }
      console.error('EditApiService: Fetch error:', error);
      throw error;
    }
  }

  // Get overview only (lighter weight)
  async getEcologicalSiteOverview(ecoclassid: string): Promise<any> {
    const parsed = EditApiService.parseEcoclassId(ecoclassid);
    if (!parsed) throw new Error(`Invalid ecoclassid format: ${ecoclassid}`);

    const { catalog, geoUnit, ecoclass } = parsed;
    const url = `${this.baseUrl}/descriptions/${catalog}/${geoUnit}/${ecoclass}/overview.json`;
    
    console.log('EditApiService: Fetching overview from URL:', url);
    
    try {
      const response = await fetch(url);
      console.log('EditApiService: Response status:', response.status);
      
      if (response.status === 404) {
        throw new Error('NOT_FOUND');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('EditApiService: Error response:', errorText);
        throw new Error(`EDIT API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('EditApiService: Successfully parsed overview JSON data');
      return data;
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        throw error;
      }
      console.error('EditApiService: Fetch error:', error);
      throw error;
    }
  }
}
