import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA6l4e2jKVHVhaJDdVlEMjJHfFfISra4P0",
  authDomain: "perigo-1778c.firebaseapp.com",
  projectId: "perigo-1778c",
  storageBucket: "perigo-1778c.firebasestorage.app",
  messagingSenderId: "918927812540",
  appId: "1:918927812540:web:3ab3039a5f69087e7fadb9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Isso aqui ativa a mágica do recarregamento CERO (0) segundos:
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
