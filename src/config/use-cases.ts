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
  {
    id: 'cropland-water-management',
    land_type_id: 'cropland',
    name: 'Water Management',
    short_name: 'Water Management',
    description: 'Optimize drainage and irrigation planning',
    objectives: [
      'Assess drainage needs',
      'Plan irrigation systems',
      'Identify wet areas',
      'Optimize water use efficiency'
    ],
    tab_ids: ['drainage', 'soil', 'productivity', 'practices'],
    estimated_time: '2-3 minutes',
    target_users: ['farmers', 'irrigation specialists', 'drainage contractors'],
    keywords: ['drainage', 'irrigation', 'water management', 'tile'],
    api_integrations: { ssurgo: true, nrcs_practices: true },
    sort_order: 3,
    is_active: true
  },
  {
    id: 'cropland-compliance',
    land_type_id: 'cropland',
    name: 'Compliance & Documentation',
    short_name: 'Compliance',
    description: 'Support regulatory compliance and record keeping',
    objectives: [
      'Document soil conditions',
      'Support conservation compliance',
      'Generate required reports',
      'Track conservation practices'
    ],
    tab_ids: ['soil', 'erosion', 'concerns', 'practices'],
    estimated_time: '2-3 minutes',
    target_users: ['farmers', 'nrcs technicians', 'fsa agents'],
    keywords: ['compliance', 'documentation', 'conservation', 'reporting'],
    api_integrations: { ssurgo: true, gee_rusle: true, nrcs_practices: true },
    sort_order: 4,
    is_active: true
  },
  {
    id: 'regenerativet-agriculture',
    land_type_id: 'cropland',
    name: 'Regenerative Agriculture',
    short_name: 'Regenerative Agriculture',
    description: 'Plan transitions to organic, cover crops, or reduced tillage',
    objectives: [
      'Assess soil health baseline',
      'Evaluate organic conversion potential',
      'Plan cover crop integration',
      'Assess reduced tillage feasibility'
    ],
    tab_ids: ['soil', 'productivity', 'practices'],
    estimated_time: '2-3 minutes',
    target_users: ['farmers', 'organic certifiers', 'conservation advisors'],
    keywords: ['organic', 'cover crops', 'no-till', 'soil health', 'transition'],
    api_integrations: { ssurgo: true, nrcs_practices: true },
    sort_order: 5,
    is_active: true
  },
  {
    id: 'cropland-comprehensive',
    land_type_id: 'cropland',
    name: 'Full Comprehensive Analysis',
    short_name: 'Comprehensive',
    description: 'Complete soil and land analysis with all available data',
    objectives: [
      'Run all available analyses',
      'Get complete soil profile',
      'Review all interpretations',
      'Access all conservation practices'
    ],
    tab_ids: ['soil', 'erosion', 'productivity', 'drainage', 'concerns', 'practices'],
    estimated_time: '4-5 minutes',
    target_users: ['all users', 'comprehensive assessment'],
    keywords: ['comprehensive', 'complete', 'full analysis', 'all data'],
    api_integrations: { ssurgo: true, gee_rusle: true, nrcs_practices: true },
    sort_order: 99,
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
  {
    id: 'forestry-health-sustainability',
    land_type_id: 'forestry',
    name: 'Forest Health & Sustainability',
    short_name: 'Forest Health',
    description: 'Evaluate soil health for long-term forest sustainability',
    objectives: [
      'Assess soil organic carbon stocks',
      'Evaluate nutrient cycling capacity',
      'Assess erosion risk on harvest sites',
      'Evaluate stream buffer effectiveness'
    ],
    tab_ids: ['soil', 'erosion', 'productivity', 'practices'],
    estimated_time: '2-3 minutes',
    target_users: ['foresters', 'conservation professionals', 'land managers'],
    keywords: ['soil health', 'carbon', 'sustainability', 'nutrient cycling'],
    api_integrations: { ssurgo: true, gee_rusle: true, nrcs_practices: true },
    sort_order: 3,
    is_active: true
  },
  {
    id: 'forestry-reforestation',
    land_type_id: 'forestry',
    name: 'Reforestation & Afforestation',
    short_name: 'Reforestation',
    description: 'Plan tree planting and forest establishment',
    objectives: [
      'Determine site preparation requirements',
      'Get species selection guidance',
      'Identify establishment risk factors',
      'Assess long-term productivity potential'
    ],
    tab_ids: ['soil', 'productivity', 'practices'],
    estimated_time: '2-3 minutes',
    target_users: ['foresters', 'landowners', 'conservation planners'],
    keywords: ['reforestation', 'afforestation', 'tree planting', 'species selection'],
    api_integrations: { ssurgo: true, nrcs_practices: true },
    sort_order: 4,
    is_active: true
  },
  {
    id: 'forestry-comprehensive',
    land_type_id: 'forestry',
    name: 'Full Comprehensive Analysis',
    short_name: 'Comprehensive',
    description: 'Complete forestry and soil analysis with all available data',
    objectives: [
      'Run all forestry analyses',
      'Get complete site assessment',
      'Review all forest health metrics',
      'Access all forest management practices'
    ],
    tab_ids: ['soil', 'site_index', 'erosion', 'productivity', 'practices'],
    estimated_time: '4-5 minutes',
    target_users: ['all forestry users', 'comprehensive assessment'],
    keywords: ['comprehensive', 'complete', 'full analysis', 'all data'],
    api_integrations: { ssurgo: true, fia: true, gee_rusle: true, nrcs_practices: true },
    sort_order: 99,
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
      'Plan rotational grazing',
      'Evaluate compaction vulnerability'
    ],
    tab_ids: ['soil', 'ecological_site', 'productivity', 'practices'],
    estimated_time: '2-3 minutes',
    target_users: ['ranchers', 'range managers', 'nrcs technicians'],
    keywords: ['grazing', 'ecological site', 'carrying capacity', 'rangeland'],
    api_integrations: { usda_edit: true, ssurgo: true, nrcs_plants: true },
    sort_order: 1,
    is_active: true
  },
  {
    id: 'rangeland-improvement',
    land_type_id: 'rangeland',
    name: 'Range Improvement',
    short_name: 'Range Improvement',
    description: 'Plan seeding, brush management, and fertility improvements',
    objectives: [
      'Assess seeding/interseeding potential',
      'Evaluate brush management impacts',
      'Identify fertility amendment needs',
      'Prioritize erosion control'
    ],
    tab_ids: ['soil', 'erosion', 'ecological_site', 'practices'],
    estimated_time: '2-3 minutes',
    target_users: ['ranchers', 'range conservationists', 'land managers'],
    keywords: ['seeding', 'brush management', 'fertility', 'range improvement'],
    api_integrations: { ssurgo: true, usda_edit: true, nrcs_practices: true },
    sort_order: 2,
    is_active: true
  },
  {
    id: 'rangeland-invasive',
    land_type_id: 'rangeland',
    name: 'Invasive Species Management',
    short_name: 'Invasive Species',
    description: 'Assess invasion risk and plan treatments',
    objectives: [
      'Evaluate disturbance susceptibility',
      'Plan treatment strategies',
      'Assess restoration potential',
      'Guide native species establishment'
    ],
    tab_ids: ['soil', 'ecological_site', 'concerns', 'practices'],
    estimated_time: '2-3 minutes',
    target_users: ['range managers', 'weed specialists', 'restoration ecologists'],
    keywords: ['invasive species', 'weeds', 'restoration', 'native plants'],
    api_integrations: { ssurgo: true, usda_edit: true, nrcs_plants: true },
    sort_order: 3,
    is_active: true
  },
  {
    id: 'rangeland-wildlife',
    land_type_id: 'rangeland',
    name: 'Wildlife Habitat Enhancement',
    short_name: 'Wildlife Habitat',
    description: 'Enhance habitat quality for wildlife',
    objectives: [
      'Assess habitat quality',
      'Evaluate food plot suitability',
      'Identify water development sites',
      'Plan cover establishment'
    ],
    tab_ids: ['soil', 'productivity', 'ecological_site', 'practices'],
    estimated_time: '2-3 minutes',
    target_users: ['wildlife biologists', 'ranchers', 'land managers'],
    keywords: ['wildlife', 'habitat', 'food plots', 'cover'],
    api_integrations: { ssurgo: true, usda_edit: true, nrcs_plants: true },
    sort_order: 4,
    is_active: true
  },
  {
    id: 'rangeland-comprehensive',
    land_type_id: 'rangeland',
    name: 'Full Comprehensive Analysis',
    short_name: 'Comprehensive',
    description: 'Complete rangeland analysis with all available data',
    objectives: [
      'Run all rangeland analyses',
      'Get complete ecological site assessment',
      'Review all range health metrics',
      'Access all range management practices'
    ],
    tab_ids: ['soil', 'ecological_site', 'productivity', 'erosion', 'concerns', 'practices'],
    estimated_time: '4-5 minutes',
    target_users: ['all rangeland users', 'comprehensive assessment'],
    keywords: ['comprehensive', 'complete', 'full analysis', 'all data'],
    api_integrations: { ssurgo: true, usda_edit: true, nrcs_plants: true, nrcs_practices: true },
    sort_order: 99,
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
      'Assess hydrology restoration potential',
      'Plan native vegetation establishment',
      'Evaluate sediment accretion rates',
      'Conduct function assessment'
    ],
    tab_ids: ['hydric', 'drainage', 'soil', 'practices'],
    estimated_time: '2-3 minutes',
    target_users: ['restoration specialists', 'conservation planners'],
    keywords: ['restoration', 'wetland creation', 'native plants'],
    api_integrations: { nrcs_hydric_soils: true, nrcs_plants: true, nrcs_practices: true, ssurgo: true },
    sort_order: 2,
    is_active: true
  },
  {
    id: 'wetland-function',
    land_type_id: 'wetland',
    name: 'Wetland Function Assessment',
    short_name: 'Function Assessment',
    description: 'Evaluate wetland ecosystem functions',
    objectives: [
      'Assess water quality improvement capacity',
      'Evaluate flood storage capacity',
      'Determine habitat quality',
      'Measure carbon sequestration potential'
    ],
    tab_ids: ['hydric', 'drainage', 'soil', 'productivity'],
    estimated_time: '2-3 minutes',
    target_users: ['wetland specialists', 'environmental consultants', 'regulators'],
    keywords: ['function', 'ecosystem services', 'water quality', 'carbon'],
    api_integrations: { nrcs_hydric_soils: true, ssurgo: true },
    sort_order: 3,
    is_active: true
  },
  {
    id: 'wetland-buffer',
    land_type_id: 'wetland',
    name: 'Buffer Zone Planning',
    short_name: 'Buffer Planning',
    description: 'Design effective wetland buffer zones',
    objectives: [
      'Determine buffer width requirements',
      'Assess vegetation suitability',
      'Evaluate pollutant filtering capacity',
      'Plan maintenance requirements'
    ],
    tab_ids: ['soil', 'drainage', 'erosion', 'practices'],
    estimated_time: '2-3 minutes',
    target_users: ['conservation planners', 'wetland specialists', 'engineers'],
    keywords: ['buffer', 'riparian', 'filtering', 'water quality'],
    api_integrations: { ssurgo: true, nrcs_practices: true, nrcs_plants: true },
    sort_order: 4,
    is_active: true
  },
  {
    id: 'wetland-comprehensive',
    land_type_id: 'wetland',
    name: 'Full Comprehensive Analysis',
    short_name: 'Comprehensive',
    description: 'Complete wetland analysis with all available data',
    objectives: [
      'Run all wetland analyses',
      'Get complete hydric soil assessment',
      'Review all wetland functions',
      'Access all wetland practices'
    ],
    tab_ids: ['hydric', 'drainage', 'soil', 'productivity', 'practices'],
    estimated_time: '4-5 minutes',
    target_users: ['all wetland users', 'comprehensive assessment'],
    keywords: ['comprehensive', 'complete', 'full analysis', 'all data'],
    api_integrations: { nrcs_hydric_soils: true, nwi: true, ssurgo: true, nrcs_practices: true },
    sort_order: 99,
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
      'Evaluate bioretention suitability',
      'Plan rain garden placement',
      'Design green infrastructure'
    ],
    tab_ids: ['soil', 'drainage', 'practices'],
    estimated_time: '2-3 minutes',
    target_users: ['civil engineers', 'land developers', 'stormwater managers'],
    keywords: ['stormwater', 'bmp', 'lid', 'infiltration', 'runoff'],
    api_integrations: { ssurgo: true },
    sort_order: 1,
    is_active: true
  },
  {
    id: 'developed-urban-agriculture',
    land_type_id: 'developed',
    name: 'Urban Agriculture',
    short_name: 'Urban Agriculture',
    description: 'Plan community gardens and urban farming',
    objectives: [
      'Assess garden bed planning needs',
      'Determine raised bed requirements',
      'Screen for contamination risks',
      'Generate soil amendment recommendations'
    ],
    tab_ids: ['soil', 'practices'],
    estimated_time: '2-3 minutes',
    target_users: ['urban farmers', 'community gardeners', 'extension agents'],
    keywords: ['urban agriculture', 'community garden', 'raised beds', 'contamination'],
    api_integrations: { ssurgo: true },
    sort_order: 2,
    is_active: true
  },
  {
    id: 'developed-landscape',
    land_type_id: 'developed',
    name: 'Landscape & Turf Management',
    short_name: 'Landscape/Turf',
    description: 'Optimize landscape and lawn management',
    objectives: [
      'Determine irrigation requirements',
      'Design drainage solutions',
      'Plan fertilizer applications',
      'Assess establishment conditions'
    ],
    tab_ids: ['soil', 'drainage', 'practices'],
    estimated_time: '1-2 minutes',
    target_users: ['landscapers', 'grounds managers', 'homeowners'],
    keywords: ['landscape', 'turf', 'lawn', 'irrigation', 'drainage'],
    api_integrations: { ssurgo: true },
    sort_order: 3,
    is_active: true
  },
  {
    id: 'developed-site-planning',
    land_type_id: 'developed',
    name: 'Development Planning',
    short_name: 'Site Planning',
    description: 'Assess site development limitations and opportunities',
    objectives: [
      'Evaluate septic system suitability',
      'Identify foundation limitations',
      'Assess erosion during construction',
      'Locate site preservation areas'
    ],
    tab_ids: ['soil', 'drainage', 'erosion', 'concerns'],
    estimated_time: '2-3 minutes',
    target_users: ['developers', 'civil engineers', 'planners'],
    keywords: ['development', 'septic', 'foundation', 'construction', 'erosion'],
    api_integrations: { ssurgo: true },
    sort_order: 4,
    is_active: true
  },  {
    id: 'developed-comprehensive',
    land_type_id: 'developed',
    name: 'Full Comprehensive Analysis',
    short_name: 'Comprehensive',
    description: 'Complete urban/developed land analysis with all available data',
    objectives: [
      'Run all urban analyses',
      'Get complete site development assessment',
      'Review all infrastructure limitations',
      'Access all urban practices'
    ],
    tab_ids: ['soil', 'drainage', 'erosion', 'concerns', 'practices'],
    estimated_time: '3-4 minutes',
    target_users: ['all development users', 'comprehensive assessment'],
    keywords: ['comprehensive', 'complete', 'full analysis', 'all data'],
    api_integrations: { ssurgo: true },
    sort_order: 99,
    is_active: true
  },
  // ============================================================================
  // NATURAL AREAS USE CASES
  // ============================================================================
  {
    id: 'natural-baseline',
    land_type_id: 'natural',
    name: 'Baseline Ecological Assessment',
    short_name: 'Baseline Assessment',
    description: 'Establish reference conditions for natural areas',
    objectives: [
      'Establish reference conditions',
      'Identify rare soil types',
      'Assess biodiversity support capacity',
      'Select monitoring sites'
    ],
    tab_ids: ['soil', 'ecological_site', 'productivity'],
    estimated_time: '2-3 minutes',
    target_users: ['ecologists', 'conservation scientists', 'researchers'],
    keywords: ['baseline', 'monitoring', 'reference', 'biodiversity'],
    api_integrations: { ssurgo: true, usda_edit: true },
    sort_order: 1,
    is_active: true
  },
  {
    id: 'natural-invasive',
    land_type_id: 'natural',
    name: 'Invasive Species Risk Assessment',
    short_name: 'Invasive Risk',
    description: 'Assess vulnerability to invasive species',
    objectives: [
      'Evaluate disturbance vulnerability',
      'Assess invasion susceptibility',
      'Plan management treatment impacts',
      'Identify restoration needs'
    ],
    tab_ids: ['soil', 'concerns', 'practices'],
    estimated_time: '1-2 minutes',
    target_users: ['conservation managers', 'invasive species coordinators'],
    keywords: ['invasive species', 'disturbance', 'restoration'],
    api_integrations: { ssurgo: true, nrcs_practices: true },
    sort_order: 2,
    is_active: true
  },
  {
    id: 'natural-trail',
    land_type_id: 'natural',
    name: 'Trail & Recreation Planning',
    short_name: 'Trail Planning',
    description: 'Design sustainable trails and recreation facilities',
    objectives: [
      'Assess trail sustainability',
      'Evaluate erosion risk',
      'Determine compaction vulnerability',
      'Plan revegetation potential'
    ],
    tab_ids: ['soil', 'erosion', 'practices'],
    estimated_time: '2-3 minutes',
    target_users: ['trail managers', 'park planners', 'recreation specialists'],
    keywords: ['trails', 'recreation', 'erosion', 'compaction'],
    api_integrations: { ssurgo: true, gee_rusle: true, nrcs_practices: true },
    sort_order: 3,
    is_active: true
  },
  {
    id: 'natural-climate',
    land_type_id: 'natural',
    name: 'Climate Adaptation Planning',
    short_name: 'Climate Adaptation',
    description: 'Assess climate resilience and adaptation strategies',
    objectives: [
      'Assess resilience to climate change',
      'Evaluate assisted migration potential',
      'Determine drought/flood vulnerability',
      'Measure carbon storage capacity'
    ],
    tab_ids: ['soil', 'productivity', 'ecological_site'],
    estimated_time: '2-3 minutes',
    target_users: ['climate adaptation planners', 'conservation scientists'],
    keywords: ['climate', 'adaptation', 'resilience', 'carbon'],
    api_integrations: { ssurgo: true, usda_edit: true },
    sort_order: 4,
    is_active: true
  },
  {
    id: 'natural-comprehensive',
    land_type_id: 'natural',
    name: 'Full Comprehensive Analysis',
    short_name: 'Comprehensive',
    description: 'Complete natural areas analysis with all available data',
    objectives: [
      'Run all ecological analyses',
      'Get complete conservation assessment',
      'Review all ecosystem functions',
      'Access all natural area practices'
    ],
    tab_ids: ['soil', 'ecological_site', 'erosion', 'productivity', 'concerns', 'practices'],
    estimated_time: '4-5 minutes',
    target_users: ['all conservation users', 'comprehensive assessment'],
    keywords: ['comprehensive', 'complete', 'full analysis', 'all data'],
    api_integrations: { ssurgo: true, usda_edit: true, gee_rusle: true, nrcs_practices: true },
    sort_order: 99,
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
