// ==========================================================================
// SSURGO COMPONENT INTERPRETATIONS GROUPING SYSTEM
// Organized for SoilViz Pro soil mapping application
// ==========================================================================

export const interpretationGroups = {
  
  // ==========================================================================
  // AGRICULTURAL APPLICATIONS
  // ==========================================================================
  agricultural: {
    name: "Agricultural Uses",
    icon: "🌾",
    color: "#059669",
    subgroups: {
      
      cropProduction: {
        name: "Crop Production & Productivity",
        interpretations: [
          "AGR - Industrial Hemp for Fiber and Seed Production",
          "CPI - Alfalfa Hay, IRR - Klamath Valley and Basins (OR)",
          "CPI - Grass Hay, IRR - Klamath Valleys and Basins (OR)",
          "CPI - Grass Hay, NIRR - Klamath Valleys and Basins (OR)",
          "CPI - Small Grains, NIRR - Palouse Prairies (OR)",
          "NCCPI - National Commodity Crop Productivity Index (Ver 3.0)",
          "NCCPI - NCCPI Corn Submodel (I)",
          "NCCPI - NCCPI Cotton Submodel (II)",
          "NCCPI - NCCPI Small Grains Submodel (II)",
          "NCCPI - NCCPI Soybeans Submodel (I)",
          "MLRA 21 CPI - Soil Landscape (Alfalfa IRR)",
          "MLRA 21 CPI - Soil Landscape (Grass Hay NIRR)",
          "MLRA 9 CPI - Soil Climate Subrule (Small Grains)",
          "MLRA 9 CPI - Soil Landscape Subrule (Small Grains)",
          "MLRA 9 CPI - Soil Physical Properties Subrule (Small Grains)",
          "MLRA 9 CPI - Water Subrule (Small Grains)",
          "MLRA 9,43A,44A CPI - AWC (Grass Hay)"
        ]
      },
      
      chemicalMovement: {
        name: "Chemical Movement & Contamination",
        interpretations: [
          "AGR - Nitrate Leaching Potential, Irrigated (WA)",
          "AGR - Nitrate Leaching Potential, Nonirrigated (WA)",
          "AGR - Pesticide Loss Potential-Leaching",
          "AGR - Pesticide Loss Potential-Soil Surface Runoff",
          "Water Available for Leaching IRR",
          "Water Available for Leaching NIRR",
          "Water holding capacity - nitrate leaching",
          "Water table index - nitrate leaching"
        ]
      },
      
      wasteManagement: {
        name: "Agricultural Waste Management",
        interpretations: [
          "AWM - Irrigation Disposal of Wastewater",
          "AWM - Land Application of Municipal Biosolids, spring (OR)",
          "AWM - Land Application of Municipal Biosolids, summer (OR)",
          "AWM - Land Application of Municipal Biosolids, winter (OR)",
          "AWM - Land Application of Municipal Sewage Sludge",
          "AWM - Manure and Food Processing Waste",
          "AWM - Overland Flow Process Treatment of Wastewater",
          "AWM - Rapid Infiltration Disposal of Wastewater",
          "AWM - Slow Rate Process Treatment of Wastewater"
        ]
      }
    }
  },

  // ==========================================================================
  // RANGELAND & GRAZING MANAGEMENT
  // ==========================================================================
  rangeland: {
    name: "Rangeland & Grazing",
    icon: "🐄",
    color: "#d97706",
    subgroups: {
      
      rangelandSuitability: {
        name: "Rangeland Suitability",
        interpretations: [
          "BLM - Rangeland Seeding, Colorado Plateau Ecoregion",
          "BLM - Rangeland Seeding, Great Basin Ecoregion",
          "GRL - Rangeland Seeding Suitability (OR)",
          "BLM - Rangeland Drill",
          "BLM - Rangeland Tillage",
          "GRL - Fencing, Post Depth =<24 inches",
          "GRL - Fencing, Post Depth =<36 inches",
          "BLM - Fencing"
        ]
      },
      
      mechanicalTreatment: {
        name: "Mechanical Treatment",
        interpretations: [
          "BLM - Mechanical Treatment, Rolling Drum",
          "BLM - Mechanical Treatment, Shredder",
          "BLM - Chaining Suitability"
        ]
      },
      
      invasiveSpecies: {
        name: "Invasive Species Susceptibility",
        interpretations: [
          "BLM - Medusahead Invasion Susceptibility",
          "BLM - Yellow Star-thistle Invasion Susceptibility",
          "GRL - Western Juniper Encroachment Potential (OR)"
        ]
      },
      
      wildlifeHabitat: {
        name: "Wildlife Habitat",
        interpretations: [
          "BLM - Pygmy Rabbit Habitat Potential"
        ]
      }
    }
  },

  // ==========================================================================
  // FORESTRY APPLICATIONS
  // ==========================================================================
  forestry: {
    name: "Forestry Operations",
    icon: "🌲",
    color: "#059669",
    subgroups: {
      
      sitePreparation: {
        name: "Site Preparation & Planting",
        interpretations: [
          "FOR - Hand Planting Suitability",
          "FOR - Mechanical Planting Suitability",
          "FOR - Mechanical Site Preparation (Deep)",
          "FOR - Mechanical Site Preparation (Surface)",
          "FOR - Potential Seedling Mortality"
        ]
      },
      
      harvesting: {
        name: "Harvesting & Equipment",
        interpretations: [
          "FOR - Harvest Equipment Operability",
          "FOR - Log Landing Suitability",
          "FOR - Log Landing Suitability (OR)",
          "FOR - Displacement Hazard",
          "FOR - Soil Compactibility Risk",
          "FOR - Soil Rutting Hazard"
        ]
      },
      
      forestRoads: {
        name: "Forest Roads",
        interpretations: [
          "FOR - Road Construction/Maintenance (Natural Surface)",
          "FOR - Construction Limitations for Haul Roads/Log Landings",
          "FOR - Road Suitability (Natural Surface)",
          "FOR - Road Suitability (Natural Surface) (OR)",
          "USFS Region 4, Native Surface Roads - Slope and AASHTO GI(P)",
          "USFS Region 4, Native Surface Roads - Slope and LEP(Pan)",
          "USFS Region 4, Native Surface Roads - Water Table v2"
        ]
      },
      
      hazardAssessment: {
        name: "Hazard Assessment",
        interpretations: [
          "FOR - Potential Erosion Hazard (Off-Road/Off-Trail)",
          "FOR - Potential Erosion Hazard (Road/Trail)",
          "FOR - Potential Fire Damage Hazard",
          "FOR - Windthrow Hazard",
          "BLM - Fire Damage Susceptibility",
          "FOR - Puddling Hazard",
          "FOR - Rutting Hazard by Month",
          "FOR - Rutting Hazard by Season"
        ]
      },
      
      limitations: {
        name: "Site Limitations",
        interpretations: [
          "FOR - Drought Vulnerable Soils",
          "FOR - Strength Limitation (1) REV",
          "FOR - Strength Limitation (2)",
          "FOR - Wetness Limitation (1)",
          "FOR - Wetness Limitation (8)"
        ]
      }
    }
  },

  // ==========================================================================
  // ENGINEERING & CONSTRUCTION
  // ==========================================================================
  engineering: {
    name: "Engineering & Construction",
    icon: "🏗️",
    color: "#7c3aed",
    subgroups: {
      
      buildings: {
        name: "Buildings & Foundations",
        interpretations: [
          "ENG - Dwellings W/O Basements",
          "ENG - Dwellings With Basements",
          "ENG - Small Commercial Buildings"
        ]
      },
      
      roads: {
        name: "Roads & Transportation",
        interpretations: [
          "ENG - Local Roads and Streets",
          "ENG - Unpaved Local Roads and Streets"
        ]
      },
      
      excavations: {
        name: "Excavations & Utilities",
        interpretations: [
          "ENG - Shallow Excavations",
          "ENG - Septic Tank Absorption Fields",
          "Cutbank Caving and Apparent Water Table",
          "Unstable Excavation Walls",
          "Unstable Excavation Walls, Catastrophic Events",
          "Unstable Excavation Walls, revised"
        ]
      },
      
      wasteManagement: {
        name: "Waste Management Systems",
        interpretations: [
          "ENG - Daily Cover for Landfill",
          "ENG - Sanitary Landfill (Area)",
          "ENG - Sanitary Landfill (Trench)",
          "ENG - Sewage Lagoons"
        ]
      },
      
      waterSystems: {
        name: "Water Management Systems",
        interpretations: [
          "ENG - Deep Infiltration Systems",
          "ENG - Shallow Infiltration Systems",
          "ENG - Lined Retention Systems",
          "ENG - Unlined Retention Systems"
        ]
      },
      
      materials: {
        name: "Construction Materials",
        interpretations: [
          "ENG - Construction Materials; Gravel Source",
          "ENG - Construction Materials; Gravel Source (OR)",
          "ENG - Construction Materials; Reclamation",
          "ENG - Construction Materials; Roadfill",
          "ENG - Construction Materials; Sand Source",
          "ENG - Construction Materials; Sand Source (OR)",
          "ENG - Construction Materials; Topsoil",
          "ENG - Construction Materials; Topsoil (OR)"
        ]
      },
      
      renewableEnergy: {
        name: "Renewable Energy",
        interpretations: [
          "ENG - Ground-based Solar Arrays, Ballast Anchor Systems",
          "ENG - Ground-based Solar Arrays, Soil-based Anchor Systems"
        ]
      },
      
      landscaping: {
        name: "Landscaping",
        interpretations: [
          "ENG - Lawn, Landscape, Golf Fairway"
        ]
      }
    }
  },

  // ==========================================================================
  // URBAN & RECREATION
  // ==========================================================================
  urbanRecreation: {
    name: "Urban & Recreation",
    icon: "🏙️",
    color: "#0891b2",
    subgroups: {
      
      recreation: {
        name: "Recreation Facilities",
        interpretations: [
          "URB/REC - Camp Areas",
          "URB/REC - Picnic Areas",
          "URB/REC - Playgrounds",
          "URB/REC - Off-Road Motorcycle Trails",
          "URB/REC - Paths and Trails"
        ]
      }
    }
  },

  // ==========================================================================
  // WATER MANAGEMENT
  // ==========================================================================
  waterManagement: {
    name: "Water Management",
    icon: "💧",
    color: "#0ea5e9",
    subgroups: {
      
      irrigation: {
        name: "Irrigation Systems",
        interpretations: [
          "WMS - Irrigation, General",
          "WMS - Irrigation, Micro (above ground)",
          "WMS - Irrigation, Micro (subsurface drip)",
          "WMS - Irrigation, Sprinkler (close spaced outlet drops)",
          "WMS - Irrigation, Sprinkler (general)",
          "WMS - Irrigation, Surface (graded)",
          "WMS - Irrigation, Surface (level)"
        ]
      },
      
      stormwater: {
        name: "Stormwater Management",
        interpretations: [
          "SWM - Deep Infiltration System Adsorption 150-200cm",
          "SWM - Deep Infiltration System Ksat 120-180cm",
          "SWM - Deep Infiltration System Water Table Depth 150-200cm",
          "SWM - Retention System Installation Water Table Depth",
          "SWM - Retention System Ksat 120-200cm",
          "SWM - Shallow Infiltration System Ksat 90-150cm",
          "SWM - Shallow Infiltration System Water Table Depth 100-150c",
          "SWM - Vegetation Establishment Difficulty"
        ]
      },
      
      subsurfaceManagement: {
        name: "Subsurface Water Management",
        interpretations: [
          "WMS - Subsurface Water Management, Outflow Quality",
          "WMS - Subsurface Water Management, System Installation",
          "WMS - Subsurface Water Management, System Performance",
          "WMS - Surface Water Management, System"
        ]
      },
      
      waterStructures: {
        name: "Water Structures",
        interpretations: [
          "WMS - Embankments, Dikes, and Levees",
          "WMS - Excavated Ponds (Aquifer-fed)",
          "WMS - Pond Reservoir Area"
        ]
      }
    }
  },

  // ==========================================================================
  // CONSERVATION PRACTICES
  // ==========================================================================
  conservation: {
    name: "Conservation Practices",
    icon: "🌱",
    color: "#16a34a",
    subgroups: {
      
      nrcsStandards: {
        name: "NRCS Conservation Practice Standards",
        interpretations: [
          "CPS - Brush Management (314)",
          "CPS - Cover Crop (340)",
          "CPS - Heavy Use Area Protection (561)"
        ]
      },
      
      hazardAssessment: {
        name: "Conservation Hazard Assessment",
        interpretations: [
          "CPS - Brush Management Rutting Hazard by Season",
          "CPS - Cover Crop Rutting Hazard",
          "CPS - Cover Crop Water Supplying Limitation",
          "CPS - Soil Erodibility",
          "CPS - Concrete Corrosion"
        ]
      }
    }
  },

  // ==========================================================================
  // SOIL HEALTH & PROPERTIES
  // ==========================================================================
  soilHealth: {
    name: "Soil Health & Properties",
    icon: "🧪",
    color: "#dc2626",
    subgroups: {
      
      soilHealthIndicators: {
        name: "Soil Health Indicators",
        interpretations: [
          "SOH - Agricultural Organic Soil Subsidence",
          "SOH - AWC Average 0-30cm",
          "SOH - Bulk Density Ratio Max 0-30cm",
          "SOH - Clay Content WTD_AVG to 30 cm Organic",
          "SOH - Dynamic Soil Properties Response to Biochar",
          "SOH - Limitations for Aerobic Soil Organisms",
          "SOH - Organic Carbon, kg/m2 to 30cm",
          "SOH - Organic Matter Depletion",
          "SOH - Organic Matter Loss Sensitivity",
          "SOH - Soil Susceptibility to Compaction"
        ]
      },
      
      physicalProperties: {
        name: "Physical Properties",
        interpretations: [
          "Clay and OM Content Thickest Layer to 40 inches, revised",
          "Clay and OM Content WTD_AVG to 100cm",
          "Clay Content 25 to 180cm, Weighted Average",
          "Clay Content Thickest Layer to 40 inches, revised",
          "Organic Matter (Industrial Hemp)",
          "Organic Matter < 1% to a Depth of 72 inches",
          "Organic Matter in surface Layer"
        ]
      },
      
      chemicalProperties: {
        name: "Chemical Properties",
        interpretations: [
          "pH Minimum (acid)",
          "Surface Reaction (pH 3.5 to 6.5)",
          "Surface Reaction (pH 5 to 6.5)",
          "Electrical Conductivity (Industrial Hemp)",
          "SOH - Salinity",
          "Steel Corrosion"
        ]
      },
      
      hydrologic: {
        name: "Hydrologic Properties",
        interpretations: [
          "Available Water Storage (Industrial Hemp)",
          "AWC Rule for Drought Susceptible Soils",
          "Water Table Rule (Industrial Hemp)",
          "Depth to Restriction (Industrial Hemp)"
        ]
      }
    }
  },

  // ==========================================================================
  // ENVIRONMENTAL HAZARDS
  // ==========================================================================
  environmentalHazards: {
    name: "Environmental Hazards",
    icon: "⚠️",
    color: "#dc2626",
    subgroups: {
      
      contamination: {
        name: "Contamination & Attenuation",
        interpretations: [
          "PFAS - Organic Matter Content for Attenuation",
          "PFAS - Amorphous Materials for Attenuation",
          "PFAS - Chemical Attenuation in Soils",
          "PFAS - Class, Transmits Rapidly to Groundwater",
          "PFAS - Class, Transmits to Surface Waters, Overland Flow",
          "PFAS - Movement Classes in Soils",
          "PFAS - Surface Unsaturated Soil for Attenuation",
          "WMS - Pesticide and Nutrient Movement"
        ]
      },
      
      bioaccumulation: {
        name: "Bioaccumulation & Sequestration",
        interpretations: [
          "Bioaccumulation Material Gain Potential",
          "Bioaccumulation Sorption",
          "DHS - Potential for Radioactive Bioaccumulation",
          "DHS - Potential for Radioactive Sequestration",
          "Sequestration Clay Content",
          "Sequestration Organic Surface"
        ]
      }
    }
  },

  // ==========================================================================
  // EMERGENCY & DISASTER MANAGEMENT
  // ==========================================================================
  emergencyManagement: {
    name: "Emergency & Disaster Management",
    icon: "🚨",
    color: "#b91c1c",
    subgroups: {
      
      animalMortality: {
        name: "Animal Mortality Disposal",
        interpretations: [
          "DHS - Catastrophic Event, Large Animal Mortality, Burial",
          "DHS - Catastrophic Event, Large Animal Mortality, Incinerate",
          "DHS - Catastrophic Mortality, Large Animal Disposal, Pit",
          "DHS - Catastrophic Mortality, Large Animal Disposal, Trench",
          "DHS - Emergency Animal Mortality Disposal by Shallow Burial"
        ]
      },
      
      wasteDisposal: {
        name: "Emergency Waste Disposal",
        interpretations: [
          "DHS - Emergency Land Disposal of Milk",
          "DHS - Rubble and Debris Disposal, Large-Scale Event"
        ]
      },
      
      facilities: {
        name: "Emergency Facilities",
        interpretations: [
          "DHS - Site for Composting Facility - Subsurface",
          "DHS - Site for Composting Facility - Surface",
          "DHS - Suitability for Clay Liner Material",
          "DHS - Suitability for Composting Medium and Final Cover",
          "Farm and Garden Composting Facility - Surface"
        ]
      }
    }
  },

  // ==========================================================================
  // MILITARY APPLICATIONS
  // ==========================================================================
  military: {
    name: "Military Applications",
    icon: "🎖️",
    color: "#374151",
    subgroups: {
      
      facilities: {
        name: "Military Facilities",
        interpretations: [
          "MIL - Bivouac Areas (DOD)",
          "MIL - Helicopter Landing Zones (DOD)"
        ]
      },
      
      excavations: {
        name: "Military Excavations",
        interpretations: [
          "MIL - Excavations Crew-Served Weapon Fighting Position (DOD)",
          "MIL - Excavations for Individual Fighting Position (DOD)",
          "MIL - Excavations for Vehicle Fighting Position (DOD)"
        ]
      },
      
      vehicleTrafficability: {
        name: "Vehicle Trafficability",
        interpretations: [
          // Vehicle Type 1
          "MIL - Trafficability Veh. Type 1 1-pass wet season (DOD)",
          "MIL - Trafficability Veh. Type 1 50-passes wet season (DOD)",
          "MIL - Trafficability Veh. Type 1 dry season (DOD)",
          // Vehicle Type 2
          "MIL - Trafficability Veh. Type 2 1-pass wet season (DOD)",
          "MIL - Trafficability Veh. Type 2 50-passes wet season (DOD)",
          "MIL - Trafficability Veh. Type 2 dry season (DOD)",
          // Vehicle Type 3
          "MIL - Trafficability Veh. Type 3 1-pass wet season (DOD)",
          "MIL - Trafficability Veh. Type 3 50-passes wet season (DOD)",
          "MIL - Trafficability Veh. Type 3 dry season (DOD)",
          // Vehicle Type 4
          "MIL - Trafficability Veh. Type 4 1-pass wet season (DOD)",
          "MIL - Trafficability Veh. Type 4 50-passes wet season (DOD)",
          "MIL - Trafficability Veh. Type 4 dry season (DOD)",
          // Vehicle Type 5
          "MIL - Trafficability Veh. Type 5 1-pass wet season (DOD)",
          "MIL - Trafficability Veh. Type 5 50-passes wet season (DOD)",
          "MIL - Trafficability Veh. Type 5 dry season (DOD)",
          // Vehicle Type 6
          "MIL - Trafficability Veh. Type 6 1-pass wet season (DOD)",
          "MIL - Trafficability Veh. Type 6 50-passes wet season (DOD)",
          "MIL - Trafficability Veh. Type 6 dry season (DOD)",
          // Vehicle Type 7
          "MIL - Trafficability Veh. Type 7 1-pass wet season (DOD)",
          "MIL - Trafficability Veh. Type 7 50-passes wet season (DOD)",
          "MIL - Trafficability Veh. Type 7 dry season (DOD)"
        ]
      }
    }
  },

  // ==========================================================================
  // GEOTECHNICAL PROPERTIES
  // ==========================================================================
  geotechnical: {
    name: "Geotechnical Properties",
    icon: "🔬",
    color: "#6366f1",
    subgroups: {
      
      strength: {
        name: "Soil Strength",
        interpretations: [
          "Soil Strength (AASHTO Group Index, 0-50cm)",
          "Strength (AASHTO GIN Weighted Average (25-100cm)) (Solar)",
          "Strength (AASHTO Group Index Thickest Layer 10 to 40\")",
          "Strength (AASHTO Group Index Weighted Average (25-100cm))",
          "Strength Limitation (2)",
          "Strength Limitation (3)"
        ]
      },
      
      compaction: {
        name: "Compaction & Packing",
        interpretations: [
          "Construction Compaction (revised)",
          "Compaction potential - rock fragment volume",
          "Compaction potential - structure rating, 0-30cm",
          "Compaction potential - texture and clay",
          "Compaction Risk - Bulk Density Difference",
          "Compaction Risk - Organic Matter Content",
          "Soil Materials for Packing, Unified and Kaolinitic",
          "Hard to Pack Subrule"
        ]
      },
      
      shrinkSwell: {
        name: "Shrink-Swell",
        interpretations: [
          "BLM - Shrink-Swell of Thickest Layer Within 0-24 inches)",
          "GRL-Shrink-Swell of Thickest Layer Within 0-24 inches)",
          "GRL-Shrink-Swell of Thickest Layer, 0-36 inches",
          "Shrink-Swell (LEP WTD_AVG 25-100cm or Bedrock)",
          "Shrink-Swell (LEP WTD_AVG Above Bedrock or 60\") (revised)",
          "Low Shrink-Swell (25 to 150cm or Restrictive Layer) Wt_Ave",
          "WMS - LEP thickest layer to 100cm or above restriction"
        ]
      }
    }
  }
};

// ==========================================================================
// UTILITY FUNCTIONS FOR INTERPRETATION MANAGEMENT
// ==========================================================================

/**
 * Get interpretation by name across all groups
 */
export function findInterpretation(interpretationName) {
  for (const [groupKey, group] of Object.entries(interpretationGroups)) {
    for (const [subgroupKey, subgroup] of Object.entries(group.subgroups || {})) {
      if (subgroup.interpretations.includes(interpretationName)) {
        return {
          group: groupKey,
          subgroup: subgroupKey,
          groupName: group.name,
          subgroupName: subgroup.name,
          interpretation: interpretationName
        };
      }
    }
  }
  return null;
}

/**
 * Get all interpretations for a specific group
 */
export function getGroupInterpretations(groupKey) {
  const group = interpretationGroups[groupKey];
  if (!group) return [];
  
  const allInterpretations = [];
  Object.values(group.subgroups || {}).forEach(subgroup => {
    allInterpretations.push(...subgroup.interpretations);
  });
  
  return allInterpretations;
}

/**
 * Get interpretation statistics for a dataset
 */
export function analyzeInterpretations(interpretationData) {
  const stats = {
    total: interpretationData.length,
    byGroup: {},
    byRating: {},
    highValue: [], // interpretations with value > 0.8
    lowValue: []   // interpretations with value < 0.2
  };
  
  // Initialize group counts
  Object.keys(interpretationGroups).forEach(key => {
    stats.byGroup[key] = 0;
  });
  
  interpretationData.forEach(interp => {
    // Group analysis
    const location = findInterpretation(interp.name);
    if (location) {
      stats.byGroup[location.group]++;
    }
    
    // Rating analysis
    if (!stats.byRating[interp.rating]) {
      stats.byRating[interp.rating] = 0;
    }
    stats.byRating[interp.rating]++;
    
    // Value analysis
    if (interp.value > 0.8) {
      stats.highValue.push(interp);
    } else if (interp.value < 0.2) {
      stats.lowValue.push(interp);
    }
  });
  
  return stats;
}

/**
 * Filter interpretations by group and rating
 */
export function filterInterpretations(interpretationData, groupKey = null, minValue = null, maxValue = null) {
  return interpretationData.filter(interp => {
    // Group filter
    if (groupKey) {
      const location = findInterpretation(interp.name);
      if (!location || location.group !== groupKey) {
        return false;
      }
    }
    
    // Value range filter
    if (minValue !== null && interp.value < minValue) {
      return false;
    }
    if (maxValue !== null && interp.value > maxValue) {
      return false;
    }
    
    return true;
  });
}

/**
 * Create summary for a specific group
 */
export function createGroupSummary(interpretationData, groupKey) {
  const group = interpretationGroups[groupKey];
  if (!group) return null;
  
  const groupInterps = filterInterpretations(interpretationData, groupKey);
  const summary = {
    group: group.name,
    icon: group.icon,
    color: group.color,
    totalCount: groupInterps.length,
    subgroups: {}
  };
  
  // Analyze by subgroup
  Object.entries(group.subgroups || {}).forEach(([subgroupKey, subgroup]) => {
    const subgroupInterps = groupInterps.filter(interp => 
      subgroup.interpretations.includes(interp.name)
    );
    
    summary.subgroups[subgroupKey] = {
      name: subgroup.name,
      count: subgroupInterps.length,
      interpretations: subgroupInterps,
      avgValue: subgroupInterps.reduce((sum, interp) => sum + interp.value, 0) / (subgroupInterps.length || 1)
    };
  });
  
  return summary;
}

export default interpretationGroups;
