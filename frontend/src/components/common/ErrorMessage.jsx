import React from 'react'
import { AlertCircle } from 'lucide-react'

const ErrorMessage = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
    <div className="p-3 bg-red-50 rounded-full">
      <AlertCircle className="h-8 w-8 text-red-500" />
    </div>
    <div>
      <p className="font-semibold text-slate-800">Something went wrong</p>
      <p className="text-sm text-gray-500 mt-1">{message}</p>
    </div>
    {onRetry && (
      <button onClick={onRetry} className="btn-secondary text-sm">
        Try Again
      </button>
    )}
  </div>
)

export default ErrorMessage

