import Link from 'next/link'
import {
  Map,
  Globe,
  Sprout,
  Mountain,
  Wheat,
  BarChart3,
  FileText,
  FlaskConical,
} from 'lucide-react'

interface Module {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  gradient: { from: string; to: string }
  path: string
  features: string[]
  stats: { label: string; value: string }
}

export default function ModuleGrid() {
  const modules: Module[] = [
    {
      id: 'soil-maps',
      title: 'Soil Maps & Data',
      description:
        'Access SSURGO soil survey data. View detailed soil properties, classifications, and map units.',
      icon: Map,
      gradient: { from: '#3b82f6', to: '#2563eb' }, // blue-500 to blue-600
      path: '/soil-map',
      features: ['SSURGO integration', 'Interactive maps', 'Data queries'],
      stats: { label: 'Map Units', value: '100K+' },
    },
    {
      id: 'field-analysis',
      title: 'Field Analysis',
      description:
        'Analyze agricultural fields. Assess crop suitability, erosion risk, and conservation needs.',
      icon: Globe,
      gradient: { from: '#6366f1', to: '#4f46e5' }, // indigo-500 to indigo-600
      path: '/field-analysis',
      features: ['Erosion assessment', 'Suitability ratings', 'Management zones'],
      stats: { label: 'Fields Available', value: '8M+' },
    },
    {
      id: 'conservation',
      title: 'Conservation Planning',
      description:
        'Create conservation plans using NRCS practice standards. Address resource concerns.',
      icon: Sprout,
      gradient: { from: '#22c55e', to: '#16a34a' }, // green-500 to green-600
      path: '/conservation',
      features: ['Practice standards', 'Resource concerns', 'Plan builder'],
      stats: { label: 'Practices', value: '170+' },
    },
    {
      id: 'erosion-tools',
      title: 'Erosion Assessment',
      description:
        'Calculate soil erosion using RUSLE2. Evaluate conservation practice effectiveness.',
      icon: Mountain,
      gradient: { from: '#f97316', to: '#ea580c' }, // orange-500 to orange-600
      path: '/tools/rusle2',
      features: ['RUSLE2', 'Practice effects', 'Calculations'],
      stats: { label: 'Assessments', value: '12K+' },
    },
    {
      id: 'soil-health',
      title: 'Soil Health',
      description: 'Assess soil health indicators. Track improvements over time.',
      icon: Wheat,
      gradient: { from: '#14b8a6', to: '#0d9488' }, // teal-500 to teal-600
      path: '/soil-health',
      features: ['Health indicators', 'Assessments', 'Tracking'],
      stats: { label: 'Assessments', value: '3,400+' },
    },
    {
      id: 'suitability',
      title: 'Land Suitability',
      description:
        'Evaluate land capability classification, crop suitability ratings, and use limitations.',
      icon: BarChart3,
      gradient: { from: '#a855f7', to: '#9333ea' }, // purple-500 to purple-600
      path: '/suitability',
      features: ['LCC ratings', 'Crop suitability', 'Yield predictions'],
      stats: { label: 'Interpretations', value: '50+' },
    },
    {
      id: 'reports',
      title: 'Reports',
      description: 'Generate conservation plans and documentation.',
      icon: FileText,
      gradient: { from: '#4b5563', to: '#374151' }, // gray-600 to gray-700
      path: '/reports',
      features: ['Conservation plans', 'Export options', 'Templates'],
      stats: { label: 'Generated', value: '8,900+' },
    },
    {
      id: 'tools',
      title: 'Technical Tools',
      description: 'Access nutrient calculators and other technical assessment tools.',
      icon: FlaskConical,
      gradient: { from: '#06b6d4', to: '#0891b2' }, // cyan-500 to cyan-600
      path: '/tools',
      features: ['Nutrient calc', 'SCI calculator', 'Analysis tools'],
      stats: { label: 'Calculations', value: '5,200+' },
    },
  ]

  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <div className="mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Planning & Assessment Tools
        </h2>
        <p className="text-lg text-gray-600">
          Comprehensive suite of conservation planning and soil assessment tools
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((module) => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </div>
    </section>
  )
}

function ModuleCard({ module }: { module: Module }) {
  const IconComponent = module.icon

  return (
    <Link
      href={module.path}
      className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Color header with icon */}
      <div
        className="p-6 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(to right, ${module.gradient.from}, ${module.gradient.to})`,
        }}
      >
        {/* Decorative background element */}
        <div className="absolute -right-4 -top-4 opacity-10">
          <IconComponent className="w-32 h-32" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
              <IconComponent className="w-8 h-8" />
            </div>
          </div>
          <h3 className="text-lg font-bold">{module.title}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <p className="text-gray-600 mb-4 text-sm leading-relaxed flex-1">{module.description}</p>

        {/* Features list */}
        <ul className="space-y-1 mb-4">
          {module.features.map((feature, idx) => (
            <li key={idx} className="flex items-center text-xs text-gray-700">
              <svg
                className="w-3 h-3 mr-2 text-green-500 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {feature}
            </li>
          ))}
        </ul>

        {/* Stats */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">{module.stats.label}</span>
            <span className="font-bold text-base">{module.stats.value}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
