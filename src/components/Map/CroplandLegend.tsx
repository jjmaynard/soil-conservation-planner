// Cropland Data Layer (CDL) Legend Component

'use client'

import { useState } from 'react'
import { X, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react'

interface CroplandLegendProps {
  onClose?: () => void
  className?: string
}

// Crop groups based on CDL classification
const CROP_GROUPS = [
  {
    name: 'Cereals',
    color: '#8b7355',
    crops: [
      { value: 1, label: 'Corn', color: '#ffd300' },
      { value: 3, label: 'Rice', color: '#00a8e2' },
      { value: 4, label: 'Sorghum', color: '#ff9e0c' },
      { value: 21, label: 'Barley', color: '#e2007c' },
      { value: 22, label: 'Durum Wheat', color: '#896054' },
      { value: 23, label: 'Spring Wheat', color: '#d8b56b' },
      { value: 24, label: 'Winter Wheat', color: '#a57000' },
      { value: 25, label: 'Other Small Grains', color: '#d69ebc' },
      { value: 27, label: 'Rye', color: '#aa007c' },
      { value: 28, label: 'Oats', color: '#a05989' },
      { value: 29, label: 'Millet', color: '#700049' },
      { value: 30, label: 'Speltz', color: '#d69ebc' },
    ]
  },
  {
    name: 'Oilseeds',
    color: '#7a9b76',
    crops: [
      { value: 5, label: 'Soybeans', color: '#267000' },
      { value: 6, label: 'Sunflower', color: '#ffff00' },
      { value: 10, label: 'Peanuts', color: '#70a500' },
      { value: 31, label: 'Canola', color: '#d1ff00' },
      { value: 32, label: 'Flaxseed', color: '#7c99ff' },
      { value: 33, label: 'Safflower', color: '#d6d600' },
      { value: 34, label: 'Rape Seed', color: '#d1ff00' },
      { value: 35, label: 'Mustard', color: '#00af49' },
      { value: 38, label: 'Camelina', color: '#00af49' },
    ]
  },
  {
    name: 'Fiber Crops',
    color: '#a8a8a8',
    crops: [
      { value: 2, label: 'Cotton', color: '#ff2626' },
    ]
  },
  {
    name: 'Vegetables',
    color: '#b8956a',
    crops: [
      { value: 12, label: 'Sweet Corn', color: '#dda50a' },
      { value: 13, label: 'Pop/Orn Corn', color: '#dda50a' },
      { value: 42, label: 'Dry Beans', color: '#a50000' },
      { value: 43, label: 'Potatoes', color: '#702600' },
      { value: 46, label: 'Sweet Potatoes', color: '#702600' },
      { value: 47, label: 'Misc Vegs & Fruits', color: '#ff6666' },
      { value: 48, label: 'Watermelons', color: '#ff6666' },
      { value: 49, label: 'Onions', color: '#ffcc66' },
      { value: 50, label: 'Cucumbers', color: '#ff6666' },
      { value: 51, label: 'Chick Peas', color: '#00af49' },
      { value: 52, label: 'Lentils', color: '#00ddaf' },
      { value: 53, label: 'Peas', color: '#54ff00' },
      { value: 54, label: 'Tomatoes', color: '#f2a377' },
    ]
  },
  {
    name: 'Fruits and Nuts',
    color: '#9b7b6f',
    crops: [
      { value: 66, label: 'Cherries', color: '#ff00ff' },
      { value: 67, label: 'Peaches', color: '#ff8eaa' },
      { value: 68, label: 'Apples', color: '#ba004f' },
      { value: 69, label: 'Grapes', color: '#704489' },
      { value: 72, label: 'Citrus', color: '#ffff7c' },
      { value: 74, label: 'Pecans', color: '#b5705b' },
      { value: 75, label: 'Almonds', color: '#00a582' },
      { value: 76, label: 'Walnuts', color: '#e8d6af' },
      { value: 77, label: 'Pears', color: '#af9970' },
    ]
  },
  {
    name: 'Herbs and Spices',
    color: '#8ba8a8',
    crops: [
      { value: 14, label: 'Mint', color: '#7fd3ff' },
      { value: 57, label: 'Herbs', color: '#7fd3ff' },
    ]
  },
  {
    name: 'Forage and Turf',
    color: '#6b8e6b',
    crops: [
      { value: 36, label: 'Alfalfa', color: '#ffa5e2' },
      { value: 37, label: 'Other Hay/Non Alfalfa', color: '#a5f28c' },
      { value: 58, label: 'Clover/Wildflowers', color: '#e8bfff' },
      { value: 59, label: 'Sod/Grass Seed', color: '#aaffdd' },
    ]
  },
  {
    name: 'Sugar and Sweeteners',
    color: '#9d8fa8',
    crops: [
      { value: 41, label: 'Sugarbeets', color: '#a800e2' },
      { value: 45, label: 'Sugarcane', color: '#af7cff' },
    ]
  },
  {
    name: 'Specialty Crops',
    color: '#8c8c6b',
    crops: [
      { value: 11, label: 'Tobacco', color: '#00af49' },
      { value: 39, label: 'Buckwheat', color: '#d69ebc' },
      { value: 44, label: 'Other Crops', color: '#00af49' },
      { value: 55, label: 'Caneberries', color: '#ff6666' },
      { value: 56, label: 'Hops', color: '#00af49' },
      { value: 60, label: 'Switchgrass', color: '#00af49' },
      { value: 70, label: 'Christmas Trees', color: '#007777' },
      { value: 71, label: 'Other Tree Crops', color: '#af9970' },
    ]
  },
  {
    name: 'Double Cropping Systems',
    color: '#91798c',
    crops: [
      { value: 26, label: 'Dbl Crop WinWht/Soybeans', color: '#707000' },
    ]
  },
  {
    name: 'Miscellaneous',
    color: '#7a9393',
    crops: [
      { value: 61, label: 'Fallow/Idle Cropland', color: '#bfbf77' },
      { value: 92, label: 'Aquaculture', color: '#00ffff' },
    ]
  },
  {
    name: 'Non-Cropland Classes',
    color: '#9a9a9a',
    crops: [
      { value: 63, label: 'Forest', color: '#93cc93' },
      { value: 64, label: 'Shrubland', color: '#c6d69e' },
      { value: 65, label: 'Barren', color: '#ccbfa3' },
      { value: 81, label: 'Clouds/No Data', color: '#f2f2f2' },
      { value: 82, label: 'Developed', color: '#999999' },
      { value: 83, label: 'Water', color: '#4970a3' },
      { value: 87, label: 'Wetlands', color: '#7cafaf' },
      { value: 88, label: 'Nonag/Undefined', color: '#e8ffbf' },
      { value: 111, label: 'Open Water', color: '#4970a3' },
      { value: 112, label: 'Perennial Ice/Snow', color: '#d3e2f9' },
      { value: 121, label: 'Developed/Open Space', color: '#9d9d9d' },
      { value: 122, label: 'Developed/Low Intensity', color: '#9d9d9d' },
      { value: 123, label: 'Developed/Med Intensity', color: '#9d9d9d' },
      { value: 124, label: 'Developed/High Intensity', color: '#9d9d9d' },
      { value: 131, label: 'Barren', color: '#ccbfa3' },
      { value: 141, label: 'Deciduous Forest', color: '#93cc93' },
      { value: 142, label: 'Evergreen Forest', color: '#93cc93' },
      { value: 143, label: 'Mixed Forest', color: '#93cc93' },
      { value: 152, label: 'Shrubland', color: '#c6d69e' },
      { value: 176, label: 'Grassland/Pasture', color: '#e8ffbf' },
      { value: 190, label: 'Woody Wetlands', color: '#7cafaf' },
      { value: 195, label: 'Herbaceous Wetlands', color: '#7cafaf' },
    ]
  },
]

export default function CroplandLegend({
  onClose,
  className = '',
}: CroplandLegendProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName)
    } else {
      newExpanded.add(groupName)
    }
    setExpandedGroups(newExpanded)
  }

  const expandAll = () => {
    setExpandedGroups(new Set(CROP_GROUPS.map(g => g.name)))
  }

  const collapseAll = () => {
    setExpandedGroups(new Set())
  }

  return (
    <div
      className={`absolute top-[30rem] left-4 z-[400] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg max-w-xs ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 flex-1 hover:bg-gray-50 -mx-3 -my-3 px-3 py-3 rounded-t-lg transition-colors"
        >
          <div className="flex-1 text-left">
            <h3 className="font-semibold text-gray-900 text-sm">
              Cropland Data Layer
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Land Cover Legend</p>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors ml-2"
            aria-label="Close legend"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Legend Items - only show when expanded */}
      {isExpanded && (
        <>
          <div className="p-3 max-h-[70vh] overflow-y-auto">
            {/* Expand/Collapse All Controls */}
            <div className="flex gap-2 mb-2 pb-2 border-b border-gray-200">
              <button
                onClick={expandAll}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                Expand All
              </button>
              <span className="text-xs text-gray-400">|</span>
              <button
                onClick={collapseAll}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                Collapse All
              </button>
            </div>

            {/* Crop Groups */}
            <div className="space-y-1.5">
              {CROP_GROUPS.map((group) => {
                const isGroupExpanded = expandedGroups.has(group.name)
                return (
                  <div key={group.name} className="border border-gray-200 rounded">
                    {/* Group Header */}
                    <button
                      onClick={() => toggleGroup(group.name)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 transition-colors rounded"
                    >
                      {isGroupExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                      )}
                      <div
                        className="w-4 h-4 rounded border border-gray-400 flex-shrink-0"
                        style={{ backgroundColor: group.color }}
                      />
                      <span className="text-xs font-semibold text-gray-700 flex-1 text-left">
                        {group.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({group.crops.length})
                      </span>
                    </button>

                    {/* Crop Items */}
                    {isGroupExpanded && (
                      <div className="px-7 py-1 pb-2 space-y-0.5 bg-gray-50">
                        {group.crops.map((crop) => (
                          <div key={crop.value} className="flex items-center gap-2 text-xs py-0.5">
                            <div
                              className="w-3 h-3 rounded border border-gray-300 flex-shrink-0"
                              style={{ backgroundColor: crop.color }}
                            />
                            <span className="text-gray-600 truncate">{crop.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

        {/* Footer */}
        <div className="p-3 border-t bg-gray-50 text-xs text-gray-600">
          <p>
            Source:{' '}
            <a
              href="https://www.nass.usda.gov/Research_and_Science/Cropland/SARS1a.php"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              USDA NASS CropScape
            </a>
          </p>
        </div>
      </>
      )}
    </div>
  )
}