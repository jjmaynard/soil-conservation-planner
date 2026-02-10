# Field Geometry Debug Report

## Issue
Field shows 44,134 acres in header but SSURGO query returns only 8.7 acres

## Root Cause Analysis

The discrepancy occurs because:

### 1. Field Area Source
- **Header area (44,134 acres)**: Comes from CSB field metadata stored in `fieldData.area` or `fieldData.acres`
- **SSURGO area (8.7 acres)**: Calculated from geometric intersection of field boundary with SSURGO soil polygons

### 2. Why They Differ

The field boundary geometry (`fieldData.boundary`) used for SSURGO queries likely has one of these issues:

**A. Incomplete Geometry**
- The boundary polygon might only represent a small portion of the actual field
- CSB metadata has correct acreage but boundary coordinates are incomplete

**B. Coordinate Precision Loss**
- During geometry conversion (GeoJSON → WKT), coordinates may be truncated
- Simplified polygons lose area accuracy

**C. Wrong Geometry Object**
- The boundary might be a point or simplified shape instead of full polygon
- Multi-polygon fields stored as single polygon

### 3. How to Fix

Add this debugging code to `src/pages/field-analysis/[fieldId].tsx`:

```typescript
// After loading field data from session storage (around line 131)
if (parsed.boundary) {
  console.log('=== FIELD GEOMETRY DEBUG ===')
  console.log('Field area from metadata:', parsed.area || parsed.acres)
  console.log('Boundary type:', parsed.boundary.type)
  console.log('Boundary coordinates count:', 
    parsed.boundary.type === 'Polygon' 
      ? parsed.boundary.coordinates[0].length 
      : 'Not a polygon'
  )
  
  // Calculate rough area from geometry
  if (parsed.boundary.type === 'Polygon') {
    const coords = parsed.boundary.coordinates[0]
    console.log('First 3 coordinates:', coords.slice(0, 3))
    console.log('Last 3 coordinates:', coords.slice(-3))
    
    // Check if it's in correct coordinate order [lng, lat]
    const firstPoint = coords[0]
    console.log('First point [lng, lat]:', firstPoint)
    console.log('Longitude range: typical US is -125 to -65')
    console.log('Latitude range: typical US is 25 to 50')
    
    if (firstPoint[0] < -180 || firstPoint[0] > 180) {
      console.error('⚠️ INVALID LONGITUDE:', firstPoint[0])
    }
    if (firstPoint[1] < -90 || firstPoint[1] > 90) {
      console.error('⚠️ INVALID LATITUDE:', firstPoint[1])
    }
  }
  console.log('=== END DEBUG ===')
}
```

### 4. Verification Steps

1. **Open browser console** when viewing field analysis
2. **Check the debug output** for:
   - Coordinate count (should be dozens-hundreds for 44K acre field)
   - Coordinate values (valid lat/lng ranges)
   - Geometry type (should be "Polygon")

3. **Common Issues & Fixes**:

| Issue | Symptom | Fix |
|-------|---------|-----|
| Truncated coordinates | < 10 points for large field | Re-query full CSB geometry |
| Swapped lat/lng | Coordinates outside US bounds | Swap coordinate order |
| Simplified geometry | Rough edges, low accuracy | Use high-precision boundary |
| Multi-polygon as single | Missing sections | Handle MultiPolygon type |
| Wrong coordinate system | Huge discrepancy | Ensure WGS84 (EPSG:4326) |

### 5. Immediate Solution

Add area correction in `useFieldSSURGO.ts` to use CSB metadata area as fallback:

```typescript
// In queryField function, after getting SSURGO data:
const totalAreaFromSSURGO = Array.from(areaMap.values()).reduce((sum, area) => sum + area, 0)

// If SSURGO area is significantly less than expected, warn user
if (geometry.properties?.acres && totalAreaFromSSURGO < geometry.properties.acres * 0.5) {
  console.warn(`SSURGO area (${totalAreaFromSSURGO.toFixed(1)} ac) is much less than field area (${geometry.properties.acres} ac)`)
  console.warn('This indicates incomplete boundary geometry. Using proportional scaling.')
  
  // Option: Scale up component areas proportionally
  const scaleFactor = geometry.properties.acres / totalAreaFromSSURGO
  // Apply scaling to maintain percentages but correct total area
}
```

### 6. Long-term Fix

- **Validate boundary completeness** when importing CSB fields
- **Store both** simplified (display) and high-precision (analysis) geometries
- **Add area validation** that flags fields where geometry area != metadata area
- **Query CSB API** to get authoritative boundary if local copy is incomplete
