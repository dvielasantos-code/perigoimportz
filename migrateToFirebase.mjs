import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import fs from 'fs';

// This reads the old data.js
const firebaseConfig = {
  apiKey: "AIzaSyA6l4e2jKVHVhaJDdVlEMjJHfFfISra4P0",
  authDomain: "perigo-1778c.firebaseapp.com",
  projectId: "perigo-1778c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Simular os dados importados antigos, vamos recriar o basico primeiro:
const staticData = {
  menuCategories: [
    { id: 'camisetas', name: 'Camisetas', icon: 'apparel', subcategories: [{id: 'regatas', name: 'Regatas'}, {id: 'manga-longa', name: 'Manga Longa'}, {id: 'basicas', name: 'Básicas'}] },
    { id: 'calcas', name: 'Calças', icon: 'apparel', subcategories: [{id: 'jeans', name: 'Jeans'}, {id: 'moletom', name: 'Moletom'}, {id: 'cargo', name: 'Cargo'}] },
    { id: 'tenis', name: 'Tênis', icon: 'steps', subcategories: [] },
    { id: 'bones', name: 'Bonés', icon: 'apparel', subcategories: [] },
    { id: 'acessorios', name: 'Acessórios', icon: 'diamond', subcategories: [] }
  ],
  products: [
    { id: '1', name: 'Camiseta Básica Preta', category: 'camisetas', subcategory: 'basicas', price: 89.90, description: 'Camiseta 100% algodão egípcio, modelagem slim fit.', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', featured: true, status: 'ativo', brand: 'perigo' },
    { id: '2', name: 'Calça Cargo Urban', category: 'calcas', subcategory: 'cargo', price: 199.90, description: 'Calça cargo com bolsos laterais, tecido resistente ripstop.', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80', featured: true, status: 'ativo', brand: 'perigo' }
  ],
  whatsapp: '5511999999999',
  address: 'Rua das Importações, 123 - São Paulo, SP'
};

async function migrate() {
  console.log("Injetando Categorias...");
  for (const cat of staticData.menuCategories) {
    await setDoc(doc(db, "categories", cat.id), {
      id: cat.id,
      name: cat.name,
      icon: cat.icon || '',
      subcategories: cat.subcategories || [],
      active: true
    });
  }

  console.log("Injetando Configurações do Site...");
  await setDoc(doc(db, "settings", "global"), {
    whatsapp: staticData.whatsapp,
    address: staticData.address
  });

  console.log("Injetando Produtos de Teste...");
  for (const prod of staticData.products) {
    await setDoc(doc(db, "products", prod.id), prod);
  }

  console.log("SUCESSO: Tudo injetado no Firebase!");
  process.exit(0);
}

migrate().catch(console.error);
