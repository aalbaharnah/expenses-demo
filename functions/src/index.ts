import express from "express";
import cors from "cors";
import routes from "./routes";
import { initializeFirebaseAdmin } from "./config/firebase";
import { onRequest } from "firebase-functions/v2/https";
import { notFoundHandler, errorHandler } from "./middleware/error-handler";

const app = express();

// Initialize Firebase Admin
initializeFirebaseAdmin();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true }));

// Your route handlers
app.use(routes);

// Global error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Export the Express app as an onRequest function
export const api = onRequest(
    {
        timeoutSeconds: 300,
        region: "me-central2",
        memory: "1GiB", // Note: Must be "1GiB", not "1GB" per v2 API
    },
    app
);

