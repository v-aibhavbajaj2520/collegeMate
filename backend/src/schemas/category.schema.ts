import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must not exceed 100 characters")
    .trim(),
  pricePerSlot: z.number()
    .positive("Price must be a positive number")
    .min(0.01, "Price must be at least 0.01")
});

export const updateCategorySchema = z.object({
  name: z.string()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must not exceed 100 characters")
    .trim()
    .optional(),
  pricePerSlot: z.number()
    .positive("Price must be a positive number")
    .min(0.01, "Price must be at least 0.01")
    .optional()
}).refine(data => data.name !== undefined || data.pricePerSlot !== undefined, {
  message: "At least one field (name or pricePerSlot) must be provided"
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;