# GEE API Enhancement: K-Factor Map URL Generation

## Problem Statement

Currently, when K-factor data is retrieved from the gSSURGO kwfact raster in GEE, the `map_url` field in the response is `null`. This prevents users from visualizing the K-factor distribution across their field, even though the data is already available in GEE.

**Current Response:**
```json
{
  "k_factor": {
    "factor_name": "K-factor",
    "factor_value": 0.1181,
    "statistics": {
      "mean": 0.1181,
      "min": 0,
      "max": 0.32,
      "std_dev": 0.1355
    },
    "unit": "t·ha·h/(ha·MJ·mm)",
    "methodology": "Direct gSSURGO kwfact raster value",
    "data_source": "gSSURGO kwfact (GEE)",
    "map_url": null  // ❌ Should be populated
  }
}
```

## Objective

Generate GEE visualization map URLs for K-factor when:
1. Data source is gSSURGO kwfact raster
2. Request includes `"include_factor_maps": true`

Apply to both:
- `/api/rusle/k-factor` endpoint
- `/api/rusle/calculate` endpoint (when returning K-factor data)

---

## Implementation Guide

### 1. K-Factor Map Visualization Parameters

**Recommended Visualization:**
```python
k_factor_vis = {
    'min': 0.0,
    'max': 0.4,  # Typical max K-factor
    'palette': [
        '#2c7bb6',  # Low (0.0) - Blue - Low erodibility
        '#abd9e9',  # 
        '#ffffbf',  # Medium (0.2) - Yellow
        '#fdae61',  # 
        '#d7191c'   # High (0.4) - Red - High erodibility
    ]
}
```

**Color Scale Meaning:**
- **Blue (0.0-0.1)**: Low soil erodibility (sandy soils, high organic matter)
- **Yellow (0.15-0.25)**: Moderate erodibility (loamy soils)
- **Red (0.3-0.4)**: High erodibility (silty soils, low organic matter)

---

### 2. Backend Implementation (Python/GEE)

#### A. Update K-Factor Service Function

```python
# File: services/rusle_service.py or similar

def calculate_k_factor(geometry, include_maps=False):
    """
    Calculate K-factor from gSSURGO kwfact raster.
    
    Args:
        geometry: GEE geometry object
        include_maps: Boolean to include visualization URLs
        
    Returns:
        Dict with K-factor statistics and optional map_url
    """
    # Get gSSURGO kwfact raster from GEE
    kwfact = ee.Image('projects/sat-io/open-datasets/gSSURGO/kwfact')
    
    # Clip to field geometry
    kwfact_clipped = kwfact.clip(geometry)
    
    # Calculate statistics
    stats = kwfact_clipped.reduceRegion(
        reducer=ee.Reducer.mean()
            .combine(ee.Reducer.minMax(), '', True)
            .combine(ee.Reducer.stdDev(), '', True)
            .combine(ee.Reducer.median(), '', True)
            .combine(ee.Reducer.percentile([10, 90]), '', True),
        geometry=geometry,
        scale=30,
        maxPixels=1e9
    ).getInfo()
    
    # Generate map URL if requested
    map_url = None
    if include_maps:
        # Define visualization parameters
        vis_params = {
            'min': 0.0,
            'max': 0.4,
            'palette': ['2c7bb6', 'abd9e9', 'ffffbf', 'fdae61', 'd7191c']
        }
        
        # Generate map ID and URL
        map_id = kwfact_clipped.getMapId(vis_params)
        map_url = map_id['tile_url']
    
    # Build response
    return {
        "factor_name": "K-factor",
        "factor_value": stats.get('kwfact_mean', 0),
        "statistics": {
            "mean": stats.get('kwfact_mean'),
            "min": stats.get('kwfact_min'),
            "max": stats.get('kwfact_max'),
            "std_dev": stats.get('kwfact_stdDev'),
            "median": stats.get('kwfact_median'),
            "p10": stats.get('kwfact_p10'),
            "p90": stats.get('kwfact_p90')
        },
        "unit": "t·ha·h/(ha·MJ·mm)",
        "methodology": "Direct gSSURGO kwfact raster value",
        "data_source": "gSSURGO kwfact (GEE)",
        "map_url": map_url,
        "visualization": {
            "min": 0.0,
            "max": 0.4,
            "palette": ['2c7bb6', 'abd9e9', 'ffffbf', 'fdae61', 'd7191c'],
            "legend": {
                "0.0-0.1": "Low erodibility (sandy, high OM)",
                "0.15-0.25": "Moderate erodibility (loamy)",
                "0.3-0.4": "High erodibility (silty, low OM)"
            }
        } if include_maps else None,
        "qc": None,
        "soil_texture": None,
        "organic_matter_percent": None
    }
```

#### B. Update K-Factor Endpoint

```python
# File: routers/rusle.py or similar

@router.post("/k-factor")
async def get_k_factor(request: KFactorRequest):
    """
    Calculate K-factor for a field geometry.
    
    Request body:
    {
        "wkt": "POLYGON(...)",
        "include_factor_maps": true  // Optional, default false
    }
    """
    try:
        # Convert WKT to GEE geometry
        geometry = wkt_to_ee_geometry(request.wkt)
        
        # Calculate K-factor with optional map
        k_factor_data = calculate_k_factor(
            geometry=geometry,
            include_maps=request.include_factor_maps or False
        )
        
        return {
            "k_factor": k_factor_data,
            "request_params": {
                "wkt": request.wkt,
                "include_factor_maps": request.include_factor_maps
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

#### C. Update RUSLE Calculate Endpoint

```python
# File: routers/rusle.py

@router.post("/calculate")
async def calculate_rusle(request: RUSLERequest):
    """
    Calculate RUSLE with multi-scenario analysis.
    
    Returns K-factor map_url when include_factor_maps=true
    """
    try:
        geometry = wkt_to_ee_geometry(request.wkt)
        
        # Calculate all RUSLE factors
        r_factor = calculate_r_factor(...)
        
        # Calculate K-factor with map URL if requested
        k_factor = calculate_k_factor(
            geometry=geometry,
            include_maps=request.include_factor_maps or False
        )
        
        ls_factor = calculate_ls_factor(...)
        c_factor = calculate_c_factor(...)
        
        # ... rest of RUSLE calculation
        
        return {
            "r_factor": r_factor,
            "k_factor": k_factor,  # Now includes map_url when requested
            "ls_factor": ls_factor,
            "c_factor": c_factor,
            # ... rest of response
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

### 3. Request/Response Schema Updates

#### Request Schema

```python
class KFactorRequest(BaseModel):
    wkt: str
    include_factor_maps: Optional[bool] = False

class RUSLECalculateRequest(BaseModel):
    wkt: str
    start_date: str
    end_date: str
    year: int
    conservation_practices: Optional[List[str]] = None
    include_scenarios: Optional[bool] = False
    include_factor_maps: Optional[bool] = False  # ✅ Add this
    include_uncertainty: Optional[bool] = False
```

#### Response Schema

```python
class KFactorResponse(BaseModel):
    factor_name: str = "K-factor"
    factor_value: float
    statistics: FactorStatistics
    unit: str = "t·ha·h/(ha·MJ·mm)"
    methodology: str
    data_source: str
    map_url: Optional[str] = None  # ✅ Now populated when include_factor_maps=true
    visualization: Optional[VisualizationParams] = None
    qc: Optional[Dict] = None
    soil_texture: Optional[str] = None
    organic_matter_percent: Optional[float] = None

class VisualizationParams(BaseModel):
    min: float
    max: float
    palette: List[str]
    legend: Dict[str, str]
```

---

### 4. Frontend Usage (TypeScript)

#### Update Request Interface

```typescript
// src/types/geeApi.ts

export interface RUSLECalculateRequest {
  wkt: string
  start_date: string
  end_date: string
  year: number
  conservation_practices?: ConservationPracticeType[]
  include_scenarios?: boolean
  include_factor_maps?: boolean  // ✅ Add this
  include_uncertainty?: boolean
}

export interface KFactorResponse {
  factor_name: string
  factor_value: number
  statistics: FactorStatistics
  unit: string
  methodology: string
  data_source: string
  map_url: string | null  // ✅ Will be populated
  visualization?: {
    min: number
    max: number
    palette: string[]
    legend: Record<string, string>
  }
  qc: any | null
  soil_texture: string | null
  organic_matter_percent: number | null
}
```

#### Display K-Factor Map

```typescript
// src/components/KFactorMapViewer.tsx

interface KFactorMapViewerProps {
  kFactor: KFactorResponse
  fieldGeometry: any
}

export function KFactorMapViewer({ kFactor, fieldGeometry }: KFactorMapViewerProps) {
  if (!kFactor.map_url) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Map visualization not available. 
          Enable "include_factor_maps" to view K-factor distribution.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold flex items-center gap-2">
        <Map className="w-4 h-4" />
        K-Factor Distribution Map
      </h3>
      
      {/* Leaflet integration */}
      <div className="h-64 rounded-lg overflow-hidden border">
        <TileLayer
          url={kFactor.map_url}
          opacity={0.7}
        />
        <GeoJSON data={fieldGeometry} />
      </div>
      
      {/* Legend */}
      {kFactor.visualization && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: '#2c7bb6' }} />
            <span>Low (0.0-0.1)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: '#ffffbf' }} />
            <span>Moderate (0.15-0.25)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: '#d7191c' }} />
            <span>High (0.3-0.4)</span>
          </div>
        </div>
      )}
      
      <p className="text-xs text-gray-600">
        Higher K-factor (red) indicates soil more susceptible to erosion.
        Based on gSSURGO soil properties including texture and organic matter.
      </p>
    </div>
  )
}
```

---

### 5. Testing

#### Test Case 1: K-Factor Endpoint with Maps

```bash
curl -X POST "https://gee-api-production.up.railway.app/api/rusle/k-factor" \
  -H "Content-Type: application/json" \
  -d '{
    "wkt": "POLYGON((-94.338 41.798, -94.335 41.798, -94.335 41.796, -94.338 41.796, -94.338 41.798))",
    "include_factor_maps": true
  }'
```

**Expected Response:**
```json
{
  "k_factor": {
    "factor_name": "K-factor",
    "factor_value": 0.1181,
    "statistics": {...},
    "map_url": "https://earthengine.googleapis.com/v1/projects/earthengine-legacy/maps/abc123-xyz/tiles/{z}/{x}/{y}",
    "visualization": {
      "min": 0.0,
      "max": 0.4,
      "palette": ["2c7bb6", "abd9e9", "ffffbf", "fdae61", "d7191c"],
      "legend": {...}
    }
  }
}
```

#### Test Case 2: RUSLE Calculate with K-Factor Maps

```typescript
// Frontend request
const result = await geeApiClient.calculateRUSLE({
  wkt: fieldWkt,
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  year: 2024,
  conservation_practices: ['contour_farming'],
  include_scenarios: true,
  include_factor_maps: true  // ✅ Enable K-factor map
})

// Verify k_factor.map_url is populated
console.log(result.k_factor.map_url)
// "https://earthengine.googleapis.com/v1/projects/.../tiles/{z}/{x}/{y}"
```

---

### 6. Performance Considerations

**Map Generation Time:**
- Adding `getMapId()` typically adds 1-3 seconds to response time
- Map tiles are cached by GEE, so subsequent requests are fast
- Consider making `include_factor_maps` opt-in (default false)

**Optimization:**
```python
# Only generate map if explicitly requested
if request.include_factor_maps:
    # Generate map asynchronously if possible
    map_url = generate_k_factor_map(kwfact_clipped, vis_params)
else:
    map_url = None
```

---

### 7. Documentation Updates

Update OpenAPI schema:

```yaml
paths:
  /api/rusle/k-factor:
    post:
      summary: Calculate K-factor from gSSURGO
      requestBody:
        content:
          application/json:
            schema:
              properties:
                wkt:
                  type: string
                  description: Field boundary in WKT format
                include_factor_maps:
                  type: boolean
                  default: false
                  description: Include GEE visualization map URL
      responses:
        200:
          content:
            application/json:
              schema:
                properties:
                  k_factor:
                    properties:
                      map_url:
                        type: string
                        nullable: true
                        description: GEE tile URL when include_factor_maps=true
                      visualization:
                        type: object
                        description: Visualization parameters (when maps enabled)
```

---

## Summary

### Changes Required

**Backend (GEE API):**
1. ✅ Add `getMapId()` call in `calculate_k_factor()` when `include_maps=True`
2. ✅ Update `/api/rusle/k-factor` to accept `include_factor_maps` parameter
3. ✅ Update `/api/rusle/calculate` to pass `include_factor_maps` to K-factor calculation
4. ✅ Add visualization parameters to response schema
5. ✅ Update OpenAPI documentation

**Frontend:**
1. ✅ Add `include_factor_maps?: boolean` to request types
2. ✅ Update `KFactorResponse` interface with `visualization` field
3. ✅ Create `KFactorMapViewer` component
4. ✅ Add toggle in RUSLE UI to enable/disable factor maps

### Benefits

- 📊 **Visual Analysis**: Users can see K-factor spatial variation across field
- 🎯 **Targeted Management**: Identify high-erodibility zones for priority conservation
- 📈 **Better Understanding**: Visual confirmation of soil erodibility patterns
- 🔍 **Quality Control**: Verify K-factor values match expected soil properties

### Next Steps

1. Implement backend changes in GEE API Python code
2. Test K-factor map generation with sample fields
3. Update frontend to display K-factor maps
4. Add similar map URLs for R-factor, LS-factor, C-factor (optional)
5. Create comprehensive factor map gallery in RUSLE results
