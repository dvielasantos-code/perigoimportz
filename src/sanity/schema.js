export const schemaTypes = [
  // 1. PRODUTO (Já tínhamos)
  {
    name: 'product',
    title: '🛍️ Produto',
    type: 'document',
    fields: [
      { name: 'name', title: 'Nome do Produto', type: 'string', validation: (Rule) => Rule.required() },
      { name: 'price', title: 'Preço (R$)', type: 'number', validation: (Rule) => Rule.required().min(0) },
      { name: 'description', title: 'Descrição Curta', type: 'text', rows: 3 },
      { name: 'image', title: 'Imagem Principal', type: 'image', options: { hotspot: true }, validation: (Rule) => Rule.required() },
      { name: 'category', title: 'ID da Categoria (Ex: camisetas, calcas, bones)', type: 'string', validation: (Rule) => Rule.required() },
      { name: 'subcategory', title: 'ID da Subcategoria (Ex: regata, shorts) - Opcional', type: 'string' },
      { name: 'brand', title: 'Opcional: ID da Marca (Ex: nike, supreme, stussy)', type: 'string' },
      { name: 'featured', title: 'Aparecer no Carrossel de Destaques da Home?', type: 'boolean', initialValue: false },
      { name: 'status', title: 'Status', type: 'string', options: { list: [{ title: 'Ativo', value: 'ativo' }, { title: 'Inativo', value: 'inativo' }], layout: 'radio' }, initialValue: 'ativo' }
    ]
  },
  
  // 2. BANNERS (Hero, Destaques, etc)
  {
    name: 'banner',
    title: '🖼️ Banners',
    type: 'document',
    fields: [
      { name: 'title', title: 'Título de Controle (Ex: Banner Principal Black Friday)', type: 'string', validation: (Rule) => Rule.required() },
      { name: 'imageDesktop', title: 'Imagem para Computador (Paisagem)', type: 'image', options: { hotspot: true }, validation: (Rule) => Rule.required() },
      { name: 'imageMobile', title: 'Imagem para Celular (Retrato - Alta/Estreita)', type: 'image', options: { hotspot: true } },
      { name: 'link', title: 'Link do Botão (Opcional - Ex: /categoria/camisetas)', type: 'string' },
      { name: 'position', title: 'Posição no Site', type: 'string', options: { list: [ {title: 'Carrossel Principal (Home)', value: 'hero'}, {title: 'Banner Secundário (Meio da página)', value: 'secondary'} ] }, initialValue: 'hero' },
      { name: 'active', title: 'Banner Ativo?', type: 'boolean', initialValue: true }
    ]
  },

  // 3. CATEGORIAS (Para gerenciar ícones e o Menu)
  {
    name: 'category',
    title: '📂 Categorias do Menu',
    type: 'document',
    fields: [
      { name: 'name', title: 'Nome da Categoria (Ex: Camisetas)', type: 'string', validation: (Rule) => Rule.required() },
      { name: 'slug', title: 'ID Único da url (Ex: camisetas)', type: 'string', validation: (Rule) => Rule.required() },
      { name: 'icon', title: 'Nome do Ícone do Google (Ex: checkroom, straighten, school)', type: 'string' },
      { name: 'active', title: 'Mostrar no Menu Oficial?', type: 'boolean', initialValue: true },
      { name: 'subcategories', title: 'Nomes das Subcategorias (Ex: regata, jaqueta)', type: 'array', of: [{type: 'string'}], description: 'Adicione as subcategorias desta seção (se houver)' }
    ]
  },

  // 4. MARCAS
  {
    name: 'brand',
    title: '🏷️ Marcas',
    type: 'document',
    fields: [
      { name: 'name', title: 'Nome da Marca (Ex: Nike, Supreme)', type: 'string', validation: (Rule) => Rule.required() },
      { name: 'slug', title: 'ID Único da url (Ex: nike)', type: 'string', validation: (Rule) => Rule.required() },
      { name: 'logo', title: 'Logo da Marca (Opcional)', type: 'image', options: { hotspot: true } }
    ]
  }
];
