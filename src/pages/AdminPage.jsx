import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase/config';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, setDoc, writeBatch } from 'firebase/firestore';

// ─── Categorias pré-definidas do setor de moda ─────────────────────────────
const FASHION_CATEGORIES = [
  { id: 'camisetas',  name: 'Camisetas',  icon: 'apparel',       parentId: null },
  { id: 'regatas',    name: 'Regatas',    icon: 'dry_cleaning',  parentId: 'camisetas' },
  { id: 'longsleeve', name: 'Long Sleeve',icon: 'apparel',       parentId: 'camisetas' },
  { id: 'oversized',  name: 'Oversized',  icon: 'apparel',       parentId: 'camisetas' },
  { id: 'calcas',     name: 'Calças',     icon: 'laundry',       parentId: null },
  { id: 'jogger',     name: 'Jogger',     icon: 'laundry',       parentId: 'calcas' },
  { id: 'cargo',      name: 'Cargo',      icon: 'laundry',       parentId: 'calcas' },
  { id: 'jeans',      name: 'Jeans',      icon: 'laundry',       parentId: 'calcas' },
  { id: 'jaquetas',   name: 'Jaquetas',   icon: 'checkroom',     parentId: null },
  { id: 'moletons',   name: 'Moletons',   icon: 'checkroom',     parentId: null },
  { id: 'bone',       name: 'Bonés',      icon: 'hat',           parentId: null },
  { id: 'tenis',      name: 'Tênis',      icon: 'steps',         parentId: null },
  { id: 'acessorios', name: 'Acessórios', icon: 'diamond',       parentId: null },
  { id: 'colares',    name: 'Colares',    icon: 'diamond',       parentId: 'acessorios' },
  { id: 'pulseiras',  name: 'Pulseiras',  icon: 'diamond',       parentId: 'acessorios' },
  { id: 'cintos',     name: 'Cintos',     icon: 'diamond',       parentId: 'acessorios' },
];

const ICON_LIST = [
  { id: 'apparel',          name: 'Camiseta'   },
  { id: 'dry_cleaning',     name: 'Regata'     },
  { id: 'checkroom',        name: 'Jaqueta'    },
  { id: 'laundry',          name: 'Calça'      },
  { id: 'steps',            name: 'Tênis'      },
  { id: 'hat',              name: 'Boné'       },
  { id: 'diamond',          name: 'Acessório'  },
  { id: 'watch',            name: 'Relógio'    },
  { id: 'eyeglasses',       name: 'Óculos'     },
  { id: 'shopping_bag',     name: 'Bolsa'      },
  { id: 'styler',           name: 'Conjunto'   },
  { id: 'sports',           name: 'Esporte'    },
];

// ─── Cores do tema Admin ────────────────────────────────────────────────────
const G   = '#22c55e';   // verde principal
const GD  = '#16a34a';   // verde escuro hover
const BG  = '#0a0a0a';   // background
const S   = '#111111';   // surface
const S2  = '#1a1a1a';   // surface lifted
const BOR = '#222222';   // border

export default function AdminPage() {
  const [user, setUser]         = useState(null);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors]     = useState('');
  const [activeTab, setActiveTab] = useState('produtos');

  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners,    setBanners]    = useState([]);
  const [settings,   setSettings]   = useState({ whatsapp: '', address: '' });

  const [loading, setLoading] = useState(false);
  const [file,    setFile]    = useState(null);
  const [files,   setFiles]   = useState([]);

  const [newProduct, setNewProduct] = useState({
    name: '', price: '', promoPrice: '', category: '',
    brand: '', description: '', status: 'ativo', featured: true, images: []
  });

  const [newCategory, setNewCategory] = useState({
    id: '', name: '', icon: 'apparel', parentId: null, active: true
  });

  const [newBanner, setNewBanner] = useState({ title: '', link: '' });

  // Drag state
  const [dragging, setDragging]       = useState(null);  // id being dragged
  const [dragOver, setDragOver]       = useState(null);  // parent id hovered
  const [populating, setPopulating]   = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      if (u) loadAll();
    });
    return () => unsub();
  }, []);

  // ── Data loaders ─────────────────────────────────────────────────────────
  const loadAll = async () => {
    const [pSnap, cSnap, bSnap, sSnap] = await Promise.all([
      getDocs(collection(db, 'products')),
      getDocs(collection(db, 'categories')),
      getDocs(collection(db, 'banners')),
      getDocs(collection(db, 'settings')),
    ]);
    setProducts(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setCategories(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setBanners(bSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    sSnap.docs.forEach(d => { if (d.id === 'global') setSettings(d.data()); });
  };

  const del = async (col, id) => {
    if (!window.confirm('Excluir definitivamente?')) return;
    await deleteDoc(doc(db, col, id));
    loadAll();
  };

  const uploadCloud = async (f) => {
    const fd = new FormData();
    fd.append('file', f);
    fd.append('upload_preset', 'produtos_perigo');
    const r = await fetch('https://api.cloudinary.com/v1_1/djua9ijum/image/upload', { method: 'POST', body: fd });
    const d = await r.json();
    return d.secure_url || null;
  };

  // ── Popular categorias padrão ─────────────────────────────────────────────
  const populateCategories = async () => {
    if (!window.confirm('Isso vai criar ' + FASHION_CATEGORIES.length + ' categorias padrão. Confirmar?')) return;
    setPopulating(true);
    const batch = writeBatch(db);
    FASHION_CATEGORIES.forEach(cat => {
      batch.set(doc(db, 'categories', cat.id), { ...cat, active: true });
    });
    await batch.commit();
    await loadAll();
    setPopulating(false);
  };

  // ── Adicionar categoria manual ────────────────────────────────────────────
  const addCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;
    setLoading(true);
    const catId = newCategory.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    await setDoc(doc(db, 'categories', catId), {
      ...newCategory, id: catId, active: true
    });
    setNewCategory({ id: '', name: '', icon: 'apparel', parentId: null, active: true });
    await loadAll();
    setLoading(false);
  };

  const toggleActive = async (cat) => {
    await setDoc(doc(db, 'categories', cat.id), { ...cat, active: !cat.active });
    loadAll();
  };

  // Move subcategory to another parent via drag
  const handleDrop = async (targetParentId) => {
    if (!dragging || dragging === targetParentId) { setDragging(null); setDragOver(null); return; }
    const cat = categories.find(c => c.id === dragging);
    if (!cat) return;
    // prevent circular (can't drag parent into its own child)
    if (cat.id === targetParentId) return;
    await setDoc(doc(db, 'categories', cat.id), { ...cat, parentId: targetParentId });
    setDragging(null);
    setDragOver(null);
    await loadAll();
  };

  // ── Produto ───────────────────────────────────────────────────────────────
  const addProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    let urls = [];
    for (const f of files) { const u = await uploadCloud(f); if (u) urls.push(u); }
    if (!urls.length) { alert('Selecione pelo menos 1 foto.'); setLoading(false); return; }
    await addDoc(collection(db, 'products'), {
      ...newProduct,
      price: Number(newProduct.price),
      promoPrice: newProduct.promoPrice ? Number(newProduct.promoPrice) : null,
      image: urls[0], images: urls,
    });
    setNewProduct({ name:'', price:'', promoPrice:'', category:'', brand:'', description:'', status:'ativo', featured:true, images:[] });
    setFiles([]);
    await loadAll();
    setLoading(false);
  };

  const addBanner = async (e) => {
    e.preventDefault(); setLoading(true);
    const url = file ? await uploadCloud(file) : '';
    await addDoc(collection(db, 'banners'), { ...newBanner, image: url, active: true });
    setNewBanner({ title: '', link: '' }); setFile(null);
    await loadAll(); setLoading(false);
  };

  const saveSettings = async (e) => {
    e.preventDefault(); setLoading(true);
    await setDoc(doc(db, 'settings', 'global'), settings);
    alert('Salvo!'); setLoading(false);
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const parents = categories.filter(c => !c.parentId);
  const subs    = (pid) => categories.filter(c => c.parentId === pid);
  const free    = categories.filter(c => c.parentId && !categories.find(p => p.id === c.parentId));

  // ─── LOGIN SCREEN ─────────────────────────────────────────────────────────
  if (!user) return (
    <div style={{ background: BG }} className="min-h-screen flex flex-col justify-center items-center text-white px-4">
      <div style={{ border: `2px solid ${G}`, background: S }} className="p-10 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <div style={{ background: G }} className="w-10 h-10 flex items-center justify-center">
            <span className="text-black font-black text-lg">PI</span>
          </div>
          <div>
            <h1 className="font-black uppercase tracking-tighter text-lg">ADMIN STUDIO</h1>
            <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: G }}>Perigoimportz Control</p>
          </div>
        </div>
        <form onSubmit={async e => { e.preventDefault(); try { await signInWithEmailAndPassword(auth, email, password); } catch { setErrors('Credenciais inválidas'); } }} className="flex flex-col gap-4">
          {errors && <p className="text-red-500 text-xs font-bold text-center">{errors}</p>}
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
            style={{ background: S2, border: `1px solid ${BOR}`, color: '#fff' }}
            className="p-3 outline-none text-sm focus:border-green-500 transition-colors" />
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)}
            style={{ background: S2, border: `1px solid ${BOR}`, color: '#fff' }}
            className="p-3 outline-none text-sm focus:border-green-500 transition-colors" />
          <button type="submit" style={{ background: G }} className="py-4 text-black font-black uppercase tracking-widest text-xs hover:opacity-90 transition-opacity">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );

  // ─── SHARED INPUT STYLE ───────────────────────────────────────────────────
  const inp = `p-3 text-sm text-white outline-none transition-colors focus:border-green-500`;
  const inpStyle = { background: S2, border: `1px solid ${BOR}`, color: '#fff' };
  const cardStyle = { background: S, border: `1px solid ${BOR}` };

  // ─── MAIN PANEL ───────────────────────────────────────────────────────────
  const tabs = [
    { id: 'produtos',      label: 'Produtos',      icon: 'apparel' },
    { id: 'categorias',    label: 'Categorias',    icon: 'category' },
    { id: 'banners',       label: 'Banners',       icon: 'photo_library' },
    { id: 'configuracoes', label: 'Configurações', icon: 'settings' },
  ];

  return (
    <div style={{ background: BG }} className="min-h-screen text-white flex">

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside style={{ background: S, borderRight: `1px solid ${BOR}`, width: 220 }} className="flex flex-col shrink-0">
        {/* Logo */}
        <div style={{ borderBottom: `1px solid ${BOR}` }} className="p-6 flex items-center gap-3">
          <div style={{ background: G }} className="w-9 h-9 flex items-center justify-center shrink-0">
            <span className="text-black font-black text-sm">PI</span>
          </div>
          <div>
            <p className="font-black text-xs uppercase tracking-tighter">Studio</p>
            <p style={{ color: G }} className="text-[9px] font-bold uppercase tracking-widest">Admin</p>
          </div>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={activeTab === t.id
                ? { background: G, color: '#000' }
                : { color: 'rgba(255,255,255,0.5)' }}
              className="flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-left hover:bg-white/5 transition-colors"
            >
              <span className="material-symbols-outlined text-base">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div style={{ borderTop: `1px solid ${BOR}` }} className="p-4">
          <button onClick={() => signOut(auth)}
            className="w-full border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-black uppercase tracking-widest py-3 transition-all">
            Sair
          </button>
        </div>
      </aside>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-8" style={{ maxHeight: '100vh' }}>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">{activeTab}</h2>
            <p style={{ color: G }} className="text-[10px] font-bold uppercase tracking-widest mt-1">Perigoimportz · Control Panel</p>
          </div>
          <div style={{ background: S, border: `1px solid ${BOR}` }} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
            {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </div>

        {/* ════════════════ ABA PRODUTOS ════════════════ */}
        {activeTab === 'produtos' && (
          <div className="grid grid-cols-5 gap-6">

            {/* Lista */}
            <div style={cardStyle} className="col-span-3 p-6 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black uppercase tracking-tighter text-base">Catálogo ({products.length})</h3>
                <input placeholder="Buscar..." style={inpStyle} className={`${inp} text-[10px] w-40 p-2`} />
              </div>
              <div className="flex flex-col gap-2">
                {products.length === 0 && (
                  <div className="py-20 text-center">
                    <span className="material-symbols-outlined text-4xl text-white/10">inventory_2</span>
                    <p className="text-white/20 text-xs font-bold uppercase tracking-widest mt-3">Nenhum produto</p>
                  </div>
                )}
                {products.map(p => (
                  <div key={p.id} style={{ border: `1px solid ${BOR}` }} className="flex items-center gap-4 p-3 hover:border-green-500/30 transition-colors group">
                    <div className="w-14 h-18 h-[72px] overflow-hidden shrink-0" style={{ background: '#000' }}>
                      {p.image && <img src={p.image} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-xs uppercase tracking-tight truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {p.promoPrice
                          ? <><span style={{ color: G }} className="font-black text-[11px]">R$ {p.promoPrice}</span><span className="text-white/30 line-through text-[10px]">R$ {p.price}</span></>
                          : <span className="text-white/60 text-[11px] font-bold">R$ {p.price}</span>}
                      </div>
                      <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest mt-1">{p.category}</p>
                    </div>
                    <button onClick={() => del('products', p.id)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500 hover:text-white p-2 transition-all">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div style={cardStyle} className="col-span-2 p-6">
              <h3 className="font-black uppercase tracking-tighter text-base mb-6">Adicionar Produto</h3>
              <form onSubmit={addProduct} className="flex flex-col gap-4">
                <input required placeholder="Nome do Produto" value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  style={inpStyle} className={`${inp} w-full`} />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={{ color: G }} className="text-[9px] font-black uppercase tracking-widest block mb-1">Preço</label>
                    <input required type="number" step="0.01" placeholder="199.90" value={newProduct.price}
                      onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                      style={inpStyle} className={`${inp} w-full`} />
                  </div>
                  <div>
                    <label className="text-red-400 text-[9px] font-black uppercase tracking-widest block mb-1">Promo (opcional)</label>
                    <input type="number" step="0.01" placeholder="149.90" value={newProduct.promoPrice}
                      onChange={e => setNewProduct({...newProduct, promoPrice: e.target.value})}
                      style={inpStyle} className={`${inp} w-full`} />
                  </div>
                </div>

                <div>
                  <label style={{ color: G }} className="text-[9px] font-black uppercase tracking-widest block mb-1">Categoria</label>
                  <select required value={newProduct.category}
                    onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                    style={inpStyle} className={`${inp} w-full`}>
                    <option value="">Selecionar categoria</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.parentId ? '↳ ' : ''}{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ color: G }} className="text-[9px] font-black uppercase tracking-widest block mb-1">Marca</label>
                  <input placeholder="Ex: Perigo, Stüssy..." value={newProduct.brand}
                    onChange={e => setNewProduct({...newProduct, brand: e.target.value})}
                    style={inpStyle} className={`${inp} w-full`} />
                </div>

                <textarea required rows={4} placeholder="Descrição do produto..." value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  style={inpStyle} className={`${inp} w-full resize-none`} />

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={newProduct.featured}
                      onChange={e => setNewProduct({...newProduct, featured: e.target.checked})}
                      className="w-4 h-4 accent-green-500" />
                    <span style={{ color: G }} className="text-[10px] font-black uppercase tracking-widest">Produto em Destaque</span>
                  </label>
                </div>

                {/* Upload */}
                <div style={{ border: `2px dashed ${files.length ? G : BOR}`, background: S2 }}
                  className="relative p-6 flex flex-col items-center gap-2 transition-all cursor-pointer hover:border-green-500">
                  <span className="material-symbols-outlined text-2xl text-white/20">upload</span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Até 7 fotos</p>
                  {files.length > 0 && <p style={{ color: G }} className="text-[10px] font-bold">{files.length} foto(s) selecionada(s)</p>}
                  <input type="file" multiple accept="image/*"
                    onChange={e => setFiles(Array.from(e.target.files).slice(0, 7))}
                    className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>

                <button type="submit" disabled={loading}
                  style={{ background: loading ? '#333' : G }}
                  className="py-4 text-black font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all hover:opacity-90">
                  {loading ? <><span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent" />Enviando...</> : 'Publicar no Catálogo'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ════════════════ ABA CATEGORIAS ════════════════ */}
        {activeTab === 'categorias' && (
          <div className="flex flex-col gap-6">

            {/* ── Linha 1: Form + botão popular ─────────────────────────────── */}
            <div style={cardStyle} className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black uppercase tracking-tighter text-base">Nova Categoria</h3>
                <button onClick={populateCategories} disabled={populating}
                  style={{ border: `1px solid ${G}`, color: G }}
                  className="flex items-center gap-2 px-5 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-black transition-all">
                  <span className="material-symbols-outlined text-sm">bolt</span>
                  {populating ? 'Populando...' : 'Popular Categorias Padrão'}
                </button>
              </div>

              <form onSubmit={addCategory} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label style={{ color: G }} className="text-[9px] font-black uppercase tracking-widest block mb-1">Nome</label>
                  <input required placeholder="Ex: Regatas" value={newCategory.name}
                    onChange={e => setNewCategory({...newCategory, name: e.target.value})}
                    style={inpStyle} className={`${inp} w-full`} />
                </div>

                <div>
                  <label style={{ color: G }} className="text-[9px] font-black uppercase tracking-widest block mb-1">Categoria Pai (opcional)</label>
                  <select value={newCategory.parentId || ''}
                    onChange={e => setNewCategory({...newCategory, parentId: e.target.value || null})}
                    style={inpStyle} className={`${inp} w-full`}>
                    <option value="">Nenhuma (Principal)</option>
                    {categories.filter(c => !c.parentId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ color: G }} className="text-[9px] font-black uppercase tracking-widest block mb-1">Ícone</label>
                  <div style={{ background: S2, border: `1px solid ${BOR}` }} className="grid grid-cols-6 gap-1 p-1 h-[46px] overflow-hidden">
                    {ICON_LIST.map(ic => (
                      <button key={ic.id} type="button" title={ic.name}
                        onClick={() => setNewCategory({...newCategory, icon: ic.id})}
                        style={newCategory.icon === ic.id ? { background: G, color: '#000' } : { color: 'rgba(255,255,255,0.3)' }}
                        className="p-1 flex items-center justify-center hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined text-sm">{ic.id}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  style={{ background: G, height: 46 }}
                  className="text-black font-black uppercase tracking-widest text-[10px] hover:opacity-90 transition-opacity">
                  Criar
                </button>
              </form>
            </div>

            {/* ── Linha 2: Mapa Mental com Drag & Drop ──────────────────────── */}
            <div style={cardStyle} className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-black uppercase tracking-tighter text-base">Mapa de Categorias</h3>
                  <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">
                    Arraste uma subcategoria para dentro de outra categoria pai
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                  <span className="w-3 h-3 inline-block" style={{ background: G }} />
                  <span style={{ color: G }}>Ativo</span>
                  <span className="w-3 h-3 inline-block bg-white/20 ml-4" />
                  <span className="text-white/30">Oculto</span>
                </div>
              </div>

              {categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32" style={{ border: `2px dashed ${BOR}` }}>
                  <span className="material-symbols-outlined text-5xl text-white/10">category</span>
                  <p className="text-white/20 text-xs font-bold uppercase tracking-widest mt-4">Nenhuma categoria criada</p>
                  <p className="text-white/10 text-[10px] mt-2">Use o botão "Popular Categorias Padrão" acima</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-8 items-start">
                  {parents.map(parent => {
                    const children = subs(parent.id);
                    const isOver = dragOver === parent.id;
                    return (
                      <div key={parent.id}
                        onDragOver={e => { e.preventDefault(); setDragOver(parent.id); }}
                        onDragLeave={() => setDragOver(null)}
                        onDrop={() => handleDrop(parent.id)}
                        style={{
                          border: `2px solid ${isOver ? G : parent.active ? 'rgba(34,197,94,0.3)' : BOR}`,
                          background: isOver ? 'rgba(34,197,94,0.05)' : S2,
                          transition: 'all 0.15s',
                          minWidth: 200
                        }}
                        className="p-4 flex flex-col gap-3">

                        {/* Cabeçalho pai */}
                        <div className="flex items-center gap-3">
                          <div style={{ background: parent.active ? G : '#333', padding: 8 }}>
                            <span className="material-symbols-outlined text-xl text-black"
                              style={{ color: parent.active ? '#000' : '#fff' }}>{parent.icon}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-black uppercase tracking-tighter text-sm"
                              style={{ opacity: parent.active ? 1 : 0.3 }}>{parent.name}</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest"
                              style={{ color: parent.active ? G : 'rgba(255,255,255,0.2)' }}>
                              {children.length} sub{children.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>

                        {/* Botões ação pai */}
                        <div className="flex gap-2">
                          <button onClick={() => toggleActive(parent)}
                            style={{
                              flex: 1, padding: '6px 0', fontSize: 9, fontWeight: 900,
                              background: parent.active ? G : '#333',
                              color: parent.active ? '#000' : '#888',
                              letterSpacing: '0.15em'
                            }}
                            className="uppercase transition-all hover:opacity-80">
                            {parent.active ? '● ATIVO' : '○ OCULTO'}
                          </button>
                          <button onClick={() => del('categories', parent.id)}
                            className="px-3 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>

                        {/* Drop zone label */}
                        {isOver && (
                          <div style={{ border: `1px dashed ${G}`, color: G }}
                            className="text-center text-[9px] font-black uppercase tracking-widest py-2">
                            Soltar aqui como subcategoria
                          </div>
                        )}

                        {/* Subcategorias */}
                        {children.length > 0 && (
                          <div className="flex flex-col gap-1.5 mt-1" style={{ borderTop: `1px solid ${BOR}`, paddingTop: 12 }}>
                            {children.map(sub => (
                              <div key={sub.id}
                                draggable
                                onDragStart={() => setDragging(sub.id)}
                                onDragEnd={() => { setDragging(null); setDragOver(null); }}
                                style={{
                                  background: dragging === sub.id ? 'rgba(34,197,94,0.1)' : S,
                                  border: `1px solid ${dragging === sub.id ? G : BOR}`,
                                  cursor: 'grab',
                                  opacity: sub.active ? 1 : 0.4,
                                }}
                                className="flex items-center justify-between px-3 py-2 gap-2 group/sub">
                                <div className="flex items-center gap-2">
                                  <span className="material-symbols-outlined text-xs text-white/20">drag_indicator</span>
                                  <span className="material-symbols-outlined text-xs" style={{ color: sub.active ? G : '#555' }}>{sub.icon}</span>
                                  <span className="text-[10px] font-bold uppercase tracking-wider">{sub.name}</span>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                  <button onClick={() => toggleActive(sub)}
                                    className="material-symbols-outlined text-xs transition-colors"
                                    style={{ color: sub.active ? G : '#555' }}>
                                    {sub.active ? 'visibility' : 'visibility_off'}
                                  </button>
                                  <button onClick={() => del('categories', sub.id)}
                                    className="material-symbols-outlined text-xs text-red-500/50 hover:text-red-500 transition-colors">
                                    close
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Bot label */}
                        <p className="text-[9px] text-white/15 font-bold uppercase tracking-widest text-center">
                          {isOver ? '' : 'Arraste subcats aqui'}
                        </p>
                      </div>
                    );
                  })}

                  {/* Categorias soltas (sem pai válido) */}
                  {free.length > 0 && (
                    <div style={{ border: `2px dashed ${BOR}`, minWidth: 200 }} className="p-4">
                      <p style={{ color: 'rgba(255,255,255,0.3)' }} className="text-[9px] font-black uppercase tracking-widest mb-3">Categorias Orphans</p>
                      {free.map(c => (
                        <div key={c.id}
                          draggable
                          onDragStart={() => setDragging(c.id)}
                          onDragEnd={() => { setDragging(null); setDragOver(null); }}
                          style={{ border: `1px solid ${BOR}`, cursor: 'grab' }}
                          className="flex items-center gap-2 p-2 mb-2">
                          <span className="material-symbols-outlined text-sm text-white/30">{c.icon}</span>
                          <span className="text-[10px] font-bold uppercase">{c.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════ ABA BANNERS ════════════════ */}
        {activeTab === 'banners' && (
          <div className="grid grid-cols-2 gap-6">
            <div style={cardStyle} className="p-6">
              <h3 className="font-black uppercase tracking-tighter text-base mb-6">Novo Banner</h3>
              <form onSubmit={addBanner} className="flex flex-col gap-4">
                <input required placeholder="Título" value={newBanner.title}
                  onChange={e => setNewBanner({...newBanner, title: e.target.value})}
                  style={inpStyle} className={`${inp} w-full`} />
                <input placeholder="Link (/categoria/...)" value={newBanner.link}
                  onChange={e => setNewBanner({...newBanner, link: e.target.value})}
                  style={inpStyle} className={`${inp} w-full`} />
                <div style={{ border: `2px dashed ${file ? G : BOR}`, background: S2 }}
                  className="relative p-8 flex flex-col items-center gap-2 cursor-pointer">
                  <span className="material-symbols-outlined text-2xl text-white/20">photo</span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Imagem do Banner (16:9)</p>
                  {file && <p style={{ color: G }} className="text-[10px] font-bold">{file.name}</p>}
                  <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <button type="submit" disabled={loading} style={{ background: G }}
                  className="py-4 text-black font-black uppercase tracking-widest text-[10px] hover:opacity-90 transition-opacity">
                  {loading ? 'Enviando...' : 'Adicionar Banner'}
                </button>
              </form>
            </div>

            <div style={cardStyle} className="p-6 max-h-[85vh] overflow-y-auto">
              <h3 className="font-black uppercase tracking-tighter text-base mb-6">Banners Ativos ({banners.length})</h3>
              <div className="flex flex-col gap-3">
                {banners.map(b => (
                  <div key={b.id} style={{ border: `1px solid ${BOR}` }} className="group">
                    <div className="h-28 overflow-hidden">
                      {b.image && <img src={b.image} className="w-full h-full object-cover" />}
                    </div>
                    <div style={{ borderTop: `1px solid ${BOR}` }} className="flex items-center justify-between p-3">
                      <p className="text-xs font-bold uppercase tracking-widest">{b.title}</p>
                      <button onClick={() => del('banners', b.id)} className="text-red-500 hover:bg-red-500 hover:text-white p-1 transition-all">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════ ABA CONFIGURAÇÕES ════════════════ */}
        {activeTab === 'configuracoes' && (
          <div style={cardStyle} className="p-8 max-w-lg">
            <h3 className="font-black uppercase tracking-tighter text-base mb-8">Configurações Globais</h3>
            <form onSubmit={saveSettings} className="flex flex-col gap-5">
              <div>
                <label style={{ color: G }} className="text-[9px] font-black uppercase tracking-widest block mb-2">WhatsApp (com DDI)</label>
                <input placeholder="5511999999999" value={settings.whatsapp}
                  onChange={e => setSettings({...settings, whatsapp: e.target.value})}
                  style={inpStyle} className={`${inp} w-full`} />
                <p className="text-white/20 text-[9px] mt-1 font-bold uppercase tracking-widest">Usado no botão flutuante e footer</p>
              </div>
              <div>
                <label style={{ color: G }} className="text-[9px] font-black uppercase tracking-widest block mb-2">Endereço</label>
                <input placeholder="Rua Exemplo, 123 – SP" value={settings.address}
                  onChange={e => setSettings({...settings, address: e.target.value})}
                  style={inpStyle} className={`${inp} w-full`} />
              </div>
              <button type="submit" disabled={loading} style={{ background: G }}
                className="py-4 mt-4 text-black font-black uppercase tracking-widest text-[10px] hover:opacity-90 transition-opacity">
                Salvar Configurações
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}
