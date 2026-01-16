# GEE Map Tile Layer Integration - Implementation Summary

## Overview
Successfully integrated Google Earth Engine (GEE) map tile layers into the Soil Conservation Planner application with accordion-based layer organization.

## Components Created

### 1. Type Definitions (`src/types/mapLayers.ts`)
- **PropertyMetadata**: Metadata for soil and terrain properties (id, name, description, units, palette, min/max, category, subcategory)
- **PropertyTileResponse**: Tile URL and visualization configuration
- **MapLayer**: Layer state with opacity and visibility
- **LayerGroup**: Accordion groups with expanded state
- **Subcategories**:
  - **Soil** (7): Texture, Organic Matter, Water Properties, Chemical Properties, Physical Properties, Vulnerability Indices, Productivity Ratings
  - **Terrain** (4): Slope & Aspect, Hydrologic Indices, Curvature, Topographic Position

### 2. API Client (`src/lib/mapLayerApi.ts`)
- **MapLayerAPIClient** class with axios
- **Methods**:
  - `getSoilProperties()`: Fetches 29 soil properties
  - `getTerrainProperties()`: Fetches 11 terrain properties
  - `getAllProperties()`: Combined 40 properties
  - `getPropertyTiles(category, id)`: Gets tile URL for specific property
- **Singleton export**: `mapLayerApi`

### 3. React Hooks (`src/hooks/useMapLayers.ts`)
- **useSoilProperties()**: Query soil properties with 24h cache
- **useTerrainProperties()**: Query terrain properties with 24h cache
- **useAllProperties()**: Query all 40 properties
- **usePropertyTiles()**: Fetch tile URL for specific property (1h cache)
- **useLayerGroups()**: Main hook organizing properties into accordion groups
  - Auto-categorizes properties into subcategories
  - Manages layer visibility and opacity
  - Tracks active layers
  - Provides callbacks: `toggleGroup`, `toggleLayer`, `setLayerOpacity`

### 4. UI Components

#### LayerAccordion (`src/components/MapExplorer/LayerAccordion.tsx`)
- **Features**:
  - Collapsible groups by subcategory
  - Checkboxes for layer visibility
  - Opacity sliders (0-100%)
  - Color palette visualization
  - Value range display (min-max)
  - Hover descriptions
  - Active layer count per group
  - Empty state handling

#### MapLayerControl (`src/components/MapExplorer/MapLayerControl.tsx`)
- **Features**:
  - Collapsible panel (left or right position)
  - Loading state
  - Active layer badge
  - Contains LayerAccordion
  - Responsive height management

#### MapExplorer (`src/components/MapExplorer/MapExplorer.tsx`)
- **Features**:
  - Full-screen interactive map
  - Dynamic tile layer management
  - Auto-loads/unloads layers based on visibility
  - OpenStreetMap base layer
  - Opacity control integration
  - Instructions panel
  - Proper cleanup of removed layers

### 5. Page Route (`src/pages/tools/map-explorer.tsx`)
- Standalone page for map exploration
- SEO-optimized with Head component
- Full-screen layout

## Available Properties

### Soil Properties (29 total)
1. **gNATSGO (30m resolution)** - USDA Gridded National Soil Survey
   - Texture: Sand, Silt, Clay
   - Water: Available Water Storage (AWS), Saturated Hydraulic Conductivity (Ksat), Drainage Class
   - Chemical: pH, CEC, EC
   - Organic: Soil Organic Carbon (SOC), Organic Matter
   - Physical: Bulk Density, Root Zone Depth
   - Productivity: NCCPI, Yield Estimates
   - Other: Wetland Classification

2. **SOLUS (100m resolution)** - USDA Soil Landscapes of the USA
   - Sand/Clay/Silt percentages for multiple depth layers (0-5cm, 5-15cm, 15-30cm, etc.)
   - Soil Organic Carbon (SOC) surface layers

3. **ACPF SVI (30m resolution)** - Agricultural Conservation Planning Framework Soil Vulnerability Index
   - Surface vulnerability
   - Subsurface vulnerability (drained)
   - Subsurface vulnerability (undrained)

### Terrain Properties (11 total)
**STEDUS30 (30m resolution)** - Soil and Terrain Database for the United States
- Slope (degrees and percent)
- Aspect
- Topographic Wetness Index (TWI)
- Stream Power Index (SPI)
- Convergence Index
- Plan/Profile Curvature
- Elevation
- Hillshade
- Topographic Position Index (TPI)

## Integration Architecture

### Data Flow
```
GEE API → mapLayerApi → useMapLayers → LayerAccordion → MapExplorer
                                     ↓
                              (activeLayers)
                                     ↓
                              Leaflet TileLayer
```

### Caching Strategy
- **Property metadata**: 24 hours (rarely changes)
- **Tile URLs**: 1 hour (URLs may expire)
- **React Query** handles cache invalidation

### Layer Management
1. User toggles layer visibility in accordion
2. `activeLayers` Set updated
3. `MapExplorer` effect detects change
4. Fetches tile URL via `mapLayerApi.getPropertyTiles()`
5. Creates Leaflet TileLayer
6. Adds to map with specified opacity
7. Stores reference for later removal/opacity updates

### Subcategory Auto-Detection
Properties automatically categorized based on ID patterns:
- **Texture**: Contains "sand", "clay", "silt"
- **Organic**: Contains "soc", "om"
- **Water**: Contains "aws", "ksat", "drainage"
- **Chemical**: Contains "ph", "cec", "ec"
- **Vulnerability**: Contains "svi"
- **Productivity**: Contains "nccpi", "yield"
- **Slope**: Contains "slope", "aspect"
- **Hydrology**: Contains "twi", "spi", "convergence"
- **Curvature**: Contains "curvature"
- **Position**: Contains "elevation", "tpi", "hillshade"

## Usage

### Standalone Page
```
Navigate to: /tools/map-explorer
```

### As Embedded Component
```tsx
import { MapExplorer } from '@/components/MapExplorer/MapExplorer'

<MapExplorer 
  center={[lat, lng]}
  zoom={5}
  showLayerControl={true}
/>
```

### Custom Integration
```tsx
import { useLayerGroups } from '@/hooks/useMapLayers'

const { layerGroups, activeLayers, toggleLayer } = useLayerGroups()
// Build custom UI with layerGroups data
```

## Next Steps

### Recommended Enhancements
1. **Legend Component**: Standalone legend showing all active layer color ramps
2. **Layer Search**: Filter layers by name/description
3. **Preset Views**: Save/load layer combinations
4. **Export**: Download visible layer combinations as images
5. **Mobile Optimization**: Touch-friendly accordion controls
6. **Layer Ordering**: Drag-and-drop z-index control
7. **Blend Modes**: CSS blend modes for layer compositing
8. **Time Series**: Support temporal properties (if available)

### Performance Optimizations
1. **Lazy Loading**: Only fetch tile URLs when layer activated
2. **Debounced Opacity**: Debounce opacity slider for smoother updates
3. **Virtualization**: Virtualize accordion for 100+ layers
4. **WebGL**: Consider MapLibre GL JS for better performance

### Integration Points
1. **Field Analysis**: Add soil property overlay to field selection map
2. **RUSLE-EOS**: Show terrain properties alongside erosion results
3. **Conservation Practices**: Overlay vulnerability indices with practice recommendations
4. **OSD Integration**: Link map layers to Official Soil Series Descriptions

## Testing Checklist
- [ ] All 40 properties load correctly
- [ ] Accordion expand/collapse works
- [ ] Layer visibility toggles work
- [ ] Opacity sliders update map in real-time
- [ ] Multiple layers can be active simultaneously
- [ ] Color palettes display correctly
- [ ] Value ranges show min/max
- [ ] Panel collapse/expand works
- [ ] Active layer count badge updates
- [ ] Hover descriptions appear
- [ ] Removed layers cleanup properly
- [ ] No memory leaks with rapid toggling
- [ ] Mobile responsive layout

## Documentation References
- [GEE API Architecture](../Property_Panel_Guide/gee-api-docs/architecture.md)
- [Next.js Integration Guide](../Property_Panel_Guide/gee-api-docs/nextjs-integration.md)
- [React Hooks Guide](../Property_Panel_Guide/gee-api-docs/nextjs-react-hooks.md)
- [Soil Properties Integration](../Property_Panel_Guide/gee-api-docs/SOLUS_INTEGRATION.md)
- [Terrain Properties Integration](../Property_Panel_Guide/gee-api-docs/TERRAIN_INTEGRATION.md)

## API Endpoints Used
- `GET /api/soil-properties/list` - List all soil properties
- `GET /api/terrain-properties/list` - List all terrain properties
- `GET /api/soil-properties/tiles/:property_id` - Get soil property tiles
- `GET /api/terrain-properties/tiles/:property_id` - Get terrain property tiles
