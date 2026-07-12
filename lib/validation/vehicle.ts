import { z } from "zod";

export const vehicleSchema = z.object({
  registrationNumber: z.string().min(1, "Registration number is required"),
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  maxLoadCapacityKg: z.coerce.number().positive("Max load capacity must be positive"),
  odometerKm: z.coerce.number().nonnegative("Odometer must be non-negative"),
  acquisitionCost: z.coerce.number().positive("Acquisition cost must be positive"),
  region: z.string().min(1, "Region is required"),
});
