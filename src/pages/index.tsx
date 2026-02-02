// Soil Interpretation Engine - Dashboard

'use client'

import Head from 'next/head'
import { Layers, Globe, Cloud, Activity } from 'lucide-react'

import NationalHero from '#components/Dashboard/NationalHero'
import ModuleGrid from '#components/Dashboard/ModuleGrid'

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Soil Interpretation Explorer - Dashboard</title>
        <meta
          name="description"
          content="Professional web application for visualizing soil properties and conservation planning"
        />
      </Head>

      <div className="min-h-screen" style={{ backgroundColor: '#F8F4ED' }}>
        {/* National Hero Section */}
        <NationalHero />

        {/* Module Grid */}
        <ModuleGrid />

        {/* Quick Stats Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard
              icon={Layers}
              value="SSURGO + SOLUS"
              label="Soil Data Sources"
              color="green"
            />
            <StatCard
              icon={Globe}
              value="Landsat + Sentinel"
              label="Satellite Imagery"
              color="blue"
            />
            <StatCard
              icon={Cloud}
              value="GRIDMET"
              label="Climate Data"
              color="teal"
            />
            <StatCard
              icon={Activity}
              value="Real-Time"
              label="NDVI Monitoring"
              color="orange"
            />
          </div>
        </section>
      </div>
    </>
  )
}

function StatCard({
  icon: IconComponent,
  value,
  label,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  value: string
  label: string
  color: string
}) {
  const colorStyles = {
    green: { bg: 'linear-gradient(135deg, #E8F5E9 0%, #E2EBE1 100%)', iconBg: '#5C8D5A', iconColor: '#ffffff' },
    blue: { bg: 'linear-gradient(135deg, #E3F2FD 0%, #DCE9F1 100%)', iconBg: '#3F6A87', iconColor: '#ffffff' },
    teal: { bg: 'linear-gradient(135deg, #E0F2F7 0%, #E2ECF1 100%)', iconBg: '#6A8F9E', iconColor: '#ffffff' },
    orange: { bg: 'linear-gradient(135deg, #FFF3E0 0%, #F3EAE2 100%)', iconBg: '#A06843', iconColor: '#ffffff' },
  }

  const colors = colorStyles[color as keyof typeof colorStyles]

  return (
    <div 
      className="group relative rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-8 text-center border border-gray-100 overflow-hidden" 
      style={{ background: colors.bg }}
    >
      {/* Subtle top accent line */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 opacity-60" 
        style={{ background: colors.iconBg }}
      />
      
      <div
        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-md group-hover:scale-110 transition-transform duration-300"
        style={{ backgroundColor: colors.iconBg, color: colors.iconColor }}
      >
        <IconComponent className="w-8 h-8" />
      </div>
      
      <div className="text-xl md:text-2xl font-bold mb-2 tracking-tight" style={{ color: '#2C3E50' }}>
        {value}
      </div>
      
      <div className="text-xs uppercase tracking-wider font-medium" style={{ color: '#64748B', letterSpacing: '0.05em' }}>
        {label}
      </div>
    </div>
  )
}

