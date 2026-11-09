import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import {
  ArrowLeft, MapPin, Calendar, Tag, Hash, CheckCircle2,
  Clock, AlertCircle, Wrench, ChevronRight
} from 'lucide-react'
import { StatusBadge, CategoryBadge } from '../components/common/Badge'
import IssueCard from '../components/common/IssueCard'
import Spinner from '../components/common/Spinner'
import ErrorMessage from '../components/common/ErrorMessage'
import { issueService } from '../services/issueService'
import {
  STATUSES, BENGALURU_CENTER, formatDate, getComplaintId, CATEGORY_ICONS
} from '../utils/constants'

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const statusIcons = {
  'Reported': AlertCircle,
  'Under Review': Clock,
  'In Progress': Wrench,
  'Resolved': CheckCircle2,
}

const statusColors = {
  'Reported': 'text-yellow-500 bg-yellow-50 border-yellow-200',
  'Under Review': 'text-blue-500 bg-blue-50 border-blue-200',
  'In Progress': 'text-orange-500 bg-orange-50 border-orange-200',
  'Resolved': 'text-green-500 bg-green-50 border-green-200',
}

const StatusTimeline = ({ current }) => {
  const currentIdx = STATUSES.indexOf(current)
  return (
    <div className="flex items-center gap-0">
      {STATUSES.map((s, i) => {
        const Icon = statusIcons[s]
        const done = i <= currentIdx
        const active = i === currentIdx
        return (
          <React.Fragment key={s}>
            <div className={`flex flex-col items-center gap-1.5 ${active ? 'scale-110' : ''} transition-transform`}>
              <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-colors ${
                done
                  ? active
                    ? `${statusColors[s]} border-current`
                    : 'bg-green-100 border-green-300 text-green-600'
                  : 'bg-gray-100 border-gray-200 text-gray-400'
              }`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${done ? 'text-slate-700' : 'text-gray-400'}`}>
                {s}
              </span>
            </div>
            {i < STATUSES.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-5 rounded-full transition-colors ${i < currentIdx ? 'bg-green-300' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

const IssueDetailPage = () => {
  const { id } = useParams()
  const [issue, setIssue] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchIssue = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await issueService.getIssue(id)
        const data = res.data?.issue || res.data
        setIssue(data)
        setRelated(res.data?.related || [])
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load issue details.')
      } finally {
        setLoading(false)
      }
    }
    fetchIssue()
  }, [id])

  if (loading) return <div className="page-container py-16"><Spinner text="Loading issue..." /></div>
  if (error) return <div className="page-container py-16"><ErrorMessage message={error} /></div>
  if (!issue) return null

  const coords = issue.location?.coordinates
  const hasCoords = Array.isArray(coords) && coords.length === 2
  const mapCenter = hasCoords ? [coords[1], coords[0]] : BENGALURU_CENTER
  const icon = CATEGORY_ICONS[issue.category] || '⚠️'
  const location = [issue.location?.area, issue.location?.city].filter(Boolean).join(', ') || 'Bengaluru'

  return (
    <div className="page-container py-8 max-w-4xl">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4">
        <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <Link to="/explore" className="hover:text-blue-600 transition-colors">Explore</Link>
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <Link to={`/explore?category=${encodeURIComponent(issue.category)}`} className="hover:text-blue-600 transition-colors">
          {issue.category}
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <span className="text-slate-900 font-semibold font-mono">{getComplaintId(issue)}</span>
      </nav>

      {/* Back button */}
      <Link to="/explore" className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-blue-600 mb-5 group transition-colors">
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" /> Back to Explore Issues
      </Link>

      {/* Header Card */}
      <div className="card overflow-hidden mb-6">
        {/* Image */}
        {issue.image?.url ? (
          <div className="h-64 bg-gray-100 overflow-hidden">
            <img src={issue.image.url} alt={issue.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
            <span className="text-6xl opacity-40">{icon}</span>
          </div>
        )}

        <div className="p-6">
          {/* ID + badges */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
              <Hash className="h-3 w-3" /> {getComplaintId(issue)}
            </span>
            <CategoryBadge category={issue.category} />
            <StatusBadge status={issue.status} />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-4">{issue.title}</h1>

          {/* Meta */}
          <div className="flex flex-wrap gap-5 text-sm text-gray-500 mb-6">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-blue-500" /> {location}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-blue-500" /> Reported on {formatDate(issue.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-blue-500" /> {issue.category}
            </span>
          </div>

          {/* Description */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-700 leading-relaxed">{issue.description}</p>
          </div>

          {/* Timeline */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Resolution Status</p>
            <StatusTimeline current={issue.status} />
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="card overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-500" /> Issue Location
          </h2>
        </div>
        <MapContainer
          center={mapCenter}
          zoom={15}
          style={{ height: '300px', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {hasCoords && (
            <Marker position={mapCenter}>
              <Popup>
                <strong>{issue.title}</strong><br />
                {location}
              </Popup>
            </Marker>
          )}
        </MapContainer>
        {!hasCoords && (
          <div className="bg-blue-50 border-t border-blue-100 px-4 py-2 text-xs text-blue-600">
            📍 Exact GPS coordinates not available for this issue
          </div>
        )}
      </div>

      {/* Related Issues */}
      {related.length > 0 && (
        <div>
          <h2 className="section-title mb-5">Related Complaints</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {related.map((rel) => (
              <IssueCard key={rel._id} issue={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default IssueDetailPage
