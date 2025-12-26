import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For now, using env vars. If missing, it might crash or warn.
// We should handle missing config gracefully.

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase only if config is present
const isConfigured = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

export const app = isConfigured ? initializeApp(firebaseConfig) : null;
export const db = isConfigured && app ? getFirestore(app) : null;

export function isFirebaseConfigured() {
    return isConfigured;
}
