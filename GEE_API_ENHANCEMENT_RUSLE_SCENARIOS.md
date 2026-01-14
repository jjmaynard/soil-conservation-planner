# GEE API Enhancement: RUSLE Multi-Scenario Baseline Calculation

## Feature Request: Optimize Conservation Practice Comparison

### Current Implementation Problem

**Endpoint:** `POST /api/rusle/calculate`

**Current Behavior:**
- Client must make **TWO separate API calls** to compare conservation practices:
  1. Baseline calculation: `conservation_practices: ['none']` (~60-90 seconds)
  2. Proposed calculation: `conservation_practices: ['contour_farming']` (~60-90 seconds)
- **Total time: 2-3 minutes** just to compare one practice
- Inefficient: Recalculates expensive R, K, LS, C factors that don't change between scenarios

**User Impact:**
- Poor UX - long wait times for comparisons
- Cannot easily explore multiple conservation options
- Discourages scenario analysis

---

## Proposed Enhancement

### Objective
Modify `/api/rusle/calculate` endpoint to **optionally return baseline + all conservation practice scenarios** in a single API call.

### Technical Approach

**Key Insight:** Only the **P-factor** changes between conservation practices. R, K, LS, and C factors remain constant for a given field/date range.

**Server-Side Optimization:**
1. Calculate R, K, LS, C factors once (expensive operations)
2. Calculate P-factor for ALL conservation practices (cheap - just lookup/detection)
3. Compute soil loss for each scenario: A = R × K × LS × C × P
4. Return comprehensive results in single response

**Performance Gain:** ~60-90 seconds → ~70-100 seconds (vs. 120-180s for 2 calls)

---

## Implementation Specification

### Request Schema Enhancement

Add optional parameter to existing `RUSLERequest`:

```python
class RUSLERequest(BaseModel):
    wkt: str
    start_date: date
    end_date: date
    year: int = 2023
    
    # Existing parameters...
    conservation_practices: List[ConservationPractice] = ['none']
    detect_terraces: bool = True
    # ... other params
    
    # NEW: Enable multi-scenario calculation
    include_scenarios: bool = False  # Default: False (backward compatible)
    scenario_practices: List[ConservationPractice] | None = None  # If None, calculate all
```

### Response Schema Enhancement

Extend existing `RUSLEResponse`:

```python
class ScenarioResult(BaseModel):
    """Lightweight scenario result (no full factor details)"""
    practice: ConservationPractice
    soil_loss_rate: float  # t/ha/yr
    soil_loss_rate_tons_acre_yr: float  # t/ac/yr
    p_factor: PFactorResponse  # Full P-factor details for this practice
    erosion_reduction_percent: float | None = None  # vs. baseline
    erosion_class: str  # "slight", "moderate", etc.

class RUSLEResponse(BaseModel):
    # Existing fields (primary calculation)
    soil_loss_rate: float
    soil_loss_rate_tons_acre_yr: float
    r_factor: RFactorResponse
    k_factor: KFactorResponse
    ls_factor: LSFactorResponse
    c_factor: CFactorResponse
    p_factor: PFactorResponse
    field_area_ha: float
    field_area_acres: float
    erosion_class: str
    erosion_class_description: str
    # ... other existing fields
    
    # NEW: Multi-scenario results
    baseline: ScenarioResult | None = None  # Always 'none' practice
    scenarios: List[ScenarioResult] | None = None  # All other practices
    scenario_comparison: dict | None = None  # Summary stats
```

### Example Response

**Request:**
```json
{
  "wkt": "POLYGON((-95.5 41.5, ...))",
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "conservation_practices": ["contour_farming"],
  "include_scenarios": true
}
```

**Response:**
```json
{
  // PRIMARY RESULT (requested practice: 'contour_farming')
  "soil_loss_rate_tons_acre_yr": 4.2,
  "r_factor": { "factor_value": 150.5, ... },
  "k_factor": { "factor_value": 0.32, ... },
  "ls_factor": { "factor_value": 1.8, ... },
  "c_factor": { "factor_value": 0.25, ... },
  "p_factor": { 
    "factor_value": 0.5,
    "detected_practices": ["contour_farming"],
    ...
  },
  "erosion_class": "moderate",
  "field_area_acres": 100.0,
  
  // NEW: BASELINE (always 'none')
  "baseline": {
    "practice": "none",
    "soil_loss_rate_tons_acre_yr": 8.4,
    "p_factor": { "factor_value": 1.0, ... },
    "erosion_class": "high"
  },
  
  // NEW: ALL SCENARIOS (6 practices)
  "scenarios": [
    {
      "practice": "none",
      "soil_loss_rate_tons_acre_yr": 8.4,
      "p_factor": { "factor_value": 1.0 },
      "erosion_reduction_percent": 0,
      "erosion_class": "high"
    },
    {
      "practice": "contour_farming",
      "soil_loss_rate_tons_acre_yr": 4.2,
      "p_factor": { "factor_value": 0.5 },
      "erosion_reduction_percent": 50.0,
      "erosion_class": "moderate"
    },
    {
      "practice": "strip_cropping",
      "soil_loss_rate_tons_acre_yr": 2.5,
      "p_factor": { "factor_value": 0.3 },
      "erosion_reduction_percent": 70.2,
      "erosion_class": "slight"
    },
    {
      "practice": "terracing",
      "soil_loss_rate_tons_acre_yr": 1.7,
      "p_factor": { "factor_value": 0.2 },
      "erosion_reduction_percent": 79.8,
      "erosion_class": "slight"
    },
    {
      "practice": "grassed_waterway",
      "soil_loss_rate_tons_acre_yr": 3.4,
      "p_factor": { "factor_value": 0.4 },
      "erosion_reduction_percent": 59.5,
      "erosion_class": "moderate"
    },
    {
      "practice": "cover_crop",
      "soil_loss_rate_tons_acre_yr": 5.0,
      "p_factor": { "factor_value": 0.6 },
      "erosion_reduction_percent": 40.5,
      "erosion_class": "moderate"
    }
  ],
  
  // NEW: SUMMARY STATISTICS
  "scenario_comparison": {
    "most_effective_practice": "terracing",
    "max_reduction_percent": 79.8,
    "least_effective_practice": "cover_crop",
    "min_reduction_percent": 40.5,
    "practices_exceeding_t_value": ["none", "contour_farming", "cover_crop"]
  }
}
```

---

## Implementation Tasks

### 1. Backend Changes (Python/FastAPI)

**File:** `gee-api/routers/rusle.py`

```python
@router.post("/calculate", response_model=RUSLEResponse)
async def calculate_rusle(request: RUSLERequest):
    """
    Calculate RUSLE with optional multi-scenario analysis.
    """
    # Step 1: Calculate expensive factors ONCE
    r_result = await calculate_r_factor(request)
    k_result = await calculate_k_factor(request)
    ls_result = await calculate_ls_factor(request)
    c_result = await calculate_c_factor(request)
    
    # Step 2: Calculate primary P-factor (requested practice)
    p_result = await calculate_p_factor(request)
    
    # Step 3: Calculate primary soil loss
    primary_soil_loss = r_result.factor_value * k_result.factor_value * \
                       ls_result.factor_value * c_result.factor_value * \
                       p_result.factor_value
    
    # Step 4: If scenarios requested, calculate ALL P-factors
    scenarios = None
    baseline = None
    
    if request.include_scenarios:
        all_practices = ['none', 'contour_farming', 'strip_cropping', 
                        'terracing', 'grassed_waterway', 'cover_crop']
        
        scenarios = []
        for practice in all_practices:
            # Modify request for this practice
            practice_request = request.copy()
            practice_request.conservation_practices = [practice]
            
            # Calculate P-factor for this practice
            p_scenario = await calculate_p_factor(practice_request)
            
            # Compute soil loss: A = R × K × LS × C × P
            scenario_loss = r_result.factor_value * k_result.factor_value * \
                           ls_result.factor_value * c_result.factor_value * \
                           p_scenario.factor_value
            
            # Convert to tons/acre/year
            scenario_loss_tac = scenario_loss * 0.446  # t/ha → t/ac conversion
            
            # Calculate reduction vs. baseline (if not baseline itself)
            reduction_pct = None
            if practice != 'none' and baseline:
                reduction_pct = ((baseline.soil_loss_rate_tons_acre_yr - scenario_loss_tac) / 
                                baseline.soil_loss_rate_tons_acre_yr) * 100
            
            scenario_result = ScenarioResult(
                practice=practice,
                soil_loss_rate=scenario_loss,
                soil_loss_rate_tons_acre_yr=scenario_loss_tac,
                p_factor=p_scenario,
                erosion_reduction_percent=reduction_pct,
                erosion_class=classify_erosion(scenario_loss_tac)
            )
            
            scenarios.append(scenario_result)
            
            # Save baseline reference
            if practice == 'none':
                baseline = scenario_result
        
        # Calculate comparison stats
        scenario_comparison = {
            "most_effective_practice": min(scenarios, key=lambda s: s.soil_loss_rate_tons_acre_yr).practice,
            "max_reduction_percent": max((s.erosion_reduction_percent or 0) for s in scenarios),
            "least_effective_practice": max(scenarios, key=lambda s: s.soil_loss_rate_tons_acre_yr if s.practice != 'none' else 0).practice,
            "practices_exceeding_t_value": [s.practice for s in scenarios if s.soil_loss_rate_tons_acre_yr > 5.0]
        }
    else:
        scenario_comparison = None
    
    # Return enhanced response
    return RUSLEResponse(
        soil_loss_rate=primary_soil_loss,
        soil_loss_rate_tons_acre_yr=primary_soil_loss * 0.446,
        r_factor=r_result,
        k_factor=k_result,
        ls_factor=ls_result,
        c_factor=c_result,
        p_factor=p_result,
        field_area_ha=calculate_area(request.wkt),
        field_area_acres=calculate_area(request.wkt) * 2.471,
        erosion_class=classify_erosion(primary_soil_loss * 0.446),
        erosion_class_description=get_erosion_description(...),
        baseline=baseline,
        scenarios=scenarios,
        scenario_comparison=scenario_comparison
    )
```

### 2. Helper Function

```python
def classify_erosion(soil_loss_tons_acre_yr: float) -> str:
    """
    Classify erosion rate according to USDA standards.
    """
    if soil_loss_tons_acre_yr < 1:
        return "slight"
    elif soil_loss_tons_acre_yr < 5:
        return "moderate"
    elif soil_loss_tons_acre_yr < 10:
        return "high"
    else:
        return "severe"
```

---

## Frontend Integration

### TypeScript Type Updates

**File:** `src/types/geeApi.ts`

```typescript
export interface ScenarioResult {
  practice: 'none' | 'contour_farming' | 'strip_cropping' | 'terracing' | 'grassed_waterway' | 'cover_crop'
  soil_loss_rate: number // t/ha/yr
  soil_loss_rate_tons_acre_yr: number // t/ac/yr
  p_factor: PFactorResponse
  erosion_reduction_percent: number | null
  erosion_class: string
}

export interface RUSLEResponse {
  // Existing fields...
  soil_loss_rate_tons_acre_yr: number
  r_factor: RFactorResponse
  // ... etc
  
  // NEW fields
  baseline?: ScenarioResult
  scenarios?: ScenarioResult[]
  scenario_comparison?: {
    most_effective_practice: string
    max_reduction_percent: number
    least_effective_practice: string
    min_reduction_percent: number
    practices_exceeding_t_value: string[]
  }
}

export interface RUSLECalculateRequest {
  // Existing fields...
  wkt: string
  start_date: string
  end_date: string
  
  // NEW fields
  include_scenarios?: boolean // Request multi-scenario analysis
}
```

### Usage Example

**File:** `src/pages/tools/rusle-eos.tsx`

```typescript
// Single API call with scenarios
const result = await calculate({
  wkt: wkt,
  start_date: startDate,
  end_date: endDate,
  conservation_practices: [selectedPractice.type],
  include_scenarios: true // Enable multi-scenario
})

// Now we have baseline + all scenarios immediately
if (result.scenarios) {
  // Display interactive comparison UI
  setAllScenarios(result.scenarios)
  setBaselineResult(result.baseline)
  
  // Show ROI rankings
  const sortedByEffectiveness = result.scenarios
    .filter(s => s.practice !== 'none')
    .sort((a, b) => b.erosion_reduction_percent - a.erosion_reduction_percent)
}
```

---

## Benefits

### Performance
- **2x faster** comparison workflow (60-90s vs 120-180s)
- Users can explore all 6 practices instantly instead of waiting minutes per practice

### User Experience
- **Interactive scenario explorer** with instant practice switching
- **Side-by-side comparison** of all options
- **ROI calculator** showing cost vs. effectiveness for all practices

### Efficiency
- **Single GEE computation** of expensive R, K, LS, C factors
- **Minimal additional cost** - only 6 P-factor calculations (very fast)
- **Reduced API load** - fewer total requests

### Decision Support
- **Complete analysis** in one request
- **Best practice recommendation** based on field characteristics
- **Cost-effectiveness ranking** across all options

---

## Testing Requirements

1. **Backward Compatibility:** Ensure `include_scenarios=False` (default) returns original response format
2. **Scenario Accuracy:** Verify each scenario's soil loss matches individual calculations
3. **Performance:** Confirm multi-scenario adds <20% overhead vs. single calculation
4. **Edge Cases:**
   - Very small fields (<1 acre)
   - High slope areas (>15%)
   - Multiple detected practices (terraces + contours)

---

## Success Metrics

- Single-call scenario comparison functional
- Response time <120 seconds for 6 scenarios
- Baseline matches 'none' practice calculation
- All 6 scenarios return valid P-factors and soil loss rates
- Frontend can render interactive comparison UI

---

## Implementation Priority

**Phase 1 (MVP):**
- Add `include_scenarios` parameter
- Return baseline + scenarios array
- Basic scenario calculation logic

**Phase 2 (Enhancement):**
- Add `scenario_comparison` summary stats
- Optimize P-factor batch calculation
- Cache intermediate results

**Phase 3 (Polish):**
- Add cost estimates to scenarios
- Include practice-specific warnings/recommendations
- Support custom practice combinations

---

## Questions for Implementation

1. Should `scenarios` always include all 6 practices, or allow filtering via `scenario_practices` parameter?
2. Should baseline always be calculated, or only when `include_scenarios=true`?
3. Do we need to persist scenario results for historical comparisons?
4. Should API suggest "best practice" based on cost, effectiveness, and field characteristics?

---

## Agent Implementation Prompt

You are tasked with implementing the RUSLE Multi-Scenario Baseline Calculation feature in the existing GEE API codebase.

**Repository:** The GEE API is a FastAPI application using Google Earth Engine for soil erosion calculations.

**Your Tasks:**

1. **Locate the RUSLE endpoint** (`/api/rusle/calculate`) in the routers
2. **Add new schema fields** to `RUSLERequest` and `RUSLEResponse` (see specifications above)
3. **Refactor calculation logic** to:
   - Calculate R, K, LS, C factors once
   - Loop through all conservation practices for P-factor
   - Compute soil loss for each scenario
   - Return enhanced response with baseline + scenarios
4. **Ensure backward compatibility** - existing API clients should work unchanged
5. **Add tests** for multi-scenario calculation
6. **Update API documentation** (OpenAPI schema)

**Key Implementation Notes:**
- The P-factor calculation is already isolated - you just need to call it multiple times with different `conservation_practices` values
- Soil loss formula: `A = R × K × LS × C × P`
- Baseline is always the `'none'` practice
- Conversion factor: 1 t/ha = 0.446 t/ac

**Testing:**
- Verify `include_scenarios=false` returns original response
- Verify all 6 scenarios have correct P-factors and soil loss values
- Verify baseline matches individual calculation with `practice='none'`

Begin by examining the current `/api/rusle/calculate` endpoint implementation and propose a refactoring plan.
