// Map Search Component for Address/Coordinates Navigation

'use client'

import { MapPin, Search, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface MapSearchProps {
  onLocationSelect: (lat: number, lng: number, zoom?: number) => void
  className?: string
}

export default function MapSearch({ onLocationSelect, className = '' }: MapSearchProps) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsSearching(true)
    setSuggestions([])

    try {
      // Check if input is coordinates (lat,lng format)
      const coordMatch = query.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/)
      if (coordMatch) {
        const lat = parseFloat(coordMatch[1])
        const lng = parseFloat(coordMatch[2])
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          onLocationSelect(lat, lng, 12)
          setQuery('')
          setShowSuggestions(false)
          setIsSearching(false)
          return
        }
      }

      // Use Nominatim (OpenStreetMap) geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=us&limit=5`
      )
      
      if (response.ok) {
        const results = await response.json()
        if (results.length > 0) {
          setSuggestions(results)
          setShowSuggestions(true)
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSuggestionClick = (result: any) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    
    // Determine zoom level based on place type
    let zoom = 12
    if (result.type === 'state' || result.class === 'boundary') {
      zoom = 7
    } else if (result.type === 'city' || result.class === 'place') {
      zoom = 11
    }

    onLocationSelect(lat, lng, zoom)
    setQuery('')
    setShowSuggestions(false)
    setSuggestions([])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div
        className="shadow-lg"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(4px)',
          borderRadius: '8px',
          width: '320px',
        }}
      >
        <div className="flex items-center gap-2 p-3">
          <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search address, city, state, or lat,lng..."
            className="flex-1 outline-none bg-transparent text-sm"
            style={{ color: '#111827' }}
          />
          {query && (
            <button
              onClick={() => {
                setQuery('')
                setShowSuggestions(false)
                setSuggestions([])
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="px-3 py-1.5 rounded-md text-white text-sm font-medium transition-all disabled:opacity-50"
            style={{
              backgroundColor: isSearching || !query.trim() ? '#9ca3af' : '#15803d',
            }}
          >
            {isSearching ? 'Searching...' : 'Go'}
          </button>
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            className="border-t"
            style={{
              borderTopColor: '#e5e7eb',
              maxHeight: '300px',
              overflowY: 'auto',
            }}
          >
            {suggestions.map((result, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(result)}
                className="w-full text-left px-3 py-2.5 border-b transition-colors"
                style={{
                  borderBottomColor: '#f3f4f6',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate" style={{ color: '#111827' }}>
                      {result.display_name.split(',')[0]}
                    </div>
                    <div className="text-xs truncate" style={{ color: '#6b7280' }}>
                      {result.display_name.split(',').slice(1).join(',').trim()}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Help text */}
        <div className="px-3 py-2 border-t text-xs" style={{ color: '#6b7280', borderTopColor: '#e5e7eb' }}>
          Examples: &ldquo;San Francisco, CA&rdquo; or &ldquo;40.7128, -74.0060&rdquo;
        </div>
      </div>
    </div>
  )
}
