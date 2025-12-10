const fs = require('fs');
const path = require('path');

// Load the generated descriptions
const descriptionsPath = path.join(__dirname, '..', 'public', 'data', 'osd-descriptions.json');
const data = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

// Test specific soils
const testSoils = ['COBURG', 'ABBOTT', 'WILLAMETTE'];

console.log('Testing generated descriptions for unwanted sections...\n');

const unwantedSections = [
  'TAXONOMIC CLASS',
  'TYPICAL PEDON',
  'TYPE LOCATION',
  'COMPETING SERIES',
  'GEOGRAPHICALLY ASSOCIATED SOILS',
  'DISTRIBUTION AND EXTENT',
  'REMARKS'
];

testSoils.forEach(soil => {
  if (data[soil]) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`${soil} Description:`);
    console.log('='.repeat(80));
    
    const desc = typeof data[soil] === 'string' ? data[soil] : JSON.stringify(data[soil]);
    console.log(desc.substring(0, 500) + '...\n');
    
    console.log('Checking for unwanted sections:');
    let hasUnwanted = false;
    unwantedSections.forEach(section => {
      if (desc.includes(section)) {
        console.log(`  ❌ FOUND: ${section}`);
        hasUnwanted = true;
      }
    });
    
    if (!hasUnwanted) {
      console.log('  ✓ No unwanted sections found!');
    }
  } else {
    console.log(`\n${soil}: NOT FOUND in database`);
  }
});

console.log(`\n${'='.repeat(80)}`);
console.log('Summary:');
console.log(`Total descriptions: ${Object.keys(data).length}`);
