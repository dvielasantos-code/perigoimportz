import { useState, useEffect } from 'react';
import { client } from '../sanity/client';
import { data as staticData } from '../data';

export function useSiteData() {
  const [siteData, setSiteData] = useState({ ...staticData, banners: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSanity() {
      try {
        const categories = await client.fetch('*[_type == "category" && active == true]');
        const brands = await client.fetch('*[_type == "brand"]');
        const banners = await client.fetch('*[_type == "banner" && active == true]');
        
        // Recria a arquitetura perfeita exigida pelo menu expansível original
        const customMenu = categories.map(c => ({
          id: c.slug,
          name: c.name,
          icon: c.icon || 'checkroom', // ícone padrão
          subcategories: (c.subcategories || []).map(s => ({ 
            id: s.toLowerCase().replace(/\s+/g, '-'), 
            name: s 
          }))
        }));

        // Injeta a seção Marcas caso tenhamos marcas criadas
        if (brands.length > 0) {
           customMenu.push({
             id: 'marcas', 
             name: 'Marcas', 
             icon: 'verified',
             subcategories: brands.map(b => ({ id: b.slug, name: b.name }))
           });
        }
        
        // Substitui a base inteira, mantendo enderço e whatsapp originais
        setSiteData({
          whatsapp: staticData.whatsapp,
          address: staticData.address,
          categories: customMenu.filter(c => c.id !== 'marcas'), // Carrossel Home não pega Marca
          menuCategories: customMenu, // Menu lateral pega Marca
          banners: banners
        });
      } catch(err) {
        console.error('Falha de ligação no Sanity. Fallback ativado.', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSanity();
  }, []);

  return { data: siteData, loading };
}
