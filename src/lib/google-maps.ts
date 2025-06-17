// Google Maps API utilities
// TODO: Replace with your actual Google Maps API key from Google Cloud Console

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY_HERE'

export interface LocationData {
  formatted_address: string
  latitude: number
  longitude: number
  city: string
  state: string
  country: string
}

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

// Geocode an address to get coordinates
export async function geocodeAddress(address: string): Promise<LocationData | null> {
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    console.warn('Google Maps API key not configured')
    return null
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
    )
    
    const data = await response.json()
    
    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0]
      const location = result.geometry.location
      
      // Extract city and state from address components
      const addressComponents = result.address_components
      const city = addressComponents.find((comp: { types: string[] }) => comp.types.includes('locality'))?.long_name || ''
      const state = addressComponents.find((comp: { types: string[] }) => comp.types.includes('administrative_area_level_1'))?.short_name || ''
      const country = addressComponents.find((comp: { types: string[] }) => comp.types.includes('country'))?.long_name || ''
      
      return {
        formatted_address: result.formatted_address,
        latitude: location.lat,
        longitude: location.lng,
        city,
        state,
        country
      }
    }
    
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

// Reverse geocode coordinates to get address
export async function reverseGeocode(lat: number, lng: number): Promise<LocationData | null> {
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    console.warn('Google Maps API key not configured')
    return null
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
    )
    
    const data = await response.json()
    
    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0]
      const location = result.geometry.location
      
      const addressComponents = result.address_components
      const city = addressComponents.find((comp: { types: string[] }) => comp.types.includes('locality'))?.long_name || ''
      const state = addressComponents.find((comp: { types: string[] }) => comp.types.includes('administrative_area_level_1'))?.short_name || ''
      const country = addressComponents.find((comp: { types: string[] }) => comp.types.includes('country'))?.long_name || ''
      
      return {
        formatted_address: result.formatted_address,
        latitude: location.lat,
        longitude: location.lng,
        city,
        state,
        country
      }
    }
    
    return null
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}

// Get user's current location
export function getCurrentLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  })
}

// Calculate distance between two points using Haversine formula
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return Math.round(distance * 10) / 10 // Round to 1 decimal place
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// Get places autocomplete suggestions
export async function getPlacesAutocomplete(input: string, types: string[] = ['(cities)']): Promise<{ description: string; place_id: string }[]> {
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    console.warn('Google Maps API key not configured')
    return []
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=${types.join('|')}&componentRestrictions=country:us&key=${GOOGLE_MAPS_API_KEY}`
    )
    
    const data = await response.json()
    
    if (data.status === 'OK') {
      return data.predictions
    }
    
    return []
  } catch (error) {
    console.error('Places autocomplete error:', error)
    return []
  }
}

// Get bounds for a set of coordinates
export function getBoundsForCoordinates(coordinates: { lat: number; lng: number }[]): MapBounds | null {
  if (coordinates.length === 0) return null
  
  let north = coordinates[0].lat
  let south = coordinates[0].lat
  let east = coordinates[0].lng
  let west = coordinates[0].lng
  
  coordinates.forEach(coord => {
    north = Math.max(north, coord.lat)
    south = Math.min(south, coord.lat)
    east = Math.max(east, coord.lng)
    west = Math.min(west, coord.lng)
  })
  
  // Add some padding
  const latPadding = (north - south) * 0.1
  const lngPadding = (east - west) * 0.1
  
  return {
    north: north + latPadding,
    south: south - latPadding,
    east: east + lngPadding,
    west: west - lngPadding
  }
} 