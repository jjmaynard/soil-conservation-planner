import React, { useState } from 'react';
import { 
  ChevronRight, 
  MapPin, 
  Layers, 
  BarChart3, 
  Info, 
  ExternalLink,
  TrendingUp,
  PieChart,
  Grid3X3
} from 'lucide-react';

// Enhanced Soil Property Panel with Professional Design
export function SoilPropertyPanel({ soilData, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({
    composition: true,
    properties: true,
    survey: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Sample data structure - replace with your actual data
  const sampleData = {
    mapUnit: {
      key: 'G1616',
      symbol: '1B',
      name: 'Aloha silt loam, 3 to 6 percent slopes',
      acres: 13161,
      coordinates: [45.081582, -122.709346]
    },
    composition: [
      { component: 'Aloha', percentage: 85, major: true },
      { component: 'Dayton', percentage: 10, major: false },
      { component: 'Concord', percentage: 5, major: false }
    ],
    properties: {
      slope: '3-6%',
      drainage: 'Somewhat poorly drained',
      texture: 'Silt loam',
      depth: '60+ inches',
      permeability: 'Slow',
      available_water: 'High'
    },
    taxonomy: {
      order: 'Mollisols',
      suborder: 'Aquolls',
      greatGroup: 'Argialbolls',
      subgroup: 'Typic Argialbolls'
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Grid3X3 },
    { id: 'composition', label: 'Components', icon: PieChart },
    { id: 'taxonomy', label: 'Classification', icon: Layers },
    { id: 'horizons', label: 'Horizons', icon: BarChart3 }
  ];

  return (
    <div className="w-96 bg-white shadow-2xl border-l border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-orange-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 text-sm text-amber-700 mb-2">
              <MapPin className="w-4 h-4" />
              <span className="font-medium">USDA NRCS • SDA Web Service</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">
              {sampleData.mapUnit.symbol} - {sampleData.mapUnit.name}
            </h2>
            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
              <span className="bg-white px-2 py-1 rounded font-mono text-xs">
                {sampleData.mapUnit.key}
              </span>
              <span>{sampleData.mapUnit.acres.toLocaleString()} acres</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 bg-gray-50">
        <nav className="flex space-x-1 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded transition-all duration-200
                  ${activeTab === tab.id 
                    ? 'bg-white text-amber-700 shadow-sm border border-amber-200' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6">
            {/* Location Info */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Location</h3>
              </div>
              <p className="text-sm text-blue-800 font-mono">
                {sampleData.mapUnit.coordinates[0]}, {sampleData.mapUnit.coordinates[1]}
              </p>
            </div>

            {/* Key Properties Grid */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-gray-600" />
                <span>Key Properties</span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(sampleData.properties).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="text-xs text-gray-600 uppercase tracking-wide font-medium mb-1">
                      {key.replace('_', ' ')}
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Component Preview */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Major Components</h3>
              <div className="space-y-2">
                {sampleData.composition.filter(c => c.major).map((comp, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="font-medium text-green-900">{comp.component}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-12 h-2 bg-green-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-600 rounded-full transition-all duration-300"
                          style={{ width: `${comp.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-green-800">{comp.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'composition' && (
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-gray-600" />
              <span>Map Unit Composition</span>
            </h3>
            
            {/* Visual Composition Chart */}
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <div className="h-6 flex rounded-full overflow-hidden border border-gray-200">
                {sampleData.composition.map((comp, idx) => (
                  <div
                    key={idx}
                    className={`h-full ${
                      comp.major ? 'bg-green-500' : idx % 2 ? 'bg-blue-400' : 'bg-amber-400'
                    }`}
                    style={{ width: `${comp.percentage}%` }}
                    title={`${comp.component}: ${comp.percentage}%`}
                  />
                ))}
              </div>
            </div>

            {/* Detailed List */}
            <div className="space-y-3">
              {sampleData.composition.map((comp, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      comp.major ? 'bg-green-500' : idx % 2 ? 'bg-blue-400' : 'bg-amber-400'
                    }`} />
                    <div>
                      <span className="font-medium text-gray-900">{comp.component}</span>
                      {comp.major && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Major
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{comp.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'taxonomy' && (
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-gray-600" />
              <span>Soil Classification</span>
            </h3>
            
            <div className="space-y-4">
              {Object.entries(sampleData.taxonomy).map(([level, value], idx) => (
                <div key={level} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-amber-500'][idx]
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">
                      {level.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {value}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Taxonomic Hierarchy</p>
                  <p>Classification follows USDA Soil Taxonomy system, from broadest (Order) to most specific (Subgroup).</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'horizons' && (
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-gray-600" />
              <span>Soil Horizons</span>
            </h3>
            
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">Horizon data loading...</p>
              <p className="text-xs mt-1">Connect to SSURGO database for detailed horizon information</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>USDA NRCS SDA • Last updated: {new Date().toLocaleDateString()}</span>
          <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors">
            <ExternalLink className="w-3 h-3" />
            <span>View Details</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Enhanced styles to add to your CSS file
const additionalStyles = `
/* Add these to your global CSS */
.soil-panel-enter {
  transform: translateX(100%);
  opacity: 0;
}

.soil-panel-enter-active {
  transform: translateX(0);
  opacity: 1;
  transition: transform 300ms ease-out, opacity 300ms ease-out;
}

.soil-panel-exit {
  transform: translateX(0);
  opacity: 1;
}

.soil-panel-exit-active {
  transform: translateX(100%);
  opacity: 0;
  transition: transform 300ms ease-in, opacity 300ms ease-in;
}

/* Custom scrollbar */
.soil-panel::-webkit-scrollbar {
  width: 6px;
}

.soil-panel::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.soil-panel::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.soil-panel::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
`;

export { additionalStyles };
