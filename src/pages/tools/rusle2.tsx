import { Construction, Mountain, CheckCircle2 } from 'lucide-react'

export default function RUSLE2() {
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
                background: 'linear-gradient(to right, #ea580c, #c2410c)',
              }}
            >
              <Mountain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">RUSLE2</h2>
              <p className="text-gray-600">Revised Universal Soil Loss Equation</p>
            </div>
          </div>

          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Module Overview</h3>
            <p className="text-gray-700 mb-4">
              The RUSLE2 module provides comprehensive soil erosion prediction using the Revised
              Universal Soil Loss Equation (Version 2). Calculate erosion rates, evaluate
              conservation practice effectiveness, and generate before/after comparisons for
              conservation planning.
            </p>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
              <p className="text-sm text-gray-700 font-mono">
                <strong>RUSLE2 Equation:</strong> A = R × K × LS × C × P
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Where: A = Annual Soil Loss (tons/acre/year), R = Rainfall Erosivity, K = Soil
                Erodibility, LS = Slope Length & Steepness, C = Cover Management, P = Support
                Practices
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-4 mt-6">Planned Features</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Slope Profile Builder</p>
                  <p className="text-gray-600 text-sm">
                    Create detailed slope profiles with length, steepness, and shape (uniform,
                    concave, convex) for accurate LS-factor calculation.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Climate Data Integration</p>
                  <p className="text-gray-600 text-sm">
                    Automatic R-factor lookup based on location using PRISM climate data with
                    monthly rainfall erosivity patterns.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Crop Rotation Modeling</p>
                  <p className="text-gray-600 text-sm">
                    Build multi-year crop rotations with growth stages, residue production, and
                    canopy coverage for accurate C-factor calculation.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Tillage Operation Sequencing</p>
                  <p className="text-gray-600 text-sm">
                    Select tillage operations with timing and intensity to model residue
                    disturbance, soil roughness, and surface cover effects.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Support Practice Effects</p>
                  <p className="text-gray-600 text-sm">
                    Model P-factor reductions from contouring, strip-cropping, terracing, and other
                    support practices with slope-specific effectiveness.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Before/After Comparisons</p>
                  <p className="text-gray-600 text-sm">
                    Compare current management to proposed conservation scenarios with side-by-side
                    erosion estimates and practice effectiveness analysis.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">T-Value Comparison</p>
                  <p className="text-gray-600 text-sm">
                    Automatic comparison to soil loss tolerance (T-value) with interpretation and
                    recommended actions when erosion exceeds tolerable limits.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Practice Effectiveness Report</p>
                  <p className="text-gray-600 text-sm">
                    Generate detailed reports showing erosion reduction from each conservation
                    practice with cost-effectiveness analysis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
