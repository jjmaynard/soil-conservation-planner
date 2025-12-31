// Field Map Component with CLU boundaries, drawing tools, and layer controls

'use client'

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import 'leaflet-draw'
import * as turf from '@turf/turf'
import { Layers, Square, MapPin, CheckCircle, AlertCircle } from 'lucide-react'

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})

interface FieldMapProps {
  mode: 'search' | 'browse' | 'draw' | 'upload' | 'analysis'
  searchQuery?: string
  fieldData?: any
  selectedSoil?: any
  activeLayers?: string[]
  showCLULayer?: boolean
  onFieldSelected?: (field: any) => void
  onLayerToggle?: (layerId: string) => void
  onMapReady?: (controls: { panToLocation: (lat: number, lng: number, zoom?: number) => void }) => void
}

export interface FieldMapRef {
  panToLocation: (lat: number, lng: number, zoom?: number) => void
}

const FieldMap = forwardRef<FieldMapRef, FieldMapProps>(({
  mode,
  searchQuery,
  fieldData,
  selectedSoil,
  activeLayers = [],
  showCLULayer = false,
  onFieldSelected,
  onLayerToggle,
  onMapReady,
}, ref) => {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null)
  const drawControlRef = useRef<L.Control.Draw | null>(null)
  const [drawnPolygon, setDrawnPolygon] = useState<any>(null)
  const [polygonArea, setPolygonArea] = useState<number>(0)
  const [validationError, setValidationError] = useState<string>('')
  const [mapInitialized, setMapInitialized] = useState(false)

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    panToLocation: (lat: number, lng: number, zoom: number = 14) => {
      console.log('panToLocation called with:', lat, lng, zoom)
      console.log('mapRef.current exists:', !!mapRef.current)
      
      if (mapRef.current) {
        console.log('Setting view on map')
        mapRef.current.setView([lat, lng], zoom, { animate: true })
        
        // Add a temporary marker at the location
        const marker = L.marker([lat, lng], {
          icon: L.icon({
            iconUrl: '/leaflet/marker-icon.png',
            iconRetinaUrl: '/leaflet/marker-icon-2x.png',
            shadowUrl: '/leaflet/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          })
        }).addTo(mapRef.current)
        
        console.log('Marker added')
        
        // Remove marker after 5 seconds
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.removeLayer(marker)
            console.log('Marker removed')
          }
        }, 5000)
      } else {
        console.warn('Map not initialized yet')
      }
    }
  }))

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Initialize map
    const map = L.map(containerRef.current, {
      center: [41.5868, -93.6250], // Iowa center
      zoom: 7,
      zoomControl: false,
      minZoom: 3,
      maxZoom: 18,
    })

    // Add zoom control to bottom right
    L.control.zoom({
      position: 'bottomright',
    }).addTo(map)

    // Add scale control
    L.control.scale({
      position: 'bottomleft',
      imperial: true,
      metric: true,
    }).addTo(map)

    // Define base layers with satellite imagery
    const baseLayers = {
      'Satellite Hybrid': L.layerGroup([
        L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            attribution: 'Tiles © Esri',
            maxZoom: 19,
          }
        ),
        L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          {
            attribution: 'Labels © Esri',
            maxZoom: 19,
          }
        ),
      ]),
      'Satellite': L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles © Esri',
          maxZoom: 19,
        }
      ),
      'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }),
      'Terrain': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri',
        maxZoom: 19,
      }),
    }

    // Add default base layer (Satellite Hybrid)
    baseLayers['Satellite Hybrid'].addTo(map)

    // Add layer control
    L.control.layers(baseLayers, {}, { position: 'topright' }).addTo(map)

    mapRef.current = map
    setMapInitialized(true)

    // Expose map controls to parent component
    if (onMapReady) {
      onMapReady({
        panToLocation: (lat: number, lng: number, zoom: number = 14) => {
          console.log('panToLocation called with:', lat, lng, zoom)
          map.setView([lat, lng], zoom, { animate: true })
          
          // Add a temporary marker at the location
          const marker = L.marker([lat, lng], {
            icon: L.icon({
              iconUrl: '/leaflet/marker-icon.png',
              iconRetinaUrl: '/leaflet/marker-icon-2x.png',
              shadowUrl: '/leaflet/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            })
          }).addTo(map)
          
          // Remove marker after 5 seconds
          setTimeout(() => {
            map.removeLayer(marker)
          }, 5000)
        }
      })
    }

    // Cleanup
    return () => {
      map.remove()
      mapRef.current = null
      setMapInitialized(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  // onMapReady is intentionally not in deps - we only want to initialize once

  // Handle drawing controls based on mode
  useEffect(() => {
    if (!mapRef.current || !mapInitialized) return

    const map = mapRef.current

    // Remove existing drawing controls if switching away from draw mode
    if (mode !== 'draw' && drawControlRef.current) {
      map.removeControl(drawControlRef.current)
      drawControlRef.current = null
      if (drawnItemsRef.current) {
        map.removeLayer(drawnItemsRef.current)
        drawnItemsRef.current = null
      }
      return
    }

    // Initialize drawn items layer for drawing mode
    if (mode === 'draw' && !drawnItemsRef.current) {
      const drawnItems = new L.FeatureGroup()
      map.addLayer(drawnItems)
      drawnItemsRef.current = drawnItems

      // Configure leaflet-draw
      const drawControl = new L.Control.Draw({
        position: 'topright',
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: true,
            metric: false, // Use imperial (acres)
            shapeOptions: {
              color: '#16a34a',
              weight: 3,
              fillOpacity: 0.2,
            },
          },
          rectangle: {
            shapeOptions: {
              color: '#2563eb',
              weight: 3,
              fillOpacity: 0.2,
            },
          },
          circle: false, // Disable circle (not useful for fields)
          polyline: false,
          marker: false,
          circlemarker: false,
        },
        edit: {
          featureGroup: drawnItems,
          remove: true,
          edit: {
            selectedPathOptions: {
              opacity: 0.3,
              weight: 3,
            },
          },
        },
      })
      map.addControl(drawControl)
      drawControlRef.current = drawControl

      // Handle polygon creation
      map.on(L.Draw.Event.CREATED, (e: any) => {
        const layer = e.layer
        drawnItems.addLayer(layer)

        // Convert to GeoJSON
        const geoJSON = layer.toGeoJSON()
        
        // Calculate area using turf.js (returns square meters)
        const areaSquareMeters = turf.area(geoJSON)
        const areaAcres = areaSquareMeters * 0.000247105 // Convert to acres

        // Validate area
        if (areaAcres < 0.5) {
          setValidationError('Field must be at least 0.5 acres')
          drawnItems.removeLayer(layer)
          return
        }

        if (areaAcres > 10000) {
          setValidationError('Field exceeds maximum size of 10,000 acres')
          drawnItems.removeLayer(layer)
          return
        }

        // Validate complexity (max 1000 vertices)
        const coordinates = geoJSON.geometry.coordinates[0]
        if (coordinates.length > 1000) {
          setValidationError('Field boundary is too complex (max 1000 points)')
          drawnItems.removeLayer(layer)
          return
        }

        setValidationError('')
        setDrawnPolygon(geoJSON)
        setPolygonArea(areaAcres)
      })

      // Handle polygon edit
      map.on(L.Draw.Event.EDITED, (e: any) => {
        const layers = e.layers
        layers.eachLayer((layer: any) => {
          const geoJSON = layer.toGeoJSON()
          const areaSquareMeters = turf.area(geoJSON)
          const areaAcres = areaSquareMeters * 0.000247105

          if (areaAcres < 0.5 || areaAcres > 10000) {
            setValidationError('Invalid area after edit')
            return
          }

          setDrawnPolygon(geoJSON)
          setPolygonArea(areaAcres)
        })
      })

      // Handle polygon deletion
      map.on(L.Draw.Event.DELETED, () => {
        setDrawnPolygon(null)
        setPolygonArea(0)
        setValidationError('')
      })
    }
  }, [mode, mapInitialized])

  // Add CLU boundary layer
  useEffect(() => {
    if (!mapRef.current) return

    if (showCLULayer) {
      // Add CLU WMS layer
      const cluLayer = L.tileLayer.wms('https://gis.apfo.usda.gov/arcgis/services/NAIP/USDA_CONUS_PRIME/ImageServer/WMSServer', {
        layers: 'CLU',
        format: 'image/png',
        transparent: true,
        opacity: 0.5,
      })
      cluLayer.addTo(mapRef.current)

      return () => {
        cluLayer.remove()
      }
    }
  }, [showCLULayer])

  // Add field boundary in analysis mode
  useEffect(() => {
    if (!mapRef.current || !fieldData || mode !== 'analysis') return

    if (fieldData.boundary) {
      const fieldLayer = L.geoJSON(fieldData.boundary, {
        style: {
          color: '#16a34a',
          weight: 3,
          fillColor: '#16a34a',
          fillOpacity: 0.1,
        },
      })
      fieldLayer.addTo(mapRef.current)

      // Fit map to field bounds
      mapRef.current.fitBounds(fieldLayer.getBounds())

      return () => {
        fieldLayer.remove()
      }
    }
  }, [fieldData, mode])

  // Handle search query
  useEffect(() => {
    if (!mapRef.current || !searchQuery || searchQuery.length < 3) return

    // Implement geocoding search
    // For now, just log
    console.log('Searching for:', searchQuery)
  }, [searchQuery])

  // Add soil boundaries layer in analysis mode
  useEffect(() => {
    if (!mapRef.current || mode !== 'analysis') return

    if (activeLayers.includes('soil-boundaries')) {
      // Add SSURGO WMS layer
      const ssurgoLayer = L.tileLayer.wms(
        'https://sdmdataaccess.nrcs.usda.gov/Spatial/SDM.wms',
        {
          layers: 'MapunitPoly',
          format: 'image/png',
          transparent: true,
          opacity: 0.6,
        }
      )
      ssurgoLayer.addTo(mapRef.current)

      return () => {
        ssurgoLayer.remove()
      }
    }
  }, [activeLayers, mode])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Layer Controls for Analysis Mode */}
      {mode === 'analysis' && onLayerToggle && (
        <div 
          className="absolute top-4 right-4 rounded-lg shadow-2xl z-[1000] overflow-hidden"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb' }}
        >
          <div className="px-4 py-3" style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
              <Layers className="w-4 h-4" style={{ color: '#16a34a' }} />
              Map Layers
            </h3>
          </div>
          <div className="p-4 space-y-3">
            <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition-colors">
              <input
                type="checkbox"
                checked={activeLayers.includes('soil-boundaries')}
                onChange={() => onLayerToggle('soil-boundaries')}
                className="w-4 h-4 rounded"
                style={{ accentColor: '#16a34a' }}
              />
              <span className="text-gray-700">Soil Boundaries</span>
            </label>
            <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition-colors">
              <input
                type="checkbox"
                checked={activeLayers.includes('erosion-risk')}
                onChange={() => onLayerToggle('erosion-risk')}
                className="w-4 h-4 rounded"
                style={{ accentColor: '#ea580c' }}
              />
              <span className="text-gray-700">Erosion Risk</span>
            </label>
            <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition-colors">
              <input
                type="checkbox"
                checked={activeLayers.includes('drainage')}
                onChange={() => onLayerToggle('drainage')}
                className="w-4 h-4 rounded"
                style={{ accentColor: '#0891b2' }}
              />
              <span className="text-gray-700">Drainage Classes</span>
            </label>
            <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition-colors">
              <input
                type="checkbox"
                checked={activeLayers.includes('slope')}
                onChange={() => onLayerToggle('slope')}
                className="w-4 h-4 rounded"
                style={{ accentColor: '#d97706' }}
              />
              <span className="text-gray-700">Slope</span>
            </label>
            <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition-colors">
              <input
                type="checkbox"
                checked={activeLayers.includes('management-zones')}
                onChange={() => onLayerToggle('management-zones')}
                className="w-4 h-4 rounded"
                style={{ accentColor: '#7c3aed' }}
              />
              <span className="text-gray-700">Management Zones</span>
            </label>
          </div>
        </div>
      )}

      {/* Drawing Instructions - Hidden because instructions are in the left panel */}
      {/* mode === 'draw' && (
        <div 
          className="absolute top-4 left-4 rounded-lg shadow-2xl max-w-sm z-[1000]"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb' }}
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#f0fdf4' }}>
                <Square className="w-5 h-5" style={{ color: '#16a34a' }} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">Draw Your Field</h3>
                <p className="text-xs text-gray-600">
                  Click the polygon tool above, then click on the map to draw your field boundary. 
                  Double-click to finish.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) */}

      {/* Browse Instructions */}
      {mode === 'browse' && (
        <div 
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 rounded-lg shadow-2xl px-4 py-3 z-[1000]"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb' }}
        >
          <div className="flex items-center gap-2 text-sm">
            <div className="p-1.5 rounded" style={{ backgroundColor: '#f0fdf4' }}>
              <MapPin className="w-4 h-4" style={{ color: '#16a34a' }} />
            </div>
            <span className="text-gray-700 font-medium">Click on a field boundary to select it</span>
          </div>
        </div>
      )}

      {/* Selected Soil Detail */}
      {mode === 'analysis' && selectedSoil && (
        <div 
          className="absolute bottom-4 left-4 right-4 rounded-lg shadow-2xl z-[1000]"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb' }}
        >
          <div className="px-4 py-3" style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <h3 className="font-semibold text-gray-900 text-sm">
              {selectedSoil.mapunit_name}
            </h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600 text-xs">Coverage:</span>
                <div className="font-semibold text-gray-900">{selectedSoil.area} ac ({selectedSoil.percent}%)</div>
              </div>
              <div>
                <span className="text-gray-600 text-xs">LCC:</span>
                <div className="font-semibold text-gray-900">{selectedSoil.lcc}</div>
              </div>
              <div>
                <span className="text-gray-600 text-xs">Slope:</span>
                <div className="font-semibold text-gray-900">{selectedSoil.slope}%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drawn Polygon Info and Confirmation */}
      {mode === 'draw' && drawnPolygon && (
        <div 
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 rounded-lg shadow-2xl z-[1000]"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', border: '1px solid #e5e7eb', minWidth: '400px' }}
        >
          <div className="px-4 py-3" style={{ backgroundColor: '#f0fdf4', borderBottom: '1px solid #bbf7d0' }}>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" style={{ color: '#16a34a' }} />
              <h3 className="font-semibold text-gray-900 text-sm">Field Boundary Drawn</h3>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-gray-600 text-xs">Total Area:</span>
                <div className="text-2xl font-bold" style={{ color: '#16a34a' }}>
                  {polygonArea.toFixed(2)} <span className="text-sm font-normal">acres</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-gray-600 text-xs">Vertices:</span>
                <div className="text-lg font-semibold text-gray-900">
                  {drawnPolygon.geometry.coordinates[0].length - 1}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                if (onFieldSelected) {
                  onFieldSelected({
                    name: 'Custom Drawn Field',
                    area: polygonArea,
                    boundary: drawnPolygon,
                    clu_id: `custom-${Date.now()}`,
                    method: 'drawn',
                  })
                }
              }}
              className="w-full px-4 py-3 rounded-lg font-semibold text-white transition-colors"
              style={{ backgroundColor: '#16a34a' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
            >
              Analyze This Field
            </button>
          </div>
        </div>
      )}

      {/* Validation Error */}
      {mode === 'draw' && validationError && (
        <div 
          className="absolute top-4 right-4 rounded-lg shadow-2xl z-[1000] max-w-sm"
          style={{ backgroundColor: 'rgba(254, 242, 242, 0.98)', border: '1px solid #fecaca' }}
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#dc2626' }} />
              <div>
                <h3 className="font-semibold text-sm mb-1" style={{ color: '#991b1b' }}>
                  Validation Error
                </h3>
                <p className="text-xs" style={{ color: '#991b1b' }}>
                  {validationError}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

FieldMap.displayName = 'FieldMap'

export default FieldMap
