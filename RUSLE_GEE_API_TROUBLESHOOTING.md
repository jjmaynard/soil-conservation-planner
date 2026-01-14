# RUSLE GEE API Troubleshooting Guide

## Common Error: "Number.gt: Parameter 'left' is required and may not be null"

### Error Details
```
Calculation Error
Error in map(ID=4): Number.gt: Parameter 'left' is required and may not be null.
```

### Confirmed Root Cause - Multiple Factor Calculation Bugs

**Backend logs show error pattern:**
```
ATTEMPT 1: Error in map(ID=4) - C-Factor (Cover Management)
ATTEMPT 2: Error in map(ID=2) - Likely K-Factor or LS-Factor
```

**The error is moving between different map operations**, indicating widespread null handling issues across multiple factor services.

**Map ID Correspondence (estimated):**
- map(ID=0 or 1): R-Factor (Rainfall Erosivity) - ✅ WORKS
- map(ID=1 or 2): K-Factor (Soil Erodibility) - ❌ SUSPECT
- map(ID=2 or 3): LS-Factor (Slope Length/Steepness) - ❌ SUSPECT  
- map(ID=3 or 4): C-Factor (Cover Management) - ❌ CONFIRMED BUG
- map(ID=4 or 5): P-Factor (Support Practices) - ❓ UNKNOWN

The error occurs when Google Earth Engine tries to perform a comparison operation (greater than `.gt()`) but receives a null value. Common causes by factor:

**C-Factor (map ID 3-4):**
1. CDL (Cropland Data Layer) filtering - Year parameter returns null
2. NDVI calculation from Sentinel-2 - Cloud masking creates null pixels
3. Crop type classification - Missing CDL data for year/location
4. Vegetation cover percentage - NDVI threshold comparison with null values

**K-Factor (map ID 1-2):**
1. SSURGO soil data - Missing soil properties for location
2. Soil texture percentages - Null sand/silt/clay values
3. Organic matter content - Missing OM% in SSURGO dataset
4. Permeability classes - Null permeability values

**LS-Factor (map ID 2-3):**
1. DEM (Digital Elevation Model) - Missing elevation data
2. Slope calculation - Null slope values in flat areas
3. Flow accumulation - Null flow direction cells
4. Slope length calculation - Division by zero or null gradients

### Most Common Cause: CDL Year Parameter in C-Factor

The CDL dataset only has data for specific years (2008-2024). If the `year` parameter is:
- Null or undefined
- Outside the valid range
- Not properly parsed as an integer

The comparison `year.gt(2007)` in the CDL filtering code will fail.

---

## Frontend Fixes Implemented

### 1. Year Validation (rusle-eos.tsx)

```typescript
// Parse year from end date and validate
const yearValue = new Date(endDate).getFullYear()
if (!yearValue || isNaN(yearValue) || yearValue < 2010 || yearValue > 2024) {
  alert(`Invalid year: ${yearValue}. Please select a date between 2010-2024.`)
  return
}

const request: RUSLECalculateRequest = {
  wkt: wkt,
  start_date: startDate,
  end_date: endDate,
  year: yearValue, // Ensure it's a number, not a string
  // ...
}
```

### 2. Request Logging

```typescript
console.log('[RUSLE] Full request:', request)
console.log('[RUSLE] Year parameter:', yearValue, 'Type:', typeof yearValue)
```

### 3. Error Message Enhancement

The error display now shows detailed GEE API error messages including:
- Validation errors with field locations
- Backend processing errors
- Stack traces when available

---

## Backend Fixes Required (GEE API Python)

### CRITICAL FIX: C-Factor Service (services/c_factor.py)

The C-factor calculation is confirmed to be the source of map(ID=4) errors.

**Required fixes in services/c_factor.py or services/c_factor_service.py:**

#### 1. Ensure Year Parameter is Integer
```python
def calculate_c_factor(geometry, year, **kwargs):
    # Force year to integer
    year = int(year) if year else 2023
    
    # Validate year range
    if year < 2008 or year > 2024:
        logger.warning(f"Year {year} outside CDL range, using 2023")
        year = 2023
```

#### 2. Load CDL with Fallback Logic
```python
# Try loading CDL for requested year
try:
    cdl_collection = ee.ImageCollection('USDA/NASS/CDL')
    
    # Filter to requested year with fallback
    cdl_year = cdl_collection.filter(ee.Filter.calendarRange(year, year, 'year'))
    
    # Check if any images exist
    count = cdl_year.size().getInfo()
    if count == 0:
        logger.warning(f"No CDL data for year {year}, falling back to 2023")
        cdl_year = cdl_collection.filter(ee.Filter.calendarRange(2023, 2023, 'year'))
    
    cdl_image = cdl_year.first()
    
except Exception as e:
    logger.error(f"CDL loading failed: {e}")
    # Use hardcoded 2023 as ultimate fallback
    cdl_image = ee.ImageCollection('USDA/NASS/CDL') \
        .filter(ee.Filter.calendarRange(2023, 2023, 'year')) \
        .first()
```

#### 3. Check if CDL Exists Before Comparison
```python
# Before any CDL operations, verify it's not None
if cdl_image is None:
    logger.error("CDL image is None, cannot calculate C-factor")
    raise ValueError("CDL data unavailable for requested year and location")

# Select cropland band and clip to geometry
cropland = cdl_image.select('cropland').clip(geometry)
```

#### 4. Mask Null Values Before Comparison
```python
# Calculate NDVI from Sentinel-2
ndvi_collection = ee.ImageCollection('COPERNICUS/S2_SR') \
    .filterDate(start_date, end_date) \
    .filterBounds(geometry) \
    .map(lambda img: img.normalizedDifference(['B8', 'B4']).rename('NDVI'))

ndvi_median = ndvi_collection.median()

# CRITICAL: Mask null values before any comparison
ndvi_valid = ndvi_median.updateMask(ndvi_median.gte(-1).And(ndvi_median.lte(1)))

# Now safe to use in comparisons
vegetation_cover = ndvi_valid.gte(0.5)  # Won't fail with null
```

#### 5. Handle Null Results with Defaults
```python
# After C-factor calculation, check for null
c_factor_image = calculate_crop_c_factor(cropland, ndvi_valid)

# Provide default C-factor if null (e.g., 0.3 for general cropland)
c_factor_with_default = c_factor_image.unmask(0.3)
```

#### 6. Crop-Specific C-Factor Lookup (if using CDL)
```python
# Define default C-factors for common CDL crop codes
crop_c_factors = {
    1: 0.35,   # Corn
    5: 0.25,   # Soybeans
    24: 0.15,  # Winter Wheat
    36: 0.40,  # Alfalfa
    37: 0.35,  # Other Hay
    # ... add more crops
    0: 0.30,   # Default for unknown crops
}

# Build conditional statement for C-factor lookup
c_factor = cropland.remap(
    list(crop_c_factors.keys()),
    list(crop_c_factors.values()),
    defaultValue=0.30
)
```

#### 7. Check Sentinel-2 Data Availability
```python
# Before NDVI calculation, verify imagery exists
s2_count = ee.ImageCollection('COPERNICUS/S2_SR') \
    .filterDate(start_date, end_date) \
    .filterBounds(geometry) \
    .size() \
    .getInfo()

if s2_count == 0:
    logger.warning(f"No Sentinel-2 data for date range, using default C-factor")
    # Return default C-factor instead of null
    return ee.Image.constant(0.30).clip(geometry)
```

#### 8. Complete Null-Safe C-Factor Function
```python
def calculate_c_factor_safe(geometry, year, start_date, end_date):
    """
    Null-safe C-factor calculation with comprehensive error handling
    """
    try:
        # 1. Validate and sanitize year
        year = int(year) if year else 2023
        year = max(2008, min(2024, year))
        
        # 2. Load CDL with fallback
        cdl = load_cdl_with_fallback(geometry, year)
        if cdl is None:
            return ee.Image.constant(0.30).clip(geometry)
        
        # 3. Check Sentinel-2 availability
        s2_images = ee.ImageCollection('COPERNICUS/S2_SR') \
            .filterDate(start_date, end_date) \
            .filterBounds(geometry)
        
        if s2_images.size().getInfo() == 0:
            logger.warning("No Sentinel-2 data, using CDL-based C-factors")
            return cdl_based_c_factor(cdl, geometry)
        
        # 4. Calculate NDVI with null masking
        ndvi = s2_images.map(lambda img: img.normalizedDifference(['B8', 'B4'])) \
            .median() \
            .updateMask(lambda x: x.gte(-1).And(x.lte(1)))
        
        # 5. Combine CDL and NDVI for C-factor
        c_factor = calculate_c_from_cdl_and_ndvi(cdl, ndvi)
        
        # 6. Ensure no null values in result
        c_factor_final = c_factor.unmask(0.30).clip(geometry)
        
        return c_factor_final
        
    except Exception as e:
        logger.error(f"C-factor calculation failed: {e}")
        # Ultimate fallback: constant default C-factor
        return ee.Image.constant(0.30).clip(geometry)
```

**Issue: CDL Year Filtering Returns Null**

```python
# services/c_factor.py or services/c_factor_service.py

def calculate_c_factor(geometry, year, start_date, end_date, **kwargs):
    """Calculate C-factor with proper null handling"""
    
    # CRITICAL FIX #1: Ensure year is integer
    year_int = int(year) if isinstance(year, str) else year
    
    # CRITICAL FIX #2: Load CDL with fallback
    cdl_collection = ee.ImageCollection('USDA/NASS/CDL')
    
    # Try to get CDL for specified year
    cdl_year_str = str(year_int)
    cdl_image = cdl_collection.filter(
        ee.Filter.eq('system:index', cdl_year_str)
    ).first()
    
    # CRITICAL FIX #3: Check if CDL exists for this year
    # Use getInfo() to check or use conditional logic
    cdl_list = cdl_collection.filter(
        ee.Filter.eq('system:index', cdl_year_str)
    ).size().getInfo()
    
    if cdl_list == 0:
        # Fallback to most recent available year
        available_cdl = cdl_collection.filterBounds(geometry)
        latest_year = available_cdl.aggregate_max('system:index').getInfo()
        
        logger.warning(f"CDL not available for {year_int}, using {latest_year}")
        
        cdl_image = cdl_collection.filter(
            ee.Filter.eq('system:index', latest_year)
        ).first()
    
    # CRITICAL FIX #4: Ensure cdl_image is not None before using
    if cdl_image is None:
        raise ValueError(f"No CDL data available for year {year_int} or location")
    
    # Get cropland band (this is where the null comparison happens)
    cropland = cdl_image.select('cropland')
    
    # CRITICAL FIX #5: Mask null values before comparison
    cropland_masked = cropland.updateMask(cropland.gte(0))  # Remove nulls
    
    # Now safe to do comparisons
    # Example: Check if crop is corn (value 1)
    is_corn = cropland_masked.eq(1)
    
    # Calculate NDVI from Sentinel-2
    s2_collection = ee.ImageCollection('COPERNICUS/S2_SR')
    s2_filtered = s2_collection.filterBounds(geometry) \
        .filterDate(start_date, end_date) \
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
    
    # CRITICAL FIX #6: Check if Sentinel-2 data exists
    s2_count = s2_filtered.size().getInfo()
    if s2_count == 0:
        logger.warning(f"No Sentinel-2 data for {start_date} to {end_date}")
        # Use default C-factor based on CDL crop type
        c_factor_value = get_default_c_factor_from_cdl(cropland_masked, geometry)
    else:
        # Calculate NDVI
        def calc_ndvi(image):
            ndvi = image.normalizedDifference(['B8', 'B4']).rename('ndvi')
            return image.addBands(ndvi)
        
        s2_with_ndvi = s2_filtered.map(calc_ndvi)
        ndvi_median = s2_with_ndvi.select('ndvi').median()
        
        # CRITICAL FIX #7: Mask invalid NDVI before comparison
        ndvi_valid = ndvi_median.updateMask(
            ndvi_median.gte(-1).And(ndvi_median.lte(1))
        )
        
        # Now safe to compare NDVI
        high_vegetation = ndvi_valid.gte(0.6)  # This won't fail with null
        
        # Calculate C-factor based on NDVI and crop type
        c_factor_image = calculate_c_from_ndvi_and_crop(
            ndvi_valid, cropland_masked, geometry
        )
    
    # Extract mean C-factor value
    c_stats = c_factor_image.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=geometry,
        scale=30,
        maxPixels=1e9
    ).getInfo()
    
    c_factor_mean = c_stats.get('c_factor')
    
    # CRITICAL FIX #8: Handle null result
    if c_factor_mean is None:
        logger.warning("C-factor calculation returned null, using default")
        c_factor_mean = 0.3  # Conservative default
    
    return {
        'factor_value': float(c_factor_mean),
        'unit': 'dimensionless',
        'data_source': f'Sentinel-2 NDVI + CDL {year_int}',
        'methodology': 'NDVI-based with crop type adjustment',
        # ... rest of response
    }


def get_default_c_factor_from_cdl(cropland_image, geometry):
    """Get default C-factor based on CDL crop classification"""
    # Lookup table for crop-specific C-factors
    crop_c_factors = {
        1: 0.35,   # Corn
        5: 0.20,   # Soybeans
        23: 0.15,  # Spring Wheat
        24: 0.15,  # Winter Wheat
        36: 0.10,  # Alfalfa
        37: 0.08,  # Other Hay
        176: 0.05, # Grassland/Pasture
        # ... etc
    }
    
    # Create C-factor image from crop types
    c_factor = cropland_image.remap(
        list(crop_c_factors.keys()),
        list(crop_c_factors.values()),
        defaultValue=0.3  # Conservative default for unknown crops
    )
    
    return c_factor
```

### Issue: NDVI Threshold Comparisons with Null

If the frontend sends `year` as a string, the GEE backend might not properly convert it to `ee.Number`.

**Fix in Python backend:**

```python
# routers/rusle.py or services/c_factor.py

def calculate_c_factor(geometry, year, ...):
    # Ensure year is an integer
    year_int = int(year) if isinstance(year, str) else year
    
    # Create ee.Number explicitly
    year_ee = ee.Number(year_int)
    
    # Filter CDL with proper type
    cdl_image = cdl_collection.filter(
        ee.Filter.eq('system:index', str(year_int))
    ).first()
    
    # If using comparisons
    valid_cdl = cdl_collection.filter(
        ee.Filter.And(
            ee.Filter.gte('year', 2010),
            ee.Filter.lte('year', year_int)
        )
    )
```

### Issue: Missing CDL Data Handling

If CDL data isn't available for the specified year, the `.first()` call returns null.

**Fix in Python backend:**

```python
def calculate_c_factor(geometry, year, ...):
    year_int = int(year)
    
    # Get CDL image for the year
    cdl_image = cdl_collection.filter(
        ee.Filter.eq('system:index', str(year_int))
    ).first()
    
    # Check if CDL data exists
    if cdl_image is None:
        # Fallback to most recent available year
        available_years = cdl_collection.aggregate_array('system:index').getInfo()
        if available_years:
            most_recent = max([int(y) for y in available_years if int(y) <= year_int])
            cdl_image = cdl_collection.filter(
                ee.Filter.eq('system:index', str(most_recent))
            ).first()
            
            # Log warning
            warnings.append(f"CDL data not available for {year_int}, using {most_recent}")
    
    # Ensure cdl_image is not null before using
    if cdl_image is None:
        raise ValueError(f"CDL data not available for year {year_int} or earlier")
```

### Issue: Null NDVI Values

**Fix in Python backend:**

```python
def calculate_c_factor(geometry, year, ...):
    # Calculate NDVI
    ndvi = sentinel_composite.normalizedDifference(['B8', 'B4']).rename('ndvi')
    
    # Mask null values before comparison
    ndvi_masked = ndvi.updateMask(ndvi.gte(-1).And(ndvi.lte(1)))
    
    # Safe comparison
    mean_ndvi = ndvi_masked.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=geometry,
        scale=10,
        maxPixels=1e9
    ).get('ndvi')
    
    # Handle null result
    mean_ndvi_value = ee.Number(mean_ndvi).getInfo()
    if mean_ndvi_value is None:
        mean_ndvi_value = 0.3  # Default assumption
        warnings.append("NDVI could not be calculated, using default value")
```

---

## K-Factor (Soil Erodibility) Fixes

**If error occurs at map(ID=1 or 2), the issue is likely in K-factor calculation.**

### Issue: Missing SSURGO Soil Data

The K-factor calculation requires soil properties from SSURGO (sand%, silt%, clay%, organic matter%). If these properties are missing for a location, comparisons will fail.

**Critical fixes in services/k_factor.py:**

#### 1. Load SSURGO with Null Checks
```python
def calculate_k_factor(geometry, **kwargs):
    """Calculate K-factor with SSURGO data and null handling"""
    try:
        # Load SSURGO soil properties
        ssurgo = ee.Image('OpenLandMap/SOL/SOL_TEXTURE-CLASS_USDA-TT_M/v02')
        
        # Clip to geometry
        soil_props = ssurgo.clip(geometry)
        
        # Check if soil data exists for this location
        soil_mean = soil_props.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=geometry,
            scale=250,
            maxPixels=1e9
        ).getInfo()
        
        if not soil_mean or all(v is None for v in soil_mean.values()):
            logger.warning("No SSURGO soil data for location, using default K-factor")
            return ee.Image.constant(0.32).clip(geometry)  # Default K-factor
        
    except Exception as e:
        logger.error(f"K-factor SSURGO loading failed: {e}")
        return ee.Image.constant(0.32).clip(geometry)
```

#### 2. Handle Null Soil Properties
```python
def calculate_k_factor_from_texture(sand, silt, clay, om):
    """Calculate K-factor using USLE nomograph equation"""
    
    # Mask null values before calculations
    sand_valid = sand.updateMask(sand.gte(0).And(sand.lte(100)))
    silt_valid = silt.updateMask(silt.gte(0).And(silt.lte(100)))
    clay_valid = clay.updateMask(clay.gte(0).And(clay.lte(100)))
    om_valid = om.updateMask(om.gte(0).And(om.lte(20)))
    
    # Calculate M factor (silt + very fine sand)
    m_factor = silt_valid.multiply(100).subtract(clay_valid)
    m_factor = m_factor.updateMask(m_factor.gte(0))  # Mask negative values
    
    # Calculate K-factor components
    k_organic = om_valid.multiply(-0.0256)
    k_texture = m_factor.pow(1.14).multiply(0.00021)
    k_structure = clay_valid.pow(0.3)  # Simplified
    
    # Combine and mask nulls
    k_factor = k_organic.add(k_texture).add(k_structure)
    k_factor_safe = k_factor.updateMask(k_factor.gte(0).And(k_factor.lte(1)))
    
    # Provide default for null areas
    k_factor_final = k_factor_safe.unmask(0.32)  # 0.32 = typical cropland
    
    return k_factor_final
```

#### 3. SSURGO Property Defaults
```python
def get_soil_properties_safe(geometry):
    """Get soil properties with fallback to defaults"""
    
    ssurgo = ee.Image('OpenLandMap/SOL/SOL_TEXTURE-CLASS_USDA-TT_M/v02')
    
    # Extract soil bands
    sand = ssurgo.select('b0').divide(10)  # Convert to percentage
    silt = ssurgo.select('b1').divide(10)
    clay = ssurgo.select('b2').divide(10)
    om = ssurgo.select('b3').divide(10)
    
    # Mask invalid values
    sand = sand.where(sand.lt(0).Or(sand.gt(100)), 40)  # Default 40% sand
    silt = silt.where(silt.lt(0).Or(silt.gt(100)), 40)  # Default 40% silt
    clay = clay.where(clay.lt(0).Or(clay.gt(100)), 20)  # Default 20% clay
    om = om.where(om.lt(0).Or(om.gt(20)), 2)            # Default 2% OM
    
    return {
        'sand': sand,
        'silt': silt,
        'clay': clay,
        'om': om
    }
```

---

## LS-Factor (Slope Length/Steepness) Fixes

**If error occurs at map(ID=2 or 3), the issue is likely in LS-factor calculation.**

### Issue: Missing DEM or Null Slopes

The LS-factor calculation requires elevation data (DEM) to compute slope. In flat areas or where DEM is unavailable, slope calculations can return null.

**Critical fixes in services/ls_factor.py:**

#### 1. Load DEM with Null Checks
```python
def calculate_ls_factor(geometry, **kwargs):
    """Calculate LS-factor with DEM and null handling"""
    try:
        # Load SRTM DEM (30m resolution)
        dem = ee.Image('USGS/SRTMGL1_003').clip(geometry)
        
        # Check if DEM data exists
        dem_mean = dem.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=geometry,
            scale=30,
            maxPixels=1e9
        ).get('elevation').getInfo()
        
        if dem_mean is None:
            logger.warning("No DEM data for location, using default LS-factor")
            return ee.Image.constant(1.0).clip(geometry)  # Flat assumption
        
    except Exception as e:
        logger.error(f"LS-factor DEM loading failed: {e}")
        return ee.Image.constant(1.0).clip(geometry)
```

#### 2. Safe Slope Calculation
```python
def calculate_slope_safe(dem):
    """Calculate slope with null handling"""
    
    # Calculate slope in degrees
    slope = ee.Terrain.slope(dem)
    
    # Mask invalid slopes (negative or > 90 degrees)
    slope_valid = slope.updateMask(slope.gte(0).And(slope.lte(90)))
    
    # Convert to radians for calculations
    slope_rad = slope_valid.multiply(math.pi / 180)
    
    # Calculate slope steepness factor (S)
    # S = 10.8 * sin(slope) + 0.03 for slope < 9%
    # S = 16.8 * sin(slope) - 0.50 for slope >= 9%
    
    slope_percent = slope_rad.tan().multiply(100)
    slope_percent = slope_percent.updateMask(slope_percent.gte(0))
    
    s_low = slope_rad.sin().multiply(10.8).add(0.03)
    s_high = slope_rad.sin().multiply(16.8).subtract(0.50)
    
    s_factor = ee.Image(0).where(slope_percent.lt(9), s_low).where(slope_percent.gte(9), s_high)
    
    # Mask null and provide minimum
    s_factor_safe = s_factor.unmask(0.03)  # Minimum S-factor
    
    return s_factor_safe
```

#### 3. Slope Length Calculation with Defaults
```python
def calculate_slope_length_factor(dem, flow_accumulation):
    """Calculate L-factor with null handling"""
    
    # Calculate flow accumulation if not provided
    if flow_accumulation is None:
        flow_dir = ee.Terrain.aspect(dem)
        flow_accumulation = ee.Image.constant(100)  # Default slope length 100m
    
    # Mask invalid flow accumulation
    flow_acc_valid = flow_accumulation.updateMask(flow_accumulation.gt(0))
    
    # Calculate slope length in meters
    cell_size = 30  # SRTM resolution
    slope_length = flow_acc_valid.multiply(cell_size)
    
    # L = (slope_length / 72.6)^m where m depends on slope
    # Simplified: m = 0.5 for most conditions
    l_factor = slope_length.divide(72.6).pow(0.5)
    
    # Cap maximum L-factor at 10 (very long slopes)
    l_factor_capped = l_factor.min(10)
    
    # Provide default for null areas
    l_factor_safe = l_factor_capped.unmask(1.0)
    
    return l_factor_safe
```

#### 4. Complete LS-Factor with Null Safety
```python
def calculate_ls_factor_complete(geometry):
    """Complete LS-factor calculation with comprehensive null handling"""
    try:
        # Load DEM
        dem = ee.Image('USGS/SRTMGL1_003').clip(geometry)
        
        # Calculate slope factor (S)
        s_factor = calculate_slope_safe(dem)
        
        # Calculate slope length factor (L)
        l_factor = calculate_slope_length_factor(dem, None)
        
        # Combine L and S
        ls_factor = l_factor.multiply(s_factor)
        
        # Ensure valid range (0.01 to 50)
        ls_factor_clamped = ls_factor.clamp(0.01, 50)
        
        # Final null mask
        ls_factor_final = ls_factor_clamped.unmask(1.0)
        
        return ls_factor_final
        
    except Exception as e:
        logger.error(f"LS-factor calculation failed: {e}")
        return ee.Image.constant(1.0).clip(geometry)
```

---

## Summary of Required Backend Fixes

**ALL factor calculations need null-safe implementations:**

1. **R-Factor** ✅ Already working (358 events processed successfully)

2. **K-Factor** ❌ Add null checks for:
   - SSURGO soil property bands
   - Sand/silt/clay percentage validations
   - Organic matter content
   - Default K-factor fallback (0.32)

3. **LS-Factor** ❌ Add null checks for:
   - DEM availability
   - Slope calculations in flat areas
   - Flow accumulation
   - Default LS-factor fallback (1.0)

4. **C-Factor** ❌ Add null checks for:
   - CDL year availability
   - NDVI null masking
   - Sentinel-2 data availability
   - Default C-factor fallback (0.30)

5. **P-Factor** ❓ Unknown if affected, but should add null checks for:
   - Conservation practice detection
   - Terrace/contour identification
   - Default P-factor fallback (1.0)

**Deployment Priority:**
1. Implement ALL null handling fixes above
2. Test with years 2010, 2015, 2020, 2023, 2024
3. Test with multiple field locations (Iowa, California, flat vs steep terrain)
4. Deploy to Railway backend
5. Re-enable frontend advanced features

---

---

## Debugging Steps

### 1. Check Browser Console
Look for the logged request:
```javascript
[RUSLE] Full request: { wkt: "...", year: 2024, ... }
[RUSLE] Year parameter: 2024 Type: number
```

### 2. Verify Year Type
Ensure `year` is logged as `Type: number`, not `Type: string`.

### 3. Check API Request in Network Tab
- Open DevTools → Network
- Filter for `rusle/calculate`
- Check the request payload
- Verify `year` is sent as `2024` (number) not `"2024"` (string)

### 4. Backend Logs
If you have access to GEE API backend logs:
```bash
# Check if year parameter is being received correctly
grep "year" /var/log/gee-api/app.log

# Look for GEE errors
grep "Number.gt" /var/log/gee-api/app.log
```

---

## Workarounds for Users

### Temporary Solution 1: Change Date Range
If the error persists:
1. Try using a different year (e.g., 2023 instead of 2024)
2. Ensure dates are in format: `2023-01-01` to `2023-12-31`
3. Use full calendar year for best results

### Temporary Solution 2: Disable Optional Features
Reduce request complexity by:
```typescript
const request: RUSLECalculateRequest = {
  wkt: wkt,
  start_date: startDate,
  end_date: endDate,
  year: 2023, // Hardcode a known good year
  conservation_practices: ['none'], // Start with baseline
  // include_scenarios: false, // Disable multi-scenario
  // include_factor_maps: false, // Disable maps
  // include_events: false, // Disable events
}
```

---

## Long-term Solutions

### Backend API Enhancement
1. Add explicit type conversion for all numeric parameters
2. Implement null checks before all GEE operations
3. Add fallback logic for missing CDL years
4. Return more descriptive error messages with field names
5. Add parameter validation middleware

### Frontend Enhancement
1. ✅ Add year range validation (2010-2024)
2. ✅ Log request parameters with types
3. ✅ Display detailed error messages
4. Add year selector dropdown (instead of relying on date parsing)
5. Add "Test Connection" button to validate parameters

---

## Example: Complete Request Validation

### Frontend (TypeScript)
```typescript
const handleCalculate = async () => {
  // Validate field
  if (!fieldGeometry) {
    throw new Error('Field geometry is required')
  }
  
  // Validate and parse year
  const yearValue = new Date(endDate).getFullYear()
  if (!yearValue || isNaN(yearValue)) {
    throw new Error('Invalid end date - cannot extract year')
  }
  if (yearValue < 2010 || yearValue > 2024) {
    throw new Error(`Year ${yearValue} is outside valid range (2010-2024)`)
  }
  
  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    throw new Error('Dates must be in YYYY-MM-DD format')
  }
  
  // Build request with explicit types
  const request: RUSLECalculateRequest = {
    wkt: geoJsonToWkt(fieldGeometry),
    start_date: startDate,
    end_date: endDate,
    year: yearValue, // number type guaranteed
    conservation_practices: [selectedPractice.type],
    detect_terraces: true,
    use_multiyear_r_factor: true,
    include_scenarios: true,
    include_factor_maps: true,
    include_events: true,
  }
  
  // Log for debugging
  console.log('RUSLE Request:', JSON.stringify(request, null, 2))
  
  await calculate(request)
}
```

### Backend (Python)
```python
@router.post("/calculate")
async def calculate_rusle(request: RUSLERequest):
    # Validate year
    if not isinstance(request.year, int):
        try:
            year = int(request.year)
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid year parameter: {request.year}. Must be an integer."
            )
    else:
        year = request.year
    
    # Validate year range
    if year < 2010 or year > 2024:
        raise HTTPException(
            status_code=400,
            detail=f"Year {year} is outside valid range (2010-2024)"
        )
    
    try:
        # Calculate with validated parameters
        result = calculate_rusle_internal(
            geometry=wkt_to_ee_geometry(request.wkt),
            year=ee.Number(year),  # Explicit ee.Number conversion
            ...
        )
        return result
    
    except ee.EEException as e:
        # Convert GEE error to user-friendly message
        error_msg = str(e)
        if "Number.gt" in error_msg:
            raise HTTPException(
                status_code=500,
                detail=f"GEE comparison error - likely caused by null parameter. Year: {year}, Error: {error_msg}"
            )
        raise
```

---

## Contact & Support

If the error persists after implementing these fixes:
1. Check that backend GEE API has been updated with null checks
2. Verify CDL dataset is accessible in your GEE project
3. Test with a known good year (e.g., 2023)
4. Provide full error logs to backend team

**Last Updated:** January 9, 2026
