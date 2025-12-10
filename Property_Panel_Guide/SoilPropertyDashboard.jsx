import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  MapPin, Database, Layers, TrendingUp, Eye, Download, 
  Microscope, Beaker, Mountain, Droplets, Gauge
} from 'lucide-react';

// Dashboard-Style Soil Property Panel
export function SoilPropertyDashboard({ soilData, onClose }) {
  const [activeView, setActiveView] = useState('summary');
  
  // Enhanced sample data with chart-ready format
  const dashboardData = {
    mapUnit: {
      key: 'G1616',
      symbol: '1B', 
      name: 'Aloha silt loam, 3 to 6 percent slopes',
      acres: 13161,
      coordinates: [45.081582, -122.709346],
      confidence: 92
    },
    composition: [
      { name: 'Aloha', value: 85, color: '#059669' },
      { name: 'Dayton', value: 10, color: '#0284c7' },
      { name: 'Concord', value: 5, color: '#dc2626' }
    ],
    properties: [
      { property: 'Clay', value: 25, unit: '%', ideal: [20, 30], status: 'good' },
      { property: 'Sand', value: 15, unit: '%', ideal: [10, 20], status: 'good' },
      { property: 'OM', value: 4.2, unit: '%', ideal: [3, 6], status: 'excellent' },
      { property: 'pH', value: 6.1, unit: '', ideal: [5.5, 7.0], status: 'good' },
      { property: 'CEC', value: 18, unit: 'meq/100g', ideal: [15, 25], status: 'good' }
    ],
    horizons: [
      { name: 'Ap', depth: 8, color: '#8b7355', texture: 'Silt loam', om: 4.2 },
      { name: 'A', depth: 15, color: '#6b5b47', texture: 'Silt loam', om: 3.1 },
      { name: 'Bt1', depth: 28, color: '#5a4a3a', texture: 'Silty clay loam', om: 1.8 },
      { name: 'Bt2', depth: 45, color: '#4a3a2a', texture: 'Silty clay', om: 1.2 }
    ],
    spectroscopy: {
      prediction_confidence: 89,
      measured_vs_predicted: [
        { property: 'OM', measured: 4.2, predicted: 4.1 },
        { property: 'Clay', measured: 25, predicted: 23 },
        { property: 'pH', measured: 6.1, predicted: 6.0 }
      ]
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      excellent: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      good: 'text-blue-600 bg-blue-50 border-blue-200',
      fair: 'text-amber-600 bg-amber-50 border-amber-200',
      poor: 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[status] || colors.good;
  };

  const views = [
    { id: 'summary', label: 'Summary', icon: Eye },
    { id: 'composition', label: 'Composition', icon: BarChart },
    { id: 'horizons', label: 'Profile', icon: Mountain },
    { id: 'spectroscopy', label: 'MIR Analysis', icon: Microscope }
  ];

  return (
    <div className="w-[28rem] bg-white shadow-2xl border-l border-gray-200 h-full flex flex-col">
      {/* Header with Data Quality Indicator */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 text-slate-300 text-sm mb-2">
              <Database className="w-4 h-4" />
              <span>USDA NRCS SDA</span>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  dashboardData.mapUnit.confidence > 90 ? 'bg-green-400' :
                  dashboardData.mapUnit.confidence > 70 ? 'bg-yellow-400' : 'bg-red-400'
                }`} />
                <span className="text-xs">{dashboardData.mapUnit.confidence}% confidence</span>
              </div>
            </div>
            <h2 className="text-xl font-bold text-white leading-tight mb-1">
              {dashboardData.mapUnit.symbol}
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              {dashboardData.mapUnit.name}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl"
          >
            ×
          </button>
        </div>
        
        {/* Key Metrics Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600">
            <div className="text-xs text-slate-400 mb-1">Area</div>
            <div className="text-sm font-bold text-white">
              {(dashboardData.mapUnit.acres / 1000).toFixed(1)}K acres
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600">
            <div className="text-xs text-slate-400 mb-1">Key</div>
            <div className="text-sm font-bold text-white font-mono">
              {dashboardData.mapUnit.key}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600">
            <div className="text-xs text-slate-400 mb-1">Location</div>
            <div className="text-xs font-medium text-white">
              {dashboardData.mapUnit.coordinates[0].toFixed(3)}, {dashboardData.mapUnit.coordinates[1].toFixed(3)}
            </div>
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex overflow-x-auto">
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`
                  flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all
                  ${activeView === view.id 
                    ? 'text-slate-900 border-slate-900 bg-white' 
                    : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{view.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeView === 'summary' && (
          <div className="p-6 space-y-6">
            {/* Properties Grid with Status Indicators */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Beaker className="w-5 h-5 text-gray-600" />
                <span>Soil Properties</span>
              </h3>
              <div className="space-y-3">
                {dashboardData.properties.map((prop, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border-2 ${getStatusColor(prop.status)}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{prop.property}</div>
                        <div className="text-sm text-gray-600">
                          Ideal: {prop.ideal[0]}-{prop.ideal[1]} {prop.unit}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">{prop.value}{prop.unit}</div>
                        <div className={`text-xs font-medium uppercase tracking-wide`}>
                          {prop.status}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-current h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min(100, (prop.value / prop.ideal[1]) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-indigo-200">
                <div className="flex items-center space-x-2 text-indigo-600 mb-2">
                  <Droplets className="w-4 h-4" />
                  <span className="text-sm font-medium">Drainage</span>
                </div>
                <p className="text-sm text-indigo-800">Somewhat poorly drained</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                <div className="flex items-center space-x-2 text-amber-600 mb-2">
                  <Mountain className="w-4 h-4" />
                  <span className="text-sm font-medium">Slope</span>
                </div>
                <p className="text-sm text-amber-800">3-6% slopes</p>
              </div>
            </div>
          </div>
        )}

        {activeView === 'composition' && (
          <div className="p-6 space-y-6">
            {/* Pie Chart */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Component Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.composition}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {dashboardData.composition.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Component Details */}
            <div className="space-y-3">
              {dashboardData.composition.map((comp, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: comp.color }}
                    />
                    <span className="font-medium text-gray-900">{comp.name}</span>
                    {comp.value >= 50 && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Dominant
                      </span>
                    )}
                  </div>
                  <span className="text-lg font-bold text-gray-900">{comp.value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'horizons' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Soil Profile</h3>
            
            {/* Visual Soil Profile */}
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <div className="relative">
                <div className="space-y-1">
                  {dashboardData.horizons.map((horizon, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center space-x-3 p-3 rounded"
                      style={{ backgroundColor: horizon.color + '20' }}
                    >
                      <div 
                        className="w-8 h-8 rounded border border-gray-300"
                        style={{ backgroundColor: horizon.color }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{horizon.name}</div>
                        <div className="text-sm text-gray-600">{horizon.texture}</div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">{horizon.depth}"</div>
                        <div className="text-gray-600">{horizon.om}% OM</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Depth Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.horizons} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 'dataMax']} />
                  <YAxis dataKey="name" type="category" width={40} />
                  <Tooltip formatter={(value) => [`${value}"`, 'Depth']} />
                  <Bar dataKey="depth" fill="#64748b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeView === 'spectroscopy' && (
          <div className="p-6 space-y-6">
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <Microscope className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">MIR Spectroscopy Analysis</h3>
              </div>
              <div className="flex items-center space-x-4">
                <div>
                  <span className="text-sm text-purple-700">Prediction Confidence:</span>
                  <span className="ml-2 font-bold text-purple-900">
                    {dashboardData.spectroscopy.prediction_confidence}%
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Gauge className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-purple-700">Model: PLSR</span>
                </div>
              </div>
            </div>

            {/* Measured vs Predicted Comparison */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Measured vs Predicted</h4>
              <div className="space-y-3">
                {dashboardData.spectroscopy.measured_vs_predicted.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{item.property}</span>
                      <span className="text-sm text-gray-600">
                        Accuracy: {((1 - Math.abs(item.measured - item.predicted) / item.measured) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Measured:</span>
                        <span className="font-semibold">{item.measured}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Predicted:</span>
                        <span className="font-semibold">{item.predicted}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </div>
          <div className="flex space-x-2">
            <button className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button className="flex items-center space-x-1 px-3 py-1 text-sm bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors">
              <Eye className="w-4 h-4" />
              <span>Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SoilPropertyDashboard;
