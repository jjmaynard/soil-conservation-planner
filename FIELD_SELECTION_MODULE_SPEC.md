# Field Selection Spatial Interface Module
## Implementation Specification for AI Agents

**Version:** 1.0  
**Date:** February 4, 2026  
**Purpose:** Reusable field selection module for spatial interface across multiple applications

---

## Table of Contents

1. [Overview](#overview)
2. [Module Architecture](#module-architecture)
3. [Required Files](#required-files)
4. [Dependencies](#dependencies)
5. [Integration Guide](#integration-guide)
6. [API Reference](#api-reference)
7. [Data Flow](#data-flow)
8. [Implementation Examples](#implementation-examples)

---

## Overview

### Purpose
The Field Selection Spatial Interface Module provides a standardized, reusable component for selecting agricultural fields through multiple methods:
- **Browse**: Interactive map selection using CSB (Conservation Stewardship Boundaries) or CLU (Common Land Unit) layers
- **Draw**: Manual field boundary drawing with polygon tools
- **Upload**: File upload support for shapefiles, KML, or GeoJSON
- **Search**: Location-based search with geocoding

### Current Implementations
- Field Analysis Module (primary implementation)
- RUSLE-EOS Tool (erosion assessment)
- Conservation Planning Wizard (multi-field selection)
- Suitability Analysis (pending)

### Key Features
- Multi-method field selection
- Interactive Leaflet map with satellite imagery
- CSB/CLU layer integration via Google Earth Engine API
- Drawing and editing tools (Leaflet.Draw)
- Geometry validation and area calculation
- Cross-module field data exchange via sessionStorage
- Responsive design with mobile support

---

## Module Architecture

### Component Hierarchy

```
FieldSelectionModule/
├── FieldSelectionInterface.tsx     (Main container component)
├── FieldMap.tsx                    (Interactive map component)
├── UseCaseSelector.tsx             (Optional: Analysis type selection)
├── SelectionMethodTabs.tsx         (Browse/Draw/Upload/Search tabs)
├── FieldInfoPanel.tsx              (Selected field details display)
└── types/
    └── fieldSelection.ts           (TypeScript type definitions)
```

### Data Flow

```
Parent Module (RUSLE, Suitability, etc.)
    ↓
FieldSelectionInterface
    ↓
FieldMap (Leaflet + Drawing Tools)
    ↓
User Interaction (Click, Draw, Upload)
    ↓
Field Data Validation
    ↓
onFieldSelected Callback
    ↓
Parent Module receives field data
```

---

## Required Files

### Core Components (MUST COPY)

#### 1. **FieldMap.tsx** (Primary Component)
**Path:** `src/components/FieldAnalysis/FieldMap.tsx`  
**Size:** ~1380 lines  
**Purpose:** Interactive Leaflet map with drawing tools and layer controls

**Key Features:**
- Leaflet map initialization with satellite base layers
- CSB tile layer integration from GEE API
- Interactive field selection from CSB boundaries
- Drawing tools for custom boundaries (Leaflet.Draw)
- Geometry validation (min 0.1 acres, max 10,000 acres)
- Area calculation using Turf.js
- Field boundary editing capabilities
- Multi-layer support (satellite, boundaries, overlays)

**Critical Dependencies:**
```tsx
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import 'leaflet-draw'
import * as turf from '@turf/turf'
import { geeApi } from '#lib/geeApiClient'
```

**Props Interface:**
```typescript
interface FieldMapProps {
  mode: 'search' | 'browse' | 'draw' | 'upload' | 'analysis'
  searchQuery?: string
  fieldData?: any
  selectedSoil?: any
  activeLayers?: string[]
  showCLULayer?: boolean
  showCSBLayer?: boolean
  onFieldSelected?: (field: any) => void
  onLayerToggle?: (layerId: string) => void
  onCSBLayerToggle?: () => void
  onMapReady?: (controls: { 
    panToLocation: (lat: number, lng: number, zoom?: number) => void 
  }) => void
}

export interface FieldMapRef {
  panToLocation: (lat: number, lng: number, zoom?: number) => void
}
```

**Field Data Output Format:**
```typescript
{
  csb_id?: string              // CSB field identifier
  clu_id?: string              // CLU field identifier  
  name: string                 // Field name
  acres: number                // Field area in acres
  geometry: GeoJSON.Polygon    // Field boundary geometry
  center: [number, number]     // [lat, lng] center point
  cropHistory?: Array<{        // Historical crop data
    year: number
    crop: string
    cropType: string
  }>
  patternType?: string         // Crop rotation pattern
  state?: string               // State name
  county?: string              // County name
}
```

#### 2. **UseCaseSelector.tsx** (Optional but Recommended)
**Path:** `src/components/FieldAnalysis/UseCaseSelector.tsx`  
**Size:** ~160 lines  
**Purpose:** Allow users to specify analysis intent

**Use Cases:**
- `erosion`: Erosion & Conservation Planning
- `production`: Production Optimization
- `water`: Water Management
- `compliance`: Compliance & Documentation
- `comprehensive`: Full Analysis

**When to Include:**
- ✅ Multi-purpose analysis tools
- ✅ Applications with different workflows based on user intent
- ✅ Module that needs to filter/prioritize features
- ❌ Single-purpose tools (e.g., RUSLE-EOS only does erosion)
- ❌ Simple field selection without downstream analysis

#### 3. **Field Selection Container Page**
**Path:** `src/pages/field-analysis/index.tsx` (Reference Implementation)  
**Size:** ~598 lines  
**Purpose:** Container page orchestrating field selection flow

**Key Sections to Extract:**

**a. State Management:**
```typescript
type SelectionMethod = 'search' | 'browse' | 'draw' | 'upload' | null

const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null)
const [selectionMethod, setSelectionMethod] = useState<SelectionMethod>('browse')
const [searchQuery, setSearchQuery] = useState('')
const [showCLULayer, setShowCLULayer] = useState(false)
const [showCSBLayer, setShowCSBLayer] = useState(true)
const [uploadedFile, setUploadedFile] = useState<File | null>(null)
```

**b. Cross-Module Integration Logic:**
```typescript
// Check for return-to flags from other modules
useEffect(() => {
  if (typeof window !== 'undefined') {
    const planningFlag = sessionStorage.getItem('returnToPlanningWizard')
    const rusleFlag = sessionStorage.getItem('returnToRUSLE')
    setIsFromPlanningWizard(planningFlag === 'true')
    setIsFromRUSLE(rusleFlag === 'true')
  }
}, [])

// Field selection handler with cross-module routing
const handleFieldSelected = useCallback((fieldData: any) => {
  const returnToRUSLE = sessionStorage.getItem('returnToRUSLE') === 'true'
  
  if (returnToRUSLE) {
    sessionStorage.removeItem('returnToRUSLE')
    sessionStorage.setItem('rusleSelectedField', JSON.stringify(fieldData))
    router.push(`/tools/rusle-eos?fieldId=${fieldId}`)
  } else {
    // Normal flow
    router.push(`/field-analysis/${fieldId}`)
  }
}, [router])
```

**c. Method Selection Tabs UI:**
```tsx
<div className="grid grid-cols-3 border-b border-gray-200">
  <button
    onClick={() => setSelectionMethod('browse')}
    className="px-4 py-3 text-sm font-medium transition-all border-b-2"
    style={{
      color: selectionMethod === 'browse' ? '#1f2937' : '#6b7280',
      borderBottomColor: selectionMethod === 'browse' 
        ? 'var(--color-conservation)' 
        : 'transparent',
      backgroundColor: selectionMethod === 'browse' ? '#ffffff' : '#f3f4f6'
    }}
  >
    Browse Map
  </button>
  {/* Repeat for draw, upload */}
</div>
```

### Supporting Files

#### 4. **GEE API Client**
**Path:** `src/lib/geeApiClient.ts`  
**Purpose:** Google Earth Engine API integration for CSB layers

**Required Methods:**
```typescript
class GeeApiClient {
  async getCSBTileUrl(params?: { year?: number }): Promise<string>
  async getCSBFieldDetails(lat: number, lng: number): Promise<CSBFieldDetails>
  async getFieldCropHistory(geometry: GeoJSON.Polygon): Promise<CropHistoryResponse>
}

export const geeApi = new GeeApiClient()
```

**CSB Field Details Type:**
```typescript
interface CSBFieldDetails {
  csb_id: string
  geometry: GeoJSON.Polygon
  area_acres: number
  center: [number, number]
  state_code: string
  county_code: string
  crop_history?: CropHistoryItem[]
  pattern_type?: string
}
```

#### 5. **Type Definitions**
**Path:** `src/types/geeApi.ts`

```typescript
export interface CSBFieldDetails {
  csb_id: string
  geometry: GeoJSON.Polygon
  area_acres: number
  center: [number, number]
  state_code: string
  county_code?: string
  crop_history?: CropHistoryItem[]
  pattern_type?: string
}

export interface CropHistoryItem {
  year: number
  crop_code: string
  crop_name: string
  crop_type: string
}
```

### Static Assets

#### 6. **Leaflet Marker Icons**
**Path:** `public/leaflet/`

Required files:
- `marker-icon.png` (25x41px)
- `marker-icon-2x.png` (50x82px, retina)
- `marker-shadow.png` (41x41px)

**Download from:** https://unpkg.com/leaflet@1.9.4/dist/images/

---

## Dependencies

### NPM Packages (package.json)

```json
{
  "dependencies": {
    "leaflet": "^1.9.4",
    "leaflet-draw": "^1.0.4",
    "@turf/turf": "^6.5.0",
    "react": "^18.2.0",
    "next": "^14.0.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@types/leaflet": "^1.9.8",
    "@types/leaflet-draw": "^1.0.11",
    "typescript": "^5.0.0"
  }
}
```

### CSS Imports

```typescript
// In FieldMap.tsx or global CSS
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_GEE_API_URL=https://your-gee-api-endpoint.com
```

---

## Integration Guide

### Step 1: Create Field Selection Route

**Option A: Standalone Page** (Recommended for most use cases)
```
/field-selection
```

**Option B: Embedded in Parent Module**
```
/tools/rusle-eos (with field selection UI embedded)
```

### Step 2: Copy Core Files

```bash
# Copy FieldMap component
cp src/components/FieldAnalysis/FieldMap.tsx \
   src/components/FieldSelection/FieldMap.tsx

# Copy types
cp src/types/geeApi.ts \
   src/types/geeApi.ts

# Copy GEE API client
cp src/lib/geeApiClient.ts \
   src/lib/geeApiClient.ts

# Optional: Copy UseCaseSelector if needed
cp src/components/FieldAnalysis/UseCaseSelector.tsx \
   src/components/FieldSelection/UseCaseSelector.tsx
```

### Step 3: Create Container Component

```tsx
// src/pages/field-selection/index.tsx

import { useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'

const FieldMap = dynamic(() => import('#components/FieldSelection/FieldMap'), {
  ssr: false,
  loading: () => <div>Loading map...</div>
})

export default function FieldSelection() {
  const router = useRouter()
  const [selectionMethod, setSelectionMethod] = useState<'browse' | 'draw' | 'upload'>('browse')
  
  const handleFieldSelected = useCallback((fieldData: any) => {
    // Get return destination from sessionStorage
    const returnTo = sessionStorage.getItem('returnToModule')
    const fieldKey = sessionStorage.getItem('fieldDataKey') || 'selectedField'
    
    // Store field data
    sessionStorage.setItem(fieldKey, JSON.stringify(fieldData))
    sessionStorage.removeItem('returnToModule')
    sessionStorage.removeItem('fieldDataKey')
    
    // Return to calling module
    if (returnTo) {
      router.push(returnTo)
    } else {
      // Default behavior
      router.push(`/analysis/${fieldData.csb_id || fieldData.clu_id}`)
    }
  }, [router])
  
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 bg-white border-b">
        <h1 className="text-2xl font-bold">Select Field</h1>
      </div>
      
      {/* Method Selection Tabs */}
      <div className="grid grid-cols-3 border-b">
        {/* Tab buttons here */}
      </div>
      
      {/* Map */}
      <div className="flex-1">
        <FieldMap
          mode={selectionMethod}
          showCSBLayer={selectionMethod === 'browse'}
          onFieldSelected={handleFieldSelected}
        />
      </div>
    </div>
  )
}
```

### Step 4: Implement in Parent Module

**Example: RUSLE-EOS Integration**

```tsx
// src/pages/tools/rusle-eos.tsx

export default function RUSLEEOSPage() {
  const router = useRouter()
  const [selectedField, setSelectedField] = useState<any>(null)
  
  // Load field data on mount if returning from field selection
  useEffect(() => {
    const fieldData = sessionStorage.getItem('rusleSelectedField')
    if (fieldData) {
      setSelectedField(JSON.parse(fieldData))
      sessionStorage.removeItem('rusleSelectedField')
    }
  }, [])
  
  const handleSelectField = () => {
    // Set return flags
    sessionStorage.setItem('returnToRUSLE', 'true')
    sessionStorage.setItem('fieldDataKey', 'rusleSelectedField')
    
    // Navigate to field selection
    router.push('/field-selection')
  }
  
  return (
    <div>
      {!selectedField ? (
        <button onClick={handleSelectField}>
          Select Field
        </button>
      ) : (
        <div>
          <h2>{selectedField.name}</h2>
          <p>{selectedField.acres} acres</p>
          {/* RUSLE analysis UI */}
        </div>
      )}
    </div>
  )
}
```

---

## API Reference

### FieldMap Component

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `mode` | `'search' \| 'browse' \| 'draw' \| 'upload' \| 'analysis'` | Yes | - | Selection method |
| `searchQuery` | `string` | No | `undefined` | Search location query |
| `fieldData` | `any` | No | `undefined` | Pre-loaded field data (analysis mode) |
| `showCLULayer` | `boolean` | No | `false` | Show CLU boundaries |
| `showCSBLayer` | `boolean` | No | `true` | Show CSB boundaries |
| `onFieldSelected` | `(field: any) => void` | No | `undefined` | Callback when field is selected |
| `onMapReady` | `(controls: MapControls) => void` | No | `undefined` | Called when map initializes |

#### Methods (via ref)

```typescript
const mapRef = useRef<FieldMapRef>(null)

// Pan to specific location
mapRef.current?.panToLocation(lat, lng, zoom)
```

#### Events

**onFieldSelected Callback Data:**
```typescript
{
  csb_id?: string
  clu_id?: string
  name: string
  acres: number
  geometry: GeoJSON.Polygon
  center: [number, number]
  cropHistory?: CropHistoryItem[]
  patternType?: string
  state?: string
  county?: string
}
```

### GEE API Client Methods

```typescript
// Get CSB tile layer URL
const tileUrl = await geeApi.getCSBTileUrl({ year: 2023 })

// Get field details at lat/lng
const fieldDetails = await geeApi.getCSBFieldDetails(lat, lng)

// Get crop history for geometry
const history = await geeApi.getFieldCropHistory(geometry)
```

---

## Data Flow

### Scenario 1: RUSLE-EOS Field Selection

```
┌─────────────────┐
│  RUSLE-EOS Page │
└────────┬────────┘
         │ 1. User clicks "Select Field"
         │ 2. Set sessionStorage flags:
         │    - returnToRUSLE = true
         │    - fieldDataKey = rusleSelectedField
         ↓
┌─────────────────────┐
│ Field Selection Page│
└────────┬────────────┘
         │ 3. User selects field
         │ 4. Field data validated
         │ 5. onFieldSelected(fieldData)
         ↓
┌────────────────────────────┐
│ sessionStorage.setItem()   │
│ 'rusleSelectedField', JSON │
└────────┬───────────────────┘
         │ 6. Clear flags
         │ 7. router.push('/tools/rusle-eos')
         ↓
┌─────────────────┐
│  RUSLE-EOS Page │
│ (with field)    │
└─────────────────┘
         │ 8. Read rusleSelectedField
         │ 9. Display field info
         │ 10. Run RUSLE analysis
```

### Scenario 2: Multi-Field Planning Wizard

```
┌──────────────────────┐
│ Planning Wizard      │
│ Step 2: Fields       │
└────────┬─────────────┘
         │ Loop: Add multiple fields
         ↓
┌─────────────────────┐
│ Field Selection     │
└────────┬────────────┘
         │ Select field
         ↓
┌──────────────────────────────┐
│ Append to selectedFields[]   │
│ in wizardState               │
└────────┬─────────────────────┘
         │ Return to wizard
         ↓
┌──────────────────────┐
│ Planning Wizard      │
│ Shows: Field 1, 2, 3 │
└──────────────────────┘
```

---

## Implementation Examples

### Example 1: Simple Field Selection (No Use Case)

```tsx
// pages/select-field.tsx
import { useState } from 'react'
import { useRouter } from 'next/router'
import FieldMap from '#components/FieldSelection/FieldMap'

export default function SelectField() {
  const router = useRouter()
  const [method, setMethod] = useState<'browse' | 'draw'>('browse')
  
  return (
    <div className="h-screen">
      <FieldMap
        mode={method}
        showCSBLayer={method === 'browse'}
        onFieldSelected={(field) => {
          sessionStorage.setItem('selectedField', JSON.stringify(field))
          router.push('/analysis')
        }}
      />
    </div>
  )
}
```

### Example 2: With Use Case Selection

```tsx
import { useState } from 'react'
import UseCaseSelector from '#components/FieldSelection/UseCaseSelector'
import FieldMap from '#components/FieldSelection/FieldMap'

export default function FieldSelectionWithUseCase() {
  const [useCase, setUseCase] = useState<UseCase | null>(null)
  const [method, setMethod] = useState<'browse'>('browse')
  
  if (!useCase) {
    return (
      <UseCaseSelector
        selectedUseCase={useCase}
        onSelect={setUseCase}
      />
    )
  }
  
  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <h1>Field Selection - {useCase}</h1>
      </div>
      <div className="flex-1">
        <FieldMap
          mode={method}
          showCSBLayer
          onFieldSelected={(field) => {
            sessionStorage.setItem('selectedField', JSON.stringify(field))
            sessionStorage.setItem('selectedUseCase', useCase)
            router.push(`/analysis/${field.csb_id}`)
          }}
        />
      </div>
    </div>
  )
}
```

### Example 3: Embedded in Parent Module

```tsx
// pages/suitability/index.tsx
import { useState } from 'react'
import FieldMap from '#components/FieldSelection/FieldMap'
import SuitabilityResults from '#components/Suitability/Results'

export default function SuitabilityPage() {
  const [selectedField, setSelectedField] = useState<any>(null)
  const [showMap, setShowMap] = useState(true)
  
  return (
    <div className="h-screen flex">
      {/* Sidebar with field selector */}
      <div className="w-96 border-r">
        {!selectedField ? (
          <div className="p-4">
            <h2>Select Field for Suitability Analysis</h2>
            <button onClick={() => setShowMap(true)}>
              Browse Map
            </button>
          </div>
        ) : (
          <div className="p-4">
            <h3>{selectedField.name}</h3>
            <button onClick={() => setSelectedField(null)}>
              Change Field
            </button>
          </div>
        )}
      </div>
      
      {/* Main content */}
      <div className="flex-1">
        {showMap && !selectedField ? (
          <FieldMap
            mode="browse"
            showCSBLayer
            onFieldSelected={(field) => {
              setSelectedField(field)
              setShowMap(false)
            }}
          />
        ) : (
          <SuitabilityResults field={selectedField} />
        )}
      </div>
    </div>
  )
}
```

---

## SessionStorage Keys Reference

### Standard Keys

| Key | Value Type | Description | Used By |
|-----|------------|-------------|---------|
| `returnToRUSLE` | `'true' \| null` | Flag to return to RUSLE-EOS | RUSLE-EOS |
| `returnToPlanningWizard` | `'true' \| null` | Flag to return to planning wizard | Planning Wizard |
| `returnToModule` | `string` | Generic return path (e.g., '/tools/my-tool') | Any module |
| `rusleSelectedField` | `JSON string` | Field data for RUSLE-EOS | RUSLE-EOS |
| `selectedField` | `JSON string` | Generic selected field data | Any module |
| `fieldDataKey` | `string` | Custom key name for field data | Any module |
| `selectedUseCase` | `UseCase` | Analysis type selection | Field Analysis |
| `planningWizardState` | `JSON string` | Wizard state with selectedFields array | Planning Wizard |

### Custom Integration Pattern

```typescript
// In calling module (before navigation):
sessionStorage.setItem('returnToModule', '/my-module')
sessionStorage.setItem('fieldDataKey', 'myModuleField')
router.push('/field-selection')

// In field selection (after selection):
const returnTo = sessionStorage.getItem('returnToModule')
const fieldKey = sessionStorage.getItem('fieldDataKey')
sessionStorage.setItem(fieldKey, JSON.stringify(fieldData))
router.push(returnTo)

// Back in calling module:
const fieldData = JSON.parse(sessionStorage.getItem('myModuleField'))
```

---

## Validation Rules

### Field Geometry Validation

```typescript
// Minimum area: 0.1 acres (4,356 sq ft)
const MIN_AREA_ACRES = 0.1

// Maximum area: 10,000 acres
const MAX_AREA_ACRES = 10000

// Calculate area using Turf.js
const area = turf.area(polygon) // square meters
const acres = area * 0.000247105

if (acres < MIN_AREA_ACRES) {
  throw new Error('Field must be at least 0.1 acres')
}

if (acres > MAX_AREA_ACRES) {
  throw new Error('Field cannot exceed 10,000 acres')
}
```

### Polygon Validation

```typescript
// Must be a valid polygon
const isValid = turf.booleanValid(polygon)

// Must not self-intersect
const kinks = turf.kinks(polygon)
if (kinks.features.length > 0) {
  throw new Error('Polygon cannot intersect itself')
}

// Must have at least 3 vertices
if (polygon.geometry.coordinates[0].length < 4) { // 4 because first === last
  throw new Error('Polygon must have at least 3 vertices')
}
```

---

## Styling Guidelines

### Map Container

```css
.field-map-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

/* Full-screen mode */
.field-map-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}
```

### Layer Control Panel

```tsx
<div 
  className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4"
  style={{ zIndex: 1000 }}
>
  {/* Layer toggles */}
</div>
```

### Selected Field Highlight

```typescript
const selectedFieldStyle = {
  color: '#16a34a',        // Green border
  weight: 3,
  fillColor: '#16a34a',
  fillOpacity: 0.2,
  dashArray: '5, 5'        // Dashed border
}
```

---

## Error Handling

### GEE API Errors

```typescript
try {
  const fieldDetails = await geeApi.getCSBFieldDetails(lat, lng)
} catch (error) {
  if (error.message.includes('404')) {
    // No CSB boundary at this location
    showError('No field boundary found at this location')
  } else if (error.message.includes('timeout')) {
    // API timeout
    showError('Request timed out. Please try again.')
  } else {
    // Generic error
    showError('Failed to load field data')
  }
}
```

### Drawing Errors

```typescript
map.on('draw:drawvertex', (e) => {
  const layer = e.layers.getLayers()[0]
  const area = turf.area(layer.toGeoJSON())
  const acres = area * 0.000247105
  
  if (acres > MAX_AREA_ACRES) {
    setValidationError(`Field too large (${acres.toFixed(1)} acres). Max: ${MAX_AREA_ACRES} acres`)
    // Prevent drawing
  } else {
    setValidationError('')
  }
})
```

---

## Performance Optimization

### Dynamic Import

```typescript
// Always use dynamic import for Leaflet components
const FieldMap = dynamic(() => import('#components/FieldSelection/FieldMap'), {
  ssr: false, // Disable server-side rendering
  loading: () => <LoadingSpinner />
})
```

### Tile Layer Optimization

```typescript
const csbTileLayer = L.tileLayer(tileUrl, {
  maxZoom: 18,
  minZoom: 10,
  updateWhenIdle: true,     // Only update when map stops moving
  updateWhenZooming: false, // Don't update while zooming
  keepBuffer: 2             // Keep 2 screens of tiles in memory
})
```

### Debounce Search

```typescript
import { debounce } from 'lodash'

const debouncedSearch = debounce(async (query: string) => {
  const results = await searchLocations(query)
  setSearchResults(results)
}, 500) // 500ms delay
```

---

## Testing Checklist

### Integration Tests

- [ ] Field selection from CSB layer works
- [ ] Drawing custom boundaries works
- [ ] Area calculation is accurate
- [ ] Geometry validation works (min/max area)
- [ ] Cross-module navigation works (sessionStorage flow)
- [ ] Field data persists across page transitions
- [ ] Multiple field selection works (Planning Wizard)
- [ ] Return-to navigation clears flags properly

### Browser Compatibility

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS/iOS)
- [ ] Mobile browsers (iOS Safari, Chrome Android)

### Responsive Design

- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## AI Agent Implementation Prompt Template

Use this prompt when instructing an AI agent to implement field selection:

```
Implement a field selection spatial interface module using the following specifications:

1. COPY these files from the reference implementation:
   - src/components/FieldAnalysis/FieldMap.tsx → src/components/FieldSelection/FieldMap.tsx
   - src/lib/geeApiClient.ts (if not exists)
   - src/types/geeApi.ts (if not exists)

2. CREATE a new page at /field-selection with:
   - Tab navigation for Browse/Draw/Upload methods
   - FieldMap component integration
   - Field selection callback handling
   - Cross-module return logic using sessionStorage

3. IMPLEMENT cross-module integration:
   - Set sessionStorage flags before navigation:
     * returnToModule: destination path
     * fieldDataKey: storage key name
   - Read flags in field selection page
   - Store selected field data
   - Navigate back to calling module
   - Clean up sessionStorage flags

4. INTEGRATE in [MODULE_NAME]:
   - Add "Select Field" button
   - Set sessionStorage flags and navigate to /field-selection
   - Read field data on component mount
   - Display field information

5. USE these design patterns from DESIGN_SPECIFICATIONS.md:
   - Color scheme: Conservation Green (#5C8D5A)
   - Gradient: linear-gradient(135deg, #5C8D5A 0%, #4F7A4D 100%)
   - Typography: Catamaran font
   - Component patterns: Tabs, Buttons, Modals

6. DEPENDENCIES to install:
   npm install leaflet leaflet-draw @turf/turf
   npm install -D @types/leaflet @types/leaflet-draw

7. VALIDATION rules:
   - Min area: 0.1 acres
   - Max area: 10,000 acres
   - Valid polygon geometry
   - No self-intersections

8. ERROR HANDLING:
   - GEE API failures
   - Geometry validation errors
   - Navigation state management

The implementation should be production-ready and follow all patterns from the reference implementation.
```

---

## Quick Reference

### Minimal Working Example

```tsx
// Minimal field selection page
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

const FieldMap = dynamic(() => import('#components/FieldSelection/FieldMap'), { ssr: false })

export default function MinimalFieldSelection() {
  const router = useRouter()
  
  return (
    <div style={{ height: '100vh' }}>
      <FieldMap
        mode="browse"
        showCSBLayer
        onFieldSelected={(field) => {
          console.log('Selected field:', field)
          sessionStorage.setItem('selectedField', JSON.stringify(field))
          router.push('/analysis')
        }}
      />
    </div>
  )
}
```

### File Checklist

- [ ] FieldMap.tsx (1380 lines)
- [ ] geeApiClient.ts
- [ ] geeApi types
- [ ] Leaflet marker icons (3 PNG files)
- [ ] CSS imports (leaflet, leaflet-draw)
- [ ] package.json dependencies

---

**End of Field Selection Module Specification**

*This document provides all necessary information for AI agents or developers to implement a standalone field selection spatial interface module that integrates with multiple parent applications.*
