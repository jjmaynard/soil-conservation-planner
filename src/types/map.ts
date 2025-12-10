// Map-related type definitions

import type L from 'leaflet'

export interface MapProps {
  initialCenter: [number, number]
  initialZoom: number
  minZoom?: number
  maxZoom?: number
  bounds?: L.LatLngBounds
}

export interface MapState {
  center: [number, number]
  zoom: number
  bounds: L.LatLngBounds | null
}

export interface MarkerData {
  id: string
  position: [number, number]
  title: string
  description?: string
  icon?: L.Icon
  popup?: string | React.ReactNode
}
