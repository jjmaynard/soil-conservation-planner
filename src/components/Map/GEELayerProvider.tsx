// Client-side GEE Layer Provider Component

'use client'

import { useLayerGroups } from '#src/hooks/useMapLayers'

interface GEELayerProviderProps {
  children: (props: {
    geeLayerGroups: any[]
    geeActiveLayers: Set<string>
    geeActiveLayerData: Map<string, any>
  }) => React.ReactNode
}

export default function GEELayerProvider({ children }: GEELayerProviderProps) {
  const {
    layerGroups,
    activeLayers,
    activeLayerData,
  } = useLayerGroups()

  return <>{children({
    geeLayerGroups: layerGroups,
    geeActiveLayers: activeLayers,
    geeActiveLayerData: activeLayerData,
  })}</>
}
