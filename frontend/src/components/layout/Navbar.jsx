import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { MapPin, Menu, X, LogOut, Shield, Search, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [trackQuery, setTrackQuery] = useState('')

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleTrackSubmit = (e) => {
    e.preventDefault()
    const q = trackQuery.trim()
    if (!q) return

    // If matches MongoDB ObjectId format directly
    if (/^[0-9a-fA-F]{24}$/.test(q)) {
      navigate(`/issues/${q}`)
    } else {
      // Navigate to explore with search query
      navigate(`/explore?search=${encodeURIComponent(q)}`)
    }
    setTrackQuery('')
    setMenuOpen(false)
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/explore', label: 'Explore Issues' },
    { to: '/report', label: 'Report Issue' },
    { to: '/dashboard', label: 'Dashboard' },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin Panel' }] : []),
  ]

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="page-container">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="p-1.5 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors shadow-sm">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">
              Civic<span className="text-blue-600">Track</span>
            </span>
          </Link>

          {/* Quick Track Input (Desktop) */}
          <form
            onSubmit={handleTrackSubmit}
            className="hidden lg:flex items-center relative max-w-xs w-full"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              value={trackQuery}
              onChange={(e) => setTrackQuery(e.target.value)}
              placeholder="Track complaint ID or keyword..."
              className="w-full pl-8 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
            />
            {trackQuery && (
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-blue-600 hover:text-blue-800"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </form>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                      <Shield className="h-3 w-3" /> Admin
                    </span>
                  )}
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-secondary text-xs py-1.5 px-3 gap-1.5"
                >
                  <LogOut className="h-3.5 w-3.5" /> Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-xs py-2 px-3.5">
                Admin Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-2">
            {/* Mobile Tracker */}
            <form onSubmit={handleTrackSubmit} className="px-1 mb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  placeholder="Track complaint ID or keyword..."
                  className="w-full pl-8 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </form>

            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="pt-2 border-t border-gray-100">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" /> Logout ({user.name})
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  Admin Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
