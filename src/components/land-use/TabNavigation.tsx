// TabNavigation - Tab navigation UI with progress tracking

import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { type TabConfig } from '@/config/tab-configs';

export interface TabNavigationProps {
  tabs: TabConfig[];
  activeTabId: string;
  completedTabIds: string[];
  onTabChange: (tabId: string) => void;
  loading?: boolean;
}

export function TabNavigation({
  tabs,
  activeTabId,
  completedTabIds,
  onTabChange,
  loading = false
}: TabNavigationProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const getTabStatus = (tabId: string): 'completed' | 'active' | 'pending' => {
    if (completedTabIds.includes(tabId)) return 'completed';
    if (tabId === activeTabId) return 'active';
    return 'pending';
  };

  const getAnalysisTypeColor = (type: string): string => {
    switch (type) {
      case 'descriptive': return 'blue';
      case 'interpretive': return 'green';
      case 'predictive': return 'yellow';
      case 'prescriptive': return 'purple';
      default: return 'gray';
    }
  };

  return (
    <nav className="tab-navigation border-b border-gray-200 bg-white shadow-sm">
      {/* Tab List */}
      <div className="flex overflow-x-auto px-4">
        {tabs.map((tab, index) => {
          const status = getTabStatus(tab.id);
          const isDisabled = loading && tab.id !== activeTabId;
          const color = getAnalysisTypeColor(tab.analysis_type);

          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && onTabChange(tab.id)}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              disabled={isDisabled}
              className={`
                relative flex items-center gap-2 px-4 py-3 min-w-fit
                border-b-2 transition-all duration-200
                ${status === 'active' 
                  ? `border-${color}-500 text-${color}-700 font-medium` 
                  : status === 'completed'
                  ? 'border-green-500 text-gray-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Tab Icon/Status Indicator */}
              <span className="flex-shrink-0">
                {status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : status === 'active' ? (
                  <span className={`w-5 h-5 flex items-center justify-center rounded-full bg-${color}-100 text-${color}-700 text-xs font-bold`}>
                    {index + 1}
                  </span>
                ) : (
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-xs">
                    {index + 1}
                  </span>
                )}
              </span>

              {/* Tab Name */}
              <span className="whitespace-nowrap">
                {tab.display_name}
              </span>

              {/* Loading Spinner for Active Tab */}
              {loading && status === 'active' && (
                <Loader2 className="animate-spin h-4 w-4 text-gray-500" />
              )}

              {/* Analysis Type Badge (on hover) */}
              {hoveredTab === tab.id && (
                <span className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 translate-y-full px-2 py-1 text-xs rounded bg-${color}-100 text-${color}-700 whitespace-nowrap z-10 shadow-lg`}>
                  {tab.analysis_type}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
          style={{
            width: `${(completedTabIds.length / tabs.length) * 100}%`
          }}
        />
      </div>

      {/* Active Tab Description */}
      {tabs.find(t => t.id === activeTabId) && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            {tabs.find(t => t.id === activeTabId)?.description}
          </p>
        </div>
      )}
    </nav>
  );
}

/**
 * Compact Tab Navigation (for smaller screens or embedded views)
 */
export function CompactTabNavigation({
  tabs,
  activeTabId,
  completedTabIds,
  onTabChange
}: TabNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeTab = tabs.find(t => t.id === activeTabId);
  const completedCount = completedTabIds.length;
  const totalCount = tabs.length;

  return (
    <div className="relative">
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            {activeTab?.display_name || 'Select Analysis'}
          </span>
          <span className="text-xs text-gray-500">
            ({completedCount}/{totalCount})
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20">
          {tabs.map((tab) => {
            const isCompleted = completedTabIds.includes(tab.id);
            const isActive = tab.id === activeTabId;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-4 py-3 text-left
                  hover:bg-gray-50 transition-colors
                  ${isActive ? 'bg-blue-50' : ''}
                  ${isCompleted ? 'text-gray-700' : 'text-gray-500'}
                `}
              >
                <span className="flex items-center gap-2">
                  {isCompleted && (
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="text-sm">{tab.display_name}</span>
                </span>
                {isActive && (
                  <span className="text-xs text-blue-600 font-medium">Current</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Progress Indicator */}
      <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-500"
          style={{ width: `${(completedCount / totalCount) * 100}%` }}
        />
      </div>
    </div>
  );
}
