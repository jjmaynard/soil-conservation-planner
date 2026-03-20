# SoilStrata Sampling Integration - Agent Handoff

Audience: App integration agent for the SoilStrata Next.js application.
API base: https://gee-api-production.up.railway.app
Env var: GEE_API_URL
Last updated: 2026-03-19

## 1) Scope (What Changed)

Use this handoff to implement client compatibility for the current API contract:

- Composite-first recommendation logic in:
  - POST /api/sampling/optimalK
  - POST /api/zones/optimize
  - POST /api/sampling/design-prep
- Additive response fields (no removals) for consensus/composite/stability diagnostics.
- New async design-prep endpoints:
  - POST /api/sampling/design-prep/async
  - GET /api/sampling/design-prep/jobs/{job_id}

## 2) Required Next.js Proxy Routes

Create or update these route handlers:

- src/app/api/sampling/design/route.ts
- src/app/api/sampling/design-prep/route.ts
- src/app/api/sampling/design-prep/async/route.ts
- src/app/api/sampling/design-prep/jobs/[jobId]/route.ts
- src/app/api/zones/optimize/route.ts
- src/app/api/zones/delineate/route.ts

### 2.1 src/app/api/sampling/design-prep/async/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

const API_BASE = process.env.GEE_API_URL ?? 'https://gee-api-production.up.railway.app';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json();
  const upstream = await fetch(`${API_BASE}/api/sampling/design-prep/async`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });
  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
```

### 2.2 src/app/api/sampling/design-prep/jobs/[jobId]/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

const API_BASE = process.env.GEE_API_URL ?? 'https://gee-api-production.up.railway.app';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
): Promise<NextResponse> {
  const { jobId } = await params;
  const upstream = await fetch(`${API_BASE}/api/sampling/design-prep/jobs/${jobId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(30_000),
  });
  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
```

## 3) TypeScript Contracts To Implement

### 3.1 optimalK response additions

```typescript
interface OptimalKResponse {
  optimal_k: number;
  consensus_k?: number | null;
  optimal_k_by_method: {
    silhouette: number;
    fpc: number;
    bic: number;
    davies_bouldin: number;
    calinski_harabasz: number;
  };
  consensus_votes: number;
  total_methods: number;
  agreement_level: 'strong' | 'partial' | 'weak';
  composite_scores?: Array<{
    k: number;
    composite_score: number;
    components: Record<string, number>;
    stability_penalty_applied: boolean;
  }> | null;
  optimal_k_data: OptimalKDataPoint[];
  recommendations: OptimalKRecommendation[];
  warnings: string[];
  wkt: string;
}
```

### 3.2 zones optimize response additions

```typescript
interface ZoneOptimizationResponse {
  recommended_k: number;
  statistical_optimal_k: number;
  consensus_k?: number | null;
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
  composite_scores?: Array<{
    k: number;
    composite_score: number;
    components: Record<string, number>;
    stability_penalty_applied: boolean;
  }> | null;
  warnings: string[];
  wkt: string;
}
```

### 3.3 design-prep request/response additions

```typescript
interface DesignPrepRequest {
  wkt: string;
  covariates?: Covariate[];
  year: number;
  k_min?: number;
  k_max?: number;
  n_start?: number;
  field_area_ha?: number;
  max_zones?: number;
  min_zone_area_ha?: number;
  target_relative_error?: number;
  allocation_method?: 'neyman_multivariate' | 'proportional' | 'equal';
  stability_config?: {
    run_stability?: boolean;
    n_bootstrap?: number;
    subsample_ratio?: number;
    stability_threshold?: number;
    composite_weights?: Record<string, number> | null;
  };
}

interface DesignPrepResponse {
  optimal_k_data: OptimalKDataPoint[];
  statistical_optimal_k: number;
  recommended_k: number;
  practical_constraints_applied: boolean;
  reason: string;
  alternatives: ZoneAlternative[];
  zone_variability: DesignPrepZoneVariability[];
  total_suggested_samples: number;
  suggested_n_basis: DesignPrepSuggestedNBasis;
  allocation_method: 'neyman_multivariate' | 'proportional' | 'equal';

  consensus_k?: number | null;
  composite_optimal_k?: number | null;
  stability_optimal_k?: number | null;
  stability_results?: Array<{
    k: number;
    mean_ari: number;
    std_ari: number;
    mean_jaccard: number;
    std_jaccard: number;
    per_cluster_jaccard: number[];
    stability_class: 'stable' | 'marginal' | 'unstable';
    n_bootstrap: number;
    subsample_ratio: number;
  }> | null;
  composite_scores?: Array<{
    k: number;
    composite_score: number;
    components: Record<string, number>;
    stability_penalty_applied: boolean;
  }> | null;
  stability_config_used?: {
    run_stability: boolean;
    n_bootstrap: number;
    subsample_ratio: number;
    stability_threshold: number;
    composite_weights: Record<string, number> | null;
  } | null;

  warnings: string[];
  wkt: string;
}
```

### 3.4 async design-prep models

```typescript
interface AsyncJobAcceptedResponse {
  job_id: string;
  status: 'pending';
  poll_url: string;
}

interface DesignPrepJobStatusResponse {
  job_id: string;
  status: 'pending' | 'running' | 'succeeded' | 'failed';
  created_at: string;
  updated_at: string;
  result: DesignPrepResponse | null;
  error: string | null;
}
```

## 4) API Client Methods

Update src/lib/api/sampling.ts with:

```typescript
import type {
  SamplingDesignRequest,
  SamplingDesignResponse,
  DesignPrepRequest,
  DesignPrepResponse,
  AsyncJobAcceptedResponse,
  DesignPrepJobStatusResponse,
} from '@/lib/types/sampling';

const get = async <TRes>(path: string): Promise<TRes> => {
  const res = await fetch(path, { method: 'GET' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail));
  }
  return res.json() as Promise<TRes>;
};

export const samplingApi = {
  design: (req: SamplingDesignRequest) =>
    post<SamplingDesignRequest, SamplingDesignResponse>('/api/sampling/design', req),

  designPrep: (req: DesignPrepRequest) =>
    post<DesignPrepRequest, DesignPrepResponse>('/api/sampling/design-prep', req),

  designPrepAsync: (req: DesignPrepRequest) =>
    post<DesignPrepRequest, AsyncJobAcceptedResponse>('/api/sampling/design-prep/async', req),

  getDesignPrepJob: (jobId: string) =>
    get<DesignPrepJobStatusResponse>(`/api/sampling/design-prep/jobs/${jobId}`),
};
```

## 5) UI Behavior Requirements

- Keep existing sync flows working; all new fields are additive.
- Treat recommended_k and optimal_k as primary recommendation outputs.
- Treat consensus_k as diagnostic-only.
- If using strict schema validation, allow additive fields.
- For async design-prep:
  - Queue via designPrepAsync.
  - Poll getDesignPrepJob every 1-2 seconds.
  - Stop polling on succeeded or failed.
  - Surface failed error text in UI.

Expected async transitions:
- pending -> running -> succeeded
- pending -> running -> failed

## 6) End-to-End Verification Checklist

- optimalK returns optimal_k and optional consensus_k/composite_scores.
- zones optimize returns recommended_k and optional consensus_k/composite_scores.
- design-prep sync returns total_suggested_samples and recommended_k plus additive diagnostics.
- design-prep async queue returns job_id and poll_url.
- poll endpoint returns pending/running/succeeded/failed and final result payload.
- existing stratify/design/zones-delineate UI still renders with no regression.

## 7) Backward Compatibility Summary

- No existing endpoint was removed.
- Existing key fields remain present.
- Most changes are additive fields plus recommendation behavior updates.
- Risk area is strict frontend parsing that rejects unknown response properties.
