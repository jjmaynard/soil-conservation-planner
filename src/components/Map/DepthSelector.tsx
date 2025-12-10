// Depth Selector Component for Soil Horizons

'use client'

import { ChevronDown, ChevronUp, Layers as LayersIcon } from 'lucide-react'
import { AVAILABLE_DEPTHS } from '#src/hooks/useDepthSelection'
import type { SoilDepth } from '#src/types/soil'

interface DepthSelectorProps {
  selectedDepth: SoilDepth
  onDepthChange: (depth: SoilDepth) => void
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

export default function DepthSelector({
  selectedDepth,
  onDepthChange,
  className = '',
}: DepthSelectorProps) {
  const currentIndex = AVAILABLE_DEPTHS.indexOf(selectedDepth)
  const canGoUp = currentIndex > 0
  const canGoDown = currentIndex < AVAILABLE_DEPTHS.length - 1

  const handlePrevious = () => {
    if (canGoUp) {
      onDepthChange(AVAILABLE_DEPTHS[currentIndex - 1])
    }
  }

  const handleNext = () => {
    if (canGoDown) {
      onDepthChange(AVAILABLE_DEPTHS[currentIndex + 1])
    }
  }

  return (
    <div
      className={`absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg ${className}`}
    >
      <div className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <LayersIcon className="w-5 h-5 text-green-700" />
          <h3 className="font-semibold text-gray-900 text-sm">Soil Depth</h3>
        </div>

        {/* Depth Navigation */}
        <div className="flex items-center gap-2 mb-3">
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
              Layer {currentIndex + 1} of {AVAILABLE_DEPTHS.length}
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

        {/* Visual Depth Indicator */}
        <div className="mt-3 space-y-1">
          {AVAILABLE_DEPTHS.map((depth, index) => (
            <div
              key={depth}
              className={`h-2 rounded transition-colors cursor-pointer ${
                depth === selectedDepth
                  ? 'bg-green-600'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              onClick={() => onDepthChange(depth)}
              title={DEPTH_LABELS[depth]}
              style={{
                marginLeft: `${index * 4}px`,
                width: `calc(100% - ${index * 4}px)`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
