-- Insert sample users
INSERT INTO users (name, whatsapp, estate) VALUES
('John Doe', '+254712345678', 'Kilimani'),
('Jane Smith', '+254723456789', 'Kilimani'),
('Mike Johnson', '+254734567890', 'Westlands');

-- Insert sample issues
INSERT INTO issues (type, description, latitude, longitude, location, status) VALUES
('Power', 'Complete power outage affecting entire block', -1.2860, 36.7871, 'Kilimani Road', 'investigating'),
('Water', 'Low water pressure in apartment buildings', -1.2870, 36.7881, 'Argwings Kodhek Road', 'reported'),
('Internet', 'Fiber internet connection down', -1.2850, 36.7861, 'Ralph Bunche Road', 'resolved');

-- Insert sample community posts
INSERT INTO community_posts (user_id, estate, content) VALUES
((SELECT id FROM users WHERE name = 'John Doe'), 'Kilimani', 'Anyone else experiencing power issues on Kilimani Road?'),
((SELECT id FROM users WHERE name = 'Jane Smith'), 'Kilimani', 'Water truck will be at the community center tomorrow at 10 AM');

-- Insert sample businesses
INSERT INTO businesses (name, description, estate, contact) VALUES
('Kilimani Hardware', 'Your one-stop shop for all hardware needs', 'Kilimani', '+254712000001'),
('Fresh Groceries', 'Fresh fruits and vegetables daily', 'Kilimani', '+254712000002'),
('Tech Repair Hub', 'Phone and laptop repair services', 'Kilimani', '+254712000003');
