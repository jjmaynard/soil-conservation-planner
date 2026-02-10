// Ranked Concerns List Component - Priority-Ranked Resource Concerns

'use client'

import { AlertTriangle, TrendingDown, Droplets, Target, Sprout, Shield } from 'lucide-react'
import type { EnhancedFieldData } from '#hooks/useComprehensiveFieldAssessment'

interface RankedConcernsListProps {
  geeData?: EnhancedFieldData | null
  compact?: boolean
}

interface RankedConcern {
  id: string
  name: string
  category: 'erosion' | 'drainage' | 'flow' | 'drought' | 'productivity' | 'soil_quality'
  priority: number // 1-10 scale
  severity: 'Critical' | 'High' | 'Moderate' | 'Low'
  impactScore: number
  primaryMetric: string
  icon: any
}

export default function RankedConcernsList({ geeData, compact = false }: RankedConcernsListProps) {
  const getConcerns = (): RankedConcern[] => {
    if (!geeData?.combined) return []

    const concerns: RankedConcern[] = []
    const { combined } = geeData

    // Erosion Risk
    const erosionRisk = combined.erosion.high_risk_area_pct || 0
    if (erosionRisk > 5) {
      concerns.push({
        id: 'erosion',
        name: 'Sheet & Rill Erosion',
        category: 'erosion',
        priority: Math.min(10, Math.round(erosionRisk / 10 * 10)),
        severity: erosionRisk > 30 ? 'Critical' : erosionRisk > 20 ? 'High' : erosionRisk > 10 ? 'Moderate' : 'Low',
        impactScore: erosionRisk,
        primaryMetric: `${erosionRisk.toFixed(1)}% high risk area`,
        icon: TrendingDown
      })
    }

    // Ponding/Drainage
    const pondingRisk = combined.drainage.gee_ponding_risk_pct || 0
    if (pondingRisk > 5) {
      concerns.push({
        id: 'ponding',
        name: 'Ponding & Poor Drainage',
        category: 'drainage',
        priority: Math.min(10, Math.round(pondingRisk / 10 * 10)),
        severity: pondingRisk > 25 ? 'Critical' : pondingRisk > 15 ? 'High' : pondingRisk > 8 ? 'Moderate' : 'Low',
        impactScore: pondingRisk,
        primaryMetric: `${pondingRisk.toFixed(1)}% ponding risk`,
        icon: Droplets
      })
    }

    // Concentrated Flow
    const gullyRisk = combined.concentrated_flow.gully_risk_pct || 0
    if (gullyRisk > 3) {
      concerns.push({
        id: 'concentrated_flow',
        name: 'Concentrated Flow & Gullies',
        category: 'flow',
        priority: Math.min(10, Math.round(gullyRisk / 5 * 10)),
        severity: gullyRisk > 15 ? 'Critical' : gullyRisk > 10 ? 'High' : gullyRisk > 5 ? 'Moderate' : 'Low',
        impactScore: gullyRisk,
        primaryMetric: `${gullyRisk.toFixed(1)}% gully risk`,
        icon: Target
      })
    }

    // Drought/Water Deficit
    const waterBalance = combined.drought_risk.water_balance_mm
    if (waterBalance !== null && waterBalance < -30) {
      const deficitScore = Math.min(100, Math.abs(waterBalance) / 2)
      concerns.push({
        id: 'drought',
        name: 'Water Deficit & Drought',
        category: 'drought',
        priority: Math.min(10, Math.round(deficitScore / 10)),
        severity: waterBalance < -150 ? 'Critical' : waterBalance < -100 ? 'High' : waterBalance < -50 ? 'Moderate' : 'Low',
        impactScore: deficitScore,
        primaryMetric: `${waterBalance.toFixed(0)} mm deficit`,
        icon: Droplets
      })
    }

    // Productivity Gap
    const yieldGap = combined.productivity.yield_gap_pct || 0
    if (yieldGap > 10) {
      concerns.push({
        id: 'productivity',
        name: 'Below-Average Productivity',
        category: 'productivity',
        priority: Math.min(10, Math.round(yieldGap / 10 * 5)),
        severity: yieldGap > 35 ? 'High' : yieldGap > 20 ? 'Moderate' : 'Low',
        impactScore: yieldGap,
        primaryMetric: `${yieldGap.toFixed(1)}% yield gap`,
        icon: Sprout
      })
    }

    // Soil Vulnerability (SVI)
    const surfaceLoss = combined.svi.surface_loss_mean || 0
    if (surfaceLoss > 0.4) {
      const sviScore = surfaceLoss * 100
      concerns.push({
        id: 'svi',
        name: 'Soil Vulnerability',
        category: 'soil_quality',
        priority: Math.min(10, Math.round(sviScore / 10)),
        severity: surfaceLoss > 0.7 ? 'High' : surfaceLoss > 0.55 ? 'Moderate' : 'Low',
        impactScore: sviScore,
        primaryMetric: `SVI: ${surfaceLoss.toFixed(2)}`,
        icon: Shield
      })
    }

    // Sort by priority (highest first)
    return concerns.sort((a, b) => b.priority - a.priority)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return { bg: '#7f1d1d', text: '#ffffff', border: '#991b1b' }
      case 'High':
        return { bg: '#dc2626', text: '#ffffff', border: '#b91c1c' }
      case 'Moderate':
        return { bg: '#f59e0b', text: '#ffffff', border: '#d97706' }
      case 'Low':
        return { bg: '#3b82f6', text: '#ffffff', border: '#2563eb' }
      default:
        return { bg: '#6b7280', text: '#ffffff', border: '#4b5563' }
    }
  }

  const concerns = getConcerns()

  if (concerns.length === 0) {
    return (
      <div className="text-center py-8">
        <Shield className="w-12 h-12 mx-auto mb-2 text-green-600" />
        <p className="text-sm font-medium text-gray-900">No Priority Concerns</p>
        <p className="text-xs text-gray-600 mt-1">Field conditions are within acceptable ranges</p>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {concerns.slice(0, 5).map((concern, index) => {
          const colors = getSeverityColor(concern.severity)
          const Icon = concern.icon
          return (
            <div 
              key={concern.id} 
              className="flex items-center gap-2 p-2 rounded-lg border"
              style={{ backgroundColor: '#f9fafb', borderColor: colors.border }}
            >
              <div 
                className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: colors.bg, color: colors.text }}
              >
                {index + 1}
              </div>
              <Icon className="w-4 h-4 flex-shrink-0" style={{ color: colors.bg }} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-900 truncate">{concern.name}</div>
                <div className="text-xs text-gray-600">{concern.primaryMetric}</div>
              </div>
              <div 
                className="flex-shrink-0 px-2 py-1 rounded text-xs font-semibold"
                style={{ backgroundColor: colors.bg, color: colors.text }}
              >
                {concern.severity}
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
        <h3 className="text-sm font-bold text-gray-900">Priority-Ranked Concerns</h3>
        <span className="text-xs text-gray-600">{concerns.length} total</span>
      </div>

      {/* Concerns List */}
      <div className="space-y-2">
        {concerns.map((concern, index) => {
          const colors = getSeverityColor(concern.severity)
          const Icon = concern.icon
          return (
            <div 
              key={concern.id} 
              className="flex items-start gap-3 p-3 rounded-lg border transition-all hover:shadow-md"
              style={{ backgroundColor: '#ffffff', borderColor: colors.border }}
            >
              {/* Rank Badge */}
              <div 
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm"
                style={{ backgroundColor: colors.bg, color: colors.text }}
              >
                {index + 1}
              </div>

              {/* Icon */}
              <div 
                className="flex-shrink-0 p-2 rounded-lg"
                style={{ backgroundColor: `${colors.bg}20` }}
              >
                <Icon className="w-5 h-5" style={{ color: colors.bg }} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-gray-900">{concern.name}</h4>
                  <div 
                    className="flex-shrink-0 px-2 py-1 rounded text-xs font-semibold"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                  >
                    {concern.severity}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span>{concern.primaryMetric}</span>
                  <span>•</span>
                  <span className="capitalize">{concern.category.replace('_', ' ')}</span>
                </div>

                {/* Priority Score Bar */}
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${concern.priority * 10}%`,
                          backgroundColor: colors.bg
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-600">
                      {concern.priority}/10
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
