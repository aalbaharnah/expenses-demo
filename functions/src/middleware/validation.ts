import { Request, Response, NextFunction } from "express";
import { AppError } from "./error-handler";

/**
 * Validation schemas for different endpoints
 */
const schemas = {
    user: {
        required: ["name", "email"],
        validate: (data: any) => {
            const { name, email } = data;
            if (!name || typeof name !== "string" || name.trim().length === 0) {
                throw new AppError("Name is required and must be a non-empty string", 400);
            }
            if (!email || typeof email !== "string" || !isValidEmail(email)) {
                throw new AppError("Valid email is required", 400);
            }
        },
    },

    transaction: {
        required: ["transaction"],
        validate: (data: any) => {
            const { transaction, userId } = data;
            if (!transaction || typeof transaction !== "string" || transaction.trim().length === 0) {
                throw new AppError("Transaction text is required", 400);
            }
            if (userId && typeof userId !== "string") {
                throw new AppError("UserId must be a string if provided", 400);
            }
        },
    },

    batchTransaction: {
        required: ["transactions"],
        validate: (data: any) => {
            const { transactions, userId } = data;
            if (!Array.isArray(transactions)) {
                throw new AppError("Transactions must be an array", 400);
            }
            if (transactions.length === 0) {
                throw new AppError("At least one transaction is required", 400);
            }
            if (transactions.length > 50) {
                throw new AppError("Maximum 50 transactions per batch", 400);
            }
            if (userId && typeof userId !== "string") {
                throw new AppError("UserId must be a string if provided", 400);
            }
        },
    },

    categoryRule: {
        required: ["keywords", "category"],
        validate: (data: any) => {
            const { keywords, category, priority } = data;
            if (!Array.isArray(keywords) || keywords.length === 0) {
                throw new AppError("Keywords must be a non-empty array", 400);
            }
            if (!category || typeof category !== "string") {
                throw new AppError("Category is required and must be a string", 400);
            }
            if (priority !== undefined && (typeof priority !== "number" || priority < 0)) {
                throw new AppError("Priority must be a non-negative number", 400);
            }
        },
    },

    merchantPattern: {
        required: ["pattern", "normalizedName"],
        validate: (data: any) => {
            const { pattern, normalizedName, category } = data;
            if (!pattern || typeof pattern !== "string") {
                throw new AppError("Pattern is required and must be a string", 400);
            }
            if (!normalizedName || typeof normalizedName !== "string") {
                throw new AppError("Normalized name is required and must be a string", 400);
            }
            if (category && typeof category !== "string") {
                throw new AppError("Category must be a string if provided", 400);
            }

            // Test if pattern is a valid regex
            try {
                new RegExp(pattern);
            } catch (error) {
                throw new AppError("Invalid regex pattern", 400);
            }
        },
    },
};

/**
 * Email validation helper
 */
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Create validation middleware for specific schema
 */
export function validateRequest(schemaName: keyof typeof schemas) {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            const schema = schemas[schemaName];
            if (!schema) {
                throw new AppError("Invalid schema name", 500);
            }

            // Check required fields
            const missingFields = schema.required.filter(field => !(field in req.body));
            if (missingFields.length > 0) {
                throw new AppError(`Missing required fields: ${missingFields.join(", ")}`, 400);
            }

            // Run custom validation
            schema.validate(req.body);

            next();
        } catch (error) {
            next(error);
        }
    };
}

/**
 * Validate pagination parameters
 */
export function validatePagination(req: Request, res: Response, next: NextFunction): void {
    try {
        const { limit, offset } = req.query;

        if (limit !== undefined) {
            const limitNum = Number(limit);
            if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
                throw new AppError("Limit must be a number between 1 and 100", 400);
            }
        }

        if (offset !== undefined) {
            const offsetNum = Number(offset);
            if (isNaN(offsetNum) || offsetNum < 0) {
                throw new AppError("Offset must be a non-negative number", 400);
            }
        }

        next();
    } catch (error) {
        next(error);
    }
}
