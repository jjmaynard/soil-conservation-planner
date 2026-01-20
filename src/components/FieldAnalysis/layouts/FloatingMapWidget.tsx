// Floating Map Widget - Dockable/Draggable Map Component

'use client'

import { useState, useRef } from 'react'
import { Maximize2, Minimize2, Move, X, Map as MapIcon, Eye, EyeOff } from 'lucide-react'
import dynamic from 'next/dynamic'

const FieldMap = dynamic(() => import('../FieldMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 flex h-full w-full items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8" style={{ border: '2px solid #e5e7eb', borderTopColor: '#16a34a' }}></div>
    </div>
  ),
})

interface FloatingMapWidgetProps {
  fieldData: any
  selectedSoil?: any
  activeLayers?: string[]
  showCSBLayer?: boolean
  onCSBLayerToggle?: () => void
  onLayerToggle?: (layerId: string) => void
}

type MapSize = 'minimized' | 'small' | 'medium' | 'large' | 'fullscreen'
type MapPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center'

export default function FloatingMapWidget({
  fieldData,
  selectedSoil,
  activeLayers = [],
  showCSBLayer = true,
  onCSBLayerToggle,
  onLayerToggle
}: FloatingMapWidgetProps) {
  const [size, setSize] = useState<MapSize>('medium')
  const [position, setPosition] = useState<MapPosition>('bottom-right')
  const [isVisible, setIsVisible] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'minimized':
        return { width: '64px', height: '64px' }
      case 'small':
        return { width: '320px', height: '240px' }
      case 'medium':
        return { width: '480px', height: '360px' }
      case 'large':
        return { width: '640px', height: '480px' }
      case 'fullscreen':
        return { width: '100vw', height: '100vh', top: 0, left: 0, right: 0, bottom: 0 }
      default:
        return { width: '480px', height: '360px' }
    }
  }

  const getPositionStyles = (): React.CSSProperties => {
    if (size === 'fullscreen') {
      return { top: 0, left: 0, right: 0, bottom: 0 }
    }

    const offset = '16px'
    switch (position) {
      case 'bottom-right':
        return { bottom: offset, right: offset }
      case 'bottom-left':
        return { bottom: offset, left: offset }
      case 'top-right':
        return { top: offset, right: offset }
      case 'top-left':
        return { top: offset, left: offset }
      case 'center':
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
      default:
        return { bottom: offset, right: offset }
    }
  }

  const toggleSize = () => {
    const sizes: MapSize[] = ['medium', 'large', 'fullscreen']
    const currentIndex = sizes.indexOf(size)
    const nextIndex = (currentIndex + 1) % sizes.length
    setSize(sizes[nextIndex])
  }

  const cyclePosition = () => {
    const positions: MapPosition[] = ['bottom-right', 'bottom-left', 'top-left', 'top-right']
    const currentIndex = positions.indexOf(position)
    const nextIndex = (currentIndex + 1) % positions.length
    setPosition(positions[nextIndex])
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 p-4 rounded-full shadow-lg transition-all hover:shadow-xl"
        style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
      >
        <MapIcon className="w-6 h-6" />
      </button>
    )
  }

  if (size === 'minimized') {
    return (
      <div
        className="fixed rounded-lg shadow-xl transition-all cursor-pointer hover:shadow-2xl"
        style={{
          ...getSizeStyles(),
          ...getPositionStyles(),
          backgroundColor: '#16a34a',
          zIndex: 1000
        }}
        onClick={() => setSize('medium')}
      >
        <div className="flex items-center justify-center h-full text-white">
          <MapIcon className="w-8 h-8" />
        </div>
      </div>
    )
  }

  return (
    <div
      ref={dragRef}
      className="fixed rounded-xl shadow-2xl transition-all overflow-hidden flex flex-col"
      style={{
        ...getSizeStyles(),
        ...getPositionStyles(),
        backgroundColor: '#ffffff',
        border: '2px solid #16a34a',
        zIndex: 1000,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      {/* Map Controls Header */}
      <div 
        className="flex items-center justify-between p-2 border-b border-gray-200"
        style={{ backgroundColor: '#f9fafb' }}
      >
        <div className="flex items-center gap-2">
          <MapIcon className="w-4 h-4" style={{ color: '#16a34a' }} />
          <span className="text-xs font-semibold text-gray-700">Field Map</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Move Position Button */}
          {size !== 'fullscreen' && (
            <button
              onClick={cyclePosition}
              className="p-1.5 rounded hover:bg-gray-200 transition-colors"
              title="Change position"
            >
              <Move className="w-4 h-4 text-gray-600" />
            </button>
          )}

          {/* Resize Button */}
          <button
            onClick={toggleSize}
            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
            title={size === 'fullscreen' ? 'Exit fullscreen' : 'Expand'}
          >
            {size === 'fullscreen' ? (
              <Minimize2 className="w-4 h-4 text-gray-600" />
            ) : (
              <Maximize2 className="w-4 h-4 text-gray-600" />
            )}
          </button>

          {/* Minimize Button */}
          {size !== 'fullscreen' && (
            <button
              onClick={() => setSize('minimized')}
              className="p-1.5 rounded hover:bg-gray-200 transition-colors"
              title="Minimize"
            >
              <Minimize2 className="w-4 h-4 text-gray-600" />
            </button>
          )}

          {/* Close Button */}
          <button
            onClick={() => setIsVisible(false)}
            className="p-1.5 rounded hover:bg-red-100 transition-colors"
            title="Hide map"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Layer Toggle Bar */}
      {size !== 'minimized' && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-white overflow-x-auto">
          <span className="text-xs text-gray-600 whitespace-nowrap">Layers:</span>
          
          <button
            onClick={onCSBLayerToggle}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap"
            style={{
              backgroundColor: showCSBLayer ? '#dcfce7' : '#f3f4f6',
              color: showCSBLayer ? '#166534' : '#6b7280'
            }}
          >
            {showCSBLayer ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            Fields
          </button>

          <button
            onClick={() => onLayerToggle?.('soil-boundaries')}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap"
            style={{
              backgroundColor: activeLayers.includes('soil-boundaries') ? '#dcfce7' : '#f3f4f6',
              color: activeLayers.includes('soil-boundaries') ? '#166534' : '#6b7280'
            }}
          >
            {activeLayers.includes('soil-boundaries') ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            Soil
          </button>

          <button
            onClick={() => onLayerToggle?.('erosion-risk')}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap"
            style={{
              backgroundColor: activeLayers.includes('erosion-risk') ? '#fee2e2' : '#f3f4f6',
              color: activeLayers.includes('erosion-risk') ? '#991b1b' : '#6b7280'
            }}
          >
            {activeLayers.includes('erosion-risk') ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            Erosion
          </button>
        </div>
      )}

      {/* Map Container */}
      <div className="flex-1 relative" style={{ minHeight: 0 }}>
        <FieldMap
          mode="analysis"
          fieldData={fieldData}
          selectedSoil={selectedSoil}
          activeLayers={activeLayers}
          showCSBLayer={showCSBLayer}
          onCSBLayerToggle={onCSBLayerToggle}
          onLayerToggle={onLayerToggle}
        />
      </div>

      {/* Status Bar */}
      {size !== 'minimized' && (
        <div 
          className="px-3 py-1 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600"
          style={{ backgroundColor: '#f9fafb' }}
        >
          <span>{fieldData?.name || 'Field Map'}</span>
          <span className="text-gray-400">{fieldData?.area ? `${fieldData.area} acres` : ''}</span>
        </div>
      )}
    </div>
  )
}
