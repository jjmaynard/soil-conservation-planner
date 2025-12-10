// Soil Survey Application Type Definitions

export interface SoilProfile {
  id: string
  coordinates: [number, number]
  survey_area: string
  map_unit: string
  soil_order: string
  properties: {
    [depth: string]: {
      organic_carbon: number
      ph: number
      bulk_density: number
      texture_class: string
      clay_percent: number
      sand_percent: number
      silt_percent: number
    }
  }
  mir_data?: {
    prediction_confidence: number
    andic_properties: boolean
    spectral_features: any
  }
}

export interface SoilLayer {
  id: string
  name: string
  type: 'raster' | 'vector' | 'wms'
  url: string
  visible: boolean
  opacity: number
  depth?: string
  legend?: LegendItem[]
  year?: number // For CDL layer year
}

export interface LegendItem {
  label: string
  color: string
  value?: number | string
}

export type SoilDepth = '0-5cm' | '5-15cm' | '15-30cm' | '30-60cm' | '60-100cm' | '100-200cm'

export interface SSURGOData {
  mukey: string
  musym: string
  muname: string
  muacres: string
  coordinates: [number, number]
  // Map Unit
  mukind?: string
  areasymbol?: string
  areaname?: string
  saverest?: string
  // Component fields (array for multiple components)
  components?: SSURGOComponent[]
  // Survey metadata
  surveyArea?: string
  spatialVersion?: string
  scale?: string
  published?: string
  lastExport?: string
}

export interface SSURGOComponent {
  cokey: string
  compname: string
  compkind?: string
  comppct_r: number
  majcompflag?: string
  localphase?: string
  slope_r?: number
  slopelenusle_r?: number
  runoff?: string
  tfact?: number
  wei?: string
  weg?: string
  elev_r?: number
  // Taxonomic
  taxclname?: string
  taxorder?: string
  taxsuborder?: string
  taxgrtgroup?: string
  taxsubgrp?: string
  taxpartsize?: string
  taxpartsizemod?: string
  taxceactcl?: string
  taxreaction?: string
  taxtempcl?: string
  taxmoistscl?: string
  // Parent Material
  pmorigin?: string
  pmkind?: string
  pmgroupname?: string
  landform?: string
  shapeacross?: string
  shapedown?: string
  // Horizons (surface only)
  horizons?: SSURGOHorizon[]
  // Interpretations
  interpretations?: SSURGOInterpretation[]
}

export interface SSURGOHorizon {
  chkey: string
  hzname: string
  hzdept_r: number
  hzdepb_r: number
  sandtotal_r?: number
  silttotal_r?: number
  claytotal_r?: number
  om_r?: number
  ph1to1h2o_r?: number
  awc_r?: number
  ksat_r?: number
  dbthirdbar_r?: number
  lep_r?: number
  ll_r?: number
  pi_r?: number
  cec7_r?: number
  ecec_r?: number
  sumbases_r?: number
  caco3_r?: number
  gypsum_r?: number
  sar_r?: number
  ec_r?: number
}

export interface SSURGOInterpretation {
  rulename: string
  ruledepth?: number
  rating?: string
  class?: string
  suitability?: string
  interphrc?: string
  interphr?: string
}

export interface SoilProperty {
  name: string
  value: number | string
  unit: string
  depth: SoilDepth
}

export interface SSURGOMapUnit {
  mukey: string
  musym: string
  muname: string
  mukind: string
  geometry: any
}
