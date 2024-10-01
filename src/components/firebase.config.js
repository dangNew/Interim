// Import the necessary functions from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const stallholderConfig = {
  apiKey: "AIzaSyCwCDc-WfwmT839L5LJZYiVCfpQZmZ2qws",
  authDomain: "stallholder-bd4f7.firebaseapp.com",
  databaseURL: "https://stallholder-bd4f7-default-rtdb.firebaseio.com",
  projectId: "stallholder-bd4f7",
  storageBucket: "stallholder-bd4f7.appspot.com",
  messagingSenderId: "1080578618023",
  appId: "1:1080578618023:web:42be3d22e7a3a715d2a182"
};

const interimConfig = {
  apiKey: "AIzaSyDdSIB_jc2JL8Ss5LMBtEeHhTJrU6XmVZo",
  authDomain: "interim-ceb92.firebaseapp.com",
  databaseURL: "https://interim-ceb92-default-rtdb.firebaseio.com",
  projectId: "interim-ceb92",
  storageBucket: "interim-ceb92.appspot.com",
  messagingSenderId: "678623964015",
  appId: "1:678623964015:web:3212a3899a0f27abe6969a"
};

const rentmobileConfig = {
  apiKey: "AIzaSyBW4EyMAoPmZww2zCcDaEpuk2cLG2IdQi8",
  authDomain: "rentmobile-c4616.firebaseapp.com",
  projectId: "rentmobile-c4616",
  storageBucket: "rentmobile-c4616.appspot.com",
  messagingSenderId: "900220872409",
  appId: "1:900220872409:web:fad6948eed55fdde09c0c8",
  measurementId: "G-CEH1SRNX30"
};

// Initialize Firebase for both projects
const stallholderApp = initializeApp(stallholderConfig, "stallholderApp");
const interimApp = initializeApp(interimConfig, "interimApp");
const rentmobileApp = initializeApp(rentmobileConfig, "rentmobileApp");

// Get Firestore and Auth for both apps
const stallholderDb = getFirestore(stallholderApp);
const stallholderAuth = getAuth(stallholderApp);
const stallholderStorage = getStorage(stallholderApp);

const interimDb = getFirestore(interimApp);
const interimAuth = getAuth(interimApp);
const interimStorage = getStorage(interimApp);

const rentmobileDb = getFirestore(rentmobileApp);
const rentmobileAuth = getAuth(rentmobileApp);
const rentmobileStorage = getStorage(rentmobileApp);
const rentmobileAnalytics = getAnalytics(rentmobileApp);

// Export the instances
export {
  stallholderDb,
  stallholderAuth,
  stallholderStorage,
  interimDb,
  interimAuth,
  interimStorage,
  rentmobileDb,
  rentmobileAuth,
  rentmobileStorage,
  rentmobileAnalytics
};
