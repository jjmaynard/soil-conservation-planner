// data/soilHealthIndicators.ts
import { SoilHealthIndicator } from '#src/types/soilHealth';

export const soilHealthIndicators: SoilHealthIndicator[] = [
  // PHYSICAL INDICATORS
  {
    id: 'soil_cover',
    name: 'Soil Cover',
    category: 'physical',
    description: 'Surface cover from plants, residue or mulch; cover greater than 75% (estimated)',
    criteria: 'Surface cover from plants, residue or mulch; cover greater than 75% (estimated)',
    meets: '>75% surface covered with live plants, crop residue, or mulch',
    resourceConcerns: ['SOM', 'AGG', 'HAB'],
    timing: ['anytime'],
    importance: 'A significant factor in promoting soil health is keeping the soil surface covered, particularly during fallow/intercrop periods and prior to canopy closure.',
    howToAssess: 'Estimate the percent of the soil surface covered with dead plant material, organic mulch or live plants at any time, but ideally right before planting the main cash crop. Evaluate management and operations to predict cover during critical erosion and fallow/intercrop periods.',
    practices: [311, 328, 329, 340, 345, 484, 512, 528],
    icon: 'Leaf',
    priority: 'high'
  },
  {
    id: 'surface_crusting',
    name: 'Surface Crusting',
    category: 'physical',
    description: 'Crusting on no more than 5% (estimated) of the field/CMU',
    criteria: 'Crusting on no more than 5% (estimated) of the field/CMU',
    meets: 'Little or no crusting present; crusts easily break apart when picked up',
    resourceConcerns: ['AGG', 'HAB'],
    timing: ['after_rain', 'before_tillage'],
    importance: 'Standing water or evidence of surface runoff on the soil resulting from poor infiltration can be an indication of poor aggregate stability, crusting, lack of cover, poor soil structure, and/or compaction.',
    howToAssess: 'Determine if crusts are present throughout the field or only in patches. Crusts will remain intact when they are picked up. Assess for physical crusts after irrigation or rain and before next tillage.',
    practices: [311, 329, 340, 345, 484, 512, 528, 610],
    icon: 'Layers',
    priority: 'high'
  },
  {
    id: 'ponding_infiltration',
    name: 'Ponding/Infiltration',
    category: 'physical',
    description: 'No ponding on non-hydric soils within 24 hours following typical rainfall',
    criteria: 'No ponding on non-hydric soils within 24 hours following typical rainfall or surface irrigation event; OR, no infiltration difference between assessment area and undisturbed area; OR, soil infiltrates 1-inch of water in 30 minutes or less',
    meets: 'No ponding observed 24 hrs after typical rainfall event',
    resourceConcerns: ['CPT', 'AGG'],
    timing: ['after_rain', 'adequate_moisture'],
    importance: 'Standing water or evidence of surface runoff resulting from poor infiltration indicates poor aggregate stability, crusting, lack of cover, poor soil structure, and/or compaction.',
    howToAssess: 'Best time to assess for ponding is within 24 hours of typical rainfall or irrigation. Optional infiltration test can be conducted using comparison method or timed test.',
    practices: [311, 328, 329, 333, 340, 345, 449, 511, 528],
    icon: 'Droplets',
    priority: 'high'
  },
  {
    id: 'penetration_resistance',
    name: 'Penetration Resistance',
    category: 'physical',
    description: 'Penetrometer <150 psi 0-6 inch, <300 psi 6-18 inch',
    criteria: 'Penetrometer <150 psi 0-6 inch, <300 psi 6-18 inch; slight-no resistance 0-12 inch depth w/ wire flag; OR, visual observation: no plowpan or evidence of root restricting layer',
    meets: 'Penetrometer readings <150 psi (0-6") and <300 psi (6-18")',
    resourceConcerns: ['CPT'],
    timing: ['adequate_moisture'],
    importance: 'Soil compaction inhibits water and gas movement through the soil in addition to interfering with root growth and soil organism habitat, nutrient cycling, plant productivity and health.',
    howToAssess: 'Ideal condition is at field capacity. Management-induced compaction typically occurs at depths of 2–8 inches. Use wire flag method or penetrometer method at 8–10 randomly selected spots.',
    practices: [328, 329, 334, 340, 345, 511, 528, 808],
    icon: 'Hammer',
    priority: 'high'
  },
  {
    id: 'water_stable_aggregates',
    name: 'Water-Stable Aggregates',
    category: 'physical',
    description: 'Soil structure remains intact with aggregates apparent',
    criteria: 'Strainer: soil structure remains intact with aggregates apparent; OR, SQTK/Jornada slake box meets stability class 5 to 6; OR, Cylinder: At least 80% remains intact after 5 minutes with little cloudy water',
    meets: 'Aggregates remain stable when submerged in water',
    resourceConcerns: ['CPT', 'SOM', 'AGG', 'HAB'],
    timing: ['anytime'],
    importance: 'Stability of soil aggregates in water is important for water infiltration and storage, air exchange, plant root growth, soil organism habitat, protecting soil organic matter, decreased soil erodibility, nutrient cycling.',
    howToAssess: 'Use strainer method, SQTKG method, or cylinder method. Coarse textured soils may not develop aggregates easily in semiarid and arid climates.',
    practices: [311, 328, 329, 333, 334, 340, 345, 511, 528, 590, 595, 808],
    icon: 'Puzzle',
    priority: 'high'
  },
  {
    id: 'soil_structure',
    name: 'Soil Structure',
    category: 'physical',
    description: 'A horizon granular structure and no platy structure',
    criteria: 'A horizon granular structure and no platy structure; VESS surface Sq = 1, 0-12 inch composite score ≤ 2',
    meets: 'Granular structure present; no platy layers observed',
    resourceConcerns: ['CPT', 'SOM', 'AGG', 'HAB'],
    timing: ['anytime', 'before_tillage'],
    importance: 'Soil structure affects water infiltration impacting flooding and gas exchange, plant rooting, nutrient cycling, plant condition and health, and soil organism habitat.',
    howToAssess: 'Observe for granular, massive or platy structure within horizons of the top foot of soil. May not be useful after full-width conventional tillage.',
    practices: [311, 328, 329, 334, 340, 345, 511, 528],
    icon: 'Building2',
    priority: 'medium'
  },
  // BIOLOGICAL INDICATORS
  {
    id: 'residue_breakdown',
    name: 'Residue Breakdown',
    category: 'biological',
    description: 'Natural decomposition of crop residues as expected',
    criteria: 'Natural decomposition of crop residues or organic mulch is as expected with crop and conditions',
    meets: 'Residue showing active decomposition appropriate for climate/season',
    resourceConcerns: ['SOM', 'HAB'],
    timing: ['anytime', 'no_till'],
    importance: 'Residue breakdown is the biological shredding, fragmenting, cycling, and/or decomposition of previous crop residue. The rate at which residue decomposes can be an indicator of management-influenced biological activity.',
    howToAssess: 'Look at existing residue cover for signs of decomposition, shredding, and incorporation by soil organisms. Note depth of litter and color and condition of most recent residue.',
    practices: [328, 329, 340, 345, 528, 590, 595],
    icon: 'Wind',
    priority: 'medium'
  },
  {
    id: 'plant_root_health',
    name: 'Plant Roots',
    category: 'biological',
    description: 'Roots covered in soil film or healthy, unrestricted',
    criteria: 'Roots covered in a soil film (rhizosheaths) or are part of soil aggregates; OR, living roots if present are healthy, fully branched, extended and unrestricted',
    meets: 'Roots healthy, white, well-branched, and unrestricted',
    resourceConcerns: ['CPT', 'SOM', 'AGG', 'HAB'],
    timing: ['growing_season'],
    importance: 'Plant roots exude carbohydrates that provide food and habitat to microbial communities which builds soil structure by forming soil aggregates. Root channels function as areas of carbon concentration and biological activity.',
    howToAssess: 'Observe growth patterns of actively growing roots within top 0–8" or deeper. Look for healthy, abundant, deep, well-branched roots not inhibited by restrictive layers.',
    practices: [311, 328, 329, 334, 340, 345, 512, 528, 590, 808],
    icon: 'Sprout',
    priority: 'medium'
  },
  {
    id: 'earthworm_presence',
    name: 'Biological Diversity',
    category: 'biological',
    description: 'Evidence of more than 3 different types of organisms',
    criteria: 'Evidence of more than 3 different types of organisms observed or biological hotspots present',
    meets: 'Earthworms, insects, or other organisms present (3+ types)',
    resourceConcerns: ['SOM', 'AGG', 'HAB'],
    timing: ['adequate_moisture'],
    importance: 'Soil organisms broadly influence all aspects of soil function including aggregation, water dynamics, nutrient cycling and pest suppression.',
    howToAssess: 'Observe presence of soil organisms within residue or soil. Look for fungal hyphae, active nodules, earthworms, mites, springtails, millipedes, beetles, ants.',
    practices: [311, 328, 329, 340, 345, 484, 511, 528, 590, 595, 808],
    icon: 'Bug',
    priority: 'medium'
  },
  {
    id: 'biopores',
    name: 'Biopores',
    category: 'biological',
    description: 'Presence of multiple intact channels',
    criteria: 'Presence of multiple intact root or macrofauna channels that extend vertically through the soil with some connecting to the surface',
    meets: 'Multiple biopores/channels visible throughout soil profile',
    resourceConcerns: ['SOM', 'AGG', 'HAB'],
    timing: ['anytime', 'adequate_moisture'],
    importance: 'Biopores created by plant roots, earthworms, and other macrofauna are important for rapid air and water exchange. They provide access to water and nutrient resources and pathways for newly established roots.',
    howToAssess: 'Look for intact biopores that appear as channels, often connected to soil surface. Biopores forming over multiple years are rich in organic matter and may appear darker.',
    practices: [311, 327, 328, 329, 340, 512, 528, 550],
    icon: 'CircleDot',
    priority: 'medium'
  },
  {
    id: 'soil_color',
    name: 'Soil Color',
    category: 'physical',
    description: 'No color difference between assessment and undisturbed area',
    criteria: 'No color difference between assessment area and natural or undisturbed area of same soil type; OR, value is on the darker range using color chart and official series description',
    meets: 'Soil color similar to undisturbed/reference area',
    resourceConcerns: ['SOM'],
    timing: ['anytime'],
    importance: 'Color can be used as an indicator of loss or accumulation of soil organic matter which influences most aspects of soil function.',
    howToAssess: 'Use color chart method, smartphone app method, or field versus fencerow comparison method. Compare same soil type.',
    practices: [311, 327, 328, 329, 340, 345, 512, 528, 590, 808],
    icon: 'Palette',
    priority: 'low'
  }
];

export function getIndicatorsByCategory(category: 'physical' | 'biological'): SoilHealthIndicator[] {
  return soilHealthIndicators.filter(indicator => indicator.category === category);
}

export function getIndicatorById(id: string): SoilHealthIndicator | undefined {
  return soilHealthIndicators.find(indicator => indicator.id === id);
}

export function getHighPriorityIndicators(): SoilHealthIndicator[] {
  return soilHealthIndicators.filter(indicator => indicator.priority === 'high');
}

export const TIMING_DESCRIPTIONS: Record<string, string> = {
  anytime: 'Can be assessed year-round under most conditions',
  after_rain: 'Best assessed within 24 hours of rainfall or irrigation',
  adequate_moisture: 'Assess when soil is at or near field capacity',
  before_tillage: 'Assess prior to soil disturbance activities',
  no_till: 'Most applicable in no-till production systems',
  growing_season: 'Assess during active plant growth periods',
  interview: 'Information gathered through producer interview'
};

export const TIMING_ICONS: Record<string, string> = {
  anytime: 'Clock',
  after_rain: 'CloudRain',
  adequate_moisture: 'Droplets',
  before_tillage: 'Tractor',
  no_till: 'Wheat',
  growing_season: 'Sprout',
  interview: 'MessageCircle'
};

export const CONSERVATION_PRACTICES: Record<number, string> = {
  311: 'Alley Cropping',
  327: 'Conservation Cover',
  328: 'Conservation Crop Rotation',
  329: 'Residue and Tillage Management, No Till',
  333: 'Irrigation Land Leveling',
  334: 'Residue and Tillage Management, Ridge Till',
  340: 'Cover Crop',
  345: 'Residue and Tillage Management, Mulch Till',
  449: 'Irrigation Water Management',
  484: 'Mulching',
  511: 'Forage and Biomass Planting',
  512: 'Pasture and Hay Planting',
  528: 'Prescribed Grazing',
  550: 'Range Planting',
  590: 'Nutrient Management',
  595: 'Integrated Pest Management',
  610: 'Salinity and Sodic Soil Management',
  808: 'Soil Quality Restoration'
};
