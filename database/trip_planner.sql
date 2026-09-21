-- TripPlanner database: tables + sample data.
-- Warning: importing this file again deletes all existing TripPlanner data.

CREATE DATABASE IF NOT EXISTS trip_planner CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE trip_planner;

DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS destinations;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS featured_places;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE trips (
    trip_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    trip_name VARCHAR(150) NOT NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    budget DECIMAL(10,2) NULL,
    is_shared TINYINT(1) NOT NULL DEFAULT 0,
    share_code VARCHAR(32) NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_trip_dates CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date),
    CONSTRAINT chk_trip_budget CHECK (budget IS NULL OR budget >= 0)
) ENGINE=InnoDB;

CREATE TABLE destinations (
    destination_id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    location_name VARCHAR(150) NOT NULL,
    arrival_date DATE NULL,
    departure_date DATE NULL,
    notes TEXT,
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE,
    CONSTRAINT chk_dest_dates CHECK (arrival_date IS NULL OR departure_date IS NULL OR departure_date >= arrival_date)
) ENGINE=InnoDB;

CREATE TABLE activities (
    activity_id INT AUTO_INCREMENT PRIMARY KEY,
    destination_id INT NOT NULL,
    activity_name VARCHAR(150) NOT NULL,
    category VARCHAR(30) NOT NULL DEFAULT 'other',
    estimated_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (destination_id) REFERENCES destinations(destination_id) ON DELETE CASCADE,
    CONSTRAINT chk_activity_category CHECK (category IN ('flight','accommodation','transport','food','sightseeing','other')),
    CONSTRAINT chk_activity_cost CHECK (estimated_cost >= 0)
) ENGINE=InnoDB;

CREATE TABLE featured_places (
    place_id INT AUTO_INCREMENT PRIMARY KEY,
    place_name VARCHAR(100) NOT NULL,
    country VARCHAR(100),
    description VARCHAR(255),
    image_url VARCHAR(500) NOT NULL
) ENGINE=InnoDB;

INSERT INTO featured_places (place_name, country, description, image_url) VALUES
('Tokyo', 'Japan', 'Neon streets, calm temples and world-class food.', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80&auto=format&fit=crop'),
('Paris', 'France', 'The Eiffel Tower, riverside cafes and art museums.', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80&auto=format&fit=crop'),
('Bali', 'Indonesia', 'Temples, rice terraces and warm beaches.', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80&auto=format&fit=crop'),
('Sydney', 'Australia', 'The Opera House, Harbour Bridge and Bondi Beach.', 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&q=80&auto=format&fit=crop'),
('New York', 'USA', 'Times Square, Central Park and Broadway shows.', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80&auto=format&fit=crop'),
('Rome', 'Italy', 'The Colosseum, ancient history and real Italian pasta.', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80&auto=format&fit=crop'),
('Santorini', 'Greece', 'White houses, blue domes and famous sunsets.', 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80&auto=format&fit=crop'),
('London', 'United Kingdom', 'Tower Bridge, royal palaces and free museums.', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80&auto=format&fit=crop');

-- Demo login: demo@example.com / demo1234
INSERT INTO users (user_id, full_name, email, password_hash) VALUES
(1, 'Demo Traveller', 'demo@example.com', '$2y$12$qfcB50n4cY5qPiKSlKuaeOUfFApFgpJN.QIiawjVoFQr1aPAwVzdG');

INSERT INTO trips (trip_id, user_id, trip_name, start_date, end_date, budget, is_shared, share_code) VALUES
(1, 1, 'Japan Autumn Trip', '2026-11-05', '2026-11-14', 4500.00, 1, 'a1b2c3d4e5f60718293a4b5c'),
(2, 1, 'Melbourne Weekend', '2026-10-16', '2026-10-18', 500.00, 0, NULL);

INSERT INTO destinations (destination_id, trip_id, location_name, arrival_date, departure_date, notes) VALUES
(1, 1, 'Tokyo', '2026-11-05', '2026-11-09', 'Stay near Shinjuku station. Buy a Suica card at the airport.'),
(2, 1, 'Kyoto', '2026-11-09', '2026-11-12', 'Visit Fushimi Inari early in the morning to avoid the crowds.'),
(3, 1, 'Osaka', '2026-11-12', '2026-11-14', 'Try the street food in Dotonbori.'),
(4, 2, 'Melbourne CBD', '2026-10-16', '2026-10-18', 'Trams are free inside the city centre.');

INSERT INTO activities (destination_id, activity_name, category, estimated_cost) VALUES
(1, 'Flight Sydney to Tokyo', 'flight', 1250.00),
(1, 'Hotel in Shinjuku (4 nights)', 'accommodation', 720.00),
(1, 'teamLab Planets', 'sightseeing', 45.00),
(1, 'Sushi dinner', 'food', 80.00),
(2, 'Shinkansen Tokyo to Kyoto', 'transport', 140.00),
(2, 'Ryokan (3 nights)', 'accommodation', 540.00),
(2, 'Fushimi Inari Shrine', 'sightseeing', 0.00),
(3, 'Dotonbori street food', 'food', 60.00),
(3, 'Flight Osaka to Sydney', 'flight', 980.00),
(4, 'Flight Sydney to Melbourne', 'flight', 180.00),
(4, 'Hotel in the CBD (2 nights)', 'accommodation', 320.00),
(4, 'Queen Victoria Market', 'food', 40.00);
