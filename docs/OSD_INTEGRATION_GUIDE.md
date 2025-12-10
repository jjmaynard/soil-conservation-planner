# Official Series Description (OSD) Integration Guide

## Overview

This system provides a standardized method for extracting, parsing, and displaying USDA-NRCS Official Series Description (OSD) data within the Soil Conservation Planner application.

## Architecture

### Components

1. **OSD Parser** (`src/utils/osdParser.ts`)
   - Parses OSD text files into structured TypeScript objects
   - Extracts key information sections: climate, horizons, characteristics, etc.
   - Provides formatting utilities for display

2. **API Endpoint** (`src/pages/api/osd.ts`)
   - REST endpoint: `GET /api/osd?component=ABBOTT`
   - Loads OSD files from `Property_Panel_Guide/OSD/`
   - Returns parsed and formatted data

3. **React Hook** (`src/hooks/useOSDData.tsx`)
   - Fetches OSD data for a given component name
   - Manages loading and error states
   - Automatically refetches when component changes

4. **Display Component** (`src/components/ui/OSDDisplay.tsx`)
   - Renders OSD data in a tabbed interface
   - Four tabs: Overview, Horizons, Properties, Land Use
   - Responsive, styled UI with icons and color coding

## Data Structure

### OSDData Interface

```typescript
interface OSDData {
  seriesName: string
  state: string
  established: {
    revision: string
    date: string
  }
  taxonomicClass: string
  typicalPedon: {
    description: string
    horizons: OSDHorizon[]
  }
  rangeInCharacteristics: {
    meanAnnualSoilTemp: string
    clayContent: string
    organicMatter: string
    other: string[]
    horizons: Record<string, any>
  }
  geographicSetting: {
    landforms: string[]
    parentMaterial: string
    slopes: string
    climate: string
    precipitation: string
    temperature: string
    frostFreePeriod: string
  }
  drainage: {
    class: string
    permeability: string
    runoff: string
    waterTable: string
  }
  useAndVegetation: {
    use: string
    vegetation: string
  }
  distribution: {
    extent: string
    mlra: string[]
  }
  remarks: {
    diagnosticHorizons: string[]
    features: string[]
  }
}
```

### OSDHorizon Interface

```typescript
interface OSDHorizon {
  name: string                    // e.g., "A", "Bg", "BCg1"
  depth: string                   // e.g., "0-8 inches"
  depthRange: { top: number; bottom: number }
  texture: string                 // e.g., "silty clay"
  color: {
    dry?: string                  // e.g., "gray (2.5Y 6/1)"
    moist?: string
  }
  structure: string               // e.g., "weak medium subangular blocky"
  consistence: string             // e.g., "extremely hard, very firm"
  features: string[]              // e.g., ["Iron accumulation", "Carbonates present"]
  pH: number | null
  reaction: string                // e.g., "moderately alkaline"
  effervescence: string           // e.g., "violently effervescent"
  other: string[]
}
```

## Usage

### In PropertyPanel Component

```typescript
import { useOSDData } from '#src/hooks/useOSDData'
import OSDDisplay from '#src/components/ui/OSDDisplay'

function PropertyPanel({ soilData }: { soilData: SSURGOData }) {
  // Get the dominant component name
  const componentName = soilData.components?.[0]?.compname
  
  // Fetch OSD data
  const { osdData, loading, error } = useOSDData(componentName)
  
  return (
    <div>
      {/* Existing soil data display */}
      
      {/* OSD Section */}
      {loading && <div>Loading OSD data...</div>}
      {error && <div className="text-red-600">Error: {error}</div>}
      {osdData && (
        <OSDDisplay 
          componentName={componentName!} 
          osdData={osdData} 
          className="mt-4"
        />
      )}
    </div>
  )
}
```

### In SoilDashboard Component

```typescript
import { useOSDData } from '#src/hooks/useOSDData'
import OSDDisplay from '#src/components/ui/OSDDisplay'

function SoilDashboard({ soilData }: { soilData: SSURGOData }) {
  const componentName = soilData.components?.[0]?.compname
  const { osdData, loading, error } = useOSDData(componentName)
  
  return (
    <div className="dashboard-layout">
      {/* Full-screen display with OSD in a dedicated section */}
      {osdData && (
        <section className="osd-section">
          <h2>Official Series Description</h2>
          <OSDDisplay componentName={componentName!} osdData={osdData} />
        </section>
      )}
    </div>
  )
}
```

## Extracted Information

The parser extracts the following sections from OSD text files:

### 1. Overview Tab
- **Climate & Environment**
  - Mean annual temperature
  - Mean annual precipitation
  - Frost-free period
  
- **Landforms & Setting**
  - Landform types (flood plains, lake plains, etc.)
  - Slope range
  - Parent material
  
- **Drainage & Hydrology**
  - Drainage class (poorly, well, etc.)
  - Permeability rate
  - Runoff classification
  - Water table depth and timing
  
- **Distribution**
  - Geographic extent
  - MLRA (Major Land Resource Areas)

### 2. Horizons Tab
- Complete soil profile with all horizons
- For each horizon:
  - Designation (A, Bg, BCg1, etc.)
  - Depth range
  - Texture
  - Color (dry and moist)
  - Structure
  - Consistence
  - pH and reaction
  - Effervescence
  - Special features (iron accumulation, carbonates, etc.)

### 3. Properties Tab
- **Range in Characteristics**
  - Mean annual soil temperature range
  - Clay content range
  - Organic matter content
  
- **Diagnostic Horizons**
  - Ochric epipedon
  - Cambic horizon
  - etc.
  
- **Special Features**
  - Aquic conditions
  - Vertic features
  - etc.

### 4. Land Use Tab
- Primary land use (agriculture, pasture, etc.)
- Natural vegetation types
- Management considerations
- Typical pedon context

## File Organization

```
Property_Panel_Guide/
└── OSD/
    ├── ABBOTT.txt
    ├── ABBOTTSTOWN.txt
    ├── ABBYVILLE.txt
    └── ... (all OSD text files)

src/
├── utils/
│   └── osdParser.ts           # Core parsing logic
├── hooks/
│   └── useOSDData.tsx         # React hook for fetching OSD
├── components/
│   └── ui/
│       ├── OSDDisplay.tsx     # Display component
│       ├── PropertyPanel.tsx  # Integration point
│       └── SoilDashboard.tsx  # Integration point
└── pages/
    └── api/
        └── osd.ts             # API endpoint
```

## Parsing Strategy

### 1. Section Extraction
The parser uses regex patterns to identify major sections:
- `TAXONOMIC CLASS:`
- `TYPICAL PEDON:`
- `RANGE IN CHARACTERISTICS:`
- `GEOGRAPHIC SETTING:`
- `DRAINAGE AND PERMEABILITY:`
- `USE AND VEGETATION:`
- `DISTRIBUTION AND EXTENT:`
- `REMARKS:`

### 2. Horizon Parsing
Horizons are identified by their format:
```
    A--0 to 8 inches; gray (2.5Y 6/1) silty clay, ...
```

The parser extracts:
- Horizon designation before `--`
- Depth range (top and bottom numbers)
- Texture (first soil texture term after semicolon)
- Colors (Munsell notation in parentheses)
- Structure, consistence, pH from descriptive text
- Special features (keywords: iron, carbonates, redox, etc.)

### 3. Property Extraction
Uses targeted regex patterns for specific properties:
- Temperature: `(\d+\s+to\s+\d+\s+degrees\s+F)`
- Precipitation: `(\d+\s+to\s+\d+\s+inches)`
- Slopes: `(\d+\s+to\s+\d+\s+percent)`
- pH: `pH\s+([\d.]+)`

## Error Handling

The system gracefully handles:
1. **Missing OSD files**: Returns 404 with helpful message
2. **Parse errors**: Returns null and logs error, doesn't break UI
3. **Incomplete data**: Displays only available sections
4. **Network errors**: Shows error message in UI

## Styling & UX

### Color Coding
- Blue: Climate and water-related info
- Green: Vegetation and landforms
- Amber: Soil horizons
- Gray: Default/neutral information

### Icons
- Cloud: Climate
- Thermometer: Temperature
- Droplets: Water/drainage
- Mountain: Landforms
- Layers: Horizons
- Sprout: Vegetation/use
- MapPin: Distribution
- BookOpen: OSD header

### Responsive Design
- Tabs for organizing large amounts of information
- Scrollable content area (max 600px height)
- Mobile-friendly touch targets
- Clear visual hierarchy

## Future Enhancements

1. **Search & Filter**
   - Search within OSD text
   - Filter horizons by properties
   
2. **Comparison**
   - Compare OSDs side-by-side
   - Highlight differences
   
3. **Visualization**
   - Soil profile diagram
   - Climate graphs
   - Property charts
   
4. **Caching**
   - Cache parsed OSD data
   - Reduce API calls
   
5. **Export**
   - PDF generation
   - CSV export of properties
   
6. **Links**
   - Link to official NRCS OSD page
   - Link to related soil surveys

## Testing

To test the OSD system:

```bash
# 1. Ensure OSD files are in place
ls Property_Panel_Guide/OSD/ABBOTT.txt

# 2. Start development server
npm run dev

# 3. Test API endpoint directly
curl http://localhost:3000/api/osd?component=ABBOTT

# 4. Test in UI
# Navigate to a location with Abbott soil component
# Open PropertyPanel or SoilDashboard
# Verify OSD data displays correctly
```

## Maintenance

### Adding New OSD Files
1. Place `.txt` file in `Property_Panel_Guide/OSD/`
2. Name file as `{COMPONENT_NAME}.txt` (uppercase)
3. No code changes needed - system auto-detects

### Updating Parser
If NRCS changes OSD format:
1. Update regex patterns in `osdParser.ts`
2. Add new extraction functions as needed
3. Update TypeScript interfaces
4. Test with multiple OSD files

### Performance Considerations
- OSD files are loaded on-demand (not bundled)
- Parsing happens server-side (API route)
- Client receives only structured data
- Consider caching for frequently accessed soils
