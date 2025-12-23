# Conservation Practices Module

A comprehensive NRCS conservation practice recommendation system integrated into the Field Analysis module.

## Overview

The Conservation Practices module provides intelligent, field-specific recommendations for USDA NRCS conservation practices based on soil conditions, erosion risks, drainage characteristics, and other field attributes.

## Components

### 1. Type Definitions (`src/types/conservationPractices.ts`)
- **ConservationPractice**: Complete practice specification including code, name, description, benefits, costs, and implementation details
- **PracticeRecommendation**: Field-specific practice recommendation with priority, cost estimates, and expected benefits
- **PracticeImplementationPlan**: Comprehensive plan with timeline, funding options, and projected outcomes

### 2. Practice Database (`src/data/conservationPractices.ts`)
Contains detailed specifications for 10 key NRCS practices:
- **329** - No-Till Farming
- **340** - Cover Crops
- **600** - Terraces
- **342** - Critical Area Planting
- **590** - Nutrient Management
- **328** - Conservation Crop Rotation
- **410** - Grade Stabilization Structures
- **484** - Mulching
- **345** - Mulch-Till
- **612** - Tree/Shrub Establishment

Each practice includes:
- Official NRCS code and name
- Detailed description and purpose
- Expected benefits (quantified where possible)
- Cost ranges
- Maintenance requirements
- Implementation steps
- Compatible practices
- Applicable soil conditions

### 3. Recommendation Engine (`src/utils/conservationRecommendations.ts`)
**ConservationRecommendationEngine** class with methods:
- `generateRecommendations()` - Analyzes field conditions and generates prioritized recommendations
- `scorePractice()` - Scores practices based on field conditions and resource concerns
- `estimateCost()` - Calculates field-specific cost estimates
- `projectOutcomes()` - Projects expected improvements (erosion reduction, soil health, etc.)
- `getFundingOptions()` - Identifies applicable NRCS funding programs (EQIP, CSP, CRP)

### 4. UI Component (`src/components/FieldAnalysis/ConservationPractices.tsx`)
Interactive display featuring:
- **Summary Cards**: Total cost, priority actions count, implementation timeline
- **Funding Options**: Expandable section showing EQIP, CSP, CRP programs with eligibility
- **Category Filtering**: Filter practices by category (tillage, erosion control, vegetation, etc.)
- **Expandable Practice Cards**: 
  - Priority badges (critical, high, medium, low)
  - Cost estimates
  - Expected benefits
  - Implementation timeline
  - Step-by-step implementation guide
  - Compatible practices
- **Projected Improvements**: Before/after comparison of key metrics

## Integration

The module is integrated into the Field Analysis dashboard at `/field-analysis/[fieldId]`:

```tsx
import ConservationPractices from '#components/FieldAnalysis/ConservationPractices'

// In dashboard
<ConservationPractices fieldData={fieldData} />
```

### Required Field Data
```typescript
{
  erosionRate?: number          // tons/acre/year
  slope?: number                // percent
  drainageClass?: string        // e.g., "Poorly drained"
  organicMatter?: number        // percent
  soilDepth?: number            // inches
  floodFrequency?: string       // e.g., "Occasional"
  landCapabilityClass?: string  // e.g., "IIIe"
  hydrologicGroup?: string      // A, B, C, or D
  acres?: number                // field size
}
```

## Recommendation Logic

### Priority Scoring
Practices are scored based on:
1. **Soil Condition Match** (3 points per match):
   - high-erosion-risk
   - poorly-drained
   - compacted
   - low-organic-matter
   - steep-slope
   - shallow-soil
   - droughty
   - flooding-prone

2. **Resource Concern Match** (2 points per match):
   - soil-erosion
   - water-quality
   - water-quantity
   - soil-quality
   - plant-health
   - air-quality
   - wildlife-habitat

### Priority Thresholds
- **Critical**: Score ≥ 8 (multiple severe conditions)
- **High**: Score 5-7 (significant concerns)
- **Medium**: Score 3-4 (moderate concerns)
- **Low**: Score < 3 (general improvement)

### Cost Estimation
Costs are estimated based on practice type and field size:
- **$/acre practices**: Cost × acres
- **$/structure practices**: Number of structures × cost (based on field size)
- **$/ft practices**: Perimeter estimate × cost

## Funding Programs

### EQIP (Environmental Quality Incentives Program)
- Coverage: Up to 75% of costs
- Maximum: $450,000 per contract
- Eligibility: Agricultural producers, forest landowners, tribal landowners
- Higher rates available for organic producers

### CSP (Conservation Stewardship Program)
- Coverage: Up to 50% of costs
- For producers with existing conservation systems
- Requires commitment to additional improvements

### CRP (Conservation Reserve Program)
- Coverage: Up to 50% of costs
- For environmentally sensitive cropland
- 10-15 year contracts
- Periodic signups through FSA

## Expected Outcomes

The module projects improvements in:
1. **Soil Erosion Rate**: Baseline vs projected tons/acre/year
2. **Soil Organic Matter**: Projected increase over 5 years
3. **Water Infiltration**: Percentage improvement
4. **Operating Costs**: Annual savings after implementation

## Usage Example

```typescript
import { ConservationRecommendationEngine } from '#utils/conservationRecommendations'

const fieldConditions = {
  erosionRate: 8.5,          // High erosion
  slope: 12,                 // Steep slope
  drainageClass: 'Well drained',
  organicMatter: 2.1,        // Low OM
  acres: 80
}

const plan = ConservationRecommendationEngine.generateRecommendations(
  fieldConditions,
  80 // acres
)

console.log(plan.practices.length)       // Number of recommended practices
console.log(plan.totalCost)              // Total estimated cost
console.log(plan.timeline)               // Implementation timeline
console.log(plan.fundingOptions.length)  // Available funding programs
console.log(plan.expectedOutcomes)       // Projected improvements
```

## Future Enhancements

1. **Additional Practices**: Expand database to include all NRCS practice standards (150+ practices)
2. **Machine Learning**: Use historical data to improve recommendation accuracy
3. **Cost-Benefit Analysis**: Detailed ROI calculations for practice combinations
4. **Implementation Tracking**: Track practice adoption and outcomes over time
5. **API Integration**: Connect to NRCS databases for real-time practice standard updates
6. **Mobile App**: Field-based practice assessment and documentation
7. **PDF Reports**: Generate practice implementation plans for NRCS submission

## Data Sources

- NRCS Conservation Practice Standards (official specifications)
- NRCS Field Office Technical Guides (state-specific applications)
- Conservation Effects Assessment Project (CEAP) data
- Soil and Water Conservation Society research

## Contact

For technical assistance with conservation practices, contact your local NRCS field office or conservation district.
