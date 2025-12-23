// Conservation Practices Component for Field Analysis
// Displays recommended NRCS practices with implementation guidance

'use client'

import { useState } from 'react'
import { 
  CheckCircle, 
  AlertTriangle, 
  DollarSign, 
  Calendar,
  TrendingUp,
  Info,
  ChevronDown,
  ChevronUp,
  Sprout,
  Droplets,
  Wind,
  Layers,
  Target,
  FileText,
  Truck,
  Wheat,
  Shield,
  TreePine,
  Building2,
  Beaker,
  ClipboardList,
  Lightbulb
} from 'lucide-react'
import { ConservationRecommendationEngine } from '../../utils/conservationRecommendations'
import { PRACTICE_CATEGORIES } from '../../data/conservationPractices'
import type { 
  PracticeImplementationPlan, 
  PracticeRecommendation 
} from '../../types/conservationPractices'

interface ConservationPracticesProps {
  fieldData?: {
    erosionRate?: number
    slope?: number
    drainageClass?: string
    organicMatter?: number
    soilDepth?: number
    floodFrequency?: string
    landCapabilityClass?: string
    hydrologicGroup?: string
    acres?: number
  }
}

export default function ConservationPractices({ fieldData }: ConservationPracticesProps) {
  const [expandedPractice, setExpandedPractice] = useState<string | null>(null)
  const [showFunding, setShowFunding] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Debug logging
  console.log('ConservationPractices fieldData:', fieldData)

  // Generate recommendations
  const plan: PracticeImplementationPlan = fieldData 
    ? ConservationRecommendationEngine.generateRecommendations(
        fieldData,
        fieldData.acres || 100
      )
    : {
        fieldId: 'demo',
        totalCost: 0,
        timeline: 'Field data required for recommendations',
        practices: [],
        fundingOptions: [],
        expectedOutcomes: []
      }

  console.log('Conservation plan generated:', plan.practices.length, 'practices')

  const filteredPractices = selectedCategory === 'all'
    ? plan.practices
    : plan.practices.filter(p => p.practice.category === selectedCategory)

  const getPriorityColor = (priority: PracticeRecommendation['priority']) => {
    switch (priority) {
      case 'critical': return '#dc2626' // red-600
      case 'high': return '#f97316' // orange-500
      case 'medium': return '#eab308' // yellow-500
      case 'low': return '#3b82f6' // blue-500
    }
  }

  const getPriorityBgColor = (priority: PracticeRecommendation['priority']) => {
    switch (priority) {
      case 'critical': return '#fef2f2' // red-50
      case 'high': return '#fff7ed' // orange-50
      case 'medium': return '#fefce8' // yellow-50
      case 'low': return '#eff6ff' // blue-50
    }
  }

  const getCategoryIcon = (category: string) => {
    const iconProps = { className: 'w-5 h-5' }
    switch (category) {
      case 'tillage': return <Truck {...iconProps} />
      case 'crop-management': return <Wheat {...iconProps} />
      case 'erosion-control': return <Shield {...iconProps} />
      case 'water-management': return <Droplets {...iconProps} />
      case 'soil-health': return <Sprout {...iconProps} />
      case 'vegetation': return <TreePine {...iconProps} />
      case 'structural': return <Building2 {...iconProps} />
      case 'nutrient-management': return <Beaker {...iconProps} />
      default: return <ClipboardList {...iconProps} />
    }
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Header */}
      <div className="border-b pb-3 md:pb-4" style={{ borderColor: '#e5e7eb' }} >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
          <h3 className="text-base md:text-lg font-semibold" style={{ color: '#111827' }}>
            Conservation Practices
          </h3>
          <div className="flex items-center gap-2 text-xs md:text-sm" style={{ color: '#6b7280' }}>
            <Sprout className="h-4 w-4" />
            <span className="hidden sm:inline">NRCS Standards</span>
            <span className="sm:hidden">NRCS</span>
          </div>
        </div>
        <p className="text-xs md:text-sm" style={{ color: '#6b7280' }}>
          Recommended practices based on field conditions
        </p>
      </div>

      {/* Summary Cards */}
      {plan.practices.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {/* Total Cost Card */}
          <div className="p-3 md:p-4 rounded-lg border" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 md:h-5 md:w-5" style={{ color: '#059669' }} />
              <span className="text-xs md:text-sm font-medium" style={{ color: '#6b7280' }}>Estimated Cost</span>
            </div>
            <p className="text-xl md:text-2xl font-bold" style={{ color: '#111827' }}>
              ${plan.totalCost.toLocaleString()}
            </p>
            <button
              onClick={() => setShowFunding(!showFunding)}
              className="mt-2 text-xs underline hover:opacity-80"
              style={{ color: '#2563eb' }}
            >
              {showFunding ? 'Hide' : 'View'} Funding
            </button>
          </div>

          {/* Priority Practices Card */}
          <div className="p-3 md:p-4 rounded-lg border" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 md:h-5 md:w-5" style={{ color: '#dc2626' }} />
              <span className="text-xs md:text-sm font-medium" style={{ color: '#6b7280' }}>Priority Actions</span>
            </div>
            <p className="text-xl md:text-2xl font-bold" style={{ color: '#dc2626' }}>
              {plan.practices.filter(p => p.priority === 'critical' || p.priority === 'high').length}
            </p>
            <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
              High-priority items
            </p>
          </div>

          {/* Timeline Card */}
          <div className="p-3 md:p-4 rounded-lg border" style={{ backgroundColor: '#eff6ff', borderColor: '#dbeafe' }}>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 md:h-5 md:w-5" style={{ color: '#2563eb' }} />
              <span className="text-xs md:text-sm font-medium" style={{ color: '#6b7280' }}>Timeline</span>
            </div>
            <p className="text-sm md:text-base font-medium" style={{ color: '#111827' }}>
              {plan.timeline}
            </p>
          </div>
        </div>
      )}

      {/* Funding Options (Expandable) */}
      {showFunding && plan.fundingOptions.length > 0 && (
        <div className="p-3 md:p-4 rounded-lg border" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
          <h4 className="font-semibold text-sm md:text-base mb-2 md:mb-3 flex items-center gap-2" style={{ color: '#15803d' }}>
            <DollarSign className="h-4 w-4 md:h-5 md:w-5" />
            Funding Programs
          </h4>
          <div className="space-y-2 md:space-y-3">
            {plan.fundingOptions.map((option, idx) => (
              <div key={idx} className="p-2 md:p-3 rounded border" style={{ backgroundColor: '#ffffff', borderColor: '#d1d5db' }}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-xs md:text-sm" style={{ color: '#111827' }}>{option.program}</p>
                    <p className="text-xs" style={{ color: '#6b7280' }}>{option.agency}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-sm font-semibold" style={{ color: '#059669' }}>
                      Up to {option.coveragePercent}%
                    </p>
                    {option.maxAmount && (
                      <p className="text-xs" style={{ color: '#6b7280' }}>
                        Max: ${option.maxAmount.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-xs" style={{ color: '#6b7280' }}>
                  <p className="font-medium mb-1">Eligibility:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-1">
                    {option.eligibility.slice(0, 2).map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                    {option.eligibility.length > 2 && (
                      <li className="text-xs italic">+{option.eligibility.length - 2} more requirements</li>
                    )}
                  </ul>
                  {option.applicationDeadline && (
                    <p className="mt-1 italic text-xs">{option.applicationDeadline}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      {plan.practices.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
            style={{
              backgroundColor: selectedCategory === 'all' ? '#2563eb' : '#f3f4f6',
              color: selectedCategory === 'all' ? '#ffffff' : '#6b7280'
            }}
          >
            All ({plan.practices.length})
          </button>
          {Object.entries(PRACTICE_CATEGORIES).map(([key, cat]) => {
            const count = plan.practices.filter(p => p.practice.category === key).length
            if (count === 0) return null
            
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                style={{
                  backgroundColor: selectedCategory === key ? '#2563eb' : '#f3f4f6',
                  color: selectedCategory === key ? '#ffffff' : '#6b7280'
                }}
              >
                {getCategoryIcon(key)} {cat.name} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* Practice Recommendations */}
      {plan.practices.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-lg border" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
          <Sprout className="h-12 w-12 mx-auto mb-4" style={{ color: '#9ca3af' }} />
          <p className="font-medium mb-2" style={{ color: '#6b7280' }}>
            No Field Data Available
          </p>
          <p className="text-sm" style={{ color: '#9ca3af' }}>
            Select a field with analysis data to see conservation practice recommendations
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPractices.map((recommendation) => {
            const practice = recommendation.practice
            const isExpanded = expandedPractice === practice.code

            return (
              <div
                key={practice.code}
                className="border rounded-lg overflow-hidden transition-shadow hover:shadow-md"
                style={{ borderColor: '#e5e7eb' }}
              >
                {/* Practice Header */}
                <div
                  className="p-3 md:p-4 cursor-pointer active:opacity-75 transition-opacity"
                  style={{ backgroundColor: getPriorityBgColor(recommendation.priority) }}
                  onClick={() => setExpandedPractice(isExpanded ? null : practice.code)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-xl md:text-2xl flex-shrink-0">{getCategoryIcon(practice.category)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm md:text-base" style={{ color: '#111827' }}>
                              {practice.name}
                            </h4>
                            <span 
                              className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
                              style={{ 
                                backgroundColor: getPriorityColor(recommendation.priority),
                                color: '#ffffff'
                              }}
                            >
                              {recommendation.priority.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs" style={{ color: '#6b7280' }}>
                            NRCS {practice.code}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs md:text-sm mb-2 line-clamp-2" style={{ color: '#4b5563' }}>
                        {practice.description}
                      </p>
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#059669' }} />
                        <p className="text-xs md:text-sm font-medium" style={{ color: '#059669' }}>
                          {recommendation.reason}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm md:text-base font-semibold whitespace-nowrap" style={{ color: '#111827' }}>
                          ${recommendation.estimatedCost.toLocaleString()}
                        </p>
                        <p className="text-xs hidden md:block" style={{ color: '#6b7280' }}>
                          Est. cost
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" style={{ color: '#6b7280' }} />
                      ) : (
                        <ChevronDown className="h-5 w-5" style={{ color: '#6b7280' }} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-3 md:p-4 border-t" style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff' }}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
                      {/* Benefits */}
                      <div>
                        <h5 className="font-semibold mb-2 flex items-center gap-2" style={{ color: '#111827' }}>
                          <TrendingUp className="h-4 w-4" style={{ color: '#059669' }} />
                          Expected Benefits
                        </h5>
                        <ul className="space-y-1">
                          {practice.benefits.map((benefit, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2" style={{ color: '#4b5563' }}>
                              <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: '#059669' }} />
                              <span>{benefit.description}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Implementation Info */}
                      <div>
                        <h5 className="font-semibold mb-2 flex items-center gap-2" style={{ color: '#111827' }}>
                          <Calendar className="h-4 w-4" style={{ color: '#2563eb' }} />
                          Implementation
                        </h5>
                        <div className="space-y-2 text-sm" style={{ color: '#4b5563' }}>
                          <p>
                            <strong>Timeline:</strong> {recommendation.implementationTimeline}
                          </p>
                          <p>
                            <strong>Maintenance:</strong> {practice.maintenanceRequirement} level
                          </p>
                          <p>
                            <strong>Lifespan:</strong> {practice.lifespan === 999 ? 'Continuous' : `${practice.lifespan} years`}
                          </p>
                          {practice.nrcsFinancialSupport && (
                            <p className="flex items-center gap-1" style={{ color: '#059669' }}>
                              <DollarSign className="h-4 w-4" />
                              <strong>NRCS cost-share available</strong>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Purpose */}
                    <div className="mb-3 md:mb-4">
                      <h5 className="font-semibold text-sm mb-2 flex items-center gap-2" style={{ color: '#111827' }}>
                        <Target className="h-4 w-4" style={{ color: '#f59e0b' }} />
                        Purpose
                      </h5>
                      <ul className="grid grid-cols-1 gap-1">
                        {practice.purpose.map((p, idx) => (
                          <li key={idx} className="text-xs md:text-sm flex items-start gap-2" style={{ color: '#4b5563' }}>
                            <span style={{ color: '#f59e0b' }}>•</span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Implementation Steps */}
                    <div className="mb-4">
                      <h5 className="font-semibold mb-2 flex items-center gap-2" style={{ color: '#111827' }}>
                        <FileText className="h-4 w-4" style={{ color: '#8b5cf6' }} />
                        Implementation Steps
                      </h5>
                      <ol className="space-y-1">
                        {practice.implementationSteps.map((step, idx) => (
                          <li key={idx} className="text-sm flex gap-2" style={{ color: '#4b5563' }}>
                            <span className="font-semibold" style={{ color: '#8b5cf6' }}>
                              {idx + 1}.
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Compatible Practices */}
                    {recommendation.compatiblePractices.length > 0 && (
                      <div>
                        <h5 className="font-semibold mb-2 flex items-center gap-2" style={{ color: '#111827' }}>
                          <Layers className="h-4 w-4" style={{ color: '#6366f1' }} />
                          Works Well With
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {recommendation.compatiblePractices.map(code => {
                            const relatedPractice = ConservationRecommendationEngine.getPracticeByCode(code)
                            if (!relatedPractice) return null
                            
                            return (
                              <span
                                key={code}
                                className="text-xs px-2 py-1 rounded"
                                style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}
                              >
                                {relatedPractice.name}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Expected Outcomes */}
      {plan.expectedOutcomes.length > 0 && (
        <div className="p-3 md:p-4 rounded-lg border" style={{ backgroundColor: '#f0f9ff', borderColor: '#bae6fd' }}>
          <h4 className="font-semibold text-sm md:text-base mb-2 md:mb-3 flex items-center gap-2" style={{ color: '#0369a1' }}>
            <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
            Projected Improvements
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {plan.expectedOutcomes.map((outcome, idx) => (
              <div key={idx} className="p-3 rounded border" style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1' }}>
                <p className="text-xs md:text-sm font-medium mb-2" style={{ color: '#111827' }}>
                  {outcome.metric}
                </p>
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="flex-1">
                    <p className="text-xs" style={{ color: '#6b7280' }}>Current</p>
                    <p className="text-base md:text-lg font-semibold" style={{ color: '#dc2626' }}>
                      {outcome.baseline} {outcome.unit}
                    </p>
                  </div>
                  <span className="flex-shrink-0" style={{ color: '#6b7280' }}>→</span>
                  <div className="flex-1">
                    <p className="text-xs" style={{ color: '#6b7280' }}>Projected</p>
                    <p className="text-base md:text-lg font-semibold" style={{ color: '#059669' }}>
                      {outcome.projected} {outcome.unit}
                    </p>
                  </div>
                </div>
                <p className="text-xs mt-2" style={{ color: '#6b7280' }}>
                  {outcome.timeframe}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Footer */}
      <div className="p-4 rounded-lg border" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 flex-shrink-0" style={{ color: '#2563eb' }} />
          <div className="text-sm" style={{ color: '#1e40af' }}>
            <p className="font-semibold mb-1">Contact Your Local NRCS Office</p>
            <p>
              These recommendations are based on field data and NRCS practice standards. 
              For detailed site-specific plans, technical assistance, and funding applications, 
              contact your local NRCS field office or conservation district.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
