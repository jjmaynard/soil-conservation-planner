// Legend Panel Component

'use client'

import { Info } from 'lucide-react'

import type { LegendItem } from '#src/types/soil'

interface LegendPanelProps {
  title: string
  items: LegendItem[]
  className?: string
}

export default function LegendPanel({ title, items, className = '' }: LegendPanelProps) {
  if (items.length === 0) return null

  return (
    <div
      className={`absolute bottom-20 left-4 z-[1000] max-w-xs rounded-lg bg-white/95 p-3 shadow-lg backdrop-blur-sm ${className}`}
    >
      <div className="mb-2 flex items-center gap-2">
        <Info className="text-green-700 h-4 w-4" />
        <h4 className="text-gray-900 text-sm font-semibold">{title}</h4>
      </div>
      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="border-gray-300 h-4 w-4 rounded border" style={{ backgroundColor: item.color }} />
            <span className="text-gray-700 text-xs">{item.label}</span>
            {item.value && <span className="text-gray-500 ml-auto text-xs">{item.value}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
