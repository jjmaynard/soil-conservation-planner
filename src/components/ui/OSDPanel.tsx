// Official Series Description (OSD) Display Panel Component

import React, { useState } from 'react'
import {
  Info,
  Layers,
  Thermometer,
  Droplets,
  MapPin,
  Calendar,
  Award,
  ChevronDown,
  ChevronRight,
  Mountain,
  Leaf,
} from 'lucide-react'
import type { FormattedOSDData } from '@/types/osd'

interface OSDPanelProps {
  osdData: FormattedOSDData | null
  isLoading?: boolean
  className?: string
}

interface CollapsibleSectionProps {
  title: string
  icon: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}

function CollapsibleSection({ title, icon, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        {isOpen ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
      </button>
      {isOpen && <div className="p-3 bg-gray-50">{children}</div>}
    </div>
  )
}

function DataRow({ label, value, unit }: { label: string; value: string | number | null; unit?: string }) {
  if (value === null || value === undefined) return null

  return (
    <div className="flex justify-between py-1">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className="text-sm font-medium text-gray-900">
        {value}
        {unit && <span className="text-gray-500 ml-1">{unit}</span>}
      </span>
    </div>
  )
}

export default function OSDPanel({ osdData, isLoading, className = '' }: OSDPanelProps) {
  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <span className="ml-3 text-gray-600">Loading OSD data...</span>
        </div>
      </div>
    )
  }

  if (!osdData) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <div className="text-center py-8 text-gray-500">
          <Info className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No Official Series Description available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <h2 className="text-xl font-bold">{osdData.seriesName.toUpperCase()} Series</h2>
        <p className="text-sm text-blue-100 mt-1">{osdData.classification.family}</p>
      </div>

      {/* Content */}
      <div className="divide-y divide-gray-200">
        {/* Classification */}
        <CollapsibleSection title="Taxonomic Classification" icon={<Layers className="w-5 h-5 text-blue-600" />} defaultOpen>
          <div className="space-y-1">
            <DataRow label="Order" value={osdData.classification.order} />
            <DataRow label="Suborder" value={osdData.classification.suborder} />
            <DataRow label="Great Group" value={osdData.classification.greatGroup} />
            <DataRow label="Subgroup" value={osdData.classification.subGroup} />
            {osdData.classification.particleSize && (
              <DataRow label="Particle Size" value={osdData.classification.particleSize} />
            )}
            {osdData.classification.mineralogy && (
              <DataRow label="Mineralogy" value={osdData.classification.mineralogy} />
            )}
            {osdData.classification.temperatureRegime && (
              <DataRow label="Temperature Regime" value={osdData.classification.temperatureRegime} />
            )}
            {osdData.classification.reaction && <DataRow label="Reaction" value={osdData.classification.reaction} />}
          </div>
        </CollapsibleSection>

        {/* Properties */}
        <CollapsibleSection title="Series Properties" icon={<Info className="w-5 h-5 text-green-600" />} defaultOpen>
          <div className="space-y-1">
            <DataRow label="Drainage Class" value={osdData.properties.drainage} />
            <DataRow label="Status" value={osdData.properties.status} />
            {osdData.properties.established && <DataRow label="Established" value={osdData.properties.established} />}
            {osdData.properties.benchmark && (
              <div className="flex items-center gap-2 py-1">
                <Award className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-gray-900">Benchmark Soil</span>
              </div>
            )}
            <DataRow label="Type Location" value={osdData.properties.typeLocation} />
            <DataRow label="MLRA Office" value={osdData.properties.mlraOffice} />
          </div>
        </CollapsibleSection>

        {/* Extent */}
        <CollapsibleSection title="Geographic Extent" icon={<MapPin className="w-5 h-5 text-red-600" />}>
          <div className="space-y-1">
            <DataRow label="Area" value={osdData.extent.acres.toLocaleString()} unit="acres" />
            <DataRow label="Polygons" value={osdData.extent.polygons.toLocaleString()} />
            {osdData.extent.mlra.length > 0 && (
              <div className="py-1">
                <span className="text-sm text-gray-600">MLRAs:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {osdData.extent.mlra.map((mlra) => (
                    <span key={mlra} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {mlra}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* Horizons */}
        <CollapsibleSection title="Soil Horizons" icon={<Layers className="w-5 h-5 text-orange-600" />} defaultOpen>
          <div className="space-y-3">
            {osdData.horizons.map((hz, idx) => (
              <div key={idx} className="border border-gray-200 rounded p-2 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{hz.name}</span>
                    <span className="text-sm text-gray-600">{hz.depth}</span>
                  </div>
                  {hz.texture && <span className="text-xs text-gray-600 italic">{hz.texture}</span>}
                </div>

                {(hz.color.dry || hz.color.moist) && (
                  <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                    {hz.color.dry && (
                      <div>
                        <span className="text-gray-500">Dry:</span>
                        <span className="ml-1 font-mono">{hz.color.dry}</span>
                      </div>
                    )}
                    {hz.color.moist && (
                      <div>
                        <span className="text-gray-500">Moist:</span>
                        <span className="ml-1 font-mono">{hz.color.moist}</span>
                      </div>
                    )}
                  </div>
                )}

                {hz.ph && (
                  <div className="text-xs mb-2">
                    <span className="text-gray-500">pH:</span>
                    <span className="ml-1 font-medium">{hz.ph}</span>
                    {hz.phClass && <span className="ml-1 text-gray-600">({hz.phClass})</span>}
                  </div>
                )}

                {hz.narrative && (
                  <p className="text-xs text-gray-700 leading-relaxed border-t border-gray-100 pt-2 mt-2">
                    {hz.narrative}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* Parent Material */}
        {osdData.parentMaterial.length > 0 && (
          <CollapsibleSection title="Parent Material" icon={<Mountain className="w-5 h-5 text-amber-600" />}>
            <div className="space-y-2">
              {osdData.parentMaterial.map((pm, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-900">{pm.material}</span>
                  <span className="text-sm font-medium text-gray-700">{pm.percentage}%</span>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Climate */}
        <CollapsibleSection title="Climate Summary" icon={<Thermometer className="w-5 h-5 text-purple-600" />}>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-700 block mb-1">Elevation</span>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Min: {osdData.climate.elevation.min} {osdData.climate.elevation.unit}</span>
                <span>Median: {osdData.climate.elevation.median} {osdData.climate.elevation.unit}</span>
                <span>Max: {osdData.climate.elevation.max} {osdData.climate.elevation.unit}</span>
              </div>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-700 block mb-1">Mean Annual Precipitation</span>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Min: {osdData.climate.precipitation.min} {osdData.climate.precipitation.unit}</span>
                <span>Median: {osdData.climate.precipitation.median} {osdData.climate.precipitation.unit}</span>
                <span>Max: {osdData.climate.precipitation.max} {osdData.climate.precipitation.unit}</span>
              </div>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-700 block mb-1">Mean Annual Temperature</span>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Min: {osdData.climate.temperature.min.toFixed(1)} {osdData.climate.temperature.unit}</span>
                <span>Median: {osdData.climate.temperature.median.toFixed(1)} {osdData.climate.temperature.unit}</span>
                <span>Max: {osdData.climate.temperature.max.toFixed(1)} {osdData.climate.temperature.unit}</span>
              </div>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-700 block mb-1">Frost-Free Days</span>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Min: {osdData.climate.frostFreeDays.min}</span>
                <span>Median: {osdData.climate.frostFreeDays.median}</span>
                <span>Max: {osdData.climate.frostFreeDays.max}</span>
              </div>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-700 block mb-1">Growing Degree Days</span>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Min: {osdData.climate.growingDegreeDays.min}</span>
                <span>Median: {osdData.climate.growingDegreeDays.median}</span>
                <span>Max: {osdData.climate.growingDegreeDays.max}</span>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Ecological Sites */}
        {osdData.ecologicalSites.length > 0 && (
          <CollapsibleSection title="Ecological Sites" icon={<Leaf className="w-5 h-5 text-green-600" />}>
            <div className="space-y-2">
              {osdData.ecologicalSites.map((site, idx) => (
                <div key={idx} className="border border-gray-200 rounded p-2 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{site.ecoclassid}</span>
                    <span className="text-xs text-gray-600">{(site.proportion * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-600 mt-1">
                    <span>{site.area_ac.toLocaleString()} acres</span>
                    <span>{site.n_components} components</span>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Associated Soils */}
        {osdData.associatedSoils.length > 0 && (
          <CollapsibleSection title="Associated Soils" icon={<Info className="w-5 h-5 text-teal-600" />}>
            <div className="flex flex-wrap gap-2">
              {osdData.associatedSoils.map((soil) => (
                <span key={soil} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                  {soil}
                </span>
              ))}
            </div>
          </CollapsibleSection>
        )}
      </div>
    </div>
  )
}
