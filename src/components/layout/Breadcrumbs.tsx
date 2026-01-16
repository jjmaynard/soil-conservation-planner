'use client'

import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { ChevronRight, Home } from 'lucide-react'

const breadcrumbLabels: Record<string, string> = {
  // Main sections
  conservation: 'Conservation Practices',
  'soil-map': 'Soil Maps',
  'field-analysis': 'Field Analysis',
  tools: 'Technical Tools',
  reports: 'Reports',

  // Conservation
  'planning-wizard': 'Planning Tool',
  'practice-selector': 'Practice Selector',

  // Land Suitability
  'crop-suitability': 'Crop Suitability',

  // Tools - These will show under "Technical Tools"
  'soil-health': 'Soil Health',
  suitability: 'Land Suitability',
  rusle2: 'RUSLE2',
  'rusle-eos': 'RUSLE-EOS',
  'nutrient-calc': 'Nutrient Calculator',

  // Dynamic routes
  '[id]': 'Details',
  '[mukey]': 'Map Unit',
  '[fieldId]': 'Field',
}

// Define which paths should have "Technical Tools" as parent
const technicalToolsPaths = [
  '/soil-health',
  '/suitability',
  '/suitability/crop-suitability',
  '/tools/rusle-eos',
  '/tools/rusle2',
  '/tools/nutrient-calc',
  '/conservation',
]

export default function Breadcrumbs() {
  const router = useRouter()

  const breadcrumbs = useMemo(() => {
    // Split path and filter out empty segments
    const pathSegments = router.pathname.split('/').filter(Boolean)

    // Check if this path should have Technical Tools as parent
    const needsToolsParent = technicalToolsPaths.some(path => 
      router.pathname.startsWith(path)
    )

    // Build breadcrumb array
    const crumbs = pathSegments.map((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/')
      const label = breadcrumbLabels[segment] || segment

      // Check if this is a dynamic route
      const isDynamic = segment.startsWith('[')

      // For dynamic routes, try to get actual value from query params
      let displayLabel = label
      if (isDynamic) {
        const paramName = segment.slice(1, -1) // Remove [ ]
        const paramValue = router.query[paramName]
        if (paramValue) {
          displayLabel = String(paramValue)
        }
      }

      return {
        label: displayLabel,
        path,
        isLast: index === pathSegments.length - 1,
      }
    })

    // Build final breadcrumbs with home
    let finalCrumbs = [{ label: 'Dashboard', path: '/', isLast: false }]
    
    // Insert "Technical Tools" parent if needed
    if (needsToolsParent && !router.pathname.startsWith('/tools')) {
      finalCrumbs.push({ label: 'Technical Tools', path: '/tools', isLast: false })
    }
    
    finalCrumbs = [...finalCrumbs, ...crumbs]

    return finalCrumbs
  }, [router.pathname, router.query])

  // Don't show breadcrumbs on dashboard
  if (router.pathname === '/') {
    return null
  }

  return (
    <nav 
      className="px-4 md:px-6 py-2" 
      aria-label="Breadcrumb"
      style={{
        background: 'linear-gradient(to right, var(--color-forest-50), var(--color-forest-100), var(--color-forest-200))',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <ol className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.path} className="flex items-center">
            {index > 0 && <ChevronRight className="w-4 h-4 mx-2 text-slate-500" />}

            {crumb.isLast ? (
              <span className="font-semibold flex items-center text-slate-800">
                {index === 0 && <Home className="w-4 h-4 mr-1" />}
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.path}
                className="transition-colors flex items-center text-slate-600 hover:text-forest-500"
                style={{ color: 'var(--color-slate-600)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-forest-500)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-slate-600)'}
              >
                {index === 0 && <Home className="w-4 h-4 mr-1" />}
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
