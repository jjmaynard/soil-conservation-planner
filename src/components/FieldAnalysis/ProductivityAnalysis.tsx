// Productivity Analysis Component - Crop-Specific NDVI-based productivity assessment

'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, BarChart3, Info, Wheat, Sprout, ChevronRight } from 'lucide-react'
import type { EnhancedFieldData } from '#hooks/useComprehensiveFieldAssessment'

interface ProductivityAnalysisProps {
  fieldId: string
  geeData?: EnhancedFieldData | null
}

export default function ProductivityAnalysis({ fieldId, geeData }: ProductivityAnalysisProps) {
  const [productivityData, setProductivityData] = useState<any>(null)
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProductivityData()
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
          // Use crop-specific data
          console.log('Using crop-specific productivity data')
          const cropProd = geeData.cropProductivity!
          setProductivityData({
            hasCropSpecific: true,
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
        } else if (geeData.geeAssessment?.productivity) {
          // Use non-crop-specific data from current field assessment
          console.log('Using current field productivity data (non-crop-specific)')
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
        } else {
          console.log('No productivity data available for current field')
          setProductivityData({ hasData: false })
        }
      } else {
        // Show loading state - don't use cached session storage to avoid stale data
        console.log('No current field data - showing loading state')
        setProductivityData({ hasData: false, loading: true })
      }
            
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
            return
          }
        }
        
        setProductivityData({ hasData: false })
      }
    } catch (error) {
      console.error('Error loading productivity data:', error)
      setProductivityData({ hasData: false })
    } finally {
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
          Multi-year NDVI analysis from Landsat 8 (peak growing season)
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
