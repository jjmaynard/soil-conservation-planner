// Static Data Loader
// Loads static JSON configuration files for data sources without public APIs

import { getDataSource } from './providers/registry';

/**
 * Load static JSON data sources
 * @param sourceId - The ID of the data source from the registry
 * @returns The loaded data
 */
export async function loadStaticData<T>(sourceId: string): Promise<T> {
  const source = getDataSource(sourceId);
  
  if (source.type !== 'static_json' || !source.configPath) {
    throw new Error(`${sourceId} is not a static JSON data source`);
  }

  try {
    // Dynamic import of JSON config file
    const data = await import(`@${source.configPath}`);
    return data.default as T;
  } catch (error) {
    console.error(`Failed to load static data for ${sourceId}:`, error);
    throw new Error(`Static data not found: ${source.configPath}`);
  }
}

// ============================================================================
// Data Type Definitions
// ============================================================================

// Conservation Practices
export interface ConservationPractice {
  code: string;
  name: string;
  description: string;
  category: string;
  applicable_land_types: string[];
  resource_concerns: string[];
  effectiveness: Record<string, number>;
  cost_range: { min: number; max: number; units: string };
  specifications?: {
    typical_life: string;
    maintenance_requirements: string;
    installation_considerations: string[];
  };
}

// Hydric Soil
export interface HydricSoilIndicator {
  map_unit_key: string;
  component_name: string;
  hydric_rating: 'Yes' | 'No' | 'Unranked';
  hydric_criteria: string[];
  field_indicators: string[];
  drainage_class?: string;
  flooding_frequency?: string;
  ponding_frequency?: string;
}

// Plant Species
export interface PlantSpecies {
  symbol: string;
  scientific_name: string;
  common_name: string;
  family: string;
  duration: string;
  growth_habit: string;
  native_status: string;
  wetland_indicator: string;
  state?: string;
  suitability?: {
    erosion_control: 'Low' | 'Medium' | 'High';
    wildlife_value: 'Low' | 'Medium' | 'High';
    pollinator_value: 'Low' | 'Medium' | 'High';
  };
}

// EPA BMP (Best Management Practice)
export interface EPABestManagementPractice {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  pollutant_removal: Record<string, { min: number; max: number; median: number }>;
  cost_data?: {
    construction: { min: number; max: number; median: number; units: string };
    maintenance: { annual: number; units: string };
  };
  applicable_land_uses: string[];
  design_considerations: string[];
}

// Ecological Site
export interface EcologicalSite {
  site_id: string;
  site_name: string;
  mlra: string;
  land_resource_region: string;
  ecological_site_group?: string;
  soil_features: {
    texture: string;
    depth: string;
    drainage: string;
  };
  climate: {
    precipitation: { min: number; max: number; units: string };
    frost_free_days: { min: number; max: number };
  };
  dominant_plant_species: string[];
  state_and_transition_models?: any;
  reference_sheet_url?: string;
}

// FIA Site Index
export interface FIASiteIndex {
  species_code: string;
  common_name: string;
  scientific_name: string;
  site_index_curves: {
    base_age: number;
    site_index_values: number[];
    height_values: number[];
  }[];
  regions: string[];
  soil_requirements?: {
    texture_suitability: Record<string, string>;
    drainage_suitability: Record<string, string>;
    ph_range: { min: number; max: number };
  };
}

// ============================================================================
// Type Guards
// ============================================================================

export function isConservationPractice(data: any): data is ConservationPractice {
  return data && typeof data.code === 'string' && typeof data.name === 'string';
}

export function isHydricSoilIndicator(data: any): data is HydricSoilIndicator {
  return data && typeof data.map_unit_key === 'string' && typeof data.hydric_rating === 'string';
}

export function isPlantSpecies(data: any): data is PlantSpecies {
  return data && typeof data.symbol === 'string' && typeof data.scientific_name === 'string';
}

export function isEPABMP(data: any): data is EPABestManagementPractice {
  return data && typeof data.id === 'string' && typeof data.category === 'string';
}

export function isEcologicalSite(data: any): data is EcologicalSite {
  return data && typeof data.site_id === 'string' && typeof data.mlra === 'string';
}

export function isFIASiteIndex(data: any): data is FIASiteIndex {
  return data && typeof data.species_code === 'string' && Array.isArray(data.site_index_curves);
}
