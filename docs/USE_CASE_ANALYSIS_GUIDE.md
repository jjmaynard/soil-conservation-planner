# Use Case-Based Field Analysis Guide

## Overview

The field analysis tool now supports **targeted use case workflows** to streamline the analysis process and show only relevant information based on user goals.

## Available Use Cases

### 1. Erosion & Conservation Planning
**Best for:** Farmers, conservation planners, NRCS technicians addressing soil loss

**Includes:**
- Erosion Risk Analysis
- Soil Vulnerability Index (SVI)
- Concentrated Flow Analysis  
- Resource Concerns
- Conservation Practices

**Estimated Time:** 2-3 minutes

**Use When:**
- Planning conservation practice implementation
- Addressing NRCS compliance requirements for erosion
- Identifying high-risk areas for soil loss
- Selecting appropriate conservation practices

---

### 2. Production Optimization
**Best for:** Farmers focused on yield maximization and input efficiency

**Includes:**
- Soil Composition
- Productivity Analysis
- Management Zones
- Drainage Assessment

**Estimated Time:** 2-3 minutes

**Use When:**
- Planning variable rate applications
- Creating management zones
- Optimizing fertilizer and seed inputs
- Understanding soil productivity potential

---

### 3. Water Management
**Best for:** Fields with drainage issues, drought concerns, or irrigation planning

**Includes:**
- Drainage Assessment
- Drought Risk Analysis
- Concentrated Flow Analysis

**Estimated Time:** 1-2 minutes

**Use When:**
- Installing or evaluating tile drainage systems
- Assessing water holding capacity
- Planning irrigation systems
- Identifying areas prone to ponding or runoff

---

### 4. Compliance & Documentation
**Best for:** NRCS compliance, conservation program enrollment, environmental reporting

**Includes:**
- Resource Concerns
- Conservation Practices
- Erosion Risk
- Drainage

**Estimated Time:** 2-3 minutes

**Use When:**
- Completing NRCS Form 026 (conservation plan)
- Enrolling in CSP, EQIP, or other conservation programs
- Documenting resource concerns for compliance
- Generating conservation practice recommendations

---

### 5. Full Comprehensive Analysis
**Best for:** Complete field assessment, baseline establishment, detailed planning

**Includes:** All 10 analysis tabs
- Soil Composition
- Erosion Risk
- Drainage
- Productivity
- Soil Vulnerability (SVI)
- Concentrated Flow
- Drought Risk
- Resource Concerns
- Conservation Practices
- Management Zones

**Estimated Time:** 4-5 minutes

**Use When:**
- First-time field analysis
- Comprehensive baseline assessment
- Detailed conservation planning
- Multi-objective management decisions

---

## Implementation

### Step 1: Add Use Case Selection to Field Analysis Flow

```tsx
import { useState } from 'react'
import UseCaseSelector, { UseCase } from '#components/FieldAnalysis/UseCaseSelector'

export default function FieldAnalysisPage() {
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null)
  
  return (
    <>
      {!selectedUseCase && (
        <UseCaseSelector 
          selectedUseCase={selectedUseCase}
          onSelect={setSelectedUseCase}
        />
      )}
      
      {selectedUseCase && (
        <FieldSelectionInterface useCase={selectedUseCase} />
      )}
    </>
  )
}
```

### Step 2: Filter Tabs in DetailView

```tsx
import { useFilteredTabs, getDefaultTab } from '#hooks/useFilteredTabs'

export default function DetailView({ useCase, ... }: DetailViewProps) {
  const allTabs = [/* your 10 tabs */]
  const filteredTabs = useFilteredTabs(allTabs, useCase)
  const [selectedTab, setSelectedTab] = useState(getDefaultTab(useCase))
  
  return (
    <div>
      {/* Only render tabs included in the use case */}
      {filteredTabs.map(tab => (
        <TabButton key={tab.id} {...tab} />
      ))}
    </div>
  )
}
```

### Step 3: Store Use Case in Session/State

```tsx
// When field is selected
const handleFieldSelected = (fieldData: any) => {
  // Store use case with field data
  sessionStorage.setItem('analysisUseCase', selectedUseCase)
  
  router.push(`/field-analysis/${fieldId}?useCase=${selectedUseCase}`)
}
```

## User Experience Flow

1. **Landing Page**: User arrives at field analysis tool
2. **Use Case Selection**: Presented with 5 use case options
3. **Field Selection**: After selecting use case, proceed to field selection (browse/draw/upload)
4. **Targeted Analysis**: Only relevant tabs shown based on use case
5. **Option to Expand**: Button to "View All Analyses" if user wants comprehensive view

## Benefits

✅ **Faster workflows** - Users see only what they need  
✅ **Reduced complexity** - Less overwhelming for new users  
✅ **Guided experience** - Clear purpose for each analysis  
✅ **Time estimates** - Users know what to expect  
✅ **Flexibility** - Can still access full suite if needed  

## Optional Enhancements

### Allow Use Case Change Mid-Analysis
```tsx
<button onClick={() => setShowUseCaseSelector(true)}>
  Change Analysis Focus
</button>
```

### Progressive Disclosure
```tsx
{useCase !== 'comprehensive' && (
  <button onClick={() => setUseCase('comprehensive')}>
    + View All Analyses ({remainingTabs.length} more)
  </button>
)}
```

### Use Case Recommendations
```tsx
// Based on field characteristics, suggest use case
if (erosionRisk === 'High') {
  suggestUseCase('erosion')
} else if (drainageClass === 'Poorly drained') {
  suggestUseCase('water')
}
```

## Configuration

Edit `UseCaseSelector.tsx` to modify:
- Use case titles and descriptions
- Tab mappings
- Icons and colors
- Estimated times

Edit `useFilteredTabs.ts` to adjust which tabs appear in each use case.
