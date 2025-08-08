"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, MapPin, RefreshCw } from 'lucide-react'
import Link from "next/link"
import { supabase, Issue, mockIssues, isSupabaseConfigured } from "@/lib/supabase"
import { IssueCard } from "@/components/IssueCard"

export default function MapPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)

  const fetchIssues = async () => {
    setLoading(true)
    try {
      // Check if Supabase is properly configured
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

  useEffect(() => {
    fetchIssues()

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
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Issue Map</h1>
          </div>
          <Button variant="outline" size="icon" onClick={fetchIssues}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Map Visualization */}
        <Card>
          <CardContent className="p-0">
            <div className="h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center relative overflow-hidden">
              <div className="text-center z-10">
                <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">Kilimani Area Map</p>
                <p className="text-sm text-gray-500">{issues.length} issues reported</p>
              </div>
              
              {/* Dynamic map pins based on real data */}
              {issues.slice(0, 5).map((issue, index) => (
                <div 
                  key={issue.id}
                  className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                    issue.status === 'resolved' ? 'bg-green-500' :
                    issue.status === 'investigating' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{
                    top: `${30 + index * 15}%`,
                    left: `${40 + index * 10}%`,
                    animation: issue.status === 'reported' ? 'pulse 2s infinite' : 'none'
                  }}
                  title={`${issue.type} - ${issue.location}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

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
      </div>
    </div>
  )
}
