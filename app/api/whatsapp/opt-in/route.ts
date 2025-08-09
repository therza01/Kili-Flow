import { type NextRequest, NextResponse } from "next/server"
import { WhatsAppService } from "@/lib/whatsapp-service"
import { DatabaseService } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, name } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
    }

    const formattedPhone = WhatsAppService.formatPhoneNumber(phoneNumber)

    // Create or update user
    await DatabaseService.createUser(formattedPhone, name)

    // Opt in user
    const user = await DatabaseService.optInUser(formattedPhone)

    if (!user) {
      return NextResponse.json({ error: "Failed to opt in user" }, { status: 500 })
    }

    // Send welcome message
    const result = await WhatsAppService.sendTemplate(formattedPhone, "welcome")

    if (result.success) {
      // Log the notification
      await DatabaseService.logNotification(
        user.id,
        "welcome",
        "Welcome to our service! Reply STOP to opt out anytime.",
        result.messageSid,
      )
    }

    return NextResponse.json({
      success: true,
      message: "Successfully opted in for WhatsApp notifications",
      user: {
        id: user.id,
        phoneNumber: user.phone_number,
        name: user.name,
        optedIn: user.opted_in,
      },
    })
  } catch (error) {
    console.error("Opt-in error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
