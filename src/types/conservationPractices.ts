// Conservation Practices Type Definitions
// Based on NRCS Conservation Practice Standards

export interface ConservationPractice {
  code: string
  name: string
  category: PracticeCategory
  description: string
  purpose: string[]
  applicability: string
  benefits: Benefit[]
  costRange: CostRange
  maintenanceRequirement: MaintenanceLevel
  lifespan: number // years
  nrcsFinancialSupport: boolean
  implementationSteps: string[]
  relatedPractices: string[] // codes
  resourceConcerns: ResourceConcern[]
  suitableFor: SoilCondition[]
}

export type PracticeCategory = 
  | 'tillage'
  | 'crop-management'
  | 'erosion-control'
  | 'water-management'
  | 'soil-health'
  | 'vegetation'
  | 'structural'
  | 'nutrient-management'

export type ResourceConcern =
  | 'soil-erosion'
  | 'water-quality'
  | 'water-quantity'
  | 'soil-quality'
  | 'plant-health'
  | 'air-quality'
  | 'energy'
  | 'wildlife-habitat'

export type SoilCondition =
  | 'high-erosion-risk'
  | 'poorly-drained'
  | 'compacted'
  | 'low-organic-matter'
  | 'steep-slope'
  | 'shallow-soil'
  | 'droughty'
  | 'flooding-prone'

export type MaintenanceLevel = 'low' | 'moderate' | 'high'

export interface CostRange {
  min: number
  max: number
  unit: '$/acre' | '$/ft' | '$/structure'
  note?: string
}

export interface Benefit {
  type: BenefitType
  description: string
  quantifiable?: {
    value: number
    unit: string
  }
}

export type BenefitType =
  | 'erosion-reduction'
  | 'water-conservation'
  | 'soil-health-improvement'
  | 'yield-increase'
  | 'cost-savings'
  | 'environmental'
  | 'climate-resilience'

export interface PracticeRecommendation {
  practice: ConservationPractice
  priority: 'critical' | 'high' | 'medium' | 'low'
  reason: string
  estimatedCost: number
  estimatedBenefit: string
  implementationTimeline: string
  compatiblePractices: string[]
}

export interface PracticeImplementationPlan {
  fieldId: string
  totalCost: number
  timeline: string
  practices: PracticeRecommendation[]
  fundingOptions: FundingOption[]
  expectedOutcomes: Outcome[]
}

export interface FundingOption {
  program: string
  agency: string
  coveragePercent: number
  maxAmount?: number
  eligibility: string[]
  applicationDeadline?: string
}

export interface Outcome {
  metric: string
  baseline: number
  projected: number
  unit: string
  timeframe: string
}
