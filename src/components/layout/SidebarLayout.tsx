'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { 
  X, 
  Menu, 
  ChevronDown, 
  ChevronUp, 
  Sprout, 
  ClipboardCheck, 
  Wheat, 
  Map, 
  Globe, 
  BarChart3, 
  Mountain, 
  FlaskConical, 
  FileText,
  Home 
} from 'lucide-react'

interface NavigationItem {
  path: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

interface NavigationSection {
  title: string
  items: NavigationItem[]
}

interface SidebarLayoutProps {
  children: React.ReactNode
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['Soil Interpretation Toolkit', 'Soil Assessment'])
  )

  const navigationSections: NavigationSection[] = [
    {
      title: 'Soil Assessment',
      items: [
        {
          path: '/soil-map',
          label: 'Soil Map Explorer',
          icon: Globe,
          description: 'SSURGO mapping',
        },
        {
          path: '/field-analysis',
          label: 'Field Analysis',
          icon: Map,
          description: 'Field-level evaluation',
        },
      ],
    },
    {
      title: 'Soil Interpretation Toolkit',
      items: [
        {
          path: '/conservation',
          label: 'Conservation Practices',
          icon: Sprout,
          description: 'NRCS practice standards',
        },
        {
          path: '/soil-health',
          label: 'Soil Health',
          icon: Wheat,
          description: 'Assessment & indicators',
        },
        {
          path: '/suitability',
          label: 'Land Suitability',
          icon: BarChart3,
          description: 'Crop & use suitability',
        },
        {
          path: '/tools/rusle-eos',
          label: 'RUSLE-EOS',
          icon: Mountain,
          description: 'Erosion prediction',
        },
        // {
        //   path: '/tools/nutrient-calc',
        //   label: 'Nutrient Calculator',
        //   icon: FlaskConical,
        //   description: 'Nutrient management',
        // },
      ],
    },
    {
      title: 'Reports & Documentation',
      items: [
        {
          path: '/reports',
          label: 'Generate Reports',
          icon: FileText,
          description: 'Conservation plans & docs',
        },
      ],
    },
  ]

  const toggleSection = (sectionTitle: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionTitle)) {
      newExpanded.delete(sectionTitle)
    } else {
      newExpanded.add(sectionTitle)
    }
    setExpandedSections(newExpanded)
  }

  return (
    <div className="flex min-h-screen min-h-[100dvh] bg-background">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50
        text-white
        transition-all duration-300 ease-in-out
        flex flex-col
        sidebar-scroll
        h-[100dvh] lg:h-auto
        ${sidebarOpen ? 'w-72 min-w-[240px] max-w-[320px]' : 'w-20 min-w-[80px]'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
        style={{
          background: 'linear-gradient(to bottom, var(--color-forest-800), var(--color-forest-700), var(--color-forest-600), var(--color-forest-700), var(--color-forest-800))',
          overflowX: 'hidden',
          overflowY: 'auto',
        }}
      >
        {/* Sidebar Header */}
        <div className="flex-shrink-0" style={{ borderBottom: '1px solid var(--color-forest-500)' }}>
          <div className="h-20 flex items-center justify-between px-4">
            {sidebarOpen ? (
              <>
                <Link href="/" className="flex items-center space-x-2">
                  <div className="bg-white bg-opacity-20 rounded-lg p-1.5">
                    <Image src="/nrcs.png" alt="NRCS logo" width={20} height={20} className="w-5 h-5" priority />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm leading-tight">Soil Interpretation Explorer</span>
                    <span className="text-xs leading-tight" style={{ color: 'var(--color-forest-200)' }}>
                      USDA-NRCS
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg transition-colors hidden lg:block min-w-[44px] min-h-[44px]"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-forest-600)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                    />
                  </svg>
                </button>
              </>
            ) : (
              <div className="w-full flex flex-col items-center gap-2">
                <Link href="/">
                  <div className="bg-white bg-opacity-20 rounded-lg p-2">
                    <Image src="/nrcs.png" alt="NRCS logo" width={24} height={24} className="w-6 h-6" priority />
                  </div>
                </Link>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg transition-colors hidden lg:block min-w-[44px] min-h-[44px]"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-forest-600)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  aria-label="Expand sidebar"
                  title="Expand sidebar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 5l7 7-7 7M5 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-2">
          {navigationSections.map((section, sectionIdx) => (
            <div key={sectionIdx} className="mb-4">
              {/* Section Title */}
              {sidebarOpen ? (
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full px-4 py-2.5 mb-1 flex items-center justify-between text-xs font-bold uppercase tracking-wider transition-all rounded-lg mx-2"
                  style={{ 
                    color: 'var(--color-forest-200)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'white'
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-forest-200)'
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <span>{section.title}</span>
                  {expandedSections.has(section.title) ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              ) : (
                <div className="h-px mx-3 mb-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
              )}

              {/* Section Items */}
              {(sidebarOpen ? expandedSections.has(section.title) : true) && (
                <ul className="space-y-1.5 px-2">
                  {section.items.map((item) => {
                    const isActive =
                      router.pathname === item.path ||
                      router.pathname.startsWith(item.path + '/')

                    return (
                      <li key={item.path}>
                        <Link
                          href={item.path}
                          className="group relative flex items-center px-3 py-3 rounded-lg transition-all duration-200"
                          style={{
                            backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                            color: isActive ? 'white' : 'var(--color-forest-100)',
                            borderLeft: isActive ? '3px solid white' : '3px solid transparent',
                            paddingLeft: isActive ? '9px' : '12px'
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'
                              e.currentTarget.style.color = 'white'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.backgroundColor = 'transparent'
                              e.currentTarget.style.color = 'var(--color-forest-100)'
                            }
                          }}
                          title={!sidebarOpen ? item.label : undefined}
                        >
                          {/* Icon with background */}
                          <div 
                            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200"
                            style={{
                              backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                            }}
                          >
                            <item.icon className="w-5 h-5" />
                          </div>

                          {sidebarOpen && (
                            <div className="ml-3 flex-1 min-w-0">
                              <div className={`text-sm leading-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>
                                {item.label}
                              </div>
                              <div 
                                className="text-xs truncate mt-0.5" 
                                style={{ 
                                  color: isActive ? 'rgba(255, 255, 255, 0.8)' : 'var(--color-forest-200)',
                                  opacity: isActive ? 1 : 0.9
                                }}
                              >
                                {item.description}
                              </div>
                            </div>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
              
              {/* Subtle divider after each section except last */}
              {sidebarOpen && sectionIdx < navigationSections.length - 1 && (
                <div className="h-px mx-4 mt-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
              )}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="flex-shrink-0 p-4" style={{ borderTop: '2px solid rgba(255, 255, 255, 0.1)' }}>
          {/* Back to Dashboard - Enhanced button style */}
          <Link
            href="/"
            className={`flex items-center ${sidebarOpen ? 'space-x-3 px-4' : 'justify-center'} py-3 rounded-lg transition-all duration-200 font-medium`}
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: 'white',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            title={!sidebarOpen ? 'Back to Dashboard' : undefined}
          >
            <Home className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm">Back to Dashboard</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 flex items-center justify-between px-4 flex-shrink-0 bg-surface border-b border-border">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg transition-colors min-w-[44px] min-h-[44px]"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-background)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-text" />
          </button>

          <Link href="/" className="flex items-center space-x-2">
            <div className="rounded-lg p-1.5 bg-forest-500">
              <Image src="/nrcs.png" alt="NRCS logo" width={20} height={20} className="w-5 h-5" priority />
            </div>
            <span className="font-bold text-sm text-text">Soil Interpretation Explorer</span>
          </Link>

          <div className="w-10" /> {/* Spacer for centering */}
        </header>

        {/* Page Content */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden relative">{children}</div>
      </div>
    </div>
  )
}
