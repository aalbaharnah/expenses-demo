import { Request, Response, NextFunction } from "express";
import * as functions from "firebase-functions";

/**
 * Custom error class for application errors
 * Follows Google's error handling patterns
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Async wrapper to catch errors in async route handlers
 * Eliminates the need for try-catch in every controller
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global error handler middleware
 */
export const errorHandler = (
    error: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    let statusCode = 500;
    let message = "Internal server error";
    let isOperational = false;

    // Handle different types of errors
    if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
        isOperational = error.isOperational;
    } else if (error.message.includes("not found")) {
        statusCode = 404;
        message = error.message;
    } else if (error.message.includes("already exists")) {
        statusCode = 409;
        message = error.message;
    } else if (error.message.includes("required") || error.message.includes("invalid")) {
        statusCode = 400;
        message = error.message;
    }

    // Log error (only log unexpected errors)
    if (!isOperational || statusCode >= 500) {
        functions.logger.error("Unhandled error:", {
            message: error.message,
            stack: error.stack,
            url: req.url,
            method: req.method,
        });
    }

    res.status(statusCode).json({
        success: false,
        error: message,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
};

/**
 * 404 handler for unmatched routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({
        success: false,
        error: "Not found",
        message: `Route ${req.method} ${req.path} not found`,
    });
};
