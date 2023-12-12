// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCG97KtrL7t5VfJa-TeEW7-waqmsZEH9o4",
    authDomain: "backlog-app-f1b51.firebaseapp.com",
    projectId: "backlog-app-f1b51",
    storageBucket: "backlog-app-f1b51.appspot.com",
    messagingSenderId: "714357282327",
    appId: "1:714357282327:web:66ad94d07e4cf3a2a3ae52",
    measurementId: "G-ZE7LP6SN89"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const firestore = getFirestore(app);
export const storageRef = getStorage(app);
export const auth = getAuth(app);