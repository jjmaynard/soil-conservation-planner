// Browser Storage Implementation
// Session and user preference management using browser storage APIs

export interface AnalysisSession {
  session_id: string;
  land_type_id: string;
  use_case_id: string;
  field_geometry: any; // GeoJSON
  field_name?: string;
  session_data?: Record<string, any>;
  completed_tabs: string[];
  created_at: number;
  updated_at: number;
}

export interface UserPreferences {
  default_land_type?: string;
  favorite_use_cases: string[];
  preferred_units: Record<string, string>;
  theme?: 'light' | 'dark' | 'auto';
  map_settings?: {
    default_zoom: number;
    default_center: [number, number];
    preferred_basemap: string;
  };
}

// ============================================================================
// SESSION STORAGE (cleared when tab closes)
// ============================================================================

/**
 * Get the current analysis session
 * @returns Current session or null if none exists
 */
export function getCurrentSession(): AnalysisSession | null {
  try {
    const session = sessionStorage.getItem('current_analysis');
    return session ? JSON.parse(session) : null;
  } catch (error) {
    console.error('Error reading session:', error);
    return null;
  }
}

/**
 * Save the current analysis session
 * @param session - Session data to save
 */
export function saveCurrentSession(session: AnalysisSession): void {
  try {
    session.updated_at = Date.now();
    sessionStorage.setItem('current_analysis', JSON.stringify(session));
  } catch (error) {
    console.error('Error saving session:', error);
  }
}

/**
 * Clear the current analysis session
 */
export function clearCurrentSession(): void {
  try {
    sessionStorage.removeItem('current_analysis');
  } catch (error) {
    console.error('Error clearing session:', error);
  }
}

/**
 * Create a new analysis session
 * @param landTypeId - ID of the land type
 * @param useCaseId - ID of the use case
 * @param fieldGeometry - GeoJSON geometry of the field
 * @param fieldName - Optional name for the field
 * @returns New session object
 */
export function createNewSession(
  landTypeId: string,
  useCaseId: string,
  fieldGeometry: any,
  fieldName?: string
): AnalysisSession {
  const session: AnalysisSession = {
    session_id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    land_type_id: landTypeId,
    use_case_id: useCaseId,
    field_geometry: fieldGeometry,
    field_name: fieldName,
    session_data: {},
    completed_tabs: [],
    created_at: Date.now(),
    updated_at: Date.now()
  };
  
  saveCurrentSession(session);
  return session;
}

/**
 * Mark a tab as completed in the current session
 * @param tabId - ID of the tab to mark as completed
 */
export function markTabCompleted(tabId: string): void {
  const session = getCurrentSession();
  if (session && !session.completed_tabs.includes(tabId)) {
    session.completed_tabs.push(tabId);
    saveCurrentSession(session);
  }
}

/**
 * Update session data
 * @param key - Data key
 * @param value - Data value
 */
export function updateSessionData(key: string, value: any): void {
  const session = getCurrentSession();
  if (session) {
    if (!session.session_data) {
      session.session_data = {};
    }
    session.session_data[key] = value;
    saveCurrentSession(session);
  }
}

/**
 * Get session data by key
 * @param key - Data key
 * @returns Data value or undefined
 */
export function getSessionData<T = any>(key: string): T | undefined {
  const session = getCurrentSession();
  return session?.session_data?.[key] as T | undefined;
}

// ============================================================================
// LOCAL STORAGE (persists across sessions)
// ============================================================================

/**
 * Get user preferences
 * @returns User preferences object
 */
export function getUserPreferences(): UserPreferences {
  try {
    const prefs = localStorage.getItem('user_preferences');
    return prefs ? JSON.parse(prefs) : {
      favorite_use_cases: [],
      preferred_units: {}
    };
  } catch (error) {
    console.error('Error reading preferences:', error);
    return {
      favorite_use_cases: [],
      preferred_units: {}
    };
  }
}

/**
 * Save user preferences
 * @param prefs - Preferences to save
 */
export function saveUserPreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem('user_preferences', JSON.stringify(prefs));
  } catch (error) {
    console.error('Error saving preferences:', error);
  }
}

/**
 * Update a single preference
 * @param key - Preference key
 * @param value - Preference value
 */
export function updatePreference<K extends keyof UserPreferences>(
  key: K,
  value: UserPreferences[K]
): void {
  const prefs = getUserPreferences();
  prefs[key] = value;
  saveUserPreferences(prefs);
}

/**
 * Add a use case to favorites
 * @param useCaseId - ID of use case to favorite
 */
export function addFavoriteUseCase(useCaseId: string): void {
  const prefs = getUserPreferences();
  if (!prefs.favorite_use_cases.includes(useCaseId)) {
    prefs.favorite_use_cases.push(useCaseId);
    saveUserPreferences(prefs);
  }
}

/**
 * Remove a use case from favorites
 * @param useCaseId - ID of use case to unfavorite
 */
export function removeFavoriteUseCase(useCaseId: string): void {
  const prefs = getUserPreferences();
  prefs.favorite_use_cases = prefs.favorite_use_cases.filter(id => id !== useCaseId);
  saveUserPreferences(prefs);
}

/**
 * Check if a use case is favorited
 * @param useCaseId - ID of use case to check
 * @returns True if favorited
 */
export function isFavoriteUseCase(useCaseId: string): boolean {
  const prefs = getUserPreferences();
  return prefs.favorite_use_cases.includes(useCaseId);
}

/**
 * Set preferred units for a measurement type
 * @param measurementType - Type of measurement (e.g., 'length', 'area', 'erosion')
 * @param unit - Preferred unit (e.g., 'feet', 'acres', 'tons/acre/year')
 */
export function setPreferredUnit(measurementType: string, unit: string): void {
  const prefs = getUserPreferences();
  prefs.preferred_units[measurementType] = unit;
  saveUserPreferences(prefs);
}

/**
 * Get preferred unit for a measurement type
 * @param measurementType - Type of measurement
 * @param defaultUnit - Default unit if no preference set
 * @returns Preferred unit or default
 */
export function getPreferredUnit(measurementType: string, defaultUnit: string): string {
  const prefs = getUserPreferences();
  return prefs.preferred_units[measurementType] || defaultUnit;
}

// ============================================================================
// SESSION HISTORY (saved in localStorage)
// ============================================================================

export interface SessionHistoryItem {
  session_id: string;
  land_type_id: string;
  use_case_id: string;
  field_name?: string;
  created_at: number;
  completed_tabs: string[];
}

const MAX_HISTORY_ITEMS = 10;

/**
 * Add current session to history
 */
export function addToSessionHistory(): void {
  const session = getCurrentSession();
  if (!session) return;

  try {
    const historyItem: SessionHistoryItem = {
      session_id: session.session_id,
      land_type_id: session.land_type_id,
      use_case_id: session.use_case_id,
      field_name: session.field_name,
      created_at: session.created_at,
      completed_tabs: session.completed_tabs
    };

    const history = getSessionHistory();
    
    // Remove duplicate if exists
    const filtered = history.filter(h => h.session_id !== session.session_id);
    
    // Add to beginning
    filtered.unshift(historyItem);
    
    // Trim to max length
    const trimmed = filtered.slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem('session_history', JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error saving session history:', error);
  }
}

/**
 * Get session history
 * @returns Array of past sessions
 */
export function getSessionHistory(): SessionHistoryItem[] {
  try {
    const history = localStorage.getItem('session_history');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error reading session history:', error);
    return [];
  }
}

/**
 * Clear session history
 */
export function clearSessionHistory(): void {
  try {
    localStorage.removeItem('session_history');
  } catch (error) {
    console.error('Error clearing session history:', error);
  }
}

// ============================================================================
// STORAGE UTILITIES
// ============================================================================

/**
 * Get storage usage statistics
 * @returns Storage statistics
 */
export function getStorageStats(): {
  sessionStorage: { used: number; available: boolean };
  localStorage: { used: number; itemCount: number };
} {
  let sessionUsed = 0;
  let localUsed = 0;
  let localItemCount = 0;

  try {
    // Session storage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key);
        if (value) {
          sessionUsed += key.length + value.length;
        }
      }
    }

    // Local storage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          localUsed += key.length + value.length;
          localItemCount++;
        }
      }
    }
  } catch (error) {
    console.error('Error calculating storage stats:', error);
  }

  return {
    sessionStorage: {
      used: sessionUsed,
      available: true
    },
    localStorage: {
      used: localUsed,
      itemCount: localItemCount
    }
  };
}

/**
 * Clear all application data from storage
 */
export function clearAllStorage(): void {
  clearCurrentSession();
  clearSessionHistory();
  localStorage.removeItem('user_preferences');
  console.log('All application storage cleared');
}
