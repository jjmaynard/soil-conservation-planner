// Custom hook for managing depth selection state

'use client'

import { useCallback, useState } from 'react'
import type { SoilDepth } from '#src/types/soil'

export const AVAILABLE_DEPTHS: SoilDepth[] = [
  '0-5cm',
  '5-15cm',
  '15-30cm',
  '30-60cm',
  '60-100cm',
  '100-200cm',
]

export function useDepthSelection(initialDepth: SoilDepth = '0-5cm') {
  const [selectedDepth, setSelectedDepth] = useState<SoilDepth>(initialDepth)
  const [depthHistory, setDepthHistory] = useState<SoilDepth[]>([initialDepth])

  const changeDepth = useCallback((newDepth: SoilDepth) => {
    setSelectedDepth(newDepth)
    setDepthHistory((prev) => [...prev, newDepth])
  }, [])

  const goToPreviousDepth = useCallback(() => {
    if (depthHistory.length > 1) {
      const newHistory = depthHistory.slice(0, -1)
      setDepthHistory(newHistory)
      setSelectedDepth(newHistory[newHistory.length - 1])
    }
  }, [depthHistory])

  const getNextDepth = useCallback((): SoilDepth | null => {
    const currentIndex = AVAILABLE_DEPTHS.indexOf(selectedDepth)
    return currentIndex < AVAILABLE_DEPTHS.length - 1
      ? AVAILABLE_DEPTHS[currentIndex + 1]
      : null
  }, [selectedDepth])

  const getPreviousDepth = useCallback((): SoilDepth | null => {
    const currentIndex = AVAILABLE_DEPTHS.indexOf(selectedDepth)
    return currentIndex > 0 ? AVAILABLE_DEPTHS[currentIndex - 1] : null
  }, [selectedDepth])

  const goToNextDepth = useCallback(() => {
    const next = getNextDepth()
    if (next) changeDepth(next)
  }, [getNextDepth, changeDepth])

  const goToPrevDepth = useCallback(() => {
    const prev = getPreviousDepth()
    if (prev) changeDepth(prev)
  }, [getPreviousDepth, changeDepth])

  const resetDepth = useCallback(() => {
    setSelectedDepth(initialDepth)
    setDepthHistory([initialDepth])
  }, [initialDepth])

  return {
    selectedDepth,
    depthHistory,
    availableDepths: AVAILABLE_DEPTHS,
    changeDepth,
    goToPreviousDepth,
    goToNextDepth,
    goToPrevDepth,
    getNextDepth,
    getPreviousDepth,
    resetDepth,
  }
}
