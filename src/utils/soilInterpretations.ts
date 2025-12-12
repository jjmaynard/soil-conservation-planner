// Soil Interpretations Translation System
// Transforms SSURGO technical data into farmer-friendly information

export interface InterpretationTranslation {
  name: string
  description: string
  farmingAdvice: string
  management: string
  recommendations: string[]
  colorClass: string
}

// Land Capability Classification Interpretations
export const LAND_CAPABILITY_INTERPRETATIONS = {
  classes: {
    '1': {
      name: 'Excellent for Crops',
      description: 'Prime agricultural land with few limitations',
      farmingAdvice: 'Suitable for all common crops with standard farming practices',
      management: 'Use good farming practices to maintain soil productivity',
      recommendations: [
        'Maintain soil organic matter through crop rotation',
        'Use appropriate fertilization based on soil tests',
        'Practice integrated pest management',
      ],
      colorClass: 'emerald',
    },
    '2': {
      name: 'Good for Crops',
      description: 'Good agricultural land with minor limitations',
      farmingAdvice: 'Suitable for most crops with some conservation practices',
      management: 'Apply conservation practices to address minor limitations',
      recommendations: [
        'Use conservation tillage where appropriate',
        'Implement crop rotation to maintain soil health',
        'Monitor for erosion on slopes',
      ],
      colorClass: 'green',
    },
    '3': {
      name: 'Moderate Limitations',
      description: 'Fair agricultural land requiring careful management',
      farmingAdvice: 'Row crops possible with conservation practices and proper management',
      management: 'Intensive conservation practices required for sustainable cultivation',
      recommendations: [
        'Use terracing or contour farming on slopes',
        'Plant cover crops to prevent erosion',
        'Consider conservation reserve programs',
      ],
      colorClass: 'yellow',
    },
    '4': {
      name: 'Severe Limitations',
      description: 'Poor choice for regular cultivation',
      farmingAdvice: 'Limited cultivation recommended; consider alternative land uses',
      management: 'Very intensive conservation practices needed if cultivated',
      recommendations: [
        'Consider permanent pasture or hay production',
        'If cultivating, use extensive conservation measures',
        'Evaluate for other agricultural uses',
      ],
      colorClass: 'orange',
    },
    '5': {
      name: 'Not Suitable for Cultivation',
      description: 'Best used for grazing, forestry, or wildlife habitat',
      farmingAdvice: 'Do not cultivate; use for pasture, range, forestry, or wildlife',
      management: 'Focus on grazing management or natural resource conservation',
      recommendations: [
        'Manage grazing intensity to prevent overuse',
        'Consider tree planting for erosion control',
        'Maintain native vegetation where possible',
      ],
      colorClass: 'red',
    },
    '6': {
      name: 'Limited Grazing',
      description: 'Severe limitations restrict use to grazing, forestry, or wildlife',
      farmingAdvice: 'Limited grazing with careful management; forestry may be suitable',
      management: 'Restrict grazing intensity; focus on conservation',
      recommendations: [
        'Limit livestock access during wet periods',
        'Consider rotational grazing systems',
        'Plant trees on steeper slopes',
      ],
      colorClass: 'red',
    },
    '7': {
      name: 'Very Limited Use',
      description: 'Very severe limitations restrict use to grazing, forestry, or wildlife',
      farmingAdvice: 'Very limited grazing; primarily suited for forestry or wildlife',
      management: 'Minimal disturbance; focus on natural resource protection',
      recommendations: [
        'Maintain natural vegetation',
        'Control access to prevent degradation',
        'Consider wildlife habitat improvements',
      ],
      colorClass: 'red',
    },
    '8': {
      name: 'Wildlife and Recreation',
      description: 'Severe limitations preclude commercial plant production',
      farmingAdvice: 'Not suitable for grazing or forestry; best for wildlife or recreation',
      management: 'Preserve in natural state for non-commercial uses',
      recommendations: [
        'Protect existing vegetation',
        'Develop for wildlife habitat',
        'Consider recreational uses that do not disturb soil',
      ],
      colorClass: 'gray',
    },
  },

  subclasses: {
    e: {
      name: 'Erosion Risk',
      description: 'Main limitation is susceptibility to erosion',
      management: 'Use erosion control practices like cover crops, terracing, or reduced tillage',
      recommendations: [
        'Plant cover crops between growing seasons',
        'Use contour farming on slopes',
        'Consider no-till or minimum-till practices',
        'Install terraces on steeper slopes',
      ],
    },
    w: {
      name: 'Wetness',
      description: 'Excess water limits plant growth or cultivation',
      management: 'Improve drainage or choose water-tolerant crops',
      recommendations: [
        'Install drainage tiles if economically feasible',
        'Use controlled traffic patterns when soil is wet',
        'Plant water-tolerant crops',
        'Avoid field operations when soil is saturated',
      ],
    },
    s: {
      name: 'Soil Limitations',
      description: 'Shallow depth, stones, drought, or other soil issues',
      management: 'Adapt practices to work within soil constraints',
      recommendations: [
        'Use drought-resistant crops if water is limiting',
        'Avoid deep tillage on shallow soils',
        'Remove stones if economically practical',
        'Choose equipment suitable for conditions',
      ],
    },
    c: {
      name: 'Climate',
      description: 'Climate (cold or dry) limits crop production',
      management: 'Select climate-appropriate crops and timing',
      recommendations: [
        'Choose short-season varieties in cold areas',
        'Use drought-tolerant crops in dry regions',
        'Adjust planting dates for local climate',
        'Consider season extension techniques',
      ],
    },
  },
}

// Hydrologic Group Interpretations
export const HYDROLOGIC_GROUP_INTERPRETATIONS = {
  A: {
    name: 'High Infiltration',
    description: 'Water soaks in rapidly with low runoff potential',
    implications: 'Excellent drainage but may require more frequent irrigation',
    management: 'Monitor soil moisture levels; may need supplemental water during dry periods',
    recommendations: [
      'Good for crops requiring well-drained conditions',
      'May need more frequent but lighter irrigation',
      'Consider drought-resistant varieties',
    ],
    colorClass: 'blue',
  },
  B: {
    name: 'Moderate Infiltration',
    description: 'Moderate infiltration rates when thoroughly wet',
    implications: 'Balanced water retention and drainage characteristics',
    management: 'Generally good water management characteristics',
    recommendations: [
      'Suitable for most crops with standard practices',
      'Good balance of drainage and water retention',
      'Monitor during extreme weather conditions',
    ],
    colorClass: 'cyan',
  },
  C: {
    name: 'Slow Infiltration',
    description: 'Slow infiltration when thoroughly wet',
    implications: 'Higher runoff potential; may pond water after heavy rains',
    management: 'May need drainage improvements or surface water management',
    recommendations: [
      'Consider drainage improvements if needed',
      'Use practices to increase infiltration',
      'Avoid traffic on wet soils to prevent compaction',
    ],
    colorClass: 'yellow',
  },
  D: {
    name: 'Very Slow Infiltration',
    description: 'Very slow infiltration and high runoff potential',
    implications: 'High flood risk; poor internal drainage',
    management: 'Significant drainage issues; may require extensive modifications',
    recommendations: [
      'Consider extensive drainage systems',
      'May be better suited for water-tolerant crops',
      'High risk for flooding and ponding',
    ],
    colorClass: 'red',
  },
}

// Drainage Class Interpretations
export const DRAINAGE_CLASS_INTERPRETATIONS = {
  'Excessively drained': {
    name: 'Excessively Drained',
    description: 'Water drains away very rapidly',
    implications: 'May require frequent irrigation; low water holding capacity',
    management: 'Focus on water conservation and retention',
    colorClass: 'orange',
  },
  'Somewhat excessively drained': {
    name: 'Somewhat Excessively Drained',
    description: 'Water drains away rapidly',
    implications: 'Good for crops that prefer drier conditions',
    management: 'May need supplemental water during dry periods',
    colorClass: 'yellow',
  },
  'Well drained': {
    name: 'Well Drained',
    description: 'Water moves through soil readily but not rapidly',
    implications: 'Ideal drainage for most crops',
    management: 'Excellent conditions for most agricultural uses',
    colorClass: 'green',
  },
  'Moderately well drained': {
    name: 'Moderately Well Drained',
    description: 'Water moves through soil somewhat slowly',
    implications: 'May have brief periods of wetness',
    management: 'Generally good for crops; monitor during wet periods',
    colorClass: 'cyan',
  },
  'Somewhat poorly drained': {
    name: 'Somewhat Poorly Drained',
    description: 'Water moves through soil slowly',
    implications: 'May be wet for extended periods',
    management: 'May benefit from drainage improvements',
    colorClass: 'yellow',
  },
  'Poorly drained': {
    name: 'Poorly Drained',
    description: 'Water moves through soil very slowly',
    implications: 'Often wet; limits crop options',
    management: 'Significant drainage improvements needed for most crops',
    colorClass: 'orange',
  },
  'Very poorly drained': {
    name: 'Very Poorly Drained',
    description: 'Water stands on or near surface most of the time',
    implications: 'Severely limits agricultural use',
    management: 'Best suited for wetland crops or wildlife habitat',
    colorClass: 'red',
  },
} as const

export type DrainageClassKey = keyof typeof DRAINAGE_CLASS_INTERPRETATIONS

// Utility function to get class color
export function getCapabilityColor(classNum: string): string {
  const colorMap: Record<string, string> = {
    '1': '#10b981', // emerald-500
    '2': '#22c55e', // green-500
    '3': '#eab308', // yellow-500
    '4': '#f97316', // orange-500
    '5': '#ef4444', // red-500
    '6': '#dc2626', // red-600
    '7': '#b91c1c', // red-700
    '8': '#6b7280', // gray-500
  }
  return colorMap[classNum] || '#9ca3af'
}

// Utility function to get hydrology color
export function getHydrologyColor(group: string): string {
  const colorMap: Record<string, string> = {
    A: '#3b82f6', // blue-500
    B: '#06b6d4', // cyan-500
    C: '#eab308', // yellow-500
    D: '#ef4444', // red-500
  }
  return colorMap[group] || '#9ca3af'
}

// Utility function to get drainage color
export function getDrainageColor(drainageClass: string): string {
  const normalized = drainageClass.toLowerCase()
  if (normalized.includes('excessively')) return '#f97316' // orange
  if (normalized.includes('well')) return '#22c55e' // green
  if (normalized.includes('moderately')) return '#06b6d4' // cyan
  if (normalized.includes('somewhat poorly') || normalized.includes('poorly'))
    return '#eab308' // yellow
  if (normalized.includes('very poorly')) return '#ef4444' // red
  return '#9ca3af' // gray
}
