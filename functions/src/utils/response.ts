import { Response } from "express";

/**
 * Standard API response structure
 */
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    pagination?: {
        limit: number;
        offset: number;
        total: number;
        hasMore: boolean;
    };
    meta?: {
        timestamp: string;
        requestId?: string;
        version: string;
    };
}

/**
 * Success response helper
 */
export function sendSuccess<T>(
    res: Response,
    data: T,
    message: string = "Operation successful",
    statusCode: number = 200,
    pagination?: ApiResponse["pagination"]
): Response<ApiResponse<T>> {
    const response: ApiResponse<T> = {
        success: true,
        message,
        data,
        meta: {
            timestamp: new Date().toISOString(),
            version: "1.0.0",
        },
    };

    if (pagination) {
        response.pagination = pagination;
    }

    return res.status(statusCode).json(response);
}

/**
 * Error response helper
 */
export function sendError(
    res: Response,
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_SERVER_ERROR",
    details?: any
): Response<ApiResponse> {
    const response: ApiResponse = {
        success: false,
        message,
        error: {
            code,
            message,
            details,
        },
        meta: {
            timestamp: new Date().toISOString(),
            version: "1.0.0",
        },
    };

    return res.status(statusCode).json(response);
}

/**
 * Created response helper
 */
export function sendCreated<T>(
    res: Response,
    data: T,
    message: string = "Resource created successfully"
): Response<ApiResponse<T>> {
    return sendSuccess(res, data, message, 201);
}

/**
 * No content response helper
 */
export function sendNoContent(res: Response): Response {
    return res.status(204).send();
}

/**
 * Paginated response helper
 */
export function sendPaginated<T>(
    res: Response,
    data: T[],
    pagination: {
        limit: number;
        offset: number;
        total: number;
    },
    message: string = "Data retrieved successfully"
): Response<ApiResponse<T[]>> {
    const hasMore = pagination.offset + pagination.limit < pagination.total;

    return sendSuccess(
        res,
        data,
        message,
        200,
        {
            ...pagination,
            hasMore,
        }
    );
}
