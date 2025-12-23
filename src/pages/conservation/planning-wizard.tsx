import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { CheckCircle2, Circle, ChevronRight, ChevronLeft, MapPin, FileText, Sprout, ClipboardCheck, Calendar, User, ExternalLink } from 'lucide-react'

type Step = {
  id: number
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Project Information',
    description: 'Enter property details',
    icon: User,
  },
  {
    id: 2,
    title: 'Field Selection',
    description: 'Select fields and boundaries',
    icon: MapPin,
  },
  {
    id: 3,
    title: 'Resource Assessment',
    description: 'Identify resource concerns',
    icon: FileText,
  },
  {
    id: 4,
    title: 'Practice Selection',
    description: 'Choose conservation practices',
    icon: Sprout,
  },
  {
    id: 5,
    title: 'Timeline & Costs',
    description: 'Plan implementation schedule',
    icon: Calendar,
  },
  {
    id: 6,
    title: 'Review & Download',
    description: 'Review and finalize plan',
    icon: ClipboardCheck,
  },
]

export default function PlanningWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    projectName: '',
    propertyAddress: '',
    totalAcres: '',
    selectedFields: [],
    resourceConcerns: [],
    practices: [],
    timeline: '',
  })

  // Load saved state when returning from Field Analysis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = sessionStorage.getItem('planningWizardState')
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState)
          setFormData(parsed)
        } catch (e) {
          console.error('Error parsing saved wizard state:', e)
        }
      }
    }
  }, [])

  // Save state whenever formData changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('planningWizardState', JSON.stringify(formData))
    }
  }, [formData])

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div 
      className="min-h-screen" 
      style={{
        background: 'linear-gradient(to bottom right, #f9fafb, #f0fdf4, #dcfce7)',
      }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div 
          className="rounded-lg p-8 mb-8 text-white"
          style={{
            background: 'linear-gradient(to right, #16a34a, #15803d, #166534)',
          }}
        >
          <div className="flex items-center mb-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-3 mr-4">
              <ClipboardCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">
                Conservation Planning Tool
              </h1>
              <p className="text-green-100 text-lg">
                Step-by-step guide to create a comprehensive conservation plan
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => {
              const IconComponent = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    {/* Step Circle */}
                    <div
                      className="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200"
                      style={{
                        background: isCompleted
                          ? 'linear-gradient(to right, #16a34a, #15803d)'
                          : isActive
                          ? 'linear-gradient(to right, #22c55e, #2563eb)'
                          : '#e5e7eb',
                        color: isCompleted || isActive ? '#ffffff' : '#9ca3af',
                      }}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <IconComponent className="w-6 h-6" />
                      )}
                    </div>

                    {/* Step Label */}
                    <div className="text-center mt-2">
                      <div
                        className={`text-sm font-medium ${
                          isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 hidden md:block">
                        {step.description}
                      </div>
                    </div>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      className="h-1 flex-1 mx-2 transition-all duration-200"
                      style={{
                        marginTop: '-2rem',
                        background: currentStep > step.id
                          ? 'linear-gradient(to right, #16a34a, #15803d)'
                          : '#e5e7eb',
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <StepContent
            step={currentStep}
            formData={formData}
            setFormData={setFormData}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`inline-flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              currentStep === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400 hover:shadow-md'
            }`}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              className="inline-flex items-center px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg hover:scale-105"
              style={{
                background: 'linear-gradient(to right, #16a34a, #15803d)',
              }}
            >
              Next
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          ) : (
            <button
              onClick={() => alert('Downloading plan...')}
              className="inline-flex items-center px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg hover:scale-105"
              style={{
                background: 'linear-gradient(to right, #16a34a, #15803d)',
              }}
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Download Plan
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Step Content Component
function StepContent({
  step,
  formData,
  setFormData,
}: {
  step: number
  formData: any
  setFormData: (data: any) => void
}) {
  switch (step) {
    case 1:
      return <ProjectInformation formData={formData} setFormData={setFormData} />
    case 2:
      return <FieldSelection formData={formData} setFormData={setFormData} />
    case 3:
      return <ResourceAssessment formData={formData} setFormData={setFormData} />
    case 4:
      return <PracticeSelection formData={formData} setFormData={setFormData} />
    case 5:
      return <TimelineCosts formData={formData} setFormData={setFormData} />
    case 6:
      return <ReviewDownload formData={formData} />
    default:
      return null
  }
}

// Step 1: Project Information
function ProjectInformation({ formData, setFormData }: any) {
  return (
    <div>
      <div
        className="rounded-lg p-4 mb-6"
        style={{
          background: 'linear-gradient(to right, #3b82f6, #2563eb)',
        }}
      >
        <h2 className="text-2xl font-bold text-white mb-1">Project Information</h2>
        <p className="text-blue-100">
          Enter the basic information about the conservation project
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name *
          </label>
          <input
            type="text"
            value={formData.projectName}
            onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Farm Conservation Plan 2025"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Address *
          </label>
          <textarea
            value={formData.propertyAddress}
            onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={3}
            placeholder="123 Farm Road, City, State ZIP"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Property Acres *
          </label>
          <input
            type="number"
            value={formData.totalAcres}
            onChange={(e) => setFormData({ ...formData, totalAcres: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="160"
          />
        </div>
      </div>
    </div>
  )
}

// Step 2: Field Selection
function FieldSelection({ formData, setFormData }: any) {
  const router = useRouter()

  const openFieldAnalysis = () => {
    // Clear the return flag to ensure fresh start
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('returnToPlanningWizard', 'true')
    }
    
    // Open field analysis
    router.push('/field-analysis')
  }

  const removeField = (index: number) => {
    const updated = formData.selectedFields.filter((_: any, i: number) => i !== index)
    setFormData({ ...formData, selectedFields: updated })
  }

  return (
    <div>
      <div
        className="rounded-lg p-4 mb-6"
        style={{
          background: 'linear-gradient(to right, #3b82f6, #2563eb)',
        }}
      >
        <h2 className="text-2xl font-bold text-white mb-1">Field Selection</h2>
        <p className="text-blue-100">
          Select fields using the Field Analysis module
        </p>
      </div>

      {/* Selected Fields Display */}
      {formData.selectedFields && formData.selectedFields.length > 0 && (
        <div className="mb-6 space-y-3">
          <h3 className="font-semibold text-gray-700 mb-2">
            Selected Fields ({formData.selectedFields.length})
          </h3>
          {formData.selectedFields.map((field: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white"
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">
                    {field.name || field.clu_id || `Field ${index + 1}`}
                  </p>
                  <p className="text-sm text-gray-500">
                    {field.acres ? `${field.acres.toFixed(1)} acres` : 'Area not specified'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeField(index)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Field Selection Interface */}
      <div
        className="border-2 border-dashed border-blue-300 rounded-lg p-8"
        style={{
          background: 'linear-gradient(to right, #eff6ff, #f0fdf4)',
        }}
      >
        <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
          Use Field Analysis Module
        </h3>
        <p className="text-gray-600 text-center mb-6">
          Navigate to Field Analysis to select fields using interactive maps, search, drawing tools, or file upload
        </p>
        
        <div className="flex justify-center">
          <button
            onClick={openFieldAnalysis}
            className="inline-flex items-center px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg hover:scale-105"
            style={{
              background: 'linear-gradient(to right, #3b82f6, #2563eb)',
            }}
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            Open Field Analysis
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>Tip:</strong> In Field Analysis, you can:
          </p>
          <ul className="text-sm text-blue-800 mt-2 space-y-1 ml-4 list-disc">
            <li>Search for fields by address or CLU number</li>
            <li>Browse and select from CSB database</li>
            <li>Draw custom field boundaries</li>
            <li>Upload shapefiles or KML files</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// Step 3: Resource Assessment
function ResourceAssessment({ formData, setFormData }: any) {
  const concerns = [
    { id: 'erosion', label: 'Soil Erosion - Sheet and Rill', severity: 'High' },
    { id: 'water-quality', label: 'Water Quality Degradation', severity: 'Moderate' },
    { id: 'soil-quality', label: 'Soil Quality Degradation', severity: 'Moderate' },
    { id: 'excess-water', label: 'Excess Water - Ponding', severity: 'Low' },
    { id: 'habitat', label: 'Fish & Wildlife Habitat Loss', severity: 'Low' },
  ]

  return (
    <div>
      <div
        className="rounded-lg p-4 mb-6"
        style={{
          background: 'linear-gradient(to right, #3b82f6, #2563eb)',
        }}
      >
        <h2 className="text-2xl font-bold text-white mb-1">Resource Assessment</h2>
        <p className="text-blue-100">
          Identify resource concerns present on the property
        </p>
      </div>

      <div className="space-y-3">
        {concerns.map((concern) => (
          <div
            key={concern.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                id={concern.id}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor={concern.id} className="ml-3 text-gray-700 font-medium cursor-pointer">
                {concern.label}
              </label>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                concern.severity === 'High'
                  ? 'bg-red-100 text-red-800'
                  : concern.severity === 'Moderate'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {concern.severity} Priority
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Step 4: Practice Selection
function PracticeSelection({ formData, setFormData }: any) {
  const practices = [
    {
      code: '329',
      name: 'Residue and Tillage Management, No-Till',
      description: 'Managing the amount, orientation and distribution of crop residue',
      cost: '$15-25/acre',
      gradient: { from: '#16a34a', to: '#15803d' },
    },
    {
      code: '340',
      name: 'Cover Crop',
      description: 'Planting crops for seasonal cover and other conservation purposes',
      cost: '$50-80/acre',
      gradient: { from: '#059669', to: '#047857' },
    },
    {
      code: '560',
      name: 'Access Road',
      description: 'A travel way for equipment, labor, and livestock',
      cost: '$5-10/linear ft',
      gradient: { from: '#6366f1', to: '#4f46e5' },
    },
    {
      code: '612',
      name: 'Tree/Shrub Establishment',
      description: 'Establishing woody plants by planting or natural regeneration',
      cost: '$500-1200/acre',
      gradient: { from: '#10b981', to: '#059669' },
    },
  ]

  return (
    <div>
      <div
        className="rounded-lg p-4 mb-6"
        style={{
          background: 'linear-gradient(to right, #3b82f6, #2563eb)',
        }}
      >
        <h2 className="text-2xl font-bold text-white mb-1">Practice Selection</h2>
        <p className="text-blue-100">
          Select conservation practices to address resource concerns
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {practices.map((practice) => (
          <div
            key={practice.code}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <div
              className="p-4 text-white"
              style={{
                background: `linear-gradient(to right, ${practice.gradient.from}, ${practice.gradient.to})`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-lg">{practice.code}</span>
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">{practice.name}</h3>
            </div>
            <div className="p-4 bg-white">
              <p className="text-sm text-gray-600 mb-3">{practice.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Est. Cost:</span>
                <span className="text-sm font-bold text-green-600">{practice.cost}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Step 5: Timeline & Costs
function TimelineCosts({ formData, setFormData }: any) {
  return (
    <div>
      <div
        className="rounded-lg p-4 mb-6"
        style={{
          background: 'linear-gradient(to right, #3b82f6, #2563eb)',
        }}
      >
        <h2 className="text-2xl font-bold text-white mb-1">Timeline & Costs</h2>
        <p className="text-blue-100">
          Plan implementation schedule and budget
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Implementation Start Date
          </label>
          <input
            type="date"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div
          className="rounded-lg p-6"
          style={{
            background: 'linear-gradient(to right, #f0fdf4, #eff6ff)',
          }}
        >
          <h3 className="font-semibold text-gray-900 mb-4">Estimated Costs</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-700">Total Practice Costs:</span>
              <span className="font-bold text-gray-900">$12,450</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Available Cost Share (75%):</span>
              <span className="font-bold text-green-600">$9,338</span>
            </div>
            <div className="border-t border-gray-300 pt-3 flex justify-between">
              <span className="text-gray-900 font-semibold">Client Responsibility:</span>
              <span className="font-bold text-gray-900 text-xl">$3,112</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Implementation Notes
          </label>
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={4}
            placeholder="Add any special considerations or notes..."
          />
        </div>
      </div>
    </div>
  )
}

// Step 6: Review & Download
function ReviewDownload({ formData }: any) {
  return (
    <div>
      <div
        className="rounded-lg p-4 mb-6"
        style={{
          background: 'linear-gradient(to right, #3b82f6, #2563eb)',
        }}
      >
        <h2 className="text-2xl font-bold text-white mb-1">Review & Download</h2>
        <p className="text-blue-100">
          Review your conservation plan before downloading
        </p>
      </div>

      <div className="space-y-6">
        <div
          className="rounded-lg p-6"
          style={{
            background: 'linear-gradient(to right, #f0fdf4, #eff6ff)',
          }}
        >
          <h3 className="font-semibold text-gray-900 mb-4">Plan Summary</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Project:</span>
              <p className="text-gray-900">{formData.projectName || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Property:</span>
              <p className="text-gray-900">{formData.propertyAddress || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Total Acres:</span>
              <p className="text-gray-900">{formData.totalAcres || 'Not provided'} acres</p>
            </div>
          </div>
        </div>

        <div className="flex items-start p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <FileText className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Ready to Download</h4>
            <p className="text-sm text-blue-700">
              Your conservation plan is ready for review. Click &ldquo;Download Plan&rdquo; to save it for later reference when working with NRCS planners.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
