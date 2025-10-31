import type { Request, Response } from "express";
import { prisma } from "../prisma.js";
import type { AuthRequest } from "../middleware/authenticate.js";

// Get all colleges
export const getAllColleges = async (req: Request, res: Response) => {
  try {
    const colleges = await prisma.college.findMany({
      orderBy: {
        name: "asc",
      },
    });

    res.status(200).json({
      success: true,
      message: "Colleges retrieved successfully",
      data: colleges,
    });
  } catch (error) {
    console.error("Get colleges error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong server side.",
    });
  }
};

// Create a college (ADMIN only)
export const createCollege = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const { name } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "College name is required",
      });
    }

    // Check if college already exists
    const existingCollege = await prisma.college.findUnique({
      where: { name: name.trim() },
    });

    if (existingCollege) {
      return res.status(400).json({
        success: false,
        message: "College with this name already exists",
      });
    }

    const college = await prisma.college.create({
      data: {
        name: name.trim(),
      },
    });

    res.status(201).json({
      success: true,
      message: "College created successfully",
      data: college,
    });
  } catch (error) {
    console.error("Create college error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong server side.",
    });
  }
};

// Delete a college (ADMIN only)
export const deleteCollege = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "College ID is required",
      });
    }

    // Check if college exists
    const college = await prisma.college.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            mentors: true,
          },
        },
      },
    });

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    // Check if college is being used by mentors
    if (college._count.mentors > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete college that is being used by mentors",
      });
    }

    await prisma.college.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "College deleted successfully",
    });
  } catch (error) {
    console.error("Delete college error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong server side.",
    });
  }
};

