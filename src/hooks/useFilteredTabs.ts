// Hook to manage use case-based tab filtering

import { useMemo } from 'react'

export type TabId = 'soil' | 'erosion' | 'drainage' | 'productivity' | 'svi' | 'flow' | 'drought' | 'vegetation' | 'terrain' | 'climate' | 'concerns' | 'practices' | 'zones'

export interface Tab {
  id: TabId
  label: string
  icon: any
  color: string
  bgColor: string
}

type UseCaseId = 'erosion' | 'production' | 'water' | 'compliance' | 'comprehensive'

const useCaseTabMapping: Record<UseCaseId, TabId[]> = {
  erosion: ['erosion', 'svi', 'flow', 'concerns', 'practices'],
  production: ['soil', 'productivity', 'zones', 'drainage'],
  water: ['drainage', 'drought', 'flow'],
  compliance: ['concerns', 'practices', 'erosion', 'drainage'],
  comprehensive: ['soil', 'erosion', 'drainage', 'productivity', 'svi', 'flow', 'drought', 'vegetation', 'terrain', 'climate', 'concerns', 'practices', 'zones']
}

export function useFilteredTabs(allTabs: Tab[], selectedUseCase: string | null): Tab[] {
  return useMemo(() => {
    // Return all tabs for all use cases until land type/land-use sub models are developed
    return allTabs
    
    // Original filtering logic (commented out for now):
    // if (!selectedUseCase || selectedUseCase === 'comprehensive') {
    //   return allTabs
    // }
    // const allowedTabIds = useCaseTabMapping[selectedUseCase]
    // return allTabs.filter(tab => allowedTabIds?.includes(tab.id))
  }, [allTabs])
}

export function getDefaultTab(selectedUseCase: string | null): TabId {
  // Return default tab until land type/land-use sub models are developed
  return 'soil'
  
  // Original logic (commented out for now):
  // if (!selectedUseCase) return 'soil'
  // const firstTab = useCaseTabMapping[selectedUseCase]?.[0]
  // return firstTab as TabId || 'soil'
}
