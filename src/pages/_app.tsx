import 'leaflet/dist/leaflet.css'

import type { AppProps } from 'next/app'
import { Catamaran } from 'next/font/google'
import Head from 'next/head'

import '#components/Map/leaflet-custom.css'
import '#src/globals.css'
import '#src/styles/soil-map.css'

const catamaran = Catamaran({
  subsets: ['latin'],
  variable: '--font-catamaran',
})

const App = ({ Component, pageProps }: AppProps) => (
  <>
    <Head>
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta
        name="description"
        content="SoilViz Pro - Interactive Soil Survey Platform for NRCS soil scientists"
      />
      <title>SoilViz Pro - Soil Survey Interactive Mapping</title>
    </Head>
    <main className={`${catamaran.variable} font-sans text-base`}>
      <Component {...pageProps} />
    </main>
  </>
)

export default App
