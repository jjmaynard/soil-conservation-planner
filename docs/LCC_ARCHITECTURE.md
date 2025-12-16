# Land Capability Classification (LCC) Architecture

## Overview

The Soil Mapper application implements **two separate LCC display systems** that serve different audiences and use cases:

1. **PropertyPanel & OSDPanel** - Professional, data-driven analysis for soil scientists
2. **Interpretations Tab** - Simplified, educational display for farmers and land managers

Both systems work with the same underlying SSURGO data but process and present it differently.

---

## 📋 Core LCC Scripts

### 1. Type Definitions: `src/types/lcc.ts`

**Purpose:** TypeScript interfaces for all LCC-related data structures

**Key Types:**

```typescript
// Class: Roman numerals I through VIII
export type LCCClass = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII' | 'VIII'

// Subclass modifiers (limitations)
export type LCCSubclassModifier = 'e' | 'w' | 's' | 'c'

// Complete LCC rating
export interface LCCRating {
  class: LCCClass
  subclass: string  // e.g., 'e', 'w', 'ew', 'es'
  rating_value?: number
  certainty?: string
}

// Specific limitation detail
export interface LCCLimitation {
  type: LimitationType
  severity: LimitationSeverity
  description: string
  value?: number | string
}

// Farmer-friendly descriptions
export interface LCCDescription {
  summary: string
  description: string
  management: string
  crops: string
  limitations_explanation?: string
}

// Formatted output data
export interface FormattedLCCData {
  dominant_lcc: {
    irrigated: LCCRating | null
    nonirrigated: LCCRating | null
  }
  irrigated_description: LCCDescription
  nonirrigated_description: LCCDescription
  irrigated_limitations: LCCLimitation[]
  nonirrigated_limitations: LCCLimitation[]
  components: Array<ComponentSummary>
  irrigated_management: ManagementSummary
  nonirrigated_management: ManagementSummary
}
```

**Used By:** All LCC-related components and formatters

---

### 2. Data Formatter: `src/lib/lcc-formatter.ts` ⭐

**Purpose:** Comprehensive transformation engine that converts raw SSURGO LCC data into structured, farmer-friendly information

**File Size:** 618 lines

**Architecture:** Static class with utility methods

#### Key Functions:

##### A. Parsing Functions

```typescript
// Convert "2e" or "IIe" → Roman numeral 'II'
static parseLCCClass(rating_class: string): LCCClass | null

// Extract subclass: "2e" → "e", "IIIew" → "ew"
static parseLCCSubclass(rating_class: string): string
```

**Handles Both Formats:**
- Numeric: "2e", "3w", "4"
- Roman: "IIe", "IIIw", "IV"

##### B. Description Generator

```typescript
static getClassDescription(lccClass: LCCClass, isIrrigated: boolean): LCCDescription
```

**Returns Detailed Object With:**
- `summary` - Brief classification (e.g., "Excellent cropland with irrigation")
- `description` - Full explanation of land capability
- `management` - Management practices required
- `crops` - Suitable crop types

**Example Output for Class II (Irrigated):**
```javascript
{
  summary: "Good cropland with irrigation",
  description: "High-quality agricultural land with minor limitations that reduce crop choice or require special management. Irrigation helps overcome moisture limitations.",
  management: "Conservation practices recommended. May need terracing, drainage, or specific tillage practices.",
  crops: "Most field crops and pasture. Some specialty crops may have limitations."
}
```

**Customizes for:**
- All 8 classes (I through VIII)
- Irrigated vs non-irrigated conditions
- Progressively increasing limitations

##### C. Subclass Interpreter

```typescript
static getSubclassDescriptions(subclass: string, mainClass: LCCClass): Array<SubclassDetail>
```

**Interprets Limitation Codes:**

| Code | Meaning | Example Description |
|------|---------|-------------------|
| **e** | Erosion hazard | Risk from water or wind erosion due to slope, soil erodibility, or climate |
| **w** | Wetness/drainage | Excess water from poor drainage, flooding, or high water table |
| **s** | Soil limitations | Shallow depth, stones, low moisture holding capacity, salinity |
| **c** | Climate | Temperature or lack of moisture limits crop growth |

**Example for "IIIew":**
```javascript
[
  {
    code: 'e',
    name: 'Erosion Hazard',
    description: 'Risk of erosion requiring protective measures',
    management: 'Use terracing, contour farming, or conservation tillage'
  },
  {
    code: 'w',
    name: 'Excess Water',
    description: 'Drainage or flooding issues affect plant growth',
    management: 'Install drainage, avoid wet-season operations'
  }
]
```

##### D. Limitation Identifier (AI-Driven Analysis)

```typescript
private static identifyLimitations(component: any, isIrrigated: boolean): LCCLimitation[]
```

**Analyzes Component Properties to Identify:**

**1. Erosion Limitations:**
- **Trigger:** `slope_r > 8%` or `runoff` is "very high"
- **Severity:** Based on slope percentage
  - slight: < 8%
  - moderate: 8-15%
  - severe: 15-25%
  - very_severe: > 25%

**2. Wetness Limitations:**
- **Triggers:**
  - Poor drainage class
  - Flooding frequency (frequent/occasional)
  - Ponding frequency
  - Hydric rating = "Yes"
- **Severity:** Based on frequency and duration

**3. Soil Limitations:**
- **Triggers:**
  - Restrictive layer < 100cm depth
  - Bedrock, hardpan, cemented layers
- **Severity:** Based on depth to restriction

**4. Climate Limitations:**
- **Triggers:**
  - Frost action (high/moderate)
  - Very cold/very warm temperature class
- **Severity:** Based on intensity

**Returns:** Array of `LCCLimitation` objects with type, severity, description, and quantitative values

##### E. Master Formatter Function

```typescript
static formatLCCData(components: any[]): FormattedLCCData
```

**The Main Entry Point - Processing Pipeline:**

1. **Find Dominant Component:**
   - Prioritizes major components (`majcompflag === 'Yes'`)
   - Falls back to highest percentage component

2. **Extract LCC Ratings:**
   ```typescript
   // From SSURGO fields:
   irrigated_class = parseLCCClass(component.irrcapcl)
   nonirrigated_class = parseLCCClass(component.nirrcapcl)
   ```

3. **Identify Limitations:**
   - Calls `identifyLimitations()` for irrigated conditions
   - Calls `identifyLimitations()` for non-irrigated conditions

4. **Generate Descriptions:**
   - Calls `getClassDescription()` for both conditions

5. **Create Component Summary:**
   - Lists all components with ≥5% of map unit
   - Includes name, percentage, irrigated/non-irrigated classes

6. **Generate Management Recommendations:**
   - Calls `generateManagementSummary()` for both conditions

**Returns:** Complete `FormattedLCCData` object ready for display

##### F. Management Generator

```typescript
private static generateManagementSummary(
  nonirrigated: LCCRating | null,
  irrigated: LCCRating | null,
  limitations: LCCLimitation[]
): ManagementSummary
```

**Generates Three Categories:**

**1. Suitable Crops:**
- **Classes I-II:** "All common field crops, Vegetables, Orchards, Pasture"
- **Classes III-IV:** "Hay, Pasture, Small grains, Adapted row crops"
- **Classes V-VI:** "Native pasture, Improved pasture, Forestry"
- **Classes VII-VIII:** Limited to wildlife/recreation

**2. Conservation Practices:**

Based on limitation types:

| Limitation | Cropland Practices | Grazing Land | Non-Agricultural |
|------------|-------------------|--------------|------------------|
| **Erosion** | Contour farming, Terracing, Cover crops, No-till | Managed grazing, Erosion control, Vegetation maintenance | Natural vegetation, Minimize disturbance |
| **Wetness** | Drainage, Raised beds, Timing adjustments | Restrict wet grazing, Stable routes | Wetland protection, Buffers |
| **Flooding** | Flood-tolerant crops, Insurance | Emergency plans, Floodplain restrictions | Riparian buffers, Natural storage |

**3. Key Considerations:**
- Irrigation impact notes
- Multiple limitation warnings
- Alternative land use suggestions

**Returns:**
```typescript
{
  suitable_crops: string[]
  conservation_practices: string[]
  key_considerations: string[]
}
```

---

### 3. Simple Interpretations: `src/utils/soilInterpretations.ts`

**Purpose:** Pre-written, farmer-friendly lookup tables for quick reference

**File Size:** 306 lines

**Architecture:** Export objects with static data

#### Main Export: LAND_CAPABILITY_INTERPRETATIONS

**Structure:**

```typescript
export const LAND_CAPABILITY_INTERPRETATIONS = {
  classes: {
    '1': {
      name: 'Excellent for Crops',
      description: 'Prime agricultural land with few limitations',
      farmingAdvice: 'Suitable for all common crops with standard farming practices',
      management: 'Use good farming practices to maintain soil productivity',
      recommendations: [
        'Maintain soil organic matter through crop rotation',
        'Use appropriate fertilization based on soil tests',
        'Practice integrated pest management'
      ],
      colorClass: 'emerald'
    },
    // ... classes 2-8 with similar structure
  },
  
  subclasses: {
    e: {
      name: 'Erosion Risk',
      description: 'Main limitation is susceptibility to erosion',
      management: 'Use erosion control practices...',
      recommendations: [...]
    },
    w: { /* Wetness */ },
    s: { /* Soil Limitations */ },
    c: { /* Climate */ }
  }
}
```

**Key Characteristics:**
- ✅ Simple, direct lookup
- ✅ Pre-written, consistent messaging
- ✅ Fast to access
- ❌ No dynamic analysis
- ❌ No irrigation differentiation
- ❌ No component-specific adaptation

#### Helper Functions:

```typescript
// Get color hex code for class badge
export function getCapabilityColor(classNum: string): string

// Get color for hydrologic group
export function getHydrologyColor(group: string): string

// Get color for drainage class
export function getDrainageColor(drainageClass: string): string
```

**Used By:** `SoilInterpretationsComponent` only

---

## 🎨 Display Components

### 4. OSDPanel LCC Section: `src/components/ui/OSDPanel.tsx`

**Location:** Lines 437-850
**Tab:** "Series Info" → Collapsible "Land Capability Classification" section

#### Component: `LCCContent`

**Data Pipeline:**
```typescript
const lccData = LCCFormatter.formatLCCData(components)
```
Uses **comprehensive `lcc-formatter.ts`**

**UI Structure:**

```
┌─────────────────────────────────────────────┐
│ LCC Content                                 │
├─────────────────────────────────────────────┤
│ [Toggle: Dryland | Irrigated]              │  ← If both available
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ [IIIe Badge] Class III (Dryland)        │ │  ← Colored badge
│ │ Good cropland without irrigation        │ │  ← Summary
│ │                                         │ │
│ │ Fair agricultural land requiring...     │ │  ← Description
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ Limitation Details                          │
│ ┌─────────────────────────────────────────┐ │
│ │ e: Erosion Hazard     [Moderate]        │ │
│ │ ████████░░░░░░░░░░░ 50%                 │ │  ← Severity bar
│ │ Slope: 12%                              │ │  ← Property value
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ w: Excess Water       [Slight]          │ │
│ │ ████░░░░░░░░░░░░░░░░ 25%                │ │
│ │ Drainage: Somewhat poorly drained       │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ Management Recommendations                  │
│                                             │
│ Suitable Crops: [Hay] [Pasture] [Grains]   │  ← Badges
│                                             │
│ Conservation Practices:                     │
│ • Contour farming                          │  ← Bullets
│ • Terracing                                │
│ • Cover crops                              │
│                                             │
│ Key Considerations:                         │
│ • Multiple limitations require careful...   │
└─────────────────────────────────────────────┘
```

**Features:**

1. **Toggle Switch** (Dryland/Irrigated)
   - Only shows if both datasets available
   - Switches entire view between conditions

2. **Class Badge Display**
   - Large colored badge (IIIe format)
   - Color-coded by class severity (green→yellow→red)
   - Shows class name and condition

3. **Description Block**
   - Summary from `LCCFormatter.getClassDescription()`
   - Full description text
   - Embedded subclass modifier descriptions

4. **Limitation Details**
   - Visual severity bars (0-100% width)
   - Color-coded: green (slight) → red (very severe)
   - Grouped by type (e, w, s, c)
   - Shows property values (slope %, drainage class, etc.)
   - Expandable details per limitation

5. **Management Recommendations**
   - Combined guidance from class + subclass
   - Suitable crops displayed as colored badges
   - Conservation practices as bullet list
   - Key considerations as bullet list

6. **Component Breakdown** (at bottom)
   - All components listed with percentages
   - Each shows its own LCC class
   - Quick visual scan of map unit composition

**Styling Approach:**
```typescript
// Inline styles with helper function
const getClassColors = (lccClass: string): { bg: string; text: string; border: string }

// Color mapping
'I': { bg: '#dcfce7', text: '#166534', border: '#86efac' }    // green
'III': { bg: '#fef9c3', text: '#854d0e', border: '#fde047' }  // yellow
'V': { bg: '#ffedd5', text: '#9a3412', border: '#fed7aa' }    // orange
'VII': { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' }  // red
```

**When Displayed:**
- Inside each component's `<details>` section
- Below OSD descriptive narrative
- Only renders if LCC data exists

---

### 5. PropertyPanel LCC Summary: `src/components/ui/PropertyPanel.tsx`

**Location:** Lines 1483-1600
**Tab:** Main "Details" section (not in tabs)

#### Inline LCC Component List

**Data Pipeline:**
```typescript
const lccData = LCCFormatter.formatLCCData(ssurgoData.components)
```
Uses **same `lcc-formatter.ts`** as OSDPanel

**UI Structure:**

```
┌─────────────────────────────────────────────┐
│ ▶ Land Capability Classification           │  ← Collapsible header
├─────────────────────────────────────────────┤
│ [Toggle: Dryland | Irrigated]              │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ [II] Svea       65%  Good for Crops     │ │  ← Component row
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ [III] Cordova   25%  Moderate Limits    │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ [IV] Canisteo   10%  Severe Limits      │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Features:**
1. Compact list view
2. Each component shows: badge + name + % + class name
3. Toggle between irrigated/dryland
4. Quick visual scan capability

**Purpose:**
- Quick overview of LCC for entire map unit
- Accessible without expanding tabs
- Professional summary display

**Styling:**
```typescript
// Helper function for consistent colors
const getLCCClassColors = (lccClass: string) => {
  // Returns bg, text, border colors
}
```

---

### 6. Interpretations Tab: `src/components/ui/SoilInterpretationsComponent.tsx` ⭐

**Location:** Entire file (530 lines)
**Tab:** "Interpretations" tab (third tab in PropertyPanel)

#### Component: `SoilInterpretationsComponent`

**Purpose:** Comprehensive, educational, farmer-friendly component interpretations

**Data Pipeline:**
```typescript
// DIRECT extraction from component properties
const nirrcapcl = component.nirrcapcl
const nirrcapscl = component.nirrcapscl
const nirrcapunit = component.nirrcapunit
const irrcapcl = component.irrcapcl
const irrcapscl = component.irrcapscl
const irrcapunit = component.irrcapunit

// Parse to numeric class
const nonIrrigatedClass = nirrcapcl?.toString().match(/\d/)?.[0]

// LOOKUP in simple interpretation table
const classInfo = LAND_CAPABILITY_INTERPRETATIONS.classes[nonIrrigatedClass]
```

Uses **`soilInterpretations.ts`** (NOT `lcc-formatter.ts`)

**UI Structure:**

```
┌──────────────────────────────────────────────────────┐
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ Svea                            65%  [Major]    ┃ │  ← Component header
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
├──────────────────────────────────────────────────────┤
│ ▼ Land Capability Classification                    │  ← Expandable
├──────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────┐  │
│ │ ┌────┐  Non-Irrigated Land Capability         │  │
│ │ │    │  Good for Crops                        │  │
│ │ │ 2e │  Unit: Svea loam, 2 to 6% slopes       │  │  ← Large badge
│ │ │    │                                         │  │     + unit name
│ │ └────┘                                         │  │
│ │                                                 │  │
│ │ Description: Good agricultural land with       │  │
│ │ minor limitations                              │  │
│ │                                                 │  │
│ │ Farming Advice: Suitable for most crops...    │  │
│ │                                                 │  │
│ │ Management: Apply conservation practices...    │  │
│ │                                                 │  │
│ │ ┌──────────────────────────────────────────┐  │  │
│ │ │ ⚠ Erosion Risk                          │  │  │  ← Subclass 'e'
│ │ │ Main limitation is susceptibility to     │  │  │    limitation
│ │ │ erosion                                  │  │  │    (amber box)
│ │ │                                          │  │  │
│ │ │ Management: Use erosion control...      │  │  │
│ │ └──────────────────────────────────────────┘  │  │
│ │                                                 │  │
│ │ ┌──────────────────────────────────────────┐  │  │
│ │ │ ✓ Recommended Practices                 │  │  │  ← Green box
│ │ │ • Use conservation tillage               │  │  │
│ │ │ • Implement crop rotation                │  │  │
│ │ │ • Monitor for erosion on slopes          │  │  │
│ │ └──────────────────────────────────────────┘  │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ ┌────────────────────────────────────────────────┐  │
│ │ Irrigated card (if different)                  │  │  ← Separate card
│ │ Same structure as above                        │  │     if needed
│ └────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────┤
│ ▶ Hydrology                                         │  ← Other sections
│ ▶ Productivity                                      │
│ ▶ Conservation                                      │
└──────────────────────────────────────────────────────┘
```

**Features:**

1. **Component Header**
   - Colored border matching component
   - Name + percentage
   - "Major Component" badge if applicable

2. **Land Capability Section** (expandable)
   - Wheat icon indicator
   - Chevron for expand/collapse

3. **Non-Irrigated Card**
   - **Large circular class badge**
     - `text-3xl` for class number (e.g., "2")
     - `text-lg` for subclass letter (e.g., "e")
     - Bottom-aligned with `items-baseline`
   - **Class name** from lookup table
   - **Unit field** (nirrcapunit) - newly added
     - Format: "Unit: Svea loam, 2 to 6% slopes"
   - **Description** - from lookup table
   - **Farming Advice** - practical guidance
   - **Management** - required practices

4. **Subclass Limitation Boxes** (one per subclass letter)
   - Amber background (`bg-amber-50`)
   - Warning triangle icon
   - Name (e.g., "Erosion Risk")
   - Description of limitation
   - Management advice for this specific limitation

5. **Recommended Practices Box**
   - Green background (`bg-green-50`)
   - Checkmark icon
   - Bulleted list of practices from lookup table

6. **Irrigated Card** (conditional)
   - Only shows if irrigated class differs from non-irrigated
   - Same structure as non-irrigated
   - Shows irrcapunit field

7. **Additional Sections**
   - Hydrology (hydrologic group, drainage, hydric rating)
   - Productivity (crop index, range production)
   - Conservation (erosion class, T-factor, wind erosion)

**Styling Approach:**
- Large, friendly typography
- Generous spacing
- Color-coded sections (green, amber, blue, orange)
- Expandable accordion sections
- Card-based layout on gray background
- Icons from Lucide React

**When Displayed:**
- "Interpretations" tab selected
- One complete component display per component
- Stacked vertically if multiple components
- Each component in its own colored card

---

## 📊 Comparison Matrix

### OSDPanel LCC vs Interpretations Tab

| Feature | **OSDPanel LCC** | **Interpretations Tab** |
|---------|------------------|-------------------------|
| **Data Processing** | `LCCFormatter.formatLCCData()` | Direct component field extraction |
| **Description Source** | Dynamic from `lcc-formatter.ts` | Static from `soilInterpretations.ts` |
| **Limitation Analysis** | AI-driven from soil properties | Only subclass-based lookup |
| **Irrigated/Dryland Display** | Toggle switch between modes | Separate cards shown simultaneously |
| **Management Recommendations** | Generated based on actual limitations | Pre-written generic recommendations |
| **Visual Style** | Compact, professional, data-dense | Large, friendly, educational |
| **Severity Visualization** | Color-coded bars with percentages | Text descriptions only |
| **Component Breakdown** | Summary list of all components | Individual full display per component |
| **Unit Field Display** | Not shown | Shown (nirrcapunit/irrcapunit) |
| **Quantitative Values** | Slope %, depths, drainage classes | Not shown |
| **Best For** | Soil scientists, detailed analysis | Farmers, land managers, education |
| **Complexity** | High - analyzes multiple factors | Low - simple lookup |
| **Adaptation** | Context-specific to actual soil | Generic to class number |
| **File Size** | Part of 1913-line OSDPanel | 530-line dedicated component |

---

## 🔄 Data Flow Diagrams

### A. OSDPanel Data Flow

```
SSURGO Database (SQL Query)
    ↓
SoilMap.tsx - Query Execution
    ↓ (rows 393-398: SQL SELECT)
    c.nirrcapcl, c.nirrcapscl, c.nirrcapunit,
    c.irrcapcl, c.irrcapscl, c.irrcapunit
    ↓
SoilMap.tsx - Data Parsing
    ↓ (rows 551-556: Array indexing)
    component.nirrcapcl = row[12]
    component.nirrcapscl = row[13]
    component.nirrcapunit = row[14]
    component.irrcapcl = row[15]
    component.irrcapscl = row[16]
    component.irrcapunit = row[17]
    ↓
PropertyPanel - Passes to OSDPanel
    ↓ (prop: components={[comp]})
OSDPanel - LCCContent Component
    ↓
LCCFormatter.formatLCCData(components)
    ↓ (Advanced processing)
    ├─ Find dominant component
    ├─ Parse LCC classes (numeric/Roman)
    ├─ Identify limitations from properties
    │  ├─ Slope → erosion severity
    │  ├─ Drainage → wetness severity
    │  ├─ Restrictions → soil severity
    │  └─ Climate → climate severity
    ├─ Generate descriptions (class-specific)
    ├─ Generate management (limitation-based)
    └─ Create component summary
    ↓
FormattedLCCData object
    ↓
OSDPanel Renders:
    ├─ Toggle (irrigated/dryland)
    ├─ Class badge with colors
    ├─ Description text
    ├─ Limitation severity bars
    ├─ Management recommendations
    └─ Component breakdown
```

### B. Interpretations Tab Data Flow

```
SSURGO Database (SQL Query)
    ↓
SoilMap.tsx - Query Execution
    ↓ (same SQL as above)
SoilMap.tsx - Data Parsing
    ↓ (same parsing as above)
PropertyPanel - Passes to Interpretations Tab
    ↓ (activeTab === 'interpretations')
PropertyPanel renders SoilInterpretationsComponent
    ↓ (prop: component={comp})
SoilInterpretationsComponent
    ↓
Direct Field Extraction:
    ├─ nirrcapcl = component.nirrcapcl
    ├─ nirrcapscl = component.nirrcapscl
    ├─ nirrcapunit = component.nirrcapunit
    ├─ irrcapcl = component.irrcapcl
    ├─ irrcapscl = component.irrcapscl
    └─ irrcapunit = component.irrcapunit
    ↓
Parse to numeric class:
    nonIrrigatedClass = nirrcapcl.match(/\d/)?.[0]
    ↓
Simple Lookup:
    LAND_CAPABILITY_INTERPRETATIONS.classes[nonIrrigatedClass]
    ↓ (Pre-written static content)
    {
      name: 'Good for Crops',
      description: '...',
      farmingAdvice: '...',
      management: '...',
      recommendations: [...]
    }
    ↓
For Each Subclass Letter:
    LAND_CAPABILITY_INTERPRETATIONS.subclasses['e']
    ↓
Renders:
    ├─ Component header with border
    ├─ Large circular class badge (2e)
    ├─ Unit name field
    ├─ Lookup descriptions
    ├─ Amber subclass boxes (per letter)
    └─ Green practices box
```

---

## 🎯 Usage Guidelines

### When to Use OSDPanel LCC

**Use Cases:**
- ✅ Professional soil survey analysis
- ✅ Need quantitative limitation values
- ✅ Comparing irrigated vs dryland side-by-side
- ✅ Want AI-driven limitation analysis
- ✅ Need component-level breakdown
- ✅ Preparing technical reports

**Advantages:**
- Adapts to actual soil properties
- Shows severity levels numerically
- Generates context-specific management
- Compact for quick scanning
- Shows all components at once

**Audience:** Soil scientists, agronomists, consultants

### When to Use Interpretations Tab

**Use Cases:**
- ✅ Farmer education and outreach
- ✅ Land management planning
- ✅ Teaching soil capability concepts
- ✅ Need simple, clear explanations
- ✅ Want to see LCC unit names
- ✅ Prefer separate irrigated/dryland displays

**Advantages:**
- Easy to understand language
- Large, readable layout
- Pre-written consistent messaging
- Shows unit field (detailed location info)
- Visual hierarchy guides reading
- Step-by-step limitation breakdown

**Audience:** Farmers, land managers, extension agents, students

---

## 🛠️ Technical Implementation Details

### Data Source (Both Systems)

**SQL Query in `SoilMap.tsx` (lines 393-398):**
```sql
SELECT 
  ...,
  c.nirrcapcl,     -- Non-irrigated class (e.g., "2e", "IIe")
  c.nirrcapscl,    -- Non-irrigated subclass (e.g., "e", "ew")
  c.nirrcapunit,   -- Non-irrigated unit name (descriptive text)
  c.irrcapcl,      -- Irrigated class
  c.irrcapscl,     -- Irrigated subclass
  c.irrcapunit,    -- Irrigated unit name
  ...
FROM component c
```

**Data Parsing (lines 551-556):**
```typescript
componentsMap.set(cokey, {
  nirrcapcl: row[12],
  nirrcapscl: row[13],
  nirrcapunit: row[14],  // Recently added
  irrcapcl: row[15],
  irrcapscl: row[16],
  irrcapunit: row[17],   // Recently added
  // ... other fields
})
```

### Type Definitions Location

**File:** `src/types/soil.ts` (lines 78-85)
```typescript
export interface SSURGOComponent {
  // ... other fields
  
  // Land Capability Classification
  nirrcapcl?: string
  nirrcapscl?: string
  nirrcapunit?: string
  irrcapcl?: string
  irrcapscl?: string
  irrcapunit?: string
  
  // ... more fields
}
```

### Color Schemes

**Class Colors (Severity Gradient):**
```typescript
'I'   → '#10b981'  // Emerald (excellent)
'II'  → '#22c55e'  // Green (good)
'III' → '#eab308'  // Yellow (moderate)
'IV'  → '#f97316'  // Orange (limited)
'V'   → '#ef4444'  // Red (not suitable)
'VI'  → '#dc2626'  // Red-600 (very limited)
'VII' → '#b91c1c'  // Red-700 (severely limited)
'VIII'→ '#6b7280'  // Gray (wildlife/recreation)
```

**Severity Colors:**
```typescript
'slight'      → '#22c55e'  // Green
'moderate'    → '#eab308'  // Yellow
'severe'      → '#f97316'  // Orange
'very_severe' → '#ef4444'  // Red
```

---

## 📝 Best Practices

### For Developers

1. **Adding New LCC Features:**
   - Update `types/lcc.ts` first
   - Add processing logic to `lcc-formatter.ts`
   - Update both display components
   - Test with various soil types

2. **Modifying Descriptions:**
   - **Professional Display:** Edit `lcc-formatter.ts` → `getClassDescription()`
   - **Farmer Display:** Edit `soilInterpretations.ts` → `LAND_CAPABILITY_INTERPRETATIONS`

3. **Adding New Limitation Types:**
   - Add to `types/lcc.ts` → `LimitationType`
   - Implement detection in `lcc-formatter.ts` → `identifyLimitations()`
   - Add color mapping in both display components

4. **Testing:**
   - Test with both irrigated and non-irrigated data
   - Test with missing data (null handling)
   - Test with extreme values (high slopes, poor drainage)
   - Test with multiple subclass modifiers ("ews", "ewc")

### For Content Editors

1. **Updating Class Descriptions:**
   - Edit `soilInterpretations.ts` for simple changes
   - Edit `lcc-formatter.ts` for comprehensive changes
   - Keep language consistent between both

2. **Adding Regional Variations:**
   - Consider creating regional versions of `soilInterpretations.ts`
   - Use configuration to switch between versions

3. **Translating Content:**
   - Both systems use string-based descriptions
   - Translations can be implemented via i18n
   - Maintain separate files per language

---

## 🔮 Future Enhancements

### Potential Improvements

1. **Unified System:**
   - Merge best features of both approaches
   - Single formatter with multiple output modes
   - Reduce code duplication

2. **Machine Learning Integration:**
   - Train models on historical yield data
   - Predict crop suitability scores
   - Customize recommendations per region

3. **Interactive Elements:**
   - Click limitation to see detailed explanation
   - Hover for quick tooltips
   - Expand/collapse management practices

4. **Comparison Tools:**
   - Side-by-side component comparison
   - Before/after improvement scenarios
   - Cost-benefit analysis for practices

5. **Export Capabilities:**
   - PDF report generation
   - Excel data export
   - Share via email/text

---

## 📚 Related Documentation

- **SSURGO LCC Framework:** `Property_Panel_Guide/LCC/ssurgo_lcc_framework.md`
- **OSD Integration:** `docs/OSD_INTEGRATION.md`
- **Property Panel Guide:** `Property_Panel_Guide/`
- **Type Definitions:** `src/types/lcc.ts`, `src/types/soil.ts`

---

## 📞 Maintenance Contacts

**Code Owners:**
- LCC Formatter Logic: Core development team
- Interpretation Content: Extension specialists
- UI Components: Frontend development team

**Subject Matter Experts:**
- NRCS Soil Scientists for accuracy
- Extension agents for farmer-friendly language
- Agronomists for management practices

---

*Last Updated: December 12, 2025*
*Document Version: 1.0*
*Application: Soil Conservation Planner / Soil Mapper*
