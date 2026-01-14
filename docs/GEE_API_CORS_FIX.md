# CORS Fix for GEE API Integration

## Problem
The application was experiencing CORS errors when trying to access the GEE API directly from the browser:
```
Access to XMLHttpRequest at 'https://gee-api-production.up.railway.app/api/csb/bounds' 
from origin 'http://127.0.0.1:3000' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solution
Created Next.js API routes that act as proxies to the GEE API. This bypasses CORS since the requests are now server-to-server.

## Implementation

### API Proxy Routes Created
All routes are under `src/pages/api/gee/`:

1. **CSB (Crop Suitability Boundary) Endpoints:**
   - `GET /api/gee/csb/bounds` - Get field boundaries in a bounding box
   - `GET /api/gee/csb/[csbid]` - Get field by CSBID
   - `GET /api/gee/csb/field/[csbid]` - Get detailed field information
   - `POST /api/gee/csb/tiles` - Get tile URLs for field visualization

2. **RUSLE Endpoints:**
   - `POST /api/gee/rusle/calculate` - Calculate RUSLE erosion

3. **Terrain Endpoints:**
   - `POST /api/gee/terrain/polygon` - Get terrain analysis

4. **Climate Endpoints:**
   - `POST /api/gee/climate/drought-assessment` - Get drought assessment

5. **Resource Concerns:**
   - `POST /api/gee/resource-concerns/comprehensive` - Get comprehensive assessment

6. **Catch-all Proxy:**
   - `ANY /api/gee/[...path]` - Handles any other GEE API routes

### Client Configuration
Updated `src/lib/geeApiClient.ts` to:
- Use `/api/gee` as the base URL when running in the browser
- Keep direct API access for server-side rendering
- Maintain all existing functionality

## Usage

### Development
The client automatically uses the proxy routes when running in the browser:
```typescript
// This will call /api/gee/csb/bounds which proxies to the GEE API
const bounds = await geeApiClient.getCSBBounds({
  minLon: -94.24,
  minLat: 40.77,
  maxLon: -94.18,
  maxLat: 40.78,
  limit: 500
})
```

### Environment Variables
The proxy can be configured with:
- `GEE_API_URL` - Backend URL for server-side proxy (defaults to `https://gee-api-production.up.railway.app`)
- `NEXT_PUBLIC_GEE_API_URL` - Only used for server-side rendering

## Benefits
1. **No CORS issues** - Browser requests go to same origin
2. **Same API interface** - No changes needed in components
3. **Flexible** - Can easily add caching, rate limiting, or authentication
4. **Secure** - API keys can be kept server-side only
5. **Better error handling** - Can customize error responses

## Testing
1. Restart the development server: `npm run dev`
2. Navigate to the field analysis page
3. Zoom/pan the map - field boundaries should load without CORS errors
4. Click on fields - detailed information should load

## Notes
- The proxy routes preserve all query parameters, request bodies, and headers
- Timeout values match the original client settings (150s for RUSLE, 30-90s for others)
- Error responses are passed through from the GEE API
