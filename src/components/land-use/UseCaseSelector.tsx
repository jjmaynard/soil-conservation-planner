import React, { useState, useMemo } from 'react';
import { getUseCasesByLandType, type UseCase } from '@/config/use-cases';
import { getLandType } from '@/config/land-types';
import { isFavoriteUseCase } from '@/lib/storage/browser-storage';
import { 
  searchUseCases, 
  sortUseCases, 
  getFavoriteUseCases, 
  getRecommendedUseCases,
  toggleFavorite,
  type SortCriteria 
} from '@/lib/use-case-utils';

interface UseCaseSelectorProps {
  landTypeId: string;
  onSelect: (useCaseId: string) => void;
  selectedUseCase?: string | null;
  showSearch?: boolean;
  showFavorites?: boolean;
  showRecommended?: boolean;
}

export function UseCaseSelector({ 
  landTypeId, 
  onSelect, 
  selectedUseCase,
  showSearch = true,
  showFavorites = true,
  showRecommended = true
}: UseCaseSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortCriteria>('default');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  const allUseCases = getUseCasesByLandType(landTypeId);
  const favorites = getFavoriteUseCases(landTypeId);
  const recommended = getRecommendedUseCases(landTypeId, 3);
  const landType = getLandType(landTypeId);
  
  // Filter and sort use cases
  const displayedUseCases = useMemo(() => {
    let cases = showFavoritesOnly ? favorites : allUseCases;
    
    // Apply search filter
    if (searchQuery) {
      cases = searchUseCases(cases, searchQuery);
    }
    
    // Apply sorting
    return sortUseCases(cases, sortBy);
  }, [allUseCases, favorites, showFavoritesOnly, searchQuery, sortBy]);
  
  const handleFavoriteToggle = (useCaseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(useCaseId);
    // Force re-render by updating a state (this is a bit hacky but works)
    setSearchQuery(prev => prev);
  };

  if (!landType) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Invalid land type selected</p>
      </div>
    );
  }

  return (
    <div className="use-case-selector">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center mb-4">
          <span className="text-5xl mr-3">{landType.icon}</span>
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

      {/* Search and Filter Controls */}
      {(showSearch || showFavorites) && (
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          {showSearch && (
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search use cases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg 
                  className="absolute left-3 top-3 w-5 h-5 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          )}
          
          {/* Filter and Sort Controls */}
          <div className="flex flex-wrap justify-center gap-3">
            {showFavorites && favorites.length > 0 && (
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showFavoritesOnly
                    ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-400'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ⭐ Favorites {showFavoritesOnly && `(${favorites.length})`}
              </button>
            )}
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortCriteria)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <option value="default">Sort: Default</option>
              <option value="name">Sort: Name</option>
              <option value="time">Sort: Time</option>
              <option value="popularity">Sort: Popularity</option>
              <option value="recent">Sort: Recent</option>
            </select>
          </div>
        </div>
      )}

      {/* Recommended Use Cases */}
      {showRecommended && recommended.length > 0 && !searchQuery && !showFavoritesOnly && (
        <div className="mb-8">
          <h4 className="text-sm font-semibold text-gray-600 uppercase mb-3">
            Recommended for You
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommended.map((useCase) => (
              <UseCaseCard
                key={useCase.id}
                useCase={useCase}
                isSelected={selectedUseCase === useCase.id}
                isFavorite={isFavoriteUseCase(useCase.id)}
                isRecommended
                onSelect={onSelect}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
          <div className="border-t border-gray-200 my-6" />
        </div>
      )}

      {/* All Use Cases */}
      <div className="use-case-list grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
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
            {searchQuery 
              ? `No use cases found matching "${searchQuery}"`
              : showFavoritesOnly
                ? 'No favorite use cases yet. Click the star icon to add favorites!'
                : 'No use cases available for this land type yet.'
            }
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
  isRecommended?: boolean;
  onSelect: (useCaseId: string) => void;
  onFavoriteToggle: (useCaseId: string, e: React.MouseEvent) => void;
}

function UseCaseCard({ 
  useCase, 
  isSelected, 
  isFavorite, 
  isRecommended,
  onSelect, 
  onFavoriteToggle 
}: UseCaseCardProps) {
  return (
    <button
      className={`
        use-case-card text-left p-6 rounded-lg border-2 transition-all duration-200
        hover:shadow-lg hover:scale-102 relative
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-300 bg-white hover:border-gray-400'
        }
        ${isRecommended ? 'ring-2 ring-green-200' : ''}
      `}
      onClick={() => onSelect(useCase.id)}
      aria-pressed={isSelected}
    >
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          Recommended
        </div>
      )}

      {/* Favorite and Selection Indicators */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          {isSelected && (
            <div className="inline-flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full mb-2">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
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
          <svg className="w-6 h-6" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
      </div>

      {/* Title */}
      <h4 className={`text-xl font-semibold mb-2 ${
        isSelected ? 'text-blue-900' : 'text-gray-900'
      }`}>
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
          What you'll get:
        </p>
        <ul className="space-y-1">
          {useCase.objectives.map((objective, idx) => (
            <li key={idx} className="flex items-start text-sm text-gray-700">
              <svg className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {objective}
            </li>
          ))}
        </ul>
      </div>

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-200 pt-3">
        <span className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {useCase.estimated_time}
        </span>
        <span className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
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
    </button>
  );
}
