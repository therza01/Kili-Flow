import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface WhatsAppUser {
  id: number
  phone_number: string
  name?: string
  opted_in: boolean
  opted_in_at?: Date
  opted_out_at?: Date
  created_at: Date
  updated_at: Date
}

export interface Notification {
  id: number
  user_id: number
  message_sid?: string
  message_type: string
  content: string
  status: string
  sent_at: Date
  delivered_at?: Date
  read_at?: Date
  failed_at?: Date
  error_message?: string
}

export class DatabaseService {
  static async createUser(phoneNumber: string, name?: string): Promise<WhatsAppUser> {
    const [user] = await sql`
      INSERT INTO whatsapp_users (phone_number, name)
      VALUES (${phoneNumber}, ${name})
      ON CONFLICT (phone_number) 
      DO UPDATE SET name = COALESCE(${name}, whatsapp_users.name), updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `
    return user as WhatsAppUser
  }

  static async optInUser(phoneNumber: string): Promise<WhatsAppUser | null> {
    const [user] = await sql`
      UPDATE whatsapp_users 
      SET opted_in = true, opted_in_at = CURRENT_TIMESTAMP, opted_out_at = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE phone_number = ${phoneNumber}
      RETURNING *
    `
    return (user as WhatsAppUser) || null
  }

  static async optOutUser(phoneNumber: string): Promise<WhatsAppUser | null> {
    const [user] = await sql`
      UPDATE whatsapp_users 
      SET opted_in = false, opted_out_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE phone_number = ${phoneNumber}
      RETURNING *
    `
    return (user as WhatsAppUser) || null
  }

  static async getUser(phoneNumber: string): Promise<WhatsAppUser | null> {
    const [user] = await sql`
      SELECT * FROM whatsapp_users WHERE phone_number = ${phoneNumber}
    `
    return (user as WhatsAppUser) || null
  }

  static async getAllUsers(optedInOnly = false): Promise<WhatsAppUser[]> {
    if (optedInOnly) {
      return (await sql`
        SELECT * FROM whatsapp_users WHERE opted_in = true ORDER BY created_at DESC
      `) as WhatsAppUser[]
    }
    return (await sql`
      SELECT * FROM whatsapp_users ORDER BY created_at DESC
    `) as WhatsAppUser[]
  }

  static async logNotification(
    userId: number,
    messageType: string,
    content: string,
    messageSid?: string,
  ): Promise<Notification> {
    const [notification] = await sql`
      INSERT INTO notifications (user_id, message_type, content, message_sid)
      VALUES (${userId}, ${messageType}, ${content}, ${messageSid})
      RETURNING *
    `
    return notification as Notification
  }

  static async updateNotificationStatus(messageSid: string, status: string, errorMessage?: string): Promise<void> {
    const updateFields: any = { status }

    if (status === "delivered") {
      updateFields.delivered_at = new Date()
    } else if (status === "read") {
      updateFields.read_at = new Date()
    } else if (status === "failed") {
      updateFields.failed_at = new Date()
      if (errorMessage) {
        updateFields.error_message = errorMessage
      }
    }

    await sql`
      UPDATE notifications 
      SET status = ${status}, 
          delivered_at = ${updateFields.delivered_at || null},
          read_at = ${updateFields.read_at || null},
          failed_at = ${updateFields.failed_at || null},
          error_message = ${updateFields.error_message || null}
      WHERE message_sid = ${messageSid}
    `
  }

  static async getNotifications(limit = 50): Promise<(Notification & { user_name?: string; user_phone?: string })[]> {
    return (await sql`
      SELECT n.*, u.name as user_name, u.phone_number as user_phone
      FROM notifications n
      JOIN whatsapp_users u ON n.user_id = u.id
      ORDER BY n.sent_at DESC
      LIMIT ${limit}
    `) as (Notification & { user_name?: string; user_phone?: string })[]
  }
}
