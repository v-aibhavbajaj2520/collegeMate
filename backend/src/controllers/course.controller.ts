import type { Request, Response } from "express";
import { prisma } from "../prisma.js";
import type { AuthRequest } from "../middleware/authenticate.js";

// Get all courses
export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: {
        name: "asc",
      },
    });

    res.status(200).json({
      success: true,
      message: "Courses retrieved successfully",
      data: courses,
    });
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong server side.",
    });
  }
};

// Create a course (ADMIN only)
export const createCourse = async (req: AuthRequest, res: Response) => {
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
        message: "Course name is required",
      });
    }

    // Check if course already exists
    const existingCourse = await prisma.course.findUnique({
      where: { name: name.trim() },
    });

    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: "Course with this name already exists",
      });
    }

    const course = await prisma.course.create({
      data: {
        name: name.trim(),
      },
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    console.error("Create course error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong server side.",
    });
  }
};

// Delete a course (ADMIN only)
export const deleteCourse = async (req: AuthRequest, res: Response) => {
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
        message: "Course ID is required",
      });
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            mentors: true,
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if course is being used by mentors
    if (course._count.mentors > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete course that is being used by mentors",
      });
    }

    await prisma.course.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong server side.",
    });
  }
};

