// ==========================================================================
// EXAMPLE: PARSING AND USING SSURGO INTERPRETATION DATA
// Shows how to integrate the grouping system with your SoilViz Pro data
// ==========================================================================

import { SoilInterpretationsPanel, InterpretationsDashboardWidget } from './SoilInterpretationsPanel.jsx';
import { interpretationGroups, analyzeInterpretations } from './interpretationGroups.js';

// ==========================================================================
// PARSE YOUR RAW INTERPRETATION DATA
// ==========================================================================

/**
 * Parse the raw text data from your SSURGO query
 * Converts the text format to structured data
 */
export function parseInterpretationData(rawText) {
  const lines = rawText.trim().split('\n');
  const interpretations = [];
  
  let currentInterp = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) continue;
    
    // Check if this is a new interpretation (doesn't start with "Depth:", "Rating:", or a number)
    if (!trimmedLine.startsWith('Depth:') && 
        !trimmedLine.startsWith('Rating:') && 
        !trimmedLine.match(/^\d/)) {
      
      // Save previous interpretation if exists
      if (currentInterp) {
        interpretations.push(currentInterp);
      }
      
      // Start new interpretation
      currentInterp = {
        name: trimmedLine,
        depth: null,
        rating: null,
        value: null
      };
    } else if (currentInterp) {
      // Parse depth line
      if (trimmedLine.startsWith('Depth:')) {
        currentInterp.depth = trimmedLine.replace('Depth:', '').trim();
      }
      // Parse rating line
      else if (trimmedLine.startsWith('Rating:')) {
        currentInterp.rating = trimmedLine.replace('Rating:', '').trim();
      }
      // Parse numeric value (last line of each interpretation)
      else if (trimmedLine.match(/^[\d.]+$/)) {
        currentInterp.value = parseFloat(trimmedLine);
      }
    }
  }
  
  // Don't forget the last interpretation
  if (currentInterp) {
    interpretations.push(currentInterp);
  }
  
  return interpretations;
}

// ==========================================================================
// EXAMPLE DATA PROCESSING
// ==========================================================================

// Your raw interpretation data (from the document)
const rawInterpretationText = `
Component Interpretations
AGR - Industrial Hemp for Fiber and Seed Production
Depth: 0 cm
Rating: Not suited
0
AGR - Nitrate Leaching Potential, Irrigated (WA)
Depth: 0 cm
Rating: Moderately high
0.6
AGR - Nitrate Leaching Potential, Nonirrigated (WA)
Depth: 0 cm
Rating: Low
0.201
// ... (your full data here)
`;

// Parse the data
const interpretationData = parseInterpretationData(rawInterpretationText);

// Analyze the data
const analysisResults = analyzeInterpretations(interpretationData);

console.log('Parsed Interpretations:', interpretationData.length);
console.log('Analysis Results:', analysisResults);

// ==========================================================================
// EXAMPLE INTEGRATION IN YOUR SOILVIZ PRO COMPONENT
// ==========================================================================

export function SoilVizProWithInterpretations({ soilData, interpretationData }) {
  const [selectedProperty, setSelectedProperty] = useState('clay');
  const [showInterpretations, setShowInterpretations] = useState(true);

  return (
    <div className="flex h-screen">
      {/* Map Container */}
      <div className="flex-1 relative">
        <div id="map" className="w-full h-full" />
        
        {/* Map Controls */}
        <div className="absolute top-4 left-4 w-64">
          <SoilPropertyLegend 
            property={selectedProperty}
            onPropertyChange={setSelectedProperty}
          />
        </div>
      </div>
      
      {/* Side Panel */}
      <div className="w-96 bg-gray-50 flex flex-col">
        {/* Soil Properties Panel */}
        {soilData && (
          <div className="p-6">
            <SoilQualityDashboard soilData={soilData} />
          </div>
        )}
        
        {/* Panel Toggle */}
        <div className="px-6 pb-2">
          <button
            onClick={() => setShowInterpretations(!showInterpretations)}
            className="flex items-center justify-between w-full p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <span className="font-medium">Soil Interpretations</span>
            <span className={`transform transition-transform ${showInterpretations ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
        </div>
        
        {/* Interpretations Panel */}
        {showInterpretations && (
          <div className="flex-1 min-h-0 px-6 pb-6">
            <SoilInterpretationsPanel interpretationData={interpretationData} />
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================================================
// EXAMPLE: FILTER INTERPRETATIONS FOR SPECIFIC USES
// ==========================================================================

export function getInterpretationsForLandUse(interpretationData, landUse) {
  const landUseGroups = {
    agriculture: ['agricultural'],
    forestry: ['forestry'],
    development: ['engineering', 'urbanRecreation'],
    conservation: ['conservation', 'rangeland'],
    emergency: ['emergencyManagement'],
    military: ['military']
  };
  
  const relevantGroups = landUseGroups[landUse] || [];
  
  return interpretationData.filter(interp => {
    const location = findInterpretation(interp.name);
    return location && relevantGroups.includes(location.group);
  });
}

// ==========================================================================
// EXAMPLE: CREATE INTERPRETATION REPORT
// ==========================================================================

export function generateInterpretationReport(interpretationData, options = {}) {
  const {
    includeGroups = Object.keys(interpretationGroups),
    minValue = 0,
    sortBy = 'value' // 'value', 'name', 'group'
  } = options;

  let filteredData = interpretationData.filter(interp => {
    const location = findInterpretation(interp.name);
    return location && 
           includeGroups.includes(location.group) && 
           interp.value >= minValue;
  });

  // Sort the data
  if (sortBy === 'value') {
    filteredData.sort((a, b) => b.value - a.value);
  } else if (sortBy === 'name') {
    filteredData.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'group') {
    filteredData.sort((a, b) => {
      const locA = findInterpretation(a.name);
      const locB = findInterpretation(b.name);
      if (locA?.group !== locB?.group) {
        return (locA?.group || '').localeCompare(locB?.group || '');
      }
      return b.value - a.value;
    });
  }

  // Generate report sections
  const report = {
    summary: analyzeInterpretations(filteredData),
    topInterpretations: filteredData.slice(0, 10),
    byGroup: {}
  };

  // Group interpretations
  includeGroups.forEach(groupKey => {
    const groupInterps = filteredData.filter(interp => {
      const location = findInterpretation(interp.name);
      return location?.group === groupKey;
    });

    if (groupInterps.length > 0) {
      report.byGroup[groupKey] = {
        name: interpretationGroups[groupKey].name,
        icon: interpretationGroups[groupKey].icon,
        count: groupInterps.length,
        interpretations: groupInterps,
        avgValue: groupInterps.reduce((sum, interp) => sum + interp.value, 0) / groupInterps.length
      };
    }
  });

  return report;
}

// ==========================================================================
// EXAMPLE USAGE
// ==========================================================================

// Example 1: Get agricultural interpretations only
const agricultureInterpretations = getInterpretationsForLandUse(interpretationData, 'agriculture');
console.log('Agriculture Interpretations:', agricultureInterpretations.length);

// Example 2: Generate a report for development planning
const developmentReport = generateInterpretationReport(interpretationData, {
  includeGroups: ['engineering', 'urbanRecreation', 'waterManagement'],
  minValue: 0.1,
  sortBy: 'value'
});
console.log('Development Report:', developmentReport);

// Example 3: Find high-value forestry interpretations
const forestryHighValue = interpretationData.filter(interp => {
  const location = findInterpretation(interp.name);
  return location?.group === 'forestry' && interp.value > 0.8;
});
console.log('High-Value Forestry Interpretations:', forestryHighValue);

// ==========================================================================
// INTEGRATION WITH YOUR EXISTING SOIL DATA QUERY
// ==========================================================================

/**
 * Enhanced soil data fetch that includes interpretations
 */
export async function fetchSoilDataWithInterpretations(coordinates) {
  try {
    // Your existing NRCS SDA query for soil properties
    const soilPropertiesQuery = `
      SELECT 
        mp.mukey, mp.musym, mp.muname,
        c.compname, c.comppct_r, c.majcompflag,
        -- Add interpretation query here
        ci.rulename, ci.ruledepth, ci.interprvalue, ci.interprrating
      FROM 
        mapunit mu
        INNER JOIN component c ON c.mukey = mu.mukey
        INNER JOIN cointerpretation ci ON ci.cokey = c.cokey
        INNER JOIN mupolygon mp ON mp.mukey = mu.mukey
      WHERE 
        ST_Intersects(mp.wkb_geometry, ST_GeomFromText('POINT(${coordinates.lon} ${coordinates.lat})', 4326))
      ORDER BY c.comppct_r DESC;
    `;

    const response = await fetch('https://sdmdataaccess.nrcs.usda.gov/Tabular/post.rest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        format: 'JSON',
        query: soilPropertiesQuery
      })
    });

    const data = await response.json();
    
    // Process the response to separate soil properties and interpretations
    const soilProperties = {
      // ... your existing soil property extraction
    };

    const interpretations = data.Table[0].filter(row => row.rulename).map(row => ({
      name: row.rulename,
      depth: row.ruledepth,
      rating: row.interprrating,
      value: row.interprvalue
    }));

    return {
      soilProperties,
      interpretations
    };

  } catch (error) {
    console.error('Error fetching soil data:', error);
    return { soilProperties: null, interpretations: [] };
  }
}

export {
  parseInterpretationData,
  interpretationData,
  analysisResults,
  getInterpretationsForLandUse,
  generateInterpretationReport
};
