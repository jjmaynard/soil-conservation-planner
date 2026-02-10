// Practice Recommendations Component - Conservation Practices Matched to Concerns

'use client'

import { CheckCircle, Target, TrendingUp, DollarSign, Clock } from 'lucide-react'
import type { EnhancedFieldData } from '#hooks/useComprehensiveFieldAssessment'

interface PracticeRecommendationsProps {
  geeData?: EnhancedFieldData | null
  compact?: boolean
}

interface Practice {
  code: string
  name: string
  category: 'Structural' | 'Vegetative' | 'Management' | 'Cultural'
  effectiveness: 'High' | 'Moderate' | 'Low'
  addressedConcerns: string[]
  benefits: string[]
  implementation: 'Immediate' | 'Seasonal' | 'Long-term'
  costLevel: 'Low' | 'Medium' | 'High'
  priority: number
}

export default function PracticeRecommendations({ geeData, compact = false }: PracticeRecommendationsProps) {
  const getRecommendations = (): Practice[] => {
    if (!geeData?.combined) return []

    const practices: Practice[] = []
    const { combined } = geeData

    // Track which concerns are present
    const hasErosion = (combined.erosion.high_risk_area_pct || 0) > 10
    const hasPonding = (combined.drainage.gee_ponding_risk_pct || 0) > 10
    const hasGully = (combined.concentrated_flow.gully_risk_pct || 0) > 5
    const hasDrought = (combined.drought_risk.water_balance_mm || 0) < -50
    const hasYieldGap = (combined.productivity.yield_gap_pct || 0) > 15
    const hasSoilQuality = (combined.svi.surface_loss_mean || 0) > 0.5

    // Cover Crops (340) - Universal benefit
    if (hasErosion || hasDrought || hasYieldGap || hasSoilQuality) {
      const concerns = []
      if (hasErosion) concerns.push('Sheet & Rill Erosion')
      if (hasDrought) concerns.push('Water Deficit')
      if (hasYieldGap) concerns.push('Productivity')
      if (hasSoilQuality) concerns.push('Soil Quality')
      
      practices.push({
        code: '340',
        name: 'Cover Crops',
        category: 'Vegetative',
        effectiveness: 'High',
        addressedConcerns: concerns,
        benefits: [
          'Reduces erosion by 50-90%',
          'Improves soil organic matter',
          'Enhances water infiltration',
          'Provides living cover year-round'
        ],
        implementation: 'Seasonal',
        costLevel: 'Medium',
        priority: concerns.length * 2
      })
    }

    // Contour Farming (330)
    if (hasErosion && (combined.erosion.high_risk_area_pct || 0) > 15) {
      practices.push({
        code: '330',
        name: 'Contour Farming',
        category: 'Cultural',
        effectiveness: 'High',
        addressedConcerns: ['Sheet & Rill Erosion'],
        benefits: [
          'Reduces erosion by 30-50%',
          'Improves water distribution',
          'Low cost implementation',
          'Works on slopes 2-8%'
        ],
        implementation: 'Immediate',
        costLevel: 'Low',
        priority: 8
      })
    }

    // Terraces (600)
    if (hasErosion && (combined.erosion.high_risk_area_pct || 0) > 25) {
      practices.push({
        code: '600',
        name: 'Terraces',
        category: 'Structural',
        effectiveness: 'High',
        addressedConcerns: ['Sheet & Rill Erosion', 'Concentrated Flow'],
        benefits: [
          'Reduces erosion by 60-90%',
          'Breaks up long slopes',
          'Intercepts runoff',
          'Long-lasting solution'
        ],
        implementation: 'Long-term',
        costLevel: 'High',
        priority: 9
      })
    }

    // Grassed Waterway (412)
    if (hasGully) {
      practices.push({
        code: '412',
        name: 'Grassed Waterway',
        category: 'Vegetative',
        effectiveness: 'High',
        addressedConcerns: ['Concentrated Flow', 'Gully Formation'],
        benefits: [
          'Stabilizes drainage channels',
          'Reduces gully erosion by 70-95%',
          'Protects water quality',
          'Provides wildlife habitat'
        ],
        implementation: 'Seasonal',
        costLevel: 'Medium',
        priority: 8
      })
    }

    // Drainage Water Management (554)
    if (hasPonding && (combined.drainage.gee_ponding_risk_pct || 0) > 15) {
      practices.push({
        code: '554',
        name: 'Drainage Water Management',
        category: 'Structural',
        effectiveness: 'High',
        addressedConcerns: ['Ponding', 'Poor Drainage'],
        benefits: [
          'Controls water table depth',
          'Reduces nutrient loss',
          'Improves trafficability',
          'Maintains soil moisture'
        ],
        implementation: 'Long-term',
        costLevel: 'High',
        priority: 7
      })
    }

    // Residue Management (329)
    if (hasSoilQuality || hasErosion) {
      const concerns = []
      if (hasSoilQuality) concerns.push('Soil Vulnerability')
      if (hasErosion) concerns.push('Sheet & Rill Erosion')
      
      practices.push({
        code: '329',
        name: 'Residue and Tillage Management',
        category: 'Management',
        effectiveness: 'High',
        addressedConcerns: concerns,
        benefits: [
          'Maintains 30%+ residue cover',
          'Reduces soil disturbance',
          'Improves soil structure',
          'Cost-effective solution'
        ],
        implementation: 'Immediate',
        costLevel: 'Low',
        priority: 7
      })
    }

    // Nutrient Management (590)
    if (hasYieldGap) {
      practices.push({
        code: '590',
        name: 'Nutrient Management',
        category: 'Management',
        effectiveness: 'High',
        addressedConcerns: ['Below-Average Productivity'],
        benefits: [
          'Optimizes fertilizer efficiency',
          'Reduces nutrient loss',
          'Improves crop yields',
          'Protects water quality'
        ],
        implementation: 'Immediate',
        costLevel: 'Low',
        priority: 6
      })
    }

    // Irrigation System/Management (442)
    if (hasDrought && (combined.drought_risk.water_balance_mm || 0) < -100) {
      practices.push({
        code: '442',
        name: 'Irrigation System',
        category: 'Structural',
        effectiveness: 'High',
        addressedConcerns: ['Water Deficit', 'Drought'],
        benefits: [
          'Ensures adequate water supply',
          'Reduces drought risk',
          'Stabilizes yields',
          'Improves crop quality'
        ],
        implementation: 'Long-term',
        costLevel: 'High',
        priority: hasDrought ? 8 : 5
      })
    }

    // Conservation Crop Rotation (328)
    if (hasYieldGap || hasSoilQuality) {
      const concerns = []
      if (hasYieldGap) concerns.push('Productivity')
      if (hasSoilQuality) concerns.push('Soil Quality')
      
      practices.push({
        code: '328',
        name: 'Conservation Crop Rotation',
        category: 'Management',
        effectiveness: 'Moderate',
        addressedConcerns: concerns,
        benefits: [
          'Breaks pest cycles',
          'Improves soil health',
          'Diversifies income',
          'Enhances resilience'
        ],
        implementation: 'Seasonal',
        costLevel: 'Low',
        priority: 6
      })
    }

    // Sort by priority (highest first)
    return practices.sort((a, b) => b.priority - a.priority)
  }

  const getEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness) {
      case 'High':
        return { bg: '#dcfce7', text: '#166534', border: '#86efac' }
      case 'Moderate':
        return { bg: '#fef3c7', text: '#92400e', border: '#fde68a' }
      case 'Low':
        return { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' }
      default:
        return { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' }
    }
  }

  const getCostColor = (cost: string) => {
    switch (cost) {
      case 'Low':
        return '#16a34a'
      case 'Medium':
        return '#f59e0b'
      case 'High':
        return '#dc2626'
      default:
        return '#6b7280'
    }
  }

  const getImplementationColor = (impl: string) => {
    switch (impl) {
      case 'Immediate':
        return '#16a34a'
      case 'Seasonal':
        return '#f59e0b'
      case 'Long-term':
        return '#3b82f6'
      default:
        return '#6b7280'
    }
  }

  const practices = getRecommendations()

  if (practices.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-600" />
        <p className="text-sm font-medium text-gray-900">No Priority Practices</p>
        <p className="text-xs text-gray-600 mt-1">Continue current management</p>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {practices.slice(0, 5).map((practice) => {
          const colors = getEffectivenessColor(practice.effectiveness)
          return (
            <div 
              key={practice.code} 
              className="p-3 rounded-lg border"
              style={{ backgroundColor: colors.bg, borderColor: colors.border }}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1">
                  <div className="text-sm font-semibold" style={{ color: colors.text }}>
                    {practice.name} ({practice.code})
                  </div>
                  <div className="text-xs mt-1" style={{ color: colors.text }}>
                    {practice.addressedConcerns.join(', ')}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">Recommended Conservation Practices</h3>
        <span className="text-xs text-gray-600">{practices.length} practices</span>
      </div>

      {/* Practices List */}
      <div className="space-y-3">
        {practices.map((practice) => {
          const colors = getEffectivenessColor(practice.effectiveness)
          return (
            <div 
              key={practice.code} 
              className="border rounded-xl p-4 transition-all hover:shadow-lg"
              style={{ backgroundColor: '#ffffff', borderColor: colors.border }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-base font-bold text-gray-900">
                      {practice.name}
                    </h4>
                    <span className="text-xs font-mono text-gray-500">
                      ({practice.code})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="px-2 py-0.5 rounded bg-gray-100">{practice.category}</span>
                  </div>
                </div>
                
                <div 
                  className="flex-shrink-0 px-3 py-1 rounded-lg text-xs font-semibold"
                  style={{ backgroundColor: colors.bg, color: colors.text }}
                >
                  {practice.effectiveness} Effectiveness
                </div>
              </div>

              {/* Addressed Concerns */}
              <div className="mb-3">
                <div className="text-xs font-semibold text-gray-700 mb-1">Addresses:</div>
                <div className="flex flex-wrap gap-1">
                  {practice.addressedConcerns.map((concern, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{ backgroundColor: '#e0f2fe', color: '#075985' }}
                    >
                      <Target className="w-3 h-3 inline mr-1" />
                      {concern}
                    </span>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="mb-3">
                <div className="text-xs font-semibold text-gray-700 mb-1">Key Benefits:</div>
                <ul className="space-y-1">
                  {practice.benefits.map((benefit, idx) => (
                    <li key={idx} className="text-xs text-gray-700 flex items-start gap-1">
                      <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: '#16a34a' }} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Implementation Details */}
              <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" style={{ color: getImplementationColor(practice.implementation) }} />
                  <span className="text-xs font-medium" style={{ color: getImplementationColor(practice.implementation) }}>
                    {practice.implementation}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" style={{ color: getCostColor(practice.costLevel) }} />
                  <span className="text-xs font-medium" style={{ color: getCostColor(practice.costLevel) }}>
                    {practice.costLevel} Cost
                  </span>
                </div>
                <div className="flex-1"></div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs font-semibold text-green-700">
                    Priority: {practice.priority}/10
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
