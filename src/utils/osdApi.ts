// UC Davis Soil Series API client and data processor
// Uses Next.js API proxy to avoid CORS issues

import type { OSDResponse, FormattedOSDData, OSDClimateData } from '#src/types/osd'

/**
 * Fetch OSD data for a soil series via our API proxy
 * @param seriesName - Name of the soil series (e.g., "ABBOTT")
 * @returns Complete OSD data response
 */
export async function fetchOSDData(seriesName: string): Promise<OSDResponse | null> {
  try {
    const url = `/api/osd?series=${encodeURIComponent(seriesName)}`
    console.log(`[OSD API] Fetching data for series: ${seriesName}`)

    const response = await fetch(url)

    if (!response.ok) {
      console.error(`[OSD API] HTTP error: ${response.status}`)
      return null
    }

    const data = await response.json()

    // Check if series exists
    if (!data.site || data.site.length === 0) {
      console.warn(`[OSD API] No data found for series: ${seriesName}`)
      return null
    }

    return data
  } catch (error) {
    console.error(`[OSD API] Error fetching OSD data:`, error)
    return null
  }
}

/**
 * Convert Munsell color notation to RGB hex color
 * @param hue - Munsell hue (e.g., "10YR", "2.5Y")
 * @param value - Munsell value (lightness)
 * @param chroma - Munsell chroma (color intensity)
 * @returns Hex color string or null
 */
function munsellToHex(hue: string | null, value: number | null, chroma: number | null): string | null {
  if (!hue || value === null || chroma === null) return null

  // Simplified Munsell to RGB conversion (basic approximation)
  // For production, consider using a proper Munsell conversion library
  const munsellColor = `${hue} ${value}/${chroma}`
  return munsellColor
}

/**
 * Format horizon color display
 */
function formatHorizonColor(
  hue: string | null,
  value: number | null,
  chroma: number | null,
): string | null {
  if (!hue || value === null || chroma === null) return null
  return `${hue} ${value}/${chroma}`
}

/**
 * Get climate variable from climate array
 */
function getClimateVar(climate: OSDClimateData[], varName: string) {
  const data = climate.find((c) => c.climate_var === varName)
  return data
    ? {
        min: data.minimum,
        median: data.q50,
        max: data.maximum,
      }
    : null
}

/**
 * Format depth in cm to inches
 */
function formatDepth(cm: number): string {
  const inches = Math.round(cm / 2.54)
  return `${inches}"`
}

/**
 * Process and format raw OSD API data for UI display
 * @param raw - Raw OSD API response
 * @returns Formatted OSD data optimized for display
 */
export function formatOSDData(raw: OSDResponse): FormattedOSDData | null {
  if (!raw.site || raw.site.length === 0) return null

  const site = raw.site[0]

  // Format horizons
  const horizons = raw.hz.map((hz) => ({
    name: hz.hzname,
    depth: `${formatDepth(hz.top)}-${formatDepth(hz.bottom)}`,
    depthCm: {
      top: hz.top,
      bottom: hz.bottom,
    },
    texture: hz.texture_class,
    color: {
      dry: formatHorizonColor(hz.matrix_dry_color_hue, hz.matrix_dry_color_value, hz.matrix_dry_color_chroma),
      moist: formatHorizonColor(
        hz.matrix_wet_color_hue,
        hz.matrix_wet_color_value,
        hz.matrix_wet_color_chroma,
      ),
    },
    ph: hz.ph,
    phClass: hz.ph_class,
    narrative: hz.narrative,
  }))

  // Format parent materials
  const parentMaterial = raw.pmkind.map((pm) => ({
    material: pm.q_param,
    percentage: Math.round(pm.p * 100),
  }))

  // Extract climate data
  const elevation = getClimateVar(raw.climate, 'Elevation (m)')
  const precipitation = getClimateVar(raw.climate, 'Mean Annual Precipitation (mm)')
  const temperature = getClimateVar(raw.climate, 'Mean Annual Air Temperature (degrees C)')
  const frostFreeDays = getClimateVar(raw.climate, 'Frost-Free Days')
  const growingDegreeDays = getClimateVar(raw.climate, 'Growing Degree Days (degrees C)')

  // Format classification
  const classification = {
    family: site.family,
    order: site.soilorder,
    suborder: site.suborder,
    greatGroup: site.greatgroup,
    subGroup: site.subgroup,
    particleSize: site.tax_partsize,
    mineralogy: site.tax_minclass,
    temperatureRegime: site.tax_tempcl,
    reaction: site.tax_reaction,
  }

  // Format properties
  const properties = {
    drainage: site.drainagecl,
    established: site.establishedyear,
    benchmark: site.benchmarksoilflag === 'TRUE',
    status: site.series_status,
    typeLocation: site.soilseries_typelocst,
    mlraOffice: site.mlraoffice,
  }

  // Format extent
  const extent = {
    acres: site.ac,
    polygons: site.n_polygons,
    mlra: raw.mlra.map((m) => m.mlra),
  }

  // Associated soils
  const associatedSoils = raw.geog_assoc_soils.map((gas) => gas.gas)

  return {
    seriesName: site.seriesname,
    classification,
    properties,
    extent,
    horizons,
    parentMaterial,
    climate: {
      elevation: elevation ? { ...elevation, unit: 'm' } : { min: 0, median: 0, max: 0, unit: 'm' },
      precipitation: precipitation ? { ...precipitation, unit: 'mm' } : { min: 0, median: 0, max: 0, unit: 'mm' },
      temperature: temperature ? { ...temperature, unit: '°C' } : { min: 0, median: 0, max: 0, unit: '°C' },
      frostFreeDays: frostFreeDays || { min: 0, median: 0, max: 0 },
      growingDegreeDays: growingDegreeDays || { min: 0, median: 0, max: 0 },
    },
    geomorphology: {
      terrace: raw.terrace,
      flats: raw.flats,
      shapeAcross: raw.shape_across,
      shapeDown: raw.shape_down,
    },
    ecologicalSites: raw.ecoclassid,
    associatedSoils,
  }
}

/**
 * Fetch and format OSD data in one call
 * @param seriesName - Name of the soil series
 * @returns Formatted OSD data ready for display
 */
export async function getFormattedOSDData(seriesName: string): Promise<FormattedOSDData | null> {
  const rawData = await fetchOSDData(seriesName)
  if (!rawData) return null
  return formatOSDData(rawData)
}
