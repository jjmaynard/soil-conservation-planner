// ============================================================================
// GeoJSON to WKT Converter
// ============================================================================
// Converts GeoJSON geometry objects to Well-Known Text (WKT) format
// for use with GEE API endpoints that require WKT input

/**
 * Convert GeoJSON geometry to WKT format
 * Supports Polygon and MultiPolygon geometries
 */
export function geoJsonToWkt(geometry: any): string {
  if (!geometry || !geometry.type || !geometry.coordinates) {
    throw new Error('Invalid GeoJSON geometry object')
  }

  const { type, coordinates } = geometry

  switch (type) {
    case 'Polygon':
      return polygonToWkt(coordinates)
    
    case 'MultiPolygon':
      return multiPolygonToWkt(coordinates)
    
    default:
      throw new Error(`Unsupported geometry type: ${type}. Only Polygon and MultiPolygon are supported.`)
  }
}

/**
 * Convert Polygon coordinates to WKT
 * coordinates: [[[lon, lat], [lon, lat], ...]]
 * NOTE: Only uses the outer ring (first coordinate array) to avoid API parsing issues with holes
 */
function polygonToWkt(coordinates: number[][][]): string {
  // Only use the outer ring (first element) - ignore inner rings (holes) for simplification
  const outerRing = coordinates[0]
  const points = outerRing.map(coord => `${coord[0]} ${coord[1]}`).join(', ')
  
  return `POLYGON((${points}))`
}

/**
 * Convert MultiPolygon coordinates to WKT
 * coordinates: [[[[lon, lat], ...]], [[[lon, lat], ...]]]
 */
function multiPolygonToWkt(coordinates: number[][][][]): string {
  const polygons = coordinates.map(polygon => {
    const rings = polygon.map(ring => {
      const points = ring.map(coord => `${coord[0]} ${coord[1]}`).join(', ')
      return `(${points})`
    })
    return `(${rings.join(', ')})`
  })
  
  return `MULTIPOLYGON(${polygons.join(', ')})`
}

/**
 * Validate that a string is valid WKT format
 */
export function isValidWkt(wkt: string): boolean {
  if (!wkt || typeof wkt !== 'string') return false
  
  const wktPattern = /^(POLYGON|MULTIPOLYGON)\s*\(\(.+\)\)$/i
  return wktPattern.test(wkt.trim())
}
