import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'dp651wdk',
  dataset: 'production',
  apiVersion: '2024-03-28',
  useCdn: false,
  token: 'skFNN4TfWgk0fiiof8ES7Gz4ylBbNmi0O4JJG9zF2Zi9QIjC9xpU2yv9Acb0cAxkySqlNgfT4bT8wsLwiNdsjpUQe7qSgIrUMVnzkvWWkqPo0DDuYkUtzOnIXH6tDlYx3vkGKcB4Z4OqtMO9l5UhACrDzpjZgYyGvmjriGqLVC7BueUpYw2S'
});

async function repair() {
  const cats = await client.fetch('*[_type == "category"]');
  for (const c of cats) {
    if (c.active === undefined) {
      console.log(`Consertando ${c.name}...`);
      await client.patch(c._id).set({ active: true }).commit();
    }
  }
  console.log('Todas consertadas!');
}
repair();
