-- GridPulse MySQL Database Schema
-- Run this in phpMyAdmin or MySQL CLI

CREATE DATABASE IF NOT EXISTS gridpulse;
USE gridpulse;

-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  whatsapp VARCHAR(20),
  estate VARCHAR(100) DEFAULT 'Kilimani',
  latitude FLOAT DEFAULT -1.2860,
  longitude FLOAT DEFAULT 36.7871,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Issues table
CREATE TABLE issues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  location VARCHAR(100) DEFAULT 'Kilimani',
  photo_url TEXT,
  status VARCHAR(50) DEFAULT 'reported',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Community Posts table
CREATE TABLE community_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  estate VARCHAR(100) DEFAULT 'Kilimani',
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Businesses table
CREATE TABLE businesses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  estate VARCHAR(100) DEFAULT 'Kilimani',
  image_url TEXT,
  contact TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (name, whatsapp, estate) VALUES
('John Doe', '+254712345678', 'Kilimani'),
('Jane Smith', '+254723456789', 'Kilimani'),
('Mike Johnson', '+254734567890', 'Westlands');

INSERT INTO issues (user_id, type, description, latitude, longitude, location, status) VALUES
(1, 'Power', 'Complete power outage affecting entire block', -1.2860, 36.7871, 'Kilimani Road', 'investigating'),
(2, 'Water', 'Low water pressure in apartment buildings', -1.2870, 36.7881, 'Argwings Kodhek Road', 'reported'),
(3, 'Internet', 'Fiber internet connection restored', -1.2850, 36.7861, 'Ralph Bunche Road', 'resolved');

INSERT INTO community_posts (user_id, estate, content) VALUES
(1, 'Kilimani', 'Anyone else experiencing power issues on Kilimani Road? It has been out for 2 hours now.'),
(2, 'Kilimani', 'Water truck will be at the community center tomorrow at 10 AM for those affected by the water shortage.'),
(3, 'Kilimani', 'Great news! The internet connectivity issues have been resolved. Thanks to everyone for reporting.');

INSERT INTO businesses (name, description, estate, contact) VALUES
('Kilimani Hardware', 'Your one-stop shop for all hardware needs. Quality tools and materials.', 'Kilimani', '+254712000001'),
('Fresh Groceries', 'Fresh fruits and vegetables daily. Farm to table quality.', 'Kilimani', '+254712000002'),
('Tech Repair Hub', 'Professional phone and laptop repair services. Quick turnaround.', 'Kilimani', '+254712000003');