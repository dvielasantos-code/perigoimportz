import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { projectId, dataset } from './env';

export const client = createClient({
  projectId,
  dataset,
  useCdn: true, // Use o cache rápido (CDN) pra carregar imagens velozmente
  apiVersion: '2024-03-28', // Data de hoje
  token: 'skFNN4TfWgk0fiiof8ES7Gz4ylBbNmi0O4JJG9zF2Zi9QIjC9xpU2yv9Acb0cAxkySqlNgfT4bT8wsLwiNdsjpUQe7qSgIrUMVnzkvWWkqPo0DDuYkUtzOnIXH6tDlYx3vkGKcB4Z4OqtMO9l5UhACrDzpjZgYyGvmjriGqLVC7BueUpYw2S' // Bypass absoluto de permissões
});

const builder = imageUrlBuilder(client);

// Essa função gera o link correto e otimizado pra carregar as imagens do banco
export const urlFor = (source) => builder.image(source);
