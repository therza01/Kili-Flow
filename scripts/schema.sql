-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  whatsapp TEXT,
  estate TEXT DEFAULT 'Kilimani',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Issues table
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'reported',
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Community Posts table
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  estate TEXT DEFAULT 'Kilimani',
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Businesses table
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  estate TEXT DEFAULT 'Kilimani',
  image_url TEXT,
  contact TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (hackathon mode)
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on issues" ON issues FOR ALL USING (true);
CREATE POLICY "Allow all operations on community_posts" ON community_posts FOR ALL USING (true);
CREATE POLICY "Allow all operations on businesses" ON businesses FOR ALL USING (true);
