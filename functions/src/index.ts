import express from "express";
import cors from "cors";
import routes from "./routes";
import { initializeFirebaseAdmin } from "./config/firebase";
import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";

const app = express();

// Initialize Firebase Admin
initializeFirebaseAdmin();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true }));

// Your route handlers
app.use(routes);

// Handle invalid routes
app.use((req, res) => {
    const errorDetails = {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        timestamp: new Date().toISOString()
    };

    logger.warn("Invalid route accessed", errorDetails);

    res.status(404).json({
        error: {
            name: "Error",
            status: 404,
            message: "Invalid Request",
            statusCode: 404,
        },
        message: "Invalid Request",
    });
});

// Export the Express app as an onRequest function
export const api = onRequest(
    {
        timeoutSeconds: 300,
        region: "me-central1",
        memory: "1GiB", // Note: Must be "1GiB", not "1GB" per v2 API
        // Optional additional settings:
        // minInstances: 1,
        // concurrency: 80
    },
    app
);

