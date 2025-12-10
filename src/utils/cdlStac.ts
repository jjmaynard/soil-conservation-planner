// USDA Cropland Data Layer STAC Integration
// Based on Microsoft Planetary Computer STAC API

const STAC_API_URL = 'https://planetarycomputer.microsoft.com/api/stac/v1'

interface STACAsset {
  href: string
  type: string
  title?: string
  roles?: string[]
}

interface STACItem {
  id: string
  type: string
  assets: {
    [key: string]: STACAsset
  }
  bbox?: number[]
  properties?: {
    datetime?: string
    [key: string]: any
  }
}

interface STACSearchResponse {
  type: string
  features: STACItem[]
  links?: any[]
}

/**
 * Search for CDL items in Microsoft Planetary Computer
 * @param bbox Bounding box [west, south, east, north] in WGS84
 * @param year Year for CDL data (2008-2023)
 * @returns Array of STAC items
 */
export async function getCDLItems(bbox: number[], year = 2023): Promise<STACItem[]> {
  const searchUrl = `${STAC_API_URL}/search`

  const searchParams = {
    collections: ['usda-cdl'],
    bbox, // [west, south, east, north]
    datetime: `${year}-01-01T00:00:00Z/${year}-12-31T23:59:59Z`,
    limit: 100,
  }

  try {
    console.log('🔍 Searching STAC for CDL data:', searchParams)

    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchParams),
    })

    if (!response.ok) {
      throw new Error(`STAC search failed: ${response.status} ${response.statusText}`)
    }

    const data: STACSearchResponse = await response.json()
    console.log(`✅ Found ${data.features?.length || 0} CDL items`)

    return data.features || []
  } catch (error) {
    console.error('❌ Error fetching CDL data:', error)
    return []
  }
}

/**
 * Get signed asset URL from STAC item
 * Microsoft Planetary Computer requires signing URLs for access
 * @param item STAC item
 * @param assetKey Asset key (default: 'image')
 * @returns Signed URL or null
 */
export async function getSignedAssetUrl(item: STACItem, assetKey = 'image'): Promise<string | null> {
  try {
    const asset = item.assets[assetKey]
    if (!asset) {
      console.warn(`Asset '${assetKey}' not found in item ${item.id}`)
      return null
    }

    // Microsoft Planetary Computer provides a signing service
    // The href already includes a token in query params
    const { href } = asset

    // If href contains 'blob.core.windows.net', it needs signing
    if (href.includes('blob.core.windows.net') && !href.includes('st=')) {
      // Request signed URL from Planetary Computer
      const signUrl = `https://planetarycomputer.microsoft.com/api/sas/v1/sign`

      const response = await fetch(signUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ href }),
      })

      if (response.ok) {
        const signed = await response.json()
        console.log('✅ Asset URL signed')
        return signed.href || signed.msft_planetary_computer?.signed_url || href
      }
    }

    // Return href as-is if already signed or doesn't need signing
    return href
  } catch (error) {
    console.error('Error signing asset URL:', error)
    return null
  }
}

/**
 * Get tile URL for CDL visualization using Planetary Computer's tile server
 * @param year CDL year (2008-2023)
 * @param bbox Optional bbox to fetch specific item
 * @returns Tile URL template
 */
export async function getCDLTileUrl(year = 2023, bbox?: number[]): Promise<string | null> {
  try {
    // If bbox provided, search for specific items
    if (bbox) {
      const items = await getCDLItems(bbox, year)
      if (items.length === 0) {
        console.warn('No CDL items found for bbox')
        return null
      }

      // Use first item
      const item = items[0]
      const signedUrl = await getSignedAssetUrl(item, 'image')

      if (signedUrl) {
        // Use Planetary Computer's titiler endpoint with signed COG URL
        const tileUrl = `https://planetarycomputer.microsoft.com/api/data/v1/item/tiles/WebMercatorQuad/{z}/{x}/{y}@1x.png?collection=usda-cdl&item=${item.id}&assets=image&asset_bidx=image%7C1&nodata=0&resampling=nearest`
        return tileUrl
      }
    }

    // Fallback: Use collection-level tiles (works for full CONUS)
    const collectionTileUrl = `https://planetarycomputer.microsoft.com/api/data/v1/collection/tiles/WebMercatorQuad/{z}/{x}/{y}@1x.png?collection=usda-cdl&assets=image&asset_bidx=image%7C1&nodata=0&colormap_name=viridis&resampling=nearest`
    return collectionTileUrl
  } catch (error) {
    console.error('Error getting CDL tile URL:', error)
    return null
  }
}

// CDL Classification Colors (USDA NASS standard colors)
export const CDL_COLORS: { [key: number]: string } = {
  1: '#FFD300', // Corn
  2: '#FFD300', // Cotton
  3: '#267000', // Rice
  4: '#FFD300', // Sorghum
  5: '#267000', // Soybeans
  6: '#FFD300', // Sunflower
  10: '#70A800', // Peanuts
  11: '#00AF49', // Tobacco
  12: '#DDA50A', // Sweet Corn
  13: '#DDA50A', // Pop or Orn Corn
  14: '#7CD3FF', // Mint
  21: '#E2007C', // Barley
  22: '#896054', // Durum Wheat
  23: '#D8B56B', // Spring Wheat
  24: '#A57000', // Winter Wheat
  25: '#D69EBC', // Other Small Grains
  26: '#707000', // Dbl Crop WinWht/Soybeans
  27: '#AA007C', // Rye
  28: '#A05989', // Oats
  29: '#700049', // Millet
  30: '#D69EBC', // Speltz
  31: '#D1FF00', // Canola
  32: '#7C99FF', // Flaxseed
  33: '#D6D600', // Safflower
  34: '#D1FF00', // Rape Seed
  35: '#00AF49', // Mustard
  36: '#FFA800', // Alfalfa
  37: '#267000', // Other Hay/Non Alfalfa
  38: '#FFFF00', // Camelina
  39: '#70A800', // Buckwheat
  41: '#00AF49', // Sugarbeets
  42: '#B35C00', // Dry Beans
  43: '#B35C00', // Potatoes
  44: '#267000', // Other Crops
  45: '#E07400', // Sugarcane
  46: '#B35C00', // Sweet Potatoes
  47: '#FFD300', // Misc Vegs & Fruits
  48: '#B35C00', // Watermelons
  49: '#267000', // Onions
  50: '#267000', // Cucumbers
  51: '#FFA800', // Chick Peas
  52: '#FFA800', // Lentils
  53: '#267000', // Peas
  54: '#00AF49', // Tomatoes
  55: '#B35C00', // Caneberries
  56: '#267000', // Hops
  57: '#267000', // Herbs
  58: '#FFD300', // Clover/Wildflowers
  59: '#70A800', // Sod/Grass Seed
  60: '#267000', // Switchgrass
  61: '#000000', // Fallow/Idle Cropland
  63: '#00AF49', // Forest
  64: '#00AF49', // Shrubland
  65: '#FFFF00', // Barren
  66: '#FFFF00', // Cherries
  67: '#FFA800', // Peaches
  68: '#00AF49', // Apples
  69: '#FFA800', // Grapes
  70: '#FF6666', // Christmas Trees
  71: '#00AF49', // Other Tree Crops
  72: '#B35C00', // Citrus
  74: '#B35C00', // Pecans
  75: '#FFA800', // Almonds
  76: '#FFA800', // Walnuts
  77: '#B35C00', // Pears
  81: '#CCFFCC', // Clouds/No Data
  82: '#00AF49', // Developed
  83: '#00AF49', // Water
  87: '#FFFF00', // Wetlands
  88: '#267000', // Nonag/Undefined
  92: '#00AF49', // Aquaculture
  111: '#FFFF00', // Open Water
  112: '#00AF49', // Perennial Ice/Snow
  121: '#FFFF00', // Developed/Open Space
  122: '#00AF49', // Developed/Low Intensity
  123: '#B35C00', // Developed/Med Intensity
  124: '#000000', // Developed/High Intensity
  131: '#FFFF00', // Barren
  141: '#9C9C9C', // Deciduous Forest
  142: '#006400', // Evergreen Forest
  143: '#00AF49', // Mixed Forest
  152: '#267000', // Shrubland
  176: '#FFFF99', // Grassland/Pasture
  190: '#CCFFCC', // Woody Wetlands
  195: '#0000FF', // Herbaceous Wetlands
  204: '#267000', // Pistachios
  205: '#FFA800', // Triticale
  206: '#267000', // Carrots
  207: '#B35C00', // Asparagus
  208: '#267000', // Garlic
  209: '#267000', // Cantaloupes
  210: '#FFA800', // Prunes
  211: '#FFA800', // Olives
  212: '#00AF49', // Oranges
  213: '#267000', // Honeydew Melons
  214: '#B35C00', // Broccoli
  216: '#B35C00', // Peppers
  217: '#267000', // Pomegranates
  218: '#B35C00', // Nectarines
  219: '#B35C00', // Greens
  220: '#FFA800', // Plums
  221: '#FFA800', // Strawberries
  222: '#267000', // Squash
  223: '#B35C00', // Apricots
  224: '#267000', // Vetch
  225: '#FFD300', // Dbl Crop WinWht/Corn
  226: '#707000', // Dbl Crop Oats/Corn
  227: '#B35C00', // Lettuce
  229: '#FFD300', // Pumpkins
  230: '#707000', // Dbl Crop Lettuce/Durum Wht
  231: '#FFD300', // Dbl Crop Lettuce/Cantaloupe
  232: '#B35C00', // Dbl Crop Lettuce/Cotton
  233: '#FFD300', // Dbl Crop Lettuce/Barley
  234: '#707000', // Dbl Crop Durum Wht/Sorghum
  235: '#707000', // Dbl Crop Barley/Sorghum
  236: '#D69EBC', // Dbl Crop WinWht/Sorghum
  237: '#A57000', // Dbl Crop Barley/Corn
  238: '#707000', // Dbl Crop WinWht/Cotton
  239: '#267000', // Dbl Crop Soybeans/Cotton
  240: '#267000', // Dbl Crop Soybeans/Oats
  241: '#FFD300', // Dbl Crop Corn/Soybeans
  242: '#00AF49', // Blueberries
  243: '#267000', // Cabbage
  244: '#B35C00', // Cauliflower
  245: '#B35C00', // Celery
  246: '#267000', // Radishes
  247: '#B35C00', // Turnips
  248: '#267000', // Eggplants
  249: '#B35C00', // Gourds
  250: '#B35C00', // Cranberries
  254: '#707000', // Dbl Crop Barley/Soybeans
}

export function getCDLLegend(): Array<{ label: string; color: string; value: number }> {
  return [
    { label: 'Corn', color: CDL_COLORS[1], value: 1 },
    { label: 'Soybeans', color: CDL_COLORS[5], value: 5 },
    { label: 'Winter Wheat', color: CDL_COLORS[24], value: 24 },
    { label: 'Alfalfa', color: CDL_COLORS[36], value: 36 },
    { label: 'Other Hay', color: CDL_COLORS[37], value: 37 },
    { label: 'Fallow', color: CDL_COLORS[61], value: 61 },
    { label: 'Deciduous Forest', color: CDL_COLORS[141], value: 141 },
    { label: 'Evergreen Forest', color: CDL_COLORS[142], value: 142 },
    { label: 'Grassland/Pasture', color: CDL_COLORS[176], value: 176 },
    { label: 'Woody Wetlands', color: CDL_COLORS[190], value: 190 },
    { label: 'Herbaceous Wetlands', color: CDL_COLORS[195], value: 195 },
  ]
}
