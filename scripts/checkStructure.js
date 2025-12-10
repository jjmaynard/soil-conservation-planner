const fs = require('fs');
const path = require('path');

// Load the generated descriptions
const descriptionsPath = path.join(__dirname, '..', 'public', 'data', 'osd-descriptions.json');
const data = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

// Test specific soils
const testSoils = ['COBURG', 'KIDDER', 'KIDAZQENI'];

console.log('Checking new structure with range characteristics as separate list...\n');

testSoils.forEach(soil => {
  if (data[soil]) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`${soil}:`);
    console.log('='.repeat(80));
    console.log('\nDescription:');
    console.log(data[soil].description);
    
    if (data[soil].rangeCharacteristics) {
      console.log('\n\nRange Characteristics (List Format):');
      data[soil].rangeCharacteristics.forEach((char, idx) => {
        console.log(`\n  ${idx + 1}. ${char.property}: ${char.value}`);
        console.log(`     Why it matters: ${char.importance}`);
      });
    } else {
      console.log('\n\n[No range characteristics available]');
    }
  } else {
    console.log(`\n${soil}: NOT FOUND in database`);
  }
});
