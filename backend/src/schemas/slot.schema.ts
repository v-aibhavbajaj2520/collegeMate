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


// Schema for opening a slot
export const openSlotSchema = z.object({
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .refine((date) => {
      const d = new Date(date);
      return !isNaN(d.getTime());
    }, "Invalid date"),
  startTime: z.string()
    .regex(timeRegex, "Start time must be in HH:MM format (24-hour)")
    .refine(isValidTimeInterval, "Start time must be in 30-minute intervals (e.g., 09:00, 09:30, 10:00)"),
}).refine((data) => {
  return isAtLeast48HoursAway(data.date, data.startTime);
}, {
  message: "Slot must be at least 48 hours from now",
  path: ["date"],
});

// Schema for closing a slot
export const closeSlotSchema = z.object({
  slotId: z.string().cuid("Invalid slot ID format"),
});

// Schema for getting slots with optional filters
export const getSlotsSchema = z.object({
  status: z.enum(["CLOSED", "AVAILABLE", "BOOKED"]).optional(),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  startDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format")
    .optional(),
  endDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format")
    .optional(),
});

export type OpenSlotInput = z.infer<typeof openSlotSchema>;
export type CloseSlotInput = z.infer<typeof closeSlotSchema>;
export type GetSlotsInput = z.infer<typeof getSlotsSchema>;