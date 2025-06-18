// Google Maps API utilities

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBOovP323EA7FE_hJphrq1cHxY_HZo_mII'

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



// Geocode an address to get coordinates using Google Maps JavaScript API
export async function geocodeAddress(address: string): Promise<LocationData | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not configured')
    return null
  }

  // Check if Google Maps API is loaded
  if (!window.google || !window.google.maps) {
    console.warn('Google Maps API not loaded')
    return null
  }

  try {
    const geocoder = new window.google.maps.Geocoder()
    
    return new Promise((resolve) => {
      geocoder.geocode(
        { address: address },
        (results, status) => {
          if (status === window.google.maps.GeocoderStatus.OK && results && results.length > 0) {
            const result = results[0]
            const location = result.geometry.location
            
            // Extract city and state from address components
            const addressComponents = result.address_components
            const city = addressComponents.find((comp: google.maps.GeocoderAddressComponent) => comp.types.includes('locality'))?.long_name || ''
            const state = addressComponents.find((comp: google.maps.GeocoderAddressComponent) => comp.types.includes('administrative_area_level_1'))?.short_name || ''
            const country = addressComponents.find((comp: google.maps.GeocoderAddressComponent) => comp.types.includes('country'))?.long_name || ''
            
            resolve({
              formatted_address: result.formatted_address,
              latitude: location.lat(),
              longitude: location.lng(),
              city,
              state,
              country
            })
          } else {
            resolve(null)
          }
        }
      )
    })
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

// Reverse geocode coordinates to get address using Google Maps JavaScript API
export async function reverseGeocode(lat: number, lng: number): Promise<LocationData | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not configured')
    return null
  }

  // Check if Google Maps API is loaded
  if (!window.google || !window.google.maps) {
    console.warn('Google Maps API not loaded')
    return null
  }

  try {
    const geocoder = new window.google.maps.Geocoder()
    const latLng = new window.google.maps.LatLng(lat, lng)
    
    return new Promise((resolve) => {
      geocoder.geocode(
        { location: latLng },
        (results, status) => {
          if (status === window.google.maps.GeocoderStatus.OK && results && results.length > 0) {
            const result = results[0]
            const location = result.geometry.location
            
            const addressComponents = result.address_components
            const city = addressComponents.find((comp: google.maps.GeocoderAddressComponent) => comp.types.includes('locality'))?.long_name || ''
            const state = addressComponents.find((comp: google.maps.GeocoderAddressComponent) => comp.types.includes('administrative_area_level_1'))?.short_name || ''
            const country = addressComponents.find((comp: google.maps.GeocoderAddressComponent) => comp.types.includes('country'))?.long_name || ''
            
            resolve({
              formatted_address: result.formatted_address,
              latitude: location.lat(),
              longitude: location.lng(),
              city,
              state,
              country
            })
          } else {
            resolve(null)
          }
        }
      )
    })
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

// Get places autocomplete suggestions using the newer AutocompleteSuggestion API
export async function getPlacesAutocomplete(input: string, types: string[] = ['establishment', 'geocode']): Promise<{ description: string; place_id: string }[]> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not configured')
    return []
  }

  // Check if Google Maps API is loaded
  if (!window.google || !window.google.maps || !window.google.maps.places) {
    console.warn('Google Maps API not loaded')
    return []
  }

  try {
    // Try to use the newer AutocompleteSuggestion API if available
    if (window.google.maps.places.AutocompleteSuggestion) {
      // Use the newer API
      return new Promise((resolve) => {
        const request = {
          input: input,
          includedPrimaryTypes: types,
          includedRegionCodes: ['us']
        }
        
        window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .then((response: any) => {
            if (response.suggestions) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              resolve(response.suggestions.map((suggestion: any) => ({
                description: suggestion.placePrediction?.text?.text || suggestion.text || '',
                place_id: suggestion.placePrediction?.placeId || suggestion.placeId || ''
              })))
            } else {
              resolve([])
            }
          })
          .catch(() => {
            // Fallback to old API if new one fails
            resolve(getPlacesAutocompleteLegacy(input, types))
          })
      })
    } else {
      // Use legacy API as fallback
      return getPlacesAutocompleteLegacy(input, types)
    }
  } catch (error) {
    console.error('Places autocomplete error:', error)
    return []
  }
}

// Legacy autocomplete function using the deprecated AutocompleteService
function getPlacesAutocompleteLegacy(input: string, types: string[] = ['establishment', 'geocode']): Promise<{ description: string; place_id: string }[]> {
  return new Promise((resolve) => {
    try {
      const service = new window.google.maps.places.AutocompleteService()
      
      service.getPlacePredictions(
        {
          input: input,
          types: types,
          componentRestrictions: { country: 'us' }
        },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            resolve(predictions.map(prediction => ({
              description: prediction.description,
              place_id: prediction.place_id
            })))
          } else {
            resolve([])
          }
        }
      )
    } catch (error) {
      console.error('Legacy places autocomplete error:', error)
      resolve([])
    }
  })
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