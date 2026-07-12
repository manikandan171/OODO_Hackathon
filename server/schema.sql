CREATE DATABASE IF NOT EXISTS transitops;
USE transitops;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  passwordHash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS vehicles (
  id VARCHAR(255) PRIMARY KEY,
  registrationNumber VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  maxLoadCapacityKg INT NOT NULL,
  odometerKm INT NOT NULL,
  acquisitionCost DECIMAL(10,2) NOT NULL,
  region VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS drivers (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  licenseNumber VARCHAR(255) NOT NULL UNIQUE,
  licenseCategory VARCHAR(100) NOT NULL,
  licenseExpiryDate DATE NOT NULL,
  contactNumber VARCHAR(100) NOT NULL,
  safetyScore INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS trips (
  id VARCHAR(255) PRIMARY KEY,
  source VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  vehicleId VARCHAR(255) NOT NULL,
  driverId VARCHAR(255) NOT NULL,
  cargoWeightKg INT NOT NULL,
  plannedDistanceKm INT NOT NULL,
  startOdometerKm INT,
  endOdometerKm INT,
  fuelConsumedL DECIMAL(10,2),
  revenue DECIMAL(10,2),
  status VARCHAR(50) NOT NULL,
  createdAt DATETIME NOT NULL,
  dispatchedAt DATETIME,
  completedAt DATETIME,
  cancelledAt DATETIME,
  FOREIGN KEY (vehicleId) REFERENCES vehicles(id),
  FOREIGN KEY (driverId) REFERENCES drivers(id)
);

CREATE TABLE IF NOT EXISTS maintenance_logs (
  id VARCHAR(255) PRIMARY KEY,
  vehicleId VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  openedAt DATETIME NOT NULL,
  closedAt DATETIME,
  FOREIGN KEY (vehicleId) REFERENCES vehicles(id)
);

CREATE TABLE IF NOT EXISTS fuel_logs (
  id VARCHAR(255) PRIMARY KEY,
  vehicleId VARCHAR(255) NOT NULL,
  tripId VARCHAR(255),
  liters DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  date DATETIME NOT NULL,
  FOREIGN KEY (vehicleId) REFERENCES vehicles(id),
  FOREIGN KEY (tripId) REFERENCES trips(id)
);

CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(255) PRIMARY KEY,
  vehicleId VARCHAR(255),
  tripId VARCHAR(255),
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATETIME NOT NULL,
  description TEXT,
  FOREIGN KEY (vehicleId) REFERENCES vehicles(id),
  FOREIGN KEY (tripId) REFERENCES trips(id)
);

-- Seed Data (Default Users)
INSERT IGNORE INTO users (id, name, email, passwordHash, role) VALUES 
('u-1', 'Sarah Connor', 'fleet.manager@transitops.dev', '$2a$10$B00K5aP0g.OQ8O9.v/Y36.1xYFp8D86L2qL07xS.b2F5c7u3p/PcG', 'FLEET_MANAGER'),
('u-2', 'James Holden', 'dispatcher@transitops.dev', '$2a$10$B00K5aP0g.OQ8O9.v/Y36.1xYFp8D86L2qL07xS.b2F5c7u3p/PcG', 'DISPATCHER'),
('u-3', 'Naomi Nagata', 'safety.officer@transitops.dev', '$2a$10$B00K5aP0g.OQ8O9.v/Y36.1xYFp8D86L2qL07xS.b2F5c7u3p/PcG', 'SAFETY_OFFICER'),
('u-4', 'Chrisjen Avasarala', 'finance.analyst@transitops.dev', '$2a$10$B00K5aP0g.OQ8O9.v/Y36.1xYFp8D86L2qL07xS.b2F5c7u3p/PcG', 'FINANCIAL_ANALYST');

-- Seed Vehicles (varied statuses for demo)
INSERT IGNORE INTO vehicles (id, registrationNumber, name, type, maxLoadCapacityKg, odometerKm, acquisitionCost, region, status, createdAt, updatedAt) VALUES
('v-seed-01', 'VAN-05', 'Ford Transit', 'Van', 500, 12000, 25000, 'North', 'AVAILABLE', NOW(), NOW()),
('v-seed-02', 'TRUCK-01', 'Tata 407', 'Truck', 3000, 45000, 85000, 'South', 'IN_SHOP', NOW(), NOW()),
('v-seed-03', 'BUS-02', 'Ashok Leyland', 'Bus', 5000, 78000, 120000, 'East', 'ON_TRIP', NOW(), NOW()),
('v-seed-04', 'CAR-03', 'Maruti Eeco', 'Car', 400, 95000, 15000, 'West', 'RETIRED', NOW(), NOW()),
('v-seed-05', 'VAN-08', 'Mahindra Supro', 'Van', 750, 8500, 22000, 'North', 'AVAILABLE', NOW(), NOW()),
('v-seed-06', 'TRUCK-12', 'Eicher Pro', 'Truck', 4000, 62000, 95000, 'South', 'AVAILABLE', NOW(), NOW());

-- Seed Drivers (varied statuses including suspended and expired license)
INSERT IGNORE INTO drivers (id, name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status, createdAt, updatedAt) VALUES
('d-seed-01', 'Alex Kumar', 'DL-1001', 'LMV', DATE_ADD(NOW(), INTERVAL 1 YEAR), '+91-9876543210', 95, 'AVAILABLE', NOW(), NOW()),
('d-seed-02', 'Bob Singh', 'DL-2002', 'HMV', DATE_ADD(NOW(), INTERVAL 6 MONTH), '+91-9876543211', 88, 'ON_TRIP', NOW(), NOW()),
('d-seed-03', 'Carol Devi', 'DL-3003', 'LMV', DATE_ADD(NOW(), INTERVAL 2 YEAR), '+91-9876543212', 72, 'SUSPENDED', NOW(), NOW()),
('d-seed-04', 'Dave Patel', 'DL-4004', 'HMV', DATE_ADD(NOW(), INTERVAL 3 MONTH), '+91-9876543213', 90, 'OFF_DUTY', NOW(), NOW()),
('d-seed-05', 'Eve Sharma', 'DL-5005', 'LMV', DATE_SUB(NOW(), INTERVAL 1 MONTH), '+91-9876543214', 85, 'AVAILABLE', NOW(), NOW()),
('d-seed-06', 'Frank Raj', 'DL-6006', 'HMV', DATE_ADD(NOW(), INTERVAL 18 MONTH), '+91-9876543215', 92, 'AVAILABLE', NOW(), NOW());

-- Seed Trips (COMPLETED, DISPATCHED, DRAFT)
INSERT IGNORE INTO trips (id, source, destination, vehicleId, driverId, cargoWeightKg, plannedDistanceKm, startOdometerKm, endOdometerKm, fuelConsumedL, revenue, status, createdAt, dispatchedAt, completedAt, cancelledAt) VALUES
('t-seed-01', 'Chennai', 'Bangalore', 'v-seed-01', 'd-seed-01', 450, 350, 11650, 12000, 28, 15000, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), NULL),
('t-seed-02', 'Mumbai', 'Pune', 'v-seed-03', 'd-seed-02', 4500, 150, 77850, NULL, NULL, 25000, 'DISPATCHED', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), NULL, NULL),
('t-seed-03', 'Delhi', 'Jaipur', 'v-seed-05', 'd-seed-06', 600, 280, NULL, NULL, NULL, 12000, 'DRAFT', NOW(), NULL, NULL, NULL);

-- Seed Maintenance (1 OPEN on Truck-01, 1 CLOSED historical)
INSERT IGNORE INTO maintenance_logs (id, vehicleId, description, cost, status, openedAt, closedAt) VALUES
('m-seed-01', 'v-seed-02', 'Engine Oil Change + Filter Replacement', 4500, 'OPEN', DATE_SUB(NOW(), INTERVAL 1 DAY), NULL),
('m-seed-02', 'v-seed-01', 'Brake Pad Replacement', 3200, 'CLOSED', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY));

-- Seed Fuel Logs
INSERT IGNORE INTO fuel_logs (id, vehicleId, tripId, liters, cost, date) VALUES
('f-seed-01', 'v-seed-01', 't-seed-01', 28, 2520, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('f-seed-02', 'v-seed-03', NULL, 45, 4050, DATE_SUB(NOW(), INTERVAL 5 DAY)),
('f-seed-03', 'v-seed-06', NULL, 60, 5400, DATE_SUB(NOW(), INTERVAL 3 DAY));

-- Seed Expenses
INSERT IGNORE INTO expenses (id, vehicleId, tripId, category, amount, date, description) VALUES
('e-seed-01', 'v-seed-01', 't-seed-01', 'FUEL', 2520, DATE_SUB(NOW(), INTERVAL 2 DAY), 'Trip completion fuel log'),
('e-seed-02', 'v-seed-01', 't-seed-01', 'TOLL', 350, DATE_SUB(NOW(), INTERVAL 2 DAY), 'Chennai-Bangalore toll charges'),
('e-seed-03', 'v-seed-02', NULL, 'MAINTENANCE', 4500, DATE_SUB(NOW(), INTERVAL 1 DAY), 'Engine oil change'),
('e-seed-04', 'v-seed-03', NULL, 'FUEL', 4050, DATE_SUB(NOW(), INTERVAL 5 DAY), 'Manual Fuel Intake');
