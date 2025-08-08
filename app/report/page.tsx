"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, MapPin, Camera } from 'lucide-react'
import Link from "next/link"
import { issuesApi, userApi } from "@/lib/api"
import { WhatsAppAlert } from "@/components/WhatsAppAlert"

export default function ReportPage() {
  const [type, setType] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("Kilimani")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showWhatsAppAlert, setShowWhatsAppAlert] = useState(false)
  const { toast } = useToast()

  const submitIssue = async () => {
    if (!type || !description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
  
    try {
      // Get user profile for user_id
      const userProfile = localStorage.getItem('gridpulse_user')
      let userId = null
      
      if (userProfile) {
        const parsed = JSON.parse(userProfile)
        userId = parsed.id
      }

      const response = await issuesApi.create({
        user_id: userId,
        type,
        description,
        location,
        latitude: -1.2860 + (Math.random() - 0.5) * 0.01,
        longitude: 36.7871 + (Math.random() - 0.5) * 0.01,
      })

      if (!response.success) {
        throw new Error(response.error || 'Failed to submit issue')
      }

      toast({
        title: "Issue Reported Successfully!",
        description: response.message || "Your report has been submitted to the authorities.",
      })

      setShowWhatsAppAlert(true)
      setType("")
      setDescription("")
      setLocation("Kilimani")
    } catch (err) {
      console.error('Error submitting issue:', err)
      toast({
        title: "Submission Failed",
        description: err instanceof Error ? err.message : "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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
          <h1 className="text-2xl font-bold">Report Issue</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-2xl">📋</span>
              <span>Submit Utility Issue</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Issue Type *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Power">⚡ Power Outage</SelectItem>
                  <SelectItem value="Water">💧 Water Issue</SelectItem>
                  <SelectItem value="Internet">📡 Internet/Telecom</SelectItem>
                  <SelectItem value="Gas">🔥 Gas Supply</SelectItem>
                  <SelectItem value="Sewage">🚰 Sewage Problem</SelectItem>
                  <SelectItem value="Roads">🛣️ Road/Infrastructure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  placeholder="e.g., Kilimani Road"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the issue in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Photo (Optional)</Label>
              <Button variant="outline" className="w-full" disabled>
                <Camera className="h-4 w-4 mr-2" />
                Add Photo
              </Button>
              <p className="text-xs text-gray-500">Photo upload coming soon</p>
            </div>

            <Button 
              onClick={submitIssue} 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </CardContent>
        </Card>

        {showWhatsAppAlert && (
          <WhatsAppAlert 
            onClose={() => setShowWhatsAppAlert(false)}
            issueType={type}
          />
        )}
      </div>
    </div>
  )
}
