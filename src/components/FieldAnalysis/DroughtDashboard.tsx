// Drought Dashboard Component - Comprehensive GRIDMET Drought Assessment

'use client'

import { useState, useEffect } from 'react'
import { CloudRain, AlertTriangle, TrendingUp, TrendingDown, Minus, Droplets, Thermometer } from 'lucide-react'
import type { EnhancedFieldData } from '#hooks/useComprehensiveFieldAssessment'

interface DroughtDashboardProps {
  geeData?: EnhancedFieldData | null
  fieldId?: string
}

interface DroughtCondition {
  timeframe: string
  period: string
  status: 'Normal' | 'Dry' | 'Moderate Drought' | 'Severe Drought' | 'Extreme Drought'
  icon: any
  description: string
  relevantFor: string[]
}

export default function DroughtDashboard({ geeData, fieldId }: DroughtDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [droughtData, setDroughtData] = useState<any>(null)

  useEffect(() => {
    loadDroughtData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geeData, fieldId])

  const loadDroughtData = async () => {
    setLoading(true)
    try {
      // Try to get data from props or session storage
      let assessmentData = geeData
      if (!assessmentData) {
        const stored = sessionStorage.getItem('comprehensiveFieldAssessment')
        if (stored) {
          assessmentData = JSON.parse(stored) as EnhancedFieldData
        }
      }

      if (assessmentData?.geeAssessment?.drought) {
        setDroughtData(assessmentData.geeAssessment.drought)
      } else {
        setDroughtData(null)
      }
    } catch (error) {
      console.error('Error loading drought data:', error)
      setDroughtData(null)
    } finally {
      setLoading(false)
    }
  }

  const getPDSICategory = (pdsi: number): string => {
    if (pdsi >= 4) return 'Extremely Wet'
    if (pdsi >= 3) return 'Very Wet'
    if (pdsi >= 2) return 'Moderately Wet'
    if (pdsi >= 1) return 'Slightly Wet'
    if (pdsi >= -1) return 'Normal'
    if (pdsi >= -2) return 'Moderate Drought'
    if (pdsi >= -3) return 'Severe Drought'
    if (pdsi >= -4) return 'Extreme Drought'
    return 'Exceptional Drought'
  }

  const getPDSIColor = (pdsi: number) => {
    if (pdsi >= 2) return { bg: '#065f46', text: '#ffffff' } // Very wet
    if (pdsi >= 1) return { bg: '#16a34a', text: '#ffffff' } // Wet
    if (pdsi >= -1) return { bg: '#84cc16', text: '#1f2937' } // Normal
    if (pdsi >= -2) return { bg: '#fbbf24', text: '#1f2937' } // Moderate drought
    if (pdsi >= -3) return { bg: '#f97316', text: '#ffffff' } // Severe drought
    return { bg: '#dc2626', text: '#ffffff' } // Extreme drought
  }

  const getWaterBalanceStatus = (balance: number) => {
    if (balance > 100) return { status: 'Surplus', color: '#065f46', icon: TrendingUp, description: 'Excellent water availability' }
    if (balance > 50) return { status: 'Adequate', color: '#16a34a', icon: TrendingUp, description: 'Good water conditions' }
    if (balance > 0) return { status: 'Sufficient', color: '#84cc16', icon: Minus, description: 'Adequate moisture' }
    if (balance > -50) return { status: 'Moderate Deficit', color: '#f59e0b', icon: TrendingDown, description: 'Moisture stress possible' }
    if (balance > -100) return { status: 'High Deficit', color: '#f97316', icon: TrendingDown, description: 'Significant moisture stress' }
    return { status: 'Severe Deficit', color: '#dc2626', icon: TrendingDown, description: 'Critical water shortage' }
  }

  const getTimeframeConditions = (): DroughtCondition[] => {
    if (!droughtData) return []

    const pdsiMean = droughtData.drought_indices?.pdsi_mean || 0
    const waterBalance = droughtData.water_balance?.balance_mm || 0

    // Simulate timeframe-based conditions (in real implementation, backend would provide this)
    const conditions: DroughtCondition[] = [
      {
        timeframe: 'Immediate',
        period: '30-day',
        status: waterBalance > 0 ? 'Normal' : waterBalance > -50 ? 'Dry' : 'Moderate Drought',
        icon: Droplets,
        description: waterBalance > 0 ? 'Adequate soil moisture' : 'Soil moisture deficit',
        relevantFor: ['Planting', 'Irrigation scheduling', 'Tillage operations']
      },
      {
        timeframe: 'Seasonal',
        period: '90-day',
        status: pdsiMean >= -1 ? 'Normal' : pdsiMean >= -2 ? 'Moderate Drought' : 'Severe Drought',
        icon: Sprout,
        description: pdsiMean >= -1 ? 'Normal growing conditions' : 'Crop stress likely',
        relevantFor: ['Crop selection', 'Cover crop establishment', 'Pest management']
      },
      {
        timeframe: 'Annual',
        period: '365-day',
        status: pdsiMean >= 0 ? 'Normal' : pdsiMean >= -2 ? 'Moderate Drought' : 'Severe Drought',
        icon: CloudRain,
        description: pdsiMean >= 0 ? 'Normal annual precipitation' : 'Below-normal precipitation',
        relevantFor: ['Conservation planning', 'Water resource management', 'Long-term strategies']
      }
    ]

    return conditions
  }

  const getAffectedPractices = () => {
    if (!droughtData) return []

    const waterBalance = droughtData.water_balance?.balance_mm || 0
    const pdsiMean = droughtData.drought_indices?.pdsi_mean || 0

    const practices = []

    if (waterBalance < -50 || pdsiMean < -1) {
      practices.push({
        code: '340',
        name: 'Cover Crops',
        impact: waterBalance < -100 ? 'High' : 'Moderate',
        recommendation: 'Consider drought-tolerant species; adjust seeding rates',
        color: waterBalance < -100 ? '#dc2626' : '#f59e0b'
      })
    }

    if (waterBalance < -75) {
      practices.push({
        code: '442',
        name: 'Irrigation',
        impact: 'High',
        recommendation: 'Increase irrigation frequency; monitor soil moisture',
        color: '#dc2626'
      })
    }

    if (pdsiMean < -2) {
      practices.push({
        code: '590',
        name: 'Nutrient Management',
        impact: 'Moderate',
        recommendation: 'Adjust N rates; consider split applications',
        color: '#f59e0b'
      })

      practices.push({
        code: '484',
        name: 'Mulching',
        impact: 'Moderate',
        recommendation: 'Maintain surface residue to reduce evaporation',
        color: '#f59e0b'
      })
    }

    return practices
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 mx-auto mb-2" style={{ border: '2px solid #e5e7eb', borderTopColor: '#3b82f6' }}></div>
        <p className="text-sm text-gray-600">Loading drought assessment...</p>
      </div>
    )
  }

  if (!droughtData) {
    return (
      <div className="text-center py-8">
        <CloudRain className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">Drought data not available</p>
        <p className="text-xs text-gray-500 mt-1">Comprehensive assessment required</p>
      </div>
    )
  }

  const waterBalance = droughtData.water_balance?.balance_mm
  const pdsiMean = droughtData.drought_indices?.pdsi_mean
  const pdsiMin = droughtData.drought_indices?.pdsi_min

  const waterStatus = waterBalance !== null ? getWaterBalanceStatus(waterBalance) : null
  const pdsiColors = pdsiMean !== null ? getPDSIColor(pdsiMean) : null
  const pdsiCategory = pdsiMean !== null ? getPDSICategory(pdsiMean) : 'Unknown'
  const timeframeConditions = getTimeframeConditions()
  const affectedPractices = getAffectedPractices()

  const StatusIcon = waterStatus?.icon || Minus

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Drought Risk Assessment</h3>
        <p className="text-xs text-gray-600">Based on GRIDMET climate data</p>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Water Balance Card */}
        {waterBalance !== null && waterStatus && (
          <div 
            className="p-4 rounded-xl border-2"
            style={{ backgroundColor: `${waterStatus.color}10`, borderColor: waterStatus.color }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <StatusIcon className="w-5 h-5" style={{ color: waterStatus.color }} />
                <div className="text-xs font-semibold text-gray-600">Water Balance</div>
              </div>
              <div 
                className="px-2 py-1 rounded text-xs font-bold"
                style={{ backgroundColor: waterStatus.color, color: '#ffffff' }}
              >
                {waterStatus.status}
              </div>
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: waterStatus.color }}>
              {waterBalance > 0 ? '+' : ''}{waterBalance.toFixed(0)} mm
            </div>
            <div className="text-xs" style={{ color: waterStatus.color }}>
              {waterStatus.description}
            </div>
          </div>
        )}

        {/* PDSI Card */}
        {pdsiMean !== null && pdsiColors && (
          <div 
            className="p-4 rounded-xl border-2"
            style={{ backgroundColor: `${pdsiColors.bg}20`, borderColor: pdsiColors.bg }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Thermometer className="w-5 h-5" style={{ color: pdsiColors.bg }} />
                <div className="text-xs font-semibold text-gray-600">PDSI (Palmer Drought)</div>
              </div>
              <div 
                className="px-2 py-1 rounded text-xs font-bold"
                style={{ backgroundColor: pdsiColors.bg, color: pdsiColors.text }}
              >
                {pdsiCategory}
              </div>
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: pdsiColors.bg }}>
              {pdsiMean.toFixed(2)}
            </div>
            <div className="text-xs text-gray-600">
              Range: {pdsiMin?.toFixed(2) || 'N/A'} to {pdsiMean.toFixed(2)}
            </div>
          </div>
        )}
      </div>

      {/* Timeframe Conditions */}
      {timeframeConditions.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Conditions by Timeframe</h4>
          <div className="space-y-2">
            {timeframeConditions.map((condition) => {
              const Icon = condition.icon
              const isAlert = condition.status.includes('Drought')
              return (
                <div 
                  key={condition.timeframe}
                  className="p-3 rounded-lg border"
                  style={{ 
                    backgroundColor: isAlert ? '#fef3c7' : '#f0fdf4',
                    borderColor: isAlert ? '#fde68a' : '#bbf7d0'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="flex-shrink-0 p-2 rounded-lg"
                      style={{ backgroundColor: isAlert ? '#fde68a' : '#dcfce7' }}
                    >
                      <Icon className="w-4 h-4" style={{ color: isAlert ? '#92400e' : '#166534' }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold" style={{ color: isAlert ? '#92400e' : '#166534' }}>
                          {condition.timeframe} ({condition.period})
                        </span>
                        <span 
                          className="px-2 py-0.5 rounded text-xs font-semibold"
                          style={{ 
                            backgroundColor: isAlert ? '#92400e' : '#166534',
                            color: '#ffffff'
                          }}
                        >
                          {condition.status}
                        </span>
                      </div>
                      <div className="text-xs mb-2" style={{ color: isAlert ? '#92400e' : '#166534' }}>
                        {condition.description}
                      </div>
                      <div className="text-xs text-gray-600">
                        <span className="font-semibold">Relevant for:</span> {condition.relevantFor.join(', ')}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Affected Practices */}
      {affectedPractices.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            <AlertTriangle className="w-4 h-4 inline mr-1 text-orange-500" />
            Drought-Affected Practices
          </h4>
          <div className="space-y-2">
            {affectedPractices.map((practice) => (
              <div 
                key={practice.code}
                className="p-3 rounded-lg border"
                style={{ backgroundColor: '#ffffff', borderColor: practice.color }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">
                      {practice.name} ({practice.code})
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {practice.recommendation}
                    </div>
                  </div>
                  <div 
                    className="flex-shrink-0 px-2 py-1 rounded text-xs font-semibold"
                    style={{ backgroundColor: practice.color, color: '#ffffff' }}
                  >
                    {practice.impact} Impact
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Methodology Note */}
      {droughtData.methodology && (
        <div className="text-xs text-gray-500 pt-3 border-t border-gray-200">
          <span className="font-semibold">Data Source:</span> {droughtData.methodology}
        </div>
      )}
    </div>
  )
}

// Helper component (used in timeframe section)
function Sprout({ className, style }: { className?: string; style?: any }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}
