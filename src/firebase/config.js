import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Aqui fica a porta do Banco de dados blindada
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "COLE_AQUI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "COLE_AQUI",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "COLE_AQUI",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "COLE_AQUI",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "COLE_AQUI",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "COLE_AQUI"
};

export const cloudinaryConfig = {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "COLE_AQUI",
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "COLE_AQUI"
};


let app, auth, db;
try {
    if (firebaseConfig.apiKey !== "COLE_AQUI") {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
    }
} catch (error) {
    console.error("Erro Firebase", error);
}

export { auth, db };
