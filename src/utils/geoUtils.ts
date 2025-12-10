// Geographic utility functions for soil mapping

import type L from 'leaflet'

/**
 * Calculate distance between two geographic coordinates (Haversine formula)
 * @returns distance in kilometers
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S'
  const lonDir = lon >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(6)}°${latDir}, ${Math.abs(lon).toFixed(6)}°${lonDir}`
}

/**
 * Convert Leaflet LatLngBounds to bbox array [west, south, east, north]
 */
export function boundsToBBox(bounds: L.LatLngBounds): [number, number, number, number] {
  return [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()]
}

/**
 * Check if a point is within a bounding box
 */
export function isPointInBounds(lat: number, lon: number, bounds: L.LatLngBounds): boolean {
  return bounds.contains([lat, lon])
}

/**
 * Calculate the center point of multiple coordinates
 */
export function calculateCentroid(coordinates: Array<[number, number]>): [number, number] {
  if (coordinates.length === 0) return [0, 0]

  const sum = coordinates.reduce((acc, [lat, lon]) => [acc[0] + lat, acc[1] + lon], [0, 0])

  return [sum[0] / coordinates.length, sum[1] / coordinates.length]
}
