# SoilStrata Sampling & Zone Endpoints — Integration Guide

**Audience:** AI coding agent tasked with integrating the GEE API into the SoilStrata
Next.js soil-sampling application.

**GEE API base URL:** `https://gee-api-production.up.railway.app`  
**Next.js env var:** `GEE_API_URL` (set in `.env.local` and Vercel project settings)  
**Last updated:** 2026-03-18

---

## Contents

1. [Endpoint Overview](#1-endpoint-overview)
2. [What Changed — Revised Endpoints](#2-what-changed--revised-endpoints)
3. [Complete Endpoint Reference](#3-complete-endpoint-reference)
   - 3.1 POST /api/sampling/covariates
   - 3.2 POST /api/sampling/optimalK
   - 3.3 POST /api/sampling/stratify *(revised)*
   - 3.4 POST /api/sampling/design *(new)*
   - 3.5 POST /api/zones/optimize *(new)*
   - 3.6 POST /api/zones/delineate *(new)*
   - 3.7 POST /api/sampling/design-prep *(new)*
4. [Implementation Checklist for an AI Agent](#4-implementation-checklist-for-an-ai-agent)
5. [TypeScript Types — Complete Reference](#5-typescript-types--complete-reference)
6. [Proxy Route Files — Ready to Create](#6-proxy-route-files--ready-to-create)
7. [API Client Helpers — Complete Reference](#7-api-client-helpers--complete-reference)
8. [User-Facing Workflow](#8-user-facing-workflow)
9. [Error Handling Patterns](#9-error-handling-patterns)
10. [Quality Metrics Interpretation](#10-quality-metrics-interpretation)
11. [Clustering Method Guide](#11-clustering-method-guide)

---

## 1. Endpoint Overview

The GEE API now exposes **seven** endpoints for the SoilStrata sampling workflow. All are
`POST`, accept `application/json`, and must be called server-side through Next.js proxy
route handlers — never directly from the browser.

| Endpoint | Status | Purpose | Timeout |
|----------|--------|---------|---------|
| `POST /api/sampling/covariates` | Unchanged | Preview covariate stats over a polygon | 60 s |
| `POST /api/sampling/optimalK` | Unchanged | K-sweep cluster optimization (5 metrics) | 60 s |
| `POST /api/sampling/stratify` | **Revised** | Stratified random + optional fuzzy clustering + transition oversampling | 60 s |
| `POST /api/sampling/design` | **New** | Unified 6-method sampling design (cLHS, stratified, random, grid, GRTS) | 120 s |
| `POST /api/zones/optimize` | **New** | 5-method consensus zone-count optimization | 60 s |
| `POST /api/zones/delineate` | **New** | Satellite or terrain fuzzy zone delineation | 90 s |
| `POST /api/sampling/design-prep` | **New** | Combined k-sweep + zone variability + sample-count estimation | 90 s |

**The `/api/sampling/design` endpoint is the primary new capability.** It replaces the
need to build method-specific logic in the UI — the API handles all six sampling methods
end-to-end and returns consistent, typed output.

**`/api/sampling/design-prep` is the recommended pre-flight step** for any zone-managed
design — it combines `optimalK`, `zones/optimize`, per-zone variability analysis, and
Neyman-guided sample-count estimation in a single call.

---

## 2. What Changed — Revised Endpoints

### 2.1 `POST /api/sampling/stratify` — New Optional Fields

The existing proxy route (`src/app/api/sampling/stratify/route.ts`) does **not** need
to change — it forwards the full request body. The new backend fields are:

#### New request fields (all optional, fully backward-compatible)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `clustering_method` | `'kmeans' \| 'fuzzy' \| 'fuzzy_soft' \| 'fuzzy_auto'` | `'kmeans'` | Algorithm for zone membership assignment |
| `fuzziness_m` | `number \| null` | `null` → uses 2.0 | Fuzzifier exponent (only for fuzzy variants) |
| `oversample_transitions` | `boolean` | `false` | Allocate extra samples to pixels with low cluster membership |
| `transition_threshold` | `number` | `0.6` | Max membership below this = transition zone |
| `transition_oversample_pct` | `number` | `0.25` | Fraction of total samples added for transitions |

#### New response fields

| Field | Type | When null |
|-------|------|-----------|
| `clustering_method_used` | `ClusteringMethod` | never |
| `fuzziness_m_used` | `number \| null` | when `clustering_method = 'kmeans'` |
| `n_transition_points` | `number \| null` | when `oversample_transitions = false` or kmeans |
| `mean_membership` | `number \| null` | when kmeans |

#### What you need to update in the SoilStrata app

1. **`src/lib/types/sampling.ts`** — add the 5 new request fields to `StratifyRequest` and the 4 new fields to `StratifyResponse`
2. **`src/components/sampling/StratifyForm.tsx`** (or equivalent) — expose a clustering method selector and the fuzziness/transition controls
3. **`src/components/sampling/StratifyResults.tsx`** (or equivalent) — display `clustering_method_used`, `fuzziness_m_used`, `mean_membership`, and `n_transition_points`

### 2.2 Five New Endpoints

All new endpoints (`/sampling/design`, `/sampling/design-prep`, `/zones/optimize`,
`/zones/delineate`) are **additive** — they do not change existing routes. Implement each
as a new Next.js route handler. Full file contents are provided in
[Section 6](#6-proxy-route-files--ready-to-create).

---

## 3. Complete Endpoint Reference

### 3.1 `POST /api/sampling/covariates`

Computes per-pixel statistics for five soil covariates over a WKT polygon. Use before
showing the sampling form to give the user a preview of the field's data range.

**Target latency:** < 15 s

#### Request

```typescript
interface CovariatesRequest {
  wkt: string;             // WKT POLYGON, EPSG:4326
  year: number;            // 2017–2030
  covariates?: Covariate[]; // optional; defaults to ['ndvi','soci','twi','slope','clay']
}
```

#### Response

```typescript
interface CovariatesResponse {
  // All requested covariates keyed by name
  stats: Record<Covariate, CovariateStats>;
  // Legacy top-level fields (present when those covariates were requested)
  ndvi:  CovariateStats | null;
  soci:  CovariateStats | null;
  twi:   CovariateStats | null;
  slope: CovariateStats | null;
  clay:  CovariateStats | null;
  pixel_count: number;
  area_acres: number;
  wkt: string;
}

interface CovariateStats {
  mean: number | null;
  min:  number | null;
  max:  number | null;
  std_dev: number | null;
}
```

---

### 3.2 `POST /api/sampling/optimalK`

Runs k-means for k=2..k_max and scores each k with five methods (Silhouette, FPC, BIC,
Davies-Bouldin, Calinski-Harabász). Returns a majority-vote consensus recommendation.
Use to populate an optimalK chart and let the user choose k before calling `/stratify`.

**Target latency:** 20–45 s

#### Request

```typescript
interface OptimalKRequest {
  wkt: string;
  covariates?: Covariate[];   // optional; defaults to ['ndvi','soci','twi','slope','clay']
  year: number;
  k_min?: number;   // default 2
  k_max?: number;   // default 8
  n_start?: number; // default 5, kmeans random starts per k
}
```

#### Response (key fields)

```typescript
interface OptimalKResponse {
  optimal_k: number;
  optimal_k_by_method: {
    silhouette: number;
    fpc: number;
    bic: number;
    davies_bouldin: number;
    calinski_harabasz: number;
  };
  consensus_votes: number;
  total_methods: number;       // 4 if skfuzzy absent, else 5
  agreement_level: 'perfect' | 'strong' | 'partial' | 'weak';
  optimal_k_data: OptimalKDataPoint[];
  recommendations: OptimalKRecommendation[];
  warnings: string[];
  wkt: string;
}
```

---

### 3.3 `POST /api/sampling/stratify` *(revised)*

Full stratification + sample point generation. Now supports fuzzy clustering and
transition-zone oversampling in addition to the original kmeans + random/LHS workflow.

**Target latency:** 30–60 s

#### Request

```typescript
interface StratifyRequest {
  wkt: string;
  covariates: Covariate[];
  n_strata: number;
  n_samples: number;
  sampling_method?: 'random' | 'lhs';    // default 'random'
  allocation_method?: 'fixed' | 'proportional'; // default 'proportional'
  year: number;
  buffer_distance_m?: number;   // default 30
  min_distance_m?: number;      // default 30
  seed?: number;                // default 42

  // --- NEW fields (all optional) ---
  clustering_method?: 'kmeans' | 'fuzzy' | 'fuzzy_soft' | 'fuzzy_auto'; // default 'kmeans'
  fuzziness_m?: number;                 // default 2.0 (ignored for kmeans)
  oversample_transitions?: boolean;     // default false
  transition_threshold?: number;        // default 0.6
  transition_oversample_pct?: number;   // default 0.25
}
```

#### Response

```typescript
interface StratifyResponse {
  sample_points: GeoJSON.FeatureCollection<GeoJSON.Point, SamplePointProperties>;
  cluster_polygons: GeoJSON.FeatureCollection;
  strata_stats: StratumStats[];
  covariate_means_by_stratum: Record<string, Record<string, number>>;
  pca_summary: PcaSummary;
  n_samples_generated: number;
  buffer_applied: boolean;
  buffer_distance_m: number;
  min_distance_m: number;
  wkt: string;

  // --- NEW fields ---
  clustering_method_used: 'kmeans' | 'fuzzy' | 'fuzzy_soft' | 'fuzzy_auto';
  fuzziness_m_used: number | null;
  n_transition_points: number | null;
  mean_membership: number | null;
}
```

#### Example — fuzzy stratify with transition zone oversampling

```json
{
  "wkt": "POLYGON((-97.5 38.8, -97.4 38.8, -97.4 38.9, -97.5 38.9, -97.5 38.8))",
  "covariates": ["elevation", "slope", "ndvi", "clay", "twi"],
  "n_strata": 4,
  "n_samples": 40,
  "year": 2023,
  "clustering_method": "fuzzy_auto",
  "oversample_transitions": true,
  "transition_threshold": 0.6,
  "transition_oversample_pct": 0.25
}
```

---

### 3.4 `POST /api/sampling/design` *(new)*

Unified sampling design endpoint. Handles all six sampling methods end-to-end. GEE
covariate extraction, clustering, sample placement, quality metrics, and cluster
interpretation are all performed server-side.

**Target latency:** 15–90 s depending on method  
**Proxy max duration:** 120 s

#### Six supported methods

| Method | Description | Optional dep | Best use case |
|--------|-------------|-------------|---------------|
| `clhs_feature` | cLHS within fuzzy k-means feature clusters | `clhs` package | DSM training, soil characterization (≥40 samples) |
| `clhs_spatial` | Spatially-constrained cLHS | `clhs` package | Spectral libraries, rare-condition capture |
| `stratified` | Stratified random with fuzzy/kmeans zones | none | Management zones, conservation planning |
| `random` | Simple random | none | Homogeneous fields, baseline |
| `grid` | Systematic square or hexagonal grid | none | Fertility testing, dense coverage |
| `grts` | GRTS spatially balanced | none | Long-term monitoring, survey panels |

> If the `clhs` package is not installed on Railway, the `clhs_feature` and `clhs_spatial` methods return
> `HTTP 503 { "detail": "cLHS sampling requires the clhs package..." }`.
> **Do not fall back silently** — surface this to the user as an unavailable option.
>
> **GRTS always works** — the API uses a native Halton-sequence sampler with no extra dependencies.

#### Request

```typescript
interface SamplingDesignRequest {
  wkt: string;
  method: 'clhs_feature' | 'clhs_spatial' | 'stratified' | 'random' | 'grid' | 'grts';
  n_samples: number;        // 5–1000
  year: number;             // 2015–2030
  covariates?: Covariate[];  // optional; defaults to ['ndvi','soci','twi','slope','clay']
  min_spacing?: number;     // global minimum point separation in metres
  clhs_feature?: ClhsFeatureParams;
  clhs_spatial?: ClhsSpatialParams;
  stratified?: StratifiedDesignParams;
  grid?: GridDesignParams;
  seed?: number;
}

interface ClhsFeatureParams {
  n_clusters?: number;              // omit for auto-optimization (recommended)
  // 'neyman_multivariate' uses StandardScaler-normalised covariates (correct for multi-covariate)
  // 'neyman_target' uses raw values for a single declared covariate
  allocation?: 'proportional' | 'equal' | 'neyman_multivariate' | 'neyman_target';
  neyman_target_covariate?: string; // required when allocation='neyman_target', e.g. 'clay'
  fuzziness?: number;               // default 2.0, range 1.1–5.0
  clhs_iterations?: number;         // default 10000
  min_samples_per_cluster?: number; // default 3
}

interface ClhsSpatialParams {
  alpha?: number;           // 0.0–1.0, default 0.6 (higher = more feature coverage)
  min_spacing?: number;     // metres, default 50 (spatial cost penalty, not hard constraint)
  clhs_iterations?: number; // default 10000
}

interface StratifiedDesignParams {
  n_zones?: number;                    // omit for auto-optimization
  allocation?: 'proportional' | 'equal' | 'neyman_multivariate' | 'neyman_target';
  neyman_target_covariate?: string; // required when allocation='neyman_target'
  clustering_method?: 'kmeans' | 'fuzzy' | 'fuzzy_soft' | 'fuzzy_auto'; // default 'fuzzy'
  fuzziness_m?: number;               // default 2.0
  oversample_transitions?: boolean;   // default false
  transition_threshold?: number;      // default 0.6
  transition_oversample_pct?: number; // default 0.25
}

interface GridDesignParams {
  type?: 'square' | 'hexagonal'; // default 'square'
  jitter?: boolean;              // default true — adds ≤50% random offset per cell
}
```

#### Response

```typescript
interface SamplingDesignResponse {
  samples: GeoJSON.FeatureCollection<GeoJSON.Point, SamplePointProperties>;
  cluster_interpretation: ClusterInterpretation[] | null; // non-null only for clhs_feature
  optimization: SamplingOptimizationResult | null;         // non-null when auto-k was used
  quality_metrics: SamplingQualityMetrics;
  method_metadata: SamplingDesignMethodMetadata;
}

interface SamplePointProperties {
  sample_id: number;
  cluster?: number;        // present for clhs_feature / stratified
  zone?: number;           // present for stratified
  cluster_name?: string;   // e.g. "Clay bottomland"
  membership?: number;     // 0–1, highest cluster membership
  is_transition?: boolean; // membership < transition_threshold
}

interface ClusterInterpretation {
  cluster_id: number;
  name: string;            // auto-generated, e.g. "Silty upland"
  description: string;     // e.g. "High elevation, low clay, moderate NDVI"
  area_ha: number;
  area_pct: number;
  n_samples: number;
  mean_covariates: Record<string, number>;
}

interface SamplingOptimizationResult {
  recommended_k: number;
  statistical_optimal: number;
  quality: 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'POOR';
  silhouette_score: number;
  reason: string;
}

interface SamplingQualityMetrics {
  feature_coverage: number | null;    // 0–1; null for grid/random/grts
  spatial_balance: number;            // 0–1
  mean_nearest_neighbor_m: number;
  min_nearest_neighbor_m: number;
  poor_spacing_pct: number;           // % of samples violating min_spacing
  clhs_objective: number | null;      // null for non-cLHS methods
  cluster_separation: number | null;  // silhouette; null for non-cluster methods
}

interface SamplingDesignMethodMetadata {
  method: string;
  total_samples: number;
  computation_time_seconds: number;
  convergence?: boolean;              // cLHS methods only
  n_clusters_used?: number;          // cluster methods only
  allocation_method_used?: string;   // cluster methods only
}
```

#### Null-field matrix

| Field | `clhs_feature` | `clhs_spatial` | `stratified` | `random` | `grid` | `grts` |
|-------|:-:|:-:|:-:|:-:|:-:|:-:|
| `cluster_interpretation` | ✅ | — | — | — | — | — |
| `optimization` | ✅ if auto-k | — | ✅ if auto-k | — | — | — |
| `quality_metrics.feature_coverage` | ✅ | ✅ | — | — | — | — |
| `quality_metrics.clhs_objective` | ✅ | ✅ | — | — | — | — |
| `quality_metrics.cluster_separation` | ✅ | — | ✅ | — | — | — |
| `SamplePointProperties.cluster` | ✅ | — | as `zone` | — | — | — |

#### Example request — cLHS within feature clusters

```json
{
  "wkt": "POLYGON((-97.5 38.8, -97.4 38.8, -97.4 38.9, -97.5 38.9, -97.5 38.8))",
  "method": "clhs_feature",
  "n_samples": 60,
  "year": 2023,
  "covariates": ["elevation", "slope", "ndvi", "clay", "twi"],
  "clhs_feature": {
    "allocation": "proportional",
    "fuzziness": 2.0,
    "clhs_iterations": 10000,
    "min_samples_per_cluster": 3
  },
  "seed": 42
}
```

#### Example request — hexagonal grid

```json
{
  "wkt": "POLYGON((-97.5 38.8, -97.4 38.8, -97.4 38.9, -97.5 38.9, -97.5 38.8))",
  "method": "grid",
  "n_samples": 30,
  "year": 2023,
  "covariates": ["elevation"],
  "grid": { "type": "hexagonal", "jitter": true }
}
```

---

### 3.5 `POST /api/zones/optimize` *(new)*

Scores k=2..8 zones using up to 5 statistical criteria and returns a consensus
recommendation. Optionally applies practical area constraints when `field_area_ha` is
provided. Use this for the "How many zones?" UI step before zone delineation.

**Target latency:** 20–45 s

#### Request

```typescript
interface ZoneOptimizationRequest {
  wkt: string;
  covariates?: Covariate[];  // optional; defaults to ['ndvi','soci','twi','slope','clay']
  year: number;
  k_min?: number;               // default 2
  k_max?: number;               // default 8
  method?: 'quick' | 'consensus' | 'silhouette' | 'bic' | 'fpc'; // default 'consensus'
  field_area_ha?: number;       // enables practical constraints
  max_zones?: number;           // default 8 — hard ceiling
  min_zone_area_ha?: number;    // default 2.0 — penalizes smaller zones
}
```

#### Response

```typescript
interface ZoneOptimizationResponse {
  recommended_k: number;
  statistical_optimal_k: number;
  consensus_votes: number;
  total_methods: number;         // 4 if skfuzzy absent, else 5
  method_votes: {
    silhouette: number | null;
    calinski_harabasz: number | null;
    davies_bouldin: number | null;
    bic: number | null;
    fpc: number | null;
  };
  quality: ZoneQualityMetrics;
  alternatives: ZoneAlternative[];
  practical_constraints_applied: boolean;
  reason: string;                // human-readable explanation
  warnings: string[];
  wkt: string;
}
```

#### `method` reference

| Method | Criteria | Speed | Use when |
|--------|----------|-------|---------|
| `quick` | Silhouette + FPC | Fast | Live UI preview, drag interaction |
| `consensus` | All 5 criteria | Moderate | Final run before delineation |
| `silhouette` | Silhouette only | Fast | Simple quality check |
| `bic` | BIC via GMM | Moderate | Model-theoretic preference |
| `fpc` | FPC only | Moderate | Explicitly fuzzy workflow |

#### Quality level thresholds

| Level | Silhouette | Meaning |
|-------|-----------|---------|
| `excellent` | > 0.70 | Well-separated distinct zones |
| `good` | 0.50–0.70 | Clear zones with minor overlap |
| `acceptable` | 0.25–0.50 | Moderate separation (common in smooth landscapes) |
| `poor` | < 0.25 | Weak structure — reduce k or change covariates |

---

### 3.6 `POST /api/zones/delineate` *(new)*

Extracts satellite (11 features) or terrain-only (6 features) covariates from GEE, runs
clustering, and returns zone polygons as a GeoJSON `FeatureCollection` plus per-zone
characteristics. The proxy retries once on HTTP 500 (transient GEE timeout).

**Target latency:** 30–60 s  
**Proxy max duration:** 60 s (with one 90 s retry on HTTP 500)

#### Request

```typescript
interface ZoneDelineationRequest {
  wkt: string;
  method: 'satellite' | 'terrain';
  n_zones: number;               // 2–10
  year: number;                  // 2015–2030
  clustering_method?: 'kmeans' | 'fuzzy' | 'fuzzy_soft' | 'fuzzy_auto'; // default 'kmeans'
  fuzziness_m?: number;          // 1.0–5.0; only for fuzzy variants
  smooth_boundaries?: boolean;   // default true
  min_zone_area_ha?: number;     // default 2.0 — zones below this are merged
  seed?: number;
}
```

#### Covariate sets

**`method: 'satellite'`** — Sentinel-2 + SRTM (11 features):
`peak_ndvi`, `early_ndvi`, `late_ndvi`, `ndwi`, `evi`, `ndvi_cv`,
`elevation`, `slope`, `twi`, `aspect_sin`, `aspect_cos`

Requires ≥ 5 cloud-free Sentinel-2 images per season. Returns `HTTP 400` if threshold
not met — fall back to `method: 'terrain'` in the UI.

**`method: 'terrain'`** — SRTM only (6 features, works for any year):
`elevation`, `slope`, `twi`, `tpi`, `aspect_sin`, `aspect_cos`

#### Response

```typescript
interface ZoneDelineationResponse {
  zone_polygons: GeoJSON.FeatureCollection<GeoJSON.Polygon, {
    zone_id: number;
    zone_type: string;
  }>;
  zone_characteristics: ZoneCharacteristic[];
  fpc: number | null;                    // Fuzzy Partition Coefficient; null for kmeans
  clustering_method_used: 'kmeans' | 'fuzzy' | 'fuzzy_soft' | 'fuzzy_auto';
  fuzziness_m_used: number | null;
  n_transition_pixels: number | null;    // pixels with max-membership < 0.6; null for kmeans
  method_used: 'satellite' | 'terrain';
  n_zones: number;
  wkt: string;
}

interface ZoneCharacteristic {
  zone_id: number;
  area_ha: number;
  area_pct: number;
  pixel_count: number;
  zone_type: string;          // e.g. "High productivity", "Wet/low-lying"
  temporal_stability: number | null; // NDVI CV (0–1); null for terrain method
  mean_covariates: Record<string, number>;
}
```

---

### 3.7 `POST /api/sampling/design-prep` *(new)*

Single-call pre-flight endpoint that combines the k-sweep from `optimalK`, the
practical zone recommendation from `zones/optimize`, per-zone variability analysis,
and Neyman-guided sample-count estimation. Use this **before** calling
`/api/sampling/design` to determine `n_samples` and `n_zones` in one round-trip.

**Target latency:** 25–55 s  
**Proxy max duration:** 90 s

#### Request

```typescript
interface DesignPrepRequest {
  wkt: string;                         // WKT POLYGON, EPSG:4326
  covariates?: Covariate[];            // default ['ndvi','soci','twi','slope','clay']
  year: number;                        // 2017–present
  k_min?: number;                      // default 2
  k_max?: number;                      // default 8
  n_start?: number;                    // default 5 — KMeans random starts per k
  field_area_ha?: number;              // enables practical zone-size constraints
  max_zones?: number;                  // default 5 — hard ceiling on zone count
  min_zone_area_ha?: number;           // default 2.0 — minimum viable zone area
  target_relative_error?: number;      // default 0.15 (15 %); range 0.05–0.5
  allocation_method?: 'neyman_multivariate' | 'proportional' | 'equal';
}
```

#### Response

```typescript
interface DesignPrepResponse {
  // k-sweep section (same data as optimalK, use for elbow/silhouette chart)
  optimal_k_data: OptimalKDataPoint[];
  statistical_optimal_k: number;       // consensus k before practical constraints
  recommended_k: number;               // USE THIS — k after area constraints
  practical_constraints_applied: boolean;
  reason: string;                      // human-readable explanation
  alternatives: ZoneAlternative[];     // other viable zone counts

  // variability + allocation section
  zone_variability: DesignPrepZoneVariability[];
  total_suggested_samples: number;     // USE THIS as n_samples for /design
  suggested_n_basis: DesignPrepSuggestedNBasis;
  allocation_method: string;
  warnings: string[];
  wkt: string;
}

interface DesignPrepZoneVariability {
  zone: number;                        // 1-based zone index
  pixel_count: number;
  area_ha: number | null;              // null when field_area_ha not supplied
  covariates: Record<string, {
    mean: number;
    std: number;
    cv: number;                        // coefficient of variation = std / |mean|
  }>;
  variability_score: number;           // mean CV across all covariates
  suggested_samples: number;           // samples allocated to this zone
}

interface DesignPrepSuggestedNBasis {
  mean_field_cv: number;               // mean CV across all pixels and covariates
  n_pixels: number;
  target_relative_error: number;
  z_value: number;                     // 1.645 = 90 % CI
}
```

**Sample-size formula:** `n = z² × CV² / (e² + z² × CV² / N)` (finite-population
corrected minimum-variance estimate, where e = `target_relative_error`, N = pixel count).

**Allocation methods:**

| Method | Description |
|--------|-------------|
| `neyman_multivariate` | Allocate proportional to N_h × composite variability score (StandardScaler-normalised) — default; **recommended** |
| `proportional` | Allocate proportional to zone pixel count only |
| `equal` | Equal samples per zone regardless of size or variability |

#### Example — zone management with practical constraints

```json
{
  "wkt": "POLYGON((-93.62 42.02, -93.62 42.05, -93.58 42.05, -93.58 42.02, -93.62 42.02))",
  "covariates": ["ndvi", "soci", "twi", "slope", "clay"],
  "year": 2023,
  "field_area_ha": 120.0,
  "max_zones": 5,
  "min_zone_area_ha": 2.0,
  "target_relative_error": 0.15,
  "allocation_method": "neyman_multivariate"
}
```

#### Typical frontend usage

```typescript
// 1. Call design-prep to get recommended_k and total_suggested_samples
const prep = await samplingApi.designPrep({
  wkt, year, field_area_ha, covariates,
  target_relative_error: 0.15,
  allocation_method: 'neyman_multivariate',
});

// 2. Feed outputs directly into /api/sampling/design
const design = await samplingApi.design({
  wkt, year, covariates,
  method: 'stratified',
  n_samples: prep.total_suggested_samples,  // ← from design-prep
  stratified: {
    n_zones: prep.recommended_k,            // ← from design-prep
    allocation: 'neyman_multivariate',
  },
});
```

---

## 4. Implementation Checklist for an AI Agent

Follow each step in order. All file paths are relative to the SoilStrata app root.

### Step 1 — Install type dependency

If not already present:
```bash
npm install --save-dev @types/geojson
```

### Step 2 — Create `src/lib/types/zones.ts`

Create this file from scratch with the types defined in [Section 5.1](#51-zonetsts).

### Step 3 — Update `src/lib/types/sampling.ts`

Do **not** replace the file. Make targeted additions:
1. At the top, add: `import type { ClusteringMethod } from './zones';`
2. Add the 5 new optional fields to `StratifyRequest` — see [Section 5.2](#52-updates-to-samplingts)
3. Add the 4 new fields to `StratifyResponse`
4. Append all new `SamplingDesign*` interfaces to the bottom of the file — see [Section 5.2](#52-updates-to-samplingts)

### Step 4 — Create proxy route handlers

Create these four files. Exact file contents are in [Section 6](#6-proxy-route-files--ready-to-create):

| File to create | Note |
|----------------|------|
| `src/app/api/sampling/design/route.ts` | New — `maxDuration = 120` |
| `src/app/api/sampling/design-prep/route.ts` | New — `maxDuration = 90` |
| `src/app/api/zones/optimize/route.ts` | New — `maxDuration = 60` |
| `src/app/api/zones/delineate/route.ts` | New — `maxDuration = 60`, retry on 500 |

The existing `src/app/api/sampling/stratify/route.ts` needs **no changes** — it already
forwards the full request body, so the new fields are automatically proxied.

### Step 5 — Update `src/lib/api/sampling.ts`

Add the `design` and `designPrep` methods to the existing `samplingApi` object — see [Section 7.1](#71-extend-srclibapsampling-ts).

### Step 6 — Create `src/lib/api/zones.ts`

Create this file with `zonesApi` — see [Section 7.2](#72-new-file-srclibapizones-ts).

### Step 7 — Add `.env.local` entry (if not present)

```bash
GEE_API_URL=https://gee-api-production.up.railway.app
```

Also add `GEE_API_URL` to the Vercel project environment variables.

### Step 8 — Implement UI components

Minimum components required to expose the new sampling workflow:

| Component | What it calls | New features to expose |
|-----------|---------------|----------------------|
| `SamplingMethodSelector` | — | Radio/select for 6 methods; show/hide method param blocks |
| `ClhsFeatureParamsForm` | — | n_clusters (optional), allocation, fuzziness, iterations |
| `StratifiedParamsForm` | — | n_zones (optional), clustering_method, transition controls |
| `GridParamsForm` | — | type (square/hex), jitter toggle |
| `RunSamplingDesignButton` | `samplingApi.design()` | Loading state with method-specific message |
| `SamplingDesignResults` | — | Map overlay, quality badge, cluster cards, quality metrics panel |
| `ClusterInterpretationCard` | — | Per-cluster name, description, area%, sample count, covariate bars |
| `SamplingQualityPanel` | — | feature_coverage, spatial_balance, NN distances, poor_spacing_pct |
| `DesignPrepPanel` | `samplingApi.designPrep()` | Combined k-sweep chart + zone variability table + sample-count summary |
| `ZoneOptimizationChart` | `zonesApi.optimize()` | Bar chart of votes by method, recommended_k highlight |
| `ZoneDelineationMap` | `zonesApi.delineate()` | GeoJSON polygon layer, zone_characteristics table |

### Step 9 — Handle optional-dependency 503 errors

When `samplingApi.design()` or `samplingApi.stratify()` throws with status 503:
- Display a user-visible message: "This sampling method requires an optional package
  that is not currently installed on the server. Contact your administrator or choose
  a different method."
- Disable the `clhs_feature` and `clhs_spatial` method options in the UI if
  a probe call determines they are unavailable (or keep them enabled and surface the
  503 at submission time).
- **GRTS never returns 503** — it always works via the native Halton sampler.

### Step 10 — Verify the full workflow end-to-end

Test with a small polygon (< 10 ha) using each method:
1. `covariates` → confirm five stat blocks return
2. `optimalK` → confirm `optimal_k` and `optimal_k_data` populate a chart
3. `stratify` with `clustering_method: 'fuzzy'` → confirm `mean_membership` is non-null
4. `design` with `method: 'stratified'` → confirm `samples` GeoJSON renders on map
5. `design` with `method: 'grid'` → confirm actual sample count matches approximate `n_samples`
6. `zones/optimize` → confirm `recommended_k` and quality card render
7. `zones/delineate` → confirm `zone_polygons` renders as a polygon layer
8. `sampling/design-prep` → confirm `recommended_k`, `total_suggested_samples`, and `zone_variability` all populate correctly

---

## 5. TypeScript Types — Complete Reference

### 5.1 `zones.ts`

Create `src/lib/types/zones.ts`:

```typescript
export type ClusteringMethod = 'kmeans' | 'fuzzy' | 'fuzzy_soft' | 'fuzzy_auto';
export type OptimizationMethod = 'quick' | 'consensus' | 'bic' | 'silhouette' | 'fpc';
export type ZoneDelineationMethod = 'satellite' | 'terrain';
export type QualityLevel = 'excellent' | 'good' | 'acceptable' | 'poor';

// Full covariate catalogue — any of these can be passed to all sampling/zones endpoints
export type Covariate =
  // Legacy 5-band set (default)
  | 'ndvi' | 'soci' | 'twi' | 'slope' | 'clay'
  // Terrain (NCSS STEDUS30)
  | 'elevation' | 'rel_elevation'
  | 'slope_degrees' | 'slope_percent'
  | 'aspect' | 'aspect_sin' | 'aspect_cos'
  | 'plan_curvature' | 'profile_curvature' | 'plan_curvature_8' | 'profile_curvature_8'
  | 'spi' | 'convergence_index'
  | 'tpi_fine' | 'tpi' | 'tpi_broad' | 'tri' | 'valley_depth'
  // Spectral (Sentinel-2 median composite)
  | 'B2_blue' | 'B3_green' | 'B4_red' | 'B8_nir' | 'B11_swir1' | 'B12_swir2'
  | 'NDVI' | 'EVI' | 'SAVI'
  | 'NDMI' | 'NDWI'
  | 'BSI' | 'Clay' | 'Iron'
  | 'NDTI' | 'NBR' | 'SOCI';

export const DEFAULT_COVARIATES: Covariate[] = ['ndvi', 'soci', 'twi', 'slope', 'clay'];

export interface ZoneOptimizationRequest {
  wkt: string;
  covariates?: Covariate[];  // optional; defaults to ['ndvi','soci','twi','slope','clay']
  year: number;
  k_min?: number;
  k_max?: number;
  method?: OptimizationMethod;
  field_area_ha?: number;
  max_zones?: number;
  min_zone_area_ha?: number;
}

export interface ZoneQualityMetrics {
  k: number;
  silhouette: number | null;
  calinski_harabasz: number | null;
  davies_bouldin: number | null;
  bic: number | null;
  fpc: number | null;
  quality_level: QualityLevel;
}

export interface ZoneAlternative {
  k: number;
  votes: number;
  silhouette: number | null;
  fpc: number | null;
  quality_level: QualityLevel;
}

export interface ZoneOptimizationResponse {
  recommended_k: number;
  statistical_optimal_k: number;
  consensus_votes: number;
  total_methods: number;
  method_votes: {
    silhouette: number | null;
    calinski_harabasz: number | null;
    davies_bouldin: number | null;
    bic: number | null;
    fpc: number | null;
  };
  quality: ZoneQualityMetrics;
  alternatives: ZoneAlternative[];
  practical_constraints_applied: boolean;
  reason: string;
  warnings: string[];
  wkt: string;
}

export interface ZoneDelineationRequest {
  wkt: string;
  method: ZoneDelineationMethod;
  n_zones: number;
  year: number;
  clustering_method?: ClusteringMethod;
  fuzziness_m?: number;
  smooth_boundaries?: boolean;
  min_zone_area_ha?: number;
  seed?: number;
}

export interface ZoneCharacteristic {
  zone_id: number;
  area_ha: number;
  area_pct: number;
  pixel_count: number;
  zone_type: string;
  temporal_stability: number | null;
  mean_covariates: Record<string, number>;
}

export interface ZoneDelineationResponse {
  zone_polygons: GeoJSON.FeatureCollection<GeoJSON.Polygon, {
    zone_id: number;
    zone_type: string;
  }>;
  zone_characteristics: ZoneCharacteristic[];
  fpc: number | null;
  clustering_method_used: ClusteringMethod;
  fuzziness_m_used: number | null;
  n_transition_pixels: number | null;
  method_used: ZoneDelineationMethod;
  n_zones: number;
  wkt: string;
}
```

### 5.2 Updates to `sampling.ts`

Add these to **`src/lib/types/sampling.ts`** — do **not** replace the existing file:

```typescript
// At the top of the file — add these imports:
import type { ClusteringMethod, Covariate } from './zones';
export type { Covariate };

// ─── Replace the legacy Covariate type if it exists ──────────────────────────
// (If sampling.ts already has 'export type Covariate = ...', replace it with
//  the import above instead of keeping both)

// ─── Add to existing StratifyRequest interface ────────────────────────────────
// (These are new optional fields — add them inside the existing interface body)
clustering_method?: ClusteringMethod;   // default 'kmeans'
fuzziness_m?: number;                   // 1.0–5.0; ignored for kmeans
oversample_transitions?: boolean;       // default false
transition_threshold?: number;          // default 0.6
transition_oversample_pct?: number;     // default 0.25

// ─── Add to existing StratifyResponse interface ───────────────────────────────
clustering_method_used: ClusteringMethod;
fuzziness_m_used: number | null;
n_transition_points: number | null;
mean_membership: number | null;

// ─── Append these new interfaces to the bottom of the file ───────────────────

export type SamplingDesignMethod =
  | 'clhs_feature'
  | 'clhs_spatial'
  | 'stratified'
  | 'random'
  | 'grid'
  | 'grts';

export type AllocationMethod =
  | 'proportional'
  | 'equal'
  | 'neyman_multivariate'   // StandardScaler-normalised multi-covariate Neyman (recommended)
  | 'neyman_target';        // raw single-covariate Neyman — requires neyman_target_covariate

export interface ClhsFeatureParams {
  n_clusters?: number;
  allocation?: AllocationMethod;    // default 'proportional'
  neyman_target_covariate?: string; // required when allocation='neyman_target'
  fuzziness?: number;
  clhs_iterations?: number;
  min_samples_per_cluster?: number;
}

export interface ClhsSpatialParams {
  alpha?: number;
  min_spacing?: number;
  clhs_iterations?: number;
}

export interface StratifiedDesignParams {
  n_zones?: number;
  allocation?: AllocationMethod;    // default 'proportional'
  neyman_target_covariate?: string; // required when allocation='neyman_target'
  clustering_method?: ClusteringMethod;
  fuzziness_m?: number;
  oversample_transitions?: boolean;
  transition_threshold?: number;
  transition_oversample_pct?: number;
}

export interface GridDesignParams {
  type?: 'square' | 'hexagonal';
  jitter?: boolean;
}

export interface SamplingDesignRequest {
  wkt: string;
  method: SamplingDesignMethod;
  n_samples: number;
  year: number;
  covariates?: Covariate[];  // optional; defaults to ['ndvi','soci','twi','slope','clay']
  min_spacing?: number;
  clhs_feature?: ClhsFeatureParams;
  clhs_spatial?: ClhsSpatialParams;
  stratified?: StratifiedDesignParams;
  grid?: GridDesignParams;
  seed?: number;
}

export interface SamplePointDesignProperties {
  sample_id: number;
  cluster?: number;
  zone?: number;
  cluster_name?: string;
  membership?: number;
  is_transition?: boolean;
}

export interface ClusterInterpretation {
  cluster_id: number;
  name: string;
  description: string;
  area_ha: number;
  area_pct: number;
  n_samples: number;
  mean_covariates: Record<string, number>;
}

export interface SamplingOptimizationResult {
  recommended_k: number;
  statistical_optimal: number;
  quality: 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'POOR';
  silhouette_score: number;
  reason: string;
}

export interface SamplingQualityMetrics {
  feature_coverage: number | null;
  spatial_balance: number;
  mean_nearest_neighbor_m: number;
  min_nearest_neighbor_m: number;
  poor_spacing_pct: number;
  clhs_objective: number | null;
  cluster_separation: number | null;
}

export interface SamplingDesignMethodMetadata {
  method: SamplingDesignMethod;
  total_samples: number;
  computation_time_seconds: number;
  convergence?: boolean;
  n_clusters_used?: number;
  allocation_method_used?: AllocationMethod;
}

export interface SamplingDesignResponse {
  samples: GeoJSON.FeatureCollection<GeoJSON.Point, SamplePointDesignProperties>;
  cluster_interpretation: ClusterInterpretation[] | null;
  optimization: SamplingOptimizationResult | null;
  quality_metrics: SamplingQualityMetrics;
  method_metadata: SamplingDesignMethodMetadata;
}

// ─── design-prep types ───────────────────────────────────────────────────────

export type DesignPrepAllocationMethod = 'neyman_multivariate' | 'proportional' | 'equal';

export interface DesignPrepRequest {
  wkt: string;
  covariates?: Covariate[];
  year: number;
  k_min?: number;                 // default 2
  k_max?: number;                 // default 8
  n_start?: number;               // default 5
  field_area_ha?: number;
  max_zones?: number;             // default 5
  min_zone_area_ha?: number;      // default 2.0
  target_relative_error?: number; // default 0.15
  allocation_method?: DesignPrepAllocationMethod;
}

export interface DesignPrepCovariateStats {
  mean: number;
  std: number;
  cv: number;                     // std / |mean|
}

export interface DesignPrepZoneVariability {
  zone: number;                   // 1-based
  pixel_count: number;
  area_ha: number | null;
  covariates: Record<string, DesignPrepCovariateStats>;
  variability_score: number;      // mean CV across all covariates
  suggested_samples: number;
}

export interface DesignPrepSuggestedNBasis {
  mean_field_cv: number;
  n_pixels: number;
  target_relative_error: number;
  z_value: number;
}

export interface DesignPrepResponse {
  optimal_k_data: OptimalKDataPoint[];
  statistical_optimal_k: number;
  recommended_k: number;
  practical_constraints_applied: boolean;
  reason: string;
  alternatives: ZoneAlternative[];
  zone_variability: DesignPrepZoneVariability[];
  total_suggested_samples: number;
  suggested_n_basis: DesignPrepSuggestedNBasis;
  allocation_method: DesignPrepAllocationMethod;
  warnings: string[];
  wkt: string;
}
```

---

## 6. Proxy Route Files — Ready to Create

### `src/app/api/sampling/design/route.ts` — NEW

```typescript
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 120; // cLHS can take 60–90 s on large fields

const API_BASE = process.env.GEE_API_URL ?? 'https://gee-api-production.up.railway.app';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json();
  const upstream = await fetch(`${API_BASE}/api/sampling/design`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120_000),
  });
  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
```


### `src/app/api/sampling/design-prep/route.ts` — NEW

```typescript
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 90;

const API_BASE = process.env.GEE_API_URL ?? 'https://gee-api-production.up.railway.app';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json();
  const upstream = await fetch(`${API_BASE}/api/sampling/design-prep`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(90_000),
  });
  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
```

### `src/app/api/zones/optimize/route.ts` — NEW

```typescript
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

const API_BASE = process.env.GEE_API_URL ?? 'https://gee-api-production.up.railway.app';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json();
  const upstream = await fetch(`${API_BASE}/api/zones/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60_000),
  });
  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
```

### `src/app/api/zones/delineate/route.ts` — NEW

```typescript
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

const API_BASE = process.env.GEE_API_URL ?? 'https://gee-api-production.up.railway.app';

async function callDelineate(body: unknown): Promise<Response> {
  return fetch(`${API_BASE}/api/zones/delineate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(90_000),
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json();
  let upstream = await callDelineate(body);
  // Retry once on transient GEE errors
  if (upstream.status === 500) {
    upstream = await callDelineate(body);
  }
  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
```

---

## 7. API Client Helpers — Complete Reference

### 7.1 Extend `src/lib/api/sampling.ts`

Add the `design` method to the existing `samplingApi` object. Add the import first:

```typescript
// Add to existing imports at the top:
import type {
  SamplingDesignRequest,
  SamplingDesignResponse,
  DesignPrepRequest,
  DesignPrepResponse,
} from '@/lib/types/sampling';

// Inside the existing samplingApi export, add:
design: (req: SamplingDesignRequest) =>
  post<SamplingDesignRequest, SamplingDesignResponse>('/api/sampling/design', req),

designPrep: (req: DesignPrepRequest) =>
  post<DesignPrepRequest, DesignPrepResponse>('/api/sampling/design-prep', req),
```

### 7.2 New file — `src/lib/api/zones.ts`

```typescript
import type {
  ZoneOptimizationRequest,
  ZoneOptimizationResponse,
  ZoneDelineationRequest,
  ZoneDelineationResponse,
} from '@/lib/types/zones';

async function post<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? `Request to ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<TRes>;
}

export const zonesApi = {
  optimize: (req: ZoneOptimizationRequest) =>
    post<ZoneOptimizationRequest, ZoneOptimizationResponse>('/api/zones/optimize', req),

  delineate: (req: ZoneDelineationRequest) =>
    post<ZoneDelineationRequest, ZoneDelineationResponse>('/api/zones/delineate', req),
};
```

---

## 8. User-Facing Workflow

The intended UI flow for the SoilStrata sampling module:

```
1. User draws or uploads an AOI polygon on the map
         ↓
2. POST /api/sampling/covariates
   → Show covariate preview panel (NDVI range, clay%, slope, TWI, SOCI)
         ↓
3. POST /api/sampling/design-prep  ← **recommended pre-flight for zone-based designs**
   → Renders <DesignPrepPanel>: k-sweep elbow chart, zone variability table,
     and sample-count estimate (feeds recommended_k + total_suggested_samples into step 5)
   OR [Optional legacy path] POST /api/sampling/optimalK + POST /api/zones/optimize
         ↓
4. User selects sampling method in <SamplingMethodSelector>
   → Show/hide method-specific parameter controls
   → Pre-fill n_samples from design-prep total_suggested_samples (if available)
   → Pre-fill n_zones / n_clusters from design-prep recommended_k (if available)
         ↓
5. POST /api/sampling/design  (or /api/sampling/stratify for legacy flow)
   → Show loading indicator: "Extracting covariates..." → "Running [method]..."
         ↓
6. <SamplingDesignResults> renders:
   - Sample point map overlay
   - Quality metrics badge (EXCELLENT / GOOD / ACCEPTABLE / POOR)
   - Cluster interpretation cards (clhs_feature only)
   - Sample count, computation time, allocation breakdown
         ↓
7. [Optional — Zone Delineation path]
   POST /api/zones/optimize  → show recommended zone count
         ↓
   POST /api/zones/delineate → render zone polygon layer + characteristics table
```

**Loading state messages by method:**

| Method | Suggested loading message |
|--------|--------------------------|
| `clhs_feature` | "Building feature clusters and running cLHS (may take up to 90 s)…" |
| `clhs_spatial` | "Running spatially-constrained cLHS…" |
| `stratified` | "Clustering field and allocating samples…" |
| `random` | "Generating random sample points…" |
| `grid` | "Computing grid spacing and placing points…" |
| `grts` | "Running GRTS spatial balance design…" |

---

## 9. Error Handling Patterns

All API errors follow the FastAPI default shape:
```json
{ "detail": "<string | ValidationError[]>" }
```

#### Standard error handler (use in all proxy routes and client helpers)

```typescript
// Already present in the shared post() helper — shown for context:
if (!res.ok) {
  const err = await res.json().catch(() => ({ detail: res.statusText }));
  throw new Error(
    typeof err.detail === 'string'
      ? err.detail
      : JSON.stringify(err.detail)
  );
}
```

#### Status codes to handle in the UI

| Status | Cause | UI action |
|--------|-------|-----------|
| 400 | Bad WKT / area too large / insufficient pixels | Show inline error near the field input |
| 422 | Request validation failed (Pydantic) | Show field-level validation messages |
| 500 | GEE computation error or Python exception | Show "Failed to compute — try again or reduce field size" |
| 503 | Optional package (`clhs`) not installed | Disable `clhs_feature` and `clhs_spatial` in selector, show tooltip. GRTS is always available. |

#### GEE timeout (500 with `"detail": "GEE computation timeout"`)

These are transient. The `/zones/delineate` proxy already retries once. For
`/sampling/design`, surface a "Retry" button in the UI — do not auto-retry from
the client for long-running operations.

---

## 10. Quality Metrics Interpretation

### `feature_coverage` (0–1, higher = better)

Measures how well the sample distribution covers the covariate space (1 − mean KS
statistic across selected covariates).

| Range | Label | Action |
|-------|-------|--------|
| ≥ 0.85 | Excellent | — |
| 0.70–0.84 | Good | — |
| 0.50–0.69 | Fair | Suggest increasing `n_samples` or `clhs_iterations` |
| < 0.50 | Poor | Warn user: consider re-selecting covariates or increasing samples |

### `spatial_balance` (0–1, higher = better)

Nearest-neighbour distances normalized by expected random spacing.

| Range | Label |
|-------|-------|
| ≥ 0.75 | Good — well-distributed |
| 0.50–0.74 | Moderate — some spatial clustering |
| < 0.50 | Clustered — spatial constraint too weak for this field size |

### `clhs_objective` (lower = better)

Mean KS statistic for the final cLHS solution.

| Range | Label |
|-------|-------|
| < 0.05 | Excellent |
| 0.05–0.10 | Good |
| > 0.10 | Suggest increasing `clhs_iterations` (default 10000 → try 25000) |

### `cluster_separation` (Silhouette score, −1 to +1)

| Range | Label |
|-------|-------|
| > 0.70 | Strong clusters |
| 0.50–0.70 | Good |
| 0.30–0.50 | Fair — clusters overlap somewhat (common in smooth landscapes) |
| < 0.30 | Weak — reduce n_clusters or n_zones |

---

## 11. Clustering Method Guide

Used in both `StratifyRequest.clustering_method` and `StratifiedDesignParams.clustering_method`.

| Method | Description | `fuzziness_m` used? | Best for |
|--------|-------------|--------------------|---------| 
| `kmeans` | Hard k-means. Each pixel belongs to exactly one zone. | No | Speed, large fields, legacy compatibility |
| `fuzzy` | Fuzzy c-means with fixed m. Each pixel has a membership vector. | Yes (default 2.0) | Smooth soil transitions, enables transition oversampling |
| `fuzzy_soft` | Fuzzy c-means with higher default m (3.0). Softer, more overlapping zones. | Yes (default 3.0) | Highly heterogeneous fields where hard zones are inappropriate |
| `fuzzy_auto` | Fuzzy c-means, automatically selects best m via FPC optimization. Reports `fuzziness_m_used`. | Overridden by auto | When unsure of appropriate m; recommended for new fields |

**Recommendation for SoilStrata UI:** Default to `fuzzy_auto` for the stratify and
stratified-design workflows. It requires no user configuration and always reports
the actual m value used so the result is auditable.

---

*Source: `src/routers/sampling.py`, `src/routers/zones.py`, `docs/soilstrata/sampling-zones-integration.md`, `docs/soilstrata/sampling-design-api.md`*  
*GEE API version: commit `f4e06d3` and later*  
*Last updated: 2026-03-18*
