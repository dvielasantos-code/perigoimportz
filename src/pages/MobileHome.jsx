import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useSiteData } from '../hooks/useSiteData';
import SideMenu from '../components/SideMenu';
import WhatsAppButton from '../components/WhatsAppButton';
import AutoCarousel from '../components/AutoCarousel';
import { CustomIcon } from '../components/CustomIcons';

export default function MobileHome() {
  const { products } = useProducts();
  const { data } = useSiteData();
  const featured = products.filter(p => p.featured && p.status === 'ativo');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-background min-h-screen pb-12 font-body antialiased">
        <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

        {/* Header Mobile */}
        <header className="fixed top-0 w-full z-50 bg-[#000000] flex justify-between items-center px-6 py-5">
            <div className="flex items-center gap-3" onClick={() => setMenuOpen(true)}>
                <span className="material-symbols-outlined text-white text-2xl">menu</span>
                <h1 className="text-xl font-black tracking-tighter text-white uppercase">PERIGOIMPORTZ</h1>
            </div>
            <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-white text-2xl">search</span>
            </div>
        </header>

        {/* Banner mobile - Hero dinâmico */}
        <main className="pt-[68px] overflow-x-hidden">
            {/* Se não houver sessões definidas no admin, mostramos uma ordem padrão fallback */}
            {(!data.sections || data.sections.length === 0) ? (
              <>
                 <section className="mb-10 px-0">
                    <div className="relative w-full aspect-[4/5] rounded-b-sm overflow-hidden group bg-neutral-900 shadow-2xl">
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdso03s2h1V8LfKMtiajCAAMOq8t0GfkW8B4cTVQeQO29ytbjJfXzkkYkfIOwWCOMCyN_PV81XZfRNn6deAxRSdOrSRh8P3ZvBFwd5phxoW3KWlygiW6vJGPAaO8j2S1IvWzuKpbwF-UGFHIyUXuU6xzn3lsa9pQxb03y0T7rXzXgFH4K00IYnefqSNR-SIYCJMbdGHoE-_DzEZcmITZZwHfzHQRwA-4qFB6KRIBMNNdZTdwXrkozGQke_Q_FOZdSfHWE5FaCosrgd" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent p-10 flex flex-col justify-end">
                           <span className="text-white/40 text-[9px] font-bold tracking-[.4em] mb-2 uppercase">Arquivo 2024</span>
                           <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-[0.8] mb-6">ESSENCIAIS<br/>URBANOS</h2>
                           <button className="bg-neon-green text-black font-black py-4 px-10 rounded-sm w-fit text-[11px] uppercase tracking-widest shadow-2xl shadow-neon-green/30">Explorar</button>
                        </div>
                    </div>
                </section>
                <div className="px-5 py-4 text-center">
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Acesse o Admin Studio para personalizar este rascunho</p>
                </div>
              </>
            ) : (
              data.sections.map((sec, idx) => {
                if(sec.type === 'HERO') return (
                  <section key={sec.id} className="mb-10 px-0">
                      <div className="relative w-full aspect-[4/5] rounded-b-sm overflow-hidden group bg-neutral-900 shadow-2xl">
                          {data.collections?.[0] ? (
                            <>
                              <img src={data.collections[0].image} 
                                   alt={data.collections[0].title} 
                                   className="w-full h-full object-cover transition-transform duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-t from-background via-black/10 to-transparent flex flex-col justify-end p-8">
                                  <span className="text-white/60 text-[10px] font-bold uppercase tracking-[.4em] mb-2 font-['Inter']">{data.collections[0].subtitle || 'Lançamento'}</span>
                                  <h2 className="text-4xl font-black tracking-tighter leading-[0.8] mb-6 uppercase text-white">{data.collections[0].title}</h2>
                                  <button onClick={() => navigate(data.collections[0].link || '#')} className="bg-neon-green text-black font-black py-4 px-10 rounded-sm w-fit text-[11px] tracking-widest uppercase shadow-xl shadow-neon-green/30">Explorar</button>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center justify-center h-full bg-[#111] text-white/20 uppercase font-black text-xs">Crie uma Coleção no Admin</div>
                          )}
                      </div>
                  </section>
                );

                if(sec.type === 'CATEGORIES') return (
                    <section key={sec.id} className="mb-14 px-4">
                        <div className="flex items-baseline justify-between mb-5">
                           <h3 className="text-[11px] font-bold uppercase tracking-[.3em] text-white/50 px-1 font-['Inter']">Navegar por</h3>
                        </div>
                        <AutoCarousel speed={0.3} gap={12}>
                            {(data.categories || []).map(cat => (
                                <div 
                                  key={cat.id} 
                                  onClick={() => navigate(`/categoria/${cat.id}`)}
                                  className="min-w-[100px] shrink-0 flex flex-col items-center justify-center p-4 bg-surface-container-low rounded-lg aspect-square text-center active:bg-surface-container-high transition-colors cursor-pointer"
                                >
                                    <CustomIcon name={cat.icon} className="mb-2 text-white w-6 h-6" />
                                    <span className="text-[10px] font-bold uppercase tracking-tight text-white/90">{cat.name}</span>
                                </div>
                            ))}
                        </AutoCarousel>
                    </section>
                );

                if(sec.type === 'COLLECTIONS_LIST' && data.collections?.length > 1) return (
                  <section key={sec.id} className="mb-14 px-4">
                      <div className="flex items-baseline justify-between mb-5">
                         <h3 className="text-[11px] font-bold uppercase tracking-[.3em] text-white/50 px-1 font-['Inter']">Explorar Coleções</h3>
                      </div>
                      <AutoCarousel speed={0.2} gap={12}>
                          {data.collections.slice(1).map(col => (
                              <div 
                                key={col.id} 
                                onClick={() => navigate(col.link || '#')}
                                className="min-w-[280px] h-[200px] shrink-0 relative rounded-sm overflow-hidden bg-neutral-900 cursor-pointer group"
                              >
                                  <img src={col.image} className="w-full h-full object-cover transition-transform group-active:scale-105" />
                                  <div className="absolute inset-0 bg-black/40 p-4 flex flex-col justify-end">
                                      <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest">{col.subtitle}</p>
                                      <h4 className="text-xl font-black text-white uppercase tracking-tighter">{col.title}</h4>
                                  </div>
                              </div>
                          ))}
                      </AutoCarousel>
                  </section>
                );

                if(sec.type === 'PRODUCTS_GRID') return (
                  <section key={sec.id} className="mb-12 px-4 mt-8">
                      <div className="flex justify-between items-end mb-8 px-1">
                          <div>
                              <h3 className="text-2xl font-black tracking-tighter uppercase leading-none text-white">Destaques</h3>
                              <p className="text-white/50 text-xs mt-2 uppercase tracking-tight font-bold">Curadoria de Luxo</p>
                          </div>
                          <span onClick={() => navigate('/categoria/todos')} className="text-[11px] font-bold uppercase tracking-widest border-b border-white pb-1 text-white/70">Ver todos</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                          {featured.map(p => (
                              <div key={p.id || p._id} className="group flex flex-col gap-3 cursor-pointer" onClick={() => navigate(`/produto/${p.id || p._id}`)}>
                                  <div className="relative aspect-square rounded-sm overflow-hidden bg-surface-container-low shadow-xl">
                                      <img src={p.image} alt={p.name} className="w-full h-full object-cover active:scale-105 transition-transform" />
                                      {p.featured && (
                                          <div className="absolute top-2 left-2">
                                              <span className="bg-neon-green text-black text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg shadow-neon-green/20">Destaque</span>
                                          </div>
                                      )}
                                  </div>
                                  <div className="px-0.5">
                                      <h4 className="font-extrabold text-xs tracking-tighter uppercase text-white leading-tight">{p.name}</h4>
                                      <div className="flex items-center gap-2 mt-1">
                                          {p.promoPrice ? (
                                              <>
                                                  <span className="font-black text-white text-[13px]">R$ {p.promoPrice.toFixed(0)}</span>
                                                  <span className="font-bold text-white/30 text-[10px] line-through">R$ {p.price.toFixed(0)}</span>
                                              </>
                                          ) : (
                                              <span className="font-black text-white text-sm">R$ {p.price.toFixed(0)}</span>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </section>
                );
                return null;
              })
            )}
        </main>

        <footer className="bg-[#0e0e0e] w-full rounded-t-xl mt-20 flex flex-col items-center px-10 py-16 text-center">
            <h2 className="font-black text-xl text-white mb-4 tracking-tighter">PERIGOIMPORTZ</h2>
            <p className="text-sm text-white/40 leading-relaxed mb-8 font-medium">{data.address}</p>
            <a href={`https://wa.me/${data.whatsapp}`} className="bg-[#25D366] text-white font-bold py-4 px-8 rounded-full flex items-center gap-2 text-xs uppercase tracking-widest">
                Suporte WhatsApp
            </a>
        </footer>

        <WhatsAppButton />
    </div>
  );
}
