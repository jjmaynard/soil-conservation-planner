import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  MapPin,
  Calendar,
  User,
  Cloud,
  Droplets,
  Thermometer,
  Camera,
  AlertCircle,
  FileText,
  TrendingUp,
  Info,
  Leaf,
  Layers,
  Hammer,
  Puzzle,
  Building2,
  Wind,
  Sprout,
  Bug,
  CircleDot,
  Palette
} from 'lucide-react'
import { soilHealthIndicators, getIndicatorsByCategory } from '#src/data/soilHealthIndicators'
import { analyzeResourceConcerns, calculateOverallSoilHealthScore } from '#src/utils/resourceConcernAnalysis'
import { generatePracticeRecommendations } from '#src/utils/practiceRecommendations'
import type { SoilHealthAssessment, AssessedIndicator, SoilContext } from '#src/types/soilHealth'
import IndicatorDetailModal from '#components/common/IndicatorDetailModal'

// Icon mapping for soil health indicators
const INDICATOR_ICONS: Record<string, any> = {
  Leaf,
  Layers,
  Droplets,
  Hammer,
  Puzzle,
  Building2,
  Wind,
  Sprout,
  Bug,
  CircleDot,
  Palette
};

function getIndicatorIcon(iconName: string) {
  const IconComponent = INDICATOR_ICONS[iconName];
  return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
}

export default function SoilHealthAssessmentPage() {
  const router = useRouter()
  const { fieldId } = router.query
  
  const [assessment, setAssessment] = useState<SoilHealthAssessment | null>(null)
  const [currentStep, setCurrentStep] = useState<'info' | 'physical' | 'biological' | 'analysis'>('info')
  const [isSaving, setIsSaving] = useState(false)
  const [selectedIndicator, setSelectedIndicator] = useState<any>(null)

  useEffect(() => {
    if (!fieldId) return
    loadOrCreateAssessment(fieldId as string)
  }, [fieldId])

  const loadOrCreateAssessment = (id: string) => {
    const stored = localStorage.getItem('soil_health_assessments')
    let assessments: any[] = []
    
    if (stored) {
      try {
        assessments = JSON.parse(stored)
      } catch (error) {
        console.error('Failed to load assessments:', error)
      }
    }

    // Find existing assessment
    const existing = assessments.find(a => a.fieldId === id)
    
    if (existing) {
      setAssessment({
        ...existing,
        assessmentDate: new Date(existing.assessmentDate),
        soilContext: existing.soilContext || {
          soilType: '',
          landUse: '',
          previousCrop: '',
          recentWeather: '',
          soilMoisture: 'field_capacity',
          soilTemp: undefined,
          managementHistory: {
            cropRotation: '',
            tillageSystem: '',
            managementDuration: undefined,
            coverageMonths: undefined,
            grazingDetails: '',
            coverCrops: '',
            coverCropTermination: '',
            pestManagement: '',
            nutrientManagement: '',
            irrigation: '',
            ponding: '',
            emergenceProblems: '',
            waterManagement: '',
            otherObservations: ''
          }
        },
        indicators: existing.indicators || [],
        photos: existing.photos || [],
        resourceConcerns: existing.resourceConcerns || [],
        practiceRecommendations: existing.practiceRecommendations || []
      })
    } else {
      // Create new assessment
      const newAssessment: SoilHealthAssessment = {
        id: `assessment-${Date.now()}`,
        fieldId: id,
        assessmentDate: new Date(),
        assessor: {
          name: '',
          organization: ''
        },
        weatherConditions: {
          recentPrecipitation: '',
          soilMoisture: 'moist',
          temperature: undefined,
          lastRainfall: ''
        },
        fieldConditions: {
          cropStage: '',
          tillageRecent: false,
          trafficRecent: false,
          notes: ''
        },
        indicators: [],
        photos: [],
        resourceConcerns: [],
        recommendations: [],
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setAssessment(newAssessment)
    }
  }

  const saveAssessment = () => {
    if (!assessment) return

    setIsSaving(true)
    
    // Calculate analysis
    const concerns = analyzeResourceConcerns(assessment.indicators)
    const score = calculateOverallSoilHealthScore(assessment.indicators)
    const recommendations = generatePracticeRecommendations(concerns)

    const updatedAssessment = {
      ...assessment,
      resourceConcerns: concerns,
      recommendations: recommendations.map(r => r.practice_name),
      updatedAt: new Date()
    }

    // Save to localStorage
    const stored = localStorage.getItem('soil_health_assessments')
    let assessments: any[] = []
    
    if (stored) {
      try {
        assessments = JSON.parse(stored)
      } catch (error) {
        console.error('Failed to load assessments:', error)
      }
    }

    // Update or add assessment
    const existingIndex = assessments.findIndex(a => a.fieldId === assessment.fieldId)
    if (existingIndex >= 0) {
      assessments[existingIndex] = updatedAssessment
    } else {
      assessments.push(updatedAssessment)
    }

    localStorage.setItem('soil_health_assessments', JSON.stringify(assessments))
    setAssessment(updatedAssessment)
    
    setTimeout(() => {
      setIsSaving(false)
    }, 500)
  }

  const updateField = (field: keyof SoilHealthAssessment, value: any) => {
    if (!assessment) return
    setAssessment({ ...assessment, [field]: value })
  }

  const updateAssessorField = (field: string, value: string) => {
    if (!assessment) return
    setAssessment({
      ...assessment,
      assessor: {
        ...(typeof assessment.assessor === 'string' 
          ? { name: assessment.assessor, organization: '' }
          : assessment.assessor),
        [field]: value
      }
    })
  }

  const updateIndicator = (indicatorId: string, result: 'meets' | 'does_not_meet' | 'unable_to_assess', notes?: string) => {
    if (!assessment) return
    
    const existingIndex = assessment.indicators.findIndex(i => i.id === indicatorId)
    const indicator = soilHealthIndicators.find(i => i.id === indicatorId)
    
    if (!indicator) return

    const assessedIndicator: AssessedIndicator = {
      ...indicator,
      meets_criteria: result === 'meets' ? true : result === 'does_not_meet' ? false : null,
      notes: notes || '',
      photos: existingIndex >= 0 ? assessment.indicators[existingIndex].photos : [],
      assessment_confidence: 'medium'
    }

    const newIndicators = [...assessment.indicators]
    if (existingIndex >= 0) {
      newIndicators[existingIndex] = assessedIndicator
    } else {
      newIndicators.push(assessedIndicator)
    }

    setAssessment({ ...assessment, indicators: newIndicators })
  }

  const completeAssessment = () => {
    if (!assessment) return
    
    const updatedAssessment = {
      ...assessment,
      status: 'completed' as const
    }
    
    setAssessment(updatedAssessment)
    saveAssessment()
    
    // Navigate back to dashboard
    setTimeout(() => {
      router.push('/soil-health')
    }, 1000)
  }

  if (!assessment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    )
  }

  const physicalIndicators = getIndicatorsByCategory('physical')
  const biologicalIndicators = getIndicatorsByCategory('biological')
  
  const getIndicatorStatus = (indicatorId: string) => {
    return assessment.indicators.find(i => i.id === indicatorId)
  }

  const assessorName = typeof assessment.assessor === 'string' ? assessment.assessor : assessment.assessor.name
  const assessorOrg = typeof assessment.assessor === 'string' ? '' : assessment.assessor.organization

  return (
    <>
      <Head>
        <title>Soil Health Assessment - {fieldId}</title>
      </Head>

      <div className="h-full flex flex-col p-4 md:p-6 overflow-hidden">
        {/* Header */}
        <div 
          className="mb-6 p-6 rounded-lg shadow-md flex-shrink-0"
          style={{ background: 'linear-gradient(to right, #16a34a, #15803d, #166534)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <Link 
              href="/soil-health"
              className="flex items-center transition-colors"
              style={{ color: '#ffffff' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#d1fae5'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={saveAssessment}
                disabled={isSaving}
                className="flex items-center px-4 py-2 rounded-lg transition-colors shadow-md disabled:opacity-50"
                style={{ backgroundColor: '#ffffff', color: '#15803d' }}
                onMouseEnter={(e) => !isSaving && (e.currentTarget.style.backgroundColor = '#f0fdf4')}
                onMouseLeave={(e) => !isSaving && (e.currentTarget.style.backgroundColor = '#ffffff')}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={completeAssessment}
                className="flex items-center px-4 py-2 rounded-lg transition-colors shadow-md"
                style={{ backgroundColor: '#166534', color: '#ffffff' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#14532d'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#166534'}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Complete
              </button>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Field Assessment</h1>
          <p className="text-green-100">Field ID: {fieldId}</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow mb-6 p-4 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            {[
              { id: 'info', label: 'Field Info', icon: MapPin },
              { id: 'physical', label: 'Physical', icon: Droplets },
              { id: 'biological', label: 'Biological', icon: Sprout },
              { id: 'analysis', label: 'Analysis', icon: FileText }
            ].map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isComplete = 
                (step.id === 'info' && assessorName) ||
                (step.id === 'physical' && physicalIndicators.every(i => getIndicatorStatus(i.id))) ||
                (step.id === 'biological' && biologicalIndicators.every(i => getIndicatorStatus(i.id)))
              
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id as any)}
                  className="flex-1 flex flex-col items-center justify-center px-3 py-3 rounded-lg border-2 transition-all min-w-0"
                  style={{
                    borderColor: isActive ? '#16a34a' : isComplete ? '#86efac' : '#e5e7eb',
                    backgroundColor: isActive ? '#f0fdf4' : '#ffffff',
                    color: isActive ? '#15803d' : isComplete ? '#16a34a' : '#6b7280'
                  }}
                >
                  <div 
                    className="flex items-center justify-center w-8 h-8 rounded-full mb-2"
                    style={{
                      backgroundColor: isActive ? '#16a34a' : isComplete ? '#22c55e' : '#e5e7eb',
                      color: isActive || isComplete ? '#ffffff' : '#6b7280'
                    }}
                  >
                    {isComplete && step.id !== 'analysis' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="font-medium text-sm whitespace-nowrap">{step.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 bg-white rounded-lg shadow p-6 overflow-y-auto">
          {currentStep === 'info' && (
            <div className="space-y-6">
              <div className="-mx-6 -mt-6 mb-6 p-4 rounded-t-lg" style={{ background: 'linear-gradient(to right, #16a34a, #15803d)' }}>
                <h2 className="text-2xl font-bold text-white">Field Information</h2>
                <p className="text-green-100 text-sm mt-1">Basic details about the field and assessment conditions</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Assessor Name *
                  </label>
                  <input
                    type="text"
                    value={assessorName}
                    onChange={(e) => updateAssessorField('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization
                  </label>
                  <input
                    type="text"
                    value={assessorOrg}
                    onChange={(e) => updateAssessorField('organization', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="NRCS, Extension, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Assessment Date
                  </label>
                  <input
                    type="date"
                    value={assessment.assessmentDate.toISOString().split('T')[0]}
                    onChange={(e) => updateField('assessmentDate', new Date(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Soil Context and Management History fields removed - SoilHealthAssessment type doesn't include soilContext property */}

              <button
                onClick={() => setCurrentStep('physical')}
                className="w-full mt-6 px-6 py-3 text-white rounded-lg shadow-md transition-colors"
                style={{ background: 'linear-gradient(to right, #16a34a, #15803d)' }}
              >
                Continue to Physical Indicators
              </button>
            </div>
          )}

          {currentStep === 'physical' && (
            <div className="space-y-6">
              <div className="-mx-6 -mt-6 mb-6 p-4 rounded-t-lg" style={{ background: 'linear-gradient(to right, #16a34a, #15803d)' }}>
                <h2 className="text-2xl font-bold text-white">Physical Indicators</h2>
                <p className="text-green-100 text-sm mt-1">
                  Assess each indicator based on field observations. High priority indicators are marked with a star.
                </p>
              </div>

              <div className="space-y-4">
                {physicalIndicators.map((indicator) => {
                  const status = getIndicatorStatus(indicator.id)
                  const isHighPriority = indicator.priority === 'high'
                  return (
                    <div 
                      key={indicator.id} 
                      className="rounded-lg p-4 transition-all"
                      style={{
                        backgroundColor: status?.meets_criteria === true ? '#f0fdf4' : 
                                       status?.meets_criteria === false ? '#fef2f2' : 
                                       '#ffffff',
                        border: isHighPriority ? '2px solid #fbbf24' : '1px solid #e5e7eb',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold flex items-center" style={{ color: '#111827' }}>
                            <span 
                              className="mr-3 p-2 rounded-lg"
                              style={{ 
                                backgroundColor: isHighPriority ? '#fef3c7' : '#dcfce7',
                                color: '#16a34a'
                              }}
                            >
                              {getIndicatorIcon(indicator.icon || '')}
                            </span>
                            {indicator.name}
                            {isHighPriority && (
                              <span 
                                className="ml-2 px-2 py-1 text-xs font-medium rounded"
                                style={{ backgroundColor: '#fef3c7', color: '#92400e' }}
                              >
                                ★ High Priority
                              </span>
                            )}
                            <button
                              onClick={() => setSelectedIndicator(indicator)}
                              className="ml-2 transition-colors p-1 rounded"
                              style={{ color: '#16a34a' }}
                              title="View details"
                            >
                              <Info className="w-5 h-5" />
                            </button>
                          </h3>
                          <p className="text-sm mt-2" style={{ color: '#4b5563' }}>{indicator.description}</p>
                          <div className="mt-2 p-2 rounded" style={{ backgroundColor: '#f0fdf4', borderLeft: '3px solid #16a34a' }}>
                            <p className="text-xs font-medium" style={{ color: '#15803d' }}>
                              <strong>Meets criteria:</strong> {indicator.meets}
                            </p>
                          </div>
                        </div>
                        {status && (
                          <div 
                            className="flex-shrink-0 ml-4 p-2 rounded-full"
                            style={{ backgroundColor: '#dcfce7' }}
                          >
                            <CheckCircle2 className="w-6 h-6" style={{ color: '#16a34a' }} />
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mb-3">
                        <button
                          onClick={() => updateIndicator(indicator.id, 'meets')}
                          className="flex-1 px-4 py-2 rounded-lg transition-colors"
                          style={{
                            backgroundColor: status?.meets_criteria === true ? '#16a34a' : '#ffffff',
                            color: status?.meets_criteria === true ? '#ffffff' : '#374151',
                            border: status?.meets_criteria === true ? '1px solid #16a34a' : '1px solid #d1d5db'
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4 inline mr-2" />
                          Meets
                        </button>
                        <button
                          onClick={() => updateIndicator(indicator.id, 'does_not_meet')}
                          className="flex-1 px-4 py-2 rounded-lg transition-colors"
                          style={{
                            backgroundColor: status?.meets_criteria === false ? '#dc2626' : '#ffffff',
                            color: status?.meets_criteria === false ? '#ffffff' : '#374151',
                            border: status?.meets_criteria === false ? '1px solid #dc2626' : '1px solid #d1d5db'
                          }}
                        >
                          <AlertCircle className="w-4 h-4 inline mr-2" />
                          Does Not Meet
                        </button>
                        <button
                          onClick={() => updateIndicator(indicator.id, 'unable_to_assess')}
                          className="flex-1 px-4 py-2 rounded-lg transition-colors"
                          style={{
                            backgroundColor: status?.meets_criteria === null ? '#4b5563' : '#ffffff',
                            color: status?.meets_criteria === null ? '#ffffff' : '#374151',
                            border: status?.meets_criteria === null ? '1px solid #4b5563' : '1px solid #d1d5db'
                          }}
                        >
                          Unable to Assess
                        </button>
                      </div>

                      {status && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes (optional)
                          </label>
                          <textarea
                            value={status.notes}
                            onChange={(e) => updateIndicator(indicator.id, status.meets_criteria, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            rows={2}
                            placeholder="Add any observations or notes..."
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep('info')}
                  className="flex-1 px-6 py-3 rounded-lg transition-colors"
                  style={{ backgroundColor: '#f3f4f6', color: '#374151' }}
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep('biological')}
                  className="flex-1 px-6 py-3 text-white rounded-lg shadow-md transition-colors"
                  style={{ background: 'linear-gradient(to right, #16a34a, #15803d)' }}
                >
                  Continue to Biological Indicators
                </button>
              </div>
            </div>
          )}

          {currentStep === 'biological' && (
            <div className="space-y-6">
              <div className="-mx-6 -mt-6 mb-6 p-4 rounded-t-lg" style={{ background: 'linear-gradient(to right, #16a34a, #15803d)' }}>
                <h2 className="text-2xl font-bold text-white">Biological Indicators</h2>
                <p className="text-green-100 text-sm mt-1">
                  Assess biological soil health indicators. These reflect soil ecosystem function.
                </p>
              </div>

              <div className="space-y-4">
                {biologicalIndicators.map((indicator) => {
                  const status = getIndicatorStatus(indicator.id)
                  const isHighPriority = indicator.priority === 'high'
                  return (
                    <div 
                      key={indicator.id} 
                      className="rounded-lg p-4 transition-all"
                      style={{
                        backgroundColor: status?.meets_criteria === true ? '#f0fdf4' : 
                                       status?.meets_criteria === false ? '#fef2f2' : 
                                       '#ffffff',
                        border: isHighPriority ? '2px solid #fbbf24' : '1px solid #e5e7eb',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold flex items-center" style={{ color: '#111827' }}>
                            <span 
                              className="mr-3 p-2 rounded-lg"
                              style={{ 
                                backgroundColor: isHighPriority ? '#fef3c7' : '#ede9fe',
                                color: '#7c3aed'
                              }}
                            >
                              {getIndicatorIcon(indicator.icon || '')}
                            </span>
                            {indicator.name}
                            {isHighPriority && (
                              <span 
                                className="ml-2 px-2 py-1 text-xs font-medium rounded"
                                style={{ backgroundColor: '#fef3c7', color: '#92400e' }}
                              >
                                ★ High Priority
                              </span>
                            )}
                            <button
                              onClick={() => setSelectedIndicator(indicator)}
                              className="ml-2 transition-colors p-1 rounded"
                              style={{ color: '#7c3aed' }}
                              title="View details"
                            >
                              <Info className="w-5 h-5" />
                            </button>
                          </h3>
                          <p className="text-sm mt-2" style={{ color: '#4b5563' }}>{indicator.description}</p>
                          <div className="mt-2 p-2 rounded" style={{ backgroundColor: '#faf5ff', borderLeft: '3px solid #7c3aed' }}>
                            <p className="text-xs font-medium" style={{ color: '#6b21a8' }}>
                              <strong>Meets criteria:</strong> {indicator.meets}
                            </p>
                          </div>
                        </div>
                        {status && (
                          <div 
                            className="flex-shrink-0 ml-4 p-2 rounded-full"
                            style={{ backgroundColor: '#dcfce7' }}
                          >
                            <CheckCircle2 className="w-6 h-6" style={{ color: '#16a34a' }} />
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mb-3">
                        <button
                          onClick={() => updateIndicator(indicator.id, 'meets')}
                          className="flex-1 px-4 py-2 rounded-lg transition-colors"
                          style={{
                            backgroundColor: status?.meets_criteria === true ? '#16a34a' : '#ffffff',
                            color: status?.meets_criteria === true ? '#ffffff' : '#374151',
                            border: status?.meets_criteria === true ? '1px solid #16a34a' : '1px solid #d1d5db'
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4 inline mr-2" />
                          Meets
                        </button>
                        <button
                          onClick={() => updateIndicator(indicator.id, 'does_not_meet')}
                          className="flex-1 px-4 py-2 rounded-lg transition-colors"
                          style={{
                            backgroundColor: status?.meets_criteria === false ? '#dc2626' : '#ffffff',
                            color: status?.meets_criteria === false ? '#ffffff' : '#374151',
                            border: status?.meets_criteria === false ? '1px solid #dc2626' : '1px solid #d1d5db'
                          }}
                        >
                          <AlertCircle className="w-4 h-4 inline mr-2" />
                          Does Not Meet
                        </button>
                        <button
                          onClick={() => updateIndicator(indicator.id, 'unable_to_assess')}
                          className="flex-1 px-4 py-2 rounded-lg transition-colors"
                          style={{
                            backgroundColor: status?.meets_criteria === null ? '#4b5563' : '#ffffff',
                            color: status?.meets_criteria === null ? '#ffffff' : '#374151',
                            border: status?.meets_criteria === null ? '1px solid #4b5563' : '1px solid #d1d5db'
                          }}
                        >
                          Unable to Assess
                        </button>
                      </div>

                      {status && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes (optional)
                          </label>
                          <textarea
                            value={status.notes}
                            onChange={(e) => updateIndicator(indicator.id, status.meets_criteria, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            rows={2}
                            placeholder="Add any observations or notes..."
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep('physical')}
                  className="flex-1 px-6 py-3 rounded-lg transition-colors"
                  style={{ backgroundColor: '#f3f4f6', color: '#374151' }}
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    saveAssessment()
                    setCurrentStep('analysis')
                  }}
                  className="flex-1 px-6 py-3 text-white rounded-lg shadow-md transition-colors"
                  style={{ background: 'linear-gradient(to right, #16a34a, #15803d)' }}
                >
                  View Analysis & Recommendations
                </button>
              </div>
            </div>
          )}

          {currentStep === 'analysis' && (
            <div className="space-y-6">
              <div className="-mx-6 -mt-6 mb-6 p-4 rounded-t-lg" style={{ background: 'linear-gradient(to right, #16a34a, #15803d)' }}>
                <h2 className="text-2xl font-bold text-white">Assessment Results</h2>
                <p className="text-green-100 text-sm mt-1">Overall soil health score, resource concerns, and practice recommendations</p>
              </div>

              {/* Overall Score */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Overall Soil Health Score</h3>
                  <div className="text-4xl font-bold text-green-700">{assessment.overallScore}%</div>
                </div>
                <div className="w-full bg-white rounded-full h-4">
                  <div
                    className="h-4 rounded-full transition-all"
                    style={{
                      width: `${assessment.overallScore}%`,
                      backgroundColor: assessment.overallScore >= 85 ? '#16a34a' :
                                     assessment.overallScore >= 70 ? '#22c55e' :
                                     assessment.overallScore >= 50 ? '#eab308' : '#ef4444'
                    }}
                  />
                </div>
              </div>

              {/* Resource Concerns */}
              {assessment.resourceConcerns.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Resource Concerns Identified</h3>
                  <div className="space-y-3">
                    {assessment.resourceConcerns.map((concern, index) => (
                      <div key={index} className="flex items-start p-3 rounded-lg" style={{ backgroundColor: '#f9fafb' }}>
                        <AlertCircle 
                          className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5"
                          style={{
                            color: concern.severity === 'severe' ? '#dc2626' :
                                   concern.severity === 'moderate' ? '#ea580c' :
                                   '#ca8a04'
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-900">
                              {concern.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </h4>
                            <span 
                              className="px-2 py-1 text-xs rounded"
                              style={{
                                backgroundColor: concern.severity === 'severe' ? '#fee2e2' :
                                                concern.severity === 'moderate' ? '#ffedd5' :
                                                '#fef3c7',
                                color: concern.severity === 'severe' ? '#991b1b' :
                                       concern.severity === 'moderate' ? '#9a3412' :
                                       '#92400e'
                              }}
                            >
                              {concern.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{concern.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Failed indicators: {concern.indicators_failed?.join(', ') || 'None'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Practice Recommendations */}
              {assessment.practiceRecommendations.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Conservation Practice Recommendations</h3>
                  <div className="space-y-4">
                    {assessment.practiceRecommendations.map((rec, index) => (
                      <div key={index} className="rounded-lg p-4" style={{ border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4' }}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {rec.practice_name} (NRCS {rec.practice_code})
                          </h4>
                          <span 
                            className="px-2 py-1 text-xs rounded"
                            style={{
                              backgroundColor: rec.priority === 'high' ? '#fee2e2' :
                                              rec.priority === 'medium' ? '#fef3c7' :
                                              '#dcfce7',
                              color: rec.priority === 'high' ? '#991b1b' :
                                     rec.priority === 'medium' ? '#92400e' :
                                     '#166534'
                            }}
                          >
                            Priority: {rec.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{rec.description}</p>
                        <p className="text-xs text-gray-600">
                          <strong>Addresses:</strong> {rec.addresses_concerns?.join(', ') || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-600">
                          <strong>Expected timeline:</strong> {rec.timeframe}
                        </p>
                        {rec.implementation_notes && (
                          <p className="text-xs text-gray-600 mt-1">
                            <strong>Notes:</strong> {rec.implementation_notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep('biological')}
                  className="flex-1 px-6 py-3 rounded-lg transition-colors"
                  style={{ backgroundColor: '#f3f4f6', color: '#374151' }}
                >
                  Back to Indicators
                </button>
                <button
                  onClick={completeAssessment}
                  className="flex-1 px-6 py-3 rounded-lg transition-colors shadow-md"
                  style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
                >
                  <CheckCircle2 className="w-5 h-5 inline mr-2" />
                  Complete & Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Indicator Detail Modal */}
      {selectedIndicator && (
        <IndicatorDetailModal
          indicator={selectedIndicator}
          isOpen={!!selectedIndicator}
          onClose={() => setSelectedIndicator(null)}
        />
      )}
    </>
  )
}

