import twilio from "twilio"

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER

if (!accountSid || !authToken || !whatsappNumber) {
  throw new Error("Missing required Twilio environment variables")
}

const client = twilio(accountSid, authToken)

export interface WhatsAppMessage {
  to: string
  body: string
  mediaUrl?: string
}

export class WhatsAppService {
  static async sendMessage({ to, body, mediaUrl }: WhatsAppMessage) {
    try {
      const message = await client.messages.create({
        from: `whatsapp:${whatsappNumber}`,
        to: `whatsapp:${to}`,
        body,
        ...(mediaUrl && { mediaUrl: [mediaUrl] }),
      })

      return {
        success: true,
        messageSid: message.sid,
        status: message.status,
      }
    } catch (error) {
      console.error("WhatsApp send error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  static async sendTemplate(to: string, templateName: string, variables: Record<string, any> = {}) {
    // In a real implementation, you'd fetch the template from the database
    // and replace variables in the content
    const templates = {
      welcome: "Welcome to our service! Reply STOP to opt out anytime.",
      order_confirmation: `Your order #${variables.order_id} has been confirmed. Total: $${variables.amount}`,
      appointment_reminder: `Reminder: You have an appointment on ${variables.date} at ${variables.time}. Reply STOP to opt out.`,
      promotional: `Special offer: ${variables.offer_text} Valid until ${variables.expiry_date}. Reply STOP to opt out.`,
    }

    const body = templates[templateName as keyof typeof templates] || templates.welcome

    return this.sendMessage({ to, body })
  }

  static formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, "")

    // Add country code if not present (assuming US +1)
    if (cleaned.length === 10) {
      return `+1${cleaned}`
    } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return `+${cleaned}`
    }

    return `+${cleaned}`
  }
}
