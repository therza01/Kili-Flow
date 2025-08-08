"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, User, Phone, MapPin, Save } from 'lucide-react'
import Link from "next/link"
import { userApi } from "@/lib/api"

export default function ProfilePage() {
  const [name, setName] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [estate, setEstate] = useState("Kilimani")
  const [isSaving, setIsSaving] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Load existing profile
    const profile = localStorage.getItem('gridpulse_user')
    if (profile) {
      const userData = JSON.parse(profile)
      setName(userData.name || "")
      setWhatsapp(userData.whatsapp || "")
      setEstate(userData.estate || "Kilimani")
      setHasProfile(true)
    }
  }, [])

  const saveProfile = async () => {
    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const profileData = {
        name: name.trim(),
        whatsapp: whatsapp.trim(),
        estate,
        latitude: -1.2860,
        longitude: 36.7871
      }

      const response = await userApi.create(profileData)
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to save profile')
      }
      
      // Update local storage
      const updatedProfile = {
        id: response.data?.user_id,
        ...profileData
      }
      localStorage.setItem('gridpulse_user', JSON.stringify(updatedProfile))
      setHasProfile(true)

      toast({
        title: "Profile Saved!",
        description: response.message || "Your profile has been updated successfully.",
      })
    } catch (err) {
      console.error('Error saving profile:', err)
      toast({
        title: "Save Failed",
        description: err instanceof Error ? err.message : "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Your Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="whatsapp"
                  placeholder="+254712345678"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500">
                For receiving utility alerts and community updates
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estate">Estate/Area</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="estate"
                  placeholder="Kilimani"
                  value={estate}
                  onChange={(e) => setEstate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button 
              onClick={saveProfile} 
              className="w-full" 
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : hasProfile ? "Update Profile" : "Create Profile"}
            </Button>
          </CardContent>
        </Card>

        {/* Profile Benefits */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-medium text-blue-900 mb-2">Profile Benefits</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Get WhatsApp alerts for utility issues</li>
              <li>• Participate in community discussions</li>
              <li>• Receive personalized recommendations</li>
              <li>• Track your reported issues</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
