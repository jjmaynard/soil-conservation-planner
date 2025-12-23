import { Construction, FileText, CheckCircle2 } from 'lucide-react'

export default function Reports() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Under Development Banner */}
        <div
          className="rounded-lg p-8 mb-8 text-white text-center"
          style={{
            background: 'linear-gradient(to right, #f59e0b, #d97706)',
          }}
        >
          <Construction className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Under Development</h1>
          <p className="text-lg opacity-90">
            This module is currently being built and will be available soon.
          </p>
        </div>

        {/* Module Information */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center mb-6">
            <div
              className="p-3 rounded-lg mr-4"
              style={{
                background: 'linear-gradient(to right, #64748b, #475569)',
              }}
            >
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Reports & Documentation</h2>
              <p className="text-gray-600">Conservation Plans & Program Applications</p>
            </div>
          </div>

          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Module Overview</h3>
            <p className="text-gray-700 mb-4">
              The Reports & Documentation module provides comprehensive tools for generating NRCS
              conservation plans, program applications (EQIP, CSP, CRP), field analysis summaries,
              and custom reports with professional formatting and digital signatures.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4 mt-6">Planned Features</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Conservation Plan Generator</p>
                  <p className="text-gray-600 text-sm">
                    Create formatted conservation plans following NRCS templates with auto-populated
                    data from planning wizard, field analysis, and practice selection.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">EQIP Application Package</p>
                  <p className="text-gray-600 text-sm">
                    Environmental Quality Incentives Program application with resource concern
                    ranking, practice scoring, cost-effectiveness analysis, and payment calculations.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">CSP Application Support</p>
                  <p className="text-gray-600 text-sm">
                    Conservation Stewardship Program application with enhancement activity selection,
                    stewardship threshold verification, and payment worksheets.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">CRP Contract Documentation</p>
                  <p className="text-gray-600 text-sm">
                    Conservation Reserve Program contracts with practice establishment plans,
                    maintenance schedules, and payment tracking.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Field Analysis Reports</p>
                  <p className="text-gray-600 text-sm">
                    Comprehensive field analysis summaries with soil composition maps, erosion
                    assessments, management zones, and conservation recommendations.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Soil Health Assessment Reports</p>
                  <p className="text-gray-600 text-sm">
                    Generate soil health scorecards with indicator measurements, trend analysis,
                    benchmark comparisons, and improvement recommendations.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Custom Report Builder</p>
                  <p className="text-gray-600 text-sm">
                    Create custom reports with drag-and-drop sections: maps, data tables, charts,
                    photos, and narrative text with professional formatting.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Digital Signatures & Approval</p>
                  <p className="text-gray-600 text-sm">
                    Integrated digital signature workflow for client approval, technical review, and
                    final authorization with audit trail and version control.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Export Formats</p>
                  <p className="text-gray-600 text-sm">
                    Export reports in multiple formats: PDF, Word (DOCX), Excel (for data tables),
                    and HTML for web viewing and sharing.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Report Templates Library</p>
                  <p className="text-gray-600 text-sm">
                    Access state-specific and national templates for all NRCS forms, conservation
                    plans, and program applications with automatic formatting.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>NRCS Compliance:</strong> All report templates follow NRCS formatting
                standards and include required elements for conservation planning, technical
                assistance documentation, and program applications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
