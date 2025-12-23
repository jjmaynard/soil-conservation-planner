// Soil Conservation Explorer - Dashboard

'use client'

import Head from 'next/head'
import { Wheat, FileCheck, CheckCircle2, TrendingDown } from 'lucide-react'

import NationalHero from '#components/Dashboard/NationalHero'
import ModuleGrid from '#components/Dashboard/ModuleGrid'

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Soil Conservation Explorer - Dashboard</title>
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
              icon={Wheat}
              value="235M"
              label="Acres Under Conservation"
              color="green"
            />
            <StatCard
              icon={FileCheck}
              value="45,678"
              label="Active Conservation Plans"
              color="blue"
            />
            <StatCard
              icon={CheckCircle2}
              value="89,234"
              label="Practices Implemented"
              color="teal"
            />
            <StatCard
              icon={TrendingDown}
              value="1.25B"
              label="Tons Erosion Prevented"
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
    green: { bg: '#E2EBE1', text: '#5C8D5A' },
    blue: { bg: '#DCE9F1', text: '#3F6A87' },
    teal: { bg: '#E2ECF1', text: '#6A8F9E' },
    orange: { bg: '#F3EAE2', text: '#A06843' },
  }

  const colors = colorStyles[color as keyof typeof colorStyles]

  return (
    <div className="rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-200" style={{ backgroundColor: '#FEFDFB' }}>
      <div
        className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
        style={{ backgroundColor: colors.bg, color: colors.text }}
      >
        <IconComponent className="w-6 h-6" />
      </div>
      <div className="text-2xl md:text-3xl font-bold mb-1" style={{ color: '#3E4A4A' }}>{value}</div>
      <div className="text-sm" style={{ color: '#5C6C6C' }}>{label}</div>
    </div>
  )
}

