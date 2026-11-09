import React from 'react'

const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
    {icon && <div className="text-5xl">{icon}</div>}
    <div>
      <p className="font-semibold text-slate-800 text-lg">{title}</p>
      {description && <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">{description}</p>}
    </div>
    {action}
  </div>
)

export default EmptyState

