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

export default function DepthSelector({ selectedDepth, onDepthChange, className = '' }: DepthSelectorProps) {
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
      className={`absolute top-4 right-4 z-[1000] rounded-lg bg-white/95 shadow-lg backdrop-blur-sm ${className}`}
    >
      <div className="p-3">
        <div className="mb-3 flex items-center gap-2">
          <LayersIcon className="text-green-700 h-5 w-5" />
          <h3 className="text-gray-900 text-sm font-semibold">Soil Depth</h3>
        </div>

        {/* Depth Navigation */}
        <div className="mb-3 flex items-center gap-2">
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
            <div className="text-gray-900 text-sm font-semibold">{DEPTH_LABELS[selectedDepth]}</div>
            <div className="text-gray-500 text-xs">
              Layer {currentIndex + 1} of {AVAILABLE_DEPTHS.length}
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

        {/* Visual Depth Indicator */}
        <div className="mt-3 space-y-1">
          {AVAILABLE_DEPTHS.map((depth, index) => (
            <div
              key={depth}
              className={`h-2 cursor-pointer rounded transition-colors ${
                depth === selectedDepth ? 'bg-green-600' : 'bg-gray-300 hover:bg-gray-400'
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

export default DepthSelector
