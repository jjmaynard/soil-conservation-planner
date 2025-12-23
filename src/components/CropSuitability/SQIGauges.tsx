'use client';

import { SoilQualityIndices, InputLevel } from '../../lib/crop-suitability/types';

interface SQIGaugesProps {
  indices: SoilQualityIndices;
  inputLevel: InputLevel;
}

const SQI_INFO = {
  SQ1: { name: 'Nutrient Availability', color: '#10b981' },
  SQ2: { name: 'Nutrient Retention', color: '#3b82f6' },
  SQ3: { name: 'Rooting Conditions', color: '#8b5cf6' },
  SQ4: { name: 'Oxygen Availability', color: '#06b6d4' },
  SQ5: { name: 'Salinity/Sodicity', color: '#f59e0b' },
  SQ6: { name: 'Lime/Gypsum', color: '#ec4899' },
  SQ7: { name: 'Workability', color: '#6366f1' },
  SR: { name: 'Overall Rating', color: '#ef4444' }
};

function getScoreColor(score: number): string {
  // Green (100%) to Red (0%) gradient
  if (score >= 80) return '#10b981'; // Green
  if (score >= 60) return '#84cc16'; // Lime
  if (score >= 40) return '#f59e0b'; // Amber/Yellow
  if (score >= 20) return '#f97316'; // Orange
  return '#ef4444'; // Red
}

export default function SQIGauges({ indices, inputLevel }: SQIGaugesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {Object.entries(indices).map(([code, value]) => {
        const info = SQI_INFO[code as keyof typeof SQI_INFO];
        const isOverall = code === 'SR';
        const isHighInputSQ1 = code === 'SQ1' && inputLevel === 'H';
        const scoreColor = getScoreColor(value);
        
        return (
          <div
            key={code}
            className="relative p-6 rounded-2xl transition-all duration-300"
            style={{
              background: isOverall 
                ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' 
                : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
              border: isOverall ? '2px solid #fecaca' : '1px solid #e5e7eb',
              boxShadow: isOverall 
                ? '0 4px 12px rgba(239, 68, 68, 0.15)' 
                : '0 2px 8px rgba(0, 0, 0, 0.08)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = isOverall
                ? '0 8px 20px rgba(239, 68, 68, 0.2)'
                : '0 8px 20px rgba(0, 0, 0, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = isOverall
                ? '0 4px 12px rgba(239, 68, 68, 0.15)'
                : '0 2px 8px rgba(0, 0, 0, 0.08)';
            }}
          >
            {/* Label Badge */}
            <div className="flex items-center justify-between mb-4">
              <span 
                className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold"
                style={{ 
                  backgroundColor: isOverall ? '#fee2e2' : '#f3f4f6',
                  color: isOverall ? '#991b1b' : '#374151',
                  border: `1px solid ${isOverall ? '#fecaca' : '#e5e7eb'}`
                }}
              >
                {code}
              </span>
            </div>

            {/* Index Name */}
            <div className="text-sm font-medium mb-3" style={{ color: '#6b7280', lineHeight: '1.4' }}>
              {info.name}
            </div>
            
            {isHighInputSQ1 ? (
              <>
                <div className="flex items-center mb-3">
                  <div 
                    className="text-base font-semibold px-4 py-2 rounded-xl" 
                    style={{ 
                      color: '#6b7280', 
                      backgroundColor: 'rgba(243, 244, 246, 0.8)',
                      border: '1.5px dashed #d1d5db'
                    }}
                  >
                    Not Rated
                  </div>
                </div>
                <div className="text-xs leading-relaxed" style={{ color: '#9ca3af' }}>
                  Not limiting under high input
                </div>
              </>
            ) : (
              <>
                {/* Score Display */}
                <div className="flex items-baseline space-x-2 mb-4">
                  <div 
                    className="text-4xl font-bold tracking-tight" 
                    style={{ 
                      color: scoreColor,
                      textShadow: `0 2px 8px ${scoreColor}20`
                    }}
                  >
                    {value.toFixed(1)}
                  </div>
                  <div className="text-lg font-medium" style={{ color: '#d1d5db' }}>/100</div>
                </div>
                
                {/* Progress Bar */}
                <div className="relative w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#f3f4f6' }}>
                  <div
                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out"
                    style={{ 
                      width: `${Math.min(value, 100)}%`,
                      background: `linear-gradient(90deg, ${scoreColor} 0%, ${scoreColor}dd 100%)`,
                      boxShadow: `0 0 12px ${scoreColor}50, inset 0 1px 2px rgba(255,255,255,0.3)`
                    }}
                  >
                    {/* Shine effect */}
                    <div 
                      className="absolute top-0 left-0 w-full h-1/2 rounded-full"
                      style={{
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)'
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
