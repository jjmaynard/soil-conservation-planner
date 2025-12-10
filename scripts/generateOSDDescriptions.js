// Script to process all OSD text files and create a JSON database
// Run with: node scripts/generateOSDDescriptions.js

const fs = require('fs');
const path = require('path');

const OSD_SOURCE_DIR = path.join(__dirname, '..', 'Property_Panel_Guide', 'OSD');
const OUTPUT_FILE = path.join(__dirname, '..', 'public', 'data', 'osd-descriptions.json');

// Parse OSD text file
function parseOSDText(fileContent, seriesName) {
  const lines = fileContent.split('\n');
  
  const description = extractFirstDescription(lines);
  const rangeInCharacteristics = extractSection(lines, 'RANGE IN CHARACTERISTICS');
  const geographicSetting = extractSection(lines, 'GEOGRAPHIC SETTING');
  const drainageAndPermeability = extractSection(lines, 'DRAINAGE AND PERMEABILITY');
  const useAndVegetation = extractSection(lines, 'USE AND VEGETATION');
  
  const fullDescription = formatForGeneralAudience({
    seriesName,
    description,
    rangeInCharacteristics,
    geographicSetting,
    drainageAndPermeability,
    useAndVegetation,
  });
  
  // Extract range characteristics as a structured list
  const rangeCharacteristicsList = rangeInCharacteristics ? 
    extractRangeCharacteristicsList(rangeInCharacteristics) : null;
  
  return { fullDescription, rangeCharacteristics: rangeCharacteristicsList };
}

function extractFirstDescription(lines) {
  let foundSeriesLine = false;
  const descriptionLines = [];
  const structuredData = {};
  
  for (const line of lines) {
    if (line.trim().endsWith('SERIES')) {
      foundSeriesLine = true;
      continue;
    }
    
    if (foundSeriesLine && line.trim() === '') {
      continue;
    }
    
    if (foundSeriesLine && line.trim() !== '') {
      // Check if this is an all-caps section header (TAXONOMIC CLASS:, TYPICAL PEDON:, etc.)
      // Look for pattern: ALL CAPS WORDS followed by colon
      const headerMatch = line.trim().match(/^([A-Z\s]+):.*$/);
      if (headerMatch && headerMatch[1].trim().length > 5) {
        // This is a section header, stop reading description
        break;
      }
      
      // Check if this is structured data (Landscape--, Landform--, etc.)
      if (line.includes('--')) {
        const [key, value] = line.split('--').map(s => s.trim());
        if (key && value) {
          structuredData[key.toLowerCase().replace(/\s+/g, '_')] = value;
        }
      } 
      // Check if this is key: value format (Depth class: very deep, etc.)
      else if (line.includes(':') && !line.match(/^[A-Z\s]+:/) && line.trim().indexOf(':') < 30) {
        const colonIndex = line.indexOf(':');
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        if (key && value && key.length < 30) {
          structuredData[key.toLowerCase().replace(/\s+/g, '_')] = value;
        }
      }
      else {
        // Regular description text
        descriptionLines.push(line.trim());
      }
    }
  }
  
  // If we have a regular description, return it
  if (descriptionLines.length > 0) {
    return descriptionLines.join(' ').trim();
  }
  
  // Otherwise, synthesize from structured data
  if (Object.keys(structuredData).length > 0) {
    // Build a natural description from structured data
    let description = 'These are ';
    
    // Depth and drainage
    const characteristics = [];
    if (structuredData.depth_class) {
      characteristics.push(structuredData.depth_class);
    }
    if (structuredData.drainage_class) {
      characteristics.push(structuredData.drainage_class);
    }
    
    if (characteristics.length > 0) {
      description += characteristics.join(', ') + ' soils';
    } else {
      description += 'soils';
    }
    
    // Formation/parent material - simplified language
    if (structuredData.parent_material) {
      let material = structuredData.parent_material
        .replace(/alluvium/gi, 'river sediments')
        .replace(/colluvium/gi, 'hillslope sediments')
        .replace(/lacustrine/gi, 'lake sediments')
        .replace(/eolian/gi, 'wind-deposited sediments');
      description += ` that formed in ${material}`;
    }
    
    // Location
    if (structuredData.landform) {
      let landform = structuredData.landform.toLowerCase();
      description += `. They are found on ${landform}`;
    }
    
    // Slopes
    if (structuredData.slopes) {
      let slopes = structuredData.slopes.toLowerCase();
      description += ` with ${slopes} slopes`;
    }
    
    // Climate
    const climate = [];
    if (structuredData.mean_annual_precipitation) {
      climate.push(`rainfall of ${structuredData.mean_annual_precipitation}`);
    }
    if (structuredData.mean_annual_temperature) {
      climate.push(`average temperatures of ${structuredData.mean_annual_temperature}`);
    }
    
    if (climate.length > 0) {
      description += `. The climate provides ${climate.join(' and ')}`;
    }
    
    description += '.';
    return description;
  }
  
  return '';
}

function extractSection(lines, sectionHeader) {
  let inSection = false;
  const sectionLines = [];
  
  // List of sections to exclude
  const excludedSections = ['TAXONOMIC CLASS', 'TYPICAL PEDON', 'TYPE LOCATION', 'COMPETING SERIES', 
                            'GEOGRAPHICALLY ASSOCIATED SOILS', 'DISTRIBUTION AND EXTENT', 
                            'SOIL SURVEY REGIONAL OFFICE', 'SERIES ESTABLISHED', 'REMARKS'];
  
  for (let i = 0; i < lines.length; i++) {
    const trimmedLine = lines[i].trim();
    
    // Check for exact match of the section header we want
    if (trimmedLine === sectionHeader || trimmedLine === sectionHeader + ':') {
      inSection = true;
      continue;
    }
    
    if (inSection) {
      // Stop if we hit another all-caps section header
      const isAllCaps = trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 5;
      const hasOnlyLettersSpacesColons = /^[A-Z\s:]+$/.test(trimmedLine);
      
      if (isAllCaps && hasOnlyLettersSpacesColons && !trimmedLine.includes('--')) {
        // This looks like a section header, stop here
        break;
      }
      
      if (trimmedLine !== '') {
        sectionLines.push(trimmedLine);
      }
    }
  }
  
  return sectionLines.join(' ').trim();
}

function formatForGeneralAudience(data) {
  const paragraphs = [];
  
  // 1. First paragraph description
  if (data.description) {
    paragraphs.push(simplifyTechnicalTerms(data.description));
  }
  
  // 2. Geographic setting (location and climate)
  // (Range characteristics now stored separately as structured data)
  if (data.geographicSetting) {
    const locationInfo = extractLocationInfo(data.geographicSetting);
    const climateInfo = extractClimateInfo(data.geographicSetting);
    
    if (locationInfo || climateInfo) {
      let geoParagraph = 'These soils are typically found';
      if (locationInfo) geoParagraph += ` ${locationInfo}`;
      if (climateInfo) geoParagraph += `. ${climateInfo}`;
      paragraphs.push(geoParagraph);
    }
  }
  
  // 3. Drainage and permeability
  if (data.drainageAndPermeability) {
    const drainage = simplifyDrainageInfo(data.drainageAndPermeability);
    if (drainage) paragraphs.push(drainage);
  }
  
  // 4. Use and vegetation
  if (data.useAndVegetation) {
    const uses = simplifyUseInfo(data.useAndVegetation);
    if (uses) paragraphs.push(uses);
  }
  
  return paragraphs.join('\n\n');
}

function simplifyTechnicalTerms(text) {
  const replacements = {
    'lacustrine deposits': 'lake sediments',
    'alluvium': 'river sediments',
    'colluvium': 'hillslope sediments',
    'eolian': 'wind-deposited',
    'smectitic': 'clay-rich',
    'vertic': 'shrink-swell clay',
  };
  
  let simplified = text;
  for (const [technical, simple] of Object.entries(replacements)) {
    simplified = simplified.replace(new RegExp(technical, 'gi'), simple);
  }
  
  return simplified;
}

function extractRangeCharacteristicsList(rangeText) {
  // Extract key soil characteristics as a structured list
  const characteristics = [];
  
  // Mean annual soil temperature
  const soilTempMatch = rangeText.match(/mean annual soil temperature[^\d]+(\d+ to \d+)/i);
  if (soilTempMatch) {
    characteristics.push({
      property: 'Soil Temperature',
      value: `${soilTempMatch[1]} degrees C`,
      importance: 'Affects plant growth and microbial activity'
    });
  }
  
  // Clay content
  const clayMatch = rangeText.match(/clay content[^\d]+(\d+ to \d+) percent/i);
  if (clayMatch) {
    characteristics.push({
      property: 'Clay Content',
      value: `${clayMatch[1]} percent`,
      importance: 'Affects water retention and workability'
    });
  }
  
  // Moisture regime
  if (rangeText.toLowerCase().includes('usually moist')) {
    characteristics.push({
      property: 'Moisture Regime',
      value: 'Typically maintains moisture',
      importance: 'Good water availability for crops'
    });
  } else {
    const dryMatch = rangeText.match(/dry (?:for |in )(\d+ to \d+) (?:consecutive )?days/i);
    if (dryMatch) {
      characteristics.push({
        property: 'Dry Period',
        value: `${dryMatch[1]} days`,
        importance: 'May require irrigation during dry periods'
      });
    }
  }
  
  // pH/Reaction
  const phMatch = rangeText.match(/reaction[^\d:]*(strongly acid|moderately acid|slightly acid|neutral|slightly alkaline|moderately alkaline|strongly alkaline)/i);
  if (phMatch) {
    characteristics.push({
      property: 'Soil Reaction',
      value: phMatch[1],
      importance: 'Affects nutrient availability and crop selection'
    });
  } else {
    const phNumMatch = rangeText.match(/(?:pH|reaction)[^\d]+([\d.]+ to [\d.]+)/i);
    if (phNumMatch) {
      const phRange = phNumMatch[1];
      const phValues = phRange.split(' to ').map(v => parseFloat(v));
      if (phValues.every(v => v >= 3 && v <= 10)) {
        characteristics.push({
          property: 'Soil pH',
          value: phRange,
          importance: 'Affects nutrient availability and crop selection'
        });
      }
    }
  }
  
  // Depth to restrictive layer
  const depthMatch = rangeText.match(/depth to [\w\s]+ (?:is |ranges from )(\d+ to \d+)/i);
  if (depthMatch) {
    characteristics.push({
      property: 'Depth to Restrictive Layer',
      value: `${depthMatch[1]} cm`,
      importance: 'Affects root development'
    });
  }
  
  return characteristics.length > 0 ? characteristics : null;
}

function extractLocationInfo(geographicText) {
  const landformMatch = geographicText.match(/on\s+([\w\s,]+?)\./i);
  return landformMatch ? `on ${landformMatch[1].toLowerCase()}` : '';
}

function extractClimateInfo(geographicText) {
  const climateInfo = [];
  
  const precipMatch = geographicText.match(/mean annual precipitation is (\d+\s+to\s+\d+\s+inches)/i);
  if (precipMatch) climateInfo.push(`The climate provides ${precipMatch[1]} of annual rainfall`);
  
  const tempMatch = geographicText.match(/mean annual (?:air )?temperature is (\d+\s+to\s+\d+\s+degrees\s+F)/i);
  if (tempMatch) climateInfo.push(`average temperatures of ${tempMatch[1]}`);
  
  const frostMatch = geographicText.match(/frost-free period is (\d+\s+to\s+\d+\s+days)/i);
  if (frostMatch) climateInfo.push(`a growing season of ${frostMatch[1]}`);
  
  return climateInfo.length > 0 ? climateInfo.join(', ') + '.' : '';
}

function simplifyDrainageInfo(drainageText) {
  const info = [];
  
  if (drainageText.includes('Well drained')) {
    info.push('Water drains readily through this soil');
  } else if (drainageText.includes('Moderately well drained')) {
    info.push('Water drains at a moderate rate');
  } else if (drainageText.includes('poorly drained')) {
    info.push('This soil tends to stay wet');
  }
  
  if (drainageText.toLowerCase().includes('slow permeability')) {
    info.push('water moves slowly through the soil');
  } else if (drainageText.toLowerCase().includes('moderate permeability')) {
    info.push('water moves at a moderate pace');
  }
  
  return info.length > 0 ? info.join(', ') + '.' : '';
}

function simplifyUseInfo(useText) {
  const info = [];
  
  if (useText.toLowerCase().includes('crop')) info.push('suitable for crop production');
  if (useText.toLowerCase().includes('pasture') || useText.toLowerCase().includes('grazing')) {
    info.push('used for pasture and grazing');
  }
  if (useText.toLowerCase().includes('hay')) info.push('suitable for hay production');
  if (useText.toLowerCase().includes('range')) info.push('used as rangeland');
  
  const vegMatch = useText.match(/(?:vegetation is|native plants)[^.]*\./i);
  if (vegMatch) {
    const vegText = vegMatch[0].split(/vegetation is|native plants/i)[1];
    if (vegText) info.push('Native vegetation includes' + vegText);
  }
  
  return info.length > 0 ? 'Land use: ' + info.join('; ') + '.' : '';
}

// Main processing function
async function processAllOSDFiles() {
  console.log('Starting OSD text file processing...');
  console.log(`Source directory: ${OSD_SOURCE_DIR}`);
  console.log(`Output file: ${OUTPUT_FILE}`);
  
  const descriptions = {};
  let processedCount = 0;
  let errorCount = 0;
  
  const subdirs = fs.readdirSync(OSD_SOURCE_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  console.log(`Found ${subdirs.length} subdirectories`);
  
  for (const subdir of subdirs) {
    const subdirPath = path.join(OSD_SOURCE_DIR, subdir);
    const files = fs.readdirSync(subdirPath).filter(file => file.endsWith('.txt'));
    
    console.log(`Processing ${subdir}/: ${files.length} files`);
    
    for (const file of files) {
      try {
        const filePath = path.join(subdirPath, file);
        const seriesName = path.basename(file, '.txt');
        const content = fs.readFileSync(filePath, 'utf-8');
        
        const parsed = parseOSDText(content, seriesName);
        
        descriptions[seriesName.toUpperCase()] = {
          series: seriesName.toUpperCase(),
          description: parsed.fullDescription,
          rangeCharacteristics: parsed.rangeCharacteristics,
          lastUpdated: new Date().toISOString(),
        };
        
        processedCount++;
        
        if (processedCount % 500 === 0) {
          console.log(`  Processed ${processedCount} files...`);
        }
      } catch (error) {
        console.error(`Error processing ${file}:`, error.message);
        errorCount++;
      }
    }
  }
  
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(descriptions, null, 2), 'utf-8');
  
  console.log('\n=== Processing Complete ===');
  console.log(`Total files processed: ${processedCount}`);
  console.log(`Errors encountered: ${errorCount}`);
  console.log(`Output written to: ${OUTPUT_FILE}`);
  console.log(`Database size: ${Object.keys(descriptions).length} entries`);
  
  const samples = Object.keys(descriptions).slice(0, 2);
  console.log('\n=== Sample Descriptions ===');
  for (const series of samples) {
    console.log(`\n${series}:`);
    console.log(descriptions[series].description.substring(0, 250) + '...\n');
  }
}

processAllOSDFiles().catch(console.error);
