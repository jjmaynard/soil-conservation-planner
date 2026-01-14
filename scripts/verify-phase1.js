/**
 * Phase 1 Verification Script
 * Tests GEE API v2.1.0 integration
 */

const axios = require('axios')
const fs = require('fs')
const path = require('path')

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.+)$/)
    if (match && !line.startsWith('#')) {
      process.env[match[1].trim()] = match[2].trim()
    }
  })
}

const GEE_API_URL = process.env.NEXT_PUBLIC_GEE_API_URL || 'https://gee-api-production.up.railway.app'

console.log('🔍 Phase 1 Verification Tests\n')
console.log('═'.repeat(50))

async function runTests() {
  let passed = 0
  let failed = 0

  // Test 1: Health Check
  console.log('\n📋 Test 1: API Health Check')
  try {
    const response = await axios.get(`${GEE_API_URL}/health`)
    console.log('✅ Status:', response.data.status)
    console.log('   GEE Status:', response.data.gee_status)
    console.log('   Version:', response.data.version)
    passed++
  } catch (error) {
    console.log('❌ Health check failed:', error.message)
    failed++
  }

  // Test 2: Environment Variable
  console.log('\n📋 Test 2: Environment Configuration')
  if (process.env.NEXT_PUBLIC_GEE_API_URL) {
    console.log('✅ GEE_API_URL configured:', process.env.NEXT_PUBLIC_GEE_API_URL)
    passed++
  } else {
    console.log('❌ GEE_API_URL not found in environment')
    failed++
  }

  // Test 3: TypeScript Configuration
  console.log('\n📋 Test 3: TypeScript Path Aliases')
  try {
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json')
    const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8')
    
    // Check for required path aliases in the raw content
    const requiredPaths = ['#types/*', '#hooks/*', '#lib/*']
    const allPresent = requiredPaths.every(p => tsconfigContent.includes(`"${p}"`))
    
    if (allPresent) {
      console.log('✅ All required path aliases configured:')
      requiredPaths.forEach(p => {
        console.log(`   ${p} ✓`)
      })
      passed++
    } else {
      console.log('❌ Missing path aliases')
      failed++
    }
  } catch (error) {
    console.log('❌ tsconfig.json error:', error.message)
    failed++
  }

  // Test 4: Type Definitions File
  console.log('\n📋 Test 4: Type Definitions')
  try {
    const typesPath = path.join(process.cwd(), 'src/types/geeApi.ts')
    if (fs.existsSync(typesPath)) {
      const content = fs.readFileSync(typesPath, 'utf8')
      const hasRUSLE = content.includes('RUSLECalculateRequest')
      const hasCSB = content.includes('CSBBounds')
      const hasDrought = content.includes('DroughtAssessment')
      
      if (hasRUSLE && hasCSB && hasDrought) {
        console.log('✅ Type definitions complete')
        console.log('   - RUSLECalculateRequest ✓')
        console.log('   - CSBBounds ✓')
        console.log('   - DroughtAssessment ✓')
        passed++
      } else {
        console.log('❌ Type definitions incomplete')
        failed++
      }
    } else {
      console.log('❌ geeApi.ts not found')
      failed++
    }
  } catch (error) {
    console.log('❌ Type definitions error:', error.message)
    failed++
  }

  // Test 5: API Client File
  console.log('\n📋 Test 5: GEE API Client')
  try {
    const clientPath = path.join(process.cwd(), 'src/lib/geeApiClient.ts')
    if (fs.existsSync(clientPath)) {
      const content = fs.readFileSync(clientPath, 'utf8')
      const hasFactory = content.includes('createGEEClient')
      const hasCalculateRUSLE = content.includes('calculateRUSLE')
      const hasSingleton = content.includes('export const geeApi')
      
      if (hasFactory && hasCalculateRUSLE && hasSingleton) {
        console.log('✅ API client implementation complete')
        console.log('   - Factory pattern (createGEEClient) ✓')
        console.log('   - Unified endpoint (calculateRUSLE) ✓')
        console.log('   - Singleton export (geeApi) ✓')
        passed++
      } else {
        console.log('❌ API client incomplete')
        failed++
      }
    } else {
      console.log('❌ geeApiClient.ts not found')
      failed++
    }
  } catch (error) {
    console.log('❌ API client error:', error.message)
    failed++
  }

  // Test 6: useRUSLECalculation Hook
  console.log('\n📋 Test 6: RUSLE Calculation Hook')
  try {
    const hookPath = path.join(process.cwd(), 'src/hooks/useRUSLECalculation.ts')
    if (fs.existsSync(hookPath)) {
      const content = fs.readFileSync(hookPath, 'utf8')
      const hasCalculate = content.includes('const calculate')
      const hasCompare = content.includes('compareScenarios')
      const hasReset = content.includes('reset:')
      
      if (hasCalculate && hasCompare && hasReset) {
        console.log('✅ RUSLE hook implementation complete')
        console.log('   - calculate() method ✓')
        console.log('   - compareScenarios() method ✓')
        console.log('   - reset() method ✓')
        passed++
      } else {
        console.log('❌ RUSLE hook incomplete')
        failed++
      }
    } else {
      console.log('❌ useRUSLECalculation.ts not found')
      failed++
    }
  } catch (error) {
    console.log('❌ RUSLE hook error:', error.message)
    failed++
  }

  // Summary
  console.log('\n' + '═'.repeat(50))
  console.log('\n📊 Test Summary')
  console.log(`   Passed: ${passed}/6`)
  console.log(`   Failed: ${failed}/6`)
  
  if (failed === 0) {
    console.log('\n🎉 All Phase 1 tests passed!')
    console.log('   Ready to proceed to Phase 2 (RUSLE-EOS Module)')
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.')
  }
  
  console.log('\n' + '═'.repeat(50))
}

runTests().catch(err => {
  console.error('❌ Test suite error:', err)
  process.exit(1)
})
