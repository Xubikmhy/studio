
import { initializeApp, getApps, getApp as getClientSideApp, type FirebaseApp } from "firebase/app";
import { getAuth as getClientSideAuth, type Auth as ClientSideAuth } from "firebase/auth";
import * as admin from 'firebase-admin';
import { getFirestore as getAdminFirestore, Timestamp as AdminSDKTimestamp } from 'firebase-admin/firestore'; // Renamed Timestamp to avoid conflict

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
if (!getApps().find(existingApp => existingApp.name === '[DEFAULT]')) {
  app = initializeApp(clientFirebaseConfig);
} else {
  app = getClientSideApp(); 
}
const auth: ClientSideAuth = getClientSideAuth(app);

// Server-side Firebase Admin SDK initialization
if (!admin.apps.length) {
  const serviceAccountKeyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;
  
  if (serviceAccountKeyJson && serviceAccountKeyJson.trim() !== '' && serviceAccountKeyJson !== 'Paste your service account JSON content here as a single-line string') {
    try {
        const serviceAccount = JSON.parse(serviceAccountKeyJson);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log("Firebase Admin SDK initialized successfully using service account key from environment variable.");
    } catch (e) {
        console.error("Error parsing FIREBASE_SERVICE_ACCOUNT_KEY_JSON. Ensure it's a valid JSON string:", e);
        console.log("Attempting to initialize Firebase Admin SDK with default credentials as fallback due to parsing error.");
        try {
            admin.initializeApp({
              credential: admin.credential.applicationDefault(),
            });
             console.log("Firebase Admin SDK initialized with default credentials (fallback).");
        } catch (defaultInitError) {
            console.error("Failed to initialize Firebase Admin SDK with default credentials as well:", defaultInitError);
        }
    }
  } else {
    console.log("FIREBASE_SERVICE_ACCOUNT_KEY_JSON not found, is empty, or is placeholder. Attempting to initialize Firebase Admin SDK with default credentials.");
    try {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
        });
        console.log("Firebase Admin SDK initialized with default credentials.");
    } catch (defaultInitError) {
        console.error("Failed to initialize Firebase Admin SDK with default credentials:", defaultInitError);
    }
  }
}

const adminDb = admin.apps.length ? getAdminFirestore() : null;
const adminAuthInstance = admin.apps.length ? admin.auth() : null; 

// Export AdminTimestamp directly
export { app, auth, adminDb, adminAuthInstance as adminAuth, AdminSDKTimestamp as AdminTimestamp };
