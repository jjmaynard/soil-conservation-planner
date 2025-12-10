// Layer Control Component for Managing Soil Layers

'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Eye, EyeOff, Layers, Layers as LayersIcon } from 'lucide-react'
import { AVAILABLE_DEPTHS } from '#src/hooks/useDepthSelection'
import type { SoilLayer, SoilDepth } from '#src/types/soil'

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
    new Set(['land-use', 'soil-data', 'soil-properties'])
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

  const visibleCount = layers.filter((l) => l.visible).length
  const hasSoilPropertyLayerActive = layers.some(
    (l) => l.type === 'raster' && l.visible
  )

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
      className={`absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg max-w-sm ${className}`}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full p-3 border-b hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-green-700" />
          <h3 className="font-semibold text-gray-900">Data Layers</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {visibleCount}/{layers.length}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      {/* Layer List */}
      {isExpanded && (
        <div className="p-3 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            {/* Cropland Data Layer Section */}
            {layers.find((l) => l.id === 'cdl') && (
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('land-use')}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors"
                >
                  <h4 className="text-sm font-medium text-blue-600">
                    Land-Use Data
                  </h4>
                  {expandedSections.has('land-use') ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                {expandedSections.has('land-use') && (
                  <div className="px-3 pb-2 space-y-2">
                    {layers
                      .filter((l) => l.id === 'cdl')
                      .map((layer) => (
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
            {layers.filter((l) => (l.type === 'vector' || l.type === 'wms') && l.id !== 'cdl')
              .length > 0 && (
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('soil-data')}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors"
                >
                  <h4 className="text-sm font-medium text-blue-600">
                    Soil Data
                  </h4>
                  {expandedSections.has('soil-data') ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                {expandedSections.has('soil-data') && (
                  <div className="px-3 pb-2 space-y-2">
                    {layers
                      .filter((l) => (l.type === 'vector' || l.type === 'wms') && l.id !== 'cdl')
                      .map((layer) => (
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
            {layers.filter((l) => l.type === 'raster').length > 0 && (
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('soil-properties')}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors"
                >
                  <h4 className="text-sm font-medium text-blue-600">
                    Soil Properties
                  </h4>
                  {expandedSections.has('soil-properties') ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                {expandedSections.has('soil-properties') && (
                  <div className="px-3 pb-2 space-y-2">
                    {layers
                      .filter((l) => l.type === 'raster')
                      .map((layer) => (
                        <LayerItem
                          key={layer.id}
                          layer={layer}
                          onToggle={onLayerToggle}
                          onOpacityChange={onOpacityChange}
                        />
                      ))}

                    {/* Depth Selector - only visible when soil property layers are active */}
                    {hasSoilPropertyLayerActive && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <LayersIcon className="w-4 h-4 text-green-700" />
                          <h5 className="font-medium text-gray-900 text-sm">Soil Depth</h5>
                        </div>

                    {/* Depth Navigation */}
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        type="button"
                        onClick={handlePrevious}
                        disabled={!canGoUp}
                        className="p-2 rounded bg-green-100 hover:bg-green-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        title="Shallower depth"
                      >
                        <ChevronUp className="w-4 h-4 text-green-800" />
                      </button>

                      <div className="flex-1 text-center">
                        <div className="text-sm font-semibold text-gray-900">
                          {DEPTH_LABELS[selectedDepth]}
                        </div>
                        <div className="text-xs text-gray-500">
                          Layer {currentDepthIndex + 1} of {AVAILABLE_DEPTHS.length}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={!canGoDown}
                        className="p-2 rounded bg-green-100 hover:bg-green-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        title="Deeper depth"
                      >
                        <ChevronDown className="w-4 h-4 text-green-800" />
                      </button>
                    </div>

                    {/* Depth Selector Dropdown */}
                    <select
                      value={selectedDepth}
                      onChange={(e) => onDepthChange(e.target.value as SoilDepth)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    >
                      {AVAILABLE_DEPTHS.map((depth) => (
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

function LayerItem({ layer, onToggle, onOpacityChange, cdlYear, onCdlYearChange }: LayerItemProps) {
  return (
    <div className="space-y-2 p-2 rounded hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer flex-1">
          <input
            type="checkbox"
            checked={layer.visible}
            onChange={() => onToggle(layer.id)}
            className="rounded border-gray-300 text-green-700 focus:ring-green-600"
          />
          <span className="text-sm text-gray-700">{layer.name}</span>
        </label>

        {layer.visible ? (
          <Eye className="w-4 h-4 text-gray-400" />
        ) : (
          <EyeOff className="w-4 h-4 text-gray-400" />
        )}
      </div>

      {layer.visible && (
        <div className="ml-6 space-y-2">
          {/* CDL Year Selector */}
          {layer.id === 'cdl' && cdlYear !== undefined && onCdlYearChange && (
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">
                Year
              </label>
              <select
                value={cdlYear}
                onChange={(e) => onCdlYearChange(Number(e.target.value))}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-green-600 focus:border-transparent"
              >
                {CDL_YEARS.map((year) => (
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
                onChange={(e) => onOpacityChange(layer.id, parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-700"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Opacity</span>
                <span>{Math.round(layer.opacity * 100)}%</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
