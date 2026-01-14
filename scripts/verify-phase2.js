/**
 * Phase 2 Verification Script - RUSLE-EOS Module
 * Tests RUSLE-EOS page implementation
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Phase 2 Verification Tests - RUSLE-EOS Module\n')
console.log('═'.repeat(50))

async function runTests() {
  let passed = 0
  let failed = 0

  // Test 1: RUSLE-EOS Page Exists
  console.log('\n📋 Test 1: RUSLE-EOS Page Component')
  try {
    const rusleEosPath = path.join(process.cwd(), 'src/pages/tools/rusle-eos.tsx')
    if (fs.existsSync(rusleEosPath)) {
      const content = fs.readFileSync(rusleEosPath, 'utf8')
      const hasMainComponent = content.includes('export default function RUSLEEOSCalculator')
      const hasRUSLEHook = content.includes('useRUSLECalculation')
      const hasConservationPractices = content.includes('CONSERVATION_PRACTICES')
      
      if (hasMainComponent && hasRUSLEHook && hasConservationPractices) {
        console.log('✅ RUSLE-EOS page complete')
        console.log('   - Main component ✓')
        console.log('   - RUSLE calculation hook ✓')
        console.log('   - Conservation practices data ✓')
        passed++
      } else {
        console.log('❌ RUSLE-EOS page incomplete')
        failed++
      }
    } else {
      console.log('❌ rusle-eos.tsx not found')
      failed++
    }
  } catch (error) {
    console.log('❌ RUSLE-EOS page error:', error.message)
    failed++
  }

  // Test 2: Results Display Components
  console.log('\n📋 Test 2: Results Display Components')
  try {
    const rusleEosPath = path.join(process.cwd(), 'src/pages/tools/rusle-eos.tsx')
    const content = fs.readFileSync(rusleEosPath, 'utf8')
    
    const hasResultsCard = content.includes('function RUSLEResultsCard')
    const hasFactorsCard = content.includes('function RUSLEFactorsCard')
    const hasComparisonCard = content.includes('function ScenarioComparisonCard')
    const hasRecommendations = content.includes('function RecommendationsCard')
    
    if (hasResultsCard && hasFactorsCard && hasComparisonCard && hasRecommendations) {
      console.log('✅ All display components present')
      console.log('   - RUSLEResultsCard ✓')
      console.log('   - RUSLEFactorsCard ✓')
      console.log('   - ScenarioComparisonCard ✓')
      console.log('   - RecommendationsCard ✓')
      passed++
    } else {
      console.log('❌ Missing display components')
      failed++
    }
  } catch (error) {
    console.log('❌ Components check error:', error.message)
    failed++
  }

  // Test 3: Navigation Links Updated
  console.log('\n📋 Test 3: Navigation Links')
  try {
    const sidebarPath = path.join(process.cwd(), 'src/components/layout/SidebarLayout.tsx')
    const moduleGridPath = path.join(process.cwd(), 'src/components/Dashboard/ModuleGrid.tsx')
    
    const sidebarContent = fs.readFileSync(sidebarPath, 'utf8')
    const moduleGridContent = fs.readFileSync(moduleGridPath, 'utf8')
    
    const sidebarHasLink = sidebarContent.includes('/tools/rusle-eos')
    const moduleGridHasLink = moduleGridContent.includes('/tools/rusle-eos')
    const sidebarHasLabel = sidebarContent.includes('RUSLE-EOS')
    
    if (sidebarHasLink && moduleGridHasLink && sidebarHasLabel) {
      console.log('✅ Navigation links updated')
      console.log('   - Sidebar link ✓')
      console.log('   - Module grid link ✓')
      console.log('   - Display label ✓')
      passed++
    } else {
      console.log('❌ Navigation links incomplete')
      failed++
    }
  } catch (error) {
    console.log('❌ Navigation check error:', error.message)
    failed++
  }

  // Test 4: Old RUSLE2 Page Redirects
  console.log('\n📋 Test 4: RUSLE2 Redirect')
  try {
    const rusle2Path = path.join(process.cwd(), 'src/pages/tools/rusle2.tsx')
    const content = fs.readFileSync(rusle2Path, 'utf8')
    
    const hasRedirect = content.includes("router.replace('/tools/rusle-eos')")
    
    if (hasRedirect) {
      console.log('✅ RUSLE2 page redirects to RUSLE-EOS')
      passed++
    } else {
      console.log('❌ RUSLE2 redirect not configured')
      failed++
    }
  } catch (error) {
    console.log('❌ Redirect check error:', error.message)
    failed++
  }

  // Test 5: Conservation Practices Configuration
  console.log('\n📋 Test 5: Conservation Practices')
  try {
    const rusleEosPath = path.join(process.cwd(), 'src/pages/tools/rusle-eos.tsx')
    const content = fs.readFileSync(rusleEosPath, 'utf8')
    
    const hasNone = content.includes("type: 'none'")
    const hasContour = content.includes("type: 'contour'")
    const hasStripCropping = content.includes("type: 'strip_cropping'")
    const hasTerracing = content.includes("type: 'terracing'")
    
    if (hasNone && hasContour && hasStripCropping && hasTerracing) {
      console.log('✅ Conservation practices configured')
      console.log('   - Baseline (none) ✓')
      console.log('   - Contour farming ✓')
      console.log('   - Strip cropping ✓')
      console.log('   - Terracing ✓')
      passed++
    } else {
      console.log('❌ Conservation practices incomplete')
      failed++
    }
  } catch (error) {
    console.log('❌ Practices check error:', error.message)
    failed++
  }

  // Test 6: Feature Checklist
  console.log('\n📋 Test 6: Feature Completeness')
  try {
    const rusleEosPath = path.join(process.cwd(), 'src/pages/tools/rusle-eos.tsx')
    const content = fs.readFileSync(rusleEosPath, 'utf8')
    
    const features = {
      'Field selection': content.includes('handleFieldSelect'),
      'Date range input': content.includes('startDate') && content.includes('endDate'),
      'Practice selector': content.includes('selectedPractice'),
      'Calculate button': content.includes('handleCalculate'),
      'Results display': content.includes('RUSLEResultsCard'),
      'Scenario comparison': content.includes('handleCompareScenarios'),
      'T-value checking': content.includes('exceeds_t_value'),
      'Cost estimation': content.includes('costPerAcre'),
      'Error handling': content.includes('error &&'),
      'Loading states': content.includes('loading ?'),
    }
    
    const completedFeatures = Object.values(features).filter(v => v).length
    const totalFeatures = Object.keys(features).length
    
    console.log(`✅ Features: ${completedFeatures}/${totalFeatures}`)
    Object.entries(features).forEach(([name, present]) => {
      console.log(`   ${present ? '✓' : '✗'} ${name}`)
    })
    
    if (completedFeatures === totalFeatures) {
      passed++
    } else {
      failed++
    }
  } catch (error) {
    console.log('❌ Feature check error:', error.message)
    failed++
  }

  // Summary
  console.log('\n' + '═'.repeat(50))
  console.log('\n📊 Phase 2 Test Summary')
  console.log(`   Passed: ${passed}/6`)
  console.log(`   Failed: ${failed}/6`)
  
  if (failed === 0) {
    console.log('\n🎉 Phase 2 implementation complete!')
    console.log('   RUSLE-EOS module ready for testing')
    console.log('\n📝 Next Steps:')
    console.log('   1. Start the development server: npm run dev')
    console.log('   2. Navigate to http://localhost:3000/tools/rusle-eos')
    console.log('   3. Select a field from field-analysis module')
    console.log('   4. Test RUSLE calculation with different practices')
    console.log('   5. Verify scenario comparison functionality')
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.')
  }
  
  console.log('\n' + '═'.repeat(50))
}

runTests().catch(err => {
  console.error('❌ Test suite error:', err)
  process.exit(1)
})
