import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// These values identify your project to Firebase. They are safe to be
// public / committed to a repo -- they are not secrets. Real security
// comes from the Firestore rules (firestore.rules) and Firebase Auth,
// not from hiding this config.
const firebaseConfig = {
  apiKey: "AIzaSyDu4eedr6I3HhceTrSnA0O0peM8bX0Tu34",
  authDomain: "jon-todo-app.firebaseapp.com",
  projectId: "jon-todo-app",
  storageBucket: "jon-todo-app.firebasestorage.app",
  messagingSenderId: "267335917974",
  appId: "1:267335917974:web:832fadb6e50382bfb07db7",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
