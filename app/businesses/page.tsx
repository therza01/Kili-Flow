"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Building, Phone, MapPin } from 'lucide-react'
import Link from "next/link"
import { supabase, Business, mockBusinesses, isSupabaseConfigured } from "@/lib/supabase"

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBusinesses = async () => {
    setLoading(true)
    try {
      // Check if Supabase is properly configured
      if (!isSupabaseConfigured()) {
        console.log('Using mock data - Supabase not configured')
        setBusinesses(mockBusinesses)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('estate', 'Kilimani')
        .order('created_at', { ascending: false })

      if (error) {
        console.log('Supabase error, falling back to mock data:', error.message)
        setBusinesses(mockBusinesses)
      } else {
        setBusinesses(data || [])
      }
    } catch (err) {
      console.log('Network error, using mock data:', err)
      setBusinesses(mockBusinesses)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBusinesses()
  }, [])

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Local Businesses</h1>
        </div>

        {/* Header */}
        <Card className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Building className="h-12 w-12" />
              <div>
                <h2 className="text-xl font-bold">Kilimani Directory</h2>
                <p className="text-green-100">Support local businesses in your area</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Businesses List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Featured Businesses</h2>
            <Badge variant="outline">{businesses.length} listings</Badge>
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
          ) : businesses.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No businesses listed yet</p>
                <p className="text-sm text-gray-400 mt-2">Check back soon for local listings!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {businesses.map((business) => (
                <Card key={business.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{business.name}</CardTitle>
                        <div className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
                          <MapPin className="h-3 w-3" />
                          <span>{business.estate}</span>
                        </div>
                      </div>
                      <Badge variant="outline">Local</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {business.description && (
                      <p className="text-gray-600 text-sm">{business.description}</p>
                    )}
                    
                    {business.contact && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <a 
                          href={`tel:${business.contact}`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {business.contact}
                        </a>
                      </div>
                    )}

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Listed {new Date(business.created_at).toLocaleDateString()}
                        </span>
                        <Button size="sm" variant="outline">
                          Contact
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <Building className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="font-medium text-yellow-900 mb-1">Own a Business?</h3>
            <p className="text-sm text-yellow-700 mb-3">
              List your business here to reach more customers in Kilimani
            </p>
            <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
              List Your Business
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
