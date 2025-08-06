export interface ParsedTransaction {
    description: string;
    amount: number;
    currency: string;
    merchant: string;
    accountMasked: string;
    date: string; // YYYY-MM-DD format
    category: string;
    recurrence: {
        isRecurring: boolean;
        period?: "daily" | "weekly" | "monthly" | "yearly";
        confidence?: number; // 0-1 score for recurrence detection
    };
    rawText: string;
    bankFormat?: string;
}

export interface CategoryRule {
    keywords: string[];
    category: string;
    priority: number; // Higher priority rules are checked first
}

export interface MerchantPattern {
    pattern: RegExp;
    normalizedName: string;
    category?: string;
}

export type ApiResponse = {
    success: boolean;
    data?: ParsedTransaction | ParsedTransaction[] | any;
    error?: string;
    message?: string;
    metadata?: {
        version: string;
        timestamp: string;
        processingTimeMs?: number;
        region?: string;
    };
}