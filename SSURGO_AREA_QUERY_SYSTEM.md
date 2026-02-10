# SSURGO Area Query System

## Overview

The SSURGO Area Query System provides a comprehensive interface for querying NRCS Soil Data Access (SDA) API using user-delineated areas. The system converts spatial geometries to WKT format, executes SQL queries against the SDA API, and processes responses into TypeScript-typed data structures.

**API Endpoint:** `https://SDMDataAccess.sc.egov.usda.gov/Tabular/post.rest`

## Core Library Files

### 1. `src/lib/ssurgo-area-query.ts` (674 lines)
**Primary query library** - handles all SSURGO API interactions.

**Key Functions:**
- `querySSURGOByArea()` - Main query function supporting 4 query types
- `geometryToWKT()` - Converts Leaflet/GeoJSON/array geometries to WKT format
- `wktToGeoJSON()` - Parses WKT strings back to GeoJSON
- `executeSDAQuery()` - Low-level API call executor with timeout handling

**Query Types:**
1. `mukey` - Map unit keys only (fastest, basic info)
2. `mupolygon` - Map units with geometry polygons and area calculations
3. `components` - Detailed soil component data (major components, slopes, drainage)
4. `comprehensive` - Full data including horizons and interpretations

**Type Exports:**
- `MapUnitBasic` - mukey, musym, muname
- `MapUnitPolygon` - includes WKT geometry and area
- `MapUnitWithComponents` - includes Component array
- `MapUnitComprehensive` - includes ComponentComprehensive with horizons/interpretations
- `SSURGOQueryOptions` - Query configuration interface

## React Hooks

### 2. `src/hooks/useSSURGOAreaQuery.ts` (240 lines)
**State management hooks** for SSURGO queries in React components.

**Hooks Provided:**
- `useSSURGOAreaQuery()` - Basic hook with loading/error states and abort support
- `useSSURGOAreaQueryWithCache()` - WKT-based caching to prevent duplicate queries
- `useSSURGOProgressiveQuery()` - Two-stage loading (basic → detailed) for better UX

**Returns:**
```typescript
{
  data: QueryResult | null,
  loading: boolean,
  error: Error | null,
  query: (geometry, options?) => Promise<void>,
  reset: () => void
}
```

### 3. `src/hooks/useFieldSSURGO.ts` (449 lines)
**Field-specific integration hook** for field analysis module.

**Key Features:**
- Queries SSURGO data for field boundaries
- Processes raw API data into farmer-friendly formats
- Calculates area-weighted statistics
- Generates LCC classifications, drainage assessments, erosion risk
- Session storage integration for cross-module data sharing

**Main Function:**
- `processSSURGOData()` - Transforms `MapUnitWithComponents[]` into `ProcessedFieldData`

**Processed Data Structure:**
```typescript
interface ProcessedFieldData {
  soils: Array<{ mapunit_name, symbol, area, percent, lcc, slope, ... }>
  stats: { totalArea, soilTypes, avgSlope, erosionRisk }
  drainage: { hydricSoils, hydricPercent, drainageClasses[] }
  capabilities: { lcc_distribution, irrigation_suitability, ... }
}
```

## Type Definitions

### 4. `src/types/soil.ts`
SSURGO-related TypeScript interfaces:
- `SSURGOData` - Overall soil data structure
- `SSURGOComponent` - Individual soil component
- `SSURGOHorizon` - Soil horizon (layer) data
- `SSURGOInterpretation` - Interpretation ratings
- `SSURGOMapUnit` - Map unit metadata

### 5. `src/types/api.ts`
- `SSURGOQueryRequest` - API request interface for bounding box queries

## Supporting Utilities

### 6. `src/utils/apiClient.ts`
General-purpose API client with `querySSURGO()` method for bounding box queries (alternative to area-based queries).

### 7. `src/lib/tab-data-fetcher.ts`
Tab-specific SSURGO query builders:
- `buildSSURGOQuery()` - General soil properties
- `buildSSURGOProductivityQuery()` - NCCPI productivity ratings
- `buildSSURGOInfiltrationQuery()` - Infiltration capacity for developed lands

### 8. `src/utils/soilInterpretations.ts`
Transforms technical SSURGO data into farmer-friendly language and interpretations.

## Component Integration

Components using SSURGO queries:

**Field Analysis Pages:**
- `src/pages/field-analysis/[fieldId].tsx` - Standard field analysis view
- `src/pages/field-analysis/hybrid/[fieldId].tsx` - Hybrid layout view

**Field Analysis Components:**
- `src/components/FieldAnalysis/SoilComposition.tsx` - Soil breakdown display
- `src/components/FieldAnalysis/DrainageAssessment.tsx` - Drainage analysis
- `src/components/FieldAnalysis/ErosionAnalysis.tsx` - Erosion risk assessment
- `src/components/FieldAnalysis/FieldStats.tsx` - Field statistics summary
- `src/components/FieldAnalysis/layouts/DetailView.tsx` - Detailed view layout
- `src/components/FieldAnalysis/layouts/DashboardView.tsx` - Dashboard layout

## Query Workflow

```
1. User draws/selects field boundary (Leaflet Polygon, GeoJSON, or coordinates)
   ↓
2. Hook calls querySSURGOByArea(geometry, options)
   ↓
3. Geometry converted to WKT format
   ↓
4. SQL query built based on 'what' parameter
   ↓
5. POST request to SDA API with query
   ↓
6. Response parsed and typed
   ↓
7. (For field analysis) processSSURGOData() transforms to ProcessedFieldData
   ↓
8. Component renders soil data, stats, and visualizations
```

## Key Features

✅ **Multiple query levels** - From basic map units to comprehensive soil data  
✅ **Geometry flexibility** - Accepts Leaflet polygons, GeoJSON, or coordinate arrays  
✅ **Type safety** - Full TypeScript typing for all data structures  
✅ **Caching support** - WKT-based caching to prevent duplicate queries  
✅ **Progressive loading** - Load basic data first, then detailed data  
✅ **Session integration** - Cross-module data sharing via sessionStorage  
✅ **Error handling** - Comprehensive error states and timeout management  
✅ **Abort support** - Cancel in-flight queries when needed  

## Database Support

- Primary: **SSURGO** (Soil Survey Geographic Database)
- Alternative: **STATSGO** (State Soil Geographic Database) - lower resolution

## Configuration Options

```typescript
interface SSURGOQueryOptions {
  what?: 'mukey' | 'mupolygon' | 'components' | 'comprehensive'
  geomIntersection?: boolean  // Return clipped geometry
  geomAcres?: boolean          // Calculate area in acres
  db?: 'SSURGO' | 'STATSGO'   // Database selection
  addFields?: string[]         // Additional SQL fields to include
  timeout?: number             // Query timeout in milliseconds (default: 45000)
}
```

## Usage Examples

### Basic Query
```typescript
const { data, loading, error, query } = useSSURGOAreaQuery()

await query(polygonGeometry, { what: 'mukey' })
// Returns: MapUnitBasic[]
```

### Field Analysis
```typescript
const { fieldData, loading, error, queryField } = useFieldSSURGO()

await queryField(fieldGeometry)
// Returns: ProcessedFieldData with soils, stats, drainage, capabilities
```

### Progressive Query
```typescript
const { basicData, detailedData, loading, stages, query } = useSSURGOProgressiveQuery()

await query(polygonGeometry)
// Stage 1: basicData = MapUnitBasic[]
// Stage 2: detailedData = MapUnitWithComponents[]
```

## Integration with Other Modules

SSURGO data is used across multiple use cases (configured in `src/config/use-cases.ts`):
- Crop suitability analysis
- Conservation planning (RUSLE-EOS)
- Wetland assessments
- Land capability classification
- Native vegetation planning
- Soil health assessments
- Infrastructure planning
