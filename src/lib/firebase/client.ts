
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const clientFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if all required config values are present and log a warning if not
// This check should ideally run client-side to avoid issues during server-side rendering or build.
if (typeof window !== 'undefined') {
  const requiredKeys: (keyof typeof clientFirebaseConfig)[] = ['apiKey', 'authDomain', 'projectId'];
  const missingKeys = requiredKeys.filter(key => !clientFirebaseConfig[key] || clientFirebaseConfig[key] === `YOUR_${key.replace('firebase', '').toUpperCase()}`); // Check for placeholder values too

  if (missingKeys.length > 0) {
    console.warn(
      `Firebase client configuration is missing or uses placeholder values for the following required keys: ${missingKeys.join(', ')}. ` +
      `Please ensure NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, and NEXT_PUBLIC_FIREBASE_PROJECT_ID are correctly set in your .env or .env.local file. ` +
      `Google Sign-In and other Firebase features may not work correctly until these are configured.`
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

