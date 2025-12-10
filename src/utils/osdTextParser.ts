// OSD Text File Parser - Extracts narrative descriptions from USDA OSD text files
// Creates user-friendly descriptions appropriate for farmers, land managers, and general public

interface OSDTextData {
  seriesName: string
  description: string // First paragraph overview
  rangeInCharacteristics: string
  geographicSetting: string
  drainageAndPermeability: string
  useAndVegetation: string
  fullDescription: string // Combined narrative for display
}

/**
 * Parse OSD text file and extract key narrative sections
 */
export function parseOSDText(fileContent: string, seriesName: string): OSDTextData {
  const lines = fileContent.split('\n')
  
  // Extract first paragraph description (after series name header)
  const description = extractFirstDescription(lines)
  
  // Extract range in characteristics
  const rangeInCharacteristics = extractSection(lines, 'RANGE IN CHARACTERISTICS')
  
  // Extract geographic setting
  const geographicSetting = extractSection(lines, 'GEOGRAPHIC SETTING')
  
  // Extract drainage and permeability
  const drainageAndPermeability = extractSection(lines, 'DRAINAGE AND PERMEABILITY')
  
  // Extract use and vegetation
  const useAndVegetation = extractSection(lines, 'USE AND VEGETATION')
  
  // Create full user-friendly description
  const fullDescription = formatForGeneralAudience({
    seriesName,
    description,
    geographicSetting,
    drainageAndPermeability,
    useAndVegetation,
  })
  
  return {
    seriesName,
    description,
    rangeInCharacteristics,
    geographicSetting,
    drainageAndPermeability,
    useAndVegetation,
    fullDescription,
  }
}

/**
 * Extract the first descriptive paragraph after the series header
 */
function extractFirstDescription(lines: string[]): string {
  let foundSeriesLine = false
  const descriptionLines: string[] = []
  
  for (const line of lines) {
    // Look for the series name header (e.g., "ABBOTT SERIES")
    if (line.trim().endsWith('SERIES')) {
      foundSeriesLine = true
      continue
    }
    
    // Skip empty lines after series header
    if (foundSeriesLine && line.trim() === '') {
      continue
    }
    
    // Start collecting description lines
    if (foundSeriesLine && line.trim() !== '') {
      // Stop at next section header (all caps)
      if (line.trim() === line.trim().toUpperCase() && line.trim().length > 10) {
        break
      }
      descriptionLines.push(line.trim())
    }
  }
  
  return descriptionLines.join(' ').trim()
}

/**
 * Extract content from a specific section
 */
function extractSection(lines: string[], sectionHeader: string): string {
  let inSection = false
  const sectionLines: string[] = []
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // Check if we've reached the section
    if (trimmedLine.includes(sectionHeader)) {
      inSection = true
      continue
    }
    
    // If in section, collect lines until next major section
    if (inSection) {
      // Stop at next section (all caps line with multiple words)
      if (trimmedLine === trimmedLine.toUpperCase() && 
          trimmedLine.length > 10 && 
          !trimmedLine.startsWith('-') &&
          trimmedLine.split(/\s+/).length > 2) {
        break
      }
      
      if (trimmedLine !== '') {
        sectionLines.push(trimmedLine)
      }
    }
  }
  
  return sectionLines.join(' ').trim()
}

/**
 * Format extracted information for general audience
 */
function formatForGeneralAudience(data: {
  seriesName: string
  description: string
  geographicSetting: string
  drainageAndPermeability: string
  useAndVegetation: string
}): string {
  const paragraphs: string[] = []
  
  // Overview paragraph
  if (data.description) {
    // Clean up technical jargon
    let overview = data.description
    overview = simplifyTechnicalTerms(overview)
    paragraphs.push(overview)
  }
  
  // Geographic setting (where found)
  if (data.geographicSetting) {
    let geography = data.geographicSetting
    // Extract location and climate info
    const locationInfo = extractLocationInfo(geography)
    const climateInfo = extractClimateInfo(geography)
    
    if (locationInfo || climateInfo) {
      let geoParagraph = 'These soils are typically found'
      if (locationInfo) {
        geoParagraph += ` ${locationInfo}`
      }
      if (climateInfo) {
        geoParagraph += `. ${climateInfo}`
      }
      paragraphs.push(geoParagraph)
    }
  }
  
  // Drainage and water characteristics
  if (data.drainageAndPermeability) {
    const drainage = simplifyDrainageInfo(data.drainageAndPermeability)
    if (drainage) {
      paragraphs.push(drainage)
    }
  }
  
  // Land use and vegetation
  if (data.useAndVegetation) {
    const uses = simplifyUseInfo(data.useAndVegetation)
    if (uses) {
      paragraphs.push(uses)
    }
  }
  
  return paragraphs.join('\n\n')
}

/**
 * Simplify technical soil science terminology
 */
function simplifyTechnicalTerms(text: string): string {
  const replacements: Record<string, string> = {
    'lacustrine deposits': 'lake sediments',
    'alluvium': 'river sediments',
    'colluvium': 'hillslope sediments',
    'eolian': 'wind-deposited',
    'moderately alkaline': 'slightly alkaline',
    'strongly alkaline': 'alkaline',
    'gleyed': 'waterlogged',
    'smectitic': 'clay-rich',
    'vertic': 'shrink-swell clay',
    'endoaquepts': 'wet soils',
    'endosaturation': 'seasonal water saturation',
    'permeability': 'water movement',
  }
  
  let simplified = text
  for (const [technical, simple] of Object.entries(replacements)) {
    const regex = new RegExp(technical, 'gi')
    simplified = simplified.replace(regex, simple)
  }
  
  return simplified
}

/**
 * Extract location information from geographic setting
 */
function extractLocationInfo(geographicText: string): string {
  // Look for landform mentions (flood plains, terraces, slopes, etc.)
  const landformMatches = geographicText.match(
    /on\s+([\w\s,]+?)\s*\./i
  )
  
  if (landformMatches && landformMatches[1]) {
    return `on ${landformMatches[1].toLowerCase()}`
  }
  
  return ''
}

/**
 * Extract climate information from geographic setting
 */
function extractClimateInfo(geographicText: string): string {
  const climateInfo: string[] = []
  
  // Extract precipitation
  const precipMatch = geographicText.match(/mean annual precipitation is (\d+\s+to\s+\d+\s+inches)/i)
  if (precipMatch) {
    climateInfo.push(`The climate provides ${precipMatch[1]} of annual rainfall`)
  }
  
  // Extract temperature
  const tempMatch = geographicText.match(/mean annual (?:air )?temperature is (\d+\s+to\s+\d+\s+degrees\s+F)/i)
  if (tempMatch) {
    climateInfo.push(`average temperatures of ${tempMatch[1]}`)
  }
  
  // Extract frost-free period
  const frostMatch = geographicText.match(/frost-free period is (\d+\s+to\s+\d+\s+days)/i)
  if (frostMatch) {
    climateInfo.push(`a growing season of ${frostMatch[1]}`)
  }
  
  if (climateInfo.length > 0) {
    return climateInfo.join(', ') + '.'
  }
  
  return ''
}

/**
 * Simplify drainage information for general audience
 */
function simplifyDrainageInfo(drainageText: string): string {
  const info: string[] = []
  
  // Extract drainage class
  if (drainageText.includes('Well drained')) {
    info.push('Water drains readily through this soil')
  } else if (drainageText.includes('Moderately well drained')) {
    info.push('Water drains at a moderate rate, with occasional wetness')
  } else if (drainageText.includes('Somewhat poorly drained') || drainageText.includes('Poorly drained')) {
    info.push('This soil tends to stay wet and may have drainage challenges')
  } else if (drainageText.includes('Excessively drained')) {
    info.push('Water drains very quickly through this soil')
  }
  
  // Extract permeability
  if (drainageText.toLowerCase().includes('slow permeability')) {
    info.push('water moves slowly through the soil layers')
  } else if (drainageText.toLowerCase().includes('moderate permeability')) {
    info.push('water moves at a moderate pace through the soil')
  } else if (drainageText.toLowerCase().includes('rapid') && drainageText.toLowerCase().includes('permeability')) {
    info.push('water moves rapidly through the soil')
  }
  
  // Water table information
  const waterTableMatch = drainageText.match(/water table[^.]*(?:between|at)[^.]*\./i)
  if (waterTableMatch) {
    const simplified = waterTableMatch[0]
      .replace(/endosaturation/gi, 'water saturation')
      .replace(/apparent seasonal/gi, 'seasonal')
    info.push(simplified.trim())
  }
  
  if (info.length > 0) {
    return info.join(', ') + '.'
  }
  
  return ''
}

/**
 * Simplify use and vegetation information
 */
function simplifyUseInfo(useText: string): string {
  const info: string[] = []
  
  // Extract uses
  if (useText.toLowerCase().includes('crop')) {
    info.push('suitable for crop production')
  }
  if (useText.toLowerCase().includes('pasture') || useText.toLowerCase().includes('grazing')) {
    info.push('used for pasture and grazing')
  }
  if (useText.toLowerCase().includes('hay')) {
    info.push('suitable for hay production')
  }
  if (useText.toLowerCase().includes('range')) {
    info.push('used as rangeland')
  }
  if (useText.toLowerCase().includes('forest')) {
    info.push('supports forest growth')
  }
  if (useText.toLowerCase().includes('wildlife')) {
    info.push('provides wildlife habitat')
  }
  
  // Extract native vegetation
  const vegMatch = useText.match(/(?:vegetation is|native plants include)[^.]*\./i)
  if (vegMatch) {
    info.push('Native vegetation includes' + vegMatch[0].split(/vegetation is|native plants include/i)[1])
  } else if (useText.match(/\b(?:grass|shrub|tree|sagebrush|greasewood|saltgrass|bluegrass|wheatgrass)\b/i)) {
    info.push(`Natural vegetation: ${extractVegetationTypes(useText)}`)
  }
  
  if (info.length > 0) {
    return 'Land use: ' + info.join('; ') + '.'
  }
  
  return ''
}

/**
 * Extract vegetation types mentioned in text
 */
function extractVegetationTypes(text: string): string {
  const vegTypes: string[] = []
  const commonVeg = [
    'grass', 'grasses', 'sagebrush', 'saltgrass', 'bluegrass', 'wheatgrass',
    'sedge', 'rush', 'cottonwood', 'willow', 'juniper', 'pinyon', 'pine',
    'oak', 'aspen', 'fir', 'spruce', 'greasewood', 'rabbitbrush'
  ]
  
  const lowerText = text.toLowerCase()
  for (const veg of commonVeg) {
    if (lowerText.includes(veg)) {
      vegTypes.push(veg)
    }
  }
  
  return vegTypes.slice(0, 5).join(', ')
}
