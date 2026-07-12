import fs from "fs";
import path from "path";
import { isLicenseValid } from "../lib/licenseCheck.js";

const DB_FILE = path.join(process.cwd(), "db.json");

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

export interface DatabaseSchema {
  users: User[];
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenanceLogs: MaintenanceLog[];
  fuelLogs: FuelLog[];
  expenses: Expense[];
}

// Memory-backed database that synchronizes to a JSON file
class JSONDatabase {
  private data!: DatabaseSchema;

  constructor() {
    this.load();
  }

  private load() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(raw);
        // Clean loading verification
        return;
      } catch (err) {
        console.error("Failed to parse db.json, generating a new seed database...", err);
      }
    }
    this.seed();
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("Database save failed!", err);
    }
  }

  private seed() {
    const oneYearFromToday = new Date();
    oneYearFromToday.setFullYear(oneYearFromToday.getFullYear() + 1);

    const sixMonthsFromToday = new Date();
    sixMonthsFromToday.setMonth(sixMonthsFromToday.getMonth() + 6);

    const nineMonthsFromToday = new Date();
    nineMonthsFromToday.setMonth(nineMonthsFromToday.getMonth() + 9);

    const twoYearsFromToday = new Date();
    twoYearsFromToday.setFullYear(twoYearsFromToday.getFullYear() + 2);

    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    this.data = {
      users: [
        { id: "u-1", name: "Sarah Connor", email: "fleet.manager@transitops.dev", role: Role.FLEET_MANAGER },
        { id: "u-2", name: "James Holden", email: "dispatcher@transitops.dev", role: Role.DISPATCHER },
        { id: "u-3", name: "Naomi Nagata", email: "safety.officer@transitops.dev", role: Role.SAFETY_OFFICER },
        { id: "u-4", name: "Chrisjen Avasarala", email: "finance.analyst@transitops.dev", role: Role.FINANCIAL_ANALYST }
      ],
      vehicles: [
        {
          id: "v-1",
          registrationNumber: "TN-07-CS-1234",
          name: "Ford Transit Custom (TN-07-CS-1234)",
          type: "Van",
          maxLoadCapacityKg: 500,
          odometerKm: 12000,
          acquisitionCost: 25000,
          region: "North",
          status: VehicleStatus.AVAILABLE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "v-2",
          registrationNumber: "KA-51-MD-9876",
          name: "Volvo FH16 Heavy Duty (KA-51-MD-9876)",
          type: "Truck",
          maxLoadCapacityKg: 5000,
          odometerKm: 45000,
          acquisitionCost: 85000,
          region: "South",
          status: VehicleStatus.IN_SHOP,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "v-3",
          registrationNumber: "DL-1C-AA-1111",
          name: "Toyota Prius (DL-1C-AA-1111)",
          type: "Car",
          maxLoadCapacityKg: 400,
          odometerKm: 8000,
          acquisitionCost: 18000,
          region: "East",
          status: VehicleStatus.RETIRED,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "v-4",
          registrationNumber: "MH-12-PQ-4567",
          name: "Mercedes Sprinter shuttle (MH-12-PQ-4567)",
          type: "Bus",
          maxLoadCapacityKg: 3000,
          odometerKm: 60000,
          acquisitionCost: 120000,
          region: "West",
          status: VehicleStatus.AVAILABLE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "v-5",
          registrationNumber: "HR-26-AB-9999",
          name: "Ram ProMaster Cargo (HR-26-AB-9999)",
          type: "Van",
          maxLoadCapacityKg: 800,
          odometerKm: 14000,
          acquisitionCost: 28000,
          region: "North",
          status: VehicleStatus.ON_TRIP,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      drivers: [
        {
          id: "d-1",
          name: "Alex Kamal",
          licenseNumber: "DL-1001",
          licenseCategory: "LMV",
          licenseExpiryDate: oneYearFromToday.toISOString().split("T")[0],
          contactNumber: "+91 98401 23456",
          safetyScore: 95,
          status: DriverStatus.AVAILABLE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "d-2",
          name: "Sam Chola",
          licenseNumber: "DL-2002",
          licenseCategory: "HMV",
          licenseExpiryDate: sixMonthsFromToday.toISOString().split("T")[0],
          contactNumber: "+91 94440 98765",
          safetyScore: 88,
          status: DriverStatus.ON_TRIP,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "d-3",
          name: "Jordan Belfort",
          licenseNumber: "DL-3003",
          licenseCategory: "LMV",
          licenseExpiryDate: twoMonthsAgo.toISOString().split("T")[0], // Expired!
          contactNumber: "+91 98840 54321",
          safetyScore: 72,
          status: DriverStatus.AVAILABLE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "d-4",
          name: "Casey Jones",
          licenseNumber: "DL-4040",
          licenseCategory: "HMV",
          licenseExpiryDate: nineMonthsFromToday.toISOString().split("T")[0],
          contactNumber: "+91 90030 12345",
          safetyScore: 64,
          status: DriverStatus.SUSPENDED,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "d-5",
          name: "Taylor Mason",
          licenseNumber: "DL-5050",
          licenseCategory: "LMV",
          licenseExpiryDate: twoYearsFromToday.toISOString().split("T")[0],
          contactNumber: "+91 95000 67890",
          safetyScore: 90,
          status: DriverStatus.AVAILABLE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      trips: [
        {
          id: "t-1",
          source: "Logistics Hub Alpha",
          destination: "Downtown Retail Outlet",
          vehicleId: "v-5",
          driverId: "d-2",
          cargoWeightKg: 450,
          plannedDistanceKm: 42,
          startOdometerKm: 13958,
          endOdometerKm: null,
          fuelConsumedL: null,
          revenue: 1200,
          status: TripStatus.DISPATCHED,
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          dispatchedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
          completedAt: null,
          cancelledAt: null
        }
      ],
      maintenanceLogs: [
        {
          id: "m-1",
          vehicleId: "v-2",
          description: "Transmission system calibration & fluid replacement",
          cost: 450,
          status: MaintenanceStatus.OPEN,
          openedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          closedAt: null
        }
      ],
      fuelLogs: [
        {
          id: "f-1",
          vehicleId: "v-1",
          tripId: null,
          liters: 45,
          cost: 95,
          date: new Date(Date.now() - 3600000 * 48).toISOString()
        }
      ],
      expenses: [
        {
          id: "e-1",
          vehicleId: "v-1",
          tripId: null,
          category: "MISC",
          amount: 25,
          date: new Date(Date.now() - 3600000 * 48).toISOString(),
          description: "Windshield washer fluid and microfibers"
        }
      ]
    };
    this.save();
  }

  // QUERY HELPERS
  public getUsers() { return this.data.users; }
  public getVehicles() { return this.data.vehicles; }
  public getDrivers() { return this.data.drivers; }
  public getTrips() { return this.data.trips; }
  public getMaintenanceLogs() { return this.data.maintenanceLogs; }
  public getFuelLogs() { return this.data.fuelLogs; }
  public getExpenses() { return this.data.expenses; }

  // CREATE / EDIT ENTITIES
  public addVehicle(vehicle: Omit<Vehicle, "id" | "createdAt" | "updatedAt">): Vehicle {
    const existing = this.data.vehicles.find(v => v.registrationNumber.toLowerCase() === vehicle.registrationNumber.toLowerCase());
    if (existing) {
      throw new Error(`Vehicle with registration number '${vehicle.registrationNumber}' already exists.`);
    }

    const newVehicle: Vehicle = {
      ...vehicle,
      id: "v-" + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.vehicles.push(newVehicle);
    this.save();
    return newVehicle;
  }

  public updateVehicle(id: string, updates: Partial<Vehicle>): Vehicle {
    const idx = this.data.vehicles.findIndex(v => v.id === id);
    if (idx === -1) throw new Error("Vehicle not found");

    if (updates.registrationNumber) {
      const dupe = this.data.vehicles.find(v => v.id !== id && v.registrationNumber.toLowerCase() === updates.registrationNumber!.toLowerCase());
      if (dupe) throw new Error("Registration number already exists");
    }

    this.data.vehicles[idx] = {
      ...this.data.vehicles[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.vehicles[idx];
  }

  public retireVehicle(id: string): Vehicle {
    const vehicle = this.data.vehicles.find(v => v.id === id);
    if (!vehicle) throw new Error("Vehicle not found");
    if (vehicle.status === VehicleStatus.ON_TRIP) {
      throw new Error("Cannot retire a vehicle currently out on a trip!");
    }
    
    // Side effect: If vehicle is retired, make sure they are not AVAILABLE
    vehicle.status = VehicleStatus.RETIRED;
    vehicle.updatedAt = new Date().toISOString();
    this.save();
    return vehicle;
  }

  public addDriver(driver: Omit<Driver, "id" | "createdAt" | "updatedAt">): Driver {
    const existing = this.data.drivers.find(d => d.licenseNumber.toLowerCase() === driver.licenseNumber.toLowerCase());
    if (existing) {
      throw new Error(`Driver with license number '${driver.licenseNumber}' already exists.`);
    }

    const newDriver: Driver = {
      ...driver,
      id: "d-" + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.drivers.push(newDriver);
    this.save();
    return newDriver;
  }

  public updateDriver(id: string, updates: Partial<Driver>): Driver {
    const idx = this.data.drivers.findIndex(d => d.id === id);
    if (idx === -1) throw new Error("Driver not found");

    if (updates.licenseNumber) {
      const dupe = this.data.drivers.find(d => d.id !== id && d.licenseNumber.toLowerCase() === updates.licenseNumber!.toLowerCase());
      if (dupe) throw new Error("License number already exists");
    }

    this.data.drivers[idx] = {
      ...this.data.drivers[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.drivers[idx];
  }

  public suspendDriver(id: string, suspend: boolean): Driver {
    const idx = this.data.drivers.findIndex(d => d.id === id);
    if (idx === -1) throw new Error("Driver not found");

    const driver = this.data.drivers[idx];
    if (suspend && driver.status === DriverStatus.ON_TRIP) {
      throw new Error("Cannot suspend a driver currently mid-trip!");
    }

    driver.status = suspend ? DriverStatus.SUSPENDED : DriverStatus.AVAILABLE;
    driver.updatedAt = new Date().toISOString();
    this.save();
    return driver;
  }

  // STATE MACHINE STATE CHANGES FOR TRIPS

  // Create Draft Trip
  public createTrip(tripData: Omit<Trip, "id" | "status" | "createdAt" | "dispatchedAt" | "completedAt" | "cancelledAt" | "startOdometerKm" | "endOdometerKm" | "fuelConsumedL">): Trip {
    const vehicle = this.data.vehicles.find(v => v.id === tripData.vehicleId);
    const driver = this.data.drivers.find(d => d.id === tripData.driverId);

    if (!vehicle) throw new Error("Selected vehicle does not exist");
    if (!driver) throw new Error("Selected driver does not exist");

    // Guard: Cargo Capacity check
    if (tripData.cargoWeightKg > vehicle.maxLoadCapacityKg) {
      throw new Error(`Cargo weight (${tripData.cargoWeightKg}kg) exceeds the maximum capacity of vehicle ${vehicle.registrationNumber} (${vehicle.maxLoadCapacityKg}kg).`);
    }

    // Guard: License expiration check
    if (!isLicenseValid(driver.licenseExpiryDate)) {
      throw new Error(`Driver ${driver.name}'s license has expired (Expiry: ${driver.licenseExpiryDate}).`);
    }

    // Guard: Suspension status
    if (driver.status === DriverStatus.SUSPENDED) {
      throw new Error(`Driver ${driver.name} is currently suspended and cannot be assigned to trips.`);
    }

    // Guard: Driver off-duty
    if (driver.status === DriverStatus.OFF_DUTY) {
      throw new Error(`Driver ${driver.name} is off-duty.`);
    }

    const newTrip: Trip = {
      ...tripData,
      id: "t-" + Math.random().toString(36).substring(2, 9),
      startOdometerKm: null,
      endOdometerKm: null,
      fuelConsumedL: null,
      revenue: tripData.revenue || 0,
      status: TripStatus.DRAFT,
      createdAt: new Date().toISOString(),
      dispatchedAt: null,
      completedAt: null,
      cancelledAt: null
    };

    this.data.trips.push(newTrip);
    this.save();
    return newTrip;
  }

  // Dispatch Trip (DRAFT -> DISPATCHED)
  public dispatchTrip(id: string): Trip {
    const tripIdx = this.data.trips.findIndex(t => t.id === id);
    if (tripIdx === -1) throw new Error("Trip not found");
    const trip = this.data.trips[tripIdx];

    if (trip.status !== TripStatus.DRAFT) {
      throw new Error("Only Draft trips can be dispatched");
    }

    const vehicle = this.data.vehicles.find(v => v.id === trip.vehicleId);
    const driver = this.data.drivers.find(d => d.id === trip.driverId);

    if (!vehicle) throw new Error("Vehicle not found");
    if (!driver) throw new Error("Driver not found");

    // Re-verify availability guards inside the transaction block
    if (vehicle.status !== VehicleStatus.AVAILABLE) {
      throw new Error(`Vehicle ${vehicle.registrationNumber} is currently unavailable (Status: ${vehicle.status}).`);
    }
    if (driver.status !== DriverStatus.AVAILABLE) {
      throw new Error(`Driver ${driver.name} is currently unavailable (Status: ${driver.status}).`);
    }

    // Run License & Expiry checks again
    if (!isLicenseValid(driver.licenseExpiryDate)) {
      throw new Error(`Driver ${driver.name}'s license has expired.`);
    }

    // Apply Side Effects atomically
    trip.status = TripStatus.DISPATCHED;
    trip.dispatchedAt = new Date().toISOString();
    trip.startOdometerKm = vehicle.odometerKm;

    vehicle.status = VehicleStatus.ON_TRIP;
    driver.status = DriverStatus.ON_TRIP;

    this.save();
    return trip;
  }

  // Complete Trip (DISPATCHED -> COMPLETED)
  public completeTrip(id: string, endOdometerKm: number, fuelConsumedL: number, fuelCost: number, revenue: number): Trip {
    const tripIdx = this.data.trips.findIndex(t => t.id === id);
    if (tripIdx === -1) throw new Error("Trip not found");
    const trip = this.data.trips[tripIdx];

    if (trip.status !== TripStatus.DISPATCHED) {
      throw new Error("Only active Dispatched trips can be completed");
    }

    const startOdo = trip.startOdometerKm ?? 0;
    if (endOdometerKm < startOdo) {
      throw new Error(`Ending odometer (${endOdometerKm} km) cannot be less than starting odometer (${startOdo} km).`);
    }

    const vehicle = this.data.vehicles.find(v => v.id === trip.vehicleId);
    const driver = this.data.drivers.find(d => d.id === trip.driverId);

    if (!vehicle) throw new Error("Vehicle not found");
    if (!driver) throw new Error("Driver not found");

    // Apply State Changes
    trip.status = TripStatus.COMPLETED;
    trip.completedAt = new Date().toISOString();
    trip.endOdometerKm = endOdometerKm;
    trip.fuelConsumedL = fuelConsumedL;
    trip.revenue = revenue;

    // Side effects on vehicle & driver
    vehicle.status = VehicleStatus.AVAILABLE;
    vehicle.odometerKm = endOdometerKm;
    driver.status = DriverStatus.AVAILABLE;

    // Log the fuel transaction atomically if logged
    if (fuelConsumedL > 0) {
      const fuelLogId = "f-" + Math.random().toString(36).substring(2, 9);
      const fuelLog: FuelLog = {
        id: fuelLogId,
        vehicleId: vehicle.id,
        tripId: trip.id,
        liters: fuelConsumedL,
        cost: fuelCost,
        date: new Date().toISOString()
      };
      this.data.fuelLogs.push(fuelLog);

      // Create a related fuel expense entry
      const expenseId = "e-" + Math.random().toString(36).substring(2, 9);
      const fuelExpense: Expense = {
        id: expenseId,
        vehicleId: vehicle.id,
        tripId: trip.id,
        category: "FUEL",
        amount: fuelCost,
        date: new Date().toISOString(),
        description: `Trip completion fuel log: ${fuelConsumedL} liters`
      };
      this.data.expenses.push(fuelExpense);
    }

    this.save();
    return trip;
  }

  // Cancel Trip
  public cancelTrip(id: string): Trip {
    const tripIdx = this.data.trips.findIndex(t => t.id === id);
    if (tripIdx === -1) throw new Error("Trip not found");
    const trip = this.data.trips[tripIdx];

    if (trip.status === TripStatus.COMPLETED || trip.status === TripStatus.CANCELLED) {
      throw new Error("Cannot cancel a trip that is already completed or cancelled");
    }

    const wasDispatched = trip.status === TripStatus.DISPATCHED;

    trip.status = TripStatus.CANCELLED;
    trip.cancelledAt = new Date().toISOString();

    // If it was dispatched, release the vehicle and driver back to AVAILABLE
    if (wasDispatched) {
      const vehicle = this.data.vehicles.find(v => v.id === trip.vehicleId);
      const driver = this.data.drivers.find(d => d.id === trip.driverId);

      if (vehicle && vehicle.status === VehicleStatus.ON_TRIP) {
        vehicle.status = VehicleStatus.AVAILABLE;
      }
      if (driver && driver.status === DriverStatus.ON_TRIP) {
        driver.status = DriverStatus.AVAILABLE;
      }
    }

    this.save();
    return trip;
  }

  // MAINTENANCE ACTIONS
  public openMaintenance(vehicleId: string, description: string, cost: number): MaintenanceLog {
    const vehicle = this.data.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) throw new Error("Vehicle not found");

    if (vehicle.status !== VehicleStatus.AVAILABLE) {
      throw new Error(`Vehicle ${vehicle.registrationNumber} cannot start maintenance since its status is ${vehicle.status}.`);
    }

    // Set vehicle status to IN_SHOP
    vehicle.status = VehicleStatus.IN_SHOP;
    vehicle.updatedAt = new Date().toISOString();

    const log: MaintenanceLog = {
      id: "m-" + Math.random().toString(36).substring(2, 9),
      vehicleId,
      description,
      cost,
      status: MaintenanceStatus.OPEN,
      openedAt: new Date().toISOString(),
      closedAt: null
    };

    this.data.maintenanceLogs.push(log);
    this.save();
    return log;
  }

  public closeMaintenance(logId: string, actualCost: number): MaintenanceLog {
    const logIdx = this.data.maintenanceLogs.findIndex(m => m.id === logId);
    if (logIdx === -1) throw new Error("Maintenance log not found");
    const log = this.data.maintenanceLogs[logIdx];

    if (log.status !== MaintenanceStatus.OPEN) {
      throw new Error("Maintenance is already closed");
    }

    log.status = MaintenanceStatus.CLOSED;
    log.closedAt = new Date().toISOString();
    log.cost = actualCost;

    // Side effect: Release vehicle unless it was separately marked as RETIRED in the meantime
    const vehicle = this.data.vehicles.find(v => v.id === log.vehicleId);
    if (vehicle && vehicle.status === VehicleStatus.IN_SHOP) {
      vehicle.status = VehicleStatus.AVAILABLE;
      vehicle.updatedAt = new Date().toISOString();
    }

    // Record maintenance cost as an expense
    const expenseId = "e-" + Math.random().toString(36).substring(2, 9);
    const mExpense: Expense = {
      id: expenseId,
      vehicleId: log.vehicleId,
      tripId: null,
      category: "MAINTENANCE",
      amount: actualCost,
      date: new Date().toISOString(),
      description: `Completed maintenance: ${log.description}`
    };
    this.data.expenses.push(mExpense);

    this.save();
    return log;
  }

  // OTHER DATA ENTRIES
  public addFuelLog(vehicleId: string, liters: number, cost: number): FuelLog {
    const vehicle = this.data.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) throw new Error("Vehicle not found");

    const newLog: FuelLog = {
      id: "f-" + Math.random().toString(36).substring(2, 9),
      vehicleId,
      tripId: null,
      liters,
      cost,
      date: new Date().toISOString()
    };
    this.data.fuelLogs.push(newLog);

    // Fuel cost as expense
    const expenseId = "e-" + Math.random().toString(36).substring(2, 9);
    this.data.expenses.push({
      id: expenseId,
      vehicleId,
      tripId: null,
      category: "FUEL",
      amount: cost,
      date: new Date().toISOString(),
      description: `Manual Fuel Intake: ${liters}L`
    });

    this.save();
    return newLog;
  }

  public addExpense(expense: Omit<Expense, "id" | "date">): Expense {
    const newExpense: Expense = {
      ...expense,
      id: "e-" + Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString()
    };
    this.data.expenses.push(newExpense);
    this.save();
    return newExpense;
  }
}

export const db = new JSONDatabase();
