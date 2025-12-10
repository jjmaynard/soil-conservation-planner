# Official Series Description (OSD) Integration

## Overview

The Soil Conservation Planner now integrates Official Series Description (OSD) data from the UC Davis California Soil Resource Lab API. This provides comprehensive, authoritative information about soil series including taxonomy, horizons, climate, and geomorphology.

## Data Source

**API Endpoint:** `https://casoilresource.lawr.ucdavis.edu/api/soil-series.php`

**Example Request:**
```
https://casoilresource.lawr.ucdavis.edu/api/soil-series.php?q=all&s=abbott
```

## Architecture

### Type Definitions (`src/types/osd.ts`)

Comprehensive TypeScript interfaces for:
- **OSDSiteData**: Taxonomic classification, properties, establishment dates
- **OSDHorizonData**: Horizon descriptions, colors, textures, pH
- **OSDClimateData**: Temperature, precipitation, elevation statistics
- **OSDParentMaterial**: Geologic origin information
- **OSDEcologicalSite**: Ecological site classifications
- **FormattedOSDData**: Processed data optimized for UI display

### API Client (`src/utils/osdApi.ts`)

Functions:
- `fetchOSDData(seriesName)`: Fetch raw OSD data from UC Davis API
- `formatOSDData(raw)`: Process raw API response for UI consumption
- `getFormattedOSDData(seriesName)`: Combined fetch + format operation

Features:
- Horizon depth conversion (cm to inches)
- Munsell color notation formatting
- Climate data extraction and formatting
- Parent material percentage calculations
- Error handling and logging

### React Hook (`src/hooks/useOSDData.tsx`)

`useOSDData(seriesName, enabled)`

Returns:
- `osdData`: Formatted OSD information
- `isLoading`: Loading state
- `error`: Error message if fetch failed
- `refetch()`: Manual refetch function

Usage:
```typescript
const { osdData, isLoading, error } = useOSDData('ABBOTT')
```

### UI Component (`src/components/ui/OSDPanel.tsx`)

Collapsible panel sections:
1. **Taxonomic Classification**: Order through subgroup
2. **Series Properties**: Drainage, status, benchmark flag
3. **Geographic Extent**: Acreage, MLRA coverage
4. **Soil Horizons**: Depth, texture, color, pH, narrative
5. **Parent Material**: Geologic origins with percentages
6. **Climate Summary**: Temperature, precipitation, growing season
7. **Ecological Sites**: Ecological site classifications
8. **Associated Soils**: Related soil series

## Data Structure

### Site Data
```typescript
{
  seriesName: "ABBOTT",
  classification: {
    family: "fine, smectitic, calcareous, mesic vertic endoaquepts",
    order: "inceptisols",
    suborder: "aquepts",
    greatGroup: "endoaquepts",
    subGroup: "vertic endoaquepts",
    particleSize: "fine",
    mineralogy: "smectitic",
    temperatureRegime: "mesic",
    reaction: "calcareous"
  },
  properties: {
    drainage: "poorly",
    established: 1919,
    benchmark: true,
    status: "established",
    typeLocation: "UT",
    mlraOffice: "davis, ca"
  }
}
```

### Horizon Data
```typescript
{
  name: "A",
  depth: "0\"-8\"",
  depthCm: { top: 0, bottom: 20 },
  texture: "silty clay",
  color: {
    dry: "2.5Y 6/1",
    moist: "2.5Y 5/1"
  },
  ph: 7.9,
  phClass: "moderately alkaline",
  narrative: "Full horizon description..."
}
```

### Climate Data
```typescript
{
  elevation: { min: 1292, median: 1399, max: 1416, unit: "m" },
  precipitation: { min: 227, median: 232, max: 480, unit: "mm" },
  temperature: { min: 10.4, median: 10.5, max: 10.8, unit: "°C" },
  frostFreeDays: { min: 141, median: 145, max: 198 },
  growingDegreeDays: { min: 1830, median: 1957, max: 1974 }
}
```

## Integration Points

### Property Panel
Add OSD data display when soil component is selected:

```typescript
import { useOSDData } from '@/hooks/useOSDData'
import OSDPanel from '@/components/ui/OSDPanel'

function PropertyPanel({ soilComponent }) {
  const { osdData, isLoading } = useOSDData(soilComponent?.compname)
  
  return (
    <div>
      {/* Existing property panel content */}
      <OSDPanel osdData={osdData} isLoading={isLoading} />
    </div>
  )
}
```

### Dashboard
Display OSD summary in dashboard tab:

```typescript
<Tab label="Series Description">
  <OSDPanel osdData={osdData} isLoading={isLoading} />
</Tab>
```

## API Response Structure

The UC Davis API returns comprehensive data including:

- **site[]**: Single object with taxonomic and series metadata
- **hz[]**: Array of horizon descriptions with colors, textures, pH
- **climate[]**: 37+ climate variables with quantile distributions
- **mlra[]**: MLRA membership and acreage
- **pmkind[]**: Parent material types and proportions
- **ecoclassid[]**: Ecological site classifications
- **geog_assoc_soils[]**: Geographically associated soil series
- **terrace[]**: Terrace position probabilities
- **flats[]**: Flat position probabilities
- **shape_across[]**: Cross-slope shape distributions
- **shape_down[]**: Down-slope shape distributions
- **nccpi[]**: National Commodity Crop Productivity Index statistics
- **metadata[]**: Data product update timestamps

## Features

### Color Visualization
- Munsell notation display (e.g., "10YR 4/3")
- Separate dry and moist colors
- Estimated vs measured color flags

### Horizon Details
- Depth ranges (cm and inches)
- Texture class
- pH and pH class
- Effervescence class
- Boundary distinctness and topography
- Full narrative descriptions

### Climate Summaries
- Quantile distributions (min, q25, median, q75, max)
- 12 monthly precipitation values
- 12 monthly PET values
- Growing degree days
- Frost-free period
- Design freeze index

### Geographic Context
- Total acreage coverage
- Number of map unit polygons
- MLRA associations
- Type location state
- Associated soil series

## Error Handling

The system handles:
- Network failures
- Non-existent soil series
- Malformed API responses
- Missing or null data fields

Error states are communicated through:
- Loading spinners during fetch
- Error messages for failed requests
- Graceful handling of missing data fields
- Null checks throughout UI

## Performance Considerations

- Data is fetched only when needed (conditional rendering)
- API responses are cached by React Query (if implemented)
- Collapsible sections prevent rendering large DOM trees
- Formatted data is memoized to prevent re-processing

## Future Enhancements

1. **Color Visualization**: Convert Munsell to RGB for visual swatches
2. **Horizon Diagram**: Graphical depth profile with colored horizons
3. **Climate Charts**: Precipitation/temperature graphs
4. **Comparison Tool**: Side-by-side comparison of multiple series
5. **Export**: PDF or CSV export of OSD data
6. **Search**: Autocomplete soil series search
7. **KSSL Data**: Integration with Kellogg Soil Survey Laboratory data
8. **Spatial View**: Map showing series extent and type location

## References

- [UC Davis Soil Resource Lab API](https://casoilresource.lawr.ucdavis.edu/)
- [Soil Survey Manual](https://www.nrcs.usda.gov/resources/guides-and-instructions/soil-survey-manual)
- [Official Series Descriptions](https://www.nrcs.usda.gov/resources/data-and-reports/official-series-descriptions-osd)
- [Soil Taxonomy](https://www.nrcs.usda.gov/resources/guides-and-instructions/keys-to-soil-taxonomy)
