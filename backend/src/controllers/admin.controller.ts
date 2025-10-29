import type { AuthRequest } from "../middleware/authenticate.js";
import * as z from "zod";
import { CreateMentorSchema } from "../schemas/mentor.schema.js";
import { prisma } from "../prisma.js";
import bcrypt from "bcrypt";
import type { Response } from "express";



const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD;

// Create mentor with email and password
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

        const { email, name, price } = result.data;

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
                pricePerSlot: price,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                pricePerSlot: true,
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