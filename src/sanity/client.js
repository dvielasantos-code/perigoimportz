import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { projectId, dataset } from './env';

export const client = createClient({
  projectId,
  dataset,
  useCdn: true, // Use o cache rápido (CDN) pra carregar imagens velozmente
  apiVersion: '2024-03-28' // Data de hoje
});

const builder = imageUrlBuilder(client);

// Essa função gera o link correto e otimizado pra carregar as imagens do banco
export const urlFor = (source) => builder.image(source);
