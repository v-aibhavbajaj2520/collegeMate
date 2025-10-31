import type { Response } from "express";
import type { AuthRequest } from "../middleware/authenticate.js";
import { requireUser } from "./auth.controller.js";
import { addCartItemSchema, removeCartItemSchema } from "../schemas/cart.schema.js";

import { isWithin48Hours } from "../schemas/slot.schema.js"; 
import { SlotStatus, CartItemStatus } from "../../generated/prisma/index.js"
import { prisma } from "../prisma.js";

export const getAllCartItems = async (req: AuthRequest, res: Response) => {
  try {
    requireUser(req);
    const { id } = req.user;

    // Get user's cart with all active items
    const cart = await prisma.cart.findUnique({
      where: { userId: id },
      include: {
        items: {
          where: { status: CartItemStatus.ACTIVE },
          include: {
            slot: {
              include: {
                mentor: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    bio: true,
                    expertise: true,
                    category: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    // If no cart exists, return empty array
    if (!cart) {
      return res.status(200).json({
        success: true,
        data: {
          items: [],
          totalItems: 0,
          totalPrice: 0,
        },
        message: "Cart is empty",
      });
    }

    // Calculate total price
    const totalPrice = cart.items.reduce((sum, item) => sum + item.price, 0);

    return res.status(200).json({
      success: true,
      data: {
        cartId: cart.id,
        items: cart.items,
        totalItems: cart.items.length,
        totalPrice,
      },
      message: "Cart items retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting cart items:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to retrieve cart items",
    });
  }
};

export const addItemToCart = async (req: AuthRequest, res: Response) => {
  try {
    requireUser(req);
    const { id: userId } = req.user;

    // Validate request body
    const validationResult = addCartItemSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
        errors: validationResult.error.message,
      });
    }

    const { slotId } = validationResult.data;

    // Check if the slot exists and get its details
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        }
      },
    });

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Slot not found",
      });
    }


    // Check if slot is available
    if (slot.status !== SlotStatus.AVAILABLE) {
      return res.status(400).json({
        success: false,
        message: `Slot is not available. Current status: ${slot.status}`,
      });
    }

    // Check if slot is at least 48 hours away
    const dateStr = slot.date.toISOString().split("T")[0];
    if (!isWithin48Hours(dateStr!, slot.startTime)) {
      return res.status(400).json({
        success: false,
        message: "Slots must be booked within 48 hours.",
      });
    }

    // Check if user already has this slot in their cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        userId,
        slotId,
        status: CartItemStatus.ACTIVE,
      },
    });

    if (existingCartItem) {
      return res.status(400).json({
        success: false,
        message: "This slot is already in your cart",
      });
    }

    // Get or create cart for user
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    // Add item to cart
    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        userId,
        slotId,
        mentorId: slot.mentorId,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        price: slot.price,
        status: CartItemStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      },
      include: {
        slot: {
          include: {
            mentor: {
              select: {
                id: true,
                name: true,
                email: true,
                bio: true,
                expertise: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      data: cartItem,
      message: "Item added to cart successfully",
    });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to add item to cart",
    });
  }
};

export const removeItemFromCart = async (req: AuthRequest, res: Response) => {
  try {
    requireUser(req);
    const { id: userId } = req.user;

    // Validate params
    const validationResult = removeCartItemSchema.safeParse(req.params);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart item ID",
        errors: validationResult.error.message,
      });
    }

    const { id: cartItemId } = validationResult.data;

    // Check if cart item exists and belongs to user
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    // Verify the cart item belongs to the requesting user
    if (cartItem.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only remove items from your own cart",
      });
    }

    // Delete the cart item
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
    });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to remove item from cart",
    });
  }
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    requireUser(req);
    const { id: userId } = req.user;

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Delete all cart items for this cart
    const deleteResult = await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        userId, // Extra safety check
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        deletedCount: deleteResult.count,
      },
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to clear cart",
    });
  }
};