import { createClient } from '@sanity/client';

const clientToken = createClient({
  projectId: 'dp651wdk',
  dataset: 'production',
  apiVersion: '2024-03-28',
  useCdn: false,
  token: 'skFNN4TfWgk0fiiof8ES7Gz4ylBbNmi0O4JJG9zF2Zi9QIjC9xpU2yv9Acb0cAxkySqlNgfT4bT8wsLwiNdsjpUQe7qSgIrUMVnzkvWWkqPo0DDuYkUtzOnIXH6tDlYx3vkGKcB4Z4OqtMO9l5UhACrDzpjZgYyGvmjriGqLVC7BueUpYw2S'
});

async function check() {
  const docs = await clientToken.fetch('*[_type == "category"]');
  console.log("Docs com token:");
  for (let d of docs) {
     console.log(d._id, d.name, d.active);
  }
}
check();
