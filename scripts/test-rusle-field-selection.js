// ============================================================================
// RUSLE-EOS Field Selection Flow Test
// ============================================================================
// Tests the return navigation from field-analysis to RUSLE-EOS

const fs = require('fs')
const path = require('path')

console.log('🧪 Testing RUSLE-EOS Field Selection Flow\n')
console.log('=' .repeat(60))

let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    console.log(`✅ ${name}`)
    passed++
  } catch (err) {
    console.log(`❌ ${name}`)
    console.log(`   Error: ${err.message}`)
    failed++
  }
}

// Test 1: RUSLE-EOS sets sessionStorage flag and clears planning wizard flag
test('RUSLE-EOS sets returnToRUSLE flag and clears conflicts', () => {
  const rusleFile = fs.readFileSync(
    path.join(__dirname, '../src/pages/tools/rusle-eos.tsx'),
    'utf-8'
  )
  
  if (!rusleFile.includes("sessionStorage.setItem('returnToRUSLE', 'true')")) {
    throw new Error('RUSLE-EOS does not set returnToRUSLE flag')
  }
  
  if (!rusleFile.includes("sessionStorage.removeItem('returnToPlanningWizard')")) {
    throw new Error('RUSLE-EOS does not clear planning wizard flag')
  }
  
  if (!rusleFile.includes("router.push('/field-analysis')")) {
    throw new Error('RUSLE-EOS does not navigate to field-analysis')
  }
})

// Test 2: RUSLE-EOS imports useEffect
test('RUSLE-EOS imports useEffect', () => {
  const rusleFile = fs.readFileSync(
    path.join(__dirname, '../src/pages/tools/rusle-eos.tsx'),
    'utf-8'
  )
  
  if (!rusleFile.includes("import { useState, useEffect }")) {
    throw new Error('RUSLE-EOS does not import useEffect')
  }
})

// Test 3: RUSLE-EOS retrieves field data from sessionStorage
test('RUSLE-EOS retrieves field data on mount', () => {
  const rusleFile = fs.readFileSync(
    path.join(__dirname, '../src/pages/tools/rusle-eos.tsx'),
    'utf-8'
  )
  
  if (!rusleFile.includes("sessionStorage.getItem('rusleSelectedField')")) {
    throw new Error('RUSLE-EOS does not retrieve rusleSelectedField')
  }
  
  if (!rusleFile.includes('sessionStorage.removeItem')) {
    throw new Error('RUSLE-EOS does not clean up sessionStorage')
  }
  
  if (!rusleFile.includes('setSelectedField')) {
    throw new Error('RUSLE-EOS does not set field state')
  }
})

// Test 4: Field-analysis has RUSLE mode state
test('Field-analysis has isFromRUSLE state', () => {
  const fieldAnalysisFile = fs.readFileSync(
    path.join(__dirname, '../src/pages/field-analysis/index.tsx'),
    'utf-8'
  )
  
  if (!fieldAnalysisFile.includes('const [isFromRUSLE, setIsFromRUSLE] = useState(false)')) {
    throw new Error('Field-analysis missing isFromRUSLE state')
  }
})

// Test 5: Field-analysis checks for RUSLE flag
test('Field-analysis checks returnToRUSLE flag', () => {
  const fieldAnalysisFile = fs.readFileSync(
    path.join(__dirname, '../src/pages/field-analysis/index.tsx'),
    'utf-8'
  )
  
  if (!fieldAnalysisFile.includes("sessionStorage.getItem('returnToRUSLE')")) {
    throw new Error('Field-analysis does not check returnToRUSLE flag')
  }
  
  if (!fieldAnalysisFile.includes('setIsFromRUSLE(rusleFlag')) {
    throw new Error('Field-analysis does not set isFromRUSLE state')
  }
})

// Test 6: Field-analysis returns to RUSLE with field data
test('Field-analysis prioritizes RUSLE mode correctly', () => {
  const fieldAnalysisFile = fs.readFileSync(
    path.join(__dirname, '../src/pages/field-analysis/index.tsx'),
    'utf-8'
  )
  
  // Find the position of both checks
  const rusleCheckPos = fieldAnalysisFile.indexOf('if (returnToRUSLE)')
  const planningCheckPos = fieldAnalysisFile.indexOf('else if (returnToPlanningWizard)')
  
  if (rusleCheckPos === -1) {
    throw new Error('Field-analysis missing RUSLE return check')
  }
  
  if (planningCheckPos === -1) {
    throw new Error('Field-analysis missing planning wizard return check')
  }
  
  if (rusleCheckPos > planningCheckPos) {
    throw new Error('Field-analysis checks planning wizard before RUSLE - wrong priority!')
  }
  
  if (!fieldAnalysisFile.includes("sessionStorage.setItem('rusleSelectedField'")) {
    throw new Error('Field-analysis does not store field data')
  }
  
  if (!fieldAnalysisFile.includes("router.push(`/tools/rusle-eos?fieldId=")) {
    throw new Error('Field-analysis does not navigate to RUSLE-EOS')
  }
  
  if (!fieldAnalysisFile.includes("sessionStorage.removeItem('returnToRUSLE')")) {
    throw new Error('Field-analysis does not clean up returnToRUSLE flag')
  }
  
  if (!fieldAnalysisFile.includes("sessionStorage.removeItem('returnToPlanningWizard')")) {
    throw new Error('Field-analysis does not clear both flags after RUSLE return')
  }
})

// Test 7: Field-analysis displays RUSLE mode banner
test('Field-analysis shows RUSLE mode banner', () => {
  const fieldAnalysisFile = fs.readFileSync(
    path.join(__dirname, '../src/pages/field-analysis/index.tsx'),
    'utf-8'
  )
  
  if (!fieldAnalysisFile.includes('{isFromRUSLE && (')) {
    throw new Error('Field-analysis missing RUSLE banner')
  }
  
  if (!fieldAnalysisFile.includes('RUSLE-EOS Mode: Select a field for erosion analysis')) {
    throw new Error('Field-analysis missing RUSLE banner text')
  }
})

// Test 8: Field-analysis has cancel button for RUSLE mode
test('Field-analysis has RUSLE mode cancel button', () => {
  const fieldAnalysisFile = fs.readFileSync(
    path.join(__dirname, '../src/pages/field-analysis/index.tsx'),
    'utf-8'
  )
  
  const rusleSection = fieldAnalysisFile.match(/\{isFromRUSLE && \(([\s\S]*?)\)\}/)?.[1] || ''
  
  if (!rusleSection.includes("router.push('/tools/rusle-eos')")) {
    throw new Error('RUSLE banner missing cancel navigation')
  }
  
  if (!rusleSection.includes('Cancel & Return')) {
    throw new Error('RUSLE banner missing cancel button text')
  }
})

// Test 9: Field-analysis header shows RUSLE mode text
test('Field-analysis header shows RUSLE context', () => {
  const fieldAnalysisFile = fs.readFileSync(
    path.join(__dirname, '../src/pages/field-analysis/index.tsx'),
    'utf-8'
  )
  
  if (!fieldAnalysisFile.includes(': isFromRUSLE')) {
    throw new Error('Header missing RUSLE mode check')
  }
  
  if (!fieldAnalysisFile.includes('Click on a field for erosion analysis')) {
    throw new Error('Header missing RUSLE mode text')
  }
})

// Test 10: Flow is complete (RUSLE → Field Analysis → RUSLE)
test('Complete roundtrip flow with conflict prevention', () => {
  const rusleFile = fs.readFileSync(
    path.join(__dirname, '../src/pages/tools/rusle-eos.tsx'),
    'utf-8'
  )
  const fieldAnalysisFile = fs.readFileSync(
    path.join(__dirname, '../src/pages/field-analysis/index.tsx'),
    'utf-8'
  )
  const planningWizardFile = fs.readFileSync(
    path.join(__dirname, '../src/pages/conservation/planning-wizard.tsx'),
    'utf-8'
  )
  
  // Check outbound flow (RUSLE → Field Analysis) clears conflicts
  const hasOutbound = rusleFile.includes("sessionStorage.setItem('returnToRUSLE', 'true')") &&
                      rusleFile.includes("sessionStorage.removeItem('returnToPlanningWizard')") &&
                      rusleFile.includes("router.push('/field-analysis')")
  
  // Check planning wizard clears RUSLE flag
  const planningClearsRUSLE = planningWizardFile.includes("sessionStorage.removeItem('returnToRUSLE')")
  
  // Check return flow (Field Analysis → RUSLE) clears both flags
  const rusleReturnLogic = fieldAnalysisFile.match(/if \(returnToRUSLE\) \{[\s\S]*?sessionStorage\.removeItem\('returnToRUSLE'\)[\s\S]*?sessionStorage\.removeItem\('returnToPlanningWizard'\)/)?.[0]
  
  // Check planning wizard return clears both flags
  const planningReturnLogic = fieldAnalysisFile.match(/else if \(returnToPlanningWizard\) \{[\s\S]*?sessionStorage\.removeItem\('returnToPlanningWizard'\)[\s\S]*?sessionStorage\.removeItem\('returnToRUSLE'\)/)?.[0]
  
  // Check data retrieval (RUSLE receives field)
  const hasRetrieval = rusleFile.includes("sessionStorage.getItem('rusleSelectedField')") &&
                       rusleFile.includes('setFieldGeometry')
  
  if (!hasOutbound) {
    throw new Error('Outbound flow incomplete - RUSLE must clear planning wizard flag')
  }
  if (!planningClearsRUSLE) {
    throw new Error('Planning wizard must clear RUSLE flag')
  }
  if (!rusleReturnLogic) {
    throw new Error('RUSLE return flow must clear both flags')
  }
  if (!planningReturnLogic) {
    throw new Error('Planning wizard return flow must clear both flags')
  }
  if (!hasRetrieval) {
    throw new Error('Data retrieval incomplete')
  }
})

// Test 11: No duplicate RUSLE logic in field-analysis
test('No duplicate RUSLE return logic', () => {
  const fieldAnalysisFile = fs.readFileSync(
    path.join(__dirname, '../src/pages/field-analysis/index.tsx'),
    'utf-8'
  )
  
  // Count occurrences of RUSLE return logic
  const rusleReturns = (fieldAnalysisFile.match(/router\.push\(`\/tools\/rusle-eos\?fieldId=/g) || []).length
  
  if (rusleReturns !== 1) {
    throw new Error(`Found ${rusleReturns} RUSLE return statements, expected 1`)
  }
})

console.log('=' .repeat(60))
console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`)

if (failed === 0) {
  console.log('✅ All field selection flow tests passed!')
  console.log('\n📋 Implementation Summary:')
  console.log('   • RUSLE-EOS clears planning wizard flag before navigation')
  console.log('   • Planning wizard clears RUSLE flag before navigation')
  console.log('   • Field-analysis prioritizes RUSLE mode over planning wizard')
  console.log('   • Field-analysis clears both flags after returning')
  console.log('   • No duplicate logic or flag conflicts')
  console.log('   • Complete roundtrip: RUSLE → Field Selection → RUSLE ✓')
  console.log('\n🎯 User Flow:')
  console.log('   1. User clicks "Go to Field Selection" in RUSLE-EOS')
  console.log('   2. RUSLE flag set, planning wizard flag cleared')
  console.log('   3. Opens field-analysis with ONLY green RUSLE banner')
  console.log('   4. User clicks on a field')
  console.log('   5. Returns to RUSLE-EOS with field auto-populated')
  console.log('   6. Both flags cleared - no conflicts!')
  process.exit(0)
} else {
  console.log('❌ Some tests failed. Please review the implementation.')
  process.exit(1)
}
