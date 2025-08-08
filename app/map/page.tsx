"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, MapPin, RefreshCw, Layers } from 'lucide-react'
import Link from "next/link"
import { supabase, Issue, User, mockIssues, isSupabaseConfigured } from "@/lib/supabase"
import { IssueCard } from "@/components/IssueCard"
import { LeafletMap } from "@/components/LeafletMap"

export default function MapPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [nearbyUsers, setNearbyUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchIssues = async () => {
    setLoading(true)
    try {
      if (!isSupabaseConfigured()) {
        console.log('Using mock data - Supabase not configured')
        setIssues(mockIssues)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.log('Supabase error, falling back to mock data:', error.message)
        setIssues(mockIssues)
      } else {
        setIssues(data || [])
      }
    } catch (err) {
      console.log('Network error, using mock data:', err)
      setIssues(mockIssues)
    } finally {
      setLoading(false)
    }
  }

  const fetchNearbyUsers = async () => {
    try {
      if (!isSupabaseConfigured()) {
        // Mock nearby users with coordinates
        const mockUsers: User[] = [
          { 
            id: '1', 
            name: 'John Doe', 
            whatsapp: '+254712345678', 
            estate: 'Yaya Center', 
            latitude: -1.2850, 
            longitude: 36.7890,
            created_at: new Date().toISOString() 
          },
          { 
            id: '2', 
            name: 'Jane Smith', 
            whatsapp: '+254723456789', 
            estate: 'Woodlands', 
            latitude: -1.2810, 
            longitude: 36.7950,
            created_at: new Date().toISOString() 
          },
          { 
            id: '3', 
            name: 'Mike Johnson', 
            whatsapp: '+254734567890', 
            estate: 'Kileleshwa', 
            latitude: -1.2770, 
            longitude: 36.7830,
            created_at: new Date().toISOString() 
          },
        ]
        setNearbyUsers(mockUsers)
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .not('estate', 'is', null)
        .order('created_at', { ascending: false })

      if (error) {
        console.log('Error fetching users:', error.message)
      } else {
        setNearbyUsers(data || [])
      }
    } catch (err) {
      console.log('Network error fetching users:', err)
    }
  }

  useEffect(() => {
    // Load current user
    const stored = localStorage.getItem('gridpulse_user')
    if (stored) {
      const userProfile = JSON.parse(stored)
      setCurrentUser(userProfile)
    }

    fetchIssues()
    fetchNearbyUsers()

    // Only set up real-time subscription if Supabase is configured
    if (isSupabaseConfigured()) {
      const subscription = supabase
        .channel('issues')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'issues' },
          (payload) => {
            console.log('Real-time update:', payload)
            fetchIssues()
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [])

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Interactive Map</h1>
          </div>
          <Button variant="outline" size="icon" onClick={fetchIssues}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Enhanced Map with Leaflet */}
        <LeafletMap
          currentUser={currentUser}
          nearbyUsers={nearbyUsers}
          onUserSelect={(user) => {
            console.log('Selected user:', user)
          }}
          height="500px"
        />

        {/* Map Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{issues.length}</div>
              <div className="text-sm text-gray-600">Total Issues</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{nearbyUsers.length}</div>
              <div className="text-sm text-gray-600">Online Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">6</div>
              <div className="text-sm text-gray-600">Neighborhoods</div>
            </CardContent>
          </Card>
        </div>

        {/* Issues List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Issues ({issues.length})</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Live updates</span>
            </div>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : issues.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No issues reported yet</p>
                <Link href="/report">
                  <Button className="mt-4">Report First Issue</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {issues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          )}
        </div>

        {/* Map Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Layers className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">Interactive Map Features</p>
                <ul className="text-blue-700 space-y-1 text-xs">
                  <li>• Click on estate boundaries to see community details</li>
                  <li>• User markers show real-time online status</li>
                  <li>• Navigate between neighborhoods with quick buttons</li>
                  <li>• Powered by OpenStreetMap - no API keys required</li>
                  <li>• Your location is highlighted with a pulsing blue marker</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
