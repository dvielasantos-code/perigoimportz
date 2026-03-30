import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';



const ICONS = [
  { id: 'checkroom', label: 'Camiseta'  },
  { id: 'apparel', label: 'Peça'    },
  { id: 'straighten', label: 'Calça'     },
  { id: 'sprint', label: 'Tênis'     },
  { id: 'school', label: 'Boné'      },
  { id: 'diamond', label: 'Acess.'    },
  { id: 'watch', label: 'Relógio'   },
  { id: 'eyeglasses', label: 'Óculos'    },
  { id: 'shopping_bag', label: 'Bolsa'     },
  { id: 'styler', label: 'Camisa'    },
  { id: 'dry_cleaning', label: 'Regata'    },
  { id: 'laundry', label: 'Bermuda'   },
  { id: 'category', label: 'Diversos'     },
];

const G = '#22c55e';

// Funcao de renderizar icone, fallback para pacote
const ri = icon => <span className="material-symbols-outlined">{icon || 'category'}</span>;

// ─── Componentes de Categoria Draggável ──────────────────────────────────────
function CategoryRow({ cat, onToggle, onRemove, isChild, children = [], isDraggingParent, isSelected, onSelect, selectedCats }) {
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({ id: cat.id });
  const { setNodeRef: setDropSortRef, isOver } = useDroppable({ id: cat.id });
  const { setNodeRef: setDropNestRef, isOver: isNestOver } = useDroppable({ id: `drop:${cat.id}` });

  return (
    <div
      ref={setDropSortRef}
      className={"flex flex-col gap-2 transition-all w-full"}
      style={{
        opacity: isDragging ? 0.3 : 1,
        borderTop: isOver && !isChild ? '2px solid #22c55e' : 'none',
      }}
    >
      <div 
        className="flex items-center gap-3 p-3 rounded-xl transition-all"
        style={{
          background: isChild ? '#141414' : '#1a1a1a',
          border: `1px solid ${isNestOver ? '#22c55e' : '#2a2a2a'}`,
          marginLeft: isChild ? '2rem' : '0',
          position: 'relative'
        }}
      >
        <input type="checkbox" checked={isSelected} onChange={() => onSelect(cat.id)} className="w-5 h-5 accent-red-500 mr-1 cursor-pointer" />
        <div ref={setDragRef} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing text-[#555] hover:text-white px-2">
          <span className="material-symbols-outlined text-xl">drag_indicator</span>
        </div>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#222] text-xl shrink-0" style={{ opacity: cat.active ? 1 : 0.4 }}>
          {ri(cat.icon)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-sm uppercase tracking-tighter text-white" style={{ opacity: cat.active ? 1 : 0.4 }}>{cat.name}</p>
          {!isChild && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#555]">
              {children.length} subcategorias
            </p>
          )}
        </div>
        
        <label className="relative inline-flex items-center cursor-pointer mr-3" title={cat.active ? "Desativar" : "Ativar"}>
          <input type="checkbox" className="sr-only peer" checked={cat.active} onChange={() => onToggle(cat)} />
          <div className="w-9 h-5 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
        </label>
        
        <button onClick={() => onRemove(cat.id)} className="text-[#555] hover:text-red-500 transition-colors px-2">
          <span className="material-symbols-outlined text-lg">delete</span>
        </button>
      </div>

      {!isChild && children && children.length > 0 && (
         <div className="flex flex-col gap-2 mt-1 mb-2">
           {children.map(sub => (
             <CategoryRow key={sub.id} cat={sub} onToggle={onToggle} onRemove={onRemove} isChild selectedCats={selectedCats} isSelected={selectedCats.has(sub.id)} onSelect={onSelect} />
           ))}
         </div>
      )}

      {!isChild && !isDraggingParent && (
        <div 
          ref={setDropNestRef} 
          className="ml-8 mb-3 p-3 rounded-xl border border-dashed transition-all flex items-center justify-center gap-2"
          style={{
            background: isNestOver ? 'rgba(34,197,94,0.05)' : 'transparent',
            borderColor: isNestOver ? '#22c55e' : '#2a2a2a',
            color: isNestOver ? '#22c55e' : '#555'
          }}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {isNestOver ? 'Soltar aqui para aninhar' : 'Arraste para cá para aninhar em ' + cat.name}
          </span>
        </div>
      )}
    </div>
  );
}

function DragGhost({ cat }) {
  if (!cat) return null;
  return (
    <div className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl scale-105"
      style={{ background: '#22c55e', color: '#000', border: '1px solid #22c55e' }}>
      <span className="text-2xl leading-none flex items-center justify-center">{ri(cat.icon)}</span>
      <span className="text-xs font-black uppercase tracking-wide">{cat.name}</span>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function AdminPage() {
  const [user, setUser]           = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // evita flash login
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [loginErr, setLoginErr]   = useState('');
  const [activeTab, setActiveTab] = useState('produtos');

  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners,    setBanners]    = useState([]);
  const [settings,   setSettings]   = useState({ whatsapp: '', address: '' });

  const [loading,    setLoading]    = useState(false);
  const [file,       setFile]       = useState(null);
  const [files,      setFiles]      = useState([]);
  const [popMsg,     setPopMsg]     = useState('');

  const [newProduct, setNewProduct] = useState({
    name:'', price:'', promoPrice:'', category:'', brand:'', description:'', status:'ativo', featured:true,
  });
  const [newCat, setNewCat]         = useState({ name:'', icon:'checkroom', parentId:null });
  const [newBanner, setNewBanner]   = useState({ title:'', link:'' });
  const [selectedCats, setSelectedCats] = useState(new Set());

  const toggleSelectCat = (id) => {
    const next = new Set(selectedCats);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCats(next);
  };

  const selectAllCats = () => {
    if (selectedCats.size === categories.length) setSelectedCats(new Set());
    else setSelectedCats(new Set(categories.map(c => c.id)));
  };

  const deleteSelectedCats = async () => {
    if (!window.confirm(`Excluir ${selectedCats.size} categorias selecionadas de uma vez?`)) return;
    setLoading(true);
    // Para simplificar e evitar problemas de assincronicidade pesada no cliente, deletamos em lote (batch-like loop)
    for (const id of Array.from(selectedCats)) {
      await deleteDoc(doc(db, 'categories', id));
    }
    setSelectedCats(new Set());
    await loadAll();
    setLoading(false);
  };


  // dnd-kit
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [activeId, setActiveId] = useState(null);
  const { setNodeRef: setRootDropRef } = useDroppable({ id: 'drop:__root__' });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setAuthLoading(false);
      if (u) loadAll();
    });
    return () => unsub();
  }, []);

  const loadAll = async () => {
    const [ps, cs, bs, ss] = await Promise.all([
      getDocs(collection(db, 'products')),
      getDocs(collection(db, 'categories')),
      getDocs(collection(db, 'banners')),
      getDocs(collection(db, 'settings')),
    ]);
    setProducts(ps.docs.map(d => ({ id: d.id, ...d.data() })));
    const allCats = cs.docs.map(d => ({ id: d.id, ...d.data() }));
    // Ordenar categorias por campo 'order'
    allCats.sort((a,b) => (a.order || 0) - (b.order || 0));
    setCategories(allCats);
    setBanners(bs.docs.map(d => ({ id: d.id, ...d.data() })));
    ss.docs.forEach(d => { if (d.id === 'global') setSettings(d.data()); });
  };

  const remove = async (col, id) => {
    if (!window.confirm('Excluir?')) return;
    await deleteDoc(doc(db, col, id));
    loadAll();
  };

  const uploadCloud = async f => {
    const fd = new FormData();
    fd.append('file', f);
    fd.append('upload_preset', 'produtos_perigo');
    const r = await fetch('https://api.cloudinary.com/v1_1/djua9ijum/image/upload', { method:'POST', body:fd });
    const j = await r.json();
    return j.secure_url || null;
  };

  // ─── Criar categoria manual ────────────────────────────────────────────────
  const addCat = async e => {
    e.preventDefault();
    if (!newCat.name.trim()) return;
    setLoading(true);
    const id = newCat.name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    await setDoc(doc(db, 'categories', id), {
      id, name: newCat.name, icon: newCat.icon, parentId: newCat.parentId || null, active: true,
      order: categories.length,
    });
    setNewCat({ name:'', icon:'apparel', parentId:null });
    await loadAll();
    setLoading(false);
  };

  const toggleActive = async cat => {
    await setDoc(doc(db, 'categories', cat.id), { ...cat, active: !cat.active });
    loadAll();
  };

  // ─── Drag handlers ─────────────────────────────────────────────────────────
  const handleDragStart = ({ active }) => setActiveId(active.id);

  const handleDragEnd = async ({ active, over }) => {
    setActiveId(null);
    if (!over) return;

    const draggedId = active.id;
    const overId    = over.id;

    const draggedCat = categories.find(c => c.id === draggedId);
    if (!draggedCat) return;

    // Se soltou na zona raiz (tirar de dentro)
    if (overId === 'drop:__root__') {
       if (draggedCat.parentId === null) return;
       await setDoc(doc(db, 'categories', draggedId), { ...draggedCat, parentId: null });
       await loadAll();
       return;
    }

    // Se soltou em uma zona de "Drop (Aninhar)": Muda o Parent
    if (String(overId).startsWith('drop:')) {
      const targetParentId = overId.replace('drop:', '');
      if (draggedCat.parentId === targetParentId) return;

      if (targetParentId === draggedId) return; // Anti-loop
      const subIds = categories.filter(c => c.parentId === draggedId).map(c => c.id);
      if (subIds.includes(targetParentId)) return; // Anti-loop (pai não pode aninhar em filho)

      await setDoc(doc(db, 'categories', draggedId), { ...draggedCat, parentId: targetParentId });
      await loadAll();
      return;
    }

    // Se soltou em cima de outra categoria: Reordenar e adotar o mesmo parent
    const overCat = categories.find(c => c.id === overId);
    if (overCat && overCat.id !== draggedId) {
      const sameLevel = categories.filter(c => c.parentId === overCat.parentId);
      let oldIndex = sameLevel.findIndex(c => c.id === draggedId);
      
      // Se ele veio de outro parent, adiciona na nova lista do parent
      if (oldIndex === -1) {
         oldIndex = sameLevel.length; // coloca no final como fallback
         sameLevel.push(draggedCat);
      }
      
      const newIndex = sameLevel.findIndex(c => c.id === overId);

      if (newIndex !== -1) {
        sameLevel.splice(oldIndex, 1);
        sameLevel.splice(newIndex, 0, draggedCat);

        // Atualizar ordens sequenciais no Firestore (incluindo a possível mudança de parentId)
        for (let i = 0; i < sameLevel.length; i++) {
          await setDoc(doc(db, 'categories', sameLevel[i].id), { 
            ...sameLevel[i], 
            parentId: overCat.parentId,
            order: i 
          });
        }
        await loadAll();
      }
    }
  };

  // ─── Produto ───────────────────────────────────────────────────────────────
  const addProduct = async e => {
    e.preventDefault(); setLoading(true);
    let urls = [];
    for (const f of files) { const u = await uploadCloud(f); if (u) urls.push(u); }
    if (!urls.length) { alert('Adicione pelo menos 1 foto.'); setLoading(false); return; }
    await addDoc(collection(db, 'products'), {
      ...newProduct,
      price:      Number(newProduct.price),
      promoPrice: newProduct.promoPrice ? Number(newProduct.promoPrice) : null,
      image: urls[0], images: urls,
    });
    setNewProduct({ name:'', price:'', promoPrice:'', category:'', brand:'', description:'', status:'ativo', featured:true });
    setFiles([]);
    await loadAll(); setLoading(false);
  };

  const addBanner = async e => {
    e.preventDefault(); setLoading(true);
    const url = file ? await uploadCloud(file) : '';
    await addDoc(collection(db, 'banners'), { ...newBanner, image:url, active:true });
    setNewBanner({ title:'', link:'' }); setFile(null);
    await loadAll(); setLoading(false);
  };

  const saveSettings = async e => {
    e.preventDefault(); setLoading(true);
    await setDoc(doc(db,'settings','global'), settings);
    alert('Salvo!'); setLoading(false);
  };

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const parentCats  = categories.filter(c => !c.parentId);
  const childrenOf  = pid => categories.filter(c => c.parentId === pid);
  const orphans     = categories.filter(c => c.parentId && !parentCats.find(p => p.id === c.parentId));
  const activeCat   = categories.find(c => c.id === activeId);

  // ─── Login ─────────────────────────────────────────────────────────────────
  // Aguarda Firebase restaurar sessão (evita flash do login)
  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{background:G}}>
          <span className="text-black font-black text-sm">PI</span>
        </div>
        <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="w-full max-w-sm p-8 rounded-2xl bg-[#111] border border-[#222]">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:G}}>
            <span className="text-black font-black text-sm">PI</span>
          </div>
          <div>
            <p className="font-black text-sm uppercase tracking-tighter text-white">Admin Studio</p>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{color:G}}>Perigoimportz</p>
          </div>
        </div>
        <form onSubmit={async e=>{e.preventDefault();try{await signInWithEmailAndPassword(auth,email,password);}catch{setLoginErr('Credenciais inválidas');}}} className="flex flex-col gap-4">
          {loginErr && <p className="text-red-500 text-xs font-bold text-center">{loginErr}</p>}
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="p-3 rounded-xl text-sm text-white outline-none bg-[#1a1a1a] border border-[#333]"/>
          <input type="password" placeholder="Senha" value={password} onChange={e=>setPassword(e.target.value)} className="p-3 rounded-xl text-sm text-white outline-none bg-[#1a1a1a] border border-[#333]"/>
          <button type="submit" className="py-3 rounded-xl text-black font-black text-sm uppercase tracking-widest" style={{background:G}}>Entrar</button>
        </form>
      </div>
    </div>
  );

  const inp = 'p-3 rounded-xl text-sm text-white outline-none w-full bg-[#1a1a1a] border border-[#2a2a2a] focus:border-green-500 transition-colors';
  const tabs = [
    {id:'produtos',      label:'Produtos',      icon:'apparel'},
    {id:'categorias',    label:'Categorias',    icon:'category'},
    {id:'banners',       label:'Banners',       icon:'photo_library'},
    {id:'configuracoes', label:'Config',        icon:'settings'},
  ];

  return (
    <div className="min-h-screen flex text-white bg-[#0a0a0a]">

      {/* Sidebar */}
      <aside className="w-52 shrink-0 flex flex-col bg-[#111] border-r border-[#1e1e1e]">
        <div className="p-5 flex items-center gap-3 border-b border-[#1e1e1e]">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{background:G}}>
            <span className="text-black font-black text-xs">PI</span>
          </div>
          <div>
            <p className="font-black text-xs uppercase tracking-tighter">Studio</p>
            <p className="text-[9px] font-bold uppercase tracking-widest" style={{color:G}}>Admin</p>
          </div>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider text-left transition-all"
              style={activeTab===t.id?{background:G,color:'#000'}:{color:'rgba(255,255,255,0.4)'}}>
              <span className="material-symbols-outlined text-base">{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-[#1e1e1e]">
          <button onClick={()=>signOut(auth)} className="w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 transition-all">
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-y-auto" style={{maxHeight:'100vh'}}>
        <div className="mb-6">
          <h2 className="text-2xl font-black uppercase tracking-tighter capitalize">{activeTab}</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{color:G}}>Perigoimportz · Control Panel</p>
        </div>

        {/* ══ PRODUTOS ══ */}
        {activeTab==='produtos' && (
          <div className="grid grid-cols-5 gap-6">
            <div className="col-span-3 p-6 rounded-2xl bg-[#111] border border-[#222] max-h-[85vh] overflow-y-auto">
              <h3 className="font-black uppercase tracking-tighter text-sm mb-5">Catálogo ({products.length})</h3>
              <div className="flex flex-col gap-2">
                {products.length===0 && (
                  <div className="py-20 text-center">
                    <span className="material-symbols-outlined text-5xl text-[#2a2a2a]">inventory_2</span>
                    <p className="text-xs font-bold uppercase tracking-widest mt-3 text-[#333]">Catálogo vazio</p>
                  </div>
                )}
                {products.map(p=>(
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] group hover:border-green-500/30 transition-all">
                    <div className="w-14 h-[72px] rounded-lg overflow-hidden shrink-0 bg-black">
                      {p.image&&<img src={p.image} className="w-full h-full object-cover"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-xs uppercase tracking-tight truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {p.promoPrice
                          ?<><span style={{color:G}} className="font-black text-[11px]">R$ {p.promoPrice}</span><span className="line-through text-[10px] text-[#444]">R$ {p.price}</span></>
                          :<span className="font-bold text-[11px] text-[#aaa]">R$ {p.price}</span>}
                      </div>
                      <p className="text-[9px] font-bold uppercase tracking-widest mt-1 text-[#444]">{p.category}</p>
                    </div>
                    <button onClick={()=>remove('products',p.id)} className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-2 p-6 rounded-2xl bg-[#111] border border-[#222]">
              <h3 className="font-black uppercase tracking-tighter text-sm mb-5">Adicionar Produto</h3>
              <form onSubmit={addProduct} className="flex flex-col gap-3">
                <input required placeholder="Nome do Produto" value={newProduct.name} onChange={e=>setNewProduct({...newProduct,name:e.target.value})} className={inp}/>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{color:G}}>Preço</label>
                    <input required type="number" step="0.01" placeholder="199.90" value={newProduct.price} onChange={e=>setNewProduct({...newProduct,price:e.target.value})} className={inp}/>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest block mb-1 text-red-400">Promo</label>
                    <input type="number" step="0.01" placeholder="149.90" value={newProduct.promoPrice} onChange={e=>setNewProduct({...newProduct,promoPrice:e.target.value})} className={inp}/>
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{color:G}}>Categoria</label>
                  <select required value={newProduct.category} onChange={e=>setNewProduct({...newProduct,category:e.target.value})} className={inp}>
                    <option value="">Selecione...</option>
                    {parentCats.map(p=>(
                      <optgroup key={p.id} label={p.name}>
                        <option value={p.id}>{p.name} (geral)</option>
                        {childrenOf(p.id).map(c=><option key={c.id} value={c.id}>↳ {c.name}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <input placeholder="Marca" value={newProduct.brand} onChange={e=>setNewProduct({...newProduct,brand:e.target.value})} className={inp}/>
                <textarea required rows={3} placeholder="Descrição..." value={newProduct.description} onChange={e=>setNewProduct({...newProduct,description:e.target.value})} className={`${inp} resize-none`}/>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newProduct.featured} onChange={e=>setNewProduct({...newProduct,featured:e.target.checked})} className="w-4 h-4 accent-green-500"/>
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{color:G}}>Destaque</span>
                </label>
                <div className="relative p-5 rounded-xl flex flex-col items-center gap-2 cursor-pointer transition-all"
                  style={{border:`2px dashed ${files.length?G:'#2a2a2a'}`,background:'#141414'}}>
                  <span className="material-symbols-outlined text-2xl text-[#333]">upload</span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#444]">Até 7 fotos</p>
                  {files.length>0&&<p className="text-[10px] font-bold" style={{color:G}}>{files.length} foto(s)</p>}
                  <input type="file" multiple accept="image/*" onChange={e=>setFiles(Array.from(e.target.files).slice(0,7))} className="absolute inset-0 opacity-0 cursor-pointer"/>
                </div>
                <button type="submit" disabled={loading}
                  className="py-4 rounded-xl text-black font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 mt-2 hover:opacity-90 transition-opacity"
                  style={{background:loading?'#333':G,color:'#000'}}>
                  {loading?<><span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"/>Enviando...</>:'Publicar no Catálogo'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ══ CATEGORIAS (com DND real) ══ */}
        {activeTab==='categorias' && (
          <div className="flex flex-col gap-5">

            <div className="p-6 rounded-2xl bg-[#111] border border-[#222]">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-black uppercase tracking-tighter text-sm">Nova Categoria</h3>
              </div>
              <form onSubmit={addCat} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{color:G}}>Nome</label>
                  <input required placeholder="Ex: Regatas" value={newCat.name} onChange={e=>setNewCat({...newCat,name:e.target.value})} className={inp}/>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{color:G}}>Categoria Pai</label>
                  <select value={newCat.parentId||''} onChange={e=>setNewCat({...newCat,parentId:e.target.value||null})} className={inp}>
                    <option value="">Nenhuma (Principal)</option>
                    {parentCats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{color:G}}>Ícone</label>
                  <div className="flex flex-wrap gap-1 p-2 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a]" style={{maxHeight:80,overflowY:'auto'}}>
                    {ICONS.map(ic=>(
                      <button key={ic.id} type="button" title={ic.label}
                        onClick={()=>setNewCat({...newCat,icon:ic.id})}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-lg transition-all text-white"
                        style={newCat.icon===ic.id?{background:'#22c55e',color:'#000',transform:'scale(1.15)'}:{background:'#252525'}}>
                        <span className="material-symbols-outlined text-[18px]">{ic.id}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={loading} className="rounded-xl text-black font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-opacity" style={{background:G,height:46}}>
                  Criar
                </button>
              </form>
            </div>

            {categories.length > 0 && (
              <div className="flex items-center gap-3 px-5 py-3 rounded-xl" style={{background:'#111',border:'1px solid #222'}}>
                <span className="material-symbols-outlined text-base text-[#555]">info</span>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#888]">
                  Arraste uma categoria <strong className="text-white">sobre outra</strong> para reordenar. Arraste para o tracejado dela para <strong className="text-green-500">aninhar</strong>. Arraste para o topo para <strong className="text-red-400">tirar de dentro</strong>. 
                </p>
                <span className="ml-auto text-[10px] font-bold text-[#444]">
                  {categories.length} total · {parentCats.length} pais · {categories.length-parentCats.length} subs
                </span>
              </div>
            )}

            {categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 rounded-2xl border-2 border-dashed border-[#222]">
                <span className="material-symbols-outlined text-5xl text-[#2a2a2a]">category</span>
                <p className="text-xs font-bold uppercase tracking-widest mt-4 text-[#333]">Nenhuma categoria</p>
                <p className="text-[10px] mt-2 text-[#2a2a2a]">Crie uma acima para começar</p>
              </div>
            ) : (
              <>
              <div className="flex items-center justify-between mb-4 p-4 rounded-xl" style={{background: selectedCats.size > 0 ? 'rgba(239,68,68,0.1)' : '#111', border: `1px solid ${selectedCats.size > 0 ? '#ef4444' : '#222'}`}}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={categories.length > 0 && selectedCats.size === categories.length} onChange={selectAllCats} className="w-5 h-5 accent-red-500" />
                  <span className="text-xs font-black uppercase tracking-widest text-white">Selecionar Tudo</span>
                </label>
                {selectedCats.size > 0 && (
                  <button onClick={deleteSelectedCats} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">
                    <span className="material-symbols-outlined text-sm">delete_sweep</span>
                    Excluir {selectedCats.size}
                  </button>
                )}
              </div>
              <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                {activeId && (
                  <div className="mb-2">
                    <div ref={setRootDropRef}
                      className="p-4 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-2"
                      style={{
                         background: 'rgba(34,197,94,0.05)',
                         borderColor: G,
                         color: G
                      }}>
                      <span className="material-symbols-outlined text-lg">vertical_align_top</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">Solte aqui para tornar Root (tirar de dentro)</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1 w-full bg-[#111] border border-[#222] p-4 rounded-2xl">
                  {parentCats.map(parent => (
                    <CategoryRow
                      key={parent.id}
                      cat={parent}
                      children={childrenOf(parent.id)}
                      onToggle={toggleActive}
                      onRemove={id => remove('categories', id)}
                      isChild={false}
                      isDraggingParent={activeId === parent.id}
                      selectedCats={selectedCats}
                      isSelected={selectedCats.has(parent.id)}
                      onSelect={toggleSelectCat}
                    />
                  ))}
                </div>

                <DragOverlay dropAnimation={null}>
                  <DragGhost cat={activeCat} />
                </DragOverlay>
              </DndContext>
              </>
            )}
          </div>
        )}

        {/* ══ BANNERS ══ */}
        {activeTab==='banners' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#111] border border-[#222]">
              <h3 className="font-black uppercase tracking-tighter text-sm mb-5">Novo Banner</h3>
              <form onSubmit={addBanner} className="flex flex-col gap-4">
                <input required placeholder="Título" value={newBanner.title} onChange={e=>setNewBanner({...newBanner,title:e.target.value})} className={inp}/>
                <input placeholder="Link (/categoria/...)" value={newBanner.link} onChange={e=>setNewBanner({...newBanner,link:e.target.value})} className={inp}/>
                <div className="relative p-8 rounded-xl flex flex-col items-center gap-2 cursor-pointer" style={{border:`2px dashed ${file?G:'#2a2a2a'}`,background:'#141414'}}>
                  <span className="material-symbols-outlined text-2xl text-[#333]">photo</span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#444]">Imagem 16:9</p>
                  {file&&<p className="text-[10px] font-bold" style={{color:G}}>{file.name}</p>}
                  <input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer"/>
                </div>
                <button type="submit" disabled={loading} className="py-3 rounded-xl text-black font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-opacity" style={{background:G}}>
                  {loading?'Enviando...':'Adicionar Banner'}
                </button>
              </form>
            </div>
            <div className="p-6 rounded-2xl bg-[#111] border border-[#222] max-h-[85vh] overflow-y-auto">
              <h3 className="font-black uppercase tracking-tighter text-sm mb-5">Ativos ({banners.length})</h3>
              <div className="flex flex-col gap-3">
                {banners.map(b=>(
                  <div key={b.id} className="rounded-xl overflow-hidden border border-[#222] group">
                    <div className="h-28 overflow-hidden">{b.image&&<img src={b.image} className="w-full h-full object-cover"/>}</div>
                    <div className="flex items-center justify-between p-3 border-t border-[#222]">
                      <p className="text-xs font-bold uppercase tracking-widest truncate">{b.title}</p>
                      <button onClick={()=>remove('banners',b.id)} className="shrink-0 ml-2 p-1.5 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ CONFIG ══ */}
        {activeTab==='configuracoes' && (
          <div className="p-8 rounded-2xl bg-[#111] border border-[#222] max-w-lg">
            <h3 className="font-black uppercase tracking-tighter text-sm mb-7">Configurações Globais</h3>
            <form onSubmit={saveSettings} className="flex flex-col gap-5">
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest block mb-2" style={{color:G}}>WhatsApp</label>
                <input placeholder="5511999999999" value={settings.whatsapp} onChange={e=>setSettings({...settings,whatsapp:e.target.value})} className={inp}/>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest block mb-2" style={{color:G}}>Endereço</label>
                <input placeholder="Rua Exemplo, 123 – SP" value={settings.address} onChange={e=>setSettings({...settings,address:e.target.value})} className={inp}/>
              </div>
              <button type="submit" disabled={loading} className="py-4 rounded-xl text-black font-black text-[10px] uppercase tracking-widest mt-2 hover:opacity-90 transition-opacity" style={{background:G}}>
                Salvar
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
