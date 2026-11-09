import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Lock, Mail, Shield, AlertCircle, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login(credentials)
      navigate('/admin')
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex p-3 bg-blue-100 rounded-2xl mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">Admin Sign In</h2>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to access the civic administrator control panel
          </p>
        </div>

        {/* Demo Credentials Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800">
          <p className="font-semibold mb-1">Demo Credentials:</p>
          <p>Email: <code className="font-mono font-bold">admin@civictrack.in</code></p>
          <p>Password: <code className="font-mono font-bold">Admin@123</code></p>
        </div>

        {/* Form */}
        <form className="card p-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                required
                value={credentials.email}
                onChange={(e) => setCredentials((p) => ({ ...p, email: e.target.value }))}
                placeholder="admin@civictrack.in"
                className="input-field pl-9"
              />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="password"
                required
                value={credentials.password}
                onChange={(e) => setCredentials((p) => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                className="input-field pl-9"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary justify-center py-3"
          >
            {loading ? 'Signing in...' : 'Sign In as Administrator'}
          </button>

          <div className="text-center pt-2">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Return to Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage

