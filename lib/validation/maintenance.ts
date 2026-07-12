import { z } from "zod";

export const maintenanceSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  description: z.string().min(1, "Description is required"),
  cost: z.coerce.number().nonnegative("Estimated cost must be non-negative"),
});
