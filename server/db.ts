import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export enum Role {
  FLEET_MANAGER = "FLEET_MANAGER",
  DISPATCHER = "DISPATCHER",
  SAFETY_OFFICER = "SAFETY_OFFICER",
  FINANCIAL_ANALYST = "FINANCIAL_ANALYST"
}

export enum VehicleStatus {
  AVAILABLE = "AVAILABLE",
  ON_TRIP = "ON_TRIP",
  IN_SHOP = "IN_SHOP",
  RETIRED = "RETIRED"
}

export enum DriverStatus {
  AVAILABLE = "AVAILABLE",
  ON_TRIP = "ON_TRIP",
  OFF_DUTY = "OFF_DUTY",
  SUSPENDED = "SUSPENDED"
}

export enum TripStatus {
  DRAFT = "DRAFT",
  DISPATCHED = "DISPATCHED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export enum MaintenanceStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED"
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  name: string;
  type: string;
  maxLoadCapacityKg: number;
  odometerKm: number;
  acquisitionCost: number;
  region: string;
  status: VehicleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiryDate: string;
  contactNumber: string;
  safetyScore: number;
  status: DriverStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeightKg: number;
  plannedDistanceKm: number;
  startOdometerKm: number | null;
  endOdometerKm: number | null;
  fuelConsumedL: number | null;
  revenue: number | null;
  status: TripStatus;
  createdAt: string;
  dispatchedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  description: string;
  cost: number;
  status: MaintenanceStatus;
  openedAt: string;
  closedAt: string | null;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  tripId: string | null;
  liters: number;
  cost: number;
  date: string;
}

export interface Expense {
  id: string;
  vehicleId: string | null;
  tripId: string | null;
  category: "TOLL" | "MISC" | "MAINTENANCE" | "FUEL" | "OTHER";
  amount: number;
  date: string;
  description: string | null;
}

// MySQL Database Connection Pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  port: parseInt(process.env.MYSQL_PORT || "3306"),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "transitops",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

class MySQLDatabase {
  // QUERY HELPERS
  public async getUsers(): Promise<User[]> {
    const [rows] = await pool.query("SELECT * FROM users");
    return rows as User[];
  }

  public async getUserByEmail(email: string): Promise<User | undefined> {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    const users = rows as User[];
    return users[0];
  }

  public async getVehicles(): Promise<Vehicle[]> {
    const [rows] = await pool.query("SELECT * FROM vehicles");
    return rows as Vehicle[];
  }

  public async getDrivers(): Promise<Driver[]> {
    const [rows] = await pool.query("SELECT * FROM drivers");
    return rows as Driver[];
  }

  public async getTrips(): Promise<Trip[]> {
    const [rows] = await pool.query("SELECT * FROM trips");
    return rows as Trip[];
  }

  public async getMaintenanceLogs(): Promise<MaintenanceLog[]> {
    const [rows] = await pool.query("SELECT * FROM maintenance_logs");
    return rows as MaintenanceLog[];
  }

  public async getFuelLogs(): Promise<FuelLog[]> {
    const [rows] = await pool.query("SELECT * FROM fuel_logs");
    return rows as FuelLog[];
  }

  public async getExpenses(): Promise<Expense[]> {
    const [rows] = await pool.query("SELECT * FROM expenses");
    return rows as Expense[];
  }

  // CREATE / EDIT ENTITIES
  public async addVehicle(vehicle: Omit<Vehicle, "id" | "createdAt" | "updatedAt">): Promise<Vehicle> {
    const [existing] = await pool.query("SELECT * FROM vehicles WHERE registrationNumber = ?", [vehicle.registrationNumber]);
    if ((existing as any[]).length > 0) {
      throw new Error(`Vehicle with registration number '${vehicle.registrationNumber}' already exists.`);
    }

    const id = "v-" + Math.random().toString(36).substring(2, 9);
    const now = new Date();
    
    await pool.query(
      "INSERT INTO vehicles (id, registrationNumber, name, type, maxLoadCapacityKg, odometerKm, acquisitionCost, region, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, vehicle.registrationNumber, vehicle.name, vehicle.type, vehicle.maxLoadCapacityKg, vehicle.odometerKm, vehicle.acquisitionCost, vehicle.region, vehicle.status, now, now]
    );

    return { ...vehicle, id, createdAt: now.toISOString(), updatedAt: now.toISOString() };
  }

  public async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle> {
    const [rows] = await pool.query("SELECT * FROM vehicles WHERE id = ?", [id]);
    const vehicles = rows as Vehicle[];
    if (vehicles.length === 0) throw new Error("Vehicle not found");
    const vehicle = vehicles[0];

    if (updates.registrationNumber && updates.registrationNumber !== vehicle.registrationNumber) {
      const [dupe] = await pool.query("SELECT * FROM vehicles WHERE registrationNumber = ? AND id != ?", [updates.registrationNumber, id]);
      if ((dupe as any[]).length > 0) throw new Error("Registration number already exists");
    }

    const merged = { ...vehicle, ...updates, updatedAt: new Date() };
    await pool.query(
      "UPDATE vehicles SET registrationNumber=?, name=?, type=?, maxLoadCapacityKg=?, odometerKm=?, acquisitionCost=?, region=?, status=?, updatedAt=? WHERE id=?",
      [merged.registrationNumber, merged.name, merged.type, merged.maxLoadCapacityKg, merged.odometerKm, merged.acquisitionCost, merged.region, merged.status, merged.updatedAt, id]
    );
    
    return { ...merged, updatedAt: merged.updatedAt.toISOString() };
  }

  public async retireVehicle(id: string): Promise<Vehicle> {
    const [rows] = await pool.query("SELECT * FROM vehicles WHERE id = ?", [id]);
    const vehicles = rows as Vehicle[];
    if (vehicles.length === 0) throw new Error("Vehicle not found");
    
    const vehicle = vehicles[0];
    if (vehicle.status === VehicleStatus.ON_TRIP) {
      throw new Error("Cannot retire a vehicle currently out on a trip!");
    }
    
    await pool.query("UPDATE vehicles SET status=?, updatedAt=? WHERE id=?", [VehicleStatus.RETIRED, new Date(), id]);
    vehicle.status = VehicleStatus.RETIRED;
    return vehicle;
  }

  public async addDriver(driver: Omit<Driver, "id" | "createdAt" | "updatedAt">): Promise<Driver> {
    const [existing] = await pool.query("SELECT * FROM drivers WHERE licenseNumber = ?", [driver.licenseNumber]);
    if ((existing as any[]).length > 0) {
      throw new Error(`Driver with license number '${driver.licenseNumber}' already exists.`);
    }

    const id = "d-" + Math.random().toString(36).substring(2, 9);
    const now = new Date();
    
    await pool.query(
      "INSERT INTO drivers (id, name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, driver.name, driver.licenseNumber, driver.licenseCategory, driver.licenseExpiryDate, driver.contactNumber, driver.safetyScore, driver.status, now, now]
    );

    return { ...driver, id, createdAt: now.toISOString(), updatedAt: now.toISOString() };
  }

  public async updateDriver(id: string, updates: Partial<Driver>): Promise<Driver> {
    const [rows] = await pool.query("SELECT * FROM drivers WHERE id = ?", [id]);
    const drivers = rows as Driver[];
    if (drivers.length === 0) throw new Error("Driver not found");
    const driver = drivers[0];

    if (updates.licenseNumber && updates.licenseNumber !== driver.licenseNumber) {
      const [dupe] = await pool.query("SELECT * FROM drivers WHERE licenseNumber = ? AND id != ?", [updates.licenseNumber, id]);
      if ((dupe as any[]).length > 0) throw new Error("License number already exists");
    }

    const merged = { ...driver, ...updates, updatedAt: new Date() };
    await pool.query(
      "UPDATE drivers SET name=?, licenseNumber=?, licenseCategory=?, licenseExpiryDate=?, contactNumber=?, safetyScore=?, status=?, updatedAt=? WHERE id=?",
      [merged.name, merged.licenseNumber, merged.licenseCategory, merged.licenseExpiryDate, merged.contactNumber, merged.safetyScore, merged.status, merged.updatedAt, id]
    );
    
    return { ...merged, updatedAt: merged.updatedAt.toISOString() };
  }

  public async suspendDriver(id: string, suspend: boolean): Promise<Driver> {
    const [rows] = await pool.query("SELECT * FROM drivers WHERE id = ?", [id]);
    const drivers = rows as Driver[];
    if (drivers.length === 0) throw new Error("Driver not found");
    
    const driver = drivers[0];
    if (suspend && driver.status === DriverStatus.ON_TRIP) {
      throw new Error("Cannot suspend a driver currently mid-trip!");
    }

    const newStatus = suspend ? DriverStatus.SUSPENDED : DriverStatus.AVAILABLE;
    await pool.query("UPDATE drivers SET status=?, updatedAt=? WHERE id=?", [newStatus, new Date(), id]);
    driver.status = newStatus;
    return driver;
  }

  // TRIPS
  public async createTrip(tripData: Omit<Trip, "id" | "status" | "createdAt" | "dispatchedAt" | "completedAt" | "cancelledAt" | "startOdometerKm" | "endOdometerKm" | "fuelConsumedL">): Promise<Trip> {
    const [vRows] = await pool.query("SELECT * FROM vehicles WHERE id = ?", [tripData.vehicleId]);
    const vehicles = vRows as Vehicle[];
    if (vehicles.length === 0) throw new Error("Selected vehicle does not exist");
    const vehicle = vehicles[0];

    const [dRows] = await pool.query("SELECT * FROM drivers WHERE id = ?", [tripData.driverId]);
    const drivers = dRows as Driver[];
    if (drivers.length === 0) throw new Error("Selected driver does not exist");
    const driver = drivers[0];

    if (tripData.cargoWeightKg > vehicle.maxLoadCapacityKg) {
      throw new Error(`Cargo weight (${tripData.cargoWeightKg}kg) exceeds capacity of vehicle (${vehicle.maxLoadCapacityKg}kg).`);
    }

    if (new Date(driver.licenseExpiryDate) < new Date()) {
      throw new Error(`Driver ${driver.name}'s license has expired.`);
    }

    if (driver.status === DriverStatus.SUSPENDED || driver.status === DriverStatus.OFF_DUTY) {
      throw new Error(`Driver ${driver.name} is unavailable (${driver.status}).`);
    }

    const id = "t-" + Math.random().toString(36).substring(2, 9);
    const now = new Date();

    await pool.query(
      "INSERT INTO trips (id, source, destination, vehicleId, driverId, cargoWeightKg, plannedDistanceKm, startOdometerKm, endOdometerKm, fuelConsumedL, revenue, status, createdAt, dispatchedAt, completedAt, cancelledAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, tripData.source, tripData.destination, tripData.vehicleId, tripData.driverId, tripData.cargoWeightKg, tripData.plannedDistanceKm, null, null, null, tripData.revenue || 0, TripStatus.DRAFT, now, null, null, null]
    );

    return { ...tripData, id, revenue: tripData.revenue || 0, status: TripStatus.DRAFT, createdAt: now.toISOString(), startOdometerKm: null, endOdometerKm: null, fuelConsumedL: null, dispatchedAt: null, completedAt: null, cancelledAt: null };
  }

  public async dispatchTrip(id: string): Promise<Trip> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const [tRows] = await connection.query("SELECT * FROM trips WHERE id = ? FOR UPDATE", [id]);
      const trips = tRows as Trip[];
      if (trips.length === 0) throw new Error("Trip not found");
      const trip = trips[0];

      if (trip.status !== TripStatus.DRAFT) throw new Error("Only Draft trips can be dispatched");

      const [vRows] = await connection.query("SELECT * FROM vehicles WHERE id = ? FOR UPDATE", [trip.vehicleId]);
      const vehicle = (vRows as Vehicle[])[0];
      
      const [dRows] = await connection.query("SELECT * FROM drivers WHERE id = ? FOR UPDATE", [trip.driverId]);
      const driver = (dRows as Driver[])[0];

      if (vehicle.status !== VehicleStatus.AVAILABLE) throw new Error(`Vehicle ${vehicle.registrationNumber} is unavailable`);
      if (driver.status !== DriverStatus.AVAILABLE) throw new Error(`Driver ${driver.name} is unavailable`);
      if (new Date(driver.licenseExpiryDate) < new Date()) throw new Error(`Driver ${driver.name}'s license expired`);

      const now = new Date();
      await connection.query("UPDATE trips SET status=?, dispatchedAt=?, startOdometerKm=? WHERE id=?", [TripStatus.DISPATCHED, now, vehicle.odometerKm, id]);
      await connection.query("UPDATE vehicles SET status=?, updatedAt=? WHERE id=?", [VehicleStatus.ON_TRIP, now, vehicle.id]);
      await connection.query("UPDATE drivers SET status=?, updatedAt=? WHERE id=?", [DriverStatus.ON_TRIP, now, driver.id]);
      
      await connection.commit();
      trip.status = TripStatus.DISPATCHED;
      trip.dispatchedAt = now.toISOString();
      trip.startOdometerKm = vehicle.odometerKm;
      return trip;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  public async completeTrip(id: string, endOdometerKm: number, fuelConsumedL: number, fuelCost: number, revenue: number): Promise<Trip> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const [tRows] = await connection.query("SELECT * FROM trips WHERE id = ? FOR UPDATE", [id]);
      const trips = tRows as Trip[];
      if (trips.length === 0) throw new Error("Trip not found");
      const trip = trips[0];

      if (trip.status !== TripStatus.DISPATCHED) throw new Error("Only active Dispatched trips can be completed");
      if (endOdometerKm < (trip.startOdometerKm ?? 0)) throw new Error("Ending odometer cannot be less than starting odometer");

      const now = new Date();
      
      await connection.query(
        "UPDATE trips SET status=?, completedAt=?, endOdometerKm=?, fuelConsumedL=?, revenue=? WHERE id=?",
        [TripStatus.COMPLETED, now, endOdometerKm, fuelConsumedL, revenue, id]
      );
      await connection.query("UPDATE vehicles SET status=?, odometerKm=?, updatedAt=? WHERE id=?", [VehicleStatus.AVAILABLE, endOdometerKm, now, trip.vehicleId]);
      await connection.query("UPDATE drivers SET status=?, updatedAt=? WHERE id=?", [DriverStatus.AVAILABLE, now, trip.driverId]);

      if (fuelConsumedL > 0) {
        const fId = "f-" + Math.random().toString(36).substring(2, 9);
        await connection.query(
          "INSERT INTO fuel_logs (id, vehicleId, tripId, liters, cost, date) VALUES (?, ?, ?, ?, ?, ?)",
          [fId, trip.vehicleId, trip.id, fuelConsumedL, fuelCost, now]
        );
        
        const eId = "e-" + Math.random().toString(36).substring(2, 9);
        await connection.query(
          "INSERT INTO expenses (id, vehicleId, tripId, category, amount, date, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [eId, trip.vehicleId, trip.id, "FUEL", fuelCost, now, `Trip completion fuel log`]
        );
      }

      await connection.commit();
      trip.status = TripStatus.COMPLETED;
      return trip;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  public async cancelTrip(id: string): Promise<Trip> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [tRows] = await connection.query("SELECT * FROM trips WHERE id = ? FOR UPDATE", [id]);
      const trips = tRows as Trip[];
      if (trips.length === 0) throw new Error("Trip not found");
      const trip = trips[0];

      if (trip.status === TripStatus.COMPLETED || trip.status === TripStatus.CANCELLED) {
        throw new Error("Cannot cancel completed or already cancelled trip");
      }

      const wasDispatched = trip.status === TripStatus.DISPATCHED;
      const now = new Date();

      await connection.query("UPDATE trips SET status=?, cancelledAt=? WHERE id=?", [TripStatus.CANCELLED, now, id]);

      if (wasDispatched) {
        await connection.query("UPDATE vehicles SET status=?, updatedAt=? WHERE id=? AND status=?", [VehicleStatus.AVAILABLE, now, trip.vehicleId, VehicleStatus.ON_TRIP]);
        await connection.query("UPDATE drivers SET status=?, updatedAt=? WHERE id=? AND status=?", [DriverStatus.AVAILABLE, now, trip.driverId, DriverStatus.ON_TRIP]);
      }

      await connection.commit();
      trip.status = TripStatus.CANCELLED;
      return trip;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  // MAINTENANCE
  public async openMaintenance(vehicleId: string, description: string, cost: number): Promise<MaintenanceLog> {
    const [vRows] = await pool.query("SELECT * FROM vehicles WHERE id = ?", [vehicleId]);
    if ((vRows as any[]).length === 0) throw new Error("Vehicle not found");
    const vehicle = (vRows as Vehicle[])[0];

    if (vehicle.status !== VehicleStatus.AVAILABLE) throw new Error(`Vehicle is ${vehicle.status}`);

    const id = "m-" + Math.random().toString(36).substring(2, 9);
    const now = new Date();

    await pool.query("UPDATE vehicles SET status=?, updatedAt=? WHERE id=?", [VehicleStatus.IN_SHOP, now, vehicleId]);
    await pool.query(
      "INSERT INTO maintenance_logs (id, vehicleId, description, cost, status, openedAt, closedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, vehicleId, description, cost, MaintenanceStatus.OPEN, now, null]
    );

    return { id, vehicleId, description, cost, status: MaintenanceStatus.OPEN, openedAt: now.toISOString(), closedAt: null };
  }

  public async closeMaintenance(logId: string, actualCost: number): Promise<MaintenanceLog> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const [mRows] = await connection.query("SELECT * FROM maintenance_logs WHERE id = ? FOR UPDATE", [logId]);
      const logs = mRows as MaintenanceLog[];
      if (logs.length === 0) throw new Error("Log not found");
      const log = logs[0];

      if (log.status !== MaintenanceStatus.OPEN) throw new Error("Maintenance already closed");

      const now = new Date();
      await connection.query("UPDATE maintenance_logs SET status=?, closedAt=?, cost=? WHERE id=?", [MaintenanceStatus.CLOSED, now, actualCost, logId]);
      await connection.query("UPDATE vehicles SET status=?, updatedAt=? WHERE id=? AND status=?", [VehicleStatus.AVAILABLE, now, log.vehicleId, VehicleStatus.IN_SHOP]);

      const eId = "e-" + Math.random().toString(36).substring(2, 9);
      await connection.query(
        "INSERT INTO expenses (id, vehicleId, tripId, category, amount, date, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [eId, log.vehicleId, null, "MAINTENANCE", actualCost, now, `Completed maintenance`]
      );

      await connection.commit();
      log.status = MaintenanceStatus.CLOSED;
      log.cost = actualCost;
      return log;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  // OTHER LOGS
  public async addFuelLog(vehicleId: string, liters: number, cost: number): Promise<FuelLog> {
    const id = "f-" + Math.random().toString(36).substring(2, 9);
    const now = new Date();
    
    await pool.query(
      "INSERT INTO fuel_logs (id, vehicleId, tripId, liters, cost, date) VALUES (?, ?, ?, ?, ?, ?)",
      [id, vehicleId, null, liters, cost, now]
    );

    const eId = "e-" + Math.random().toString(36).substring(2, 9);
    await pool.query(
      "INSERT INTO expenses (id, vehicleId, tripId, category, amount, date, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [eId, vehicleId, null, "FUEL", cost, now, `Manual Fuel Intake`]
    );

    return { id, vehicleId, tripId: null, liters, cost, date: now.toISOString() };
  }

  public async addExpense(expense: Omit<Expense, "id" | "date">): Promise<Expense> {
    const id = "e-" + Math.random().toString(36).substring(2, 9);
    const now = new Date();
    
    await pool.query(
      "INSERT INTO expenses (id, vehicleId, tripId, category, amount, date, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, expense.vehicleId || null, expense.tripId || null, expense.category, expense.amount, now, expense.description || null]
    );

    return { ...expense, id, date: now.toISOString() } as Expense;
  }
}

export const db = new MySQLDatabase();
