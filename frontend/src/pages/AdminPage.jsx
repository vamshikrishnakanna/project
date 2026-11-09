import React, { useState, useEffect, useCallback } from 'react'
import {
  Search, Trash2, CheckCircle, Clock, AlertCircle,
  ChevronLeft, ChevronRight, Filter, ShieldAlert, AlertTriangle
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { issueService } from '../services/issueService'
import Spinner from '../components/common/Spinner'
import ErrorMessage from '../components/common/ErrorMessage'
import { StatusBadge, CategoryBadge } from '../components/common/Badge'
import { CATEGORIES, STATUSES, formatDate, getComplaintId } from '../utils/constants'

const AdminPage = () => {
  const [issues, setIssues] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionSuccess, setActionSuccess] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    status: 'All',
    page: 1,
  })

  const fetchIssues = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {
        page: filters.page,
        limit: 15,
        sortBy: 'createdAt',
        order: 'desc',
      }
      if (filters.search) params.search = filters.search
      if (filters.category !== 'All') params.category = filters.category
      if (filters.status !== 'All') params.status = filters.status

      const res = await issueService.getIssues(params)
      setIssues(res.data.issues)
      setPagination(res.data.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchIssues()
  }, [fetchIssues])

  const handleStatusChange = async (issueId, newStatus) => {
    setUpdatingId(issueId)
    try {
      await issueService.updateStatus(issueId, newStatus)
      setIssues((prev) =>
        prev.map((iss) => (iss._id === issueId ? { ...iss, status: newStatus } : iss))
      )
      showNotification(`Status updated to ${newStatus}`)
    } catch (err) {
      alert(`Failed to update status: ${err.message}`)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (issueId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return
    setDeletingId(issueId)
    try {
      await issueService.deleteIssue(issueId)
      setIssues((prev) => prev.filter((iss) => iss._id !== issueId))
      showNotification('Issue deleted successfully')
    } catch (err) {
      alert(`Failed to delete issue: ${err.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  const showNotification = (msg) => {
    setActionSuccess(msg)
    setTimeout(() => setActionSuccess(null), 3500)
  }

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Admin Complaint Management</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage reports, update statuses, and review duplicate complaints
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge bg-blue-50 text-blue-700 border border-blue-200">
            {pagination.total} Total Issues
          </span>
        </div>
      </div>

      {/* Action Notification */}
      {actionSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle className="h-4 w-4" /> {actionSuccess}
        </div>
      )}

      {/* Filters Bar */}
      <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, location..."
            value={filters.search}
            onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value, page: 1 }))}
            className="input-field pl-9"
          />
        </div>
        <select
          value={filters.category}
          onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value, page: 1 }))}
          className="input-field w-auto"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value, page: 1 }))}
          className="input-field w-auto"
        >
          <option value="All">All Statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Issues Table */}
      {loading ? (
        <Spinner text="Loading complaints..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchIssues} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Title & Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {issues.map((issue) => (
                  <tr key={issue._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-gray-400">
                      {getComplaintId(issue)}
                      {issue.isDuplicate && (
                        <span className="block mt-1 text-xs text-orange-600 font-sans font-semibold">
                          ⚠️ Duplicate
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <Link
                        to={`/issues/${issue._id}`}
                        className="font-medium text-slate-800 hover:text-blue-600 line-clamp-1"
                      >
                        {issue.title}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                        Reporter: {issue.reporter?.name || 'Anonymous'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <CategoryBadge category={issue.category} />
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">
                      {issue.location?.area || 'Bengaluru'}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={issue.status}
                        disabled={updatingId === issue._id}
                        onChange={(e) => handleStatusChange(issue._id, e.target.value)}
                        className="text-xs font-medium border border-gray-200 rounded-lg px-2.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-400">
                      {formatDate(issue.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(issue._id, issue.title)}
                        disabled={deletingId === issue._id}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                        title="Delete complaint"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                Page {pagination.page} of {pagination.pages} ({pagination.total} issues)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
                  disabled={filters.page === 1}
                  className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Previous
                </button>
                <button
                  onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
                  disabled={filters.page === pagination.pages}
                  className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminPage

