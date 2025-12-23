'use client';

import { ManagementRecommendation } from '../../lib/crop-suitability/types';
import { Lightbulb } from 'lucide-react';

interface RecommendationsCardProps {
  recommendations: ManagementRecommendation[];
}

export default function RecommendationsCard({ recommendations }: RecommendationsCardProps) {
  if (recommendations.length === 0) {
    return null;
  }

  const getPriorityColor = (priority: number) => {
    if (priority === 1) return '#ef4444';
    if (priority === 2) return '#f97316';
    if (priority === 3) return '#f59e0b';
    return '#3b82f6';
  };

  return (
    <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}>
      <h3 className="text-xl font-bold mb-5" style={{ color: '#111827', letterSpacing: '-0.025em' }}>Management Recommendations</h3>
      <div className="space-y-4">
        {recommendations.map((rec, idx) => (
          <div 
            key={idx} 
            className="border rounded-xl p-5 transition-all duration-200" 
            style={{ 
              borderColor: '#e5e7eb',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'}
          >
            <div className="flex items-start space-x-3">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ backgroundColor: getPriorityColor(rec.priority), color: 'white' }}
              >
                {rec.priority}
              </div>
              <div className="flex-1">
                <div className="font-semibold mb-1" style={{ color: '#111827' }}>
                  {rec.category}
                </div>
                <p className="text-sm mb-2" style={{ color: '#374151' }}>{rec.recommendation}</p>
                {rec.target_sqi && (
                  <div className="text-xs" style={{ color: '#6b7280' }}>
                    Targets: {rec.target_sqi}
                  </div>
                )}
                {rec.expected_improvement && (
                  <div className="text-xs mt-1 flex items-center gap-1" style={{ color: '#16a34a' }}>
                    <Lightbulb className="h-3 w-3" />
                    {rec.expected_improvement}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
