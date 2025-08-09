"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Users, Send, Settings, CheckCircle, XCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: number
  phoneNumber: string
  name?: string
  optedIn: boolean
  optedInAt?: string
  createdAt: string
}

interface Notification {
  id: number
  user_name?: string
  user_phone?: string
  message_type: string
  content: string
  status: string
  sent_at: string
}

export default function WhatsAppDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    optedInUsers: 0,
    messagesSent: 0,
    deliveryRate: 0,
  })
  const { toast } = useToast()

  // Opt-in form state
  const [optInForm, setOptInForm] = useState({
    phoneNumber: "",
    name: "",
  })

  // Send message form state
  const [messageForm, setMessageForm] = useState({
    phoneNumber: "",
    message: "",
    messageType: "manual",
    templateName: "",
    variables: "{}",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // In a real app, you'd have API endpoints to fetch this data
      // For now, we'll simulate the data
      setStats({
        totalUsers: 150,
        optedInUsers: 120,
        messagesSent: 450,
        deliveryRate: 94.2,
      })
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const handleOptIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/whatsapp/opt-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(optInForm),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "User successfully opted in for WhatsApp notifications",
        })
        setOptInForm({ phoneNumber: "", name: "" })
        fetchData()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to opt in user",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let variables = {}
      if (messageForm.variables) {
        variables = JSON.parse(messageForm.variables)
      }

      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...messageForm,
          variables,
          phoneNumber: messageForm.phoneNumber || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: `Message sent successfully. ${data.totalSent} sent, ${data.totalFailed} failed.`,
        })
        setMessageForm({
          phoneNumber: "",
          message: "",
          messageType: "manual",
          templateName: "",
          variables: "{}",
        })
        fetchData()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">WhatsApp Business Notifications</h1>
          <p className="text-gray-600">Manage your WhatsApp Business API notifications and subscribers</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Opted In</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.optedInUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.messagesSent}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.deliveryRate}%</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="opt-in" className="space-y-6">
          <TabsList>
            <TabsTrigger value="opt-in">User Opt-in</TabsTrigger>
            <TabsTrigger value="send">Send Messages</TabsTrigger>
            <TabsTrigger value="history">Message History</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="opt-in">
            <Card>
              <CardHeader>
                <CardTitle>Add New Subscriber</CardTitle>
                <CardDescription>
                  Add users to your WhatsApp notification list. They will receive a welcome message and can opt out
                  anytime.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleOptIn} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number *</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="+1234567890"
                        value={optInForm.phoneNumber}
                        onChange={(e) => setOptInForm({ ...optInForm, phoneNumber: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="name">Name (Optional)</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={optInForm.name}
                        onChange={(e) => setOptInForm({ ...optInForm, name: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Adding..." : "Add Subscriber"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="send">
            <Card>
              <CardHeader>
                <CardTitle>Send Notification</CardTitle>
                <CardDescription>
                  Send messages to individual users or broadcast to all opted-in subscribers using templates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sendPhoneNumber">Phone Number (Optional for broadcast)</Label>
                      <Input
                        id="sendPhoneNumber"
                        type="tel"
                        placeholder="+1234567890 or leave empty for broadcast"
                        value={messageForm.phoneNumber}
                        onChange={(e) => setMessageForm({ ...messageForm, phoneNumber: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="messageType">Message Type</Label>
                      <Select
                        value={messageForm.messageType}
                        onValueChange={(value) => setMessageForm({ ...messageForm, messageType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="promotional">Promotional</SelectItem>
                          <SelectItem value="transactional">Transactional</SelectItem>
                          <SelectItem value="reminder">Reminder</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="templateName">Template (Optional)</Label>
                    <Select
                      value={messageForm.templateName}
                      onValueChange={(value) => setMessageForm({ ...messageForm, templateName: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template or write custom message" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Custom Message</SelectItem>
                        <SelectItem value="welcome">Welcome</SelectItem>
                        <SelectItem value="order_confirmation">Order Confirmation</SelectItem>
                        <SelectItem value="appointment_reminder">Appointment Reminder</SelectItem>
                        <SelectItem value="promotional">Promotional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {!messageForm.templateName ||
                    (messageForm.templateName === "custom" && (
                      <div>
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          placeholder="Enter your message here..."
                          value={messageForm.message}
                          onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                          required={messageForm.templateName === "custom"}
                        />
                      </div>
                    ))}

                  {messageForm.templateName !== "custom" && (
                    <div>
                      <Label htmlFor="variables">Template Variables (JSON)</Label>
                      <Textarea
                        id="variables"
                        placeholder='{"order_id": "12345", "amount": "99.99"}'
                        value={messageForm.variables}
                        onChange={(e) => setMessageForm({ ...messageForm, variables: e.target.value })}
                      />
                    </div>
                  )}

                  <Button type="submit" disabled={loading}>
                    <Send className="w-4 h-4 mr-2" />
                    {loading ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Message History</CardTitle>
                <CardDescription>View all sent messages and their delivery status.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No messages sent yet.</p>
                  ) : (
                    notifications.map((notification) => (
                      <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{notification.user_name || notification.user_phone}</span>
                            <Badge variant="outline">{notification.message_type}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{notification.content}</p>
                          <p className="text-xs text-gray-400">{new Date(notification.sent_at).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(notification.status)}
                          <span className="text-sm capitalize">{notification.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Message Templates</CardTitle>
                <CardDescription>Pre-defined message templates for common notifications.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Welcome Message</h3>
                    <p className="text-sm text-gray-600 mb-2">Welcome to our service! Reply STOP to opt out anytime.</p>
                    <Badge>Active</Badge>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Order Confirmation</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Your order #{"{{order_id}}"} has been confirmed. Total: ${"{{amount}}"}
                    </p>
                    <div className="flex gap-2">
                      <Badge>Active</Badge>
                      <Badge variant="outline">Variables: order_id, amount</Badge>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Appointment Reminder</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Reminder: You have an appointment on {"{{date}}"} at {"{{time}}"}. Reply STOP to opt out.
                    </p>
                    <div className="flex gap-2">
                      <Badge>Active</Badge>
                      <Badge variant="outline">Variables: date, time</Badge>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Promotional</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Special offer: {"{{offer_text}}"} Valid until {"{{expiry_date}}"}. Reply STOP to opt out.
                    </p>
                    <div className="flex gap-2">
                      <Badge>Active</Badge>
                      <Badge variant="outline">Variables: offer_text, expiry_date</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
