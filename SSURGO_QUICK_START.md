# Quick Start: Using SSURGO Data in Field Analysis

## Overview
The field-analysis module now automatically queries real SSURGO soil data from the NRCS when you select a field with a boundary.

## How to Use

### 1. Select a Field with Boundary

**Option A: From CSB Layer**
1. Navigate to `/field-analysis`
2. Enable CSB layer on map
3. Click on a Common Land Unit (CLU)
4. Click "Analyze Field" button

**Option B: Draw a Field**
1. Navigate to `/field-analysis`
2. Select "Draw Field" mode
3. Draw polygon on map
4. Name the field and submit

### 2. View Real Soil Data

Once the field is selected and loaded:

1. **Automatic SSURGO Query**
   - Page automatically queries NRCS SDA API
   - Takes 2-5 seconds to load
   - Data cached in session storage

2. **Real Data Display**
   - **Soil Composition**: Shows actual SSURGO map units with percentages
   - **Field Stats**: Calculated from real soil data (area, types, slope, risk)
   - **Erosion Analysis**: Based on real slope and soil properties
   - **Drainage Assessment**: Real drainage classes and hydric soil percentages

### 3. Verify Data is Real

**Indicators of Real SSURGO Data:**
- Soil names match SSURGO naming (e.g., "Clarion loam, 2-5% slopes")
- Map unit symbols are official (e.g., "CIC2", "NcB")
- Percentages add up to ~100%
- Multiple soil types present
- Drainage classes are official SSURGO terms

**Fallback to Dummy Data If:**
- Field has no boundary
- SSURGO query fails
- Network error
- Field outside SSURGO coverage

## Component-Level Usage

### For Developers

If you're building new components that need SSURGO data:

```typescript
import type { ProcessedFieldData } from '#hooks/useFieldSSURGO'

interface MyComponentProps {
  fieldId: string
  ssurgoData?: ProcessedFieldData | null
}

export default function MyComponent({ fieldId, ssurgoData }: MyComponentProps) {
  // Check if real data is available
  if (ssurgoData?.soils) {
    // Use real SSURGO data
    const soils = ssurgoData.soils
    const avgSlope = ssurgoData.stats.avgSlope
  } else {
    // Fallback to session storage or dummy data
    const stored = sessionStorage.getItem('fieldSSURGOData')
  }
}
```

### Available Data Properties

```typescript
// Soil composition
ssurgoData.soils[0].mapunit_name  // "Clarion loam, 2-5% slopes"
ssurgoData.soils[0].symbol        // "CIC2"
ssurgoData.soils[0].area          // 18.5 acres
ssurgoData.soils[0].percent       // 40.8%
ssurgoData.soils[0].slope         // 3.2%
ssurgoData.soils[0].drainageClass // "Well drained"
ssurgoData.soils[0].lcc           // "IIe"
ssurgoData.soils[0].hydric        // false

// Field statistics
ssurgoData.stats.totalArea        // 45.3 acres
ssurgoData.stats.soilTypes        // 4
ssurgoData.stats.avgSlope         // 3.2%
ssurgoData.stats.erosionRisk      // "Moderate"

// Drainage data
ssurgoData.drainage.hydricSoils   // 14.5 acres
ssurgoData.drainage.hydricPercent // 32.0%
ssurgoData.drainage.drainageClasses // Array of drainage class distributions

// Erosion data
ssurgoData.erosion.avgErosion     // 4.2 T/A/Y
ssurgoData.erosion.riskLevel      // "Moderate"
ssurgoData.erosion.areas          // Array of risk level distributions
```

## Querying SSURGO Manually

If you need to query SSURGO data outside the field analysis page:

```typescript
import { useFieldSSURGO } from '#hooks/useFieldSSURGO'

function MyComponent() {
  const { fieldData, loading, error, queryField } = useFieldSSURGO()
  
  const handleQuery = async () => {
    // GeoJSON Polygon format
    const boundary = {
      type: 'Polygon',
      coordinates: [[
        [-93.6250, 41.5868],
        [-93.6200, 41.5868],
        [-93.6200, 41.5900],
        [-93.6250, 41.5900],
        [-93.6250, 41.5868]
      ]]
    }
    
    await queryField(boundary)
  }
  
  return (
    <div>
      <button onClick={handleQuery}>Query SSURGO</button>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {fieldData && <p>Found {fieldData.soils.length} soil types</p>}
    </div>
  )
}
```

## Troubleshooting

### No Data Showing
1. **Check Console**: Look for SSURGO query logs
2. **Verify Boundary**: Ensure field has boundary in sessionStorage
3. **Check Network**: SSURGO requires internet connection
4. **Wait for Query**: Initial query takes 2-5 seconds

### Error Messages
- **"No SSURGO data found"**: Field may be outside US coverage
- **"Query timed out"**: Field too large or network issue
- **"Failed to query SSURGO"**: Network error or API down

### Data Looks Wrong
1. Verify field boundary is correct on map
2. Check that soil names are realistic for location
3. Ensure percentages add up to ~100%
4. Compare with Web Soil Survey for validation

## Data Sources

- **SSURGO Data**: USDA NRCS Soil Data Access (SDA) API
- **Update Frequency**: Annual
- **Coverage**: All 50 US states + territories
- **Accuracy**: Most detailed soil mapping available (1:24,000 scale)

## Performance Tips

1. **Caching**: Data is cached in sessionStorage - navigating back to same field is instant
2. **Query Size**: Smaller fields query faster
3. **Network**: Faster internet = faster queries
4. **Components Query**: Default mode balances speed and detail

## Next Steps

1. Try selecting different fields to see varied soil types
2. Compare SSURGO data with Web Soil Survey
3. Use real data for conservation planning
4. Export reports with actual soil information

## Support

- **SSURGO Issues**: https://sdmdataaccess.nrcs.usda.gov
- **Documentation**: See `SSURGO_FIELD_ANALYSIS_INTEGRATION.md`
- **Library Docs**: `/Property_Panel_Guide/ssurgo-area-query/`
