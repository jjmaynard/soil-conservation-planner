# Hybrid Field Analysis Layout - Implementation Guide

## Overview

This hybrid layout combines the best elements from multiple design patterns:

1. **Dashboard View** - KPI cards with quick overview
2. **Detail View** - Tabbed analysis for deep dives
3. **Floating Map Widget** - Dockable, resizable map component
4. **Progressive Disclosure** - Start simple, expand for details
5. **Responsive Design** - Works on desktop, tablet, and mobile

## Components Created

### 1. DashboardView.tsx
**Location**: `src/components/FieldAnalysis/layouts/DashboardView.tsx`

**Features**:
- Grid of KPI cards (Soil, Erosion, Drainage, Productivity, SVI, Drought)
- Color-coded risk indicators
- Click-to-detail navigation
- Quick action buttons
- Status indicators for data sources

**Usage**:
```tsx
<DashboardView
  fieldData={fieldData}
  ssurgoData={ssurgoData}
  geeData={geeData}
  onCardClick={(section) => console.log('Navigate to:', section)}
/>
```

### 2. DetailView.tsx
**Location**: `src/components/FieldAnalysis/layouts/DetailView.tsx`

**Features**:
- Horizontal tab navigation
- 10 analysis tabs (Soil, Erosion, Drainage, etc.)
- Active tab highlighting with custom colors
- Scrollable content area
- Tab descriptions

**Usage**:
```tsx
<DetailView
  fieldData={fieldData}
  ssurgoData={ssurgoData}
  geeData={geeData}
  activeTab="soil"
  onTabChange={(tab) => setActiveTab(tab)}
  onSoilSelect={(soil) => setSelectedSoil(soil)}
/>
```

### 3. FloatingMapWidget.tsx
**Location**: `src/components/FieldAnalysis/layouts/FloatingMapWidget.tsx`

**Features**:
- 5 size modes: minimized, small, medium, large, fullscreen
- 4 position corners + center
- Draggable/dockable
- Layer toggle controls
- Hide/show functionality
- Status bar with field info

**Usage**:
```tsx
<FloatingMapWidget
  fieldData={fieldData}
  selectedSoil={selectedSoil}
  activeLayers={['soil-boundaries', 'erosion-risk']}
  showCSBLayer={true}
  onCSBLayerToggle={() => toggleCSB()}
  onLayerToggle={(layerId) => toggleLayer(layerId)}
/>
```

### 4. HybridFieldAnalysis (Main Page)
**Location**: `src/pages/field-analysis/hybrid/[fieldId].tsx`

**Features**:
- Dashboard/Detail view toggle
- Floating map show/hide
- Export functionality
- Settings menu
- Integrated SSURGO and GEE data loading

**Access**:
Navigate to: `/field-analysis/hybrid/[fieldId]`

## Key Design Patterns

### Progressive Disclosure
- **Dashboard**: High-level KPIs visible at a glance
- **Detail**: Deep analysis on demand via tabs
- **Map**: Floating widget, expandable to fullscreen

### Responsive Breakpoints
```css
Mobile (<768px): Stacked cards, bottom-sheet map
Tablet (768-1280px): 2-column grid, docked map
Desktop (>1280px): 3-column grid, floating map
```

### Color Coding
- **Green (#16a34a)**: Soil, Productivity, Conservation
- **Orange (#ea580c)**: Erosion, SVI, Drought
- **Blue (#0369a1)**: Drainage, Flow
- **Purple (#7c3aed)**: Management Zones
- **Amber (#d97706)**: Resource Concerns

### State Management
```tsx
// View mode
const [viewMode, setViewMode] = useState<'dashboard' | 'detail'>('dashboard')

// Active tab in detail view
const [activeDetailTab, setActiveDetailTab] = useState('soil')

// Map visibility and layers
const [showMap, setShowMap] = useState(true)
const [activeLayers, setActiveLayers] = useState<string[]>(['soil-boundaries'])
```

## Usage Examples

### Switching Between Views
```tsx
// In header
<button onClick={() => setViewMode('dashboard')}>Dashboard</button>
<button onClick={() => setViewMode('detail')}>Detail</button>

// Navigate from dashboard card to detail
const handleCardClick = (section: string) => {
  setViewMode('detail')
  setActiveDetailTab(section)
}
```

### Controlling the Floating Map
```tsx
// Toggle map visibility
<button onClick={() => setShowMap(!showMap)}>
  {showMap ? 'Hide Map' : 'Show Map'}
</button>

// Map widget automatically handles:
// - Size changes (click expand/minimize)
// - Position changes (click move icon)
// - Fullscreen mode
// - Layer toggles
```

### Integrating with Existing Components
The hybrid layout reuses all existing analysis components:
- `SoilComposition`
- `ErosionAnalysis`
- `DrainageAssessment`
- `ProductivityAnalysis`
- `SVIAnalysis`
- `ConcentratedFlowAnalysis`
- `DroughtRiskAnalysis`
- `ResourceConcerns`
- `ConservationPractices`
- `ManagementZones`

## Testing the Layout

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to hybrid layout**:
   ```
   http://localhost:3000/field-analysis/hybrid/[fieldId]
   ```

3. **Test workflows**:
   - Click Dashboard view → Click KPI card → Detail view opens on that tab
   - Toggle between Dashboard/Detail using header buttons
   - Expand map to fullscreen → Navigate tabs → Map stays visible
   - Click "Hide Map" → Map minimizes to button → Click to restore
   - Change map position using move icon
   - Toggle layer visibility in map widget

## Customization

### Adding New Tabs
Edit `DetailView.tsx`:
```tsx
const tabs: Tab[] = [
  // ... existing tabs
  { 
    id: 'custom', 
    label: 'Custom Analysis', 
    icon: CustomIcon, 
    color: '#9333ea', 
    bgColor: '#faf5ff' 
  }
]

// Add case in render:
{selectedTab === 'custom' && (
  <CustomAnalysis fieldId={fieldData?.id} />
)}
```

### Customizing KPI Cards
Edit `DashboardView.tsx` - each card is a button with:
- Icon
- Title
- Value (metric)
- Subtitle (context)
- Color scheme
- Click handler

### Map Widget Positions
Modify `FloatingMapWidget.tsx`:
```tsx
type MapPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center' | 'custom'

// Add custom positioning logic in getPositionStyles()
```

## Migration Path

### From Current Layout
1. Keep existing `/field-analysis/[fieldId].tsx` as default
2. Add hybrid layout at `/field-analysis/hybrid/[fieldId].tsx`
3. Add toggle in settings to choose preferred layout
4. Gather user feedback
5. Deprecate old layout if hybrid is preferred

### Incremental Adoption
- Use `DashboardView` as landing page only
- Keep existing accordion sidebar
- Add floating map widget independently
- Full migration when ready

## Performance Considerations

- **Lazy loading**: Map widget uses `dynamic()` import
- **Memoization**: Consider wrapping KPI calculations in `useMemo`
- **Virtual scrolling**: For large datasets in detail tabs
- **Debouncing**: Map interactions and layer toggles

## Accessibility

- All interactive elements have keyboard navigation
- ARIA labels on icon buttons
- Color contrast meets WCAG AA standards
- Focus visible on all controls
- Screen reader friendly tab navigation

## Next Steps

1. Test with real field data
2. Gather user feedback on layout preferences
3. Add comparison mode (side-by-side fields)
4. Implement saved view templates
5. Add print/PDF export optimized for each view
6. Create mobile-optimized version

## Support

For questions or issues with the hybrid layout:
- Check console for data loading errors
- Verify SSURGO and GEE API responses
- Ensure field boundary geometry is valid
- Test with multiple field sizes (small <10 ac, large >100 ac)
