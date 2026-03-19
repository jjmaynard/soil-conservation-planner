import { X, Info, BarChart3, Target, Lightbulb, Database, GitMerge, CheckCircle2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { FieldAnalysisTabId, TabNarrative } from '@/config/field-analysis-tab-narratives'

interface TabNarrativeModalProps {
  isOpen: boolean
  onClose: () => void
  tabId: FieldAnalysisTabId
  tabLabel: string
  tabIcon?: ReactNode
  tabColor: string
  tabBackground: string
  narrative: TabNarrative
}

function getTabQualityChecks(tabId: FieldAnalysisTabId): string[] {
  const baseChecks = [
    'Cross-check map patterns against field-observed conditions before finalizing actions.',
    'Treat outlier values as investigation triggers, not automatic prescriptions.',
    'Use multiple metrics together for decisions instead of relying on a single indicator.'
  ]

  const tabSpecificChecks: Record<FieldAnalysisTabId, string[]> = {
    soil: [
      'Confirm dominant vs minor components are represented by meaningful area before changing whole-field strategy.',
      'Use recent field notes to validate drainage class and trafficability assumptions.'
    ],
    erosion: [
      'Verify whether high-risk areas are persistent hotspots across recent seasons before structural investments.',
      'Interpret risk index with slope and K-factor context to avoid overreacting to isolated pixels.'
    ],
    drainage: [
      'Prioritize recurrent wet areas; one-time ponding events may reflect episodic storms.',
      'Where available, align wetness zones with operation logs (planting delays, rutting, stand loss).'
    ],
    productivity: [
      'Interpret yield-gap signals alongside variability (CV) to separate structural from seasonal issues.',
      'Cross-check NCCPI potential with realized NDVI response before input increases.'
    ],
    svi: [
      'Use both surface and subsurface pathway metrics to avoid one-pathway bias in nutrient planning.',
      'Prioritize high-class vulnerability zones for first-phase intervention and monitoring.'
    ],
    flow: [
      'Confirm concentrated-flow corridors against known washout/gully points after rainfall events.',
      'Use upper-tail SPI statistics (P90/Max) to prioritize structural controls.'
    ],
    drought: [
      'Increase confidence when drought severity, trend, and index agreement all point in the same direction.',
      'Treat worsening trends as early-action triggers even if current severity is moderate.'
    ],
    vegetation: [
      'Differentiate temporal instability (weather/timing) from spatial instability (zone heterogeneity).',
      'If valid-pixel coverage is weak in source data, use trend direction cautiously.'
    ],
    terrain: [
      'Combine slope, SPI, and TWI before selecting controls to avoid one-metric bias.',
      'Validate terrain-driven hotspots against operation and runoff observations.'
    ],
    climate: [
      'Use multi-year climate patterns and timing windows rather than single-year anomalies.',
      'Pair climate context with field drainage/soil constraints for realistic operation timing.'
    ],
    concerns: [
      'Prioritize by both severity and affected area to balance urgency and operational impact.',
      'Review trigger metrics before finalizing concern order and resource allocation.'
    ],
    practices: [
      'Confirm each selected practice maps to a specific concern and measurable outcome.',
      'Phase implementation by urgency, feasibility, and disruption tolerance.'
    ],
    zones: [
      'Use zones only when boundaries are stable across seasons and supported by multiple indicators.',
      'Reassess zone structure after major management or weather regime shifts.'
    ]
  }

  return [...baseChecks, ...tabSpecificChecks[tabId]]
}

export default function TabNarrativeModal({
  isOpen,
  onClose,
  tabId,
  tabLabel,
  tabIcon,
  tabColor,
  tabBackground,
  narrative
}: TabNarrativeModalProps) {
  if (!isOpen) return null

  if (typeof window === 'undefined') return null

  const qualityChecks = getTabQualityChecks(tabId)
  const tabLabelLower = tabLabel.toLowerCase()

  return createPortal(
    <div className="fixed inset-0 z-[10000] overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-lg bg-white shadow-xl">
          <div className="sticky top-0 z-10 p-6 text-white" style={{ background: `linear-gradient(to right, ${tabColor}, ${tabColor}dd)` }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  {tabIcon ? <span>{tabIcon}</span> : null}
                  {tabLabel} Guidance
                </h2>
                <p className="mt-2 text-sm text-white/90">
                  {`Interpretation and decision support guidance for ${tabLabelLower}`}
                </p>
              </div>

              <button
                onClick={onClose}
                className="rounded p-1 text-white transition-colors hover:text-white/80"
                aria-label="Close tab guidance"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="max-h-[calc(90vh-180px)] overflow-y-auto p-6 pb-18" style={{ backgroundColor: tabBackground }}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <section className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="mb-2 flex items-center text-base font-semibold text-gray-900">
                  <Info className="mr-2 h-5 w-5" style={{ color: tabColor }} />
                  What This Tab Shows
                </h3>
                <p className="text-sm leading-relaxed text-gray-700">{narrative.whatThisShows}</p>
              </section>

              <section className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="mb-2 flex items-center text-base font-semibold text-gray-900">
                  <BarChart3 className="mr-2 h-5 w-5" style={{ color: tabColor }} />
                  How To Interpret
                </h3>
                <p className="text-sm leading-relaxed text-gray-700">{narrative.howToInterpret}</p>
              </section>

              <section className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="mb-2 flex items-center text-base font-semibold text-gray-900">
                  <Target className="mr-2 h-5 w-5" style={{ color: tabColor }} />
                  Decision Support Value
                </h3>
                <p className="text-sm leading-relaxed text-gray-700">{narrative.decisionSupportValue}</p>
              </section>

              <section className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="mb-2 flex items-center text-base font-semibold text-gray-900">
                  <Lightbulb className="mr-2 h-5 w-5" style={{ color: tabColor }} />
                  Practical Example
                </h3>
                <p className="text-sm leading-relaxed text-gray-700">{narrative.practicalExample}</p>
              </section>
            </div>

            <section className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="mb-3 flex items-center text-base font-semibold text-gray-900">
                <Database className="mr-2 h-5 w-5" style={{ color: tabColor }} />
                Data Properties and Interpretation Guide
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-2 py-2 text-left font-semibold text-gray-900">Property</th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-900">Expected Range</th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-900">What It Means</th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-900">How To Interpret</th>
                    </tr>
                  </thead>
                  <tbody>
                    {narrative.properties.map((property) => (
                      <tr key={property.name} className="border-b border-gray-100 align-top last:border-b-0">
                        <td className="px-2 py-2 font-medium text-gray-900">{property.name}</td>
                        <td className="px-2 py-2 text-gray-700">{property.expectedRange}</td>
                        <td className="px-2 py-2 text-gray-700">{property.meaning}</td>
                        <td className="px-2 py-2 text-gray-700">{property.interpretation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <section className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="mb-2 flex items-center text-base font-semibold text-gray-900">
                  <GitMerge className="mr-2 h-5 w-5" style={{ color: tabColor }} />
                  Knowledge Generation: Combine Signals
                </h3>
                <ol className="list-decimal pl-5 text-sm leading-relaxed text-gray-700 space-y-1">
                  {narrative.synthesisGuide.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </section>

              <section className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="mb-2 flex items-center text-base font-semibold text-gray-900">
                  <CheckCircle2 className="mr-2 h-5 w-5" style={{ color: tabColor }} />
                  Decision Rules
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  {narrative.decisionRules.map((rule, index) => (
                    <div key={`${rule.condition}-${index}`} className="rounded border border-gray-200 p-2">
                      <p><span className="font-semibold text-gray-900">If:</span> {rule.condition}</p>
                      <p><span className="font-semibold text-gray-900">Then:</span> {rule.action}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="mb-2 flex items-center text-base font-semibold text-gray-900">
                <CheckCircle2 className="mr-2 h-5 w-5" style={{ color: tabColor }} />
                Confidence and Data Quality Checks
              </h3>
              <ul className="list-disc pl-5 text-sm leading-relaxed text-gray-700 space-y-1">
                {qualityChecks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>

          <div className="sticky bottom-0 border-t border-gray-200 bg-white px-6 py-4">
            <button
              onClick={onClose}
              className="w-full rounded-lg px-4 py-2 text-white transition-opacity hover:opacity-95"
              style={{ backgroundColor: tabColor }}
            >
              Close Guidance
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
