import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Shield, Zap, Users, TrendingUp, CheckCircle } from 'lucide-react'
import { dashboardService } from '../services/issueService'
import { issueService } from '../services/issueService'
import IssueCard from '../components/common/IssueCard'
import Spinner from '../components/common/Spinner'
import { CATEGORY_ICONS, CATEGORIES } from '../utils/constants'

const StatCard = ({ label, value, color, icon }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
    <div>
      <p className="text-2xl font-bold text-slate-900">{value ?? '--'}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
)

const HOW_IT_WORKS = [
  { step: '01', title: 'Report the Issue', desc: 'Fill out a simple form with the issue details, category and location using our interactive map.', icon: '📝' },
  { step: '02', title: 'Duplicate Detection', desc: 'Our system instantly checks if the same issue has already been reported nearby using AI-powered matching.', icon: '🔍' },
  { step: '03', title: 'Community Action', desc: 'Authorities are notified and citizens track the resolution progress from Reported to Resolved.', icon: '✅' },
]

const BENEFITS = [
  { title: 'Reduces Duplicate Reports', desc: 'Citizens avoid filing repeat complaints for the same issue, saving civic time and resources.' },
  { title: 'Faster Resolution', desc: 'Consolidated reports get priority attention from municipal authorities.' },
  { title: 'Community Awareness', desc: 'Everyone can see existing issues in their area before reporting.' },
  { title: 'Data-Driven Insights', desc: 'Authorities use dashboard analytics to prioritize high-impact areas.' },
]

const HomePage = () => {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardService.getStats(),
      dashboardService.getRecent(),
    ])
      .then(([statsRes, recentRes]) => {
        setStats(statsRes.data.stats)
        setRecent(recentRes.data.issues?.slice(0, 4) || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="page-container py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Zap className="h-3.5 w-3.5" /> Smart Duplicate Detection Powered by AI
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-5">
              Better Communities Start With{' '}
              <span className="text-blue-600">Better Reporting.</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-2xl">
              Report public issues, identify existing complaints and help your community resolve problems faster. Our intelligent system detects duplicate reports automatically.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/report" className="btn-primary text-base px-6 py-3">
                Report an Issue <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/explore" className="btn-secondary text-base px-6 py-3">
                Explore Reported Issues <MapPin className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="page-container py-12">
        {loading ? (
          <Spinner text="Loading statistics..." />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Reports" value={stats?.total} color="bg-blue-50" icon={<TrendingUp className="h-5 w-5 text-blue-600" />} />
            <StatCard label="Pending" value={stats?.pending} color="bg-yellow-50" icon={<MapPin className="h-5 w-5 text-yellow-600" />} />
            <StatCard label="In Progress" value={stats?.inProgress} color="bg-orange-50" icon={<Zap className="h-5 w-5 text-orange-600" />} />
            <StatCard label="Resolved" value={stats?.resolved} color="bg-green-50" icon={<CheckCircle className="h-5 w-5 text-green-600" />} />
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="bg-white border-y border-gray-100 py-16">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="section-title">How CivicTrack Works</h2>
            <p className="section-subtitle">Three simple steps to better civic engagement</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="card p-6">
                <div className="text-3xl mb-4">{item.icon}</div>
                <div className="text-xs font-bold text-blue-500 mb-2">STEP {item.step}</div>
                <h3 className="font-semibold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Issue Categories */}
      <section className="page-container py-16">
        <div className="mb-10">
          <h2 className="section-title">Issue Categories</h2>
          <p className="section-subtitle">We track 8 types of civic issues</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={`/explore?category=${cat}`}
              className="card p-5 flex flex-col items-center text-center hover:border-blue-200 hover:bg-blue-50 transition-colors group"
            >
              <span className="text-3xl mb-3">{CATEGORY_ICONS[cat]}</span>
              <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">{cat}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Complaints */}
      <section className="bg-white border-y border-gray-100 py-16">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Recent Complaints</h2>
              <p className="section-subtitle">Latest issues reported by the community</p>
            </div>
            <Link to="/explore" className="btn-secondary text-sm gap-1.5">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {loading ? (
            <Spinner />
          ) : recent.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No complaints yet. Be the first to report!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recent.map((issue) => (
                <IssueCard key={issue._id} issue={issue} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Duplicate Detection Benefits */}
      <section className="page-container py-16">
        <div className="mb-10 max-w-2xl">
          <h2 className="section-title">Why Duplicate Detection Matters</h2>
          <p className="section-subtitle">Our intelligent system saves time and improves civic response</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {BENEFITS.map((b) => (
            <div key={b.title} className="flex gap-4">
              <div className="flex-shrink-0 p-2 bg-green-50 rounded-lg h-fit">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-sm mb-1">{b.title}</h3>
                <p className="text-sm text-gray-500">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default HomePage
