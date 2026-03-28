export const schemaTypes = [
  {
    name: 'product',
    title: 'Produto',
    type: 'document',
    fields: [
      {
        name: 'name',
        title: 'Nome do Produto',
        type: 'string',
        validation: (Rule) => Rule.required()
      },
      {
        name: 'price',
        title: 'Preço (R$)',
        type: 'number',
        validation: (Rule) => Rule.required().min(0)
      },
      {
        name: 'description',
        title: 'Descrição Curta',
        type: 'text',
        rows: 3
      },
      {
        name: 'image',
        title: 'Imagem',
        type: 'image',
        options: { hotspot: true }, // Permite recortar a imagem no painel
        validation: (Rule) => Rule.required()
      },
      {
        name: 'category',
        title: 'Categoria (Ex: camisetas, calcas, bones)',
        type: 'string',
        validation: (Rule) => Rule.required()
      },
      {
        name: 'subcategory',
        title: 'Subcategoria (Ex: regata, shorts, moletom-top) - Opcional',
        type: 'string'
      },
      {
        name: 'brand',
        title: 'Marca (Ex: nike, supreme, stussy) - Opcional',
        type: 'string'
      },
      {
        name: 'featured',
        title: 'Aparecer no Carrossel de Destaques da Home?',
        type: 'boolean',
        initialValue: false
      },
      {
        name: 'status',
        title: 'Status',
        type: 'string',
        options: {
          list: [
            { title: 'Ativo (Aparece no site)', value: 'ativo' },
            { title: 'Inativo (Oculto)', value: 'inativo' }
          ],
          layout: 'radio'
        },
        initialValue: 'ativo'
      }
    ]
  }
];
