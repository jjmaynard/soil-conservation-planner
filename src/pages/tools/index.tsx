// Technical Tools - Module Hub

'use client'

import Head from 'next/head'
import Link from 'next/link'
import { 
  Sprout, 
  Wheat, 
  BarChart3, 
  Mountain, 
  FlaskConical,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

interface ToolModule {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  gradient: { from: string; to: string }
  path: string
  features: string[]
  status: 'active' | 'beta' | 'planned'
}

export default function TechnicalToolsHub() {
  const toolModules: ToolModule[] = [
    {
      id: 'conservation',
      title: 'Conservation Practices',
      description: 'Browse and search NRCS conservation practice standards. Access detailed specifications, resource concerns, and implementation guidance for 170+ practices.',
      icon: Sprout,
      gradient: { from: '#5C8D5A', to: '#4F7A4D' },
      path: '/conservation',
      features: ['170+ NRCS Practices', 'Resource Concerns', 'Practice Standards', 'Implementation Guides'],
      status: 'active',
    },
    {
      id: 'soil-health',
      title: 'In-Field Soil Health Assessment',
      description: 'Evaluate soil health using NRCS indicators and assessment protocols. Track soil quality indicators and improvements over time.',
      icon: Wheat,
      gradient: { from: '#6B7F39', to: '#5C6F32' },
      path: '/soil-health',
      features: ['20+ Health Indicators', 'Assessment Protocols', 'Trend Analysis', 'NRCS Standards'],
      status: 'active',
    },
    {
      id: 'suitability',
      title: 'Land Suitability',
      description: 'Evaluate land capability classification, crop suitability ratings, and use limitations based on SSURGO soil data and interpretations.',
      icon: BarChart3,
      gradient: { from: '#8B7AA8', to: '#7A6B92' },
      path: '/suitability',
      features: ['LCC Ratings', 'Crop Suitability', '50+ Interpretations', 'Yield Predictions'],
      status: 'beta',
    },
    {
      id: 'rusle-eos',
      title: 'RUSLE-EOS',
      description: 'Calculate soil erosion using RUSLE Earth Observation System. Satellite-based erosion assessment with real-time Landsat 8 and Sentinel-2 data.',
      icon: Mountain,
      gradient: { from: '#B8794F', to: '#A06843' },
      path: '/tools/rusle-eos',
      features: ['Landsat 8 + Sentinel-2', 'Multi-Scenario Analysis', 'Conservation Practice Effects', 'Field-Scale Assessment'],
      status: 'beta',
    },
    {
      id: 'nutrient-calc',
      title: 'Nutrient Calculator',
      description: 'Calculate nutrient management requirements and application rates. Assess fertilizer needs based on soil test results and crop requirements.',
      icon: FlaskConical,
      gradient: { from: '#87A096', to: '#748B81' },
      path: '/tools/nutrient-calc',
      features: ['Nutrient Balance', 'Application Rates', 'Soil Test Integration', 'Crop Requirements'],
      status: 'planned',
    },
  ]

  const getStatusBadge = (status: string) => {
    const styles = {
      active: { bg: '#E8F5E9', text: '#4CAF50', label: 'Active' },
      beta: { bg: '#E3F2FD', text: '#2196F3', label: 'Beta' },
      planned: { bg: '#FFF3E0', text: '#FF9800', label: 'Planned' },
    }
    const style = styles[status as keyof typeof styles]
    return (
      <span 
        className="text-xs font-semibold px-3 py-1 rounded-full"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        {style.label}
      </span>
    )
  }

  return (
    <>
      <Head>
        <title>Technical Tools - Soil Conservation Explorer</title>
        <meta
          name="description"
          content="Professional technical tools for soil conservation planning and assessment"
        />
      </Head>

      <div className="min-h-screen" style={{ backgroundColor: '#F8F4ED' }}>
        {/* Hero Section */}
        <section 
          className="relative text-white overflow-hidden py-16"
          style={{ background: 'linear-gradient(135deg, #1a4d2e, #2d6a4f, #1b4965)' }}
        >
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
                <FlaskConical className="w-5 h-5" />
                <span className="text-sm font-semibold">Technical Tools</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Soil Conservation Toolkit
              </h1>
              
              <p className="text-xl mb-6 opacity-90">
                Comprehensive suite of tools for soil conservation planning, assessment, and analysis
              </p>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Science-Based</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>NRCS Standards</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Real-Time Data</span>
                </div>
              </div>
            </div>
          </div>

          {/* Wave Separator */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 32.5C840 35 960 40 1080 42.5C1200 45 1320 45 1380 45L1440 45V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z"
                fill="#F8F4ED"
              />
            </svg>
          </div>
        </section>

        {/* Tools Grid */}
        <section className="container mx-auto px-4 py-12 -mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {toolModules.map((tool) => (
              <Link
                key={tool.id}
                href={tool.path}
                className="group block"
              >
                <div 
                  className="relative h-full rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  {/* Gradient Header */}
                  <div 
                    className="h-32 relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${tool.gradient.from}, ${tool.gradient.to})` }}
                  >
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-4 right-4 w-24 h-24 rounded-full border-4 border-white opacity-30" />
                      <div className="absolute bottom-2 left-4 w-16 h-16 rounded-full border-4 border-white opacity-30" />
                    </div>
                    
                    <div className="absolute bottom-4 left-6">
                      <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-3">
                        <tool.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    <div className="absolute top-4 right-4">
                      {getStatusBadge(tool.status)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-opacity-80 transition-colors" style={{ color: '#2C3E50' }}>
                      {tool.title}
                    </h3>
                    
                    <p className="text-sm mb-4 leading-relaxed" style={{ color: '#64748B' }}>
                      {tool.description}
                    </p>

                    {/* Features List */}
                    <ul className="space-y-2 mb-4">
                      {tool.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: '#475569' }}>
                          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: tool.gradient.from }} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Launch Button */}
                    <div className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all" style={{ color: tool.gradient.from }}>
                      <span>Launch Tool</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Info Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#2C3E50' }}>
              About Technical Tools
            </h2>
            <div className="prose prose-lg" style={{ color: '#475569' }}>
              <p className="mb-4">
                The Technical Tools suite provides user-friendly web tools for soil conservation planning, 
                assessment, and analysis. Each tool is built on scientific principles and NRCS standards, 
                integrating real-time satellite data, comprehensive soil databases, and advanced analysis capabilities.
              </p>
              <p>
                These tools are designed for conservation professionals, agronomists, farmers, and land managers 
                who need accurate, data-driven insights for sustainable land management and conservation planning.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
