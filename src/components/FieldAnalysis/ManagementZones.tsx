// Management Zones Component

'use client'

import { useState, useEffect, useMemo } from 'react'
import { Layers, Info, Circle, SlidersHorizontal, Target, AlertTriangle } from 'lucide-react'
import { geeApi, GEEAPIError } from '#lib/geeApiClient'
import { geoJsonToWkt } from '#utils/geoJsonToWkt'
import type {
  ZoneOptimizationMethod,
  ZoneClusteringMethod,
  ZoneOptimizationResponse,
  ZoneDelineationResponse,
  ZonePolygonProperties,
} from '#types/geeApi'

interface ManagementZonesProps {
  fieldId: string
  fieldData?: any
  onZonesGenerated?: (zones: GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon, ZonePolygonProperties> | null) => void
  onZoneRastersGenerated?: (result: ZoneDelineationResponse | null) => void
}

const ZONE_COLORS = ['#7c3aed', '#16a34a', '#0284c7', '#f59e0b', '#ef4444', '#14b8a6', '#9333ea', '#84cc16', '#2563eb', '#db2777']

const DEFAULT_COVARIATES = ['ndvi', 'soci', 'twi', 'slope', 'clay']

const ALL_ZONE_COVARIATES = [
  'ndvi', 'soci', 'twi', 'slope', 'clay',
  'elevation', 'rel_elevation',
  'slope_degrees', 'slope_percent',
  'aspect', 'aspect_sin', 'aspect_cos',
  'plan_curvature', 'profile_curvature', 'plan_curvature_8', 'profile_curvature_8',
  'spi', 'convergence_index',
  'tpi_fine', 'tpi', 'tpi_broad', 'tri', 'valley_depth',
  'B2_blue', 'B3_green', 'B4_red', 'B8_nir', 'B11_swir1', 'B12_swir2',
  'NDVI', 'EVI', 'SAVI',
  'NDMI', 'NDWI',
  'BSI', 'Clay', 'Iron',
  'NDTI', 'NBR', 'SOCI',
]

interface ZoneSummary {
  id: number
  name: string
  acres: number
  percent: number
  color: string
  zoneType: string
  characteristics: string[]
  meanCovariates: Array<{ key: string; value: number }>
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace('#', '')
  const full = normalized.length === 3
    ? normalized.split('').map((c) => c + c).join('')
    : normalized

  const parsed = Number.parseInt(full, 16)
  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  }
}

function buildRasterDataUrl(
  width: number,
  height: number,
  paintPixel: (idx: number) => { r: number; g: number; b: number; a: number }
): string | null {
  if (typeof document === 'undefined' || width <= 0 || height <= 0) {
    return null
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return null
  }

  const imageData = ctx.createImageData(width, height)
  for (let i = 0; i < width * height; i += 1) {
    const pixel = paintPixel(i)
    const offset = i * 4
    imageData.data[offset] = pixel.r
    imageData.data[offset + 1] = pixel.g
    imageData.data[offset + 2] = pixel.b
    imageData.data[offset + 3] = pixel.a
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL('image/png')
}

function buildWktFromFieldData(fieldData: any): string {
  if (!fieldData?.boundary) {
    throw new Error('Field boundary is not available for zone analysis.')
  }

  if (typeof fieldData.boundary === 'string') {
    return fieldData.boundary
  }

  let geometry = fieldData.boundary
  if (geometry.type === 'Feature' && geometry.geometry) {
    geometry = geometry.geometry
  }

  if (geometry?.type && geometry?.coordinates) {
    return geoJsonToWkt(geometry)
  }

  throw new Error('Field boundary format is not supported for zone analysis.')
}

export default function ManagementZones({ fieldId, fieldData, onZonesGenerated, onZoneRastersGenerated }: ManagementZonesProps) {
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [optimizeMethod, setOptimizeMethod] = useState<ZoneOptimizationMethod>('composite')
  const [kMin, setKMin] = useState<number>(2)
  const [kMax, setKMax] = useState<number>(8)
  const [maxZones, setMaxZones] = useState<number>(5)
  const [minZoneAreaHa, setMinZoneAreaHa] = useState<number>(2)

  const [clusteringMethod, setClusteringMethod] = useState<ZoneClusteringMethod>('fuzzy_auto')
  const [fuzzinessM, setFuzzinessM] = useState<number>(2)
  const [smoothBoundaries, setSmoothBoundaries] = useState<boolean>(true)
  const [nZones, setNZones] = useState<number>(4)
  const [selectedCovariates, setSelectedCovariates] = useState<string[]>(DEFAULT_COVARIATES)

  const [optimizeLoading, setOptimizeLoading] = useState<boolean>(false)
  const [delineateLoading, setDelineateLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const [optimizeResult, setOptimizeResult] = useState<ZoneOptimizationResponse | null>(null)
  const [delineationResult, setDelineationResult] = useState<ZoneDelineationResponse | null>(null)
  const [zones, setZones] = useState<ZoneSummary[]>([])

  const zoneColorById = useMemo(() => {
    const map = new Map<number, string>()
    zones.forEach((zone) => {
      map.set(zone.id, zone.color)
    })
    return map
  }, [zones])

  const assignmentRasterPreview = useMemo(() => {
    const raster = delineationResult?.cluster_assignment_raster
    if (!raster) {
      return null
    }

    return buildRasterDataUrl(raster.width, raster.height, (idx) => {
      const clusterId = raster.assigned_cluster_ids[idx] || 0
      if (clusterId <= 0) {
        return { r: 0, g: 0, b: 0, a: 0 }
      }

      const colorHex = zoneColorById.get(clusterId) || ZONE_COLORS[(clusterId - 1 + ZONE_COLORS.length) % ZONE_COLORS.length]
      const rgb = hexToRgb(colorHex)
      const membership = clamp01(raster.winning_memberships[idx] ?? 1)
      const alpha = Math.round((0.25 + 0.75 * membership) * 255)

      return { r: rgb.r, g: rgb.g, b: rgb.b, a: alpha }
    })
  }, [delineationResult, zoneColorById])

  const membershipRasterPreviews = useMemo(() => {
    const membershipRasters = delineationResult?.cluster_membership_rasters
    if (!membershipRasters?.clusters?.length) {
      return [] as Array<{ clusterId: number; src: string | null }>
    }

    return membershipRasters.clusters.map((cluster) => {
      const colorHex = zoneColorById.get(cluster.cluster_id) || ZONE_COLORS[(cluster.cluster_id - 1 + ZONE_COLORS.length) % ZONE_COLORS.length]
      const rgb = hexToRgb(colorHex)
      const src = buildRasterDataUrl(membershipRasters.width, membershipRasters.height, (idx) => {
        const membership = clamp01(cluster.memberships[idx] ?? 0)
        const alpha = Math.round(membership * 255)
        return { r: rgb.r, g: rgb.g, b: rgb.b, a: alpha }
      })
      return { clusterId: cluster.cluster_id, src }
    })
  }, [delineationResult, zoneColorById])

  useEffect(() => {
    onZonesGenerated?.(null)
    onZoneRastersGenerated?.(null)
    setOptimizeResult(null)
    setDelineationResult(null)
    setZones([])
    setError('')
  }, [fieldId])

  const getFieldAreaHa = (): number | undefined => {
    const acres = fieldData?.acres ?? fieldData?.area
    if (typeof acres === 'number' && acres > 0) {
      return acres * 0.404686
    }
    return undefined
  }

  const handleOptimizeZones = async () => {
    setError('')
    setOptimizeLoading(true)
    try {
      const wkt = buildWktFromFieldData(fieldData)
      const response = await geeApi.optimizeZones({
        wkt,
        year,
        covariates: DEFAULT_COVARIATES,
        method: optimizeMethod,
        k_min: Math.min(kMin, kMax),
        k_max: Math.max(kMin, kMax),
        field_area_ha: getFieldAreaHa(),
        max_zones: maxZones,
        min_zone_area_ha: minZoneAreaHa,
      })

      setOptimizeResult(response)
      setNZones(response.recommended_k)
    } catch (e) {
      const message = e instanceof GEEAPIError ? e.message : 'Failed to optimize zone count.'
      setError(message)
    } finally {
      setOptimizeLoading(false)
    }
  }

  const handleDelineateZones = async () => {
    setError('')
    if (!selectedCovariates.length) {
      setError('Select at least one covariate before delineating zones.')
      return
    }

    setDelineateLoading(true)
    try {
      const wkt = buildWktFromFieldData(fieldData)
      const response = await geeApi.delineateZones({
        wkt,
        year,
        covariates: selectedCovariates,
        n_zones: nZones,
        clustering_method: clusteringMethod,
        fuzziness_m: clusteringMethod === 'kmeans' ? undefined : fuzzinessM,
        // Keep kmeans boundaries hard/partitioned to avoid visual overlap.
        smooth_boundaries: clusteringMethod === 'kmeans' ? false : smoothBoundaries,
        min_zone_area_ha: minZoneAreaHa,
        seed: 42,
      })

      const nextZoneColorById = new Map<number, string>()
      response.zone_characteristics.forEach((zone, index) => {
        nextZoneColorById.set(zone.zone_id, ZONE_COLORS[index % ZONE_COLORS.length])
      })

      const zoneStatsById = new Map<number, ZoneSummary>()
      response.zone_characteristics.forEach((zone, index) => {
        const color = nextZoneColorById.get(zone.zone_id) || ZONE_COLORS[index % ZONE_COLORS.length]
        const acres = zone.area_ha * 2.47105
        const meanCovariates = Object.entries(zone.mean_covariates || {})
          .filter(([, value]) => typeof value === 'number' && Number.isFinite(value))
          .map(([key, value]) => ({ key, value }))
          .sort((a, b) => a.key.localeCompare(b.key))

        zoneStatsById.set(zone.zone_id, {
          id: zone.zone_id,
          name: `Zone ${zone.zone_id}`,
          acres,
          percent: zone.area_pct,
          color,
          zoneType: zone.zone_type || 'Unclassified',
          characteristics: [
            `Area: ${zone.area_ha.toFixed(2)} ha (${acres.toFixed(1)} ac)`,
            `Pixels: ${zone.pixel_count.toLocaleString()}`,
          ],
          meanCovariates,
        })
      })

      const nextZones = Array.from(zoneStatsById.values()).sort((a, b) => a.id - b.id)
      setZones(nextZones)
      setDelineationResult(response)
      onZoneRastersGenerated?.(response)

      // Raster-first endpoint no longer returns zone polygons, so clear any legacy map overlay.
      onZonesGenerated?.(null)
    } catch (e) {
      const message = e instanceof GEEAPIError ? e.message : 'Failed to delineate management zones.'
      setError(message)
    } finally {
      setDelineateLoading(false)
    }
  }

  const toggleCovariate = (covariate: string, checked: boolean) => {
    setSelectedCovariates((prev) => {
      if (checked) {
        if (prev.includes(covariate)) {
          return prev
        }
        return [...prev, covariate]
      }
      return prev.filter((item) => item !== covariate)
    })
  }

  return (
    <div className="space-y-4">
      {/* Info Box */}
      <div className="flex items-start gap-2 p-3 rounded-lg" style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff' }}>
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#7c3aed' }} />
        <p className="text-xs" style={{ color: '#6b21a8' }}>
          Configure optimization to determine zone count, then delineate zones and review assignment/probability raster outputs below.
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-lg border border-gray-200 p-3 sm:p-4 bg-white">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-violet-600" />
            Zone Count Optimization
          </h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-gray-700">
                <span className="block mb-1">Year</span>
                <input type="number" min={2015} max={2030} value={year} onChange={(e) => setYear(Number(e.target.value) || new Date().getFullYear())} className="w-full rounded border border-gray-300 px-2 py-2" />
              </label>
              <label className="text-xs text-gray-700">
                <span className="block mb-1">Method</span>
                <select value={optimizeMethod} onChange={(e) => setOptimizeMethod(e.target.value as ZoneOptimizationMethod)} className="w-full rounded border border-gray-300 px-2 py-2">
                  <option value="composite">composite</option>
                  <option value="quick">quick</option>
                  <option value="silhouette">silhouette</option>
                  <option value="bic">bic</option>
                  <option value="fpc">fpc</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-gray-700">
                <span className="block mb-1">Min Zones (k_min)</span>
                <input type="number" min={2} max={10} value={kMin} onChange={(e) => setKMin(Number(e.target.value) || 2)} className="w-full rounded border border-gray-300 px-2 py-2" />
              </label>
              <label className="text-xs text-gray-700">
                <span className="block mb-1">Max Zones (k_max)</span>
                <input type="number" min={2} max={10} value={kMax} onChange={(e) => setKMax(Number(e.target.value) || 8)} className="w-full rounded border border-gray-300 px-2 py-2" />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-gray-700">
                <span className="block mb-1">max_zones</span>
                <input type="number" min={2} max={10} value={maxZones} onChange={(e) => setMaxZones(Number(e.target.value) || 5)} className="w-full rounded border border-gray-300 px-2 py-2" />
              </label>
              <label className="text-xs text-gray-700">
                <span className="block mb-1">min_zone_area_ha</span>
                <input type="number" min={0.1} step={0.1} value={minZoneAreaHa} onChange={(e) => setMinZoneAreaHa(Number(e.target.value) || 2)} className="w-full rounded border border-gray-300 px-2 py-2" />
              </label>
            </div>

            <button
              type="button"
              onClick={handleOptimizeZones}
              disabled={optimizeLoading || !fieldData?.boundary}
              className="w-full rounded-lg px-3 py-2 text-white text-sm font-semibold disabled:opacity-60"
              style={{ backgroundColor: '#7c3aed' }}
            >
              {optimizeLoading ? 'Optimizing...' : 'Optimize Zone Count'}
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 p-3 sm:p-4 bg-white">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-violet-600" />
            Zone Delineation
          </h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-gray-700">
                <span className="block mb-1">n_zones</span>
                <input type="number" min={2} max={10} value={nZones} onChange={(e) => setNZones(Number(e.target.value) || 4)} className="w-full rounded border border-gray-300 px-2 py-2" />
              </label>
              <label className="text-xs text-gray-700">
                <span className="block mb-1">covariates</span>
                <details className="rounded border border-gray-300 bg-gray-50">
                  <summary className="cursor-pointer px-2 py-2 text-xs text-gray-700 select-none">
                    {selectedCovariates.length} selected
                  </summary>
                  <div className="border-t border-gray-200 p-2">
                    <div className="mb-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCovariates(ALL_ZONE_COVARIATES)}
                        className="rounded border border-gray-300 px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-100"
                      >
                        Select all
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedCovariates(DEFAULT_COVARIATES)}
                        className="rounded border border-gray-300 px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-100"
                      >
                        Reset default
                      </button>
                    </div>
                    <div className="max-h-48 overflow-y-auto rounded border border-gray-200 bg-white p-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {ALL_ZONE_COVARIATES.map((covariate) => (
                          <label key={covariate} className="flex items-center gap-2 text-[11px] text-gray-700">
                            <input
                              type="checkbox"
                              checked={selectedCovariates.includes(covariate)}
                              onChange={(e) => toggleCovariate(covariate, e.target.checked)}
                              className="h-3 w-3"
                            />
                            <span>{covariate}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </details>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-gray-700">
                <span className="block mb-1">clustering_method</span>
                <select value={clusteringMethod} onChange={(e) => setClusteringMethod(e.target.value as ZoneClusteringMethod)} className="w-full rounded border border-gray-300 px-2 py-2">
                  <option value="kmeans">kmeans</option>
                  <option value="fuzzy">fuzzy</option>
                  <option value="fuzzy_soft">fuzzy_soft</option>
                  <option value="fuzzy_auto">fuzzy_auto</option>
                </select>
              </label>

              <label className="text-xs text-gray-700">
                <span className="block mb-1">fuzziness_m</span>
                <input type="number" min={1.1} max={5} step={0.1} value={fuzzinessM} disabled={clusteringMethod === 'kmeans'} onChange={(e) => setFuzzinessM(Number(e.target.value) || 2)} className="w-full rounded border border-gray-300 px-2 py-2 disabled:bg-gray-100" />
              </label>
            </div>

            <label className="flex items-center gap-2 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={clusteringMethod === 'kmeans' ? false : smoothBoundaries}
                disabled={clusteringMethod === 'kmeans'}
                onChange={(e) => setSmoothBoundaries(e.target.checked)}
                className="w-4 h-4 disabled:opacity-50"
              />
              smooth_boundaries
            </label>
            {clusteringMethod === 'kmeans' ? (
              <p className="text-[11px] text-gray-500 -mt-2">
                Disabled for kmeans to preserve non-overlapping hard zone boundaries.
              </p>
            ) : null}

            <button
              type="button"
              onClick={handleDelineateZones}
              disabled={delineateLoading || !fieldData?.boundary}
              className="w-full rounded-lg px-3 py-2 text-white text-sm font-semibold disabled:opacity-60"
              style={{ backgroundColor: '#6d28d9' }}
            >
              {delineateLoading ? 'Delineating...' : 'Delineate Zones'}
            </button>
          </div>
        </section>
      </div>

      {error ? (
        <div className="flex items-start gap-2 p-3 rounded-lg border border-red-200 bg-red-50">
          <AlertTriangle className="w-4 h-4 mt-0.5 text-red-600" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      ) : null}

      {optimizeResult ? (
        <div className="rounded-lg border border-violet-200 bg-violet-50 p-3">
          <p className="text-sm font-semibold text-violet-900">Recommended Zones: {optimizeResult.recommended_k}</p>
          {typeof optimizeResult.consensus_k === 'number' ? (
            <p className="text-xs text-violet-900 mt-1">
              Consensus (diagnostic): {optimizeResult.consensus_k}
            </p>
          ) : null}
          <p className="text-xs text-violet-800 mt-1">{optimizeResult.reason}</p>
          {Array.isArray(optimizeResult.composite_scores) && optimizeResult.composite_scores.length > 0 ? (
            <div className="mt-2 rounded border border-violet-200 bg-white p-2">
              <p className="text-[11px] font-semibold text-violet-900 mb-1">Composite Score Diagnostics</p>
              <div className="space-y-1">
                {optimizeResult.composite_scores
                  .slice()
                  .sort((a, b) => b.composite_score - a.composite_score)
                  .slice(0, 3)
                  .map((item) => (
                    <div key={item.k} className="flex items-center justify-between text-[11px] text-violet-900">
                      <span>k={item.k}{item.stability_penalty_applied ? ' (stability penalty)' : ''}</span>
                      <span className="font-semibold">{item.composite_score.toFixed(3)}</span>
                    </div>
                  ))}
              </div>
            </div>
          ) : null}
          {optimizeResult.warnings?.length ? (
            <ul className="mt-2 text-xs text-violet-800 list-disc pl-4">
              {optimizeResult.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {delineationResult ? (
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-xs text-gray-700">
            Delineation complete using <span className="font-semibold">{delineationResult.method_used}</span> and <span className="font-semibold">{delineationResult.clustering_method_used}</span>.
          </p>
          {delineationResult.fuzziness_m_used !== null ? (
            <p className="text-xs text-gray-600 mt-1">Fuzziness m used: {delineationResult.fuzziness_m_used.toFixed(2)}</p>
          ) : null}
          {typeof delineationResult.n_transition_pixels === 'number' ? (
            <p className="text-xs text-gray-600 mt-1">Transition pixels: {delineationResult.n_transition_pixels.toLocaleString()}</p>
          ) : null}
        </div>
      ) : null}

      {delineationResult ? (
        <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">Raster Outputs</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="rounded border border-gray-200 p-2 bg-gray-50">
              <p className="text-xs font-semibold text-gray-700 mb-2">Cluster Assignment</p>
              {assignmentRasterPreview ? (
                <img
                  src={assignmentRasterPreview}
                  alt="Cluster assignment raster"
                  className="w-full h-auto rounded border border-gray-200 bg-white"
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <p className="text-xs text-gray-500">Assignment raster not returned by API.</p>
              )}
            </div>

            <div className="rounded border border-gray-200 p-2 bg-gray-50">
              <p className="text-xs font-semibold text-gray-700 mb-2">Cluster Probability Layers</p>
              {membershipRasterPreviews.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {membershipRasterPreviews.map((layer) => (
                    <div key={layer.clusterId} className="rounded border border-gray-200 p-1 bg-white">
                      <p className="text-[11px] text-gray-700 mb-1">Cluster {layer.clusterId}</p>
                      {layer.src ? (
                        <img
                          src={layer.src}
                          alt={`Cluster ${layer.clusterId} probability raster`}
                          className="w-full h-auto rounded"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      ) : (
                        <p className="text-[11px] text-gray-500">Unavailable</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">Cluster membership rasters not returned by API.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Zone Distribution */}
      <div className="space-y-2">
        {zones.map((zone) => (
          <div key={zone.id}>
            <div className="flex items-center justify-between text-xs mb-1">
              <div className="flex items-center gap-2">
                <Layers className="w-3 h-3" style={{ color: zone.color }} />
                <span className="font-medium text-gray-700">{zone.name}</span>
              </div>
              <span className="text-gray-600">{zone.acres.toFixed(1)} ac ({zone.percent.toFixed(1)}%)</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${zone.percent}%`,
                  backgroundColor: zone.color
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Zone Details */}
      <div className="space-y-3">
        {zones.map((zone) => (
          <div key={zone.id} className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: zone.color }} />
              <h4 className="text-sm font-semibold text-gray-900">{zone.name}</h4>
            </div>
            <p className="text-xs text-gray-500 mb-2">Type class: {zone.zoneType}</p>
            
            <div className="mb-2">
              <h5 className="text-xs font-semibold text-gray-700 mb-1">Characteristics:</h5>
              <ul className="space-y-1">
                {zone.characteristics.map((char: string, idx: number) => (
                  <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                    <Circle className="w-2 h-2 mt-1 flex-shrink-0" style={{ color: zone.color, fill: zone.color }} />
                    <span>{char}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-semibold text-gray-700 mb-1">Mean Covariates:</h5>
              {zone.meanCovariates.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {zone.meanCovariates.map((item) => (
                    <div key={`${zone.id}-${item.key}`} className="text-xs text-gray-600 flex items-center justify-between rounded bg-gray-50 px-2 py-1">
                      <span className="font-medium text-gray-700 mr-2">{item.key}</span>
                      <span>{item.value.toFixed(3)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No covariate means returned.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
