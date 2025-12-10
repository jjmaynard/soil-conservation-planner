// Legend Panel Component

'use client'

import { Info } from 'lucide-react'
import type { LegendItem } from '#src/types/soil'

interface LegendPanelProps {
  title: string
  items: LegendItem[]
  className?: string
}

export default function LegendPanel({
  title,
  items,
  className = '',
}: LegendPanelProps) {
  if (items.length === 0) return null

  return (
    <div
      className={`absolute bottom-20 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 max-w-xs ${className}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Info className="w-4 h-4 text-green-700" />
        <h4 className="font-semibold text-sm text-gray-900">{title}</h4>
      </div>
      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded border border-gray-300"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-700">{item.label}</span>
            {item.value && (
              <span className="text-xs text-gray-500 ml-auto">
                {item.value}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
