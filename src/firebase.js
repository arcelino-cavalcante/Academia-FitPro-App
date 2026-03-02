import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableMultiTabIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBeKu3lGTx_Y1MM9eSIr7LNqA1XSE63RFo",
    authDomain: "banco-academia-pwa-2026.firebaseapp.com",
    projectId: "banco-academia-pwa-2026",
    storageBucket: "banco-academia-pwa-2026.firebasestorage.app",
    messagingSenderId: "233228569705",
    appId: "1:233228569705:web:e4eff7d910c298c321a6f8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable multi-tab persistence for offline use and scaling
enableMultiTabIndexedDbPersistence(db)
    .catch((err) => {
        if (err.code === 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled
            // in one tab at a time.
            console.warn('Firestore persistence failed: Multiple tabs open.');
        } else if (err.code === 'unimplemented') {
            // The current browser does not support all of the
            // features required to enable persistence
            console.warn('Firestore persistence failed: Browser not supported.');
        }
    });

export { auth, db };
