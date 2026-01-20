// Use Case Selector - Query user for analysis goals

'use client'

import { TrendingDown, Sprout, Droplets, FileText, List, CheckCircle } from 'lucide-react'

export type UseCase = 'erosion' | 'production' | 'water' | 'compliance' | 'comprehensive'

export interface UseCaseConfig {
  id: UseCase
  title: string
  description: string
  icon: any
  color: string
  bgColor: string
  borderColor: string
  tabs: string[] // Tab IDs that will be enabled
  estimatedTime: string
}

export const useCases: UseCaseConfig[] = [
  {
    id: 'erosion',
    title: 'Erosion & Conservation Planning',
    description: 'Assess erosion risks and identify conservation practices to protect soil health',
    icon: TrendingDown,
    color: '#ea580c',
    bgColor: '#fff7ed',
    borderColor: '#fed7aa',
    tabs: ['erosion', 'svi', 'flow', 'concerns', 'practices'],
    estimatedTime: '2-3 min'
  },
  {
    id: 'production',
    title: 'Production Optimization',
    description: 'Analyze soil productivity, management zones, and yield potential',
    icon: Sprout,
    color: '#16a34a',
    bgColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    tabs: ['soil', 'productivity', 'zones', 'drainage'],
    estimatedTime: '2-3 min'
  },
  {
    id: 'water',
    title: 'Water Management',
    description: 'Evaluate drainage, drought risk, and water flow patterns',
    icon: Droplets,
    color: '#0369a1',
    bgColor: '#e0f2fe',
    borderColor: '#bae6fd',
    tabs: ['drainage', 'drought', 'flow'],
    estimatedTime: '1-2 min'
  },
  {
    id: 'compliance',
    title: 'Compliance & Documentation',
    description: 'Generate NRCS-compliant resource concern and conservation practice reports',
    icon: FileText,
    color: '#7c3aed',
    bgColor: '#faf5ff',
    borderColor: '#e9d5ff',
    tabs: ['concerns', 'practices', 'erosion', 'drainage'],
    estimatedTime: '2-3 min'
  },
  {
    id: 'comprehensive',
    title: 'Full Comprehensive Analysis',
    description: 'Complete assessment with all available analyses and data layers',
    icon: List,
    color: '#1f2937',
    bgColor: '#f9fafb',
    borderColor: '#d1d5db',
    tabs: ['soil', 'erosion', 'drainage', 'productivity', 'svi', 'flow', 'drought', 'concerns', 'practices', 'zones'],
    estimatedTime: '4-5 min'
  }
]

interface UseCaseSelectorProps {
  selectedUseCase: UseCase | null
  onSelect: (useCase: UseCase) => void
  onClose?: () => void
}

export default function UseCaseSelector({ selectedUseCase, onSelect, onClose }: UseCaseSelectorProps) {
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          What would you like to analyze?
        </h2>
        <p className="text-sm text-gray-600">
          Select your analysis goal to view targeted recommendations, or choose comprehensive for all options.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {useCases.map((useCase) => {
          const Icon = useCase.icon
          const isSelected = selectedUseCase === useCase.id
          
          return (
            <button
              key={useCase.id}
              onClick={() => onSelect(useCase.id)}
              className="relative p-5 rounded-xl text-left transition-all hover:shadow-lg"
              style={{ 
                backgroundColor: useCase.bgColor,
                border: isSelected ? `3px solid ${useCase.color}` : `2px solid ${useCase.borderColor}`,
                transform: isSelected ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="w-6 h-6" style={{ color: useCase.color }} />
                </div>
              )}
              
              <div className="flex items-start gap-4 mb-3">
                <div 
                  className="p-3 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
                >
                  <Icon className="w-6 h-6" style={{ color: useCase.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 mb-1">
                    {useCase.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {useCase.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  {useCase.tabs.length} {useCase.tabs.length === 1 ? 'analysis' : 'analyses'}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {selectedUseCase && (
        <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle className="w-4 h-4" style={{ color: '#16a34a' }} />
            <span>
              <strong>{useCases.find(uc => uc.id === selectedUseCase)?.title}</strong> selected. 
              Proceed with field selection to begin analysis.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
