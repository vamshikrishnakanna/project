import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Filter, Grid, List, ChevronLeft, ChevronRight, Map as MapIcon } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { Link } from 'react-router-dom'
import IssueCard from '../components/common/IssueCard'
import Spinner from '../components/common/Spinner'
import ErrorMessage from '../components/common/ErrorMessage'
import EmptyState from '../components/common/EmptyState'
import { issueService } from '../services/issueService'
import { CATEGORIES, STATUSES, BENGALURU_CENTER, getComplaintId } from '../utils/constants'

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const PAGE_SIZE = 12

const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const [issues, setIssues] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [view, setView] = useState('grid')
  const [showMap, setShowMap] = useState(false)

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [status, setStatus] = useState(searchParams.get('status') || '')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const fetchIssues = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {
        page,
        limit: PAGE_SIZE,
        ...(search && { title: search }),
        ...(category && { category }),
        ...(status && { status }),
        sort: sort === 'newest' ? '-createdAt' : 'createdAt',
      }
      const res = await issueService.getIssues(params)
      setIssues(res.data?.issues || res.data || [])
      setTotal(res.data?.total || 0)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load issues.')
    } finally {
      setLoading(false)
    }
  }, [page, search, category, status, sort])

  useEffect(() => {
    fetchIssues()
  }, [fetchIssues])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
  }

  const handleFilterChange = (key, value) => {
    setPage(1)
    if (key === 'category') setCategory(value)
    if (key === 'status') setStatus(value)
    if (key === 'sort') setSort(value)
  }

  const issuesWithCoords = issues.filter(
    (i) => i.location?.coordinates?.length === 2
  )

  return (
    <div className="page-container py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Explore Issues</h1>
        <p className="text-gray-500 text-sm">Browse all civic complaints reported across the city</p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <select
            value={category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="input-field md:w-44"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="input-field md:w-44"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="input-field md:w-36"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
          <button type="submit" className="btn-primary">
            <Filter className="h-4 w-4" /> Apply
          </button>
        </form>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">
          {loading ? 'Loading...' : `${total} issue${total !== 1 ? 's' : ''} found`}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMap(!showMap)}
            className={`btn-secondary text-xs py-1.5 px-3 gap-1.5 ${showMap ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}
          >
            <MapIcon className="h-3.5 w-3.5" /> {showMap ? 'Hide Map' : 'Show Map'}
          </button>
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded-lg border transition-colors ${view === 'grid' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-lg border transition-colors ${view === 'list' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Map */}
      {showMap && (
        <div className="mb-6 rounded-xl overflow-hidden border border-gray-200">
          <MapContainer
            center={BENGALURU_CENTER}
            zoom={12}
            style={{ height: '380px', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {issuesWithCoords.map((issue) => (
              <Marker
                key={issue._id}
                position={[
                  issue.location.coordinates[1],
                  issue.location.coordinates[0],
                ]}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold text-slate-800 mb-1">{issue.title}</p>
                    <p className="text-xs text-gray-500 mb-2">{issue.category} · {issue.status}</p>
                    <Link to={`/issues/${issue._id}`} className="text-blue-600 text-xs hover:underline">
                      View Details →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <Spinner text="Fetching issues..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchIssues} />
      ) : issues.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No issues found"
          description="Try adjusting your filters or search term."
          action={
            <button
              onClick={() => { setSearch(''); setCategory(''); setStatus(''); setPage(1) }}
              className="btn-secondary text-sm"
            >
              Clear Filters
            </button>
          }
        />
      ) : (
        <>
          <div className={view === 'grid'
            ? 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
            : 'flex flex-col gap-3'
          }>
            {issues.map((issue) => (
              <IssueCard key={issue._id} issue={issue} view={view} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary py-2 px-3 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = i + 1
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary py-2 px-3 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ExplorePage
