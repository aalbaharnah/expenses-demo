import { admin, Timestamp } from "../config/firebase";
import { ParsedTransaction } from "../routes/transactions/types";

/**
 * Service class for transaction-related operations
 */
export class TransactionService {
    private readonly db = admin.firestore();

    /**
     * Store a single transaction
     */
    async storeTransaction(userId: string, transaction: ParsedTransaction): Promise<string> {
        const docRef = await this.db
            .collection("users")
            .doc(userId)
            .collection("transactions")
            .add({
                ...transaction,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });

        return docRef.id;
    }

    /**
     * Store multiple transactions in batch
     */
    async storeTransactionsBatch(userId: string, transactions: ParsedTransaction[]): Promise<void> {
        const batch = this.db.batch();
        const userTransactionsRef = this.db
            .collection("users")
            .doc(userId)
            .collection("transactions");

        transactions.forEach((transaction) => {
            const docRef = userTransactionsRef.doc();
            batch.set(docRef, {
                ...transaction,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });
        });

        await batch.commit();
    }

    /**
     * Get user's transactions with pagination and filtering
     */
    async getUserTransactions(
        userId: string,
        options: {
            limit?: number;
            offset?: number;
            category?: string;
        } = {}
    ): Promise<{ transactions: any[]; pagination: any }> {
        const { limit = 50, offset = 0, category } = options;

        let query = this.db
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

        return {
            transactions,
            pagination: {
                limit: Number(limit),
                offset: Number(offset),
                count: transactions.length,
            },
        };
    }
}
