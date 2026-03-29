import { createClient } from '@sanity/client';
import { data } from './src/data.js';

const client = createClient({
  projectId: 'dp651wdk',
  dataset: 'production',
  apiVersion: '2024-03-28',
  token: 'skFNN4TfWgk0fiiof8ES7Gz4ylBbNmi0O4JJG9zF2Zi9QIjC9xpU2yv9Acb0cAxkySqlNgfT4bT8wsLwiNdsjpUQe7qSgIrUMVnzkvWWkqPo0DDuYkUtzOnIXH6tDlYx3vkGKcB4Z4OqtMO9l5UhACrDzpjZgYyGvmjriGqLVC7BueUpYw2S',
  useCdn: false // Desabilita o cache pra gravar no banco imediatamente
});

async function run() {
  console.log('⏳ Iniciando migração de Categorias e Marcas...');
  
  // Extraindo Categorias (exceto o item Marcas)
  const categoriesDocs = data.menuCategories.filter(c => c.id !== 'marcas').map(cat => ({
    _type: 'category',
    _id: `category.${cat.id}`, // Usamos o ID que a gente criou pra evitar duplicados
    name: cat.name,
    slug: cat.id,
    icon: cat.icon || '',
    subcategories: cat.subcategories ? cat.subcategories.map(sub => sub.name) : []
  }));

  // Extraindo Marcas
  const marcasItem = data.menuCategories.find(c => c.id === 'marcas');
  const brandsDocs = (marcasItem ? marcasItem.subcategories : []).map(brand => ({
    _type: 'brand',
    _id: `brand.${brand.id}`,
    name: brand.name,
    slug: brand.id
  }));

  const todosOsDocumentos = [...categoriesDocs, ...brandsDocs];

  for (const doc of todosOsDocumentos) {
    try {
      await client.createOrReplace(doc);
      console.log(`✅ Adicionado no Sanity: ${doc.name}`);
    } catch (e) {
      console.error(`❌ Erro ao adicionar ${doc.name}:`, e.message);
    }
  }
  
  console.log('🚀 Migração finalizada com sucesso!');
}

run();
