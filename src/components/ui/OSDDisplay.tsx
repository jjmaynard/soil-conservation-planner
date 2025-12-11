/**
 * Official Series Description (OSD) Display Component
 * Renders structured OSD data in an organized, readable format
 */

'use client'

import { BookOpen, Cloud, Droplets, Layers, MapPin, Mountain, Sprout, Thermometer } from 'lucide-react'
import { useState } from 'react'

import type { OSDData, OSDHorizon } from '#src/utils/osdParser'

interface OSDDisplayProps {
  componentName: string
  osdData: OSDData
  className?: string
}

export default function OSDDisplay({ componentName, osdData, className = '' }: OSDDisplayProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'horizons' | 'characteristics' | 'use'>('overview')

  return (
    <div className={`osd-display ${className}`}>
      {/* Header */}
      <div className="osd-header bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-5 w-5" />
          <h2 className="text-xl font-bold">{osdData.seriesName} Series</h2>
          <span className="text-sm bg-white/20 px-2 py-1 rounded">{osdData.state}</span>
        </div>
        <p className="text-sm text-blue-100">{osdData.taxonomicClass}</p>
        {osdData.established.date && (
          <p className="text-xs text-blue-200 mt-1">Established: {osdData.established.date}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-gray-50">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('horizons')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'horizons'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          Horizons
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('characteristics')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'characteristics'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          Properties
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('use')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'use'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          Land Use
        </button>
      </div>

      {/* Content */}
      <div className="osd-content p-4 bg-white max-h-[600px] overflow-y-auto">
        {activeTab === 'overview' && <OverviewTab osdData={osdData} />}
        {activeTab === 'horizons' && <HorizonsTab horizons={osdData.typicalPedon.horizons} />}
        {activeTab === 'characteristics' && <CharacteristicsTab osdData={osdData} />}
        {activeTab === 'use' && <UseTab osdData={osdData} />}
      </div>
    </div>
  )
}

/* Overview Tab */
function OverviewTab({ osdData }: { osdData: OSDData }) {
  return (
    <div className="space-y-4">
      {/* Climate */}
      <div className="border rounded-lg p-3">
        <div className="flex items-center gap-2 mb-3">
          <Cloud className="h-4 w-4 text-blue-600" />
          <h3 className="font-semibold text-gray-800">Climate & Environment</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {osdData.geographicSetting.temperature && (
            <div>
              <div className="flex items-center gap-1 text-gray-600">
                <Thermometer className="h-3 w-3" />
                <span className="font-medium">Temperature</span>
              </div>
              <div className="text-gray-800 mt-1">{osdData.geographicSetting.temperature}</div>
            </div>
          )}
          {osdData.geographicSetting.precipitation && (
            <div>
              <div className="flex items-center gap-1 text-gray-600">
                <Droplets className="h-3 w-3" />
                <span className="font-medium">Precipitation</span>
              </div>
              <div className="text-gray-800 mt-1">{osdData.geographicSetting.precipitation}</div>
            </div>
          )}
          {osdData.geographicSetting.frostFreePeriod && (
            <div className="col-span-2">
              <div className="text-gray-600 font-medium">Frost-Free Period</div>
              <div className="text-gray-800 mt-1">{osdData.geographicSetting.frostFreePeriod}</div>
            </div>
          )}
        </div>
      </div>

      {/* Landforms & Setting */}
      <div className="border rounded-lg p-3">
        <div className="flex items-center gap-2 mb-3">
          <Mountain className="h-4 w-4 text-green-600" />
          <h3 className="font-semibold text-gray-800">Landforms & Setting</h3>
        </div>
        <div className="space-y-2 text-sm">
          {osdData.geographicSetting.landforms.length > 0 && (
            <div>
              <span className="font-medium text-gray-600">Landforms: </span>
              <span className="text-gray-800">{osdData.geographicSetting.landforms.join(', ')}</span>
            </div>
          )}
          {osdData.geographicSetting.slopes && (
            <div>
              <span className="font-medium text-gray-600">Slopes: </span>
              <span className="text-gray-800">{osdData.geographicSetting.slopes}</span>
            </div>
          )}
          {osdData.geographicSetting.parentMaterial && (
            <div>
              <span className="font-medium text-gray-600">Parent Material: </span>
              <span className="text-gray-800">{osdData.geographicSetting.parentMaterial}</span>
            </div>
          )}
        </div>
      </div>

      {/* Drainage */}
      <div className="border rounded-lg p-3">
        <div className="flex items-center gap-2 mb-3">
          <Droplets className="h-4 w-4 text-blue-500" />
          <h3 className="font-semibold text-gray-800">Drainage & Hydrology</h3>
        </div>
        <div className="space-y-2 text-sm">
          {osdData.drainage.class && (
            <div>
              <span className="font-medium text-gray-600">Drainage Class: </span>
              <span className="text-gray-800 capitalize">{osdData.drainage.class}</span>
            </div>
          )}
          {osdData.drainage.permeability && (
            <div>
              <span className="font-medium text-gray-600">Permeability: </span>
              <span className="text-gray-800">{osdData.drainage.permeability}</span>
            </div>
          )}
          {osdData.drainage.runoff && (
            <div>
              <span className="font-medium text-gray-600">Runoff: </span>
              <span className="text-gray-800">{osdData.drainage.runoff}</span>
            </div>
          )}
          {osdData.drainage.waterTable && (
            <div>
              <span className="font-medium text-gray-600">Water Table: </span>
              <span className="text-gray-800">{osdData.drainage.waterTable}</span>
            </div>
          )}
        </div>
      </div>

      {/* Distribution */}
      {osdData.distribution && (
        <div className="border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-red-600" />
            <h3 className="font-semibold text-gray-800">Distribution</h3>
          </div>
          <div className="space-y-2 text-sm">
            {osdData.distribution.extent && (
              <div>
                <span className="font-medium text-gray-600">Extent: </span>
                <span className="text-gray-800 capitalize">{osdData.distribution.extent}</span>
              </div>
            )}
            {osdData.distribution.mlra.length > 0 && (
              <div>
                <span className="font-medium text-gray-600">MLRA: </span>
                <span className="text-gray-800">{osdData.distribution.mlra.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* Horizons Tab */
function HorizonsTab({ horizons }: { horizons: OSDHorizon[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Layers className="h-4 w-4 text-amber-600" />
        <h3 className="font-semibold text-gray-800">Soil Profile - Typical Pedon</h3>
      </div>

      {horizons.map((horizon, idx) => (
        <div key={idx} className="border-l-4 border-amber-500 bg-gray-50 p-3 rounded">
          {/* Horizon Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-gray-800">{horizon.name}</span>
              <span className="text-sm text-gray-600">{horizon.depth}</span>
            </div>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">{horizon.texture}</span>
          </div>

          {/* Colors */}
          {(horizon.color.dry || horizon.color.moist) && (
            <div className="mb-2 text-sm">
              <span className="font-medium text-gray-600">Color: </span>
              {horizon.color.dry && <span className="text-gray-700">Dry: {horizon.color.dry}</span>}
              {horizon.color.dry && horizon.color.moist && <span className="text-gray-500"> | </span>}
              {horizon.color.moist && <span className="text-gray-700">Moist: {horizon.color.moist}</span>}
            </div>
          )}

          {/* Structure & Consistence */}
          <div className="space-y-1 text-sm">
            {horizon.structure && horizon.structure !== 'Unknown' && (
              <div>
                <span className="font-medium text-gray-600">Structure: </span>
                <span className="text-gray-700">{horizon.structure}</span>
              </div>
            )}
            {horizon.consistence && horizon.consistence !== 'Unknown' && (
              <div>
                <span className="font-medium text-gray-600">Consistence: </span>
                <span className="text-gray-700">{horizon.consistence}</span>
              </div>
            )}
          </div>

          {/* Chemical Properties */}
          <div className="mt-2 flex gap-4 text-sm">
            {horizon.pH && (
              <div>
                <span className="font-medium text-gray-600">pH: </span>
                <span className="text-gray-700">{horizon.pH}</span>
              </div>
            )}
            {horizon.reaction && horizon.reaction !== 'Unknown' && (
              <div>
                <span className="font-medium text-gray-600">Reaction: </span>
                <span className="text-gray-700">{horizon.reaction}</span>
              </div>
            )}
            {horizon.effervescence && horizon.effervescence !== 'None' && (
              <div>
                <span className="font-medium text-gray-600">Effervescence: </span>
                <span className="text-gray-700">{horizon.effervescence}</span>
              </div>
            )}
          </div>

          {/* Special Features */}
          {horizon.features.length > 0 && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-1">
                {horizon.features.map((feature, fIdx) => (
                  <span key={fIdx} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* Characteristics Tab */
function CharacteristicsTab({ osdData }: { osdData: OSDData }) {
  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-3">
        <h3 className="font-semibold text-gray-800 mb-3">Range in Characteristics</h3>
        <div className="space-y-2 text-sm">
          {osdData.rangeInCharacteristics.meanAnnualSoilTemp && (
            <div>
              <span className="font-medium text-gray-600">Mean Annual Soil Temperature: </span>
              <span className="text-gray-800">{osdData.rangeInCharacteristics.meanAnnualSoilTemp}</span>
            </div>
          )}
          {osdData.rangeInCharacteristics.clayContent && (
            <div>
              <span className="font-medium text-gray-600">Clay Content: </span>
              <span className="text-gray-800">{osdData.rangeInCharacteristics.clayContent}</span>
            </div>
          )}
          {osdData.rangeInCharacteristics.organicMatter && (
            <div>
              <span className="font-medium text-gray-600">Organic Matter: </span>
              <span className="text-gray-800">{osdData.rangeInCharacteristics.organicMatter}</span>
            </div>
          )}
        </div>
      </div>

      {/* Diagnostic Features */}
      {osdData.remarks && osdData.remarks.diagnosticHorizons.length > 0 && (
        <div className="border rounded-lg p-3">
          <h3 className="font-semibold text-gray-800 mb-3">Diagnostic Horizons</h3>
          <div className="space-y-2">
            {osdData.remarks.diagnosticHorizons.map((horizon, idx) => (
              <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                <div className="font-medium text-gray-700">{typeof horizon === 'string' ? horizon : horizon.name}</div>
                {typeof horizon === 'object' && horizon.description && (
                  <div className="text-gray-600 text-xs mt-1">{horizon.description}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Special Features */}
      {osdData.remarks && osdData.remarks.features.length > 0 && (
        <div className="border rounded-lg p-3">
          <h3 className="font-semibold text-gray-800 mb-3">Special Features</h3>
          <div className="space-y-2">
            {osdData.remarks.features.map((feature, idx) => (
              <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                <div className="font-medium text-gray-700">{feature.name}</div>
                <div className="text-gray-600 text-xs mt-1">{feature.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* Use Tab */
function UseTab({ osdData }: { osdData: OSDData }) {
  return (
    <div className="space-y-4">
      {/* Primary Use */}
      {osdData.useAndVegetation.use && (
        <div className="border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-3">
            <Sprout className="h-4 w-4 text-green-600" />
            <h3 className="font-semibold text-gray-800">Primary Land Use</h3>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{osdData.useAndVegetation.use}</p>
        </div>
      )}

      {/* Vegetation */}
      {osdData.useAndVegetation.vegetation && (
        <div className="border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-3">
            <Sprout className="h-4 w-4 text-emerald-600" />
            <h3 className="font-semibold text-gray-800">Natural Vegetation</h3>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{osdData.useAndVegetation.vegetation}</p>
        </div>
      )}

      {/* Typical Pedon Description */}
      {osdData.typicalPedon.description && (
        <div className="border rounded-lg p-3">
          <h3 className="font-semibold text-gray-800 mb-2">Typical Pedon Context</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{osdData.typicalPedon.description}</p>
        </div>
      )}
    </div>
  )
}
