// mentor.controller.ts
import type { AuthRequest } from "../middleware/authenticate.js";
import { CreateMentorSchema, UpdateMentorSchema } from "../schemas/mentor.schema.js";
import { prisma } from "../prisma.js";
import bcrypt from "bcrypt";
import type { Response } from "express";
import type { Prisma } from "../../generated/prisma/index.js";

const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD;

// Get all mentors
export const getAllMentors = async (req: AuthRequest, res: Response) => {
  try {
    const mentors = await prisma.user.findMany({
      where: { role: "MENTOR" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        pricePerSlot: true,
        bio: true,
        expertise: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            pricePerSlot: true
          }
        },
        isVerified: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: "desc" }
    });

    res.status(200).json({
      success: true,
      message: "Mentors retrieved successfully",
      data: mentors,
      count: mentors.length
    });

  } catch (error) {
    console.error("Get all mentors error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong server side."
    });
  }
};

// Get a specific mentor by ID
export const getMentorById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if(!id){
        res.status(400).json({
            success: false,
            message: "id is required"
        })
        return
    }

    const mentor = await prisma.user.findUnique({
      where: { 
        id,
        role: "MENTOR"
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        pricePerSlot: true,
        bio: true,
        expertise: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            pricePerSlot: true
          }
        },
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            mentorSlots: true,
            mentorBookings: true
          }
        }
      }
    });

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Mentor retrieved successfully",
      data: mentor
    });

  } catch (error) {
    console.error("Get mentor by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong server side."
    });
  }
};

// Create mentor with email and password and attach the category
export const createMentor = async (req: AuthRequest, res: Response) => {
  try {
    // Validate request body
    const result = CreateMentorSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data",
        errors: result.error.message
      });
    }

    const { email, name, categoryId, price, bio, expertise } = result.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    // Validate DEFAULT_PASSWORD exists
    if (!DEFAULT_PASSWORD) {
      console.error("DEFAULT_PASSWORD environment variable is not set");
      return res.status(500).json({
        success: false,
        message: "Server configuration error"
      });
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    // Hash the default password
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);

    // Create mentor user
    const mentor = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "MENTOR",
        isVerified: true, // Auto-verify mentors created by admin
        pricePerSlot: price ? price : null,
        categoryId,
        bio: bio || null,
        expertise: expertise || []
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        pricePerSlot: true,
        bio: true,
        expertise: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            pricePerSlot: true
          }
        },
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      message: "Mentor created successfully",
      data: mentor
    });

  } catch (error) {
    console.error("Create mentor error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong server side."
    });
  }
};

// Update a specific mentor
export const updateMentor = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
     
    if(!id){
        res.status(400).json({
            success: false,
            message: "id is required"
        })
        return
    }

    // Validate request body
    const result = UpdateMentorSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data",
        errors: result.error.message
      });
    }

    const validatedData = result.data;

    // Check if mentor exists
    const existingMentor = await prisma.user.findUnique({
      where: { 
        id,
        role: "MENTOR"
      }
    });

    if (!existingMentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found"
      });
    }

    // If email is being updated, check if it's already taken
    if (validatedData.email && validatedData.email !== existingMentor.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email }
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email is already taken"
        });
      }
    }

    // If categoryId is being updated, check if it exists
    if (validatedData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: validatedData.categoryId }
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found"
        });
      }
    }

    // Build update object
    const updateDocRef: Prisma.UserUpdateInput = {
      ...(validatedData.name ? { name: validatedData.name } : {}),
      ...(validatedData.email ? { email: validatedData.email } : {}),
      ...(validatedData.price !== undefined ? { pricePerSlot: validatedData.price } : {}),
      ...(validatedData.categoryId ? { categoryId: validatedData.categoryId } : {}),
      ...(validatedData.bio !== undefined ? { bio: validatedData.bio } : {}),
      ...(validatedData.expertise !== undefined ? { expertise: validatedData.expertise } : {})
    };

    // Update mentor
    const updatedMentor = await prisma.user.update({
      where: { id },
      data: updateDocRef,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        pricePerSlot: true,
        bio: true,
        expertise: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            pricePerSlot: true
          }
        },
        isVerified: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      message: "Mentor updated successfully",
      data: updatedMentor
    });

  } catch (error) {
    console.error("Update mentor error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong server side."
    });
  }
};

// Delete a mentor
export const deleteMentor = async (req: AuthRequest, res: Response) => {
  try {
     const { id } = req.params;
    if(!id){
        res.status(400).json({
            success: false,
            message: "id is required"
        })
        return
    }

    // Check if mentor exists
    const mentor = await prisma.user.findUnique({
      where: { 
        id,
        role: "MENTOR"
      },
      include: {
        _count: {
          select: {
            mentorBookings: {
              where: {
                status: {
                  in: ["PENDING", "CONFIRMED"]
                }
              }
            }
          }
        }
      }
    });

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found"
      });
    }

    // Check if mentor has active bookings
    if (mentor._count.mentorBookings > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete mentor with active bookings. Please complete or cancel all bookings first."
      });
    }

    // Delete mentor (cascade will handle related records)
    await prisma.user.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: "Mentor deleted successfully"
    });

  } catch (error) {
    console.error("Delete mentor error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong server side."
    });
  }
};