import React from 'react'
import { Loader2 } from 'lucide-react'

const Spinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
      <Loader2 className={`${sizes[size]} animate-spin text-blue-500`} />
      {text && <p className="text-sm">{text}</p>}
    </div>
  )
}

export default Spinner

