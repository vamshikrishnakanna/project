import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const NotFoundPage = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
    <div className="text-8xl font-black text-blue-100 mb-4 select-none">404</div>
    <h1 className="text-2xl font-bold text-slate-800 mb-2">Page Not Found</h1>
    <p className="text-gray-500 mb-8 max-w-sm">
      The civic page or complaint report you are looking for doesn't exist or has been moved.
    </p>
    <Link to="/" className="btn-primary gap-2">
      <ArrowLeft className="h-4 w-4" /> Return to Home
    </Link>
  </div>
)

export default NotFoundPage

