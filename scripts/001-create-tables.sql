-- Create users table for managing WhatsApp subscribers
CREATE TABLE IF NOT EXISTS whatsapp_users (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100),
    opted_in BOOLEAN DEFAULT false,
    opted_in_at TIMESTAMP,
    opted_out_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table for tracking sent messages
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES whatsapp_users(id),
    message_sid VARCHAR(100),
    message_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    failed_at TIMESTAMP,
    error_message TEXT
);

-- Create notification templates table
CREATE TABLE IF NOT EXISTS notification_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    variables JSONB,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some default templates
INSERT INTO notification_templates (name, type, content, variables) VALUES
('welcome', 'welcome', 'Welcome to our service! Reply STOP to opt out anytime.', '{}'),
('order_confirmation', 'transactional', 'Your order #{{order_id}} has been confirmed. Total: ${{amount}}', '{"order_id": "string", "amount": "number"}'),
('appointment_reminder', 'reminder', 'Reminder: You have an appointment on {{date}} at {{time}}. Reply STOP to opt out.', '{"date": "string", "time": "string"}'),
('promotional', 'marketing', 'Special offer: {{offer_text}} Valid until {{expiry_date}}. Reply STOP to opt out.', '{"offer_text": "string", "expiry_date": "string"}');
