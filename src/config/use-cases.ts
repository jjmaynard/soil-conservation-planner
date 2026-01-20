// Use Cases Configuration
// Defines analysis workflows for each land type

export interface UseCase {
  id: string;
  land_type_id: string;
  name: string;
  short_name: string;
  description: string;
  objectives: string[];
  tab_ids: string[];
  estimated_time: string;
  target_users: string[];
  keywords?: string[];
  api_integrations: Record<string, boolean>;
  sort_order: number;
  is_active: boolean;
}

export const USE_CASES: UseCase[] = [
  // ============================================================================
  // CROPLAND USE CASES
  // ============================================================================
  {
    id: 'cropland-erosion',
    land_type_id: 'cropland',
    name: 'Erosion & Conservation Planning',
    short_name: 'Erosion Planning',
    description: 'Address soil loss and implement conservation practices',
    objectives: [
      'Assess erosion risk via GEE RUSLE-EOS',
      'Identify vulnerable areas',
      'Select practices from NRCS standards'
    ],
    tab_ids: ['erosion', 'svi', 'flow', 'concerns', 'practices'],
    estimated_time: '2-3 minutes',
    target_users: ['farmers', 'conservation planners', 'nrcs technicians'],
    keywords: ['erosion', 'soil loss', 'conservation', 'rusle'],
    api_integrations: { gee_rusle: true, nrcs_practices: true, ssurgo: true },
    sort_order: 1,
    is_active: true
  },
  {
    id: 'cropland-production',
    land_type_id: 'cropland',
    name: 'Production Optimization',
    short_name: 'Production',
    description: 'Maximize crop yield and optimize inputs',
    objectives: [
      'Fetch NCCPI from SSURGO API',
      'Create management zones',
      'Optimize inputs'
    ],
    tab_ids: ['soil', 'productivity', 'zones', 'drainage'],
    estimated_time: '2-3 minutes',
    target_users: ['farmers', 'agronomists', 'crop consultants'],
    keywords: ['productivity', 'yield', 'nccpi', 'management zones'],
    api_integrations: { ssurgo: true },
    sort_order: 2,
    is_active: true
  },

  // ============================================================================
  // FORESTRY USE CASES
  // ============================================================================
  {
    id: 'forestry-site-productivity',
    land_type_id: 'forestry',
    name: 'Forest Site Productivity',
    short_name: 'Site Productivity',
    description: 'Assess timber productivity potential',
    objectives: [
      'Determine site index from FIA data',
      'Evaluate soil suitability',
      'Estimate timber yield'
    ],
    tab_ids: ['soil', 'site_index', 'productivity', 'practices'],
    estimated_time: '2-3 minutes',
    target_users: ['foresters', 'timberland managers', 'consultants'],
    keywords: ['site index', 'timber', 'forestry', 'productivity'],
    api_integrations: { fia: true, ssurgo: true },
    sort_order: 1,
    is_active: true
  },
  {
    id: 'forestry-erosion',
    land_type_id: 'forestry',
    name: 'Forest Erosion Management',
    short_name: 'Erosion Management',
    description: 'Prevent erosion from logging and forest operations',
    objectives: [
      'Assess erosion risk',
      'Plan logging operations',
      'Select BMPs'
    ],
    tab_ids: ['erosion', 'slope', 'practices'],
    estimated_time: '2-3 minutes',
    target_users: ['foresters', 'logging contractors'],
    keywords: ['erosion', 'logging', 'bmp', 'forest roads'],
    api_integrations: { gee_rusle: true, ssurgo: true, nrcs_practices: true },
    sort_order: 2,
    is_active: true
  },

  // ============================================================================
  // RANGELAND USE CASES
  // ============================================================================
  {
    id: 'rangeland-grazing',
    land_type_id: 'rangeland',
    name: 'Grazing Management',
    short_name: 'Grazing',
    description: 'Optimize grazing capacity and land health',
    objectives: [
      'Assess ecological site',
      'Determine carrying capacity',
      'Plan rotational grazing'
    ],
    tab_ids: ['soil', 'ecological_site', 'productivity', 'practices'],
    estimated_time: '2-3 minutes',
    target_users: ['ranchers', 'range managers', 'nrcs technicians'],
    keywords: ['grazing', 'ecological site', 'carrying capacity', 'rangeland'],
    api_integrations: { usda_edit: true, ssurgo: true, nrcs_plants: true },
    sort_order: 1,
    is_active: true
  },

  // ============================================================================
  // WETLAND USE CASES
  // ============================================================================
  {
    id: 'wetland-delineation',
    land_type_id: 'wetland',
    name: 'Wetland Delineation Support',
    short_name: 'Delineation',
    description: 'Support wetland identification and delineation',
    objectives: [
      'Check hydric soil indicators',
      'Review NWI classification',
      'Document field indicators'
    ],
    tab_ids: ['hydric', 'drainage', 'nwi', 'practices'],
    estimated_time: '2-3 minutes',
    target_users: ['environmental consultants', 'wetland specialists', 'regulators'],
    keywords: ['wetland', 'hydric soils', 'delineation', 'nwi'],
    api_integrations: { nrcs_hydric_soils: true, nwi: true, ssurgo: true },
    sort_order: 1,
    is_active: true
  },
  {
    id: 'wetland-restoration',
    land_type_id: 'wetland',
    name: 'Wetland Restoration Planning',
    short_name: 'Restoration',
    description: 'Plan wetland restoration and enhancement',
    objectives: [
      'Assess hydrology',
      'Select native plants',
      'Design restoration practices'
    ],
    tab_ids: ['hydric', 'drainage', 'plants', 'practices'],
    estimated_time: '3-4 minutes',
    target_users: ['restoration specialists', 'conservation planners'],
    keywords: ['restoration', 'wetland creation', 'native plants'],
    api_integrations: { nrcs_hydric_soils: true, nrcs_plants: true, nrcs_practices: true },
    sort_order: 2,
    is_active: true
  },

  // ============================================================================
  // DEVELOPED/URBAN USE CASES
  // ============================================================================
  {
    id: 'developed-stormwater',
    land_type_id: 'developed',
    name: 'Stormwater Management',
    short_name: 'Stormwater',
    description: 'Design stormwater BMPs and LID practices',
    objectives: [
      'Assess infiltration capacity',
      'Select BMPs from EPA database',
      'Calculate retention volume'
    ],
    tab_ids: ['soil', 'infiltration', 'bmp', 'practices'],
    estimated_time: '2-3 minutes',
    target_users: ['civil engineers', 'land developers', 'stormwater managers'],
    keywords: ['stormwater', 'bmp', 'lid', 'infiltration', 'runoff'],
    api_integrations: { ssurgo: true, epa_bmp: true },
    sort_order: 1,
    is_active: true
  },

  // ============================================================================
  // NATURAL AREAS USE CASES
  // ============================================================================
  {
    id: 'natural-conservation',
    land_type_id: 'natural',
    name: 'Conservation Planning',
    short_name: 'Conservation',
    description: 'Assess and protect natural areas',
    objectives: [
      'Document soil characteristics',
      'Identify conservation concerns',
      'Select protection practices'
    ],
    tab_ids: ['soil', 'erosion', 'concerns', 'practices'],
    estimated_time: '2-3 minutes',
    target_users: ['conservation biologists', 'land trust staff', 'park managers'],
    keywords: ['conservation', 'natural areas', 'protection', 'biodiversity'],
    api_integrations: { ssurgo: true, nrcs_practices: true },
    sort_order: 1,
    is_active: true
  }
];

// Helper functions
export function getUseCasesByLandType(landTypeId: string): UseCase[] {
  return USE_CASES
    .filter(uc => uc.land_type_id === landTypeId && uc.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function getUseCase(id: string): UseCase | undefined {
  return USE_CASES.find(uc => uc.id === id);
}

export function getAllUseCases(): UseCase[] {
  return USE_CASES.filter(uc => uc.is_active).sort((a, b) => a.sort_order - b.sort_order);
}

export function searchUseCases(query: string): UseCase[] {
  const lowerQuery = query.toLowerCase();
  return USE_CASES.filter(uc => 
    uc.is_active && (
      uc.name.toLowerCase().includes(lowerQuery) ||
      uc.description.toLowerCase().includes(lowerQuery) ||
      uc.keywords?.some(k => k.toLowerCase().includes(lowerQuery))
    )
  );
}
