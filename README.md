# Soil Conservation Planner

**Interactive Soil Interpretation Platform**

A web-based application for visualizing and analyzing soil properties, SSURGO data, and cropland history using interactive maps and comprehensive data dashboards.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.1.3-black)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue)

## Features

### Interactive Mapping
- **Leaflet-based interactive maps** with multiple soil property layers
- **Real-time soil data visualization** from ISRIC SoilGrids
- **SSURGO data integration** with detailed soil survey information
- **Cropland Data Layer (CDL)** overlays from USDA NASS CropScape

### Soil Property Analysis
- Multiple soil properties at various depths (0-200cm):
  - Organic Carbon
  - Soil pH
  - Bulk Density
  - Clay Content
- Dynamic property panel with detailed horizon information
- Soil texture and classification visualization

### Cropland History Analysis
- **16 years of crop rotation data** (2008-2023) from USDA NASS CDL
- **Crop type classification** (annual, perennial, permanent, pasture, forest)
- **Confidence estimates** based on NASS accuracy assessments
- **Transition validation** to detect unlikely crop patterns
- **Interactive visualizations**:
  - Horizontal bar charts showing crop distribution
  - Rotation flow diagrams
  - Recent years timeline with confidence indicators

### Comprehensive Dashboard
- Full-screen soil property dashboard with multiple chart types:
  - Radar charts for property comparison
  - Pie charts for component composition
  - Line charts for horizon trends
  - Bar charts for crop distribution
- Integrated cropland history section with statistics and visualizations
- Export-ready data presentations

## Technology Stack

- **Framework**: Next.js 14 with TypeScript
- **Mapping**: Leaflet, React Leaflet
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Data Sources**:
  - ISRIC SoilGrids API
  - USDA NRCS Soil Data Access (SSURGO)
  - USDA NASS CropScape (Cropland Data Layer)

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jjmaynard/soil-conservation-planner.git
cd soil-conservation-planner
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file for environment variables (if needed):
```bash
# Add any necessary API keys or configuration
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
soil-conservation-planner/
├── src/
│   ├── components/
│   │   ├── layout/          # Header and layout components
│   │   ├── map/             # Map-related components (CroplandLegend, LayerControl)
│   │   └── ui/              # UI components (PropertyPanel, SoilDashboard)
│   ├── pages/
│   │   ├── api/             # API routes (CDL proxy, soil data)
│   │   └── index.tsx        # Main application page
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   │   ├── cdlQuery.ts      # CDL API integration
│   │   ├── cdlCropTypes.ts  # Crop classification and validation
│   │   └── soilColors.ts    # Color mapping utilities
│   └── hooks/               # Custom React hooks
├── public/                  # Static assets
└── package.json
```

## Key Components

### Coordinate Transformation
The application includes a complete implementation of the Albers Equal Area Conic projection (EPSG:5070) for querying the CropScape API, as it requires coordinates in this specific projection system rather than standard WGS84.

### Crop Type Classification
Over 150 crop types are classified into 8 categories with accuracy estimates based on NASS validation studies:
- Annual crops
- Perennial crops
- Permanent crops (orchards, vineyards)
- Pasture and hay
- Forest
- Developed land
- Water
- Other land uses

### Transition Validation
The system detects unlikely crop transitions to flag potential data quality issues, such as:
- Single-year permanent crops
- Impossible crop type transitions
- Unexpected land use changes

## API Integration

### USDA NASS CropScape
- **Endpoint**: `/api/cdl-value`
- **Purpose**: CORS proxy with coordinate transformation
- **Features**: 
  - WGS84 to Albers projection conversion
  - 24-hour caching for annual data
  - Graceful handling of no-data responses

### ISRIC SoilGrids
- Tile-based soil property layers
- Multiple depth intervals
- Real-time data fetching

### USDA NRCS Soil Data Access
- SSURGO polygon data
- Detailed component and horizon information
- Soil interpretations and ratings

## License

This project is licensed under the MIT License.

## Acknowledgments

This project is based on the [Next.js Leaflet Starter TypeScript](https://github.com/richard-unterberg/next-leaflet-starter-typescript) template by [Richard Unterberg](https://github.com/richard-unterberg).

### Data Sources
- **Soil Data**: [ISRIC SoilGrids](https://soilgrids.org/)
- **Soil Surveys**: [USDA NRCS Soil Data Access](https://sdmdataaccess.nrcs.usda.gov/)
- **Cropland Data**: [USDA NASS CropScape](https://nassgeodata.gmu.edu/CropScape/)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

**Jonathan Maynard**
- GitHub: [@jjmaynard](https://github.com/jjmaynard)

## Support

For questions or issues, please open an issue on the [GitHub repository](https://github.com/jjmaynard/soil-conservation-planner/issues).
