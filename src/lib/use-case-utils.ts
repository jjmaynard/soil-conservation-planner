import { UseCase, getUseCasesByLandType, getUseCase, USE_CASES } from '@/config/use-cases';
import { getUserPreferences, saveUserPreferences, addFavoriteUseCase, removeFavoriteUseCase, isFavoriteUseCase } from '@/lib/storage/browser-storage';

/**
 * Filter use cases by search query
 */
export function searchUseCases(useCases: UseCase[], query: string): UseCase[] {
  if (!query.trim()) return useCases;
  
  const lowerQuery = query.toLowerCase();
  
  return useCases.filter(uc => 
    uc.name.toLowerCase().includes(lowerQuery) ||
    uc.short_name.toLowerCase().includes(lowerQuery) ||
    uc.description.toLowerCase().includes(lowerQuery) ||
    uc.objectives.some(obj => obj.toLowerCase().includes(lowerQuery)) ||
    uc.target_users.some(user => user.toLowerCase().includes(lowerQuery)) ||
    (uc.keywords && uc.keywords.some(kw => kw.toLowerCase().includes(lowerQuery)))
  );
}

/**
 * Sort use cases by various criteria
 */
export type SortCriteria = 'default' | 'name' | 'time' | 'popularity' | 'recent';

export function sortUseCases(useCases: UseCase[], criteria: SortCriteria = 'default'): UseCase[] {
  const sorted = [...useCases];
  
  switch (criteria) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    
    case 'time':
      // Sort by estimated time (extract number from "2-3 minutes" format)
      return sorted.sort((a, b) => {
        const timeA = parseInt(a.estimated_time.match(/\d+/)?.[0] || '999');
        const timeB = parseInt(b.estimated_time.match(/\d+/)?.[0] || '999');
        return timeA - timeB;
      });
    
    case 'popularity':
      // Sort by number of tabs (more comprehensive analysis = more popular)
      return sorted.sort((a, b) => b.tab_ids.length - a.tab_ids.length);
    
    case 'recent':
      // Sort by recent usage (requires usage tracking)
      const recentUseCases = getRecentUseCases();
      return sorted.sort((a, b) => {
        const indexA = recentUseCases.findIndex(r => r.use_case_id === a.id);
        const indexB = recentUseCases.findIndex(r => r.use_case_id === b.id);
        
        // If not in recent list, sort to end
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        
        return indexA - indexB;
      });
    
    case 'default':
    default:
      return sorted.sort((a, b) => a.sort_order - b.sort_order);
  }
}

/**
 * Filter use cases by target user role
 */
export function filterByTargetUser(useCases: UseCase[], role: string): UseCase[] {
  return useCases.filter(uc => 
    uc.target_users.some(user => user.toLowerCase().includes(role.toLowerCase()))
  );
}

/**
 * Get favorite use cases
 */
export function getFavoriteUseCases(landTypeId?: string): UseCase[] {
  const prefs = getUserPreferences();
  const favorites = prefs.favorite_use_cases || [];
  
  let allUseCases = USE_CASES.filter(uc => favorites.includes(uc.id));
  
  if (landTypeId) {
    allUseCases = allUseCases.filter(uc => uc.land_type_id === landTypeId);
  }
  
  return allUseCases.sort((a, b) => a.sort_order - b.sort_order);
}

/**
 * Toggle favorite status for a use case
 */
export function toggleFavorite(useCaseId: string): boolean {
  if (isFavoriteUseCase(useCaseId)) {
    removeFavoriteUseCase(useCaseId);
    return false;
  } else {
    addFavoriteUseCase(useCaseId);
    return true;
  }
}

/**
 * Get recommended use cases based on user history
 */
export function getRecommendedUseCases(landTypeId: string, limit: number = 3): UseCase[] {
  const recentUseCases = getRecentUseCases();
  const favorites = getFavoriteUseCases(landTypeId);
  const allUseCases = getUseCasesByLandType(landTypeId);
  
  // Combine favorites and recent, removing duplicates
  const recommended = new Map<string, UseCase>();
  
  // Add favorites first
  favorites.slice(0, limit).forEach(uc => recommended.set(uc.id, uc));
  
  // Add recent use cases if we have room
  for (const recent of recentUseCases) {
    if (recommended.size >= limit) break;
    const uc = getUseCase(recent.use_case_id);
    if (uc && uc.land_type_id === landTypeId && !recommended.has(uc.id)) {
      recommended.set(uc.id, uc);
    }
  }
  
  // Fill remaining slots with popular use cases (most tabs)
  if (recommended.size < limit) {
    const popular = [...allUseCases]
      .sort((a, b) => b.tab_ids.length - a.tab_ids.length)
      .filter(uc => !recommended.has(uc.id));
    
    for (const uc of popular) {
      if (recommended.size >= limit) break;
      recommended.set(uc.id, uc);
    }
  }
  
  return Array.from(recommended.values());
}

/**
 * Get recent use case selections
 */
interface RecentUseCase {
  use_case_id: string;
  land_type_id: string;
  timestamp: number;
}

const RECENT_USE_CASES_KEY = 'recent_use_cases';
const MAX_RECENT_ITEMS = 10;

export function getRecentUseCases(): RecentUseCase[] {
  try {
    const stored = localStorage.getItem(RECENT_USE_CASES_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading recent use cases:', error);
    return [];
  }
}

export function addRecentUseCase(useCaseId: string, landTypeId: string): void {
  try {
    const recent = getRecentUseCases();
    
    // Remove existing entry if present
    const filtered = recent.filter(r => r.use_case_id !== useCaseId);
    
    // Add to front
    filtered.unshift({
      use_case_id: useCaseId,
      land_type_id: landTypeId,
      timestamp: Date.now()
    });
    
    // Keep only recent items
    const trimmed = filtered.slice(0, MAX_RECENT_ITEMS);
    
    localStorage.setItem(RECENT_USE_CASES_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error saving recent use case:', error);
  }
}

export function clearRecentUseCases(): void {
  localStorage.removeItem(RECENT_USE_CASES_KEY);
}

/**
 * Get use case statistics
 */
export function getUseCaseStats(useCaseId: string): {
  totalTabs: number;
  estimatedMinutes: number;
  apiCallsRequired: number;
  cacheableAPIs: number;
} {
  const useCase = getUseCase(useCaseId);
  if (!useCase) {
    return {
      totalTabs: 0,
      estimatedMinutes: 0,
      apiCallsRequired: 0,
      cacheableAPIs: 0
    };
  }
  
  const estimatedMinutes = parseInt(useCase.estimated_time.match(/\d+/)?.[0] || '0');
  const apiIntegrations = Object.keys(useCase.api_integrations).filter(
    key => useCase.api_integrations[key]
  );
  
  return {
    totalTabs: useCase.tab_ids.length,
    estimatedMinutes,
    apiCallsRequired: apiIntegrations.length,
    cacheableAPIs: apiIntegrations.length // All APIs are cacheable in our system
  };
}

/**
 * Validate if use case is compatible with land type
 */
export function isUseCaseCompatible(useCaseId: string, landTypeId: string): boolean {
  const useCase = getUseCase(useCaseId);
  return useCase ? useCase.land_type_id === landTypeId : false;
}

/**
 * Get use cases that share similar objectives
 */
export function getSimilarUseCases(useCaseId: string, limit: number = 3): UseCase[] {
  const useCase = getUseCase(useCaseId);
  if (!useCase) return [];
  
  const allUseCases = USE_CASES.filter(uc => 
    uc.id !== useCaseId && 
    uc.land_type_id === useCase.land_type_id &&
    uc.is_active
  );
  
  // Score by shared objectives and keywords
  const scored = allUseCases.map(uc => {
    let score = 0;
    
    // Shared objectives
    const sharedObjectives = uc.objectives.filter(obj =>
      useCase.objectives.some(origObj => 
        obj.toLowerCase().includes(origObj.toLowerCase()) ||
        origObj.toLowerCase().includes(obj.toLowerCase())
      )
    ).length;
    score += sharedObjectives * 3;
    
    // Shared keywords
    if (uc.keywords && useCase.keywords) {
      const sharedKeywords = uc.keywords.filter(kw =>
        useCase.keywords!.some(origKw => kw === origKw)
      ).length;
      score += sharedKeywords * 2;
    }
    
    // Shared tabs
    const sharedTabs = uc.tab_ids.filter(tab =>
      useCase.tab_ids.includes(tab)
    ).length;
    score += sharedTabs;
    
    return { useCase: uc, score };
  });
  
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.useCase);
}
