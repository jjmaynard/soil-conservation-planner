// Vegetation Monitoring Component - NDVI Time Series and Productivity Analysis

'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Activity, Info, Calendar } from 'lucide-react'
import type { EnhancedFieldData } from '#hooks/useComprehensiveFieldAssessment'
import type { SentinelResponse, SentinelTimeSeriesPoint, SentinelWithinFieldVariability } from '#types/geeApi'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'

interface VegetationMonitoringProps {
  fieldId?: string
  geeData: EnhancedFieldData | null
  wkt?: string
}


type TimeRange = 'season' | '4year' | '8year'

// Cache configuration
const CACHE_DURATION_HOURS = 24
const CACHE_KEY_PREFIX = 'vegetation_monitoring_'

export default function VegetationMonitoring({ fieldId, geeData, wkt }: VegetationMonitoringProps) {
  const [allTimeseriesData, setAllTimeseriesData] = useState<any[] | null>(null) // Store full dataset
  const [displayedData, setDisplayedData] = useState<any[] | null>(null) // Filtered data for chart
  const [timeseriesLoading, setTimeseriesLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('season')
  const [apiWithinFieldVariability, setApiWithinFieldVariability] = useState<SentinelWithinFieldVariability | null>(null)
  const [customMetrics, setCustomMetrics] = useState<{
    ndviMean: number;
    ndviStd: number;
    ndviCV: number;
    yearsAnalyzed: number;
    intraAnnualCV: number; // Within-season variability
    withinFieldCV: number | null; // True within-field spatial variability (CV)
  } | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  type SentinelChunkResult = {
    timeSeries: SentinelTimeSeriesPoint[]
    withinFieldVariability?: SentinelWithinFieldVariability
  }
  
  // Generate cache key from field identifier
  const getCacheKey = (wktString: string, fId?: string): string => {
    // Use fieldId if available for cleaner keys, otherwise hash the WKT
    const identifier = fId || wktString.substring(0, 50).replace(/[^a-zA-Z0-9]/g, '_')
    return `${CACHE_KEY_PREFIX}${identifier}`
  }

  // Check if cached data is still valid
  const getCachedData = (cacheKey: string): any[] | null => {
    try {
      const cached = localStorage.getItem(cacheKey)
      if (!cached) return null

      const { data, timestamp } = JSON.parse(cached)
      const now = Date.now()
      const ageHours = (now - timestamp) / (1000 * 60 * 60)

      if (ageHours < CACHE_DURATION_HOURS) {
        console.log(`📦 Using cached vegetation data (${ageHours.toFixed(1)}h old)`)
        return data
      } else {
        console.log(`⏰ Cache expired (${ageHours.toFixed(1)}h old), refreshing...`)
        localStorage.removeItem(cacheKey)
        return null
      }
    } catch (error) {
      console.error('Failed to read cache:', error)
      return null
    }
  }

  // Save data to cache
  const setCachedData = (cacheKey: string, data: any[]) => {
    try {
      const cacheEntry = {
        data,
        timestamp: Date.now()
      }
      localStorage.setItem(cacheKey, JSON.stringify(cacheEntry))
      console.log('💾 Cached vegetation data for future use')
    } catch (error) {
      console.error('Failed to cache data:', error)
      // If localStorage is full, try to clear old vegetation caches
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(CACHE_KEY_PREFIX) && key !== cacheKey) {
            localStorage.removeItem(key)
          }
        })
        // Retry save
        localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }))
      } catch (retryError) {
        console.warn('Unable to cache data - localStorage may be full')
      }
    }
  }
  
  // Initial fetch: Check cache first, then split strategy to ensure season data loads fast
  useEffect(() => {
    if (wkt) {
      const cacheKey = getCacheKey(wkt, fieldId)
      const cachedData = getCachedData(cacheKey)
      
      if (cachedData && cachedData.length > 0) {
        // Use cached data immediately
        setAllTimeseriesData(cachedData)
        setFetchError(null)
      } else {
        // No valid cache - fetch from API
        setAllTimeseriesData(null)
        setFetchError(null)
        fetchDataSplitStrategy()
      }
    }
  }, [wkt, fieldId])

  // Filter data when selection changes or data loads
  useEffect(() => {
    if (allTimeseriesData) {
      filterDataForRange(selectedTimeRange)
    }
  }, [selectedTimeRange, allTimeseriesData])

  // Recalculate robust metrics whenever full timeseries data is available
  useEffect(() => {
    if (allTimeseriesData && allTimeseriesData.length > 0) {
      calculateRobustMetrics(allTimeseriesData)
    }
  }, [allTimeseriesData])

  const fetchGeEChunk = async (startDate: string, endDate: string): Promise<SentinelChunkResult> => {
      try {
        // Use the Next.js proxy route to avoid CORS errors
        const response = await fetch('/api/gee/api/sentinel/polygon', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json'
          },
          body: JSON.stringify({
            cloud_threshold: 30, 
            start_date: startDate,
            end_date: endDate,
            export_raster: false,
            pixel_sample: false,
            reducer: "median",
            scale: 10,
            wkt: wkt
          })
        })

        if (response.ok) {
          const data = await response.json() as SentinelResponse
          const timeSeries = (data.time_series || [])
            .map((point) => {
              const spatialStats = point.spatial_stats || {}

              const ndviValue =
                typeof point.ndvi === 'number'
                  ? point.ndvi
                  : (typeof point.ndvi_mean === 'number'
                      ? point.ndvi_mean
                      : (typeof spatialStats.ndvi_mean === 'number' ? spatialStats.ndvi_mean : NaN))

              return {
                ...point,
                ...spatialStats,
                ndvi: ndviValue,
                ndvi_mean: point.ndvi_mean ?? spatialStats.ndvi_mean ?? ndviValue,
              }
            })
            .filter((point) => Number.isFinite(point.ndvi))

          return {
            timeSeries,
            withinFieldVariability: data.within_field_variability
          }
        } else {
          const errorData = await response.json().catch(() => ({}))
          console.error('Sentinel API error:', response.status, errorData)
          throw new Error(`Sentinel API returned ${response.status}: ${errorData.detail || 'Unknown error'}`)
        }
      } catch (error) {
        console.error('Failed to fetch Sentinel timeseries chunk:', error)
        throw error
      }
  }

  const fetchDataSplitStrategy = async () => {
    try {
      setTimeseriesLoading(true)
      
      const currentYear = new Date().getFullYear() // 2026
      const lastYear = currentYear - 1 // 2025
      
      // 1. Fetch Current Season (Critical - Fast)
      // Widen the season window slightly to ensure we capture early/late crop activity
      const seasonStart = `${lastYear}-04-01`
      const seasonEnd = `${lastYear}-10-31` 

      const seasonData = await fetchGeEChunk(seasonStart, seasonEnd)
      setApiWithinFieldVariability(seasonData.withinFieldVariability || null)
      
      // Update state immediately with season data so the user sees the graph
      const sortedSeason = seasonData.timeSeries.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      setAllTimeseriesData(sortedSeason)
      setTimeseriesLoading(false)

      // 2. Fetch History (Background - Slow)
      setHistoryLoading(true)
      const historyStart = `${lastYear - 7}-01-01`
      const historyEnd = `${lastYear}-03-31` // Until start of season fetch
      
      const historyData = await fetchGeEChunk(historyStart, historyEnd)
      
      if (historyData.timeSeries.length > 0) {
        const combined = [...sortedSeason, ...historyData.timeSeries]
        const sortedComplete = combined.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        
        // Update state with complete dataset
        setAllTimeseriesData(sortedComplete)
        
        // Cache the complete dataset
        if (wkt) {
          const cacheKey = getCacheKey(wkt, fieldId)
          setCachedData(cacheKey, sortedComplete)
        }
      }
    } catch (error) {
      console.error('Failed to fetch Sentinel NDVI timeseries:', error)
      setFetchError(error instanceof Error ? error.message : 'Failed to load vegetation data')
      setTimeseriesLoading(false)
    } finally {
      setHistoryLoading(false)
    }
  }

  const calculateRobustMetrics = (data: any[]) => {
    try {
      // 1. Group by Year and find peak during growing season
      const byYear: Record<number, number[]> = {}
      const allGrowingSeasonValues: number[] = []
      const allGrowingSeasonSpatialCV: number[] = []

      const toNumber = (value: any): number | null => {
        if (typeof value === 'number' && Number.isFinite(value)) return value
        if (typeof value === 'string') {
          const parsed = Number(value)
          if (Number.isFinite(parsed)) return parsed
        }
        return null
      }
      
      data.forEach((d: SentinelTimeSeriesPoint) => {
        const date = new Date(d.date)
        const year = date.getFullYear()
        const month = date.getMonth() // 0-indexed
        const ndviValue = typeof d.ndvi === 'number' ? d.ndvi : d.ndvi_mean
        
        // Filter for Peak Growing Season (May-September: Months 4-8)
        // This captures the full growing season while excluding winter/early spring
           if (month >= 4 && month <= 8 && Number.isFinite(ndviValue)) {
             if (!byYear[year]) byYear[year] = []
             byYear[year].push(ndviValue)
             allGrowingSeasonValues.push(ndviValue)

             // Try to extract within-field NDVI spread from the timeseries payload
             const ndviMeanValue = toNumber(ndviValue)
             const ndviStdValue =
               toNumber((d as any).spatial_stats?.ndvi_std) ??
               toNumber((d as any).ndvi_std) ??
               toNumber((d as any).std_dev) ??
               toNumber((d as any).ndviStd) ??
               toNumber((d as any).stdDev) ??
               toNumber((d as any).pixel_std_dev)
             const spatialCVFromApi = toNumber((d as any).spatial_stats?.spatial_cv) ?? toNumber((d as any).spatial_cv)
             const validPixelPct = toNumber((d as any).spatial_stats?.valid_pixel_pct) ?? toNumber((d as any).valid_pixel_pct)

             if (validPixelPct !== null && validPixelPct < 60) {
               return
             }

             const spatialCV =
               spatialCVFromApi !== null
                 ? spatialCVFromApi
                 : (ndviMeanValue !== null && ndviStdValue !== null && ndviMeanValue > 0
                    ? ndviStdValue / ndviMeanValue
                    : null)

             if (spatialCV !== null && Number.isFinite(spatialCV) && spatialCV >= 0) {
               allGrowingSeasonSpatialCV.push(spatialCV)
             }
        }
      })

      // 2. Find the actual maximum NDVI for each year during peak season
      const yearlyPeaks: number[] = []
      Object.entries(byYear).forEach(([year, values]) => {
         if (values.length < 2) return // Ignore years with insufficient data

         // Use actual maximum - the chart shows clear, consistent peaks
         const peak = Math.max(...values)
         
         // Filter out invalid years where peak is impossibly low (clouds, crop failure)
         if (peak > 0.6) {
             yearlyPeaks.push(peak)
         }
      })

      // 3. Remove statistical outliers using IQR method
      if (yearlyPeaks.length > 3) {
        const sorted = [...yearlyPeaks].sort((a,b) => a - b)
        const q1 = sorted[Math.floor(sorted.length * 0.25)]
        const q3 = sorted[Math.floor(sorted.length * 0.75)]
        const iqr = q3 - q1
        const lowerBound = q1 - 1.5 * iqr
        const upperBound = q3 + 1.5 * iqr
        
        // Filter outliers
        const filteredPeaks = yearlyPeaks.filter(p => p >= lowerBound && p <= upperBound)
        
        if (filteredPeaks.length > 1) {
          const mean = filteredPeaks.reduce((a,b) => a+b, 0) / filteredPeaks.length
          const variance = filteredPeaks.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / filteredPeaks.length
          const stdDev = Math.sqrt(variance)
          const cv = stdDev / mean
          
          // Calculate intra-annual variability (within-season variation)
          let intraCV = 0
          if (allGrowingSeasonValues.length > 0) {
            const intraMean = allGrowingSeasonValues.reduce((a,b) => a+b, 0) / allGrowingSeasonValues.length
            const intraVariance = allGrowingSeasonValues.reduce((a,b) => a + Math.pow(b - intraMean, 2), 0) / allGrowingSeasonValues.length
            const intraStdDev = Math.sqrt(intraVariance)
            intraCV = intraStdDev / intraMean
          }

          // Within-field variability: only use true spatial CV derived from per-image NDVI spread
          const hasSpatialCV = allGrowingSeasonSpatialCV.length > 0
          const withinFieldCV = hasSpatialCV
            ? allGrowingSeasonSpatialCV.reduce((a, b) => a + b, 0) / allGrowingSeasonSpatialCV.length
            : null
          
          setCustomMetrics({
              ndviMean: mean,
              ndviStd: stdDev,
              ndviCV: cv,
              yearsAnalyzed: filteredPeaks.length,
              intraAnnualCV: intraCV,
              withinFieldCV
          })
        }
      } else if (yearlyPeaks.length > 1) {
        // If fewer than 4 years, don't filter outliers
        const mean = yearlyPeaks.reduce((a,b) => a+b, 0) / yearlyPeaks.length
        const variance = yearlyPeaks.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / yearlyPeaks.length
        const stdDev = Math.sqrt(variance)
        const cv = stdDev / mean
        
        // Calculate intra-annual variability
        let intraCV = 0
        if (allGrowingSeasonValues.length > 0) {
          const intraMean = allGrowingSeasonValues.reduce((a,b) => a+b, 0) / allGrowingSeasonValues.length
          const intraVariance = allGrowingSeasonValues.reduce((a,b) => a + Math.pow(b - intraMean, 2), 0) / allGrowingSeasonValues.length
          const intraStdDev = Math.sqrt(intraVariance)
          intraCV = intraStdDev / intraMean
        }

        const hasSpatialCV = allGrowingSeasonSpatialCV.length > 0
        const withinFieldCV = hasSpatialCV
          ? allGrowingSeasonSpatialCV.reduce((a, b) => a + b, 0) / allGrowingSeasonSpatialCV.length
          : null
        
        setCustomMetrics({
            ndviMean: mean,
            ndviStd: stdDev,
            ndviCV: cv,
            yearsAnalyzed: yearlyPeaks.length,
            intraAnnualCV: intraCV,
            withinFieldCV
        })
      }
    } catch (e) {
      console.warn("Failed to calculate robust metrics", e)
    }
  }

  /* Deprecated single-fetch function removed */

  const filterDataForRange = (range: TimeRange) => {
    if (!allTimeseriesData) return

    const currentYear = new Date().getFullYear()
    const lastYear = currentYear - 1
    let cutoffDate: Date

    if (range === 'season') {
      cutoffDate = new Date(`${lastYear}-05-01`) // Start of last season
    } else if (range === '4year') {
      cutoffDate = new Date(`${lastYear - 3}-01-01`)
    } else {
      setDisplayedData(allTimeseriesData) // 8year (full set)
      return
    }

    const filtered = allTimeseriesData.filter((d: any) => new Date(d.date) >= cutoffDate)
    setDisplayedData(filtered)
  }

  // Show error state if fetch failed
  if (fetchError) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-5 h-5" />
          <h3 className="font-semibold">Error Loading Vegetation Data</h3>
        </div>
        <p className="text-sm mb-3">{fetchError}</p>
        <button 
          onClick={() => {
            setFetchError(null)
            setAllTimeseriesData(null)
            if (wkt) fetchDataSplitStrategy()
          }}
          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-sm font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  // Show loading state while waiting for GEE data or initial timeseries
  // This prevents the "No Data" flash while data is silently loading
  if (wkt && (!geeData?.geeAssessment || (!displayedData && timeseriesLoading))) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-4"></div>
        <p className="text-gray-500">Retrieving vegetation metrics...</p>
      </div>
    )
  }

  if (!geeData?.geeAssessment) {
    return (
      <div className="text-center py-8">
        <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-sm text-gray-600">No vegetation data available</p>
        <p className="text-xs text-gray-500 mt-1">GEE assessment required</p>
      </div>
    )
  }

  // Fallback to GEE Assessment data if local calculation isn't ready
  const productivity = geeData.geeAssessment.productivity
  const stability = geeData.geeAssessment.soil_quality.productivity_stability
  
  // Use custom metrics if available, otherwise API defaults
  const ndviMean = customMetrics?.ndviMean ?? productivity?.productivity_metrics?.ndvi_peak_mean ?? 0
  const ndviStd = customMetrics?.ndviStd ?? productivity?.productivity_metrics?.ndvi_peak_std ?? 0
  const ndviCV = customMetrics?.ndviCV ?? stability?.ndvi_peak_cv ?? 0
  const intraAnnualCV = customMetrics?.intraAnnualCV ?? 0
  const withinFieldCV = customMetrics?.withinFieldCV ?? apiWithinFieldVariability?.spatial_cv_median ?? null
  const hasWithinFieldMetric = withinFieldCV !== null && Number.isFinite(withinFieldCV)
  const yearsAnalyzed = customMetrics?.yearsAnalyzed ?? stability?.years_analyzed ?? 0
  
  // Calculate Fractional Vegetation Cover (FVC) from NDVI
  // FVC = ((NDVI - NDVI_soil) / (NDVI_veg - NDVI_soil))^2
  // Assuming NDVI_soil = 0.2, NDVI_veg = 0.95
  const calculateFVC = (ndvi: number) => {
    if (ndvi < 0.2) return 0
    const fvc = Math.pow((ndvi - 0.2) / 0.75, 1) // Using linear approximation for robustness
    return Math.min(Math.max(fvc * 100, 0), 100)
  }

  const fvcMean = calculateFVC(ndviMean)
  const fvcMin = calculateFVC(ndviMean - (ndviStd * 2))
  const fvcMax = calculateFVC(ndviMean + (ndviStd * 2))

  // Classify inter-annual stability (year-to-year consistency)
  const getInterAnnualRating = (cv: number) => {
    if (cv < 0.1) return { label: 'Excellent', color: '#16a34a', bg: '#dcfce7', desc: 'Highly consistent' }
    if (cv < 0.15) return { label: 'Good', color: '#65a30d', bg: '#ecfccb', desc: 'Consistent' }
    if (cv < 0.20) return { label: 'Fair', color: '#f59e0b', bg: '#fef3c7', desc: 'Moderate variation' }
    return { label: 'Poor', color: '#dc2626', bg: '#fee2e2', desc: 'High variation' }
  }

  // Classify intra-annual variability (within-season uniformity)
  const getIntraAnnualRating = (cv: number) => {
    if (cv < 0.15) return { label: 'Low', color: '#16a34a', bg: '#dcfce7', desc: 'Uniform field' }
    if (cv < 0.25) return { label: 'Moderate', color: '#f59e0b', bg: '#fef3c7', desc: 'Some variability' }
    if (cv < 0.35) return { label: 'High', color: '#ea580c', bg: '#fed7aa', desc: 'Variable field' }
    return { label: 'Very High', color: '#dc2626', bg: '#fee2e2', desc: 'Highly variable' }
  }

  const getWithinFieldRating = (cv: number) => {
    if (cv < 0.08) return { label: 'Very Uniform', color: '#16a34a', bg: '#dcfce7' }
    if (cv < 0.15) return { label: 'Uniform', color: '#65a30d', bg: '#ecfccb' }
    if (cv < 0.25) return { label: 'Moderate', color: '#f59e0b', bg: '#fef3c7' }
    if (cv < 0.35) return { label: 'Variable', color: '#ea580c', bg: '#fed7aa' }
    return { label: 'Highly Variable', color: '#dc2626', bg: '#fee2e2' }
  }

  const interAnnualRating = getInterAnnualRating(ndviCV)
  const intraAnnualRating = getIntraAnnualRating(intraAnnualCV)
  const withinFieldRating = hasWithinFieldMetric && withinFieldCV !== null
    ? getWithinFieldRating(withinFieldCV)
    : { label: 'Unavailable', color: '#6b7280', bg: '#f3f4f6' }
  const managementUniformityScore = hasWithinFieldMetric && withinFieldCV !== null
    ? (apiWithinFieldVariability?.management_uniformity_score ?? Math.max(0, Math.min(100, 100 - (withinFieldCV * 100))))
    : null

  // Classify NDVI performance
  const getNDVIPerformance = (ndvi: number) => {
    if (ndvi > 0.7) return { label: 'Excellent', color: '#16a34a' }
    if (ndvi > 0.6) return { label: 'Good', color: '#65a30d' }
    if (ndvi > 0.5) return { label: 'Moderate', color: '#f59e0b' }
    if (ndvi > 0.4) return { label: 'Low', color: '#ea580c' }
    return { label: 'Very Low', color: '#dc2626' }
  }

  const ndviPerformance = getNDVIPerformance(ndviMean)

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac' }}>
        <div className="flex items-start gap-3">
          <Activity className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#16a34a' }} />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Vegetation Health Analysis</h3>
            <p className="text-sm text-gray-700">
              Multi-year NDVI productivity assessment based on {yearsAnalyzed} years of satellite imagery data.
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Average NDVI */}
        <div className="p-4 rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Peak NDVI</span>
            <span 
              className="text-xs font-semibold px-2 py-1 rounded"
              style={{ backgroundColor: `${ndviPerformance.color}22`, color: ndviPerformance.color }}
            >
              {ndviPerformance.label}
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {ndviMean.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">
            ± {ndviStd.toFixed(3)} across years
          </div>
        </div>

        {/* Inter-Annual Stability */}
        <div className="p-4 rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Year-to-Year</span>
            <span 
              className="text-xs font-semibold px-2 py-1 rounded"
              style={{ backgroundColor: interAnnualRating.bg, color: interAnnualRating.color }}
            >
              {interAnnualRating.label}
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {(ndviCV * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">
            Inter-annual variability (CV)
          </div>
        </div>

        {/* Within-Season Variability */}
        <div className="p-4 rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Within-Season Variability</span>
            <span 
              className="text-xs font-semibold px-2 py-1 rounded"
              style={{ backgroundColor: intraAnnualRating.bg, color: intraAnnualRating.color }}
            >
              {intraAnnualRating.label}
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {(intraAnnualCV * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">
            Intra-annual variability (CV, higher = more variability)
          </div>
        </div>

        {/* Within-Field Variability */}
        <div className="p-4 rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Within-Field Variability</span>
            <span 
              className="text-xs font-semibold px-2 py-1 rounded"
              style={{ backgroundColor: withinFieldRating.bg, color: withinFieldRating.color }}
            >
              {withinFieldRating.label}
            </span>
          </div>
          {hasWithinFieldMetric && withinFieldCV !== null && managementUniformityScore !== null ? (
            <>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {(withinFieldCV * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">
                Spatial variability (CV, lower = more uniform)
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                Management uniformity score: {managementUniformityScore.toFixed(1)} / 100
              </div>
            </>
          ) : (
            <>
              <div className="text-3xl font-bold text-gray-900 mb-1">N/A</div>
              <div className="text-xs text-gray-500">
                Requires per-date spatial stats (`ndvi_std`) from `/api/sentinel/polygon`.
              </div>
            </>
          )}
        </div>

      </div>

      {/* FVC Secondary Metric */}
      <div className="p-4 rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-sm font-medium text-gray-600">Estimated Vegetation Cover</span>
            <p className="text-xs text-gray-500 mt-0.5">Based on peak NDVI across years</p>
          </div>
          {fvcMean > 70 ? (
            <TrendingUp className="w-5 h-5 text-green-600" />
          ) : fvcMean > 40 ? (
            <Activity className="w-5 h-5 text-yellow-600" />
          ) : (
            <TrendingDown className="w-5 h-5 text-orange-600" />
          )}
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {fvcMean.toFixed(1)}% <span className="text-base font-normal text-gray-500">(± {((fvcMax - fvcMin) / 2).toFixed(1)}%)</span>
        </div>
      </div>

      {/* Vegetation Cover Analysis */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-1">Vegetation Cover Range</h4>
        <p className="text-xs text-gray-500 mb-3">Estimated range based on inter-annual peak NDVI variation (±2σ)</p>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">Average Cover</span>
              <span className="font-semibold text-gray-900">{fvcMean.toFixed(1)}%</span>
            </div>
            <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${Math.min(fvcMean, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">Lower Est. Limit (-2σ)</span>
              <span className="font-semibold text-gray-900">{fvcMin.toFixed(1)}%</span>
            </div>
            <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 rounded-full"
                style={{ width: `${Math.min(fvcMin, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">Upper Est. Limit (+2σ)</span>
              <span className="font-semibold text-gray-900">{fvcMax.toFixed(1)}%</span>
            </div>
            <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 rounded-full"
                style={{ width: `${Math.min(fvcMax, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interpretation */}
      <div className="p-4 rounded-lg" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#2563eb' }} />
          <div className="flex-1 text-sm" style={{ color: '#1e40af' }}>
            <p className="font-medium mb-2">Understanding Variability Metrics</p>
            <div className="space-y-2 text-xs">
              <div>
                <p className="font-semibold">Inter-Annual Variability (Year-to-Year):</p>
                <p>Measures consistency of peak productivity across multiple years. Low values indicate reliable, predictable yields.</p>
              </div>
              <div>
                <p className="font-semibold">Intra-Annual Variability (Within-Season CV):</p>
                <p>Measures date-to-date NDVI variability within the growing season. This is a temporal variability metric (not a direct spatial uniformity score). High values can reflect weather swings, management timing, crop stage differences, or cloud contamination.</p>
              </div>
              <div>
                <p className="font-semibold">Within-Field Variability (Management Uniformity):</p>
                <p>Estimates spatial variability within the field. Lower CV indicates more uniform management areas. Uniformity score is computed as 100 − CV% (higher is more uniform).</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {(ndviCV > 0.15 || intraAnnualCV > 0.25 || (hasWithinFieldMetric && withinFieldCV !== null && withinFieldCV > 0.25) || fvcMean < 85) && (
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}>
          <h4 className="text-sm font-semibold text-amber-900 mb-2">Management Recommendations</h4>
          <ul className="space-y-2 text-sm text-amber-800">
            {ndviCV > 0.15 && (
              <li>
                <strong>High Year-to-Year Variation ({(ndviCV * 100).toFixed(1)}%):</strong>
                <p className="text-xs mt-0.5">Inconsistent annual productivity suggests weather sensitivity, variable management, or soil constraints. Consider multi-year soil health building practices and climate-adapted crop varieties.</p>
              </li>
            )}
            {intraAnnualCV > 0.25 && (
              <li>
                <strong>High Within-Season Variability ({(intraAnnualCV * 100).toFixed(1)}%):</strong>
                <p className="text-xs mt-0.5">Strong date-to-date NDVI swings suggest inconsistent seasonal conditions. Review weather windows, irrigation/drainage timing, and cloud-affected periods before interpreting this as spatial field heterogeneity.</p>
              </li>
            )}
            {hasWithinFieldMetric && withinFieldCV !== null && withinFieldCV > 0.25 && (
              <li>
                <strong>High Within-Field Variability ({(withinFieldCV * 100).toFixed(1)}%):</strong>
                <p className="text-xs mt-0.5">Likely mixed management zones within the field. Consider zone delineation, targeted scouting, and variable-rate nutrient/seed applications in low-performing areas.</p>
              </li>
            )}
            {fvcMean < 70 && (
              <li>
                <strong>Low Vegetation Cover ({fvcMean.toFixed(1)}%):</strong>
                <p className="text-xs mt-0.5">Limited canopy development may indicate poor stand establishment, nutrient deficiencies, or pest pressure. Evaluate seeding rates, soil fertility, and crop health.</p>
              </li>
            )}
            {ndviCV < 0.15 && intraAnnualCV < 0.25 && (!hasWithinFieldMetric || (withinFieldCV !== null && withinFieldCV < 0.25)) && fvcMean >= 85 && (
              <li>
                <strong>Excellent Field Performance:</strong>
                <p className="text-xs mt-0.5">Consistent year-to-year productivity and uniform field conditions. Continue current management practices and monitor for sustained performance.</p>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Data Source */}
      <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
        {productivity?.methodology && <p>Data Source: {productivity.methodology}</p>}
        <p>Satellite Data: Landsat 8/9 and Sentinel-2 (10-30m resolution)</p>
      </div>

      {/* Seasonal NDVI Timeseries */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">
              {selectedTimeRange === 'season' ? 'Seasonal Progress (2025)' : 
               selectedTimeRange === '4year' ? 'Multi-Year History (4 Years)' : 
               'Long-Term Trends (8 Years)'}
            </h3>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Time Series Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedTimeRange('season')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  selectedTimeRange === 'season' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Season
              </button>
              <button
                onClick={() => setSelectedTimeRange('4year')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  selectedTimeRange === '4year' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                4 Years
              </button>
              <button
                onClick={() => setSelectedTimeRange('8year')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  selectedTimeRange === '8year' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                8 Years
              </button>
            </div>

            {timeseriesLoading && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full animate-pulse">
                Loading...
              </span>
            )}
            {historyLoading && !timeseriesLoading && (
              <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full animate-pulse">
                Loading History...
              </span>
            )}
          </div>
        </div>
        
        <div className="h-64">
          {timeseriesLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600"></div>
            </div>
          ) : displayedData && displayedData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    if (selectedTimeRange === 'season') {
                      // Show abbreviated month name (e.g., "May", "Jun", "Jul")
                      return d.toLocaleDateString('en-US', { month: 'short' })
                    }
                    return d.getFullYear().toString();
                  }}
                  ticks={
                    displayedData 
                        ? (() => {
                            if (selectedTimeRange === 'season') {
                              // Calculate tick values: Only the first date of each month
                              const uniqueMonths = new Set<string>();
                              return displayedData
                                .map(d => d.date)
                                .filter(dateStr => {
                                  const d = new Date(dateStr);
                                  const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
                                  if (!uniqueMonths.has(monthKey)) {
                                    uniqueMonths.add(monthKey);
                                    return true;
                                  }
                                  return false;
                                });
                            } else {
                              // Multi-year: Only the first date of each year
                              const uniqueYears = new Set<number>();
                              return displayedData
                                .map(d => d.date)
                                .filter(dateStr => {
                                  const year = new Date(dateStr).getFullYear();
                                  if (!uniqueYears.has(year)) {
                                    uniqueYears.add(year);
                                    return true;
                                  }
                                  return false;
                                });
                            }
                          })()
                        : undefined
                  }
                  interval={0}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={15}
                />
                <YAxis 
                  domain={[0, 1]} 
                  label={{ value: 'NDVI', angle: -90, position: 'insideLeft', style: {fontSize: 12} }}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                  formatter={(value: number) => [value.toFixed(3), 'NDVI']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                {/* Reference Lines for Healthy Veg Thresholds */}
                <ReferenceLine y={0.2} stroke="#fecaca" strokeDasharray="3 3" label={{ value: 'Soil', position: 'insideRight', fontSize: 10, fill: '#991b1b' }} />
                <ReferenceLine y={ndviMean || 0.8} stroke="#bbf7d0" strokeDasharray="3 3" label={{ value: 'Avg Peak', position: 'insideRight', fontSize: 10, fill: '#166534' }} />
                
                <Line 
                  type="monotone" 
                  dataKey="ndvi" 
                  stroke="#16a34a" 
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#16a34a', strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              {timeseriesLoading ? 'Fetching satellite data...' : 'No cloud-free imagery available for this period'}
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2 italic">
          High-frequency Sentinel-2 observations (filtered for clouds). Dip in values typically indicates cloud cover or harvest.
        </p>
      </div>
    </div>
  )
}
