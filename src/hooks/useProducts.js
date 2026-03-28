import { useState, useEffect } from 'react';
import { client } from '../sanity/client';
import { data as staticData } from '../data';

export function useProducts(category = null) {
  const [products, setProducts] = useState(staticData.products); // Inicia com o catálogo antigo como fallback
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let query = `*[_type == "product" && status == "ativo"]`;
    
    if (category) {
      query += `[category == "${category}"]`;
    }

    client.fetch(query)
      .then((data) => {
        if (data.length > 0) {
          setProducts(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao puxar dados do Sanity. Usando fallback estático.", err);
        setLoading(false);
      });
  }, [category]);

  return { products, loading };
}
