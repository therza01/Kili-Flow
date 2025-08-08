"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, CheckCircle, AlertCircle } from 'lucide-react'
import { getCurrentLocation, reverseGeocode } from "@/lib/geocoding"

interface LocationSetupProps {
  onLocationSet: (estate: string, lat: number, lng: number) => void
  onSkip: () => void
}

export function LocationSetup({ onLocationSet, onSkip }: LocationSetupProps) {
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectedEstate, setDetectedEstate] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const detectLocation = async () => {
    setIsDetecting(true)
    setError(null)
    
    try {
      const coords = await getCurrentLocation()
      const estate = await reverseGeocode(coords.lat, coords.lng)
      
      setDetectedEstate(estate)
      onLocationSet(estate, coords.lat, coords.lng)
    } catch (err) {
      setError('Could not detect your location. Please try again or skip.')
      console.error('Location detection failed:', err)
    } finally {
      setIsDetecting(false)
    }
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-900">
          <MapPin className="h-5 w-5" />
          <span>Join Your Neighborhood</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-blue-700">
          Connect with neighbors in your area! We'll detect your location to show you 
          community updates from your specific neighborhood in Kilimani.
        </p>

        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {detectedEstate && (
          <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">Location detected!</p>
              <Badge className="mt-1 bg-green-100 text-green-800">
                {detectedEstate}
              </Badge>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button 
            onClick={detectLocation} 
            disabled={isDetecting}
            className="w-full"
          >
            <Navigation className="h-4 w-4 mr-2" />
            {isDetecting ? "Detecting Location..." : "Detect My Location"}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onSkip}
            className="w-full"
          >
            Skip for Now
          </Button>
        </div>

        <div className="text-xs text-blue-600 space-y-1">
          <p>• Your location is used only to connect you with nearby neighbors</p>
          <p>• We detect your neighborhood area (e.g., Yaya, Woodlands)</p>
          <p>• Your exact coordinates are never shared with other users</p>
        </div>
      </CardContent>
    </Card>
  )
}
