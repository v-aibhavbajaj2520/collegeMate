import type { Response } from "express";
import type { AuthRequest } from "../middleware/authenticate.js";
import { requireUser } from "./auth.controller.js";
import { BookingStatus, CartItemStatus, SlotStatus } from "../../generated/prisma/index.js";
import { isWithin48Hours } from "../schemas/booking.schema.js";
import { prisma } from "../prisma.js";

interface CartItemError {
  cartItemId: string;
  errorMessage: string;
  slotDetails?: {
    mentorName: string;
    date: string;
    startTime: string;
    endTime: string;
  };
}

export const bookFromCart = async (req: AuthRequest, res: Response) => {
  try {
    requireUser(req);
    const { id } = req.user;

    // Get the cart with all cart items and related data
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
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    const errors: CartItemError[] = [];
    const validCartItems = [];

    // Validate each cart item
    for (const cartItem of cart.items) {
      const slotDetails = {
        mentorName: cartItem.slot.mentor.name,
        date: cartItem.date.toISOString().split("T")[0]!,
        startTime: cartItem.startTime,
        endTime: cartItem.endTime,
      };

      // 1. Check if cart item has expired
      if (cartItem.expiresAt && new Date(cartItem.expiresAt) < new Date()) {
        errors.push({
          cartItemId: cartItem.id,
          errorMessage: "This cart item has expired",
          slotDetails,
        });
        continue;
      }

      // 2. Check if slot is within 48 hours from now
      const dateStr = cartItem.date.toISOString().split("T")[0]!;
      if (!isWithin48Hours(dateStr, cartItem.startTime)) {
        errors.push({
          cartItemId: cartItem.id,
          errorMessage:
            "Booking must be made within 48 hours of the slot time",
          slotDetails,
        });
        continue;
      }

      // 3. Check if the slot is still available (not already booked)
      const currentSlot = await prisma.slot.findUnique({
        where: { id: cartItem.slotId },
      });

      if (!currentSlot) {
        errors.push({
          cartItemId: cartItem.id,
          errorMessage: "Slot no longer exists",
          slotDetails,
        });
        continue;
      }

      if (currentSlot.status === SlotStatus.BOOKED) {
        errors.push({
          cartItemId: cartItem.id,
          errorMessage: "This slot has already been booked by someone else",
          slotDetails,
        });
        continue;
      }

      if (currentSlot.status === SlotStatus.CLOSED) {
        errors.push({
          cartItemId: cartItem.id,
          errorMessage: "This slot is no longer available",
          slotDetails,
        });
        continue;
      }

      // If all checks pass, add to valid items
      validCartItems.push(cartItem);
    }

    // If there are any errors, return them
    if (errors.length > 0 && validCartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "All cart items failed validation",
        errors,
      });
    }

    // Group valid cart items by mentor
    const itemsByMentor = validCartItems.reduce(
      (acc, item) => {
        if (!acc[item.mentorId]) {
          acc[item.mentorId] = [];
        }
        acc[item.mentorId]!.push(item);
        return acc;
      },
      {} as Record<string, typeof validCartItems>
    );

    // Create bookings grouped by mentor
    const createdBookings = [];

    for (const [mentorId, items] of Object.entries(itemsByMentor)) {
      const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

      // Create booking with booking items in a transaction
      const booking = await prisma.$transaction(async (tx) => {
        // Create the booking
        const newBooking = await tx.booking.create({
          data: {
            studentId: id,
            mentorId,
            totalPrice,
            status: BookingStatus.PENDING,
            items: {
              create: items.map((item) => ({
                slotId: item.slotId,
                mentorId: item.mentorId,
                date: item.date,
                startTime: item.startTime,
                endTime: item.endTime,
                price: item.price,
                status: BookingStatus.CONFIRMED,
              })),
            },
          },
          include: {
            items: true,
            mentor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        // Update slot statuses to BOOKED
        await tx.slot.updateMany({
          where: {
            id: { in: items.map((item) => item.slotId) },
          },
          data: {
            status: SlotStatus.BOOKED,
          },
        });

        // Mark cart items as CHECKED_OUT
        await tx.cartItem.updateMany({
          where: {
            id: { in: items.map((item) => item.id) },
          },
          data: {
            status: CartItemStatus.CHECKED_OUT,
          },
        });

        // Create notification for mentor
        await tx.notification.create({
          data: {
            userId: mentorId,
            title: "New Booking Received",
            message: `You have received a new booking for ${items.length} slot(s)`,
          },
        });

        return newBooking;
      });

      createdBookings.push(booking);
    }

    return res.status(201).json({
      success: true,
      message: "Bookings created successfully",
      data: {
        bookings: createdBookings,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create bookings",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ADMIN only
export const getAllBookings = async (req: AuthRequest, res: Response) => {
  try {
    requireUser(req);

    const bookings = await prisma.booking.findMany({
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            slot: {
              select: {
                id: true,
                date: true,
                startTime: true,
                endTime: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: bookings,
      count: bookings.length,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// MENTOR Only
export const getMentorBookings = async (req: AuthRequest, res: Response) => {
  try {
    requireUser(req);
    const { id } = req.user;

    const bookings = await prisma.booking.findMany({
      where: {
        mentorId: id,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            slot: {
              select: {
                id: true,
                date: true,
                startTime: true,
                endTime: true,
                status: true,
              },
            },
          },
          orderBy: {
            date: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: bookings,
      count: bookings.length,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch mentor bookings",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// USER only
export const getAllUserBooking = async (req: AuthRequest, res: Response) => {
  try {
    requireUser(req);
    const { id } = req.user;

    const bookings = await prisma.booking.findMany({
      where: {
        studentId: id,
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            expertise: true,
          },
        },
        items: {
          include: {
            slot: {
              select: {
                id: true,
                date: true,
                startTime: true,
                endTime: true,
                status: true,
              },
            },
          },
          orderBy: {
            date: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: bookings,
      count: bookings.length,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user bookings",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const cancelABooking = async (req: AuthRequest, res: Response) => {
  try {
    requireUser(req);
    const { id } = req.user;
    const { bookingId } = req.params;

    if(!bookingId){
      res.status(400).json({
        success: false,
        message: "bookingId is required"
      })
      return
    }

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        items: true,
        student: true,
        mentor: true,
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user is authorized (either student or mentor can cancel)
    if (booking.studentId !== id && booking.mentorId !== id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this booking",
      });
    }

    // Check if booking is already cancelled or completed
    if (booking.status === BookingStatus.CANCELLED) {
      return res.status(400).json({
        success: false,
        message: "This booking is already cancelled",
      });
    }

    if (booking.status === BookingStatus.COMPLETED) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a completed booking",
      });
    }

    // Check if any slot is in the past
    const now = new Date();
    const hasPassedSlot = booking.items.some((item) => {
      const slotDateTime = new Date(`${item.date.toISOString().split("T")[0]}T${item.startTime}:00`);
      return slotDateTime < now;
    });

    if (hasPassedSlot) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel booking with past time slots",
      });
    }

    // Cancel booking and free up slots
    await prisma.$transaction(async (tx) => {
      // Update booking status
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CANCELLED,
        },
      });

      // Update booking items status
      await tx.bookingItem.updateMany({
        where: { bookingId },
        data: {
          status: BookingStatus.CANCELLED,
        },
      });

      // Free up slots
      await tx.slot.updateMany({
        where: {
          id: { in: booking.items.map((item) => item.slotId) },
        },
        data: {
          status: SlotStatus.AVAILABLE,
        },
      });

      // Create notification for the other party
      const notificationUserId = booking.studentId === id ? booking.mentorId : booking.studentId;
      const cancelledBy = booking.studentId === id ? "student" : "mentor";

      await tx.notification.create({
        data: {
          userId: notificationUserId,
          title: "Booking Cancelled",
          message: `A booking has been cancelled by the ${cancelledBy}`,
        },
      });
    });

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};