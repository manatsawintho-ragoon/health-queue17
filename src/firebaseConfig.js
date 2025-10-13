//  Import 
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Firebase Console API Key
const firebaseConfig = {
  apiKey: "AIzaSyDAOIjRfsOWqs05OtgfehvNVOlmUTB-DKQ",
  authDomain: "whocare-hospital.firebaseapp.com",
  projectId: "whocare-hospital",
  storageBucket: "whocare-hospital.firebasestorage.app",
  messagingSenderId: "1089100531715",
  appId: "1:1089100531715:web:1fac0d1bd5a8d81cd9e636",
  measurementId: "G-M6SMWHLF0N",
};


const app = initializeApp(firebaseConfig);


const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
