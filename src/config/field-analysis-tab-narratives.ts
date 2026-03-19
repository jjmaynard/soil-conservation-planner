// Field Analysis tab narratives
// Structured copy to communicate interpretation and decision-support value for end users.

export type FieldAnalysisTabId =
  | 'soil'
  | 'erosion'
  | 'drainage'
  | 'productivity'
  | 'svi'
  | 'flow'
  | 'drought'
  | 'vegetation'
  | 'terrain'
  | 'climate'
  | 'concerns'
  | 'practices'
  | 'zones';

export interface TabNarrative {
  whatThisShows: string;
  howToInterpret: string;
  decisionSupportValue: string;
  practicalExample: string;
  properties: {
    name: string;
    expectedRange: string;
    meaning: string;
    interpretation: string;
  }[];
  synthesisGuide: string[];
  decisionRules: {
    condition: string;
    action: string;
  }[];
}

export const TAB_NARRATIVES: Record<FieldAnalysisTabId, TabNarrative> = {
  soil: {
    whatThisShows:
      'A spatial summary of soil map units and core properties such as texture, organic matter, depth, hydrologic group, and drainage class from SSURGO.',
    howToInterpret:
      'Use this as the baseline condition layer. Contrast dominant components with minor components to understand where constraints are likely to appear first.',
    decisionSupportValue:
      'Helps farmers, land managers, and consultants choose realistic crop plans, tillage intensity, and amendment priorities by soil capability instead of whole-field averages.',
    practicalExample:
      'A producer planning corn after soybean sees shallow, lower-organic-matter inclusions in one corner and shifts that area to a lower-risk crop while targeting manure or compost to improve resilience.',
    properties: [
      { name: 'Component Percent', expectedRange: '0-100% (sum near 100)', meaning: 'Share of field represented by each mapped soil component.', interpretation: 'Dominant components drive whole-field behavior; minor components often explain localized failures.' },
      { name: 'Slope', expectedRange: '0-30%+ depending landscape', meaning: 'Steepness affecting runoff, trafficability, and erosion potential.', interpretation: 'Rising slope increases erosion and machinery limitations, especially on finer textures.' },
      { name: 'Hydrologic Group', expectedRange: 'A-D', meaning: 'Runoff potential class used in water and drainage planning.', interpretation: 'A/B generally infiltrate better; C/D indicate higher runoff and greater need for water-control planning.' },
      { name: 'Drainage Class', expectedRange: 'Excessive to Very Poorly Drained', meaning: 'Natural soil wetness and internal drainage behavior.', interpretation: 'Poorly drained classes signal delayed planting, compaction risk, and periodic root stress.' },
      { name: 'Land Capability Class', expectedRange: 'I-VIII', meaning: 'Broad capability and limitation framework for agricultural use.', interpretation: 'Higher class numbers indicate stronger management constraints and lower flexibility.' }
    ],
    synthesisGuide: [
      'Start with dominant components, then map where minor components overlap with operational problem areas.',
      'Cross-check slope + drainage class to identify where water and traffic risks will co-occur.',
      'Use capability class to set realistic expectations before selecting crops or intensive practices.'
    ],
    decisionRules: [
      { condition: 'High slope combined with finer textures or poor drainage', action: 'Prioritize reduced disturbance and cover-focused erosion control.' },
      { condition: 'Large poorly drained footprint', action: 'Adjust planting/traffic timing and evaluate drainage interventions.' },
      { condition: 'Meaningful minor-component contrasts (>10-15% area)', action: 'Manage as separate sub-zones instead of one uniform prescription.' }
    ]
  },
  erosion: {
    whatThisShows:
      'Estimated erosion risk and soil loss patterns by combining terrain, slope, and erosivity information with SSURGO and GEE-derived indicators.',
    howToInterpret:
      'Treat high-risk zones as intervention priorities, especially where slope and erosive flow align. Moderate zones often respond to management timing and residue cover.',
    decisionSupportValue:
      'Supports conservation planning, compliance documentation, and practice selection such as contouring, reduced tillage, strip cropping, or cover crop placement.',
    practicalExample:
      'Before fall tillage, a field scientist identifies a severe-risk shoulder slope and recommends splitting management: no-till with cover on the shoulder and standard operations on lower-risk portions.',
    properties: [
      { name: 'Average Risk Score', expectedRange: '0-10 index', meaning: 'Overall erosion risk intensity for the field.', interpretation: 'Scores above 5 indicate meaningful management risk and elevated conservation need.' },
      { name: 'High-Risk Area Percent', expectedRange: '0-100%', meaning: 'Portion of field mapped as high erosion risk.', interpretation: 'Higher percentages indicate broader intervention need, not just isolated hotspots.' },
      { name: 'Mean Slope %', expectedRange: '0-30%+', meaning: 'Terrain steepness contributing to erosive force.', interpretation: 'Slope amplifies runoff energy and can shift priorities from nutrient to structural practices.' },
      { name: 'K-Factor', expectedRange: 'Approx. 0.02-0.7', meaning: 'Soil erodibility susceptibility.', interpretation: 'Higher K values increase sediment detachment risk under similar rainfall/runoff.' },
      { name: 'Mean T Value', expectedRange: 'Typically 1-5 T/A/Y', meaning: 'Estimated tolerable annual soil loss benchmark.', interpretation: 'If observed risk suggests loss beyond T, long-term productivity decline risk rises.' }
    ],
    synthesisGuide: [
      'Use risk score for overall urgency, then use high-risk area percent to size intervention scope.',
      'Explain high-risk patches by combining slope and K-factor context.',
      'Validate whether likely losses exceed tolerable soil loss (T) before selecting practices.'
    ],
    decisionRules: [
      { condition: 'Average risk score > 5 or high-risk area > 15%', action: 'Initiate conservation action plan with residue and runoff controls.' },
      { condition: 'High-risk area > 30%', action: 'Prioritize structural practices and zone-specific operations immediately.' },
      { condition: 'Moderate score with localized hotspots', action: 'Target only hotspot corridors first and monitor response next season.' }
    ]
  },
  drainage: {
    whatThisShows:
      'Hydrology-relevant conditions including drainage class, wetness tendency, depressional areas, and ponding-related indicators.',
    howToInterpret:
      'Persistent wet signatures indicate delayed trafficability and root stress risk. Compare wet zones with crop history and planting windows to quantify operational impact.',
    decisionSupportValue:
      'Guides drainage improvement planning, controlled traffic decisions, and timing of field operations to reduce compaction and stand loss.',
    practicalExample:
      'A manager sees repeated ponding in the same swale and uses this tab to justify targeted tile repair and adjusted planting dates for that zone.',
    properties: [
      { name: 'Depression Area %', expectedRange: '0-100%', meaning: 'Field share in topographic depressions prone to standing water.', interpretation: '>5% often indicates recurring operation delays and localized saturation.' },
      { name: 'TWI Above 12 %', expectedRange: '0-100%', meaning: 'Area with high wetness tendency from terrain-driven accumulation.', interpretation: '>15% suggests persistent wetness pressure and greater ponding probability.' },
      { name: 'High Ponding Risk %', expectedRange: '0-100%', meaning: 'Field share classified as high ponding susceptibility.', interpretation: '>10% indicates clear benefit from targeted drainage or operation timing changes.' },
      { name: 'Hydric Soil %', expectedRange: '0-100%', meaning: 'Area with hydric soil indicators relevant to wetness and compliance context.', interpretation: '>20% warrants careful wet-area management and regulatory awareness.' },
      { name: 'TWI Mean / P75 / P90', expectedRange: 'Site dependent (higher = wetter)', meaning: 'Distribution of wetness tendency across the field.', interpretation: 'Large spread between mean and upper percentiles signals concentrated wetness hotspots.' }
    ],
    synthesisGuide: [
      'Use depression and TWI metrics to map where water accumulates physically.',
      'Use high ponding risk percent to estimate operational impact across the field.',
      'Overlay hydric context to separate agronomic drainage need from compliance-sensitive zones.'
    ],
    decisionRules: [
      { condition: 'High ponding risk > 10% or TWI>12 area > 15%', action: 'Prioritize drainage design review and staggered traffic/planting plans.' },
      { condition: 'Hydric soils > 20%', action: 'Coordinate drainage options with compliance and wetland considerations.' },
      { condition: 'Wetness concentrated in narrow zones', action: 'Apply targeted fixes instead of whole-field infrastructure upgrades.' }
    ]
  },
  productivity: {
    whatThisShows:
      'Productivity potential and performance signals including NCCPI context and NDVI-based multi-year patterns such as yield gap and stability.',
    howToInterpret:
      'High average performance with low stability suggests weather-sensitive areas. A persistent yield gap indicates a management or soil limitation worth investigating.',
    decisionSupportValue:
      'Supports variable-rate input strategy, hybrid or variety placement, and budgeting by identifying where extra input is likely to return value versus where it may not.',
    practicalExample:
      'An agronomist compares two low-performing zones: one stable-low and one unstable. The stable-low zone is shifted to lower-input management, while the unstable zone gets drainage and residue interventions.',
    properties: [
      { name: 'NCCPI (All Crops and Crop-Specific)', expectedRange: '0-1 (displayed as 0-100)', meaning: 'Relative inherent soil productivity potential.', interpretation: 'Higher NCCPI indicates stronger baseline potential under suitable management.' },
      { name: 'Peak NDVI', expectedRange: '0-1', meaning: 'Observed canopy vigor signal in peak growth windows.', interpretation: 'Lower NDVI relative to potential may indicate stress or management limitations.' },
      { name: 'Yield Gap %', expectedRange: '0-100%', meaning: 'Difference between observed and expected productivity signal.', interpretation: '<10% low, 10-20% moderate, >20% high opportunity/constraint signal.' },
      { name: 'NDVI Variability (Std/CV)', expectedRange: 'CV typically 0-0.4', meaning: 'Stability of productivity response over time.', interpretation: 'Higher CV means less consistency and often greater weather/management sensitivity.' }
    ],
    synthesisGuide: [
      'Start with NCCPI to define potential ceiling, then compare NDVI outcomes against that baseline.',
      'Use yield gap to identify where performance deviates from potential.',
      'Use variability to separate persistent structural limits from unstable management/weather effects.'
    ],
    decisionRules: [
      { condition: 'Yield gap > 20%', action: 'Investigate limiting factors with targeted soil, drainage, and management diagnostics.' },
      { condition: 'Moderate gap with high CV', action: 'Prioritize resilience interventions before increasing input intensity.' },
      { condition: 'Low gap and stable response', action: 'Maintain strategy and optimize margins rather than major system changes.' }
    ]
  },
  svi: {
    whatThisShows:
      'Soil Vulnerability Index indicators for potential surface and subsurface loss pathways that increase risk of nutrient and sediment transport.',
    howToInterpret:
      'Higher values indicate greater transport vulnerability under runoff or drainage conditions. Pair SVI with erosion and drainage tabs for a full pathway picture.',
    decisionSupportValue:
      'Helps prioritize nutrient stewardship and edge-of-field conservation by focusing investment where loss potential is structurally higher.',
    practicalExample:
      'A conservation planner uses high subsurface vulnerability areas to prioritize controlled drainage and nutrient timing restrictions before spring applications.',
    properties: [
      { name: 'Class Distribution (Low/Moderate/Moderately High/High)', expectedRange: '0-100% by pathway', meaning: 'Percent of field in each vulnerability class.', interpretation: 'Rising share in classes 3-4 indicates broader transport risk pathways.' },
      { name: 'Surface Elevated % (Classes 3+4)', expectedRange: '0-100%', meaning: 'Surface-runoff-related vulnerability footprint.', interpretation: '>20% warrants additional surface-loss controls; >50% indicates major risk.' },
      { name: 'Drained/Undrained Elevated %', expectedRange: '0-100%', meaning: 'Subsurface vulnerability in drained vs natural conditions.', interpretation: 'Differences between pathways help choose between runoff vs leaching-focused interventions.' },
      { name: 'High Class % (Class 4)', expectedRange: '0-100%', meaning: 'Most vulnerable class footprint.', interpretation: 'Large class 4 shares signal priority zones for immediate conservation attention.' }
    ],
    synthesisGuide: [
      'Compare surface and subsurface pathways to identify dominant transport mechanism.',
      'Use elevated-class percentages to estimate scale of intervention needed.',
      'Prioritize class 4 footprints for first-phase treatment and monitoring.'
    ],
    decisionRules: [
      { condition: 'Elevated vulnerability (classes 3+4) > 20%', action: 'Prioritize pathway-specific nutrient and erosion mitigation.' },
      { condition: 'Class 4 share > 20%', action: 'Treat as high-priority conservation zone for immediate action.' },
      { condition: 'All pathways low and stable', action: 'Maintain existing system and monitor annually.' }
    ]
  },
  flow: {
    whatThisShows:
      'Concentrated flow and gully-prone pathways using accumulation and terrain energy indicators to reveal where runoff converges.',
    howToInterpret:
      'Linear high-intensity corridors are operational risk lines. If they intersect exposed soil periods, gully initiation risk rises quickly.',
    decisionSupportValue:
      'Supports placement of grassed waterways, diversions, and stabilization measures to prevent episodic damage and downstream sediment delivery.',
    practicalExample:
      'After a heavy rain season, a land manager overlays concentrated flow paths with known washout points and installs a grassed waterway on the highest-risk corridor first.',
    properties: [
      { name: 'Gully Risk Area %', expectedRange: '0-100%', meaning: 'Field portion with concentrated-flow/gully susceptibility.', interpretation: '<5 low, 5-10 moderate, 10-20 high, >20 severe.' },
      { name: 'Channel Density (m/ha)', expectedRange: '0-200+ m/ha', meaning: 'Length density of mapped concentrated flow paths.', interpretation: 'Higher density indicates more drainage concentration and maintenance pressure.' },
      { name: 'Convergent Area %', expectedRange: '0-100%', meaning: 'Area where topography converges flow.', interpretation: '>10% signals notable concentration; >20% suggests strong episodic risk.' },
      { name: 'SPI Mean/Max/P90', expectedRange: 'Relative index (higher = more energy)', meaning: 'Flow power statistics linked to erosive potential.', interpretation: 'High upper-tail SPI (P90/Max) indicates episodic high-energy runoff corridors.' }
    ],
    synthesisGuide: [
      'Use gully-risk percent for urgency and channel density for network complexity.',
      'Use convergent area to estimate how widespread concentration behavior is.',
      'Use SPI upper-tail values to target where structural controls matter most.'
    ],
    decisionRules: [
      { condition: 'Gully risk > 10%', action: 'Plan concentrated-flow stabilization (waterways/diversions) this season.' },
      { condition: 'Gully risk > 15% or severe hotspots', action: 'Prioritize immediate structural interventions over advisory-only changes.' },
      { condition: 'Low gully risk with moderate channel density', action: 'Maintain monitoring and prevent disturbance during erosive windows.' }
    ]
  },
  drought: {
    whatThisShows:
      'Drought stress indicators such as water balance and drought index context to characterize moisture deficit risk during the growing season.',
    howToInterpret:
      'Negative water balance combined with worsening drought index values signals rising stress exposure. Use trend direction to plan early, not react late.',
    decisionSupportValue:
      'Supports irrigation prioritization, drought-tolerant variety selection, and contingency planning for forage, grain fill, or stocking decisions.',
    practicalExample:
      'A producer expecting limited irrigation capacity uses drought risk patterns to prioritize water on the most responsive acres and shifts marginal acres to a more drought-resilient crop.',
    properties: [
      { name: 'PDSI', expectedRange: '-4 to +4 typical', meaning: 'Integrated drought/wetness index from climate-water balance context.', interpretation: 'Below -1 indicates dryness; below -2 indicates meaningful drought stress risk.' },
      { name: 'Water Balance (mm)', expectedRange: 'Negative to positive', meaning: 'Growing-season precipitation minus atmospheric demand.', interpretation: 'More negative values indicate increasing moisture deficit pressure.' },
      { name: 'Drought Severity / Trend', expectedRange: 'Normal to Severe; Improving/Stable/Worsening', meaning: 'Operational state and direction of drought risk.', interpretation: 'Worsening trend should trigger earlier planning actions than static conditions.' },
      { name: 'Index Agreement %', expectedRange: '0-100%', meaning: 'Consistency among drought indicators.', interpretation: 'Higher agreement increases confidence in action urgency.' }
    ],
    synthesisGuide: [
      'Use severity as current state, trend as trajectory, and agreement as confidence.',
      'Confirm stress with both PDSI and water-balance direction, not one metric alone.',
      'Prioritize operational responses where severity is high and trend is worsening.'
    ],
    decisionRules: [
      { condition: 'Water balance < -100 mm or PDSI < -2', action: 'Activate drought response plan and prioritize resilient acres.' },
      { condition: 'Moderate dryness with worsening trend', action: 'Pre-stage irrigation/forage contingency before peak stress window.' },
      { condition: 'Normal status with low agreement', action: 'Monitor weekly before major management shifts.' }
    ]
  },
  vegetation: {
    whatThisShows:
      'Vegetation vigor and temporal dynamics from NDVI, highlighting seasonal performance, consistency, and potential stress signatures.',
    howToInterpret:
      'Look for recurring weak-growth zones across years. Repetition suggests structural constraints; one-off dips may reflect temporary weather or management events.',
    decisionSupportValue:
      'Enables in-season scouting prioritization, post-season diagnosis, and targeted remediation where vegetation response repeatedly underperforms.',
    practicalExample:
      'A crop consultant identifies a recurring low-vigor strip and confirms shallow compaction. The grower then targets subsoiling only where repeated stress appears.',
    properties: [
      { name: 'Peak NDVI', expectedRange: '0-1', meaning: 'Peak canopy vigor signal.', interpretation: '>0.7 excellent, 0.6-0.7 good, 0.5-0.6 moderate, <0.5 lower vigor.' },
      { name: 'Inter-Annual NDVI CV', expectedRange: '0-100%', meaning: 'Year-to-year variability of peak productivity.', interpretation: 'Lower is more stable; elevated CV indicates variable performance risk.' },
      { name: 'Intra-Annual CV', expectedRange: '0-100%', meaning: 'Within-season temporal variability.', interpretation: 'High values can reflect weather swings or management timing inconsistency.' },
      { name: 'Within-Field CV / Uniformity Score', expectedRange: 'CV 0-100%; score 0-100', meaning: 'Spatial uniformity of vegetation response.', interpretation: 'Higher CV (lower score) suggests heterogeneous zones for targeted management.' },
      { name: 'Fractional Vegetation Cover (FVC)', expectedRange: '0-100%', meaning: 'Estimated ground cover from NDVI transform.', interpretation: 'Lower cover indicates greater exposure and reduced resilience.' }
    ],
    synthesisGuide: [
      'Use peak NDVI for productivity level, then CV metrics for stability and heterogeneity.',
      'Separate temporal instability (weather/timing) from spatial instability (zone effects).',
      'Use FVC to evaluate whether canopy/cover sufficiency supports resilience goals.'
    ],
    decisionRules: [
      { condition: 'Inter-annual CV > 15%', action: 'Prioritize resilience and consistency strategies over yield maximization.' },
      { condition: 'Within-field CV > 25%', action: 'Implement or refine management zones and targeted scouting.' },
      { condition: 'FVC < 70%', action: 'Increase cover-focused practices and reduce bare-soil exposure periods.' }
    ]
  },
  terrain: {
    whatThisShows:
      'Topographic controls including slope position, convergence, and moisture redistribution patterns that influence erosion, runoff, and equipment performance.',
    howToInterpret:
      'Use terrain context to explain why similar soils perform differently across the same field. Steeper, convergent positions generally amplify risk.',
    decisionSupportValue:
      'Improves siting of practices, route planning for equipment, and zoning strategies that account for physical landscape constraints.',
    practicalExample:
      'A field scientist uses terrain metrics to redesign headland traffic routes, reducing rutting and runoff concentration in lower convergent positions.',
    properties: [
      { name: 'Mean/Max Slope %', expectedRange: '0-30%+', meaning: 'Overall and extreme steepness of field terrain.', interpretation: 'Higher slope values increase runoff velocity and erosion susceptibility.' },
      { name: 'High-Risk Area %', expectedRange: '0-100%', meaning: 'Share of field in terrain-driven high-risk classes.', interpretation: '<10 low, 10-25 moderate, >25 high terrain-driven concern.' },
      { name: 'TWI Mean/P75/P90', expectedRange: 'Relative wetness index', meaning: 'Potential moisture accumulation behavior.', interpretation: 'Higher upper percentiles indicate persistent wetness-prone positions.' },
      { name: 'SPI Mean/P90/P95', expectedRange: 'Relative power index', meaning: 'Concentrated-flow erosive power potential.', interpretation: 'Higher upper-tail SPI implies stronger episodic erosive energy.' },
      { name: 'Depression Area %', expectedRange: '0-100%', meaning: 'Topographic depressions prone to saturation.', interpretation: 'Larger depression share increases delayed traffic and ponding risk.' }
    ],
    synthesisGuide: [
      'Use slope and SPI to understand erosive energy and pathway strength.',
      'Use TWI and depressions to locate saturation-driven operational constraints.',
      'Combine both to differentiate erosion-dominant vs wetness-dominant intervention zones.'
    ],
    decisionRules: [
      { condition: 'High-risk terrain area > 25%', action: 'Prioritize terrain-adapted operations and structural runoff controls.' },
      { condition: 'High TWI with moderate slopes', action: 'Focus on drainage/timing before erosion-only interventions.' },
      { condition: 'High SPI corridors present', action: 'Target flow-path stabilization and avoid disturbance in those corridors.' }
    ]
  },
  climate: {
    whatThisShows:
      'Historical and seasonal climate context relevant to field operations, including precipitation patterns and timing-sensitive stress periods.',
    howToInterpret:
      'Focus on patterns rather than single events. Repeated wet or dry windows inform realistic operation timing and risk buffers.',
    decisionSupportValue:
      'Supports long-range planning for planting windows, harvest risk management, residue strategy, and resilient conservation sequencing.',
    practicalExample:
      'A farm manager sees repeated late-spring wet periods and adjusts annual fieldwork sequencing so poorly drained fields are planted later with suitable varieties.',
    properties: [
      { name: 'Growing Season Precipitation (Apr-Oct)', expectedRange: 'Region dependent mm total', meaning: 'Primary in-season water supply for crop growth.', interpretation: 'Values well below normal increase drought pressure; values well above normal increase saturation and trafficability risk.' },
      { name: 'Maximum Daily Precipitation', expectedRange: 'Single-event mm', meaning: 'Largest one-day storm intensity in the climate record context.', interpretation: 'Higher maxima raise runoff/erosion potential and justify stronger storm-resilience planning.' },
      { name: 'Days > 25 mm (1 inch)', expectedRange: 'Days/year', meaning: 'Frequency of erosive storm-size events.', interpretation: 'Higher counts indicate repeated runoff-trigger conditions and greater erosion-control urgency.' },
      { name: 'Max Consecutive Dry Days', expectedRange: 'Days', meaning: 'Longest uninterrupted dry spell indicator.', interpretation: 'Long sequences indicate crop moisture stress potential and irrigation/contingency need.' },
      { name: 'Last Spring Freeze', expectedRange: 'Calendar date', meaning: 'Final likely frost date in spring.', interpretation: 'Planting before this date increases emergence/frost injury risk for sensitive crops.' },
      { name: 'First Fall Freeze', expectedRange: 'Calendar date', meaning: 'Earliest likely damaging frost in fall.', interpretation: 'Earlier freeze dates shorten maturity window and increase late-season crop risk.' },
      { name: 'Days > 32 C (90 F)', expectedRange: 'Days/season', meaning: 'Heat-stress day frequency.', interpretation: 'Higher counts can reduce pollination/grain-fill performance and increase atmospheric demand.' },
      { name: 'Extreme Minimum Temperature', expectedRange: 'Degrees C', meaning: 'Historical cold extreme relevant to winter survival and infrastructure stress.', interpretation: 'More extreme minima increase winterkill and perennial injury considerations.' },
      { name: 'Corn GDD Adequacy', expectedRange: 'Poor/Fair/Good/Excellent', meaning: 'Heat-unit suitability rating for corn maturity targets.', interpretation: 'Excellent indicates strong maturity confidence if planting windows are respected.' },
      { name: 'Corn Planting Window', expectedRange: 'Start-End date', meaning: 'Recommended climate-informed planting period.', interpretation: 'Planting inside this window reduces frost and maturity risk while preserving yield potential.' },
      { name: 'Corn Risk Rating', expectedRange: 'Low/Moderate/High', meaning: 'Overall risk synthesis for corn in local climate context.', interpretation: 'Low risk supports normal operations; moderate/high risk requires mitigation and contingency planning.' },
      { name: 'Soybean GDD Adequacy and Planting Window', expectedRange: 'Rating + date range', meaning: 'Thermal sufficiency and preferred establishment timing for soybeans.', interpretation: 'Excellent adequacy with an appropriate window supports stable maturity planning.' },
      { name: 'Small Grains GDD Adequacy and Spring Planting', expectedRange: 'Rating + date range', meaning: 'Suitability and spring window for small grain establishment.', interpretation: 'Good/excellent ratings indicate viable adaptation option where warm-season crops face higher stress.' },
      { name: 'Spring Field Work: Earliest Safe Date / Optimal Start', expectedRange: 'Calendar dates', meaning: 'Operational readiness window for field traffic and setup.', interpretation: 'Large gap between earliest and optimal suggests caution against aggressive early entry.' },
      { name: 'Critical Erosion Period', expectedRange: 'Seasonal window', meaning: 'Months with highest rainfall erosivity and runoff exposure.', interpretation: 'Fields should have strongest protective cover and minimal disturbance during this period.' },
      { name: 'Cover Needed Window', expectedRange: 'Seasonal window', meaning: 'Months where residue/cover is most protective.', interpretation: 'Insufficient cover in this window elevates erosion and structural degradation risk.' },
      { name: 'Soil Workability (Spring/Fall Median Dates)', expectedRange: 'Calendar dates', meaning: 'Typical timing when soil conditions support lower-risk traffic/tillage.', interpretation: 'Operations outside median workability windows increase compaction/rutting risk.' },
      { name: 'Erosion High-Risk Period and Erosive Rain Days', expectedRange: 'Seasonal window + days/year', meaning: 'Combined timing and frequency signal for erosion pressure.', interpretation: 'Long high-risk windows plus frequent erosive rain days justify proactive conservation timing.' }
    ],
    synthesisGuide: [
      'Step 1: Evaluate precipitation and water stress together by comparing Apr-Oct precipitation, heavy-rain frequency, and maximum dry-spell length.',
      'Step 2: Evaluate thermal risk using freeze boundaries, heat-extreme days, and crop-specific GDD adequacy ratings.',
      'Step 3: Translate crop suitability outputs (corn, soybean, small grains windows and risk ratings) into practical planting sequence decisions.',
      'Step 4: Align field operation windows (earliest safe, optimal start, soil workability medians) with equipment and labor planning.',
      'Step 5: Overlay conservation timing (critical erosion period, cover-needed months, erosive rain frequency) to schedule protection before exposure.'
    ],
    decisionRules: [
      { condition: 'High max consecutive dry days and elevated days >32 C', action: 'Prioritize drought contingency planning, water conservation, and stress-tolerant crop/variety selection.' },
      { condition: 'High days >25 mm plus a strong maximum daily precipitation signal', action: 'Front-load erosion controls and avoid leaving bare soil during the mapped high-risk months.' },
      { condition: 'Corn/soybean adequacy is excellent and risk is low', action: 'Proceed with standard crop plan while maintaining conservation timing discipline.' },
      { condition: 'Planting window start is later than planned operation schedule', action: 'Resequence fields by drainage/workability and delay sensitive crop planting to reduce establishment losses.' },
      { condition: 'Critical erosion period overlaps intensive soil disturbance', action: 'Switch to lower-disturbance operations or add temporary protective cover/residue during overlap window.' },
      { condition: 'Spring/fall soil workability medians indicate narrow operation windows', action: 'Concentrate high-risk operations in optimal windows and preserve contingency days for weather interruptions.' }
    ]
  },
  concerns: {
    whatThisShows:
      'A prioritized list of likely resource concerns synthesized from soil, hydrology, vulnerability, and productivity evidence.',
    howToInterpret:
      'Treat this as a triage layer: high-priority concerns should receive first-pass planning attention and verification in the field.',
    decisionSupportValue:
      'Accelerates planning meetings by converting many indicators into an actionable concern shortlist with clearer rationale for intervention order.',
    practicalExample:
      'In a producer-advisor review, the team uses the concern ranking to focus the season plan on two highest-impact issues instead of diluting resources across many minor findings.',
    properties: [
      { name: 'Concern Category', expectedRange: 'Erosion, Ponding, Gully, Drought, Productivity, SVI', meaning: 'Type of resource issue detected from integrated evidence.', interpretation: 'Categories indicate which subsystem drives risk and who should lead response.' },
      { name: 'Affected % and Affected Acres', expectedRange: '0-100% and 0-field acres', meaning: 'Spatial scale of each concern.', interpretation: 'Use percent for intensity of footprint and acres for budgeting/logistics.' },
      { name: 'Severity Level', expectedRange: 'Low / Moderate / High', meaning: 'Priority class derived from thresholds.', interpretation: 'Higher severity should move earlier in implementation sequence.' },
      { name: 'Trigger Metrics', expectedRange: 'Metric-specific thresholds', meaning: 'Underlying indicators that triggered concern detection.', interpretation: 'Inspect trigger metric to choose the most direct intervention.' }
    ],
    synthesisGuide: [
      'Use concern list as triage, then inspect each concern trigger before action.',
      'Balance severity with affected acres to prioritize practical impact.',
      'Cross-link concerns to practice options and feasibility constraints.'
    ],
    decisionRules: [
      { condition: 'High severity concern with large affected area', action: 'Treat as immediate planning priority and allocate first budget tier.' },
      { condition: 'Moderate concern but large acres affected', action: 'Address early due to scale even if severity is not highest.' },
      { condition: 'Low severity and limited footprint', action: 'Monitor and schedule as secondary phase.' }
    ]
  },
  practices: {
    whatThisShows:
      'Recommended conservation practices aligned to detected field conditions and likely resource concerns.',
    howToInterpret:
      'Read recommendations as candidates, then screen by feasibility, cost, operation fit, and expected benefit on the specific field zones.',
    decisionSupportValue:
      'Bridges assessment to action by giving users a practical shortlist for implementation planning, cost-share discussion, and phased adoption.',
    practicalExample:
      'A landowner preparing a cost-share application starts with the recommended practices list, then finalizes a phased rollout beginning with high-benefit, low-disruption options.',
    properties: [
      { name: 'Practice Name and NRCS Code', expectedRange: 'Standardized identifiers', meaning: 'Defines implementation standard and referenceable specification.', interpretation: 'Use code-level detail for contracting, compliance, and engineering alignment.' },
      { name: 'Priority', expectedRange: 'Critical / High / Medium / Low', meaning: 'Urgency ranking based on field conditions and concern severity.', interpretation: 'Higher priority should be sequenced first unless feasibility constraints dominate.' },
      { name: 'Estimated Cost', expectedRange: 'Relative cost bands', meaning: 'Implementation cost expectation used for planning.', interpretation: 'Combine cost with risk reduction potential to optimize return on conservation spend.' },
      { name: 'Timeline and Category', expectedRange: 'Short to long horizon', meaning: 'Expected implementation cadence and practice type.', interpretation: 'Phase quick-win operational changes first while designing longer-horizon structural work.' }
    ],
    synthesisGuide: [
      'Start with highest-priority practices, then screen by feasibility and operation fit.',
      'Use cost and timeline to stage implementation into realistic phases.',
      'Map each chosen practice back to the concern it addresses to track outcomes.'
    ],
    decisionRules: [
      { condition: 'Critical/high priority with strong concern linkage', action: 'Include in near-term implementation or cost-share package.' },
      { condition: 'High benefit but high disruption', action: 'Schedule in phased rollout with preparatory management steps.' },
      { condition: 'Low priority with weak concern linkage', action: 'Keep as optional future enhancement.' }
    ]
  },
  zones: {
    whatThisShows:
      'Management zone delineations based on spatial variability in soils and productivity response.',
    howToInterpret:
      'Stable, repeatable zones indicate opportunities for differentiated management. Unstable boundaries may require additional years or layers before acting.',
    decisionSupportValue:
      'Supports variable-rate nutrient or seeding plans, targeted scouting, and differentiated economics to improve return on management intensity.',
    practicalExample:
      'An operator uses zone boundaries to split nitrogen rates into three prescriptions, then tracks response by zone to refine next season recommendations.',
    properties: [
      { name: 'Zone Class', expectedRange: 'High / Moderate / Low productivity', meaning: 'Relative management group based on performance and soils.', interpretation: 'Classes should guide differential treatment rather than uniform rates.' },
      { name: 'Zone Area and Percent', expectedRange: '0-field acres / 0-100%', meaning: 'Operational scale of each zone.', interpretation: 'Larger zones justify dedicated prescriptions and equipment workflows.' },
      { name: 'Zone Characteristics', expectedRange: 'Soil/productivity trait sets', meaning: 'Primary factors defining each zone.', interpretation: 'Use characteristics to select the right levers (seed, nutrient, drainage, timing).' },
      { name: 'Zone Recommendations', expectedRange: 'Targeted action list', meaning: 'Suggested actions specific to each zone class.', interpretation: 'Comparing response across zones supports iterative optimization.' }
    ],
    synthesisGuide: [
      'Validate that zone boundaries align with persistent patterns, not one-year anomalies.',
      'Tie each zone to a clear management objective and measurable KPI.',
      'Review seasonal outcomes by zone to refine future prescriptions.'
    ],
    decisionRules: [
      { condition: 'Distinct zones with repeatable behavior', action: 'Implement variable-rate or differentiated management prescriptions.' },
      { condition: 'Small fragmented zones with unstable behavior', action: 'Simplify to fewer zones until stability improves.' },
      { condition: 'Low-productivity zone with low responsiveness', action: 'Shift to risk-managed input strategy rather than trying to maximize output.' }
    ]
  }
};

export function getTabNarrative(tabId: FieldAnalysisTabId): TabNarrative {
  return TAB_NARRATIVES[tabId];
}
