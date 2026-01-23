import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { Clock, Star, Calendar } from 'lucide-react';
import { getRecentUseCases, getFavoriteUseCases, getRecommendedUseCases } from '@/lib/use-case-utils';
import { getUseCase } from '@/config/use-cases';
import { getLandType } from '@/config/land-types';

interface QuickStartProps {
  onStartAnalysis: (landTypeId: string, useCaseId: string) => void;
}

export function UseCaseQuickStart({ onStartAnalysis }: QuickStartProps) {
  const [mounted, setMounted] = useState(false);
  const [recentUseCases, setRecentUseCases] = useState<any[]>([]);
  const [allFavorites, setAllFavorites] = useState<any[]>([]);

  // Only access localStorage on the client
  useEffect(() => {
    setMounted(true);
    setRecentUseCases(getRecentUseCases().slice(0, 4));
    setAllFavorites(getFavoriteUseCases());
  }, []);

  // Don't render anything until mounted (prevents hydration mismatch)
  if (!mounted) {
    return null;
  }
  
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
            <Clock className="w-4 h-4 mr-2" />
            Recent Analyses
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentUseCases.map((recent) => {
              const useCase = getUseCase(recent.use_case_id);
              const landType = getLandType(recent.land_type_id);
              
              if (!useCase || !landType) return null;
              
              const LandIcon = (LucideIcons as any)[landType.icon] || LucideIcons.Sprout;
              
              return (
                <button
                  key={`recent-${recent.use_case_id}-${recent.timestamp}`}
                  onClick={() => onStartAnalysis(recent.land_type_id, recent.use_case_id)}
                  className="quick-start-card p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div 
                      className="w-8 h-8 rounded flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${landType.gradient.from}, ${landType.gradient.to})`
                      }}
                    >
                      <LandIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs text-gray-400 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
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
                    <Clock className="w-3 h-3 mr-1" />
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
            <Star className="w-4 h-4 mr-2 text-yellow-500" fill="currentColor" />
            Favorites
          </h4>
          {Object.entries(favoritesByLandType).map(([landTypeId, useCases]) => {
            const landType = getLandType(landTypeId);
            if (!landType) return null;
            
            const LandIcon = (LucideIcons as any)[landType.icon] || LucideIcons.Sprout;
            const useCasesList = useCases as UseCase[];
            
            return (
              <div key={landTypeId} className="mb-4">
                <h5 className="text-xs font-medium text-gray-600 mb-2 flex items-center">
                  <div 
                    className="w-6 h-6 rounded flex items-center justify-center mr-2"
                    style={{
                      background: `linear-gradient(135deg, ${landType.gradient.from}, ${landType.gradient.to})`
                    }}
                  >
                    <LandIcon className="w-4 h-4 text-white" />
                  </div>
                  {landType.display_name}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {useCasesList.map((useCase) => (
                    <button
                      key={`fav-${useCase.id}`}
                      onClick={() => onStartAnalysis(landTypeId, useCase.id)}
                      className="quick-start-card p-3 border-2 border-yellow-200 bg-yellow-50 rounded-lg hover:border-yellow-400 hover:shadow-md transition-all text-left group"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h6 className="font-semibold text-gray-900 text-sm group-hover:text-yellow-700">
                          {useCase.short_name}
                        </h6>
                        <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
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
