import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { data as staticData } from '../data';

export function useProducts(category = null) {
  const [products, setProducts] = useState(staticData.products); // Inicia rapido
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, "products"), where("status", "==", "ativo"));
    
    if (category) {
      q = query(collection(db, "products"), where("status", "==", "ativo"), where("category", "==", category));
    }

    const unsub = onSnapshot(q, (snap) => {
      const prods = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setProducts(prods);
      setLoading(false);
    }, (err) => {
      console.error("Erro ao escutar Firestore:", err);
      setLoading(false);
    });

    return () => unsub();
  }, [category]);

  return { products, loading };
}
