import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Upload, X, MapPin, AlertCircle } from 'lucide-react'
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
  const fileRef = useRef(null)

  const [form, setForm] = useState(initialForm)
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [duplicates, setDuplicates] = useState(null)
  const [pendingFormData, setPendingFormData] = useState(null)
  const [submitError, setSubmitError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleLocationSelect = (lat, lng) => {
    setForm((prev) => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }))
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
    if (!form.title.trim()) errs.title = 'Title is required.'
    if (!form.description.trim()) errs.description = 'Description is required.'
    if (!form.category) errs.category = 'Please select a category.'
    if (!form.latitude || !form.longitude) errs.location = 'Please click on the map to set the issue location.'
    return errs
  }

  const buildFormData = (forceSubmit = false) => {
    const fd = new FormData()
    fd.append('title', form.title.trim())
    fd.append('description', form.description.trim())
    fd.append('category', form.category)
    fd.append('area', form.area.trim())
    fd.append('city', form.city.trim())
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
      setSubmitError(err?.response?.data?.message || 'Submission failed. Please try again.')
      setSubmitting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
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
      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
        <AlertCircle className="h-3 w-3" /> {errors[field]}
      </p>
    ) : null

  return (
    <div className="page-container py-10 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Report an Issue</h1>
        <p className="text-sm text-gray-500">
          Help improve your city by reporting civic issues. Our AI detects duplicates automatically.
        </p>
      </div>

      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" /> {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-slate-800 text-base border-b border-gray-100 pb-3">Issue Details</h2>

          <div>
            <label className="label">Title <span className="text-red-500">*</span></label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Large pothole on 100 Feet Road"
              className={`input-field ${errors.title ? 'input-error' : ''}`}
              maxLength={150}
            />
            <FieldError field="title" />
          </div>

          <div>
            <label className="label">Description <span className="text-red-500">*</span></label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the issue in detail — size, severity, impact on residents..."
              className={`input-field resize-none ${errors.description ? 'input-error' : ''}`}
            />
            <FieldError field="description" />
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
        </div>

        {/* Location */}
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-slate-800 text-base border-b border-gray-100 pb-3">
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-600" /> Location</span>
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Area / Locality</label>
              <input
                name="area"
                value={form.area}
                onChange={handleChange}
                placeholder="e.g. Koramangala, HSR Layout"
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

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Latitude (from map click)</label>
              <input
                value={form.latitude}
                readOnly
                placeholder="Click map to populate"
                className="input-field bg-gray-50 cursor-not-allowed text-gray-500"
              />
            </div>
            <div>
              <label className="label">Longitude (from map click)</label>
              <input
                value={form.longitude}
                readOnly
                placeholder="Click map to populate"
                className="input-field bg-gray-50 cursor-not-allowed text-gray-500"
              />
            </div>
          </div>

          <LocationPicker
            lat={form.latitude ? parseFloat(form.latitude) : null}
            lng={form.longitude ? parseFloat(form.longitude) : null}
            onLocationSelect={handleLocationSelect}
          />
          <FieldError field="location" />
        </div>

        {/* Image Upload */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-slate-800 text-base border-b border-gray-100 pb-3">
            <span className="flex items-center gap-2"><Upload className="h-4 w-4 text-blue-600" /> Photo (Optional)</span>
          </h2>

          {imagePreview ? (
            <div className="relative w-full max-w-sm">
              <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-xl border border-gray-200" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1 bg-white/90 hover:bg-white rounded-full shadow-sm border border-gray-200 transition-colors"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <Upload className="h-8 w-8 text-gray-300" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Click to upload photo</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — max 5MB</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Reporter Info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-slate-800 text-base border-b border-gray-100 pb-3">
            Your Details <span className="text-xs text-gray-400 font-normal">(Optional — kept private)</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Your Name</label>
              <input
                name="reporterName"
                value={form.reporterName}
                onChange={handleChange}
                placeholder="Anonymous if left blank"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Contact (Phone / Email)</label>
              <input
                name="reporterContact"
                value={form.reporterContact}
                onChange={handleChange}
                placeholder="For follow-up only"
                className="input-field"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full justify-center py-3 text-base"
        >
          {submitting ? (
            <><span className="animate-spin h-4 w-4 border-2 border-white/40 border-t-white rounded-full" /> Submitting...</>
          ) : (
            <><Send className="h-4 w-4" /> Submit Report</>
          )}
        </button>
      </form>

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
