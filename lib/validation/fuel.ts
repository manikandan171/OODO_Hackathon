import { z } from "zod";

export const fuelSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  liters: z.coerce.number().positive("Liters must be positive"),
  cost: z.coerce.number().positive("Cost must be positive"),
});
