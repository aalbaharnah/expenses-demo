import express, { Request, Response } from "express";
import { UserService, TransactionService } from "../../services";
import { validateRequest, validatePagination } from "../../middleware/validation";
import { asyncHandler, notFoundHandler, errorHandler } from "../../middleware/error-handler";
import { sendSuccess, sendCreated, sendPaginated } from "../../utils/response";
import { parseTransaction } from "./utils";
import { CATEGORY_RULES, MERCHANT_PATTERNS } from "./const";


const app = express.Router();

// Initialize services
const transactionService = new TransactionService();

// ==================== API ROUTES ====================

/**
 * Health check endpoint
 */
app.get("/health", asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, {
        message: "Saudi Bank Transaction Parser API is running",
        version: "1.0.0",
    });
}));

/**
 * API documentation endpoint
 */
app.get("/docs", asyncHandler(async (req: Request, res: Response) => {
    const docsData = {
        name: "Saudi Bank Transaction Parser API",
        version: "1.0.0",
        endpoints: {
            "GET /health": "Health check",
            "GET /docs": "API documentation",
            "POST /user": "Create new user",
            "POST /parse": "Parse single transaction",
            "POST /parse/batch": "Parse multiple transactions",
            "GET /categories": "Get available categories",
            "POST /categories": "Add new category rule",
            "GET /merchants": "Get merchant patterns",
            "POST /merchants": "Add new merchant pattern",
            "GET /users/:userId/transactions": "Get user transaction history",
        },
        example: {
            endpoint: "POST /parse",
            body: {
                transaction: "شراء إنترنت\nبـ 21.99 SAR\nمن Spotify AB P3781C3C72\nمدى 3180*\nحساب 0165*\nفي08-06-2",
                userId: "optional-user-id",
            },
        },
    };

    sendSuccess(res, docsData, "API documentation retrieved");
}));

/**
 * Get available categories
 */
app.get("/categories", asyncHandler(async (req: Request, res: Response) => {
    const categories = [...new Set(CATEGORY_RULES.map((rule) => rule.category))];

    const data = {
        categories: categories.sort(),
        rules: CATEGORY_RULES.map((rule) => ({
            category: rule.category,
            priority: rule.priority,
            keywordCount: rule.keywords.length,
        })),
    };

    sendSuccess(res, data, "Categories retrieved successfully");
}));

/**
 * Add new category rule
 */
app.post("/categories", validateRequest("categoryRule"), asyncHandler(async (req: Request, res: Response) => {
    const { keywords, category, priority = 50 } = req.body;

    CATEGORY_RULES.push({ keywords, category, priority });

    sendCreated(res, { keywords, category, priority }, `Category rule for '${category}' added successfully`);
}));

/**
 * Parse single transaction
 */
app.post("/parse", validateRequest("transaction"), asyncHandler(async (req: Request, res: Response) => {
    const { transaction, historicalTransactions, userId } = req.body;
    const startTime = Date.now();

    // Parse the transaction
    const parsed = parseTransaction(transaction);

    // Optional advanced recurrence detection
    if (historicalTransactions && Array.isArray(historicalTransactions)) {
        // e.g., parsed.recurrence = detectRecurrenceWithHistory(parsed, historicalTransactions);
    }

    // Optional Firestore storage
    if (userId) {
        await transactionService.storeTransaction(userId, parsed);
    }

    const processingTime = Date.now() - startTime;
    const result = {
        ...parsed,
        metadata: {
            version: "1.0.0",
            timestamp: new Date().toISOString(),
            processingTimeMs: processingTime,
        },
    };

    sendSuccess(res, result, "Transaction parsed successfully");
}));

/**
 * Parse multiple transactions (batch processing)
 */
app.post("/parse/batch", validateRequest("batchTransaction"), asyncHandler(async (req: Request, res: Response) => {
    const { transactions, userId } = req.body;
    const startTime = Date.now();

    const results = [];

    for (const transaction of transactions) {
        try {
            const parsed = parseTransaction(transaction);
            results.push({
                success: true,
                data: parsed,
                original: transaction,
            });
        } catch (error) {
            results.push({
                success: false,
                error: (error as Error).message,
                original: transaction,
            });
        }
    }

    // Store successful transactions if userId provided
    if (userId) {
        const successfulTransactions = results
            .filter((result) => result.success)
            .map((result) => result.data)
            .filter(data => data !== undefined);

        if (successfulTransactions.length > 0) {
            await transactionService.storeTransactionsBatch(userId, successfulTransactions);
        }
    }

    const processingTime = Date.now() - startTime;
    const successCount = results.filter((r) => r.success).length;

    const responseData = {
        results,
        summary: {
            total: transactions.length,
            successful: successCount,
            failed: transactions.length - successCount,
        },
        metadata: {
            version: "1.0.0",
            timestamp: new Date().toISOString(),
            processingTimeMs: processingTime,
        },
    };

    sendSuccess(res, responseData, "Batch processing completed");
}));


/**
 * Parse multiple transactions (batch processing)
 */
app.post("/parse/batch", validateRequest("batchTransaction"), asyncHandler(async (req: Request, res: Response) => {
    const { transactions, userId } = req.body;
    const startTime = Date.now();

    const results = [];

    for (const transaction of transactions) {
        try {
            const parsed = parseTransaction(transaction);
            results.push({
                success: true,
                data: parsed,
                original: transaction,
            });
        } catch (error) {
            results.push({
                success: false,
                error: (error as Error).message,
                original: transaction,
            });
        }
    }

    // Store successful transactions if userId provided
    if (userId) {
        const successfulTransactions = results
            .filter((result) => result.success)
            .map((result) => result.data)
            .filter(data => data !== undefined);

        if (successfulTransactions.length > 0) {
            await transactionService.storeTransactionsBatch(userId, successfulTransactions);
        }
    }

    const processingTime = Date.now() - startTime;
    const successCount = results.filter((r) => r.success).length;

    const responseData = {
        results,
        summary: {
            total: transactions.length,
            successful: successCount,
            failed: transactions.length - successCount,
        },
        metadata: {
            version: "1.0.0",
            timestamp: new Date().toISOString(),
            processingTimeMs: processingTime,
        },
    };

    sendSuccess(res, responseData, "Batch processing completed");
}));

/**
 * Get merchant patterns
 */
app.get("/merchants", asyncHandler(async (req: Request, res: Response) => {
    const merchants = MERCHANT_PATTERNS.map((pattern) => ({
        normalizedName: pattern.normalizedName,
        category: pattern.category,
        pattern: pattern.pattern.source,
    }));

    sendSuccess(res, merchants, "Merchant patterns retrieved successfully");
}));

/**
 * Add new merchant pattern
 */
app.post("/merchants", validateRequest("merchantPattern"), asyncHandler(async (req: Request, res: Response) => {
    const { pattern, normalizedName, category } = req.body;

    const regex = new RegExp(pattern, "i");
    MERCHANT_PATTERNS.push({ pattern: regex, normalizedName, category });

    sendCreated(res, { pattern, normalizedName, category }, `Merchant pattern for '${normalizedName}' added successfully`);
}));

/**
 * Get user's transaction history
 */
app.get("/users/:userId/transactions", validatePagination, asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { limit = 50, offset = 0, category } = req.query;

    const result = await transactionService.getUserTransactions(
        userId,
        {
            limit: Number(limit),
            offset: Number(offset),
            category: category as string | undefined,
        }
    );

    // For a real implementation, you'd want to get the total count as well
    const mockTotal = result.transactions.length + Number(offset);

    sendPaginated(
        res,
        result.transactions,
        {
            limit: Number(limit),
            offset: Number(offset),
            total: mockTotal,
        },
        "User transactions retrieved successfully"
    );
}));

// Apply error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

export default app;