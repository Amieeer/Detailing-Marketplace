-- Sample data for testing DetailerProfile screen
-- Run this in your PostgreSQL database after creating the schema

-- First, create a detailer user account
-- Password: 'detailer123' (hashed with bcrypt)
INSERT INTO users (id, email, password_hash, role, phone_number, is_verified)
VALUES 
    ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 
     'premium.detailing@example.com', 
     '$2a$10$YourHashedPasswordHere', 
     'detailer', 
     '555-0123', 
     true);

-- Create profile for the detailer
INSERT INTO profiles (user_id, business_name, bio, rating, jobs_completed, service_radius_km, location_coordinates)
VALUES 
    ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
     'Premium Auto Detailing',
     'Professional car detailing service with over 5 years of experience. We specialize in paint correction, ceramic coating, and interior restoration. Your car deserves the best care!',
     4.8,
     127,
     25,
     '{"lat": 40.7128, "lng": -74.0060}');

-- Add some services for this detailer
INSERT INTO services (detailer_id, name, description, price, duration_minutes, is_active)
VALUES 
    ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
     'Basic Wash & Vacuum',
     'Exterior hand wash, tire shine, and interior vacuum. Perfect for regular maintenance.',
     50.00,
     60,
     true),
    
    ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
     'Premium Detail',
     'Complete interior and exterior detail including clay bar treatment, wax, and deep interior cleaning.',
     150.00,
     180,
     true),
    
    ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
     'Ceramic Coating',
     'Professional grade ceramic coating application with 5-year warranty. Includes paint correction.',
     800.00,
     480,
     true);

-- Add another detailer for variety
INSERT INTO users (id, email, password_hash, role, phone_number, is_verified)
VALUES 
    ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 
     'shine.masters@example.com', 
     '$2a$10$YourHashedPasswordHere', 
     'detailer', 
     '555-0456', 
     true);

INSERT INTO profiles (user_id, business_name, bio, rating, jobs_completed, service_radius_km, location_coordinates)
VALUES 
    ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
     'Shine Masters',
     'Mobile detailing specialists bringing professional service to your doorstep. We use eco-friendly products and cutting-edge techniques.',
     4.9,
     203,
     30,
     '{"lat": 40.7580, "lng": -73.9855}');

INSERT INTO services (detailer_id, name, description, price, duration_minutes, is_active)
VALUES 
    ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
     'Express Detail',
     'Quick exterior wash and interior wipe-down. Great for busy schedules.',
     35.00,
     45,
     true),
    
    ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
     'Full Service Detail',
     'Complete detailing package with paint correction, interior shampooing, and engine bay cleaning.',
     200.00,
     240,
     true);

-- Note: To actually use these accounts for login, you'll need to hash the passwords properly
-- You can use bcrypt to generate the password hash or register through the app
