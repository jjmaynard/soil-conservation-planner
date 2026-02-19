// Productivity Analysis Component - Crop-Specific NDVI-based productivity assessment

'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, BarChart3, Info, Wheat, Sprout, ChevronRight } from 'lucide-react'
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'
import type { EnhancedFieldData } from '#hooks/useComprehensiveFieldAssessment'
import { CDL_CROP_CODES } from '../../utils/cdlQuery'

interface ProductivityAnalysisProps {
  fieldId: string
  geeData?: EnhancedFieldData | null
  onLoadCropSpecific?: () => Promise<void>
}

export default function ProductivityAnalysis({ fieldId, geeData, onLoadCropSpecific }: ProductivityAnalysisProps) {
  const [productivityData, setProductivityData] = useState<any>(null)
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingCropSpecific, setLoadingCropSpecific] = useState(false)

  useEffect(() => {
    loadProductivityData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldId, geeData])

  const loadProductivityData = async () => {
    setLoading(true)
    try {
      console.log('ProductivityAnalysis - Loading data...')
      console.log('geeData:', geeData)
      console.log('geeData.cropProductivity:', geeData?.cropProductivity)
      
      if (geeData) {
        const hasCropSpecific = geeData.cropProductivity && geeData.cropProductivity.crops_analyzed.length > 0
        console.log('Has crop-specific data:', hasCropSpecific)
        
        if (hasCropSpecific) {
          // Use crop-specific data (already loaded)
          console.log('Using crop-specific productivity data')
          const cropProd = geeData.cropProductivity!
          setProductivityData({
            hasCropSpecific: true,
            soil_productivity: cropProd.soil_productivity,
            overall_yield_gap_pct: cropProd.overall_yield_gap_pct,
            dominant_crop: cropProd.dominant_crop,
            recommendation: cropProd.recommendation,
            crops: cropProd.crops_analyzed,
            time_series: cropProd.time_series,
            rotation_summary: cropProd.rotation_summary,
            overall_assessment: cropProd.overall_assessment,
            hasData: true,
          })
          // Set first crop as selected
          if (!selectedCrop && cropProd.crops_analyzed.length > 0) {
            setSelectedCrop(cropProd.crops_analyzed[0].crop_name)
          }
          setLoading(false)
        } else {
          // Try to lazy load crop-specific data if callback is available
          if (onLoadCropSpecific && !loadingCropSpecific) {
            console.log('Triggering lazy load of crop-specific productivity')
            setLoadingCropSpecific(true)
            try {
              await onLoadCropSpecific()
            } catch (error) {
              console.error('Failed to load crop-specific data:', error)
            }
            setLoadingCropSpecific(false)
          }
          
          // Show non-crop-specific data while loading or as fallback
          if (geeData.geeAssessment?.productivity) {
            console.log('Using non-crop-specific productivity data')
            const prod = geeData.geeAssessment.productivity
            const combined = geeData.combined.productivity
            
            setProductivityData({
              hasCropSpecific: false,
              ndviPeakMean: combined.ndvi_peak_mean || 0,
              yieldGap: combined.yield_gap_pct || 0,
              stability: combined.stability_cv || 0,
              p75Gap: prod.yield_gap.p75_gap_pct || 0,
              p90Gap: prod.yield_gap.p90_gap_pct || 0,
              ndviStd: prod.productivity_metrics.ndvi_peak_std || 0,
              visualization: prod.visualization,
              hasData: true,
            })
            setLoading(false)
          } else {
            console.log('No productivity data available')
            setProductivityData({ hasData: false })
            setLoading(false)
          }
        }
      } else {
        // Show loading state - don't use cached session storage to avoid stale data
        console.log('No current field data - showing loading state')
        // Keep loading true while waiting for data
        setProductivityData({ hasData: false, loading: true })
      }
    } catch (error) {
      console.error('Error loading productivity data:', error)
      setProductivityData({ hasData: false })
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 mx-auto mb-2" style={{ border: '2px solid #e5e7eb', borderTopColor: '#10b981' }}></div>
        <p className="text-sm text-gray-600">Analyzing productivity...</p>
      </div>
    )
  }

  if (!productivityData?.hasData) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">Productivity data not available</p>
        <p className="text-xs text-gray-500 mt-1">Select a field to analyze</p>
      </div>
    )
  }

  const getYieldGapColor = (gap: number) => {
    if (gap < 10) return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' }
    if (gap < 20) return { bg: '#fef3c7', text: '#92400e', border: '#fde68a' }
    return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' }
  }

  // Custom X-Axis Tick with CDL Crop Colors
  const CustomXAxisTick = ({ x, y, payload }: any) => {
    // Find the data point for this year (safe check for fallback mode)
    const dataPoint = productivityData?.time_series?.find((d: any) => d.year === payload.value)
    
    // Get crop color or default to gray
    const cropCode = dataPoint?.crop_code
    const cropColor = cropCode && CDL_CROP_CODES[cropCode] ? CDL_CROP_CODES[cropCode].color : '#9ca3af'
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={10} textAnchor="middle" fill="#6b7280" fontSize={10}>
          {payload.value}
        </text>
        <circle cx={0} cy={18} r={4} fill={cropColor} stroke="#fff" strokeWidth={1} />
      </g>
    )
  }

  // Crop-specific display
  if (productivityData.hasCropSpecific) {
    const selectedCropData = productivityData.crops.find((c: any) => c.crop_name === selectedCrop)
    const gapColors = selectedCropData ? getYieldGapColor(selectedCropData.yield_gap_pct) : { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' }

    return (
      <div className="space-y-4">
        {/* Info */}
        <div className="flex items-start gap-2 p-2 rounded" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <Info className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: '#2563eb' }} />
          <p className="text-xs" style={{ color: '#1e40af' }}>
            Crop-stratified NDVI analysis using field rotation data ({productivityData.time_series.length} years analyzed)
          </p>
        </div>

        {/* Overall Summary */}
        <div className="p-3 rounded-lg" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Field Summary</span>
            <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
              {productivityData.dominant_crop} Dominant
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="text-xs">
              <span className="text-gray-600">Overall Yield Gap:</span>
              <span className="ml-1 font-semibold text-gray-900">{productivityData.overall_yield_gap_pct.toFixed(1)}%</span>
            </div>
            <div className="text-xs">
              <span className="text-gray-600">Rotation:</span>
              <span className="ml-1 font-semibold text-gray-900">
                {Object.entries(productivityData.rotation_summary).map(([crop, count]) => `${crop} (${count}yr)`).join(', ')}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-700">{productivityData.recommendation}</p>
        </div>

        {/* NCCPI Crop Productivity Section */}
        {productivityData.soil_productivity && (
          <div className="p-3 rounded-lg" style={{ backgroundColor: '#fefce8', border: '1px solid #fde68a' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Crop Productivity (NCCPI)</span>
              <Info className="w-3 h-3 text-gray-500" />
            </div>
            <p className="text-xs text-gray-600 mb-2">{productivityData.soil_productivity.description}</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}>
                <div className="text-[10px] text-gray-500 mb-0.5">All Crops</div>
                <div className="text-sm font-bold text-gray-900">{(productivityData.soil_productivity.all_crops.mean * 100).toFixed(0)}</div>
                <div className="text-[9px] text-gray-500">Range: {(productivityData.soil_productivity.all_crops.min * 100).toFixed(0)}-{(productivityData.soil_productivity.all_crops.max * 100).toFixed(0)}</div>
              </div>
              <div className="p-2 rounded" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}>
                <div className="text-[10px] text-gray-500 mb-0.5">Corn</div>
                <div className="text-sm font-bold text-gray-900">{(productivityData.soil_productivity.corn.mean * 100).toFixed(0)}</div>
                <div className="text-[9px] text-gray-500">Range: {(productivityData.soil_productivity.corn.min * 100).toFixed(0)}-{(productivityData.soil_productivity.corn.max * 100).toFixed(0)}</div>
              </div>
              <div className="p-2 rounded" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}>
                <div className="text-[10px] text-gray-500 mb-0.5">Soybeans</div>
                <div className="text-sm font-bold text-gray-900">{(productivityData.soil_productivity.soybeans.mean * 100).toFixed(0)}</div>
                <div className="text-[9px] text-gray-500">Range: {(productivityData.soil_productivity.soybeans.min * 100).toFixed(0)}-{(productivityData.soil_productivity.soybeans.max * 100).toFixed(0)}</div>
              </div>
              <div className="p-2 rounded" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}>
                <div className="text-[10px] text-gray-500 mb-0.5">Small Grains</div>
                <div className="text-sm font-bold text-gray-900">{(productivityData.soil_productivity.small_grains.mean * 100).toFixed(0)}</div>
                <div className="text-[9px] text-gray-500">Range: {(productivityData.soil_productivity.small_grains.min * 100).toFixed(0)}-{(productivityData.soil_productivity.small_grains.max * 100).toFixed(0)}</div>
              </div>
              <div className="p-2 rounded" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}>
                <div className="text-[10px] text-gray-500 mb-0.5">Cotton</div>
                <div className="text-sm font-bold text-gray-900">{(productivityData.soil_productivity.cotton.mean * 100).toFixed(0)}</div>
                <div className="text-[9px] text-gray-500">Range: {(productivityData.soil_productivity.cotton.min * 100).toFixed(0)}-{(productivityData.soil_productivity.cotton.max * 100).toFixed(0)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Crop Selector Tabs */}
        <div>
          <div className="flex gap-2 mb-3">
            {productivityData.crops.map((crop: any) => (
              <button
                key={crop.crop_name}
                onClick={() => setSelectedCrop(crop.crop_name)}
                className="flex-1 px-3 py-2 text-xs font-medium rounded transition-colors"
                style={{
                  backgroundColor: selectedCrop === crop.crop_name ? '#10b981' : '#f3f4f6',
                  color: selectedCrop === crop.crop_name ? '#ffffff' : '#374151',
                  border: `1px solid ${selectedCrop === crop.crop_name ? '#10b981' : '#d1d5db'}`
                }}
              >
                <div className="flex items-center justify-center gap-1">
                  <Wheat className="w-3 h-3" />
                  <span>{crop.crop_name}</span>
                  <span className="opacity-75">({crop.years_analyzed}yr)</span>
                </div>
              </button>
            ))}
          </div>

          {selectedCropData && (
            <div className="space-y-3">
              {/* Crop Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <div className="text-xs text-gray-600 mb-1">Peak NDVI</div>
                  <div className="text-2xl font-bold" style={{ color: '#166534' }}>
                    {selectedCropData.ndvi_max.toFixed(3)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Mean: {selectedCropData.ndvi_mean.toFixed(3)} ±{selectedCropData.ndvi_std.toFixed(3)}
                  </div>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: gapColors.bg, border: `1px solid ${gapColors.border}` }}>
                  <div className="text-xs text-gray-600 mb-1">Yield Gap</div>
                  <div className="text-2xl font-bold" style={{ color: gapColors.text }}>
                    {selectedCropData.yield_gap_pct.toFixed(1)}%
                  </div>
                  <div className="text-xs" style={{ color: gapColors.text }}>
                    {selectedCropData.yield_gap_interpretation}
                  </div>
                </div>
              </div>

              {/* Years Analyzed */}
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-2">
                  Years Analyzed: {selectedCropData.year_list.join(', ')}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Overall Assessment (All Years Combined) */}
        <div className="p-3 rounded-lg" style={{ backgroundColor: '#fefce8', border: '1px solid #fde68a' }}>
          <h4 className="text-sm font-semibold mb-2" style={{ color: '#92400e' }}>Overall Assessment (All Crops Combined)</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-gray-600">Mean Gap:</span>
              <span className="ml-1 font-semibold text-gray-900">
                {productivityData.overall_assessment.yield_gap.mean_gap_pct.toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-gray-600">75th %ile:</span>
              <span className="ml-1 font-semibold text-gray-900">
                {productivityData.overall_assessment.yield_gap.p75_gap_pct.toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-gray-600">90th %ile:</span>
              <span className="ml-1 font-semibold text-gray-900">
                {productivityData.overall_assessment.yield_gap.p90_gap_pct.toFixed(1)}%
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">{productivityData.overall_assessment.description}</p>
        </div>

        {/* Productivity Time Series */}
          <div className="h-64 mt-4 p-3 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-700">Annual Productivity & Crop Type</h4>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400"></span> Crop Type (Axis Dot)</span>
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={productivityData.time_series} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="year" 
                  tick={<CustomXAxisTick />}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                />
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  domain={[0, 1]} 
                  tick={{fontSize: 10}} 
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'Peak NDVI', angle: -90, position: 'insideLeft', style: {fontSize: 10} }} 
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  domain={[0, 'auto']} 
                  tick={{fontSize: 10}} 
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'Yield Gap %', angle: 90, position: 'insideRight', style: {fontSize: 10} }} 
                />
                <Tooltip 
                  contentStyle={{ fontSize: '12px', borderRadius: '6px' }}
                  formatter={(value: any, name: string) => {
                    if (name === 'ndvi_max') return [Number(value).toFixed(3), 'Peak NDVI']
                    if (name === 'yield_gap_pct') return [`${value !== null ? Number(value).toFixed(1) : '—'}%`, 'Yield Gap']
                    return [value, name]
                  }}
                  labelFormatter={(year) => {
                    const item = productivityData.time_series.find((t: any) => t.year === year)
                    const cropInfo = CDL_CROP_CODES[item?.crop_code]
                    return (
                      <div className="flex items-center gap-2">
                         <span>{year}</span>
                         {cropInfo && (
                           <>
                             <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.crop_code ? cropInfo.color : '#9ca3af' }}></span>
                             <span style={{ color: item.crop_code ? cropInfo.color : 'inherit', fontWeight: 600 }}>
                               {item?.crop_name || cropInfo.name || 'Unknown'}
                             </span>
                           </>
                         )}
                      </div>
                    )
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar 
                  yAxisId="right" 
                  dataKey="yield_gap_pct" 
                  name="Yield Gap %" 
                  fill="#fca5a5" 
                  radius={[4, 4, 0, 0]} 
                  barSize={20}
                >
                  {/* Optional: We could color bars by crop too, but using uniform color for metric consistency is safer */}
                </Bar>
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="ndvi_max" 
                  name="Peak NDVI" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  dot={{ r: 3, fill: '#10b981' }} 
                  activeDot={{ r: 5 }} 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    )
  }

  // Standard display (fallback when crop-specific data not available)
  const gapColors = getYieldGapColor(productivityData.yieldGap)

  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="flex items-start gap-2 p-2 rounded" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <Info className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: '#2563eb' }} />
        <p className="text-xs" style={{ color: '#1e40af' }}>
          Multi-year NDVI analysis from Sentinel-2 (peak growing season)
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <div className="text-xs text-gray-600 mb-1">Peak NDVI</div>
          <div className="text-2xl font-bold" style={{ color: '#166534' }}>
            {productivityData.ndviPeakMean.toFixed(3)}
          </div>
          <div className="text-xs text-gray-500 mt-1">±{productivityData.ndviStd.toFixed(3)}</div>
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: gapColors.bg, border: `1px solid ${gapColors.border}` }}>
          <div className="text-xs text-gray-600 mb-1">Yield Gap</div>
          <div className="text-2xl font-bold" style={{ color: gapColors.text }}>
            {productivityData.yieldGap.toFixed(1)}%
          </div>
          <div className="text-xs" style={{ color: gapColors.text }}>vs. field potential</div>
        </div>
      </div>

      {/* Stability Indicator */}
      <div className="p-3 rounded-lg" style={{ backgroundColor: '#fafafa', border: '1px solid #e5e7eb' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Productivity Stability</span>
          <span className="text-sm font-bold text-gray-900">{(productivityData.stability * 100).toFixed(1)}% CV</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(productivityData.stability * 200, 100)}%`,
              backgroundColor: productivityData.stability < 0.15 ? '#10b981' : productivityData.stability < 0.25 ? '#fbbf24' : '#f97316'
            }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {productivityData.stability < 0.15 ? 'High stability' : productivityData.stability < 0.25 ? 'Moderate stability' : 'Variable productivity'}
        </p>
      </div>

      {/* Yield Gap Distribution */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Yield Gap Distribution</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-700">Average (mean)</span>
            <span className="font-medium text-gray-900">{productivityData.yieldGap.toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-700">75th percentile</span>
            <span className="font-medium text-gray-900">{productivityData.p75Gap.toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-700">90th percentile (worst areas)</span>
            <span className="font-medium text-gray-900">{productivityData.p90Gap.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="p-3 rounded-lg" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
        <h4 className="text-sm font-semibold mb-2" style={{ color: '#92400e' }}>Recommendations</h4>
        <ul className="text-xs space-y-1" style={{ color: '#92400e' }}>
          {productivityData.yieldGap > 15 && (
            <li>• Significant yield gap detected - investigate limiting factors</li>
          )}
          {productivityData.stability > 0.25 && (
            <li>• High variability - consider zone management</li>
          )}
          {productivityData.p90Gap > 25 && (
            <li>• Some areas severely underperforming - targeted intervention recommended</li>
          )}
          {productivityData.yieldGap < 10 && (
            <li>• Field performing near potential - maintain current practices</li>
          )}
        </ul>
      </div>
    </div>
  )
}
