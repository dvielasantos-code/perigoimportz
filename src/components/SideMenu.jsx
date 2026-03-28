import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { data } from '../data';

export default function SideMenu({ isOpen, onClose }) {
  const [expanded, setExpanded] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setExpanded(null);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleCategoryClick = (cat) => {
    if (cat.subcategories) {
      setExpanded(expanded === cat.id ? null : cat.id);
    } else {
      navigate(`/categoria/${cat.id}`);
      onClose();
    }
  };

  const handleSubClick = (parentId, subId) => {
    navigate(`/categoria/${parentId}/${subId}`);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-[90] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Painel */}
      <div className={`fixed top-0 left-0 h-full w-[320px] max-w-[85vw] bg-[#0a0a0a] z-[100] transform transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex justify-between items-center px-7 py-6 border-b border-white/10 shrink-0">
          <h2 className="text-lg font-black tracking-tighter uppercase text-white">MENU</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Navegação scrollável */}
        <nav className="flex-1 overflow-y-auto py-6 px-5">
          <p className="text-[10px] font-bold uppercase tracking-[.3em] text-white/30 mb-4 px-3">Categorias</p>
          
          <ul className="space-y-0.5">
            {data.menuCategories.map((cat) => (
              <li key={cat.id}>
                {/* Item principal */}
                <button 
                  onClick={() => handleCategoryClick(cat)}
                  className="w-full flex items-center justify-between py-3 px-3 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-xl text-white/40 group-hover:text-white transition-colors">{cat.icon}</span>
                    <span className="font-semibold text-sm tracking-tight">{cat.name}</span>
                  </div>
                  {cat.subcategories && (
                    <span className={`material-symbols-outlined text-lg text-white/30 transition-transform duration-300 ${expanded === cat.id ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  )}
                </button>

                {/* Subcategorias (accordion) */}
                {cat.subcategories && (
                  <div className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${expanded === cat.id ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <ul className="pl-6 py-1 space-y-0.5">
                      {/* Ver todos dessa categoria */}
                      <li>
                        <button 
                          onClick={() => { navigate(`/categoria/${cat.id}`); onClose(); }}
                          className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-wider"
                        >
                          <span className="material-symbols-outlined text-sm text-white/30">grid_view</span>
                          Ver todos
                        </button>
                      </li>
                      {cat.subcategories.map(sub => (
                        <li key={sub.id}>
                          <button 
                            onClick={() => handleSubClick(cat.id, sub.id)}
                            className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm"
                          >
                            <span className="w-1 h-1 rounded-full bg-white/20 shrink-0"></span>
                            {sub.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer do Menu */}
        <div className="shrink-0 px-5 py-5 border-t border-white/5">
          <a 
            href={`https://wa.me/${data.whatsapp}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-3 py-3 px-3 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all"
          >
            <span className="material-symbols-outlined text-xl text-[#25D366]">chat</span>
            <span className="font-semibold text-sm tracking-tight">WhatsApp</span>
          </a>
          <p className="text-[10px] text-white/20 tracking-tight mt-4 px-3">PERIGOIMPORTZ © 2024</p>
        </div>
      </div>
    </>
  );
}
