import { z } from "zod";

export const expenseSchema = z.object({
  vehicleId: z.string().nullable().optional(),
  tripId: z.string().nullable().optional(),
  category: z.enum(["TOLL", "MISC", "MAINTENANCE", "FUEL", "OTHER"]),
  amount: z.coerce.number().positive("Amount must be positive"),
  description: z.string().nullable().optional(),
});
