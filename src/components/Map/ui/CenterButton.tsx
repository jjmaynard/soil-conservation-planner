import { LatLngExpression } from 'leaflet'
import { Shrink } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useMapEvents } from 'react-leaflet'

import { AppConfig } from '#lib/AppConfig'

import useMapContext from '../useMapContext'

interface CenterButtonProps {
  center: LatLngExpression
  zoom: number
}

export const CenterButton = ({ center, zoom }: CenterButtonProps) => {
  const [isTouched, setIsTouched] = useState(false)
  const { map } = useMapContext()

  const touch = useCallback(() => {
    if (!isTouched && map) {
      setIsTouched(true)
    }
  }, [isTouched, map])

  useMapEvents({
    move() {
      touch()
    },
    zoom() {
      touch()
    },
  })

  const handleClick = useCallback(() => {
    if (!isTouched || !map) return

    map.flyTo(center, zoom)
    map.once('moveend', () => {
      setIsTouched(false)
    })
  }, [map, isTouched, zoom, center])

  return (
    <button
      type="button"
      style={{ zIndex: 400 }}
      className={`button absolute top-2 right-3 rounded bg-surface p-2 shadow-md border border-border hover:bg-ocean-50 transition-colors ${
        isTouched ? 'text-ocean-700' : 'text-slate-400'
      } `}
      onClick={() => handleClick()}
    >
      <Shrink size={AppConfig.ui.mapIconSize} />
    </button>
  )
}
