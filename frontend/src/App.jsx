import React from 'react'
import { Routes, Route, Navigate, Outlet, Link, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Spinner from './components/common/Spinner'

import HomePage from './pages/HomePage'
import ExplorePage from './pages/ExplorePage'
import ReportPage from './pages/ReportPage'
import IssueDetailPage from './pages/IssueDetailPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'

// Layout wrapper
const Layout = () => {
  const location = useLocation()
  const isReportPage = location.pathname === '/report'

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 relative">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

      {/* Persistent Mobile Quick Report FAB */}
      {!isReportPage && (
        <Link
          to="/report"
          className="md:hidden fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs py-3 px-4 rounded-full shadow-xl flex items-center gap-2 transition-all transform active:scale-95 border-2 border-white/20"
          aria-label="Report an issue"
        >
          <span className="text-sm font-bold">➕</span>
          <span>Report Issue</span>
        </Link>
      )}
    </div>
  )
}

// Protected admin route
const AdminRoute = () => {
  const { user, loading, isAdmin } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>
  if (!user || !isAdmin) return <Navigate to="/login" replace />
  return <Outlet />
}

const App = () => (
  <AuthProvider>
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/issues/:id" element={<IssueDetailPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  </AuthProvider>
)

export default App
