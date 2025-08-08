import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock weather data for Kilimani, Nairobi
    const mockWeatherData = {
      location: "Kilimani, Nairobi",
      temperature: Math.floor(Math.random() * 10) + 18, // 18-28°C
      condition: ['Sunny', 'Partly Cloudy', 'Light Rain', 'Overcast', 'Thunderstorms'][Math.floor(Math.random() * 5)],
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 km/h
      forecast: [
        { day: 'Today', high: 26, low: 19, condition: 'Sunny' },
        { day: 'Tomorrow', high: 24, low: 18, condition: 'Light Rain' },
        { day: 'Wednesday', high: 25, low: 20, condition: 'Partly Cloudy' }
      ]
    }

    return NextResponse.json(mockWeatherData)

  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    )
  }
}
