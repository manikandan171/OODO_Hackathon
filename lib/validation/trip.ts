import { z } from "zod";

export const tripSchema = z.object({
  source: z.string().min(1, "Source is required"),
  destination: z.string().min(1, "Destination is required"),
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  driverId: z.string().min(1, "Driver ID is required"),
  cargoWeightKg: z.coerce.number().positive("Cargo weight must be positive"),
  plannedDistanceKm: z.coerce.number().positive("Planned distance must be positive"),
  revenue: z.coerce.number().nonnegative("Revenue must be non-negative").optional().nullable(),
});
