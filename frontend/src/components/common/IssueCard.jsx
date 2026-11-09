import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Calendar, ArrowRight } from 'lucide-react'
import { StatusBadge, CategoryBadge } from '../common/Badge'
import { formatDate, getComplaintId, truncate, CATEGORY_ICONS } from '../../utils/constants'

const IssueCard = ({ issue, view = 'grid' }) => {
  const icon = CATEGORY_ICONS[issue.category] || '⚠️'
  const location = issue.location?.area || issue.location?.city || 'Bengaluru'

  if (view === 'list') {
    return (
      <div className="card p-4 flex gap-4 items-start">
        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
          {issue.image?.url ? (
            <img src={issue.image.url} alt={issue.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">{icon}</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-gray-400 font-mono mb-0.5">{getComplaintId(issue)}</p>
              <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-1">{issue.title}</h3>
            </div>
            <StatusBadge status={issue.status} />
          </div>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{issue.description}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{location}</span>
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(issue.createdAt)}</span>
            <CategoryBadge category={issue.category} />
          </div>
        </div>
        <Link
          to={`/issues/${issue._id}`}
          className="flex-shrink-0 btn-secondary text-xs py-1.5 px-3 gap-1"
        >
          View <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden flex flex-col h-full">
      {/* Image */}
      <div className="relative h-44 bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
        {issue.image?.url ? (
          <img src={issue.image.url} alt={issue.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl opacity-30">{icon}</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <CategoryBadge category={issue.category} />
        </div>
        <div className="absolute top-3 right-3">
          <StatusBadge status={issue.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-gray-400 font-mono mb-1">{getComplaintId(issue)}</p>
        <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 mb-2">
          {issue.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">
          {truncate(issue.description, 90)}
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
          <span className="flex items-center gap-1 truncate">
            <MapPin className="h-3 w-3 flex-shrink-0" />{location}
          </span>
          <span className="flex items-center gap-1 flex-shrink-0">
            <Calendar className="h-3 w-3" />{formatDate(issue.createdAt)}
          </span>
        </div>
        <Link
          to={`/issues/${issue._id}`}
          className="btn-primary text-xs py-2 w-full justify-center"
        >
          View Details <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}

export default IssueCard

