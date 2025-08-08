import * as functions from "firebase-functions";
import { admin, Timestamp } from "../../config/firebase";
import express from "express";
import { ApiResponse } from "./types";
import { parseTransaction } from "./utils";
import { CATEGORY_RULES, MERCHANT_PATTERNS } from "./const";


const app = express.Router();

// ==================== API ROUTES ====================

/**
 * Health check endpoint
 */
app.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "Saudi Bank Transaction Parser API is running",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
    });
});

app.post("/user", async (req, res) => {
    try {
        // add user information
        const { name, email } = req.body;
        if (!name || !email) {
            res.status(400).json({
                success: false,
                error: "Missing user information",
                message: "Please provide userId, name, and email",
            } as ApiResponse);
            return;
        }

        // Store user information in Firestore
        const user = await admin.firestore().collection("users").add({
            name,
            email,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });

        const userId = user.id; // Assuming Firestore returns the document ID

        res.json({
            success: true,
            message: "User information saved successfully",
            data: { userId, name, email },
        } as ApiResponse);
    } catch (error) {
        functions.logger.error("Error in /user route:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
            message: "Failed to process user request",
        } as ApiResponse);
    }
})

/**
 * API documentation endpoint
 */
app.get("/docs", (req, res) => {
    res.json({
        name: "Saudi Bank Transaction Parser API",
        version: "1.0.0",
        endpoints: {
            "GET /health": "Health check",
            "GET /docs": "API documentation",
            "POST /parse": "Parse single transaction",
            "POST /parse/batch": "Parse multiple transactions",
            "GET /categories": "Get available categories",
            "POST /categories": "Add new category rule",
            "GET /merchants": "Get merchant patterns",
            "POST /merchants": "Add new merchant pattern",
        },
        example: {
            endpoint: "POST /parse",
            body: {
                transaction: "شراء إنترنت\nبـ 21.99 SAR\nمن Spotify AB P3781C3C72\nمدى 3180*\nحساب 0165*\nفي08-06-2",
                userId: "optional-user-id",
                historicalTransactions: [],
            },
        },
    });
});

/**
 * Parse single transaction
 */
app.post("/parse", async (req, res) => {
    const startTime = Date.now();
    try {
        const { transaction, historicalTransactions, userId } = req.body;

        if (!transaction) {
            return res.status(400).json({
                success: false,
                error: "Missing transaction data",
                message: "Please provide transaction text in the request body",
            } as ApiResponse);
        }

        // Parse the transaction
        const parsed = parseTransaction(transaction);

        // Optional advanced recurrence detection
        if (historicalTransactions && Array.isArray(historicalTransactions)) {
            // e.g., parsed.recurrence = detectRecurrenceWithHistory(parsed, historicalTransactions);
        }


        // Optional Firestore storage
        if (userId) {
            try {
                await admin.firestore()
                    .collection("users")
                    .doc(userId)
                    .collection("transactions")
                    .add({
                        ...parsed,
                        createdAt: Timestamp.now(),
                        updatedAt: Timestamp.now(),
                    });
            } catch (firestoreError) {
                functions.logger.warn("Failed to store transaction in Firestore:", firestoreError);
            }
        }

        const processingTime = Date.now() - startTime;

        return res.json({
            success: true,
            data: parsed,
            metadata: {
                version: "1.0.0",
                timestamp: Timestamp.now().toDate().toISOString(),
                processingTimeMs: processingTime,
            },
        } as ApiResponse);
    } catch (error) {
        functions.logger.error("Transaction parsing error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error",
            message: "Failed to parse transaction",
        } as ApiResponse);
    }
});


/**
 * Parse multiple transactions (batch processing)
 */
app.post("/parse/batch", async (req, res) => {
    const startTime = Date.now();

    try {
        const { transactions, userId } = req.body;

        if (!transactions || !Array.isArray(transactions)) {
            return res.status(400).json({
                success: false,
                error: "Invalid input",
                message: "Please provide an array of transactions",
            } as ApiResponse);
        }

        if (transactions.length > 50) {
            return res.status(400).json({
                success: false,
                error: "Batch too large",
                message: "Maximum 50 transactions per batch",
            } as ApiResponse);
        }

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

        // Firestore batch write if needed
        if (userId) {
            const batch = admin.firestore().batch();
            const userTransactionsRef = admin.firestore()
                .collection("users")
                .doc(userId)
                .collection("transactions");

            results
                .filter((result) => result.success)
                .forEach((result) => {
                    const docRef = userTransactionsRef.doc();
                    batch.set(docRef, {
                        ...result.data,
                        createdAt: Timestamp.now(),
                        updatedAt: Timestamp.now(),
                    });
                });

            try {
                await batch.commit();
            } catch (firestoreError) {
                functions.logger.warn("Failed to store batch transactions:", firestoreError);
            }
        }

        const processingTime = Date.now() - startTime;
        const successCount = results.filter((r) => r.success).length;

        return res.json({
            success: true,
            data: {
                results,
                summary: {
                    total: transactions.length,
                    successful: successCount,
                    failed: transactions.length - successCount,
                },
            },
            metadata: {
                version: "1.0.0",
                timestamp: Timestamp.now().toDate().toISOString(),
                processingTimeMs: processingTime,
            },
        } as ApiResponse);
    } catch (error) {
        functions.logger.error("Batch parsing error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error",
            message: "Failed to process batch",
        } as ApiResponse);
    }
});


/**
 * Get available categories
 */
app.get("/categories", (req, res) => {
    const categories = [...new Set(CATEGORY_RULES.map((rule) => rule.category))];

    res.json({
        success: true,
        data: {
            categories: categories.sort(),
            rules: CATEGORY_RULES.map((rule) => ({
                category: rule.category,
                priority: rule.priority,
                keywordCount: rule.keywords.length,
            })),
        },
    } as ApiResponse);
});

/**
 * Add new category rule
 */
app.post("/categories", (req, res) => {
    try {
        const { keywords, category, priority = 50 } = req.body;

        if (!keywords || !Array.isArray(keywords) || !category) {
            return res.status(400).json({
                success: false,
                error: "Invalid input",
                message: "Please provide keywords array and category name",
            } as ApiResponse);
        }

        CATEGORY_RULES.push({ keywords, category, priority });

        return res.json({
            success: true,
            message: `Category rule for '${category}' added successfully`,
            data: { keywords, category, priority },
        } as ApiResponse);
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Failed to add category rule",
        } as ApiResponse);
    }
});


/**
 * Get merchant patterns
 */
app.get("/merchants", (req, res) => {
    const merchants = MERCHANT_PATTERNS.map((pattern) => ({
        normalizedName: pattern.normalizedName,
        category: pattern.category,
        pattern: pattern.pattern.source,
    }));

    res.json({
        success: true,
        data: merchants,
    } as ApiResponse);
});

/**
 * Add new merchant pattern
 */
app.post("/merchants", (req, res) => {
    try {
        const { pattern, normalizedName, category } = req.body;

        if (!pattern || !normalizedName) {
            return res.status(400).json({
                success: false,
                error: "Invalid input",
                message: "Please provide pattern and normalizedName",
            } as ApiResponse);
        }

        const regex = new RegExp(pattern, "i");
        MERCHANT_PATTERNS.push({ pattern: regex, normalizedName, category });

        return res.json({
            success: true,
            message: `Merchant pattern for '${normalizedName}' added successfully`,
            data: { pattern, normalizedName, category },
        } as ApiResponse);
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Failed to add merchant pattern",
        } as ApiResponse);
    }
});

/**
 * Get user's transaction history
 */
app.get("/users/:userId/transactions", async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 50, offset = 0, category } = req.query;

        let query = admin.firestore()
            .collection("users")
            .doc(userId)
            .collection("transactions")
            .orderBy("createdAt", "desc");

        if (category) {
            query = query.where("category", "==", category);
        }

        const snapshot = await query
            .limit(Number(limit))
            .offset(Number(offset))
            .get();

        const transactions = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.json({
            success: true,
            data: {
                transactions,
                pagination: {
                    limit: Number(limit),
                    offset: Number(offset),
                    count: transactions.length,
                },
            },
        } as ApiResponse);
    } catch (error) {
        functions.logger.error("Failed to fetch transactions:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch transactions",
        } as ApiResponse);
    }
});

// 404 handler for unmatched routes
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: "Not found",
        message: "The requested endpoint does not exist",
    } as ApiResponse);
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    functions.logger.error("Express error:", error);
    res.status(500).json({
        success: false,
        error: "Internal server error",
        message: "Something went wrong",
    } as ApiResponse);
});


// function detectRecurrenceWithHistory(parsed: ParsedTransaction, historicalTransactions: any[]) {
//   // Placeholder for advanced recurrence detection logic
//   throw new Error("Function not implemented.");
// }

export default app;