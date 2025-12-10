# Soil Survey Interactive Mapping Application

## Application Overview

**Name**: SoilViz Pro - Interactive Soil Survey Platform  
**Purpose**: A professional web application for visualizing soil properties, classifications, and environmental factors across survey areas, designed specifically for NRCS soil scientists and researchers.

### Core Features

**Interactive Mapping**:
- Multi-layer soil property visualization (organic carbon, pH, texture, etc.)
- Depth-based soil property exploration (0-5cm to 100-200cm)
- SSURGO soil survey unit boundaries and metadata
- Click-to-query soil profile information
- Real-time soil property predictions via your R/Python APIs

**Scientific Visualization**:
- Soil order classification maps with USDA taxonomy colors
- Environmental factor overlays (climate, elevation, parent material)
- MIR spectroscopy result integration
- Soil health assessment indicators

**Professional Interface**:
- NRCS-branded design with soil science color schemes
- Responsive design for field work on tablets
- Layer control panel with transparency sliders
- Depth selector for different soil horizons
- Export capabilities for maps and data

---

## Step-by-Step Implementation Guide

### Phase 1: Initial Setup and Template Customization

**Step 1: Clone and Setup Template**
```bash
git clone https://github.com/richard-unterberg/leaflet-nextjs-ts-starter soil-survey-app
cd soil-survey-app
npm install
```

**Step 2: Environment Configuration**
Create `.env.local`:
```env
NEXT_PUBLIC_SOIL_API_URL=https://your-r-plumber-api.com
NEXT_PUBLIC_MAPBOX_TOKEN=your_token_if_using_mapbox_tiles
NEXT_PUBLIC_USDA_WMS_URL=https://sdmdataaccess.nrcs.usda.gov/Spatial/SDMWGS84Geographic.wms
```

**Step 3: Update Package Dependencies**
Add soil-science specific packages to `package.json`:
```json
{
  "dependencies": {
    // ... existing dependencies
    "axios": "^1.6.0",
    "date-fns": "^2.30.0",
    "react-select": "^5.8.0",
    "react-slider": "^2.0.6",
    "chroma-js": "^2.4.2",
    "@types/chroma-js": "^2.0.0"
  }
}
```

### Phase 2: Project Structure Reorganization

**Step 4: Restructure for Soil Science Application**
```
src/
├── components/
│   ├── map/
│   │   ├── SoilMap.tsx              # Main map component
│   │   ├── LayerControl.tsx         # Soil layer management
│   │   ├── DepthSelector.tsx        # Soil depth selection
│   │   └── SoilPopup.tsx           # Soil profile popup
│   ├── ui/
│   │   ├── PropertyPanel.tsx        # Soil property display
│   │   ├── LegendPanel.tsx         # Map legend
│   │   └── LoadingSpinner.tsx      # Loading states
│   └── layout/
│       ├── Header.tsx              # NRCS header
│       └── Sidebar.tsx             # Layer controls sidebar
├── hooks/
│   ├── useSoilData.tsx             # Soil data fetching
│   ├── useMapLayers.tsx            # Layer management
│   └── useDepthSelection.tsx       # Depth state management
├── types/
│   ├── soil.ts                     # Soil data types
│   ├── map.ts                      # Map-related types
│   └── api.ts                      # API response types
├── utils/
│   ├── soilColors.ts               # Soil classification colors
│   ├── apiClient.ts                # API integration
│   └── geoUtils.ts                 # Geographic utilities
└── styles/
    └── soil-map.css                # Custom map styles
```

### Phase 3: Core Component Development

**Step 5: Create Soil Data Types**
`src/types/soil.ts`:
```typescript
export interface SoilProfile {
  id: string;
  coordinates: [number, number];
  survey_area: string;
  map_unit: string;
  soil_order: string;
  properties: {
    [depth: string]: {
      organic_carbon: number;
      ph: number;
      bulk_density: number;
      texture_class: string;
      clay_percent: number;
      sand_percent: number;
      silt_percent: number;
    };
  };
  mir_data?: {
    prediction_confidence: number;
    andic_properties: boolean;
    spectral_features: any;
  };
}

export interface SoilLayer {
  id: string;
  name: string;
  type: 'raster' | 'vector' | 'wms';
  url: string;
  visible: boolean;
  opacity: number;
  depth?: string;
  legend?: LegendItem[];
}

export type SoilDepth = '0-5cm' | '5-15cm' | '15-30cm' | '30-60cm' | '60-100cm' | '100-200cm';
```

**Step 6: Build the Main Map Component**
`src/components/map/SoilMap.tsx`:
```typescript
'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSoilData } from '#/hooks/useSoilData';
import { useMapLayers } from '#/hooks/useMapLayers';
import type { SoilProfile, SoilDepth } from '#/types/soil';

interface SoilMapProps {
  initialCenter: [number, number];
  initialZoom: number;
  selectedDepth: SoilDepth;
  activeLayers: string[];
  onSoilClick: (profile: SoilProfile) => void;
}

export default function SoilMap({
  initialCenter,
  initialZoom,
  selectedDepth,
  activeLayers,
  onSoilClick
}: SoilMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { fetchSoilProfile } = useSoilData();
  const { addSoilLayers, updateLayerDepth } = useMapLayers();

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize map
    mapRef.current = L.map(containerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
    });

    // Add custom zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

    // Add base layers
    const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    });
    baseLayer.addTo(mapRef.current);

    // Add click handler for soil profiles
    mapRef.current.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      try {
        const profile = await fetchSoilProfile(lat, lng);
        onSoilClick(profile);
      } catch (error) {
        console.error('Failed to fetch soil profile:', error);
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update layers when activeLayers or selectedDepth changes
  useEffect(() => {
    if (!mapRef.current) return;
    
    addSoilLayers(mapRef.current, activeLayers);
    updateLayerDepth(selectedDepth);
  }, [activeLayers, selectedDepth]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full soil-map"
      style={{ minHeight: '500px' }}
    />
  );
}
```

**Step 7: Create Layer Control Component**
`src/components/map/LayerControl.tsx`:
```typescript
import { useState } from 'react';
import { Layers, Eye, EyeOff } from 'lucide-react';
import type { SoilLayer } from '#/types/soil';

interface LayerControlProps {
  layers: SoilLayer[];
  onLayerToggle: (layerId: string) => void;
  onOpacityChange: (layerId: string, opacity: number) => void;
}

export default function LayerControl({ 
  layers, 
  onLayerToggle, 
  onOpacityChange 
}: LayerControlProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg max-w-sm">
      <div 
        className="flex items-center justify-between p-3 cursor-pointer border-b"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-nrcs-green" />
          <h3 className="font-medium text-gray-900">Soil Layers</h3>
        </div>
        <div className="text-sm text-gray-500">
          {layers.filter(l => l.visible).length}/{layers.length}
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-3 max-h-96 overflow-y-auto">
          <div className="space-y-3">
            {/* Soil Property Layers */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Soil Properties</h4>
              {layers.filter(l => l.type === 'raster').map((layer) => (
                <LayerItem
                  key={layer.id}
                  layer={layer}
                  onToggle={onLayerToggle}
                  onOpacityChange={onOpacityChange}
                />
              ))}
            </div>
            
            {/* Vector Layers */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Survey Data</h4>
              {layers.filter(l => l.type === 'vector').map((layer) => (
                <LayerItem
                  key={layer.id}
                  layer={layer}
                  onToggle={onLayerToggle}
                  onOpacityChange={onOpacityChange}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LayerItem({ layer, onToggle, onOpacityChange }: {
  layer: SoilLayer;
  onToggle: (layerId: string) => void;
  onOpacityChange: (layerId: string, opacity: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={layer.visible}
            onChange={() => onToggle(layer.id)}
            className="rounded text-nrcs-green focus:ring-nrcs-green"
          />
          <span className="text-sm text-gray-700">{layer.name}</span>
        </label>
        
        {layer.visible ? 
          <Eye className="w-4 h-4 text-gray-400" /> : 
          <EyeOff className="w-4 h-4 text-gray-400" />
        }
      </div>
      
      {layer.visible && (
        <div className="ml-6">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={layer.opacity}
            onChange={(e) => onOpacityChange(layer.id, parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-xs text-gray-500 text-right">
            {Math.round(layer.opacity * 100)}% opacity
          </div>
        </div>
      )}
    </div>
  );
}
```

### Phase 4: API Integration and Data Hooks

**Step 8: Create API Client for Your Backend**
`src/utils/apiClient.ts`:
```typescript
import axios from 'axios';
import type { SoilProfile } from '#/types/soil';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SOIL_API_URL,
  timeout: 10000,
});

export class SoilAPI {
  static async predictSoilProperties(lat: number, lon: number, depth: string): Promise<SoilProfile> {
    const response = await apiClient.post('/predict/soil-properties', {
      coordinates: [lat, lon],
      depth: depth,
      include_mir: true
    });
    return response.data;
  }

  static async getSoilSurveyData(bounds: L.LatLngBounds): Promise<any> {
    const response = await apiClient.post('/ssurgo/query', {
      bbox: [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth()
      ]
    });
    return response.data;
  }

  static async getMIRAnalysis(lat: number, lon: number): Promise<any> {
    const response = await apiClient.post('/mir/analyze', {
      coordinates: [lat, lon]
    });
    return response.data;
  }
}
```

**Step 9: Create Custom Hooks for Soil Data**
`src/hooks/useSoilData.tsx`:
```typescript
import { useState, useCallback } from 'react';
import { SoilAPI } from '#/utils/apiClient';
import type { SoilProfile, SoilDepth } from '#/types/soil';

export function useSoilData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSoilProfile = useCallback(async (
    lat: number, 
    lon: number, 
    depth?: SoilDepth
  ): Promise<SoilProfile> => {
    setLoading(true);
    setError(null);
    
    try {
      const profile = await SoilAPI.predictSoilProperties(lat, lon, depth || '0-5cm');
      return profile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch soil data';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMIRData = useCallback(async (lat: number, lon: number) => {
    try {
      return await SoilAPI.getMIRAnalysis(lat, lon);
    } catch (err) {
      console.error('MIR analysis failed:', err);
      return null;
    }
  }, []);

  return {
    fetchSoilProfile,
    fetchMIRData,
    loading,
    error
  };
}
```

### Phase 5: Soil Science Styling and Color Schemes

**Step 10: Create Soil Classification Color System**
`src/utils/soilColors.ts`:
```typescript
// USDA Soil Taxonomy color schemes
export const soilOrderColors = {
  'Alfisols': '#8B4513',
  'Andisols': '#2F4F4F',
  'Aridisols': '#DEB887',
  'Entisols': '#F5DEB3',
  'Gelisols': '#E6E6FA',
  'Histosols': '#000000',
  'Inceptisols': '#9ACD32',
  'Mollisols': '#654321',
  'Oxisols': '#B22222',
  'Spodosols': '#778899',
  'Ultisols': '#CD853F',
  'Vertisols': '#696969'
};

export const textureColors = {
  'Sand': '#F5E6D3',
  'Loamy Sand': '#E6D3A3',
  'Sandy Loam': '#D4A574',
  'Loam': '#C19A6B',
  'Silt Loam': '#A0826D',
  'Silt': '#8B7355',
  'Sandy Clay Loam': '#8B4513',
  'Clay Loam': '#654321',
  'Silty Clay Loam': '#5D4037',
  'Sandy Clay': '#4E342E',
  'Silty Clay': '#3E2723',
  'Clay': '#2E1B14'
};

export const carbonColorRamp = [
  { value: 0, color: '#FEF0D9' },
  { value: 1, color: '#FDD49E' },
  { value: 2, color: '#FC8D59' },
  { value: 5, color: '#D7301F' },
  { value: 10, color: '#B30000' }
];

export const phColorRamp = [
  { value: 3.5, color: '#E31A1C' },   // Very acidic
  { value: 5.5, color: '#FD8D3C' },   // Acidic
  { value: 7.0, color: '#33A02C' },   // Neutral
  { value: 8.5, color: '#1F78B4' },   // Alkaline
  { value: 10.0, color: '#6A3D9A' }   // Very alkaline
];
```

### Phase 6: Main Application Integration

**Step 11: Create Main Page Component**
`src/app/page.tsx`:
```typescript
'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Header from '#/components/layout/Header';
import LayerControl from '#/components/map/LayerControl';
import DepthSelector from '#/components/map/DepthSelector';
import PropertyPanel from '#/components/ui/PropertyPanel';
import { useSoilData } from '#/hooks/useSoilData';
import type { SoilProfile, SoilDepth, SoilLayer } from '#/types/soil';

// Lazy load map to avoid SSR issues
const SoilMap = dynamic(() => import('#/components/map/SoilMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nrcs-green mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading soil maps...</p>
      </div>
    </div>
  )
});

export default function SoilSurveyApp() {
  const [selectedDepth, setSelectedDepth] = useState<SoilDepth>('0-5cm');
  const [selectedProfile, setSelectedProfile] = useState<SoilProfile | null>(null);
  const [activeLayers, setActiveLayers] = useState<string[]>(['soil-orders']);
  
  const soilLayers: SoilLayer[] = [
    {
      id: 'soil-orders',
      name: 'Soil Orders',
      type: 'wms',
      url: 'https://sdmdataaccess.nrcs.usda.gov/Spatial/SDMWGS84Geographic.wms',
      visible: true,
      opacity: 0.7
    },
    {
      id: 'organic-carbon',
      name: 'Organic Carbon',
      type: 'raster',
      url: '/api/soil-tiles/carbon',
      visible: false,
      opacity: 0.8
    },
    {
      id: 'soil-ph',
      name: 'Soil pH',
      type: 'raster',
      url: '/api/soil-tiles/ph',
      visible: false,
      opacity: 0.8
    }
    // Add more layers as needed
  ];

  const handleSoilClick = useCallback((profile: SoilProfile) => {
    setSelectedProfile(profile);
  }, []);

  const handleLayerToggle = useCallback((layerId: string) => {
    setActiveLayers(prev => 
      prev.includes(layerId) 
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 relative">
        <SoilMap
          initialCenter={[44.5, -123.5]} // Oregon coordinates
          initialZoom={8}
          selectedDepth={selectedDepth}
          activeLayers={activeLayers}
          onSoilClick={handleSoilClick}
        />
        
        <LayerControl
          layers={soilLayers}
          onLayerToggle={handleLayerToggle}
          onOpacityChange={() => {}} // Implement opacity changes
        />
        
        <DepthSelector
          selectedDepth={selectedDepth}
          onDepthChange={setSelectedDepth}
        />
        
        {selectedProfile && (
          <PropertyPanel
            profile={selectedProfile}
            onClose={() => setSelectedProfile(null)}
          />
        )}
      </div>
    </div>
  );
}
```

### Phase 7: Deployment and Production Setup

**Step 12: Vercel Deployment Configuration**
Create `vercel.json`:
```json
{
  "build": {
    "env": {
      "NEXT_PUBLIC_SOIL_API_URL": "@soil-api-url"
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=300, stale-while-revalidate=86400"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/",
      "has": [
        {
          "type": "host",
          "value": "soil-survey.vercel.app"
        }
      ],
      "destination": "/map",
      "permanent": false
    }
  ]
}
```

**Step 13: Final Customizations**
- Add NRCS branding and color schemes throughout
- Implement error boundaries for robust error handling
- Add loading states and skeleton screens
- Create responsive design for mobile field work
- Add keyboard shortcuts for power users
- Implement data export functionality
- Add help tooltips explaining soil science terms

### Key Integration Points with Your R/Python APIs

1. **Soil Property Predictions**: Connect map clicks to your Bayesian spatial models
2. **MIR Spectroscopy**: Integrate real-time spectral analysis results
3. **SSURGO Integration**: Layer official soil survey data with your predictions
4. **Batch Processing**: Add tools for analyzing multiple locations
5. **Data Export**: Generate reports combining map visuals with statistical analysis

This architecture gives you a professional, extensible foundation that showcases your soil science expertise while providing practical tools for field researchers and survey work. The component-based structure makes it easy to add new features as your research evolves.
