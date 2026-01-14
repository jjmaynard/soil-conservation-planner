# CSB Field Selection - Architecture Diagram

## Component Hierarchy

```
field-analysis/
├── index.tsx (Landing Page)
│   ├── State: showCSBLayer (true)
│   ├── Handler: onCSBLayerToggle()
│   └── Component: <FieldMap mode="browse" />
│
└── [fieldId].tsx (Detail Page)
    ├── State: showCSBLayer (true)
    ├── Handler: onCSBLayerToggle()
    └── Component: <FieldMap mode="analysis" />
```

## Data Flow

```
User Click on Map
       ↓
FieldMap Component (click handler)
       ↓
geeApiClient.queryFieldAtPoint(lat, lng)
       ↓
GEE API: GET /csb/bounds?lat={lat}&lng={lng}&buffer=10
       ↓
GEE API Response: { features: [...] }
       ↓
FieldMap State: setSelectedCSBField(field)
       ↓
UI: Field Highlight + Confirmation Panel
       ↓
User: Click "Analyze This Field"
       ↓
Parent: onFieldSelected({ clu_id, geometry, acres, ... })
       ↓
Router: Navigate to /field-analysis/{clu_id}
```

## API Client Architecture

```
┌─────────────────────────────────────────────────┐
│  geeApiClient (Singleton)                       │
│  src/lib/geeApiClient.ts                        │
├─────────────────────────────────────────────────┤
│  Properties:                                    │
│  - baseURL: GEE API URL                         │
│  - client: Axios instance with interceptors     │
│                                                  │
│  Methods:                                       │
│  • getCSBTileURL() → string                     │
│    Returns: '/csb/tiles/{z}/{x}/{y}'            │
│                                                  │
│  • getCSBBounds(params) → CSBBounds             │
│    Params: { lat, lng, buffer }                 │
│    Returns: GeoJSON FeatureCollection           │
│                                                  │
│  • getFieldDetails(cluId) → CSBFieldDetails     │
│    Params: cluId string                         │
│    Returns: Field details with geometry         │
│                                                  │
│  • queryFieldAtPoint(lat, lng) → Field | null   │
│    Combines getCSBBounds + returns first field  │
│                                                  │
│  • healthCheck() → { status, timestamp }        │
│    Verifies API is running                      │
└─────────────────────────────────────────────────┘
```

## Hook Architecture (Optional - Not Currently Used)

```
┌─────────────────────────────────────────────────┐
│  useCSBFields Hook                              │
│  src/hooks/useCSBFields.ts                      │
├─────────────────────────────────────────────────┤
│  State:                                         │
│  - bounds: CSBBounds | null                     │
│  - selectedField: CSBFieldDetails | null        │
│  - loading: boolean                             │
│  - error: string | null                         │
│                                                  │
│  Actions:                                       │
│  - fetchBounds(params)                          │
│  - selectFieldAtPoint(lat, lng)                 │
│  - selectFieldById(cluId)                       │
│  - clearSelection()                             │
│  - clearError()                                 │
│                                                  │
│  Usage Example:                                 │
│  const { selectedField, selectFieldAtPoint } =  │
│    useCSBFields()                               │
│                                                  │
│  await selectFieldAtPoint(lat, lng)             │
└─────────────────────────────────────────────────┘
```

## FieldMap Component - CSB Integration

```
┌─────────────────────────────────────────────────┐
│  FieldMap Component                             │
│  src/components/FieldAnalysis/FieldMap.tsx      │
├─────────────────────────────────────────────────┤
│  Props (CSB-related):                           │
│  - showCSBLayer: boolean                        │
│  - onCSBLayerToggle: () => void                 │
│  - onFieldSelected: (field) => void             │
│                                                  │
│  State:                                         │
│  - selectedCSBField: CSBFieldDetails | null     │
│  - isSelectingField: boolean                    │
│                                                  │
│  Refs:                                          │
│  - csbLayerRef: L.TileLayer                     │
│  - selectedFieldLayerRef: L.GeoJSON             │
│                                                  │
│  Effects:                                       │
│  1. CSB Tile Layer Effect                       │
│     - Adds L.tileLayer with CSB tiles           │
│     - Registers map click handler (browse mode) │
│     - Queries GEE API on click                  │
│     - Highlights selected field                 │
│     - Shows confirmation panel                  │
│                                                  │
│  2. Layer Cleanup Effect                        │
│     - Removes layers when toggled off           │
│     - Clears click handlers                     │
│                                                  │
│  UI Components:                                 │
│  - CSB Layer Toggle (in layer controls)         │
│  - Browse Instructions                          │
│  - Field Selection Confirmation Panel           │
│  - Loading State Indicator                      │
│  - Error Messages                               │
└─────────────────────────────────────────────────┘
```

## Type System

```
┌─────────────────────────────────────────────────┐
│  Type Definitions                               │
│  src/types/geeApi.ts                            │
├─────────────────────────────────────────────────┤
│                                                  │
│  interface CSBBounds {                          │
│    type: 'FeatureCollection'                    │
│    features: Array<{                            │
│      type: 'Feature'                            │
│      properties: {                              │
│        clu_id: string                           │
│        acres: number                            │
│        state: string                            │
│        county: string                           │
│        farm_number?: string                     │
│        tract_number?: string                    │
│        field_number?: string                    │
│      }                                           │
│      geometry: Polygon | MultiPolygon           │
│    }>                                            │
│  }                                               │
│                                                  │
│  interface CSBFieldDetails {                    │
│    clu_id: string                               │
│    acres: number                                │
│    state: string                                │
│    county: string                               │
│    geometry: Polygon | MultiPolygon             │
│    centroid: { lat: number, lng: number }       │
│    ... (farm/tract/field numbers)               │
│  }                                               │
│                                                  │
│  interface CSBQueryParams {                     │
│    lat: number                                  │
│    lng: number                                  │
│    buffer?: number  // default: 100m            │
│  }                                               │
│                                                  │
│  interface GEEAPIError {                        │
│    error: string                                │
│    detail?: string                              │
│    status?: number                              │
│  }                                               │
└─────────────────────────────────────────────────┘
```

## Layer Toggle Flow

```
User Clicks CSB Toggle in Layer Controls
       ↓
Parent Component: setShowCSBLayer(!showCSBLayer)
       ↓
FieldMap receives new showCSBLayer prop
       ↓
useEffect([showCSBLayer, ...]) triggers
       ↓
┌──────────────────────────────────────┐
│ showCSBLayer = true?                 │
├──────────────────────────────────────┤
│ YES:                                 │
│  - Add CSB tile layer to map         │
│  - Register click handler (browse)   │
│  - Store layer in csbLayerRef        │
│                                       │
│ NO:                                  │
│  - Remove CSB tile layer             │
│  - Remove click handler              │
│  - Clear selected field              │
│  - Remove highlight layer            │
└──────────────────────────────────────┘
```

## Field Selection UI States

```
┌─────────────────────────────────────────────────┐
│  State 1: Waiting for Selection                │
│  ┌───────────────────────────────────────────┐ │
│  │  💡 Click on a field boundary to select  │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  State 2: Selecting (Loading)                  │
│  ┌───────────────────────────────────────────┐ │
│  │  ⏳ Loading field...                      │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  State 3: Field Selected                       │
│  ┌───────────────────────────────────────────┐ │
│  │  ✓ Field Selected              [Clear]   │ │
│  │  ──────────────────────────────────────  │ │
│  │  CLU ID: IA-STORY-123456                  │ │
│  │  Area: 85.43 acres                        │ │
│  │  State: Iowa      County: Story           │ │
│  │  ──────────────────────────────────────  │ │
│  │  [ Analyze This Field ]                   │ │
│  └───────────────────────────────────────────┘ │
│                                                  │
│  [Field highlighted in green on map]            │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  State 4: Error                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  ❌ No field found at this location.      │ │
│  │     Try clicking inside a field boundary. │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

## GEE API Endpoints Used

```
┌─────────────────────────────────────────────────┐
│  Endpoint 1: CSB Tiles                          │
│  GET /csb/tiles/{z}/{x}/{y}                     │
├─────────────────────────────────────────────────┤
│  Purpose: Raster tiles for field boundaries    │
│  Format: PNG image (256x256)                    │
│  Zoom Range: 3-18                               │
│  Usage: Leaflet TileLayer                       │
│  Performance: ~100-300ms per tile               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Endpoint 2: CSB Bounds                         │
│  GET /csb/bounds?lat={lat}&lng={lng}&buffer=10  │
├─────────────────────────────────────────────────┤
│  Purpose: Query fields near a point             │
│  Returns: GeoJSON FeatureCollection             │
│  Buffer: 10 meters (for point clicks)           │
│  Performance: ~500-2000ms                       │
│  Usage: Field selection click handler           │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Endpoint 3: Field Details                      │
│  GET /csb/field-details/{clu_id}                │
├─────────────────────────────────────────────────┤
│  Purpose: Get full field details by CLU ID      │
│  Returns: CSBFieldDetails object                │
│  Performance: ~300-800ms                        │
│  Usage: Future enhancement (direct CLU lookup)  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Endpoint 4: Health Check                       │
│  GET /health                                    │
├─────────────────────────────────────────────────┤
│  Purpose: Verify API availability              │
│  Returns: { status: "ok", timestamp: "..." }    │
│  Performance: ~50-150ms                         │
│  Usage: Diagnostics and testing                 │
└─────────────────────────────────────────────────┘
```

## Environment Configuration

```
┌─────────────────────────────────────────────────┐
│  .env.local                                     │
├─────────────────────────────────────────────────┤
│  NEXT_PUBLIC_GEE_API_URL=                       │
│    https://gee-api-production.up.railway.app    │
│                                                  │
│  Used by: src/lib/geeApiClient.ts               │
│  Default: Same Railway URL if not set           │
│  Prefix: NEXT_PUBLIC_ makes it client-side      │
└─────────────────────────────────────────────────┘
```

## Error Handling Flow

```
User Clicks on Map
       ↓
Try: queryFieldAtPoint(lat, lng)
       ↓
┌─────────────────────────────────────┐
│  API Call Success?                  │
├─────────────────────────────────────┤
│  YES:                               │
│    - field !== null?                │
│      - YES: Show confirmation       │
│      - NO: Show "no field found"    │
│                                      │
│  NO (Error):                        │
│    - Catch error                    │
│    - Log to console                 │
│    - Show "failed to select field"  │
│    - Clear loading state            │
└─────────────────────────────────────┘
```

## Integration Points

```
┌─────────────────────────────────────────────────┐
│  Current Integration                            │
├─────────────────────────────────────────────────┤
│  ✅ Field Analysis Module                       │
│     - Browse and select fields                  │
│     - Extract geometry for analysis             │
│     - Display on analysis map                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Future Integrations                            │
├─────────────────────────────────────────────────┤
│  🔄 RUSLE-EOS Module (Planned)                  │
│     - Use CSB geometry for erosion calc         │
│     - Pre-fill field boundaries                 │
│                                                  │
│  🔄 Soil Map Module (Planned)                   │
│     - Overlay CSB on soil data                  │
│     - Field-level soil queries                  │
│                                                  │
│  🔄 Conservation Planning (Future)              │
│     - Multi-field selection                     │
│     - Farm-level planning                       │
└─────────────────────────────────────────────────┘
```
