// Conservation Practice Recommendation Engine
// Analyzes field conditions and recommends appropriate NRCS practices

import { CONSERVATION_PRACTICES, FUNDING_PROGRAMS } from '../data/conservationPractices'
import {
  ConservationPractice,
  PracticeRecommendation,
  PracticeImplementationPlan,
  SoilCondition,
  ResourceConcern
} from '../types/conservationPractices'

export interface FieldConditions {
  erosionRate?: number // tons/acre/year
  slope?: number // percent
  drainageClass?: string
  organicMatter?: number // percent
  soilDepth?: number // inches
  floodFrequency?: string
  landCapabilityClass?: string
  hydrologicGroup?: string
  resourceConcerns?: ResourceConcern[]
}

export class ConservationRecommendationEngine {
  
  /**
   * Generate practice recommendations based on field conditions
   */
  static generateRecommendations(
    fieldConditions: FieldConditions,
    fieldAcres: number = 100
  ): PracticeImplementationPlan {
    const conditions = this.identifySoilConditions(fieldConditions)
    const resourceConcerns = fieldConditions.resourceConcerns || this.identifyResourceConcerns(fieldConditions)
    
    const recommendations: PracticeRecommendation[] = []

    // Evaluate each practice
    Object.values(CONSERVATION_PRACTICES).forEach(practice => {
      const score = this.scorePractice(practice, conditions, resourceConcerns)
      
      if (score.priority !== 'low') {
        const estimatedCost = this.estimateCost(practice, fieldAcres)
        
        recommendations.push({
          practice,
          priority: score.priority,
          reason: score.reason,
          estimatedCost,
          estimatedBenefit: score.benefit,
          implementationTimeline: this.getTimeline(practice),
          compatiblePractices: this.findCompatiblePractices(practice.code)
        })
      }
    })

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

    const totalCost = recommendations.reduce((sum, rec) => sum + rec.estimatedCost, 0)
    
    return {
      fieldId: 'current',
      totalCost,
      timeline: this.generateTimeline(recommendations),
      practices: recommendations,
      fundingOptions: this.getFundingOptions(recommendations, totalCost),
      expectedOutcomes: this.projectOutcomes(recommendations, fieldConditions, fieldAcres)
    }
  }

  /**
   * Identify soil conditions from field data
   */
  private static identifySoilConditions(fieldConditions: FieldConditions): SoilCondition[] {
    const conditions: SoilCondition[] = []

    // Erosion risk
    if (fieldConditions.erosionRate && fieldConditions.erosionRate > 5) {
      conditions.push('high-erosion-risk')
    }
    if (fieldConditions.slope && fieldConditions.slope > 8) {
      conditions.push('high-erosion-risk', 'steep-slope')
    }

    // Drainage
    if (fieldConditions.drainageClass) {
      const drainage = fieldConditions.drainageClass.toLowerCase()
      if (drainage.includes('poorly') || drainage.includes('very poorly')) {
        conditions.push('poorly-drained')
      }
      if (drainage.includes('excessively') || drainage.includes('somewhat excessively')) {
        conditions.push('droughty')
      }
    }

    // Soil quality
    if (fieldConditions.organicMatter && fieldConditions.organicMatter < 2.5) {
      conditions.push('low-organic-matter')
    }
    if (fieldConditions.soilDepth && fieldConditions.soilDepth < 20) {
      conditions.push('shallow-soil')
    }

    // Flooding
    if (fieldConditions.floodFrequency && 
        !fieldConditions.floodFrequency.includes('None')) {
      conditions.push('flooding-prone')
    }

    // Hydrologic group
    if (fieldConditions.hydrologicGroup === 'D') {
      conditions.push('poorly-drained', 'flooding-prone')
    }

    return [...new Set(conditions)] // remove duplicates
  }

  /**
   * Identify resource concerns from field conditions
   */
  private static identifyResourceConcerns(fieldConditions: FieldConditions): ResourceConcern[] {
    const concerns: ResourceConcern[] = []

    if (fieldConditions.erosionRate && fieldConditions.erosionRate > 2) {
      concerns.push('soil-erosion')
    }
    if (fieldConditions.organicMatter && fieldConditions.organicMatter < 3) {
      concerns.push('soil-quality')
    }
    if (fieldConditions.drainageClass?.toLowerCase().includes('poorly')) {
      concerns.push('water-quality', 'water-quantity')
    }
    if (fieldConditions.slope && fieldConditions.slope > 5) {
      concerns.push('soil-erosion', 'water-quality')
    }

    return [...new Set(concerns)]
  }

  /**
   * Score a practice based on field conditions
   */
  private static scorePractice(
    practice: ConservationPractice,
    conditions: SoilCondition[],
    resourceConcerns: ResourceConcern[]
  ): { priority: PracticeRecommendation['priority'], reason: string, benefit: string } {
    let score = 0
    let reasons: string[] = []
    let benefits: string[] = []

    // Check suitability for conditions
    const matchingConditions = practice.suitableFor.filter(c => conditions.includes(c))
    score += matchingConditions.length * 3
    
    if (matchingConditions.length > 0) {
      reasons.push(`Addresses ${matchingConditions.join(', ')}`)
    }

    // Check resource concerns
    const matchingConcerns = practice.resourceConcerns.filter(c => resourceConcerns.includes(c))
    score += matchingConcerns.length * 2
    
    if (matchingConcerns.length > 0) {
      reasons.push(`Helps with ${matchingConcerns.join(', ')}`)
    }

    // Add benefits
    practice.benefits.forEach(benefit => {
      if (benefit.quantifiable) {
        benefits.push(`${benefit.description} (${benefit.quantifiable.value}${benefit.quantifiable.unit})`)
      } else {
        benefits.push(benefit.description)
      }
    })

    // Determine priority
    let priority: PracticeRecommendation['priority']
    if (score >= 8) {
      priority = 'critical'
    } else if (score >= 5) {
      priority = 'high'
    } else if (score >= 3) {
      priority = 'medium'
    } else {
      priority = 'low'
    }

    return {
      priority,
      reason: reasons.join('; ') || 'General improvement practice',
      benefit: benefits.slice(0, 2).join('; ')
    }
  }

  /**
   * Estimate cost for practice on field
   */
  private static estimateCost(practice: ConservationPractice, acres: number): number {
    const { min, max, unit } = practice.costRange
    const avgCost = (min + max) / 2

    if (unit === '$/acre') {
      return Math.round(avgCost * acres)
    } else if (unit === '$/structure') {
      // Estimate 1-2 structures per 100 acres
      const structures = Math.ceil(acres / 75)
      return Math.round(avgCost * structures)
    } else {
      // For $/ft, estimate based on field perimeter
      const perimeter = Math.sqrt(acres * 43560) * 4 // rough square approximation
      return Math.round(avgCost * perimeter / 100) // per 100 ft
    }
  }

  /**
   * Get implementation timeline for practice
   */
  private static getTimeline(practice: ConservationPractice): string {
    const category = practice.category
    
    if (category === 'structural') {
      return '3-12 months (planning, permits, construction)'
    } else if (category === 'vegetation') {
      return '1-2 growing seasons for establishment'
    } else if (category === 'tillage' || category === 'crop-management') {
      return 'Begin next planting season'
    } else {
      return '1-6 months'
    }
  }

  /**
   * Find compatible practices
   */
  private static findCompatiblePractices(practiceCode: string): string[] {
    const practice = CONSERVATION_PRACTICES[practiceCode]
    return practice.relatedPractices.filter(code => CONSERVATION_PRACTICES[code])
  }

  /**
   * Generate overall implementation timeline
   */
  private static generateTimeline(recommendations: PracticeRecommendation[]): string {
    if (recommendations.length === 0) return 'No practices recommended'
    
    const critical = recommendations.filter(r => r.priority === 'critical')
    const high = recommendations.filter(r => r.priority === 'high')
    
    if (critical.length > 0) {
      return 'Start critical practices immediately; implement high-priority within 1 year'
    } else if (high.length > 0) {
      return 'Implement high-priority practices within 1 year; others as resources allow'
    } else {
      return 'Implement practices over 2-3 years as resources allow'
    }
  }

  /**
   * Get applicable funding options
   */
  private static getFundingOptions(
    recommendations: PracticeRecommendation[],
    totalCost: number
  ): PracticeImplementationPlan['fundingOptions'] {
    const fundingOptions: PracticeImplementationPlan['fundingOptions'] = []

    // EQIP - most common
    fundingOptions.push({
      ...FUNDING_PROGRAMS.eqip,
      maxAmount: Math.min(FUNDING_PROGRAMS.eqip.maxAmount!, totalCost * 0.75)
    })

    // CSP - for existing conservation
    fundingOptions.push({
      ...FUNDING_PROGRAMS.csp,
      maxAmount: totalCost * 0.5
    })

    // CRP - if vegetation practices recommended
    const hasVegetation = recommendations.some(r => 
      r.practice.category === 'vegetation' || r.practice.code === '340'
    )
    if (hasVegetation) {
      fundingOptions.push({
        ...FUNDING_PROGRAMS.crp,
        maxAmount: totalCost * 0.5
      })
    }

    return fundingOptions
  }

  /**
   * Project expected outcomes
   */
  private static projectOutcomes(
    recommendations: PracticeRecommendation[],
    fieldConditions: FieldConditions,
    acres: number
  ): PracticeImplementationPlan['expectedOutcomes'] {
    const outcomes: PracticeImplementationPlan['expectedOutcomes'] = []

    // Erosion reduction
    const erosionPractices = recommendations.filter(r => 
      r.practice.resourceConcerns.includes('soil-erosion')
    )
    if (erosionPractices.length > 0 && fieldConditions.erosionRate) {
      const currentErosion = fieldConditions.erosionRate
      const avgReduction = erosionPractices.reduce((sum, p) => {
        const erosionBenefit = p.practice.benefits.find(b => b.type === 'erosion-reduction')
        return sum + (erosionBenefit?.quantifiable?.value || 50)
      }, 0) / erosionPractices.length
      
      const projectedErosion = currentErosion * (1 - avgReduction / 100)
      
      outcomes.push({
        metric: 'Soil Erosion Rate',
        baseline: currentErosion,
        projected: Math.round(projectedErosion * 10) / 10,
        unit: 'tons/acre/year',
        timeframe: '2-3 years after implementation'
      })
    }

    // Soil organic matter
    const soilHealthPractices = recommendations.filter(r =>
      r.practice.benefits.some(b => b.type === 'soil-health-improvement')
    )
    if (soilHealthPractices.length > 0 && fieldConditions.organicMatter) {
      outcomes.push({
        metric: 'Soil Organic Matter',
        baseline: fieldConditions.organicMatter,
        projected: Math.min(fieldConditions.organicMatter + 0.5, 5.0),
        unit: '%',
        timeframe: '5 years'
      })
    }

    // Water infiltration
    const waterPractices = recommendations.filter(r =>
      r.practice.resourceConcerns.includes('water-quantity')
    )
    if (waterPractices.length > 0) {
      outcomes.push({
        metric: 'Water Infiltration Rate',
        baseline: 100,
        projected: 130,
        unit: '% of current',
        timeframe: '2-3 years'
      })
    }

    // Cost savings
    const costSavingPractices = recommendations.filter(r =>
      r.practice.benefits.some(b => b.type === 'cost-savings')
    )
    if (costSavingPractices.length > 0) {
      outcomes.push({
        metric: 'Annual Operating Costs',
        baseline: 0,
        projected: -1500,
        unit: '$/year savings',
        timeframe: 'Ongoing after establishment'
      })
    }

    return outcomes
  }

  /**
   * Get practices by category
   */
  static getPracticesByCategory(category: ConservationPractice['category']): ConservationPractice[] {
    return Object.values(CONSERVATION_PRACTICES).filter(p => p.category === category)
  }

  /**
   * Search practices by keyword
   */
  static searchPractices(keyword: string): ConservationPractice[] {
    const lower = keyword.toLowerCase()
    return Object.values(CONSERVATION_PRACTICES).filter(p =>
      p.name.toLowerCase().includes(lower) ||
      p.description.toLowerCase().includes(lower) ||
      p.purpose.some(pur => pur.toLowerCase().includes(lower))
    )
  }

  /**
   * Get practice details by code
   */
  static getPracticeByCode(code: string): ConservationPractice | null {
    return CONSERVATION_PRACTICES[code] || null
  }
}
