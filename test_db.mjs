import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA6l4e2jKVHVhaJDdVlEMjJHfFfISra4P0",
  authDomain: "perigo-1778c.firebaseapp.com",
  projectId: "perigo-1778c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const snap = await getDocs(collection(db, 'categories'));
  const cats = snap.docs.map(d => d.data());
  console.log(`Encontradas ${cats.length} categorias:`);
  console.log(cats.map(c => ({ name: c.name, active: c.active, parentId: c.parentId, order: c.order })));
  process.exit(0);
}

check().catch(console.error);
