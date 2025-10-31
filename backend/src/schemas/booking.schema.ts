import { z } from "zod";

// Time format validation (HH:MM in 24-hour format)
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

// Helper function to validate time is in 30-minute intervals
const isValidTimeInterval = (time: string): boolean => {
  const [hours, minutes] = time.split(":").map(Number);
  return minutes === 0 || minutes === 30;
};

// Helper function to calculate end time (30 minutes after start)
export const calculateEndTime = (startTime: string): string => {
  const [hoursStr, minutesStr] = startTime.split(":");
  const hoursNum = Number(hoursStr ?? 0);
  const minutesNum = Number(minutesStr ?? 0);

  const hours = Number.isFinite(hoursNum) ? hoursNum : 0;
  const minutes = Number.isFinite(minutesNum) ? minutesNum : 0;

  let endHours = hours;
  let endMinutes = minutes + 30;

  if (endMinutes >= 60) {
    endHours += 1;
    endMinutes = 0;
  }

  return `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`;
};

// Helper function to check if date/time is at least 48 hours in future
export const isAtLeast48HoursAway = (date: string, time: string): boolean => {
  const slotDateTime = new Date(`${date}T${time}:00`);
  const now = new Date();
  const hoursDifference = (slotDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return hoursDifference >= 48;
};

// Helper function to check if date/time is within the next 48 hours
export const isWithin48Hours = (date: string, time: string): boolean => {
  const slotDateTime = new Date(`${date}T${time}:00`);
  const now = new Date();
  const hoursDifference = (slotDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  // true if time is in the future, but less than 48 hours away
  return hoursDifference > 0 && hoursDifference <= 48;
};

// Schema for booking ID parameter
export const bookingIdParamSchema = z.object({
  bookingId: z.string().cuid("Invalid booking ID format"),
});

// Schema for booking query filters
export const bookingQuerySchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  mentorId: z.string().cuid().optional(),
  studentId: z.string().cuid().optional(),
});

// Schema for cart item response
export const cartItemErrorSchema = z.object({
  cartItemId: z.string().cuid(),
  errorMessage: z.string(),
  slotDetails: z.object({
    mentorName: z.string(),
    date: z.string(),
    startTime: z.string(),
    endTime: z.string(),
  }).optional(),
});

// Type exports
export type BookingIdParam = z.infer<typeof bookingIdParamSchema>;
export type BookingQuery = z.infer<typeof bookingQuerySchema>;
export type CartItemError = z.infer<typeof cartItemErrorSchema>;