// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC_AmLL3vGXt3Fayx9e2JAEwIvCldR-mSs",
  authDomain: "expense-tracker12.firebaseapp.com",
  projectId: "expense-tracker12",
  storageBucket: "expense-tracker12.firebasestorage.app",
  messagingSenderId: "417647143532",
  appId: "1:417647143532:web:1747870189275a0548c649"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };