import React from 'react'
import { STATUS_COLORS, CATEGORY_COLORS } from '../../utils/constants'

export const StatusBadge = ({ status }) => (
  <span className={`badge ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'}`}>
    {status}
  </span>
)

export const CategoryBadge = ({ category }) => (
  <span className={`badge ${CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-700'}`}>
    {category}
  </span>
)

