import { useProducts } from '../hooks/useProducts';
import { data } from '../data';

export default function DesktopHome() {
  const { products, loading } = useProducts();
  const featured = products.filter(p => p.featured && p.status === 'ativo');


  return (
    <div className="bg-background text-on-background min-h-screen pb-12">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#000000] flex justify-between items-center px-8 py-6 max-w-full">
        <div className="flex items-center gap-4 cursor-pointer">
          <span className="material-symbols-outlined text-white hover:opacity-80 transition-opacity duration-300 scale-95 active:scale-90 transition-transform">menu</span>
          <h1 className="text-2xl font-black tracking-tighter text-white font-['Manrope'] uppercase">PERIGOIMPORTZ</h1>
        </div>
        <div className="hidden md:flex flex-1 max-w-xl mx-12">
          <div className="relative w-full group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">search</span>
            <input type="text" placeholder="Buscar no arquivo..." className="w-full bg-[#0e0e0e] border-none rounded-full py-3 pl-12 pr-4 text-sm focus:ring-1 focus:ring-primary/20 placeholder-neutral-500 transition-all font-['Manrope']" />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <span className="material-symbols-outlined text-white cursor-pointer hover:opacity-80 transition-opacity duration-300 scale-95 active:scale-90">shopping_bag</span>
        </div>
      </header>

      <main className="pt-32">
        {/* Banner */}
        <section className="px-8 mb-20">
          <div className="relative w-full aspect-video md:aspect-[21/7] rounded-xl overflow-hidden group">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBR8WfMT6yGX8Qp6mJAVYg4ZjzaURdfQ-4zQd6vFb2NvbMfMnRBo7I0ns1KZWn9BM1gp0zL4yRZrecudGHQD6MmyPSkq_ZLz89njFzqG77SqTXrzWKJqNpgM2fSIOYakZes1Jfki-FpOEBZXCfcyhHm1AowjgI7Polcfjg1w-YDkXUMAGeu9WCJND6amT-tEGaLzglsjQ8NITY8zjItt-DvEiUJioZeOSfH37_TTJ80Z37s9Cng8j4kfiTUvX-SJDCPFNaDXIvmafg9" 
                 alt="Hero" 
                 className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-12">
              <span className="font-['Inter'] text-xs tracking-[0.2em] uppercase text-white/60 mb-4">Drop 01 // Arquivo 2024</span>
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 uppercase leading-[0.9]">ESSENCIAIS<br/>OBSCUROS</h2>
              <button className="bg-primary text-on-primary px-10 py-4 rounded-full font-bold text-sm tracking-widest uppercase hover:opacity-90 transition-all w-fit">Explorar Coleção</button>
            </div>
          </div>
        </section>

        {/* Categories Carousel */}
        <section className="px-8 mb-32">
          <h3 className="text-xs font-label uppercase tracking-[0.2em] text-outline mb-6">Categorias Principais</h3>
          <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar snap-x">
            {data.categories.map(cat => (
              <div key={cat.id} className="min-w-[300px] snap-center shrink-0 group relative aspect-video rounded-xl overflow-hidden bg-surface-container-low flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container transition-colors duration-500">
                <span className="material-symbols-outlined text-4xl mb-4 group-hover:scale-110 transition-transform duration-500 text-white">{cat.icon}</span>
                <span className="font-headline font-bold text-lg tracking-tight text-white">{cat.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="px-8 mb-32">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h3 className="text-4xl font-black tracking-tighter uppercase mb-2">Destaques</h3>
              <p className="text-neutral-500 font-body">Peças selecionadas pela nossa curadoria.</p>
            </div>
            <a href="#" className="text-sm font-bold underline underline-offset-8 tracking-tighter hover:text-white transition-colors">VER TUDO</a>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {featured.map(p => (
              <div key={p.id} className="group cursor-pointer">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-surface-container-low mb-6 transition-transform duration-500 hover:scale-[1.02]">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover grayscale brightness-90 group-hover:brightness-100 transition-all duration-700" />
                  {p.featured && (
                    <div className="absolute top-6 left-6">
                      <span className="bg-primary text-on-primary px-4 py-1 rounded-full font-label text-[10px] font-bold uppercase tracking-widest">Destaque</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-headline text-2xl font-black tracking-tighter uppercase">{p.name}</h3>
                    <span className="font-label text-xl font-bold text-primary">R$ {p.price.toFixed(2)}</span>
                  </div>
                  <p className="text-outline text-sm line-clamp-1">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0e0e0e] w-full rounded-t-[3rem] mt-20 flex flex-col justify-between items-center px-12 py-16">
        <span className="font-bold text-lg text-white uppercase tracking-tighter">PERIGOIMPORTZ</span>
        <p className="font-['Manrope'] text-sm leading-[1.6] tracking-tight text-neutral-400 mt-2">{data.address}</p>
      </footer>
    </div>
  );
}
