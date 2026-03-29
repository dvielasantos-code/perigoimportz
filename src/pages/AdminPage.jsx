import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase/config';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, setDoc, writeBatch } from 'firebase/firestore';

// ─── Categorias pré-definidas ──────────────────────────────────────────────
const FASHION_PRESET = [
  { id: 'camisetas',   name: 'Camisetas',   icon: 'apparel',      parentId: null },
  { id: 'regatas',     name: 'Regatas',     icon: 'dry_cleaning', parentId: 'camisetas' },
  { id: 'longsleeve',  name: 'Long Sleeve', icon: 'apparel',      parentId: 'camisetas' },
  { id: 'oversized',   name: 'Oversized',   icon: 'apparel',      parentId: 'camisetas' },
  { id: 'polo',        name: 'Polo',        icon: 'apparel',      parentId: 'camisetas' },
  { id: 'calcas',      name: 'Calças',      icon: 'laundry',      parentId: null },
  { id: 'jogger',      name: 'Jogger',      icon: 'laundry',      parentId: 'calcas' },
  { id: 'cargo',       name: 'Cargo',       icon: 'laundry',      parentId: 'calcas' },
  { id: 'jeans',       name: 'Jeans',       icon: 'laundry',      parentId: 'calcas' },
  { id: 'moletom-calca', name: 'Moletom Calça', icon: 'laundry', parentId: 'calcas' },
  { id: 'shorts',      name: 'Shorts',      icon: 'laundry',      parentId: 'calcas' },
  { id: 'jaquetas',    name: 'Jaquetas',    icon: 'checkroom',    parentId: null },
  { id: 'corta-vento', name: 'Corta Vento', icon: 'checkroom',    parentId: 'jaquetas' },
  { id: 'bomber',      name: 'Bomber',      icon: 'checkroom',    parentId: 'jaquetas' },
  { id: 'moletons',    name: 'Moletons',    icon: 'checkroom',    parentId: null },
  { id: 'moletom-zip', name: 'Zip Up',      icon: 'checkroom',    parentId: 'moletons' },
  { id: 'moletom-crewneck', name: 'Crewneck', icon: 'checkroom', parentId: 'moletons' },
  { id: 'bone',        name: 'Bonés',       icon: 'hat',          parentId: null },
  { id: 'bone-snap',   name: 'Snapback',    icon: 'hat',          parentId: 'bone' },
  { id: 'bone-dad',    name: 'Dad Hat',     icon: 'hat',          parentId: 'bone' },
  { id: 'tenis',       name: 'Tênis',       icon: 'steps',        parentId: null },
  { id: 'acessorios',  name: 'Acessórios',  icon: 'diamond',      parentId: null },
  { id: 'colares',     name: 'Colares',     icon: 'diamond',      parentId: 'acessorios' },
  { id: 'pulseiras',   name: 'Pulseiras',   icon: 'diamond',      parentId: 'acessorios' },
  { id: 'cintos',      name: 'Cintos',      icon: 'diamond',      parentId: 'acessorios' },
  { id: 'oculos',      name: 'Óculos',      icon: 'eyeglasses',   parentId: 'acessorios' },
  { id: 'meias',       name: 'Meias',       icon: 'apparel',      parentId: 'acessorios' },
  { id: 'conjuntos',   name: 'Conjuntos',   icon: 'styler',       parentId: null },
];

const ICON_LIST = [
  { id: 'apparel',      name: 'Camiseta'  },
  { id: 'dry_cleaning', name: 'Regata'    },
  { id: 'checkroom',    name: 'Jaqueta'   },
  { id: 'laundry',      name: 'Calça'     },
  { id: 'steps',        name: 'Tênis'     },
  { id: 'hat',          name: 'Boné'      },
  { id: 'diamond',      name: 'Acess.'    },
  { id: 'watch',        name: 'Relógio'   },
  { id: 'eyeglasses',   name: 'Óculos'    },
  { id: 'shopping_bag', name: 'Bolsa'     },
  { id: 'styler',       name: 'Conjunto'  },
  { id: 'sports',       name: 'Esporte'   },
];

export default function AdminPage() {
  const [user, setUser]             = useState(null);
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [loginErr, setLoginErr]     = useState('');
  const [activeTab, setActiveTab]   = useState('produtos');

  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners,    setBanners]    = useState([]);
  const [settings,   setSettings]   = useState({ whatsapp: '', address: '' });

  const [loading,    setLoading]    = useState(false);
  const [file,       setFile]       = useState(null);
  const [files,      setFiles]      = useState([]);
  const [populating, setPopulating] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '', price: '', promoPrice: '', category: '',
    brand: '', description: '', status: 'ativo', featured: true,
  });
  const [newCat, setNewCat] = useState({ name: '', icon: 'apparel', parentId: null });
  const [newBanner, setNewBanner]   = useState({ title: '', link: '' });

  // ── Drag & Drop state ─────────────────────────────────────────────────────
  const [draggingId, setDraggingId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { setUser(u); if (u) loadAll(); });
    return () => unsub();
  }, []);

  // ── Loaders ───────────────────────────────────────────────────────────────
  const loadAll = async () => {
    const [ps, cs, bs, ss] = await Promise.all([
      getDocs(collection(db, 'products')),
      getDocs(collection(db, 'categories')),
      getDocs(collection(db, 'banners')),
      getDocs(collection(db, 'settings')),
    ]);
    setProducts(ps.docs.map(d => ({ id: d.id, ...d.data() })));
    setCategories(cs.docs.map(d => ({ id: d.id, ...d.data() })));
    setBanners(bs.docs.map(d => ({ id: d.id, ...d.data() })));
    ss.docs.forEach(d => { if (d.id === 'global') setSettings(d.data()); });
  };

  const remove = async (col, id) => {
    if (!window.confirm('Excluir este item?')) return;
    await deleteDoc(doc(db, col, id));
    loadAll();
  };

  const uploadCloud = async f => {
    const fd = new FormData();
    fd.append('file', f);
    fd.append('upload_preset', 'produtos_perigo');
    const r = await fetch('https://api.cloudinary.com/v1_1/djua9ijum/image/upload', { method: 'POST', body: fd });
    const j = await r.json();
    return j.secure_url || null;
  };

  // ── Popular categorias ───────────────────────────────────────────────────
  const populateCats = async () => {
    if (!window.confirm(`Criar ${FASHION_PRESET.length} categorias padrão de moda?`)) return;
    setPopulating(true);
    const batch = writeBatch(db);
    FASHION_PRESET.forEach(c => {
      batch.set(doc(db, 'categories', c.id), {
        id:       c.id,
        name:     c.name,
        icon:     c.icon,
        parentId: c.parentId,   // null ou string
        active:   true,
      });
    });
    await batch.commit();
    await loadAll();
    setPopulating(false);
  };

  // ── Categoria manual ──────────────────────────────────────────────────────
  const addCat = async e => {
    e.preventDefault();
    if (!newCat.name.trim()) return;
    setLoading(true);
    const id = newCat.name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    await setDoc(doc(db, 'categories', id), {
      id, name: newCat.name, icon: newCat.icon,
      parentId: newCat.parentId || null, active: true,
    });
    setNewCat({ name: '', icon: 'apparel', parentId: null });
    await loadAll();
    setLoading(false);
  };

  const toggleActive = async cat => {
    await setDoc(doc(db, 'categories', cat.id), { ...cat, active: !cat.active });
    loadAll();
  };

  // ── Drag & Drop handlers ──────────────────────────────────────────────────
  // Drop target: a parent category block
  // Draggable: any category chip (subcategory or orphan)
  const onDragStart = (e, catId) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', catId);
    setDraggingId(catId);
  };

  const onDragEnd = () => { setDraggingId(null); setDropTarget(null); };

  const onDragOver = (e, parentId) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(parentId);
  };

  const onDragLeave = (e, parentId) => {
    // Only clear if we left the parent container entirely (not just moving to a child)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDropTarget(prev => prev === parentId ? null : prev);
    }
  };

  const onDrop = async (e, targetParentId) => {
    e.preventDefault();
    e.stopPropagation();
    const catId = e.dataTransfer.getData('text/plain') || draggingId;
    setDraggingId(null);
    setDropTarget(null);
    if (!catId || catId === targetParentId) return;
    // Don't allow dropping a parent onto its own child
    const isParent = categories.find(c => c.id === catId && !c.parentId);
    if (isParent) { alert('Arraste apenas subcategorias, não pais.'); return; }
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;
    await setDoc(doc(db, 'categories', catId), { ...cat, parentId: targetParentId });
    await loadAll();
  };

  // Allow dropping orphans to "no parent" zone
  const onDropToRoot = async e => {
    e.preventDefault();
    const catId = e.dataTransfer.getData('text/plain') || draggingId;
    setDraggingId(null);
    setDropTarget(null);
    if (!catId) return;
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;
    await setDoc(doc(db, 'categories', catId), { ...cat, parentId: null });
    await loadAll();
  };

  // ── Produto ───────────────────────────────────────────────────────────────
  const addProduct = async e => {
    e.preventDefault(); setLoading(true);
    let urls = [];
    for (const f of files) { const u = await uploadCloud(f); if (u) urls.push(u); }
    if (!urls.length) { alert('Adicione pelo menos 1 foto.'); setLoading(false); return; }
    await addDoc(collection(db, 'products'), {
      ...newProduct,
      price: Number(newProduct.price),
      promoPrice: newProduct.promoPrice ? Number(newProduct.promoPrice) : null,
      image: urls[0], images: urls,
    });
    setNewProduct({ name:'', price:'', promoPrice:'', category:'', brand:'', description:'', status:'ativo', featured:true });
    setFiles([]);
    await loadAll();
    setLoading(false);
  };

  const addBanner = async e => {
    e.preventDefault(); setLoading(true);
    const url = file ? await uploadCloud(file) : '';
    await addDoc(collection(db, 'banners'), { ...newBanner, image: url, active: true });
    setNewBanner({ title:'', link:'' }); setFile(null);
    await loadAll(); setLoading(false);
  };

  const saveSettings = async e => {
    e.preventDefault(); setLoading(true);
    await setDoc(doc(db, 'settings', 'global'), settings);
    alert('Salvo!'); setLoading(false);
  };

  // ── Helpers para mapa ─────────────────────────────────────────────────────
  const parentCats = categories.filter(c => !c.parentId);
  const childrenOf = pid => categories.filter(c => c.parentId === pid);

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
      <div className="w-full max-w-sm p-8 rounded-2xl" style={{ background: '#111', border: '1px solid #222' }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#22c55e' }}>
            <span className="text-black font-black text-sm">PI</span>
          </div>
          <div>
            <p className="font-black text-sm uppercase tracking-tighter text-white">Admin Studio</p>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#22c55e' }}>Perigoimportz</p>
          </div>
        </div>
        <form onSubmit={async e => { e.preventDefault(); try { await signInWithEmailAndPassword(auth, email, password); } catch { setLoginErr('Credenciais inválidas'); }}} className="flex flex-col gap-4">
          {loginErr && <p className="text-red-500 text-xs font-bold text-center">{loginErr}</p>}
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
            className="p-3 rounded-xl text-sm text-white outline-none transition-colors"
            style={{ background: '#1a1a1a', border: '1px solid #333' }} />
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)}
            className="p-3 rounded-xl text-sm text-white outline-none"
            style={{ background: '#1a1a1a', border: '1px solid #333' }} />
          <button type="submit" className="py-3 rounded-xl text-black font-black text-sm uppercase tracking-widest transition-opacity hover:opacity-90"
            style={{ background: '#22c55e' }}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );

  // ── PAINEL PRINCIPAL ──────────────────────────────────────────────────────
  const tabs = [
    { id:'produtos',      label:'Produtos',      icon:'apparel'       },
    { id:'categorias',    label:'Categorias',    icon:'category'      },
    { id:'banners',       label:'Banners',       icon:'photo_library' },
    { id:'configuracoes', label:'Configurações', icon:'settings'      },
  ];

  const inp = 'p-3 rounded-xl text-sm text-white outline-none w-full transition-colors';
  const inpSt = { background: '#1a1a1a', border: '1px solid #2a2a2a' };
  const card = { background: '#111', border: '1px solid #222', borderRadius: 16 };

  return (
    <div className="min-h-screen flex text-white" style={{ background: '#0a0a0a' }}>

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="w-56 shrink-0 flex flex-col" style={{ background: '#111', borderRight: '1px solid #1e1e1e' }}>
        <div className="p-5 flex items-center gap-3" style={{ borderBottom: '1px solid #1e1e1e' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#22c55e' }}>
            <span className="text-black font-black text-xs">PI</span>
          </div>
          <div>
            <p className="font-black text-xs uppercase tracking-tighter">Studio</p>
            <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#22c55e' }}>Admin</p>
          </div>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider text-left transition-all"
              style={activeTab === t.id ? { background:'#22c55e', color:'#000' } : { color:'rgba(255,255,255,0.4)' }}>
              <span className="material-symbols-outlined text-base">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div className="p-3" style={{ borderTop: '1px solid #1e1e1e' }}>
          <button onClick={() => signOut(auth)}
            className="w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-red-500 hover:bg-red-500 hover:text-white"
            style={{ border: '1px solid rgba(239,68,68,0.3)' }}>
            Sair
          </button>
        </div>
      </aside>

      {/* ── Conteúdo ─────────────────────────────────────────────────────── */}
      <main className="flex-1 p-8 overflow-y-auto" style={{ maxHeight: '100vh' }}>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter capitalize">{activeTab}</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color:'#22c55e' }}>
              Perigoimportz · Control Panel
            </p>
          </div>
        </div>

        {/* ══════════ PRODUTOS ══════════ */}
        {activeTab === 'produtos' && (
          <div className="grid grid-cols-5 gap-6">
            <div className="col-span-3 p-6 max-h-[85vh] overflow-y-auto" style={card}>
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-black uppercase tracking-tighter text-sm">Catálogo ({products.length})</h3>
                <input placeholder="Buscar..." className={`${inp} w-40 p-2 text-[10px]`} style={inpSt} />
              </div>
              <div className="flex flex-col gap-2">
                {products.length === 0 && (
                  <div className="py-20 text-center">
                    <span className="material-symbols-outlined text-5xl" style={{ color:'#2a2a2a' }}>inventory_2</span>
                    <p className="text-xs font-bold uppercase tracking-widest mt-3" style={{ color:'#333' }}>Catálogo vazio</p>
                  </div>
                )}
                {products.map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl group transition-all"
                    style={{ background:'#1a1a1a', border:'1px solid #2a2a2a' }}>
                    <div className="w-14 h-[72px] rounded-lg overflow-hidden shrink-0" style={{ background:'#0a0a0a' }}>
                      {p.image && <img src={p.image} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-xs uppercase tracking-tight truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {p.promoPrice
                          ? <><span style={{ color:'#22c55e' }} className="font-black text-[11px]">R$ {p.promoPrice}</span>
                              <span className="line-through text-[10px]" style={{ color:'#444' }}>R$ {p.price}</span></>
                          : <span className="font-bold text-[11px]" style={{ color:'#aaa' }}>R$ {p.price}</span>}
                      </div>
                      <p className="text-[9px] font-bold uppercase tracking-widest mt-1" style={{ color:'#444' }}>{p.category}</p>
                    </div>
                    <button onClick={() => remove('products', p.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-xl transition-all text-red-500 hover:bg-red-500 hover:text-white">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-2 p-6" style={card}>
              <h3 className="font-black uppercase tracking-tighter text-sm mb-5">Adicionar Produto</h3>
              <form onSubmit={addProduct} className="flex flex-col gap-3">
                <input required placeholder="Nome do Produto" value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  className={inp} style={inpSt} />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color:'#22c55e' }}>Preço</label>
                    <input required type="number" step="0.01" placeholder="199.90" value={newProduct.price}
                      onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                      className={inp} style={inpSt} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest block mb-1 text-red-400">Promo</label>
                    <input type="number" step="0.01" placeholder="149.90" value={newProduct.promoPrice}
                      onChange={e => setNewProduct({...newProduct, promoPrice: e.target.value})}
                      className={inp} style={inpSt} />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color:'#22c55e' }}>Categoria</label>
                  <select required value={newProduct.category}
                    onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                    className={inp} style={inpSt}>
                    <option value="">Selecione...</option>
                    {parentCats.map(p => (
                      <optgroup key={p.id} label={p.name}>
                        <option value={p.id}>{p.name} (geral)</option>
                        {childrenOf(p.id).map(c => <option key={c.id} value={c.id}>↳ {c.name}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <input placeholder="Marca (ex: Stüssy)" value={newProduct.brand}
                  onChange={e => setNewProduct({...newProduct, brand: e.target.value})}
                  className={inp} style={inpSt} />

                <textarea required rows={3} placeholder="Descrição..." value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  className={`${inp} resize-none`} style={inpSt} />

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newProduct.featured}
                    onChange={e => setNewProduct({...newProduct, featured: e.target.checked})}
                    className="w-4 h-4 accent-green-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color:'#22c55e' }}>Produto em Destaque</span>
                </label>

                <div className="relative p-5 rounded-xl flex flex-col items-center gap-2 cursor-pointer transition-all"
                  style={{ border: `2px dashed ${files.length ? '#22c55e' : '#2a2a2a'}`, background:'#141414' }}>
                  <span className="material-symbols-outlined text-2xl" style={{ color:'#333' }}>upload</span>
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color:'#444' }}>Até 7 fotos</p>
                  {files.length > 0 && <p className="text-[10px] font-bold" style={{ color:'#22c55e' }}>{files.length} foto(s)</p>}
                  <input type="file" multiple accept="image/*"
                    onChange={e => setFiles(Array.from(e.target.files).slice(0, 7))}
                    className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>

                <button type="submit" disabled={loading}
                  className="py-4 rounded-xl text-black font-black text-[10px] uppercase tracking-widest transition-opacity hover:opacity-90 flex items-center justify-center gap-2 mt-2"
                  style={{ background: loading ? '#333' : '#22c55e', color: loading ? '#666' : '#000' }}>
                  {loading ? <><span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />Enviando...</> : 'Publicar no Catálogo'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ══════════ CATEGORIAS ══════════ */}
        {activeTab === 'categorias' && (
          <div className="flex flex-col gap-6">

            {/* Form criar */}
            <div className="p-6" style={card}>
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-black uppercase tracking-tighter text-sm">Nova Categoria</h3>
                <button onClick={populateCats} disabled={populating}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  style={{ border:'1px solid #22c55e', color:'#22c55e' }}
                  onMouseEnter={e => { e.currentTarget.style.background='#22c55e'; e.currentTarget.style.color='#000'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#22c55e'; }}>
                  <span className="material-symbols-outlined text-sm">bolt</span>
                  {populating ? 'Criando...' : `Popular ${FASHION_PRESET.length} Categorias Padrão`}
                </button>
              </div>

              <form onSubmit={addCat} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color:'#22c55e' }}>Nome</label>
                  <input required placeholder="Ex: Regatas" value={newCat.name}
                    onChange={e => setNewCat({...newCat, name: e.target.value})}
                    className={inp} style={inpSt} />
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color:'#22c55e' }}>Categoria Pai</label>
                  <select value={newCat.parentId || ''}
                    onChange={e => setNewCat({...newCat, parentId: e.target.value || null})}
                    className={inp} style={inpSt}>
                    <option value="">Nenhuma (Principal)</option>
                    {parentCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color:'#22c55e' }}>Ícone</label>
                  <div className="grid grid-cols-6 gap-1 p-1 rounded-xl" style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', height:46 }}>
                    {ICON_LIST.map(ic => (
                      <button key={ic.id} type="button" title={ic.name}
                        onClick={() => setNewCat({...newCat, icon: ic.id})}
                        className="p-1 rounded-lg flex items-center justify-center transition-all"
                        style={newCat.icon === ic.id ? { background:'#22c55e', color:'#000' } : { color:'rgba(255,255,255,0.25)' }}>
                        <span className="material-symbols-outlined text-xs">{ic.id}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="py-3 rounded-xl text-black font-black text-[10px] uppercase tracking-widest transition-opacity hover:opacity-90"
                  style={{ background:'#22c55e', height:46 }}>
                  Criar
                </button>
              </form>
            </div>

            {/* Instruções de uso */}
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl" style={{ background:'rgba(34,197,94,0.05)', border:'1px solid rgba(34,197,94,0.15)' }}>
              <span className="material-symbols-outlined text-lg" style={{ color:'#22c55e' }}>drag_indicator</span>
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color:'rgba(34,197,94,0.7)' }}>
                Arraste qualquer subcategoria de um bloco para outro para reorganizar a hierarquia
              </p>
            </div>

            {/* ── MAPA MENTAL ──────────────────────────────────────── */}
            {categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 rounded-2xl" style={{ border:'2px dashed #222' }}>
                <span className="material-symbols-outlined text-5xl" style={{ color:'#2a2a2a' }}>category</span>
                <p className="text-xs font-bold uppercase tracking-widest mt-4" style={{ color:'#333' }}>Nenhuma categoria</p>
                <p className="text-[10px] mt-2" style={{ color:'#2a2a2a' }}>Clique em "Popular Categorias Padrão" acima</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-5 items-start">

                {/* BLOCO: Categorias pai */}
                {parentCats.map(parent => {
                  const children = childrenOf(parent.id);
                  const isTarget = dropTarget === parent.id;

                  return (
                    <div
                      key={parent.id}
                      onDragOver={e => onDragOver(e, parent.id)}
                      onDragLeave={e => onDragLeave(e, parent.id)}
                      onDrop={e => onDrop(e, parent.id)}
                      className="flex flex-col gap-3 p-4 rounded-2xl transition-all"
                      style={{
                        background: isTarget ? 'rgba(34,197,94,0.06)' : '#141414',
                        border: `2px solid ${isTarget ? '#22c55e' : parent.active ? 'rgba(34,197,94,0.2)' : '#1e1e1e'}`,
                        minWidth: 210, maxWidth: 240,
                      }}
                    >
                      {/* Header pai */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: parent.active ? '#22c55e' : '#222' }}>
                          <span className="material-symbols-outlined text-base"
                            style={{ color: parent.active ? '#000' : '#555' }}>{parent.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-xs uppercase tracking-tighter truncate"
                            style={{ opacity: parent.active ? 1 : 0.35 }}>{parent.name}</p>
                          <p className="text-[9px] font-bold uppercase tracking-widest"
                            style={{ color: parent.active ? '#22c55e' : '#3a3a3a' }}>
                            {children.length} sub{children.length !== 1 ? 'cats' : 'cat'}
                          </p>
                        </div>
                      </div>

                      {/* Ações pai */}
                      <div className="flex gap-2">
                        <button onClick={() => toggleActive(parent)}
                          className="flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                          style={{ background: parent.active ? '#22c55e' : '#1e1e1e', color: parent.active ? '#000' : '#555' }}>
                          {parent.active ? '● Ativo' : '○ Oculto'}
                        </button>
                        <button onClick={() => remove('categories', parent.id)}
                          className="px-2.5 rounded-lg transition-all text-red-500 hover:bg-red-500 hover:text-white"
                          style={{ border:'1px solid rgba(239,68,68,0.2)' }}>
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>

                      {/* Drop zone hint */}
                      {isTarget && (
                        <div className="py-2 rounded-lg text-center text-[9px] font-black uppercase tracking-widest"
                          style={{ border:'1px dashed #22c55e', color:'#22c55e', background:'rgba(34,197,94,0.05)' }}>
                          ↓ Soltar aqui
                        </div>
                      )}
                      {!isTarget && !draggingId && children.length === 0 && (
                        <div className="py-2 rounded-lg text-center text-[9px] font-bold uppercase tracking-widest"
                          style={{ border:'1px dashed #2a2a2a', color:'#333' }}>
                          Arraste subcats aqui
                        </div>
                      )}

                      {/* Sub chips — DRAGGÁVEIS */}
                      {children.length > 0 && (
                        <div className="flex flex-col gap-1.5" style={{ borderTop:'1px solid #1e1e1e', paddingTop:12 }}>
                          {children.map(sub => (
                            <div
                              key={sub.id}
                              draggable
                              onDragStart={e => onDragStart(e, sub.id)}
                              onDragEnd={onDragEnd}
                              className="flex items-center justify-between px-3 py-2 rounded-xl group/sub transition-all"
                              style={{
                                background: draggingId === sub.id ? 'rgba(34,197,94,0.08)' : '#1a1a1a',
                                border: `1px solid ${draggingId === sub.id ? '#22c55e' : '#252525'}`,
                                cursor: 'grab',
                                opacity: sub.active ? 1 : 0.4,
                                userSelect: 'none',
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-xs" style={{ color:'#444' }}>drag_indicator</span>
                                <span className="material-symbols-outlined text-xs" style={{ color: sub.active ? '#22c55e' : '#444' }}>{sub.icon}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wide">{sub.name}</span>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                <button onClick={() => toggleActive(sub)}
                                  className="material-symbols-outlined text-xs transition-colors"
                                  style={{ color: sub.active ? '#22c55e' : '#555' }}>
                                  {sub.active ? 'visibility' : 'visibility_off'}
                                </button>
                                <button onClick={() => remove('categories', sub.id)}
                                  className="material-symbols-outlined text-xs transition-colors"
                                  style={{ color:'rgba(239,68,68,0.5)' }}
                                  onMouseEnter={e => e.currentTarget.style.color='#ef4444'}
                                  onMouseLeave={e => e.currentTarget.style.color='rgba(239,68,68,0.5)'}>
                                  close
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* BLOCO: Categorias sem pai (Orphans) — DROP to ROOT */}
                {(() => {
                  const orphans = categories.filter(c => c.parentId && !parentCats.find(p => p.id === c.parentId));
                  if (!orphans.length) return null;
                  return (
                    <div
                      onDragOver={e => { e.preventDefault(); setDropTarget('__root__'); }}
                      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDropTarget(null); }}
                      onDrop={onDropToRoot}
                      className="flex flex-col gap-2 p-4 rounded-2xl"
                      style={{ border:`2px dashed ${dropTarget==='__root__' ? '#22c55e' : '#2a2a2a'}`, minWidth:180 }}>
                      <p className="text-[9px] font-black uppercase tracking-widest" style={{ color:'#555' }}>Órfãs (arraste p/ realocar)</p>
                      {orphans.map(c => (
                        <div key={c.id} draggable
                          onDragStart={e => onDragStart(e, c.id)}
                          onDragEnd={onDragEnd}
                          className="flex items-center gap-2 p-2 rounded-xl"
                          style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', cursor:'grab' }}>
                          <span className="material-symbols-outlined text-xs" style={{ color:'#555' }}>{c.icon}</span>
                          <span className="text-[10px] font-bold uppercase">{c.name}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* ══════════ BANNERS ══════════ */}
        {activeTab === 'banners' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6" style={card}>
              <h3 className="font-black uppercase tracking-tighter text-sm mb-5">Novo Banner</h3>
              <form onSubmit={addBanner} className="flex flex-col gap-4">
                <input required placeholder="Título" value={newBanner.title}
                  onChange={e => setNewBanner({...newBanner, title: e.target.value})}
                  className={inp} style={inpSt} />
                <input placeholder="Link (/categoria/...)" value={newBanner.link}
                  onChange={e => setNewBanner({...newBanner, link: e.target.value})}
                  className={inp} style={inpSt} />
                <div className="relative p-8 rounded-xl flex flex-col items-center gap-2 cursor-pointer transition-all"
                  style={{ border:`2px dashed ${file ? '#22c55e' : '#2a2a2a'}`, background:'#141414' }}>
                  <span className="material-symbols-outlined text-2xl" style={{ color:'#333' }}>photo</span>
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color:'#444' }}>Imagem 16:9</p>
                  {file && <p className="text-[10px] font-bold" style={{ color:'#22c55e' }}>{file.name}</p>}
                  <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <button type="submit" disabled={loading}
                  className="py-3 rounded-xl text-black font-black text-[10px] uppercase tracking-widest transition-opacity hover:opacity-90"
                  style={{ background:'#22c55e' }}>
                  {loading ? 'Enviando...' : 'Adicionar Banner'}
                </button>
              </form>
            </div>

            <div className="p-6 max-h-[85vh] overflow-y-auto" style={card}>
              <h3 className="font-black uppercase tracking-tighter text-sm mb-5">Ativos ({banners.length})</h3>
              <div className="flex flex-col gap-3">
                {banners.map(b => (
                  <div key={b.id} className="rounded-xl overflow-hidden group" style={{ border:'1px solid #222' }}>
                    <div className="h-28 overflow-hidden">
                      {b.image && <img src={b.image} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex items-center justify-between p-3" style={{ borderTop:'1px solid #222' }}>
                      <p className="text-xs font-bold uppercase tracking-widest truncate">{b.title}</p>
                      <button onClick={() => remove('banners', b.id)}
                        className="shrink-0 ml-2 p-1.5 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════ CONFIGURAÇÕES ══════════ */}
        {activeTab === 'configuracoes' && (
          <div className="p-8 max-w-lg" style={card}>
            <h3 className="font-black uppercase tracking-tighter text-sm mb-7">Configurações Globais</h3>
            <form onSubmit={saveSettings} className="flex flex-col gap-5">
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest block mb-2" style={{ color:'#22c55e' }}>WhatsApp</label>
                <input placeholder="5511999999999" value={settings.whatsapp}
                  onChange={e => setSettings({...settings, whatsapp: e.target.value})}
                  className={inp} style={inpSt} />
                <p className="text-[9px] font-bold uppercase tracking-widest mt-1" style={{ color:'#333' }}>Usado no botão flutuante e footer</p>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest block mb-2" style={{ color:'#22c55e' }}>Endereço</label>
                <input placeholder="Rua Exemplo, 123 – SP" value={settings.address}
                  onChange={e => setSettings({...settings, address: e.target.value})}
                  className={inp} style={inpSt} />
              </div>
              <button type="submit" disabled={loading}
                className="py-4 rounded-xl text-black font-black text-[10px] uppercase tracking-widest mt-2 transition-opacity hover:opacity-90"
                style={{ background:'#22c55e' }}>
                Salvar
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
