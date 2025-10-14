// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Ensure required Firebase environment variables are present and typed as strings
const requiredVars = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID'
];

const missing = requiredVars.filter((v) => !process.env[v]);
if (missing.length > 0) {
  // Fail fast during build/runtime so the type error is avoided and the developer knows what's missing
  throw new Error(`Missing required Firebase environment variables: ${missing.join(', ')}`);
}

// Your web app's Firebase configuration (asserted non-null for TypeScript)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY!,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.FIREBASE_PROJECT_ID!,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.FIREBASE_APP_ID!
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

// For development, you can uncomment the following line to use storage emulator
// if (process.env.NODE_ENV === 'development') {
//   connectStorageEmulator(storage, 'localhost', 9199);
// }

console.log('Firebase Storage initialized with bucket:', firebaseConfig.storageBucket);

export default app;