import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Star, Clock, BarChart3, CheckCircle2 } from 'lucide-react';
import { getUseCasesByLandType, type UseCase } from '@/config/use-cases';
import { getLandType } from '@/config/land-types';
import { isFavoriteUseCase, addFavoriteUseCase, removeFavoriteUseCase } from '@/lib/storage/browser-storage';

interface UseCaseSelectorProps {
  landTypeId: string;
  onSelect: (useCaseId: string) => void;
  selectedUseCase?: string | null;
}

export function FieldUseCaseSelector({ 
  landTypeId, 
  onSelect, 
  selectedUseCase
}: UseCaseSelectorProps) {
  
  const allUseCases = getUseCasesByLandType(landTypeId);
  const landType = getLandType(landTypeId);
  
  // Display all use cases (no filtering or sorting for now)
  const displayedUseCases = allUseCases;
  
  const handleFavoriteToggle = (useCaseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavoriteUseCase(useCaseId)) {
      removeFavoriteUseCase(useCaseId);
    } else {
      addFavoriteUseCase(useCaseId);
    }
  };

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon || LucideIcons.Sprout;
  };

  if (!landType) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Invalid land type selected</p>
      </div>
    );
  }

  const LandIcon = getIcon(landType.icon);

  return (
    <div className="use-case-selector max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center mb-4">
          <div 
            className="w-16 h-16 rounded-lg flex items-center justify-center mr-3"
            style={{
              background: `linear-gradient(135deg, ${landType.gradient.from}, ${landType.gradient.to})`
            }}
          >
            <LandIcon className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h2 className="text-3xl font-bold text-gray-900">
              {landType.display_name}
            </h2>
            <p className="text-sm text-gray-500">
              {landType.description}
            </p>
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mt-4">
          What do you want to analyze?
        </h3>
        <p className="text-gray-600">
          Choose an analysis workflow that matches your goals
        </p>
      </div>

      <div className="use-case-list grid grid-cols-1 lg:grid-cols-2 gap-6 mx-auto">
        {displayedUseCases.map((useCase) => (
          <UseCaseCard
            key={useCase.id}
            useCase={useCase}
            isSelected={selectedUseCase === useCase.id}
            isFavorite={isFavoriteUseCase(useCase.id)}
            onSelect={onSelect}
            onFavoriteToggle={handleFavoriteToggle}
          />
        ))}
      </div>

      {displayedUseCases.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No use cases available for this land type.
          </p>
        </div>
      )}
    </div>
  );
}

// Use Case Card Component
interface UseCaseCardProps {
  useCase: UseCase;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: (useCaseId: string) => void;
  onFavoriteToggle: (useCaseId: string, e: React.MouseEvent) => void;
}

function UseCaseCard({ 
  useCase, 
  isSelected, 
  isFavorite,
  onSelect, 
  onFavoriteToggle 
}: UseCaseCardProps) {
  // Always show light background tint using the use case's color
  const cardBgColor = useCase.bgColor || 'white';
  const borderColor = isSelected && useCase.color
    ? useCase.color
    : '#d1d5db';
  
  return (
    <div
      role="button"
      tabIndex={0}
      className={`
        use-case-card text-left p-6 rounded-lg border-2 transition-all duration-200
        hover:shadow-lg hover:scale-102 relative cursor-pointer
        ${isSelected ? 'shadow-md' : 'hover:border-gray-400'}
      `}
      style={{
        backgroundColor: cardBgColor,
        borderColor: borderColor
      }}
      onClick={() => onSelect(useCase.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(useCase.id);
        }
      }}
      aria-pressed={isSelected}
    >
      {/* Color accent bar on left */}
      {useCase.color && (
        <div 
          className="absolute left-0 top-6 bottom-6 w-1 rounded-r"
          style={{ backgroundColor: useCase.color }}
        />
      )}
      
      {/* Favorite and Selection Indicators */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          {isSelected && (
            <div className="inline-flex items-center justify-center mb-2">
              <CheckCircle2 
                className="w-6 h-6" 
                style={{ color: useCase.color || '#16a34a' }}
              />
            </div>
          )}
        </div>
        
        {/* Favorite Toggle */}
        <button
          onClick={(e) => onFavoriteToggle(useCase.id, e)}
          className={`p-1 rounded transition-colors ${
            isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-500'
          }`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star className="w-6 h-6" fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Title */}
      <h4 
        className="text-xl font-semibold mb-2"
        style={{ color: isSelected && useCase.color ? useCase.color : '#111827' }}
      >
        {useCase.short_name}
      </h4>

      {/* Description */}
      <p className={`text-sm mb-4 ${
        isSelected ? 'text-blue-700' : 'text-gray-600'
      }`}>
        {useCase.description}
      </p>

      {/* Objectives */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
          What you&apos;ll get:
        </p>
        <ul className="space-y-1">
          {useCase.objectives.map((objective, idx) => (
            <li key={idx} className="flex items-start text-sm text-gray-700">
              <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
              {objective}
            </li>
          ))}
        </ul>
      </div>

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-200 pt-3">
        <span className="flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          {useCase.estimated_time}
        </span>
        <span className="flex items-center">
          <BarChart3 className="w-4 h-4 mr-1" />
          {useCase.tab_ids.length} analyses
        </span>
      </div>

      {/* Target Users (optional display) */}
      {useCase.target_users && useCase.target_users.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {useCase.target_users.slice(0, 3).map((user, idx) => (
            <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
              {user}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
