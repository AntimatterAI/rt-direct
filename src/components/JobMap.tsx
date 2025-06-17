'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { MapPin, Navigation, Filter } from 'lucide-react'
import { getCurrentLocation, calculateDistance } from '@/lib/google-maps'

interface Job {
  id: string
  title: string
  company_name?: string
  location: string
  formatted_address?: string
  latitude?: number
  longitude?: number
  employment_type: string
  work_type: string
  salary_min?: number
  salary_max?: number
  distance?: number
}

interface JobMapProps {
  jobs: Job[]
  onJobSelect?: (job: Job) => void
  selectedJobId?: string
  className?: string
}

export default function JobMap({ jobs, onJobSelect, selectedJobId, className = '' }: JobMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [distanceFilter, setDistanceFilter] = useState<number | null>(null)
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(jobs)

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true)
        return
      }

      const script = document.createElement('script')
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY_HERE'
      
      if (apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
        console.warn('Google Maps API key not configured. Map will not load.')
        return
      }

      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`
      script.async = true
      script.defer = true
      script.onload = () => setIsLoaded(true)
      script.onerror = () => console.error('Failed to load Google Maps API')
      
      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [])

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return

    const map = new google.maps.Map(mapRef.current, {
      zoom: 6,
      center: { lat: 39.8283, lng: -98.5795 }, // Center of US
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    })

    googleMapRef.current = map
    infoWindowRef.current = new google.maps.InfoWindow()

    // Get user's location
    getCurrentUserLocation()
  }, [isLoaded])

  // Update markers when jobs change
  useEffect(() => {
    if (!googleMapRef.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    // Add markers for jobs with coordinates
    const jobsWithCoords = filteredJobs.filter(job => job.latitude && job.longitude)
    
    if (jobsWithCoords.length === 0) return

    jobsWithCoords.forEach(job => {
      const marker = new google.maps.Marker({
        position: { lat: job.latitude!, lng: job.longitude! },
        map: googleMapRef.current,
        title: job.title,
        icon: {
          url: selectedJobId === job.id ? 
            'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="#2563eb" stroke="#ffffff" stroke-width="3"/>
                <circle cx="16" cy="16" r="6" fill="#ffffff"/>
              </svg>
            `) :
            'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" fill="#ffffff"/>
              </svg>
            `),
          scaledSize: new google.maps.Size(selectedJobId === job.id ? 32 : 24, selectedJobId === job.id ? 32 : 24),
          anchor: new google.maps.Point(selectedJobId === job.id ? 16 : 12, selectedJobId === job.id ? 16 : 12)
        }
      })

      // Add click listener
      marker.addListener('click', () => {
        if (onJobSelect) {
          onJobSelect(job)
        }
        showJobInfoWindow(job, marker)
      })

      markersRef.current.push(marker)
    })

    // Fit map to show all markers
    if (jobsWithCoords.length > 0) {
      const bounds = new google.maps.LatLngBounds()
      jobsWithCoords.forEach(job => {
        bounds.extend(new google.maps.LatLng(job.latitude!, job.longitude!))
      })
      
      // Include user location if available
      if (userLocation) {
        bounds.extend(new google.maps.LatLng(userLocation.lat, userLocation.lng))
      }
      
      googleMapRef.current.fitBounds(bounds)
      
      // Don't zoom in too much for single job
      if (jobsWithCoords.length === 1) {
        googleMapRef.current.setZoom(Math.min(googleMapRef.current.getZoom() || 10, 12))
      }
    }
  }, [filteredJobs, selectedJobId, onJobSelect, userLocation])

  // Filter jobs by distance
  useEffect(() => {
    if (!userLocation || !distanceFilter) {
      setFilteredJobs(jobs)
      return
    }

    const filtered = jobs.filter(job => {
      if (!job.latitude || !job.longitude) return false
      
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        job.latitude,
        job.longitude
      )
      
      return distance <= distanceFilter
    }).map(job => ({
      ...job,
      distance: job.latitude && job.longitude ? calculateDistance(
        userLocation.lat,
        userLocation.lng,
        job.latitude,
        job.longitude
      ) : undefined
    }))

    setFilteredJobs(filtered)
  }, [jobs, userLocation, distanceFilter])

  const getCurrentUserLocation = async () => {
    try {
      const position = await getCurrentLocation()
      const userLoc = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
      setUserLocation(userLoc)

      // Add user location marker
      if (googleMapRef.current) {
        new google.maps.Marker({
          position: userLoc,
          map: googleMapRef.current,
          title: 'Your Location',
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" fill="#ffffff"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(24, 24),
            anchor: new google.maps.Point(12, 12)
          }
        })
      }
    } catch (error) {
      console.error('Error getting user location:', error)
    }
  }

  const showJobInfoWindow = (job: Job, marker: google.maps.Marker) => {
    if (!infoWindowRef.current) return

    const salaryRange = job.salary_min && job.salary_max 
      ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
      : job.salary_min 
        ? `$${job.salary_min.toLocaleString()}+`
        : 'Salary not specified'

    const content = `
      <div style="max-width: 300px; padding: 8px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #1f2937;">
          ${job.title}
        </h3>
        ${job.company_name ? `<p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">${job.company_name}</p>` : ''}
        <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">
          📍 ${job.formatted_address || job.location}
        </p>
        <div style="margin: 8px 0; display: flex; gap: 4px; flex-wrap: wrap;">
          <span style="background: #eff6ff; color: #2563eb; padding: 2px 6px; border-radius: 4px; font-size: 12px;">
            ${job.employment_type}
          </span>
          <span style="background: #f0fdf4; color: #16a34a; padding: 2px 6px; border-radius: 4px; font-size: 12px;">
            ${job.work_type}
          </span>
        </div>
        <p style="margin: 4px 0 0 0; color: #059669; font-weight: bold; font-size: 14px;">
          💰 ${salaryRange}
        </p>
        ${job.distance ? `<p style="margin: 4px 0 0 0; color: #6b7280; font-size: 12px;">📏 ${job.distance} miles away</p>` : ''}
      </div>
    `

    infoWindowRef.current.setContent(content)
    infoWindowRef.current.open(googleMapRef.current, marker)
  }

  const distanceOptions = [
    { value: null, label: 'Any Distance' },
    { value: 25, label: 'Within 25 miles' },
    { value: 50, label: 'Within 50 miles' },
    { value: 100, label: 'Within 100 miles' },
    { value: 200, label: 'Within 200 miles' }
  ]

  if (!isLoaded) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-500">Loading map...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        {/* Map Controls */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-sm">
                  {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} shown
                </span>
              </div>
              
              {userLocation && (
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={distanceFilter || ''}
                    onChange={(e) => setDistanceFilter(e.target.value ? Number(e.target.value) : null)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    {distanceOptions.map(option => (
                      <option key={option.value || 'any'} value={option.value || ''}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {!userLocation && (
              <Button
                onClick={getCurrentUserLocation}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Navigation className="w-4 h-4" />
                <span>Find Jobs Near Me</span>
              </Button>
            )}
          </div>
        </div>

        {/* Map */}
        <div 
          ref={mapRef} 
          className="w-full h-96"
          style={{ minHeight: '400px' }}
        />

        {/* Legend */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Job Locations</span>
              </div>
              {userLocation && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Your Location</span>
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500">
              Click markers for details
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 