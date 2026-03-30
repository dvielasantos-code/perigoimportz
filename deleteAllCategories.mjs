import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA6l4e2jKVHVhaJDdVlEMjJHfFfISra4P0",
  authDomain: "perigo-1778c.firebaseapp.com",
  projectId: "perigo-1778c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteAll() {
  console.log("Buscando todas as categorias...");
  const snap = await getDocs(collection(db, 'categories'));
  const total = snap.docs.length;
  console.log(`Encontradas ${total} categorias. Deletando...`);

  let count = 0;
  for (const item of snap.docs) {
    await deleteDoc(doc(db, 'categories', item.id));
    count++;
    console.log(`Deletado ${count}/${total} - ${item.id}`);
  }

  console.log("Tudo apagado!");
  process.exit(0);
}

deleteAll().catch(console.error);
