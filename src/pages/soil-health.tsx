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
          style={{ background: 'linear-gradient(to right, var(--color-conservation), var(--color-forest-700), var(--color-forest-800))' }}
        >
          <div className="flex items-center mb-2">
            <div className="bg-white bg-opacity-20 rounded-lg p-2 mr-3">
              <Wheat className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Soil Health Assessment</h1>
              <p className="text-soil-health-light">NRCS In-Field Soil Health Evaluation Tool</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-surface p-4 rounded-lg shadow" style={{ borderLeft: '4px solid var(--color-slate-500)' }}>
            <div className="text-sm text-text-secondary mb-1">Total Assessments</div>
            <div className="text-2xl font-bold text-text">{assessments.length}</div>
          </div>
          <div className="bg-surface p-4 rounded-lg shadow" style={{ borderLeft: '4px solid var(--color-forest-500)' }}>
            <div className="text-sm text-text-secondary mb-1">Completed</div>
            <div className="text-2xl font-bold text-forest-600">
              {assessments.filter(a => a.status === 'completed' || a.status === 'synced').length}
            </div>
          </div>
          <div className="bg-surface p-4 rounded-lg shadow" style={{ borderLeft: '4px solid var(--color-amber-500)' }}>
            <div className="text-sm text-text-secondary mb-1">In Progress</div>
            <div className="text-2xl font-bold text-amber-600">
              {assessments.filter(a => a.status === 'draft').length}
            </div>
          </div>
          <div className="bg-surface p-4 rounded-lg shadow" style={{ borderLeft: '4px solid var(--color-ocean-500)' }}>
            <div className="text-sm text-text-secondary mb-1">Synced</div>
            <div className="text-2xl font-bold text-ocean-600">
              {assessments.filter(a => a.status === 'synced').length}
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-surface p-4 rounded-lg shadow mb-6 flex flex-wrap items-center gap-4 border border-border">
          <button
            onClick={createNewAssessment}
            className="btn-soil-health flex items-center px-4 py-2 text-white rounded-lg transition-colors shadow-md"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Assessment
          </button>

          <div className="flex-1 flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                placeholder="Search fields or assessors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-surface text-text focus:border-soil-health"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-text-secondary" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="form-input px-3 py-2 rounded-lg border border-border bg-surface text-text focus:border-soil-health"
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
          <div className="bg-surface p-12 rounded-lg shadow text-center border border-border">
            <Wheat className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text mb-2">No Assessments Found</h3>
            <p className="text-text-secondary mb-6">
              {assessments.length === 0
                ? 'Get started by creating your first soil health assessment'
                : 'Try adjusting your search or filter criteria'}
            </p>
            {assessments.length === 0 && (
              <button
                onClick={createNewAssessment}
                className="btn-soil-health inline-flex items-center px-6 py-3 text-white rounded-lg shadow-md transition-colors hover:opacity-90"
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
                className="bg-surface p-6 rounded-lg shadow transition-all relative border border-border"
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  e.currentTarget.style.borderColor = 'var(--color-soil-health-light)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1)'
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                }}
              >
                <Link
                  href={`/soil-health/assessment/${assessment.fieldId}`}
                  className="block"
                >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-text mr-3">
                        {assessment.fieldName}
                      </h3>
                      <span className="flex items-center px-2 py-1 text-xs rounded gap-1" style={getStatusColor(assessment.status)}>
                        {getStatusIcon(assessment.status)}
                        {assessment.status}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3 text-sm text-text-secondary">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-text-muted" />
                        {assessment.assessmentDate.toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-text-muted" />
                        {typeof assessment.assessor === 'string' 
                          ? assessment.assessor 
                          : assessment.assessor.name}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-text-muted" />
                        Field ID: {assessment.fieldId}
                      </div>
                    </div>
                    {assessment.score !== undefined && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-text-secondary">Soil Health Score</span>
                          <span className="font-semibold text-text">{assessment.score}%</span>
                        </div>
                        <div className="w-full rounded-full h-2 bg-border-light">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${assessment.score}%`,
                              backgroundColor: assessment.score >= 85 ? 'var(--color-forest-600)' :
                                             assessment.score >= 70 ? 'var(--color-forest-500)' :
                                             assessment.score >= 50 ? 'var(--color-amber-500)' : 'var(--color-clay-500)'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                  <div className="ml-4">
                    <div className="text-soil-health hover:text-soil-health-dark transition-colors">
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
                  className="absolute top-4 right-4 p-2 rounded-lg transition-all duration-200 bg-clay-100 text-clay-600 border border-clay-200 hover:bg-clay-200 hover:border-clay-300"
                  title="Delete Assessment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="alert-info mt-6 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 text-info" />
            <div className="text-sm text-info-dark">
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
              className="bg-surface rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-clay-100">
                  <AlertCircle className="w-6 h-6 text-clay-600" />
                </div>
                <h3 className="text-xl font-bold ml-3 text-text">Delete Assessment?</h3>
              </div>
              
              <p className="text-sm mb-6 text-text-secondary">
                Are you sure you want to delete this assessment? This action cannot be undone and all assessment data will be permanently removed.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-surface text-text border border-border hover:bg-background-alt"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteAssessment(deleteConfirmId)}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-white"
                  style={{ background: 'linear-gradient(to right, var(--color-clay-500), var(--color-clay-600))' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, var(--color-clay-600), var(--color-clay-700))'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, var(--color-clay-500), var(--color-clay-600))'}
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
