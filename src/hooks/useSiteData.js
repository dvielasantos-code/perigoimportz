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
      const allCats = snap.docs.map(d => d.data());
      
      // Constrói hierarquia
      const parents = allCats.filter(c => !c.parentId);
      parents.sort((a,b) => (a.order || 0) - (b.order || 0));
      
      const builtMenu = parents.map(p => {
        const subs = allCats.filter(c => c.parentId === p.id);
        subs.sort((a,b) => (a.order || 0) - (b.order || 0));
        return {
          ...p,
          subcategories: subs
        };
      });
      
      const sortedAllCats = [...allCats].sort((a,b) => (a.order || 0) - (b.order || 0));

      setSiteData(prev => ({
        ...prev,
        categories: sortedAllCats, // Sobrescreve data.categories hardcoded com TODAS as categorias ativas
        menuCategories: builtMenu
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

    // Escuta Configs de Whatsapp e Endereço:
    getDoc(doc(db, "settings", "global")).then((snap) => {
      if(snap.exists()) {
        const d = snap.data();
        setSiteData(prev => ({ ...prev, whatsapp: d.whatsapp || prev.whatsapp, address: d.address || prev.address }));
      }
      setLoading(false);
    });

    // Escuta Layout da Home
    const unsubLayout = onSnapshot(collection(db, "home_layout"), (snap) => {
      const layout = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      layout.sort((a,b) => (a.order || 0) - (b.order || 0));
      setSiteData(prev => ({ ...prev, home_layout: layout }));
    });

    return () => {
      unsubCats();
      unsubBanners();
      unsubBrands();
      unsubLayout();
    };
  }, []);

  return { data: siteData, loading };
}
