import type { Response } from "express";
import type { AuthRequest } from "../middleware/authenticate.js";
import { requireUser } from "./auth.controller.js";

import { createCategorySchema, updateCategorySchema } from "../schemas/category.schema.js";
import { ZodError } from "zod";
import { prisma } from "../prisma.js";
import type { Prisma } from "../../generated/prisma/index.js";



// Create a new category
export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    requireUser(req);

    // Validate request body
    const validatedData = createCategorySchema.parse(req.body);

    // Check if category with same name already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name: validatedData.name }
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category with this name already exists"
      });
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        pricePerSlot: validatedData.pricePerSlot
      }
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.message
      });
    }

    console.error("Create category error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get all categories without mentors
export const getAllCategories = async (req: AuthRequest, res: Response) => {
  try {
    requireUser(req);

    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" }
    });

    return res.status(200).json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    console.error("Get all categories error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get one specific category with mentors
export const getOneCategory = async (req: AuthRequest, res: Response) => {
  try {
    requireUser(req);

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required"
      });
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        mentors: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true,
            expertise: true,
            pricePerSlot: true,
            isVerified: true
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error("Get one category error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Update a category
export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    requireUser(req);

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required"
      });
    }

    // Validate request body
    const validatedData = updateCategorySchema.parse(req.body);

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    // If updating name, check if new name already exists
    if (validatedData.name && validatedData.name !== existingCategory.name) {
      const duplicateCategory = await prisma.category.findUnique({
        where: { name: validatedData.name }
      });

      if (duplicateCategory) {
        return res.status(409).json({
          success: false,
          message: "Category with this name already exists"
        });
      }
    }
   const updateDocRef: Prisma.CategoryUpdateInput = {
  ...(validatedData.name ? { name: validatedData.name } : {}),
  ...(validatedData.pricePerSlot ? { price: validatedData.pricePerSlot } : {}),
}
    // Update category
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateDocRef
    });

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.message
      });
    }

    console.error("Update category error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Delete a category
export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    requireUser(req);

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required"
      });
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { mentors: true }
        }
      }
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    // Check if category has mentors
    if (existingCategory._count.mentors > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${existingCategory._count.mentors} mentor(s) assigned to it.`
      });
    }

    // Delete category
    await prisma.category.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (error) {
    console.error("Delete category error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};