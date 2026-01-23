// TabContainer - Container for tab system with API integration and state management

import { useState, useEffect } from 'react';
import { TabNavigation, CompactTabNavigation } from './TabNavigation';
import { fetchTabData, prefetchTabData, type TabDataResponse } from '@/lib/tab-data-fetcher';
import { type TabConfig } from '@/config/tab-configs';
import { type AnalysisSession } from '@/lib/storage/browser-storage';

export interface TabContainerProps {
  session: AnalysisSession;
  tabs: TabConfig[];
  initialTabId?: string;
  onTabComplete?: (tabId: string, data: any) => void;
  onAllTabsComplete?: () => void;
  compact?: boolean;
}

export function TabContainer({
  session,
  tabs,
  initialTabId,
  onTabComplete,
  onAllTabsComplete,
  compact = false
}: TabContainerProps) {
  const [activeTabId, setActiveTabId] = useState<string>(
    initialTabId || tabs[0]?.id || ''
  );
  const [completedTabIds, setCompletedTabIds] = useState<string[]>(
    session.completed_tabs || []
  );
  const [tabData, setTabData] = useState<Record<string, TabDataResponse>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Prefetch all tab data when component mounts
  useEffect(() => {
    if (session.field_geometry) {
      const tabIds = tabs.map(t => t.id);
      prefetchTabData(tabIds, session.land_type_id, session.field_geometry);
    }
  }, [session, tabs]);

  // Fetch data when active tab changes
  useEffect(() => {
    if (activeTabId && !tabData[activeTabId]) {
      loadTabData(activeTabId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabId, tabData]);

  // Check if all tabs are complete
  useEffect(() => {
    if (completedTabIds.length === tabs.length && onAllTabsComplete) {
      onAllTabsComplete();
    }
  }, [completedTabIds, tabs.length, onAllTabsComplete]);

  /**
   * Load data for a specific tab
   */
  const loadTabData = async (tabId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchTabData({
        tabId,
        landTypeId: session.land_type_id,
        fieldGeometry: session.field_geometry,
        userInputs: session.session_data
      });

      setTabData(prev => ({
        ...prev,
        [tabId]: response
      }));

      // Auto-mark as complete when data loads successfully
      if (!completedTabIds.includes(tabId)) {
        markTabComplete(tabId, response.data);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tab data';
      setError(errorMessage);
      console.error(`Error loading tab ${tabId}:`, err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mark a tab as complete
   */
  const markTabComplete = (tabId: string, data: any) => {
    if (!completedTabIds.includes(tabId)) {
      setCompletedTabIds(prev => [...prev, tabId]);
      
      if (onTabComplete) {
        onTabComplete(tabId, data);
      }
    }
  };

  /**
   * Handle tab change
   */
  const handleTabChange = (tabId: string) => {
    setActiveTabId(tabId);
    setError(null);
  };

  /**
   * Refresh current tab data
   */
  const refreshCurrentTab = () => {
    if (activeTabId) {
      // Clear cached data for this tab
      setTabData(prev => {
        const updated = { ...prev };
        delete updated[activeTabId];
        return updated;
      });
      // Reload
      loadTabData(activeTabId);
    }
  };

  /**
   * Navigate to next tab
   */
  const goToNextTab = () => {
    const currentIndex = tabs.findIndex(t => t.id === activeTabId);
    if (currentIndex < tabs.length - 1) {
      setActiveTabId(tabs[currentIndex + 1].id);
    }
  };

  /**
   * Navigate to previous tab
   */
  const goToPreviousTab = () => {
    const currentIndex = tabs.findIndex(t => t.id === activeTabId);
    if (currentIndex > 0) {
      setActiveTabId(tabs[currentIndex - 1].id);
    }
  };

  const activeTab = tabs.find(t => t.id === activeTabId);
  const activeTabData = tabData[activeTabId];
  const isFirstTab = tabs.findIndex(t => t.id === activeTabId) === 0;
  const isLastTab = tabs.findIndex(t => t.id === activeTabId) === tabs.length - 1;

  return (
    <div className="tab-container flex flex-col h-full">
      {/* Tab Navigation */}
      {compact ? (
        <CompactTabNavigation
          tabs={tabs}
          activeTabId={activeTabId}
          completedTabIds={completedTabIds}
          onTabChange={handleTabChange}
          loading={loading}
        />
      ) : (
        <TabNavigation
          tabs={tabs}
          activeTabId={activeTabId}
          completedTabIds={completedTabIds}
          onTabChange={handleTabChange}
          loading={loading}
        />
      )}

      {/* Tab Content Area */}
      <div className="flex-1 overflow-auto bg-gray-50">
        {error ? (
          <ErrorState error={error} onRetry={refreshCurrentTab} />
        ) : loading && !activeTabData ? (
          <LoadingState tabName={activeTab?.display_name || ''} />
        ) : activeTabData ? (
          <TabContentRenderer
            tab={activeTab!}
            data={activeTabData}
            session={session}
            onRefresh={refreshCurrentTab}
          />
        ) : null}
      </div>

      {/* Tab Navigation Controls */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
        <button
          onClick={goToPreviousTab}
          disabled={isFirstTab}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium
            ${isFirstTab
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-blue-600 hover:bg-blue-50'
            }
          `}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Previous
        </button>

        <div className="text-sm text-gray-500">
          {completedTabIds.length} of {tabs.length} completed
        </div>

        <button
          onClick={goToNextTab}
          disabled={isLastTab}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium
            ${isLastTab
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-blue-600 hover:bg-blue-50'
            }
          `}
        >
          Next
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * Loading State Component
 */
function LoadingState({ tabName }: { tabName: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <svg
        className="animate-spin h-12 w-12 text-blue-500 mb-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <h3 className="text-lg font-medium text-gray-700 mb-2">
        Loading {tabName}...
      </h3>
      <p className="text-sm text-gray-500">
        Fetching data from APIs and applying analysis
      </p>
    </div>
  );
}

/**
 * Error State Component
 */
function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Data</h3>
      <p className="text-sm text-gray-600 mb-6 text-center max-w-md">{error}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
      >
        Retry
      </button>
    </div>
  );
}

/**
 * Tab Content Renderer - Dynamically renders appropriate tab component
 */
function TabContentRenderer({
  tab,
  data,
  session,
  onRefresh
}: {
  tab: TabConfig;
  data: TabDataResponse;
  session: AnalysisSession;
  onRefresh: () => void;
}) {
  // Dynamic import of tab-specific components
  // In production, you'd lazy load these
  const TabComponent = getTabComponent(tab.id);

  return (
    <div className="p-6">
      {/* Data Source Badge */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`
            px-2 py-1 text-xs rounded-full font-medium
            ${data.metadata.cached
              ? 'bg-gray-100 text-gray-700'
              : 'bg-green-100 text-green-700'
            }
          `}>
            {data.metadata.cached ? '📦 Cached' : '🔄 Fresh Data'}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(data.metadata.timestamp).toLocaleString()}
          </span>
        </div>
        <button
          onClick={onRefresh}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Interpretation Alert (if available) */}
      {data.interpretation && (
        <InterpretationAlert interpretation={data.interpretation} />
      )}

      {/* Tab-Specific Content */}
      <TabComponent data={data.data} session={session} />
    </div>
  );
}

/**
 * Get tab-specific component
 */
function getTabComponent(tabId: string): React.ComponentType<any> {
  // Import tab components dynamically
  const { SoilTab, ErosionTab, ProductivityTab, PracticesTab } = require('./tabs');
  
  const tabComponents: Record<string, React.ComponentType<any>> = {
    soil: SoilTab,
    erosion: ErosionTab,
    productivity: ProductivityTab,
    practices: PracticesTab,
    site_index: ProductivityTab, // Uses same component for forestry
    hydric: SoilTab, // Uses soil tab with hydric data
    infiltration: SoilTab, // Uses soil tab with infiltration data
    // Add more mappings as needed
  };

  return tabComponents[tabId] || GenericTabComponent;
}

/**
 * Generic Tab Component (fallback)
 */
function GenericTabComponent({ data, session }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Analysis Results
      </h3>
      <pre className="text-sm text-gray-600 overflow-auto bg-gray-50 p-4 rounded">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

/**
 * Interpretation Alert Component
 */
function InterpretationAlert({ interpretation }: { interpretation: any }) {
  const severityConfig = {
    low: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: '✓' },
    moderate: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: '⚠️' },
    high: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', icon: '⚠️' },
    critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: '🚨' }
  };

  const config = severityConfig[interpretation.severity as keyof typeof severityConfig];

  return (
    <div className={`mb-6 p-4 rounded-lg border-2 ${config.bg} ${config.border}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{config.icon}</span>
        <div className="flex-1">
          <h4 className={`font-medium ${config.text} mb-1`}>
            {interpretation.severity.charAt(0).toUpperCase() + interpretation.severity.slice(1)} Priority
          </h4>
          <p className={`text-sm ${config.text} mb-2`}>
            {interpretation.interpretation}
          </p>
          <p className={`text-sm ${config.text} font-medium`}>
            💡 Recommendation: {interpretation.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}
