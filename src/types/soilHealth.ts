// types/soilHealth.ts
export interface SoilHealthAssessment {
  id: string;
  fieldId: string;
  fieldName?: string;
  assessmentDate: Date;
  assessor: {
    name: string;
    organization: string;
    certification?: string;
    email?: string;
  };
  weatherConditions: {
    recentPrecipitation: string;
    soilMoisture: 'dry' | 'moist' | 'wet';
    temperature?: number;
    lastRainfall?: string;
  };
  fieldConditions: {
    cropStage?: string;
    tillageRecent?: boolean;
    trafficRecent?: boolean;
    notes?: string;
  };
  indicators: AssessedIndicator[];
  resourceConcerns: ResourceConcern[];
  recommendations: string[];
  photos: AssessmentPhoto[];
  gpsLocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  status: 'draft' | 'completed' | 'synced';
  createdAt: Date;
  updatedAt: Date;
}

export interface SoilHealthIndicator {
  id: string;
  name: string;
  category: 'physical' | 'biological';
  description: string;
  criteria: string;
  meets?: string;
  resourceConcerns: ResourceConcernType[];
  timing: TimingRequirement[];
  importance: string;
  howToAssess: string;
  practices: number[];
  icon?: string;
  priority: 'high' | 'medium' | 'low';
}

export type TimingRequirement = 'anytime' | 'after_rain' | 'adequate_moisture' | 'before_tillage' | 'no_till' | 'growing_season' | 'interview';

export type ResourceConcernType = 'CPT' | 'SOM' | 'AGG' | 'HAB';

export interface AssessedIndicator extends SoilHealthIndicator {
  meets_criteria: boolean | null;
  notes: string;
  photos: string[];
  measurement_value?: number;
  measurement_unit?: string;
  assessment_confidence: 'high' | 'medium' | 'low';
}

export interface ResourceConcern {
  type: 'compaction' | 'organic_matter_depletion' | 'aggregate_instability' | 'soil_organism_habitat';
  severity: 'none' | 'minor' | 'moderate' | 'severe';
  indicators_failed: string[];
  treatment_needed: boolean;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AssessmentPhoto {
  id: string;
  url: string;
  caption: string;
  indicator_id?: string;
  gps_location?: {
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
}

export interface PracticeRecommendation {
  practice_code: string;
  practice_name: string;
  description: string;
  addresses_concerns: string[];
  priority: 'high' | 'medium' | 'low';
  implementation_notes: string;
  cost_estimate?: string;
  timeframe: string;
}

export interface SoilContext {
  location?: string;
  fieldCMU?: string;
  tractNumber?: string;
  clientCustomer?: string;
  plan?: string;
  soilMapUnits?: string;
  surfaceHorizonTexture?: string;
  soilType: string;
  landUse: string;
  previousCrop: string;
  recentWeather: string;
  soilMoisture: 'dry' | 'moist' | 'field_capacity' | 'saturated';
  soilTemp?: number;
}

export interface ManagementHistory {
  cropRotation?: string;
  tillageSystem?: string;
  managementDuration?: string;
  coverageMonths?: number;
  grazingDetails?: string;
  coverCrops?: string;
  coverCropTermination?: string;
  pestManagement?: string;
  nutrientManagement?: string;
  irrigation?: string;
  ponding?: string;
  emergenceProblems?: string;
  waterManagement?: string;
  otherObservations?: string;
}

export interface SoilContext_Original {
  dominant_soil_series: string;
  drainage_class: string;
  hydrologic_group: string;
  organic_matter_typical: number;
  texture: string;
  slope: number;
  depth_to_restrictive_layer?: number;
  recommendations: string[];
  limitations: string[];
}
