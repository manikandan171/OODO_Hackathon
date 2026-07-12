CREATE DATABASE IF NOT EXISTS transitops;
USE transitops;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
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
INSERT IGNORE INTO users (id, name, email, password, role) VALUES 
('u-1', 'Sarah Connor', 'fleet.manager@transitops.dev', '$2a$10$B00K5aP0g.OQ8O9.v/Y36.1xYFp8D86L2qL07xS.b2F5c7u3p/PcG', 'FLEET_MANAGER'),
('u-2', 'James Holden', 'dispatcher@transitops.dev', '$2a$10$B00K5aP0g.OQ8O9.v/Y36.1xYFp8D86L2qL07xS.b2F5c7u3p/PcG', 'DISPATCHER'),
('u-3', 'Naomi Nagata', 'safety.officer@transitops.dev', '$2a$10$B00K5aP0g.OQ8O9.v/Y36.1xYFp8D86L2qL07xS.b2F5c7u3p/PcG', 'SAFETY_OFFICER'),
('u-4', 'Chrisjen Avasarala', 'finance.analyst@transitops.dev', '$2a$10$B00K5aP0g.OQ8O9.v/Y36.1xYFp8D86L2qL07xS.b2F5c7u3p/PcG', 'FINANCIAL_ANALYST');
