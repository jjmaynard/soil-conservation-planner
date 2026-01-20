# Field Analysis Module - Quick Reference

## 🚀 Quick Start

### 1. Navigate to Field Analysis
```
/field-analysis/[fieldId]
```

### 2. Required Data
- Field geometry (Polygon)
- Field ID
- Optional: Year for analysis (defaults to current year)

### 3. Data Flow
```
User selects field → useComprehensiveFieldAssessment hook triggers
→ GEE API /api/assessment/all called
→ SSURGO data queried
→ Data combined and cached in session storage
→ 7 analysis components render
```

## 📊 Available Assessments

| Assessment | Component | Key Metrics | Severity Threshold |
|-----------|-----------|-------------|-------------------|
| **Erosion Risk** | ErosionAnalysis | Soil loss rate, High risk % | >5 t/ha/yr |
| **Drainage** | DrainageAssessment | TWI, Depression %, Ponding % | >15% ponding |
| **Concentrated Flow** | ConcentratedFlowAnalysis | Channel density, Gully risk %, SPI | >10% gully risk |
| **Drought Risk** | DroughtRiskAnalysis | Water balance, PDSI mean/min | PDSI < -2 |
| **Productivity** | ProductivityAnalysis | NDVI peak, Yield gap % | >15% yield gap |
| **Soil Vulnerability** | SVIAnalysis | Surface/subsurface loss | SVI > 0.7 |
| **Soil Quality** | ProductivityAnalysis | NDVI stability (CV) | CV > 20% |

## 🎨 Color Coding

```typescript
// Severity Colors
Low:      Green  (#22c55e, #dcfce7)
Moderate: Yellow (#fbbf24, #fef3c7)
High:     Orange (#f97316, #ffedd5)
Severe:   Red    (#dc2626, #fee2e2)

// Assessment Theme Colors
Erosion:      Red (#dc2626)
Drainage:     Blue (#3b82f6)
Conc. Flow:   Cyan (#06b6d4)
Drought:      Orange (#f59e0b)
Productivity: Green (#22c55e)
SVI:          Purple (#a855f7)
```

## 🔧 Developer Guide

### Adding New Metrics

1. **Update GEE API Types** (`src/types/geeApi.ts`)
```typescript
export interface ComprehensiveFieldAssessment {
  // Add new assessment
  new_assessment: {
    metrics: { ... }
    visualization: { ... }
    methodology: string
  }
}
```

2. **Update Hook Interface** (`src/hooks/useComprehensiveFieldAssessment.ts`)
```typescript
interface EnhancedFieldData {
  combined: {
    new_metric: {
      value: number
      // ...
    }
  }
}
```

3. **Create Component** (`src/components/FieldAnalysis/NewAssessment.tsx`)
```tsx
export default function NewAssessment({ fieldId, geeData }: Props) {
  const [data, setData] = useState<any>(null)
  
  useEffect(() => {
    if (geeData?.geeAssessment?.new_assessment) {
      // Load and process data
    }
  }, [fieldId, geeData])
  
  return (
    // Render UI
  )
}
```

4. **Add to Field Analysis Page**
```tsx
import NewAssessment from '#components/FieldAnalysis/NewAssessment'

// Add to accordion
<AccordionSection type="new" color="#..." />
```

### Accessing Cached Data

```typescript
// From hook
const { data, loading, error } = useComprehensiveFieldAssessment()

// From session storage
const cached = sessionStorage.getItem('comprehensiveFieldAssessment')
const parsed = JSON.parse(cached) as EnhancedFieldData

// In component
useEffect(() => {
  if (geeData?.geeAssessment?.assessment_name) {
    const metrics = geeData.geeAssessment.assessment_name
    // Process metrics
  }
}, [geeData])
```

## 📡 API Integration

### GEE API Client
```typescript
import { geeApi } from '#lib/geeApiClient'

// Comprehensive assessment
const result = await geeApi.getComprehensiveAssessment({
  wkt: 'POLYGON(...)',
  year: 2023,
  include_visualizations: true
})

// Individual assessments
const erosion = await geeApi.getErosionRisk({ wkt, year })
const drought = await geeApi.getDroughtAssessment({ wkt, year })
```

### Error Handling
```typescript
try {
  const assessment = await assessField(geometry, ssurgoData, year)
} catch (error) {
  console.error('Assessment failed:', error)
  // Show user-friendly error message
}
```

## 🗺️ Map Visualizations (TODO)

Each assessment returns tile URLs:

```typescript
// From GEE response
assessment.erosion_risk.visualization.tile_url
assessment.concentrated_flow.visualization.spi_tile_url
assessment.drought.visualization.water_deficit_tile_url
assessment.productivity.visualization.yield_gap_tile_url
assessment.svi.visualization.tile_url
```

**Integration with FieldMap**:
```tsx
// Future implementation
<TileLayer
  url={geeData.geeAssessment.erosion_risk.visualization.tile_url}
  opacity={0.7}
  attribution="GEE API"
/>
```

## 🧪 Testing

### Unit Test Example
```typescript
describe('DroughtRiskAnalysis', () => {
  it('classifies PDSI correctly', () => {
    const pdsi = -3.5
    const category = getPDSICategory(pdsi)
    expect(category).toBe('Severe Drought')
  })
  
  it('calculates severity from water balance', () => {
    const balance = -120
    const severity = getDroughtSeverity(balance)
    expect(severity.label).toBe('Severe')
  })
})
```

### Manual Testing Checklist
- [ ] Select field on map
- [ ] Verify loading states show
- [ ] Check all 7 sections render
- [ ] Expand each accordion section
- [ ] Verify metrics display correctly
- [ ] Check severity colors match thresholds
- [ ] Validate recommendations appear
- [ ] Test with different field sizes
- [ ] Test with fields in different regions
- [ ] Verify session storage persistence

## 🐛 Common Issues

### Component Shows "No Data Available"
**Cause**: GEE API call failed or geometry invalid  
**Fix**: Check console for API errors, verify WKT geometry format

### Area Percentages Show 0.0%
**Cause**: SSURGO mupolygon query missing  
**Fix**: Ensure useFieldSSURGO two-query approach is used

### TypeScript Errors on Lucide Icons
**Cause**: React type version mismatch  
**Fix**: Non-blocking, can ignore or update @types/react

### Visualization Tiles Not Showing
**Cause**: Map integration not complete  
**Fix**: Implement TileLayer integration in FieldMap component

### Session Storage Not Persisting
**Cause**: Data too large or browser limits  
**Fix**: Check data size, consider compression or selective caching

## 📝 Code Snippets

### Severity Classification Helper
```typescript
function getSeverity(value: number, thresholds: {
  low: number
  moderate: number
  high: number
}): { label: string; color: string; bg: string } {
  if (value < thresholds.low) return { 
    label: 'Low', 
    color: '#166534', 
    bg: '#dcfce7' 
  }
  if (value < thresholds.moderate) return { 
    label: 'Moderate', 
    color: '#92400e', 
    bg: '#fef3c7' 
  }
  if (value < thresholds.high) return { 
    label: 'High', 
    color: '#ea580c', 
    bg: '#ffedd5' 
  }
  return { 
    label: 'Severe', 
    color: '#991b1b', 
    bg: '#fee2e2' 
  }
}
```

### Progress Bar Component
```tsx
<div className="h-2 bg-gray-200 rounded-full overflow-hidden">
  <div
    className="h-full rounded-full"
    style={{
      width: `${Math.min(percentage, 100)}%`,
      backgroundColor: getColorForSeverity(percentage)
    }}
  />
</div>
```

### Loading State
```tsx
if (loading) {
  return (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 mx-auto mb-2" 
           style={{ border: '2px solid #e5e7eb', borderTopColor: color }}>
      </div>
      <p className="text-sm text-gray-600">Analyzing {assessmentName}...</p>
    </div>
  )
}
```

## 📚 Resources

### Documentation
- [GEE API v2.1.0 Reference](../Property_Panel_Guide/gee-api-docs/API_UPDATE_SUMMARY.md)
- [Field Analysis Integration Guide](../Property_Panel_Guide/gee-api-docs/FIELD_ANALYSIS_INTEGRATION.md)
- [Endpoint Examples](../Property_Panel_Guide/gee-api-docs/ENDPOINT_EXAMPLES.md)

### Code Files
- Types: `src/types/geeApi.ts`
- Hook: `src/hooks/useComprehensiveFieldAssessment.ts`
- SSURGO: `src/hooks/useFieldSSURGO.ts`
- API Client: `src/lib/geeApiClient.ts`
- Main Page: `src/pages/field-analysis/[fieldId].tsx`

### External APIs
- **GEE Production**: https://gee-api-production.up.railway.app
- **SSURGO**: USDA NRCS Soil Data Mart
- **GridMET**: University of Idaho climate data
- **ACPF**: Agricultural Conservation Planning Framework

## 🎯 Next Steps

1. **Map Visualization**: Integrate GEE tile layers into FieldMap component
2. **Resource Concerns Summary**: Create overview dashboard with all risks
3. **Conservation Practices**: Link concerns to NRCS practice recommendations
4. **Multi-Field Comparison**: Compare assessments across multiple fields
5. **Historical Trends**: Track changes over multiple years
6. **Export Reports**: Generate PDF/Excel reports of field analysis
7. **Mobile Optimization**: Responsive design testing and refinement
8. **Performance**: Optimize API calls and data loading
