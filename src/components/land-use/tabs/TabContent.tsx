// Base TabContent Component - Reusable tab content structure with common layouts

import React from 'react';
import * as LucideIcons from 'lucide-react';
import { type AnalysisSession } from '@/lib/storage/browser-storage';

export interface TabContentProps<T = any> {
  data: T;
  session: AnalysisSession;
  loading?: boolean;
  error?: string;
}

/**
 * Base Tab Content Wrapper
 */
export function TabContent({ 
  children, 
  title, 
  subtitle 
}: { 
  children: React.ReactNode; 
  title?: string; 
  subtitle?: string;
}) {
  return (
    <div className="tab-content">
      {(title || subtitle) && (
        <div className="mb-6">
          {title && <h2 className="text-2xl font-bold text-gray-900">{title}</h2>}
          {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * Section Component - For organizing content within tabs
 */
export function TabSection({ 
  title, 
  description, 
  children,
  collapsible = false
}: { 
  title: string; 
  description?: string; 
  children: React.ReactNode;
  collapsible?: boolean;
}) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div className="mb-8">
      <div 
        className={`flex items-center justify-between mb-3 ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={() => collapsible && setIsCollapsed(!isCollapsed)}
      >
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>
        {collapsible && (
          <svg 
            className={`w-5 h-5 text-gray-500 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      {!isCollapsed && children}
    </div>
  );
}

/**
 * Card Grid Layout
 */
export function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  );
}

/**
 * Metric Card - For displaying key metrics
 */
export function MetricCard({
  label,
  value,
  unit,
  icon,
  trend,
  trendLabel,
  color = 'blue'
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700'
  };

  // Get Lucide icon component
  const IconComponent = icon ? (LucideIcons as any)[icon] : null;

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wide opacity-75 mb-1">
            {label}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">
              {typeof value === 'number' ? value.toFixed(1) : value}
            </span>
            {unit && <span className="text-sm opacity-75">{unit}</span>}
          </div>
          {trend && trendLabel && (
            <div className="mt-2 flex items-center gap-1 text-xs">
              {trend === 'up' && '↗️'}
              {trend === 'down' && '↘️'}
              {trend === 'neutral' && '→'}
              <span>{trendLabel}</span>
            </div>
          )}
        </div>
        {IconComponent && <IconComponent className="w-8 h-8 opacity-75" />}
      </div>
    </div>
  );
}

/**
 * Data Table Component
 */
export function DataTable({
  headers,
  rows,
  striped = true
}: {
  headers: string[];
  rows: (string | number)[][];
  striped?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={striped ? 'bg-white divide-y divide-gray-200' : 'bg-white'}>
          {rows.map((row, i) => (
            <tr key={i} className={striped && i % 2 === 0 ? 'bg-gray-50' : ''}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-sm text-gray-900">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Property List - For key-value pairs
 */
export function PropertyList({
  properties
}: {
  properties: Array<{ label: string; value: string | number; unit?: string }>;
}) {
  return (
    <dl className="space-y-3">
      {properties.map((prop, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100">
          <dt className="text-sm font-medium text-gray-600">{prop.label}</dt>
          <dd className="text-sm text-gray-900 font-semibold">
            {prop.value} {prop.unit && <span className="text-gray-500">{prop.unit}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Progress Bar Component
 */
export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  color = 'blue'
}: {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}) {
  const percentage = (value / max) * 100;
  
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showValue && (
            <span className="text-sm text-gray-600">
              {value.toFixed(1)} / {max}
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${colorClasses[color]} transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Alert Box Component
 */
export function AlertBox({
  type = 'info',
  title,
  message,
  dismissible = false,
  onDismiss
}: {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}) {
  const typeConfig = {
    info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: 'Info' },
    success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: 'CheckCircle2' },
    warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: 'AlertTriangle' },
    error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: 'XCircle' }
  };

  const config = typeConfig[type];
  const IconComponent = (LucideIcons as any)[config.icon];

  return (
    <div className={`p-4 rounded-lg border ${config.bg} ${config.border} ${config.text}`}>
      <div className="flex items-start gap-3">
        {IconComponent && <IconComponent className="w-5 h-5 flex-shrink-0 mt-0.5" />}
        <div className="flex-1">
          {title && <h4 className="font-semibold mb-1">{title}</h4>}
          <p className="text-sm">{message}</p>
        </div>
        {dismissible && (
          <button onClick={onDismiss} className="text-current opacity-50 hover:opacity-100">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Empty State Component
 */
export function EmptyState({
  icon,
  title,
  description,
  action
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}) {
  const IconComponent = icon ? (LucideIcons as any)[icon] : null;
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {IconComponent && <IconComponent className="w-16 h-16 text-gray-400 mb-4" />}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-600 mb-6 text-center max-w-md">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

/**
 * Chart Placeholder (for future integration with chart libraries)
 */
export function ChartPlaceholder({ 
  title, 
  type = 'bar' 
}: { 
  title: string; 
  type?: 'bar' | 'line' | 'pie'; 
}) {
  return (
    <div className="bg-gray-100 rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px]">
      <svg className="w-16 h-16 text-gray-400 mb-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
      </svg>
      <h4 className="text-gray-600 font-medium">{title}</h4>
      <p className="text-sm text-gray-500 mt-1">{type.charAt(0).toUpperCase() + type.slice(1)} chart coming soon</p>
    </div>
  );
}