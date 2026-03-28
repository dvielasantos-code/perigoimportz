import { useState, useEffect } from 'react';
import { data } from '../data';

export default function SideMenu({ isOpen, onClose }) {
  // Trava o scroll do body quando o menu abre
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Overlay escuro */}
      <div 
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-[90] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Painel do Menu */}
      <div className={`fixed top-0 left-0 h-full w-[300px] max-w-[85vw] bg-[#0a0a0a] z-[100] transform transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Cabeçalho do Menu */}
        <div className="flex justify-between items-center px-8 py-7 border-b border-white/10">
          <h2 className="text-lg font-black tracking-tighter uppercase text-white">MENU</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Links de Navegação */}
        <nav className="px-8 py-8">
          <p className="text-[10px] font-bold uppercase tracking-[.3em] text-white/40 mb-6">Categorias</p>
          <ul className="space-y-1">
            {data.categories.map((cat, i) => (
              <li key={cat.id}>
                <a 
                  href={`#${cat.id}`}
                  onClick={onClose}
                  className="flex items-center gap-4 py-3 px-3 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all duration-200 group"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <span className="material-symbols-outlined text-xl text-white/50 group-hover:text-white transition-colors">{cat.icon}</span>
                  <span className="font-semibold text-sm tracking-tight">{cat.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Links Extra */}
        <div className="px-8 pt-4 border-t border-white/10">
          <ul className="space-y-1 pt-6">
            <li>
              <a href="#" className="flex items-center gap-4 py-3 px-3 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all">
                <span className="material-symbols-outlined text-xl text-white/50">search</span>
                <span className="font-semibold text-sm tracking-tight">Buscar</span>
              </a>
            </li>
            <li>
              <a href={`https://wa.me/${data.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 py-3 px-3 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all">
                <span className="material-symbols-outlined text-xl text-[#25D366]">chat</span>
                <span className="font-semibold text-sm tracking-tight">WhatsApp</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Rodapé do Menu */}
        <div className="absolute bottom-0 left-0 right-0 px-8 py-6 border-t border-white/5">
          <p className="text-[10px] text-white/30 tracking-tight">PERIGOIMPORTZ © 2024</p>
        </div>
      </div>
    </>
  );
}
