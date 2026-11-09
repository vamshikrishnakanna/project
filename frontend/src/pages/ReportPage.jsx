import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Send, Upload, X, MapPin, AlertCircle, ChevronRight, Check, Compass } from 'lucide-react'
import LocationPicker from '../components/common/LocationPicker'
import DuplicateWarningModal from '../components/common/DuplicateWarningModal'
import Spinner from '../components/common/Spinner'
import { issueService } from '../services/issueService'
import { CATEGORIES } from '../utils/constants'

const initialForm = {
  title: '',
  description: '',
  category: '',
  area: '',
  city: 'Bengaluru',
  latitude: '',
  longitude: '',
  reporterName: '',
  reporterContact: '',
}

const ReportPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fileRef = useRef(null)

  const [form, setForm] = useState(() => ({
    ...initialForm,
    category: searchParams.get('category') || '',
  }))
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [duplicates, setDuplicates] = useState(null)
  const [pendingFormData, setPendingFormData] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [geocoding, setGeocoding] = useState(false)

  // Update category if URL search param changes
  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat && CATEGORIES.includes(cat)) {
      setForm((prev) => ({ ...prev, category: cat }))
    }
  }, [searchParams])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleLocationSelect = async (lat, lng) => {
    setForm((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    }))
    if (errors.location) setErrors((prev) => ({ ...prev, location: '' }))

    // Reverse-geocode to auto-fill area if empty
    try {
      setGeocoding(true)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      )
      if (res.ok) {
        const data = await res.json()
        const detectedArea =
          data.address?.suburb ||
          data.address?.neighbourhood ||
          data.address?.residential ||
          data.address?.road ||
          ''
        if (detectedArea && !form.area) {
          setForm((prev) => ({ ...prev, area: detectedArea }))
        }
      }
    } catch {
      // Ignore geocode network errors
    } finally {
      setGeocoding(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required (min 5 characters).'
    else if (form.title.trim().length < 5) errs.title = 'Title must be at least 5 characters.'

    if (!form.description.trim()) errs.description = 'Description is required (min 10 characters).'
    else if (form.description.trim().length < 10) errs.description = 'Description must be at least 10 characters.'

    if (!form.category) errs.category = 'Please select an issue category.'
    if (!form.latitude || !form.longitude) errs.location = 'Please tap or click the map to set the exact issue location.'
    return errs
  }

  const buildFormData = (forceSubmit = false) => {
    const fd = new FormData()
    fd.append('title', form.title.trim())
    fd.append('description', form.description.trim())
    fd.append('category', form.category)
    fd.append('area', form.area.trim())
    fd.append('city', form.city.trim() || 'Bengaluru')
    fd.append('latitude', form.latitude)
    fd.append('longitude', form.longitude)
    if (form.reporterName) fd.append('reporterName', form.reporterName.trim())
    if (form.reporterContact) fd.append('reporterContact', form.reporterContact.trim())
    if (image) fd.append('image', image)
    if (forceSubmit) fd.append('forceSubmit', 'true')
    return fd
  }

  const submit = async (fd) => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await issueService.createIssue(fd)
      if (res.data?.isDuplicate && res.data?.duplicates?.length > 0) {
        setDuplicates(res.data.duplicates)
        setPendingFormData(fd)
        setSubmitting(false)
        return
      }
      const id = res.data?.issue?._id || res.data?._id
      navigate(`/issues/${id}`)
    } catch (err) {
      setSubmitError(err?.response?.data?.message || err?.message || 'Submission failed. Please try again.')
      setSubmitting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      window.scrollTo({ top: 100, behavior: 'smooth' })
      return
    }
    await submit(buildFormData(false))
  }

  const handleForceSubmit = async () => {
    setDuplicates(null)
    const fd = buildFormData(true)
    await submit(fd)
  }

  const FieldError = ({ field }) =>
    errors[field] ? (
      <p className="mt-1 text-xs text-red-500 flex items-center gap-1 font-medium">
        <AlertCircle className="h-3 w-3 flex-shrink-0" /> {errors[field]}
      </p>
    ) : null

  return (
    <div className="page-container py-8 max-w-3xl">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4">
        <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <Link to="/explore" className="hover:text-blue-600 transition-colors">Issues</Link>
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <span className="text-slate-900 font-semibold">Report Complaint</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">Report a Public Issue</h1>
        <p className="text-sm text-slate-500">
          Submit civic complaints directly to municipal authorities with smart duplicate detection.
        </p>
      </div>

      {/* Stepper Indicator */}
      <div className="grid grid-cols-3 gap-2 mb-8 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold text-center">
        <div className="bg-white text-blue-700 py-1.5 px-2 rounded-lg shadow-xs flex items-center justify-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
          Issue Info
        </div>
        <div className="text-slate-600 py-1.5 px-2 flex items-center justify-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[10px]">2</span>
          Location Pin
        </div>
        <div className="text-slate-600 py-1.5 px-2 flex items-center justify-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[10px]">3</span>
          Review & Send
        </div>
      </div>

      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" /> {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Issue Details */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="font-semibold text-slate-800 text-base">1. What is the Problem?</h2>
            <span className="text-xs text-slate-400 font-normal">* Required fields</span>
          </div>

          <div>
            <label className="label">Issue Title <span className="text-red-500">*</span></label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Deep pothole on 100 Feet Road"
              className={`input-field ${errors.title ? 'input-error' : ''}`}
              maxLength={150}
            />
            <FieldError field="title" />
          </div>

          <div>
            <label className="label">Category <span className="text-red-500">*</span></label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={`input-field ${errors.category ? 'input-error' : ''}`}
            >
              <option value="">Select a category...</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <FieldError field="category" />
          </div>

          <div>
            <label className="label">Description <span className="text-red-500">*</span></label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe what is broken, approximate dimensions, and hazards to drivers or pedestrians..."
              className={`input-field resize-none ${errors.description ? 'input-error' : ''}`}
            />
            <FieldError field="description" />
          </div>
        </div>

        {/* Step 2: Location Map */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="font-semibold text-slate-800 text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" /> 2. Where is it Located?
            </h2>
            {geocoding && (
              <span className="text-xs text-blue-600 animate-pulse">Detecting locality...</span>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Area / Locality</label>
              <input
                name="area"
                value={form.area}
                onChange={handleChange}
                placeholder="e.g. Indiranagar, Koramangala"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">City</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          {/* Interactive Map Picker with GPS */}
          <div>
            <label className="label mb-2">Pinpoint Exact Location on Map <span className="text-red-500">*</span></label>
            <LocationPicker
              lat={form.latitude ? parseFloat(form.latitude) : null}
              lng={form.longitude ? parseFloat(form.longitude) : null}
              onLocationSelect={handleLocationSelect}
            />
            <FieldError field="location" />
          </div>
        </div>

        {/* Step 3: Photo & Reporter (Optional) */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-slate-800 text-base border-b border-gray-100 pb-3 flex items-center gap-2">
            <Upload className="h-4 w-4 text-blue-600" /> 3. Photo & Contact (Optional)
          </h2>

          {imagePreview ? (
            <div className="relative w-full max-w-sm">
              <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-xl border border-gray-200" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                title="Remove photo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl p-6 text-center cursor-pointer transition-colors"
            >
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">Click to upload issue photo</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP up to 5MB</p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />

          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="label">Your Name (Optional)</label>
              <input
                name="reporterName"
                value={form.reporterName}
                onChange={handleChange}
                placeholder="Leave blank for Anonymous"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Contact / Phone / Email (Optional)</label>
              <input
                name="reporterContact"
                value={form.reporterContact}
                onChange={handleChange}
                placeholder="For status SMS or updates"
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs text-gray-400 text-center sm:text-left">
            🔒 CivicTrack will check for existing complaints nearby before publishing.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full sm:w-auto px-8 py-3 text-sm justify-center shadow-md shadow-blue-500/20"
          >
            {submitting ? (
              <>
                <Spinner size="sm" text="" /> Checking Duplicates & Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" /> Submit Complaint
              </>
            )}
          </button>
        </div>
      </form>

      {/* Duplicate Warning Modal */}
      {duplicates && (
        <DuplicateWarningModal
          duplicates={duplicates}
          onContinue={handleForceSubmit}
          onClose={() => setDuplicates(null)}
        />
      )}
    </div>
  )
}

export default ReportPage
