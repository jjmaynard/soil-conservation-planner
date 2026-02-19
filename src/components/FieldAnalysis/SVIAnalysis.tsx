// SVI (Soil Vulnerability Index) Analysis Component - GEE-based assessment

'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Shield, Info } from 'lucide-react'
import type { EnhancedFieldData } from '#hooks/useComprehensiveFieldAssessment'

interface SVIAnalysisProps {
  fieldId: string
  geeData?: EnhancedFieldData | null
}

export default function SVIAnalysis({ fieldId, geeData }: SVIAnalysisProps) {
  const [sviData, setSviData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const toNumber = (value: any): number => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  const normalizeClassPct = (classPct: any) => ({
    low: toNumber(classPct?.low_pct),
    moderate: toNumber(classPct?.moderate_pct),
    moderatelyHigh: toNumber(classPct?.moderately_high_pct),
    high: toNumber(classPct?.high_pct),
    unclassified: toNumber(classPct?.unclassified_pct)
  })

  const buildPathway = (
    label: string,
    classPctRaw: any,
    legacyMean: any,
    legacyHighPct: any
  ) => {
    const hasClassData = !!classPctRaw && typeof classPctRaw === 'object'

    if (hasClassData) {
      const classPct = normalizeClassPct(classPctRaw)
      const classifiedTotal = classPct.low + classPct.moderate + classPct.moderatelyHigh + classPct.high
      const meanClass = classifiedTotal > 0
        ? ((classPct.low * 1) + (classPct.moderate * 2) + (classPct.moderatelyHigh * 3) + (classPct.high * 4)) / classifiedTotal
        : 0

      const classEntries = [
        { key: 'low', label: 'Low', value: classPct.low },
        { key: 'moderate', label: 'Moderate', value: classPct.moderate },
        { key: 'moderatelyHigh', label: 'Moderately High', value: classPct.moderatelyHigh },
        { key: 'high', label: 'High', value: classPct.high }
      ]
      const dominant = classEntries.reduce((max, entry) => (entry.value > max.value ? entry : max), classEntries[0])

      return {
        label,
        classPct,
        meanClass,
        highPct: classPct.high,
        elevatedPct: classPct.moderatelyHigh + classPct.high,
        dominantClass: dominant.label,
        source: 'class'
      }
    }

    const mean = toNumber(legacyMean)
    const highPct = toNumber(legacyHighPct)
    const classPct = {
      low: Math.max(0, 100 - highPct),
      moderate: 0,
      moderatelyHigh: 0,
      high: highPct,
      unclassified: 0
    }

    return {
      label,
      classPct,
      meanClass: mean,
      highPct,
      elevatedPct: highPct,
      dominantClass: highPct >= 50 ? 'High' : 'Low',
      source: 'legacy'
    }
  }

  const SVI_CLASS_STYLES = {
    low: { label: 'Low', color: '#2ca25f', bg: '#dcfce7' },
    moderate: { label: 'Moderate', color: '#ffff33', bg: '#fef9c3' },
    moderatelyHigh: { label: 'Moderately High', color: '#fdae61', bg: '#ffedd5' },
    high: { label: 'High', color: '#d7191c', bg: '#fee2e2' }
  }

  const renderClassDistribution = (title: string, subtitle: string, pathway: any) => {
    const rows = [
      { key: 'low', value: pathway.classPct.low, ...SVI_CLASS_STYLES.low },
      { key: 'moderate', value: pathway.classPct.moderate, ...SVI_CLASS_STYLES.moderate },
      { key: 'moderatelyHigh', value: pathway.classPct.moderatelyHigh, ...SVI_CLASS_STYLES.moderatelyHigh },
      { key: 'high', value: pathway.classPct.high, ...SVI_CLASS_STYLES.high }
    ]

    return (
      <div className="p-3 rounded-lg border border-gray-200 bg-white">
        <div className="mb-2">
          <h5 className="text-sm font-semibold text-gray-900">{title}</h5>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>

        <div className="h-3 w-full rounded-full overflow-hidden bg-gray-100 border border-gray-200 mb-2 flex">
          {rows.map((row) => (
            <div
              key={row.key}
              style={{ width: `${Math.max(0, Math.min(100, row.value))}%`, backgroundColor: row.color }}
              title={`${row.label}: ${row.value.toFixed(1)}%`}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {rows.map((row) => (
            <div key={row.key} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                <span className="text-gray-700">{row.label}</span>
              </div>
              <span className="font-semibold text-gray-900">{row.value.toFixed(1)}%</span>
            </div>
          ))}
        </div>

        {pathway.classPct.unclassified > 0 && (
          <div className="text-[11px] text-gray-500 mt-2">
            Unclassified: {pathway.classPct.unclassified.toFixed(1)}%
          </div>
        )}
      </div>
    )
  }

  useEffect(() => {
    loadSVIData()
  }, [fieldId, geeData])

  const loadSVIData = async () => {
    setLoading(true)
    try {
      if (geeData?.geeAssessment?.svi) {
        const svi = geeData.geeAssessment.svi
        const metrics = svi.svi_metrics || {}
        const surface = buildPathway(
          'Surface Loss',
          metrics.surface_loss_class_pct,
          metrics.surface_loss_mean,
          metrics.surface_loss_high_pct
        )
        const drained = buildPathway(
          'Subsurface (Drained)',
          metrics.subsurface_drained_class_pct,
          metrics.subsurface_drained_mean,
          metrics.subsurface_drained_high_pct
        )
        const undrained = buildPathway(
          'Subsurface (Undrained)',
          metrics.subsurface_undrained_class_pct,
          metrics.subsurface_undrained_mean,
          metrics.subsurface_undrained_high_pct
        )
        
        setSviData({
          surface,
          drained,
          undrained,
          methodology: svi.methodology || '',
          visualization: svi.visualization,
          hasData: true,
        })
      } else {
        // Try session storage
        const stored = sessionStorage.getItem('comprehensiveFieldAssessment')
        if (stored) {
          const parsed = JSON.parse(stored) as EnhancedFieldData
          if (parsed.geeAssessment?.svi) {
            const svi = parsed.geeAssessment.svi
            const metrics = svi.svi_metrics || {}
            const surface = buildPathway(
              'Surface Loss',
              metrics.surface_loss_class_pct,
              metrics.surface_loss_mean,
              metrics.surface_loss_high_pct
            )
            const drained = buildPathway(
              'Subsurface (Drained)',
              metrics.subsurface_drained_class_pct,
              metrics.subsurface_drained_mean,
              metrics.subsurface_drained_high_pct
            )
            const undrained = buildPathway(
              'Subsurface (Undrained)',
              metrics.subsurface_undrained_class_pct,
              metrics.subsurface_undrained_mean,
              metrics.subsurface_undrained_high_pct
            )
            
            setSviData({
              surface,
              drained,
              undrained,
              methodology: svi.methodology || '',
              visualization: svi.visualization,
              hasData: true,
            })
            return
          }
        }
        
        // No data available
        setSviData({ hasData: false })
      }
    } catch (error) {
      console.error('Error loading SVI data:', error)
      setSviData({ hasData: false })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 mx-auto mb-2" style={{ border: '2px solid #e5e7eb', borderTopColor: '#10b981' }}></div>
        <p className="text-sm text-gray-600">Analyzing soil vulnerability...</p>
      </div>
    )
  }

  if (!sviData?.hasData) {
    return (
      <div className="text-center py-8">
        <Shield className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">SVI data not available</p>
        <p className="text-xs text-gray-500 mt-1">Select a field to analyze</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="flex items-start gap-2 p-2 rounded" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <Info className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: '#2563eb' }} />
        <p className="text-xs" style={{ color: '#1e40af' }}>
          Soil Vulnerability Index - surface and subsurface soil nutrient loss potential
        </p>
      </div>

      {/* Class Distribution by SVI Type */}
      <div className="space-y-3">
        {renderClassDistribution('Surface Loss', 'Erosion-driven nutrient transport', sviData.surface)}
        {renderClassDistribution('Subsurface (Drained)', 'Leaching in tile-drained systems', sviData.drained)}
        {renderClassDistribution('Subsurface (Undrained)', 'Natural drainage leaching', sviData.undrained)}
      </div>

      {/* High Risk Areas */}
      <div className="space-y-2">
        {sviData.surface.highPct > 0 && (
          <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca' }}>
            <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#991b1b' }} />
            <div className="text-xs" style={{ color: '#991b1b' }}>
              <span className="font-semibold">{sviData.surface.highPct.toFixed(1)}%</span> class 4 high surface vulnerability
            </div>
          </div>
        )}
        
        {sviData.drained.highPct > 0 && (
          <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}>
            <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#92400e' }} />
            <div className="text-xs" style={{ color: '#92400e' }}>
              <span className="font-semibold">{sviData.drained.highPct.toFixed(1)}%</span> class 4 high subsurface vulnerability (drained)
            </div>
          </div>
        )}
      </div>

      {/* SVI Metrics Detail */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Vulnerability Metrics</h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-700">Surface loss: Erosion-driven nutrient transport</span>
              <span className="text-xs font-medium text-gray-900">{sviData.surface.dominantClass}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(sviData.surface.elevatedPct, 100)}%`,
                  backgroundColor: sviData.surface.elevatedPct > 50 ? '#f97316' : sviData.surface.elevatedPct > 20 ? '#fbbf24' : '#22c55e'
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-700">Subsurface loss (drained): Leaching in tile-drained systems</span>
              <span className="text-xs font-medium text-gray-900">{sviData.drained.dominantClass}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(sviData.drained.elevatedPct, 100)}%`,
                  backgroundColor: sviData.drained.elevatedPct > 50 ? '#f97316' : sviData.drained.elevatedPct > 20 ? '#fbbf24' : '#22c55e'
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-700">Subsurface loss (undrained): Natural drainage leaching</span>
              <span className="text-xs font-medium text-gray-900">{sviData.undrained.dominantClass}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(sviData.undrained.elevatedPct, 100)}%`,
                  backgroundColor: sviData.undrained.elevatedPct > 50 ? '#f97316' : sviData.undrained.elevatedPct > 20 ? '#fbbf24' : '#22c55e'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Risk Interpretation */}
      <div className="p-3 rounded-lg" style={{ backgroundColor: '#fafafa', border: '1px solid #e5e7eb' }}>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Risk Factors</h4>
        <div className="space-y-1 text-xs text-gray-700">
          {sviData.surface.elevatedPct > 20 && (
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5 text-orange-600" />
              <span>Elevated surface vulnerability classes present - prioritize erosion control practices</span>
            </div>
          )}
          {sviData.surface.highPct > 20 && (
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5 text-orange-600" />
              <span>Large portion of field is class 4 high vulnerability - priority for intervention</span>
            </div>
          )}
          {sviData.undrained.elevatedPct > 20 && (
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5 text-orange-600" />
              <span>Subsurface vulnerability in undrained conditions is elevated</span>
            </div>
          )}
          {sviData.surface.elevatedPct < 10 && sviData.drained.elevatedPct < 10 && sviData.undrained.elevatedPct < 10 && (
            <div className="flex items-start gap-2">
              <Shield className="w-3 h-3 flex-shrink-0 mt-0.5 text-green-600" />
              <span>Low overall class-based vulnerability - maintain current practices</span>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="p-3 rounded-lg" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
        <h4 className="text-sm font-semibold mb-2" style={{ color: '#92400e' }}>Management Recommendations</h4>
        <ul className="text-xs space-y-1" style={{ color: '#92400e' }}>
          {sviData.surface.elevatedPct >= 20 && (
            <>
              <li>• Elevated surface-loss classes detected - prioritize erosion control practices</li>
              <li>• Consider terracing, contour farming, or buffer strips</li>
            </>
          )}
          {sviData.surface.highPct >= 20 && (
            <li>• High class (4) vulnerability is substantial - immediate conservation action recommended</li>
          )}
          {sviData.undrained.elevatedPct > 20 && (
            <li>• Evaluate drainage system to reduce subsurface vulnerability</li>
          )}
          {sviData.surface.elevatedPct < 10 && (
            <li>• Maintain current management practices</li>
          )}
        </ul>
      </div>
    </div>
  )
}
