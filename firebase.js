// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {getAuth, GoogleAuthProvider, signInWithPopup} from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyDwrXCwR22JEL2zZPtDZ65lqPjrMQ2vggc",
  authDomain: "inventory-management-app-b171d.firebaseapp.com",
  projectId: "inventory-management-app-b171d",
  storageBucket: "inventory-management-app-b171d.appspot.com",
  messagingSenderId: "724380199691",
  appId: "1:724380199691:web:36d808a7bcfa2e98a1900e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
export { firestore ,auth, googleProvider};