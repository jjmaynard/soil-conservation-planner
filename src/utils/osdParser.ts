/**
 * Official Series Description (OSD) Parser
 * Extracts structured soil information from USDA-NRCS OSD text files
 */

export interface OSDData {
  seriesName: string
  state: string
  established: {
    revision: string
    date: string
  }
  taxonomicClass: string
  typicalPedon: {
    description: string
    horizons: OSDHorizon[]
  }
  rangeInCharacteristics: {
    meanAnnualSoilTemp: string
    clayContent: string
    organicMatter: string
    other: string[]
    horizons: Record<string, any>
  }
  geographicSetting: {
    landforms: string[]
    parentMaterial: string
    slopes: string
    climate: string
    precipitation: string
    temperature: string
    frostFreePeriod: string
  }
  drainage: {
    class: string
    permeability: string
    runoff: string
    waterTable: string
  }
  useAndVegetation: {
    use: string
    vegetation: string
  }
  distribution: {
    extent: string
    mlra: string[]
  }
  remarks: {
    diagnosticHorizons: string[]
    features: string[]
  }
}

export interface OSDHorizon {
  name: string
  depth: string
  depthRange: { top: number; bottom: number }
  texture: string
  color: {
    dry?: string
    moist?: string
  }
  structure: string
  consistence: string
  features: string[]
  pH: number | null
  reaction: string
  effervescence: string
  other: string[]
}

/**
 * Parse OSD text file into structured data
 */
export function parseOSD(osdText: string): OSDData | null {
  if (!osdText || osdText.trim().length === 0) return null

  const lines = osdText.split('\n')
  
  try {
    const data: Partial<OSDData> = {}

    // Parse header
    const headerMatch = lines[0].match(/LOCATION\s+(\w+)\s+(\w+)/)
    if (headerMatch) {
      data.seriesName = headerMatch[1]
      data.state = headerMatch[2]
    }

    // Parse Established Series
    const establishedSection = extractSection(osdText, 'Established Series')
    if (establishedSection) {
      const revMatch = establishedSection.match(/Rev\.\s+(.+)/)
      const dateMatch = establishedSection.match(/(\d{2}\/\d{4})/)
      data.established = {
        revision: revMatch ? revMatch[1].split('\n')[0].trim() : '',
        date: dateMatch ? dateMatch[1] : '',
      }
    }

    // Parse Taxonomic Class
    const taxonomicMatch = osdText.match(/TAXONOMIC CLASS:\s+(.+)/)
    if (taxonomicMatch) {
      data.taxonomicClass = taxonomicMatch[1].trim()
    }

    // Parse Typical Pedon
    const typicalPedonSection = extractSection(osdText, 'TYPICAL PEDON')
    if (typicalPedonSection) {
      const descriptionMatch = typicalPedonSection.match(/TYPICAL PEDON:\s+(.+?)(?=\n\n|\n\s{4}[A-Z])/)
      data.typicalPedon = {
        description: descriptionMatch ? descriptionMatch[1].trim() : '',
        horizons: parseHorizons(typicalPedonSection),
      }
    }

    // Parse Range in Characteristics
    const rangeSection = extractSection(osdText, 'RANGE IN CHARACTERISTICS')
    data.rangeInCharacteristics = parseRangeInCharacteristics(rangeSection)

    // Parse Geographic Setting
    const geoSection = extractSection(osdText, 'GEOGRAPHIC SETTING')
    data.geographicSetting = parseGeographicSetting(geoSection)

    // Parse Drainage and Permeability
    const drainageSection = extractSection(osdText, 'DRAINAGE AND PERMEABILITY')
    data.drainage = parseDrainage(drainageSection)

    // Parse Use and Vegetation
    const useSection = extractSection(osdText, 'USE AND VEGETATION')
    data.useAndVegetation = parseUseAndVegetation(useSection)

    // Parse Distribution and Extent
    const distSection = extractSection(osdText, 'DISTRIBUTION AND EXTENT')
    data.distribution = parseDistribution(distSection)

    // Parse Remarks
    const remarksSection = extractSection(osdText, 'REMARKS')
    data.remarks = parseRemarks(remarksSection)

    return data as OSDData
  } catch (error) {
    console.error('Error parsing OSD:', error)
    return null
  }
}

/**
 * Extract a section from OSD text
 */
function extractSection(text: string, sectionName: string): string {
  const regex = new RegExp(`${sectionName}:?\\s*([\\s\\S]*?)(?=\\n[A-Z][A-Z\\s]+:|$)`, 'i')
  const match = text.match(regex)
  return match ? match[1].trim() : ''
}

/**
 * Parse soil horizons from typical pedon description
 */
function parseHorizons(text: string): OSDHorizon[] {
  const horizons: OSDHorizon[] = []
  
  // Match horizon designations (A, Bg, BCg1, etc.)
  const horizonRegex = /^\s{4}([A-Z][A-Z0-9]*[a-z]?\d*)--(\d+)\s+to\s+(\d+)\s+inches;(.+?)(?=\n\s{4}[A-Z][A-Z0-9]*--|$)/gms
  
  let match
  while ((match = horizonRegex.exec(text)) !== null) {
    const [, name, topDepth, bottomDepth, description] = match
    
    const horizon: OSDHorizon = {
      name,
      depth: `${topDepth}-${bottomDepth} inches`,
      depthRange: { top: parseInt(topDepth, 10), bottom: parseInt(bottomDepth, 10) },
      texture: extractTexture(description),
      color: extractColors(description),
      structure: extractStructure(description),
      consistence: extractConsistence(description),
      features: extractFeatures(description),
      pH: extractPH(description),
      reaction: extractReaction(description),
      effervescence: extractEffervescence(description),
      other: [],
    }
    
    horizons.push(horizon)
  }
  
  return horizons
}

/**
 * Extract texture from horizon description
 */
function extractTexture(description: string): string {
  const textureMatch = description.match(/;\s+([^;]+?)\s+(?:loam|clay|sand|silt)/i)
  if (textureMatch) {
    const fullMatch = description.match(/;\s+([^;,]+?)(?:;|,|\s+\()/i)
    return fullMatch ? fullMatch[1].trim() : textureMatch[0].replace(/^;\s+/, '').trim()
  }
  return 'Unknown'
}

/**
 * Extract colors (dry and moist)
 */
function extractColors(description: string): { dry?: string; moist?: string } {
  const colors: { dry?: string; moist?: string } = {}
  
  const dryMatch = description.match(/([^\s]+\s+\([^)]+\))\s+[^,;]*(?:dry)/i)
  if (dryMatch) colors.dry = dryMatch[1]
  
  const moistMatch = description.match(/([^\s]+\s+\([^)]+\))\s+moist/i)
  if (moistMatch) colors.moist = moistMatch[1]
  
  return colors
}

/**
 * Extract structure description
 */
function extractStructure(description: string): string {
  const structureMatch = description.match(/;\s+([^;]*(?:structure|blocky|granular|prismatic|massive)[^;]*)/i)
  return structureMatch ? structureMatch[1].trim() : 'Unknown'
}

/**
 * Extract consistence
 */
function extractConsistence(description: string): string {
  const consistenceMatch = description.match(/;\s+([^;]*(?:hard|firm|friable|sticky|plastic)[^;]*)/i)
  return consistenceMatch ? consistenceMatch[1].trim() : 'Unknown'
}

/**
 * Extract special features (redox, accumulations, etc.)
 */
function extractFeatures(description: string): string[] {
  const features: string[] = []
  
  if (description.match(/masses of iron/i)) features.push('Iron accumulation')
  if (description.match(/redox|mottles/i)) features.push('Redoximorphic features')
  if (description.match(/carbonates/i)) features.push('Carbonates present')
  if (description.match(/saline/i)) features.push('Saline')
  if (description.match(/cracks/i)) features.push('Cracks present')
  
  return features
}

/**
 * Extract pH value
 */
function extractPH(description: string): number | null {
  const phMatch = description.match(/pH\s+([\d.]+)/i)
  return phMatch ? parseFloat(phMatch[1]) : null
}

/**
 * Extract reaction (alkaline, acid, etc.)
 */
function extractReaction(description: string): string {
  const reactionMatch = description.match(/(strongly|moderately|slightly|very)?\s*(acid|alkaline|neutral)/i)
  return reactionMatch ? reactionMatch[0].trim() : 'Unknown'
}

/**
 * Extract effervescence
 */
function extractEffervescence(description: string): string {
  const effMatch = description.match(/(violently|strongly|slightly)\s+effervescent/i)
  return effMatch ? effMatch[0].trim() : 'None'
}

/**
 * Parse Range in Characteristics section
 */
function parseRangeInCharacteristics(text: string): any {
  const range: any = {
    meanAnnualSoilTemp: '',
    clayContent: '',
    organicMatter: '',
    other: [],
    horizons: {},
  }
  
  const tempMatch = text.match(/Mean annual soil temperature[:\s-]+(\d+\s+to\s+\d+\s+degrees\s+F)/i)
  if (tempMatch) range.meanAnnualSoilTemp = tempMatch[1]
  
  const clayMatch = text.match(/Clay content[:\s-]+.*?(\d+\s+to\s+\d+\s+percent)/i)
  if (clayMatch) range.clayContent = clayMatch[1]
  
  const omMatch = text.match(/Organic matter[:\s-]+([^\n]+)/i)
  if (omMatch) range.organicMatter = omMatch[1].trim()
  
  return range
}

/**
 * Parse Geographic Setting section
 */
function parseGeographicSetting(text: string): any {
  const setting: any = {
    landforms: [],
    parentMaterial: '',
    slopes: '',
    climate: '',
    precipitation: '',
    temperature: '',
    frostFreePeriod: '',
  }
  
  const landformMatch = text.match(/(?:are on|occur on)\s+([^.]+)/i)
  if (landformMatch) {
    setting.landforms = landformMatch[1].split(/,|\sand\s/).map((s: string) => s.trim())
  }
  
  const parentMatch = text.match(/formed in\s+([^.]+)/i)
  if (parentMatch) setting.parentMaterial = parentMatch[1].trim()
  
  const slopeMatch = text.match(/Slopes are\s+([\d.]+\s+to\s+[\d.]+\s+percent)/i)
  if (slopeMatch) setting.slopes = slopeMatch[1]
  
  const precipMatch = text.match(/precipitation is\s+(?:about\s+)?([\d.]+\s+to\s+[\d.]+\s+inches)/i)
  if (precipMatch) setting.precipitation = precipMatch[1]
  
  const tempMatch = text.match(/temperature is\s+(?:about\s+)?([\d.]+\s+to\s+[\d.]+\s+degrees\s+F)/i)
  if (tempMatch) setting.temperature = tempMatch[1]
  
  const frostMatch = text.match(/frost-free period is\s+([\d]+\s+to\s+[\d]+\s+days)/i)
  if (frostMatch) setting.frostFreePeriod = frostMatch[1]
  
  return setting
}

/**
 * Parse Drainage section
 */
function parseDrainage(text: string): any {
  const drainage: any = {
    class: '',
    permeability: '',
    runoff: '',
    waterTable: '',
  }
  
  const classMatch = text.match(/(poorly|somewhat poorly|moderately well|well|somewhat excessively|excessively)\s+drained/i)
  if (classMatch) drainage.class = classMatch[0]
  
  const permMatch = text.match(/permeability[:\s-]+([^.;]+)/i)
  if (permMatch) drainage.permeability = permMatch[1].trim()
  
  const runoffMatch = text.match(/runoff[:\s-]+([^.;]+)/i)
  if (runoffMatch) drainage.runoff = runoffMatch[1].trim()
  
  const waterTableMatch = text.match(/water table[:\s-]+([^.]+)/i)
  if (waterTableMatch) drainage.waterTable = waterTableMatch[1].trim()
  
  return drainage
}

/**
 * Parse Use and Vegetation section
 */
function parseUseAndVegetation(text: string): any {
  return {
    use: text.split(/vegetation/i)[0]?.trim() || '',
    vegetation: text.split(/vegetation/i)[1]?.trim() || '',
  }
}

/**
 * Parse Distribution section
 */
function parseDistribution(text: string): any {
  const distribution: any = {
    extent: '',
    mlra: [],
  }
  
  const extentMatch = text.match(/(moderately extensive|extensive|small extent)/i)
  if (extentMatch) distribution.extent = extentMatch[1]
  
  const mlraMatch = text.match(/MLRA\s+([\d\w,\s]+)/i)
  if (mlraMatch) {
    distribution.mlra = mlraMatch[1].split(',').map((m: string) => m.trim())
  }
  
  return distribution
}

/**
 * Parse Remarks section
 */
function parseRemarks(text: string): any {
  const remarks: any = {
    diagnosticHorizons: [],
    features: [],
  }
  
  const horizonMatches = text.matchAll(/([A-Z][a-z]+\s+(?:epipedon|horizon))\s+-\s+([^.]+)/gi)
  for (const match of horizonMatches) {
    remarks.diagnosticHorizons.push({
      name: match[1],
      description: match[2].trim(),
    })
  }
  
  const featureMatches = text.matchAll(/([A-Z][a-z]+(?:\s+[a-z]+)*\s+feature)\s+-\s+([^.]+)/gi)
  for (const match of featureMatches) {
    remarks.features.push({
      name: match[1],
      description: match[2].trim(),
    })
  }
  
  return remarks
}

/**
 * Load OSD file from the file system (for use in API routes)
 */
export async function loadOSDFile(componentName: string): Promise<string | null> {
  try {
    const fs = await import('fs/promises')
    const path = await import('path')
    
    const osdPath = path.join(process.cwd(), 'Property_Panel_Guide', 'OSD', `${componentName.toUpperCase()}.txt`)
    const content = await fs.readFile(osdPath, 'utf-8')
    return content
  } catch (error) {
    console.error(`Error loading OSD file for ${componentName}:`, error)
    return null
  }
}

/**
 * Format OSD data for display
 */
export function formatOSDForDisplay(osd: OSDData): Record<string, any> {
  return {
    header: {
      name: osd.seriesName,
      state: osd.state,
      taxonomicClass: osd.taxonomicClass,
      established: osd.established.date,
    },
    climate: {
      temperature: osd.geographicSetting.temperature,
      precipitation: osd.geographicSetting.precipitation,
      frostFreePeriod: osd.geographicSetting.frostFreePeriod,
    },
    physical: {
      landforms: osd.geographicSetting.landforms.join(', '),
      slopes: osd.geographicSetting.slopes,
      parentMaterial: osd.geographicSetting.parentMaterial,
      drainage: osd.drainage.class,
      permeability: osd.drainage.permeability,
    },
    horizons: osd.typicalPedon.horizons,
    use: {
      primary: osd.useAndVegetation.use,
      vegetation: osd.useAndVegetation.vegetation,
    },
    characteristics: osd.rangeInCharacteristics,
  }
}
