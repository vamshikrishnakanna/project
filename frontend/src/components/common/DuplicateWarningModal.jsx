import React from 'react'
import { AlertTriangle, X, Eye, ChevronRight, MapPin, Calendar, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatusBadge, CategoryBadge } from '../common/Badge'
import { formatDate, formatDistance, getComplaintId } from '../../utils/constants'

const DuplicateWarningModal = ({ duplicates, onContinue, onClose }) => {
  const primary = duplicates[0]
  const issue = primary?.issue

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-orange-50 border-b border-orange-100 p-6 rounded-t-2xl">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-orange-100 rounded-xl flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-orange-900">
                Possible Duplicate Issue Found!
              </h2>
              <p className="text-sm text-orange-700 mt-1">
                An issue similar to your report has already been reported nearby.
                Please review the existing complaint before submitting.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-orange-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-orange-600" />
            </button>
          </div>
        </div>

        {/* Duplicate issues list */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 font-medium">
            {duplicates.length} similar complaint{duplicates.length > 1 ? 's' : ''} found:
          </p>

          {duplicates.slice(0, 3).map(({ issue: dup, scores, distance }, idx) => (
            <div key={dup._id} className="border border-orange-200 rounded-xl overflow-hidden">
              {/* Score bar */}
              <div className="bg-orange-50 px-4 py-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-orange-700">
                  {idx + 1}. Match #{getComplaintId(dup)}
                </span>
                <div className="flex items-center gap-3 text-xs text-orange-600">
                  <span className="bg-orange-100 px-2 py-0.5 rounded-full font-bold">
                    {scores.combined}% match
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {formatDistance(distance)} away
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-semibold text-slate-800 text-sm">{dup.title}</h3>
                  <StatusBadge status={dup.status} />
                </div>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{dup.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    <CategoryBadge category={dup.category} />
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(dup.createdAt)}
                  </div>
                  <div className="flex items-center gap-1 col-span-2">
                    <MapPin className="h-3 w-3" />
                    {dup.location?.address || dup.location?.area || 'Bengaluru'}
                  </div>
                </div>

                {/* Score breakdown */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-2">Match breakdown:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Category', score: scores.category, weight: '30%' },
                      { label: 'Location', score: scores.geo, weight: '40%' },
                      { label: 'Description', score: scores.text, weight: '30%' },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <div className="text-xs text-gray-400">{s.label}</div>
                        <div className={`text-sm font-bold mt-0.5 ${
                          s.score >= 70 ? 'text-orange-600' : 'text-gray-600'
                        }`}>
                          {s.score}%
                        </div>
                        <div className="text-xs text-gray-400">{s.weight} weight</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-100 p-6 flex flex-col sm:flex-row gap-3">
          <Link
            to={`/issues/${issue?._id}`}
            target="_blank"
            className="flex-1 btn-secondary justify-center gap-2"
          >
            <Eye className="h-4 w-4" /> View Existing Complaint
          </Link>
          <button
            onClick={onContinue}
            className="flex-1 btn-primary justify-center gap-2 bg-orange-600 hover:bg-orange-700"
          >
            Continue Anyway <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default DuplicateWarningModal

