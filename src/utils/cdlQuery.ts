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
  1: { name: 'Corn', color: '#ffd300' },
  2: { name: 'Cotton', color: '#ff2626' },
  3: { name: 'Rice', color: '#00a8e5' },
  4: { name: 'Sorghum', color: '#ff9e0c' },
  5: { name: 'Soybeans', color: '#267000' },
  6: { name: 'Sunflower', color: '#ffff00' },
  10: { name: 'Peanuts', color: '#70a800' },
  11: { name: 'Tobacco', color: '#00af49' },
  12: { name: 'Sweet Corn', color: '#ffd300' },
  13: { name: 'Pop or Orn Corn', color: '#ffd300' },
  14: { name: 'Mint', color: '#00af49' },
  21: { name: 'Barley', color: '#ffd300' },
  22: { name: 'Durum Wheat', color: '#e2007c' },
  23: { name: 'Spring Wheat', color: '#896054' },
  24: { name: 'Winter Wheat', color: '#d8b56b' },
  25: { name: 'Other Small Grains', color: '#a57000' },
  26: { name: 'Dbl Crop WinWht/Soybeans', color: '#d69ebc' },
  27: { name: 'Rye', color: '#707000' },
  28: { name: 'Oats', color: '#ab6c00' },
  29: { name: 'Millet', color: '#b29200' },
  30: { name: 'Speltz', color: '#a57000' },
  31: { name: 'Canola', color: '#ffd300' },
  32: { name: 'Flaxseed', color: '#a800e5' },
  33: { name: 'Safflower', color: '#ff6666' },
  34: { name: 'Rape Seed', color: '#ff6666' },
  35: { name: 'Mustard', color: '#ffcc66' },
  36: { name: 'Alfalfa', color: '#ff00ff' },
  37: { name: 'Other Hay/Non Alfalfa', color: '#e57ae5' },
  38: { name: 'Camelina', color: '#ffcc00' },
  39: { name: 'Buckwheat', color: '#e56300' },
  41: { name: 'Sugarbeets', color: '#ff2626' },
  42: { name: 'Dry Beans', color: '#70a800' },
  43: { name: 'Potatoes', color: '#ffae42' },
  44: { name: 'Other Crops', color: '#ffd300' },
  45: { name: 'Sugarcane', color: '#a800e5' },
  46: { name: 'Sweet Potatoes', color: '#ff6666' },
  47: { name: 'Misc Vegs & Fruits', color: '#ffae42' },
  48: { name: 'Watermelons', color: '#ff6666' },
  49: { name: 'Onions', color: '#ffae42' },
  50: { name: 'Cucumbers', color: '#70a800' },
  51: { name: 'Chick Peas', color: '#ff8c00' },
  52: { name: 'Lentils', color: '#d68900' },
  53: { name: 'Peas', color: '#00af49' },
  54: { name: 'Tomatoes', color: '#ff2626' },
  55: { name: 'Caneberries', color: '#ff6666' },
  56: { name: 'Hops', color: '#00af49' },
  57: { name: 'Herbs', color: '#00af49' },
  58: { name: 'Clover/Wildflowers', color: '#ffc0e5' },
  59: { name: 'Sod/Grass Seed', color: '#00af49' },
  60: { name: 'Switchgrass', color: '#ddc91b' },
  61: { name: 'Fallow/Idle Cropland', color: '#896054' },
  63: { name: 'Forest', color: '#004d00' },
  64: { name: 'Shrubland', color: '#d69ebc' },
  65: { name: 'Barren', color: '#ff6666' },
  66: { name: 'Cherries', color: '#ff0000' },
  67: { name: 'Peaches', color: '#ff6666' },
  68: { name: 'Apples', color: '#ff0000' },
  69: { name: 'Grapes', color: '#a800e5' },
  70: { name: 'Christmas Trees', color: '#004d00' },
  71: { name: 'Other Tree Crops', color: '#70a800' },
  72: { name: 'Citrus', color: '#ff9e0c' },
  74: { name: 'Pecans', color: '#70a800' },
  75: { name: 'Almonds', color: '#ffae42' },
  76: { name: 'Walnuts', color: '#896054' },
  77: { name: 'Pears', color: '#70a800' },
  81: { name: 'Clouds/No Data', color: '#cccccc' },
  82: { name: 'Developed', color: '#e5cee5' },
  83: { name: 'Water', color: '#00ffe5' },
  87: { name: 'Wetlands', color: '#0096a0' },
  88: { name: 'Nonag/Undefined', color: '#ffff00' },
  92: { name: 'Aquaculture', color: '#00ffff' },
  111: { name: 'Open Water', color: '#4d70a3' },
  112: { name: 'Perennial Ice/Snow', color: '#ffffff' },
  121: { name: 'Developed/Open Space', color: '#e5cee5' },
  122: { name: 'Developed/Low Intensity', color: '#d69ebc' },
  123: { name: 'Developed/Med Intensity', color: '#e5007c' },
  124: { name: 'Developed/High Intensity', color: '#a80000' },
  131: { name: 'Barren', color: '#d69ebc' },
  141: { name: 'Deciduous Forest', color: '#70a800' },
  142: { name: 'Evergreen Forest', color: '#00af49' },
  143: { name: 'Mixed Forest', color: '#d8b56b' },
  152: { name: 'Shrubland', color: '#ffc0e5' },
  176: { name: 'Grassland/Pasture', color: '#ffd300' },
  190: { name: 'Woody Wetlands', color: '#b5b5ff' },
  195: { name: 'Herbaceous Wetlands', color: '#00ffff' },
  204: { name: 'Pistachios', color: '#d69ebc' },
  205: { name: 'Triticale', color: '#d69ebc' },
  206: { name: 'Carrots', color: '#ff9e0c' },
  207: { name: 'Asparagus', color: '#70a800' },
  208: { name: 'Garlic', color: '#ffae42' },
  209: { name: 'Cantaloupes', color: '#ff6666' },
  210: { name: 'Prunes', color: '#a800e5' },
  211: { name: 'Olives', color: '#70a800' },
  212: { name: 'Oranges', color: '#ff9e0c' },
  213: { name: 'Honeydew Melons', color: '#70a800' },
  214: { name: 'Broccoli', color: '#00af49' },
  216: { name: 'Peppers', color: '#ff2626' },
  217: { name: 'Pomegranates', color: '#ff0000' },
  218: { name: 'Nectarines', color: '#ff6666' },
  219: { name: 'Greens', color: '#00af49' },
  220: { name: 'Plums', color: '#a800e5' },
  221: { name: 'Strawberries', color: '#ff0000' },
  222: { name: 'Squash', color: '#ff9e0c' },
  223: { name: 'Apricots', color: '#ff9e0c' },
  224: { name: 'Vetch', color: '#a800e5' },
  225: { name: 'Dbl Crop WinWht/Corn', color: '#d8b56b' },
  226: { name: 'Dbl Crop Oats/Corn', color: '#d8b56b' },
  227: { name: 'Lettuce', color: '#70a800' },
  229: { name: 'Pumpkins', color: '#ff9e0c' },
  230: { name: 'Dbl Crop Lettuce/Durum Wht', color: '#d8b56b' },
  231: { name: 'Dbl Crop Lettuce/Cantaloupe', color: '#d8b56b' },
  232: { name: 'Dbl Crop Lettuce/Cotton', color: '#d8b56b' },
  233: { name: 'Dbl Crop Lettuce/Barley', color: '#d8b56b' },
  234: { name: 'Dbl Crop Durum Wht/Sorghum', color: '#d8b56b' },
  235: { name: 'Dbl Crop Barley/Sorghum', color: '#d8b56b' },
  236: { name: 'Dbl Crop WinWht/Sorghum', color: '#d8b56b' },
  237: { name: 'Dbl Crop Barley/Corn', color: '#d8b56b' },
  238: { name: 'Dbl Crop WinWht/Cotton', color: '#d8b56b' },
  239: { name: 'Dbl Crop Soybeans/Cotton', color: '#d8b56b' },
  240: { name: 'Dbl Crop Soybeans/Oats', color: '#d8b56b' },
  241: { name: 'Dbl Crop Corn/Soybeans', color: '#d8b56b' },
  242: { name: 'Blueberries', color: '#0000ff' },
  243: { name: 'Cabbage', color: '#70a800' },
  244: { name: 'Cauliflower', color: '#ffffff' },
  245: { name: 'Celery', color: '#70a800' },
  246: { name: 'Radishes', color: '#ff0000' },
  247: { name: 'Turnips', color: '#a800e5' },
  248: { name: 'Eggplants', color: '#a800e5' },
  249: { name: 'Gourds', color: '#ff9e0c' },
  250: { name: 'Cranberries', color: '#ff0000' },
  254: { name: 'Dbl Crop Barley/Soybeans', color: '#d8b56b' },
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
