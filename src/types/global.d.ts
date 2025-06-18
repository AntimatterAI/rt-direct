/// <reference types="google.maps" />

declare global {
  interface Window {
    google: typeof google
  }
  
  namespace google {
    namespace maps {
      namespace places {
        class AutocompleteService {
          getPlacePredictions(
            request: AutocompletionRequest,
            callback: (predictions: AutocompletePrediction[] | null, status: PlacesServiceStatus) => void
          ): void
        }
        
        interface AutocompletionRequest {
          input: string
          types?: string[]
          componentRestrictions?: ComponentRestrictions
        }
        
        interface AutocompletePrediction {
          description: string
          place_id: string
        }
        
        interface ComponentRestrictions {
          country?: string | string[]
        }
        
        enum PlacesServiceStatus {
          OK = 'OK',
          ZERO_RESULTS = 'ZERO_RESULTS',
          INVALID_REQUEST = 'INVALID_REQUEST',
          OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
          REQUEST_DENIED = 'REQUEST_DENIED',
          UNKNOWN_ERROR = 'UNKNOWN_ERROR'
        }
      }
      
      class Geocoder {
        geocode(
          request: GeocoderRequest,
          callback: (results: GeocoderResult[] | null, status: GeocoderStatus) => void
        ): void
      }
      
      interface GeocoderRequest {
        address?: string
        location?: LatLng
      }
      
      interface GeocoderResult {
        formatted_address: string
        geometry: {
          location: LatLng
        }
        address_components: GeocoderAddressComponent[]
      }
      
      interface GeocoderAddressComponent {
        long_name: string
        short_name: string
        types: string[]
      }
      
      enum GeocoderStatus {
        OK = 'OK',
        ZERO_RESULTS = 'ZERO_RESULTS',
        OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
        REQUEST_DENIED = 'REQUEST_DENIED',
        INVALID_REQUEST = 'INVALID_REQUEST',
        UNKNOWN_ERROR = 'UNKNOWN_ERROR'
      }
    }
  }
}

export {} 