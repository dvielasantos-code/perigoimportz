import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schema';
import { projectId, dataset } from './env';

export default defineConfig({
  name: 'default',
  title: 'Painel PerigoImportz',

  projectId: projectId,
  dataset: dataset,

  // A raiz da página do admin que vamos criar será /admin
  basePath: '/admin',

  // Configurações e ferramentas nativas
  plugins: [structureTool()],

  schema: {
    types: schemaTypes,
  },
});
