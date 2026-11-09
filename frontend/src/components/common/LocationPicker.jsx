import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Popup } from 'react-leaflet'
import { Navigation, Loader2 } from 'lucide-react'
import L from 'leaflet'
import { BENGALURU_CENTER } from '../../utils/constants'

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Map click listener
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// Controller to smoothly fly to coordinates when updated
function MapFlyController({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, Math.max(map.getZoom(), 15), { duration: 1 })
    }
  }, [center, map])
  return null
}

const LocationPicker = ({ lat, lng, onLocationSelect }) => {
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [geoError, setGeoError] = useState(null)

  const position = lat && lng ? [lat, lng] : BENGALURU_CENTER

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.')
      return
    }

    setDetectingLocation(true)
    setGeoError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude
        const userLng = pos.coords.longitude
        onLocationSelect(userLat, userLng)
        setDetectingLocation(false)
      },
      (err) => {
        setDetectingLocation(false)
        if (err.code === 1) {
          setGeoError('Location permission denied. Please click on the map to set location.')
        } else {
          setGeoError('Unable to detect location. Please click on the map.')
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      {/* Top Action Bar */}
      <div className="bg-white px-4 py-2.5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          Interactive Map Location
        </span>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={detectingLocation}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 disabled:opacity-60"
        >
          {detectingLocation ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Detecting GPS...
            </>
          ) : (
            <>
              <Navigation className="h-3.5 w-3.5" />
              Use My Current Location
            </>
          )}
        </button>
      </div>

      {geoError && (
        <div className="bg-amber-50 px-4 py-2 border-b border-amber-200 text-xs text-amber-800">
          ⚠️ {geoError}
        </div>
      )}

      {/* Leaflet Map */}
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '320px', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onLocationSelect={onLocationSelect} />
        <MapFlyController center={lat && lng ? [lat, lng] : null} />
        {lat && lng && (
          <Marker position={[lat, lng]} icon={redIcon}>
            <Popup>Selected Issue Location</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Helper Footer */}
      <div className="bg-slate-50 border-t border-gray-100 px-3.5 py-2 text-xs text-slate-500 flex items-center justify-between">
        <span>📍 Click anywhere on the map or tap <b>"Use My Current Location"</b></span>
        {lat && lng && (
          <span className="font-mono text-[11px] text-blue-600 font-medium">
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </span>
        )}
      </div>
    </div>
  )
}

export default LocationPicker
