# Soil Property Panel Implementation Guide

## Overview

This guide shows you how to upgrade your current soil property panel with two new professional designs:

1. **SoilPropertyPanel** - Clean, tab-based interface with enhanced data organization
2. **SoilPropertyDashboard** - Data-rich dashboard with charts and visualizations

## Installation & Setup

### 1. Install Required Dependencies

```bash
# Core UI components
npm install lucide-react

# For charts and data visualization (Dashboard version)
npm install recharts

# For animations (optional but recommended)
npm install framer-motion

# For enhanced styling
npm install @tailwindcss/typography
```

### 2. Add Styles to Your Project

Add the custom CSS to your global styles:

```javascript
// app/globals.css or pages/_app.js
import './soil-property-panel-styles.css';
```

Or import in your layout:

```javascript
// app/layout.js
import './soil-property-panel-styles.css';
```

## Integration Examples

### Basic Integration (Replace Your Current Panel)

```javascript
// pages/map.js or app/map/page.js
import { useState } from 'react';
import { SoilPropertyPanel } from '@/components/SoilPropertyPanel';
import { SoilPropertyDashboard } from '@/components/SoilPropertyDashboard';

export default function MapPage() {
  const [selectedSoil, setSelectedSoil] = useState(null);
  const [panelStyle, setPanelStyle] = useState('standard'); // 'standard' or 'dashboard'

  const handleMapClick = async (coordinates) => {
    // Your existing soil data fetch logic
    const soilData = await fetchSoilData(coordinates);
    setSelectedSoil(soilData);
  };

  return (
    <div className="relative w-full h-screen">
      {/* Your existing map component */}
      <div id="map" className="w-full h-full" />
      
      {/* Enhanced Soil Property Panel */}
      {selectedSoil && (
        <div className="absolute top-0 right-0 h-full z-20">
          {panelStyle === 'dashboard' ? (
            <SoilPropertyDashboard 
              soilData={selectedSoil}
              onClose={() => setSelectedSoil(null)}
            />
          ) : (
            <SoilPropertyPanel 
              soilData={selectedSoil}
              onClose={() => setSelectedSoil(null)}
            />
          )}
        </div>
      )}
      
      {/* Style Switcher (Optional) */}
      <div className="absolute top-4 right-4 z-30">
        <select 
          value={panelStyle}
          onChange={(e) => setPanelStyle(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm"
        >
          <option value="standard">Standard Panel</option>
          <option value="dashboard">Dashboard View</option>
        </select>
      </div>
    </div>
  );
}
```

### Advanced Integration with Animation

```javascript
// components/AnimatedSoilPanel.js
import { AnimatePresence, motion } from 'framer-motion';
import { SoilPropertyPanel } from './SoilPropertyPanel';

export function AnimatedSoilPanel({ soilData, isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && soilData && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ 
            type: 'spring', 
            damping: 25, 
            stiffness: 200 
          }}
          className="absolute top-0 right-0 h-full z-20"
        >
          <SoilPropertyPanel 
            soilData={soilData}
            onClose={onClose}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Mobile-Responsive Integration

```javascript
// components/ResponsiveSoilPanel.js
import { useState, useEffect } from 'react';
import { SoilPropertyPanel } from './SoilPropertyPanel';

export function ResponsiveSoilPanel({ soilData, onClose }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
        <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] bg-white rounded-t-lg">
          <SoilPropertyPanel 
            soilData={soilData}
            onClose={onClose}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-0 right-0 h-full z-20">
      <SoilPropertyPanel 
        soilData={soilData}
        onClose={onClose}
      />
    </div>
  );
}
```

## Data Structure Requirements

Your soil data should follow this structure for optimal compatibility:

```javascript
const soilDataStructure = {
  mapUnit: {
    key: 'G1616',           // MUKEY
    symbol: '1B',           // Map unit symbol
    name: 'Aloha silt loam, 3 to 6 percent slopes',
    acres: 13161,
    coordinates: [45.081582, -122.709346]
  },
  composition: [
    { 
      component: 'Aloha', 
      percentage: 85, 
      major: true 
    },
    // ... more components
  ],
  properties: {
    slope: '3-6%',
    drainage: 'Somewhat poorly drained',
    texture: 'Silt loam',
    depth: '60+ inches',
    permeability: 'Slow',
    available_water: 'High'
  },
  taxonomy: {
    order: 'Mollisols',
    suborder: 'Aquolls',
    greatGroup: 'Argialbolls',
    subgroup: 'Typic Argialbolls'
  },
  // For dashboard version with charts
  horizons: [
    { 
      name: 'Ap', 
      depth: 8, 
      color: '#8b7355', 
      texture: 'Silt loam', 
      om: 4.2 
    },
    // ... more horizons
  ],
  // Optional: MIR spectroscopy data
  spectroscopy: {
    prediction_confidence: 89,
    measured_vs_predicted: [
      { property: 'OM', measured: 4.2, predicted: 4.1 },
      // ... more predictions
    ]
  }
};
```

## Data Fetching Integration

### Updating Your Existing Fetch Function

```javascript
// utils/soilDataFetch.js
export async function fetchEnhancedSoilData(coordinates) {
  try {
    // Your existing NRCS SDA query
    const mapUnitData = await fetchMapUnitData(coordinates);
    const componentData = await fetchComponentData(mapUnitData.mukey);
    const taxonomyData = await fetchTaxonomyData(mapUnitData.mukey);
    
    // Transform to new structure
    const enhancedData = {
      mapUnit: {
        key: mapUnitData.mukey,
        symbol: mapUnitData.musym,
        name: mapUnitData.muname,
        acres: mapUnitData.muacres,
        coordinates: coordinates
      },
      composition: componentData.map(comp => ({
        component: comp.compname,
        percentage: comp.comppct_r,
        major: comp.majcompflag === 'Yes'
      })),
      properties: {
        slope: `${mapUnitData.slope_l}-${mapUnitData.slope_h}%`,
        drainage: componentData[0]?.drainagecl,
        texture: componentData[0]?.texture,
        // ... map other properties
      },
      taxonomy: {
        order: taxonomyData.taxorder,
        suborder: taxonomyData.taxsuborder,
        greatGroup: taxonomyData.taxgrtgroup,
        subgroup: taxonomyData.taxsubgrp
      }
    };
    
    return enhancedData;
  } catch (error) {
    console.error('Error fetching enhanced soil data:', error);
    throw error;
  }
}
```

## Customization Options

### Theming

You can customize the color scheme by modifying the CSS variables:

```css
/* Custom theme example */
:root {
  --soil-primary: #2563eb;      /* Blue theme */
  --soil-secondary: #1d4ed8;
  --soil-accent: #3b82f6;
}

/* Oregon-specific theme */
:root {
  --soil-primary: #059669;      /* Forest green */
  --soil-secondary: #047857;
  --soil-accent: #10b981;
}
```

### Adding Custom Tabs

```javascript
// Extend the panel with custom tabs
const customTabs = [
  ...defaultTabs,
  { 
    id: 'spectroscopy', 
    label: 'MIR Analysis', 
    icon: Microscope 
  },
  { 
    id: 'management', 
    label: 'Management', 
    icon: Settings 
  }
];
```

## Best Practices

### Performance Optimization

1. **Lazy Load Charts**: Only load chart components when needed
```javascript
import dynamic from 'next/dynamic';
const SoilPropertyDashboard = dynamic(() => import('./SoilPropertyDashboard'), {
  loading: () => <div className="w-96 h-full bg-gray-100 animate-pulse" />
});
```

2. **Memoize Heavy Components**:
```javascript
import { memo } from 'react';
export const SoilPropertyPanel = memo(SoilPropertyPanelComponent);
```

3. **Optimize Data Fetching**:
```javascript
// Add caching to prevent repeated requests
const soilDataCache = new Map();
```

### Accessibility

1. **Keyboard Navigation**: All interactive elements support keyboard navigation
2. **Screen Readers**: Proper ARIA labels and semantic HTML
3. **Color Contrast**: Meets WCAG AA standards
4. **Focus Management**: Clear focus indicators

### Testing

```javascript
// Example test setup
import { render, screen } from '@testing-library/react';
import { SoilPropertyPanel } from './SoilPropertyPanel';

test('displays soil data correctly', () => {
  const mockData = { /* your test data */ };
  render(<SoilPropertyPanel soilData={mockData} onClose={() => {}} />);
  
  expect(screen.getByText(mockData.mapUnit.name)).toBeInTheDocument();
});
```

## Migration from Current Panel

1. **Backup** your current component
2. **Replace** imports with new components
3. **Update** data structure to match new format
4. **Test** all functionality
5. **Add** new features gradually

## Support

For additional customization or issues:
- Check component props and documentation
- Modify CSS variables for theming
- Extend components for custom functionality
- Use TypeScript interfaces for better type safety

The new panels are designed to be drop-in replacements that significantly enhance the user experience while maintaining all existing functionality.
