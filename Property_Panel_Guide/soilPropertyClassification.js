// ==========================================================================
// USDA SSURGO Soil Property Classification System
// Standardized ranges for US soil mapping and analysis
// ==========================================================================

export const soilPropertyRanges = {
  // Clay Content (% by weight)
  clay: [
    { min: 0, max: 5, label: 'Very Low', color: '#fef3c7', description: 'Sandy textures' },
    { min: 5, max: 15, label: 'Low', color: '#fde68a', description: 'Sandy loam, loamy sand' },
    { min: 15, max: 25, label: 'Moderate', color: '#fcd34d', description: 'Loam, silt loam' },
    { min: 25, max: 35, label: 'Moderately High', color: '#f59e0b', description: 'Clay loam, silty clay loam' },
    { min: 35, max: 45, label: 'High', color: '#d97706', description: 'Clay, silty clay' },
    { min: 45, max: 55, label: 'Very High', color: '#b45309', description: 'Heavy clay' },
    { min: 55, max: 70, label: 'Extremely High', color: '#92400e', description: 'Very heavy clay' },
    { min: 70, max: 100, label: 'Maximum', color: '#78350f', description: 'Extreme clay content' }
  ],
  
  // Organic Matter (% by weight)
  om: [
    { min: 0, max: 0.5, label: 'Very Low', color: '#fee2e2', description: 'Depleted/arid soils' },
    { min: 0.5, max: 1, label: 'Low', color: '#fecaca', description: 'Typical cultivated soils' },
    { min: 1, max: 2, label: 'Moderate', color: '#fca5a5', description: 'Average agricultural soils' },
    { min: 2, max: 4, label: 'Good', color: '#f87171', description: 'Well-managed soils' },
    { min: 4, max: 6, label: 'High', color: '#ef4444', description: 'Grassland/forest soils' },
    { min: 6, max: 10, label: 'Very High', color: '#dc2626', description: 'Rich prairie/woodland' },
    { min: 10, max: 20, label: 'Extremely High', color: '#b91c1c', description: 'Wetland margins' },
    { min: 20, max: 100, label: 'Organic', color: '#991b1b', description: 'Histosols, peat soils' }
  ],
  
  // pH (standard units)
  ph: [
    { min: 3.0, max: 4.5, label: 'Extremely Acid', color: '#fee2e2', description: 'Sulfidic, mining-affected' },
    { min: 4.5, max: 5.0, label: 'Very Strongly Acid', color: '#fecaca', description: 'Coniferous forests' },
    { min: 5.0, max: 5.5, label: 'Strongly Acid', color: '#fca5a5', description: 'Typical forest soils' },
    { min: 5.5, max: 6.0, label: 'Moderately Acid', color: '#f87171', description: 'Slightly amended' },
    { min: 6.0, max: 6.5, label: 'Slightly Acid', color: '#fbbf24', description: 'Good for most crops' },
    { min: 6.5, max: 7.3, label: 'Neutral', color: '#10b981', description: 'Optimal range' },
    { min: 7.3, max: 8.0, label: 'Slightly Alkaline', color: '#3b82f6', description: 'Western grasslands' },
    { min: 8.0, max: 8.5, label: 'Moderately Alkaline', color: '#6366f1', description: 'Arid regions' },
    { min: 8.5, max: 10.5, label: 'Strongly Alkaline', color: '#8b5cf6', description: 'Sodic/saline soils' }
  ],

  // Available Water Capacity (in/in or cm/cm)
  awc: [
    { min: 0.00, max: 0.05, label: 'Very Low', color: '#fee2e2', description: 'Sandy, gravelly soils' },
    { min: 0.05, max: 0.10, label: 'Low', color: '#fecaca', description: 'Sandy loam textures' },
    { min: 0.10, max: 0.15, label: 'Moderately Low', color: '#bfdbfe', description: 'Fine sandy loam' },
    { min: 0.15, max: 0.20, label: 'Moderate', color: '#93c5fd', description: 'Loam textures' },
    { min: 0.20, max: 0.25, label: 'Moderately High', color: '#60a5fa', description: 'Silt loam, clay loam' },
    { min: 0.25, max: 0.30, label: 'High', color: '#3b82f6', description: 'Silty clay, organic-rich' },
    { min: 0.30, max: 0.40, label: 'Very High', color: '#2563eb', description: 'Organic soils, swelling clays' },
    { min: 0.40, max: 0.60, label: 'Extremely High', color: '#1d4ed8', description: 'Histosols, peat' }
  ],

  // Saturated Hydraulic Conductivity (μm/s)
  ksat: [
    { min: 0.001, max: 0.1, label: 'Very Slow', color: '#1e1b4b', description: 'Dense clay, fragipan' },
    { min: 0.1, max: 1, label: 'Slow', color: '#312e81', description: 'Clay, silty clay' },
    { min: 1, max: 4, label: 'Moderately Slow', color: '#4c1d95', description: 'Clay loam' },
    { min: 4, max: 14, label: 'Moderate', color: '#7c3aed', description: 'Loam, silt loam' },
    { min: 14, max: 40, label: 'Moderately Rapid', color: '#8b5cf6', description: 'Sandy loam' },
    { min: 40, max: 140, label: 'Rapid', color: '#a78bfa', description: 'Loamy sand, fine sand' },
    { min: 140, max: 400, label: 'Very Rapid', color: '#c4b5fd', description: 'Sand, coarse sand' },
    { min: 400, max: 2000, label: 'Extremely Rapid', color: '#e0e7ff', description: 'Gravel, fractured rock' }
  ]
};

// Property metadata for display and analysis
export const soilPropertyMetadata = {
  clay: {
    name: 'Clay Content',
    unit: '%',
    fullName: 'Clay Content (% by weight)',
    optimal: { min: 15, max: 35 },
    category: 'Physical'
  },
  om: {
    name: 'Organic Matter',
    unit: '%',
    fullName: 'Organic Matter (% by weight)',
    optimal: { min: 2, max: 6 },
    category: 'Chemical'
  },
  ph: {
    name: 'pH',
    unit: '',
    fullName: 'pH (standard units)',
    optimal: { min: 6.0, max: 7.3 },
    category: 'Chemical'
  },
  awc: {
    name: 'Available Water Capacity',
    unit: 'in/in',
    fullName: 'Available Water Capacity (in/in)',
    optimal: { min: 0.15, max: 0.30 },
    category: 'Physical'
  },
  ksat: {
    name: 'Saturated Hydraulic Conductivity',
    unit: 'μm/s',
    fullName: 'Saturated Hydraulic Conductivity (μm/s)',
    optimal: { min: 4, max: 40 },
    category: 'Physical'
  }
};

// ==========================================================================
// UTILITY FUNCTIONS
// ==========================================================================

/**
 * Classify a soil property value into its appropriate range class
 * @param {number} value - The property value to classify
 * @param {string} property - The property type (clay, om, ph, awc, ksat)
 * @returns {Object|null} - The classification object or null if invalid
 */
export function classifyProperty(value, property) {
  const ranges = soilPropertyRanges[property];
  if (!ranges || typeof value !== 'number' || isNaN(value)) return null;
  
  // Handle edge case for maximum values (use <= for last class)
  for (let i = 0; i < ranges.length - 1; i++) {
    if (value >= ranges[i].min && value < ranges[i].max) {
      return { ...ranges[i], index: i };
    }
  }
  
  // Check last range with inclusive upper bound
  const lastRange = ranges[ranges.length - 1];
  if (value >= lastRange.min && value <= lastRange.max) {
    return { ...lastRange, index: ranges.length - 1 };
  }
  
  // Handle extreme outliers
  if (value < ranges[0].min) {
    return { ...ranges[0], index: 0, outlier: 'low' };
  }
  if (value > ranges[ranges.length - 1].max) {
    return { ...ranges[ranges.length - 1], index: ranges.length - 1, outlier: 'high' };
  }
  
  return null;
}

/**
 * Get property status relative to optimal range
 * @param {number} value - The property value
 * @param {string} property - The property type
 * @returns {string} - Status: 'optimal', 'low', 'high', 'unknown'
 */
export function getPropertyStatus(value, property) {
  const metadata = soilPropertyMetadata[property];
  if (!metadata || typeof value !== 'number' || isNaN(value)) return 'unknown';
  
  const { optimal } = metadata;
  
  if (value >= optimal.min && value <= optimal.max) {
    return 'optimal';
  } else if (value < optimal.min) {
    return 'low';
  } else {
    return 'high';
  }
}

/**
 * Calculate soil quality score based on all properties
 * @param {Object} properties - Object with property values
 * @returns {Object} - Quality score and breakdown
 */
export function calculateSoilQuality(properties) {
  const scores = {};
  let totalScore = 0;
  let validProperties = 0;
  
  Object.keys(properties).forEach(prop => {
    if (soilPropertyMetadata[prop] && typeof properties[prop] === 'number') {
      const status = getPropertyStatus(properties[prop], prop);
      let score = 0;
      
      switch (status) {
        case 'optimal': score = 100; break;
        case 'low': 
        case 'high': 
          // Calculate distance from optimal range
          const metadata = soilPropertyMetadata[prop];
          const value = properties[prop];
          const optimalMid = (metadata.optimal.min + metadata.optimal.max) / 2;
          const optimalRange = metadata.optimal.max - metadata.optimal.min;
          const distance = Math.abs(value - optimalMid);
          score = Math.max(0, 100 - (distance / optimalRange) * 50);
          break;
        default: score = 0;
      }
      
      scores[prop] = { value: properties[prop], score, status };
      totalScore += score;
      validProperties++;
    }
  });
  
  return {
    overallScore: validProperties > 0 ? Math.round(totalScore / validProperties) : 0,
    propertyScores: scores,
    validProperties
  };
}

/**
 * Get color for a property value
 * @param {number} value - The property value
 * @param {string} property - The property type
 * @returns {string} - Hex color code
 */
export function getPropertyColor(value, property) {
  const classification = classifyProperty(value, property);
  return classification ? classification.color : '#9ca3af';
}

/**
 * Format property value for display
 * @param {number} value - The property value
 * @param {string} property - The property type
 * @returns {string} - Formatted string
 */
export function formatPropertyValue(value, property) {
  const metadata = soilPropertyMetadata[property];
  if (!metadata) return value.toString();
  
  let formattedValue;
  
  switch (property) {
    case 'ph':
      formattedValue = value.toFixed(1);
      break;
    case 'awc':
      formattedValue = value.toFixed(2);
      break;
    case 'ksat':
      if (value < 1) {
        formattedValue = value.toFixed(3);
      } else if (value < 10) {
        formattedValue = value.toFixed(1);
      } else {
        formattedValue = Math.round(value).toString();
      }
      break;
    default:
      formattedValue = value.toFixed(1);
  }
  
  return `${formattedValue}${metadata.unit ? ' ' + metadata.unit : ''}`;
}

/**
 * Get all properties within a specific quality level
 * @param {string} qualityLevel - The quality level to filter by
 * @param {string} property - The property type
 * @returns {Array} - Array of range objects
 */
export function getPropertiesByQuality(qualityLevel, property) {
  const ranges = soilPropertyRanges[property];
  if (!ranges) return [];
  
  const qualityMap = {
    'poor': ['Very Low', 'Low'],
    'fair': ['Moderate', 'Moderately Low', 'Moderately High'],
    'good': ['Good', 'High', 'Moderately Rapid'],
    'excellent': ['Very High', 'Extremely High', 'Optimal', 'Neutral']
  };
  
  const targetLabels = qualityMap[qualityLevel] || [];
  return ranges.filter(range => 
    targetLabels.some(label => range.label.includes(label))
  );
}

/**
 * Generate legend data for mapping
 * @param {string} property - The property type
 * @returns {Array} - Legend entries with colors and labels
 */
export function generatePropertyLegend(property) {
  const ranges = soilPropertyRanges[property];
  const metadata = soilPropertyMetadata[property];
  
  if (!ranges || !metadata) return [];
  
  return ranges.map((range, index) => ({
    ...range,
    index,
    displayLabel: `${range.min}${index === ranges.length - 1 ? '+' : `-${range.max}`} ${metadata.unit}`,
    fullLabel: `${range.label}: ${range.description}`
  }));
}

// ==========================================================================
// REGIONAL ADJUSTMENT FUNCTIONS (Optional)
// ==========================================================================

/**
 * Get regionally-adjusted optimal ranges for specific areas
 * @param {string} property - The property type
 * @param {string} region - The region (e.g., 'pacific_northwest', 'great_plains')
 * @returns {Object} - Adjusted optimal range
 */
export function getRegionalOptimal(property, region = 'default') {
  const baseOptimal = soilPropertyMetadata[property]?.optimal;
  if (!baseOptimal) return null;
  
  const regionalAdjustments = {
    pacific_northwest: {
      om: { min: 3, max: 8 }, // Higher OM typical in PNW
      ph: { min: 5.5, max: 6.8 } // Slightly more acidic optimal
    },
    great_plains: {
      om: { min: 1.5, max: 4 }, // Lower OM in drier regions
      ph: { min: 6.8, max: 8.0 } // More alkaline optimal
    },
    southeast: {
      clay: { min: 10, max: 30 }, // Lower clay optimal in humid regions
      ph: { min: 5.8, max: 7.0 } // Slightly acidic optimal
    }
  };
  
  return regionalAdjustments[region]?.[property] || baseOptimal;
}

// Export default for easier imports
export default {
  soilPropertyRanges,
  soilPropertyMetadata,
  classifyProperty,
  getPropertyStatus,
  calculateSoilQuality,
  getPropertyColor,
  formatPropertyValue,
  generatePropertyLegend,
  getRegionalOptimal
};
