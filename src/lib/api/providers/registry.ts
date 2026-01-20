// API Provider Registry
// Defines all data sources (APIs and static JSON) used by the application

export type DataSourceType = 'api' | 'static_json' | 'wms';

export interface DataSource {
  name: string;
  type: DataSourceType;
  baseUrl?: string; // For APIs and WMS
  configPath?: string; // For static JSON
  endpoints?: Record<string, string>;
  cacheStrategy: 'short-term' | 'medium-term' | 'long-term';
  cacheDuration?: number; // seconds
  rateLimitPerMinute?: number;
  requiresAuth?: boolean;
  apiKey?: string;
  documentation?: string;
  notes?: string;
}

export const DATA_SOURCES: Record<string, DataSource> = {
  // ============================================================================
  // REAL APIs (Currently Available)
  // ============================================================================
  
  // NRCS SSURGO - REAL API ✅
  ssurgo: {
    name: 'NRCS Soil Survey (SSURGO)',
    type: 'api',
    baseUrl: 'https://sdmdataaccess.sc.egov.usda.gov',
    endpoints: {
      properties: '/tabular/post.rest',
      spatial: '/spatial/post.rest'
    },
    cacheStrategy: 'medium-term',
    cacheDuration: 7 * 24 * 60 * 60, // 7 days
    rateLimitPerMinute: 60,
    documentation: 'https://sdmdataaccess.sc.egov.usda.gov/documents/WebServiceHelp.html'
  },

  // Google Earth Engine RUSLE-EOS - REAL API ✅
  gee_rusle: {
    name: 'GEE RUSLE-EOS (Erosion)',
    type: 'api',
    baseUrl: 'https://earthengine.googleapis.com',
    endpoints: {
      calculate: '/v1alpha/projects/*/value:compute'
    },
    cacheStrategy: 'short-term',
    cacheDuration: 24 * 60 * 60, // 1 day
    rateLimitPerMinute: 20,
    requiresAuth: true,
    documentation: 'https://developers.google.com/earth-engine/guides/python_install',
    notes: 'Currently implemented for erosion calculations'
  },

  // USDA CDL - REAL API ✅
  cdl: {
    name: 'USDA Cropland Data Layer',
    type: 'api',
    baseUrl: 'https://www.nass.usda.gov/Research_and_Science/Cropland/sarsfaqs2.php',
    endpoints: {
      stac: 'https://planetarycomputer.microsoft.com/api/stac/v1/collections/usda-cdl'
    },
    cacheStrategy: 'long-term',
    cacheDuration: 365 * 24 * 60 * 60, // 1 year
    rateLimitPerMinute: 30,
    notes: 'Currently implemented via STAC API'
  },

  // USFWS NWI - WMS/WFS (not REST but available) ⚠️
  nwi: {
    name: 'USFWS National Wetlands Inventory',
    type: 'wms',
    baseUrl: 'https://www.fws.gov/wetlands/Data/Web-Map-Services.html',
    endpoints: {
      wms: '/wetlandsmapservice/rest/services/Wetlands/MapServer',
      wfs: '/wetlandsmapservice/rest/services/Wetlands_WFS/MapServer'
    },
    cacheStrategy: 'long-term',
    cacheDuration: 90 * 24 * 60 * 60, // 90 days
    rateLimitPerMinute: 30,
    documentation: 'https://www.fws.gov/wetlands/Data/Web-Map-Services.html',
    notes: 'WMS/WFS service, not REST API'
  },

  // ============================================================================
  // STATIC JSON (External APIs in development)
  // ============================================================================

  // NRCS Conservation Practices - STATIC JSON 📄
  nrcs_practices: {
    name: 'NRCS Conservation Practice Standards',
    type: 'static_json',
    configPath: '/config/data/nrcs-practices.json',
    cacheStrategy: 'long-term',
    cacheDuration: 90 * 24 * 60 * 60, // 90 days
    documentation: 'https://www.nrcs.usda.gov/wps/portal/nrcs/main/national/technical/cp/ncps/',
    notes: '⚠️ Static JSON - External API in development. Data manually curated from NRCS standards.'
  },

  // NRCS Hydric Soils - STATIC JSON 📄
  nrcs_hydric_soils: {
    name: 'NRCS Hydric Soils List',
    type: 'static_json',
    configPath: '/config/data/hydric-soils.json',
    cacheStrategy: 'long-term',
    cacheDuration: 90 * 24 * 60 * 60, // 90 days
    documentation: 'https://www.nrcs.usda.gov/wps/portal/nrcs/main/soils/use/hydric/',
    notes: '⚠️ Static JSON - External API in development. Data from NRCS hydric soils list.'
  },

  // NRCS PLANTS Database - STATIC JSON 📄
  nrcs_plants: {
    name: 'NRCS PLANTS Database',
    type: 'static_json',
    configPath: '/config/data/plants-database.json',
    cacheStrategy: 'long-term',
    cacheDuration: 90 * 24 * 60 * 60, // 90 days
    documentation: 'https://plants.usda.gov/',
    notes: '⚠️ Static JSON - External API in development. Data extracted from PLANTS database.'
  },

  // EPA BMP Database - STATIC JSON 📄
  epa_bmp: {
    name: 'EPA Stormwater BMP Database',
    type: 'static_json',
    configPath: '/config/data/epa-bmps.json',
    cacheStrategy: 'long-term',
    cacheDuration: 90 * 24 * 60 * 60, // 90 days
    documentation: 'https://bmpdatabase.org/',
    notes: '⚠️ Static JSON - External API in development. Data from EPA BMP database.'
  },

  // USDA EDIT Ecological Sites - STATIC JSON 📄  
  usda_edit: {
    name: 'USDA EDIT Ecological Sites',
    type: 'static_json',
    configPath: '/config/data/ecological-sites.json',
    cacheStrategy: 'long-term',
    cacheDuration: 90 * 24 * 60 * 60, // 90 days
    documentation: 'https://edit.jornada.nmsu.edu/',
    notes: '⚠️ Static JSON - External API in development. Data from EDIT catalog.'
  },

  // USFS FIA - STATIC JSON 📄
  fia: {
    name: 'USDA Forest Service FIA',
    type: 'static_json',
    configPath: '/config/data/fia-site-index.json',
    cacheStrategy: 'long-term',
    cacheDuration: 90 * 24 * 60 * 60, // 90 days
    documentation: 'https://www.fia.fs.fed.us/tools-data/',
    notes: '⚠️ Static JSON - External API in development. Site index curves from FIA DataMart downloads.'
  }
};

// Helper to get data source config
export function getDataSource(sourceId: string): DataSource {
  const source = DATA_SOURCES[sourceId];
  if (!source) {
    throw new Error(`Unknown data source: ${sourceId}`);
  }
  return source;
}

// Helper to check if source is API or static
export function isAPI(sourceId: string): boolean {
  return getDataSource(sourceId).type === 'api';
}

export function isStaticJSON(sourceId: string): boolean {
  return getDataSource(sourceId).type === 'static_json';
}

export function isWMS(sourceId: string): boolean {
  return getDataSource(sourceId).type === 'wms';
}

// Get all data sources by type
export function getDataSourcesByType(type: DataSourceType): Record<string, DataSource> {
  return Object.entries(DATA_SOURCES)
    .filter(([_, source]) => source.type === type)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
}
