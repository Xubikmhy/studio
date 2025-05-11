
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

// Check if all required config values are present and log a warning if not.
// This check runs client-side.
if (typeof window !== 'undefined') {
  const requiredKeys: (keyof typeof clientFirebaseConfig)[] = ['apiKey', 'authDomain', 'projectId'];
  const missingKeys = requiredKeys.filter(key => {
    const value = clientFirebaseConfig[key];
    return !value || value.startsWith('YOUR_') || value === '' || value === 'YOUR_FIREBASE_API_KEY' || value === 'YOUR_FIREBASE_AUTH_DOMAIN' || value === 'YOUR_FIREBASE_PROJECT_ID';
  });

  if (missingKeys.length > 0) {
    console.warn(
      `Firebase client configuration is missing or uses placeholder values for the following required keys: ${missingKeys.join(', ')}. ` +
      `Please ensure these (e.g., NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID) are correctly set in your .env or .env.local file. ` +
      `Firebase features, including Google Sign-In, may not work correctly until these are configured. ` +
      `The Firebase API key is distinct from an OAuth Client ID.`
    );
  }
  // Note: The OAuth Client ID (e.g., from NEXT_PUBLIC_GOOGLE_CLIENT_ID) is typically configured
  // within your Firebase project's authentication settings (Sign-in method > Google) in the Firebase console,
  // or in the Google Cloud Console under APIs & Services > Credentials.
  // The Firebase SDK for client-side Google Sign-In usually handles this implicitly once configured in the console.
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
