// utils/practiceRecommendations.ts
import { ResourceConcern, PracticeRecommendation } from '../types/soilHealth';

export function generatePracticeRecommendations(resourceConcerns: ResourceConcern[]): PracticeRecommendation[] {
  const recommendations: PracticeRecommendation[] = [];
  const priorityConcerns = resourceConcerns.filter(rc => rc.treatment_needed);
  
  for (const concern of priorityConcerns) {
    const practices = getPracticesForConcern(concern);
    recommendations.push(...practices);
  }
  
  // Remove duplicates and sort by priority
  const uniqueRecommendations = removeDuplicatePractices(recommendations);
  return uniqueRecommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

function getPracticesForConcern(concern: ResourceConcern): PracticeRecommendation[] {
  const practices: PracticeRecommendation[] = [];
  
  switch (concern.type) {
    case 'compaction':
      practices.push(...getCompactionPractices(concern.severity));
      break;
    case 'organic_matter_depletion':
      practices.push(...getOrganicMatterPractices(concern.severity));
      break;
    case 'aggregate_instability':
      practices.push(...getAggregatePractices(concern.severity));
      break;
    case 'soil_organism_habitat':
      practices.push(...getBiologicalPractices(concern.severity));
      break;
  }
  
  return practices;
}

function getCompactionPractices(severity: string): PracticeRecommendation[] {
  const practices: PracticeRecommendation[] = [
    {
      practice_code: '329',
      practice_name: 'Residue and Tillage Management, No-Till',
      description: 'Managing the amount, orientation, and distribution of crop and other plant residue on the soil surface year-round, while limiting soil disturbance to the minimum necessary for crop production.',
      addresses_concerns: ['compaction'],
      priority: severity === 'severe' ? 'high' : 'medium',
      implementation_notes: 'Reduces soil compaction by eliminating tillage operations. Maintains soil structure and improves aggregate stability.',
      timeframe: 'Immediate - can be implemented in current cropping season',
    },
    {
      practice_code: '328',
      practice_name: 'Conservation Crop Rotation',
      description: 'Growing crops in a planned sequence on the same field to improve soil health, optimize nutrients in the soil, and manage plant pests.',
      addresses_concerns: ['compaction'],
      priority: 'medium',
      implementation_notes: 'Include crops with different rooting patterns to help break compaction layers naturally.',
      timeframe: 'Long-term - plan for next growing season',
    },
    {
      practice_code: '340',
      practice_name: 'Cover Crop',
      description: 'Crops including grasses, legumes, forbs, or other herbaceous plants established for seasonal cover and other conservation purposes.',
      addresses_concerns: ['compaction'],
      priority: severity === 'severe' ? 'high' : 'medium',
      implementation_notes: 'Use cover crops with deep taproots to help alleviate compaction. Radishes and tillage radish are particularly effective.',
      timeframe: 'Next planting window - fall or spring establishment',
    }
  ];

  if (severity === 'severe') {
    practices.push({
      practice_code: '324',
      practice_name: 'Deep Tillage',
      description: 'Tillage operations that shatter or mix the soil to depths greater than typically conducted under conventional tillage systems.',
      addresses_concerns: ['compaction'],
      priority: 'high',
      implementation_notes: 'Use only when compaction is severe and other practices are insufficient. Should be combined with traffic management and cover crops.',
      timeframe: 'As soon as soil conditions permit - avoid wet conditions',
    });
  }

  return practices;
}

function getOrganicMatterPractices(severity: string): PracticeRecommendation[] {
  return [
    {
      practice_code: '340',
      practice_name: 'Cover Crop',
      description: 'Crops including grasses, legumes, forbs, or other herbaceous plants established for seasonal cover and other conservation purposes.',
      addresses_concerns: ['organic_matter_depletion'],
      priority: 'high',
      implementation_notes: 'Use diverse cover crop mixes to maximize organic matter inputs. Include both grasses and legumes for balanced nutrition.',
      timeframe: 'Next planting window - plan for fall or spring establishment',
    },
    {
      practice_code: '329',
      practice_name: 'Residue and Tillage Management, No-Till',
      description: 'Managing crop residue on the soil surface while limiting soil disturbance.',
      addresses_concerns: ['organic_matter_depletion'],
      priority: 'high',
      implementation_notes: 'Maintain crop residue on surface to protect organic matter from oxidation and provide organic inputs.',
      timeframe: 'Immediate - can be implemented in current cropping season',
    },
    {
      practice_code: '590',
      practice_name: 'Nutrient Management',
      description: 'Managing the amount, source, placement, form, and timing of the application of nutrients and soil amendments.',
      addresses_concerns: ['organic_matter_depletion'],
      priority: 'medium',
      implementation_notes: 'Include organic amendments such as compost or manure to build soil organic matter while meeting crop nutrient needs.',
      timeframe: 'Next fertilizer application timing',
    },
    {
      practice_code: '328',
      practice_name: 'Conservation Crop Rotation',
      description: 'Growing crops in a planned sequence to improve soil health and optimize nutrients.',
      addresses_concerns: ['organic_matter_depletion'],
      priority: 'medium',
      implementation_notes: 'Include perennial crops, high-residue crops, and legumes to increase organic matter inputs.',
      timeframe: 'Long-term - plan for next growing season',
    }
  ];
}

function getAggregatePractices(severity: string): PracticeRecommendation[] {
  return [
    {
      practice_code: '340',
      practice_name: 'Cover Crop',
      description: 'Establishing cover crops to improve soil structure and aggregate stability.',
      addresses_concerns: ['aggregate_instability'],
      priority: 'high',
      implementation_notes: 'Use cover crops with fibrous root systems to improve soil aggregation. Grasses are particularly effective for building stable aggregates.',
      timeframe: 'Next planting window - fall or spring establishment',
    },
    {
      practice_code: '329',
      practice_name: 'Residue and Tillage Management, No-Till',
      description: 'Maintaining soil structure by avoiding tillage operations that destroy aggregates.',
      addresses_concerns: ['aggregate_instability'],
      priority: 'high',
      implementation_notes: 'Eliminate tillage to preserve existing soil structure and allow natural aggregation processes.',
      timeframe: 'Immediate - can be implemented in current cropping season',
    },
    {
      practice_code: '590',
      practice_name: 'Nutrient Management',
      description: 'Managing nutrients to support biological processes that create stable aggregates.',
      addresses_concerns: ['aggregate_instability'],
      priority: 'medium',
      implementation_notes: 'Include calcium and organic amendments to improve aggregate stability. Avoid excess nitrogen that can destabilize aggregates.',
      timeframe: 'Next fertilizer application timing',
    }
  ];
}

function getBiologicalPractices(severity: string): PracticeRecommendation[] {
  return [
    {
      practice_code: '340',
      practice_name: 'Cover Crop',
      description: 'Providing habitat and food sources for beneficial soil organisms.',
      addresses_concerns: ['soil_organism_habitat'],
      priority: 'high',
      implementation_notes: 'Use diverse cover crop species to provide varied root exudates and habitat. Include both grasses and broadleaves.',
      timeframe: 'Next planting window - fall or spring establishment',
    },
    {
      practice_code: '329',
      practice_name: 'Residue and Tillage Management, No-Till',
      description: 'Protecting soil organism habitat by minimizing soil disturbance.',
      addresses_concerns: ['soil_organism_habitat'],
      priority: 'high',
      implementation_notes: 'Maintain undisturbed soil environment to protect fungal networks and soil organism communities.',
      timeframe: 'Immediate - can be implemented in current cropping season',
    },
    {
      practice_code: '590',
      practice_name: 'Nutrient Management',
      description: 'Supporting soil biological activity through balanced nutrition and organic inputs.',
      addresses_concerns: ['soil_organism_habitat'],
      priority: 'medium',
      implementation_notes: 'Include organic amendments and avoid practices that harm beneficial soil organisms (excessive tillage, high salt fertilizers).',
      timeframe: 'Next fertilizer application timing',
    },
    {
      practice_code: '328',
      practice_name: 'Conservation Crop Rotation',
      description: 'Providing diverse food sources and habitat for soil organisms through crop diversity.',
      addresses_concerns: ['soil_organism_habitat'],
      priority: 'medium',
      implementation_notes: 'Include diverse crop types with different root structures and exudates to support varied soil organism communities.',
      timeframe: 'Long-term - plan for next growing season',
    }
  ];
}

function removeDuplicatePractices(practices: PracticeRecommendation[]): PracticeRecommendation[] {
  const uniquePractices = new Map<string, PracticeRecommendation>();
  
  for (const practice of practices) {
    const existing = uniquePractices.get(practice.practice_code);
    if (!existing) {
      uniquePractices.set(practice.practice_code, practice);
    } else {
      // Merge concerns and keep highest priority
      existing.addresses_concerns = [
        ...new Set([...existing.addresses_concerns, ...practice.addresses_concerns])
      ];
      if (practice.priority === 'high' || (practice.priority === 'medium' && existing.priority === 'low')) {
        existing.priority = practice.priority;
      }
    }
  }
  
  return Array.from(uniquePractices.values());
}

export function getPracticesByPriority(recommendations: PracticeRecommendation[], priority: 'high' | 'medium' | 'low'): PracticeRecommendation[] {
  return recommendations.filter(rec => rec.priority === priority);
}

export function getPracticesForConcernType(recommendations: PracticeRecommendation[], concernType: string): PracticeRecommendation[] {
  return recommendations.filter(rec => rec.addresses_concerns.includes(concernType));
}
