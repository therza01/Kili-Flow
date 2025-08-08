"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Cloud, Sun, CloudRain, Thermometer } from 'lucide-react'

export function WeatherBox() {
  const [weather, setWeather] = useState({
    temp: 24,
    condition: 'Light Rain',
    icon: 'rain'
  })

  useEffect(() => {
    // Simulate weather API call
    const mockWeather = {
      temp: Math.floor(Math.random() * 10) + 20,
      condition: ['Sunny', 'Partly Cloudy', 'Light Rain', 'Overcast'][Math.floor(Math.random() * 4)],
      icon: ['sun', 'cloud', 'rain', 'cloud'][Math.floor(Math.random() * 4)]
    }
    setWeather(mockWeather)
  }, [])

  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case 'sun': return <Sun className="h-5 w-5 text-yellow-500" />
      case 'rain': return <CloudRain className="h-5 w-5 text-blue-500" />
      default: return <Cloud className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getWeatherIcon(weather.icon)}
            <div>
              <p className="font-medium text-gray-900">Kilimani Weather</p>
              <p className="text-sm text-gray-600">{weather.condition}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Thermometer className="h-4 w-4 text-gray-500" />
            <span className="text-xl font-bold text-gray-900">{weather.temp}°C</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
