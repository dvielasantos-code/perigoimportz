import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'dp651wdk',
  dataset: 'production',
  apiVersion: '2024-03-28',
  useCdn: false
});

async function check() {
  const query = '*[_type == "category" && coalesce(active, true) == true]';
  const data = await client.fetch(query).catch(e => console.error(e));
  console.log("Categorias com coalesce:", data?.length);
  if(data?.length > 0) { console.log(data.map(d => d.name)); }

  const q2 = '*[_type == "category"]';
  const d2 = await client.fetch(q2).catch(e => console.error(e));
  console.log("Todas as categorias:", d2?.length);
  if(d2?.length > 0) { console.log(d2.map(d => d.name)); }
}
check();
