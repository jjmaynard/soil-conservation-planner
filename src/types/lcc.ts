// Land Capability Classification (LCC) Types
// Based on SSURGO LCC interpretation framework

export type LCCClass = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII' | 'VIII';

export type LCCSubclassModifier = 'e' | 'w' | 's' | 'c';

export type LimitationType = 'erosion' | 'wetness' | 'soil_limitations' | 'climate' | 'rooting_depth' | 'flooding' | 'slope';

export type LimitationSeverity = 'slight' | 'moderate' | 'severe' | 'very_severe';

export interface LCCRating {
  class: LCCClass;
  subclass: string; // e.g., 'e', 'w', 'ew', 'es'
  rating_value?: number;
  certainty?: string; // Low, Medium, High
}

export interface LCCLimitation {
  type: LimitationType;
  severity: LimitationSeverity;
  description: string;
  value?: number | string;
}

export interface LCCDescription {
  summary: string;
  description: string;
  management: string;
  crops: string;
  limitations_explanation?: string;
}

export interface ComponentLCC {
  cokey: string;
  component_name: string;
  component_percent: number;
  major_component: boolean;
  irrigated_lcc: LCCRating | null;
  nonirrigated_lcc: LCCRating | null;
  limitations: LCCLimitation[];
  physical_properties: {
    slope_percent?: number;
    drainage_class?: string;
    flooding_frequency?: string;
    ponding_frequency?: string;
    restrictive_depth_cm?: number;
    available_water_capacity?: number;
    hydrologic_group?: string;
  };
}

export interface FormattedLCCData {
  dominant_lcc: {
    irrigated: LCCRating | null;
    nonirrigated: LCCRating | null;
  };
  irrigated_description: LCCDescription;
  nonirrigated_description: LCCDescription;
  irrigated_limitations: LCCLimitation[];
  nonirrigated_limitations: LCCLimitation[];
  components: Array<{
    name: string;
    percent: number;
    irrigated_class: string | null;
    irrigated_subclass: string | null;
    nonirrigated_class: string | null;
    nonirrigated_subclass: string | null;
  }>;
  irrigated_management: {
    suitable_crops: string[];
    conservation_practices: string[];
    key_considerations: string[];
  };
  nonirrigated_management: {
    suitable_crops: string[];
    conservation_practices: string[];
    key_considerations: string[];
  };
}
