import { X, Info, Clock, Target, ListChecks, Wrench, Leaf, Layers, Droplets, Hammer, Puzzle, Building2, Wind, Sprout, Bug, CircleDot, Palette, CloudRain, Wheat, MessageCircle } from 'lucide-react'
import { SoilHealthIndicator } from '#src/types/soilHealth'
import { TIMING_DESCRIPTIONS, TIMING_ICONS, CONSERVATION_PRACTICES } from '#src/data/soilHealthIndicators'

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
  Palette,
  Clock,
  CloudRain,
  Wheat,
  MessageCircle
};

function getIndicatorIcon(iconName: string) {
  const IconComponent = INDICATOR_ICONS[iconName];
  return IconComponent ? <IconComponent className="w-8 h-8" /> : null;
}

interface IndicatorDetailModalProps {
  indicator: SoilHealthIndicator
  isOpen: boolean
  onClose: () => void
}

export default function IndicatorDetailModal({ indicator, isOpen, onClose }: IndicatorDetailModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div 
            className="p-6 sticky top-0 z-10"
            style={{ background: 'linear-gradient(to right, #16a34a, #15803d)' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <span className="mr-3 text-white">{getIndicatorIcon(indicator.icon)}</span>
                  {indicator.name}
                </h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm capitalize" style={{ color: '#d1fae5' }}>
                    {indicator.category} Indicator
                  </span>
                  <span 
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: indicator.priority === 'high' ? '#fbbf24' :
                                      indicator.priority === 'medium' ? '#60a5fa' :
                                      '#d1d5db',
                      color: indicator.priority === 'high' ? '#78350f' :
                             indicator.priority === 'medium' ? '#1e3a8a' :
                             '#1f2937'
                    }}
                  >
                    {indicator.priority === 'high' ? '★ High Priority' : indicator.priority === 'medium' ? 'Medium Priority' : 'Low Priority'}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="transition-colors"
                style={{ color: '#ffffff' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#d1fae5'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold flex items-center mb-3" style={{ color: '#111827' }}>
                <Info className="w-5 h-5 mr-2" style={{ color: '#16a34a' }} />
                Description
              </h3>
              <p style={{ color: '#374151' }}>{indicator.description}</p>
            </div>

            {/* Meets Criteria */}
            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <h3 className="text-lg font-semibold flex items-center mb-2" style={{ color: '#14532d' }}>
                <Target className="w-5 h-5 mr-2" />
                Meets Criteria
              </h3>
              <p style={{ color: '#166534' }}>{indicator.meets}</p>
            </div>

            {/* Timing Requirements */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold flex items-center mb-3" style={{ color: '#111827' }}>
                <Clock className="w-5 h-5 mr-2" style={{ color: '#16a34a' }} />
                When to Assess
              </h3>
              <div className="space-y-2">
                {indicator.timing.map((timing) => {
                  const TimingIcon = INDICATOR_ICONS[TIMING_ICONS[timing]];
                  return (
                    <div key={timing} className="flex items-start p-3 rounded-lg" style={{ backgroundColor: '#f9fafb' }}>
                      <div className="mr-3" style={{ color: '#16a34a' }}>
                        {TimingIcon ? <TimingIcon className="w-6 h-6" /> : null}
                      </div>
                      <div>
                        <span className="font-medium capitalize" style={{ color: '#111827' }}>
                          {timing.replace(/_/g, ' ')}
                        </span>
                        <p className="text-sm mt-1" style={{ color: '#4b5563' }}>
                          {TIMING_DESCRIPTIONS[timing]}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Importance */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold flex items-center mb-3" style={{ color: '#111827' }}>
                <Info className="w-5 h-5 mr-2" style={{ color: '#16a34a' }} />
                Why This Matters
              </h3>
              <p className="leading-relaxed" style={{ color: '#374151' }}>{indicator.importance}</p>
            </div>

            {/* How to Assess */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold flex items-center mb-3" style={{ color: '#111827' }}>
                <ListChecks className="w-5 h-5 mr-2" style={{ color: '#16a34a' }} />
                Assessment Method
              </h3>
              <p className="leading-relaxed" style={{ color: '#374151' }}>{indicator.howToAssess}</p>
            </div>

            {/* Resource Concerns */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold flex items-center mb-3" style={{ color: '#111827' }}>
                <Info className="w-5 h-5 mr-2" style={{ color: '#16a34a' }} />
                Related Resource Concerns
              </h3>
              <div className="flex flex-wrap gap-2">
                {indicator.resourceConcerns.map((concern) => {
                  const concernLabels: Record<string, { name: string; bg: string; text: string; border: string }> = {
                    CPT: { name: 'Compaction', bg: '#ffedd5', text: '#9a3412', border: '#fdba74' },
                    SOM: { name: 'Soil Organic Matter Depletion', bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
                    AGG: { name: 'Aggregate Instability', bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
                    HAB: { name: 'Habitat Degradation', bg: '#f3e8ff', text: '#6b21a8', border: '#d8b4fe' }
                  }
                  const label = concernLabels[concern]
                  return (
                    <span
                      key={concern}
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: label.bg,
                        color: label.text,
                        border: `1px solid ${label.border}`
                      }}
                    >
                      {label.name}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Applicable Conservation Practices */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold flex items-center mb-3" style={{ color: '#111827' }}>
                <Wrench className="w-5 h-5 mr-2" style={{ color: '#16a34a' }} />
                Applicable Conservation Practices
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {indicator.practices.map((practiceCode) => (
                  <div
                    key={practiceCode}
                    className="flex items-start p-3 rounded-lg transition-colors"
                    style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#86efac'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                  >
                    <span className="font-mono text-sm font-medium mr-2" style={{ color: '#15803d' }}>
                      {practiceCode}
                    </span>
                    <span className="text-sm" style={{ color: '#374151' }}>
                      {CONSERVATION_PRACTICES[practiceCode]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 px-6 py-4" style={{ backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
            <button
              onClick={onClose}
              className="w-full px-6 py-2 rounded-lg shadow-md transition-colors"
              style={{ background: 'linear-gradient(to right, #16a34a, #15803d)', color: '#ffffff' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
