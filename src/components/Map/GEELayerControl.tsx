// Client-side GEE Layer Control Component (no SSR)

'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react'
import { useLayerGroups } from '#src/hooks/useMapLayers'

export default function GEELayerControl() {
  const {
    layerGroups,
    isLoading,
    activeLayers: geeActiveLayers,
    toggleGroup,
    toggleLayer: toggleGEELayer,
    setLayerOpacity: setGEEOpacity,
  } = useLayerGroups()

  const [showDescription, setShowDescription] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="mt-2 p-3 text-center text-sm text-gray-500">
        Loading GEE layers...
      </div>
    )
  }

  if (layerGroups.length === 0) {
    return null
  }

  const soilGroups = layerGroups.filter(g => g.category === 'soil')
  const terrainGroups = layerGroups.filter(g => g.category === 'terrain')

  const renderGEELayerItem = (geeLayer: any) => {
    const isActive = geeActiveLayers?.has(geeLayer.id) || false

    return (
      <div 
        key={geeLayer.id}
        className="space-y-2 rounded-lg p-2 transition-all duration-200"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          border: '1px solid rgba(229, 231, 235, 0.6)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(249, 250, 251, 0.7)'
          e.currentTarget.style.borderColor = 'rgba(209, 213, 219, 0.8)'
          setShowDescription(geeLayer.id)
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)'
          e.currentTarget.style.borderColor = 'rgba(229, 231, 235, 0.6)'
          setShowDescription(null)
        }}
      >
        <div className="flex items-center justify-between">
          <label className="flex flex-1 cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={() => toggleGEELayer(geeLayer.id)}
              className="border-border text-forest-600 focus:ring-forest-500 rounded cursor-pointer"
              style={{
                width: '16px',
                height: '16px'
              }}
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-text">
                {geeLayer.name}
              </span>
              {geeLayer.metadata?.units && (
                <span className="text-xs text-slate-500 ml-1">
                  ({geeLayer.metadata.units})
                </span>
              )}
            </div>
          </label>

          <div 
            style={{
              padding: '4px',
              borderRadius: '6px',
              backgroundColor: isActive ? 'var(--color-forest-100)' : 'var(--color-slate-100)',
              transition: 'all 0.2s'
            }}
          >
            {isActive ? (
              <Eye className="h-4 w-4 text-forest-600" />
            ) : (
              <EyeOff className="h-4 w-4 text-slate-400" />
            )}
          </div>
        </div>

        {/* Description on hover */}
        {showDescription === geeLayer.id && geeLayer.description && (
          <p className="text-xs text-slate-600 ml-1">{geeLayer.description}</p>
        )}

        {isActive && (
          <div className="ml-1 space-y-2" style={{ paddingLeft: '4px' }}>
            {/* Opacity Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-text-secondary">
                  Opacity
                </label>
                <span 
                  className="text-xs font-semibold px-2 py-0.5 rounded-full text-forest-700 bg-forest-100"
                >
                  {Math.round(geeLayer.opacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={geeLayer.opacity}
                onChange={e => setGEEOpacity(geeLayer.id, parseFloat(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg transition-all duration-200"
                style={{
                  background: `linear-gradient(to right, var(--color-forest-600) 0%, var(--color-forest-600) ${geeLayer.opacity * 100}%, var(--color-border-light) ${geeLayer.opacity * 100}%, var(--color-border-light) 100%)`
                }}
              />
            </div>

            {/* Color Palette */}
            {geeLayer.metadata?.palette && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary">
                  Color Scale
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex h-4 rounded overflow-hidden border border-slate-300">
                    {geeLayer.metadata.palette.map((color: string, idx: number) => (
                      <div
                        key={idx}
                        style={{ backgroundColor: color }}
                        className="flex-1"
                      />
                    ))}
                  </div>
                  {geeLayer.metadata.min !== undefined && geeLayer.metadata.max !== undefined && (
                    <div className="text-xs text-slate-600 whitespace-nowrap">
                      {geeLayer.metadata.min} - {geeLayer.metadata.max}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderGroup = (group: any, color: string) => {
    const hasActiveLayers = group.layers.some((layer: any) =>
      geeActiveLayers?.has(layer.id)
    )

    return (
      <div 
        key={group.id}
        className="rounded-xl overflow-hidden" 
        style={{ 
          border: '1px solid rgba(229, 231, 235, 0.8)',
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.6), rgba(249, 250, 251, 0.4))',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}
      >
        <button
          onClick={() => toggleGroup(group.id)}
          className="flex w-full items-center justify-between transition-all duration-200"
          style={{ 
            padding: '8px 10px', 
            backgroundColor: 'transparent',
            borderBottom: group.expanded ? '1px solid rgba(229, 231, 235, 0.5)' : 'none'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(249, 250, 251, 0.6)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <div className="flex items-center gap-2">
            <div 
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${color} 0%, ${color} 100%)`,
                boxShadow: `0 0 4px ${color}40`
              }}
            />
            <h4 className="text-sm font-semibold" style={{ color }}>
              {group.name}
            </h4>
            <span className="text-xs text-slate-500">({group.layers.length})</span>
          </div>
          {group.expanded ? (
            <ChevronUp className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          )}
        </button>
        {group.expanded && (
          <div className="space-y-1 px-2 pb-2" style={{ paddingTop: '6px' }}>
            {group.layers.map(renderGEELayerItem)}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Soil Properties */}
      {soilGroups.length > 0 && (
        <>
          {soilGroups.map(group => renderGroup(group, 'var(--color-forest-600)'))}
        </>
      )}

      {/* Terrain Properties */}
      {terrainGroups.length > 0 && (
        <>
          {terrainGroups.map(group => renderGroup(group, 'var(--color-amber-600)'))}
        </>
      )}
    </>
  )
}
