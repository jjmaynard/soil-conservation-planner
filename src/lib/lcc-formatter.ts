// Land Capability Classification (LCC) Formatter
// Transforms SSURGO LCC interpretations into farmer-friendly information

import type { 
  LCCClass, 
  LCCRating, 
  LCCDescription, 
  LCCLimitation,
  ComponentLCC,
  FormattedLCCData,
  LimitationType,
  LimitationSeverity
} from '#src/types/lcc';

export class LCCFormatter {
  /**
   * Convert numeric class to Roman numeral
   */
  private static numericToRoman(num: number): LCCClass | null {
    const romanMap: Record<number, LCCClass> = {
      1: 'I',
      2: 'II',
      3: 'III',
      4: 'IV',
      5: 'V',
      6: 'VI',
      7: 'VII',
      8: 'VIII'
    };
    return romanMap[num] || null;
  }

  /**
   * Parse LCC class from SSURGO rating string
   * Handles both numeric ("2e", "3") and Roman numeral ("IIe", "III") formats
   */
  static parseLCCClass(rating_class: string | null | undefined): LCCClass | null {
    if (!rating_class) return null;
    
    // Try numeric format first (e.g., "2", "2e", "3w")
    const numericMatch = rating_class.match(/^(\d)/);
    if (numericMatch) {
      const num = parseInt(numericMatch[1]);
      return this.numericToRoman(num);
    }
    
    // Try Roman numeral format (e.g., "II", "IIe", "IIIw")
    const romanMatch = rating_class.match(/^([IV]{1,4})/);
    return romanMatch ? romanMatch[1] as LCCClass : null;
  }

  /**
   * Parse LCC subclass modifiers (e.g., "IIIe" -> "e", "IVew" -> "ew", "2e" -> "e")
   */
  static parseLCCSubclass(rating_class: string | null | undefined): string {
    if (!rating_class) return '';
    
    // Handle both numeric and Roman numeral formats
    // Match any letter modifiers after the class number/numeral
    const match = rating_class.match(/^(?:[IV]+|\d)([ewsc]+)?/);
    return match?.[1] || '';
  }

  /**
   * Get farmer-friendly description for LCC class
   */
  static getClassDescription(lccClass: LCCClass | null, isIrrigated: boolean = false): LCCDescription {
    if (!lccClass) {
      return {
        summary: 'Classification unavailable',
        description: 'Land capability classification not available for this area.',
        management: 'Consult local soil scientist for management recommendations.',
        crops: 'Contact your local NRCS office for crop suitability information.'
      };
    }

    const irrigationType = isIrrigated ? 'with irrigation' : 'without irrigation';
    
    const descriptions: Record<LCCClass, LCCDescription> = {
      'I': {
        summary: `Excellent cropland ${irrigationType}`,
        description: `This is prime agricultural land with few limitations. Suitable for all common crops with proper management. ${isIrrigated ? 'Irrigation enhances productivity and crop options.' : 'Well-suited for rainfed agriculture.'}`,
        management: 'Standard farming practices. Focus on maintaining soil health and preventing erosion.',
        crops: 'All common field crops, vegetables, orchards, and pasture.'
      },
      'II': {
        summary: `Good cropland ${irrigationType}`,
        description: `High-quality agricultural land with minor limitations that reduce crop choice or require special management.${isIrrigated ? ' Irrigation helps overcome moisture limitations.' : ''}`,
        management: 'Conservation practices recommended. May need terracing, drainage, or specific tillage practices.',
        crops: 'Most field crops and pasture. Some specialty crops may have limitations.'
      },
      'III': {
        summary: `Moderate cropland ${irrigationType}`,
        description: `Agricultural land with noticeable limitations that reduce crop choice and require careful management.${isIrrigated ? ' Irrigation significantly improves productivity.' : ''}`,
        management: 'Intensive conservation practices required. May need specialized equipment or modified farming systems.',
        crops: 'Limited crop rotation options. Best suited for hay, pasture, or specific adapted crops.'
      },
      'IV': {
        summary: `Limited cropland ${irrigationType}`,
        description: `Land with severe limitations that restrict crop choice to a few adapted species or require very careful management.${isIrrigated ? ' Irrigation may enable limited crop production.' : ''}`,
        management: 'Intensive conservation required. Consider alternative land uses if cropping is not profitable.',
        crops: 'Very limited crop options. Primarily hay, pasture, or specialty crops with specific adaptations.'
      },
      'V': {
        summary: `Non-cropland ${irrigationType}`,
        description: `Land not suitable for cultivation due to wetness, stones, or other factors, but suitable for grazing or forestry. ${isIrrigated ? 'Irrigation does not overcome fundamental limitations.' : 'Physical limitations prevent cultivation.'}`,
        management: 'Managed grazing, forestry, or wildlife habitat. Protect from overgrazing.',
        crops: 'Native pasture, improved pasture with limitations, or forestry.'
      },
      'VI': {
        summary: `Limited grazing land`,
        description: `Land with severe limitations that make it unsuitable for cultivation and limit its use for grazing or forestry. Steep slopes, shallow soils, or excessive wetness are common.`,
        management: 'Light grazing only. Focus on erosion control and vegetation maintenance.',
        crops: 'Native vegetation, wildlife habitat, limited grazing.'
      },
      'VII': {
        summary: `Very limited grazing land`,
        description: `Land with very severe limitations that make it unsuitable for cultivation and severely limit grazing use. Best for wildlife, watershed protection, or recreation.`,
        management: 'Minimal disturbance. Protect natural vegetation and prevent erosion.',
        crops: 'Wildlife habitat, watershed protection, recreation. Very limited grazing if any.'
      },
      'VIII': {
        summary: `Non-agricultural land`,
        description: `Land not suitable for agriculture, grazing, or commercial forestry due to extreme limitations. Best used for wildlife, watershed protection, recreation, or aesthetic purposes.`,
        management: 'Preserve in natural state. No agricultural use recommended.',
        crops: 'Wildlife habitat, watershed protection, recreation only.'
      }
    };

    return descriptions[lccClass];
  }

  /**
   * Get descriptions for subclass modifiers with land use capability context
   */
  static getSubclassDescriptions(subclass: string, lccClass?: LCCClass | null): Array<{ code: string; name: string; description: string; management: string }> {
    // Determine land use capability
    const isCropland = lccClass && ['I', 'II', 'III', 'IV'].includes(lccClass);
    const isGrazingLand = lccClass && ['V', 'VI'].includes(lccClass);
    const isNonAgricultural = lccClass && ['VII', 'VIII'].includes(lccClass);

    const subclassInfo: Record<string, { name: string; description: string; management: string }> = {
      'e': {
        name: 'Erosion Risk',
        description: isCropland 
          ? 'Risk of soil erosion by water or wind that affects crop production and soil productivity'
          : isGrazingLand
          ? 'Risk of soil erosion by water or wind that limits grazing management and vegetation maintenance'
          : isNonAgricultural
          ? 'Risk of soil erosion by water or wind that threatens natural vegetation and watershed integrity'
          : 'Risk of soil erosion by water or wind',
        management: isCropland
          ? 'Use conservation tillage, cover crops, terracing, or windbreaks'
          : isGrazingLand
          ? 'Manage grazing intensity, maintain vegetation cover, install erosion control structures'
          : isNonAgricultural
          ? 'Maintain natural vegetation, minimize disturbance, install erosion control structures where needed'
          : 'Use conservation tillage, cover crops, terracing, or windbreaks'
      },
      'w': {
        name: 'Wetness',
        description: isCropland
          ? 'Excess water limits field access, delays planting and harvest, and can cause crop loss'
          : isGrazingLand
          ? 'Excess water limits livestock access, creates muddy conditions, and may require seasonal grazing restrictions'
          : isNonAgricultural
          ? 'Excess water creates wetland conditions best suited for wildlife habitat and watershed protection'
          : 'Excess water limits use during wet periods',
        management: isCropland
          ? 'May need controlled drainage, raised beds, or timing adjustments for field operations'
          : isGrazingLand
          ? 'Restrict grazing during wet periods, establish stable access routes and livestock paths'
          : isNonAgricultural
          ? 'Protect wetland functions, maintain buffer zones, preserve natural hydrology'
          : 'May need drainage, raised beds, or timing adjustments for field operations'
      },
      's': {
        name: 'Soil Limitations',
        description: isCropland
          ? 'Soil depth, stones, low water-holding capacity, or chemical problems that restrict root development and reduce crop yield'
          : isGrazingLand
          ? 'Soil depth, stones, low water-holding capacity, or chemical problems that limit forage production and carrying capacity'
          : isNonAgricultural
          ? 'Soil depth, stones, low water-holding capacity, or chemical problems that limit vegetation establishment'
          : 'Soil depth, stones, low water capacity, or chemical problems',
        management: isCropland
          ? 'May require soil amendments, specialized equipment, adapted crop selection, or modified tillage practices'
          : isGrazingLand
          ? 'Select adapted forage species, manage stocking rates based on productivity, consider soil amendments for pasture improvement'
          : isNonAgricultural
          ? 'Allow natural vegetation adapted to soil conditions, avoid soil disturbance'
          : 'May require soil amendments, specialized equipment, or crop selection'
      },
      'c': {
        name: 'Climate Limitations',
        description: isCropland
          ? 'Temperature or moisture deficiency that shortens growing season and limits crop selection'
          : isGrazingLand
          ? 'Temperature or moisture deficiency that reduces forage production and extends dormant season'
          : isNonAgricultural
          ? 'Temperature or moisture deficiency that determines natural vegetation type and productivity'
          : 'Temperature or moisture deficiency affects crop growth',
        management: isCropland
          ? 'Select appropriate varieties for shorter seasons, consider irrigation, adjust planting and harvest dates'
          : isGrazingLand
          ? 'Adjust stocking rates for climate-limited forage production, provide supplemental feed during dormant periods'
          : isNonAgricultural
          ? 'Preserve native vegetation adapted to local climate conditions'
          : 'Select appropriate varieties, consider irrigation, or adjust planting dates'
      }
    };

    return Array.from(subclass).map(char => ({
      code: char,
      ...subclassInfo[char]
    })).filter(item => item.name);
  }

  /**
   * Identify limitations from LCC subclass modifiers, enhanced with component data
   */
  static identifyLimitations(component: any, isIrrigated: boolean = false): LCCLimitation[] {
    const limitations: LCCLimitation[] = [];

    // Extract LCC subclass modifiers - these define what limitations exist
    // Use only the subclass for the specified irrigation condition
    const subclassString = isIrrigated 
      ? (component.irrcapscl || '')
      : (component.nirrcapscl || '')
    const subclassModifiers: string[] = Array.from(new Set(subclassString.split(''))).filter((v): v is string => !!v)

    // Get LCC class for severity determination - use the appropriate class for the condition
    const lccClass = isIrrigated ? (component.irrcapcl || component.nirrcapcl) : (component.nirrcapcl || component.irrcapcl)
    const classNum = lccClass ? parseInt(lccClass) : 0

    // Process each subclass modifier
    subclassModifiers.forEach((modifier) => {
      switch(modifier) {
        case 'e': {
          // Erosion/Slope limitation
          const slope = component.slope_r || component.slope_percent;
          
          if (slope !== null && slope !== undefined) {
            // Use actual slope data to determine severity
            if (slope > 20) {
              limitations.push({
                type: 'erosion',
                severity: 'very_severe',
                description: `Very steep slopes (${slope}%) greatly increase erosion risk and limit equipment use`,
                value: slope
              });
            } else if (slope > 12) {
              limitations.push({
                type: 'erosion',
                severity: 'severe',
                description: `Steep slopes (${slope}%) increase erosion risk and require special equipment`,
                value: slope
              });
            } else if (slope > 6) {
              limitations.push({
                type: 'erosion',
                severity: 'moderate',
                description: `Moderate slopes (${slope}%) require conservation practices to prevent erosion`,
                value: slope
              });
            } else {
              limitations.push({
                type: 'erosion',
                severity: 'slight',
                description: `Gentle slopes (${slope}%) may have erosion concerns requiring conservation practices`,
                value: slope
              });
            }
          } else {
            // No slope data - infer severity from LCC class
            const severity: LimitationSeverity = 
              classNum >= 7 ? 'very_severe' :
              classNum >= 5 ? 'severe' :
              classNum >= 3 ? 'moderate' : 'slight';
            
            limitations.push({
              type: 'erosion',
              severity,
              description: `Erosion risk present due to slope, wind, or other factors`,
              value: `Class ${lccClass} erosion limitation`
            });
          }
          break;
        }

        case 'w': {
          // Wetness limitation
          const drainage = component.drainagecl || component.drainage_class;
          const flooding = component.flodfreqcl;
          const ponding = component.pondfreqcl;
          
          // Check for specific wetness causes
          if (flooding && !['none', 'very rare'].some(term => flooding.toLowerCase().includes(term))) {
            const severity: LimitationSeverity = 
              flooding.toLowerCase().includes('frequent') ? 'severe' :
              flooding.toLowerCase().includes('occasional') ? 'moderate' : 'slight';
            
            limitations.push({
              type: 'wetness',
              severity,
              description: `Wetness due to ${flooding.toLowerCase()} flooding affects crop timing, equipment access, and may cause crop loss`,
              value: flooding
            });
          } else if (ponding && !['none', 'very rare'].some(term => ponding.toLowerCase().includes(term))) {
            limitations.push({
              type: 'wetness',
              severity: 'moderate',
              description: `Wetness due to ${ponding.toLowerCase()} ponding can delay planting and affect crop establishment`,
              value: ponding
            });
          } else if (drainage) {
            // Use drainage class data
            const drainageLower = drainage.toLowerCase();
            if (drainageLower.includes('very poorly')) {
              limitations.push({
                type: 'wetness',
                severity: 'very_severe',
                description: `Wetness from very poor drainage severely restricts root development and limits field access`,
                value: drainage
              });
            } else if (drainageLower.includes('poorly')) {
              limitations.push({
                type: 'wetness',
                severity: 'severe',
                description: `Wetness from poor drainage limits root development and machinery use during wet periods`,
                value: drainage
              });
            } else if (drainageLower.includes('somewhat poorly')) {
              limitations.push({
                type: 'wetness',
                severity: 'moderate',
                description: `Wetness from somewhat poor drainage - seasonal wetness affects field operations`,
                value: drainage
              });
            } else {
              // Has drainage data but doesn't match expected patterns
              const severity: LimitationSeverity = 
                classNum >= 5 ? 'severe' :
                classNum >= 3 ? 'moderate' : 'slight';
              
              limitations.push({
                type: 'wetness',
                severity,
                description: `Excess water limits use - drainage class: ${drainage}`,
                value: drainage
              });
            }
          } else {
            // No specific wetness data - infer severity from LCC class
            const severity: LimitationSeverity = 
              classNum >= 5 ? 'severe' :
              classNum >= 3 ? 'moderate' : 'slight';
            
            limitations.push({
              type: 'wetness',
              severity,
              description: `Excess water limits use - may be due to poor drainage, flooding, or ponding`,
              value: `Class ${lccClass} wetness limitation`
            });
          }
          break;
        }

        case 's': {
          // Soil limitation
          const restrictions = component.reskind;
          const depth = component.resdept_r;
          
          if (restrictions || depth !== null && depth !== undefined) {
            let description = 'Soil limitations: ';
            const details = [];
            if (restrictions) details.push(restrictions);
            if (depth !== null && depth !== undefined) details.push(`restrictive layer at ${depth}cm`);
            description += details.join(', ');
            
            const severity: LimitationSeverity = 
              classNum >= 7 ? 'very_severe' :
              classNum >= 5 ? 'severe' :
              classNum >= 3 ? 'moderate' : 'slight';
            
            limitations.push({
              type: 'soil_limitations',
              severity,
              description,
              value: restrictions || `${depth}cm depth`
            });
          } else {
            // No specific soil data - infer from LCC class
            const severity: LimitationSeverity = 
              classNum >= 7 ? 'very_severe' :
              classNum >= 5 ? 'severe' :
              classNum >= 3 ? 'moderate' : 'slight';
            
            limitations.push({
              type: 'soil_limitations',
              severity,
              description: `Soil limitations such as depth, stones, low water capacity, or chemical problems`,
              value: `Class ${lccClass} soil limitation`
            });
          }
          break;
        }

        case 'c': {
          // Climate limitation
          const tempClass = component.taxtempcl;
          const frostAction = component.frostact;
          
          if (tempClass || frostAction) {
            let description = 'Climate limitations: ';
            const details = [];
            if (tempClass) details.push(`${tempClass} temperature regime`);
            if (frostAction) details.push(`${frostAction} frost action`);
            description += details.join(', ');
            
            const severity: LimitationSeverity = 
              classNum >= 7 ? 'very_severe' :
              classNum >= 5 ? 'severe' :
              classNum >= 3 ? 'moderate' : 'slight';
            
            limitations.push({
              type: 'climate',
              severity,
              description,
              value: tempClass || frostAction
            });
          } else {
            // No specific climate data - infer from LCC class
            const severity: LimitationSeverity = 
              classNum >= 7 ? 'very_severe' :
              classNum >= 5 ? 'severe' :
              classNum >= 3 ? 'moderate' : 'slight';
            
            limitations.push({
              type: 'climate',
              severity,
              description: `Climate limitations such as temperature or moisture deficiency affect crop growth`,
              value: `Class ${lccClass} climate limitation`
            });
          }
          break;
        }
      }
    });

    return limitations;
  }

  /**
   * Format complete LCC data for display
   */
  static formatLCCData(components: any[]): FormattedLCCData {
    if (!components || components.length === 0) {
      return {
        dominant_lcc: { irrigated: null, nonirrigated: null },
        irrigated_description: this.getClassDescription(null, true),
        nonirrigated_description: this.getClassDescription(null, false),
        irrigated_limitations: [],
        nonirrigated_limitations: [],
        components: [],
        irrigated_management: {
          suitable_crops: [],
          conservation_practices: [],
          key_considerations: []
        },
        nonirrigated_management: {
          suitable_crops: [],
          conservation_practices: [],
          key_considerations: []
        }
      };
    }

    // Find dominant component (highest percentage with major flag)
    const dominantComponent = components
      .filter(c => c.majcompflag === 'Yes')
      .sort((a, b) => (b.comppct_r || 0) - (a.comppct_r || 0))[0] || components[0];

    // Extract LCC ratings for dominant component
    // Use direct component fields: nirrcapcl (non-irrigated class), irrcapcl (irrigated class)
    // Note: SSURGO stores class and subclass in separate fields
    const irrigatedClass = this.parseLCCClass(dominantComponent.irrcapcl);
    const irrigated_lcc: LCCRating | null = irrigatedClass ? {
      class: irrigatedClass,
      subclass: dominantComponent.irrcapscl || this.parseLCCSubclass(dominantComponent.irrcapcl),
      rating_value: undefined,
      certainty: undefined
    } : null;

    const nonirrigatedClass = this.parseLCCClass(dominantComponent.nirrcapcl);
    const nonirrigated_lcc: LCCRating | null = nonirrigatedClass ? {
      class: nonirrigatedClass,
      subclass: dominantComponent.nirrcapscl || this.parseLCCSubclass(dominantComponent.nirrcapcl),
      rating_value: undefined,
      certainty: undefined
    } : null;

    // Identify limitations for each condition separately
    const irrigated_limitations = irrigatedClass ? this.identifyLimitations(dominantComponent, true) : [];
    const nonirrigated_limitations = nonirrigatedClass ? this.identifyLimitations(dominantComponent, false) : [];

    // Get descriptions
    const irrigated_description = this.getClassDescription(irrigated_lcc?.class || null, true);
    const nonirrigated_description = this.getClassDescription(nonirrigated_lcc?.class || null, false);

    // Compile component summary
    const componentSummary = components
      .filter(c => (c.comppct_r || 0) >= 5)
      .map(c => {
        return {
          name: c.compname,
          percent: c.comppct_r,
          irrigated_class: c.irrcapcl || null,
          irrigated_subclass: c.irrcapscl || null,
          nonirrigated_class: c.nirrcapcl || null,
          nonirrigated_subclass: c.nirrcapscl || null
        };
      });

    // Generate management summaries for each condition
    const irrigated_management = irrigatedClass 
      ? this.generateManagementSummary(irrigated_lcc, null, irrigated_limitations)
      : { suitable_crops: [], conservation_practices: [], key_considerations: [] };
    
    const nonirrigated_management = nonirrigatedClass
      ? this.generateManagementSummary(nonirrigated_lcc, null, nonirrigated_limitations)
      : { suitable_crops: [], conservation_practices: [], key_considerations: [] };

    return {
      dominant_lcc: { irrigated: irrigated_lcc, nonirrigated: nonirrigated_lcc },
      irrigated_description,
      nonirrigated_description,
      irrigated_limitations,
      nonirrigated_limitations,
      components: componentSummary,
      irrigated_management,
      nonirrigated_management
    };
  }

  /**
   * Generate management summary based on LCC and limitations
   */
  private static generateManagementSummary(
    nonirrigated: LCCRating | null,
    irrigated: LCCRating | null,
    limitations: LCCLimitation[]
  ) {
    const suitable_crops: string[] = [];
    const conservation_practices: string[] = [];
    const key_considerations: string[] = [];

    const primaryClass = nonirrigated?.class || irrigated?.class;

    // Crop suitability by class
    if (['I', 'II'].includes(primaryClass || '')) {
      suitable_crops.push('All common field crops', 'Vegetables', 'Orchards', 'Pasture');
    } else if (['III', 'IV'].includes(primaryClass || '')) {
      suitable_crops.push('Hay', 'Pasture', 'Small grains', 'Adapted row crops');
    } else if (['V', 'VI'].includes(primaryClass || '')) {
      suitable_crops.push('Native pasture', 'Improved pasture', 'Forestry');
    }

    // Conservation practices based on limitations and land use capability
    const isCropland = ['I', 'II', 'III', 'IV'].includes(primaryClass || '');
    const isGrazingLand = ['V', 'VI'].includes(primaryClass || '');
    const isNonAgricultural = ['VII', 'VIII'].includes(primaryClass || '');

    if (limitations.some(l => l.type === 'erosion' || l.type === 'slope')) {
      if (isCropland) {
        conservation_practices.push('Contour farming', 'Terracing', 'Cover crops', 'No-till or reduced tillage');
      } else if (isGrazingLand) {
        conservation_practices.push('Managed grazing intensity', 'Erosion control structures', 'Vegetation maintenance');
      } else if (isNonAgricultural) {
        conservation_practices.push('Maintain natural vegetation', 'Erosion control structures', 'Minimize disturbance');
      }
    }

    if (limitations.some(l => l.type === 'wetness')) {
      if (isCropland) {
        conservation_practices.push('Controlled drainage', 'Raised beds', 'Crop timing adjustments');
      } else if (isGrazingLand) {
        conservation_practices.push('Restrict grazing during wet periods', 'Establish stable access routes', 'Wetland protection');
      } else if (isNonAgricultural) {
        conservation_practices.push('Wetland conservation', 'Wildlife habitat protection', 'Buffer zones');
      }
    }

    if (limitations.some(l => l.type === 'flooding')) {
      if (isCropland) {
        conservation_practices.push('Flood-tolerant crops', 'Crop insurance', 'Alternative land use during flood season');
      } else if (isGrazingLand) {
        conservation_practices.push('Emergency livestock management plan', 'Floodplain grazing restrictions');
      } else if (isNonAgricultural) {
        conservation_practices.push('Floodplain conservation', 'Riparian buffer maintenance', 'Natural flood storage');
      }
    }

    // Key considerations
    if (irrigated && nonirrigated && irrigated.class < nonirrigated.class) {
      key_considerations.push('Irrigation significantly improves productivity on this soil');
    }
    if (limitations.length > 3) {
      key_considerations.push('Multiple limitations require careful, integrated management');
    }
    if (primaryClass && ['VI', 'VII', 'VIII'].includes(primaryClass)) {
      key_considerations.push('Consider non-crop uses: wildlife habitat, recreation, or conservation');
    }

    return { suitable_crops, conservation_practices, key_considerations };
  }
}
