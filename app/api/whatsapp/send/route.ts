import { type NextRequest, NextResponse } from "next/server"
import { WhatsAppService } from "@/lib/whatsapp-service"
import { DatabaseService } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message, messageType = "manual", templateName, variables } = await request.json()

    if (!phoneNumber && !templateName) {
      return NextResponse.json({ error: "Phone number is required for individual messages" }, { status: 400 })
    }

    if (!message && !templateName) {
      return NextResponse.json({ error: "Message content or template name is required" }, { status: 400 })
    }

    const results = []

    if (phoneNumber) {
      // Send to individual user
      const formattedPhone = WhatsAppService.formatPhoneNumber(phoneNumber)
      const user = await DatabaseService.getUser(formattedPhone)

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      if (!user.opted_in) {
        return NextResponse.json({ error: "User has not opted in for notifications" }, { status: 403 })
      }

      let result
      let content

      if (templateName) {
        result = await WhatsAppService.sendTemplate(formattedPhone, templateName, variables)
        content = `Template: ${templateName}`
      } else {
        result = await WhatsAppService.sendMessage({
          to: formattedPhone,
          body: message,
        })
        content = message
      }

      if (result.success) {
        await DatabaseService.logNotification(user.id, messageType, content, result.messageSid)
      }

      results.push({
        phoneNumber: formattedPhone,
        success: result.success,
        messageSid: result.messageSid,
        error: result.error,
      })
    } else if (templateName) {
      // Send to all opted-in users
      const users = await DatabaseService.getAllUsers(true)

      for (const user of users) {
        const result = await WhatsAppService.sendTemplate(user.phone_number, templateName, variables)

        if (result.success) {
          await DatabaseService.logNotification(user.id, messageType, `Template: ${templateName}`, result.messageSid)
        }

        results.push({
          phoneNumber: user.phone_number,
          success: result.success,
          messageSid: result.messageSid,
          error: result.error,
        })

        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    return NextResponse.json({
      success: true,
      results,
      totalSent: results.filter((r) => r.success).length,
      totalFailed: results.filter((r) => !r.success).length,
    })
  } catch (error) {
    console.error("Send notification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
