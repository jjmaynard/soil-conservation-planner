// Test geometry handling for RUSLE-EOS

const testGeometry = {
  type: 'Polygon',
  coordinates: [[
    [-95.5, 39.5],
    [-95.5, 39.6],
    [-95.4, 39.6],
    [-95.4, 39.5],
    [-95.5, 39.5]
  ]]
}

console.log('Testing RUSLE-EOS Geometry Handling\n')

// Test 1: Verify GeoJSON stringification
const geoJsonString = JSON.stringify(testGeometry)
console.log('✓ GeoJSON stringified:', geoJsonString.substring(0, 50) + '...')

// Test 2: Verify it can be parsed back
try {
  const parsed = JSON.parse(geoJsonString)
  console.log('✓ GeoJSON parsed back successfully')
  console.log('  Type:', parsed.type)
  console.log('  Coordinates length:', parsed.coordinates[0].length)
} catch (err) {
  console.log('✗ Failed to parse GeoJSON')
}

// Test 3: Verify double stringify issue (the bug)
const doubleStringified = JSON.stringify(JSON.stringify(testGeometry))
console.log('\n✗ Double stringify (BUG):')
console.log('  Result:', doubleStringified.substring(0, 60) + '...')
console.log('  Notice the extra quotes and escaping!')

console.log('\n✅ Fix: Store geometry as object, stringify only when sending to API')
console.log('  fieldGeometry = field.geometry  // Store as object')
console.log('  geometry: JSON.stringify(fieldGeometry)  // Stringify for API')
