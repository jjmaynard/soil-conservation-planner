// Conservation Practices Module - NRCS Practice Standards Database
// Comprehensive conservation practice information and recommendation tools

'use client'

import { useState, useMemo } from 'react'
import Head from 'next/head'
import { 
  Search, 
  Filter, 
  BookOpen, 
  Target, 
  DollarSign, 
  Calendar,
  ChevronDown,
  ChevronRight,
  Info,
  Download,
  Sprout,
  Droplets,
  Wind,
  Layers,
  TrendingUp,
  FileText,
  CheckCircle,
  AlertTriangle,
  Truck,
  Wheat,
  Shield,
  TreePine,
  Building2,
  Beaker,
  ClipboardList,
  Lightbulb,
  X,
  ExternalLink
} from 'lucide-react'
import { CONSERVATION_PRACTICES } from '../data/conservationPractices'
import { ConservationRecommendationEngine } from '../utils/conservationRecommendations'
import type { 
  ConservationPractice, 
  PracticeCategory,
  ResourceConcern,
  SoilCondition 
} from '../types/conservationPractices'
import nrcsPracticesData from '../data/nrcs-conservation-practices-data.json'
import resourceConcernsData from '../data/nrcs-resource-concerns-data.json'

type ViewMode = 'database' | 'selector' | 'resources'

export default function ConservationPracticesModule() {
  const [viewMode, setViewMode] = useState<ViewMode>('database')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedPractice, setSelectedPractice] = useState<any | null>(null)
  const [expandedPractices, setExpandedPractices] = useState<Set<string>>(new Set())
  
  // Iframe modal state
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const [iframePracticeName, setIframePracticeName] = useState<string>('')
  
  // Selector tool state - using resource concern IDs from NRCS data
  const [selectedResourceConcernIds, setSelectedResourceConcernIds] = useState<string[]>([])
  const [fieldAcres, setFieldAcres] = useState<number>(100)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(resourceConcernsData.categories.map((c: any) => c.id)))

  // Get all practices from comprehensive NRCS data
  const allNRCSPractices = nrcsPracticesData.conservationPractices
  const allCategories = nrcsPracticesData.categories
  const allResourceConcerns = resourceConcernsData.resourceConcerns

  // Filter practices based on search and category
  const filteredPractices = useMemo(() => {
    let practices = allNRCSPractices

    // Filter by category
    if (selectedCategory !== 'all') {
      practices = practices.filter(p => p.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      practices = practices.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.code.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      )
    }

    return practices
  }, [allNRCSPractices, selectedCategory, searchQuery])

  // Get recommended practices based on selected resource concerns
  const recommendedPractices = useMemo(() => {
    if (selectedResourceConcernIds.length === 0) {
      return []
    }

    // Get related practice codes from selected resource concerns
    const relatedPracticeCodes = new Set<string>()
    selectedResourceConcernIds.forEach(concernId => {
      const concern = allResourceConcerns.find((c: any) => c.id === concernId)
      if (concern && concern.relatedPractices) {
        concern.relatedPractices.forEach((code: string) => relatedPracticeCodes.add(code))
      }
    })

    // Find matching practices and score them
    const scoredPractices = allNRCSPractices
      .filter(p => relatedPracticeCodes.has(p.code))
      .map(practice => {
        // Count how many selected concerns this practice addresses
        let score = 0
        selectedResourceConcernIds.forEach(concernId => {
          const concern = allResourceConcerns.find((c: any) => c.id === concernId)
          if (concern && concern.relatedPractices.includes(practice.code)) {
            score++
          }
        })
        return { practice, score }
      })
      .sort((a, b) => b.score - a.score)

    return scoredPractices
  }, [selectedResourceConcernIds, allNRCSPractices, allResourceConcerns])

  const togglePractice = (code: string) => {
    setExpandedPractices(prev => {
      const newSet = new Set(prev)
      if (newSet.has(code)) {
        newSet.delete(code)
      } else {
        newSet.add(code)
      }
      return newSet
    })
  }

  const toggleResourceConcern = (concernId: string) => {
    setSelectedResourceConcernIds(prev =>
      prev.includes(concernId)
        ? prev.filter(id => id !== concernId)
        : [...prev, concernId]
    )
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const getCategoryIcon = (category: string, size: 'small' | 'large' = 'small') => {
    const iconProps = { className: size === 'large' ? 'w-8 h-8' : 'w-5 h-5', style: { color: '#ffffff' } }
    const iconMap: Record<string, JSX.Element> = {
      'Soil Health': <Sprout {...iconProps} />,
      'Water Quality': <Droplets {...iconProps} />,
      'Forestry': <TreePine {...iconProps} />,
      'Grazing Management': <Wheat {...iconProps} />,
      'Soil Erosion Control': <Shield {...iconProps} />,
      'Water Management': <Droplets {...iconProps} />,
      'Irrigation': <Droplets {...iconProps} />,
      'Agroforestry': <TreePine {...iconProps} />,
      'Infrastructure': <Building2 {...iconProps} />,
      'Waste Management': <Beaker {...iconProps} />,
      'Horticulture': <Sprout {...iconProps} />,
    }
    return iconMap[category] || <ClipboardList {...iconProps} />
  }

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      'Soil Health': 'var(--color-forest-600)',
      'Water Quality': 'var(--color-ocean-600)',
      'Forestry': 'var(--color-forest-700)',
      'Grazing Management': 'var(--color-amber-600)',
      'Soil Erosion Control': 'var(--color-sunset-600)',
      'Water Management': 'var(--color-sky-600)',
      'Irrigation': 'var(--color-ocean-700)',
      'Agroforestry': 'var(--color-forest-600)',
      'Infrastructure': 'var(--color-slate-600)',
      'Waste Management': 'var(--color-slate-700)',
      'Horticulture': 'var(--color-copper-600)',
    }
    return colorMap[category] || 'var(--color-slate-700)'
  }

  return (
    <>
      <Head>
        <title>Conservation Practices - NRCS Standards Database</title>
        <meta name="description" content="Comprehensive NRCS conservation practice standards, recommendations, and implementation guidance" />
      </Head>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div 
          className="text-white shadow-lg rounded-lg mb-6 pt-6"
          style={{ background: 'linear-gradient(to right, var(--color-conservation), var(--color-conservation-dark), var(--color-forest-800))' }}
        >
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Sprout className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Conservation Practices</h1>
                <p className="text-sm text-conservation-light">
                  NRCS Practice Standards Database • {allNRCSPractices.length} practices available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="bg-surface border-b shadow-sm border-border">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setViewMode('database')}
                className="px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors"
                style={{
                  color: viewMode === 'database' ? 'var(--color-conservation)' : 'var(--color-text-secondary)',
                  borderColor: viewMode === 'database' ? 'var(--color-conservation)' : 'transparent'
                }}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Practice Database
                </div>
              </button>
              <button
                onClick={() => setViewMode('selector')}
                className="px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors"
                style={{
                  color: viewMode === 'selector' ? 'var(--color-conservation)' : 'var(--color-text-secondary)',
                  borderColor: viewMode === 'selector' ? 'var(--color-conservation)' : 'transparent'
                }}
              >
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Practice Selector
                </div>
              </button>
              <button
                onClick={() => setViewMode('resources')}
                className="px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors"
                style={{
                  color: viewMode === 'resources' ? 'var(--color-conservation)' : 'var(--color-text-secondary)',
                  borderColor: viewMode === 'resources' ? 'var(--color-conservation)' : 'transparent'
                }}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Resources
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Practice Database View */}
          {viewMode === 'database' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="bg-surface rounded-lg shadow-sm p-6 border border-border">
                <div className="flex flex-col gap-4">
                  {/* Search */}
                  <div className="w-full">
                    <label className="block text-sm font-medium mb-2 text-text">
                      Search Practices
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, code, or description..."
                        className="form-input w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-surface text-text focus:border-conservation"
                      />
                    </div>
                  </div>

                  {/* Category Browser */}
                  <div>
                    <label className="block text-sm font-medium mb-3 text-text">
                      Filter by Category
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                      {/* All Categories Option */}
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className="p-2.5 rounded-lg border-2 transition-all text-left"
                        style={{
                          backgroundColor: selectedCategory === 'all' ? 'var(--color-conservation-light)' : 'var(--color-surface)',
                          borderColor: selectedCategory === 'all' ? 'var(--color-conservation)' : 'var(--color-border)'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedCategory !== 'all') {
                            e.currentTarget.style.borderColor = 'var(--color-border-dark)'
                            e.currentTarget.style.backgroundColor = 'var(--color-background-alt)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedCategory !== 'all') {
                            e.currentTarget.style.borderColor = 'var(--color-border)'
                            e.currentTarget.style.backgroundColor = 'var(--color-surface)'
                          }
                        }}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <Layers className="h-4 w-4 text-conservation" />
                          <span className="text-sm font-bold text-text">
                            {allNRCSPractices.length}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-text">
                          All Categories
                        </div>
                      </button>

                      {/* Individual Categories */}
                      {allCategories.map(category => {
                        const practices = allNRCSPractices.filter(p => p.category === category)
                        const isSelected = selectedCategory === category
                        const color = getCategoryColor(category)
                        
                        return (
                          <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className="p-2.5 rounded-lg border-2 transition-all text-left"
                            style={{
                              backgroundColor: isSelected ? 'var(--color-conservation-light)' : 'var(--color-surface)',
                              borderColor: isSelected ? 'var(--color-conservation)' : 'var(--color-border)'
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.borderColor = 'var(--color-border-dark)'
                                e.currentTarget.style.backgroundColor = 'var(--color-background-alt)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.borderColor = 'var(--color-border)'
                                e.currentTarget.style.backgroundColor = 'var(--color-surface)'
                              }
                            }}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div 
                                className="p-1 rounded flex items-center justify-center"
                                style={{ backgroundColor: color }}
                              >
                                {getCategoryIcon(category, 'small')}
                              </div>
                              <span className="text-sm font-bold text-text">
                                {practices.length}
                              </span>
                            </div>
                            <div className="text-xs line-clamp-2 text-text-secondary">
                              {category}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-text-secondary">
                  <span>
                    <strong className="text-text">{filteredPractices.length}</strong> practices found
                    {selectedCategory !== 'all' && ` in ${selectedCategory}`}
                  </span>
                  {(searchQuery || selectedCategory !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setSelectedCategory('all')
                      }}
                      className="text-sm font-medium hover:underline text-conservation"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </div>

              {/* Practice List */}
              <div className="space-y-3">
                {filteredPractices.map(practice => {
                  const isExpanded = expandedPractices.has(practice.code)
                  
                  return (
                    <div
                      key={practice.code}
                      className="bg-white rounded-lg shadow-sm border overflow-hidden"
                      style={{ borderColor: '#e5e7eb' }}
                    >
                      {/* Practice Header */}
                      <div
                        className="p-4 cursor-pointer transition-colors"
                        onClick={() => togglePractice(practice.code)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div 
                                className="p-2 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: getCategoryColor(practice.category) }}
                              >
                                {getCategoryIcon(practice.category)}
                              </div>
                              <div>
                                <h3 className="font-semibold text-base md:text-lg" style={{ color: '#111827' }}>
                                  {practice.name}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                                    Code {practice.code}
                                  </span>
                                  <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}>
                                    {practice.unit}
                                  </span>
                                  <span className="text-xs" style={{ color: '#6b7280' }}>
                                    {practice.category}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm" style={{ color: '#4b5563' }}>
                              {practice.description}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5" style={{ color: '#6b7280' }} />
                            ) : (
                              <ChevronRight className="h-5 w-5" style={{ color: '#6b7280' }} />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="border-t p-4 md:p-6" style={{ borderColor: '#e5e7eb', backgroundColor: '#fafafa' }}>
                          <div className="space-y-4">
                            {/* Resource Concerns */}
                            {practice.resourceConcerns && practice.resourceConcerns.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm md:text-base" style={{ color: '#111827' }}>
                                  <Target className="h-4 w-4" style={{ color: '#f59e0b' }} />
                                  Addresses Resource Concerns
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {practice.resourceConcerns.map((concern, idx) => (
                                    <span 
                                      key={idx} 
                                      className="text-xs px-2 py-1 rounded"
                                      style={{ backgroundColor: '#fef3c7', color: '#92400e' }}
                                    >
                                      {concern}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* NRCS Documentation Link */}
                            <div>
                              <button
                                onClick={() => {
                                  setIframeUrl(`https://www.nrcs.usda.gov${practice.nrcsUrl}`)
                                  setIframePracticeName(practice.name)
                                }}
                                className="inline-flex items-center gap-2 text-sm font-medium hover:underline cursor-pointer"
                                style={{ color: '#2563eb', background: 'none', border: 'none', padding: 0 }}
                              >
                                <FileText className="h-4 w-4" />
                                View Official NRCS Standard
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}

                {filteredPractices.length === 0 && (
                  <div className="text-center py-12 px-4">
                    <Search className="h-12 w-12 mx-auto mb-4" style={{ color: '#9ca3af' }} />
                    <p className="font-medium mb-2" style={{ color: '#6b7280' }}>
                      No practices found
                    </p>
                    <p className="text-sm" style={{ color: '#9ca3af' }}>
                      Try adjusting your search or filters
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Practice Selector View */}
          {viewMode === 'selector' && (
            <div className="space-y-6">
              {/* Instructions */}
              <div className="border rounded-lg p-4" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#2563eb' }} />
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: '#1e40af' }}>
                      Practice Recommendation Tool
                    </h3>
                    <p className="text-sm" style={{ color: '#1e3a8a' }}>
                      Select the resource concerns present on your land to receive tailored conservation practice recommendations from the NRCS database.
                    </p>
                  </div>
                </div>
              </div>

              {/* Resource Concerns Selection */}
              <div className="bg-white rounded-lg shadow-sm p-6 border" style={{ borderColor: '#e5e7eb' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>
                  Resource Concerns
                </h3>
                <p className="text-sm mb-4" style={{ color: '#6b7280' }}>
                  Select one or more resource concerns that apply to your land:
                </p>

                {/* Group by category */}
                {resourceConcernsData.categories.map((category: any) => {
                  const concernsInCategory = allResourceConcerns.filter((c: any) => c.category === category.name)
                  if (concernsInCategory.length === 0) return null
                  const isExpanded = expandedCategories.has(category.id)

                  return (
                    <div key={category.id} className="mb-4">
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="w-full p-4 rounded-lg flex items-center justify-between cursor-pointer transition-all"
                        style={{ backgroundColor: category.color }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5" style={{ color: '#ffffff' }} />
                          ) : (
                            <ChevronRight className="h-5 w-5" style={{ color: '#ffffff' }} />
                          )}
                          <h4 className="font-bold text-lg" style={{ color: '#ffffff' }}>
                            {category.name}
                          </h4>
                        </div>
                        <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }}>
                          {concernsInCategory.length} concerns
                        </span>
                      </button>
                      {isExpanded && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                        {concernsInCategory.map((concern: any) => (
                          <label
                            key={concern.id}
                            className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
                            style={{ 
                              borderColor: selectedResourceConcernIds.includes(concern.id) ? '#16a34a' : '#e5e7eb',
                              backgroundColor: selectedResourceConcernIds.includes(concern.id) ? '#f0fdf4' : '#ffffff'
                            }}
                            onMouseEnter={(e) => {
                              if (!selectedResourceConcernIds.includes(concern.id)) {
                                e.currentTarget.style.backgroundColor = '#f9fafb'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!selectedResourceConcernIds.includes(concern.id)) {
                                e.currentTarget.style.backgroundColor = '#ffffff'
                              }
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedResourceConcernIds.includes(concern.id)}
                              onChange={() => toggleResourceConcern(concern.id)}
                              className="mt-1 rounded"
                              style={{
                                accentColor: '#16a34a',
                                borderColor: '#d1d5db'
                              }}
                            />
                            <div className="flex-1">
                              <p className="font-medium text-sm" style={{ color: '#111827' }}>
                                {concern.name}
                              </p>
                              <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
                                {concern.description.slice(0, 100)}...
                              </p>
                              {concern.relatedPractices && concern.relatedPractices.length > 0 && (
                                <p className="text-xs mt-1" style={{ color: '#059669' }}>
                                  {concern.relatedPractices.length} related practices
                                </p>
                              )}
                            </div>
                          </label>
                        ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Recommended Practices */}
              {recommendedPractices.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold" style={{ color: '#111827' }}>
                      Recommended Practices
                    </h3>
                    <div className="text-sm" style={{ color: '#6b7280' }}>
                      {recommendedPractices.length} practices recommended
                    </div>
                  </div>

                  {/* Practice Cards */}
                  <div className="space-y-3">
                    {recommendedPractices.map(({ practice, score }) => (
                      <div
                        key={practice.code}
                        className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
                        style={{ borderColor: '#e5e7eb' }}
                      >
                        <div className="flex items-start gap-4">
                          <div 
                            className="p-2 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: getCategoryColor(practice.category) }}
                          >
                            {getCategoryIcon(practice.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h4 className="font-semibold text-base" style={{ color: '#111827' }}>
                                {practice.name}
                              </h4>
                              <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                                Code {practice.code}
                              </span>
                              <span
                                className="text-xs px-2 py-0.5 rounded font-medium"
                                style={{
                                  backgroundColor: score >= 3 ? '#16a34a' : score >= 2 ? '#eab308' : '#3b82f6',
                                  color: '#ffffff'
                                }}
                              >
                                {score >= 3 ? 'High Match' : score >= 2 ? 'Good Match' : 'Possible Match'}
                              </span>
                            </div>
                            <p className="text-sm mb-2" style={{ color: '#4b5563' }}>
                              {practice.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}>
                                {practice.category}
                              </span>
                              <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}>
                                Unit: {practice.unit}
                              </span>
                              <span className="text-xs" style={{ color: '#059669' }}>
                                Addresses {score} of your concerns
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setIframeUrl(`https://www.nrcs.usda.gov${practice.nrcsUrl}`)
                              setIframePracticeName(practice.name)
                            }}
                            className="px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
                            style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                          >
                            View Standard
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {recommendedPractices.length === 0 && selectedResourceConcernIds.length > 0 && (
                <div className="text-center py-12 px-4 bg-white rounded-lg shadow-sm border" style={{ borderColor: '#e5e7eb' }}>
                  <Target className="h-12 w-12 mx-auto mb-4" style={{ color: '#9ca3af' }} />
                  <h3 className="font-medium mb-2" style={{ color: '#111827' }}>
                    No matching practices found
                  </h3>
                  <p className="text-sm" style={{ color: '#6b7280' }}>
                    Try selecting different resource concerns
                  </p>
                </div>
              )}

              {selectedResourceConcernIds.length === 0 && (
                <div className="text-center py-12 px-4 bg-white rounded-lg shadow-sm border" style={{ borderColor: '#e5e7eb' }}>
                  <Target className="h-12 w-12 mx-auto mb-4" style={{ color: '#9ca3af' }} />
                  <h3 className="font-medium mb-2" style={{ color: '#111827' }}>
                    Select Resource Concerns
                  </h3>
                  <p className="text-sm" style={{ color: '#6b7280' }}>
                    Choose one or more resource concerns above to get practice recommendations
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Resources View */}
          {viewMode === 'resources' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border p-6" style={{ borderColor: '#e5e7eb' }}>
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#111827' }}>
                  Conservation Practice Resources
                </h2>
                
                <div className="space-y-6">
                  {/* NRCS Resources */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: '#111827' }}>
                      <FileText className="h-5 w-5" style={{ color: '#16a34a' }} />
                      NRCS Official Resources
                    </h3>
                    <ul className="space-y-2">
                      <li>
                        <a
                          href="https://www.nrcs.usda.gov/conservation-basics/conservation-by-state"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm flex items-center gap-2 hover:underline"
                          style={{ color: '#2563eb' }}
                        >
                          <Download className="h-4 w-4" />
                          State-Specific Conservation Practice Standards
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.nrcs.usda.gov/programs-initiatives/eqip-environmental-quality-incentives"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm flex items-center gap-2 hover:underline"
                          style={{ color: '#2563eb' }}
                        >
                          <Download className="h-4 w-4" />
                          EQIP Program Information
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.nrcs.usda.gov/programs-initiatives/csp-conservation-stewardship-program"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm flex items-center gap-2 hover:underline"
                          style={{ color: '#2563eb' }}
                        >
                          <Download className="h-4 w-4" />
                          CSP Program Information
                        </a>
                      </li>
                    </ul>
                  </div>

                  {/* Contact Information */}
                  <div className="border rounded-lg p-4" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
                    <h4 className="font-semibold mb-2" style={{ color: '#1e40af' }}>
                      Need Assistance?
                    </h4>
                    <p className="text-sm mb-3" style={{ color: '#1e40af' }}>
                      Contact your local NRCS field office or conservation district for:
                    </p>
                    <ul className="text-sm space-y-1" style={{ color: '#1e40af' }}>
                      <li>• Site-specific practice recommendations</li>
                      <li>• Technical assistance and design help</li>
                      <li>• Financial assistance applications</li>
                      <li>• Practice implementation support</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* NRCS Documentation Modal */}
      {iframeUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
          onClick={() => setIframeUrl(null)}
        >
          <div 
            className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-xl mb-2" style={{ color: '#111827' }}>
                  {iframePracticeName}
                </h3>
                <p className="text-sm" style={{ color: '#6b7280' }}>
                  NRCS Conservation Practice Standard
                </p>
              </div>
              <button
                onClick={() => setIframeUrl(null)}
                className="p-2 rounded transition-colors ml-4"
                aria-label="Close"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X className="h-6 w-6" style={{ color: '#6b7280' }} />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-8">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="p-4 rounded-full" style={{ backgroundColor: '#dcfce7' }}>
                  <FileText className="h-12 w-12" style={{ color: '#16a34a' }} />
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold" style={{ color: '#111827' }}>
                    View Official NRCS Documentation
                  </h4>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                  <a
                    href={iframeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-6 py-3 rounded-lg font-medium text-center transition-colors flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                    onClick={() => {
                      setIframeUrl(null);
                      setSelectedPractice(null);
                    }}
                  >
                    <ExternalLink className="h-5 w-5" />
                    Open NRCS Standard
                  </a>
                  <button
                    onClick={() => setIframeUrl(null)}
                    className="px-6 py-3 rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: '#f3f4f6', color: '#374151' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  >
                    Cancel
                  </button>
                </div>

                <p className="text-xs" style={{ color: '#9ca3af' }}>
                  Documentation will open in a new browser tab
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
