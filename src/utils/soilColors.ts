// USDA Soil Taxonomy Color Schemes and Scientific Color Ramps

// USDA Soil Order Classification Colors
export const soilOrderColors: Record<string, string> = {
  Alfisols: '#8B4513',
  Andisols: '#2F4F4F',
  Aridisols: '#DEB887',
  Entisols: '#F5DEB3',
  Gelisols: '#E6E6FA',
  Histosols: '#000000',
  Inceptisols: '#9ACD32',
  Mollisols: '#654321',
  Oxisols: '#B22222',
  Spodosols: '#778899',
  Ultisols: '#CD853F',
  Vertisols: '#696969',
}

// Soil Texture Class Colors
export const textureColors: Record<string, string> = {
  Sand: '#F5E6D3',
  'Loamy Sand': '#E6D3A3',
  'Sandy Loam': '#D4A574',
  Loam: '#C19A6B',
  'Silt Loam': '#A0826D',
  Silt: '#8B7355',
  'Sandy Clay Loam': '#8B4513',
  'Clay Loam': '#654321',
  'Silty Clay Loam': '#5D4037',
  'Sandy Clay': '#4E342E',
  'Silty Clay': '#3E2723',
  Clay: '#2E1B14',
}

// Organic Carbon Color Ramp (%)
export const carbonColorRamp = [
  { value: 0, color: '#FEF0D9' },
  { value: 1, color: '#FDD49E' },
  { value: 2, color: '#FC8D59' },
  { value: 5, color: '#D7301F' },
  { value: 10, color: '#B30000' },
]

// Soil pH Color Ramp
export const phColorRamp = [
  { value: 3.5, color: '#E31A1C', label: 'Very acidic' },
  { value: 5.5, color: '#FD8D3C', label: 'Acidic' },
  { value: 7.0, color: '#33A02C', label: 'Neutral' },
  { value: 8.5, color: '#1F78B4', label: 'Alkaline' },
  { value: 10.0, color: '#6A3D9A', label: 'Very alkaline' },
]

// Bulk Density Color Ramp (g/cm³)
export const bulkDensityColorRamp = [
  { value: 0.5, color: '#FFF7BC' },
  { value: 1.0, color: '#FEE391' },
  { value: 1.3, color: '#FEC44F' },
  { value: 1.6, color: '#FE9929' },
  { value: 2.0, color: '#D95F0E' },
]

// Clay Content Color Ramp (%)
export const clayColorRamp = [
  { value: 0, color: '#FFFFCC' },
  { value: 15, color: '#C7E9B4' },
  { value: 25, color: '#7FCDBB' },
  { value: 40, color: '#41B6C4' },
  { value: 60, color: '#1D91C0' },
  { value: 100, color: '#0C2C84' },
]

// NRCS Brand Colors
export const nrcsColors = {
  green: '#006837',
  darkGreen: '#004d29',
  lightGreen: '#8BC34A',
  brown: '#6B4423',
  tan: '#D4A574',
  blue: '#0066A1',
  gray: '#5E6A71',
}

/**
 * Get color from a color ramp based on value interpolation
 */
export function getColorFromRamp(
  value: number,
  colorRamp: Array<{ value: number; color: string }>
): string {
  if (value <= colorRamp[0].value) return colorRamp[0].color
  if (value >= colorRamp[colorRamp.length - 1].value)
    return colorRamp[colorRamp.length - 1].color

  for (let i = 0; i < colorRamp.length - 1; i++) {
    if (value >= colorRamp[i].value && value <= colorRamp[i + 1].value) {
      return colorRamp[i].color
    }
  }

  return colorRamp[0].color
}

/**
 * Get soil order color by name
 */
export function getSoilOrderColor(soilOrder: string): string {
  return soilOrderColors[soilOrder] || '#808080'
}

/**
 * Get texture class color by name
 */
export function getTextureColor(texture: string): string {
  return textureColors[texture] || '#C19A6B'
}

/**
 * Get pH color by value
 */
export function getPhColor(ph: number): string {
  return getColorFromRamp(ph, phColorRamp)
}

/**
 * Get organic carbon color by percentage
 */
export function getCarbonColor(carbon: number): string {
  return getColorFromRamp(carbon, carbonColorRamp)
}
