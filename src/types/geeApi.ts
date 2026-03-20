// ============================================================================
// GEE API v2.1.0 Type Definitions
// ============================================================================
// Complete type definitions for GEE API unified endpoint architecture
// Reference: Property_Panel_Guide/gee-api-docs/nextjs-erosion-module/src/lib/gee-client/types.ts

// ============================================================================
// Core RUSLE Types (v2.1.0 Unified Endpoint)
// ============================================================================

// Multi-scenario result for individual conservation practices
export interface ScenarioResult {
  practice: 'none' | 'contour_farming' | 'strip_cropping' | 'terracing' | 'grassed_waterway' | 'cover_crop'
  soil_loss_rate: number // t/ha/yr
  soil_loss_rate_tons_acre_yr: number
  p_factor: PFactorResponse
  erosion_reduction_percent: number | null
  erosion_class: string
  erosion_class_description: string
}

export interface RUSLECalculateRequest {
  wkt: string // WKT string (REQUIRED)
  start_date: string // ISO format YYYY-MM-DD
  end_date: string
  year?: number // Assessment year (default: 2023)
  
  // NEW: Multi-scenario analysis
  include_scenarios?: boolean // Enable multi-scenario calculation (default: false)
  scenario_practices?: ('none' | 'contour_farming' | 'strip_cropping' | 'terracing' | 'grassed_waterway' | 'cover_crop')[] // Custom practice list (null = all 6)
  
  // Factor calculation tiers
  r_method?: 'hybrid_daymet_gpm' | 'modified_fournier' | 'prism_direct'
  use_multiyear_r_factor?: boolean // Use 15-year climatology (default: true)
  ls_tier?: 'tier1' | 'tier2' | 'tier3' | 'tier4'
  c_tier?: 'tier_1' | 'tier_2' | 'tier_3'
  
  // Crop/vegetation parameters
  crop_type?: string
  tillage_type?: string
  
  // Conservation practices (P-factor)
  conservation_practices?: ('none' | 'contour_farming' | 'strip_cropping' | 'terracing' | 'grassed_waterway' | 'cover_crop')[]
  detect_terraces?: boolean
  detect_contours?: boolean
  detect_buffer_strips?: boolean
  use_high_res_dem?: boolean
  soil_drainage_class?: string
  terrace_type?: string
  buffer_strip_pct?: number
  ridge_height?: string
  row_grade_pct?: number
  
  // K-factor (from SSURGO)
  ssurgo_k_factor?: number
  
  // Output options
  include_factor_maps?: boolean
  include_uncertainty?: boolean
  include_events?: boolean // Returns all EI30 values in timeseries
  scale?: number
}

// UPDATED to match actual GEE API v2.1.0 schema (from openapi.json)
export interface RUSLEResponse {
  // Main results
  soil_loss_rate: number // Annual soil loss (t/ha/yr)
  soil_loss_rate_tons_acre_yr: number // Annual soil loss (tons/acre/yr)
    visualization?: {
      all_crops?: {
        tile_url: string
        min: number
        max: number
        palette: string[]
      }
      corn?: {
        tile_url: string
        min: number
        max: number
        palette: string[]
      }
      soybeans?: {
        tile_url: string
        min: number
        max: number
        palette: string[]
      }
      small_grains?: {
        tile_url: string
        min: number
        max: number
        palette: string[]
      }
      cotton?: {
        tile_url: string
        min: number
        max: number
        palette: string[]
      }
      description?: string
    }
    nccpi_visualization?: {
      nccpi_corn_tile_url?: string
      nccpi_soy_tile_url?: string
      nccpi_sg_tile_url?: string
      nccpi_cotton_tile_url?: string
      nccpi_all_tile_url?: string
      description?: string
    }
  p_factor: PFactorResponse
  
  // Field information
  field_area_ha: number
  field_area_acres: number
  calculation_date: string // ISO datetime
  
  // Classification and quality
  erosion_class: string // e.g., "slight", "moderate", "severe", "very severe"
  erosion_class_description: string
  uncertainty_percent: number | null
  confidence_level: string | null
  
  // Optional visualization
  soil_loss_map_url: string | null
  factor_maps: { [key: string]: string } | null
  data_quality: { [key: string]: any } | null
  
  // NEW: Multi-scenario analysis results
  baseline?: ScenarioResult // Baseline scenario (practice: 'none')
  scenarios?: ScenarioResult[] // All scenario results
  scenario_comparison?: {
    most_effective_practice: string
    max_reduction_percent: number
    least_effective_practice: string
    min_reduction_percent: number
    practices_exceeding_t_value: string[]
    t_value_used: number
  }

  // Backward compatibility for additional API fields consumed across the app
  [key: string]: any
}

// Factor response interfaces
export interface RFactorResponse {
  factor_name: string
  factor_value: number
  unit: string // "MJ·mm/(ha·h·yr)"
  methodology: string | null
  data_source: string | null
  map_url: string | null
  statistics?: StatisticsResponse | null
  qc: QualityControlResponse | null
  annual_precipitation_mm: number | null
  erosive_event_count: number | null
  monthly_values: { [key: string]: number } | null
  yearly_values: { [key: string]: number } | null
}

export interface KFactorResponse {
  factor_name: string
  factor_value: number
  unit: string // "t·ha·h/(ha·MJ·mm)"
  methodology: string | null
  data_source: string
  map_url: string | null
  statistics?: StatisticsResponse | null
  qc: QualityControlResponse | null
  soil_texture: string | null
  organic_matter_percent: number | null
}

export interface LSFactorResponse {
  factor_name: string
  factor_value: number
  unit: string
  methodology: string | null
  data_source: string | null
  map_url: string | null
  statistics?: StatisticsResponse | null
  qc: QualityControlResponse | null
  l_factor: number | null
  s_factor: number | null
  mean_slope_percent: number | null
  mean_slope_length_m: number | null
  tier_used: string | null
}

export interface CFactorResponse {
  factor_name: string
  factor_value: number
  unit: string
  methodology: string | null
  data_source: string | null
  map_url: string | null
  statistics?: StatisticsResponse | null
  qc: QualityControlResponse | null
  crop_type: string | null
  mean_ndvi: number | null
  vegetation_cover_percent: number | null
  monthly_values: { [key: string]: number | null } | null
  tier_used: string | null
}

export interface PFactorResponse {
  factor_name: string
  factor_value: number
  unit: string
  methodology: string | null
  data_source: string | null
  map_url: string | null
  statistics?: StatisticsResponse | null
  qc: QualityControlResponse | null
  detected_practices: string[] | null
  practice_components: { [key: string]: number } | null
  slope_class: string | null
  erosion_reduction_percent: number | null
  mean_slope_percent: number | null
  conservation_rating: string | null
  warnings: string[] | null
  recommendations: string[] | null
}

export interface QualityControlResponse {
  qc_score: number // 0-100
  qc_pass: boolean
  qc_flags: string[]
}

export interface StatisticsResponse {
  mean: number
  min: number
  max: number
  std_dev: number | null
  median: number | null
  p10: number | null
  p90: number | null
}

export interface SpatialStatistics {
  mean: number
  min: number
  max: number
  std: number
  median: number
  total_tons_per_year?: number // For soil loss only
}

// ============================================================================
// Individual Factor Types (Optional - for specialized use)
// ============================================================================

export interface RFactorRequest {
  wkt: string
  start_date: string
  end_date: string
}

export interface RFactorResponse {
  r_factor_statistics: SpatialStatistics
  metadata: {
    data_sources: string[]
    calculation_date: string
  }
}

export interface LSFactorRequest {
  wkt: string
}

export interface LSFactorResponse {
  ls_factor_statistics: SpatialStatistics
  slope_statistics: SpatialStatistics
  slope_length_statistics: SpatialStatistics
  metadata: {
    dem_source: string
    calculation_date: string
  }
}

// ============================================================================
// CSB (Common Land Unit) Types
// ============================================================================

export interface CSBBounds {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    properties: {
      clu_id: string
      acres: number
      state: string
      county: string
      farm_number?: string
      tract_number?: string
      field_number?: string
    }
    geometry: {
      type: 'Polygon' | 'MultiPolygon'
      coordinates: number[][][] | number[][][][]
    }
  }>
}

export interface CSBFieldDetails {
  clu_id: string
  acres: number
  state: string
  county: string
  farm_number?: string
  tract_number?: string
  field_number?: string
  geometry: {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: number[][][] | number[][][][]
  }
  centroid: {
    lat: number
    lng: number
  }
  properties?: Record<string, any>
  rotation_analysis?: {
    rotation_sequence: number[]
    unique_crops: number
    pattern_type: string
    years_analyzed: string[]
    sustainability_rating: string
  }
  crop_names?: Record<string, string>
  sustainability_metrics?: {
    total_score: number
    diversity_score: number
    cover_crop_bonus: number
    nitrogen_fixation_bonus: number
    rating: string
    has_cover_crops: boolean
    has_nitrogen_fixers: boolean
    unique_crops_count: number
  }
}

export interface CSBQueryParams {
  minLon: number
  minLat: number
  maxLon: number
  maxLat: number
  zoom?: number // Map zoom level (1-20, default: 10)
  limit?: number // Max features to return (1-5000, default: 1000)
}

export interface CSBTileUrlRequest {
  opacity?: number
  min_complexity?: number
  max_complexity?: number
}

export interface CSBTileUrlResponse {
  tile_url: string
  description: string
}

// ============================================================================
// Terrain Analysis Types
// ============================================================================

export interface TerrainRequest {
  wkt: string
  attributes?: string[] // Default: ['elevation', 'slope', 'aspect']
}

export interface TerrainResponse {
  elevation_statistics?: SpatialStatistics
  slope_statistics?: SpatialStatistics
  aspect_statistics?: SpatialStatistics
  metadata: {
    dem_source: string
    resolution_meters: number
    calculation_date: string
  }
}

// ============================================================================
// Vegetation / NDVI Types
// ============================================================================

export interface SentinelRequest {
  wkt: string
  start_date: string
  end_date: string
  cloud_cover_max?: number // Default: 20
}

export interface SentinelSpatialStats {
  ndvi_mean?: number
  ndvi_std?: number
  ndvi_p10?: number
  ndvi_p25?: number
  ndvi_p50?: number
  ndvi_p75?: number
  ndvi_p90?: number
  pixel_count?: number
  valid_pixel_pct?: number
  spatial_cv?: number
}

export interface SentinelTimeSeriesPoint extends SentinelSpatialStats {
  date: string
  ndvi?: number
  ndvi_mean?: number
  spatial_stats?: SentinelSpatialStats
  cloud_cover?: number
}

export interface SentinelWithinFieldVariability {
  method?: string
  in_season_dates_used?: number
  spatial_cv_median?: number
  spatial_cv_mean?: number
  spatial_cv_p90?: number
  spatial_iqr_mean?: number
  management_uniformity_score?: number
}

export interface SentinelResponse {
  field?: {
    area_acres?: number
    area_m2?: number
    bounds?: any
  }
  query?: {
    start_date?: string
    end_date?: string
    cloud_threshold?: number
    reducer?: string
    scale_meters?: number
    images_found?: number
  }
  ndvi_statistics: SpatialStatistics
  statistics?: {
    mean_ndvi?: number
    min_ndvi?: number
    max_ndvi?: number
    std_dev?: number
    fractional_vegetation_cover?: number
  }
  composite_statistics?: {
    mean_ndvi?: number
    min_ndvi?: number
    max_ndvi?: number
    std_dev?: number
    note?: string
  }
  time_series?: SentinelTimeSeriesPoint[]
  within_field_variability?: SentinelWithinFieldVariability
  visualization?: {
    thumbnail_url?: string
    tile_url?: string
    description?: string
    tile_format?: string
  }
  data_source?: string
  metadata: {
    image_count: number
    date_range: {
      start: string
      end: string
    }
  }
}

// ============================================================================
// Climate Data Types
// ============================================================================

export interface ClimateRequest {
  wkt: string
  start_year: number
  end_year: number
}

export interface ClimateResponse {
  precipitation_statistics: SpatialStatistics
  temperature_statistics: SpatialStatistics
  metadata: {
    data_source: string
    year_range: {
      start: number
      end: number
    }
  }
}

// ============================================================================
// Drought Assessment Types
// ============================================================================

export interface DroughtAssessmentRequest {
  wkt: string
  date?: string
  soil_awc?: number
  soil_texture?: string
  include_technical?: boolean
  auto_adjust_date?: boolean
}

export interface DroughtAssessment {
  assessment_date: string
  drought_status: {
    overall_severity: 'none' | 'abnormally_dry' | 'moderate' | 'severe' | 'extreme' | 'exceptional'
    confidence_level: 'low' | 'medium' | 'high'
    primary_concerns: string[]
  }
  drought_indices: {
    spi: DroughtIndex
    spei: DroughtIndex
    eddi: DroughtIndex
    pdsi: DroughtIndex
  }
  impacts: {
    agriculture: string
    water_resources: string
    vegetation_health: string
  }
  recommendations: string[]
}

export interface DroughtIndex {
  value: number
  category: string
  interpretation: string
  technical_details?: {
    timescale_days: number
    data_quality: string
  }
}

// ============================================================================
// Resource Concerns Types
// ============================================================================

export interface ResourceConcernRequest {
  wkt: string
  year?: number
  include_geojson?: boolean
}

export interface ComprehensiveAssessment {
  concerns: ResourceConcern[]
  priority_ranking: string[]
  overall_risk_score: number
  recommended_practices: string[]
}

export interface ResourceConcern {
  concern_type: 'erosion' | 'ponding' | 'concentrated_flow' | 'soil_quality' | 'productivity' | 'drainage'
  severity: 'low' | 'moderate' | 'high' | 'critical'
  affected_area_pct: number
  metrics: Record<string, number>
  description: string
}

export interface ErosionAssessment {
  sheet_rill_erosion: {
    avg_tons_ac_yr: number
    severity: string
  }
  wind_erosion?: {
    avg_tons_ac_yr: number
    severity: string
  }
}

export interface PondingAssessment {
  ponding_frequency: string
  affected_area_pct: number
  severity: string
}

export interface ProductivityAssessment {
  avg_productivity_index: number
  limiting_factors: string[]
  recommendations: string[]
}

// ============================================================================
// Comprehensive Field Assessment (/api/assessment/all)
// ============================================================================

export interface ComprehensiveFieldAssessment {
  assessment_year: number
  timestamp: string
  erosion_risk: {
    statistics: {
      mean_risk: number
      min_risk: number
      max_risk: number
      std_dev: number
      high_risk_area_pct: number
    }
    risk_levels: Record<string, any>
    visualization: {
      thumbnail_url: string
      tile_url: string
      description: string
    }
    methodology: string
  }
  concentrated_flow: {
    flow_metrics: {
      channel_density_m_per_ha: number
      convergent_area_pct: number
      high_gully_risk_pct: number
    }
    twi_stats: {
      mean: number
      p75: number
      p90: number
    }
    spi_stats: {
      mean: number
      max: number
      p90: number
      p95: number
    }
    visualization: {
      spi_tile_url: string
      twi_tile_url: string
      channels_tile_url: string
      spi_thumbnail_url: string
      description: string
    }
    methodology: string
  }
  ponding: {
    ponding_metrics: {
      depression_area_pct: number
      twi_above_12_pct: number
      high_ponding_risk_pct: number
    }
    twi_stats: {
      mean: number
      p75: number
      p90: number
    }
    visualization: {
      twi_tile_url: string
      depressions_tile_url: string
      wet_areas_tile_url: string
      twi_thumbnail_url: string
      description: string
    }
    methodology: string
  }
  drought: {
    water_balance: {
      growing_season_precip_mm: number
      growing_season_eto_mm: number
      balance_mm: number
    }
    drought_indices: {
      pdsi_mean: number
      pdsi_min: number
    }
    visualization: {
      water_deficit_tile_url: string
      vpd_tile_url: string
      deficit_thumbnail_url: string
      description: string
    }
    methodology: string
  }
  soil_quality: {
    productivity_stability: {
      ndvi_peak_mean: number
      ndvi_peak_std: number
      ndvi_peak_cv: number
      years_analyzed: number
    }
  }
  productivity: {
    productivity_metrics: {
      ndvi_peak_mean: number
      ndvi_peak_std: number
    }
    yield_gap: {
      mean_gap_pct: number
      p75_gap_pct: number
      p90_gap_pct: number
    }
    nccpi_metrics?: {
      corn_mean: number
      soybean_mean: number
      small_grains_mean: number
      cotton_mean: number
      all_crops_mean: number
    }
    visualization: {
      yield_gap_tile_url: string
      mean_ndvi_tile_url: string
      max_ndvi_tile_url: string
      yield_gap_thumbnail_url: string
      nccpi_corn_tile_url?: string
      nccpi_soy_tile_url?: string
      nccpi_sg_tile_url?: string
      nccpi_cotton_tile_url?: string
      nccpi_all_tile_url?: string
      description: string
    }
    methodology: string
  }
  svi: {
    svi_metrics: {
      surface_loss_class_pct?: {
        low_pct: number
        moderate_pct: number
        moderately_high_pct: number
        high_pct: number
        unclassified_pct: number
      }
      subsurface_drained_class_pct?: {
        low_pct: number
        moderate_pct: number
        moderately_high_pct: number
        high_pct: number
        unclassified_pct: number
      }
      subsurface_undrained_class_pct?: {
        low_pct: number
        moderate_pct: number
        moderately_high_pct: number
        high_pct: number
        unclassified_pct: number
      }
      surface_loss_mean?: number
      surface_loss_high_pct?: number
      subsurface_drained_mean?: number
      subsurface_drained_high_pct?: number
      subsurface_undrained_mean?: number
      subsurface_undrained_high_pct?: number
    }
    visualization: {
      surface_tile_url: string
      subsurface_drained_tile_url: string
      subsurface_undrained_tile_url: string
      surface_thumbnail_url: string
      description: string
      surface_legend?: {
        min_value: number
        max_value: number
        palette: string[]
        units?: string
        labels?: string[]
      }
      subsurface_drained_legend?: {
        min_value: number
        max_value: number
        palette: string[]
        units?: string
        labels?: string[]
      }
      subsurface_undrained_legend?: {
        min_value: number
        max_value: number
        palette: string[]
        units?: string
        labels?: string[]
      }
      high_vulnerability_threshold?: {
        value: number
        units?: string
        description?: string
      }
    }
    methodology: string
  }
}

export interface ComprehensiveAssessmentRequest {
  wkt: string
  year?: number
  include_visualizations?: boolean
}

// ============================================================================ 
// Climate History Types (New /api/climate/comprehensive)
// ============================================================================ 

export interface ClimateHistoryRequest {
  wkt: string
  year?: number // Assessment year context
}

// ============================================================================
// Crop-Specific Productivity Assessment (/api/assessment/productivity-crop-specific)
// ============================================================================

export interface ProductivityCropSpecificRequest {
  csbid?: string
  wkt?: string
  start_year?: number
  end_year?: number
}

export interface NCCPIStats {
  mean: number
  min: number
  max: number
  std: number
}

export interface NCCPIVisualization {
  tile_url: string
  min: number
  max: number
  palette: string[]
}

export interface SoilProductivity {
  all_crops: NCCPIStats
  corn: NCCPIStats
  soybeans: NCCPIStats
  small_grains: NCCPIStats
  cotton: NCCPIStats
  visualization: {
    all_crops: NCCPIVisualization
    corn: NCCPIVisualization
    soybeans: NCCPIVisualization
    small_grains: NCCPIVisualization
    cotton: NCCPIVisualization
  }
  description: string
}

export interface CropProductivityViz {
  yield_gap_tile_url: string
  mean_ndvi_tile_url: string
  max_ndvi_tile_url: string
  yield_gap_thumbnail_url: string
  yield_gap_viz: {
    min: number
    max: number
    palette: string[]
  }
  mean_ndvi_viz: {
    min: number
    max: number
    palette: string[]
  }
  max_ndvi_viz: {
    min: number
    max: number
    palette: string[]
  }
  description: string
}

export interface CropAnalysis {
  crop_name: string
  crop_code: number
  years_analyzed: number
  year_list: number[]
  ndvi_mean: number
  ndvi_max: number
  ndvi_std: number
  yield_gap_pct: number
  yield_gap_interpretation: string
  visualization: CropProductivityViz
}

export interface TimeSeriesEntry {
  year: number
  crop_name: string
  crop_code: number
  ndvi_max: number
  yield_gap_pct: number
}

export interface ProductivityCropSpecificResponse {
  field_id: string
  soil_productivity: SoilProductivity
  total_years_analyzed: number
  crops_analyzed: CropAnalysis[]
  rotation_summary: Record<string, number>
  overall_yield_gap_pct: number
  dominant_crop: string
  recommendation: string
  overall_assessment: {
    productivity_metrics: {
      ndvi_peak_mean: number
      ndvi_peak_std: number
    }
    yield_gap: {
      mean_gap_pct: number
      p75_gap_pct: number
      p90_gap_pct: number
    }
    visualization: CropProductivityViz & {
      description: string
    }
    description: string
  }
  time_series: TimeSeriesEntry[]
  methodology: string
}

// ============================================================================
// Climate History Types (/api/climate/comprehensive)
// ============================================================================

export interface ClimateHistoryRequest {
  wkt: string
  year?: number // Assessment year context
}

export interface ClimateHistoryResponse {
  location: {
    wkt: string
    field_area_acres: number
    county: string | null
    mlra: string | null
    usda_hardiness_zone: string | null
  }
  temporal_coverage: {
    period_of_record: string
    years: number
    data_completeness_pct: number
    start_date: string
    end_date: string
  }
  precipitation: {
    annual: {
      mean: number
      min: number
      max: number
      std_dev: number
      current_year: number
      current_year_percentile: number
    }
    monthly_normals_mm: Record<string, number>
    growing_season: {
      apr_oct_mean_mm: number
      may_sep_mean_mm: number
      total_days: number
    }
    intensity_statistics: {
      days_over_25mm_per_year: number
      days_over_50mm_per_year: number
      max_daily_mm: number
      max_daily_date: string
      erosive_events_per_year_mean: number
    }
    drought_metrics: {
      consecutive_dry_days_max: number
      consecutive_dry_days_mean: number
      dry_spells_over_14days_per_year: number
    }
  }
  temperature: {
    annual: {
      mean_c: number
      max_c: number
      min_c: number
      extreme_max_c: number
      extreme_min_c: number
    }
    monthly_normals: {
      tmax: Record<string, number>
      tmin: Record<string, number>
      tmean: Record<string, number>
    }
    growing_season: {
      last_spring_freeze_doy: number
      last_spring_freeze_date: string
      first_fall_freeze_doy: number
      first_fall_freeze_date: string
      frost_free_days: number
      frost_free_days_80pct_probability: number
    }
    critical_thresholds: {
      days_below_minus18c: number
      days_below_0c: number
      days_above_32c: number
      days_above_35c: number
    }
    thermal_time: {
      gdd_base_10c: number
      gdd_base_5c: number
      gdd_base_0c: number
      gdd_apr_oct: number
      accumulated_by_month: Record<string, number>
    }
  }
  soil_conditions: {
    workability: {
      wet_days_per_year: number
      spring_workable_date_median: string
      fall_workable_date_median: string
    }
    freeze_thaw: {
      freeze_thaw_cycles_per_year: number
      frost_depth_risk: string
    }
    erosion_risk: {
      high_risk_period: string
      winter_cover_critical: string
      erosive_rainfall_days_per_year: number
    }
  }
  crop_suitability: Record<string, {
    gdd_adequacy: string
    planting_window?: string
    risk_level?: string
    limiting_factors?: string[]
    winter_survival_risk?: string
    spring_planting_window?: string
  }>
  management_windows: Record<string, {
    earliest_safe_date?: string
    optimal_start_date?: string
    soil_temp_10cm_reach_10c?: string
    fall_seeding_deadline?: string
    winter_kill_risk_date?: string
    spring_greenup_date?: string
    spring_window_start?: string
    fall_window_end?: string
    frozen_ground_constraint?: string
    high_flow_period?: string
    peak_nutrient_loss_risk?: string
  }>
  climate_trends: {
    note: string
  }
  conservation_planning: {
    critical_erosion_period: string
    cover_needed_period: string
    residue_management_priority: string
    buffer_strip_effectiveness: string
  }
  comparison_to_normals: {
    current_year_deviation_pct: number
  }
  data_sources: {
    precipitation: string
    temperature: string
    methodology: string
  }
}
// ============================================================================
// Error Response Type
// ============================================================================

export interface GEEAPIErrorResponse {
  detail: string // v2.1.0 uses 'detail' instead of 'error'
  status?: number
  timestamp?: string
}

export interface GEEAPIError {
  error: string
  detail?: string
  status?: number
}

export interface CSBTileParams {
  z: number
  x: number
  y: number
}

// ============================================================================
// Management Zones (Optimization + Delineation)
// ============================================================================

export type ZoneOptimizationMethod = 'quick' | 'composite' | 'silhouette' | 'bic' | 'fpc'
export type ZoneClusteringMethod = 'kmeans' | 'fuzzy' | 'fuzzy_soft' | 'fuzzy_auto'

export interface ZoneOptimizationRequest {
  wkt: string
  covariates?: string[]
  year: number
  k_min?: number
  k_max?: number
  method?: ZoneOptimizationMethod
  field_area_ha?: number
  max_zones?: number
  min_zone_area_ha?: number
}

export interface ZoneAlternative {
  k: number
  votes: number
  silhouette: number | null
  fpc: number | null
  quality_level: string
}

export interface ZoneOptimizationResponse {
  recommended_k: number
  statistical_optimal_k: number
  consensus_k?: number | null
  consensus_votes: number
  total_methods: number
  method_votes: {
    silhouette: number | null
    calinski_harabasz: number | null
    davies_bouldin: number | null
    bic: number | null
    fpc: number | null
  }
  quality: {
    k: number
    silhouette: number | null
    calinski_harabasz: number | null
    davies_bouldin: number | null
    bic: number | null
    fpc: number | null
    quality_level: string
  }
  alternatives: ZoneAlternative[]
  practical_constraints_applied: boolean
  reason: string
  composite_scores?: Array<{
    k: number
    composite_score: number
    components: Record<string, number>
    stability_penalty_applied: boolean
  }> | null
  warnings: string[]
  wkt: string
}

export interface ZoneDelineationRequest {
  wkt: string
  covariates: string[]
  n_zones: number
  year: number
  clustering_method?: ZoneClusteringMethod
  fuzziness_m?: number
  smooth_boundaries?: boolean
  min_zone_area_ha?: number
  seed?: number
}

export interface ZoneCharacteristic {
  zone_id: number
  area_ha: number
  area_pct: number
  pixel_count: number
  zone_type: string
  temporal_stability: number | null
  mean_covariates: Record<string, number>
}

export interface ZonePolygonProperties {
  zone_id: number
  zone_type: string
  color?: string
  area_ha?: number
  area_pct?: number
}

export interface ZoneClusterAssignmentRaster {
  scale_m: number
  n_pixels: number
  width: number
  height: number
  longitudes: number[]
  latitudes: number[]
  assigned_cluster_ids: number[]
  winning_memberships: number[]
}

export interface ZoneClusterMembershipRasterCluster {
  cluster_id: number
  memberships: number[]
}

export interface ZoneClusterMembershipRasters {
  scale_m: number
  n_pixels: number
  width: number
  height: number
  longitudes: number[]
  latitudes: number[]
  clusters: ZoneClusterMembershipRasterCluster[]
}

export interface ZoneDelineationResponse {
  zone_characteristics: ZoneCharacteristic[]
  fpc: number | null
  clustering_method_used: ZoneClusteringMethod
  fuzziness_m_used: number | null
  n_transition_pixels: number | null
  method_used: 'custom_covariates'
  n_zones: number
  wkt: string
  cluster_assignment_raster?: ZoneClusterAssignmentRaster
  cluster_membership_rasters?: ZoneClusterMembershipRasters
  zone_polygons?: GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon, ZonePolygonProperties> | null
}
