import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Mail, Phone, Github } from 'lucide-react'

const Footer = () => (
  <footer className="bg-slate-900 text-gray-300 mt-20">
    <div className="page-container py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg">
              Civic<span className="text-blue-400">Track</span>
            </span>
          </div>
          <p className="text-sm leading-relaxed text-gray-400 max-w-sm">
            A smart civic complaint platform that helps citizens report public issues and detect duplicate complaints using intelligent matching algorithms.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Navigation</h4>
          <ul className="space-y-2 text-sm">
            {[
              { to: '/', label: 'Home' },
              { to: '/explore', label: 'Explore Issues' },
              { to: '/report', label: 'Report Issue' },
              { to: '/dashboard', label: 'Dashboard' },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-white transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-400 flex-shrink-0" />
              <span>support@civictrack.in</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-400 flex-shrink-0" />
              <span>1800-CIVIC-01</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-400 flex-shrink-0" />
              <span>Bengaluru, Karnataka</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <p>© 2026 CivicTrack. All rights reserved.</p>
        <p>Built for better communities 🏙️</p>
      </div>
    </div>
  </footer>
)

export default Footer

