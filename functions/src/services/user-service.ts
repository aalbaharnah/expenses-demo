import { admin, Timestamp } from "../config/firebase";

/**
 * Service class for user-related operations
 * Follows Google's service layer pattern for clean separation of concerns
 */
export class UserService {
    private readonly db = admin.firestore();
    private readonly usersCollection = this.db.collection("users");

    /**
     * Create a new user
     */
    async createUser(userData: { name: string; email: string }): Promise<{ userId: string; name: string; email: string }> {
        const { name, email } = userData;

        // Validate input at service level
        if (!name?.trim() || !email?.trim()) {
            throw new Error("Name and email are required");
        }

        // Check if user already exists
        const existingUser = await this.usersCollection.where("email", "==", email).limit(1).get();
        if (!existingUser.empty) {
            throw new Error("User with this email already exists");
        }

        const userDoc = await this.usersCollection.add({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });

        return { userId: userDoc.id, name, email };
    }

    /**
     * Get user by ID
     */
    async getUserById(userId: string): Promise<any> {
        const userDoc = await this.usersCollection.doc(userId).get();
        if (!userDoc.exists) {
            throw new Error("User not found");
        }
        return { id: userDoc.id, ...userDoc.data() };
    }
}
