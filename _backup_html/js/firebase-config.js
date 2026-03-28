// ARQUIVO PARA VOCÊ PREENCHER COM SUAS CHAVES DO FIREBASE E CLOUDINARY
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// ⚠️ PASSO 1: Cole aqui as configurações do seu Firebase (Project Settings > General > Web App)
const firebaseConfig = {
  apiKey: "COLE_AQUI",
  authDomain: "COLE_AQUI",
  projectId: "COLE_AQUI",
  storageBucket: "COLE_AQUI",
  messagingSenderId: "COLE_AQUI",
  appId: "COLE_AQUI"
};

// ⚠️ PASSO 2: Cole aqui as chaves do Cloudinary
export const cloudinaryConfig = {
    cloudName: "COLE_AQUI", // ex: dlxjvz...
    uploadPreset: "COLE_AQUI" // Crie um preset 'Unsigned' nas configurações de Upload do Cloudinary
};

// Inicializador Seguro (Ignora se estiver vazio para não quebrar a tela)
let app, auth, db;

try {
    if (firebaseConfig.apiKey !== "COLE_AQUI") {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
    }
} catch (error) {
    console.error("Erro ao inicializar Firebase", error);
}

export { auth, db, signInWithEmailAndPassword, onAuthStateChanged, signOut, collection, getDocs, doc, setDoc, deleteDoc, firebaseConfig };
