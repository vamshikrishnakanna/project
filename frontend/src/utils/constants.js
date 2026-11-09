export const CATEGORIES = [
  'Pothole',
  'Garbage',
  'Streetlight',
  'Water Leakage',
  'Drainage',
  'Road Damage',
  'Traffic Sign Damage',
  'Other',
]

export const STATUSES = ['Reported', 'Under Review', 'In Progress', 'Resolved']

export const STATUS_COLORS = {
  'Reported': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  'Under Review': 'bg-blue-100 text-blue-800 border border-blue-200',
  'In Progress': 'bg-orange-100 text-orange-800 border border-orange-200',
  'Resolved': 'bg-green-100 text-green-800 border border-green-200',
}

export const CATEGORY_ICONS = {
  'Pothole': '🕳️',
  'Garbage': '🗑️',
  'Streetlight': '💡',
  'Water Leakage': '💧',
  'Drainage': '🌊',
  'Road Damage': '🚧',
  'Traffic Sign Damage': '🚦',
  'Other': '⚠️',
}

export const CATEGORY_COLORS = {
  'Pothole': 'bg-red-100 text-red-700 border border-red-200',
  'Garbage': 'bg-green-100 text-green-700 border border-green-200',
  'Streetlight': 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  'Water Leakage': 'bg-blue-100 text-blue-700 border border-blue-200',
  'Drainage': 'bg-cyan-100 text-cyan-700 border border-cyan-200',
  'Road Damage': 'bg-orange-100 text-orange-700 border border-orange-200',
  'Traffic Sign Damage': 'bg-purple-100 text-purple-700 border border-purple-200',
  'Other': 'bg-gray-100 text-gray-700 border border-gray-200',
}

export const BENGALURU_CENTER = [12.9716, 77.5946]

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const formatDistance = (meters) => {
  if (meters < 1000) return `${meters}m`
  return `${(meters / 1000).toFixed(1)}km`
}

export const getComplaintId = (issue) => {
  if (!issue?._id) return 'N/A'
  return `CT-${issue._id.toString().slice(-6).toUpperCase()}`
}

export const truncate = (str, n = 100) =>
  str && str.length > n ? str.slice(0, n) + '...' : str

