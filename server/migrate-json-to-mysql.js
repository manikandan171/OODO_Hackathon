import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function migrateData() {
  console.log("Connecting to MySQL server for data migration...");

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    port: parseInt(process.env.MYSQL_PORT || "3307"),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "1234",
    database: process.env.MYSQL_DATABASE || "transitops"
  });

  try {
    const dbPath = path.join(process.cwd(), "db.json");
    if (!fs.existsSync(dbPath)) {
      console.log("No db.json found. Nothing to migrate.");
      return;
    }

    const data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

    console.log("Migrating Vehicles...");
    for (const v of data.vehicles || []) {
      await connection.query(
        "INSERT IGNORE INTO vehicles (id, registrationNumber, name, type, maxLoadCapacityKg, odometerKm, acquisitionCost, region, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [v.id, v.registrationNumber, v.name, v.type, v.maxLoadCapacityKg, v.odometerKm, v.acquisitionCost, v.region, v.status, new Date(v.createdAt), new Date(v.updatedAt)]
      );
    }

    console.log("Migrating Drivers...");
    for (const d of data.drivers || []) {
      await connection.query(
        "INSERT IGNORE INTO drivers (id, name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [d.id, d.name, d.licenseNumber, d.licenseCategory, d.licenseExpiryDate, d.contactNumber, d.safetyScore, d.status, new Date(d.createdAt), new Date(d.updatedAt)]
      );
    }

    console.log("Migrating Trips...");
    for (const t of data.trips || []) {
      await connection.query(
        "INSERT IGNORE INTO trips (id, source, destination, vehicleId, driverId, cargoWeightKg, plannedDistanceKm, startOdometerKm, endOdometerKm, fuelConsumedL, revenue, status, createdAt, dispatchedAt, completedAt, cancelledAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [t.id, t.source, t.destination, t.vehicleId, t.driverId, t.cargoWeightKg, t.plannedDistanceKm, t.startOdometerKm, t.endOdometerKm, t.fuelConsumedL, t.revenue, t.status, new Date(t.createdAt), t.dispatchedAt ? new Date(t.dispatchedAt) : null, t.completedAt ? new Date(t.completedAt) : null, t.cancelledAt ? new Date(t.cancelledAt) : null]
      );
    }

    console.log("Migrating Maintenance Logs...");
    for (const m of data.maintenanceLogs || []) {
      await connection.query(
        "INSERT IGNORE INTO maintenance_logs (id, vehicleId, description, cost, status, openedAt, closedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [m.id, m.vehicleId, m.description, m.cost, m.status, new Date(m.openedAt), m.closedAt ? new Date(m.closedAt) : null]
      );
    }

    console.log("Migrating Fuel Logs...");
    for (const f of data.fuelLogs || []) {
      await connection.query(
        "INSERT IGNORE INTO fuel_logs (id, vehicleId, tripId, liters, cost, date) VALUES (?, ?, ?, ?, ?, ?)",
        [f.id, f.vehicleId, f.tripId, f.liters, f.cost, new Date(f.date)]
      );
    }

    console.log("Migrating Expenses...");
    for (const e of data.expenses || []) {
      await connection.query(
        "INSERT IGNORE INTO expenses (id, vehicleId, tripId, category, amount, date, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [e.id, e.vehicleId, e.tripId, e.category, e.amount, new Date(e.date), e.description]
      );
    }

    console.log("Data successfully migrated to MySQL!");

    // Delete the JSON file to prove it's not being used
    fs.unlinkSync(dbPath);
    console.log("Deleted old db.json file.");

  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await connection.end();
  }
}

migrateData();
