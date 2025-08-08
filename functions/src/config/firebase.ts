import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import serviceAccount from "./service-account.json";
/**
 * Initialize Firebase Admin SDK with the most reliable method
 * Uses Application Default Credentials which work seamlessly in all environments
 */
export function initializeFirebaseAdmin(): void {
    // Only initialize if no apps exist
    if (!admin.apps.length) {
        try {
            // Use Application Default Credentials - most reliable approach
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
            });
            console.log("✅ Firebase Admin initialized successfully with Application Default Credentials");
        } catch (error) {
            console.error("❌ Failed to initialize Firebase Admin:", error);
            throw error;
        }
    }
}

// Export admin and commonly used types for use in other files
export { admin, Timestamp };