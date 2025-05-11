
import * as admin from 'firebase-admin';
import { getFirestore as getAdminFirestore, Timestamp as AdminSDKTimestamp } from 'firebase-admin/firestore';

if (!admin.apps.length) {
  const serviceAccountKeyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;
  
  if (serviceAccountKeyJson && serviceAccountKeyJson.trim() !== '' && serviceAccountKeyJson !== 'Paste your service account JSON content here as a single-line string') {
    try {
        const serviceAccount = JSON.parse(serviceAccountKeyJson);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        // console.log("Firebase Admin SDK initialized successfully using service account key from environment variable.");
    } catch (e) {
        console.error("Error parsing FIREBASE_SERVICE_ACCOUNT_KEY_JSON. Ensure it's a valid JSON string:", e);
        // console.log("Attempting to initialize Firebase Admin SDK with default credentials as fallback due to parsing error.");
        try {
            admin.initializeApp({
              credential: admin.credential.applicationDefault(),
            });
            //  console.log("Firebase Admin SDK initialized with default credentials (fallback).");
        } catch (defaultInitError) {
            console.error("Failed to initialize Firebase Admin SDK with default credentials as well:", defaultInitError);
        }
    }
  } else {
    // console.log("FIREBASE_SERVICE_ACCOUNT_KEY_JSON not found, is empty, or is placeholder. Attempting to initialize Firebase Admin SDK with default credentials.");
    try {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
        });
        // console.log("Firebase Admin SDK initialized with default credentials.");
    } catch (defaultInitError) {
        console.error("Failed to initialize Firebase Admin SDK with default credentials:", defaultInitError);
    }
  }
}

const adminDb = admin.apps.length ? getAdminFirestore() : null;
const adminAuthInstance = admin.apps.length ? admin.auth() : null; 

export { adminDb, adminAuthInstance as adminAuth, AdminSDKTimestamp as AdminTimestamp };
