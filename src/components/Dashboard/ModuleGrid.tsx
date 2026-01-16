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
      gradient: { from: '#4A7C9E', to: '#3F6A87' },
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
      gradient: { from: '#7BA4B5', to: '#6A8F9E' },
      path: '/field-analysis',
      features: ['Erosion assessment', 'Suitability ratings', 'Management zones'],
      stats: { label: 'Resolution', value: '10-30m' },
    },
    {
      id: 'tools',
      title: 'Technical Tools',
      description: 'Access nutrient calculators and other technical assessment tools.',
      icon: FlaskConical,
      gradient: { from: '#87A096', to: '#748B81' },
      path: '/tools',
      features: ['Nutrient calc', 'SCI calculator', 'Analysis tools'],
      stats: { label: 'Tools', value: '5+' },
    },
    {
      id: 'conservation',
      title: 'Conservation Practices',
      description:
        'Browse NRCS conservation practice standards. Access specifications and implementation guidance.',
      icon: Sprout,
      gradient: { from: '#5C8D5A', to: '#4F7A4D' },
      path: '/conservation',
      features: ['170+ NRCS practices', 'Resource concerns', 'Implementation guides'],
      stats: { label: 'Practices', value: '170+' },
    },
    {
      id: 'erosion-tools',
      title: 'Erosion Assessment',
      description:
        'Calculate soil erosion using RUSLE-EOS (Earth Observation System). Real-time satellite-based assessment.',
      icon: Mountain,
      gradient: { from: '#B8794F', to: '#A06843' },
      path: '/tools/rusle-eos',
      features: ['RUSLE-EOS', 'Satellite data', 'Conservation practices'],
      stats: { label: 'Satellite Data', value: 'L8 + S2' },
    },
    {
      id: 'soil-health',
      title: 'Soil Health',
      description: 'Assess soil health indicators. Track improvements over time.',
      icon: Wheat,
      gradient: { from: '#6B7F39', to: '#5C6F32' },
      path: '/soil-health',
      features: ['Health indicators', 'Assessments', 'Tracking'],
      stats: { label: 'Indicators', value: '20+' },
    },
    {
      id: 'suitability',
      title: 'Land Suitability',
      description:
        'Evaluate land capability classification, crop suitability ratings, and use limitations.',
      icon: BarChart3,
      gradient: { from: '#8B7AA8', to: '#7A6B92' },
      path: '/suitability',
      features: ['LCC ratings', 'Crop suitability', 'Yield predictions'],
      stats: { label: 'Interpretations', value: '50+' },
    },
    {
      id: 'reports',
      title: 'Reports',
      description: 'Generate soil conservation plans and assessments.',
      icon: FileText,
      gradient: { from: '#5C6C6C', to: '#4D5B5B' },
      path: '/reports',
      features: ['Soil conservation plans', 'Export options', 'Templates'],
      stats: { label: 'Templates', value: 'PDF/JSON' },
    },
  ]

  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <div className="mb-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#3E4A4A' }}>
          Planning & Assessment Tools
        </h2>
        <p className="text-lg" style={{ color: '#5C6C6C' }}>
          Comprehensive suite of soil conservation planning and assessment tools
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
      className="group rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col"
      style={{ backgroundColor: '#FEFDFB' }}
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
        <p className="mb-4 text-sm leading-relaxed flex-1" style={{ color: '#5C6C6C' }}>{module.description}</p>

        {/* Features list */}
        <ul className="space-y-1 mb-4">
          {module.features.map((feature, idx) => (
            <li key={idx} className="flex items-center text-xs" style={{ color: '#3E4A4A' }}>
              <svg
                className="w-3 h-3 mr-2 flex-shrink-0"
                style={{ color: '#5C8D5A' }}
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
        <div className="pt-3" style={{ borderTop: '1px solid #D8DBDB' }}>
          <div className="flex justify-between items-center text-xs">
            <span style={{ color: '#6B7D7D' }}>{module.stats.label}</span>
            <span className="font-semibold text-sm" style={{ color: '#3E4A4A' }}>{module.stats.value}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
