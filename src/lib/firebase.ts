
import { initializeApp, getApps, getApp as getClientSideApp, type FirebaseApp } from "firebase/app";
import { getAuth as getClientSideAuth, type Auth as ClientSideAuth } from "firebase/auth";
import * as admin from 'firebase-admin';
import { getFirestore as getAdminFirestore, Timestamp as AdminTimestamp } from 'firebase-admin/firestore';

// Client-side Firebase configuration
const clientFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Client-side Firebase app
let app: FirebaseApp;
// Check if an app with the default name '[DEFAULT]' already exists
if (!getApps().find(existingApp => existingApp.name === '[DEFAULT]')) {
  app = initializeApp(clientFirebaseConfig);
} else {
  app = getClientSideApp(); // Get the default app
}
const auth: ClientSideAuth = getClientSideAuth(app);

// Server-side Firebase Admin SDK initialization
// This block will only execute effectively on the server.
if (!admin.apps.length) {
  const serviceAccountKeyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;
  if (serviceAccountKeyJson && serviceAccountKeyJson !== 'Paste your service account JSON content here as a single-line string') {
    try {
        const serviceAccount = JSON.parse(serviceAccountKeyJson);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        // console.log("Firebase Admin SDK initialized with service account key.");
    } catch (e) {
        console.error("Error parsing FIREBASE_SERVICE_ACCOUNT_KEY_JSON. Ensure it's a valid JSON string:", e);
        console.log("Attempting to initialize Firebase Admin SDK with default credentials as fallback.");
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
        });
    }
  } else {
    // Fallback for environments like Firebase Hosting with Functions, Cloud Run, or local dev with GOOGLE_APPLICATION_CREDENTIALS
    // console.log("FIREBASE_SERVICE_ACCOUNT_KEY_JSON not found or is placeholder. Attempting to initialize Firebase Admin SDK with default credentials.");
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }
}

const adminDb = getAdminFirestore();
const adminAuthInstance = admin.auth(); // Renamed to avoid conflict with client 'auth'

export { app, auth, adminDb, adminAuthInstance as adminAuth, AdminTimestamp };
