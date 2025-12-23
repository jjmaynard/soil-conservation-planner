import 'leaflet/dist/leaflet.css'

import type { AppProps } from 'next/app'
import { Catamaran } from 'next/font/google'
import Head from 'next/head'
import { useRouter } from 'next/router'

import '#components/Map/leaflet-custom.css'
import '#src/globals.css'
import '#src/styles/soil-map.css'

import SidebarLayout from '#components/layout/SidebarLayout'
import Breadcrumbs from '#components/layout/Breadcrumbs'

const catamaran = Catamaran({
  subsets: ['latin'],
  variable: '--font-catamaran',
})

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter()

  // Routes that don't need sidebar (full-width pages)
  const fullWidthRoutes = ['/', '/login', '/setup']
  const isFullWidth = fullWidthRoutes.includes(router.pathname)

  return (
    <>
      <Head>
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="Soil Conservation Explorer - Interactive Soil Survey Platform for NRCS soil scientists"
        />
        <title>Soil Conservation Explorer - Soil Survey Interactive Mapping</title>
      </Head>
      <main className={`${catamaran.variable} font-sans text-base`}>
        {isFullWidth ? (
          // Dashboard gets no sidebar
          <Component {...pageProps} />
        ) : (
          // All module pages get sidebar + breadcrumbs
          <SidebarLayout>
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <Breadcrumbs />
              <div className={`flex-1 flex flex-col overflow-auto ${router.pathname === '/soil-map' || router.pathname.startsWith('/soil-health/assessment') ? '' : 'p-4 md:p-6 bg-gray-50'}`}>
                <Component {...pageProps} />
              </div>
            </div>
          </SidebarLayout>
        )}
      </main>
    </>
  )
}

export default App
