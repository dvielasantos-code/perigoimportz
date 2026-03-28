import { useProducts } from '../hooks/useProducts';
import { data } from '../data';

export default function MobileHome() {
  const { products, loading } = useProducts();
  const featured = products.filter(p => p.featured && p.status === 'ativo');

  return (
    <div className="bg-background text-on-background min-h-screen pb-12 font-body antialiased">
        {/* Header Mobile */}
        <header className="fixed top-0 w-full z-50 bg-[#000000] flex justify-between items-center px-6 py-5">
            <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-white text-2xl">menu</span>
                <h1 className="text-xl font-black tracking-tighter text-white uppercase">PERIGOIMPORTZ</h1>
            </div>
            <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-white text-2xl">search</span>
                <span className="material-symbols-outlined text-white text-2xl">shopping_bag</span>
            </div>
        </header>

        <main className="pt-24 px-4 overflow-x-hidden">
            {/* Hero Section */}
            <section className="mb-12">
                <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden group">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdso03s2h1V8LfKMtiajCAAMOq8t0GfkW8B4cTVQeQO29ytbjJfXzkkYkfIOwWCOMCyN_PV81XZfRNn6deAxRSdOrSRh8P3ZvBFwd5phxoW3KWlygiW6vJGPAaO8j2S1IvWzuKpbwF-UGFHIyUXuU6xzn3lsa9pQxb03y0T7rXzXgFH4K00IYnefqSNR-SIYCJMbdGHoE-_DzEZcmITZZwHfzHQRwA-4qFB6KRIBMNNdZTdwXrkozGQke_Q_FOZdSfHWE5FaCosrgd" 
                         alt="Hero" 
                         className="w-full h-full object-cover grayscale brightness-75 group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent flex flex-col justify-end p-8">
                        <span className="text-primary text-[10px] font-bold uppercase tracking-[.3em] mb-2 font-label">Coleção 2024</span>
                        <h2 className="text-4xl font-extrabold tracking-tighter leading-[0.9] mb-6 uppercase">ARQUIVOS<br/>OBSCUROS</h2>
                        <button className="bg-primary text-on-primary font-black py-4 px-10 rounded-full w-fit text-xs tracking-widest uppercase hover:opacity-90">Explorar</button>
                    </div>
                </div>
            </section>

            {/* Mobile Categories */}
            <section className="mb-16">
                <div className="flex items-baseline justify-between mb-6">
                   <h3 className="text-[10px] font-bold uppercase tracking-[.3em] text-outline px-2">Navegar por</h3>
                </div>
                <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar -mx-4 px-4 snap-x">
                    {data.categories.map(cat => (
                        <div key={cat.id} className="min-w-[120px] snap-center shrink-0 flex flex-col items-center justify-center p-6 bg-surface-container-low rounded-2xl aspect-square text-center active:bg-surface-container-high transition-colors">
                            <span className="material-symbols-outlined mb-2 text-primary text-2xl">{cat.icon}</span>
                            <span className="text-[10px] font-bold uppercase tracking-tight">{cat.name}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Featured Section */}
            <section className="mb-12">
                <div className="flex justify-between items-end mb-10 px-2">
                    <div>
                        <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">Destaques</h3>
                        <p className="text-outline text-xs mt-2 uppercase tracking-tight">Curadoria de Luxo</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest border-b border-primary pb-1">Ver todos</span>
                </div>

                <div className="grid grid-cols-1 gap-12">
                    {featured.map(p => (
                        <div key={p.id} className="group flex flex-col gap-4">
                            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-surface-container-low">
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover grayscale brightness-90 active:scale-105 transition-transform" />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-primary text-on-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Novo</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-start px-2">
                                <div className="flex flex-col gap-1">
                                    <h4 className="font-extrabold text-xl tracking-tighter uppercase">{p.name}</h4>
                                    <p className="text-outline text-xs font-label">Preço sob consulta</p>
                                </div>
                                <span className="font-black text-primary text-lg">R$ {p.price.toFixed(0)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>

        <footer className="bg-[#0e0e0e] w-full rounded-t-[3rem] mt-20 flex flex-col items-center px-10 py-16 text-center">
            <h2 className="font-black text-xl text-white mb-4 tracking-tighter">PERIGOIMPORTZ</h2>
            <p className="text-xs text-neutral-500 leading-relaxed mb-8">{data.address}</p>
            <a href={`https://wa.me/${data.whatsapp}`} className="bg-[#25D366] text-white font-bold py-4 px-8 rounded-full flex items-center gap-2 text-xs uppercase tracking-widest">
                Suporte WhatsApp
            </a>
        </footer>
    </div>
  );
}
