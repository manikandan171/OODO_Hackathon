import { z } from "zod";

export const driverSchema = z.object({
  name: z.string().min(1, "Name is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  licenseCategory: z.string().min(1, "License category is required"),
  licenseExpiryDate: z.string().min(1, "License expiry date is required"),
  contactNumber: z.string().min(1, "Contact number is required"),
  safetyScore: z.coerce.number().min(0).max(100, "Safety score must be between 0 and 100"),
});
