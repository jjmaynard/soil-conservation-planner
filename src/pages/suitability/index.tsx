import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Sprout, Home, Factory, Droplets, TreePine, ArrowRight, Info, BarChart3 } from 'lucide-react';

interface SuitabilityModule {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  link: string;
  status: 'available' | 'coming-soon';
  features?: string[];
}

const SUITABILITY_MODULES: SuitabilityModule[] = [
  {
    id: 'crop-suitability',
    title: 'Crop Suitability Assessment',
    description: 'Evaluate soil quality and suitability for crop production with detailed soil quality indices and management recommendations.',
    icon: Sprout,
    iconColor: '#16a34a',
    iconBg: '#dcfce7',
    link: '/suitability/crop-suitability',
    status: 'available',
    features: [
      '46+ crop types supported',
      '7 soil quality indices (SQ1-SQ7)',
      'Management recommendations',
      'Limiting factor analysis'
    ]
  },
  {
    id: 'building-suitability',
    title: 'Building Site Suitability',
    description: 'Assess soil conditions for residential and commercial construction, including foundation types and site limitations.',
    icon: Home,
    iconColor: '#3b82f6',
    iconBg: '#dbeafe',
    link: '#',
    status: 'coming-soon',
    features: [
      'Foundation type recommendations',
      'Drainage considerations',
      'Excavation difficulty',
      'Site preparation needs'
    ]
  },
  {
    id: 'septic-suitability',
    title: 'Septic System Suitability',
    description: 'Evaluate soil properties for septic tank absorption fields and wastewater treatment systems.',
    icon: Droplets,
    iconColor: '#0891b2',
    iconBg: '#cffafe',
    link: '#',
    status: 'coming-soon',
    features: [
      'Percolation rate analysis',
      'Seasonal water table depth',
      'Soil texture evaluation',
      'System type recommendations'
    ]
  },
  {
    id: 'recreation-suitability',
    title: 'Recreation Area Suitability',
    description: 'Assess soil suitability for parks, playgrounds, picnic areas, and recreational facilities.',
    icon: TreePine,
    iconColor: '#16a34a',
    iconBg: '#d1fae5',
    link: '#',
    status: 'coming-soon',
    features: [
      'Turf grass establishment',
      'Path and trail suitability',
      'Playground surface analysis',
      'Erosion potential'
    ]
  },
  {
    id: 'engineering-suitability',
    title: 'Engineering Applications',
    description: 'Evaluate soil properties for roads, embankments, and other engineering uses.',
    icon: Factory,
    iconColor: '#7c3aed',
    iconBg: '#ede9fe',
    link: '#',
    status: 'coming-soon',
    features: [
      'Road subgrade suitability',
      'Embankment material',
      'Excavation stability',
      'Compaction characteristics'
    ]
  }
];

export default function LandSuitabilityDashboard() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const availableModules = SUITABILITY_MODULES.filter(m => m.status === 'available');
  const comingSoonModules = SUITABILITY_MODULES.filter(m => m.status === 'coming-soon');

  return (
    <>
      <Head>
        <title>Land Suitability Assessment - Soil Interpretation Engine</title>
        <meta name="description" content="Comprehensive soil suitability assessments for agricultural, residential, and engineering applications" />
      </Head>

      <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #f9fafb, #f0fdf4, #dcfce7)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div 
            className="text-white shadow-lg rounded-lg my-6 mb-8"
            style={{ background: 'linear-gradient(to right, var(--color-conservation), var(--color-forest-700), var(--color-forest-800))' }}
          >
            <div className="px-6 py-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <BarChart3 className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Land Suitability Assessment</h1>
                  <p className="text-sm" style={{ color: 'var(--color-forest-100)' }}>
                    Evaluate soil suitability for various land uses including agriculture, construction, and recreation
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="alert-success rounded-lg p-4 mb-8 flex items-start gap-3">
            <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold mb-1">
                What is Land Suitability?
              </div>
              <p className="text-sm">
                Land suitability assessment evaluates how well soil properties and site conditions match the requirements for specific land uses. 
                These assessments help landowners, developers, and planners make informed decisions about land management and development.
              </p>
            </div>
          </div>

          {/* Available Modules */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#111827' }}>
              Available Assessments
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {availableModules.map((module) => {
                const Icon = module.icon;
                return (
                  <Link key={module.id} href={module.link}>
                    <div
                      className="rounded-lg border-2 p-6 transition-all cursor-pointer"
                      style={{ 
                        backgroundColor: 'white',
                        borderColor: selectedModule === module.id ? '#3b82f6' : '#e5e7eb'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-ocean-500)';
                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        if (selectedModule !== module.id) {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                        }
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-3 rounded-lg flex-shrink-0" style={{ backgroundColor: module.iconBg }}>
                            <Icon className="h-8 w-8" style={{ color: module.iconColor }} />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2" style={{ color: '#111827' }}>
                              {module.title}
                            </h3>
                            <p className="mb-4" style={{ color: '#6b7280' }}>
                              {module.description}
                            </p>
                            {module.features && (
                              <div className="grid grid-cols-2 gap-2">
                                {module.features.map((feature, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-sm" style={{ color: '#374151' }}>
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: module.iconColor }} />
                                    {feature}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="h-6 w-6 flex-shrink-0 ml-4" style={{ color: 'var(--color-ocean-500)' }} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Coming Soon Modules */}
          {comingSoonModules.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#111827' }}>
                Coming Soon
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {comingSoonModules.map((module) => {
                  const Icon = module.icon;
                  return (
                    <div
                      key={module.id}
                      className="rounded-lg border p-6 relative"
                      style={{ 
                        backgroundColor: 'white',
                        borderColor: '#e5e7eb',
                        opacity: 0.7
                      }}
                    >
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                          Coming Soon
                        </span>
                      </div>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: module.iconBg }}>
                          <Icon className="h-6 w-6" style={{ color: module.iconColor }} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold mb-2" style={{ color: '#111827' }}>
                            {module.title}
                          </h3>
                          <p className="text-sm" style={{ color: '#6b7280' }}>
                            {module.description}
                          </p>
                        </div>
                      </div>
                      {module.features && (
                        <div className="space-y-1 pl-14">
                          {module.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs" style={{ color: '#9ca3af' }}>
                              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: module.iconColor }} />
                              {feature}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Additional Resources */}
          <div className="mt-12 rounded-lg border p-6" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: '#111827' }}>
              About These Assessments
            </h3>
            <div className="space-y-3 text-sm" style={{ color: '#374151' }}>
              <p>
                These suitability assessments are based on USDA-NRCS soil survey data and established interpretation methodologies. 
                Each assessment evaluates specific soil properties relevant to the intended land use.
              </p>
              <p>
                <strong>Important:</strong> These assessments are intended as planning tools and should not replace site-specific 
                investigations by qualified professionals. Local regulations, site conditions, and other factors may affect final 
                suitability determinations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
