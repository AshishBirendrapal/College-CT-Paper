import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBa4ixtbFsLZlJFDGNr3q7utgtx5M6gNDk",
  authDomain: "college-ct-paper-4386e.firebaseapp.com",
  projectId: "college-ct-paper-4386e",
  storageBucket: "college-ct-paper-4386e.firebasestorage.app",
  messagingSenderId: "181670474373",
  appId: "1:181670474373:web:eb646b761d94c3b00d2fec",
  measurementId: "G-YFL07JBYVY"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
