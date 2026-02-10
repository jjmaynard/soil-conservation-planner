export interface AssessmentLocation {
  wkt: string;
  coordinates: {
    lon: number;
    lat: number;
  };
  note: string;
}

export interface DroughtStatus {
  severity: string;
  confidence: string;
  trend: string;
  summary: string;
  index_agreement: Record<string, string>;
}

export interface TimeframeCondition {
  period: string;
  status: string;
  description: string;
  relevant_for: string[];
  key_indices: Record<string, number>;
}

export interface DroughtConditions {
  immediate: TimeframeCondition;
  seasonal: TimeframeCondition;
  annual: TimeframeCondition;
  long_term: TimeframeCondition;
}

export interface DroughtImpacts {
  primary_concerns: string[];
  affected_practices: {
    practice_code: string;
    practice_name: string;
    impact: string;
    recommendation: string;
  }[];
  timing_considerations: {
    urgent: string[];
    near_term: string[];
    planning: string[];
  };
  soil_interaction_note: string;
}

export interface DroughtIndexValue {
  time_scale: string;
  value: number;
  category: string;
  interpretation: string;
}

export interface DroughtIndex {
  name: string;
  description: string;
  values: DroughtIndexValue[];
  current_condition: string;
}

export interface TechnicalIndices {
  SPI: DroughtIndex;
  SPEI: DroughtIndex;
  EDDI: DroughtIndex;
  PDSI: DroughtIndex;
}

export interface DroughtMetadata {
  data_source: string;
  resolution: string;
  coverage: string;
  last_updated: string;
  next_update: string;
  update_frequency: string;
}

export interface DateInfo {
  requested_date: string;
  actual_date: string;
  was_adjusted: boolean;
}

export interface DroughtAssessmentResponse {
  location: AssessmentLocation;
  assessment_date: string;
  current_status: DroughtStatus;
  conditions_by_timeframe: DroughtConditions;
  conservation_impacts: DroughtImpacts;
  technical_indices: TechnicalIndices;
  metadata: DroughtMetadata;
  date_info: DateInfo;
}

export interface DroughtAssessmentRequest {
  wkt: string;
  date?: string;
  soil_awc?: number;
  soil_texture?: string;
  include_technical?: boolean;
  auto_adjust_date?: boolean;
}
