import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"
import { WhatsAppService } from "@/lib/whatsapp-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const params = new URLSearchParams(body)

    const messageSid = params.get("MessageSid")
    const messageStatus = params.get("MessageStatus")
    const from = params.get("From")
    const messageBody = params.get("Body")
    const errorMessage = params.get("ErrorMessage")

    console.log("Webhook received:", { messageSid, messageStatus, from, messageBody })

    // Handle message status updates
    if (messageSid && messageStatus) {
      await DatabaseService.updateNotificationStatus(messageSid, messageStatus, errorMessage || undefined)
    }

    // Handle incoming messages (opt-out requests)
    if (from && messageBody) {
      const phoneNumber = from.replace("whatsapp:", "")
      const message = messageBody.toLowerCase().trim()

      if (message === "stop" || message === "unsubscribe") {
        const user = await DatabaseService.optOutUser(phoneNumber)

        if (user) {
          // Send confirmation message
          await WhatsAppService.sendMessage({
            to: phoneNumber,
            body: "You have been unsubscribed from WhatsApp notifications. Reply START to opt back in.",
          })
        }
      } else if (message === "start" || message === "subscribe") {
        const user = await DatabaseService.optInUser(phoneNumber)

        if (user) {
          // Send welcome message
          await WhatsAppService.sendMessage({
            to: phoneNumber,
            body: "Welcome back! You are now subscribed to WhatsApp notifications. Reply STOP to opt out anytime.",
          })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
