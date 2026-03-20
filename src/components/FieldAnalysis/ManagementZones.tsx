// Management Zones Component

'use client'

import { useState, useEffect } from 'react'
import { Layers, Info, Circle, SlidersHorizontal, Target, AlertTriangle } from 'lucide-react'
import { geeApi, GEEAPIError } from '#lib/geeApiClient'
import { geoJsonToWkt } from '#utils/geoJsonToWkt'
import type {
  ZoneOptimizationMethod,
  ZoneClusteringMethod,
  ZoneDelineationMethod,
  ZoneOptimizationResponse,
  ZoneDelineationResponse,
  ZonePolygonProperties,
} from '#types/geeApi'

interface ManagementZonesProps {
  fieldId: string
  fieldData?: any
  onZonesGenerated?: (zones: GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon, ZonePolygonProperties> | null) => void
}

const ZONE_COLORS = ['#7c3aed', '#16a34a', '#0284c7', '#f59e0b', '#ef4444', '#14b8a6', '#9333ea', '#84cc16', '#2563eb', '#db2777']

const DEFAULT_COVARIATES = ['ndvi', 'soci', 'twi', 'slope', 'clay']

interface ZoneSummary {
  id: number
  name: string
  acres: number
  percent: number
  color: string
  characteristics: string[]
  recommendations: string[]
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

export default function ManagementZones({ fieldId, fieldData, onZonesGenerated }: ManagementZonesProps) {
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [optimizeMethod, setOptimizeMethod] = useState<ZoneOptimizationMethod>('consensus')
  const [kMin, setKMin] = useState<number>(2)
  const [kMax, setKMax] = useState<number>(8)
  const [maxZones, setMaxZones] = useState<number>(5)
  const [minZoneAreaHa, setMinZoneAreaHa] = useState<number>(2)

  const [delineationMethod, setDelineationMethod] = useState<ZoneDelineationMethod>('satellite')
  const [clusteringMethod, setClusteringMethod] = useState<ZoneClusteringMethod>('fuzzy_auto')
  const [fuzzinessM, setFuzzinessM] = useState<number>(2)
  const [smoothBoundaries, setSmoothBoundaries] = useState<boolean>(true)
  const [nZones, setNZones] = useState<number>(4)

  const [optimizeLoading, setOptimizeLoading] = useState<boolean>(false)
  const [delineateLoading, setDelineateLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const [optimizeResult, setOptimizeResult] = useState<ZoneOptimizationResponse | null>(null)
  const [delineationResult, setDelineationResult] = useState<ZoneDelineationResponse | null>(null)
  const [zones, setZones] = useState<ZoneSummary[]>([])

  useEffect(() => {
    onZonesGenerated?.(null)
    setOptimizeResult(null)
    setDelineationResult(null)
    setZones([])
    setError('')
  }, [fieldId, onZonesGenerated])

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
    setDelineateLoading(true)
    try {
      const wkt = buildWktFromFieldData(fieldData)
      const response = await geeApi.delineateZones({
        wkt,
        year,
        method: delineationMethod,
        n_zones: nZones,
        clustering_method: clusteringMethod,
        fuzziness_m: clusteringMethod === 'kmeans' ? undefined : fuzzinessM,
        smooth_boundaries: smoothBoundaries,
        min_zone_area_ha: minZoneAreaHa,
        seed: 42,
      })

      const zoneColorById = new Map<number, string>()
      response.zone_characteristics.forEach((zone, index) => {
        zoneColorById.set(zone.zone_id, ZONE_COLORS[index % ZONE_COLORS.length])
      })

      const coloredFeatures = response.zone_polygons.features.map((feature) => {
        const zoneId = Number(feature.properties?.zone_id ?? 0)
        const color = zoneColorById.get(zoneId) || ZONE_COLORS[(zoneId - 1 + ZONE_COLORS.length) % ZONE_COLORS.length]
        return {
          ...feature,
          properties: {
            ...feature.properties,
            color,
          },
        }
      })

      const zoneStatsById = new Map<number, ZoneSummary>()
      response.zone_characteristics.forEach((zone, index) => {
        const color = zoneColorById.get(zone.zone_id) || ZONE_COLORS[index % ZONE_COLORS.length]
        const acres = zone.area_ha * 2.47105
        const variability = zone.temporal_stability

        zoneStatsById.set(zone.zone_id, {
          id: zone.zone_id,
          name: zone.zone_type || `Zone ${zone.zone_id}`,
          acres,
          percent: zone.area_pct,
          color,
          characteristics: [
            `Area: ${zone.area_ha.toFixed(2)} ha (${acres.toFixed(1)} ac)`,
            `Pixels: ${zone.pixel_count.toLocaleString()}`,
            variability !== null ? `Temporal stability: ${(variability * 100).toFixed(1)}%` : 'Temporal stability: N/A',
          ],
          recommendations: [
            'Use this zone boundary for targeted soil sampling and variable-rate planning.',
            'Compare zone response to fertility and drainage interventions over time.',
          ],
        })
      })

      const nextZones = Array.from(zoneStatsById.values()).sort((a, b) => a.id - b.id)
      setZones(nextZones)
      setDelineationResult({
        ...response,
        zone_polygons: {
          ...response.zone_polygons,
          features: coloredFeatures,
        },
      })

      onZonesGenerated?.({
        ...response.zone_polygons,
        features: coloredFeatures,
      })
    } catch (e) {
      const message = e instanceof GEEAPIError ? e.message : 'Failed to delineate management zones.'
      setError(message)
    } finally {
      setDelineateLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Info Box */}
      <div className="flex items-start gap-2 p-3 rounded-lg" style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff' }}>
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#7c3aed' }} />
        <p className="text-xs" style={{ color: '#6b21a8' }}>
          Configure optimization to determine the recommended zone count, then delineate zones and display them in the map panel.
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
                  <option value="consensus">consensus</option>
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
                <span className="block mb-1">method</span>
                <select value={delineationMethod} onChange={(e) => setDelineationMethod(e.target.value as ZoneDelineationMethod)} className="w-full rounded border border-gray-300 px-2 py-2">
                  <option value="satellite">satellite</option>
                  <option value="terrain">terrain</option>
                </select>
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
              <input type="checkbox" checked={smoothBoundaries} onChange={(e) => setSmoothBoundaries(e.target.checked)} className="w-4 h-4" />
              smooth_boundaries
            </label>

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
              <h5 className="text-xs font-semibold text-gray-700 mb-1">Recommendations:</h5>
              <ul className="space-y-1">
                {zone.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                    <Circle className="w-2 h-2 mt-1 flex-shrink-0" style={{ color: '#16a34a', fill: '#16a34a' }} />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
