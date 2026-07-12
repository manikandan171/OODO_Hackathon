var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_vite = require("vite");

// server/db.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);

// lib/licenseCheck.ts
function isLicenseValid(expiryDateString) {
  if (!expiryDateString) return false;
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDateString);
  if (isNaN(expiry.getTime())) {
    return false;
  }
  expiry.setHours(0, 0, 0, 0);
  return expiry >= today;
}

// server/db.ts
var DB_FILE = import_path.default.join(process.cwd(), "db.json");
var Role = /* @__PURE__ */ ((Role2) => {
  Role2["FLEET_MANAGER"] = "FLEET_MANAGER";
  Role2["DISPATCHER"] = "DISPATCHER";
  Role2["SAFETY_OFFICER"] = "SAFETY_OFFICER";
  Role2["FINANCIAL_ANALYST"] = "FINANCIAL_ANALYST";
  return Role2;
})(Role || {});
var JSONDatabase = class {
  constructor() {
    this.load();
  }
  load() {
    if (import_fs.default.existsSync(DB_FILE)) {
      try {
        const raw = import_fs.default.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(raw);
        return;
      } catch (err) {
        console.error("Failed to parse db.json, generating a new seed database...", err);
      }
    }
    this.seed();
  }
  save() {
    try {
      import_fs.default.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("Database save failed!", err);
    }
  }
  seed() {
    const oneYearFromToday = /* @__PURE__ */ new Date();
    oneYearFromToday.setFullYear(oneYearFromToday.getFullYear() + 1);
    const sixMonthsFromToday = /* @__PURE__ */ new Date();
    sixMonthsFromToday.setMonth(sixMonthsFromToday.getMonth() + 6);
    const nineMonthsFromToday = /* @__PURE__ */ new Date();
    nineMonthsFromToday.setMonth(nineMonthsFromToday.getMonth() + 9);
    const twoYearsFromToday = /* @__PURE__ */ new Date();
    twoYearsFromToday.setFullYear(twoYearsFromToday.getFullYear() + 2);
    const twoMonthsAgo = /* @__PURE__ */ new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    this.data = {
      users: [
        { id: "u-1", name: "Sarah Connor", email: "fleet.manager@transitops.dev", role: "FLEET_MANAGER" /* FLEET_MANAGER */ },
        { id: "u-2", name: "James Holden", email: "dispatcher@transitops.dev", role: "DISPATCHER" /* DISPATCHER */ },
        { id: "u-3", name: "Naomi Nagata", email: "safety.officer@transitops.dev", role: "SAFETY_OFFICER" /* SAFETY_OFFICER */ },
        { id: "u-4", name: "Chrisjen Avasarala", email: "finance.analyst@transitops.dev", role: "FINANCIAL_ANALYST" /* FINANCIAL_ANALYST */ }
      ],
      vehicles: [
        {
          id: "v-1",
          registrationNumber: "TN-07-CS-1234",
          name: "Ford Transit Custom (TN-07-CS-1234)",
          type: "Van",
          maxLoadCapacityKg: 500,
          odometerKm: 12e3,
          acquisitionCost: 25e3,
          region: "North",
          status: "AVAILABLE" /* AVAILABLE */,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: "v-2",
          registrationNumber: "KA-51-MD-9876",
          name: "Volvo FH16 Heavy Duty (KA-51-MD-9876)",
          type: "Truck",
          maxLoadCapacityKg: 5e3,
          odometerKm: 45e3,
          acquisitionCost: 85e3,
          region: "South",
          status: "IN_SHOP" /* IN_SHOP */,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: "v-3",
          registrationNumber: "DL-1C-AA-1111",
          name: "Toyota Prius (DL-1C-AA-1111)",
          type: "Car",
          maxLoadCapacityKg: 400,
          odometerKm: 8e3,
          acquisitionCost: 18e3,
          region: "East",
          status: "RETIRED" /* RETIRED */,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: "v-4",
          registrationNumber: "MH-12-PQ-4567",
          name: "Mercedes Sprinter shuttle (MH-12-PQ-4567)",
          type: "Bus",
          maxLoadCapacityKg: 3e3,
          odometerKm: 6e4,
          acquisitionCost: 12e4,
          region: "West",
          status: "AVAILABLE" /* AVAILABLE */,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: "v-5",
          registrationNumber: "HR-26-AB-9999",
          name: "Ram ProMaster Cargo (HR-26-AB-9999)",
          type: "Van",
          maxLoadCapacityKg: 800,
          odometerKm: 14e3,
          acquisitionCost: 28e3,
          region: "North",
          status: "ON_TRIP" /* ON_TRIP */,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
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
          status: "AVAILABLE" /* AVAILABLE */,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: "d-2",
          name: "Sam Chola",
          licenseNumber: "DL-2002",
          licenseCategory: "HMV",
          licenseExpiryDate: sixMonthsFromToday.toISOString().split("T")[0],
          contactNumber: "+91 94440 98765",
          safetyScore: 88,
          status: "ON_TRIP" /* ON_TRIP */,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: "d-3",
          name: "Jordan Belfort",
          licenseNumber: "DL-3003",
          licenseCategory: "LMV",
          licenseExpiryDate: twoMonthsAgo.toISOString().split("T")[0],
          // Expired!
          contactNumber: "+91 98840 54321",
          safetyScore: 72,
          status: "AVAILABLE" /* AVAILABLE */,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: "d-4",
          name: "Casey Jones",
          licenseNumber: "DL-4040",
          licenseCategory: "HMV",
          licenseExpiryDate: nineMonthsFromToday.toISOString().split("T")[0],
          contactNumber: "+91 90030 12345",
          safetyScore: 64,
          status: "SUSPENDED" /* SUSPENDED */,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: "d-5",
          name: "Taylor Mason",
          licenseNumber: "DL-5050",
          licenseCategory: "LMV",
          licenseExpiryDate: twoYearsFromToday.toISOString().split("T")[0],
          contactNumber: "+91 95000 67890",
          safetyScore: 90,
          status: "AVAILABLE" /* AVAILABLE */,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
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
          status: "DISPATCHED" /* DISPATCHED */,
          createdAt: new Date(Date.now() - 36e5 * 4).toISOString(),
          dispatchedAt: new Date(Date.now() - 36e5 * 3).toISOString(),
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
          status: "OPEN" /* OPEN */,
          openedAt: new Date(Date.now() - 36e5 * 24).toISOString(),
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
          date: new Date(Date.now() - 36e5 * 48).toISOString()
        }
      ],
      expenses: [
        {
          id: "e-1",
          vehicleId: "v-1",
          tripId: null,
          category: "MISC",
          amount: 25,
          date: new Date(Date.now() - 36e5 * 48).toISOString(),
          description: "Windshield washer fluid and microfibers"
        }
      ]
    };
    this.save();
  }
  // QUERY HELPERS
  getUsers() {
    return this.data.users;
  }
  getVehicles() {
    return this.data.vehicles;
  }
  getDrivers() {
    return this.data.drivers;
  }
  getTrips() {
    return this.data.trips;
  }
  getMaintenanceLogs() {
    return this.data.maintenanceLogs;
  }
  getFuelLogs() {
    return this.data.fuelLogs;
  }
  getExpenses() {
    return this.data.expenses;
  }
  // CREATE / EDIT ENTITIES
  addVehicle(vehicle) {
    const existing = this.data.vehicles.find((v) => v.registrationNumber.toLowerCase() === vehicle.registrationNumber.toLowerCase());
    if (existing) {
      throw new Error(`Vehicle with registration number '${vehicle.registrationNumber}' already exists.`);
    }
    const newVehicle = {
      ...vehicle,
      id: "v-" + Math.random().toString(36).substring(2, 9),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.vehicles.push(newVehicle);
    this.save();
    return newVehicle;
  }
  updateVehicle(id, updates) {
    const idx = this.data.vehicles.findIndex((v) => v.id === id);
    if (idx === -1) throw new Error("Vehicle not found");
    if (updates.registrationNumber) {
      const dupe = this.data.vehicles.find((v) => v.id !== id && v.registrationNumber.toLowerCase() === updates.registrationNumber.toLowerCase());
      if (dupe) throw new Error("Registration number already exists");
    }
    this.data.vehicles[idx] = {
      ...this.data.vehicles[idx],
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.save();
    return this.data.vehicles[idx];
  }
  retireVehicle(id) {
    const vehicle = this.data.vehicles.find((v) => v.id === id);
    if (!vehicle) throw new Error("Vehicle not found");
    if (vehicle.status === "ON_TRIP" /* ON_TRIP */) {
      throw new Error("Cannot retire a vehicle currently out on a trip!");
    }
    vehicle.status = "RETIRED" /* RETIRED */;
    vehicle.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.save();
    return vehicle;
  }
  addDriver(driver) {
    const existing = this.data.drivers.find((d) => d.licenseNumber.toLowerCase() === driver.licenseNumber.toLowerCase());
    if (existing) {
      throw new Error(`Driver with license number '${driver.licenseNumber}' already exists.`);
    }
    const newDriver = {
      ...driver,
      id: "d-" + Math.random().toString(36).substring(2, 9),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.drivers.push(newDriver);
    this.save();
    return newDriver;
  }
  updateDriver(id, updates) {
    const idx = this.data.drivers.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error("Driver not found");
    if (updates.licenseNumber) {
      const dupe = this.data.drivers.find((d) => d.id !== id && d.licenseNumber.toLowerCase() === updates.licenseNumber.toLowerCase());
      if (dupe) throw new Error("License number already exists");
    }
    this.data.drivers[idx] = {
      ...this.data.drivers[idx],
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.save();
    return this.data.drivers[idx];
  }
  suspendDriver(id, suspend) {
    const idx = this.data.drivers.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error("Driver not found");
    const driver = this.data.drivers[idx];
    if (suspend && driver.status === "ON_TRIP" /* ON_TRIP */) {
      throw new Error("Cannot suspend a driver currently mid-trip!");
    }
    driver.status = suspend ? "SUSPENDED" /* SUSPENDED */ : "AVAILABLE" /* AVAILABLE */;
    driver.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.save();
    return driver;
  }
  // STATE MACHINE STATE CHANGES FOR TRIPS
  // Create Draft Trip
  createTrip(tripData) {
    const vehicle = this.data.vehicles.find((v) => v.id === tripData.vehicleId);
    const driver = this.data.drivers.find((d) => d.id === tripData.driverId);
    if (!vehicle) throw new Error("Selected vehicle does not exist");
    if (!driver) throw new Error("Selected driver does not exist");
    if (tripData.cargoWeightKg > vehicle.maxLoadCapacityKg) {
      throw new Error(`Cargo weight (${tripData.cargoWeightKg}kg) exceeds the maximum capacity of vehicle ${vehicle.registrationNumber} (${vehicle.maxLoadCapacityKg}kg).`);
    }
    if (!isLicenseValid(driver.licenseExpiryDate)) {
      throw new Error(`Driver ${driver.name}'s license has expired (Expiry: ${driver.licenseExpiryDate}).`);
    }
    if (driver.status === "SUSPENDED" /* SUSPENDED */) {
      throw new Error(`Driver ${driver.name} is currently suspended and cannot be assigned to trips.`);
    }
    if (driver.status === "OFF_DUTY" /* OFF_DUTY */) {
      throw new Error(`Driver ${driver.name} is off-duty.`);
    }
    const newTrip = {
      ...tripData,
      id: "t-" + Math.random().toString(36).substring(2, 9),
      startOdometerKm: null,
      endOdometerKm: null,
      fuelConsumedL: null,
      revenue: tripData.revenue || 0,
      status: "DRAFT" /* DRAFT */,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      dispatchedAt: null,
      completedAt: null,
      cancelledAt: null
    };
    this.data.trips.push(newTrip);
    this.save();
    return newTrip;
  }
  // Dispatch Trip (DRAFT -> DISPATCHED)
  dispatchTrip(id) {
    const tripIdx = this.data.trips.findIndex((t) => t.id === id);
    if (tripIdx === -1) throw new Error("Trip not found");
    const trip = this.data.trips[tripIdx];
    if (trip.status !== "DRAFT" /* DRAFT */) {
      throw new Error("Only Draft trips can be dispatched");
    }
    const vehicle = this.data.vehicles.find((v) => v.id === trip.vehicleId);
    const driver = this.data.drivers.find((d) => d.id === trip.driverId);
    if (!vehicle) throw new Error("Vehicle not found");
    if (!driver) throw new Error("Driver not found");
    if (vehicle.status !== "AVAILABLE" /* AVAILABLE */) {
      throw new Error(`Vehicle ${vehicle.registrationNumber} is currently unavailable (Status: ${vehicle.status}).`);
    }
    if (driver.status !== "AVAILABLE" /* AVAILABLE */) {
      throw new Error(`Driver ${driver.name} is currently unavailable (Status: ${driver.status}).`);
    }
    if (!isLicenseValid(driver.licenseExpiryDate)) {
      throw new Error(`Driver ${driver.name}'s license has expired.`);
    }
    trip.status = "DISPATCHED" /* DISPATCHED */;
    trip.dispatchedAt = (/* @__PURE__ */ new Date()).toISOString();
    trip.startOdometerKm = vehicle.odometerKm;
    vehicle.status = "ON_TRIP" /* ON_TRIP */;
    driver.status = "ON_TRIP" /* ON_TRIP */;
    this.save();
    return trip;
  }
  // Complete Trip (DISPATCHED -> COMPLETED)
  completeTrip(id, endOdometerKm, fuelConsumedL, fuelCost, revenue) {
    const tripIdx = this.data.trips.findIndex((t) => t.id === id);
    if (tripIdx === -1) throw new Error("Trip not found");
    const trip = this.data.trips[tripIdx];
    if (trip.status !== "DISPATCHED" /* DISPATCHED */) {
      throw new Error("Only active Dispatched trips can be completed");
    }
    const startOdo = trip.startOdometerKm ?? 0;
    if (endOdometerKm < startOdo) {
      throw new Error(`Ending odometer (${endOdometerKm} km) cannot be less than starting odometer (${startOdo} km).`);
    }
    const vehicle = this.data.vehicles.find((v) => v.id === trip.vehicleId);
    const driver = this.data.drivers.find((d) => d.id === trip.driverId);
    if (!vehicle) throw new Error("Vehicle not found");
    if (!driver) throw new Error("Driver not found");
    trip.status = "COMPLETED" /* COMPLETED */;
    trip.completedAt = (/* @__PURE__ */ new Date()).toISOString();
    trip.endOdometerKm = endOdometerKm;
    trip.fuelConsumedL = fuelConsumedL;
    trip.revenue = revenue;
    vehicle.status = "AVAILABLE" /* AVAILABLE */;
    vehicle.odometerKm = endOdometerKm;
    driver.status = "AVAILABLE" /* AVAILABLE */;
    if (fuelConsumedL > 0) {
      const fuelLogId = "f-" + Math.random().toString(36).substring(2, 9);
      const fuelLog = {
        id: fuelLogId,
        vehicleId: vehicle.id,
        tripId: trip.id,
        liters: fuelConsumedL,
        cost: fuelCost,
        date: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.data.fuelLogs.push(fuelLog);
      const expenseId = "e-" + Math.random().toString(36).substring(2, 9);
      const fuelExpense = {
        id: expenseId,
        vehicleId: vehicle.id,
        tripId: trip.id,
        category: "FUEL",
        amount: fuelCost,
        date: (/* @__PURE__ */ new Date()).toISOString(),
        description: `Trip completion fuel log: ${fuelConsumedL} liters`
      };
      this.data.expenses.push(fuelExpense);
    }
    this.save();
    return trip;
  }
  // Cancel Trip
  cancelTrip(id) {
    const tripIdx = this.data.trips.findIndex((t) => t.id === id);
    if (tripIdx === -1) throw new Error("Trip not found");
    const trip = this.data.trips[tripIdx];
    if (trip.status === "COMPLETED" /* COMPLETED */ || trip.status === "CANCELLED" /* CANCELLED */) {
      throw new Error("Cannot cancel a trip that is already completed or cancelled");
    }
    const wasDispatched = trip.status === "DISPATCHED" /* DISPATCHED */;
    trip.status = "CANCELLED" /* CANCELLED */;
    trip.cancelledAt = (/* @__PURE__ */ new Date()).toISOString();
    if (wasDispatched) {
      const vehicle = this.data.vehicles.find((v) => v.id === trip.vehicleId);
      const driver = this.data.drivers.find((d) => d.id === trip.driverId);
      if (vehicle && vehicle.status === "ON_TRIP" /* ON_TRIP */) {
        vehicle.status = "AVAILABLE" /* AVAILABLE */;
      }
      if (driver && driver.status === "ON_TRIP" /* ON_TRIP */) {
        driver.status = "AVAILABLE" /* AVAILABLE */;
      }
    }
    this.save();
    return trip;
  }
  // MAINTENANCE ACTIONS
  openMaintenance(vehicleId, description, cost) {
    const vehicle = this.data.vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) throw new Error("Vehicle not found");
    if (vehicle.status !== "AVAILABLE" /* AVAILABLE */) {
      throw new Error(`Vehicle ${vehicle.registrationNumber} cannot start maintenance since its status is ${vehicle.status}.`);
    }
    vehicle.status = "IN_SHOP" /* IN_SHOP */;
    vehicle.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    const log = {
      id: "m-" + Math.random().toString(36).substring(2, 9),
      vehicleId,
      description,
      cost,
      status: "OPEN" /* OPEN */,
      openedAt: (/* @__PURE__ */ new Date()).toISOString(),
      closedAt: null
    };
    this.data.maintenanceLogs.push(log);
    this.save();
    return log;
  }
  closeMaintenance(logId, actualCost) {
    const logIdx = this.data.maintenanceLogs.findIndex((m) => m.id === logId);
    if (logIdx === -1) throw new Error("Maintenance log not found");
    const log = this.data.maintenanceLogs[logIdx];
    if (log.status !== "OPEN" /* OPEN */) {
      throw new Error("Maintenance is already closed");
    }
    log.status = "CLOSED" /* CLOSED */;
    log.closedAt = (/* @__PURE__ */ new Date()).toISOString();
    log.cost = actualCost;
    const vehicle = this.data.vehicles.find((v) => v.id === log.vehicleId);
    if (vehicle && vehicle.status === "IN_SHOP" /* IN_SHOP */) {
      vehicle.status = "AVAILABLE" /* AVAILABLE */;
      vehicle.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    }
    const expenseId = "e-" + Math.random().toString(36).substring(2, 9);
    const mExpense = {
      id: expenseId,
      vehicleId: log.vehicleId,
      tripId: null,
      category: "MAINTENANCE",
      amount: actualCost,
      date: (/* @__PURE__ */ new Date()).toISOString(),
      description: `Completed maintenance: ${log.description}`
    };
    this.data.expenses.push(mExpense);
    this.save();
    return log;
  }
  // OTHER DATA ENTRIES
  addFuelLog(vehicleId, liters, cost) {
    const vehicle = this.data.vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) throw new Error("Vehicle not found");
    const newLog = {
      id: "f-" + Math.random().toString(36).substring(2, 9),
      vehicleId,
      tripId: null,
      liters,
      cost,
      date: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.fuelLogs.push(newLog);
    const expenseId = "e-" + Math.random().toString(36).substring(2, 9);
    this.data.expenses.push({
      id: expenseId,
      vehicleId,
      tripId: null,
      category: "FUEL",
      amount: cost,
      date: (/* @__PURE__ */ new Date()).toISOString(),
      description: `Manual Fuel Intake: ${liters}L`
    });
    this.save();
    return newLog;
  }
  addExpense(expense) {
    const newExpense = {
      ...expense,
      id: "e-" + Math.random().toString(36).substring(2, 9),
      date: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.expenses.push(newExpense);
    this.save();
    return newExpense;
  }
};
var db = new JSONDatabase();

// server.ts
var isProd = process.env.NODE_ENV === "production";
var PORT = 3e3;
async function startServer() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json());
  const getRoleHeader = (req) => {
    const role = req.headers["x-user-role"];
    if (Object.values(Role).includes(role)) {
      return role;
    }
    return "FLEET_MANAGER" /* FLEET_MANAGER */;
  };
  const requireRoles = (roles) => {
    return (req, res, next) => {
      const activeRole = getRoleHeader(req);
      if (!roles.includes(activeRole)) {
        res.status(403).json({
          error: `Access Denied: Your current role is '${activeRole}'. This action requires one of: ${roles.join(", ")}.`
        });
        return;
      }
      next();
    };
  };
  app.get("/api/users", (req, res) => {
    res.json(db.getUsers());
  });
  app.get("/api/vehicles", (req, res) => {
    let vehicles = db.getVehicles();
    const { status, type, region } = req.query;
    if (status) vehicles = vehicles.filter((v) => v.status === status);
    if (type) vehicles = vehicles.filter((v) => v.type === type);
    if (region) vehicles = vehicles.filter((v) => v.region === region);
    res.json(vehicles);
  });
  app.get("/api/vehicles/available", (req, res) => {
    const vehicles = db.getVehicles().filter((v) => v.status === "AVAILABLE" /* AVAILABLE */);
    res.json(vehicles);
  });
  app.post("/api/vehicles", requireRoles(["FLEET_MANAGER" /* FLEET_MANAGER */]), (req, res) => {
    try {
      const { registrationNumber, name, type, maxLoadCapacityKg, odometerKm, acquisitionCost, region } = req.body;
      if (!registrationNumber || !name || !type || !maxLoadCapacityKg || !odometerKm || !acquisitionCost || !region) {
        res.status(400).json({ error: "Missing required vehicle fields" });
        return;
      }
      const newVehicle = db.addVehicle({
        registrationNumber,
        name,
        type,
        maxLoadCapacityKg: Number(maxLoadCapacityKg),
        odometerKm: Number(odometerKm),
        acquisitionCost: Number(acquisitionCost),
        region,
        status: "AVAILABLE" /* AVAILABLE */
      });
      res.status(201).json(newVehicle);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.patch("/api/vehicles/:id", requireRoles(["FLEET_MANAGER" /* FLEET_MANAGER */]), (req, res) => {
    try {
      const updated = db.updateVehicle(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.post("/api/vehicles/:id/retire", requireRoles(["FLEET_MANAGER" /* FLEET_MANAGER */]), (req, res) => {
    try {
      const retired = db.retireVehicle(req.params.id);
      res.json(retired);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.get("/api/drivers", (req, res) => {
    let drivers = db.getDrivers();
    const { status } = req.query;
    if (status) drivers = drivers.filter((d) => d.status === status);
    res.json(drivers);
  });
  app.get("/api/drivers/available", (req, res) => {
    const available = db.getDrivers().filter((d) => {
      return d.status === "AVAILABLE" /* AVAILABLE */ && isLicenseValid(d.licenseExpiryDate);
    });
    res.json(available);
  });
  app.post("/api/drivers", requireRoles(["FLEET_MANAGER" /* FLEET_MANAGER */, "SAFETY_OFFICER" /* SAFETY_OFFICER */]), (req, res) => {
    try {
      const { name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore } = req.body;
      if (!name || !licenseNumber || !licenseCategory || !licenseExpiryDate || !contactNumber) {
        res.status(400).json({ error: "Missing required driver fields" });
        return;
      }
      const newDriver = db.addDriver({
        name,
        licenseNumber,
        licenseCategory,
        licenseExpiryDate,
        contactNumber,
        safetyScore: safetyScore !== void 0 ? Number(safetyScore) : 100,
        status: "AVAILABLE" /* AVAILABLE */
      });
      res.status(201).json(newDriver);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.patch("/api/drivers/:id", requireRoles(["FLEET_MANAGER" /* FLEET_MANAGER */, "SAFETY_OFFICER" /* SAFETY_OFFICER */]), (req, res) => {
    try {
      const updated = db.updateDriver(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.patch("/api/drivers/:id/suspend", requireRoles(["SAFETY_OFFICER" /* SAFETY_OFFICER */]), (req, res) => {
    try {
      const { suspend } = req.body;
      if (suspend === void 0) {
        res.status(400).json({ error: "Missing field 'suspend' (boolean)" });
        return;
      }
      const updated = db.suspendDriver(req.params.id, Boolean(suspend));
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.get("/api/trips", (req, res) => {
    let trips = db.getTrips();
    const { status } = req.query;
    if (status) trips = trips.filter((t) => t.status === status);
    res.json(trips);
  });
  app.post("/api/trips", requireRoles(["DISPATCHER" /* DISPATCHER */]), (req, res) => {
    try {
      const { source, destination, vehicleId, driverId, cargoWeightKg, plannedDistanceKm, revenue } = req.body;
      if (!source || !destination || !vehicleId || !driverId || cargoWeightKg === void 0 || plannedDistanceKm === void 0) {
        res.status(400).json({ error: "Missing required trip fields" });
        return;
      }
      const trip = db.createTrip({
        source,
        destination,
        vehicleId,
        driverId,
        cargoWeightKg: Number(cargoWeightKg),
        plannedDistanceKm: Number(plannedDistanceKm),
        revenue: revenue ? Number(revenue) : 0
      });
      res.status(201).json(trip);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.post("/api/trips/:id/dispatch", requireRoles(["DISPATCHER" /* DISPATCHER */]), (req, res) => {
    try {
      const trip = db.dispatchTrip(req.params.id);
      res.json(trip);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.post("/api/trips/:id/complete", requireRoles(["DISPATCHER" /* DISPATCHER */]), (req, res) => {
    try {
      const { endOdometerKm, fuelConsumedL, fuelCost, revenue } = req.body;
      if (endOdometerKm === void 0 || fuelConsumedL === void 0 || fuelCost === void 0) {
        res.status(400).json({ error: "Missing completion data (endOdometerKm, fuelConsumedL, fuelCost)" });
        return;
      }
      const trip = db.completeTrip(
        req.params.id,
        Number(endOdometerKm),
        Number(fuelConsumedL),
        Number(fuelCost),
        revenue !== void 0 ? Number(revenue) : 0
      );
      res.json(trip);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.post("/api/trips/:id/cancel", requireRoles(["DISPATCHER" /* DISPATCHER */]), (req, res) => {
    try {
      const trip = db.cancelTrip(req.params.id);
      res.json(trip);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.get("/api/maintenance", (req, res) => {
    let logs = db.getMaintenanceLogs();
    const { vehicleId, status } = req.query;
    if (vehicleId) logs = logs.filter((l) => l.vehicleId === vehicleId);
    if (status) logs = logs.filter((l) => l.status === status);
    res.json(logs);
  });
  app.post("/api/maintenance", requireRoles(["FLEET_MANAGER" /* FLEET_MANAGER */]), (req, res) => {
    try {
      const { vehicleId, description, cost } = req.body;
      if (!vehicleId || !description || cost === void 0) {
        res.status(400).json({ error: "Missing maintenance fields (vehicleId, description, cost)" });
        return;
      }
      const log = db.openMaintenance(vehicleId, description, Number(cost));
      res.status(201).json(log);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.post("/api/maintenance/:id/close", requireRoles(["FLEET_MANAGER" /* FLEET_MANAGER */]), (req, res) => {
    try {
      const { cost } = req.body;
      if (cost === void 0) {
        res.status(400).json({ error: "Missing cost field" });
        return;
      }
      const log = db.closeMaintenance(req.params.id, Number(cost));
      res.json(log);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.get("/api/fuel-logs", (req, res) => {
    res.json(db.getFuelLogs());
  });
  app.post("/api/fuel-logs", requireRoles(["FLEET_MANAGER" /* FLEET_MANAGER */, "FINANCIAL_ANALYST" /* FINANCIAL_ANALYST */, "DISPATCHER" /* DISPATCHER */]), (req, res) => {
    try {
      const { vehicleId, liters, cost } = req.body;
      if (!vehicleId || liters === void 0 || cost === void 0) {
        res.status(400).json({ error: "Missing vehicleId, liters, or cost" });
        return;
      }
      const log = db.addFuelLog(vehicleId, Number(liters), Number(cost));
      res.status(201).json(log);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.get("/api/expenses", (req, res) => {
    res.json(db.getExpenses());
  });
  app.post("/api/expenses", requireRoles(["FLEET_MANAGER" /* FLEET_MANAGER */, "FINANCIAL_ANALYST" /* FINANCIAL_ANALYST */]), (req, res) => {
    try {
      const { vehicleId, tripId, category, amount, description } = req.body;
      if (!category || amount === void 0) {
        res.status(400).json({ error: "Missing category or amount" });
        return;
      }
      const newExpense = db.addExpense({
        vehicleId: vehicleId || null,
        tripId: tripId || null,
        category,
        amount: Number(amount),
        description: description || null
      });
      res.status(201).json(newExpense);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.get("/api/reports/dashboard", (req, res) => {
    const vehicles = db.getVehicles();
    const drivers = db.getDrivers();
    const trips = db.getTrips();
    const activeVehicles = vehicles.filter((v) => v.status !== "RETIRED" /* RETIRED */).length;
    const availableVehicles = vehicles.filter((v) => v.status === "AVAILABLE" /* AVAILABLE */).length;
    const vehiclesInShop = vehicles.filter((v) => v.status === "IN_SHOP" /* IN_SHOP */).length;
    const activeTrips = trips.filter((t) => t.status === "DISPATCHED" /* DISPATCHED */).length;
    const pendingTrips = trips.filter((t) => t.status === "DRAFT" /* DRAFT */).length;
    const driversOnDuty = drivers.filter((d) => d.status === "AVAILABLE" /* AVAILABLE */ || d.status === "ON_TRIP" /* ON_TRIP */).length;
    const utilization = activeVehicles > 0 ? Math.round(vehicles.filter((v) => v.status === "ON_TRIP" /* ON_TRIP */).length / activeVehicles * 100) : 0;
    res.json({
      activeVehicles,
      availableVehicles,
      vehiclesInShop,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      fleetUtilizationPercent: utilization
    });
  });
  app.get("/api/reports/analytics", (req, res) => {
    const vehicles = db.getVehicles();
    const trips = db.getTrips();
    const mLogs = db.getMaintenanceLogs();
    const fuelLogs = db.getFuelLogs();
    const expenses = db.getExpenses();
    const report = vehicles.map((vehicle) => {
      const vehicleTrips = trips.filter((t) => t.vehicleId === vehicle.id && t.status === "COMPLETED" /* COMPLETED */);
      const totalFuelTripLiters = vehicleTrips.reduce((acc, t) => acc + (t.fuelConsumedL ?? 0), 0);
      const totalDistanceTrip = vehicleTrips.reduce((acc, t) => acc + (t.plannedDistanceKm ?? 0), 0);
      const manualFuelLiters = fuelLogs.filter((f) => f.vehicleId === vehicle.id).reduce((acc, f) => acc + f.liters, 0);
      const totalFuelLiters = totalFuelTripLiters + manualFuelLiters;
      const fuelEfficiencyKmPerL = totalFuelLiters > 0 ? Number((totalDistanceTrip / totalFuelLiters).toFixed(2)) : 0;
      const fuelCost = fuelLogs.filter((f) => f.vehicleId === vehicle.id).reduce((acc, f) => acc + f.cost, 0);
      const maintenanceCost = mLogs.filter((m) => m.vehicleId === vehicle.id).reduce((acc, m) => acc + m.cost, 0);
      const vehicleExpenses = expenses.filter((e) => e.vehicleId === vehicle.id).reduce((acc, e) => acc + e.amount, 0);
      const operationalCost = fuelCost + maintenanceCost + vehicleExpenses;
      const totalRevenue = trips.filter((t) => t.vehicleId === vehicle.id && t.status === "COMPLETED" /* COMPLETED */).reduce((acc, t) => acc + (t.revenue ?? 0), 0);
      const netEarnings = totalRevenue - (fuelCost + maintenanceCost);
      const roi = vehicle.acquisitionCost > 0 ? Number((netEarnings / vehicle.acquisitionCost).toFixed(4)) : 0;
      return {
        vehicleId: vehicle.id,
        name: vehicle.name,
        registrationNumber: vehicle.registrationNumber,
        type: vehicle.type,
        acquisitionCost: vehicle.acquisitionCost,
        totalDistanceKm: totalDistanceTrip,
        totalFuelLiters,
        fuelEfficiencyKmPerL,
        fuelCost,
        maintenanceCost,
        otherExpenses: vehicleExpenses,
        operationalCost,
        totalRevenue,
        roiPercent: Number((roi * 100).toFixed(2))
      };
    });
    res.json(report);
  });
  if (!isProd) {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path2.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TransitOps server running at http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
