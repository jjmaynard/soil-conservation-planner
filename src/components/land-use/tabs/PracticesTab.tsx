// PracticesTab - Conservation practices from NRCS database (static JSON)

import { useState } from 'react';
import { TabContent, TabSection, AlertBox, EmptyState } from './TabContent';
import { type TabContentProps } from './TabContent';

interface Practice {
  code: string;
  name: string;
  description: string;
  category: string;
  applicable_land_types: string[];
  resource_concerns: string[];
  effectiveness: Record<string, number>;
  cost_range: { min: number; max: number; units: string };
  specifications_url?: string;
}

interface PracticesData {
  practices: Practice[];
  resourceConcerns: string[];
  recommendedPractices: string[];
}

export function PracticesTab({ data, session }: TabContentProps<PracticesData>) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Get unique categories
  const categories = ['all', ...new Set(data.practices.map(p => p.category))];

  // Filter practices
  const filteredPractices = data.practices.filter(practice => {
    const matchesCategory = selectedCategory === 'all' || practice.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      practice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      practice.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      practice.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const recommendedPractices = filteredPractices.filter(p => 
    data.recommendedPractices.includes(p.code)
  );

  return (
    <TabContent
      title="Conservation Practices"
      subtitle={`NRCS practices for ${session.land_type_id} management`}
    >
      {/* Resource Concerns Alert */}
      {data.resourceConcerns.length > 0 && (
        <AlertBox
          type="warning"
          title="Identified Resource Concerns"
          message={`This analysis has identified the following concerns: ${data.resourceConcerns.join(', ')}`}
        />
      )}

      {/* Recommended Practices */}
      {recommendedPractices.length > 0 && (
        <TabSection 
          title="Recommended Practices" 
          description={`${recommendedPractices.length} practices recommended for your resource concerns`}
        >
          <div className="space-y-3">
            {recommendedPractices.map(practice => (
              <PracticeCard key={practice.code} practice={practice} recommended />
            ))}
          </div>
        </TabSection>
      )}

      {/* Search and Filter */}
      <TabSection title="All Available Practices">
        <div className="mb-4 flex flex-col md:flex-row gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search practices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Practice List */}
        {filteredPractices.length > 0 ? (
          <div className="space-y-3">
            {filteredPractices.map(practice => (
              <PracticeCard key={practice.code} practice={practice} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="Search"
            title="No practices found"
            description="Try adjusting your search or filter criteria"
          />
        )}
      </TabSection>

      {/* Data Source */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg text-xs text-gray-600">
        <p>Data source: USDA NRCS Conservation Practice Standards</p>
        <p className="mt-1">Database: Field Office Technical Guide (FOTG)</p>
        <p className="mt-1">⚠️ Static JSON - External API in development</p>
      </div>
    </TabContent>
  );
}

/**
 * Individual Practice Card Component
 */
function PracticeCard({ 
  practice, 
  recommended = false 
}: { 
  practice: Practice; 
  recommended?: boolean; 
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div 
      className={`
        bg-white rounded-lg border-2 shadow-sm overflow-hidden transition-all
        ${recommended ? 'border-green-500 bg-green-50' : 'border-gray-200'}
      `}
    >
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {recommended && <span className="text-xs bg-green-500 text-white px-2 py-1 rounded font-medium">RECOMMENDED</span>}
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">{practice.code}</span>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{practice.category}</span>
            </div>
            <h4 className="font-semibold text-gray-900">{practice.name}</h4>
            <p className="text-sm text-gray-600 mt-1">{practice.description}</p>
          </div>
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-2 ${expanded ? 'rotate-180' : ''}`}
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-200">
          {/* Resource Concerns */}
          {practice.resource_concerns.length > 0 && (
            <div className="mt-3">
              <h5 className="text-xs font-semibold text-gray-700 uppercase mb-2">Addresses Resource Concerns:</h5>
              <div className="flex flex-wrap gap-1">
                {practice.resource_concerns.map(concern => (
                  <span key={concern} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    {concern}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Effectiveness */}
          {Object.keys(practice.effectiveness).length > 0 && (
            <div className="mt-3">
              <h5 className="text-xs font-semibold text-gray-700 uppercase mb-2">Effectiveness:</h5>
              <div className="space-y-1">
                {Object.entries(practice.effectiveness).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{key}:</span>
                    <span className="font-medium text-gray-900">{(value * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cost Estimate */}
          <div className="mt-3">
            <h5 className="text-xs font-semibold text-gray-700 uppercase mb-2">Estimated Cost:</h5>
            <p className="text-sm text-gray-900">
              ${practice.cost_range.min.toLocaleString()} - ${practice.cost_range.max.toLocaleString()} {practice.cost_range.units}
            </p>
          </div>

          {/* Specifications Link */}
          {practice.specifications_url && (
            <div className="mt-3">
              <a 
                href={practice.specifications_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                View Technical Specifications →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
