// Loading Spinner Component

'use client'

interface LoadingSpinnerProps {
  message?: string
  className?: string
}

export default function LoadingSpinner({
  message = 'Loading...',
  className = '',
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center ${className}`}
    >
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700" />
      {message && (
        <p className="mt-4 text-sm text-gray-600">{message}</p>
      )}
    </div>
  )
}
