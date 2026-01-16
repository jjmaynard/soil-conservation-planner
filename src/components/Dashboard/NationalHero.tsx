import Link from 'next/link'
import Image from 'next/image'
import { Sprout, Map, Globe, MapPin, FileCheck, Mountain } from 'lucide-react'

export default function NationalHero() {
  return (
    <section
      className="relative text-white overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1a4d2e, #2d6a4f, #1b4965)',
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="soil-pattern"
              x="0"
              y="0"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="50" cy="50" r="2" fill="white" />
              <circle cx="25" cy="75" r="1.5" fill="white" />
              <circle cx="75" cy="25" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#soil-pattern)" />
        </svg>
      </div>

      <div className="relative container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl">
          {/* USDA NRCS Badge */}
          <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 rounded-full px-4 py-2 mb-6">
            <Image
              src="/data/usda-logo-white.png"
              alt="USDA Logo"
              width={32}
              height={32}
              className="object-contain"
            />
            <span className="text-sm font-semibold">
              Natural Resources Conservation Service
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Soil Conservation Explorer
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl mb-8 leading-relaxed" style={{ color: '#E2EBE1' }}>
            Comprehensive soil assessment tools for agricultural lands
            across the United States
          </p>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link
              href="/soil-map"
              className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold text-lg hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              style={{
                backgroundColor: '#ffffff',
                color: '#355433',
              }}
            >
              <Globe className="mr-2 w-5 h-5" />
              Explore Soil Maps
            </Link>

            <Link
              href="/field-analysis"
              className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:bg-opacity-10 hover:scale-105 transition-all duration-200 backdrop-blur-sm"
            >
              <Map className="mr-2 w-5 h-5" />
              Analyze Your Field
            </Link>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ color: '#E2EBE1' }}>
            <div className="flex flex-col items-center text-center">
              <div className="bg-white bg-opacity-10 rounded-full p-3 mb-2 backdrop-blur-sm">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="text-sm font-medium">48 States Coverage</div>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-white bg-opacity-10 rounded-full p-3 mb-2 backdrop-blur-sm">
                <Map className="w-6 h-6" />
              </div>
              <div className="text-sm font-medium">SSURGO Integration</div>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-white bg-opacity-10 rounded-full p-3 mb-2 backdrop-blur-sm">
                <FileCheck className="w-6 h-6" />
              </div>
              <div className="text-sm font-medium">NRCS Practices</div>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-white bg-opacity-10 rounded-full p-3 mb-2 backdrop-blur-sm">
                <Mountain className="w-6 h-6" />
              </div>
              <div className="text-sm font-medium">Erosion Tools</div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="#F8F4ED"
          />
        </svg>
      </div>
    </section>
  )
}
