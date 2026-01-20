// Hook to manage use case-based tab filtering

import { useMemo } from 'react'
import type { UseCase } from '../components/FieldAnalysis/UseCaseSelector'

export type TabId = 'soil' | 'erosion' | 'drainage' | 'productivity' | 'svi' | 'flow' | 'drought' | 'concerns' | 'practices' | 'zones'

export interface Tab {
  id: TabId
  label: string
  icon: any
  color: string
  bgColor: string
}

const useCaseTabMapping: Record<UseCase, TabId[]> = {
  erosion: ['erosion', 'svi', 'flow', 'concerns', 'practices'],
  production: ['soil', 'productivity', 'zones', 'drainage'],
  water: ['drainage', 'drought', 'flow'],
  compliance: ['concerns', 'practices', 'erosion', 'drainage'],
  comprehensive: ['soil', 'erosion', 'drainage', 'productivity', 'svi', 'flow', 'drought', 'concerns', 'practices', 'zones']
}

export function useFilteredTabs(allTabs: Tab[], selectedUseCase: UseCase | null): Tab[] {
  return useMemo(() => {
    if (!selectedUseCase || selectedUseCase === 'comprehensive') {
      return allTabs
    }
    
    const allowedTabIds = useCaseTabMapping[selectedUseCase]
    return allTabs.filter(tab => allowedTabIds.includes(tab.id))
  }, [allTabs, selectedUseCase])
}

export function getDefaultTab(selectedUseCase: UseCase | null): TabId {
  if (!selectedUseCase) return 'soil'
  
  const firstTab = useCaseTabMapping[selectedUseCase][0]
  return firstTab as TabId
}
