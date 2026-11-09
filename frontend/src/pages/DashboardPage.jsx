import React, { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { TrendingUp, AlertCircle, Clock, CheckCircle, Copy, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { dashboardService } from '../services/issueService'
import Spinner from '../components/common/Spinner'
import ErrorMessage from '../components/common/ErrorMessage'
import { StatusBadge, CategoryBadge } from '../components/common/Badge'
import { formatDate, getComplaintId } from '../utils/constants'

const COLORS = ['#2563eb', '#16a34a', '#ea580c', '#eab308', '#06b6d4', '#8b5cf6', '#ec4899', '#6b7280']

const StatCard = ({ title, value, icon, color, subtext }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-medium text-gray-500">{title}</span>
      <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
    </div>
    <div className="text-3xl font-bold text-slate-900">{value ?? '--'}</div>
    {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
  </div>
)

const DashboardPage = () => {
  const [stats, setStats] = useState(null)
  const [categories, setCategories] = useState([])
  const [statuses, setStatuses] = useState([])
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      dashboardService.getStats(),
      dashboardService.getCategoryStats(),
      dashboardService.getStatusDistribution(),
      dashboardService.getRecent(),
    ])
      .then(([statsRes, catRes, statusRes, recentRes]) => {
        setStats(statsRes.data.stats)
        setCategories(catRes.data.categories)
        setStatuses(statusRes.data.statuses)
        setRecent(recentRes.data.issues || [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page-container py-16"><Spinner text="Loading dashboard data..." /></div>
  if (error) return <div className="page-container py-16"><ErrorMessage message={error} /></div>

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Civic Analytics Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time statistics and insights from Bengaluru complaints</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="Total Reports"
          value={stats?.total}
          icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
          color="bg-blue-50"
          subtext="All reported issues"
        />
        <StatCard
          title="Pending"
          value={stats?.pending}
          icon={<AlertCircle className="h-5 w-5 text-yellow-600" />}
          color="bg-yellow-50"
          subtext="Awaiting review"
        />
        <StatCard
          title="In Progress"
          value={stats?.inProgress}
          icon={<Clock className="h-5 w-5 text-orange-600" />}
          color="bg-orange-50"
          subtext="Action being taken"
        />
        <StatCard
          title="Resolved"
          value={stats?.resolved}
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
          color="bg-green-50"
          subtext="Completed cases"
        />
        <StatCard
          title="Duplicates Flagged"
          value={stats?.possibleDuplicates}
          icon={<Copy className="h-5 w-5 text-purple-600" />}
          color="bg-purple-50"
          subtext="Caught by AI detection"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Category breakdown (Bar) */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 mb-1">Reports by Category</h2>
          <p className="text-xs text-gray-400 mb-6">Distribution across issue types</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories} margin={{ top: 5, right: 10, left: -20, bottom: 40 }}>
                <XAxis
                  dataKey="name"
                  angle={-35}
                  textAnchor="end"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status breakdown (Pie) */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 mb-1">Reports by Status</h2>
          <p className="text-xs text-gray-400 mb-6">Current lifecycle of complaints</p>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statuses}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={3}
                >
                  {statuses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend
                  formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent complaints table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Recent Complaints</h2>
            <p className="text-xs text-gray-400">Latest 10 reports received</p>
          </div>
          <Link to="/explore" className="btn-secondary text-xs py-1.5 px-3 gap-1">
            View All <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recent.map((issue) => (
                <tr key={issue._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-gray-400">
                    {getComplaintId(issue)}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800 max-w-xs truncate">
                    {issue.title}
                  </td>
                  <td className="py-3 px-4">
                    <CategoryBadge category={issue.category} />
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">
                    {issue.location?.area || 'Bengaluru'}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={issue.status} />
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400">
                    {formatDate(issue.createdAt)}
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      to={`/issues/${issue._id}`}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage

