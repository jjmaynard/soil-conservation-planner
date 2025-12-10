// Script to process all OSD text files and create a JSON database
// Run with: node --loader ts-node/esm scripts/generateOSDDescriptions.ts

import * as fs from 'fs'
import * as path from 'path'
import { parseOSDText } from '../src/utils/osdTextParser'

interface OSDDescriptionEntry {
  series: string
  description: string
  lastUpdated: string
}

const OSD_SOURCE_DIR = path.join(process.cwd(), 'Property_Panel_Guide', 'OSD')
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'data', 'osd-descriptions.json')

async function processAllOSDFiles() {
  console.log('Starting OSD text file processing...')
  console.log(`Source directory: ${OSD_SOURCE_DIR}`)
  console.log(`Output file: ${OUTPUT_FILE}`)
  
  const descriptions: Record<string, OSDDescriptionEntry> = {}
  let processedCount = 0
  let errorCount = 0
  
  // Read all subdirectories (A-Z)
  const subdirs = fs.readdirSync(OSD_SOURCE_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
  
  console.log(`Found ${subdirs.length} subdirectories`)
  
  for (const subdir of subdirs) {
    const subdirPath = path.join(OSD_SOURCE_DIR, subdir)
    const files = fs.readdirSync(subdirPath)
      .filter(file => file.endsWith('.txt'))
    
    console.log(`Processing ${subdir}/: ${files.length} files`)
    
    for (const file of files) {
      try {
        const filePath = path.join(subdirPath, file)
        const seriesName = path.basename(file, '.txt')
        const content = fs.readFileSync(filePath, 'utf-8')
        
        // Parse the OSD text file
        const parsed = parseOSDText(content, seriesName)
        
        // Store the user-friendly description
        descriptions[seriesName.toUpperCase()] = {
          series: seriesName.toUpperCase(),
          description: parsed.fullDescription,
          lastUpdated: new Date().toISOString(),
        }
        
        processedCount++
        
        // Progress indicator
        if (processedCount % 100 === 0) {
          console.log(`  Processed ${processedCount} files...`)
        }
      } catch (error) {
        console.error(`Error processing ${file}:`, error)
        errorCount++
      }
    }
  }
  
  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  // Write the JSON database
  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(descriptions, null, 2),
    'utf-8'
  )
  
  console.log('\n=== Processing Complete ===')
  console.log(`Total files processed: ${processedCount}`)
  console.log(`Errors encountered: ${errorCount}`)
  console.log(`Output written to: ${OUTPUT_FILE}`)
  console.log(`Database size: ${Object.keys(descriptions).length} entries`)
  
  // Show a few examples
  console.log('\n=== Sample Descriptions ===')
  const samples = Object.keys(descriptions).slice(0, 3)
  for (const series of samples) {
    console.log(`\n${series}:`)
    console.log(descriptions[series].description.substring(0, 200) + '...')
  }
}

// Run the processing
processAllOSDFiles().catch(console.error)
