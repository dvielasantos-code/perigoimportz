import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSiteData } from '../hooks/useSiteData';
import { useProducts } from '../hooks/useProducts';
import SideMenu from '../components/SideMenu';
import WhatsAppButton from '../components/WhatsAppButton';

export default function CategoryPage() {
  const { categoryId, subId } = useParams();
  const navigate = useNavigate();
  const { data } = useSiteData();
  const { products: allProducts } = useProducts();
  const [menuOpen, setMenuOpen] = useState(false);

  // Encontrar info da categoria
  const categoryInfo = data.categories.find(c => c.id === categoryId) 
    || data.menuCategories.find(c => c.id === categoryId);

  // Encontrar info da subcategoria se existir
  const menuCat = data.menuCategories.find(c => c.id === categoryId);
  const subInfo = subId && menuCat?.subcategories?.find(s => s.id === subId);

  // Filtrar produtos
  const products = useMemo(() => {
    let filtered = allProducts.filter(p => p.status === 'ativo');

    if (categoryId === 'marcas' && subId) {
      // Filtrar por marca
      filtered = filtered.filter(p => p.brand === subId);
    } else if (subId) {
      // Filtrar por subcategoria
      filtered = filtered.filter(p => p.subcategory === subId);
    } else if (categoryId === 'marcas') {
      // Todas as marcas = todos os produtos
      filtered = filtered;
    } else {
      // Filtrar por categoria principal
      filtered = filtered.filter(p => p.category === categoryId);
    }

    return filtered;
  }, [categoryId, subId]);

  // Título da página
  const pageTitle = subInfo?.name || categoryInfo?.name || categoryId?.toUpperCase();

  return (
    <div className="bg-background text-on-background min-h-screen pb-12 font-body antialiased">
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#000000] flex justify-between items-center px-6 md:px-8 py-5 md:py-6">
        <div className="flex items-center gap-3 md:gap-4 cursor-pointer" onClick={() => setMenuOpen(true)}>
          <span className="material-symbols-outlined text-white text-2xl">menu</span>
          <h1 className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase">PERIGOIMPORTZ</h1>
        </div>
      </header>

      <main className="pt-[68px] md:pt-[88px]">
        {/* Breadcrumb & Title */}
        <section className="px-6 md:px-8 pt-8 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => navigate('/')} className="text-white/40 hover:text-white transition-colors text-sm font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Início
            </button>
            <span className="text-white/20 text-xs">/</span>
            {subId && categoryInfo && (
              <>
                <button onClick={() => navigate(`/categoria/${categoryId}`)} className="text-white/40 hover:text-white transition-colors text-sm font-medium">
                  {categoryInfo.name}
                </button>
                <span className="text-white/20 text-xs">/</span>
              </>
            )}
            <span className="text-white/70 text-sm font-medium">{pageTitle}</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-white leading-none">
            {pageTitle}
          </h2>
          <p className="text-white/40 text-sm font-medium mt-3">
            {products.length} {products.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
          </p>
        </section>

        {/* Subcategorias se existirem */}
        {menuCat?.subcategories && !subId && (
          <section className="px-6 md:px-8 mb-10">
            <div className="flex flex-wrap gap-2">
              {menuCat.subcategories.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => navigate(`/categoria/${categoryId}/${sub.id}`)}
                  className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-bold uppercase tracking-wider hover:bg-white/10 hover:text-white transition-all"
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Grid de Produtos */}
        <section className="px-6 md:px-8">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <span className="material-symbols-outlined text-5xl text-white/20 mb-4">inventory_2</span>
              <p className="text-white/40 text-lg font-medium">Nenhum produto encontrado</p>
              <button onClick={() => navigate('/')} className="mt-6 px-6 py-3 bg-white text-black rounded-full text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-all">
                Voltar ao início
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {products.map(p => (
                <div key={p.id || p._id} className="group cursor-pointer" onClick={() => navigate(`/produto/${p.id || p._id}`)}>
                  <div className="relative aspect-square overflow-hidden rounded-xl md:rounded-2xl bg-surface-container-low mb-3 md:mb-5 transition-transform duration-500 hover:scale-[1.02]">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-all duration-700" />
                    {p.featured && (
                      <div className="absolute top-3 left-3 md:top-5 md:left-5">
                        <span className="bg-neon-green text-black px-3 py-1 rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-neon-green/20">Destaque</span>
                      </div>
                    )}
                    {p.brand && (
                      <div className="absolute bottom-3 right-3 md:bottom-5 md:right-5">
                        <span className="bg-black/60 backdrop-blur-sm text-white/80 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{p.brand}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 px-1">
                    <h3 className="font-extrabold text-sm md:text-lg tracking-tighter uppercase text-white leading-tight">{p.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {p.promoPrice ? (
                        <>
                          <span className="font-black text-sm md:text-lg text-white">R$ {p.promoPrice.toFixed(0)}</span>
                          <span className="font-bold text-[10px] md:text-xs text-white/30 line-through">R$ {p.price.toFixed(0)}</span>
                        </>
                      ) : (
                        <span className="font-black text-sm md:text-base text-white">R$ {p.price.toFixed(0)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0e0e0e] w-full rounded-t-xl mt-20 flex flex-col items-center px-10 py-16 text-center">
        <h2 className="font-black text-xl text-white mb-4 tracking-tighter">PERIGOIMPORTZ</h2>
        <p className="text-sm text-white/40 leading-relaxed font-medium">{data.address}</p>
      </footer>

      <WhatsAppButton />
    </div>
  );
}
