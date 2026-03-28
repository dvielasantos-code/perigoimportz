import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { data as staticData } from '../data';

export function useProducts(category = null) {
  const [products, setProducts] = useState(staticData.products);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Se o Firebase não estiver configurado, usamos o staticData
    if (!db) {
      console.warn("Firestore não configurado. Exibindo dados estáticos.");
      if (category) {
        setProducts(staticData.products.filter(p => p.category === category));
      } else {
        setProducts(staticData.products);
      }
      return;
    }

    setLoading(true);
    let q = collection(db, 'products');
    
    if (category) {
      q = query(q, where('category', '==', category));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(items.length > 0 ? items : staticData.products);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar produtos real-time:", error);
      setProducts(staticData.products);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [category]);

  return { products, loading };
}
