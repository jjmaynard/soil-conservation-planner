// Loading Spinner Component

'use client'

interface LoadingSpinnerProps {
  message?: string
  className?: string
}

export default function LoadingSpinner({ message = 'Loading...', className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="border-green-700 h-12 w-12 animate-spin rounded-full border-b-2" />
      {message && <p className="text-gray-600 mt-4 text-sm">{message}</p>}
    </div>
  )
}
