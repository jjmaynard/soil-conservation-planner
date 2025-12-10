// Crop type classifications for transition validation
// Helps identify unlikely crop transitions (e.g., annual → permanent → annual in consecutive years)

export type CropType =
  | 'annual'
  | 'perennial'
  | 'permanent'
  | 'pasture'
  | 'forest'
  | 'developed'
  | 'water'
  | 'other'

/**
 * Estimated classification accuracy for crop types based on NASS CDL accuracy assessments
 * Major row crops (corn, soy, wheat) typically have 85-95% accuracy
 * Specialty crops and mixed classes have lower accuracy (60-80%)
 * Source: USDA NASS CDL Accuracy Assessment reports
 */
export const CROP_ACCURACY_ESTIMATES: Record<number, number> = {
  // High accuracy major crops (85-95%)
  1: 90, // Corn - large fields, distinct spectral signature
  5: 90, // Soybeans - large fields, distinct signature
  24: 88, // Winter Wheat - good seasonal separation
  23: 87, // Spring Wheat
  21: 85, // Barley

  // Good accuracy crops (80-85%)
  2: 82, // Cotton
  3: 83, // Rice - flooded fields distinctive
  4: 82, // Sorghum
  6: 80, // Sunflower
  22: 84, // Durum Wheat
  27: 82, // Rye
  28: 83, // Oats
  31: 81, // Canola

  // Moderate accuracy (70-80%)
  36: 75, // Alfalfa - multi-year stands
  37: 72, // Other Hay
  10: 78, // Peanuts
  42: 76, // Dry Beans
  43: 80, // Potatoes
  176: 70, // Grassland/Pasture - highly variable
  59: 68, // Sod/Grass Seed - similar to pasture

  // Lower accuracy specialty crops (60-75%)
  47: 65, // Misc Vegs & Fruits - mixed signatures
  54: 72, // Tomatoes
  49: 68, // Onions
  206: 70, // Carrots
  214: 68, // Broccoli
  227: 66, // Lettuce

  // Perennial/permanent crops (70-85%)
  69: 75, // Grapes - can confuse with other vineyard crops
  68: 78, // Apples
  66: 76, // Cherries
  67: 74, // Peaches
  72: 80, // Citrus - distinct in appropriate regions
  75: 78, // Almonds
  76: 77, // Walnuts
  204: 75, // Pistachios
  211: 76, // Olives

  // Land cover classes (75-90%)
  63: 85, // Forest - generally distinct
  141: 86, // Deciduous Forest
  142: 88, // Evergreen Forest
  82: 80, // Developed
  83: 92, // Water - very high accuracy
  111: 95, // Open Water - highest accuracy
  121: 78, // Developed/Open Space
  122: 80, // Developed/Low Intensity
  123: 82, // Developed/Med Intensity
  124: 85, // Developed/High Intensity

  // Double-crop classes (lower accuracy due to complexity)
  26: 70, // Dbl Crop WinWht/Soybeans
  225: 68, // Dbl Crop WinWht/Corn
  226: 67, // Dbl Crop Oats/Corn
  241: 72, // Dbl Crop Corn/Soybeans

  // Default for unlisted crops
  0: 50, // No data
  81: 0, // Clouds/No Data - no confidence
}

export const CROP_TYPE_MAP: Record<number, CropType> = {
  // Annual crops (planted and harvested each year)
  1: 'annual', // Corn
  2: 'annual', // Cotton
  3: 'annual', // Rice
  4: 'annual', // Sorghum
  5: 'annual', // Soybeans
  6: 'annual', // Sunflower
  10: 'annual', // Peanuts
  11: 'annual', // Tobacco
  12: 'annual', // Sweet Corn
  13: 'annual', // Pop or Orn Corn
  14: 'perennial', // Mint (perennial herb)
  21: 'annual', // Barley
  22: 'annual', // Durum Wheat
  23: 'annual', // Spring Wheat
  24: 'annual', // Winter Wheat
  25: 'annual', // Other Small Grains
  26: 'annual', // Dbl Crop WinWht/Soybeans
  27: 'annual', // Rye
  28: 'annual', // Oats
  29: 'annual', // Millet
  30: 'annual', // Speltz
  31: 'annual', // Canola
  32: 'annual', // Flaxseed
  33: 'annual', // Safflower
  34: 'annual', // Rape Seed
  35: 'annual', // Mustard
  36: 'perennial', // Alfalfa (multi-year stand)
  37: 'perennial', // Other Hay/Non Alfalfa
  38: 'annual', // Camelina
  39: 'annual', // Buckwheat
  41: 'annual', // Sugarbeets
  42: 'annual', // Dry Beans
  43: 'annual', // Potatoes
  44: 'annual', // Other Crops
  45: 'perennial', // Sugarcane (multi-year)
  46: 'annual', // Sweet Potatoes
  47: 'annual', // Misc Vegs & Fruits
  48: 'annual', // Watermelons
  49: 'annual', // Onions
  50: 'annual', // Cucumbers
  51: 'annual', // Chick Peas
  52: 'annual', // Lentils
  53: 'annual', // Peas
  54: 'annual', // Tomatoes
  55: 'perennial', // Caneberries (multi-year)
  56: 'perennial', // Hops (perennial)
  57: 'perennial', // Herbs
  58: 'perennial', // Clover/Wildflowers
  59: 'pasture', // Sod/Grass Seed
  60: 'perennial', // Switchgrass
  61: 'other', // Fallow/Idle Cropland
  63: 'forest', // Forest
  64: 'other', // Shrubland
  65: 'other', // Barren
  66: 'permanent', // Cherries (tree fruit, years to establish)
  67: 'permanent', // Peaches
  68: 'permanent', // Apples
  69: 'permanent', // Grapes (3-5 years to establish)
  70: 'permanent', // Christmas Trees
  71: 'permanent', // Other Tree Crops
  72: 'permanent', // Citrus
  74: 'permanent', // Pecans
  75: 'permanent', // Almonds
  76: 'permanent', // Walnuts
  77: 'permanent', // Pears
  81: 'other', // Clouds/No Data
  82: 'developed', // Developed
  83: 'water', // Water
  87: 'water', // Wetlands
  88: 'other', // Nonag/Undefined
  92: 'water', // Aquaculture
  111: 'water', // Open Water
  112: 'other', // Perennial Ice/Snow
  121: 'developed', // Developed/Open Space
  122: 'developed', // Developed/Low Intensity
  123: 'developed', // Developed/Med Intensity
  124: 'developed', // Developed/High Intensity
  131: 'other', // Barren
  141: 'forest', // Deciduous Forest
  142: 'forest', // Evergreen Forest
  143: 'forest', // Mixed Forest
  152: 'other', // Shrubland
  176: 'pasture', // Grassland/Pasture
  190: 'water', // Woody Wetlands
  195: 'water', // Herbaceous Wetlands
  204: 'permanent', // Pistachios
  205: 'annual', // Triticale
  206: 'annual', // Carrots
  207: 'perennial', // Asparagus (multi-year)
  208: 'annual', // Garlic
  209: 'annual', // Cantaloupes
  210: 'permanent', // Prunes
  211: 'permanent', // Olives
  212: 'permanent', // Oranges
  213: 'annual', // Honeydew Melons
  214: 'annual', // Broccoli
  216: 'annual', // Peppers
  217: 'permanent', // Pomegranates
  218: 'permanent', // Nectarines
  219: 'annual', // Greens
  220: 'permanent', // Plums
  221: 'perennial', // Strawberries (multi-year beds)
  222: 'annual', // Squash
  223: 'permanent', // Apricots
  224: 'annual', // Vetch
  225: 'annual', // Dbl Crop WinWht/Corn
  226: 'annual', // Dbl Crop Oats/Corn
  227: 'annual', // Lettuce
  229: 'annual', // Pumpkins
  230: 'annual', // Dbl Crop Lettuce/Durum Wht
  231: 'annual', // Dbl Crop Lettuce/Cantaloupe
  232: 'annual', // Dbl Crop Lettuce/Cotton
  233: 'annual', // Dbl Crop Lettuce/Barley
  234: 'annual', // Dbl Crop Durum Wht/Sorghum
  235: 'annual', // Dbl Crop Barley/Sorghum
  236: 'annual', // Dbl Crop WinWht/Sorghum
  237: 'annual', // Dbl Crop Barley/Corn
  238: 'annual', // Dbl Crop WinWht/Cotton
  239: 'annual', // Dbl Crop Soybeans/Cotton
  240: 'annual', // Dbl Crop Soybeans/Oats
  241: 'annual', // Dbl Crop Corn/Soybeans
  242: 'perennial', // Blueberries (multi-year bushes)
  243: 'annual', // Cabbage
  244: 'annual', // Cauliflower
  245: 'annual', // Celery
  246: 'annual', // Radishes
  247: 'annual', // Turnips
  248: 'annual', // Eggplants
  249: 'annual', // Gourds
  250: 'perennial', // Cranberries (multi-year bogs)
  254: 'annual', // Dbl Crop Barley/Soybeans
}

/**
 * Get estimated classification accuracy for a crop code
 * Returns percentage confidence based on NASS accuracy assessments
 * Major crops: 85-95%, Specialty crops: 60-80%, Land cover: 75-95%
 */
export function getEstimatedAccuracy(cropCode: number): number {
  // Check if we have a specific estimate
  if (CROP_ACCURACY_ESTIMATES[cropCode] !== undefined) {
    return CROP_ACCURACY_ESTIMATES[cropCode]
  }

  // Fall back to type-based estimates
  const cropType = CROP_TYPE_MAP[cropCode]
  switch (cropType) {
    case 'annual':
      return 75 // Default for annual crops
    case 'perennial':
      return 70 // Perennials slightly harder
    case 'permanent':
      return 73 // Tree crops moderate
    case 'pasture':
      return 68 // Pasture/grassland highly variable
    case 'forest':
      return 85 // Forest generally clear
    case 'developed':
      return 80 // Developed areas distinct
    case 'water':
      return 92 // Water very distinct
    default:
      return 65 // Conservative default for unknown
  }
}

/**
 * Validate transition between two crop types
 * Returns a warning message if the transition is unlikely
 */
export function validateTransition(
  fromType: CropType | undefined,
  toType: CropType | undefined,
  fromName: string,
  toName: string,
  confidence?: number,
): string | undefined {
  if (!fromType || !toType) return undefined

  // Permanent crops (orchards, vineyards) take 3-7 years to establish
  // Very unlikely to appear for just 1-2 years then switch
  if (toType === 'permanent') {
    return `${toName} typically requires 3-7 years to establish. Single-year detection may indicate misclassification${
      confidence ? ` (${confidence}% confidence)` : ''
    }.`
  }

  // Transitioning FROM permanent to annual is very suspicious
  if (fromType === 'permanent' && (toType === 'annual' || toType === 'pasture')) {
    return `Unlikely transition from established ${fromName} to ${toName}. Permanent crops are not typically removed after establishment${
      confidence ? ` (${confidence}% confidence)` : ''
    }.`
  }

  // Forest/developed appearing briefly is suspicious
  if ((toType === 'forest' || toType === 'developed') && fromType !== toType) {
    return `Land use change to ${toName} is typically permanent. Brief detection may indicate misclassification${
      confidence ? ` (${confidence}% confidence)` : ''
    }.`
  }

  return undefined
}

/**
 * Analyze crop history for unlikely patterns
 * Returns array of years with warnings
 */
export function analyzeCropHistory(
  history: Array<{ year: number; cropType?: CropType; cropName: string; confidence?: number }>,
) {
  const warnings: Array<{ year: number; warning: string }> = []

  for (let i = 0; i < history.length; i++) {
    const current = history[i]
    const prev = i > 0 ? history[i - 1] : null
    const next = i < history.length - 1 ? history[i + 1] : null

    // Check for single-year permanent crops (highly suspicious)
    if (current.cropType === 'permanent') {
      const prevDifferent = !prev || prev.cropType !== 'permanent'
      const nextDifferent = !next || next.cropType !== 'permanent'

      if (prevDifferent && nextDifferent) {
        warnings.push({
          year: current.year,
          warning: `Single year of ${
            current.cropName
          } is highly unlikely. Permanent crops take years to establish and produce${
            current.confidence ? ` (${current.confidence}% confidence)` : ''
          }.`,
        })
      }
    }

    // Check for unlikely transitions
    if (prev && current.cropType) {
      const transitionWarning = validateTransition(
        prev.cropType,
        current.cropType,
        prev.cropName,
        current.cropName,
        current.confidence,
      )
      if (transitionWarning) {
        warnings.push({
          year: current.year,
          warning: transitionWarning,
        })
      }
    }

    // Low confidence warnings
    if (current.confidence && current.confidence < 50) {
      warnings.push({
        year: current.year,
        warning: `Low confidence (${current.confidence}%) for ${current.cropName} classification.`,
      })
    }
  }

  return warnings
}
