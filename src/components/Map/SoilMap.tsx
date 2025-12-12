// Main Soil Survey Map Component

'use client'

import L from 'leaflet'
import { useEffect, useRef } from 'react'

import 'leaflet/dist/leaflet.css'

import { useSoilData } from '#src/hooks/useSoilData'
import type { SoilDepth, SoilLayer, SoilProfile } from '#src/types/soil'

// Fix Leaflet default icon issue with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})

interface SoilMapProps {
  initialCenter: [number, number]
  initialZoom: number
  selectedDepth: SoilDepth
  activeLayers: string[]
  soilLayers: SoilLayer[]
  onSoilClick: (profile: SoilProfile) => void
  onSSURGOClick?: (data: {
    mukey: string
    musym: string
    muname: string
    muacres: string
    coordinates: [number, number]
  }) => void
  onMapReady?: (map: L.Map) => void
  onProcessingStart?: () => void
  className?: string
}
export default function SoilMap({
  initialCenter,
  initialZoom,
  selectedDepth,
  activeLayers,
  soilLayers,
  onSoilClick,
  onSSURGOClick,
  onMapReady,
  onProcessingStart,
  className = '',
}: SoilMapProps) {
  console.log('SoilMap component rendering...')
  console.log('Props - activeLayers:', activeLayers)
  console.log('Props - soilLayers:', soilLayers)

  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const clickMarkerRef = useRef<L.Marker | null>(null)
  const layersRef = useRef<Map<string, L.Layer>>(new Map())
  const activeLayersRef = useRef<string[]>(activeLayers)

  const { fetchSoilProfile } = useSoilData()

  // Keep activeLayersRef in sync with activeLayers prop
  useEffect(() => {
    activeLayersRef.current = activeLayers
  }, [activeLayers])

  // Initialize map
  useEffect(() => {
    console.log('Map initialization effect running...')
    console.log('containerRef.current:', containerRef.current)
    console.log('mapRef.current:', mapRef.current)

    if (!containerRef.current) {
      console.log('No container, exiting')
      return
    }

    if (mapRef.current) {
      console.log('Map already exists, exiting')
      return
    }

    console.log('Creating new map instance...')
    // Create map instance
    const map = L.map(containerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
      minZoom: 3,
      maxZoom: 18,
    })

    console.log('Map created:', map)
    mapRef.current = map
    console.log('Map stored in ref')
    
    // Notify parent that map is ready
    if (onMapReady) {
      onMapReady(map)
    }

    // Add zoom control to bottom right
    L.control
      .zoom({
        position: 'bottomright',
      })
      .addTo(map)

    // Add scale control
    L.control
      .scale({
        position: 'bottomleft',
        imperial: true,
        metric: true,
      })
      .addTo(map)

    // Define base layers
    const baseLayers = {
      'Satellite Hybrid': L.layerGroup([
        L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            attribution:
              'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            maxZoom: 19,
          },
        ),
        L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          {
            attribution: 'Labels © Esri',
            maxZoom: 19,
          },
        ),
      ]),
      Satellite: L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution:
            'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          maxZoom: 19,
        },
      ),
      OpenStreetMap: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }),
      Terrain: L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        {
          attribution:
            'Tiles © Esri — Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
          maxZoom: 19,
        },
      ),
      'Light Gray': L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles © Esri — Esri, DeLorme, NAVTEQ',
          maxZoom: 16,
        },
      ),
    }

    // Add default base layer (Satellite Hybrid)
    baseLayers['Satellite Hybrid'].addTo(map)

    // Add layer control for base layers with custom class
    const layersControl = L.control.layers(baseLayers, {}, { 
      position: 'topright',
      collapsed: true,
    }).addTo(map)
    
    // Add custom class to the control for styling
    const controlContainer = layersControl.getContainer()
    if (controlContainer) {
      controlContainer.classList.add('modern-basemap-control')
    }
    
    console.log('About to add click handler to map...')
    // Add click handler for soil profile queries
    map.on('click', async (e: L.LeafletMouseEvent) => {
      console.log('=== MAP CLICK EVENT ===')
      const { lat, lng } = e.latlng
      console.log('Coordinates:', lat, lng)
      console.log('Active layers:', activeLayersRef.current)

      // Trigger processing indicator
      if (onProcessingStart) {
        onProcessingStart()
      }

      // Zoom to level 15 and center on clicked point
      // Zoom to level 15 and center on clicked point
      map.setView([lat, lng], 15, {
        animate: true,
        duration: 0.5
      })

      // Add or move marker
      if (clickMarkerRef.current) {
        console.log('Moving existing marker to:', lat, lng)
        clickMarkerRef.current.setLatLng([lat, lng])
        // Ensure marker is brought to front
        clickMarkerRef.current.setZIndexOffset(1000)
      } else {
        console.log('Creating new marker at:', lat, lng)
        clickMarkerRef.current = L.marker([lat, lng], {
          icon: L.icon({
            iconUrl: '/leaflet/marker-icon.png',
            iconRetinaUrl: '/leaflet/marker-icon-2x.png',
            shadowUrl: '/leaflet/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
          }),
          zIndexOffset: 1000  // Ensure marker is always on top
        }).addTo(map)
        console.log('Marker created and added to map')
      }
      console.log('Marker on map:', clickMarkerRef.current ? 'yes' : 'no')

      try {
        // Check if SSURGO layer is active and query it
        if (activeLayersRef.current.includes('ssurgo-mapunits')) {
          console.log('✓ SSURGO layer is active, querying API...')
          console.log('Active layers list:', activeLayersRef.current)

          try {
            const ssurgoInfo = await querySSURGOMapUnit(map, e)
            console.log('SSURGO query result:', ssurgoInfo)

            if (ssurgoInfo) {
              console.log('Updating PropertyPanel with SSURGO data...')

              // Call callback to update property panel with full data
              if (onSSURGOClick) {
                onSSURGOClick({
                  ...ssurgoInfo,
                  coordinates: [lat, lng],
                })
              }

              return // Exit here - don't continue to fallback
            }
          } catch (queryError) {
            console.error('SSURGO query error:', queryError)
            return // Exit on error
          }
        }

        // Try to fetch soil profile from API (only if SSURGO layer is not active)
        try {
          const profile = await fetchSoilProfile(lat, lng, selectedDepth)
          onSoilClick(profile)

          // Update popup with basic info
          if (clickMarkerRef.current) {
            clickMarkerRef.current
              .bindPopup(
                `
              <div class="soil-popup">
                <h3 class="font-bold text-sm mb-1">Soil Profile</h3>
                <p class="text-xs"><strong>Order:</strong> ${profile.soil_order}</p>
                <p class="text-xs"><strong>Map Unit:</strong> ${profile.map_unit}</p>
                <p class="text-xs text-gray-500">Click for details →</p>
              </div>
            `,
              )
              .openPopup()
          }
        } catch (apiError) {
          // API not available - show coordinates only
          if (clickMarkerRef.current) {
            clickMarkerRef.current
              .bindPopup(
                `
              <div class="soil-popup">
                <h3 class="font-bold text-sm mb-1">Location</h3>
                <p class="text-xs"><strong>Latitude:</strong> ${lat.toFixed(5)}</p>
                <p class="text-xs"><strong>Longitude:</strong> ${lng.toFixed(5)}</p>
                <p class="text-xs text-gray-500 mt-2">Backend API not configured</p>
              </div>
            `,
              )
              .openPopup()
          }
        }
      } catch (error) {
        console.error('Error handling map click:', error)
        if (clickMarkerRef.current) {
          clickMarkerRef.current
            .bindPopup('<p class="text-red-600 text-xs">An error occurred processing your request</p>')
            .openPopup()
        }
      }
    })

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - only initialize once

  // Update layers when activeLayers changes
  useEffect(() => {
    if (!mapRef.current) return

    console.log('Updating layers. Active:', activeLayers)
    console.log('Available layers:', soilLayers)

    // Remove layers that are no longer active
    layersRef.current.forEach((layer, id) => {
      if (!activeLayers.includes(id)) {
        console.log(`Removing layer: ${id}`)
        mapRef.current!.removeLayer(layer)
        layersRef.current.delete(id)
      }
    })

    // Add new active layers or update existing ones
    activeLayers.forEach(layerId => {
      const layerConfig = soilLayers.find(l => l.id === layerId)
      if (!layerConfig) return

      if (!layersRef.current.has(layerId)) {
        // Add new layer
        console.log(`Adding layer: ${layerId}`, layerConfig)
        const leafletLayer = createLeafletLayer(layerConfig)
        console.log(`Created Leaflet layer for ${layerId}:`, leafletLayer)
        if (leafletLayer && mapRef.current) {
          leafletLayer.addTo(mapRef.current)
          layersRef.current.set(layerId, leafletLayer)
          console.log(`Layer ${layerId} added to map`)
        }
      } else {
        // Update existing layer opacity
        const existingLayer = layersRef.current.get(layerId)
        if (existingLayer && 'setOpacity' in existingLayer) {
          ;(existingLayer as any).setOpacity(layerConfig.opacity)
        }
      }
    })
  }, [activeLayers, soilLayers])

  // Update depth when selectedDepth changes
  useEffect(() => {
    // Update raster layers based on depth if needed
    console.log(`Selected depth: ${selectedDepth}`)
  }, [selectedDepth])

  return (
    <div
      ref={containerRef}
      className={`soil-map h-full w-full ${className}`}
      style={{ minHeight: '500px', background: '#e5e7eb' }}
    />
  )
}

/**
 * Query SSURGO using NRCS Soil Data Access API by coordinates
 */
async function querySSURGOMapUnit(map: L.Map, event: L.LeafletMouseEvent): Promise<any> {
  try {
    const { lat, lng } = event.latlng
    console.log('Querying SSURGO at coordinates:', lat, lng)

    // Use NRCS SDA REST API - comprehensive query
    const sdaUrl = 'https://SDMDataAccess.sc.egov.usda.gov/Tabular/post.rest'

    // Optimized query - removed cointerp join that was causing 14,000+ duplicate rows
    // Interpretations should be queried separately if needed
    const comprehensiveQuery = `SELECT 
    m.mukey, 
    m.musym, 
    m.muname, 
    m.muacres,
    l.areasymbol,
    l.areaname,
    c.cokey,
    c.compname,
    c.comppct_r,
    c.majcompflag,
    c.slope_r,
    c.runoff,
    c.nirrcapcl,
    c.nirrcapscl,
    c.irrcapcl,
    c.irrcapscl,
    c.drainagecl,
    c.hydricrating,
    c.taxtempcl,
    c.frostact,
    cec.ecoclassid,
    cec.ecoclassname,
    c.taxclname,
    c.taxorder,
    c.taxsuborder,
    c.taxgrtgroup,
    c.taxsubgrp,
    cm.pondfreqcl,
    cm.ponddurcl,
    cm.flodfreqcl,
    cm.floddurcl,
    corestr.reskind,
    corestr.resdept_r,
    corestr.reshard,
    muagg.wtdepannmin,
    ch.chkey,
    ch.hzname,
    ch.hzdept_r,
    ch.hzdepb_r,
    ch.sandtotal_r,
    ch.silttotal_r,
    ch.claytotal_r,
    ch.om_r,
    ch.ph1to1h2o_r,
    ch.awc_r,
    ch.ksat_r,
    ch.dbthirdbar_r,
    ch.cec7_r,
    ch.pi_r,
    ch.lep_r,
    ch.ec_r
FROM mapunit m
INNER JOIN legend l ON m.lkey = l.lkey
INNER JOIN component c ON m.mukey = c.mukey
LEFT JOIN coecoclass cec ON c.cokey = cec.cokey
LEFT JOIN (
    SELECT
        cokey,
        MAX(pondfreqcl) AS pondfreqcl,
        MAX(ponddurcl) AS ponddurcl,
        MAX(flodfreqcl) AS flodfreqcl,
        MAX(floddurcl) AS floddurcl
    FROM comonth
    GROUP BY cokey
) AS cm ON c.cokey = cm.cokey
LEFT JOIN corestrictions corestr ON c.cokey = corestr.cokey
LEFT JOIN muaggatt muagg ON m.mukey = muagg.mukey
LEFT JOIN chorizon ch ON c.cokey = ch.cokey
WHERE m.mukey IN (
    SELECT DISTINCT mukey FROM mupolygon
    WHERE mupolygongeo.STIntersects(geometry::STGeomFromText('POINT(${lng} ${lat})', 4326)) = 1
)
ORDER BY c.comppct_r DESC, ch.hzdept_r ASC`

    console.log('Querying comprehensive SSURGO data...')
    console.log('Query:', comprehensiveQuery)

    const params = new URLSearchParams()
    params.append('query', comprehensiveQuery)
    params.append('format', 'JSON')

    console.log('Sending request to:', sdaUrl)

    // Add timeout to fetch
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    let response
    try {
      response = await fetch(sdaUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          console.error('Request timed out after 30 seconds')
        } else {
          console.error('Fetch error:', fetchError.message)
        }
      }
      console.error('Full error:', fetchError)
      throw fetchError
    }

    console.log('Response received!')
    console.log('Response status:', response.status, response.statusText)
    console.log('Response ok:', response.ok)

    if (!response.ok) {
      console.error(`Query failed: ${response.status} ${response.statusText}`)
      const text = await response.text()
      console.error('Response body:', text)
      return null
    }

    const responseText = await response.text()
    console.log('Response length:', responseText.length)

    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Could not parse response (first 500 chars):', responseText.substring(0, 500))
      return null
    }

    console.log('Number of rows:', data?.Table?.length || 0)

    if (!data || !data.Table || data.Table.length === 0) {
      console.log('No data found at this location')
      return null
    }

    // Parse comprehensive query results
    // Field mapping by index:
    // 0-5: Map Unit & Legend (mukey, musym, muname, muacres, areasymbol, areaname)
    // 6-15: Component Basic (cokey, compname, comppct_r, majcompflag, slope_r, runoff, nirrcapcl, nirrcapscl, irrcapcl, irrcapscl)
    // 16-19: Component Limitations (drainagecl, hydricrating, taxtempcl, frostact)
    // 20-21: Ecological Site (ecoclassid, ecoclassname)
    // 22-26: Taxonomy (taxclname, taxorder, taxsuborder, taxgrtgroup, taxsubgrp)
    // 27-30: Monthly Data (pondfreqcl, ponddurcl, flodfreqcl, floddurcl)
    // 31-33: Restrictions (reskind, resdept_r, reshard)
    // 34: Water Table (wtdepannmin)
    // 35-49: Horizon (chkey, hzname, hzdept_r, hzdepb_r, sandtotal_r, silttotal_r, claytotal_r, om_r, ph1to1h2o_r, awc_r, ksat_r, dbthirdbar_r, cec7_r, pi_r, lep_r, ec_r)
    // 50-53: Interpretations (mrulename, ruledepth, interphrc, interphr)

    const componentsMap = new Map()

    data.Table.forEach((row: any[]) => {
      const cokey = row[6]

      // Create component if not exists
      if (cokey && !componentsMap.has(cokey)) {
        componentsMap.set(cokey, {
          cokey: row[6],
          compname: row[7],
          comppct_r: row[8],
          majcompflag: row[9],
          slope_r: row[10],
          runoff: row[11],
          nirrcapcl: row[12],
          nirrcapscl: row[13],
          irrcapcl: row[14],
          irrcapscl: row[15],
          drainagecl: row[16],
          hydricrating: row[17],
          taxtempcl: row[18],
          frostact: row[19],
          ecoclassid: row[20],
          ecoclassname: row[21],
          taxclname: row[22],
          taxorder: row[23],
          taxsuborder: row[24],
          taxgrtgroup: row[25],
          taxsubgrp: row[26],
          pondfreqcl: row[27],
          ponddurcl: row[28],
          flodfreqcl: row[29],
          floddurcl: row[30],
          reskind: row[31],
          resdept_r: row[32],
          reshard: row[33],
          wtdepannmin: row[34],
          horizons: [],
          interpretations: [], // Will be populated by separate query
        })
      }

      // Add horizon data if present
      if (cokey && row[35]) {
        // chkey exists
        const component = componentsMap.get(cokey)
        // Check if this horizon is already added (avoid duplicates)
        if (!component.horizons.some((h: any) => h.chkey === row[35])) {
          component.horizons.push({
            chkey: row[35],
            hzname: row[36],
            hzdept_r: row[37],
            hzdepb_r: row[38],
            sandtotal_r: row[39],
            silttotal_r: row[40],
            claytotal_r: row[41],
            om_r: row[42],
            ph1to1h2o_r: row[43],
            awc_r: row[44],
            ksat_r: row[45],
            dbthirdbar_r: row[46],
            cec7_r: row[47],
            pi_r: row[48],
            lep_r: row[49],
            ec_r: row[50],
          })
        }
      }

    })

    const firstRow = data.Table[0]
    const mapunitData = {
      mukey: firstRow[0],
      musym: firstRow[1],
      muname: firstRow[2],
      muacres: firstRow[3],
      areasymbol: firstRow[4],
      areaname: firstRow[5],
      components: Array.from(componentsMap.values()),
    }

    // Fetch interpretations separately for all components
    try {
      const cokeys = Array.from(componentsMap.keys()).filter(k => k)
      if (cokeys.length > 0) {
        const interpretations = await querySSURGOInterpretations(cokeys)
        
        // Attach interpretations to their respective components
        interpretations.forEach((interp: any) => {
          const component = componentsMap.get(interp.cokey)
          if (component) {
            if (!component.interpretations) {
              component.interpretations = []
            }
            component.interpretations.push({
              name: interp.mrulename,
              depth: interp.ruledepth,
              rating: interp.interphr,
              value: interp.interphrc ? parseFloat(interp.interphrc) : 0,
            })
          }
        })
      }
    } catch (interpError) {
      console.warn('Failed to fetch interpretations:', interpError)
      // Continue without interpretations rather than failing entirely
    }

    return mapunitData
  } catch (error) {
    console.error('Error querying SSURGO:', error)
    return null
  }
}

/**
 * Query SSURGO component interpretations separately
 * This avoids the Cartesian product issue while still getting interpretation data
 */
async function querySSURGOInterpretations(cokeys: string[]): Promise<any[]> {
  try {
    const sdaUrl = 'https://SDMDataAccess.sc.egov.usda.gov/Tabular/post.rest'
    
    // Build IN clause for cokeys
    const cokeyList = cokeys.map(k => `'${k}'`).join(',')
    
    const interpretationQuery = `SELECT 
      coi.cokey,
      coi.mrulename,
      coi.ruledepth,
      coi.interphrc,
      coi.interphr
    FROM cointerp coi
    WHERE coi.cokey IN (${cokeyList})
    ORDER BY coi.cokey, coi.seqnum`

    const params = new URLSearchParams()
    params.append('query', interpretationQuery)
    params.append('format', 'JSON')

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    const response = await fetch(sdaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      console.warn(`Interpretations query failed: ${response.status}`)
      return []
    }

    const responseText = await response.text()
    const data = JSON.parse(responseText)

    if (!data || !data.Table || data.Table.length === 0) {
      return []
    }

    // Parse interpretation results
    return data.Table.map((row: any[]) => ({
      cokey: row[0],
      mrulename: row[1],
      ruledepth: row[2],
      interphrc: row[3],
      interphr: row[4],
    }))
  } catch (error) {
    console.error('Error querying interpretations:', error)
    return []
  }
}

/**
 * Create a Leaflet layer from configuration
 */
function createLeafletLayer(config: SoilLayer): L.Layer | null {
  try {
    console.log('Creating layer with config:', config)
    switch (config.type) {
      case 'wms':
        // Determine WMS layer name based on the config
        let wmsLayerName = 'MapunitPoly'
        let wmsAttribution = 'USDA-NRCS Soil Survey'
        let wmsVersion = '1.1.1'
        let additionalParams: any = {}

        if (config.id === 'cdl') {
          // Use year from config, default to 2023
          const year = config.year || 2023
          wmsLayerName = `cdl_${year}`
          wmsAttribution = 'USDA NASS CropScape'
          wmsVersion = '1.1.1'
          // CropScape only supports EPSG:4326, not 3857
          // We need to request tiles in 4326 and override the getTileUrl to convert bounds
          additionalParams = {
            pane: 'overlayPane',
            zIndex: 400,
          }
        } else if (config.id === 'ssurgo-mapunits') {
          // SSURGO map units should render on top with higher z-index
          additionalParams = {
            pane: 'overlayPane',
            zIndex: 500,
          }
        }

        const wmsOptions: any = {
          layers: wmsLayerName,
          format: 'image/png',
          transparent: true,
          opacity: config.opacity,
          attribution: wmsAttribution,
          version: wmsVersion,
          styles: '',
          maxZoom: 18,
          ...additionalParams,
        }

        console.log('WMS URL:', config.url)
        console.log('WMS Options:', wmsOptions)

        const layer = L.tileLayer.wms(config.url, wmsOptions)

        // Special handling for CDL to convert bbox to EPSG:4326
        if (config.id === 'cdl') {
          const originalGetTileUrl = layer.getTileUrl.bind(layer)
          layer.getTileUrl = function (coords: any) {
            // Get the original URL
            const url = originalGetTileUrl(coords)
            // Replace EPSG:3857 with EPSG:4326 and convert bbox
            const urlObj = new URL(url, window.location.origin)
            const bbox = urlObj.searchParams.get('bbox')
            if (bbox) {
              const [minx, miny, maxx, maxy] = bbox.split(',').map(Number)
              // Convert Web Mercator (EPSG:3857) to WGS84 (EPSG:4326)
              const minLng = (minx / 20037508.34) * 180
              const minLat = (Math.atan(Math.exp((miny / 20037508.34) * Math.PI)) * 360) / Math.PI - 90
              const maxLng = (maxx / 20037508.34) * 180
              const maxLat = (Math.atan(Math.exp((maxy / 20037508.34) * Math.PI)) * 360) / Math.PI - 90
              urlObj.searchParams.set('bbox', `${minLng},${minLat},${maxLng},${maxLat}`)
              urlObj.searchParams.set('srs', 'EPSG:4326')
            }
            return urlObj.toString().replace(window.location.origin, '')
          }
        }

        // Add event handlers to debug tile loading
        const layerName = config.id === 'cdl' ? 'CDL' : config.id === 'ssurgo-mapunits' ? 'SSURGO' : 'WMS'

        layer.on('tileerror', (error: any) => {
          console.error(`${layerName} Tile load error:`, error)
          console.error('Tile URL that failed:', error.tile?.src || 'unknown')
          console.error('Tile coords:', error.coords)
        })

        layer.on('tileload', (event: any) => {
          console.log(`${layerName} Tile loaded successfully:`, event.coords)
          console.log('Tile URL:', event.tile?.src)
        })

        layer.on('loading', () => {
          console.log(`${layerName} Layer starting to load tiles...`)
        })

        layer.on('load', () => {
          console.log(`${layerName} Layer finished loading tiles`)
        })

        return layer

      case 'raster':
        return L.tileLayer(config.url, {
          opacity: config.opacity,
          maxZoom: 18,
        })

      default:
        return null
    }
  } catch (error) {
    console.error('Error creating layer:', error)
    return null
  }
}
