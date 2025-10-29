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
      error: "Price is required",
    })
    .positive({ message: "Price must be a positive number" }),
});


export type CreateMentorType = z.infer<typeof CreateMentorSchema>;