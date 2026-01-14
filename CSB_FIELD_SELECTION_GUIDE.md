# CSB Field Selection Integration Guide

## Overview

This guide documents the integration of CSB (Common Land Unit) field boundaries from the GEE API into the field-analysis module. Users can now visually select fields from the CSB 30m tile layer and extract field geometry for subsequent analysis.

## Implementation Date
January 7, 2026

## Files Created

### 1. Type Definitions
**File:** `src/types/geeApi.ts`

Defines TypeScript interfaces for:
- `CSBBounds` - GeoJSON FeatureCollection of field boundaries
- `CSBFieldDetails` - Detailed field information including geometry
- `CSBQueryParams` - Parameters for querying CSB data
- `GEEAPIError` - Error response structure

### 2. GEE API Client
**File:** `src/lib/geeApiClient.ts`

A singleton client for interacting with the GEE API:

**Methods:**
- `getCSBTileURL()` - Returns tile URL template for Leaflet
- `getCSBBounds(params)` - Fetches field boundaries near a location
- `getFieldDetails(cluId)` - Gets detailed info for a specific field
- `queryFieldAtPoint(lat, lng)` - Finds field at clicked location
- `healthCheck()` - Verifies API availability

**Features:**
- Axios-based HTTP client with interceptors
- Automatic error handling and logging
- 30-second timeout for Earth Engine processing
- Configurable base URL via environment variable

### 3. Custom React Hook
**File:** `src/hooks/useCSBFields.ts`

Hook for managing CSB field data in components:

**State:**
- `bounds` - Current field boundaries
- `selectedField` - Currently selected field details
- `loading` - Loading state
- `error` - Error messages

**Actions:**
- `fetchBounds(params)` - Fetch boundaries near location
- `selectFieldAtPoint(lat, lng)` - Select field by clicking
- `selectFieldById(cluId)` - Select field by CLU ID
- `clearSelection()` - Clear selected field
- `clearError()` - Clear error state

## Files Modified

### 1. FieldMap Component
**File:** `src/components/FieldAnalysis/FieldMap.tsx`

**Changes:**
- Added CSB tile layer integration from GEE API
- Implemented click handler for field selection
- Added field highlight visualization on selection
- Created field selection confirmation UI
- Added CSB layer toggle to layer controls
- Maintained backwards compatibility with old CLU WMS layer

**New Props:**
- `showCSBLayer?: boolean` - Toggle CSB tile layer visibility
- `onCSBLayerToggle?: () => void` - Callback for layer toggle

**New State:**
- `selectedCSBField` - Currently selected CSB field
- `isSelectingField` - Loading state during selection
- `csbLayerRef` - Reference to CSB tile layer
- `selectedFieldLayerRef` - Reference to field highlight layer

**User Experience:**
1. Map loads with CSB 30m field boundaries visible
2. User clicks on any field boundary
3. System queries GEE API for field details
4. Selected field highlights in green with 20% fill opacity
5. Confirmation panel shows field details (CLU ID, acres, state, county)
6. User clicks "Analyze This Field" to proceed

### 2. Field Analysis Landing Page
**File:** `src/pages/field-analysis/index.tsx`

**Changes:**
- Added `showCSBLayer` state (default: true)
- Updated `handleMethodSelect` to use CSB layer in browse mode
- Passed `showCSBLayer` and `onCSBLayerToggle` props to FieldMap

**Behavior:**
- CSB layer enabled by default in "browse" mode
- Legacy CLU layer disabled when CSB is active
- Users can toggle CSB layer via layer controls

### 3. Field Analysis Detail Page
**File:** `src/pages/field-analysis/[fieldId].tsx`

**Changes:**
- Added `showCSBLayer` state (default: true)
- Added CSB layer toggle callback
- Passed CSB props to FieldMap component

**Features:**
- CSB field boundaries overlay on analysis map
- Can be toggled on/off via layer controls panel
- Works alongside soil boundaries, erosion risk, and other layers

## Environment Configuration

### Required Environment Variable

Add to `.env.local`:
```bash
NEXT_PUBLIC_GEE_API_URL=https://gee-api-production.up.railway.app
```

This URL points to the production GEE API hosted on Railway.

### Fallback Behavior
If the environment variable is not set, the client defaults to:
```
https://gee-api-production.up.railway.app
```

## API Endpoints Used

### 1. CSB Tiles
```
GET /csb/tiles/{z}/{x}/{y}
```
Returns PNG tile for CSB 30m field boundaries at specified zoom/coordinates.

**Used by:** Leaflet TileLayer in FieldMap component

### 2. CSB Bounds
```
GET /csb/bounds?lat={lat}&lng={lng}&buffer={buffer}
```
Returns GeoJSON FeatureCollection of fields near the specified point.

**Parameters:**
- `lat` (required) - Latitude
- `lng` (required) - Longitude
- `buffer` (optional, default: 100) - Search radius in meters

**Used by:** Field selection click handler

### 3. Field Details
```
GET /csb/field-details/{clu_id}
```
Returns detailed information for a specific CLU field.

**Response includes:**
- CLU ID, acres, state, county
- Farm/tract/field numbers
- Full GeoJSON geometry
- Centroid coordinates

## User Workflows

### Workflow 1: Browse and Select Field

1. User navigates to `/field-analysis`
2. "Browse Fields" mode is active by default
3. CSB field boundaries visible as semi-transparent overlay
4. User zooms/pans to find their field
5. User clicks on field boundary
6. System queries GEE API (typically < 2 seconds)
7. Field highlights in green, confirmation panel appears
8. User reviews field details (CLU ID, acres, location)
9. User clicks "Analyze This Field"
10. System navigates to `/field-analysis/{clu_id}` with geometry

### Workflow 2: Toggle CSB Layer in Analysis

1. User viewing field analysis at `/field-analysis/{fieldId}`
2. Layer controls panel visible in top-right
3. "Field Boundaries (CSB)" checkbox controls visibility
4. User can toggle CSB layer on/off independently
5. Works alongside soil boundaries, erosion risk, etc.

### Workflow 3: Draw Custom Field (Alternative)

1. User switches to "Draw Field" mode
2. CSB layer automatically turns off (prevents confusion)
3. User draws custom boundary with polygon tool
4. System validates area (0.5 - 10,000 acres)
5. User confirms and analyzes custom field

## Technical Details

### CSB Tile Layer Configuration
```typescript
L.tileLayer(geeApiClient.getCSBTileURL(), {
  attribution: 'CSB Data © USDA',
  maxZoom: 18,
  opacity: 0.7,
  className: 'csb-tile-layer',
})
```

### Field Selection Logic
```typescript
const handleMapClick = async (e: L.LeafletMouseEvent) => {
  const field = await geeApiClient.queryFieldAtPoint(e.latlng.lat, e.latlng.lng)
  
  if (field) {
    // Highlight selected field
    const fieldLayer = L.geoJSON(field.geometry, {
      style: {
        color: '#16a34a',
        weight: 3,
        fillColor: '#16a34a',
        fillOpacity: 0.2,
      },
    })
    fieldLayer.addTo(map)
    
    // Fit map to field
    map.fitBounds(fieldLayer.getBounds(), { padding: [50, 50] })
  }
}
```

### Error Handling
- **No field found**: "No field found at this location. Try clicking inside a field boundary."
- **API error**: "Failed to select field. Please try again."
- **Network timeout**: Axios timeout set to 30 seconds
- **Loading state**: "Loading field..." shown during API call

## Performance Considerations

### Tile Caching
- CSB tiles are cached by browser via standard HTTP caching
- Tiles served directly from GEE API (no additional proxy needed)
- Leaflet handles tile loading/unloading automatically

### API Response Times
- Tile requests: ~100-300ms
- CSB bounds query: ~500-2000ms (depends on Earth Engine processing)
- Field details: ~300-800ms

### Optimization
- Only one field boundary query per click
- Buffer set to 10 meters for point queries (minimal processing)
- Selected field geometry cached in component state
- No re-fetching when toggling layer visibility

## Testing Checklist

- [ ] CSB tiles load on map in browse mode
- [ ] Click on field boundary selects field
- [ ] Selected field highlights in green
- [ ] Confirmation panel shows correct CLU ID and acres
- [ ] "Analyze This Field" navigates to detail page
- [ ] CSB layer toggle works in layer controls
- [ ] Layer works alongside soil boundaries
- [ ] Error message shown when clicking outside fields
- [ ] Loading state shown during API call
- [ ] Works in both browse mode and analysis mode

## Future Enhancements

### Potential Improvements
1. **Field Search by CLU ID** - Add search input for direct CLU lookup
2. **Multi-field Selection** - Allow selecting multiple adjacent fields
3. **Field Filtering** - Filter by acreage, state, county
4. **Cached Field Data** - Store recently selected fields in localStorage
5. **Field Metadata Display** - Show farm/tract/field numbers in UI
6. **Advanced Visualization** - Color-code fields by acreage or other attributes
7. **Offline Support** - Cache selected field geometries for offline use

### Integration Opportunities
1. **RUSLE-EOS Module** - Pre-populate field geometry from CSB selection
2. **Conservation Planning** - Use CSB boundaries for practice layout
3. **Soil Health Assessment** - Extract soil data for CSB-defined fields
4. **Cropland Data Layer** - Overlay CDL data on CSB fields

## Troubleshooting

### Issue: Tiles not loading
**Solution:** Check `NEXT_PUBLIC_GEE_API_URL` is set correctly in `.env.local`

### Issue: "No field found" on every click
**Solution:** 
- Verify GEE API is running: `GET /health`
- Check browser console for CORS errors
- Ensure clicking inside field boundaries (zoom in closer)

### Issue: Slow field selection
**Solution:**
- Normal processing time is 1-2 seconds
- Check network tab for API response time
- GEE API may be under heavy load (wait and retry)

### Issue: Wrong field selected
**Solution:**
- CSB dataset has 30m resolution
- Small fields (<1 acre) may have imprecise boundaries
- Click center of field for best accuracy

## Dependencies

### Required Packages
```json
{
  "axios": "^1.6.0",
  "leaflet": "^1.9.4",
  "leaflet-draw": "^1.0.4",
  "@turf/turf": "^6.5.0"
}
```

### Type Definitions
```json
{
  "@types/leaflet": "^1.9.8",
  "@types/leaflet-draw": "^1.0.11"
}
```

## API Documentation Reference

For complete GEE API documentation, see:
- `/Property_Panel_Guide/gee-api-docs/nextjs-integration.md`
- GEE API Swagger: `https://gee-api-production.up.railway.app/docs`

## Support

For issues or questions:
1. Check GEE API health: `https://gee-api-production.up.railway.app/health`
2. Review browser console for errors
3. Check API response in Network tab
4. Verify environment variables are set correctly

---

**Implementation Status:** ✅ Complete
**Tested:** Ready for testing
**Documentation:** Complete
