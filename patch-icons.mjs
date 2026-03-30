import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA6l4e2jKVHVhaJDdVlEMjJHfFfISra4P0",
  authDomain: "perigo-1778c.firebaseapp.com",
  projectId: "perigo-1778c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ICON_MAP = {
  '👕': 'checkroom',
  '🎽': 'dry_cleaning',
  '🧥': 'apparel',
  '👖': 'straighten',
  '🩳': 'laundry',
  '👟': 'sprint',
  '🧢': 'school',
  '📿': 'styler',
  '💎': 'diamond',
  '🕶️': 'eyeglasses',
  '🧦': 'category',
  '👔': 'styler',
  '👗': 'apparel',
  '👜': 'shopping_bag',
  '⌚': 'watch',
  '🪡': 'diamond',
};

async function patchIcons() {
  const snap = await getDocs(collection(db, 'categories'));
  const allCats = snap.docs.map(d => ({ docId: d.id, ...d.data() }));

  for(const cat of allCats) {
    if(ICON_MAP[cat.icon]) {
      cat.icon = ICON_MAP[cat.icon];
      await setDoc(doc(db, "categories", cat.docId), cat);
      console.log(`Updated ${cat.name} icon to ${cat.icon}`);
    }
  }

  console.log("Done patching icons");
  process.exit(0);
}

patchIcons().catch(console.error);
