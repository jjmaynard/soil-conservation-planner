// CDL (Cropland Data Layer) Query Utilities
// Query crop types at a specific point for multiple years

import { analyzeCropHistory, CROP_TYPE_MAP, getEstimatedAccuracy, type CropType } from './cdlCropTypes'

export interface CDLYearData {
  year: number
  cropCode: number
  cropName: string
  color: string
  confidence?: number // 0-100, CropScape confidence level
  cropType?: CropType
  transitionWarning?: string // Warning for unlikely transitions
}

// CDL Crop code to name mapping (subset of most common crops)
// Full list: https://www.nass.usda.gov/Research_and_Science/Cropland/sarsfaqs2.php#Section1_14.0
export const CDL_CROP_CODES: Record<number, { name: string; color: string }> = {
  1: { name: 'Corn', color: '#ffd400' },
  2: { name: 'Cotton', color: '#ff2626' },
  3: { name: 'Rice', color: '#00a9e6' },
  4: { name: 'Sorghum', color: '#ff9e0f' },
  5: { name: 'Soybeans', color: '#267300' },
  6: { name: 'Sunflower', color: '#ffff00' },
  10: { name: 'Peanuts', color: '#70a800' },
  11: { name: 'Tobacco', color: '#00af4d' },
  12: { name: 'Sweet Corn', color: '#e0a60f' },
  13: { name: 'Pop or Orn Corn', color: '#e0a60f' },
  14: { name: 'Mint', color: '#80d4ff' },
  21: { name: 'Barley', color: '#e2007f' },
  22: { name: 'Durum Wheat', color: '#8a6453' },
  23: { name: 'Spring Wheat', color: '#d9b56c' },
  24: { name: 'Winter Wheat', color: '#a87000' },
  25: { name: 'Other Small Grains', color: '#d69dbc' },
  26: { name: 'Dbl Crop WinWht/Soybeans', color: '#737300' },
  27: { name: 'Rye', color: '#ae017e' },
  28: { name: 'Oats', color: '#a15889' },
  29: { name: 'Millet', color: '#73004c' },
  30: { name: 'Speltz', color: '#d69dbc' },
  31: { name: 'Canola', color: '#d1ff00' },
  32: { name: 'Flaxseed', color: '#8099ff' },
  33: { name: 'Safflower', color: '#d6d600' },
  34: { name: 'Rape Seed', color: '#d1ff00' },
  35: { name: 'Mustard', color: '#00af4d' },
  36: { name: 'Alfalfa', color: '#ffa8e3' },
  37: { name: 'Other Hay/Non Alfalfa', color: '#a5f58d' },
  38: { name: 'Camelina', color: '#00af4d' },
  39: { name: 'Buckwheat', color: '#d69dbc' },
  41: { name: 'Sugarbeets', color: '#a900e6' },
  42: { name: 'Dry Beans', color: '#a80000' },
  43: { name: 'Potatoes', color: '#732600' },
  44: { name: 'Other Crops', color: '#00af4d' },
  45: { name: 'Sugarcane', color: '#b380ff' },
  46: { name: 'Sweet Potatoes', color: '#732600' },
  47: { name: 'Misc Vegs & Fruits', color: '#ff6666' },
  48: { name: 'Watermelons', color: '#ff6666' },
  49: { name: 'Onions', color: '#ffcc66' },
  50: { name: 'Cucumbers', color: '#ff6666' },
  51: { name: 'Chick Peas', color: '#00af4d' },
  52: { name: 'Lentils', color: '#00deb0' },
  53: { name: 'Peas', color: '#55ff00' },
  54: { name: 'Tomatoes', color: '#f5a27a' },
  55: { name: 'Caneberries', color: '#ff6666' },
  56: { name: 'Hops', color: '#00af4d' },
  57: { name: 'Herbs', color: '#80d4ff' },
  58: { name: 'Clover/Wildflowers', color: '#e8beff' },
  59: { name: 'Sod/Grass Seed', color: '#b2ffde' },
  60: { name: 'Switchgrass', color: '#00af4d' },
  61: { name: 'Fallow/Idle Cropland', color: '#bfbf7a' },
  63: { name: 'Forest', color: '#95ce93' },
  64: { name: 'Shrubland', color: '#c7d79e' },
  65: { name: 'Barren', color: '#ccbfa3' },
  66: { name: 'Cherries', color: '#ff00ff' },
  67: { name: 'Peaches', color: '#ff91ab' },
  68: { name: 'Apples', color: '#b90050' },
  69: { name: 'Grapes', color: '#704489' },
  70: { name: 'Christmas Trees', color: '#007878' },
  71: { name: 'Other Tree Crops', color: '#b39c70' },
  72: { name: 'Citrus', color: '#ffff80' },
  74: { name: 'Pecans', color: '#b6705c' },
  75: { name: 'Almonds', color: '#00a884' },
  76: { name: 'Walnuts', color: '#ebd6b0' },
  77: { name: 'Pears', color: '#b39c70' },
  81: { name: 'Clouds/No Data', color: '#f7f7f7' },
  82: { name: 'Developed', color: '#9c9c9c' },
  83: { name: 'Water', color: '#4d70a3' },
  87: { name: 'Wetlands', color: '#80b3b3' },
  88: { name: 'Nonag/Undefined', color: '#e9ffbe' },
  92: { name: 'Aquaculture', color: '#00ffff' },
  111: { name: 'Open Water', color: '#4d70a3' },
  112: { name: 'Perennial Ice/Snow', color: '#d4e3fc' },
  121: { name: 'Developed/Open Space', color: '#9c9c9c' },
  122: { name: 'Developed/Low Intensity', color: '#9c9c9c' },
  123: { name: 'Developed/Med Intensity', color: '#9c9c9c' },
  124: { name: 'Developed/High Intensity', color: '#9c9c9c' },
  131: { name: 'Barren', color: '#ccbfa3' },
  141: { name: 'Deciduous Forest', color: '#95ce93' },
  142: { name: 'Evergreen Forest', color: '#95ce93' },
  143: { name: 'Mixed Forest', color: '#95ce93' },
  152: { name: 'Shrubland', color: '#c7d79e' },
  176: { name: 'Grassland/Pasture', color: '#e9ffbe' },
  190: { name: 'Woody Wetlands', color: '#80b3b3' },
  195: { name: 'Herbaceous Wetlands', color: '#80b3b3' },
  204: { name: 'Pistachios', color: '#00ff8c' },
  205: { name: 'Triticale', color: '#d69dbc' },
  206: { name: 'Carrots', color: '#ff6666' },
  207: { name: 'Asparagus', color: '#ff6666' },
  208: { name: 'Garlic', color: '#ff6666' },
  209: { name: 'Cantaloupes', color: '#ff6666' },
  210: { name: 'Prunes', color: '#ff91ab' },
  211: { name: 'Olives', color: '#344a34' },
  212: { name: 'Oranges', color: '#e67525' },
  213: { name: 'Honeydew Melons', color: '#ff6666' },
  214: { name: 'Broccoli', color: '#ff6666' },
  215: { name: 'Avocados', color: '#66994d' },
  216: { name: 'Peppers', color: '#ff6666' },
  217: { name: 'Pomegranates', color: '#b39c70' },
  218: { name: 'Nectarines', color: '#ff91ab' },
  219: { name: 'Greens', color: '#ff6666' },
  220: { name: 'Plums', color: '#ff91ab' },
  221: { name: 'Strawberries', color: '#ff6666' },
  222: { name: 'Squash', color: '#ff6666' },
  223: { name: 'Apricots', color: '#ff91ab' },
  224: { name: 'Vetch', color: '#00af4d' },
  225: { name: 'Dbl Crop WinWht/Corn', color: '#ffd400' },
  226: { name: 'Dbl Crop Oats/Corn', color: '#ffd400' },
  227: { name: 'Lettuce', color: '#ff6666' },
  228: { name: 'Dbl Crop Triticale/Corn', color: '#ffd400' },
  229: { name: 'Pumpkins', color: '#ff6666' },
  230: { name: 'Dbl Crop Lettuce/Durum Wht', color: '#8a6453' },
  231: { name: 'Dbl Crop Lettuce/Cantaloupe', color: '#ff6666' },
  232: { name: 'Dbl Crop Lettuce/Cotton', color: '#ff2626' },
  233: { name: 'Dbl Crop Lettuce/Barley', color: '#e2007f' },
  234: { name: 'Dbl Crop Durum Wht/Sorghum', color: '#ff9e0f' },
  235: { name: 'Dbl Crop Barley/Sorghum', color: '#ff9e0f' },
  236: { name: 'Dbl Crop WinWht/Sorghum', color: '#a87000' },
  237: { name: 'Dbl Crop Barley/Corn', color: '#ffd400' },
  238: { name: 'Dbl Crop WinWht/Cotton', color: '#a87000' },
  239: { name: 'Dbl Crop Soybeans/Cotton', color: '#267300' },
  240: { name: 'Dbl Crop Soybeans/Oats', color: '#267300' },
  241: { name: 'Dbl Crop Corn/Soybeans', color: '#ffd400' },
  242: { name: 'Blueberries', color: '#000099' },
  243: { name: 'Cabbage', color: '#ff6666' },
  244: { name: 'Cauliflower', color: '#ff6666' },
  245: { name: 'Celery', color: '#ff6666' },
  246: { name: 'Radishes', color: '#ff6666' },
  247: { name: 'Turnips', color: '#ff6666' },
  248: { name: 'Eggplants', color: '#ff6666' },
  249: { name: 'Gourds', color: '#ff6666' },
  250: { name: 'Cranberries', color: '#ff6666' },
  254: { name: 'Dbl Crop Barley/Soybeans', color: '#267300' },
}

/**
 * Query CDL crop type for a specific point and year
 */
export async function queryCDLPoint(lat: number, lng: number, year: number): Promise<CDLYearData | null> {
  try {
    // Use CropScape's GetCDLValue API via our proxy
    const params = new URLSearchParams({
      year: year.toString(),
      lat: lat.toString(),
      lon: lng.toString(),
    })

    const url = `/api/cdl-value?${params.toString()}`
    console.log(`[CDL Query] Querying year ${year} at (${lat}, ${lng})`)

    const response = await fetch(url)

    if (!response.ok) {
      console.error(`[CDL Query] Failed for year ${year}: ${response.status}`)
      return null
    }

    const text = await response.text()
    console.log(`[CDL Query] Response for ${year}:`, text.substring(0, 200))

    // Parse the XML response - CropScape returns XML with either:
    // Simple format: <Result>1</Result>
    // JSON format: <Result>{x: ..., y: ..., value: 24, category: "...", color: "..."}</Result>
    const resultMatch = text.match(/<Result>(.*?)<\/Result>/)
    if (!resultMatch) {
      console.log(`[CDL Query] No crop data for ${year}`)
      return null
    }

    const resultContent = resultMatch[1]
    let cropCode: number
    let confidence: number | undefined

    // Check if it's JSON format
    if (resultContent.trim().startsWith('{')) {
      // Parse JSON format: {x: ..., y: ..., value: 24, category: "...", color: "..."}
      // Note: CropScape doesn't return per-pixel confidence in GetCDLValue
      const valueMatch = resultContent.match(/value:\s*(\d+)/)
      if (!valueMatch) {
        console.log(`[CDL Query] Could not parse value from JSON for ${year}`)
        return null
      }
      cropCode = parseInt(valueMatch[1], 10)

      // Try to extract confidence if present (though typically not included)
      const confidenceMatch = resultContent.match(/confidence:\s*(\d+(?:\.\d+)?)/)
      if (confidenceMatch) {
        confidence = Math.round(parseFloat(confidenceMatch[1]))
      }
    } else {
      // Parse simple numeric format
      cropCode = parseInt(resultContent, 10)
      if (isNaN(cropCode)) {
        console.log(`[CDL Query] Invalid crop code for ${year}`)
        return null
      }
    }

    // Skip no-data values (0, 81)
    if (cropCode === 0 || cropCode === 81) {
      console.log(`[CDL Query] No data value (${cropCode}) for ${year}`)
      return null
    }

    const cropInfo = CDL_CROP_CODES[cropCode] || {
      name: `Unknown (${cropCode})`,
      color: '#cccccc',
    }

    const cropType = CROP_TYPE_MAP[cropCode] || 'non-cropland'

    // If no confidence from API, use estimated accuracy based on crop type
    // CropScape GetCDLValue doesn't return per-pixel confidence, so we use
    // NASS accuracy assessment data as proxy (major crops ~85-90%, specialty ~65-75%)
    if (!confidence) {
      confidence = getEstimatedAccuracy(cropCode)
    }

    return {
      year,
      cropCode,
      cropName: cropInfo.name,
      color: cropInfo.color,
      cropType,
      confidence,
    }
  } catch (error) {
    console.error(`[CDL Query] Error querying year ${year}:`, error)
    return null
  }
}

/**
 * Query CDL crop history for all available years (2008-2023)
 */
export async function queryCDLHistory(lat: number, lng: number): Promise<CDLYearData[]> {
  const years = Array.from({ length: 16 }, (_, i) => 2023 - i) // 2023 down to 2008

  console.log(`[CDL History] Querying ${years.length} years for (${lat}, ${lng})`)

  // Query years sequentially to avoid overwhelming the slow CropScape service
  const results: CDLYearData[] = []

  for (const year of years) {
    const result = await queryCDLPoint(lat, lng, year)
    if (result !== null) {
      results.push(result)
    }
  }

  // Sort by year (newest first)
  results.sort((a, b) => b.year - a.year)

  // Analyze for unlikely transitions and add warnings
  const warnings = analyzeCropHistory(
    results.map(r => ({
      year: r.year,
      cropType: r.cropType,
      cropName: r.cropName,
      confidence: r.confidence,
    })),
  )

  // Apply warnings to results
  warnings.forEach(w => {
    const result = results.find(r => r.year === w.year)
    if (result) {
      result.transitionWarning = w.warning
    }
  })

  console.log(
    `[CDL History] Found ${results.length} valid results with ${warnings.length} transition warnings`,
  )
  return results
}
