import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Set persistence to LOCAL (persists even after browser is closed)
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

// Initialize Firestore
const firestore = firebase.firestore();
const storage = firebase.storage(); 


// Export the auth and firestore modules
export const auth = firebase.auth();
//Time to use this.
//export const googleProvider = new firebase.auth.GoogleAuthProvider();
//export const appleProvider = new firebase.auth.OAuthProvider("apple.com");
export { firestore, storage };
export default firebase;
