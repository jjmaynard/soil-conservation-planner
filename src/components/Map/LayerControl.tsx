// Layer Control Component for Managing Soil Layers

'use client'

import { ChevronDown, ChevronUp, Eye, EyeOff, Layers, Layers as LayersIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { AVAILABLE_DEPTHS } from '#src/hooks/useDepthSelection'
import type { SoilDepth, SoilLayer } from '#src/types/soil'

interface LayerControlProps {
  layers: SoilLayer[]
  onLayerToggle: (layerId: string) => void
  onOpacityChange: (layerId: string, opacity: number) => void
  selectedDepth: SoilDepth
  onDepthChange: (depth: SoilDepth) => void
  cdlYear: number
  onCdlYearChange: (year: number) => void
  onHeightChange?: (height: number) => void
  className?: string
}

const DEPTH_LABELS: Record<SoilDepth, string> = {
  '0-5cm': '0-5 cm (Surface)',
  '5-15cm': '5-15 cm',
  '15-30cm': '15-30 cm',
  '30-60cm': '30-60 cm',
  '60-100cm': '60-100 cm',
  '100-200cm': '100-200 cm (Deep)',
}

// Available CDL years from CropScape (2008-2023)
const CDL_YEARS = Array.from({ length: 16 }, (_, i) => 2023 - i)

export default function LayerControl({
  layers,
  onLayerToggle,
  onOpacityChange,
  selectedDepth,
  onDepthChange,
  cdlYear,
  onCdlYearChange,
  onHeightChange,
  className = '',
}: LayerControlProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['land-use', 'soil-data', 'soil-properties']),
  )
  const containerRef = useRef<HTMLDivElement>(null)

  // Track height changes and notify parent
  useEffect(() => {
    if (containerRef.current && onHeightChange) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          onHeightChange(entry.target.clientHeight)
        }
      })
      observer.observe(containerRef.current)
      return () => observer.disconnect()
    }
  }, [onHeightChange])

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const visibleCount = layers.filter(l => l.visible).length
  const hasSoilPropertyLayerActive = layers.some(l => l.type === 'raster' && l.visible)

  const currentDepthIndex = AVAILABLE_DEPTHS.indexOf(selectedDepth)
  const canGoUp = currentDepthIndex > 0
  const canGoDown = currentDepthIndex < AVAILABLE_DEPTHS.length - 1

  const handlePrevious = () => {
    if (canGoUp) {
      onDepthChange(AVAILABLE_DEPTHS[currentDepthIndex - 1])
    }
  }

  const handleNext = () => {
    if (canGoDown) {
      onDepthChange(AVAILABLE_DEPTHS[currentDepthIndex + 1])
    }
  }

  return (
    <div
      ref={containerRef}
      className="absolute top-4 left-4 max-w-sm"
      style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.97)',
        background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.97), rgba(249, 250, 251, 0.97))',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        zIndex: 1000,
        minWidth: '280px'
      }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between transition-all duration-200"
        style={{
          padding: '10px 12px',
          borderBottom: isExpanded ? '1px solid rgba(229, 231, 235, 0.6)' : 'none',
          backgroundColor: 'transparent',
          borderRadius: '12px 12px 0 0'
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(249, 250, 251, 0.8)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <div className="flex items-center gap-2">
          <div 
            style={{
              background: 'linear-gradient(135deg, var(--color-forest-700) 0%, var(--color-forest-500) 100%)',
              borderRadius: '6px',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(92, 141, 90, 0.2)'
            }}
          >
            <LayersIcon className="h-4 w-4 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-sm text-text" style={{ marginBottom: '1px' }}>Data Layers</h3>
            {isExpanded && (
              <p className="text-xs text-text-secondary">
                {visibleCount} layer{visibleCount !== 1 ? 's' : ''} active
              </p>
            )}
          </div>
        </div>
        <div 
          className="transition-transform duration-200 text-text-muted"
          style={{
            transform: isExpanded ? 'rotate(0deg)' : 'rotate(180deg)'
          }}
        >
          <ChevronUp className="h-5 w-5" />
        </div>
      </button>

      {/* Layer List */}
      {isExpanded && (
        <div className="max-h-96 overflow-y-auto p-3" style={{ paddingTop: '10px', paddingBottom: '10px' }}>
          <div className="space-y-2">
            {/* Soil Data - Moved to top */}
            {layers.filter(l => (l.type === 'vector' || l.type === 'wms') && l.id !== 'cdl').length > 0 && (
              <div 
                className="rounded-xl overflow-hidden" 
                style={{ 
                  border: '1px solid rgba(229, 231, 235, 0.8)',
                  background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.6), rgba(249, 250, 251, 0.4))',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}
              >
                <button
                  onClick={() => toggleSection('soil-data')}
                  className="flex w-full items-center justify-between transition-all duration-200"
                  style={{ 
                    padding: '8px 10px', 
                    backgroundColor: 'transparent',
                    borderBottom: expandedSections.has('soil-data') ? '1px solid rgba(229, 231, 235, 0.5)' : 'none'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(249, 250, 251, 0.6)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-ocean-600) 0%, var(--color-ocean-500) 100%)',
                        boxShadow: '0 0 4px rgba(74, 124, 158, 0.4)'
                      }}
                    />
                    <h4 className="text-sm font-semibold text-ocean-700">Soil Data</h4>
                  </div>
                  {expandedSections.has('soil-data') ? (
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  )}
                </button>
                {expandedSections.has('soil-data') && (
                  <div className="space-y-1 px-2 pb-2" style={{ paddingTop: '6px' }}>
                    {layers
                      .filter(l => (l.type === 'vector' || l.type === 'wms') && l.id !== 'cdl')
                      .map(layer => (
                        <LayerItem
                          key={layer.id}
                          layer={layer}
                          onToggle={onLayerToggle}
                          onOpacityChange={onOpacityChange}
                        />
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Cropland Data Layer Section */}
            {layers.find(l => l.id === 'cdl') && (
              <div 
                className="rounded-xl overflow-hidden" 
                style={{ 
                  border: '1px solid rgba(229, 231, 235, 0.8)',
                  background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.6), rgba(249, 250, 251, 0.4))',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}
              >
                <button
                  onClick={() => toggleSection('land-use')}
                  className="flex w-full items-center justify-between transition-all duration-200"
                  style={{ 
                    padding: '8px 10px', 
                    backgroundColor: 'transparent',
                    borderBottom: expandedSections.has('land-use') ? '1px solid rgba(229, 231, 235, 0.5)' : 'none'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(249, 250, 251, 0.6)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-ocean-600) 0%, var(--color-ocean-500) 100%)',
                        boxShadow: '0 0 4px rgba(74, 124, 158, 0.4)'
                      }}
                    />
                    <h4 className="text-sm font-semibold text-ocean-700">Land-Use Data</h4>
                  </div>
                  {expandedSections.has('land-use') ? (
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  )}
                </button>
                {expandedSections.has('land-use') && (
                  <div className="space-y-1 px-2 pb-2" style={{ paddingTop: '6px' }}>
                    {layers
                      .filter(l => l.id === 'cdl')
                      .map(layer => (
                        <LayerItem
                          key={layer.id}
                          layer={layer}
                          onToggle={onLayerToggle}
                          onOpacityChange={onOpacityChange}
                          cdlYear={cdlYear}
                          onCdlYearChange={onCdlYearChange}
                        />
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface LayerItemProps {
  layer: SoilLayer
  onToggle: (layerId: string) => void
  onOpacityChange: (layerId: string, opacity: number) => void
  cdlYear?: number
  onCdlYearChange?: (year: number) => void
}

const LayerItem = ({ layer, onToggle, onOpacityChange, cdlYear, onCdlYearChange }: LayerItemProps) => (
  <div 
    className="space-y-2 rounded-lg p-2 transition-all duration-200"
    style={{
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
      border: '1px solid rgba(229, 231, 235, 0.6)'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.backgroundColor = 'rgba(249, 250, 251, 0.7)'
      e.currentTarget.style.borderColor = 'rgba(209, 213, 219, 0.8)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)'
      e.currentTarget.style.borderColor = 'rgba(229, 231, 235, 0.6)'
    }}
  >
    <div className="flex items-center justify-between">
      <label className="flex flex-1 cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={layer.visible}
          onChange={() => onToggle(layer.id)}
          className="border-border text-forest-600 focus:ring-forest-500 rounded cursor-pointer"
          style={{
            width: '16px',
            height: '16px'
          }}
        />
        <span className="text-sm font-medium text-text">
          {layer.name}
        </span>
      </label>

      <div 
        style={{
          padding: '4px',
          borderRadius: '6px',
          backgroundColor: layer.visible ? 'var(--color-forest-100)' : 'var(--color-slate-100)',
          transition: 'all 0.2s'
        }}
      >
        {layer.visible ? (
          <Eye className="h-4 w-4 text-forest-600" />
        ) : (
          <EyeOff className="h-4 w-4 text-slate-400" />
        )}
      </div>
    </div>

    {layer.visible && (
      <div className="ml-1 space-y-3" style={{ paddingLeft: '4px' }}>
        {/* CDL Year Selector */}
        {layer.id === 'cdl' && cdlYear !== undefined && onCdlYearChange && (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-secondary">
              Year
            </label>
            <select
              value={cdlYear}
              onChange={e => onCdlYearChange(Number(e.target.value))}
              className="form-input w-full rounded-lg border border-border px-3 py-2 text-sm transition-all duration-200 focus:border-ocean-500 bg-surface text-text"
            >
              {CDL_YEARS.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Opacity Slider - hide for SSURGO map units */}
        {layer.id !== 'ssurgo-mapunits' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-text-secondary">
                Opacity
              </label>
              <span 
                className="text-xs font-semibold px-2 py-0.5 rounded-full text-forest-700 bg-forest-100"
              >
                {Math.round(layer.opacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={layer.opacity}
              onChange={e => onOpacityChange(layer.id, parseFloat(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg transition-all duration-200"
              style={{
                background: `linear-gradient(to right, var(--color-forest-600) 0%, var(--color-forest-600) ${layer.opacity * 100}%, var(--color-border-light) ${layer.opacity * 100}%, var(--color-border-light) 100%)`
              }}
            />
          </div>
        )}
      </div>
    )}
  </div>
)
