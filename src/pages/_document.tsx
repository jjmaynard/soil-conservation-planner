import { Head, Html, Main, NextScript } from 'next/document'

const Document = () => (
  <Html lang="en">
    <Head>
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="alternate icon" href="/favicon.ico" />
    </Head>
    <body className="bg-white">
      <Main />
      <NextScript />
    </body>
  </Html>
)

export default Document
