// firebase.js
// Firebase initialization and Firestore export for CodeCrest.
// Configured with your real Firebase project credentials.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js';

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js';


// Your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJQrAcD1FCgNnMiQJ4RH6pgmeLa3_mab0",
  authDomain: "codecrest-6d8ed.firebaseapp.com",
  projectId: "codecrest-6d8ed",
  storageBucket: "codecrest-6d8ed.firebasestorage.app",
  messagingSenderId: "1077441432587",
  appId: "1:1077441432587:web:22a052a38badb447524b0e",
  measurementId: "G-93JBK38H65"
};


// Safety check
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    "[CodeCrest] Firebase configuration error. Check firebaseConfig values."
  );
}


// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Firestore
const db = getFirestore(app);


// Export modules for use in main.js
export {
  app,
  db,
  collection,
  addDoc,
  serverTimestamp
};