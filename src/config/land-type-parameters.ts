// Land Type Parameters
// Interpretation rules and thresholds specific to land type and analysis tab combinations

export interface InterpretationRule {
  condition: string;
  interpretation: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  recommendation: string;
}

export interface Threshold {
  value: number;
  units: string;
}

export interface LandTypeParameter {
  land_type_id: string;
  tab_id: string;
  parameters: Record<string, any>;
  interpretation_rules: InterpretationRule[];
  thresholds: Record<string, Threshold>;
  api_mappings: Record<string, any>;
}

export const LAND_TYPE_PARAMETERS: LandTypeParameter[] = [
  // ============================================================================
  // CROPLAND PARAMETERS
  // ============================================================================
  
  // Cropland - Erosion
  {
    land_type_id: 'cropland',
    tab_id: 'erosion',
    parameters: {
      model: 'RUSLE2',
      displayUnits: 'tons/acre/year',
      includeManagementFactors: true
    },
    interpretation_rules: [
      {
        condition: 'erosionRate > tValue',
        interpretation: 'Soil loss exceeds tolerable level. Conservation practices required.',
        severity: 'critical',
        recommendation: 'Implement terraces, grassed waterways, or no-till management'
      },
      {
        condition: 'erosionRate > (tValue * 0.75) && erosionRate <= tValue',
        interpretation: 'Soil loss approaching tolerance. Consider additional conservation measures.',
        severity: 'high',
        recommendation: 'Evaluate contour farming, cover crops, or residue management'
      },
      {
        condition: 'erosionRate > (tValue * 0.5) && erosionRate <= (tValue * 0.75)',
        interpretation: 'Moderate erosion. Current practices providing some protection.',
        severity: 'moderate',
        recommendation: 'Monitor conditions and maintain current conservation practices'
      },
      {
        condition: 'erosionRate <= (tValue * 0.5)',
        interpretation: 'Erosion well controlled. Current management is protective.',
        severity: 'low',
        recommendation: 'Continue current practices'
      }
    ],
    thresholds: {
      minimal: { value: 1, units: 'tons/acre/year' },
      low: { value: 2, units: 'tons/acre/year' },
      moderate: { value: 3, units: 'tons/acre/year' },
      high: { value: 5, units: 'tons/acre/year' },
      excessive: { value: 10, units: 'tons/acre/year' }
    },
    api_mappings: {
      rusle2_response: {
        erosion_rate: 'annualSoilLoss',
        t_value: 'tolerableSoilLoss',
        factors: ['r', 'k', 'ls', 'c', 'p']
      }
    }
  },

  // Cropland - Productivity
  {
    land_type_id: 'cropland',
    tab_id: 'productivity',
    parameters: {
      index: 'NCCPI',
      displayUnits: 'index (0-100)',
      includeIrrigation: false
    },
    interpretation_rules: [
      {
        condition: 'nccpi >= 75',
        interpretation: 'Excellent crop productivity potential.',
        severity: 'low',
        recommendation: 'Maintain soil health through proper nutrient and residue management'
      },
      {
        condition: 'nccpi >= 50 && nccpi < 75',
        interpretation: 'Good to moderate productivity. May have some limitations.',
        severity: 'moderate',
        recommendation: 'Address limiting factors such as drainage or fertility'
      },
      {
        condition: 'nccpi < 50',
        interpretation: 'Limited productivity potential. Significant constraints present.',
        severity: 'high',
        recommendation: 'Consider alternative land uses or intensive management'
      }
    ],
    thresholds: {
      excellent: { value: 75, units: 'index' },
      good: { value: 60, units: 'index' },
      moderate: { value: 50, units: 'index' },
      limited: { value: 35, units: 'index' }
    },
    api_mappings: {
      ssurgo_response: {
        nccpi: 'nccpi3all',
        limiting_factor: 'mostLimiting'
      }
    }
  },

  // ============================================================================
  // FORESTRY PARAMETERS
  // ============================================================================
  
  // Forestry - Site Index
  {
    land_type_id: 'forestry',
    tab_id: 'site_index',
    parameters: {
      baseAge: 50,
      displayUnits: 'feet',
      includeMultipleSpecies: true
    },
    interpretation_rules: [
      {
        condition: 'siteIndex >= 80',
        interpretation: 'Excellent timber productivity.',
        severity: 'low',
        recommendation: 'Suitable for intensive timber management'
      },
      {
        condition: 'siteIndex >= 60 && siteIndex < 80',
        interpretation: 'Good timber productivity.',
        severity: 'low',
        recommendation: 'Well-suited for commercial forestry'
      },
      {
        condition: 'siteIndex >= 40 && siteIndex < 60',
        interpretation: 'Moderate timber productivity.',
        severity: 'moderate',
        recommendation: 'Consider longer rotations or alternative species'
      },
      {
        condition: 'siteIndex < 40',
        interpretation: 'Limited timber productivity.',
        severity: 'high',
        recommendation: 'May be better suited for wildlife habitat or conservation'
      }
    ],
    thresholds: {
      excellent: { value: 80, units: 'feet @ 50yr' },
      good: { value: 60, units: 'feet @ 50yr' },
      moderate: { value: 40, units: 'feet @ 50yr' }
    },
    api_mappings: {
      fia_response: {
        site_index: 'siteIndex50',
        species: 'speciesCode'
      }
    }
  },

  // ============================================================================
  // WETLAND PARAMETERS
  // ============================================================================
  
  // Wetland - Hydric Soils
  {
    land_type_id: 'wetland',
    tab_id: 'hydric',
    parameters: {
      requireFieldIndicators: true,
      displayCriteria: true
    },
    interpretation_rules: [
      {
        condition: 'hydricRating === "Yes"',
        interpretation: 'Hydric soil present. Meets wetland soil criteria.',
        severity: 'low',
        recommendation: 'Document field indicators for wetland delineation'
      },
      {
        condition: 'hydricRating === "No"',
        interpretation: 'Not a hydric soil. Does not meet wetland soil criteria.',
        severity: 'low',
        recommendation: 'Check for problematic hydric soils or verify field conditions'
      },
      {
        condition: 'hydricRating === "Unranked"',
        interpretation: 'Hydric status uncertain. Field verification required.',
        severity: 'moderate',
        recommendation: 'Conduct detailed field investigation'
      }
    ],
    thresholds: {},
    api_mappings: {
      nrcs_hydric_response: {
        rating: 'hydricRating',
        criteria: 'hydricCriteria',
        indicators: 'fieldIndicators'
      }
    }
  },

  // ============================================================================
  // DEVELOPED/URBAN PARAMETERS
  // ============================================================================
  
  // Developed - Infiltration
  {
    land_type_id: 'developed',
    tab_id: 'infiltration',
    parameters: {
      designStorm: '10-year',
      displayUnits: 'in/hr'
    },
    interpretation_rules: [
      {
        condition: 'hydrologicGroup === "A"',
        interpretation: 'Excellent infiltration. Low runoff potential.',
        severity: 'low',
        recommendation: 'Well-suited for infiltration-based BMPs'
      },
      {
        condition: 'hydrologicGroup === "B"',
        interpretation: 'Good infiltration. Moderate runoff potential.',
        severity: 'low',
        recommendation: 'Suitable for bioretention and rain gardens'
      },
      {
        condition: 'hydrologicGroup === "C"',
        interpretation: 'Slow infiltration. Moderately high runoff potential.',
        severity: 'moderate',
        recommendation: 'May require soil amendments or filtration systems'
      },
      {
        condition: 'hydrologicGroup === "D"',
        interpretation: 'Very slow infiltration. High runoff potential.',
        severity: 'high',
        recommendation: 'Use detention/retention rather than infiltration BMPs'
      }
    ],
    thresholds: {
      rapid: { value: 2.0, units: 'in/hr' },
      moderate: { value: 0.5, units: 'in/hr' },
      slow: { value: 0.15, units: 'in/hr' }
    },
    api_mappings: {
      ssurgo_response: {
        hydrologic_group: 'hydgrp',
        infiltration_rate: 'ksat'
      }
    }
  },

  // ============================================================================
  // RANGELAND PARAMETERS
  // ============================================================================
  
  // Rangeland - Ecological Site
  {
    land_type_id: 'rangeland',
    tab_id: 'ecological_site',
    parameters: {
      includeStateTransitionModel: true,
      displayPlantCommunity: true
    },
    interpretation_rules: [
      {
        condition: 'condition === "reference"',
        interpretation: 'Site in reference condition. Healthy ecological function.',
        severity: 'low',
        recommendation: 'Maintain current grazing management'
      },
      {
        condition: 'condition === "at-risk"',
        interpretation: 'Site at risk of transitioning to degraded state.',
        severity: 'moderate',
        recommendation: 'Adjust grazing intensity and timing'
      },
      {
        condition: 'condition === "degraded"',
        interpretation: 'Site in degraded condition. Restoration needed.',
        severity: 'high',
        recommendation: 'Implement restoration practices and adjust grazing'
      }
    ],
    thresholds: {},
    api_mappings: {
      edit_response: {
        site_id: 'ecologicalSiteId',
        mlra: 'mlra',
        state: 'currentState'
      }
    }
  }
];

// Helper functions
export function getLandTypeParameters(
  landTypeId: string,
  tabId: string
): LandTypeParameter | undefined {
  return LAND_TYPE_PARAMETERS.find(
    ltp => ltp.land_type_id === landTypeId && ltp.tab_id === tabId
  );
}

export function getParametersByLandType(landTypeId: string): LandTypeParameter[] {
  return LAND_TYPE_PARAMETERS.filter(ltp => ltp.land_type_id === landTypeId);
}

export function getParametersByTab(tabId: string): LandTypeParameter[] {
  return LAND_TYPE_PARAMETERS.filter(ltp => ltp.tab_id === tabId);
}

export function evaluateInterpretation(
  landTypeId: string,
  tabId: string,
  data: Record<string, any>
): InterpretationRule | null {
  const params = getLandTypeParameters(landTypeId, tabId);
  if (!params) return null;

  // Simple evaluation - in real implementation, you'd parse and evaluate the condition
  for (const rule of params.interpretation_rules) {
    // This is a placeholder - actual implementation would need proper expression evaluation
    // For now, return the first rule (you'd implement proper condition checking)
    if (rule.condition) {
      return rule;
    }
  }

  return null;
}
