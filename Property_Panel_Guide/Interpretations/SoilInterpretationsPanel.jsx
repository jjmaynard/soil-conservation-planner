// ==========================================================================
// SOIL INTERPRETATIONS PANEL - REACT COMPONENT
// Displays grouped SSURGO component interpretations for SoilViz Pro
// ==========================================================================

import React, { useState, useMemo } from 'react';
import { 
  interpretationGroups, 
  findInterpretation, 
  filterInterpretations, 
  createGroupSummary,
  analyzeInterpretations 
} from './interpretationGroups.js';

// ==========================================================================
// MAIN INTERPRETATIONS PANEL COMPONENT
// ==========================================================================

export function SoilInterpretationsPanel({ interpretationData = [] }) {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState({ min: null, max: null });
  const [showOnlyRelevant, setShowOnlyRelevant] = useState(false);

  // Process and analyze the data
  const analysisStats = useMemo(() => 
    analyzeInterpretations(interpretationData), 
    [interpretationData]
  );

  // Filter interpretations based on current settings
  const filteredInterpretations = useMemo(() => {
    let filtered = interpretationData;

    // Apply group filter
    if (selectedGroup) {
      filtered = filterInterpretations(filtered, selectedGroup);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(interp =>
        interp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interp.rating.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply value range filter
    if (filterValue.min !== null || filterValue.max !== null) {
      filtered = filterInterpretations(filtered, null, filterValue.min, filterValue.max);
    }

    // Show only relevant interpretations (value > 0.1)
    if (showOnlyRelevant) {
      filtered = filtered.filter(interp => interp.value > 0.1);
    }

    return filtered;
  }, [interpretationData, selectedGroup, searchTerm, filterValue, showOnlyRelevant]);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Soil Interpretations</h2>
            <p className="text-green-100">
              {filteredInterpretations.length} of {interpretationData.length} interpretations
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{analysisStats.total}</div>
            <div className="text-sm text-green-100">Total Available</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 bg-gray-50 border-b space-y-4">
        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search interpretations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Group Filter */}
          <select
            value={selectedGroup || ''}
            onChange={(e) => setSelectedGroup(e.target.value || null)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Groups</option>
            {Object.entries(interpretationGroups).map(([key, group]) => (
              <option key={key} value={key}>
                {group.icon} {group.name}
              </option>
            ))}
          </select>

          {/* Value Range */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Value:</label>
            <input
              type="number"
              placeholder="Min"
              min="0"
              max="1"
              step="0.1"
              value={filterValue.min || ''}
              onChange={(e) => setFilterValue(prev => ({ 
                ...prev, 
                min: e.target.value ? parseFloat(e.target.value) : null 
              }))}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              placeholder="Max"
              min="0"
              max="1"
              step="0.1"
              value={filterValue.max || ''}
              onChange={(e) => setFilterValue(prev => ({ 
                ...prev, 
                max: e.target.value ? parseFloat(e.target.value) : null 
              }))}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>

          {/* Toggle Relevant Only */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showOnlyRelevant}
              onChange={(e) => setShowOnlyRelevant(e.target.checked)}
              className="rounded text-green-600"
            />
            <span className="text-sm font-medium text-gray-700">
              Relevant Only (>0.1)
            </span>
          </label>

          {/* Clear Filters */}
          {(selectedGroup || searchTerm || filterValue.min !== null || filterValue.max !== null || showOnlyRelevant) && (
            <button
              onClick={() => {
                setSelectedGroup(null);
                setSearchTerm('');
                setFilterValue({ min: null, max: null });
                setShowOnlyRelevant(false);
              }}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Group Overview (when no specific group selected) */}
      {!selectedGroup && (
        <div className="p-4">
          <h3 className="font-semibold mb-3">Interpretation Groups</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(interpretationGroups).map(([key, group]) => {
              const groupCount = analysisStats.byGroup[key] || 0;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedGroup(key)}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
                  style={{ borderLeftColor: group.color, borderLeftWidth: '4px' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{group.icon}</span>
                      <span className="font-medium text-gray-900">{group.name}</span>
                    </div>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                      {groupCount}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Interpretations List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredInterpretations.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredInterpretations.map((interp, index) => (
              <InterpretationRow 
                key={index} 
                interpretation={interp} 
                showGroup={!selectedGroup}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">🔍</div>
            <p className="font-medium">No interpretations found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      {selectedGroup && (
        <InterpretationGroupSummary 
          groupKey={selectedGroup}
          interpretationData={interpretationData}
        />
      )}
    </div>
  );
}

// ==========================================================================
// INDIVIDUAL INTERPRETATION ROW
// ==========================================================================

function InterpretationRow({ interpretation, showGroup = false }) {
  const location = findInterpretation(interpretation.name);
  
  // Get status based on value
  const getStatus = (value) => {
    if (value >= 0.8) return { label: 'High', color: 'bg-green-100 text-green-800' };
    if (value >= 0.5) return { label: 'Moderate', color: 'bg-yellow-100 text-yellow-800' };
    if (value >= 0.2) return { label: 'Low', color: 'bg-red-100 text-red-800' };
    return { label: 'Very Low', color: 'bg-gray-100 text-gray-600' };
  };

  // Get rating color
  const getRatingColor = (rating) => {
    const lowerRating = rating.toLowerCase();
    if (lowerRating.includes('not limited') || lowerRating.includes('well suited') || lowerRating.includes('excellent')) {
      return 'text-green-700 bg-green-50 border-green-200';
    }
    if (lowerRating.includes('somewhat limited') || lowerRating.includes('moderately') || lowerRating.includes('fair')) {
      return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    }
    if (lowerRating.includes('very limited') || lowerRating.includes('severely') || lowerRating.includes('poor')) {
      return 'text-red-700 bg-red-50 border-red-200';
    }
    return 'text-gray-700 bg-gray-50 border-gray-200';
  };

  const status = getStatus(interpretation.value);
  const group = location ? interpretationGroups[location.group] : null;

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-center space-x-2 mb-2">
            {group && showGroup && (
              <div className="flex items-center space-x-1">
                <span className="text-sm">{group.icon}</span>
                <span 
                  className="text-xs font-medium px-2 py-1 rounded-full"
                  style={{ backgroundColor: group.color, color: 'white' }}
                >
                  {location.subgroupName || group.name}
                </span>
              </div>
            )}
          </div>

          {/* Interpretation Name */}
          <h4 className="font-medium text-gray-900 mb-1 leading-snug">
            {interpretation.name}
          </h4>

          {/* Rating */}
          <div className={`inline-block px-2 py-1 rounded text-sm border ${getRatingColor(interpretation.rating)}`}>
            {interpretation.rating}
          </div>

          {/* Depth Info */}
          {interpretation.depth && (
            <p className="text-xs text-gray-600 mt-1">
              Depth: {interpretation.depth}
            </p>
          )}
        </div>

        {/* Value and Status */}
        <div className="text-right ml-4">
          <div className="text-lg font-bold text-gray-900 mb-1">
            {interpretation.value.toFixed(3)}
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.color}`}>
            {status.label}
          </span>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// GROUP SUMMARY COMPONENT
// ==========================================================================

function InterpretationGroupSummary({ groupKey, interpretationData }) {
  const summary = createGroupSummary(interpretationData, groupKey);
  
  if (!summary) return null;

  return (
    <div className="bg-gray-50 border-t p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
          <span className="text-xl">{summary.icon}</span>
          <span>{summary.group} Summary</span>
        </h3>
        <div className="text-sm font-medium text-gray-600">
          {summary.totalCount} interpretations
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(summary.subgroups).map(([key, subgroup]) => (
          <div key={key} className="bg-white rounded p-3 border">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-900 text-sm">{subgroup.name}</h4>
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                {subgroup.count}
              </span>
            </div>
            {subgroup.count > 0 && (
              <div className="text-xs text-gray-600">
                Avg Value: {subgroup.avgValue.toFixed(2)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================================================
// INTERPRETATION DASHBOARD WIDGET
// ==========================================================================

export function InterpretationsDashboardWidget({ interpretationData }) {
  const stats = analyzeInterpretations(interpretationData);
  
  // Get top groups by count
  const topGroups = Object.entries(stats.byGroup)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([key, count]) => ({
      key,
      count,
      group: interpretationGroups[key]
    }));

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-3">Interpretations Summary</h3>
      
      {/* Key Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 bg-green-50 rounded">
          <div className="text-xl font-bold text-green-600">{stats.highValue.length}</div>
          <div className="text-xs text-green-600">High Value (>0.8)</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded">
          <div className="text-xl font-bold text-yellow-600">{stats.total - stats.highValue.length - stats.lowValue.length}</div>
          <div className="text-xs text-yellow-600">Moderate (0.2-0.8)</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded">
          <div className="text-xl font-bold text-red-600">{stats.lowValue.length}</div>
          <div className="text-xs text-red-600">Low Value (<0.2)</div>
        </div>
      </div>

      {/* Top Groups */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Top Categories:</h4>
        {topGroups.map(({ key, count, group }) => (
          <div key={key} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <span>{group.icon}</span>
              <span className="text-gray-700">{group.name}</span>
            </div>
            <span className="font-medium">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SoilInterpretationsPanel;
