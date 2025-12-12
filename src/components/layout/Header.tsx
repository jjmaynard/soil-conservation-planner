// NRCS Header Component

'use client'

import { Sprout } from 'lucide-react'
import Image from 'next/image'

interface HeaderProps {
  className?: string
}

export default function Header({ className = '' }: HeaderProps) {
  return (
    <header 
      className={`shadow-lg ${className}`} 
      style={{ 
        background: 'linear-gradient(135deg, #1e2b4d 0%, #2b3d6c 50%, #3d5a8c 100%)',
        color: 'white',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        zIndex: 1000,
      }}
    >
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo and Title */}
          <div className="flex items-center gap-4">
            <div 
              className="flex items-center justify-center"
              style={{ 
                height: '56px',
              }}
            >
              <Image 
                src="/data/usda-logo-white.png"
                alt="USDA Logo"
                width={0}
                height={0}
                style={{ objectFit: 'contain', height: '100%', width: 'auto' }}
                sizes="100vw"
              />
            </div>
            <div>
              <h1 
                className="font-bold leading-tight" 
                style={{ 
                  color: 'white',
                  fontSize: '24px',
                  letterSpacing: '-0.02em',
                }}
              >
                Soil Conservation Planner
              </h1>
              <p 
                className="font-medium" 
                style={{ 
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontSize: '13px',
                  marginTop: '2px',
                }}
              >
                Interactive Soil Interpretation Platform
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
