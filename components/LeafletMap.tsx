"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Users, Navigation, Layers } from 'lucide-react'
import { User } from "@/lib/supabase"
import { KILIMANI_ESTATES } from "@/lib/geocoding"

interface LeafletMapProps {
  currentUser: User | null
  nearbyUsers: User[]
  onUserSelect?: (user: User) => void
  height?: string
}

export function LeafletMap({ currentUser, nearbyUsers, onUserSelect, height = "400px" }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [selectedEstate, setSelectedEstate] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)

  // Cleanup function
  const cleanupMap = useCallback(() => {
    try {
      // Clear all markers first
      markersRef.current.forEach(marker => {
        try {
          if (marker && marker.remove) {
            marker.remove()
          }
        } catch (e) {
          console.warn('Error removing marker:', e)
        }
      })
      markersRef.current = []

      // Remove map instance
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off() // Remove all event listeners
          mapInstanceRef.current.remove()
        } catch (e) {
          console.warn('Error removing map:', e)
        }
        mapInstanceRef.current = null
      }
    } catch (error) {
      console.warn('Error during cleanup:', error)
    }
  }, [])

  // Initialize map
  const initializeMap = useCallback(async () => {
    if (isInitializing || !mapRef.current) return
    
    setIsInitializing(true)
    setMapError(null)

    try {
      // Clean up any existing map
      cleanupMap()

      // Wait for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 100))

      if (!mapRef.current) {
        setIsInitializing(false)
        return
      }

      // Dynamic import of Leaflet
      const L = (await import('leaflet')).default

      // Ensure CSS is loaded
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
        link.crossOrigin = ''
        document.head.appendChild(link)

        // Wait for CSS to load
        await new Promise((resolve) => {
          link.onload = resolve
          link.onerror = resolve
          setTimeout(resolve, 2000) // Longer timeout
        })
      }

      // Double check container exists
      if (!mapRef.current) {
        setIsInitializing(false)
        return
      }

      // Clear container content
      mapRef.current.innerHTML = ''

      // Fix for default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      // Initialize map with conservative options
      const map = L.map(mapRef.current, {
        center: [-1.2860, 36.7871],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
        boxZoom: false,
        keyboard: false,
        dragging: true,
        tap: true,
        zoomAnimation: false, // Disable zoom animation to prevent errors
        fadeAnimation: false, // Disable fade animation
        markerZoomAnimation: false // Disable marker zoom animation
      })

      // Add error handling for the map
      map.on('error', (e) => {
        console.warn('Map error:', e)
      })

      // Add tile layer
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
        minZoom: 11,
        errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      })

      tileLayer.on('tileerror', (e) => {
        console.warn('Tile error:', e)
      })

      tileLayer.addTo(map)

      // Store map reference
      mapInstanceRef.current = map

      // Add estate boundaries
      KILIMANI_ESTATES.forEach((estate) => {
        const bounds = [
          [estate.bounds.south, estate.bounds.west],
          [estate.bounds.north, estate.bounds.east]
        ] as [[number, number], [number, number]]

        const usersInEstate = nearbyUsers.filter(user => user.estate === estate.name)
        const isCurrentUserEstate = currentUser?.estate === estate.name

        // Create rectangle
        const rectangle = L.rectangle(bounds, {
          color: isCurrentUserEstate ? '#3b82f6' : '#6b7280',
          weight: isCurrentUserEstate ? 2 : 1,
          opacity: 0.7,
          fillColor: isCurrentUserEstate ? '#dbeafe' : '#f3f4f6',
          fillOpacity: 0.2
        })

        rectangle.addTo(map)
        markersRef.current.push(rectangle)

        // Add estate label
        const center = [
          (estate.bounds.north + estate.bounds.south) / 2, 
          (estate.bounds.east + estate.bounds.west) / 2
        ] as [number, number]
        
        const estateMarker = L.marker(center, {
          icon: L.divIcon({
            className: 'estate-label-marker',
            html: `
              <div style="
                background: white; 
                padding: 6px 10px; 
                border-radius: 6px; 
                box-shadow: 0 2px 4px rgba(0,0,0,0.15); 
                border: 1px solid #d1d5db;
                text-align: center;
                font-size: 11px;
                font-weight: 500;
                color: #374151;
                white-space: nowrap;
              ">
                <div style="font-weight: 600; color: #1f2937; margin-bottom: 2px;">${estate.name}</div>
                <div style="color: #6b7280; font-size: 10px;">
                  👥 ${usersInEstate.length} user${usersInEstate.length !== 1 ? 's' : ''}
                </div>
              </div>
            `,
            iconSize: [120, 40],
            iconAnchor: [60, 20]
          })
        })

        estateMarker.addTo(map)
        markersRef.current.push(estateMarker)

        // Add click handlers
        const handleEstateClick = () => {
          setSelectedEstate(prev => prev === estate.name ? null : estate.name)
          try {
            map.fitBounds(bounds, { padding: [10, 10], maxZoom: 15 })
          } catch (e) {
            console.warn('Error fitting bounds:', e)
          }
        }

        rectangle.on('click', handleEstateClick)
        estateMarker.on('click', handleEstateClick)
      })

      // Add user markers
      nearbyUsers.forEach((user, index) => {
        if (!user.latitude || !user.longitude) return

        const isCurrentUser = user.id === currentUser?.id
        
        const userMarker = L.marker([user.latitude, user.longitude], {
          icon: L.divIcon({
            className: `user-marker-${index}`,
            html: `
              <div style="
                width: 28px; 
                height: 28px; 
                border-radius: 50%; 
                border: 2px solid ${isCurrentUser ? '#3b82f6' : '#10b981'};
                background: ${isCurrentUser ? '#dbeafe' : '#d1fae5'};
                display: flex; 
                align-items: center; 
                justify-content: center;
                box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                font-size: 11px;
                font-weight: bold;
                color: ${isCurrentUser ? '#1e40af' : '#047857'};
              ">
                ${user.name[0].toUpperCase()}
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          })
        })

        userMarker.addTo(map)
        markersRef.current.push(userMarker)

        // Add popup
        userMarker.bindPopup(`
          <div style="text-align: center; padding: 8px; min-width: 120px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${user.name}</div>
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">${user.estate}</div>
            ${isCurrentUser ? '<div style="font-size: 10px; color: #3b82f6; font-weight: 500;">Your Location</div>' : ''}
          </div>
        `, {
          closeButton: true,
          autoClose: true,
          closeOnClick: true
        })

        userMarker.on('click', () => {
          if (onUserSelect) {
            onUserSelect(user)
          }
        })
      })

      // Add current user special marker if different from regular markers
      if (currentUser?.latitude && currentUser?.longitude) {
        const currentUserMarker = L.marker([currentUser.latitude, currentUser.longitude], {
          icon: L.divIcon({
            className: 'current-user-special-marker',
            html: `
              <div style="
                width: 36px; 
                height: 36px; 
                border-radius: 50%; 
                border: 3px solid #3b82f6;
                background: #3b82f6;
                display: flex; 
                align-items: center; 
                justify-content: center;
                box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
                position: relative;
              ">
                <div style="color: white; font-size: 14px;">📍</div>
              </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
          })
        })

        currentUserMarker.addTo(map)
        markersRef.current.push(currentUserMarker)

        currentUserMarker.bindPopup(`
          <div style="text-align: center; padding: 8px;">
            <div style="font-weight: 600; color: #1e40af; margin-bottom: 4px;">Your Location</div>
            <div style="font-size: 12px; color: #6b7280;">${currentUser.estate}</div>
          </div>
        `)
      }

      setMapLoaded(true)
      setMapError(null)

    } catch (error) {
      console.error('Map initialization error:', error)
      setMapError('Failed to load map. Please refresh the page.')
      cleanupMap()
    } finally {
      setIsInitializing(false)
    }
  }, [currentUser, nearbyUsers, onUserSelect, cleanupMap])

  // Effect to initialize map
  useEffect(() => {
    const timer = setTimeout(() => {
      initializeMap()
    }, 100)

    return () => {
      clearTimeout(timer)
      cleanupMap()
    }
  }, [initializeMap, cleanupMap])

  // Helper functions
  const getUsersInEstate = (estateName: string) => {
    return nearbyUsers.filter(user => user.estate === estateName)
  }

  const centerOnEstate = (estateName: string) => {
    if (!mapInstanceRef.current) return
    
    const estate = KILIMANI_ESTATES.find(e => e.name === estateName)
    if (estate) {
      try {
        const bounds = [
          [estate.bounds.south, estate.bounds.west],
          [estate.bounds.north, estate.bounds.east]
        ] as [[number, number], [number, number]]
        
        mapInstanceRef.current.fitBounds(bounds, { padding: [10, 10], maxZoom: 15 })
      } catch (error) {
        console.warn('Error centering on estate:', error)
      }
    }
  }

  const centerOnUser = () => {
    if (currentUser?.latitude && currentUser?.longitude && mapInstanceRef.current) {
      try {
        mapInstanceRef.current.setView([currentUser.latitude, currentUser.longitude], 16)
      } catch (error) {
        console.warn('Error centering on user:', error)
      }
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Kilimani Interactive Map</span>
          </h3>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{nearbyUsers.length} online</span>
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={centerOnUser}
              disabled={!currentUser?.latitude || !currentUser?.longitude || !mapLoaded}
            >
              <Navigation className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative">
          <div 
            ref={mapRef} 
            style={{ height, width: '100%' }}
            className="rounded-lg border overflow-hidden bg-gray-100"
          />

          {/* Loading State */}
          {(!mapLoaded && !mapError) && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg"
              style={{ zIndex: 1000 }}
            >
              <div className="text-center bg-white p-6 rounded-lg shadow-lg">
                <Layers className="h-8 w-8 text-blue-500 mx-auto mb-3 animate-spin" />
                <p className="text-gray-700 font-medium">Loading Map...</p>
                <p className="text-sm text-gray-500 mt-1">Please wait a moment</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {mapError && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg"
              style={{ zIndex: 1000 }}
            >
              <div className="text-center bg-white p-6 rounded-lg shadow-lg border border-red-200">
                <MapPin className="h-8 w-8 text-red-500 mx-auto mb-3" />
                <p className="text-red-600 font-medium">Map Loading Failed</p>
                <p className="text-sm text-gray-500 mt-1 mb-3">{mapError}</p>
                <Button 
                  size="sm" 
                  onClick={() => {
                    setMapError(null)
                    setMapLoaded(false)
                    initializeMap()
                  }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Controls - Only show when map is loaded */}
        {mapLoaded && (
          <>
            {/* Estate Quick Navigation */}
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">Quick Navigation:</p>
              <div className="flex flex-wrap gap-2">
                {KILIMANI_ESTATES.map((estate) => {
                  const usersInEstate = getUsersInEstate(estate.name)
                  const isCurrentUserEstate = currentUser?.estate === estate.name
                  
                  return (
                    <Button
                      key={estate.name}
                      variant={isCurrentUserEstate ? "default" : "outline"}
                      size="sm"
                      onClick={() => centerOnEstate(estate.name)}
                      className="text-xs"
                    >
                      {estate.name}
                      {usersInEstate.length > 0 && (
                        <Badge className="ml-1 text-xs" variant="secondary">
                          {usersInEstate.length}
                        </Badge>
                      )}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Selected Estate Details */}
            {selectedEstate && (
              <div className="mt-4 bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium mb-2">{selectedEstate} Community</h4>
                <div className="space-y-2">
                  {getUsersInEstate(selectedEstate).map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 bg-white rounded border cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => onUserSelect?.(user)}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {user.name[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium">{user.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-500">online</span>
                      </div>
                    </div>
                  ))}
                  {getUsersInEstate(selectedEstate).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-2">
                      No users online in this area
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Map Legend */}
            <div className="mt-4 pt-3 border-t">
              <p className="text-xs text-gray-500 mb-2">Map Legend:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-500 bg-blue-100 rounded-full"></div>
                  <span>Your location</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-green-500 bg-green-100 rounded-full"></div>
                  <span>Other users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border border-blue-500 bg-blue-50"></div>
                  <span>Your estate</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border border-gray-400 bg-gray-50"></div>
                  <span>Other estates</span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
