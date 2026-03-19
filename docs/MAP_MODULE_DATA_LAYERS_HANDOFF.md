# Map Module Handoff Guide: Data Layers Panel and CONUS Layer Display

## Purpose
This guide explains how the map module implements:
- A Data Layers panel UI for toggling map overlays
- Rendering of CONUS Cropland Data Layer (CDL) and SSURGO overlays
- Rendering of GEE-powered tile layers (soil and terrain)

Use this as a build blueprint for an agent implementing the same functionality in a new app.

## Scope
This guide focuses on:
- Layer control UI and interaction model
- Parent state orchestration
- Leaflet layer lifecycle (add, remove, opacity updates)
- API proxy pattern for external map services
- Build/run scripts and dependencies

## Source-of-Truth Files in This Project
- `src/pages/soil-map.tsx`
- `src/components/Map/LayerControl.tsx`
- `src/components/Map/SoilMap.tsx`
- `src/pages/api/cropscape.ts`
- `src/hooks/useGEELayers.ts`
- `src/lib/mapLayerApi.ts`
- `src/pages/api/gee-properties/list.ts`
- `src/pages/api/gee-properties/tiles/[propertyId].ts`
- `package.json`

---

## High-Level Architecture

### 1) Parent page owns layer state
`soil-map.tsx` is the orchestration layer. It owns:
- `activeLayers: string[]`
- `layerOpacities: Record<string, number>`
- `cdlYear: number`
- canonical layer configuration (`soilLayers`)

### 2) LayerControl is a pure UI controller
`LayerControl.tsx` renders grouped sections and controls:
- checkbox toggle for visibility
- opacity slider
- CDL year selector

It emits events upward:
- `onLayerToggle(layerId)`
- `onOpacityChange(layerId, opacity)`
- `onCdlYearChange(year)`

### 3) SoilMap performs layer rendering in Leaflet
`SoilMap.tsx` receives `activeLayers` and `soilLayers` and performs:
- remove non-active layers from map
- add active layers not yet present
- update opacity for already-present layers

Layer instances are tracked in refs:
- `layersRef: Map<string, L.Layer>` for core layers
- `geeLayersRef: Map<string, L.TileLayer>` for GEE overlays

### 4) API proxies avoid CORS and normalize external services
- `api/cropscape.ts` proxies CropScape WMS tile requests
- `api/gee-properties/*` proxies GEE property list and tile endpoints

---

## Detailed Build Flow

## A. Define layer model in parent page
In `soil-map.tsx`, define layer objects with stable IDs.

Minimum fields used by renderer/UI:
- `id`
- `name`
- `type` (`wms`, `raster`, `gee-tile`)
- `url` (for direct WMS/raster)
- `opacity`
- `visible` (derived from `activeLayers`)
- optional `year` (CDL)
- optional `metadata` (GEE)

Example IDs used here:
- `ssurgo-mapunits`
- `cdl`
- `gee-<propertyId>`

## B. Wire LayerControl to parent state
In `soil-map.tsx`:
- maintain `activeLayers`
- implement `handleLayerToggle(layerId)` to add/remove IDs
- maintain `layerOpacities`
- pass `layersWithVisibility` and handlers into `LayerControl`

`LayerControl` should not own canonical visibility state.

## C. Render overlays in SoilMap with effect-driven lifecycle
In `SoilMap.tsx`, use `useEffect([activeLayers, soilLayers])` to:
1. Remove inactive map layers from `layersRef`
2. Add new active layers:
   - if `type === 'wms'` or `type === 'raster'`: call `createLeafletLayer`
   - if `type === 'gee-tile'`: async fetch tile URL then create `L.tileLayer`
3. Update opacity for existing layers with `setOpacity`

This keeps map state in sync with UI state without full reinitialization.

## D. Display SSURGO map units using NRCS WMS tile service
SSURGO map units are displayed as a standard Leaflet WMS layer using the NRCS SDM WMS endpoint.

Use this URL (or your own env override):
- `https://sdmdataaccess.nrcs.usda.gov/Spatial/SDM.wms`

### 1) Define SSURGO layer in page-level layer config
Add this to your canonical `soilLayers` list in the map page:

```ts
{
  id: 'ssurgo-mapunits',
  name: 'SSURGO Map Units',
  type: 'wms',
  url: process.env.NEXT_PUBLIC_NRCS_WMS_URL || 'https://sdmdataaccess.nrcs.usda.gov/Spatial/SDM.wms',
  visible: true,
  opacity: layerOpacities['ssurgo-mapunits'] ?? 0.6,
}
```

### 2) Build SSURGO WMS in your layer factory
In `createLeafletLayer`, use `MapunitPoly` as the WMS layer name and keep it above most overlays with z-index:

```ts
if (config.type === 'wms' && config.id === 'ssurgo-mapunits') {
  return L.tileLayer.wms(config.url, {
    layers: 'MapunitPoly',
    format: 'image/png',
    transparent: true,
    version: '1.1.1',
    styles: '',
    opacity: config.opacity ?? 0.6,
    attribution: 'USDA-NRCS Soil Survey',
    maxZoom: 18,
    pane: 'overlayPane',
    zIndex: 500,
  })
}
```

### 3) Toggle visibility through active layer state
Do not add SSURGO directly in the map initializer. Let your layer-sync effect control add/remove based on `activeLayers`:

```ts
// remove inactive
layersRef.current.forEach((layer, id) => {
  if (!activeLayers.includes(id)) {
    map.removeLayer(layer)
    layersRef.current.delete(id)
  }
})

// add active
activeLayers.forEach((layerId) => {
  const cfg = soilLayers.find((l) => l.id === layerId)
  if (!cfg || layersRef.current.has(layerId)) return
  const leafletLayer = createLeafletLayer(cfg)
  if (leafletLayer) {
    leafletLayer.addTo(map)
    layersRef.current.set(layerId, leafletLayer)
  }
})
```

### 4) UI behavior for SSURGO in the Data Layers panel
Recommended behavior used here:
- SSURGO appears in Soil Data section
- visibility controlled by checkbox
- opacity slider can be hidden for SSURGO if you want fixed readability

### 5) Optional: click-query data (separate from tiles)
Tile rendering only gives map imagery. Attribute details (mukey, components, horizons) are fetched separately in this project using NRCS SDA tabular API calls in map click handlers. Keep tile display and tabular query concerns separate.

## E. Implement CONUS CDL correctly
CDL is rendered as a WMS layer with dynamic layer name:
- `cdl_<year>`

Important compatibility detail in `createLeafletLayer`:
- CropScape expects EPSG:4326 semantics
- Leaflet map tiles are typically computed in EPSG:3857
- this implementation overrides `getTileUrl` for CDL to convert bbox to EPSG:4326 and set `srs=EPSG:4326`

Without this conversion, CDL tile requests may fail or draw incorrectly.

## F. Proxy CropScape WMS
`api/cropscape.ts`:
- accepts GET requests
- forwards query params to `https://nassgeodata.gmu.edu/CropScapeService/wms_cdlall.cgi`
- returns image bytes + permissive CORS headers + cache headers

Frontend WMS URL for CDL is set to `/api/cropscape`, not direct external URL.

## G. Add GEE layers dynamically
1. `useGEELayers.ts` fetches metadata list from `mapLayerApi.getAllProperties()`
2. Converts each property to a `SoilLayer` with `type: 'gee-tile'` and `id: gee-<prop.id>`
3. Parent page merges these into `soilLayers`
4. `SoilMap.tsx` fetches tile URLs on demand using `mapLayerApi.getPropertyTiles(propertyId)`

`propertyId` resolution:
- prefer `layerConfig.metadata.id`
- fallback: strip `gee-` prefix from `layerId`

## H. Layer grouping in Data Layers panel
`LayerControl.tsx` groups by filters:
- Soil Data: vector/wms excluding CDL
- Land-Use Data: CDL
- Soil Properties: GEE soil layers excluding interpretation IDs
- Interpretations: GEE IDs matching `nccpi|droughty|pwsl|svi`
- Terrain Properties: GEE terrain layers

This grouping is UI-only and does not change map logic.

---

## Scripts and Commands Used to Build/Run
From `package.json`:

- Development:
  - `npm run dev`
  - Runs Next.js dev server (`next dev`)

- Production build:
  - `npm run build`
  - Compiles app (`next build`)

- Production serve:
  - `npm run start`
  - Starts built app (`next start`)

- Linting:
  - `npm run lint`
  - Runs Next linting (`next lint`)

### Typical setup sequence for a new app
1. `npm install`
2. `npm run dev`
3. Implement API proxies and map module
4. `npm run lint`
5. `npm run build`
6. `npm run start` (optional validation)

---

## Required Runtime Dependencies
Core dependencies used by this functionality:
- `next`
- `react`, `react-dom`
- `leaflet`
- `react-leaflet` and `@react-leaflet/core` (if using wrappers)
- `lucide-react` (panel icons)
- `axios` (proxy client)

Also ensure Leaflet CSS and marker assets are present:
- import `leaflet/dist/leaflet.css`
- provide marker icon files under public assets

---

## API Contract Summary

## 0) NRCS SSURGO WMS (direct service)
Endpoint: `https://sdmdataaccess.nrcs.usda.gov/Spatial/SDM.wms`
- protocol: WMS (used via Leaflet `L.tileLayer.wms`)
- layer name: `MapunitPoly`
- used directly from frontend in this implementation

## 1) CropScape proxy
Endpoint: `/api/cropscape`
- method: GET
- pass-through query params for WMS
- response: image bytes (`image/png` etc.)

## 2) GEE list proxy
Endpoint: `/api/gee-properties/list`
- method: GET
- returns normalized merged array from soil + terrain endpoints
- each item includes `id`, `name`, `category`, visualization metadata

## 3) GEE tiles proxy
Endpoint: `/api/gee-properties/tiles/[propertyId]`
- method: GET
- attempts soil endpoint first, terrain endpoint second
- returns tile metadata including `tile_url`

---

## Implementation Checklist for New App

1. Create a map page container that owns layer state (`activeLayers`, `opacities`, `cdlYear`).
2. Build a `LayerControl` component with checkboxes, year selector for CDL, and opacity slider.
3. Create a `SoilMap` component that initializes Leaflet once and manages overlay layers via refs.
4. Implement `createLeafletLayer` for `wms` and `raster` types.
5. Add SSURGO WMS handling using NRCS endpoint + `MapunitPoly` layer.
6. Add CDL-specific WMS handling:
   - layer name pattern `cdl_<year>`
   - bbox conversion to EPSG:4326 in URL override.
7. Add `/api/cropscape` proxy and point CDL WMS URL to it.
8. Add GEE list and tile proxy endpoints.
9. Add a hook to fetch and map GEE metadata to local layer objects (`type: gee-tile`).
10. Merge static layers + GEE layers into one canonical list consumed by panel and renderer.
11. Add effect to refresh CDL when year changes if your WMS source caches aggressively.
12. Validate with lint/build scripts.

---

## Known Pitfalls and Mitigations

- CRS mismatch for CDL:
  - symptom: blank/incorrect CDL tiles
  - fix: force CDL bbox + SRS to EPSG:4326 in tile URL override

- Duplicate layer instances:
  - symptom: ghost layers, high memory use
  - fix: track layers in `Map` refs and remove before re-adding

- Async race when toggling many layers quickly:
  - symptom: layer appears after being toggled off
  - mitigation: check latest active state before adding async-fetched tiles

- CORS failures from direct external calls:
  - fix: use Next.js API proxy routes

- SSR issues with Leaflet in Next.js:
  - fix: dynamic import map component with `ssr: false`

---

## Suggested File Skeleton for a New App

- `src/pages/map.tsx`
  - owns layer state
  - renders `MapCanvas` + `LayerControl`

- `src/components/map/LayerControl.tsx`
  - grouped UI and controls

- `src/components/map/MapCanvas.tsx`
  - Leaflet setup + layer lifecycle

- `src/lib/mapLayerApi.ts`
  - client for local proxy routes

- `src/hooks/useGEELayers.ts`
  - metadata fetch and mapping

- `src/pages/api/cropscape.ts`
  - WMS proxy

- `src/pages/api/gee-properties/list.ts`
  - metadata proxy

- `src/pages/api/gee-properties/tiles/[propertyId].ts`
  - tile URL proxy

---

## Agent Handoff Prompt (Copy/Paste)
Use this prompt when delegating to an implementation agent:

"Build a Next.js map module with Leaflet that includes a Data Layers panel and supports SSURGO WMS, CONUS CDL WMS, and dynamic GEE tile overlays. Use parent-owned state for active layers, opacity, and CDL year. The panel must control visibility and opacity and include a year selector for CDL. Implement a map renderer that synchronizes Leaflet layer instances from active layer state using refs/maps, not full map re-init. Add Next.js API proxies for CropScape WMS and GEE list/tile endpoints to avoid CORS. For CDL, implement EPSG:3857-to-4326 bbox conversion in tile URL generation and set srs=EPSG:4326. Include scripts for dev/build/start/lint and ensure lint+build pass." 

"Use NRCS SSURGO WMS endpoint https://sdmdataaccess.nrcs.usda.gov/Spatial/SDM.wms with WMS layer MapunitPoly for map-unit polygons, and keep SSURGO display toggled via the same active-layers state machine as other overlays."

---

## Validation Criteria
- Toggling any layer immediately adds/removes corresponding map overlay.
- Opacity slider updates layer transparency live.
- Changing CDL year changes displayed CDL imagery.
- No CORS errors in browser for external map services.
- Map remains responsive after repeated toggles.
- `npm run lint` and `npm run build` succeed.
