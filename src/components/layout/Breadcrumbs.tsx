'use client'

import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { ChevronRight, Home } from 'lucide-react'

const breadcrumbLabels: Record<string, string> = {
  // Main sections
  conservation: 'Conservation Planning',
  'soil-map': 'Soil Maps',
  'field-analysis': 'Field Analysis',
  'soil-health': 'Soil Health',
  suitability: 'Land Suitability',
  tools: 'Technical Tools',
  reports: 'Reports',

  // Conservation
  'planning-wizard': 'Planning Tool',
  'practice-selector': 'Practice Selector',

  // Land Suitability
  'crop-suitability': 'Crop Suitability',

  // Tools
  rusle2: 'RUSLE2',
  'nutrient-calc': 'Nutrient Calculator',

  // Dynamic routes
  '[id]': 'Details',
  '[mukey]': 'Map Unit',
  '[fieldId]': 'Field',
}

export default function Breadcrumbs() {
  const router = useRouter()

  const breadcrumbs = useMemo(() => {
    // Split path and filter out empty segments
    const pathSegments = router.pathname.split('/').filter(Boolean)

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

    // Always add home
    return [{ label: 'Dashboard', path: '/', isLast: false }, ...crumbs]
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
        background: 'linear-gradient(to right, #F2F6F2, #E2EBE1, #C7D9C6)',
        borderBottom: '1px solid #D8DBDB',
      }}
    >
      <ol className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.path} className="flex items-center">
            {index > 0 && <ChevronRight className="w-4 h-4 mx-2" style={{ color: '#6B7D7D' }} />}

            {crumb.isLast ? (
              <span className="font-semibold flex items-center" style={{ color: '#3E4A4A' }}>
                {index === 0 && <Home className="w-4 h-4 mr-1" />}
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.path}
                className="transition-colors flex items-center"
                style={{ color: '#5C6C6C' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#5C8D5A'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#5C6C6C'}
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
