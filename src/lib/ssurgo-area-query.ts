/**
 * SSURGO Area Query Library
 * Query NRCS Soil Data Access (SDA) API for user-delineated areas
 * 
 * @author Jonathan
 * @license Public Domain
 */

import type * as L from 'leaflet'
import type * as GeoJSON from 'geojson'

// ============================================================================
// Type Definitions
// ============================================================================

export interface SSURGOQueryOptions {
  what?: 'mukey' | 'mupolygon' | 'components' | 'comprehensive'
  geomIntersection?: boolean
  geomAcres?: boolean
  db?: 'SSURGO' | 'STATSGO'
  addFields?: string[]
  timeout?: number
}

export interface MapUnitBasic {
  mukey: string
  musym: string
  muname: string
}

export interface MapUnitPolygon extends MapUnitBasic {
  geom: string // WKT string
  area_ac?: number
}

export interface Component {
  cokey: string
  compname: string
  comppct_r: number
  majcompflag: string
  slope_r: number
  drainagecl: string
  hydricrating: string
  taxclname: string
  taxorder: string
  taxsuborder?: string
  taxgrtgroup?: string
  nirrcapcl?: string
  irrcapcl?: string
}

export interface MapUnitWithComponents extends MapUnitBasic {
  components: Component[]
  area_ac?: number  // Add area to support field analysis
}

export interface Horizon {
  chkey: string
  hzname: string
  hzdept_r: number
  hzdepb_r: number
  sandtotal_r?: number
  silttotal_r?: number
  claytotal_r?: number
  om_r?: number
  ph1to1h2o_r?: number
  awc_r?: number
  ksat_r?: number
  dbthirdbar_r?: number
  cec7_r?: number
}

export interface ComponentComprehensive extends Component {
  horizons: Horizon[]
  interpretations: Interpretation[]
}

export interface Interpretation {
  name: string
  rating: string
  value: number
}

export interface MapUnitComprehensive extends MapUnitBasic {
  muacres: number
  areasymbol: string
  areaname: string
  components: ComponentComprehensive[]
}

// ============================================================================
// Geometry Utilities
// ============================================================================

/**
 * Convert various geometry formats to WKT (Well-Known Text)
 * Supports Leaflet Polygon, GeoJSON Polygon, and coordinate arrays
 */
export function geometryToWKT(
  geometry: L.Polygon | GeoJSON.Polygon | number[][]
): string {
  let coords: number[][]

  // Handle Leaflet Polygon
  if ('getLatLngs' in geometry && typeof geometry.getLatLngs === 'function') {
    const latlngs = geometry.getLatLngs()[0] as L.LatLng[]
    coords = latlngs.map((ll) => [ll.lng, ll.lat])
  }
  // Handle GeoJSON Polygon
  else if ('type' in geometry && geometry.type === 'Polygon') {
    coords = geometry.coordinates[0].map((c) => [c[0], c[1]])
  }
  // Handle raw coordinate array
  else if (Array.isArray(geometry)) {
    coords = geometry
  } else {
    throw new Error('Unsupported geometry type')
  }

  // Ensure ring is closed
  const first = coords[0]
  const last = coords[coords.length - 1]
  if (first[0] !== last[0] || first[1] !== last[1]) {
    coords.push([first[0], first[1]])
  }

  // Format as WKT POLYGON
  const coordString = coords.map((c) => `${c[0]} ${c[1]}`).join(', ')
  return `POLYGON((${coordString}))`
}

/**
 * Parse WKT string to GeoJSON geometry
 */
export function wktToGeoJSON(wkt: string): GeoJSON.Polygon | null {
  try {
    // Simple WKT POLYGON parser
    const match = wkt.match(/POLYGON\(\((.*?)\)\)/i)
    if (!match) return null

    const coordString = match[1]
    const coords = coordString.split(',').map((pair) => {
      const [lng, lat] = pair.trim().split(' ').map(Number)
      return [lng, lat]
    })

    return {
      type: 'Polygon',
      coordinates: [coords],
    }
  } catch (error) {
    console.error('Error parsing WKT:', error)
    return null
  }
}

// ============================================================================
// SDA Query Functions
// ============================================================================

/**
 * Execute a query against the NRCS Soil Data Access API
 */
async function executeSDAQuery(
  query: string,
  timeout: number = 45000
): Promise<any> {
  const sdaUrl = 'https://SDMDataAccess.sc.egov.usda.gov/Tabular/post.rest'

  const params = new URLSearchParams()
  params.append('query', query)
  params.append('format', 'JSON')

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(sdaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`SDA query failed: ${response.status} ${response.statusText}\n${text}`)
    }

    const responseText = await response.text()
    const data = JSON.parse(responseText)

    return data
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Query timed out after ${timeout / 1000} seconds`)
    }
    throw error
  }
}

// ============================================================================
// Main Query Function
// ============================================================================

/**
 * Query SSURGO data for a user-delineated area
 * 
 * @param geometry - Leaflet polygon, GeoJSON polygon, or coordinate array
 * @param options - Query options
 * @returns Parsed SSURGO data based on 'what' parameter
 * 
 * @example
 * // Get map unit keys only (fastest)
 * const mukeys = await querySSURGOByArea(polygon, { what: 'mukey' })
 * 
 * @example
 * // Get polygons with area calculation
 * const polygons = await querySSURGOByArea(polygon, {
 *   what: 'mupolygon',
 *   geomIntersection: true,
 *   geomAcres: true
 * })
 * 
 * @example
 * // Get detailed component data
 * const components = await querySSURGOByArea(polygon, { what: 'components' })
 */
export async function querySSURGOByArea(
  geometry: L.Polygon | GeoJSON.Polygon | number[][],
  options: SSURGOQueryOptions = {}
): Promise<any> {
  const {
    what = 'mukey',
    geomIntersection = false,
    geomAcres = true,
    db = 'SSURGO',
    addFields = [],
    timeout = 45000,
  } = options

  try {
    // Convert geometry to WKT
    const wkt = geometryToWKT(geometry)
    console.log('Querying SSURGO with WKT:', wkt.substring(0, 100) + '...')

    let query: string

    // ========================================================================
    // Query Type: Map Unit Keys Only
    // ========================================================================
    if (what === 'mukey') {
      query = `
        SELECT DISTINCT m.mukey, m.musym, m.muname
        FROM mapunit m
        WHERE m.mukey IN (
          SELECT DISTINCT mukey 
          FROM SDA_Get_Mukey_from_intersection_with_WktWgs84('${wkt}')
        )
        ORDER BY m.musym`

      const data = await executeSDAQuery(query, timeout)

      if (!data?.Table || data.Table.length === 0) {
        return []
      }

      return data.Table.map((row: any[]) => ({
        mukey: row[0],
        musym: row[1],
        muname: row[2],
      })) as MapUnitBasic[]
    }

    // ========================================================================
    // Query Type: Map Unit Polygons with Geometry
    // ========================================================================
    else if (what === 'mupolygon') {
      if (geomIntersection) {
        // Return clipped intersection geometry (slower but precise)
        query = `
          WITH geom_data (geom, mukey) AS (
            SELECT 
              mupolygongeo.STIntersection(geometry::STGeomFromText('${wkt}', 4326)) AS geom,
              mukey
            FROM mupolygon 
            WHERE mupolygongeo.STIntersects(geometry::STGeomFromText('${wkt}', 4326)) = 1
          )
          SELECT 
            geom_data.mukey,
            geom.STAsText() AS geom
            ${
              geomAcres
                ? `, GEOGRAPHY::STGeomFromWKB(geom.STUnion(geom.STStartPoint()).STAsBinary(), 4326).MakeValid().STArea() * 0.000247105 AS area_ac`
                : ''
            }
          FROM geom_data`
      } else {
        // Return overlapping polygons (faster)
        query = `
          WITH geom_data (geom, mukey) AS (
            SELECT mupolygongeo AS geom, mukey
            FROM mupolygon 
            WHERE mupolygongeo.STIntersects(geometry::STGeomFromText('${wkt}', 4326)) = 1
          )
          SELECT 
            geom_data.mukey,
            geom.STAsText() AS geom
            ${
              geomAcres
                ? `, GEOGRAPHY::STGeomFromWKB(geom.STUnion(geom.STStartPoint()).STAsBinary(), 4326).MakeValid().STArea() * 0.000247105 AS area_ac`
                : ''
            }
          FROM geom_data`
      }

      // Add additional fields if requested
      if (addFields.length > 0) {
        const fieldList = addFields.join(', ')
        query = query.replace(
          'FROM geom_data',
          `FROM geom_data
           INNER JOIN mapunit ON mapunit.mukey = geom_data.mukey
           INNER JOIN legend ON legend.lkey = mapunit.lkey`
        )
        query = query.replace(
          'geom.STAsText() AS geom',
          `geom.STAsText() AS geom, ${fieldList}`
        )
      }

      const data = await executeSDAQuery(query, timeout)

      if (!data?.Table || data.Table.length === 0) {
        return []
      }

      return data.Table.map((row: any[]) => ({
        mukey: row[0],
        geom: row[1],
        area_ac: geomAcres ? row[2] : undefined,
      })) as MapUnitPolygon[]
    }

    // ========================================================================
    // Query Type: Components Only
    // ========================================================================
    else if (what === 'components') {
      query = `
        SELECT 
          m.mukey, 
          m.musym, 
          m.muname,
          c.cokey,
          c.compname,
          c.comppct_r,
          c.majcompflag,
          c.slope_r,
          c.drainagecl,
          c.hydricrating,
          c.taxclname,
          c.taxorder,
          c.taxsuborder,
          c.taxgrtgroup,
          c.nirrcapcl,
          c.irrcapcl
        FROM mapunit m
        INNER JOIN component c ON m.mukey = c.mukey
        WHERE m.mukey IN (
          SELECT DISTINCT mukey 
          FROM SDA_Get_Mukey_from_intersection_with_WktWgs84('${wkt}')
        )
        ORDER BY m.mukey, c.comppct_r DESC`

      const data = await executeSDAQuery(query, timeout)

      if (!data?.Table || data.Table.length === 0) {
        return []
      }

      // Group components by map unit
      const mapUnits = new Map<string, MapUnitWithComponents>()

      data.Table.forEach((row: any[]) => {
        const mukey = row[0]
        if (!mapUnits.has(mukey)) {
          mapUnits.set(mukey, {
            mukey: row[0],
            musym: row[1],
            muname: row[2],
            components: [],
          })
        }

        mapUnits.get(mukey)!.components.push({
          cokey: row[3],
          compname: row[4],
          comppct_r: row[5],
          majcompflag: row[6],
          slope_r: row[7],
          drainagecl: row[8],
          hydricrating: row[9],
          taxclname: row[10],
          taxorder: row[11],
          taxsuborder: row[12],
          taxgrtgroup: row[13],
          nirrcapcl: row[14],
          irrcapcl: row[15],
        })
      })

      return Array.from(mapUnits.values()) as MapUnitWithComponents[]
    }

    // ========================================================================
    // Query Type: Comprehensive (Components + Horizons + Interpretations)
    // ========================================================================
    else if (what === 'comprehensive') {
      // First get all map units in area
      const mukeys = (await querySSURGOByArea(geometry, {
        what: 'mukey',
        timeout,
      })) as MapUnitBasic[]

      if (mukeys.length === 0) {
        return []
      }

      const mukeyList = mukeys.map((m) => `'${m.mukey}'`).join(',')

      // Get comprehensive data
      query = `
        SELECT 
          m.mukey, 
          m.musym, 
          m.muname,
          m.muacres,
          l.areasymbol,
          l.areaname,
          c.cokey,
          c.compname,
          c.comppct_r,
          c.majcompflag,
          c.slope_r,
          c.drainagecl,
          c.hydricrating,
          c.nirrcapcl,
          c.irrcapcl,
          c.taxclname,
          c.taxorder,
          c.taxsuborder,
          c.taxgrtgroup,
          ch.chkey,
          ch.hzname,
          ch.hzdept_r,
          ch.hzdepb_r,
          ch.sandtotal_r,
          ch.silttotal_r,
          ch.claytotal_r,
          ch.om_r,
          ch.ph1to1h2o_r,
          ch.awc_r,
          ch.ksat_r,
          ch.dbthirdbar_r,
          ch.cec7_r
        FROM mapunit m
        INNER JOIN legend l ON m.lkey = l.lkey
        INNER JOIN component c ON m.mukey = c.mukey
        LEFT JOIN chorizon ch ON c.cokey = ch.cokey
        WHERE m.mukey IN (${mukeyList})
        ORDER BY m.mukey, c.comppct_r DESC, ch.hzdept_r ASC`

      const data = await executeSDAQuery(query, timeout)

      if (!data?.Table || data.Table.length === 0) {
        return []
      }

      // Parse comprehensive results
      const mapUnitsMap = new Map<string, MapUnitComprehensive>()
      const componentsMap = new Map<string, ComponentComprehensive>()

      data.Table.forEach((row: any[]) => {
        const mukey = row[0]
        const cokey = row[6]

        // Create map unit if not exists
        if (!mapUnitsMap.has(mukey)) {
          mapUnitsMap.set(mukey, {
            mukey: row[0],
            musym: row[1],
            muname: row[2],
            muacres: row[3],
            areasymbol: row[4],
            areaname: row[5],
            components: [],
          })
        }

        // Create component if not exists
        if (cokey && !componentsMap.has(cokey)) {
          const component: ComponentComprehensive = {
            cokey: row[6],
            compname: row[7],
            comppct_r: row[8],
            majcompflag: row[9],
            slope_r: row[10],
            drainagecl: row[11],
            hydricrating: row[12],
            nirrcapcl: row[13],
            irrcapcl: row[14],
            taxclname: row[15],
            taxorder: row[16],
            taxsuborder: row[17],
            taxgrtgroup: row[18],
            horizons: [],
            interpretations: [],
          }
          componentsMap.set(cokey, component)
          mapUnitsMap.get(mukey)!.components.push(component)
        }

        // Add horizon if present
        if (cokey && row[19]) {
          // chkey exists
          const component = componentsMap.get(cokey)!
          if (!component.horizons.some((h) => h.chkey === row[19])) {
            component.horizons.push({
              chkey: row[19],
              hzname: row[20],
              hzdept_r: row[21],
              hzdepb_r: row[22],
              sandtotal_r: row[23],
              silttotal_r: row[24],
              claytotal_r: row[25],
              om_r: row[26],
              ph1to1h2o_r: row[27],
              awc_r: row[28],
              ksat_r: row[29],
              dbthirdbar_r: row[30],
              cec7_r: row[31],
            })
          }
        }
      })

      // Fetch interpretations separately
      const cokeys = Array.from(componentsMap.keys())
      if (cokeys.length > 0) {
        try {
          const interpretations = await querySSURGOInterpretations(cokeys, timeout)
          interpretations.forEach((interp) => {
            const component = componentsMap.get(interp.cokey)
            if (component) {
              component.interpretations.push({
                name: interp.mrulename,
                rating: interp.interphr,
                value: interp.interphrc ? parseFloat(interp.interphrc) : 0,
              })
            }
          })
        } catch (error) {
          console.warn('Failed to fetch interpretations:', error)
        }
      }

      return Array.from(mapUnitsMap.values()) as MapUnitComprehensive[]
    }

    throw new Error(`Unsupported query type: ${what}`)
  } catch (error) {
    console.error('Error querying SSURGO by area:', error)
    throw error
  }
}

/**
 * Query SSURGO component interpretations separately
 * This avoids Cartesian product issues while getting interpretation data
 */
async function querySSURGOInterpretations(
  cokeys: string[],
  timeout: number = 15000
): Promise<any[]> {
  try {
    const cokeyList = cokeys.map((k) => `'${k}'`).join(',')

    const query = `
      SELECT 
        coi.cokey,
        coi.mrulename,
        coi.ruledepth,
        coi.interphrc,
        coi.interphr
      FROM cointerp coi
      WHERE coi.cokey IN (${cokeyList})
      ORDER BY coi.cokey, coi.seqnum`

    const data = await executeSDAQuery(query, timeout)

    if (!data?.Table || data.Table.length === 0) {
      return []
    }

    return data.Table.map((row: any[]) => ({
      cokey: row[0],
      mrulename: row[1],
      ruledepth: row[2],
      interphrc: row[3],
      interphr: row[4],
    }))
  } catch (error) {
    console.error('Error querying interpretations:', error)
    return []
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Calculate total area of map units in acres
 */
export function calculateTotalArea(mapUnits: MapUnitPolygon[]): number {
  return mapUnits.reduce((sum, mu) => sum + (mu.area_ac || 0), 0)
}

/**
 * Get dominant component for each map unit
 */
export function getDominantComponents(
  mapUnits: MapUnitWithComponents[]
): Component[] {
  return mapUnits
    .map((mu) => mu.components[0])
    .filter((c) => c !== undefined)
}

/**
 * Filter map units by minimum area threshold
 */
export function filterByArea(
  mapUnits: MapUnitPolygon[],
  minAcres: number
): MapUnitPolygon[] {
  return mapUnits.filter((mu) => (mu.area_ac || 0) >= minAcres)
}

/**
 * Export results to CSV format
 */
export function exportToCSV(data: any[]): string {
  if (data.length === 0) return ''

  const headers = Object.keys(data[0])
  const rows = data.map((item) =>
    headers.map((header) => {
      const value = item[header]
      if (value === null || value === undefined) return ''
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`
      }
      return value
    })
  )

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
}
