import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { 
  Wheat, 
  Plus, 
  FileText, 
  Calendar, 
  MapPin, 
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Trash2
} from 'lucide-react'

interface Assessment {
  id: string
  fieldId: string
  fieldName: string
  assessmentDate: Date
  assessor: string | { name: string; organization?: string }
  status: 'draft' | 'completed' | 'synced'
  score?: number
}

export default function SoilHealth() {
  const router = useRouter()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [filter, setFilter] = useState<'all' | 'draft' | 'completed' | 'synced'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    loadAssessments()
  }, [])

  const loadAssessments = () => {
    // Load from localStorage
    const stored = localStorage.getItem('soil_health_assessments')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setAssessments(parsed.map((a: any) => ({
          ...a,
          assessmentDate: new Date(a.assessmentDate)
        })))
      } catch (error) {
        console.error('Failed to load assessments:', error)
      }
    }
  }

  const createNewAssessment = () => {
    const newId = `field-${Date.now()}`
    router.push(`/soil-health/assessment/${newId}`)
  }

  const deleteAssessment = (assessmentId: string) => {
    // Remove from state
    const updatedAssessments = assessments.filter(a => a.id !== assessmentId)
    setAssessments(updatedAssessments)
    
    // Update localStorage
    localStorage.setItem('soil_health_assessments', JSON.stringify(updatedAssessments))
    
    // Clear confirmation
    setDeleteConfirmId(null)
  }

  const filteredAssessments = assessments.filter(assessment => {
    const matchesFilter = filter === 'all' || assessment.status === filter
    const assessorName = typeof assessment.assessor === 'string' 
      ? assessment.assessor 
      : assessment.assessor.name
    const matchesSearch = searchTerm === '' || 
      assessment.fieldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessorName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return { backgroundColor: '#dcfce7', color: '#166534' }
      case 'synced': return { backgroundColor: '#dbeafe', color: '#1e40af' }
      case 'draft': return { backgroundColor: '#fef3c7', color: '#92400e' }
      default: return { backgroundColor: '#f3f4f6', color: '#1f2937' }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4" />
      case 'synced': return <CheckCircle2 className="w-4 h-4" />
      case 'draft': return <Clock className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <>
      <Head>
        <title>Soil Health Assessment - Soil Conservation Explorer</title>
        <meta name="description" content="NRCS In-Field Soil Health Assessment Tool" />
      </Head>

      <div className="h-full flex flex-col overflow-auto">
        {/* Header */}
        <div 
          className="mb-6 p-6 rounded-lg shadow-md"
          style={{ background: 'linear-gradient(to right, #16a34a, #15803d, #166534)' }}
        >
          <div className="flex items-center mb-2">
            <div className="bg-white bg-opacity-20 rounded-lg p-2 mr-3">
              <Wheat className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Soil Health Assessment</h1>
              <p className="text-green-100">NRCS In-Field Soil Health Evaluation Tool</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow" style={{ borderLeft: '4px solid #9ca3af' }}>
            <div className="text-sm text-gray-600 mb-1">Total Assessments</div>
            <div className="text-2xl font-bold text-gray-900">{assessments.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow" style={{ borderLeft: '4px solid #22c55e' }}>
            <div className="text-sm text-gray-600 mb-1">Completed</div>
            <div className="text-2xl font-bold" style={{ color: '#16a34a' }}>
              {assessments.filter(a => a.status === 'completed' || a.status === 'synced').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow" style={{ borderLeft: '4px solid #eab308' }}>
            <div className="text-sm text-gray-600 mb-1">In Progress</div>
            <div className="text-2xl font-bold" style={{ color: '#ca8a04' }}>
              {assessments.filter(a => a.status === 'draft').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow" style={{ borderLeft: '4px solid #3b82f6' }}>
            <div className="text-sm text-gray-600 mb-1">Synced</div>
            <div className="text-2xl font-bold" style={{ color: '#2563eb' }}>
              {assessments.filter(a => a.status === 'synced').length}
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap items-center gap-4">
          <button
            onClick={createNewAssessment}
            className="flex items-center px-4 py-2 text-white rounded-lg transition-colors shadow-md"
            style={{ background: 'linear-gradient(to right, #16a34a, #15803d)' }}
          >
            <Plus className="w-5 h-5 mr-2" />
            New Assessment
          </button>

          <div className="flex-1 flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search fields or assessors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg"
                style={{ border: '1px solid #d1d5db' }}
                onFocus={(e) => {
                  e.target.style.outline = '2px solid #22c55e'
                  e.target.style.outlineOffset = '2px'
                  e.target.style.borderColor = '#22c55e'
                }}
                onBlur={(e) => {
                  e.target.style.outline = 'none'
                  e.target.style.borderColor = '#d1d5db'
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 rounded-lg"
                style={{ border: '1px solid #d1d5db' }}
                onFocus={(e) => {
                  e.target.style.outline = '2px solid #22c55e'
                  e.target.style.outlineOffset = '2px'
                  e.target.style.borderColor = '#22c55e'
                }}
                onBlur={(e) => {
                  e.target.style.outline = 'none'
                  e.target.style.borderColor = '#d1d5db'
                }}
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
                <option value="synced">Synced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Assessment List */}
        {filteredAssessments.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <Wheat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assessments Found</h3>
            <p className="text-gray-600 mb-6">
              {assessments.length === 0
                ? 'Get started by creating your first soil health assessment'
                : 'Try adjusting your search or filter criteria'}
            </p>
            {assessments.length === 0 && (
              <button
                onClick={createNewAssessment}
                className="inline-flex items-center px-6 py-3 text-white rounded-lg shadow-md transition-colors hover:opacity-90"
                style={{ background: 'linear-gradient(to right, #16a34a, #15803d)' }}
              >
                <Plus className="w-5 h-5 mr-2" />
                Create First Assessment
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAssessments.map((assessment) => (
              <div
                key={assessment.id}
                className="bg-white p-6 rounded-lg shadow transition-all relative"
                style={{ border: '1px solid #e5e7eb' }}
              >
                <Link
                  href={`/soil-health/assessment/${assessment.fieldId}`}
                  className="block"
                  onMouseEnter={(e) => {
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1)';
                      parent.style.borderColor = '#86efac';
                    }
                  }}
                  onMouseLeave={(e) => {
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1)';
                      parent.style.borderColor = '#e5e7eb';
                    }
                  }}
                >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 mr-3">
                        {assessment.fieldName}
                      </h3>
                      <span className="flex items-center px-2 py-1 text-xs rounded gap-1" style={getStatusColor(assessment.status)}>
                        {getStatusIcon(assessment.status)}
                        {assessment.status}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {assessment.assessmentDate.toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-gray-400" />
                        {typeof assessment.assessor === 'string' 
                          ? assessment.assessor 
                          : assessment.assessor.name}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        Field ID: {assessment.fieldId}
                      </div>
                    </div>
                    {assessment.score !== undefined && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Soil Health Score</span>
                          <span className="font-semibold text-gray-900">{assessment.score}%</span>
                        </div>
                        <div className="w-full rounded-full h-2" style={{ backgroundColor: '#e5e7eb' }}>
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${assessment.score}%`,
                              backgroundColor: assessment.score >= 85 ? '#16a34a' :
                                             assessment.score >= 70 ? '#22c55e' :
                                             assessment.score >= 50 ? '#eab308' : '#ef4444'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                  <div className="ml-4">
                    <div
                      style={{ color: '#16a34a' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#15803d'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#16a34a'}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
                
                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeleteConfirmId(assessment.id);
                  }}
                  className="absolute top-4 right-4 p-2 rounded-lg transition-all duration-200"
                  style={{
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fee2e2';
                    e.currentTarget.style.borderColor = '#fca5a5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fef2f2';
                    e.currentTarget.style.borderColor = '#fecaca';
                  }}
                  title="Delete Assessment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 rounded-lg p-4" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" style={{ color: '#2563eb' }} />
            <div className="text-sm" style={{ color: '#1e3a8a' }}>
              <p className="font-medium mb-1">NRCS Soil Health Assessment Guidelines</p>
              <p>
                This tool implements the NRCS In-Field Soil Health Assessment methodology. Assessments evaluate 
                11 standard indicators across physical and biological categories. Best results are obtained when 
                soil is at field capacity moisture.
              </p>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setDeleteConfirmId(null)}
          >
            <div 
              className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full" style={{ backgroundColor: '#fee2e2' }}>
                  <AlertCircle className="w-6 h-6" style={{ color: '#dc2626' }} />
                </div>
                <h3 className="text-xl font-bold ml-3" style={{ color: '#111827' }}>Delete Assessment?</h3>
              </div>
              
              <p className="text-sm mb-6" style={{ color: '#6b7280' }}>
                Are you sure you want to delete this assessment? This action cannot be undone and all assessment data will be permanently removed.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200"
                  style={{
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #e5e7eb'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteAssessment(deleteConfirmId)}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200"
                  style={{
                    background: 'linear-gradient(to right, #dc2626, #b91c1c)',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #b91c1c, #991b1b)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #dc2626, #b91c1c)'}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
