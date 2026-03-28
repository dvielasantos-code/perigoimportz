import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { data } from '../data';
import SideMenu from '../components/SideMenu';
import WhatsAppButton from '../components/WhatsAppButton';

export default function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    setSelectedSize(null);
  }, [productId]);

  const product = data.products.find(p => String(p.id) === productId);

  if (!product) {
    return (
      <div className="bg-background text-white min-h-screen flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-6xl text-white/20 mb-4">error</span>
        <p className="text-white/50 text-lg mb-6">Produto não encontrado</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 bg-white text-black rounded-full font-bold text-sm uppercase tracking-wider">Voltar</button>
      </div>
    );
  }

  const sizes = ['P', 'M', 'G', 'GG', 'XG'];
  const categoryInfo = data.categories.find(c => c.id === product.category);

  // Produtos relacionados (mesma categoria, excluindo o atual)
  const related = data.products.filter(p => p.category === product.category && p.id !== product.id && p.status === 'ativo').slice(0, 4);

  const whatsappMsg = encodeURIComponent(
    `Olá! Tenho interesse no produto: *${product.name}*\nPreço: R$ ${product.price.toFixed(2)}${selectedSize ? `\nTamanho: ${selectedSize}` : ''}\n\nPoderia me ajudar?`
  );

  return (
    <div className="bg-background text-on-background min-h-screen font-body antialiased">
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#000000]/90 backdrop-blur-md flex justify-between items-center px-6 md:px-8 py-5 md:py-6">
        <div className="flex items-center gap-3 md:gap-4 cursor-pointer" onClick={() => setMenuOpen(true)}>
          <span className="material-symbols-outlined text-white text-2xl">menu</span>
          <h1 className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase">PERIGOIMPORTZ</h1>
        </div>
      </header>

      <main className="pt-[68px] md:pt-[88px]">
        {/* Breadcrumb */}
        <div className="px-6 md:px-8 pt-6 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => navigate('/')} className="text-white/40 hover:text-white transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Início
            </button>
            {categoryInfo && (
              <>
                <span className="text-white/20">/</span>
                <button onClick={() => navigate(`/categoria/${product.category}`)} className="text-white/40 hover:text-white transition-colors">
                  {categoryInfo.name}
                </button>
              </>
            )}
            <span className="text-white/20">/</span>
            <span className="text-white/60 truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>

        {/* Product Layout */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 px-6 md:px-8">
          {/* Imagem */}
          <div className="md:w-1/2 lg:w-[55%]">
            <div className="relative aspect-[3/4] md:aspect-[4/5] rounded-2xl md:rounded-3xl overflow-hidden bg-surface-container-low">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover grayscale brightness-90 hover:brightness-100 transition-all duration-700" />
              {product.featured && (
                <div className="absolute top-4 left-4 md:top-6 md:left-6">
                  <span className="bg-primary text-on-primary px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">Destaque</span>
                </div>
              )}
              {product.brand && (
                <div className="absolute top-4 right-4 md:top-6 md:right-6">
                  <span className="bg-black/60 backdrop-blur-sm text-white/90 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">{product.brand}</span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="md:w-1/2 lg:w-[45%] flex flex-col justify-center py-4">
            {/* Marca + Categoria */}
            <div className="flex items-center gap-3 mb-4">
              {product.brand && (
                <span className="text-white/40 text-[11px] font-bold uppercase tracking-[.2em]">{product.brand}</span>
              )}
              {product.brand && categoryInfo && <span className="text-white/15">•</span>}
              {categoryInfo && (
                <span className="text-white/40 text-[11px] font-bold uppercase tracking-[.2em]">{categoryInfo.name}</span>
              )}
            </div>

            {/* Nome */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter uppercase text-white leading-[0.95] mb-6">
              {product.name}
            </h1>

            {/* Preço */}
            <div className="mb-8">
              <span className="text-3xl md:text-4xl font-black text-white">R$ {product.price.toFixed(2)}</span>
              <p className="text-white/30 text-xs mt-2 font-medium">ou 3x de R$ {(product.price / 3).toFixed(2)} sem juros</p>
            </div>

            {/* Descrição */}
            <p className="text-white/50 text-sm md:text-base leading-relaxed mb-8 font-medium">{product.description}</p>

            {/* Tamanhos */}
            <div className="mb-8">
              <p className="text-white/40 text-[11px] font-bold uppercase tracking-[.2em] mb-4">Tamanho</p>
              <div className="flex gap-2 flex-wrap">
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-xl font-bold text-sm transition-all duration-200 ${
                      selectedSize === size 
                        ? 'bg-white text-black scale-105' 
                        : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Botão WhatsApp de compra */}
            <a
              href={`https://wa.me/${data.whatsapp}?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-black py-5 px-8 rounded-2xl flex items-center justify-center gap-3 text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] mb-4"
            >
              <svg viewBox="0 0 32 32" width="20" height="20" fill="currentColor">
                <path d="M16.004 3.2C8.924 3.2 3.2 8.924 3.2 16.004c0 2.264.592 4.472 1.716 6.424L3.2 28.8l6.56-1.72A12.76 12.76 0 0016.004 28.8c7.08 0 12.796-5.724 12.796-12.796S23.084 3.2 16.004 3.2z"/>
              </svg>
              Comprar via WhatsApp
            </a>

            {/* Info extras */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-white/40 text-xl">local_shipping</span>
                <div>
                  <p className="text-white/80 text-xs font-bold">Frete Grátis</p>
                  <p className="text-white/30 text-[10px]">Acima de R$ 299</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-white/40 text-xl">verified</span>
                <div>
                  <p className="text-white/80 text-xs font-bold">Original</p>
                  <p className="text-white/30 text-[10px]">100% Autêntico</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Produtos Relacionados */}
        {related.length > 0 && (
          <section className="px-6 md:px-8 mt-20 mb-12">
            <h3 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-white mb-8">Relacionados</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {related.map(p => (
                <div key={p.id} className="group cursor-pointer" onClick={() => navigate(`/produto/${p.id}`)}>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-surface-container-low mb-3 transition-transform duration-500 hover:scale-[1.02]">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover grayscale brightness-90 group-hover:brightness-100 transition-all duration-700" />
                  </div>
                  <h4 className="font-extrabold text-xs md:text-sm tracking-tighter uppercase text-white">{p.name}</h4>
                  <span className="font-bold text-xs md:text-sm text-white/70 mt-1 block">R$ {p.price.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0e0e0e] w-full rounded-t-[3rem] mt-20 flex flex-col items-center px-10 py-16 text-center">
        <h2 className="font-black text-xl text-white mb-4 tracking-tighter">PERIGOIMPORTZ</h2>
        <p className="text-sm text-white/40 leading-relaxed font-medium">{data.address}</p>
      </footer>

      <WhatsAppButton />
    </div>
  );
}
