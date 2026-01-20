import React from 'react';
import { getRecentUseCases, getFavoriteUseCases, getRecommendedUseCases } from '@/lib/use-case-utils';
import { getUseCase } from '@/config/use-cases';
import { getLandType } from '@/config/land-types';

interface QuickStartProps {
  onStartAnalysis: (landTypeId: string, useCaseId: string) => void;
}

export function UseCaseQuickStart({ onStartAnalysis }: QuickStartProps) {
  const recentUseCases = getRecentUseCases().slice(0, 4);
  const allFavorites = getFavoriteUseCases();
  
  // Group favorites by land type
  const favoritesByLandType = allFavorites.reduce((acc, uc) => {
    if (!acc[uc.land_type_id]) {
      acc[uc.land_type_id] = [];
    }
    acc[uc.land_type_id].push(uc);
    return acc;
  }, {} as Record<string, any[]>);
  
  const hasQuickStartOptions = recentUseCases.length > 0 || allFavorites.length > 0;
  
  if (!hasQuickStartOptions) {
    return null;
  }
  
  return (
    <div className="use-case-quick-start bg-white rounded-lg shadow-sm p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Quick Start
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Jump back into your recent or favorite analyses
      </p>
      
      {/* Recent Use Cases */}
      {recentUseCases.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 uppercase mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent Analyses
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentUseCases.map((recent) => {
              const useCase = getUseCase(recent.use_case_id);
              const landType = getLandType(recent.land_type_id);
              
              if (!useCase || !landType) return null;
              
              return (
                <button
                  key={`recent-${recent.use_case_id}-${recent.timestamp}`}
                  onClick={() => onStartAnalysis(recent.land_type_id, recent.use_case_id)}
                  className="quick-start-card p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{landType.icon}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(recent.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <h5 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-blue-600">
                    {useCase.short_name}
                  </h5>
                  <p className="text-xs text-gray-500">
                    {landType.display_name}
                  </p>
                  <div className="mt-2 flex items-center text-xs text-gray-400">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {useCase.estimated_time}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Favorite Use Cases by Land Type */}
      {Object.keys(favoritesByLandType).length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 uppercase mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Favorites
          </h4>
          {Object.entries(favoritesByLandType).map(([landTypeId, useCases]) => {
            const landType = getLandType(landTypeId);
            if (!landType) return null;
            
            return (
              <div key={landTypeId} className="mb-4">
                <h5 className="text-xs font-medium text-gray-600 mb-2 flex items-center">
                  <span className="mr-2">{landType.icon}</span>
                  {landType.display_name}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {useCases.map((useCase) => (
                    <button
                      key={`fav-${useCase.id}`}
                      onClick={() => onStartAnalysis(landTypeId, useCase.id)}
                      className="quick-start-card p-3 border-2 border-yellow-200 bg-yellow-50 rounded-lg hover:border-yellow-400 hover:shadow-md transition-all text-left group"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h6 className="font-semibold text-gray-900 text-sm group-hover:text-yellow-700">
                          {useCase.short_name}
                        </h6>
                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {useCase.estimated_time}
                        <span className="mx-2">•</span>
                        {useCase.tab_ids.length} tabs
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
