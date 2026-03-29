import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, onSnapshot, query, where, doc, getDoc } from 'firebase/firestore';
import { data as staticData } from '../data';

export function useSiteData() {
  const [siteData, setSiteData] = useState({ ...staticData, banners: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuta Categorias
    const qCats = query(collection(db, "categories"), where("active", "==", true));
    const unsubCats = onSnapshot(qCats, (snap) => {
      const cats = snap.docs.map(d => d.data());
      // Ordena pelas posições originais ou como vier
      
      setSiteData(prev => ({
        ...prev,
        menuCategories: cats
      }));
    });

    // Escuta Banners
    const qBanners = query(collection(db, "banners"), where("active", "==", true));
    const unsubBanners = onSnapshot(qBanners, (snap) => {
      const banners = snap.docs.map(d => d.data());
      setSiteData(prev => ({
        ...prev,
        banners
      }));
    });

    // Escuta Marcas
    const unsubBrands = onSnapshot(collection(db, "brands"), (snap) => {
      const brands = snap.docs.map(d => d.data());
      setSiteData(prev => ({
        ...prev,
        brands
      }));
    });

    // Escuta Configs de Whatsapp e Endeço:
    getDoc(doc(db, "settings", "global")).then((snap) => {
      if(snap.exists()) {
        const d = snap.data();
        setSiteData(prev => ({ ...prev, whatsapp: d.whatsapp || prev.whatsapp, address: d.address || prev.address }));
      }
      setLoading(false);
    });

    return () => {
      unsubCats();
      unsubBanners();
      unsubBrands();
    };
  }, []);

  return { data: siteData, loading };
}
