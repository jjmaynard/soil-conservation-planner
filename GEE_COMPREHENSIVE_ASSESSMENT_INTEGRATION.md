# GEE Comprehensive Assessment API Integration

## Overview
Integration of the GEE API `/api/assessment/all` endpoint into the field-analysis module to provide comprehensive field assessment combining SSURGO soil data with GEE terrain analysis, productivity metrics, and resource concern identification.

## Implementation Date
December 2024

## Files Created/Modified

### New Files Created (3)

1. **src/hooks/useComprehensiveFieldAssessment.ts** (220 lines)
   - Combined hook that queries both SSURGO and GEE APIs
   - Merges data from both sources into EnhancedFieldData structure
   - Manages session storage for performance
   - Returns comprehensive assessment with terrain, productivity, and vulnerability data

2. **src/components/FieldAnalysis/ProductivityAnalysis.tsx** (180 lines)
   - Displays NDVI-based productivity assessment from GEE
   - Shows yield gap analysis (mean, p75, p90)
   - Displays productivity stability (coefficient of variation)
   - Provides recommendations based on productivity metrics
   - Uses multi-year Landsat 8 data

3. **src/components/FieldAnalysis/SVIAnalysis.tsx** (250 lines)
   - Displays Soil Vulnerability Index from GEE
   - Shows surface and subsurface erosion loss potential
   - Displays percentage of field at high risk
   - Three vulnerability metrics: surface loss, subsurface drained, subsurface undrained
   - Risk-based management recommendations

### Modified Files (5)

1. **src/types/geeApi.ts**
   - Added ComprehensiveFieldAssessment interface (150+ lines)
   - Defines complete structure for `/api/assessment/all` response
   - Includes 7 assessment categories:
     - erosion_risk: RUSLE-based terrain erosion analysis
     - concentrated_flow: Gully and channel risk assessment
     - ponding: Depression and TWI-based wetness analysis
     - drought: Water balance and PDSI assessment
     - productivity: NDVI yield gap analysis
     - soil_quality: Combined quality score
     - svi: Soil vulnerability index

2. **src/lib/geeApiClient.ts**
   - Added getComprehensiveAssessment() method
   - Calls `/api/assessment/all` endpoint
   - Returns ComprehensiveFieldAssessment with all 7 assessments
   - Includes visualization tile URLs for map layers

3. **src/components/FieldAnalysis/ErosionAnalysis.tsx**
   - Updated to accept geeData prop (EnhancedFieldData)
   - Prefers GEE terrain-based erosion risk when available
   - Falls back to SSURGO slope-based estimates
   - Displays data source indicator (GEE vs SSURGO)
   - Shows mean risk, high risk area percentage, erosion class

4. **src/components/FieldAnalysis/DrainageAssessment.tsx**
   - Updated to accept geeData prop
   - Displays GEE ponding metrics:
     - Depression area percentage
     - TWI above 12 percentage (wet areas)
     - High ponding risk percentage
   - Shows TWI statistics (mean, std, max)
   - Combines SSURGO drainage classes with GEE terrain analysis
   - Enhanced recommendations based on both data sources

5. **src/pages/field-analysis/[fieldId].tsx**
   - Imported ProductivityAnalysis and SVIAnalysis components
   - Added useComprehensiveFieldAssessment hook
   - Calls assessField() on field load alongside queryField()
   - Passes geeData to ErosionAnalysis and DrainageAssessment
   - Added two new analysis sections:
     - Productivity Assessment (expandable)
     - Soil Vulnerability Index (expandable)

## API Integration Details

### Endpoint
```
POST /api/assessment/all
```

### Request Format
```typescript
{
  wkt: string,              // Field boundary as WKT
  year?: number,            // Assessment year (default: 2023)
  include_visualizations?: boolean  // Include tile URLs
}
```

### Response Structure (v2.1.0)
```typescript
{
  erosion_risk: {
    erosion_metrics: {
      mean_risk: number,
      high_risk_area_pct: number,
      erosion_class: string
    },
    terrain_stats: { slope_mean, slope_max, ls_factor_mean },
    visualization: { tile_url, thumbnail_url }
  },
  concentrated_flow: {
    flow_metrics: {
      gully_risk_pct: number,
      channel_density: number,
      spi_high_pct: number
    },
    spi_stats: { mean, std, max },
    visualization: { spi_tile_url }
  },
  ponding: {
    ponding_metrics: {
      depression_area_pct: number,
      twi_above_12_pct: number,
      high_ponding_risk_pct: number
    },
    twi_stats: { mean, std, max },
    visualization: { twi_tile_url }
  },
  drought: {
    drought_metrics: {
      water_balance_deficit_mean: number,
      pdsi_dry_pct: number,
      severe_drought_risk_pct: number
    },
    temporal_stats: { pdsi_mean, pdsi_std },
    visualization: { water_balance_tile_url }
  },
  productivity: {
    productivity_metrics: {
      ndvi_peak_mean: number,
      ndvi_peak_std: number
    },
    yield_gap: {
      mean_gap_pct: number,
      p75_gap_pct: number,
      p90_gap_pct: number
    },
    stability: {
      cv: number  // Coefficient of variation
    },
    visualization: { yield_gap_tile_url, mean_ndvi_tile_url }
  },
  soil_quality: {
    quality_score: number,
    om_content_pct: number,
    bulk_density_mean: number,
    infiltration_rate_mean: number
  },
  svi: {
    svi_metrics: {
      surface_loss_mean: number,
      surface_loss_high_pct: number,
      subsurface_drained_mean: number,
      subsurface_drained_high_pct: number,
      subsurface_undrained_mean: number,
      subsurface_undrained_high_pct: number
    },
    visualization: { surface_tile_url, subsurface_tile_urls }
  }
}
```

## Data Flow

1. **User Loads Field**: Navigate to /field-analysis/[fieldId]
2. **Parallel Queries**: 
   - SSURGO query via useFieldSSURGO hook
   - GEE comprehensive assessment via useComprehensiveFieldAssessment hook
3. **Data Merging**: Hook combines both sources into EnhancedFieldData
4. **Session Storage**: Data cached to reduce API calls
5. **Component Display**: Each analysis component receives combined data
6. **Intelligent Fallback**: Components prefer GEE data, fall back to SSURGO

## Component Usage

### ErosionAnalysis
```tsx
<ErosionAnalysis 
  fieldId={fieldData.id} 
  ssurgoData={ssurgoData}  // SSURGO slope-based estimates
  geeData={geeData}        // GEE terrain analysis (preferred)
/>
```

### DrainageAssessment
```tsx
<DrainageAssessment 
  fieldId={fieldData.id}
  ssurgoData={ssurgoData}  // SSURGO drainage classes
  geeData={geeData}        // GEE ponding/TWI analysis
/>
```

### ProductivityAnalysis (NEW)
```tsx
<ProductivityAnalysis 
  fieldId={fieldData.id}
  geeData={geeData}        // GEE NDVI productivity data
/>
```

### SVIAnalysis (NEW)
```tsx
<SVIAnalysis 
  fieldId={fieldData.id}
  geeData={geeData}        // GEE vulnerability metrics
/>
```

## Data Source Indicators

All components display which data source is active:
- **"GEE terrain analysis + SSURGO drainage classification"** - Both sources
- **"GEE terrain-based ponding analysis"** - GEE only
- **"SSURGO soil drainage classification"** - SSURGO only
- **"SSURGO slope-based estimation"** - SSURGO fallback

## Key Metrics Displayed

### Erosion Risk (GEE)
- Mean risk value (0-10 scale)
- High risk area percentage
- Erosion class (Low, Moderate, High, Very High)
- Slope statistics (mean, max)
- LS factor mean

### Ponding (GEE)
- Depression area percentage
- TWI > 12 percentage (wet areas)
- High ponding risk percentage
- TWI statistics (mean, std, max)

### Productivity (GEE)
- Peak NDVI mean (vegetation vigor)
- Yield gap percentage (mean, p75, p90)
- Stability coefficient of variation
- Multi-year trend analysis

### SVI (GEE)
- Surface erosion loss mean
- Surface loss high risk percentage
- Subsurface drained/undrained means
- Subsurface high risk percentages

## Map Visualization Integration

All assessments include tile URLs for map overlays:
- erosion_risk.visualization.tile_url
- concentrated_flow.visualization.spi_tile_url
- ponding.visualization.twi_tile_url
- drought.visualization.water_balance_tile_url
- productivity.visualization.yield_gap_tile_url
- svi.visualization.surface_tile_url

**Future Enhancement**: Integrate tile layers into FieldMap component with toggle controls

## Session Storage

Data persisted in sessionStorage for performance:
- Key: `comprehensiveFieldAssessment`
- Structure: EnhancedFieldData (SSURGO + GEE combined)
- Benefits: Reduces API calls, faster component mounting
- Cleared: On page refresh or new field selection

## Performance Considerations

1. **Parallel API Calls**: SSURGO and GEE queries run simultaneously
2. **Session Caching**: Comprehensive assessment cached after first load
3. **Lazy Loading**: Analysis sections collapse by default (accordion UI)
4. **Conditional Rendering**: Components only render when data available
5. **Fallback Logic**: SSURGO data used when GEE unavailable

## Error Handling

- Network errors logged to console
- Components display placeholder UI when no data available
- "Data not available" messages shown to user
- Graceful degradation to SSURGO-only mode if GEE fails

## Future Enhancements

### Priority 1 - Map Layer Integration
- Add GEE tile overlays to FieldMap component
- Layer toggle controls for each assessment
- Legend for each visualization layer
- Opacity controls

### Priority 2 - Additional Components
- ConcentratedFlow component for gully risk
- DroughtRisk component for water balance
- Temporal trend charts for multi-year data

### Priority 3 - Resource Concerns Integration
- Update ResourceConcerns component to display comprehensive summary
- Link each concern to detailed assessment view
- Priority ranking based on risk levels
- Conservation practice recommendations per concern

### Priority 4 - Report Generation
- Export comprehensive assessment as PDF
- Include all visualizations
- Side-by-side comparison tables
- Management zone recommendations

## Testing

### Manual Testing Completed
✅ Field selection loads both SSURGO and GEE data  
✅ Components display GEE data when available  
✅ Fallback to SSURGO works when GEE unavailable  
✅ Session storage persists data correctly  
✅ Data source indicators accurate  
✅ All metrics display correct values  
✅ Recommendations based on actual thresholds  

### Testing Needed
- Cross-browser compatibility
- Large field boundary handling (>1000 acres)
- Network timeout handling
- Invalid WKT geometry handling
- Multi-field comparison
- Report export functionality

## API Version
GEE API v2.1.0 - Comprehensive Assessment Endpoint

## Dependencies
- axios (HTTP client)
- Leaflet (GeoJSON to WKT conversion)
- React hooks (useState, useEffect, useCallback)
- Session storage API

## Known Issues

1. **TypeScript/Lucide Icon Warnings**: Lucide icons show JSX compatibility warnings with current TypeScript version - cosmetic issue, doesn't affect functionality
2. **Visualization Layers Not Yet Integrated**: Tile URLs returned but not yet displayed on map
3. **Multi-Scenario RUSLE**: Not yet integrated from `/api/rusle/calculate` multi-scenario feature

## Documentation References
- GEE API Documentation: Property_Panel_Guide/gee-api-docs/
- SSURGO Integration: SSURGO_INTEGRATION_COMPLETE.md
- Type Definitions: src/types/geeApi.ts
- API Client: src/lib/geeApiClient.ts

## Support
For questions about GEE API integration, see:
- GEE_API_INTEGRATION_PLAN.md
- GEE_API_K_FACTOR_MAP_ENHANCEMENT.md
- RUSLE_GEE_API_TROUBLESHOOTING.md
