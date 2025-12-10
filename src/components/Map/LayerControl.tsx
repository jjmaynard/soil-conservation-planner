// Layer Control Component for Managing Soil Layers

'use client'

import { ChevronDown, ChevronUp, Eye, EyeOff, Layers, Layers as LayersIcon } from 'lucide-react'
import { useState } from 'react'

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
  className = '',
}: LayerControlProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['land-use', 'soil-data', 'soil-properties']),
  )

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
      className={`absolute top-4 left-4 z-[1000] max-w-sm rounded-lg bg-white/95 shadow-lg backdrop-blur-sm ${className}`}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="hover:bg-gray-50 flex w-full items-center justify-between border-b p-3 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Layers className="text-green-700 h-5 w-5" />
          <h3 className="text-gray-900 font-semibold">Data Layers</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 text-sm">
            {visibleCount}/{layers.length}
          </span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Layer List */}
      {isExpanded && (
        <div className="max-h-96 overflow-y-auto p-3">
          <div className="space-y-4">
            {/* Cropland Data Layer Section */}
            {layers.find(l => l.id === 'cdl') && (
              <div className="border-gray-200 rounded-lg border">
                <button
                  onClick={() => toggleSection('land-use')}
                  className="hover:bg-gray-50 flex w-full items-center justify-between px-3 py-2 transition-colors"
                >
                  <h4 className="text-blue-600 text-sm font-medium">Land-Use Data</h4>
                  {expandedSections.has('land-use') ? (
                    <ChevronUp className="text-gray-500 h-4 w-4" />
                  ) : (
                    <ChevronDown className="text-gray-500 h-4 w-4" />
                  )}
                </button>
                {expandedSections.has('land-use') && (
                  <div className="space-y-2 px-3 pb-2">
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

            {/* Survey Data Layers */}
            {layers.filter(l => (l.type === 'vector' || l.type === 'wms') && l.id !== 'cdl').length > 0 && (
              <div className="border-gray-200 rounded-lg border">
                <button
                  onClick={() => toggleSection('soil-data')}
                  className="hover:bg-gray-50 flex w-full items-center justify-between px-3 py-2 transition-colors"
                >
                  <h4 className="text-blue-600 text-sm font-medium">Soil Data</h4>
                  {expandedSections.has('soil-data') ? (
                    <ChevronUp className="text-gray-500 h-4 w-4" />
                  ) : (
                    <ChevronDown className="text-gray-500 h-4 w-4" />
                  )}
                </button>
                {expandedSections.has('soil-data') && (
                  <div className="space-y-2 px-3 pb-2">
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

            {/* Soil Property Layers */}
            {layers.filter(l => l.type === 'raster').length > 0 && (
              <div className="border-gray-200 rounded-lg border">
                <button
                  onClick={() => toggleSection('soil-properties')}
                  className="hover:bg-gray-50 flex w-full items-center justify-between px-3 py-2 transition-colors"
                >
                  <h4 className="text-blue-600 text-sm font-medium">Soil Properties</h4>
                  {expandedSections.has('soil-properties') ? (
                    <ChevronUp className="text-gray-500 h-4 w-4" />
                  ) : (
                    <ChevronDown className="text-gray-500 h-4 w-4" />
                  )}
                </button>
                {expandedSections.has('soil-properties') && (
                  <div className="space-y-2 px-3 pb-2">
                    {layers
                      .filter(l => l.type === 'raster')
                      .map(layer => (
                        <LayerItem
                          key={layer.id}
                          layer={layer}
                          onToggle={onLayerToggle}
                          onOpacityChange={onOpacityChange}
                        />
                      ))}

                    {/* Depth Selector - only visible when soil property layers are active */}
                    {hasSoilPropertyLayerActive && (
                      <div className="border-gray-200 mt-3 border-t pt-3">
                        <div className="mb-3 flex items-center gap-2">
                          <LayersIcon className="text-green-700 h-4 w-4" />
                          <h5 className="text-gray-900 text-sm font-medium">Soil Depth</h5>
                        </div>

                        {/* Depth Navigation */}
                        <div className="mb-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handlePrevious}
                            disabled={!canGoUp}
                            className="bg-green-100 hover:bg-green-200 rounded p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                            title="Shallower depth"
                          >
                            <ChevronUp className="text-green-800 h-4 w-4" />
                          </button>

                          <div className="flex-1 text-center">
                            <div className="text-gray-900 text-sm font-semibold">
                              {DEPTH_LABELS[selectedDepth]}
                            </div>
                            <div className="text-gray-500 text-xs">
                              Layer {currentDepthIndex + 1} of {AVAILABLE_DEPTHS.length}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleNext}
                            disabled={!canGoDown}
                            className="bg-green-100 hover:bg-green-200 rounded p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                            title="Deeper depth"
                          >
                            <ChevronDown className="text-green-800 h-4 w-4" />
                          </button>
                        </div>

                        {/* Depth Selector Dropdown */}
                        <select
                          value={selectedDepth}
                          onChange={e => onDepthChange(e.target.value as SoilDepth)}
                          className="border-gray-300 focus:ring-green-600 w-full rounded-lg border px-3 py-2 text-sm focus:border-transparent focus:ring-2"
                        >
                          {AVAILABLE_DEPTHS.map(depth => (
                            <option key={depth} value={depth}>
                              {DEPTH_LABELS[depth]}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
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
  <div className="hover:bg-gray-50 space-y-2 rounded p-2">
    <div className="flex items-center justify-between">
      <label className="flex flex-1 cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={layer.visible}
          onChange={() => onToggle(layer.id)}
          className="border-gray-300 text-green-700 focus:ring-green-600 rounded"
        />
        <span className="text-gray-700 text-sm">{layer.name}</span>
      </label>

      {layer.visible ? (
        <Eye className="text-gray-400 h-4 w-4" />
      ) : (
        <EyeOff className="text-gray-400 h-4 w-4" />
      )}
    </div>

    {layer.visible && (
      <div className="ml-6 space-y-2">
        {/* CDL Year Selector */}
        {layer.id === 'cdl' && cdlYear !== undefined && onCdlYearChange && (
          <div className="space-y-1">
            <label className="text-gray-700 block text-xs font-medium">Year</label>
            <select
              value={cdlYear}
              onChange={e => onCdlYearChange(Number(e.target.value))}
              className="border-gray-300 focus:ring-green-600 w-full rounded border px-2 py-1 text-xs focus:border-transparent focus:ring-2"
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
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={layer.opacity}
              onChange={e => onOpacityChange(layer.id, parseFloat(e.target.value))}
              className="bg-gray-200 accent-green-700 h-2 w-full cursor-pointer appearance-none rounded-lg"
            />
            <div className="text-gray-500 flex justify-between text-xs">
              <span>Opacity</span>
              <span>{Math.round(layer.opacity * 100)}%</span>
            </div>
          </div>
        )}
      </div>
    )}
  </div>
)
