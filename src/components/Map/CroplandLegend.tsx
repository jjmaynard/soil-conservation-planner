// Cropland Data Layer (CDL) Legend Component

'use client'

import { ChevronDown, ChevronRight, ChevronUp, Layers, Map, X } from 'lucide-react'
import { useState } from 'react'

interface CroplandLegendProps {
  onClose?: () => void
  topOffset?: number
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
    ],
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
    ],
  },
  {
    name: 'Fiber Crops',
    color: '#a8a8a8',
    crops: [{ value: 2, label: 'Cotton', color: '#ff2626' }],
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
    ],
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
    ],
  },
  {
    name: 'Herbs and Spices',
    color: '#8ba8a8',
    crops: [
      { value: 14, label: 'Mint', color: '#7fd3ff' },
      { value: 57, label: 'Herbs', color: '#7fd3ff' },
    ],
  },
  {
    name: 'Forage and Turf',
    color: '#6b8e6b',
    crops: [
      { value: 36, label: 'Alfalfa', color: '#ffa5e2' },
      { value: 37, label: 'Other Hay/Non Alfalfa', color: '#a5f28c' },
      { value: 58, label: 'Clover/Wildflowers', color: '#e8bfff' },
      { value: 59, label: 'Sod/Grass Seed', color: '#aaffdd' },
    ],
  },
  {
    name: 'Sugar and Sweeteners',
    color: '#9d8fa8',
    crops: [
      { value: 41, label: 'Sugarbeets', color: '#a800e2' },
      { value: 45, label: 'Sugarcane', color: '#af7cff' },
    ],
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
    ],
  },
  {
    name: 'Double Cropping Systems',
    color: '#91798c',
    crops: [{ value: 26, label: 'Dbl Crop WinWht/Soybeans', color: '#707000' }],
  },
  {
    name: 'Miscellaneous',
    color: '#7a9393',
    crops: [
      { value: 61, label: 'Fallow/Idle Cropland', color: '#bfbf77' },
      { value: 92, label: 'Aquaculture', color: '#00ffff' },
    ],
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
    ],
  },
]

export default function CroplandLegend({ onClose, topOffset = 0, className = '' }: CroplandLegendProps) {
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

  // Calculate available height for legend content - matching PropertyPanel's bottom offset (0.5rem = 8px)
  const maxContentHeight = `calc(100vh - ${topOffset + 156}px)`

  return (
    <div
      className={`absolute left-4 max-w-xs ${className}`}
      style={{
        top: `${topOffset + 24}px`,
        ...(isExpanded && { bottom: '0.5rem' }),
        maxHeight: `calc(100vh - ${topOffset + 32}px)`,
        overflowY: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.97)',
        background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.97), rgba(249, 250, 251, 0.97))',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
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
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              borderRadius: '6px',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
            }}
          >
            <Map className="h-4 w-4" style={{ color: '#ffffff' }} />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-sm" style={{ color: '#111827', marginBottom: '1px' }}>Land Cover Legend</h3>
            {isExpanded && <p className="text-xs" style={{ color: '#6b7280' }}>Cropland Data Layer (CDL)</p>}
          </div>
        </div>
        <div 
          className="transition-transform duration-200"
          style={{
            transform: isExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
            color: '#6b7280'
          }}
        >
          <ChevronUp className="h-5 w-5" />
        </div>
      </button>

      {/* Legend Items - only show when expanded */}
      {isExpanded && (
        <>
          <div className="overflow-y-auto p-3 flex-1" style={{ minHeight: 0, paddingTop: '10px', paddingBottom: '10px' }}>
            {/* Expand/Collapse All Controls */}
            <div className="border-gray-200 mb-2 flex gap-2 border-b pb-2">
              <button
                onClick={expandAll}
                className="text-blue-600 hover:text-blue-800 text-xs hover:underline"
              >
                Expand All
              </button>
              <span className="text-gray-400 text-xs">|</span>
              <button
                onClick={collapseAll}
                className="text-blue-600 hover:text-blue-800 text-xs hover:underline"
              >
                Collapse All
              </button>
            </div>

            {/* Crop Groups */}
            <div className="space-y-1.5">
              {CROP_GROUPS.map(group => {
                const isGroupExpanded = expandedGroups.has(group.name)
                return (
                  <div key={group.name} className="border-gray-200 rounded border">
                    {/* Group Header */}
                    <button
                      onClick={() => toggleGroup(group.name)}
                      className="hover:bg-gray-50 flex w-full items-center gap-2 rounded px-2 py-1.5 transition-colors"
                    >
                      {isGroupExpanded ? (
                        <ChevronDown className="text-gray-500 h-3.5 w-3.5 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="text-gray-500 h-3.5 w-3.5 flex-shrink-0" />
                      )}
                      <span className="text-gray-700 flex-1 text-left text-xs font-semibold">
                        {group.name}
                      </span>
                      <span className="text-gray-500 text-xs">({group.crops.length})</span>
                    </button>

                    {/* Crop Items */}
                    {isGroupExpanded && (
                      <div className="bg-gray-50 space-y-0.5 px-7 py-1 pb-2">
                        {group.crops.map(crop => (
                          <div key={crop.value} className="flex items-center gap-2 py-0.5 text-xs">
                            <div
                              className="border-gray-300 h-3 w-3 flex-shrink-0 rounded border"
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
          <div className="bg-gray-50 text-gray-600 border-t p-3 text-xs flex-shrink-0">
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
