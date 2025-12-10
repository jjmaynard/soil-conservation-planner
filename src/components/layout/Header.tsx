// NRCS Header Component

'use client'

import { Sprout } from 'lucide-react'

interface HeaderProps {
  className?: string
}

export default function Header({ className = '' }: HeaderProps) {
  return (
    <header className={`shadow-md ${className}`} style={{ backgroundColor: '#2563eb', color: 'white' }}>
      <div className="w-full px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sprout className="h-8 w-8" style={{ color: 'white' }} />
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'white' }}>
                Soil Conservation Planner
              </h1>
              <p className="text-sm" style={{ color: '#dbeafe' }}>
                Interactive Soil Interpretation Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium" style={{ color: 'white' }}>
                USDA NRCS
              </p>
              <p className="text-xs" style={{ color: '#dbeafe' }}>
                Natural Resources Conservation Service
              </p>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header
