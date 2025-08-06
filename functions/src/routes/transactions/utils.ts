import { ParsedTransaction } from "./types";
import { BANK_PATTERNS, CATEGORY_RULES, MERCHANT_PATTERNS } from "./const";

// ==================== CORE PARSING FUNCTIONS ====================

/**
 * Main transaction parser function
 */
export function parseTransaction(rawText: string): ParsedTransaction {
    const lines = rawText.trim().split("\n").map((line) => line.trim());

    // Try different bank patterns
    let parsedData: any = {};
    let detectedBank = "generic";

    for (const [bankName, patterns] of Object.entries(BANK_PATTERNS)) {
        const result = tryParseWithPattern(rawText, patterns);
        if (result.confidence > (parsedData.confidence || 0)) {
            parsedData = result;
            detectedBank = bankName;
        }
    }

    // Extract basic fields
    const description = parsedData.description || lines[0] || "";
    const amount = parseFloat(parsedData.amount?.replace(/,/g, "") || "0");
    const currency = parsedData.currency || "SAR";
    const merchant = normalizeMerchant(parsedData.merchant || extractMerchantFallback(rawText));
    const accountMasked = formatAccountMasked(parsedData.card, parsedData.account);
    const date = normalizeDate(parsedData.date);

    // Classify category
    const category = classifyCategory(description, merchant);

    // Basic recurrence detection
    const recurrence = detectRecurrence(merchant, amount, description);

    return {
        description,
        amount,
        currency,
        merchant,
        accountMasked,
        date,
        category,
        recurrence,
        rawText,
        bankFormat: detectedBank,
    };
}

/**
 * Try parsing with a specific bank pattern
 */
function tryParseWithPattern(text: string, patterns: any): any {
    const result: any = { confidence: 0 };
    let matchCount = 0;

    // Description
    const descMatch = text.match(patterns.description);
    if (descMatch) {
        result.description = descMatch[1].trim();
        matchCount++;
    }

    // Amount and currency
    const amountMatch = text.match(patterns.amount);
    if (amountMatch) {
        result.amount = amountMatch[1];
        result.currency = amountMatch[2];
        matchCount += 2;
    }

    // Merchant
    const merchantMatch = text.match(patterns.merchant);
    if (merchantMatch) {
        result.merchant = merchantMatch[1].trim();
        matchCount++;
    }

    // Card
    const cardMatch = text.match(patterns.card);
    if (cardMatch) {
        result.card = cardMatch[1];
        matchCount++;
    }

    // Account
    const accountMatch = text.match(patterns.account);
    if (accountMatch) {
        result.account = accountMatch[1];
        matchCount++;
    }

    // Date
    const dateMatch = text.match(patterns.date);
    if (dateMatch) {
        result.date = dateMatch[1];
        matchCount++;
    }

    result.confidence = matchCount / Object.keys(patterns).length;
    return result;
}

/**
 * Normalize merchant name using patterns
 */
function normalizeMerchant(rawMerchant: string): string {
    if (!rawMerchant) return "Unknown Merchant";

    // Clean the merchant string
    const normalized = rawMerchant
        .replace(/[A-Z0-9]{8,}/g, "") // Remove long alphanumeric codes
        .replace(/\s+/g, " ")
        .trim();

    // Apply merchant patterns
    for (const pattern of MERCHANT_PATTERNS) {
        if (pattern.pattern.test(normalized)) {
            return pattern.normalizedName;
        }
    }

    return normalized || rawMerchant;
}

/**
 * Extract merchant as fallback when pattern fails
 */
function extractMerchantFallback(text: string): string {
    const merchantIndicators = ["من", "إلى", "لدى", "عند"];

    for (const indicator of merchantIndicators) {
        const regex = new RegExp(`${indicator}\\s+([^\\n]+)`, "i");
        const match = text.match(regex);
        if (match) {
            return match[1].trim();
        }
    }

    const words = text.split(/\s+/);
    const possibleMerchants = words.filter((word) =>
        /[A-Z]/.test(word) && word.length > 2
    );

    return possibleMerchants.join(" ") || "Unknown Merchant";
}

/**
 * Format account/card information
 */
function formatAccountMasked(card?: string, account?: string): string {
    const parts = [];
    if (card) parts.push(card);
    if (account) parts.push(account);
    return parts.join(" / ") || "N/A";
}

/**
 * Normalize date to YYYY-MM-DD format
 */
function normalizeDate(dateStr?: string): string {
    if (!dateStr) return new Date().toISOString().split("T")[0];

    let normalized = dateStr;

    // Convert DD-MM-YY to YYYY-MM-DD
    const ddmmyyMatch = dateStr.match(/(\d{2})-(\d{2})-(\d{1,2})/);
    if (ddmmyyMatch) {
        const [, day, month, year] = ddmmyyMatch;
        const fullYear = year.length === 2 ? `20${year}` : year;
        normalized = `${fullYear}-${month}-${day}`;
    }

    // Handle DD/MM/YYYY format
    const ddmmyyyyMatch = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (ddmmyyyyMatch) {
        const [, day, month, year] = ddmmyyyyMatch;
        normalized = `${year}-${month}-${day}`;
    }

    return normalized;
}

// ==================== CATEGORY CLASSIFICATION ====================

/**
 * Classify transaction category using rules-based approach
 */
function classifyCategory(description: string, merchant: string): string {
    const text = `${description} ${merchant}`.toLowerCase();

    const sortedRules = [...CATEGORY_RULES].sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
        for (const keyword of rule.keywords) {
            if (text.includes(keyword.toLowerCase())) {
                return rule.category;
            }
        }
    }

    for (const pattern of MERCHANT_PATTERNS) {
        if (pattern.category && pattern.pattern.test(text)) {
            return pattern.category;
        }
    }

    return "Other";
}

// ==================== RECURRENCE DETECTION ====================

/**
 * Basic recurrence detection
 */
function detectRecurrence(merchant: string, amount: number, description: string): {
    isRecurring: boolean;
    period?: "daily" | "weekly" | "monthly" | "yearly";
    confidence?: number;
} {
    const subscriptionKeywords = ["spotify", "netflix", "prime", "subscription", "اشتراك"];
    const isLikelySubscription = subscriptionKeywords.some((keyword) =>
        merchant.toLowerCase().includes(keyword) ||
        description.toLowerCase().includes(keyword)
    );

    if (isLikelySubscription) {
        return {
            isRecurring: true,
            period: "monthly",
            confidence: 0.8,
        };
    }

    const utilityKeywords = ["كهرباء", "مياه", "إنترنت", "جوال", "electricity", "water", "internet", "mobile"];
    const isUtility = utilityKeywords.some((keyword) =>
        merchant.toLowerCase().includes(keyword) ||
        description.toLowerCase().includes(keyword)
    );

    if (isUtility) {
        return {
            isRecurring: true,
            period: "monthly",
            confidence: 0.7,
        };
    }

    return {
        isRecurring: false,
    };
}

/**
 * Advanced recurrence detection with historical data
 */
export function detectRecurrenceWithHistory(
    currentTransaction: ParsedTransaction,
    historicalTransactions: ParsedTransaction[]
): {
    isRecurring: boolean;
    period?: "daily" | "weekly" | "monthly" | "yearly";
    confidence: number;
} {
    const similarTransactions = historicalTransactions.filter((tx) =>
        tx.merchant === currentTransaction.merchant &&
        Math.abs(tx.amount - currentTransaction.amount) <= currentTransaction.amount * 0.1
    );

    if (similarTransactions.length < 2) {
        return { isRecurring: false, confidence: 0 };
    }

    const dates = similarTransactions.map((tx) => new Date(tx.date)).sort();
    const intervals = [];

    for (let i = 1; i < dates.length; i++) {
        const diff = dates[i].getTime() - dates[i - 1].getTime();
        const days = diff / (1000 * 60 * 60 * 24);
        intervals.push(days);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
    const standardDeviation = Math.sqrt(variance);

    const isRegular = standardDeviation < avgInterval * 0.2;

    if (!isRegular) {
        return { isRecurring: false, confidence: 0 };
    }

    let period: "daily" | "weekly" | "monthly" | "yearly";
    let confidence = 0;

    if (avgInterval >= 25 && avgInterval <= 35) {
        period = "monthly";
        confidence = 0.9;
    } else if (avgInterval >= 6 && avgInterval <= 8) {
        period = "weekly";
        confidence = 0.8;
    } else if (avgInterval >= 360 && avgInterval <= 370) {
        period = "yearly";
        confidence = 0.8;
    } else if (avgInterval >= 0.8 && avgInterval <= 1.2) {
        period = "daily";
        confidence = 0.7;
    } else {
        return { isRecurring: false, confidence: 0 };
    }

    return {
        isRecurring: true,
        period,
        confidence,
    };
}

/**
 * Add new category rule
 */
export function addCategoryRule(keywords: string[], category: string, priority = 50): void {
    CATEGORY_RULES.push({ keywords, category, priority });
}

/**
 * Add new merchant pattern
 */
export function addMerchantPattern(pattern: RegExp, normalizedName: string, category?: string): void {
    MERCHANT_PATTERNS.push({ pattern, normalizedName, category });
}

/**
 * Add new bank parsing pattern
 */
export function addBankPattern(bankName: string, patterns: any): void {
    (BANK_PATTERNS as any)[bankName] = patterns;
}