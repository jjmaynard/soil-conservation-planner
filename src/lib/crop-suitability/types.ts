// Input Level Options
export type InputLevel = 'L' | 'I' | 'H';

export interface InputLevelOption {
  value: InputLevel;
  label: string;
  description: string;
}

// Location
export interface Location {
  latitude: number;
  longitude: number;
}

// Crops
export interface Crop {
  crop_id: string;
  crop_name: string;
  default_depth_weight: number;
  depth_description: string;
}

export interface CropListResponse {
  status: 'success';
  crops: Crop[];
  total_count: number;
}

// User Data (optional)
export interface PlotDataHorizon {
  horizon_id: string;
  top_depth: number;
  bottom_depth: number;
  sand_pct?: number;
  silt_pct?: number;
  clay_pct?: number;
  ph?: number;
  organic_matter_pct?: number;
}

export interface SiteData {
  drainage_class?: string;
  slope_pct?: number;
  elevation_m?: number;
}

export interface UserData {
  plot_data?: PlotDataHorizon[];
  site_data?: SiteData;
}

// Calculation Request
export interface CalculationRequest {
  location: Location;
  crop_id: string;
  input_level: InputLevel;
  user_data?: UserData;
}

// Soil Quality Indices
export interface SoilQualityIndices {
  SQ1: number;  // Nutrient Availability
  SQ2: number;  // Nutrient Retention
  SQ3: number;  // Rooting Conditions
  SQ4: number;  // Oxygen Availability
  SQ5: number;  // Salinity/Sodicity
  SQ6: number;  // Lime/Gypsum
  SQ7: number;  // Workability
  SR: number;   // Overall Rating
}

// Interpretations
export type SQIClassification = 'excellent' | 'good' | 'moderate' | 'poor' | 'very_poor';
export type ConstraintSeverity = 'none' | 'slight' | 'moderate' | 'severe' | 'very_severe';

export interface SQIInterpretation {
  index_name: string;
  score: number;
  classification: SQIClassification;
  constraint_severity: ConstraintSeverity;
  description: string;
  key_factors: string[];
  management_options: string[];
}

export interface LimitingFactor {
  sqi_code: string;
  sqi_name: string;
  score: number;
  severity: ConstraintSeverity;
  impact_description: string;
  is_primary: boolean;
}

export interface ManagementRecommendation {
  priority: number;
  category: string;
  recommendation: string;
  target_sqi?: string;
  expected_improvement?: string;
}

export interface SoilSuitabilityInterpretation {
  overall_classification: SQIClassification;
  suitability_class: string;
  summary: string;
  primary_constraint?: string;
  secondary_constraints: string[];
  input_level_note: string;
}

export interface InterpretationResponse {
  suitability: SoilSuitabilityInterpretation;
  sqi_interpretations: Record<string, SQIInterpretation>;
  limiting_factors: LimitingFactor[];
  recommendations: ManagementRecommendation[];
  crop_specific_notes?: string[];
}

// Calculation Response
export interface CalculationResponse {
  status: 'success' | 'error';
  location: Location;
  crop_info: {
    crop_id: string;
    crop_name: string;
    input_level: string;
    depth_weight_type: number;
    rooting_depth_description: string;
  };
  soil_quality_indices: SoilQualityIndices;
  interpretations?: InterpretationResponse;
  data_sources: {
    ssurgo_component: string;
    ssurgo_map_unit: string;
    user_data_used: boolean;
  };
  metadata: {
    calculation_timestamp: string;
    api_version: string;
    processing_time_seconds: number;
  };
  message?: string;
}
