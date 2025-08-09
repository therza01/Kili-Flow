"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageSquare, Shield, Bell } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function OptInPage() {
  const [form, setForm] = useState({
    phoneNumber: "",
    name: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/whatsapp/opt-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        toast({
          title: "Success!",
          description: "You've been subscribed to WhatsApp notifications. Check your phone for a welcome message.",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to subscribe",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">You're All Set!</CardTitle>
            <CardDescription>
              You've successfully subscribed to WhatsApp notifications. Check your phone for a welcome message.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">You can opt out anytime by replying "STOP" to any message.</p>
            <Button onClick={() => (window.location.href = "/")} variant="outline">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Stay Connected with WhatsApp</h1>
          <p className="text-xl text-gray-600">Get important updates and notifications directly on WhatsApp</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Instant Notifications</h3>
                <p className="text-gray-600">
                  Receive order updates, appointment reminders, and important announcements instantly.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Easy Communication</h3>
                <p className="text-gray-600">Get messages on the platform you already use every day.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Privacy Protected</h3>
                <p className="text-gray-600">Your number is secure. Opt out anytime by replying "STOP".</p>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Subscribe to WhatsApp Notifications</CardTitle>
              <CardDescription>Enter your details below to start receiving notifications on WhatsApp.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +1 for US)</p>
                </div>

                <div>
                  <Label htmlFor="name">Name (Optional)</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Subscribing..." : "Subscribe to WhatsApp Notifications"}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By subscribing, you agree to receive WhatsApp messages. You can opt out anytime by replying "STOP".
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
