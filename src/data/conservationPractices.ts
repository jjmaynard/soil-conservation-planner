// NRCS Conservation Practices Database
// Based on official NRCS Conservation Practice Standards

import { ConservationPractice } from '../types/conservationPractices'

export const CONSERVATION_PRACTICES: Record<string, ConservationPractice> = {
  '329': {
    code: '329',
    name: 'Residue and Tillage Management, No-Till',
    category: 'tillage',
    description: 'Managing the amount, orientation, and distribution of crop and other plant residue on the soil surface year-round while limiting soil-disturbing activities to only those necessary to place nutrients, condition residue, and plant crops.',
    purpose: [
      'Reduce sheet and rill erosion',
      'Reduce soil particulate transport from wind erosion',
      'Improve soil quality and health',
      'Increase plant-available moisture',
    ],
    applicability: 'Cropland where soil disturbance from tillage contributes to degradation',
    benefits: [
      {
        type: 'erosion-reduction',
        description: 'Reduces soil erosion by 50-90%',
        quantifiable: { value: 70, unit: '% reduction' }
      },
      {
        type: 'soil-health-improvement',
        description: 'Increases soil organic matter by 0.1-0.3% annually'
      },
      {
        type: 'water-conservation',
        description: 'Improves water infiltration by 20-40%',
        quantifiable: { value: 30, unit: '% improvement' }
      },
      {
        type: 'cost-savings',
        description: 'Reduces fuel and labor costs by $15-30/acre'
      }
    ],
    costRange: {
      min: 0,
      max: 25,
      unit: '$/acre',
      note: 'Primarily equipment modification and learning curve'
    },
    maintenanceRequirement: 'low',
    lifespan: 999, // continuous practice
    nrcsFinancialSupport: true,
    implementationSteps: [
      'Assess current equipment and modify/purchase no-till planter',
      'Calibrate planter for proper seed placement through residue',
      'Plan crop rotation to maximize residue cover',
      'Monitor and adjust residue management as needed',
      'Control weeds with herbicides or mechanical methods that preserve residue'
    ],
    relatedPractices: ['328', '340', '345', '590'],
    resourceConcerns: ['soil-erosion', 'soil-quality', 'water-quality'],
    suitableFor: ['high-erosion-risk', 'low-organic-matter', 'steep-slope']
  },

  '340': {
    code: '340',
    name: 'Cover Crop',
    category: 'crop-management',
    description: 'Planting of crops including grasses, legumes, forbs, or other herbaceous plants for seasonal cover and other conservation purposes.',
    purpose: [
      'Reduce erosion from wind and water',
      'Increase soil organic matter content',
      'Capture and recycle or redistribute nutrients in the soil profile',
      'Promote biological nitrogen fixation',
      'Increase biodiversity',
      'Suppress weeds',
    ],
    applicability: 'All land where vegetative cover can be established and maintained',
    benefits: [
      {
        type: 'erosion-reduction',
        description: 'Reduces erosion by 60-90% during cover period',
        quantifiable: { value: 75, unit: '% reduction' }
      },
      {
        type: 'soil-health-improvement',
        description: 'Adds 0.5-2 tons/acre of organic matter annually'
      },
      {
        type: 'environmental',
        description: 'Captures 50-200 lbs N/acre, preventing leaching'
      },
      {
        type: 'yield-increase',
        description: 'Can increase subsequent crop yields by 5-15%'
      }
    ],
    costRange: {
      min: 25,
      max: 75,
      unit: '$/acre',
      note: 'Includes seed, planting, and termination costs'
    },
    maintenanceRequirement: 'moderate',
    lifespan: 999,
    nrcsFinancialSupport: true,
    implementationSteps: [
      'Select appropriate cover crop species for goals and climate',
      'Plan planting timing (post-harvest or interseeding)',
      'Prepare seedbed if needed',
      'Plant at recommended seeding rate',
      'Plan termination method and timing',
      'Monitor growth and adjust future plantings'
    ],
    relatedPractices: ['329', '590', '328'],
    resourceConcerns: ['soil-erosion', 'soil-quality', 'water-quality', 'plant-health'],
    suitableFor: ['high-erosion-risk', 'low-organic-matter', 'poorly-drained', 'droughty']
  },

  '600': {
    code: '600',
    name: 'Terraces',
    category: 'structural',
    description: 'An earth embankment, ridge, or channel constructed across a slope to intercept runoff and reduce erosion.',
    purpose: [
      'Reduce sheet and rill erosion',
      'Reduce sedimentation',
      'Improve water quality',
      'Manage runoff to prevent gully formation',
    ],
    applicability: 'Cropland and other areas where runoff causes excessive erosion or sedimentation',
    benefits: [
      {
        type: 'erosion-reduction',
        description: 'Reduces soil loss by 60-85%',
        quantifiable: { value: 70, unit: '% reduction' }
      },
      {
        type: 'water-conservation',
        description: 'Retains water on-site, improving crop moisture'
      },
      {
        type: 'environmental',
        description: 'Prevents sediment delivery to waterways'
      }
    ],
    costRange: {
      min: 150,
      max: 400,
      unit: '$/acre',
      note: 'Varies with slope, spacing, and soil conditions'
    },
    maintenanceRequirement: 'moderate',
    lifespan: 20,
    nrcsFinancialSupport: true,
    implementationSteps: [
      'Conduct topographic survey',
      'Design terrace system (spacing, grade, outlets)',
      'Mark terrace locations in field',
      'Construct terraces with appropriate equipment',
      'Establish vegetation on terrace ridges',
      'Install outlets for water disposal',
      'Conduct annual maintenance inspections'
    ],
    relatedPractices: ['342', '410', '412'],
    resourceConcerns: ['soil-erosion', 'water-quality'],
    suitableFor: ['high-erosion-risk', 'steep-slope']
  },

  '342': {
    code: '342',
    name: 'Critical Area Planting',
    category: 'vegetation',
    description: 'Establishing permanent vegetation on sites that have, or are expected to have, excessive erosion or on sites that have physical, chemical, or biological conditions that prevent the establishment of vegetation with normal practices.',
    purpose: [
      'Stabilize the soil surface',
      'Reduce accelerated erosion',
      'Improve water quality',
      'Enhance visual resources',
      'Provide wildlife habitat',
    ],
    applicability: 'Sites with severe erosion, steep slopes, disturbed areas',
    benefits: [
      {
        type: 'erosion-reduction',
        description: 'Stops active erosion within 1-2 years',
        quantifiable: { value: 95, unit: '% reduction' }
      },
      {
        type: 'environmental',
        description: 'Filters sediment and improves water quality'
      },
      {
        type: 'environmental',
        description: 'Creates wildlife habitat and biodiversity'
      }
    ],
    costRange: {
      min: 500,
      max: 2000,
      unit: '$/acre',
      note: 'Highly variable based on site conditions and methods'
    },
    maintenanceRequirement: 'high',
    lifespan: 20,
    nrcsFinancialSupport: true,
    implementationSteps: [
      'Assess site conditions (soil, slope, moisture)',
      'Select adapted plant species',
      'Prepare site (grading, erosion control)',
      'Apply soil amendments if needed',
      'Plant using appropriate method (seed, plugs, cuttings)',
      'Mulch to protect seedbed',
      'Monitor and replant as needed',
      'Control competing vegetation'
    ],
    relatedPractices: ['412', '484', '643'],
    resourceConcerns: ['soil-erosion', 'water-quality', 'wildlife-habitat'],
    suitableFor: ['high-erosion-risk', 'steep-slope', 'shallow-soil']
  },

  '590': {
    code: '590',
    name: 'Nutrient Management',
    category: 'nutrient-management',
    description: 'Managing the amount, source, placement, form and timing of the application of nutrients and soil amendments.',
    purpose: [
      'Budget and supply nutrients for plant production',
      'Properly utilize manure and organic by-products',
      'Minimize agricultural nonpoint source pollution of surface and groundwater',
      'Maintain or improve physical, chemical, and biological condition of soil',
    ],
    applicability: 'All lands where nutrients or soil amendments are applied',
    benefits: [
      {
        type: 'environmental',
        description: 'Reduces nutrient losses by 30-50%',
        quantifiable: { value: 40, unit: '% reduction' }
      },
      {
        type: 'cost-savings',
        description: 'Optimizes fertilizer use, saving $20-50/acre'
      },
      {
        type: 'water-conservation',
        description: 'Protects water quality from nutrient pollution'
      },
      {
        type: 'yield-increase',
        description: 'Improves crop nutrient availability and yields'
      }
    ],
    costRange: {
      min: 10,
      max: 30,
      unit: '$/acre',
      note: 'Primarily soil testing and planning costs'
    },
    maintenanceRequirement: 'moderate',
    lifespan: 999,
    nrcsFinancialSupport: true,
    implementationSteps: [
      'Conduct soil tests for nutrient levels',
      'Determine realistic yield goals',
      'Calculate nutrient requirements',
      'Account for all nutrient sources (manure, legumes, residue)',
      'Select appropriate nutrient sources and rates',
      'Time applications to match crop uptake',
      'Use proper application methods',
      'Keep records and adjust plan annually'
    ],
    relatedPractices: ['328', '590', '595'],
    resourceConcerns: ['water-quality', 'soil-quality', 'plant-health'],
    suitableFor: ['low-organic-matter', 'poorly-drained', 'flooding-prone']
  },

  '328': {
    code: '328',
    name: 'Conservation Crop Rotation',
    category: 'crop-management',
    description: 'Growing crops in a planned sequence on the same field to manage soil, pests, and nutrients while reducing erosion and improving soil health.',
    purpose: [
      'Reduce sheet, rill, and wind erosion',
      'Maintain or improve soil quality',
      'Manage plant pests (weeds, insects, diseases)',
      'Provide feed and cover for wildlife',
      'Manage plant-available nutrients',
    ],
    applicability: 'All cropland capable of supporting a planned sequence of adapted crops',
    benefits: [
      {
        type: 'soil-health-improvement',
        description: 'Improves soil structure and organic matter'
      },
      {
        type: 'yield-increase',
        description: 'Increases yields by 5-20% vs monoculture',
        quantifiable: { value: 12, unit: '% increase' }
      },
      {
        type: 'cost-savings',
        description: 'Reduces pesticide needs by 30-50%'
      },
      {
        type: 'erosion-reduction',
        description: 'Reduces erosion through diverse root systems'
      }
    ],
    costRange: {
      min: 0,
      max: 15,
      unit: '$/acre',
      note: 'Planning costs; may increase revenue'
    },
    maintenanceRequirement: 'low',
    lifespan: 999,
    nrcsFinancialSupport: true,
    implementationSteps: [
      'Assess soil conditions and limitations',
      'Identify crop options suitable for climate and markets',
      'Design rotation sequence (3+ years recommended)',
      'Include diverse crop types (grasses, legumes, broadleaves)',
      'Plan for residue management between crops',
      'Implement rotation and track results',
      'Adjust rotation based on outcomes'
    ],
    relatedPractices: ['329', '340', '590'],
    resourceConcerns: ['soil-quality', 'soil-erosion', 'plant-health'],
    suitableFor: ['low-organic-matter', 'high-erosion-risk', 'compacted']
  },

  '410': {
    code: '410',
    name: 'Grade Stabilization Structure',
    category: 'structural',
    description: 'A structure used to control the grade and head cutting in natural or artificial channels.',
    purpose: [
      'Stabilize the grade of a channel',
      'Prevent formation or advance of gullies',
      'Prevent erosion in channels',
      'Reduce sediment production',
    ],
    applicability: 'Channels or waterways with active or potential headcutting or grade instability',
    benefits: [
      {
        type: 'erosion-reduction',
        description: 'Stops gully advancement and channel degradation',
        quantifiable: { value: 90, unit: '% reduction' }
      },
      {
        type: 'environmental',
        description: 'Reduces sediment delivery to streams'
      }
    ],
    costRange: {
      min: 2000,
      max: 10000,
      unit: '$/structure',
      note: 'Highly variable based on size and materials'
    },
    maintenanceRequirement: 'moderate',
    lifespan: 15,
    nrcsFinancialSupport: true,
    implementationSteps: [
      'Survey channel and identify critical points',
      'Design structure for site conditions',
      'Obtain necessary permits',
      'Construct structure to specifications',
      'Stabilize disturbed areas with vegetation',
      'Monitor structure performance',
      'Perform routine maintenance'
    ],
    relatedPractices: ['600', '412', '484'],
    resourceConcerns: ['soil-erosion', 'water-quality'],
    suitableFor: ['high-erosion-risk', 'flooding-prone']
  },

  '484': {
    code: '484',
    name: 'Mulching',
    category: 'erosion-control',
    description: 'Applying plant residues or other suitable materials to the soil surface.',
    purpose: [
      'Reduce soil erosion by water and wind',
      'Conserve soil moisture',
      'Moderate soil temperature',
      'Reduce weed competition',
      'Improve plant growth and health',
    ],
    applicability: 'Areas where soil needs protection or where plants need favorable growing conditions',
    benefits: [
      {
        type: 'erosion-reduction',
        description: 'Reduces erosion by 70-95%',
        quantifiable: { value: 85, unit: '% reduction' }
      },
      {
        type: 'water-conservation',
        description: 'Reduces evaporation by 30-50%'
      },
      {
        type: 'soil-health-improvement',
        description: 'Moderates temperature and improves biology'
      }
    ],
    costRange: {
      min: 100,
      max: 500,
      unit: '$/acre',
      note: 'Varies with material type and application rate'
    },
    maintenanceRequirement: 'low',
    lifespan: 1,
    nrcsFinancialSupport: true,
    implementationSteps: [
      'Select appropriate mulch material',
      'Prepare site if needed',
      'Apply mulch at recommended depth (2-4 inches)',
      'Secure mulch if needed for wind or slope',
      'Monitor and replenish as needed',
      'Remove or incorporate at end of life'
    ],
    relatedPractices: ['342', '380', '643'],
    resourceConcerns: ['soil-erosion', 'water-quantity', 'soil-quality'],
    suitableFor: ['high-erosion-risk', 'droughty', 'steep-slope']
  },

  '345': {
    code: '345',
    name: 'Residue and Tillage Management, Mulch Till',
    category: 'tillage',
    description: 'Managing the amount, orientation and distribution of crop and other plant residue on the soil surface year-round, while growing crops in narrow slots or tilled or residue-free strips in previously untilled soil.',
    purpose: [
      'Reduce sheet and rill erosion',
      'Reduce wind erosion',
      'Maintain or increase soil organic matter',
      'Minimize soil compaction',
    ],
    applicability: 'Cropland where soil disturbance from tillage is reduced',
    benefits: [
      {
        type: 'erosion-reduction',
        description: 'Reduces erosion by 40-70%',
        quantifiable: { value: 55, unit: '% reduction' }
      },
      {
        type: 'soil-health-improvement',
        description: 'Improves soil structure and biology'
      },
      {
        type: 'cost-savings',
        description: 'Reduces fuel costs by $10-20/acre'
      }
    ],
    costRange: {
      min: 5,
      max: 20,
      unit: '$/acre',
      note: 'Equipment modification and reduced tillage passes'
    },
    maintenanceRequirement: 'low',
    lifespan: 999,
    nrcsFinancialSupport: true,
    implementationSteps: [
      'Adapt tillage equipment for residue management',
      'Plan tillage operations to maintain 30%+ residue cover',
      'Use zone or strip-till methods',
      'Plant in residue-covered soil',
      'Monitor residue levels',
      'Adjust practices to maintain cover'
    ],
    relatedPractices: ['329', '340', '590'],
    resourceConcerns: ['soil-erosion', 'soil-quality'],
    suitableFor: ['high-erosion-risk', 'low-organic-matter']
  },

  '612': {
    code: '612',
    name: 'Tree/Shrub Establishment',
    category: 'vegetation',
    description: 'Establishing woody plants by planting seedlings or cuttings, direct seeding, and/or natural regeneration.',
    purpose: [
      'Improve air quality by capturing airborne particulates and producing oxygen',
      'Create or improve wildlife habitat',
      'Reduce sheet, rill and wind erosion',
      'Improve aesthetics and visual resources',
      'Sequester carbon',
    ],
    applicability: 'Areas where trees and shrubs are appropriate and can be successfully established',
    benefits: [
      {
        type: 'environmental',
        description: 'Sequesters 2-3 tons CO2/acre/year'
      },
      {
        type: 'environmental',
        description: 'Creates long-term wildlife habitat'
      },
      {
        type: 'erosion-reduction',
        description: 'Provides permanent erosion protection'
      },
      {
        type: 'climate-resilience',
        description: 'Moderates microclimate and reduces wind speeds'
      }
    ],
    costRange: {
      min: 300,
      max: 1500,
      unit: '$/acre',
      note: 'Includes seedlings, planting, and initial care'
    },
    maintenanceRequirement: 'high',
    lifespan: 50,
    nrcsFinancialSupport: true,
    implementationSteps: [
      'Determine objectives and site suitability',
      'Select appropriate species for site and purpose',
      'Prepare planting site',
      'Obtain quality planting stock',
      'Plant at proper time and depth',
      'Protect from browsing/competition',
      'Water during establishment if needed',
      'Monitor and replace failures'
    ],
    relatedPractices: ['380', '391', '650'],
    resourceConcerns: ['soil-erosion', 'wildlife-habitat', 'air-quality'],
    suitableFor: ['high-erosion-risk', 'steep-slope', 'shallow-soil']
  }
}

// Practice categories for filtering and organization
export const PRACTICE_CATEGORIES = {
  tillage: {
    name: 'Tillage Management',
    description: 'Practices that manage soil disturbance and residue',
    icon: 'Truck'
  },
  'crop-management': {
    name: 'Crop Management',
    description: 'Practices involving crop selection and rotation',
    icon: 'Wheat'
  },
  'erosion-control': {
    name: 'Erosion Control',
    description: 'Practices to reduce wind and water erosion',
    icon: 'Shield'
  },
  'water-management': {
    name: 'Water Management',
    description: 'Practices for managing water quantity and quality',
    icon: 'Droplets'
  },
  'soil-health': {
    name: 'Soil Health',
    description: 'Practices to improve soil biological, chemical, and physical properties',
    icon: 'Sprout'
  },
  vegetation: {
    name: 'Vegetation Establishment',
    description: 'Practices involving planting for conservation purposes',
    icon: 'TreePine'
  },
  structural: {
    name: 'Structural Practices',
    description: 'Physical structures for erosion control and water management',
    icon: 'Building2'
  },
  'nutrient-management': {
    name: 'Nutrient Management',
    description: 'Practices for efficient nutrient use',
    icon: 'Beaker'
  }
}

// NRCS funding programs
export const FUNDING_PROGRAMS = {
  eqip: {
    program: 'Environmental Quality Incentives Program (EQIP)',
    agency: 'USDA NRCS',
    coveragePercent: 75,
    maxAmount: 450000,
    eligibility: [
      'Agricultural producers',
      'Forest landowners',
      'Tribal landowners',
      'Organic producers may receive higher rates'
    ],
    applicationDeadline: 'Multiple signup periods annually'
  },
  csp: {
    program: 'Conservation Stewardship Program (CSP)',
    agency: 'USDA NRCS',
    coveragePercent: 50,
    eligibility: [
      'Producers with existing conservation systems',
      'Must meet stewardship threshold',
      'Commit to additional improvements'
    ],
    applicationDeadline: 'Continuous signup with ranking periods'
  },
  crp: {
    program: 'Conservation Reserve Program (CRP)',
    agency: 'USDA FSA',
    coveragePercent: 50,
    eligibility: [
      'Cropland that has been planted 4 of last 6 years',
      'Environmentally sensitive land',
      '10-15 year contracts'
    ],
    applicationDeadline: 'Periodic signups announced by FSA'
  }
}
