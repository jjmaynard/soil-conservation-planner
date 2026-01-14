import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function RUSLE2() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to RUSLE-EOS
    router.replace('/tools/rusle-eos')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to RUSLE-EOS...</p>
      </div>
    </div>
  )
}
