// utils/resourceConcernAnalysis.ts
import { AssessedIndicator, ResourceConcern } from '../types/soilHealth';
import { soilHealthIndicators } from '../data/soilHealthIndicators';

// Resource Concern Definitions from NRCS Technical Note 450-06
export const RESOURCE_CONCERNS = {
  CPT: { 
    name: 'Compaction', 
    description: 'Soil compaction limiting root growth and water movement',
    practices: [328, 329, 334, 340, 345, 511, 528, 808]
  },
  SOM: { 
    name: 'Soil Organic Matter Depletion', 
    description: 'Loss of soil organic matter affecting soil function',
    practices: [311, 327, 328, 329, 340, 345, 512, 528, 590, 808]
  },
  AGG: { 
    name: 'Aggregate Instability', 
    description: 'Poor soil aggregate stability affecting structure',
    practices: [311, 328, 329, 333, 334, 340, 345, 511, 528, 590, 595, 808]
  },
  HAB: { 
    name: 'Soil Organism Habitat Loss or Degradation', 
    description: 'Degraded habitat for beneficial soil organisms',
    practices: [311, 328, 329, 340, 345, 484, 511, 528, 590, 595, 808]
  }
};

/**
 * Analyze resource concerns using NRCS decision tree logic
 * Based on Technical Note 450-06
 */
export function analyzeResourceConcerns(indicators: AssessedIndicator[]): ResourceConcern[] {
  const concerns: ResourceConcern[] = [];
  
  // Convert to map for easier lookup
  const indicatorMap = new Map(indicators.map(i => [i.id, i]));
  
  // 1. Compaction Analysis
  // Decision rule: Platy structure present OR 2+ failed indicators
  const compactionIndicators = [
    'ponding_infiltration',
    'penetration_resistance',
    'water_stable_aggregates',
    'soil_structure',
    'plant_root_health'
  ];
  
  const compactionFailed = compactionIndicators.filter(id => {
    const indicator = indicatorMap.get(id);
    return indicator?.meets_criteria === false;
  });
  
  // Check for platy structure in notes
  const structureIndicator = indicatorMap.get('soil_structure');
  const hasPlaty = structureIndicator?.notes?.toLowerCase().includes('platy') || false;
  
  if (hasPlaty || compactionFailed.length >= 2) {
    const severity = compactionFailed.length >= 3 ? 'severe' : compactionFailed.length >= 2 ? 'moderate' : 'minor';
    concerns.push({
      type: 'compaction',
      severity,
      indicators_failed: compactionFailed.map(id => 
        soilHealthIndicators.find(i => i.id === id)?.name || id
      ),
      treatment_needed: true,
      priority: severity === 'severe' ? 'high' : severity === 'moderate' ? 'medium' : 'low',
      description: getCompactionDescription(severity, compactionFailed, hasPlaty)
    });
  }
  
  // 2. SOM Depletion Analysis
  // Decision rule: 3+ failed indicators from SOM category
  const somIndicators = [
    'soil_cover',
    'residue_breakdown',
    'water_stable_aggregates',
    'soil_structure',
    'soil_color',
    'plant_root_health',
    'earthworm_presence',
    'biopores'
  ];
  
  const somFailed = somIndicators.filter(id => {
    const indicator = indicatorMap.get(id);
    return indicator?.meets_criteria === false;
  });
  
  if (somFailed.length >= 3) {
    const severity = somFailed.length >= 5 ? 'severe' : somFailed.length >= 3 ? 'moderate' : 'minor';
    concerns.push({
      type: 'organic_matter_depletion',
      severity,
      indicators_failed: somFailed.map(id => 
        soilHealthIndicators.find(i => i.id === id)?.name || id
      ),
      treatment_needed: true,
      priority: severity === 'severe' ? 'high' : severity === 'moderate' ? 'medium' : 'low',
      description: getOrganicMatterDescription(severity, somFailed)
    });
  }
  
  // 3. Aggregate Instability Analysis
  // Decision rule: Water-stable aggregates failed OR 2+ failed indicators
  const aggregateIndicators = [
    'soil_cover',
    'surface_crusting',
    'ponding_infiltration',
    'water_stable_aggregates',
    'soil_structure',
    'plant_root_health',
    'earthworm_presence',
    'biopores'
  ];
  
  const aggregateFailed = aggregateIndicators.filter(id => {
    const indicator = indicatorMap.get(id);
    return indicator?.meets_criteria === false;
  });
  
  const aggregateInstability = indicatorMap.get('water_stable_aggregates')?.meets_criteria === false;
  
  if (aggregateInstability || aggregateFailed.length >= 2) {
    const severity = aggregateFailed.length >= 4 ? 'severe' : aggregateFailed.length >= 2 ? 'moderate' : 'minor';
    concerns.push({
      type: 'aggregate_instability',
      severity,
      indicators_failed: aggregateFailed.map(id => 
        soilHealthIndicators.find(i => i.id === id)?.name || id
      ),
      treatment_needed: true,
      priority: severity === 'severe' ? 'high' : severity === 'moderate' ? 'medium' : 'low',
      description: getAggregateDescription(severity, aggregateFailed)
    });
  }
  
  // 4. Habitat Loss Analysis
  // Decision rule: 2+ failed biological/habitat indicators
  const habitatIndicators = [
    'soil_cover',
    'residue_breakdown',
    'surface_crusting',
    'water_stable_aggregates',
    'soil_structure',
    'plant_root_health',
    'earthworm_presence',
    'biopores'
  ];
  
  const habitatFailed = habitatIndicators.filter(id => {
    const indicator = indicatorMap.get(id);
    return indicator?.meets_criteria === false;
  });
  
  if (habitatFailed.length >= 2) {
    const severity = habitatFailed.length >= 4 ? 'severe' : habitatFailed.length >= 2 ? 'moderate' : 'minor';
    concerns.push({
      type: 'soil_organism_habitat',
      severity,
      indicators_failed: habitatFailed.map(id => 
        soilHealthIndicators.find(i => i.id === id)?.name || id
      ),
      treatment_needed: true,
      priority: severity === 'severe' ? 'high' : severity === 'moderate' ? 'medium' : 'low',
      description: getSoilOrganismHabitatDescription(severity, habitatFailed)
    });
  }
  
  return concerns;
}

function getCompactionDescription(severity: string, failedIndicators: string[], hasPlaty: boolean): string {
  const descriptions = {
    severe: `Severe soil compaction detected${hasPlaty ? ' with platy structure present' : ''}. This is significantly limiting root growth, water infiltration, and air exchange. Immediate intervention recommended.`,
    moderate: `Moderate soil compaction issues${hasPlaty ? ' with platy structure present' : ''}. Root development and water movement are being restricted. Management changes should be implemented within the growing season.`,
    minor: `Minor compaction concerns detected. Monitor conditions and consider preventive practices during the next management cycle.`
  };
  
  return descriptions[severity as keyof typeof descriptions] || descriptions.moderate;
}

function getOrganicMatterDescription(severity: string, failedIndicators: string[]): string {
  const descriptions = {
    severe: 'Severe organic matter depletion detected. Multiple indicators suggest very low soil organic matter levels affecting all aspects of soil function including nutrient cycling, water holding capacity, and biological activity. Priority management changes needed.',
    moderate: 'Moderate organic matter concerns. Several indicators suggest declining soil organic matter or biological activity. Implement practices to build SOM within the current growing season.',
    minor: 'Minor organic matter concerns detected. Consider practices to maintain or gradually build soil organic matter levels.'
  };
  
  return descriptions[severity as keyof typeof descriptions] || descriptions.moderate;
}

function getAggregateDescription(severity: string, failedIndicators: string[]): string {
  const descriptions = {
    severe: 'Severe aggregate instability detected. Poor soil structure is significantly limiting water infiltration, root penetration, and overall soil function. Immediate management changes recommended.',
    moderate: 'Moderate aggregate stability concerns. Some soil structure limitations are affecting water movement and root growth. Implement aggregate-building practices soon.',
    minor: 'Minor soil structure concerns. Monitor aggregate stability and consider structure-building practices in next management cycle.'
  };
  
  return descriptions[severity as keyof typeof descriptions] || descriptions.moderate;
}

function getSoilOrganismHabitatDescription(severity: string, failedIndicators: string[]): string {
  const descriptions = {
    severe: 'Severe soil organism habitat limitations. Multiple indicators suggest poor biological activity and significantly limited habitat for beneficial organisms including earthworms, fungi, and bacteria. This affects nutrient cycling and soil structure.',
    moderate: 'Moderate biological activity concerns. Some limitations detected in soil organism habitat and activity. Practices to enhance biological diversity should be implemented.',
    minor: 'Minor biological concerns detected. Consider practices to enhance soil biological activity and maintain good habitat conditions.'
  };
  
  return descriptions[severity as keyof typeof descriptions] || descriptions.moderate;
}

export function calculateOverallSoilHealthScore(indicators: AssessedIndicator[]): number {
  const assessedIndicators = indicators.filter(i => i.meets_criteria !== null);
  const passedIndicators = assessedIndicators.filter(i => i.meets_criteria === true);
  
  if (assessedIndicators.length === 0) {
    return 0;
  }
  
  return Math.round((passedIndicators.length / assessedIndicators.length) * 100);
}

