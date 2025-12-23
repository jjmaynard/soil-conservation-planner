'use client';

import { InterpretationResponse } from '../../lib/crop-suitability/types';

interface InterpretationPanelProps {
  interpretations: InterpretationResponse;
  inputLevel: string;
}

const CLASSIFICATION_STYLES = {
  excellent: { bg: '#dcfce7', text: '#166534', border: '#86efac' },
  good: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  moderate: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  poor: { bg: '#fed7aa', text: '#9a3412', border: '#fdba74' },
  very_poor: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' }
};

export default function InterpretationPanel({ interpretations, inputLevel }: InterpretationPanelProps) {
  const { suitability, sqi_interpretations, limiting_factors } = interpretations;
  const style = CLASSIFICATION_STYLES[suitability.overall_classification];

  return (
    <div className="space-y-6">
      {/* Overall Suitability */}
      <div className="p-6 rounded-xl border-2" style={{ 
        borderColor: style.border, 
        backgroundColor: style.bg,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold" style={{ color: '#111827' }}>Overall Suitability</h3>
          <span className="px-4 py-1.5 rounded-full text-sm font-semibold" style={{ color: style.text, backgroundColor: 'rgba(255,255,255,0.9)', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            {suitability.suitability_class}
          </span>
        </div>
        <p className="mb-3" style={{ color: '#1f2937' }}>{suitability.summary}</p>
        {suitability.primary_constraint && (
          <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
            <p className="text-sm font-medium" style={{ color: '#374151' }}>
              Primary Constraint: {suitability.primary_constraint}
            </p>
          </div>
        )}
        {suitability.secondary_constraints.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-medium" style={{ color: '#6b7280' }}>
              Secondary: {suitability.secondary_constraints.join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Individual SQI Interpretations */}
      <div>
        <h3 className="text-xl font-bold mb-5" style={{ color: '#111827', letterSpacing: '-0.025em' }}>Soil Quality Index Details</h3>
        <div className="space-y-3">
          {Object.entries(sqi_interpretations).map(([code, interp]) => {
            // For high input management, SQ1 is not considered
            const isHighInputSQ1 = code === 'SQ1' && inputLevel === 'H';
            const interpStyle = CLASSIFICATION_STYLES[interp.classification];
            
            return (
              <div 
                key={code} 
                className="border rounded-xl p-5 transition-all duration-200" 
                style={{ 
                  borderColor: isHighInputSQ1 ? '#e5e7eb' : interpStyle.border,
                  backgroundColor: isHighInputSQ1 ? '#fafafa' : `${interpStyle.bg}20`,
                  opacity: isHighInputSQ1 ? 0.6 : 1,
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
                onMouseEnter={(e) => {
                  if (!isHighInputSQ1) e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                }}
                onMouseLeave={(e) => {
                  if (!isHighInputSQ1) e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold" style={{ color: '#111827' }}>
                    {code}: {interp.index_name}
                  </div>
                  <div className="flex items-center space-x-2">
                    {isHighInputSQ1 ? (
                      <span className="px-3 py-1 rounded text-xs font-semibold" style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}>
                        Not Rated
                      </span>
                    ) : (
                      <>
                        <span className="text-lg font-bold" style={{ color: '#111827' }}>{interp.score.toFixed(1)}</span>
                        <span className="px-3 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: interpStyle.bg, color: interpStyle.text, border: `1px solid ${interpStyle.border}` }}>
                          {interp.classification}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {isHighInputSQ1 ? (
                  <p className="text-sm italic" style={{ color: '#9ca3af' }}>
                    Nutrient availability is not a limiting factor under high input management systems where adequate fertilization is assumed.
                  </p>
                ) : (
                  <>
                    <p className="text-sm mb-2" style={{ color: '#6b7280' }}>{interp.description}</p>
                    {interp.key_factors.length > 0 && (
                      <div className="text-xs" style={{ color: '#9ca3af' }}>
                        Key factors: {interp.key_factors.join(', ')}
                      </div>
                    )}
                    {interp.management_options.length > 0 && (
                      <div className="mt-2 pt-2 border-t" style={{ borderColor: '#e5e7eb' }}>
                        <div className="text-xs font-medium mb-1" style={{ color: '#374151' }}>Management Options:</div>
                        <ul className="text-xs space-y-1" style={{ color: '#6b7280' }}>
                          {interp.management_options.map((option, idx) => (
                            <li key={idx}>• {option}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Limiting Factors */}
      {limiting_factors.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-4" style={{ color: '#111827' }}>Limiting Factors</h3>
          <div className="space-y-2">
            {limiting_factors.map((factor, idx) => (
              <div
                key={idx}
                className="p-3 rounded border"
                style={{
                  borderColor: factor.is_primary ? '#fca5a5' : '#e5e7eb',
                  backgroundColor: factor.is_primary ? '#fef2f2' : 'white'
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium" style={{ color: '#111827' }}>
                    {factor.sqi_code}: {factor.sqi_name}
                  </span>
                  {factor.is_primary && (
                    <span className="px-2 py-1 text-xs rounded" style={{ backgroundColor: '#dc2626', color: 'white' }}>
                      Primary
                    </span>
                  )}
                </div>
                <p className="text-sm" style={{ color: '#6b7280' }}>{factor.impact_description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
