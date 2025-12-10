// Quick Upgrade: Transform Your Current Panel in 3 Steps
// This shows the minimal changes to make your current panel look professional

// STEP 1: Enhanced Header Component
export function EnhancedSoilHeader({ mapUnit, onClose }) {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-orange-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Status indicator */}
          <div className="flex items-center space-x-2 text-sm text-amber-700 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-medium">USDA NRCS • SDA Web Service</span>
          </div>
          
          {/* Enhanced title */}
          <h2 className="text-lg font-bold text-gray-900 leading-tight">
            {mapUnit.symbol} - {mapUnit.name}
          </h2>
          
          {/* Key info badges */}
          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
            <span className="bg-white px-2 py-1 rounded font-mono text-xs border border-amber-200">
              {mapUnit.key}
            </span>
            <span className="font-medium">
              {mapUnit.acres?.toLocaleString()} acres
            </span>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors text-xl"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// STEP 2: Enhanced Property Display
export function EnhancedPropertyGrid({ properties }) {
  const propertyItems = [
    { label: 'Slope', value: properties.slope || 'N/A', icon: '📐' },
    { label: 'Drainage', value: properties.drainage || 'N/A', icon: '💧' },
    { label: 'Texture', value: properties.texture || 'N/A', icon: '🪨' },
    { label: 'Depth', value: properties.depth || 'N/A', icon: '📏' },
    { label: 'Permeability', value: properties.permeability || 'N/A', icon: '⬇️' },
    { label: 'Water Capacity', value: properties.available_water || 'N/A', icon: '🌊' }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {propertyItems.map((item, idx) => (
        <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:bg-white hover:shadow-md transition-all">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs text-gray-600 uppercase tracking-wide font-medium">
              {item.label}
            </span>
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

// STEP 3: Enhanced Composition Display
export function EnhancedComposition({ composition = [] }) {
  // Handle empty composition data gracefully
  const displayComposition = composition.length > 0 ? composition : [
    { component: 'Loading...', percentage: 0, major: false }
  ];

  return (
    <div className="p-4">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <span className="text-lg">🥧</span>
        <span>Map Unit Composition</span>
      </h3>
      
      {/* Visual bar if data exists */}
      {composition.length > 0 && (
        <div className="mb-4 bg-gray-200 rounded-full h-6 overflow-hidden border border-gray-300">
          <div className="h-full flex">
            {composition.map((comp, idx) => (
              <div
                key={idx}
                className={`h-full transition-all duration-700 ${
                  comp.major ? 'bg-green-500' : 
                  idx % 2 ? 'bg-blue-400' : 'bg-amber-400'
                }`}
                style={{ width: `${comp.percentage}%` }}
                title={`${comp.component}: ${comp.percentage}%`}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Component list */}
      <div className="space-y-2">
        {displayComposition.map((comp, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                comp.major ? 'bg-green-500' : 
                idx % 2 ? 'bg-blue-400' : 'bg-amber-400'
              }`} />
              <span className="font-medium text-gray-900">{comp.component}</span>
              {comp.major && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Major
                </span>
              )}
            </div>
            <span className="font-bold text-gray-900">{comp.percentage}%</span>
          </div>
        ))}
      </div>
      
      {composition.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <div className="text-2xl mb-2">📊</div>
          <p className="text-sm">Component data loading...</p>
        </div>
      )}
    </div>
  );
}

// UPGRADED VERSION: Minimal changes to your existing component
export function UpgradedSoilPanel({ soilData, onClose }) {
  // Use your existing state and logic, just enhance the UI
  const [activeTab, setActiveTab] = useState('mapunit');

  // Transform your existing data structure
  const enhancedData = {
    mapUnit: {
      key: soilData?.mapUnitKey || 'N/A',
      symbol: soilData?.mapUnitSymbol || 'N/A', 
      name: soilData?.mapUnitName || 'Loading...',
      acres: soilData?.totalAcres || 0
    },
    properties: {
      // Map your existing properties or add defaults
      slope: soilData?.slope || 'Unknown',
      drainage: soilData?.drainage || 'Unknown',
      texture: soilData?.texture || 'Unknown',
      depth: soilData?.depth || 'Unknown',
      permeability: soilData?.permeability || 'Unknown',
      available_water: soilData?.awc || 'Unknown'
    },
    composition: soilData?.composition || []
  };

  return (
    <div className="w-96 bg-white shadow-2xl border-l border-gray-200 h-full flex flex-col">
      {/* Step 1: Use Enhanced Header */}
      <EnhancedSoilHeader 
        mapUnit={enhancedData.mapUnit} 
        onClose={onClose} 
      />

      {/* Enhanced Tab Navigation */}
      <div className="border-b border-gray-200 bg-gray-50">
        <nav className="flex space-x-1 p-1">
          {[
            { id: 'mapunit', label: 'Map Unit', icon: '🗺️' },
            { id: 'components', label: 'Components', icon: '🥧' },
            { id: 'taxonomy', label: 'Taxonomy', icon: '📊' },
            { id: 'horizons', label: 'Horizons', icon: '📏' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded transition-all
                ${activeTab === tab.id 
                  ? 'bg-white text-amber-700 shadow-sm border border-amber-200' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Enhanced Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'mapunit' && (
          <div>
            {/* Step 2: Use Enhanced Property Grid */}
            <EnhancedPropertyGrid properties={enhancedData.properties} />
            
            {/* Your existing Map Unit Data with styling */}
            <div className="p-4 border-t border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <span className="text-lg">📋</span>
                <span>Survey Metadata</span>
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">Coordinates:</span>
                  <span className="font-mono">{soilData?.coordinates || 'N/A'}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">Data Source:</span>
                  <span className="font-medium">USDA NRCS SDA</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'components' && (
          <div>
            {/* Step 3: Use Enhanced Composition */}
            <EnhancedComposition composition={enhancedData.composition} />
          </div>
        )}

        {/* Keep your existing taxonomy and horizons tabs */}
        {activeTab === 'taxonomy' && (
          <div className="p-4">
            <div className="text-center py-12 text-gray-500">
              <div className="text-3xl mb-4">🔬</div>
              <p className="text-sm">Taxonomy data loading...</p>
            </div>
          </div>
        )}

        {activeTab === 'horizons' && (
          <div className="p-4">
            <div className="text-center py-12 text-gray-500">
              <div className="text-3xl mb-4">📏</div>
              <p className="text-sm">Horizon data loading...</p>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Footer */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Updated: {new Date().toLocaleDateString()}</span>
          <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors">
            <span>🔗</span>
            <span>View Details</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// QUICK CSS (add to your existing styles)
const quickUpgradeCSS = `
/* Add these minimal styles for instant improvement */
.hover\\:bg-white:hover { background-color: white; }
.hover\\:shadow-md:hover { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
.transition-all { transition: all 0.2s ease-in-out; }
.font-mono { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }
.tracking-wide { letter-spacing: 0.025em; }
.leading-tight { line-height: 1.25; }
.leading-relaxed { line-height: 1.625; }

/* Gradient backgrounds */
.bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
.from-amber-50 { --tw-gradient-from: #fffbeb; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(255 251 235 / 0)); }
.to-orange-50 { --tw-gradient-to: #fff7ed; }

/* Status colors */
.text-amber-700 { color: #b45309; }
.border-amber-200 { border-color: #fde68a; }
.bg-green-500 { background-color: #10b981; }
.bg-blue-400 { background-color: #60a5fa; }
.bg-amber-400 { background-color: #fbbf24; }

/* Component-specific styles */
.shadow-2xl { box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25); }
`;

export { UpgradedSoilPanel, quickUpgradeCSS };
