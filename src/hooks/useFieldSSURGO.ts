/**
 * Field Analysis SSURGO Integration Hook
 * Specialized hook for querying and processing SSURGO data for field analysis
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import type * as GeoJSON from 'geojson'
import {
  querySSURGOByArea,
  type MapUnitWithComponents,
  type Component,
  type MapUnitPolygon, // Import MapUnitPolygon
} from '#lib/ssurgo-area-query'

// Cache configuration
const CACHE_DURATION_HOURS = 24
const CACHE_KEY_PREFIX = 'ssurgo_data_'

export interface ProcessedFieldData {
  // Map Unit Polygons (Geometry)
  mapUnitPolygons?: MapUnitPolygon[]

  // Soil composition data
  soils: Array<{
    id: string
    mapunit_name: string
    symbol: string
    area: number
    percent: number
    lcc: string
    slope: number
    drainageClass: string
    hydric: boolean
    color: string
  }>
  
  // Geometry quality warning (optional)
  geometryWarning?: string
  
  // Aggregate statistics
  stats: {
    totalArea: number
    soilTypes: number
    avgSlope: number
    erosionRisk: 'Low' | 'Moderate' | 'High'
  }
  
  // Drainage data
  drainage: {
    hydricSoils: number
    hydricPercent: number
    drainageClasses: Array<{
      class: string
      acres: number
      percent: number
      color: string
    }>
  }
  
  // Erosion data
  erosion: {
    avgErosion: number
    maxErosion: number
    tolerable: number
    riskLevel: 'Low' | 'Moderate' | 'High'
    areas: Array<{
      risk: string
      acres: number
      percent: number
      color: string
      textColor: string
    }>
  }
  
  // Raw SSURGO data for advanced use
  rawData: MapUnitWithComponents[]
}

interface UseFieldSSURGOResult {
  fieldData: ProcessedFieldData | null
  loading: boolean
  error: Error | null
  queryField: (geometry: GeoJSON.Polygon | GeoJSON.Feature<GeoJSON.Geometry> | number[][], expectedAcres?: number, fieldId?: string) => Promise<void>
  reset: () => void
  currentFieldId: string | null
}

// Color palette for soil map units
const SOIL_COLORS = [
  '#10b981', '#60a5fa', '#fbbf24', '#a78bfa', 
  '#f472b6', '#fb923c', '#34d399', '#818cf8',
  '#4ade80', '#38bdf8', '#facc15', '#c084fc'
]

// Generate cache key from field identifier
const getCacheKey = (geometry: any, fieldId?: string): string => {
  if (fieldId) {
    return `${CACHE_KEY_PREFIX}${fieldId}`
  }
  // Fallback to geometry hash
  const geoStr = JSON.stringify(geometry).substring(0, 100)
  return `${CACHE_KEY_PREFIX}${geoStr.replace(/[^a-zA-Z0-9]/g, '_')}`
}

// Check if cached data is still valid
const getCachedData = (cacheKey: string): ProcessedFieldData | null => {
  try {
    const cached = localStorage.getItem(cacheKey)
    if (!cached) return null

    const { data, timestamp } = JSON.parse(cached)
    const now = Date.now()
    const ageHours = (now - timestamp) / (1000 * 60 * 60)

    if (ageHours < CACHE_DURATION_HOURS) {
      console.log(`📦 Using cached SSURGO data (${ageHours.toFixed(1)}h old)`)
      return data
    } else {
      console.log(`⏰ SSURGO cache expired (${ageHours.toFixed(1)}h old), refreshing...`)
      localStorage.removeItem(cacheKey)
      return null
    }
  } catch (error) {
    console.error('Failed to read SSURGO cache:', error)
    return null
  }
}

// Save data to cache
const setCachedData = (cacheKey: string, data: ProcessedFieldData) => {
  try {
    const cacheEntry = { data, timestamp: Date.now() }
    localStorage.setItem(cacheKey, JSON.stringify(cacheEntry))
    console.log('💾 Cached SSURGO data for future use')
  } catch (error) {
    console.error('Failed to cache SSURGO data:', error)
    // Clear old caches if storage is full
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(CACHE_KEY_PREFIX) && key !== cacheKey) {
          localStorage.removeItem(key)
        }
      })
      localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }))
    } catch (retryError) {
      console.warn('Unable to cache SSURGO data - localStorage may be full')
    }
  }
}

/**
 * Hook for field analysis with SSURGO integration
 * Automatically processes SSURGO data for field analysis components
 */
export function useFieldSSURGO(): UseFieldSSURGOResult {
  const [fieldData, setFieldData] = useState<ProcessedFieldData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [currentFieldId, setCurrentFieldId] = useState<string | null>(null)

  const queryField = useCallback(
    async (geometry: GeoJSON.Polygon | GeoJSON.Feature<GeoJSON.Geometry> | number[][], expectedAcres?: number, fieldId?: string) => {
      const cacheKey = getCacheKey(geometry, fieldId)
      
      // Check cache first
      const cachedData = getCachedData(cacheKey)
      if (cachedData) {
        setFieldData(cachedData)
        setError(null)
        setCurrentFieldId(fieldId || null)
        return
      }
      
      // No cache - fetch from API
      setLoading(true)
      setError(null)

      try {
        // Debug geometry to identify issues
        console.log('=== SSURGO QUERY DEBUG ===')
        let geomType = 'unknown'
        let coordCount = 0
        let queryGeometry: GeoJSON.Polygon | number[][]
        
        // Normalize GeoJSON Feature input to Polygon geometry
        if (Array.isArray(geometry)) {
          queryGeometry = geometry
        } else if ('type' in geometry && geometry.type === 'Feature') {
          if (!geometry.geometry) {
            throw new Error('GeoJSON Feature has no geometry')
          }

          if (geometry.geometry.type !== 'Polygon') {
            throw new Error(`queryField only supports Polygon geometry, received ${geometry.geometry.type}`)
          }

          queryGeometry = geometry.geometry
          console.warn('Received GeoJSON Feature; extracted .geometry for SSURGO query')
        } else {
          queryGeometry = geometry
        }
        
        if ('type' in queryGeometry && queryGeometry.type === 'Polygon') {
          geomType = 'Polygon'
          coordCount = queryGeometry.coordinates[0]?.length || 0
          console.log('Geometry type:', geomType)
          console.log('Coordinate count:', coordCount)
          console.log('First coordinate:', queryGeometry.coordinates[0]?.[0])
          console.log('Expected field area:', expectedAcres || 'unknown', 'acres')
        } else if (Array.isArray(queryGeometry)) {
          geomType = 'Array'
          coordCount = queryGeometry.length
          console.log('Geometry type: Coordinate array')
          console.log('Coordinate count:', coordCount)
        }
        
        if (coordCount < 4) {
          console.warn('⚠️ WARNING: Very few coordinates detected. Boundary may be incomplete.')
        }
        
        // First get map unit polygons with area calculation
        const muPolygons = await querySSURGOByArea(queryGeometry, {
          what: 'mupolygon',
          geomAcres: true,
          geomIntersection: true,
        }) as Array<{ mukey: string; area_ac?: number }>

        console.log('🗺️ SSURGO Polygon Query Result:')
        console.log('  - Number of polygons:', muPolygons?.length || 0)
        if (muPolygons && muPolygons.length > 0) {
          muPolygons.forEach((poly, idx) => {
            console.log(`  - Polygon ${idx + 1}: mukey=${poly.mukey}, area_ac=${poly.area_ac}`)
          })
        } else {
          console.error('  ❌ No polygon data returned!')
        }

        if (!muPolygons || muPolygons.length === 0) {
          throw new Error('No SSURGO data found for this area')
        }

        // Then get components for those map units
        const mapUnits = await querySSURGOByArea(queryGeometry, {
          what: 'components',
        }) as MapUnitWithComponents[]

        console.log('🔍 SSURGO Components Query Result:')
        console.log('  - Number of map units:', mapUnits.length)
        mapUnits.forEach((mu, idx) => {
          console.log(`  - Map Unit ${idx + 1}: ${mu.muname} (${mu.musym})`)
          console.log(`    - mukey: ${mu.mukey}`)
          console.log(`    - Components:`, mu.components?.length || 0)
          if (mu.components && mu.components.length > 0) {
            mu.components.forEach((comp, compIdx) => {
              console.log(`      ${compIdx + 1}. ${comp.compname} - ${comp.comppct_r}%`)
            })
          } else {
            console.log('    ⚠️ NO COMPONENTS for this map unit!')
          }
        })

        // Merge area data from polygons into map units
        const areaMap = new Map<string, number>()
        muPolygons.forEach(poly => {
          const existing = areaMap.get(poly.mukey) || 0
          const polyArea = Number(poly.area_ac) || 0
          areaMap.set(poly.mukey, existing + polyArea)
          console.log(`  Adding polygon: mukey=${poly.mukey}, area=${polyArea}, total for mukey=${existing + polyArea}`)
        })

        console.log('📍 Area map after processing polygons:')
        areaMap.forEach((area, mukey) => {
          console.log(`  - mukey ${mukey}: ${area} acres`)
        })

        mapUnits.forEach(mu => {
          mu.area_ac = areaMap.get(mu.mukey) || 0
        })

        // Calculate total area from SSURGO
        const totalAreaFromSSURGO = Array.from(areaMap.values()).reduce((sum, area) => sum + (Number(area) || 0), 0)
        console.log('Total area from SSURGO intersection:', totalAreaFromSSURGO, 'acres')
        console.log('totalAreaFromSSURGO type:', typeof totalAreaFromSSURGO)
        console.log('Is totalAreaFromSSURGO a number?', typeof totalAreaFromSSURGO === 'number' && !isNaN(totalAreaFromSSURGO))
        
        // Check for geometry quality issues
        let usedArea = totalAreaFromSSURGO
        let geometryWarning: string | null = null
        
        if (expectedAcres && totalAreaFromSSURGO > 0) {
          const percentDiff = Math.abs(totalAreaFromSSURGO - expectedAcres) / expectedAcres * 100
          console.log('Expected area:', expectedAcres, 'acres')
          console.log('Difference:', percentDiff, '%')
          
          if (percentDiff > 20) {
            // Significant difference - likely geometry issue
            console.warn('⚠️ GEOMETRY QUALITY WARNING')
            console.warn(`SSURGO area (${Number(totalAreaFromSSURGO).toFixed(1)} ac) differs from field metadata (${Number(expectedAcres).toFixed(1)} ac) by ${Number(percentDiff).toFixed(0)}%`)
            console.warn('This indicates incomplete or inaccurate field boundary geometry.')
            console.warn('Using proportional scaling to correct component areas.')
            
            geometryWarning = `Boundary geometry appears incomplete (${Number(totalAreaFromSSURGO).toFixed(1)} of ${Number(expectedAcres).toFixed(0)} acres analyzed). Component percentages are preserved but areas are scaled to match expected field size.`
            
            // Use expected area for calculations to maintain correct total
            usedArea = expectedAcres
            
            // Scale map unit areas proportionally
            const scaleFactor = expectedAcres / totalAreaFromSSURGO
            areaMap.forEach((area, mukey) => {
              areaMap.set(mukey, area * scaleFactor)
            })
            
            mapUnits.forEach(mu => {
              mu.area_ac = (mu.area_ac || 0) * scaleFactor
            })
          }
        }
        console.log('Final area for calculations:', Number(usedArea).toFixed(2), 'acres')
        console.log('========================\n')
        
        const processed = processSSURGOData(mapUnits, usedArea)
        
        // Enrich polygons with metadata (musym, muname) from mapUnits lookup
        // muPolygons only has {mukey, geom, area}. We need musym for coloring.
        const muInfoMap = new Map<string, { musym: string; muname: string }>();
        mapUnits.forEach(mu => {
            muInfoMap.set(mu.mukey, { musym: mu.musym, muname: mu.muname });
        });

        const enrichedPolygons = muPolygons.map(poly => {
            const info = muInfoMap.get(poly.mukey);
            if (!info) return poly;
            return { ...poly, ...info };
        }) as any[]; // Type assertion to PolygonWithMetadata

        // Add geometry to processed data
        processed.mapUnitPolygons = enrichedPolygons;

        // Add geometry warning to processed data if present
        if (geometryWarning) {
          (processed as any).geometryWarning = geometryWarning
        }
        
        console.log('Processed soils:', processed.soils.map(s => ({ 
          name: s.mapunit_name, 
          area: s.area.toFixed(2), 
          percent: s.percent.toFixed(1) 
        })))
        setFieldData(processed)
        setCurrentFieldId(fieldId || null)
        
        // Cache the processed data
        setCachedData(cacheKey, processed)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        console.error('Field SSURGO query error:', error)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const reset = useCallback(() => {
    setFieldData(null)
    setError(null)
    setLoading(false)
    setCurrentFieldId(null)
  }, [])

  return {
    fieldData,
    loading,
    error,
    queryField,
    reset,
    currentFieldId,
  }
}

/**
 * Process raw SSURGO data into field analysis format
 */
function processSSURGOData(
  mapUnits: MapUnitWithComponents[],
  totalArea: number
): ProcessedFieldData {
  
  console.log('📊 processSSURGOData called with:')
  console.log('  - Map units:', mapUnits.length)
  console.log('  - Total area:', totalArea)
  
  // Process soil composition by COMPONENT
  // Step 1: For each map unit, calculate component areas based on comppct_r
  // Step 2: Aggregate components by name across map units
  const componentMap = new Map<string, any>()
  
  mapUnits.forEach((mu, muIndex) => {
    const muArea = mu.area_ac || 0
    
    console.log(`  Processing MU ${muIndex + 1}: ${mu.muname} (area: ${muArea} ac, components: ${mu.components?.length || 0})`)
    
    if (!mu.components || mu.components.length === 0) {
      console.warn(`    ⚠️ Map unit ${mu.muname} has NO components!`)
      return // Skip this map unit
    }
    
    mu.components.forEach((comp) => {
      // Calculate this component's area within this map unit
      const compPct = comp.comppct_r || 0
      const compArea = (muArea * compPct) / 100
      
      // Use component name as aggregation key
      const compKey = comp.compname || `Unknown_${comp.cokey}`
      
      if (componentMap.has(compKey)) {
        // Component exists in another map unit - aggregate areas
        const existing = componentMap.get(compKey)
        const newTotalArea = existing.area + compArea
        
        existing.area = newTotalArea
        
        // Update slope with area-weighted average
        existing.slope = ((existing.slope * existing.prevArea) + (comp.slope_r || 0) * compArea) / newTotalArea
        existing.prevArea = newTotalArea
        
        // Keep hydric if any instance is hydric
        if (comp.hydricrating === 'Yes') {
          existing.hydric = true
        }
      } else {
        // New component
        componentMap.set(compKey, {
          id: comp.cokey,
          mapunit_name: compKey, // Display component name
          symbol: mu.musym,
          area: compArea,
          prevArea: compArea,
          percent: 0, // Will calculate after all components processed
          lcc: comp.nirrcapcl || 'N/A',
          slope: comp.slope_r || 0,
          drainageClass: comp.drainagecl || 'N/A',
          hydric: comp.hydricrating === 'Yes',
          color: SOIL_COLORS[(componentMap.size) % SOIL_COLORS.length],
          compname: compKey,
        })
      }
    })
  })
  
  // Convert map to array and calculate percentages based on total field area
  console.log('Processing components - totalArea:', totalArea)
  
  // First calculate actual total from component areas (components may not sum to exactly 100% in each map unit)
  const actualTotal = Array.from(componentMap.values()).reduce((sum, comp) => sum + (Number(comp.area) || 0), 0)
  console.log('Actual total from components:', actualTotal)
  
  const soils = Array.from(componentMap.values()).map(comp => {
    const area = Number(comp.area) || 0
    const percent = actualTotal > 0 ? (area / actualTotal) * 100 : 0
    
    console.log('Component:', comp.compname, 'area:', area, 'totalArea:', actualTotal, 'percent:', percent)
    
    return {
      ...comp,
      area: area,
      percent: percent
    }
  }).sort((a, b) => b.percent - a.percent)
  
  console.log(`✅ Processed ${soils.length} soil components`)
  soils.forEach((s, idx) => {
    console.log(`  ${idx + 1}. ${s.mapunit_name}: ${s.area.toFixed(2)} ac (${s.percent.toFixed(1)}%)`)
  })
  
  // Use actual total for stats
  const finalTotalArea = actualTotal

  // Calculate drainage statistics
  const hydricSoils = soils
    .filter(s => s.hydric)
    .reduce((sum, s) => sum + s.area, 0)
  const hydricPercent = (hydricSoils / finalTotalArea) * 100

  // Group by drainage class
  const drainageClassMap = new Map<string, number>()
  soils.forEach(soil => {
    const dc = soil.drainageClass
    drainageClassMap.set(dc, (drainageClassMap.get(dc) || 0) + soil.area)
  })

  const drainageClasses = Array.from(drainageClassMap.entries()).map(([cls, acres]) => ({
    class: cls,
    acres: acres,
    percent: (acres / finalTotalArea) * 100,
    color: getDrainageColor(cls),
  })).sort((a, b) => b.percent - a.percent)

  // Calculate slope statistics
  const avgSlope = soils.reduce((sum, s) => sum + (s.slope * s.percent / 100), 0)

  // Estimate erosion risk based on slope
  const erosionRisk = calculateErosionRisk(soils, avgSlope)

  // Calculate erosion areas by risk level
  const erosionAreas = calculateErosionAreas(soils, finalTotalArea)

  return {
    soils,
    stats: {
      totalArea: finalTotalArea,
      soilTypes: soils.length, // Count unique components, not map units
      avgSlope,
      erosionRisk: erosionRisk.riskLevel,
    },
    drainage: {
      hydricSoils,
      hydricPercent,
      drainageClasses,
    },
    erosion: erosionRisk,
    rawData: mapUnits,
  }
}

/**
 * Calculate area of a polygon in acres
 */
function calculateGeometryArea(geometry: GeoJSON.Polygon | number[][]): number {
  // Simple approximation - in production, use turf.js or similar
  // For now, return a placeholder that will be replaced by actual geometry area
  let coords: number[][]
  
  if ('type' in geometry && geometry.type === 'Polygon') {
    coords = geometry.coordinates[0]
  } else if (Array.isArray(geometry)) {
    coords = geometry
  } else {
    return 100 // Default fallback
  }
  
  // This is a very rough estimation - should use proper area calculation
  // Using shoelace formula for rough estimate
  let area = 0
  for (let i = 0; i < coords.length - 1; i++) {
    area += coords[i][0] * coords[i + 1][1] - coords[i + 1][0] * coords[i][1]
  }
  area = Math.abs(area) / 2
  
  // Convert from decimal degrees squared to approximate acres
  // This is very rough and should be replaced with proper calculation
  const acresEstimate = area * 24710 // Very rough conversion factor
  
  return acresEstimate > 1 ? acresEstimate : 100
}

/**
 * Calculate erosion risk based on slope and other factors
 */
function calculateErosionRisk(soils: any[], avgSlope: number): any {
  // Estimate T value (soil loss tolerance) - typically 3-5 tons/acre/year
  const tolerable = 5.0
  
  // Rough erosion estimate based on slope using simplified RUSLE
  // A = R * K * LS * C * P
  // For simplification, using slope as main factor
  const avgErosion = avgSlope * 0.7 // Simplified calculation
  const maxErosion = Math.max(...soils.map(s => s.slope * 0.8))
  
  let riskLevel: 'Low' | 'Moderate' | 'High'
  if (avgErosion < tolerable * 0.5) {
    riskLevel = 'Low'
  } else if (avgErosion < tolerable) {
    riskLevel = 'Moderate'
  } else {
    riskLevel = 'High'
  }
  
  return {
    avgErosion: parseFloat(avgErosion.toFixed(1)),
    maxErosion: parseFloat(maxErosion.toFixed(1)),
    tolerable,
    riskLevel,
    areas: [], // Will be filled by calculateErosionAreas
    factors: {
      rainfall: 'Moderate',
      slope: avgSlope < 3 ? 'Low' : avgSlope < 8 ? 'Moderate' : 'High',
      soilK: 'Moderate',
      coverManagement: 'Good',
    }
  }
}

/**
 * Calculate erosion areas by risk level
 */
function calculateErosionAreas(soils: any[], totalArea: number): any[] {
  const lowRisk = soils.filter(s => s.slope < 3)
  const modRisk = soils.filter(s => s.slope >= 3 && s.slope < 8)
  const highRisk = soils.filter(s => s.slope >= 8)
  
  const lowAcres = lowRisk.reduce((sum, s) => sum + s.area, 0)
  const modAcres = modRisk.reduce((sum, s) => sum + s.area, 0)
  const highAcres = highRisk.reduce((sum, s) => sum + s.area, 0)
  
  return [
    {
      risk: 'Low',
      acres: lowAcres,
      percent: (lowAcres / totalArea) * 100,
      color: '#dcfce7',
      textColor: '#166534',
    },
    {
      risk: 'Moderate',
      acres: modAcres,
      percent: (modAcres / totalArea) * 100,
      color: '#fef3c7',
      textColor: '#92400e',
    },
    {
      risk: 'High',
      acres: highAcres,
      percent: (highAcres / totalArea) * 100,
      color: '#fee2e2',
      textColor: '#991b1b',
    },
  ]
}

/**
 * Get color for drainage class
 */
function getDrainageColor(drainageClass: string): string {
  const lowerClass = drainageClass.toLowerCase()
  
  if (lowerClass.includes('well') && !lowerClass.includes('moderately')) {
    return '#10b981' // Well drained - green
  } else if (lowerClass.includes('moderately well')) {
    return '#60a5fa' // Moderately well - blue
  } else if (lowerClass.includes('somewhat poorly')) {
    return '#fbbf24' // Somewhat poorly - yellow
  } else if (lowerClass.includes('poorly') || lowerClass.includes('very poorly')) {
    return '#f97316' // Poorly drained - orange
  } else {
    return '#9ca3af' // Unknown - gray
  }
}

/**
 * Export hook for querying SSURGO data and storing in session
 */
export function useFieldSSURGOWithSession() {
  const { fieldData, loading, error, queryField, reset } = useFieldSSURGO()
  
  useEffect(() => {
    if (fieldData) {
      // Store processed data in session storage
      sessionStorage.setItem('fieldSSURGOData', JSON.stringify(fieldData))
    }
  }, [fieldData])
  
  const loadFromSession = useCallback(() => {
    const stored = sessionStorage.getItem('fieldSSURGOData')
    if (stored) {
      try {
        return JSON.parse(stored) as ProcessedFieldData
      } catch (e) {
        console.error('Failed to parse stored SSURGO data:', e)
      }
    }
    return null
  }, [])
  
  return {
    fieldData,
    loading,
    error,
    queryField,
    reset,
    loadFromSession,
  }
}
