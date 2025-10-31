// mentor.schema.ts
import * as z from "zod"; 

export const CreateMentorSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(50, { message: "Name must be less than 50 characters" }),

  email: z
    .string()
    .email({ message: "Invalid email format" })
    .min(5, { message: "Email must be at least 5 characters long" }),

  price: z
    .number({
      message: "Price is required",
    })
    .positive({ message: "Price must be a positive number" })
    .optional(),

  categoryId: z
    .string()
    .min(1, { message: "Category ID is required" }),

  bio: z
    .string()
    .max(500, { message: "Bio must be less than 500 characters" })
    .optional(),

  expertise: z
    .array(z.string())
    .min(1, { message: "At least one area of expertise is required" })
    .optional()
});

export const UpdateMentorSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(50, { message: "Name must be less than 50 characters" })
    .optional(),

  email: z
    .string()
    .email({ message: "Invalid email format" })
    .min(5, { message: "Email must be at least 5 characters long" })
    .optional(),

  price: z
    .number({
      message: "Price must be a number"
    })
    .positive({ message: "Price must be a positive number" })
    .optional(),

  categoryId: z
    .string()
    .min(1, { message: "Category ID cannot be empty" })
    .optional(),

  bio: z
    .string()
    .max(500, { message: "Bio must be less than 500 characters" })
    .optional()
    .nullable(),

  expertise: z
    .array(z.string())
    .optional(),
  
  interests: z
    .array(z.string())
    .max(5, { message: "Maximum 5 interests allowed" })
    .optional(),
  
  skills: z
    .array(z.string())
    .max(5, { message: "Maximum 5 skills allowed" })
    .optional(),
  
  achievements: z
    .array(z.string())
    .max(5, { message: "Maximum 5 achievements allowed" })
    .optional(),
  
  collegeId: z
    .string()
    .optional()
    .nullable(),
  
  courseId: z
    .string()
    .optional()
    .nullable()
});

export type CreateMentorType = z.infer<typeof CreateMentorSchema>;
export type UpdateMentorType = z.infer<typeof UpdateMentorSchema>;