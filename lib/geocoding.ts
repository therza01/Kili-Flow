// Geocoding utilities for estate detection
export interface Coordinates {
  lat: number
  lng: number
}

export interface EstateInfo {
  name: string
  bounds: {
    north: number
    south: number
    east: number
    west: number
  }
}

// Kilimani estate boundaries (approximate)
export const KILIMANI_ESTATES: EstateInfo[] = [
  {
    name: 'Yaya Center',
    bounds: {
      north: -1.2820,
      south: -1.2880,
      east: 36.7920,
      west: 36.7860
    }
  },
  {
    name: 'Woodlands',
    bounds: {
      north: -1.2780,
      south: -1.2840,
      east: 36.7980,
      west: 36.7920
    }
  },
  {
    name: 'Kileleshwa',
    bounds: {
      north: -1.2740,
      south: -1.2800,
      east: 36.7860,
      west: 36.7800
    }
  },
  {
    name: 'Lavington',
    bounds: {
      north: -1.2700,
      south: -1.2760,
      east: 36.7800,
      west: 36.7740
    }
  },
  {
    name: 'Kilimani Central',
    bounds: {
      north: -1.2840,
      south: -1.2900,
      east: 36.7860,
      west: 36.7800
    }
  },
  {
    name: 'Argwings Kodhek',
    bounds: {
      north: -1.2880,
      south: -1.2940,
      east: 36.7920,
      west: 36.7860
    }
  }
]

export function getEstateFromCoordinates(lat: number, lng: number): string {
  for (const estate of KILIMANI_ESTATES) {
    if (
      lat >= estate.bounds.south &&
      lat <= estate.bounds.north &&
      lng >= estate.bounds.west &&
      lng <= estate.bounds.east
    ) {
      return estate.name
    }
  }
  return 'Kilimani Central' // Default fallback
}

export async function getCurrentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      (error) => {
        // Fallback to Kilimani center if location access denied
        console.warn('Location access denied, using Kilimani center')
        resolve({
          lat: -1.2860,
          lng: 36.7871
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  })
}

// Add OpenStreetMap reverse geocoding function
export async function reverseGeocodeWithOSM(lat: number, lng: number): Promise<string> {
  try {
    // Use Nominatim (OpenStreetMap's geocoding service)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`
    )
    const data = await response.json()
    
    // Extract neighborhood/suburb from OSM data
    const address = data.address
    const neighborhood = address?.suburb || address?.neighbourhood || address?.residential || address?.quarter
    
    if (neighborhood) {
      // Try to match with our known estates
      const matchedEstate = KILIMANI_ESTATES.find(estate => 
        estate.name.toLowerCase().includes(neighborhood.toLowerCase()) ||
        neighborhood.toLowerCase().includes(estate.name.toLowerCase())
      )
      return matchedEstate?.name || getEstateFromCoordinates(lat, lng)
    }
    
    // Fallback to coordinate-based detection
    return getEstateFromCoordinates(lat, lng)
  } catch (error) {
    console.error('OSM reverse geocoding failed:', error)
    return getEstateFromCoordinates(lat, lng)
  }
}

// Update the main reverseGeocode function
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    // First try OSM reverse geocoding
    const osmResult = await reverseGeocodeWithOSM(lat, lng)
    return osmResult
  } catch (error) {
    console.error('Reverse geocoding failed:', error)
    return getEstateFromCoordinates(lat, lng)
  }
}

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}
