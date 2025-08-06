import express from "express";
import { ApiResponse } from "./types";

const app = express.Router();

// Simple health check
app.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "Test endpoint working",
    });
});

export default app;
