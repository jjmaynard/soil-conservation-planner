import { Construction, FlaskConical, CheckCircle2 } from 'lucide-react'

export default function NutrientCalculator() {
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
                background: 'linear-gradient(to right, #0891b2, #0e7490)',
              }}
            >
              <FlaskConical className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">NRCS Nutrient Calculator</h2>
              <p className="text-gray-600">Nutrient Management Planning Tool</p>
            </div>
          </div>

          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Module Overview</h3>
            <p className="text-gray-700 mb-4">
              The NRCS Nutrient Calculator provides comprehensive nutrient management planning based
              on crop requirements, soil test results, and organic amendment characteristics.
              Calculate application rates, timing, and placement recommendations while protecting
              water quality.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4 mt-6">Planned Features</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Crop Nutrient Requirements</p>
                  <p className="text-gray-600 text-sm">
                    Database of nutrient requirements (N, P, K, S, micronutrients) for 100+ crops
                    with yield-based recommendations and removal rates.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Soil Test Interpretation</p>
                  <p className="text-gray-600 text-sm">
                    Import soil test results with automatic interpretation using university
                    extension guidelines for your state/region with pH adjustment recommendations.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Manure & Compost Analysis</p>
                  <p className="text-gray-600 text-sm">
                    Calculate nutrient credits from manure, compost, and other organic amendments
                    with availability factors and mineralization rates.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Application Rate Recommendations</p>
                  <p className="text-gray-600 text-sm">
                    Calculate optimal fertilizer rates based on crop needs, soil test results,
                    organic amendments, and realistic yield goals.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Timing Recommendations</p>
                  <p className="text-gray-600 text-sm">
                    Guidance on application timing: fall vs. spring, pre-plant vs. sidedress,
                    split applications, and slow-release strategies.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Loss Potential Assessment</p>
                  <p className="text-gray-600 text-sm">
                    Evaluate nitrogen loss potential through leaching, denitrification, and
                    volatilization based on soil properties, drainage, and climate.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Phosphorus Risk Assessment</p>
                  <p className="text-gray-600 text-sm">
                    Calculate phosphorus loss risk using the Phosphorus Index with site-specific
                    factors: soil test P, erosion, distance to water, and application method.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">4R Nutrient Stewardship</p>
                  <p className="text-gray-600 text-sm">
                    Recommendations follow 4R principles: Right source, Right rate, Right time,
                    Right place for efficient use and environmental protection.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Nutrient Management Plan</p>
                  <p className="text-gray-600 text-sm">
                    Generate comprehensive nutrient management plans meeting NRCS Standard 590
                    requirements with maps, application schedules, and record-keeping forms.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>NRCS Standard 590:</strong> Nutrient Management plans ensure nutrients are
                applied at rates, timing, and placement that optimize plant nutrition while
                minimizing environmental impact to water quality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
