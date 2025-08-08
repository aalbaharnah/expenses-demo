import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import serviceAccount from "./service-account.json";

/**
 * Initialize Firebase Admin SDK with the most reliable method
 * Uses Application Default Credentials which work seamlessly in all environments
 */
export function initializeFirebaseAdmin(): void {
    if (!admin.apps.length) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
            });
        } catch (error) {
            throw error;
        }
    }
}

// Export admin and commonly used types for use in other files
export { admin, Timestamp };