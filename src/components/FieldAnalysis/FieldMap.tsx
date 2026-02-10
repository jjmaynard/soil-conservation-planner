// Field Map Component with CLU boundaries, drawing tools, and layer controls

'use client'

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import 'leaflet-draw'
import * as turf from '@turf/turf'
import { Layers, Square, MapPin, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { geeApi } from '#lib/geeApiClient'
import type { CSBFieldDetails } from '#types/geeApi'
import { wktToGeoJSON } from '#lib/ssurgo-area-query'
import type { ProcessedFieldData } from '#hooks/useFieldSSURGO'

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})

// State FIPS code to name mapping
const STATE_FIPS_TO_NAME: Record<string, string> = {
  '01': 'Alabama', '02': 'Alaska', '04': 'Arizona', '05': 'Arkansas', '06': 'California',
  '08': 'Colorado', '09': 'Connecticut', '10': 'Delaware', '11': 'District of Columbia',
  '12': 'Florida', '13': 'Georgia', '15': 'Hawaii', '16': 'Idaho', '17': 'Illinois',
  '18': 'Indiana', '19': 'Iowa', '20': 'Kansas', '21': 'Kentucky', '22': 'Louisiana',
  '23': 'Maine', '24': 'Maryland', '25': 'Massachusetts', '26': 'Michigan', '27': 'Minnesota',
  '28': 'Mississippi', '29': 'Missouri', '30': 'Montana', '31': 'Nebraska', '32': 'Nevada',
  '33': 'New Hampshire', '34': 'New Jersey', '35': 'New Mexico', '36': 'New York',
  '37': 'North Carolina', '38': 'North Dakota', '39': 'Ohio', '40': 'Oklahoma', '41': 'Oregon',
  '42': 'Pennsylvania', '44': 'Rhode Island', '45': 'South Carolina', '46': 'South Dakota',
  '47': 'Tennessee', '48': 'Texas', '49': 'Utah', '50': 'Vermont', '51': 'Virginia',
  '53': 'Washington', '54': 'West Virginia', '55': 'Wisconsin', '56': 'Wyoming',
  '72': 'Puerto Rico'
}

const LEGEND_DATA: Record<string, { title: string; items: { color: string; label: string }[] }> = {
  'soil-boundaries': {
    title: 'Soil Types',
    items: [
      { color: '#fcd34d', label: 'Sandy Loam' },
      { color: '#fb923c', label: 'Silt Loam' },
      { color: '#a8a29e', label: 'Clay' }
    ]
  },
  'erosion-risk': {
    title: 'Erosion Risk',
    items: [
      { color: '#22c55e', label: 'Low (< 2 t/ac)' },
      { color: '#eab308', label: 'Moderate (2-5 t/ac)' },
      { color: '#ef4444', label: 'High (> 5 t/ac)' }
    ]
  },
  'twi': {
    title: 'Topographic Wetness',
    items: [
      { color: '#14532d', label: 'High (Wet)' },
      { color: '#4ade80', label: 'Moderate' },
      { color: '#ffffff', label: 'Low (Dry)' }
    ]
  },
  'depressions': {
    title: 'Depressions',
    items: [
      { color: '#ef4444', label: 'Depression Area' }
    ]
  },
  'flow-accumulation': {
    title: 'Flow Accumulation',
    items: [
      { color: '#1e40af', label: 'High Flow' },
      { color: '#93c5fd', label: 'Moderate' },
      { color: '#ffffff', label: 'Low' }
    ]
  },
  'flow-channels': {
    title: 'Concentrated Flow',
    items: [
      { color: '#2563eb', label: 'Flow Channels' }
    ]
  },
  'svi': {
    title: 'Soil Vulnerability (SVI)',
    items: [
      { color: '#ef4444', label: 'High Vulnerability' },
      { color: '#eab308', label: 'Moderate' },
      { color: '#22c55e', label: 'Low Vulnerability' }
    ]
  },
  'elevation': {
    title: 'Elevation',
    items: [
      { color: '#57534e', label: 'High' },
      { color: '#d6d3d1', label: 'Low' }
    ]
  },
  'slope': {
    title: 'Slope Percentage',
    items: [
      { color: '#22c55e', label: '0-2% (Flat)' },
      { color: '#eab308', label: '2-5% (Gentle)' },
      { color: '#ef4444', label: '> 5% (Steep)' }
    ]
  },
  'ndvi': {
    title: 'Vegetation Health (NDVI)',
    items: [
      { color: '#15803d', label: 'High (Healthy)' },
      { color: '#eab308', label: 'Moderate' },
      { color: '#ef4444', label: 'Low (Stressed)' }
    ]
  },
  'drought-risk': {
    title: 'Drought Risk',
    items: [
      { color: '#ef4444', label: 'High Risk' },
      { color: '#eab308', label: 'Moderate' },
      { color: '#22c55e', label: 'Low Risk' }
    ]
  },
  'nccpi': {
    title: 'Productivity (NCCPI)',
    items: [
      { color: '#15803d', label: 'High Productivity' },
      { color: '#eab308', label: 'Moderate' },
      { color: '#ef4444', label: 'Low Productivity' }
    ]
  },
  'yield-gap': {
    title: 'Yield Gap (Percent)',
    items: [
        { color: '#ef4444', label: 'High Gap (>20%)' },
        { color: '#eab308', label: 'Moderate Gap (10-20%)' },
        { color: '#22c55e', label: 'Low Gap (<10%)' }
    ]
  },
  'mean-ndvi': {
    title: 'Mean NDVI',
    items: [
        { color: '#15803d', label: 'High Vigor' },
        { color: '#eab308', label: 'Moderate' },
        { color: '#ef4444', label: 'Low Vigor' }
    ]
  },
  'max-ndvi': {
    title: 'Peak Season NDVI',
    items: [
        { color: '#15803d', label: 'High Vigor' },
        { color: '#eab308', label: 'Moderate' },
        { color: '#ef4444', label: 'Low Vigor' }
    ]
  },
  'svi-surface': {
    title: 'SVI Surface Runoff',
    items: [
        { color: '#991b1b', label: 'Very High Risk' },
        { color: '#ea580c', label: 'High Risk' },
        { color: '#fbbf24', label: 'Moderate Risk' },
        { color: '#166534', label: 'Low Risk' }
    ]
  },
  'svi-subsurface-drained': {
    title: 'SVI Subsurface (Drained)',
    items: [
        { color: '#991b1b', label: 'Very High Risk' },
        { color: '#ea580c', label: 'High Risk' },
        { color: '#fbbf24', label: 'Moderate Risk' },
        { color: '#166534', label: 'Low Risk' }
    ]
  },
  'svi-subsurface-undrained': {
    title: 'SVI Subsurface (Undrained)',
    items: [
        { color: '#991b1b', label: 'Very High Risk' },
        { color: '#ea580c', label: 'High Risk' },
        { color: '#fbbf24', label: 'Moderate Risk' },
        { color: '#166534', label: 'Low Risk' }
    ]
  }
}

const getStateName = (fipsCode: string): string => {
  if (!fipsCode) return 'N/A'
  return STATE_FIPS_TO_NAME[fipsCode] || fipsCode
}

// Format pattern type for display
const formatPatternType = (pattern: string | undefined): string => {
  if (!pattern) return 'N/A'
  // Convert snake_case to readable format
  // e.g., "two_crop_rotation" -> "2-Crop Rotation"
  //       "monoculture" -> "Monoculture"
  //       "diverse_rotation" -> "Diverse Rotation"
  return pattern
    .replace('two_crop', '2-crop')
    .replace('three_crop', '3-crop')
    .replace('four_crop', '4-crop')
    .replace('_', ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

interface FieldMapProps {
  mode: 'search' | 'browse' | 'draw' | 'upload' | 'analysis'
  searchQuery?: string
  fieldData?: any
  geeData?: any
  ssurgoData?: ProcessedFieldData | null
  selectedSoil?: any
  activeLayers?: string[]
  layerOptions?: { id: string; label: string }[]
  showCLULayer?: boolean
  showCSBLayer?: boolean
  onFieldSelected?: (field: any) => void
  onLayerToggle?: (layerId: string) => void
  onCSBLayerToggle?: () => void
  onMapReady?: (controls: { panToLocation: (lat: number, lng: number, zoom?: number) => void }) => void
}

export interface FieldMapRef {
  panToLocation: (lat: number, lng: number, zoom?: number) => void
}

const FieldMap = forwardRef<FieldMapRef, FieldMapProps>(({
  mode,
  searchQuery,
  fieldData,
  geeData,
  ssurgoData,
  selectedSoil,
  activeLayers = [],
  layerOptions = [],
  showCLULayer = false,
  showCSBLayer = true,
  onFieldSelected,
  onLayerToggle,
  onCSBLayerToggle,
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
  const [selectedCSBField, setSelectedCSBField] = useState<CSBFieldDetails | null>(null)
  const [isSelectingField, setIsSelectingField] = useState(false)
  const [showCSBTileLayer, setShowCSBTileLayer] = useState(true) // Separate control for tile layer
  const [isEditingBoundary, setIsEditingBoundary] = useState(false)
  const csbLayerRef = useRef<L.TileLayer | null>(null)
  const csbGeoJsonLayerRef = useRef<L.GeoJSON | null>(null) // Interactive GeoJSON layer
  const selectedFieldLayerRef = useRef<L.Polygon | null>(null) // Selected field as editable polygon
  const fieldBoundaryLayerRef = useRef<L.GeoJSON | null>(null) // For analysis mode field boundary
  const editableFieldGroupRef = useRef<L.FeatureGroup | null>(null)
  const editControlRef = useRef<L.Control.Draw | null>(null)
  const [layerPanelCollapsed, setLayerPanelCollapsed] = useState(false)
  const [isInEditMode, setIsInEditMode] = useState(false)
  const mapClickHandlerRef = useRef<((e: L.LeafletMouseEvent) => void) | null>(null)
  const vertexMarkersRef = useRef<L.CircleMarker[]>([]) // Store vertex markers
  const [customFieldName, setCustomFieldName] = useState<string>('') // Custom field name input
  const [opacity, setOpacity] = useState(0.7)
  const [isLegendOpen, setIsLegendOpen] = useState(true)
  const overlayLayersRef = useRef<any[]>([])

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

    // Create custom pane for selected field with higher z-index
    map.createPane('selectedFieldPane')
    map.getPane('selectedFieldPane')!.style.zIndex = '650' // Higher than overlayPane (400)

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

    // Clear validation error when mode changes
    setValidationError('')

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

    // Initialize editable feature group for browse mode field boundary editing
    if (mode === 'browse') {
      if (!editableFieldGroupRef.current) {
        const editableGroup = new L.FeatureGroup()
        map.addLayer(editableGroup)
        editableFieldGroupRef.current = editableGroup
        console.log('✅ Editable feature group created')
      }

      // Create edit control for browse mode if not already present
      if (!editControlRef.current) {
        const editControl = new L.Control.Draw({
          position: 'topright',
          draw: {
            polygon: false,
            polyline: false,
            rectangle: false,
            circle: false,
            marker: false,
            circlemarker: false
          },
          edit: {
            featureGroup: editableFieldGroupRef.current,
            edit: {
              selectedPathOptions: {
                opacity: 0.8,
                dashArray: '10, 10',
                fill: true,
                fillOpacity: 0.3
              }
            },
            remove: false // Disable delete
          }
        })

        map.addControl(editControl)
        editControlRef.current = editControl
        console.log('✅ EDIT CONTROL ADDED to map - pencil icon should appear when field is selected')
        console.log('💡 TIP: When editing, drag WHITE CIRCLES to move vertices, drag SMALL SQUARES between vertices to add new vertices')
      }

      // Listen for edit mode start/stop to disable field selection clicks
      map.on('draw:editstart', () => {
        setIsInEditMode(true)
        // Hide custom vertex markers - Leaflet.Draw shows its own handles
        vertexMarkersRef.current.forEach(marker => marker.remove())
        console.log('🔧 Edit mode started - drag handles to move vertices, drag midpoint handles to add new vertices')
      })

      map.on('draw:editstop', () => {
        setIsInEditMode(false)
        // Re-create vertex markers based on current polygon state
        if (selectedFieldLayerRef.current) {
          const polygon = selectedFieldLayerRef.current as L.Polygon
          const latlngs = polygon.getLatLngs()[0] as L.LatLng[]
          
          vertexMarkersRef.current.forEach(marker => marker.remove())
          vertexMarkersRef.current = []
          
          latlngs.forEach((latlng: L.LatLng) => {
            const vertexMarker = L.circleMarker(latlng, {
              radius: 5,
              fillColor: '#ffffff',
              color: '#3b82f6',
              weight: 2,
              fillOpacity: 1,
              opacity: 1,
            })
            vertexMarker.addTo(map)
            vertexMarkersRef.current.push(vertexMarker)
          })
          console.log(`✅ Updated ${latlngs.length} vertex markers`)
        }
        console.log('✓ Edit mode stopped - field selection re-enabled')
      })

      // Handle field boundary edits
      map.on(L.Draw.Event.EDITED, (e: any) => {
        const layers = e.layers
        layers.eachLayer((layer: any) => {
          const latlngs = layer.getLatLngs()[0]
          
          // Convert to GeoJSON
          const coordinates = latlngs.map((latlng: L.LatLng) => [latlng.lng, latlng.lat])
          coordinates.push(coordinates[0]) // Close the polygon
          
          const geoJSON = {
            type: 'Polygon' as const,
            coordinates: [coordinates]
          }
          
          // Wrap in Feature for turf.area
          const feature = {
            type: 'Feature' as const,
            geometry: geoJSON,
            properties: {}
          }
          
          const areaSquareMeters = turf.area(feature)
          const areaAcres = areaSquareMeters * 0.000247105

          console.log('Field boundary edited. New area:', areaAcres, 'acres')
          
          // Update selected CSB field with new boundary
          if (selectedCSBField) {
            const updatedField = {
              ...selectedCSBField,
              geometry: geoJSON,
              acres: areaAcres
            }
            setSelectedCSBField(updatedField)
            
            // Notify parent component of the updated field
            if (onFieldSelected) {
              onFieldSelected(updatedField)
            }
            
            console.log('✅ Field boundary updated. New area:', areaAcres.toFixed(2), 'acres')
            console.log('✅ Click "Analyze Field" to run analysis with new boundary.')
          }

          // Update vertex markers to reflect new vertex positions
          vertexMarkersRef.current.forEach(marker => marker.remove())
          vertexMarkersRef.current = []
          
          latlngs.forEach((latlng: L.LatLng) => {
            const vertexMarker = L.circleMarker(latlng, {
              radius: 5,
              fillColor: '#ffffff',
              color: '#3b82f6',
              weight: 2,
              fillOpacity: 1,
              opacity: 1,
            })
            if (mapRef.current) {
              vertexMarker.addTo(mapRef.current)
              vertexMarkersRef.current.push(vertexMarker)
            }
          })
          console.log(`✅ Updated ${latlngs.length} vertex markers`)
        })
      })
    }

    // Cleanup when leaving browse mode
    return () => {
      if (mode !== 'browse' && editControlRef.current && mapRef.current) {
        mapRef.current.removeControl(editControlRef.current)
        editControlRef.current = null
      }
    }
  }, [mode, mapInitialized])

  // Add CSB/CLU field boundary visualization - Hybrid approach
  // Tile layer for efficient visualization + GeoJSON for interactivity
  useEffect(() => {
    if (!mapRef.current || !mapInitialized) return
    if (mode !== 'browse') return // Only show CSB layer in browse/selection mode

    const map = mapRef.current
    let updateTimeout: NodeJS.Timeout

    const loadCSBTileLayer = async () => {
      try {
        console.log('[CSB] Loading CSB tile service...')
        
        // Get tile URL from backend
        const tileResponse = await geeApi.getCSBTileURL({
          opacity: 0.7,
          min_complexity: 1,
          max_complexity: 4
        })

        // Remove existing tile layer if any
        if (csbLayerRef.current) {
          map.removeLayer(csbLayerRef.current)
        }

        // Add CSB tile layer (non-interactive background)
        const csbTileLayer = L.tileLayer(tileResponse.tile_url, {
          attribution: 'USDA CSB - Crop Rotation Complexity',
          opacity: 0.7,
          minZoom: 10, // Show tiles at zoom 10+
          maxZoom: 20
        })

        csbTileLayer.addTo(map)
        csbLayerRef.current = csbTileLayer

        console.log('[CSB] CSB tile layer loaded successfully')
      } catch (error) {
        console.error('[CSB] Error loading CSB tile layer:', error)
      }
    }

    // Load interactive GeoJSON layer at high zoom for hover/click
    const updateInteractiveLayer = async () => {
      try {
        const zoom = map.getZoom()
        
        // Only load GeoJSON boundaries at zoom 13+ for performance
        if (zoom < 13) {
          if (csbGeoJsonLayerRef.current) {
            map.removeLayer(csbGeoJsonLayerRef.current)
            csbGeoJsonLayerRef.current = null
          }
          console.log('[CSB] Zoom too low for interactive layer (need zoom ≥13)')
          return
        }

        // Dynamic limit based on zoom level to prevent huge payloads at low zoom
        let limit = 500  // Default for zoom 10-12
        if (zoom >= 15) {
          limit = 2000  // High detail at close zoom
        } else if (zoom >= 13) {
          limit = 1000  // Medium detail
        }

        const bounds = map.getBounds()
        console.log(`[CSB] Fetching interactive field boundaries (zoom ${zoom}, limit ${limit})...`)
        
        const response = await geeApi.getCSBBounds({
          minLon: bounds.getWest(),
          minLat: bounds.getSouth(),
          maxLon: bounds.getEast(),
          maxLat: bounds.getNorth(),
          limit: limit  // Dynamic limit based on zoom
        })

        // Remove old GeoJSON layer only after new data is ready
        if (csbGeoJsonLayerRef.current) {
          map.removeLayer(csbGeoJsonLayerRef.current)
        }

        // Create new GeoJSON layer with hover tooltips and visible boundaries
        const geoJsonLayer = L.geoJSON(response, {
          style: {
            color: '#FF6B35', // Orange boundary lines
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0 // Transparent fill (tiles show rotation colors)
          },
          onEachFeature: (feature, layer) => {
            if (feature.properties) {
              const props = feature.properties as any
              const acres = props.acres || props.CSBACRES || props.ACRES
              const fieldId = props.clu_id || props.CSBID || props.CLU_ID || feature.id
              const complexity = props.rotation_complexity || props.ROTATION_COMPLEXITY || 'N/A'
              
              layer.bindTooltip(
                `<strong>Field ID:</strong> ${fieldId || 'Unknown'}<br/>` +
                `<strong>Acres:</strong> ${acres ? acres.toFixed(2) : 'N/A'}<br/>` +
                `<strong>Rotation:</strong> ${complexity === 1 ? 'Monoculture' : 
                  complexity === 2 ? '2-crop rotation' : 
                  complexity === 3 ? '3-crop rotation' : 
                  complexity >= 4 ? 'Diverse (4+ crops)' : 'N/A'}`,
                { sticky: true }
              )

              // Add hover effects
              layer.on({
                mouseover: (e) => {
                  const target = e.target
                  target.setStyle({
                    color: '#16a34a', // Green on hover
                    weight: 3,
                    opacity: 1,
                    fillOpacity: 0.2,
                    fillColor: '#16a34a'
                  })
                  target.bringToFront()
                },
                mouseout: (e) => {
                  const target = e.target
                  target.setStyle({
                    color: '#FF6B35', // Back to orange
                    weight: 2,
                    opacity: 0.8,
                    fillOpacity: 0
                  })
                }
              })
            }
          }
        }).addTo(map)

        csbGeoJsonLayerRef.current = geoJsonLayer
        console.log(`[CSB] Loaded ${response.features.length} interactive field boundaries`)
      } catch (error) {
        console.error('[CSB] Error loading interactive layer:', error)
      }
    }

    if (showCSBLayer) {
      console.log('[CSB] Adding CSB layers (tile + interactive)')
      loadCSBTileLayer()

      // Update interactive layer on zoom/pan
      const handleMapChange = () => {
        clearTimeout(updateTimeout)
        updateTimeout = setTimeout(updateInteractiveLayer, 500)
      }

      map.on('moveend', handleMapChange)
      map.on('zoomend', handleMapChange)

      // Initial load
      updateInteractiveLayer()

      // Add click handler for field selection in browse mode
      const handleMapClick = async (e: L.LeafletMouseEvent) => {
        if (mode !== 'browse' || isInEditMode) {
          // Don't select fields while in edit mode
          return
        }

        setIsSelectingField(true)
        setValidationError('')

        try {
          const field = await geeApi.queryFieldAtPoint(e.latlng.lat, e.latlng.lng)
          
          if (field) {
            console.log('[CSB] Selected field data:', field)
            setSelectedCSBField(field)
            
            // Remove previous selection layer and vertex markers
            if (selectedFieldLayerRef.current) {
              if (editableFieldGroupRef.current) {
                editableFieldGroupRef.current.clearLayers()
              }
              map.removeLayer(selectedFieldLayerRef.current)
            }
            vertexMarkersRef.current.forEach(marker => marker.remove())
            vertexMarkersRef.current = []

            // Convert GeoJSON to Leaflet polygon for editing
            const coords = (field.geometry as any).coordinates[0]
            const latlngs = coords.map((coord: number[]) => [coord[1], coord[0]])
            
            // Create editable polygon with solid outline
            const editablePolygon = L.polygon(latlngs, {
              color: '#3b82f6',
              weight: 3,
              fillColor: '#3b82f6',
              fillOpacity: 0.15,
            })

            // Add to editable feature group FIRST
            if (editableFieldGroupRef.current) {
              editableFieldGroupRef.current.addLayer(editablePolygon)
              console.log('✅ Selected field added to editable group as Leaflet polygon')
              console.log('✅ Editable layers in group:', editableFieldGroupRef.current.getLayers().length)
              
              // Ensure edit control is visible
              if (editControlRef.current && mapRef.current) {
                console.log('✅ Edit control exists and should show EDIT LAYERS button')
              } else {
                console.warn('⚠️ Edit control not found - may need to refresh')
              }
              
              console.log('✅ Click EDIT LAYERS (pencil icon) in top-right')
              console.log('💡 Edit handles should appear as small circles at each vertex when editing')
            }
            
            selectedFieldLayerRef.current = editablePolygon

            // Clear previous vertex markers
            vertexMarkersRef.current.forEach(marker => marker.remove())
            vertexMarkersRef.current = []

            // Add vertex markers to show individual vertices (will be hidden during edit mode)
            latlngs.forEach((latlng: [number, number]) => {
              const vertexMarker = L.circleMarker(latlng, {
                radius: 5,
                fillColor: '#ffffff',
                color: '#3b82f6',
                weight: 2,
                fillOpacity: 1,
                opacity: 1,
                interactive: false, // Don't interfere with Leaflet.Draw's handles
              })
              vertexMarker.addTo(map)
              vertexMarkersRef.current.push(vertexMarker)
            })
            console.log(`✅ Showing ${latlngs.length} vertices. Click pencil icon to edit - drag handles to move, drag midpoints to add vertices`)
            
            // Prevent clicks on selected field from selecting adjacent fields
            // BUT ONLY when NOT in edit mode
            editablePolygon.on('click', (e: L.LeafletMouseEvent) => {
              if (!isInEditMode) {
                L.DomEvent.stopPropagation(e)
                console.log('Click on selected field - ignoring (already selected)')
              }
            })

            // Fit map to field bounds, then zoom out by 1 level
            map.fitBounds(editablePolygon.getBounds(), { padding: [50, 50] })
            setTimeout(() => {
              const currentZoom = map.getZoom()
              map.setZoom(currentZoom - 1)
            }, 100)
          } else {
            setValidationError('No field found at this location. Try clicking inside a field boundary.')
          }
        } catch (error) {
          console.error('Error selecting field:', error)
          setValidationError('Failed to select field. Please try again.')
        } finally {
          setIsSelectingField(false)
        }
      }

      if (mode === 'browse') {
        map.on('click', handleMapClick)
        mapClickHandlerRef.current = handleMapClick
      }

      return () => {
        clearTimeout(updateTimeout)
        map.off('moveend', handleMapChange)
        map.off('zoomend', handleMapChange)
        if (mode === 'browse' && mapClickHandlerRef.current) {
          map.off('click', mapClickHandlerRef.current)
        }
        // Don't remove tile layer here - it's controlled by showCSBTileLayer
        if (csbGeoJsonLayerRef.current) {
          map.removeLayer(csbGeoJsonLayerRef.current)
          csbGeoJsonLayerRef.current = null
        }
        // Don't remove selected field layer - it should persist independently of CSB layer toggle
      }
    } else {
      // Remove GeoJSON boundaries if toggled off, but keep tile layer and selected field
      if (csbGeoJsonLayerRef.current) {
        map.removeLayer(csbGeoJsonLayerRef.current)
        csbGeoJsonLayerRef.current = null
      }
      // Don't remove selected field layer - it should persist independently of CSB layer toggle
    }
  }, [showCSBLayer, mapInitialized, mode])

  // Legacy CLU WMS layer (kept for backwards compatibility)
  useEffect(() => {
    if (!mapRef.current || !mapInitialized) return

    if (showCLULayer && !showCSBLayer) {
      // Add old CLU WMS layer only if CSB layer is off
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
  }, [showCLULayer, showCSBLayer, mapInitialized])

  // Add field boundary in analysis mode
  useEffect(() => {
    if (!mapRef.current || !fieldData || mode !== 'analysis' || !mapInitialized) return

    // Wait a tick to ensure editable group is initialized
    const timer = setTimeout(() => {
      // Remove existing layer if present (cleanup before potential re-add)
      if (fieldBoundaryLayerRef.current) {
        if (editableFieldGroupRef.current) {
          editableFieldGroupRef.current.removeLayer(fieldBoundaryLayerRef.current)
        } else {
          mapRef.current?.removeLayer(fieldBoundaryLayerRef.current)
        }
        fieldBoundaryLayerRef.current = null
      }

      // If toggled off, stop here
      if (!showCSBLayer) return

      if (!mapRef.current || !fieldData.boundary) return

      // Use edited geometry if available (from selectedCSBField), otherwise use original fieldData.boundary
      const boundaryToUse = selectedCSBField?.geometry || fieldData.boundary

      const fieldLayer = L.geoJSON(boundaryToUse, {
        style: {
          color: '#16a34a',
          weight: 3,
          fillColor: '#16a34a',
          fillOpacity: 0.1,
        },
      })
      
      // Add to editable feature group to enable editing
      if (editableFieldGroupRef.current) {
        // Important: Each individual layer in the GeoJSON needs to be added
        fieldLayer.eachLayer((layer) => {
          editableFieldGroupRef.current!.addLayer(layer)
        })
        console.log('✓ Field boundary added to editable group')
        console.log('✓ Number of editable layers:', editableFieldGroupRef.current.getLayers().length)
        console.log('✓ Look for EDIT LAYERS button (pencil icon) in top right of map')
      } else {
        console.warn('⚠ Editable group not ready yet, adding field directly to map')
        fieldLayer.addTo(mapRef.current)
      }
      
      fieldBoundaryLayerRef.current = fieldLayer

      // Fit map to field bounds on initial load
      if (mapRef.current) {
        mapRef.current.fitBounds(fieldLayer.getBounds())
      }
    }, 100)

    return () => {
      clearTimeout(timer)
      if (fieldBoundaryLayerRef.current) {
        if (editableFieldGroupRef.current) {
          editableFieldGroupRef.current.removeLayer(fieldBoundaryLayerRef.current)
        }
        fieldBoundaryLayerRef.current.remove()
        fieldBoundaryLayerRef.current = null
      }
    }
  }, [fieldData, mode, mapInitialized, selectedCSBField, showCSBLayer])

  // Handle search query
  useEffect(() => {
    if (!mapRef.current || !searchQuery || searchQuery.length < 3) return

    // Implement geocoding search
    // For now, just log
    console.log('Searching for:', searchQuery)
  }, [searchQuery])

  // Add layers in analysis mode
  useEffect(() => {
    if (!mapRef.current || mode !== 'analysis') return

    const layers: L.Layer[] = []
    overlayLayersRef.current = []

    // Soil Boundaries (SSURGO) - Colored Polygons + WMS
    if (activeLayers.includes('soil-boundaries')) {
      // 1. Add WMS for labels and sharp outlines
      const ssurgoLayer = L.tileLayer.wms(
        'https://sdmdataaccess.nrcs.usda.gov/Spatial/SDM.wms',
        {
          layers: 'MapunitPoly',
          format: 'image/png',
          transparent: true,
          opacity: opacity, // Use slider opacity
        }
      )
      ssurgoLayer.addTo(mapRef.current)
      layers.push(ssurgoLayer)
      overlayLayersRef.current.push(ssurgoLayer as L.TileLayer)

      // 2. Add Colored Polygons if available
      if (ssurgoData?.mapUnitPolygons && ssurgoData.mapUnitPolygons.length > 0) {
         // Create a map of musym -> color based on dominant component
         const soilColorMap = new Map<string, string>();
         
         // 1. Map Component Name -> Color (from processed soils list)
         const compNameToColor = new Map<string, string>();
         ssurgoData.soils.forEach(s => compNameToColor.set(s.mapunit_name, s.color));

         // 2. Map MapUnit Symbol (musym) -> Dominant Component Color
         if (ssurgoData.rawData) {
           ssurgoData.rawData.forEach(mu => {
             if (mu.components && mu.components.length > 0) {
                // Find dominant component (highest percentage)
                const dominant = mu.components.reduce((prev, current) => 
                   (prev.comppct_r > current.comppct_r) ? prev : current
                );
                
                // Get color for this component
                if (dominant) {
                   const color = compNameToColor.get(dominant.compname);
                   // Fallback: try to find any matching soil entry by ID if name fails
                   if (color) {
                       soilColorMap.set(mu.musym, color);
                   }
                }
             }
           });
         }

         const features = ssurgoData.mapUnitPolygons.map(poly => {
            const geojson = wktToGeoJSON(poly.geom);
            if (geojson) {
                const color = soilColorMap.get(poly.musym) || '#cccccc'; 
                return {
                    type: 'Feature',
                    properties: { ...poly, color: color },
                    geometry: geojson
                }
            }
            return null;
         }).filter(Boolean);

         if (features.length > 0) {
             const geoJsonLayer = L.geoJSON(features as any, {
                 style: (feature) => ({
                     fillColor: feature?.properties.color,
                     weight: 1,
                     opacity: opacity,
                     color: 'white',
                     fillOpacity: opacity * 0.6 // Slightly more transparent fill
                 }),
                 onEachFeature: (feature, layer) => {
                     layer.bindPopup(`
                        <div class="p-2">
                          <strong>${feature.properties.muname}</strong><br/>
                          Symbol: ${feature.properties.musym}<br/>
                          Area: ${feature.properties.area_ac ? Number(feature.properties.area_ac).toFixed(1) + ' ac' : 'N/A'}
                        </div>
                     `);
                 }
             });
             geoJsonLayer.addTo(mapRef.current);
             layers.push(geoJsonLayer);
             // We can't push to overlayLayersRef easily because it expects TileLayer type for setOpacity? 
             // Actually I implemented setOpacity loop using any or specific type?
             // Let's check overlayLayersRef type. It is L.TileLayer[]. 
             // I should update it to L.Layer[].
             
             // Cast to any to store in ref for opacity control (GeoJSON has setStyle for opacity, differs from TileLayer setOpacity)
             (geoJsonLayer as any).setOpacity = (op: number) => {
                 geoJsonLayer.setStyle({ opacity: op, fillOpacity: op * 0.6 });
             };
             overlayLayersRef.current.push(geoJsonLayer as any);
         }
      }
    }

    const assessment = geeData?.geeAssessment

    // Erosion Risk (GEE)
    if (activeLayers.includes('erosion-risk') && assessment?.erosion_risk?.visualization?.tile_url) {
      const tileUrl = assessment.erosion_risk.visualization.tile_url
      const erosionLayer = L.tileLayer(tileUrl, { opacity: opacity, attribution: 'Google Earth Engine' })
      erosionLayer.addTo(mapRef.current)
      layers.push(erosionLayer)
      overlayLayersRef.current.push(erosionLayer)
    }

    // TWI (GEE)
    if (activeLayers.includes('twi') && assessment?.ponding?.visualization?.twi_tile_url) {
      const tileUrl = assessment.ponding.visualization.twi_tile_url
      const layer = L.tileLayer(tileUrl, { opacity: opacity, attribution: 'Google Earth Engine - TWI' })
      layer.addTo(mapRef.current)
      layers.push(layer)
      overlayLayersRef.current.push(layer)
    }

    // Depressions (GEE)
    if (activeLayers.includes('depressions') && assessment?.ponding?.visualization?.depressions_tile_url) {
      const tileUrl = assessment.ponding.visualization.depressions_tile_url
      const layer = L.tileLayer(tileUrl, { opacity: opacity, attribution: 'Google Earth Engine - Depressions' })
      layer.addTo(mapRef.current)
      layers.push(layer)
      overlayLayersRef.current.push(layer)
    }

    // Flow Channels / SPI (GEE)
    if (activeLayers.includes('flow-channels') && assessment?.concentrated_flow?.visualization?.spi_tile_url) {
      const tileUrl = assessment.concentrated_flow.visualization.spi_tile_url
      const layer = L.tileLayer(tileUrl, { opacity: opacity, attribution: 'Google Earth Engine - Flow' })
      layer.addTo(mapRef.current)
      layers.push(layer)
      overlayLayersRef.current.push(layer)
    }

    // NDVI / Vegetation (GEE)
    if (activeLayers.includes('ndvi') && assessment?.productivity?.visualization?.mean_ndvi_tile_url) {
      const tileUrl = assessment.productivity.visualization.mean_ndvi_tile_url
      const layer = L.tileLayer(tileUrl, { opacity: opacity, attribution: 'Google Earth Engine - NDVI' })
      layer.addTo(mapRef.current)
      layers.push(layer)
      overlayLayersRef.current.push(layer)
    }

    // Productivity: Yield Gap (GEE)
    if (activeLayers.includes('yield-gap') && assessment?.productivity?.visualization?.yield_gap_tile_url) {
      const tileUrl = assessment.productivity.visualization.yield_gap_tile_url
      const layer = L.tileLayer(tileUrl, { opacity: opacity, attribution: 'Google Earth Engine - Yield Gap' })
      layer.addTo(mapRef.current)
      layers.push(layer)
      overlayLayersRef.current.push(layer)
    }

    // Productivity: Mean NDVI (GEE)
    if (activeLayers.includes('mean-ndvi') && assessment?.productivity?.visualization?.mean_ndvi_tile_url) {
      const tileUrl = assessment.productivity.visualization.mean_ndvi_tile_url
      const layer = L.tileLayer(tileUrl, { opacity: opacity, attribution: 'Google Earth Engine - Mean NDVI' })
      layer.addTo(mapRef.current)
      layers.push(layer)
      overlayLayersRef.current.push(layer)
    }

    // Productivity: Max NDVI (GEE)
    if (activeLayers.includes('max-ndvi') && assessment?.productivity?.visualization?.max_ndvi_tile_url) {
      const tileUrl = assessment.productivity.visualization.max_ndvi_tile_url
      const layer = L.tileLayer(tileUrl, { opacity: opacity, attribution: 'Google Earth Engine - Max NDVI' })
      layer.addTo(mapRef.current)
      layers.push(layer)
      overlayLayersRef.current.push(layer)
    }

    // Drought / Water Balance (GEE)
    if (activeLayers.includes('drought-risk') && assessment?.drought?.visualization?.water_balance_tile_url) {
      const tileUrl = assessment.drought.visualization.water_balance_tile_url
      const layer = L.tileLayer(tileUrl, { opacity: opacity, attribution: 'Google Earth Engine - Drought' })
      layer.addTo(mapRef.current)
      layers.push(layer)
      overlayLayersRef.current.push(layer)
    }

    // SVI: Surface Runoff (GEE)
    if (activeLayers.includes('svi-surface') && assessment?.svi?.visualization?.surface_tile_url) {
      const tileUrl = assessment.svi.visualization.surface_tile_url
      const layer = L.tileLayer(tileUrl, { opacity: opacity, attribution: 'Google Earth Engine - SVI Surface' })
      layer.addTo(mapRef.current)
      layers.push(layer)
      overlayLayersRef.current.push(layer)
    }

    // SVI: Subsurface Drained (GEE)
    if (activeLayers.includes('svi-subsurface-drained') && assessment?.svi?.visualization?.subsurface_drained_tile_url) {
      const tileUrl = assessment.svi.visualization.subsurface_drained_tile_url
      const layer = L.tileLayer(tileUrl, { opacity: opacity, attribution: 'Google Earth Engine - SVI SubSrfc Drained' })
      layer.addTo(mapRef.current)
      layers.push(layer)
      overlayLayersRef.current.push(layer)
    }

    // SVI: Subsurface Undrained (GEE)
    if (activeLayers.includes('svi-subsurface-undrained') && assessment?.svi?.visualization?.subsurface_undrained_tile_url) {
      const tileUrl = assessment.svi.visualization.subsurface_undrained_tile_url
      const layer = L.tileLayer(tileUrl, { opacity: opacity, attribution: 'Google Earth Engine - SVI SubSrfc Undrained' })
      layer.addTo(mapRef.current)
      layers.push(layer)
      overlayLayersRef.current.push(layer)
    }

    return () => {
      layers.forEach(layer => layer.remove())
      overlayLayersRef.current = [] 
    }
  }, [activeLayers, mode, geeData]) // Intentionally omit opacity to prevent reload

  // Update opacity separately
  useEffect(() => {
    overlayLayersRef.current.forEach(layer => {
      layer.setOpacity(opacity)
    })
  }, [opacity])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Dynamic Legend (Bottom Right) */}
      {mode === 'analysis' && activeLayers.some(id => LEGEND_DATA[id]) && (
        <div className="absolute bottom-24 right-3 bg-white/95 backdrop-blur-sm shadow-xl z-[1000] max-w-[220px] border border-gray-100 rounded-lg overflow-hidden transition-all duration-300">
          <div 
            className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setIsLegendOpen(!isLegendOpen)}
          >
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Map Legend</h3>
            {isLegendOpen ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronUp className="w-4 h-4 text-gray-500" />}
          </div>

          {isLegendOpen && (
            <div className="p-3">
              <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {activeLayers.map(id => LEGEND_DATA[id] && (
                  <div key={id} className="last:mb-0">
                      <h4 className="text-xs font-bold text-gray-800 mb-2 pb-1 border-b border-gray-100">{LEGEND_DATA[id].title}</h4>
                      <div className="space-y-1.5">
                        {LEGEND_DATA[id].items.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full shadow-sm flex-shrink-0" style={{ backgroundColor: item.color, border: '1px solid rgba(0,0,0,0.1)' }}></span>
                            <span className="text-xs text-gray-600 font-medium leading-tight">{item.label}</span>
                          </div>
                        ))}
                      </div>
                  </div>
                ))}
              </div>

              {/* Opacity Slider */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-600 font-medium">Layer Opacity</label>
                  <span className="text-xs font-bold text-green-600">{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Layer Controls for Browse Mode */}
      {mode === 'browse' && onCSBLayerToggle && (
        <div 
          className="absolute top-4 rounded-lg shadow-2xl z-[1000] overflow-hidden transition-all duration-300"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            border: '1px solid #e5e7eb',
            right: layerPanelCollapsed ? '74px' : '74px',
            width: layerPanelCollapsed ? '40px' : '240px'
          }}
        >
          {layerPanelCollapsed ? (
            <button
              onClick={() => setLayerPanelCollapsed(false)}
              className="p-3 hover:bg-gray-50 transition-colors w-full"
              title="Expand Layers"
            >
              <Layers className="w-4 h-4 mx-auto" style={{ color: '#16a34a' }} />
            </button>
          ) : (
            <>
              <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                  <Layers className="w-4 h-4" style={{ color: '#16a34a' }} />
                  Map Layers
                </h3>
                <button
                  onClick={() => setLayerPanelCollapsed(true)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Collapse"
                >
                  <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 space-y-3">
            <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition-colors">
              <input
                type="checkbox"
                checked={showCSBLayer}
                onChange={onCSBLayerToggle}
                className="w-4 h-4 rounded"
                style={{ accentColor: '#3b82f6' }}
              />
              <span className="text-gray-700">Field Boundaries (CSB)</span>
            </label>
            <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition-colors">
              <input
                type="checkbox"
                checked={showCSBTileLayer}
                onChange={(e) => {
                  const checked = e.target.checked
                  setShowCSBTileLayer(checked)
                  // Toggle tile layer visibility
                  if (csbLayerRef.current && mapRef.current) {
                    if (checked) {
                      mapRef.current.addLayer(csbLayerRef.current)
                    } else {
                      mapRef.current.removeLayer(csbLayerRef.current)
                    }
                  }
                }}
                className="w-4 h-4 rounded"
                style={{ accentColor: '#3b82f6' }}
              />
              <span className="text-gray-700">Rotation History</span>
            </label>
          </div>

          {/* Crop Rotation Complexity Legend */}
          <div style={{ borderTop: '1px solid #e5e7eb' }}>
            <div className="px-4 py-3" style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <h3 className="font-semibold text-gray-900 text-xs">
                Crop Rotation Complexity
              </h3>
            </div>
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                <span className="text-gray-700">Monoculture (1 crop)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f97316' }}></div>
                <span className="text-gray-700">2-crop rotation</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }}></div>
                <span className="text-gray-700">3-crop rotation</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
                <span className="text-gray-700">Diverse (4+ crops)</span>
              </div>
              <div className="pt-2 mt-2 text-xs text-gray-500 border-t border-gray-200">
                Zoom in (13+) for field details
              </div>
            </div>
          </div>
            </>
          )}
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
      {mode === 'browse' && !selectedCSBField && (
        <div 
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 rounded-lg shadow-2xl px-4 py-3 z-[1000]"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb' }}
        >
          <div className="flex items-center gap-2 text-sm">
            <div className="p-1.5 rounded" style={{ backgroundColor: '#f0fdf4' }}>
              <MapPin className="w-4 h-4" style={{ color: '#16a34a' }} />
            </div>
            <span className="text-gray-700 font-medium">
              {isSelectingField ? 'Loading field...' : 'Click on a field boundary to select it'}
            </span>
          </div>
        </div>
      )}

      {/* CSB Field Selection Confirmation */}
      {mode === 'browse' && selectedCSBField && (
        <div 
          className="absolute top-4 left-4 rounded-lg shadow-2xl z-[1000]"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', border: '1px solid #e5e7eb', minWidth: '400px', maxWidth: '450px' }}
        >
          <div className="px-4 py-3" style={{ backgroundColor: '#f0fdf4', borderBottom: '1px solid #bbf7d0' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" style={{ color: '#16a34a' }} />
                <h3 className="font-semibold text-gray-900 text-sm">Field Selected</h3>
              </div>
              <button
                onClick={() => {
                  setSelectedCSBField(null)
                  setCustomFieldName('') // Clear custom field name
                  if (selectedFieldLayerRef.current && mapRef.current) {
                    mapRef.current.removeLayer(selectedFieldLayerRef.current)
                    selectedFieldLayerRef.current = null
                  }
                  // Clear editable feature group
                  if (editableFieldGroupRef.current) {
                    editableFieldGroupRef.current.clearLayers()
                  }
                  // Clear vertex markers
                  vertexMarkersRef.current.forEach(marker => marker.remove())
                  vertexMarkersRef.current = []
                }}
                className="text-gray-500 hover:text-gray-700 text-xs font-medium"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-gray-600 text-xs">CLU ID:</span>
                <div className="font-semibold text-gray-900 text-sm">{selectedCSBField.clu_id || 'N/A'}</div>
              </div>
              <div>
                <span className="text-gray-600 text-xs">Area:</span>
                <div className="text-xl font-bold" style={{ color: '#16a34a' }}>
                  {selectedCSBField.acres != null ? selectedCSBField.acres.toFixed(2) : 'N/A'} <span className="text-sm font-normal">acres</span>
                </div>
              </div>
              <div>
                <span className="text-gray-600 text-xs">State:</span>
                <div className="font-semibold text-gray-900 text-sm">{getStateName(selectedCSBField.state)}</div>
              </div>
              <div>
                <span className="text-gray-600 text-xs">County:</span>
                <div className="font-semibold text-gray-900 text-sm">{selectedCSBField.county || 'N/A'}</div>
              </div>
            </div>

            {/* Rotation Analysis & Sustainability Metrics */}
            {selectedCSBField.rotation_analysis && selectedCSBField.sustainability_metrics && (
              <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac' }}>
                <h4 className="font-semibold text-gray-900 text-xs mb-2">Crop Rotation Analysis (2017-2023)</h4>
                
                {/* Sustainability Score */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Sustainability Score:</span>
                    <span className="text-sm font-bold" style={{ 
                      color: selectedCSBField.sustainability_metrics.total_score >= 75 ? '#16a34a' : 
                             selectedCSBField.sustainability_metrics.total_score >= 50 ? '#f59e0b' : '#dc2626'
                    }}>
                      {selectedCSBField.sustainability_metrics.total_score}/100 - {selectedCSBField.sustainability_metrics.rating}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all" 
                      style={{ 
                        width: `${selectedCSBField.sustainability_metrics.total_score}%`,
                        backgroundColor: selectedCSBField.sustainability_metrics.total_score >= 75 ? '#16a34a' : 
                                       selectedCSBField.sustainability_metrics.total_score >= 50 ? '#f59e0b' : '#dc2626'
                      }}
                    />
                  </div>
                </div>

                {/* Rotation Pattern */}
                <div className="grid grid-cols-2 gap-3 text-xs mb-2">
                  <div>
                    <span className="text-gray-600">Pattern:</span>
                    <div className="font-semibold text-gray-900">{formatPatternType(selectedCSBField.rotation_analysis.pattern_type)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Unique Crops:</span>
                    <div className="font-semibold text-gray-900">{selectedCSBField.rotation_analysis.unique_crops}</div>
                  </div>
                </div>

                {/* Bonuses */}
                <div className="flex flex-wrap gap-1">
                  {selectedCSBField.sustainability_metrics.has_cover_crops && (
                    <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#86efac', color: '#166534' }}>
                      +{selectedCSBField.sustainability_metrics.cover_crop_bonus} Cover Crops
                    </span>
                  )}
                  {selectedCSBField.sustainability_metrics.has_nitrogen_fixers && (
                    <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#86efac', color: '#166534' }}>
                      +{selectedCSBField.sustainability_metrics.nitrogen_fixation_bonus} N-Fixers
                    </span>
                  )}
                </div>

                {/* Crop History */}
                {selectedCSBField.crop_names && Object.keys(selectedCSBField.crop_names).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <span className="text-xs text-gray-600 font-semibold">7-Year Rotation:</span>
                    <div className="mt-1 space-y-1">
                      {Object.entries(selectedCSBField.crop_names)
                        .sort(([yearA], [yearB]) => yearB.localeCompare(yearA))
                        .slice(0, 7)
                        .map(([year, crop]) => (
                          <div key={year} className="flex justify-between text-xs">
                            <span className="text-gray-600">{year}:</span>
                            <span className="font-medium text-gray-900">{crop}</span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Custom Field Name Input */}
            <div className="mb-4">
              <label htmlFor="fieldName" className="block text-xs font-semibold text-gray-700 mb-2">
                Field Name (Optional)
              </label>
              <input
                id="fieldName"
                type="text"
                value={customFieldName}
                onChange={(e) => setCustomFieldName(e.target.value)}
                placeholder={`Field ${selectedCSBField.clu_id || 'Unknown'}`}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                This name will be used to identify the field in analysis pages
              </p>
            </div>

            <button
              onClick={() => {
                if (onFieldSelected) {
                  onFieldSelected({
                    name: customFieldName.trim() || `Field ${selectedCSBField.clu_id || 'Unknown'}`,
                    area: selectedCSBField.acres || 0,
                    acres: selectedCSBField.acres || 0,
                    boundary: selectedCSBField.geometry,
                    clu_id: selectedCSBField.clu_id,
                    state: selectedCSBField.state,
                    county: selectedCSBField.county,
                    geometry: selectedCSBField.geometry,
                    method: 'csb-selected',
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
