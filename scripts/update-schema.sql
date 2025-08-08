-- Update users table to include location and estate
ALTER TABLE users ADD COLUMN IF NOT EXISTS location GEOGRAPHY;
ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude FLOAT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude FLOAT;

-- Update community_posts table structure
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS location GEOGRAPHY;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS latitude FLOAT;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS longitude FLOAT;

-- Create index for faster estate-based queries
CREATE INDEX IF NOT EXISTS idx_users_estate ON users(estate);
CREATE INDEX IF NOT EXISTS idx_community_posts_estate ON community_posts(estate);

-- Create estate_stats table for analytics
CREATE TABLE IF NOT EXISTS estate_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate TEXT NOT NULL UNIQUE,
  user_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  issue_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Insert initial estate data for Kilimani sub-areas
INSERT INTO estate_stats (estate, user_count, post_count, issue_count) VALUES
('Yaya Center', 0, 0, 0),
('Woodlands', 0, 0, 0),
('Kileleshwa', 0, 0, 0),
('Lavington', 0, 0, 0),
('Kilimani Central', 0, 0, 0),
('Argwings Kodhek', 0, 0, 0)
ON CONFLICT (estate) DO NOTHING;
