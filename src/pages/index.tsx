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

      <div className="min-h-screen bg-gray-50">
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
  const colorClasses = {
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    teal: 'bg-teal-50 text-teal-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-200">
      <div
        className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${colorClasses[color as keyof typeof colorClasses]} mb-3`}
      >
        <IconComponent className="w-6 h-6" />
      </div>
      <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  )
}

