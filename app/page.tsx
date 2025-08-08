"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Zap, Activity, Users, Building, User } from 'lucide-react'
import Link from "next/link"
import { WeatherBox } from "@/components/WeatherBox"
import { issuesApi } from "@/lib/api"

export default function HomePage() {
  const [issueCount, setIssueCount] = useState(0)
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    const getIssueCount = async () => {
      try {
        const response = await issuesApi.getAll('Kilimani', 1000)
        
        if (response.success && response.data) {
          setIssueCount(response.data.count)
        } else {
          console.log('API error, using default count:', response.error)
          setIssueCount(0)
        }
      } catch (err) {
        console.log('Network error, using default count:', err)
        setIssueCount(0)
      }
    }

    const getUserProfile = () => {
      const profile = localStorage.getItem('gridpulse_user')
      if (profile) {
        setUserProfile(JSON.parse(profile))
      }
    }

    getIssueCount()
    getUserProfile()
  }, [])

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <div className="flex items-center justify-center space-x-2">
            <Zap className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">GridPulse</h1>
          </div>
          <p className="text-gray-600">Smart utility monitoring for Kilimani</p>
          
          {userProfile && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                Welcome back, <span className="font-medium">{userProfile.name}</span>!
              </p>
            </div>
          )}
        </div>

        {/* Weather Widget */}
        <WeatherBox />

        {/* Quick Stats */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Active Issues</p>
                <p className="text-2xl font-bold">{issueCount}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        {/* Main Navigation */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/report">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-red-200 h-full">
              <CardContent className="p-4 text-center space-y-2">
                <div className="bg-red-100 p-3 rounded-full w-fit mx-auto">
                  <span className="text-2xl">📋</span>
                </div>
                <h3 className="font-semibold">Report Issue</h3>
                <p className="text-gray-600 text-xs">Submit utility problem</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/map">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-200 h-full">
              <CardContent className="p-4 text-center space-y-2">
                <div className="bg-green-100 p-3 rounded-full w-fit mx-auto">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Map View</h3>
                <p className="text-gray-600 text-xs">See nearby issues</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/predictions">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-200 h-full">
              <CardContent className="p-4 text-center space-y-2">
                <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">AI Predictions</h3>
                <p className="text-gray-600 text-xs">Outage forecasts</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/community">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-orange-200 h-full">
              <CardContent className="p-4 text-center space-y-2">
                <div className="bg-orange-100 p-3 rounded-full w-fit mx-auto">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold">Community</h3>
                <p className="text-gray-600 text-xs">Estate updates</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Secondary Navigation */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/businesses">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200">
              <CardContent className="p-4 text-center space-y-2">
                <Building className="h-6 w-6 text-blue-600 mx-auto" />
                <h3 className="font-medium text-sm">Local Businesses</h3>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-gray-200">
              <CardContent className="p-4 text-center space-y-2">
                <User className="h-6 w-6 text-gray-600 mx-auto" />
                <h3 className="font-medium text-sm">Profile</h3>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
