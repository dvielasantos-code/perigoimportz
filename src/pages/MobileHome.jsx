import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useSiteData } from '../hooks/useSiteData';
import SideMenu from '../components/SideMenu';
import WhatsAppButton from '../components/WhatsAppButton';
import AutoCarousel from '../components/AutoCarousel';

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

        {/* Banner mobile - altura reduzida: aspect-[3/4] → aspect-[4/3] */}
        <main className="pt-[68px] overflow-x-hidden">
            <section className="mb-10 px-3">
                <div className="relative w-full aspect-[3/4] rounded-b-3xl overflow-hidden group">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdso03s2h1V8LfKMtiajCAAMOq8t0GfkW8B4cTVQeQO29ytbjJfXzkkYkfIOwWCOMCyN_PV81XZfRNn6deAxRSdOrSRh8P3ZvBFwd5phxoW3KWlygiW6vJGPAaO8j2S1IvWzuKpbwF-UGFHIyUXuU6xzn3lsa9pQxb03y0T7rXzXgFH4K00IYnefqSNR-SIYCJMbdGHoE-_DzEZcmITZZwHfzHQRwA-4qFB6KRIBMNNdZTdwXrkozGQke_Q_FOZdSfHWE5FaCosrgd" 
                         alt="Hero" 
                         className="w-full h-full object-cover grayscale brightness-75 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent flex flex-col justify-end p-6">
                        <span className="text-white text-[10px] font-bold uppercase tracking-[.3em] mb-2 font-['Inter']">Coleção 2024</span>
                        <h2 className="text-3xl font-extrabold tracking-tighter leading-[0.9] mb-4 uppercase text-white">ARQUIVOS<br/>OBSCUROS</h2>
                        <button className="bg-primary text-on-primary font-black py-3 px-8 rounded-full w-fit text-[11px] tracking-widest uppercase">Explorar</button>
                    </div>
                </div>
            </section>

            {/* Categorias - carrossel com link */}
            <section className="mb-14 px-4">
                <div className="flex items-baseline justify-between mb-5">
                   <h3 className="text-[11px] font-bold uppercase tracking-[.3em] text-white/50 px-1 font-['Inter']">Navegar por</h3>
                </div>
                <AutoCarousel speed={0.3} gap={12}>
                    {data.categories.map(cat => (
                        <div 
                          key={cat.id} 
                          onClick={() => navigate(`/categoria/${cat.id}`)}
                          className="min-w-[100px] shrink-0 flex flex-col items-center justify-center p-4 bg-surface-container-low rounded-2xl aspect-square text-center active:bg-surface-container-high transition-colors cursor-pointer"
                        >
                            <span className="material-symbols-outlined mb-2 text-white text-xl">{cat.icon}</span>
                            <span className="text-[10px] font-bold uppercase tracking-tight text-white/90">{cat.name}</span>
                        </div>
                    ))}
                </AutoCarousel>
            </section>

            {/* Featured */}
            <section className="mb-12 px-4">
                <div className="flex justify-between items-end mb-8 px-1">
                    <div>
                        <h3 className="text-2xl font-black tracking-tighter uppercase leading-none text-white">Destaques</h3>
                        <p className="text-white/50 text-xs mt-2 uppercase tracking-tight font-bold">Curadoria de Luxo</p>
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-widest border-b border-white pb-1 text-white/70">Ver todos</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {featured.map(p => (
                        <div key={p.id || p._id} className="group flex flex-col gap-3 cursor-pointer" onClick={() => navigate(`/produto/${p.id || p._id}`)}>
                            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-surface-container-low">
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover grayscale brightness-90 active:scale-105 transition-transform" />
                                {p.featured && (
                                    <div className="absolute top-2 left-2">
                                        <span className="bg-primary text-on-primary text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">Novo</span>
                                    </div>
                                )}
                            </div>
                            <div className="px-0.5">
                                <h4 className="font-extrabold text-xs tracking-tighter uppercase text-white leading-tight">{p.name}</h4>
                                <span className="font-black text-white text-sm mt-1 block">R$ {p.price.toFixed(0)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>

        <footer className="bg-[#0e0e0e] w-full rounded-t-[3rem] mt-20 flex flex-col items-center px-10 py-16 text-center">
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
