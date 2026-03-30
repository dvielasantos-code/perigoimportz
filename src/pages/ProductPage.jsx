import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSiteData } from '../hooks/useSiteData';
import { useProducts } from '../hooks/useProducts';
import SideMenu from '../components/SideMenu';
import WhatsAppButton from '../components/WhatsAppButton';

export default function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data } = useSiteData();
  const { products: allProducts } = useProducts();
  const [selectedSize, setSelectedSize] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  const product = allProducts.find(p => String(p.id || p._id) === productId);

  useEffect(() => {
    if (product) setMainImage(product.image);
    setSelectedSize(null);
  }, [productId, product?.id]);

  if (!product) {
    return (
      <div style={{background:'#080808'}} className="text-white min-h-screen flex flex-col items-center justify-center">
        <p className="text-white/30 text-sm uppercase tracking-widest mb-6">Produto não encontrado</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
          ← Voltar
        </button>
      </div>
    );
  }

  const productSizes = product.sizes && product.sizes.length > 0 ? product.sizes : null;

  const categoryInfo = data.menuCategories.find(c => c.id === product.category) ||
    data.menuCategories.flatMap(c => c.subcategories || []).find(sc => sc.id === product.category);

  const related = allProducts
    .filter(p => p.category === product.category && (p.id || p._id) !== (product.id || product._id) && p.status === 'ativo')
    .slice(0, 4);

  const displayPrice  = product.promoPrice || product.price;
  const originalPrice = product.promoPrice ? product.price : null;
  const discount      = originalPrice ? Math.round((1 - displayPrice / originalPrice) * 100) : null;

  const whatsappMsg = encodeURIComponent(
    `Olá! Tenho interesse no produto: *${product.name}*\nPreço: R$ ${displayPrice.toFixed(2)}${selectedSize ? `\nTamanho: ${selectedSize}` : ''}\n\nPoderia me ajudar?`
  );

  const gallery = product.images && product.images.length > 1 ? product.images : [product.image];

  return (
    <div style={{background:'#080808',minHeight:'100vh'}} className="text-white font-body antialiased">
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* ── Header ── */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-5 md:px-10 py-4"
        style={{background:'rgba(8,8,8,0.92)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setMenuOpen(true)}>
          <span className="material-symbols-outlined text-white text-xl">menu</span>
          <span className="text-sm md:text-base font-black tracking-tighter text-white uppercase select-none">PERIGOIMPORTZ</span>
        </div>
        <button onClick={() => navigate(-1)} className="text-xs font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Voltar
        </button>
      </header>

      <main className="pt-16 md:pt-20">

        {/* ── Breadcrumb ── */}
        <div className="px-5 md:px-10 pt-6 pb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-white/20">
          <button onClick={() => navigate('/')} className="hover:text-white/50 transition-colors">Início</button>
          {categoryInfo && <>
            <span>/</span>
            <button onClick={() => navigate(`/categoria/${product.category}`)} className="hover:text-white/50 transition-colors">
              {categoryInfo.name}
            </button>
          </>}
          <span>/</span>
          <span className="text-white/40 truncate max-w-[160px]">{product.name}</span>
        </div>

        {/* ── Layout principal ── */}
        <div className="flex flex-col md:flex-row md:gap-0 px-5 md:px-10 mt-4 md:mt-8">

          {/* ── Coluna: Galeria ── */}
          <div className="md:w-[52%] md:pr-12">

            {/* Imagem principal — sempre quadrada 1:1 */}
            <div className="w-full aspect-square overflow-hidden bg-[#111] relative" style={{borderRadius:8}}>
              <img
                key={mainImage}
                src={mainImage || product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-500"
              />
              {discount && (
                <div className="absolute top-4 right-4 bg-neon-green text-black text-[10px] font-black uppercase tracking-widest px-3 py-1.5 shadow-lg shadow-neon-green/20">
                  -{discount}%
                </div>
              )}
            </div>

            {/* Thumbnails da galeria — sempre quadrados */}
            {gallery.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className="shrink-0 w-16 h-16 overflow-hidden transition-all"
                    style={{
                      borderRadius: 2,
                      outline: mainImage === img ? '2px solid #fff' : '2px solid transparent',
                      opacity: mainImage === img ? 1 : 0.45,
                    }}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Coluna: Info ── */}
          <div className="md:w-[48%] flex flex-col justify-start pt-8 md:pt-0">

            {/* Marca */}
            {product.brand && (
              <p className="text-[10px] font-black uppercase tracking-[.25em] text-white/30 mb-3">
                {product.brand}{categoryInfo && <span className="text-white/15"> · {categoryInfo.name}</span>}
              </p>
            )}

            {/* Nome */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter uppercase text-white leading-none mb-6">
              {product.name}
            </h1>

            {/* Preço — clean, sem red gigante */}
            <div className="mb-6 pb-6" style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl md:text-3xl font-black text-white">
                  R$ {displayPrice.toFixed(2)}
                </span>
                {originalPrice && (
                  <span className="text-sm font-medium text-white/25 line-through">
                    R$ {originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/20 font-medium mt-1">
                ou 3× de R$ {(displayPrice / 3).toFixed(2)} sem juros
              </p>
            </div>

            {/* Descrição */}
            {product.description && (
              <p className="text-white/40 text-sm leading-relaxed mb-6 font-medium">
                {product.description}
              </p>
            )}

            {/* Tamanhos — só mostra se tiver no produto */}
            {productSizes && (
              <div className="mb-8">
                <p className="text-[10px] font-black uppercase tracking-[.2em] text-white/25 mb-3">Tamanho</p>
                <div className="flex gap-2 flex-wrap">
                  {productSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                      className="transition-all duration-150 text-xs font-black uppercase"
                      style={{
                        width: 44, height: 44,
                        borderRadius: 2,
                        background: selectedSize === size ? '#fff' : 'transparent',
                        color: selectedSize === size ? '#000' : 'rgba(255,255,255,0.45)',
                        border: selectedSize === size ? '2px solid #fff' : '1px solid rgba(255,255,255,0.12)',
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CTA WhatsApp */}
            <a
              href={`https://wa.me/${data.whatsapp}?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background:'#25D366',
                color:'#000',
                padding:'18px 24px',
                borderRadius:3,
                marginBottom:12,
              }}
            >
              <svg viewBox="0 0 32 32" width="18" height="18" fill="currentColor">
                <path d="M16.004 3.2C8.924 3.2 3.2 8.924 3.2 16.004c0 2.264.592 4.472 1.716 6.424L3.2 28.8l6.56-1.72A12.76 12.76 0 0016.004 28.8c7.08 0 12.796-5.724 12.796-12.796S23.084 3.2 16.004 3.2z"/>
              </svg>
              Comprar via WhatsApp
            </a>

            {/* Info extras — clean */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="flex items-center gap-2 p-3" style={{background:'rgba(255,255,255,0.03)',borderRadius:3}}>
                <span className="material-symbols-outlined text-white/20 text-base">local_shipping</span>
                <div>
                  <p className="text-white/60 text-[11px] font-bold">Frete Grátis</p>
                  <p className="text-white/20 text-[10px]">Acima de R$ 299</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3" style={{background:'rgba(255,255,255,0.03)',borderRadius:3}}>
                <span className="material-symbols-outlined text-white/20 text-base">verified</span>
                <div>
                  <p className="text-white/60 text-[11px] font-bold">Original</p>
                  <p className="text-white/20 text-[10px]">100% Autêntico</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Relacionados ── */}
        {related.length > 0 && (
          <section className="px-5 md:px-10 mt-20 mb-16">
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-white/20 mb-6">Veja também</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {related.map(p => (
                <div
                  key={p.id || p._id}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/produto/${p.id || p._id}`)}
                >
                  {/* Sempre quadrado nos relacionados */}
                  <div className="w-full aspect-square overflow-hidden mb-2" style={{background:'#111',borderRadius:3}}>
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <p className="font-black text-[11px] uppercase tracking-tight text-white/80 truncate">{p.name}</p>
                  <p className="text-[11px] font-bold text-white/30 mt-0.5">
                    R$ {(p.promoPrice || p.price).toFixed(0)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Footer ── */}
        <footer className="w-full mt-12 px-5 md:px-10 py-12 flex flex-col items-center text-center"
          style={{borderTop:'1px solid rgba(255,255,255,0.04)'}}>
          <p className="font-black text-sm tracking-tighter text-white/60">PERIGOIMPORTZ</p>
          <p className="text-[11px] text-white/20 mt-2">{data.address}</p>
        </footer>
      </main>

      <WhatsAppButton />
    </div>
  );
}
