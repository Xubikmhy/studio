
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const clientFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-project-id.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-project-id.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "your-messaging-sender-id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "your-app-id",
};

// Check if all required config values are present and log a warning if not.
// This check runs client-side.
if (typeof window !== 'undefined') {
  const requiredKeys: (keyof typeof clientFirebaseConfig)[] = ['apiKey', 'authDomain', 'projectId'];
  const missingKeys = requiredKeys.filter(key => {
    const value = clientFirebaseConfig[key];
    // Updated placeholder checks
    return !value || 
           value.startsWith('YOUR_') || 
           value === '' || 
           value === 'your-project-id.firebaseapp.com' ||
           value === 'your-project-id' ||
           value === 'your-messaging-sender-id' ||
           value === 'your-app-id' ||
           value === 'AIzaSyYOUR_API_KEY' || 
           (key === 'apiKey' && (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "AIzaSyCCPqUORirkoc5nxplht0CKTKkefyai7mY_PLACEHOLDER" || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "AIzaSyCCPqUORirkoc5nxplht0CKTKkefyai7mY"));
  });

  if (missingKeys.length > 0 || !clientFirebaseConfig.apiKey || clientFirebaseConfig.apiKey === "AIzaSyCCPqUORirkoc5nxplht0CKTKkefyai7mY_PLACEHOLDER" || clientFirebaseConfig.apiKey === "AIzaSyCCPqUORirkoc5nxplht0CKTKkefyai7mY") {
    console.warn(
      `Firebase client configuration is missing, uses placeholder values, or an invalid API key is in use for: ${missingKeys.join(', ') || 'API Key/Project Settings'}. ` +
      `Please ensure all Firebase configuration variables (e.g., NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID) are correctly set in your .env or .env.local file. ` +
      `Firebase features, including Google Sign-In, may not work correctly until these are configured. ` +
      `The Firebase API key is distinct from an OAuth Client ID. ` +
      `Also, verify in the Firebase Console (console.firebase.google.com) that your project (ID: ${clientFirebaseConfig.projectId || 'Not Set'}) exists, the Project ID matches your settings, and the required authentication providers (e.g., Google) are enabled.`
    );
  }
}


let app: FirebaseApp;
// Check if Firebase app has already been initialized
if (!getApps().find(existingApp => existingApp.name === '[DEFAULT]')) {
  app = initializeApp(clientFirebaseConfig);
} else {
  // Use the existing app if already initialized
  app = getApp();
}

const auth: Auth = getAuth(app);

export { app, auth };

