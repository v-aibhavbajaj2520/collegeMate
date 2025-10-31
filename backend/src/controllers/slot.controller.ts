import type { Response } from "express";
import type { AuthRequest } from "../middleware/authenticate.js";
import { requireUser } from "./auth.controller.js";
import {
  openSlotSchema,
  closeSlotSchema,
  calculateEndTime,
  isAtLeast48HoursAway,
  type OpenSlotInput,
} from "../schemas/slot.schema.js";
import { prisma } from "../prisma.js";

export const openSlot = async (req: AuthRequest, res: Response) => {
  try {
    requireUser(req);
    const { userId: mentorId } = req.user;

    // Validate request body
    const validationResult = openSlotSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      });
    }

    const { date, startTime } = validationResult.data as OpenSlotInput;

    // Calculate end time (30 minutes after start)
    const endTime = calculateEndTime(startTime);

    // Check if mentor exists and get their details
    const mentor = await prisma.user.findUnique({
      where: { id: mentorId },
      include: {
        category: true,
      },
    });

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found",
      });
    }

    if (mentor.role !== "MENTOR") {
      return res.status(403).json({
        success: false,
        message: "Only mentors can open slots",
      });
    }

    // Determine the price for this slot
    let slotPrice: number;
    
    if (mentor.pricePerSlot !== null && mentor.pricePerSlot !== undefined) {
      slotPrice = mentor.pricePerSlot;
    } else if (mentor.category?.pricePerSlot !== null && mentor.category?.pricePerSlot !== undefined) {
      slotPrice = mentor.category.pricePerSlot;
    } else {
      return res.status(400).json({
        success: false,
        message: "No price configured for this mentor. Please set price in profile or category.",
      });
    }

    // Check if slot already exists for this mentor at this date and time
    const existingSlot = await prisma.slot.findUnique({
      where: {
        mentorId_date_startTime: {
          mentorId,
          date: new Date(date),
          startTime,
        },
      },
      
    });

    if (existingSlot) {
      return res.status(409).json({
        success: false,
        message: "A slot already exists for this time. Please choose a different time or close the existing slot first.",
        existingSlot: {
          id: existingSlot.id,
          status: existingSlot.status,
        },
      });
    }

    // Double-check 48-hour rule (redundant but safe)
    if (!isAtLeast48HoursAway(date, startTime)) {
      return res.status(400).json({
        success: false,
        message: "Slot must be scheduled at least 48 hours in advance",
      });
    }

    // Create the slot with AVAILABLE status
    const newSlot = await prisma.slot.create({
      data: {
        mentorId,
        date: new Date(date),
        startTime,
        endTime,
        status: "AVAILABLE",
        price: slotPrice,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Slot opened successfully",
      data: {
        slot: newSlot,
      },
    });
  } catch (error: any) {
    console.error("Error opening slot:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const closeSlot = async (req: AuthRequest, res: Response) => {
  try {
    requireUser(req);
    const { userId: mentorId } = req.user;
    const { slotId } = req.params;
    if(!slotId){
        res.status(400).json({
            success: false,
            message: "slotid is required"
        })
        return
    }

    // Validate slot ID format
    const validationResult = closeSlotSchema.safeParse({ slotId });
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid slot ID format",
        errors: validationResult.error.flatten().fieldErrors,
      });
    }

    // Check if slot exists
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: {
        bookingItem: true,
      },
    });

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Slot not found",
      });
    }

    // Check if the mentor owns this slot
    if (slot.mentorId !== mentorId) {
      return res.status(403).json({
        success: false,
        message: "You can only close your own slots",
      });
    }

    // Check if slot has any bookings
    if (slot.bookingItem) {
      return res.status(400).json({
        success: false,
        message: "Cannot close a slot that has a booking. Please cancel the booking first.",
        booking: {
          id: slot.bookingItem.id,
          status: slot.bookingItem.status,
        },
      });
    }

    // Check if slot is at least 48 hours away
    const slotDateStr = slot.date.toISOString().split("T")[0] as string;
    if (!isAtLeast48HoursAway(slotDateStr, slot.startTime)) {
      return res.status(400).json({
        success: false,
        message: "Cannot close a slot that is less than 48 hours away",
      });
    }

    // Delete the slot (or mark as CLOSED based on your preference)
    await prisma.slot.delete({
      where: { id: slotId },
    });

    // Alternative: Mark as CLOSED instead of deleting
    // await prisma.slot.update({
    //   where: { id: slotId },
    //   data: { status: "CLOSED" },
    // });

    return res.status(200).json({
      success: true,
      message: "Slot closed successfully",
      data: {
        slotId,
      },
    });
  } catch (error: any) {
    console.error("Error closing slot:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllSlotsOfMentor = async (req: AuthRequest, res: Response) => {
  try {
    requireUser(req);
    const { userId } = req.user;

    // Optional query parameters for filtering
    const { status, date, startDate, endDate } = req.query;

    // Build dynamic where clause
    const whereClause: any = {
      mentorId: userId,
    };

    // Filter by status if provided
    if (status && ["CLOSED", "AVAILABLE", "BOOKED"].includes(status as string)) {
      whereClause.status = status;
    }

    // Filter by exact date if provided
    if (date && typeof date === "string") {
      whereClause.date = new Date(date);
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate && typeof startDate === "string") {
        whereClause.date.gte = new Date(startDate);
      }
      if (endDate && typeof endDate === "string") {
        whereClause.date.lte = new Date(endDate);
      }
    }

    // Fetch all slots for the mentor
    const slots = await prisma.slot.findMany({
      where: whereClause,
      include: {
        bookingItem: {
          include: {
            booking: {
              select: {
                id: true,
                student: true
                
              },
            },
          },
        },
      },
      orderBy: [
        { date: "asc" },
        { startTime: "asc" },
      ],
    });

    // Get count by status
    const statusCounts = await prisma.slot.groupBy({
      by: ["status"],
      where: { mentorId: userId },
      _count: true,
    });

    const counts = statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>);

    return res.status(200).json({
      success: true,
      message: "Slots retrieved successfully",
      data: {
        slots,
        totalCount: slots.length,
        statusCounts: counts,
      },
    });
  } catch (error: any) {
    console.error("Error fetching slots:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};