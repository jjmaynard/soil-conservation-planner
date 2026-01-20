// Tab Configurations
// Defines analysis tabs available for different land types

export type AnalysisType = 'descriptive' | 'interpretive' | 'predictive' | 'prescriptive';

export interface TabConfig {
  id: string;
  name: string;
  display_name: string;
  description: string;
  icon?: string;
  applicable_land_types: string[];
  analysis_type: AnalysisType;
  api_dependencies: Record<string, string[]>;
  cache_duration: number; // seconds
  requires_user_input?: boolean;
  sort_order: number;
  is_active: boolean;
}

export const TAB_CONFIGS: TabConfig[] = [
  // ============================================================================
  // UNIVERSAL TABS (Available for all or most land types)
  // ============================================================================
  
  {
    id: 'soil',
    name: 'soil',
    display_name: 'Soil Composition',
    description: 'Soil physical and chemical properties from SSURGO',
    icon: '🪨',
    applicable_land_types: ['cropland', 'forestry', 'rangeland', 'wetland', 'developed', 'natural'],
    analysis_type: 'descriptive',
    api_dependencies: { ssurgo: ['properties', 'horizons'] },
    cache_duration: 604800, // 7 days
    sort_order: 1,
    is_active: true
  },
  
  {
    id: 'erosion',
    name: 'erosion',
    display_name: 'Erosion Risk',
    description: 'Soil erosion assessment via GEE RUSLE-EOS',
    icon: '⛰️',
    applicable_land_types: ['cropland', 'forestry', 'rangeland', 'natural'],
    analysis_type: 'predictive',
    api_dependencies: { gee_rusle: ['calculate'], ssurgo: ['k-factor', 'slope'] },
    cache_duration: 86400, // 1 day
    sort_order: 2,
    is_active: true
  },
  
  {
    id: 'svi',
    name: 'svi',
    display_name: 'Soil Vulnerability',
    description: 'Soil vulnerability index and degradation risk',
    icon: '⚠️',
    applicable_land_types: ['cropland', 'forestry', 'rangeland'],
    analysis_type: 'interpretive',
    api_dependencies: { ssurgo: ['properties', 'interpretations'] },
    cache_duration: 604800, // 7 days
    sort_order: 3,
    is_active: true
  },
  
  {
    id: 'productivity',
    name: 'productivity',
    display_name: 'Productivity Analysis',
    description: 'Land productivity from SSURGO/FIA',
    icon: '📈',
    applicable_land_types: ['cropland', 'forestry', 'rangeland'],
    analysis_type: 'interpretive',
    api_dependencies: { ssurgo: ['nccpi'], fia: ['site-index'] },
    cache_duration: 604800, // 7 days
    sort_order: 4,
    is_active: true
  },
  
  {
    id: 'drainage',
    name: 'drainage',
    display_name: 'Drainage & Hydrology',
    description: 'Drainage class and hydrologic properties',
    icon: '💧',
    applicable_land_types: ['cropland', 'wetland', 'developed'],
    analysis_type: 'descriptive',
    api_dependencies: { ssurgo: ['drainage', 'flooding', 'ponding'] },
    cache_duration: 604800, // 7 days
    sort_order: 5,
    is_active: true
  },
  
  {
    id: 'practices',
    name: 'practices',
    display_name: 'Conservation Practices',
    description: 'Practices from NRCS database',
    icon: '🛠️',
    applicable_land_types: ['cropland', 'forestry', 'rangeland', 'wetland', 'developed', 'natural'],
    analysis_type: 'prescriptive',
    api_dependencies: { nrcs_practices: ['search', 'specifications'] },
    cache_duration: 2592000, // 30 days
    sort_order: 6,
    is_active: true
  },
  
  {
    id: 'concerns',
    name: 'concerns',
    display_name: 'Resource Concerns',
    description: 'Identify soil and water resource concerns',
    icon: '🎯',
    applicable_land_types: ['cropland', 'forestry', 'rangeland', 'wetland', 'natural'],
    analysis_type: 'interpretive',
    api_dependencies: { ssurgo: ['interpretations'], nrcs_practices: ['concerns'] },
    cache_duration: 604800, // 7 days
    sort_order: 7,
    is_active: true
  },
  
  {
    id: 'flow',
    name: 'flow',
    display_name: 'Flow Path Analysis',
    description: 'Surface water flow and accumulation patterns',
    icon: '🌊',
    applicable_land_types: ['cropland', 'developed'],
    analysis_type: 'predictive',
    api_dependencies: { gee_rusle: ['flow_accumulation'] },
    cache_duration: 86400, // 1 day
    requires_user_input: false,
    sort_order: 8,
    is_active: true
  },

  // ============================================================================
  // FORESTRY-SPECIFIC TABS
  // ============================================================================
  
  {
    id: 'site_index',
    name: 'site_index',
    display_name: 'Site Index',
    description: 'Forest productivity from FIA',
    icon: '🌲',
    applicable_land_types: ['forestry'],
    analysis_type: 'interpretive',
    api_dependencies: { fia: ['site-index', 'productivity'] },
    cache_duration: 2592000, // 30 days
    sort_order: 20,
    is_active: true
  },
  
  {
    id: 'slope',
    name: 'slope',
    display_name: 'Slope Analysis',
    description: 'Slope classification for forest operations',
    icon: '⛰️',
    applicable_land_types: ['forestry', 'natural'],
    analysis_type: 'descriptive',
    api_dependencies: { ssurgo: ['slope'] },
    cache_duration: 604800, // 7 days
    sort_order: 21,
    is_active: true
  },

  // ============================================================================
  // RANGELAND-SPECIFIC TABS
  // ============================================================================
  
  {
    id: 'ecological_site',
    name: 'ecological_site',
    display_name: 'Ecological Site',
    description: 'Ecological site description and state-transition model',
    icon: '🌿',
    applicable_land_types: ['rangeland'],
    analysis_type: 'descriptive',
    api_dependencies: { usda_edit: ['ecological-sites'] },
    cache_duration: 2592000, // 30 days
    sort_order: 30,
    is_active: true
  },
  
  {
    id: 'zones',
    name: 'zones',
    display_name: 'Management Zones',
    description: 'Soil-based management zone delineation',
    icon: '🗺️',
    applicable_land_types: ['cropland', 'rangeland'],
    analysis_type: 'prescriptive',
    api_dependencies: { ssurgo: ['properties', 'nccpi'] },
    cache_duration: 604800, // 7 days
    sort_order: 31,
    is_active: true
  },

  // ============================================================================
  // WETLAND-SPECIFIC TABS
  // ============================================================================
  
  {
    id: 'hydric',
    name: 'hydric',
    display_name: 'Hydric Soil Indicators',
    description: 'Hydric soils from NRCS database',
    icon: '💧',
    applicable_land_types: ['wetland'],
    analysis_type: 'descriptive',
    api_dependencies: { nrcs_hydric_soils: ['list', 'indicators'] },
    cache_duration: 2592000, // 30 days
    sort_order: 40,
    is_active: true
  },
  
  {
    id: 'nwi',
    name: 'nwi',
    display_name: 'NWI Classification',
    description: 'National Wetlands Inventory classification',
    icon: '🦆',
    applicable_land_types: ['wetland'],
    analysis_type: 'descriptive',
    api_dependencies: { nwi: ['classification'] },
    cache_duration: 2592000, // 30 days
    sort_order: 41,
    is_active: true
  },
  
  {
    id: 'plants',
    name: 'plants',
    display_name: 'Plant Species',
    description: 'Native wetland plants from NRCS PLANTS database',
    icon: '🌱',
    applicable_land_types: ['wetland', 'rangeland', 'natural'],
    analysis_type: 'prescriptive',
    api_dependencies: { nrcs_plants: ['search', 'characteristics'] },
    cache_duration: 2592000, // 30 days
    sort_order: 42,
    is_active: true
  },

  // ============================================================================
  // DEVELOPED/URBAN-SPECIFIC TABS
  // ============================================================================
  
  {
    id: 'infiltration',
    name: 'infiltration',
    display_name: 'Infiltration Capacity',
    description: 'Stormwater infiltration from SSURGO',
    icon: '🌧️',
    applicable_land_types: ['developed'],
    analysis_type: 'interpretive',
    api_dependencies: { ssurgo: ['hydrologic-group', 'infiltration-rate'] },
    cache_duration: 604800, // 7 days
    sort_order: 50,
    is_active: true
  },
  
  {
    id: 'bmp',
    name: 'bmp',
    display_name: 'Stormwater BMPs',
    description: 'Best Management Practices from EPA database',
    icon: '🏗️',
    applicable_land_types: ['developed'],
    analysis_type: 'prescriptive',
    api_dependencies: { epa_bmp: ['search', 'performance'] },
    cache_duration: 2592000, // 30 days
    sort_order: 51,
    is_active: true
  }
];

// Helper functions
export function getTabConfig(id: string): TabConfig | undefined {
  return TAB_CONFIGS.find(tc => tc.id === id);
}

export function getTabsForLandType(landTypeId: string): TabConfig[] {
  return TAB_CONFIGS
    .filter(tc => tc.applicable_land_types.includes(landTypeId) && tc.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function getTabsForUseCase(tabIds: string[]): TabConfig[] {
  return TAB_CONFIGS
    .filter(tc => tabIds.includes(tc.id) && tc.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function getTabsByAnalysisType(type: AnalysisType): TabConfig[] {
  return TAB_CONFIGS
    .filter(tc => tc.analysis_type === type && tc.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function getUniversalTabs(): TabConfig[] {
  // Tabs available for 4 or more land types
  return TAB_CONFIGS
    .filter(tc => tc.applicable_land_types.length >= 4 && tc.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);
}
