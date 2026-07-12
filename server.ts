import express from "express";
import path from "path";
import jwt from "jsonwebtoken";
import authRouter from "./server/lib/auth.js";
import { requireRole } from "./server/lib/permissions.js";
import { createServer as createViteServer } from "vite";
import {
  db,
  Role,
  VehicleStatus,
  DriverStatus,
  TripStatus,
  MaintenanceStatus
} from "./server/db.js";

const isProd = process.env.NODE_ENV === "production";
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_dev_key";

async function startServer() {
  const app = express();
  app.use(express.json());

  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
      return;
    }
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      (req as any).user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
  };

  // RBAC Helper moved to server/lib/permissions.ts

  // Health Check Endpoint (Public)
  app.get("/api/health", async (req, res) => {
    try {
      const users = await db.getUsers(); // quick db test
      res.json({ status: "ok", message: "Backend and MySQL Database are connected successfully!", dbUserCount: users.length });
    } catch (err: any) {
      res.status(500).json({ status: "error", message: "Backend is running, but MySQL connection failed.", error: err.message });
    }
  });

  // Protect all API routes except login
  app.use("/api", (req, res, next) => {
    if (req.path === "/auth/login") {
      return next();
    }
    requireAuth(req, res, next);
  });

  // --- API ROUTES ---

  // Auth Endpoints handled by authRouter
  app.use("/api/auth", authRouter);

  // Users Session
  app.get("/api/users", async (req, res) => {
    const users = await db.getUsers();
    res.json(users);
  });

  // 1. VEHICLES API
  app.get("/api/vehicles", async (req, res) => {
    try {
      let vehicles = await db.getVehicles();
      const { status, type, region } = req.query;

      if (status) vehicles = vehicles.filter(v => v.status === status);
      if (type) vehicles = vehicles.filter(v => v.type === type);
      if (region) vehicles = vehicles.filter(v => v.region === region);

      res.json(vehicles);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/vehicles/available", async (req, res) => {
    try {
      const allVehicles = await db.getVehicles();
      const vehicles = allVehicles.filter(v => v.status === VehicleStatus.AVAILABLE);
      res.json(vehicles);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/vehicles", requireRole([Role.FLEET_MANAGER]), async (req, res) => {
    try {
      const { registrationNumber, name, type, maxLoadCapacityKg, odometerKm, acquisitionCost, region } = req.body;
      if (!registrationNumber || !name || !type || !maxLoadCapacityKg || !odometerKm || !acquisitionCost || !region) {
        res.status(400).json({ error: "Missing required vehicle fields" });
        return;
      }
      const newVehicle = await db.addVehicle({
        registrationNumber,
        name,
        type,
        maxLoadCapacityKg: Number(maxLoadCapacityKg),
        odometerKm: Number(odometerKm),
        acquisitionCost: Number(acquisitionCost),
        region,
        status: VehicleStatus.AVAILABLE
      });
      res.status(201).json(newVehicle);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch("/api/vehicles/:id", requireRole([Role.FLEET_MANAGER]), async (req, res) => {
    try {
      const updated = await db.updateVehicle(req.params.id, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/vehicles/:id/retire", requireRole([Role.FLEET_MANAGER]), async (req, res) => {
    try {
      const retired = await db.retireVehicle(req.params.id);
      res.json(retired);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 2. DRIVERS API
  app.get("/api/drivers", async (req, res) => {
    try {
      let drivers = await db.getDrivers();
      const { status } = req.query;

      if (status) drivers = drivers.filter(d => d.status === status);
      res.json(drivers);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/drivers/available", async (req, res) => {
    try {
      const today = new Date();
      const allDrivers = await db.getDrivers();
      const available = allDrivers.filter(d => {
        const isAvailable = d.status === DriverStatus.AVAILABLE;
        const notExpired = new Date(d.licenseExpiryDate) >= today;
        return isAvailable && notExpired;
      });
      res.json(available);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/drivers", requireRole([Role.FLEET_MANAGER, Role.SAFETY_OFFICER]), async (req, res) => {
    try {
      const { name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore } = req.body;
      if (!name || !licenseNumber || !licenseCategory || !licenseExpiryDate || !contactNumber) {
        res.status(400).json({ error: "Missing required driver fields" });
        return;
      }
      const newDriver = await db.addDriver({
        name,
        licenseNumber,
        licenseCategory,
        licenseExpiryDate,
        contactNumber,
        safetyScore: safetyScore !== undefined ? Number(safetyScore) : 100,
        status: DriverStatus.AVAILABLE
      });
      res.status(201).json(newDriver);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch("/api/drivers/:id", requireRole([Role.FLEET_MANAGER, Role.SAFETY_OFFICER]), async (req, res) => {
    try {
      const updated = await db.updateDriver(req.params.id, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/drivers/:id/suspend", requireRole([Role.SAFETY_OFFICER]), async (req, res) => {
    try {
      const { suspend } = req.body;
      if (suspend === undefined) {
        res.status(400).json({ error: "Missing field 'suspend' (boolean)" });
        return;
      }
      const updated = await db.suspendDriver(req.params.id, Boolean(suspend));
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 3. TRIPS API
  app.get("/api/trips", async (req, res) => {
    try {
      let trips = await db.getTrips();
      const { status } = req.query;

      if (status) trips = trips.filter(t => t.status === status);
      res.json(trips);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/trips", requireRole([Role.DISPATCHER]), async (req, res) => {
    try {
      const { source, destination, vehicleId, driverId, cargoWeightKg, plannedDistanceKm, revenue } = req.body;
      if (!source || !destination || !vehicleId || !driverId || cargoWeightKg === undefined || plannedDistanceKm === undefined) {
        res.status(400).json({ error: "Missing required trip fields" });
        return;
      }
      const trip = await db.createTrip({
        source,
        destination,
        vehicleId,
        driverId,
        cargoWeightKg: Number(cargoWeightKg),
        plannedDistanceKm: Number(plannedDistanceKm),
        revenue: revenue ? Number(revenue) : 0
      });
      res.status(201).json(trip);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/trips/:id/dispatch", requireRole([Role.DISPATCHER]), async (req, res) => {
    try {
      const trip = await db.dispatchTrip(req.params.id);
      res.json(trip);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/trips/:id/complete", requireRole([Role.DISPATCHER]), async (req, res) => {
    try {
      const { endOdometerKm, fuelConsumedL, fuelCost, revenue } = req.body;
      if (endOdometerKm === undefined || fuelConsumedL === undefined || fuelCost === undefined) {
        res.status(400).json({ error: "Missing completion data (endOdometerKm, fuelConsumedL, fuelCost)" });
        return;
      }
      const trip = await db.completeTrip(
        req.params.id,
        Number(endOdometerKm),
        Number(fuelConsumedL),
        Number(fuelCost),
        revenue !== undefined ? Number(revenue) : 0
      );
      res.json(trip);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/trips/:id/cancel", requireRole([Role.DISPATCHER]), async (req, res) => {
    try {
      const trip = await db.cancelTrip(req.params.id);
      res.json(trip);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 4. MAINTENANCE API
  app.get("/api/maintenance", async (req, res) => {
    try {
      let logs = await db.getMaintenanceLogs();
      const { vehicleId, status } = req.query;

      if (vehicleId) logs = logs.filter(l => l.vehicleId === vehicleId);
      if (status) logs = logs.filter(l => l.status === status);

      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/maintenance", requireRole([Role.FLEET_MANAGER]), async (req, res) => {
    try {
      const { vehicleId, description, cost } = req.body;
      if (!vehicleId || !description || cost === undefined) {
        res.status(400).json({ error: "Missing maintenance fields (vehicleId, description, cost)" });
        return;
      }
      const log = await db.openMaintenance(vehicleId, description, Number(cost));
      res.status(201).json(log);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/maintenance/:id/close", requireRole([Role.FLEET_MANAGER]), async (req, res) => {
    try {
      const { cost } = req.body;
      if (cost === undefined) {
        res.status(400).json({ error: "Missing cost field" });
        return;
      }
      const log = await db.closeMaintenance(req.params.id, Number(cost));
      res.json(log);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 5. FUEL LOGS API
  app.get("/api/fuel-logs", async (req, res) => {
    try {
      const logs = await db.getFuelLogs();
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/fuel-logs", requireRole([Role.FLEET_MANAGER, Role.FINANCIAL_ANALYST, Role.DISPATCHER]), async (req, res) => {
    try {
      const { vehicleId, liters, cost } = req.body;
      if (!vehicleId || liters === undefined || cost === undefined) {
        res.status(400).json({ error: "Missing vehicleId, liters, or cost" });
        return;
      }
      const log = await db.addFuelLog(vehicleId, Number(liters), Number(cost));
      res.status(201).json(log);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 6. EXPENSES API
  app.get("/api/expenses", async (req, res) => {
    try {
      const expenses = await db.getExpenses();
      res.json(expenses);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/expenses", requireRole([Role.FLEET_MANAGER, Role.FINANCIAL_ANALYST]), async (req, res) => {
    try {
      const { vehicleId, tripId, category, amount, description } = req.body;
      if (!category || amount === undefined) {
        res.status(400).json({ error: "Missing category or amount" });
        return;
      }
      const newExpense = await db.addExpense({
        vehicleId: vehicleId || null,
        tripId: tripId || null,
        category,
        amount: Number(amount),
        description: description || null
      });
      res.status(201).json(newExpense);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 7. REPORTS & KPI API
  app.get("/api/reports/dashboard", async (req, res) => {
    try {
      const vehicles = await db.getVehicles();
      const drivers = await db.getDrivers();
      const trips = await db.getTrips();

      const activeVehicles = vehicles.filter(v => v.status !== VehicleStatus.RETIRED).length;
      const availableVehicles = vehicles.filter(v => v.status === VehicleStatus.AVAILABLE).length;
      const vehiclesInShop = vehicles.filter(v => v.status === VehicleStatus.IN_SHOP).length;
      const activeTrips = trips.filter(t => t.status === TripStatus.DISPATCHED).length;
      const pendingTrips = trips.filter(t => t.status === TripStatus.DRAFT).length;
      const driversOnDuty = drivers.filter(d => d.status === DriverStatus.AVAILABLE || d.status === DriverStatus.ON_TRIP).length;

      const utilization = activeVehicles > 0
        ? Math.round((vehicles.filter(v => v.status === VehicleStatus.ON_TRIP).length / activeVehicles) * 100)
        : 0;

      res.json({
        activeVehicles,
        availableVehicles,
        vehiclesInShop,
        activeTrips,
        pendingTrips,
        driversOnDuty,
        fleetUtilizationPercent: utilization
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/reports/analytics", async (req, res) => {
    try {
      const vehicles = await db.getVehicles();
      const trips = await db.getTrips();
      const mLogs = await db.getMaintenanceLogs();
      const fuelLogs = await db.getFuelLogs();
      const expenses = await db.getExpenses();

      const report = vehicles.map(vehicle => {
        // 1. Fuel Efficiency (planned Distance / liters)
        const vehicleTrips = trips.filter(t => t.vehicleId === vehicle.id && t.status === TripStatus.COMPLETED);
        const totalFuelTripLiters = vehicleTrips.reduce((acc, t) => acc + (t.fuelConsumedL ?? 0), 0);
        const totalDistanceTrip = vehicleTrips.reduce((acc, t) => acc + (t.plannedDistanceKm ?? 0), 0);

        // Manual logs too
        const manualFuelLiters = fuelLogs.filter(f => f.vehicleId === vehicle.id).reduce((acc, f) => acc + f.liters, 0);
        const totalFuelLiters = totalFuelTripLiters + manualFuelLiters;

        const fuelEfficiencyKmPerL = totalFuelLiters > 0
          ? Number((totalDistanceTrip / totalFuelLiters).toFixed(2))
          : 0;

        // 2. Operational Cost = Fuel Cost + Maintenance Cost + General Expenses
        const fuelCost = fuelLogs.filter(f => f.vehicleId === vehicle.id).reduce((acc, f) => acc + f.cost, 0);
        const maintenanceCost = mLogs.filter(m => m.vehicleId === vehicle.id).reduce((acc, m) => acc + m.cost, 0);
        const vehicleExpenses = expenses.filter(e => e.vehicleId === vehicle.id).reduce((acc, e) => acc + e.amount, 0);
        const operationalCost = fuelCost + maintenanceCost + vehicleExpenses;

        // 3. Vehicle ROI = (Total Trip Revenue - (Fuel Cost + Maintenance Cost)) / Vehicle Acquisition Cost
        const totalRevenue = trips.filter(t => t.vehicleId === vehicle.id && t.status === TripStatus.COMPLETED)
          .reduce((acc, t) => acc + (t.revenue ?? 0), 0);

        const netEarnings = totalRevenue - (fuelCost + maintenanceCost);
        const roi = vehicle.acquisitionCost > 0
          ? Number((netEarnings / vehicle.acquisitionCost).toFixed(4))
          : 0;

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
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 8. CSV EXPORT
  app.get("/api/reports/export.csv", async (req, res) => {
    try {
      const vehicles = await db.getVehicles();
      const trips = await db.getTrips();
      const mLogs = await db.getMaintenanceLogs();
      const fuelLogs = await db.getFuelLogs();
      const expenses = await db.getExpenses();

      let csv = "Vehicle ID,Name,Registration Number,Type,Total Distance (km),Total Fuel (L),Fuel Efficiency (km/L),Fuel Cost,Maintenance Cost,Other Expenses,Operational Cost,Total Revenue,ROI (%)\n";

      vehicles.forEach(vehicle => {
        const vehicleTrips = trips.filter(t => t.vehicleId === vehicle.id && t.status === TripStatus.COMPLETED);
        const totalDistance = vehicleTrips.reduce((sum, t) => sum + (t.plannedDistanceKm ?? 0), 0);
        const tripFuel = vehicleTrips.reduce((sum, t) => sum + (t.fuelConsumedL ?? 0), 0);
        const manualFuel = fuelLogs.filter(f => f.vehicleId === vehicle.id).reduce((sum, f) => sum + f.liters, 0);
        const totalFuel = tripFuel + manualFuel;
        const kmPerL = totalFuel > 0 ? (totalDistance / totalFuel).toFixed(2) : "0.00";

        const fuelCost = fuelLogs.filter(f => f.vehicleId === vehicle.id).reduce((sum, f) => sum + f.cost, 0);
        const maintenanceCost = mLogs.filter(m => m.vehicleId === vehicle.id).reduce((sum, m) => sum + m.cost, 0);
        const vehicleExpenses = expenses.filter(e => e.vehicleId === vehicle.id).reduce((sum, e) => sum + e.amount, 0);
        const opCost = fuelCost + maintenanceCost + vehicleExpenses;

        const totalRevenue = trips.filter(t => t.vehicleId === vehicle.id && t.status === TripStatus.COMPLETED)
                                  .reduce((sum, t) => sum + (t.revenue ?? 0), 0);
        const roiVal = vehicle.acquisitionCost > 0
          ? (((totalRevenue - (fuelCost + maintenanceCost)) / vehicle.acquisitionCost) * 100).toFixed(2)
          : "0.00";

        csv += `"${vehicle.id}","${vehicle.name}","${vehicle.registrationNumber}","${vehicle.type}",${totalDistance},${totalFuel.toFixed(2)},${kmPerL},${fuelCost.toFixed(2)},${maintenanceCost.toFixed(2)},${vehicleExpenses.toFixed(2)},${opCost.toFixed(2)},${totalRevenue.toFixed(2)},${roiVal}\n`;
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=fleet_analytics_report.csv");
      res.status(200).send(csv);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- INTEGRATION WITH VITE FRONTEND ---

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TransitOps server running at http://localhost:${PORT}`);
  });
}

startServer();
