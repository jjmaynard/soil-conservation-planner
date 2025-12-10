// Official Series Description (OSD) types from UC Davis API
// API: https://casoilresource.lawr.ucdavis.edu/api/soil-series.php

export interface OSDSiteData {
  soilseriesiid: number
  seriesname: string
  series_status: string
  benchmarksoilflag: string
  soiltaxclasslastupdated: string
  mlraoffice: string
  family: string
  soilorder: string
  suborder: string
  greatgroup: string
  subgroup: string
  tax_partsize: string | null
  tax_partsizemod: string | null
  tax_ceactcl: string | null
  tax_reaction: string | null
  tax_tempcl: string | null
  tax_minclass: string | null
  taxfamhahatmatcl: string | null
  originyear: number | null
  establishedyear: number | null
  descriptiondateinitial: string
  descriptiondateupdated: string
  statsgoflag: string
  soilseries_typelocst: string
  subgroup_mod: string | null
  greatgroup_mod: string | null
  drainagecl: string
  ac: number
  n_polygons: number
}

export interface OSDHorizonData {
  hzname: string
  top: number
  bottom: number
  matrix_dry_color_hue: string | null
  matrix_dry_color_value: number | null
  matrix_dry_color_chroma: number | null
  matrix_wet_color_hue: string | null
  matrix_wet_color_value: number | null
  matrix_wet_color_chroma: number | null
  texture_class: string | null
  cf_class: string | null
  ph: number | null
  ph_class: string | null
  eff_class: string | null
  distinctness: string | null
  topography: string | null
  narrative: string
  series: string
  dry_color_estimated: string
  moist_color_estimated: string
}

export interface OSDGeographicAssociation {
  series: string
  gas: string
}

export interface OSDTerracePosition {
  series: string
  Tread: number
  Riser: number
  n: number
  shannon_entropy: number
}

export interface OSDFlatPosition {
  series: string
  Dip: number
  Talf: number
  Flat: number
  Rise: number
  n: number
  shannon_entropy: number
}

export interface OSDShapeData {
  series: string
  Concave: number
  Linear: number
  Convex: number
  Complex: number
  Undulating: number
  n: number
  shannon_entropy: number
}

export interface OSDParentMaterial {
  series: string
  q_param: string
  q_param_n: number
  total: number
  p: number
}

export interface OSDMLRAData {
  series: string
  mlra: string
  area_ac: number
  membership: number
}

export interface OSDClimateData {
  series: string
  climate_var: string
  minimum: number
  q01: number
  q05: number
  q25: number
  q50: number
  q75: number
  q95: number
  q99: number
  maximum: number
  n: number
}

export interface OSDNCCPIData {
  series: string
  n: number
  nccpi_irrigated_q01: number | null
  nccpi_irrigated_q05: number | null
  nccpi_irrigated_q25: number | null
  nccpi_irrigated_q50: number | null
  nccpi_irrigated_q75: number | null
  nccpi_irrigated_q95: number | null
  nccpi_irrigated_q99: number | null
  nccpi_q01: number | null
  nccpi_q05: number | null
  nccpi_q25: number | null
  nccpi_q50: number | null
  nccpi_q75: number | null
  nccpi_q95: number | null
  nccpi_q99: number | null
}

export interface OSDEcologicalSite {
  series: string
  ecoclassid: string
  n_components: number
  area_ac: number
  proportion: number
}

export interface OSDMetadata {
  product: string
  last_update: string
}

export interface OSDResponse {
  site: OSDSiteData[]
  hz: OSDHorizonData[]
  competing: any[]
  geog_assoc_soils: OSDGeographicAssociation[]
  geomcomp: any[]
  hillpos: any[]
  mtnpos: any[]
  terrace: OSDTerracePosition[]
  flats: OSDFlatPosition[]
  shape_across: OSDShapeData[]
  shape_down: OSDShapeData[]
  pmkind: OSDParentMaterial[]
  pmorigin: any[]
  mlra: OSDMLRAData[]
  climate: OSDClimateData[]
  nccpi: OSDNCCPIData[]
  ecoclassid: OSDEcologicalSite[]
  metadata: OSDMetadata[]
}

// Processed/formatted data for UI display
export interface FormattedOSDData {
  seriesName: string
  classification: {
    family: string
    order: string
    suborder: string
    greatGroup: string
    subGroup: string
    particleSize: string | null
    mineralogy: string | null
    temperatureRegime: string | null
    reaction: string | null
  }
  properties: {
    drainage: string
    established: number | null
    benchmark: boolean
    status: string
    typeLocation: string
    mlraOffice: string
  }
  extent: {
    acres: number
    polygons: number
    mlra: string[]
  }
  horizons: Array<{
    name: string
    depth: string
    depthCm: { top: number; bottom: number }
    texture: string | null
    color: {
      dry: string | null
      moist: string | null
    }
    ph: number | null
    phClass: string | null
    narrative: string
  }>
  parentMaterial: Array<{
    material: string
    percentage: number
  }>
  climate: {
    elevation: { min: number; median: number; max: number; unit: string }
    precipitation: { min: number; median: number; max: number; unit: string }
    temperature: { min: number; median: number; max: number; unit: string }
    frostFreeDays: { min: number; median: number; max: number }
    growingDegreeDays: { min: number; median: number; max: number }
  }
  geomorphology: {
    terrace: OSDTerracePosition[]
    flats: OSDFlatPosition[]
    shapeAcross: OSDShapeData[]
    shapeDown: OSDShapeData[]
  }
  ecologicalSites: OSDEcologicalSite[]
  associatedSoils: string[]
}
