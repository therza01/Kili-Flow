"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { MessageCircle, X } from 'lucide-react'

interface WhatsAppAlertProps {
  onClose: () => void
  issueType: string
}

export function WhatsAppAlert({ onClose, issueType }: WhatsAppAlertProps) {
  const [whatsapp, setWhatsapp] = useState("")
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  const sendWhatsAppAlert = async () => {
    if (!whatsapp) {
      toast({
        title: "WhatsApp Number Required",
        description: "Please enter your WhatsApp number",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    
    try {
      // Simulate WhatsApp API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "WhatsApp Alert Sent!",
        description: `You'll receive updates about your ${issueType} issue report.`,
      })
      
      // Save user's WhatsApp for future use
      localStorage.setItem('gridpulse_whatsapp', whatsapp)
      
      onClose()
    } catch (err) {
      toast({
        title: "Failed to Send Alert",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <MessageCircle className="h-5 w-5" />
            <span>WhatsApp Alerts</span>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-green-700">
          Get instant updates about your {issueType} issue report via WhatsApp!
        </p>
        
        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp Number</Label>
          <Input
            id="whatsapp"
            placeholder="+254712345678"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
        </div>

        <div className="flex space-x-2">
          <Button 
            onClick={sendWhatsAppAlert} 
            disabled={isSending}
            className="flex-1"
          >
            {isSending ? "Sending..." : "Enable Alerts"}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Skip
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
