import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function RUSLE2() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to RUSLE-EOS
    router.replace('/tools/rusle-eos')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to RUSLE-EOS...</p>
      </div>
    </div>
  )
}
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
