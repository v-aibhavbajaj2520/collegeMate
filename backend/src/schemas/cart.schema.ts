import { z } from "zod";

// Schema for adding item to cart
export const addCartItemSchema = z.object({
  slotId: z.string().cuid("Invalid slot ID format"),
});

// Schema for removing item from cart (via params)
export const removeCartItemSchema = z.object({
  id: z.string().cuid("Invalid cart item ID format"),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type RemoveCartItemInput = z.infer<typeof removeCartItemSchema>;