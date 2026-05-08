# Management Zones SOP Checklist (One Page)

Purpose: Standardize every delineation run in Field Analysis so maps are agronomically meaningful and operationally executable.

Scope: Applies to all operators running Zone Count Optimization and Zone Delineation in the field-analysis module.

---

## A) Pre-Run Checklist (Required)

- Confirm correct field boundary is loaded (no missing/invalid geometry).
- Confirm intended season year is selected.
- Default year rule: use the most recent complete season (current year minus 1).
- Confirm operator objective for this run:
  - Implementation map (simple, hard boundaries), or
  - Analysis map (transition-aware, fuzzy boundaries).
- Confirm machinery/logistics constraints:
  - Smallest practical treatment block size,
  - Max number of zones team can manage.

Pass/Fail gate:
- If boundary is missing or objective is unclear, stop and resolve before running.

---

## B) Zone Count Optimization Checklist

Set these inputs before clicking Optimize Zone Count:

1. Year
- Use most recent complete season unless agronomy lead requests otherwise.

2. Method
- Default: composite.
- Use quick only for rapid iteration.
- Use silhouette, bic, or fpc only for diagnostics/comparison.

3. Min Zones (k_min)
- Typical default: 2.
- Keep realistic for field complexity.

4. Max Zones (k_max)
- Typical default: 8.
- Keep aligned with operational capacity.

5. max_zones
- Practical hard cap (typical 5-6).
- Do not exceed what can be executed in operations.

6. min_zone_area_ha
- Minimum actionable zone size in hectares.
- Start at 2.0 ha unless local guidance differs.

Run:
- Click Optimize Zone Count.

Post-run checks:
- Record recommended_k.
- Review reason and warnings.
- If output appears over-complex, reduce k range or raise min_zone_area_ha and rerun.

---

## C) Zone Delineation Checklist

Set these inputs before clicking Delineate Zones:

1. n_zones
- Start with optimizer recommended_k.
- Change only with agronomic rationale.

2. covariates
- Start with default set: ndvi, soci, twi, slope, clay.
- Add covariates only if they support a specific management decision.
- Ensure at least one covariate is selected.

3. clustering_method
- Default: fuzzy_auto.
- Use kmeans for hard, non-overlapping, operationally crisp zones.
- Use fuzzy/fuzzy_soft/fuzzy_auto for transition-aware delineation.

4. fuzziness_m
- Applies only to fuzzy methods.
- Default: 2.0.
- Lower values produce crisper assignments; higher values produce softer transitions.

5. smooth_boundaries
- Applies only to fuzzy methods.
- Keep ON by default to reduce jagged artifacts.
- In kmeans this is disabled and treated as false.

Run:
- Click Delineate Zones.

Post-run checks:
- Confirm clustering method used matches intent.
- Review transition pixels (if returned) for transition-heavy fields.
- Review raster outputs:
  - Cluster assignment raster,
  - Cluster probability layers.

---

## D) Acceptance Criteria (Run Is Valid)

A delineation run is accepted when all are true:

- Zones align with known field patterns (terrain, drainage, productivity history).
- Zone count and polygon/raster complexity are operationally executable.
- No excessive speckling or micro-zones below practical treatment scale.
- Zone differences imply distinct management actions.

If not accepted:
- Increase min_zone_area_ha for less fragmentation.
- Reduce n_zones for simplicity.
- Simplify covariates to high-signal variables.
- Switch method (for example, kmeans for operational maps).

---

## E) Quick Presets

Preset 1: Standard Production Run
- Method: composite
- k_min/k_max: 2/8
- max_zones: 5
- min_zone_area_ha: 2.0
- n_zones: recommended_k
- clustering_method: fuzzy_auto
- fuzziness_m: 2.0
- smooth_boundaries: true

Preset 2: Operational Simplicity
- Method: composite
- k_min/k_max: 2/6
- max_zones: 4
- min_zone_area_ha: 2.5 to 3.0
- clustering_method: kmeans

Preset 3: Exploratory Analysis
- Method: composite (+ compare with silhouette)
- k_min/k_max: 3/9
- max_zones: 6
- min_zone_area_ha: 1.5 to 2.0
- clustering_method: fuzzy_auto

---

## F) SoilStrata Integration: Zone Delineation Parameters

Use this section to wire SoilStrata to the same parameter contract.

### Endpoint Contract (Delineation)

Request shape:

```ts
interface ZoneDelineationRequest {
  wkt: string;
  covariates: string[]; // required
  n_zones: number;      // required
  year: number;         // required
  clustering_method?: 'kmeans' | 'fuzzy' | 'fuzzy_soft' | 'fuzzy_auto';
  fuzziness_m?: number; // only for fuzzy modes
  smooth_boundaries?: boolean; // ignored/false for kmeans
  min_zone_area_ha?: number;
  seed?: number;
}
```

### SoilStrata UI Parameter Spec

- year
  - Type: number
  - Required: yes
  - Recommended default: currentYear - 1 (most recent complete season)
  - UI bounds: 2015-2030

- n_zones
  - Type: integer
  - Required: yes
  - UI bounds: 2-10
  - Recommended source: optimize.recommended_k

- covariates
  - Type: string[]
  - Required: yes (min length 1)
  - Recommended default set: [ndvi, soci, twi, slope, clay]

- clustering_method
  - Type: enum
  - Allowed: kmeans, fuzzy, fuzzy_soft, fuzzy_auto
  - Recommended default: fuzzy_auto

- fuzziness_m
  - Type: number
  - Required: no
  - UI bounds: 1.1-5.0 (step 0.1)
  - Default: 2.0
  - Rule: send only when clustering_method is not kmeans

- smooth_boundaries
  - Type: boolean
  - Required: no
  - Default: true (for fuzzy methods)
  - Rule: force false when clustering_method is kmeans

- min_zone_area_ha
  - Type: number
  - Required: no
  - UI minimum: 0.1
  - Typical default: 2.0

- seed
  - Type: integer
  - Required: no
  - Recommended default: 42 for reproducibility

### SoilStrata Payload Guardrails

- Enforce covariates.length >= 1 before submit.
- Normalize zone bounds in optimization flows (k_min <= k_max).
- If clustering_method == kmeans:
  - omit fuzziness_m,
  - set smooth_boundaries = false.
- Persist full run config with output for traceability/audit.

### Suggested SoilStrata Default Payload

```json
{
  "year": 2025,
  "n_zones": 4,
  "covariates": ["ndvi", "soci", "twi", "slope", "clay"],
  "clustering_method": "fuzzy_auto",
  "fuzziness_m": 2.0,
  "smooth_boundaries": true,
  "min_zone_area_ha": 2.0,
  "seed": 42
}
```

Note: Do not hardcode year in production. Compute as currentYear - 1.
