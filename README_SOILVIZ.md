# SoilViz Pro - Interactive Soil Survey Platform

A professional web application for visualizing soil properties, classifications, and environmental factors across survey areas, designed specifically for NRCS soil scientists and researchers.

## Features

- 🗺️ **Interactive Mapping**: Multi-layer soil property visualization with Leaflet
- 📊 **Depth-based Exploration**: View soil properties from 0-5cm to 100-200cm depths
- 🧪 **Scientific Visualization**: USDA soil taxonomy colors and classifications
- 🔬 **MIR Spectroscopy**: Integration with mid-infrared spectral analysis
- 📱 **Responsive Design**: Works on desktop and tablets for field work
- 🎨 **NRCS Branding**: Professional design with soil science color schemes

## Getting Started

### Prerequisites

- Node.js 18.17.0 or higher
- npm or yarn
- Your R/Python soil prediction API endpoint

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd soil-mapper
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env.local` file with:
```env
NEXT_PUBLIC_SOIL_API_URL=http://localhost:8000
NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here
NEXT_PUBLIC_USDA_WMS_URL=https://sdmdataaccess.nrcs.usda.gov/Spatial/SDMWGS84Geographic.wms
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── components/
│   ├── map/              # Map components (SoilMap, LayerControl, DepthSelector)
│   ├── ui/               # UI components (PropertyPanel, LoadingSpinner)
│   └── layout/           # Layout components (Header)
├── hooks/                # Custom React hooks
│   ├── useSoilData.tsx
│   ├── useMapLayers.tsx
│   └── useDepthSelection.tsx
├── types/                # TypeScript type definitions
│   ├── soil.ts
│   ├── map.ts
│   └── api.ts
├── utils/                # Utility functions
│   ├── soilColors.ts     # USDA color schemes
│   ├── apiClient.ts      # API integration
│   └── geoUtils.ts       # Geographic utilities
└── pages/                # Next.js pages
    └── index.tsx         # Main application page
```

## API Integration

The application expects your backend API to provide the following endpoints:

### Soil Property Prediction
```
POST /predict/soil-properties
Body: {
  coordinates: [lat, lon],
  depth: "0-5cm",
  include_mir: true
}
```

### SSURGO Query
```
POST /ssurgo/query
Body: {
  bbox: [west, south, east, north]
}
```

### MIR Analysis
```
POST /mir/analyze
Body: {
  coordinates: [lat, lon]
}
```

## Customization

### Change Study Area
Edit the initial map coordinates in `src/pages/index.tsx`:
```typescript
<SoilMap
  initialCenter={[44.5, -123.5]}  // Your coordinates
  initialZoom={8}
  ...
/>
```

### Add Custom Layers
Add new layers to the `soilLayers` array in `src/pages/index.tsx`:
```typescript
{
  id: 'custom-layer',
  name: 'Custom Layer Name',
  type: 'raster',
  url: '/api/custom-tiles',
  visible: false,
  opacity: 0.8,
}
```

### Customize Colors
Modify soil classification colors in `src/utils/soilColors.ts`

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Docker
```bash
docker build -t soilviz-pro .
docker run -p 3000:3000 soilviz-pro
```

## Technologies

- **Next.js 14**: React framework
- **TypeScript**: Type-safe development
- **Leaflet**: Interactive mapping
- **Tailwind CSS**: Styling
- **Axios**: API requests
- **Lucide React**: Icons

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT License - see LICENSE file for details

## Acknowledgments

- USDA NRCS for soil survey data
- OpenStreetMap contributors
- Leaflet community

## Support

For questions or issues, please open a GitHub issue or contact the development team.

---

Built with ❤️ for soil science research
