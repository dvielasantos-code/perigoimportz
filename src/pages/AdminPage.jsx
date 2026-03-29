import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';

// ─── 28 categorias de moda ──────────────────────────────────────────────────
const PRESET = [
  // Tops
  { id: 'camisetas',      name: 'Camisetas',      icon: 'apparel',      parentId: null },
  { id: 'regatas',        name: 'Regatas',        icon: 'dry_cleaning', parentId: 'camisetas' },
  { id: 'longsleeve',     name: 'Long Sleeve',    icon: 'apparel',      parentId: 'camisetas' },
  { id: 'oversized',      name: 'Oversized',      icon: 'apparel',      parentId: 'camisetas' },
  { id: 'polo',           name: 'Polo',           icon: 'apparel',      parentId: 'camisetas' },
  // Bottoms
  { id: 'calcas',         name: 'Calças',         icon: 'laundry',      parentId: null },
  { id: 'jogger',         name: 'Jogger',         icon: 'laundry',      parentId: 'calcas' },
  { id: 'cargo',          name: 'Cargo',          icon: 'laundry',      parentId: 'calcas' },
  { id: 'jeans',          name: 'Jeans',          icon: 'laundry',      parentId: 'calcas' },
  { id: 'shorts',         name: 'Shorts',         icon: 'laundry',      parentId: 'calcas' },
  { id: 'moletom-calca',  name: 'Moletom Calça',  icon: 'laundry',      parentId: 'calcas' },
  // Outerwear
  { id: 'jaquetas',       name: 'Jaquetas',       icon: 'checkroom',    parentId: null },
  { id: 'corta-vento',    name: 'Corta Vento',    icon: 'checkroom',    parentId: 'jaquetas' },
  { id: 'bomber',         name: 'Bomber',         icon: 'checkroom',    parentId: 'jaquetas' },
  // Moletons
  { id: 'moletons',       name: 'Moletons',       icon: 'checkroom',    parentId: null },
  { id: 'moletom-zip',    name: 'Zip Up',         icon: 'checkroom',    parentId: 'moletons' },
  { id: 'crewneck',       name: 'Crewneck',       icon: 'checkroom',    parentId: 'moletons' },
  // Headwear
  { id: 'bone',           name: 'Bonés',          icon: 'hat',          parentId: null },
  { id: 'snapback',       name: 'Snapback',       icon: 'hat',          parentId: 'bone' },
  { id: 'dad-hat',        name: 'Dad Hat',        icon: 'hat',          parentId: 'bone' },
  // Footwear
  { id: 'tenis',          name: 'Tênis',          icon: 'steps',        parentId: null },
  // Accessories
  { id: 'acessorios',     name: 'Acessórios',     icon: 'diamond',      parentId: null },
  { id: 'colares',        name: 'Colares',        icon: 'diamond',      parentId: 'acessorios' },
  { id: 'pulseiras',      name: 'Pulseiras',      icon: 'diamond',      parentId: 'acessorios' },
  { id: 'cintos',         name: 'Cintos',         icon: 'diamond',      parentId: 'acessorios' },
  { id: 'oculos',         name: 'Óculos',         icon: 'eyeglasses',   parentId: 'acessorios' },
  { id: 'meias',          name: 'Meias',          icon: 'apparel',      parentId: 'acessorios' },
  // Outros
  { id: 'conjuntos',      name: 'Conjuntos',      icon: 'styler',       parentId: null },
];

const ICONS = [
  { id: 'apparel',      name: 'Camiseta'   },
  { id: 'dry_cleaning', name: 'Regata'     },
  { id: 'checkroom',    name: 'Jaqueta'    },
  { id: 'laundry',      name: 'Calça'      },
  { id: 'steps',        name: 'Tênis'      },
  { id: 'hat',          name: 'Boné'       },
  { id: 'diamond',      name: 'Acess.'     },
  { id: 'watch',        name: 'Relógio'    },
  { id: 'eyeglasses',   name: 'Óculos'     },
  { id: 'shopping_bag', name: 'Bolsa'      },
  { id: 'styler',       name: 'Conjunto'   },
];

const G = '#22c55e';

export default function AdminPage() {
  const [user, setUser]           = useState(null);
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [loginErr, setLoginErr]   = useState('');
  const [activeTab, setActiveTab] = useState('produtos');

  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners,    setBanners]    = useState([]);
  const [settings,   setSettings]   = useState({ whatsapp: '', address: '' });

  const [loading,     setLoading]    = useState(false);
  const [file,        setFile]       = useState(null);
  const [files,       setFiles]      = useState([]);
  const [popMsg,      setPopMsg]     = useState('');

  const [newProduct,  setNewProduct] = useState({
    name:'', price:'', promoPrice:'', category:'', brand:'', description:'', status:'ativo', featured:true,
  });
  const [newCat, setNewCat] = useState({ name:'', icon:'apparel', parentId:null });
  const [newBanner, setNewBanner] = useState({ title:'', link:'' });

  // ── Seleção para mover categoria ──────────────────────────────────────────
  const [selected, setSelected] = useState(null); // id do chip selecionado

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { setUser(u); if (u) loadAll(); });
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
    setCategories(cs.docs.map(d => ({ id: d.id, ...d.data() })));
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

  // ─── POPULAR: apaga tudo e recria com writes individuais ─────────────────
  const populateCats = async () => {
    if (!window.confirm(`Isso vai APAGAR todas as categorias e criar ${PRESET.length} novas. Confirmar?`)) return;
    setPopMsg('Apagando categorias anteriores...');

    // 1. Delete all existing
    const existing = await getDocs(collection(db, 'categories'));
    for (const d of existing.docs) {
      await deleteDoc(doc(db, 'categories', d.id));
    }

    // 2. Create parents first, then children (to avoid race condition)
    const parents  = PRESET.filter(c => !c.parentId);
    const children = PRESET.filter(c =>  c.parentId);

    let count = 0;
    for (const c of parents) {
      setPopMsg(`Criando ${c.name}... (${++count}/${PRESET.length})`);
      await setDoc(doc(db, 'categories', c.id), {
        id:       c.id,
        name:     c.name,
        icon:     c.icon,
        parentId: null,
        active:   true,
      });
    }
    for (const c of children) {
      setPopMsg(`Criando ${c.name}... (${++count}/${PRESET.length})`);
      await setDoc(doc(db, 'categories', c.id), {
        id:       c.id,
        name:     c.name,
        icon:     c.icon,
        parentId: c.parentId,
        active:   true,
      });
    }

    setPopMsg(`✓ ${PRESET.length} categorias criadas!`);
    await loadAll();
    setTimeout(() => setPopMsg(''), 3000);
  };

  // ─── Criar categoria manual ───────────────────────────────────────────────
  const addCat = async e => {
    e.preventDefault();
    if (!newCat.name.trim()) return;
    setLoading(true);
    const id = newCat.name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
    await setDoc(doc(db, 'categories', id), {
      id, name:newCat.name, icon:newCat.icon, parentId:newCat.parentId||null, active:true,
    });
    setNewCat({ name:'', icon:'apparel', parentId:null });
    await loadAll();
    setLoading(false);
  };

  const toggleActive = async cat => {
    await setDoc(doc(db, 'categories', cat.id), { ...cat, active:!cat.active });
    loadAll();
  };

  // ─── Mover categoria: clique no chip → clique no parent block ────────────
  const handleChipClick = (catId) => {
    setSelected(prev => prev === catId ? null : catId);
  };

  const assignToParent = async (parentId) => {
    if (!selected) return;
    if (selected === parentId) { setSelected(null); return; }
    const cat = categories.find(c => c.id === selected);
    if (!cat) return;
    // Prevent making a parent a child of its own child
    if (!cat.parentId) {
      const wouldCycle = childrenOf(cat.id).some(ch => ch.id === parentId);
      if (wouldCycle) { alert('Não é possível criar ciclo de categorias.'); return; }
    }
    await setDoc(doc(db, 'categories', selected), { ...cat, parentId });
    setSelected(null);
    await loadAll();
  };

  const makeRoot = async () => {
    if (!selected) return;
    const cat = categories.find(c => c.id === selected);
    if (!cat) return;
    await setDoc(doc(db, 'categories', selected), { ...cat, parentId: null });
    setSelected(null);
    await loadAll();
  };

  // ─── Produto ──────────────────────────────────────────────────────────────
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

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const parentCats  = categories.filter(c => !c.parentId);
  const childrenOf  = pid => categories.filter(c => c.parentId === pid);
  const selectedCat = categories.find(c => c.id === selected);

  // ─── Login ────────────────────────────────────────────────────────────────
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'#0a0a0a'}}>
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
        <form onSubmit={async e => { e.preventDefault(); try { await signInWithEmailAndPassword(auth,email,password); } catch { setLoginErr('Credenciais inválidas'); }}} className="flex flex-col gap-4">
          {loginErr && <p className="text-red-500 text-xs font-bold text-center">{loginErr}</p>}
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="p-3 rounded-xl text-sm text-white outline-none bg-[#1a1a1a] border border-[#333]" />
          <input type="password" placeholder="Senha" value={password} onChange={e=>setPassword(e.target.value)} className="p-3 rounded-xl text-sm text-white outline-none bg-[#1a1a1a] border border-[#333]" />
          <button type="submit" className="py-3 rounded-xl text-black font-black text-sm uppercase tracking-widest" style={{background:G}}>Entrar</button>
        </form>
      </div>
    </div>
  );

  // ─── Painel ───────────────────────────────────────────────────────────────
  const tabs = [
    {id:'produtos',label:'Produtos',icon:'apparel'},
    {id:'categorias',label:'Categorias',icon:'category'},
    {id:'banners',label:'Banners',icon:'photo_library'},
    {id:'configuracoes',label:'Config',icon:'settings'},
  ];
  const inp = 'p-3 rounded-xl text-sm text-white outline-none w-full bg-[#1a1a1a] border border-[#2a2a2a] focus:border-green-500 transition-colors';

  return (
    <div className="min-h-screen flex text-white" style={{background:'#0a0a0a'}}>

      {/* Sidebar */}
      <aside className="w-52 shrink-0 flex flex-col bg-[#111] border-r border-[#1e1e1e]">
        <div className="p-5 flex items-center gap-3 border-b border-[#1e1e1e]">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{background:G}}>
            <span className="text-black font-black text-xs">PI</span>
          </div>
          <div>
            <p className="font-black text-xs uppercase tracking-tighter">Studio</p>
            <p className="text-[9px] font-bold uppercase tracking-widest" style={{color:G}}>Admin · {categories.length} cats</p>
          </div>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {tabs.map(t => (
            <button key={t.id} onClick={()=>setActiveTab(t.id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider text-left transition-all"
              style={activeTab===t.id ? {background:G,color:'#000'} : {color:'rgba(255,255,255,0.4)'}}>
              <span className="material-symbols-outlined text-base">{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-[#1e1e1e]">
          <button onClick={()=>signOut(auth)} className="w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30">
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-y-auto" style={{maxHeight:'100vh'}}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter capitalize">{activeTab}</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{color:G}}>Perigoimportz · Control Panel</p>
          </div>
        </div>

        {/* ════ PRODUTOS ════ */}
        {activeTab==='produtos' && (
          <div className="grid grid-cols-5 gap-6">
            <div className="col-span-3 p-6 rounded-2xl bg-[#111] border border-[#222] max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-black uppercase tracking-tighter text-sm">Catálogo ({products.length})</h3>
              </div>
              <div className="flex flex-col gap-2">
                {products.length===0 && (
                  <div className="py-20 text-center">
                    <span className="material-symbols-outlined text-5xl text-[#2a2a2a]">inventory_2</span>
                    <p className="text-xs font-bold uppercase tracking-widest mt-3 text-[#333]">Catálogo vazio</p>
                  </div>
                )}
                {products.map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] group transition-all hover:border-green-500/30">
                    <div className="w-14 h-[72px] rounded-lg overflow-hidden shrink-0 bg-[#0a0a0a]">
                      {p.image && <img src={p.image} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-xs uppercase tracking-tight truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {p.promoPrice
                          ? <><span style={{color:G}} className="font-black text-[11px]">R$ {p.promoPrice}</span><span className="line-through text-[10px] text-[#444]">R$ {p.price}</span></>
                          : <span className="font-bold text-[11px] text-[#aaa]">R$ {p.price}</span>}
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
                <input required placeholder="Nome do Produto" value={newProduct.name} onChange={e=>setNewProduct({...newProduct,name:e.target.value})} className={inp} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{color:G}}>Preço</label>
                    <input required type="number" step="0.01" placeholder="199.90" value={newProduct.price} onChange={e=>setNewProduct({...newProduct,price:e.target.value})} className={inp} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest block mb-1 text-red-400">Promo</label>
                    <input type="number" step="0.01" placeholder="149.90" value={newProduct.promoPrice} onChange={e=>setNewProduct({...newProduct,promoPrice:e.target.value})} className={inp} />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{color:G}}>Categoria</label>
                  <select required value={newProduct.category} onChange={e=>setNewProduct({...newProduct,category:e.target.value})} className={inp}>
                    <option value="">Selecione...</option>
                    {parentCats.map(p => (
                      <optgroup key={p.id} label={p.name}>
                        <option value={p.id}>{p.name} (geral)</option>
                        {childrenOf(p.id).map(c => <option key={c.id} value={c.id}>↳ {c.name}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <input placeholder="Marca" value={newProduct.brand} onChange={e=>setNewProduct({...newProduct,brand:e.target.value})} className={inp} />
                <textarea required rows={3} placeholder="Descrição..." value={newProduct.description} onChange={e=>setNewProduct({...newProduct,description:e.target.value})} className={`${inp} resize-none`} />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newProduct.featured} onChange={e=>setNewProduct({...newProduct,featured:e.target.checked})} className="w-4 h-4 accent-green-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{color:G}}>Produto em Destaque</span>
                </label>
                <div className="relative p-5 rounded-xl flex flex-col items-center gap-2 cursor-pointer transition-all" style={{border:`2px dashed ${files.length?G:'#2a2a2a'}`,background:'#141414'}}>
                  <span className="material-symbols-outlined text-2xl text-[#333]">upload</span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#444]">Até 7 fotos</p>
                  {files.length>0 && <p className="text-[10px] font-bold" style={{color:G}}>{files.length} foto(s)</p>}
                  <input type="file" multiple accept="image/*" onChange={e=>setFiles(Array.from(e.target.files).slice(0,7))} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <button type="submit" disabled={loading} className="py-4 rounded-xl text-black font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 mt-2 hover:opacity-90 transition-opacity" style={{background:loading?'#333':G,color:loading?'#666':'#000'}}>
                  {loading ? <><span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />Enviando...</> : 'Publicar no Catálogo'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ════ CATEGORIAS ════ */}
        {activeTab==='categorias' && (
          <div className="flex flex-col gap-5">

            {/* Form criar + Popular */}
            <div className="p-6 rounded-2xl bg-[#111] border border-[#222]">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-black uppercase tracking-tighter text-sm">Nova Categoria</h3>
                <button onClick={populateCats} disabled={!!popMsg}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-black transition-all"
                  style={{border:`1px solid ${G}`,color:G}}>
                  <span className="material-symbols-outlined text-sm">bolt</span>
                  Popular {PRESET.length} Categorias Padrão
                </button>
              </div>
              {popMsg && (
                <div className="mb-4 px-4 py-3 rounded-xl text-[11px] font-bold" style={{background:'rgba(34,197,94,0.07)',border:`1px solid rgba(34,197,94,0.2)`,color:G}}>
                  {popMsg}
                </div>
              )}
              <form onSubmit={addCat} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{color:G}}>Nome</label>
                  <input required placeholder="Ex: Regatas" value={newCat.name} onChange={e=>setNewCat({...newCat,name:e.target.value})} className={inp} />
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
                  <div className="grid grid-cols-6 gap-1 p-1 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a]" style={{height:46}}>
                    {ICONS.map(ic=>(
                      <button key={ic.id} type="button" title={ic.name}
                        onClick={()=>setNewCat({...newCat,icon:ic.id})}
                        className="p-1 rounded-lg flex items-center justify-center transition-all"
                        style={newCat.icon===ic.id?{background:G,color:'#000'}:{color:'rgba(255,255,255,0.25)'}}>
                        <span className="material-symbols-outlined text-xs">{ic.id}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={loading} className="rounded-xl text-black font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-opacity" style={{background:G,height:46}}>
                  Criar
                </button>
              </form>
            </div>

            {/* Instrução */}
            {selected && (
              <div className="flex items-center justify-between px-5 py-4 rounded-2xl" style={{background:'rgba(34,197,94,0.08)',border:`2px solid ${G}`}}>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg" style={{color:G}}>touch_app</span>
                  <p className="font-black text-sm uppercase tracking-tighter" style={{color:G}}>
                    "{selectedCat?.name}" selecionado — clique em um bloco pai para mover
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={makeRoot} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white text-black hover:opacity-80 transition-all">
                    Tornar Principal
                  </button>
                  <button onClick={()=>setSelected(null)} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/20 hover:bg-white/10 transition-all">
                    Cancelar
                  </button>
                </div>
              </div>
            )}
            {!selected && categories.length>0 && (
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl" style={{background:'rgba(34,197,94,0.04)',border:'1px solid rgba(34,197,94,0.12)'}}>
                <span className="material-symbols-outlined text-base" style={{color:G}}>touch_app</span>
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{color:'rgba(34,197,94,0.7)'}}>
                  Clique em qualquer subcategoria para selecioná-la, depois clique no bloco pai para mover
                </p>
              </div>
            )}

            {/* Debug: total */}
            {categories.length>0 && (
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl text-[10px] font-bold" style={{background:'#1a1a1a',color:'#555'}}>
                <span className="material-symbols-outlined text-sm">info</span>
                {categories.length} categorias no Firestore · {parentCats.length} principais · {categories.length-parentCats.length} subcategorias
              </div>
            )}

            {/* Mapa baseado em clique */}
            {categories.length===0 ? (
              <div className="flex flex-col items-center justify-center py-32 rounded-2xl border-2 border-dashed border-[#222]">
                <span className="material-symbols-outlined text-5xl text-[#2a2a2a]">category</span>
                <p className="text-xs font-bold uppercase tracking-widest mt-4 text-[#333]">Nenhuma categoria</p>
                <p className="text-[10px] mt-2 text-[#2a2a2a]">Clique em "Popular {PRESET.length} Categorias Padrão" acima</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4 items-start">
                {parentCats.map(parent => {
                  const children = childrenOf(parent.id);
                  const isTarget = !!selected && selected !== parent.id && !categories.find(c=>c.id===selected)?.parentId === false;
                  const canReceive = !!selected && selected !== parent.id;

                  return (
                    <div key={parent.id}
                      onClick={() => canReceive && assignToParent(parent.id)}
                      className="flex flex-col gap-3 p-4 rounded-2xl transition-all"
                      style={{
                        background: canReceive ? 'rgba(34,197,94,0.06)' : '#141414',
                        border: canReceive ? `2px solid ${G}` : `2px solid ${parent.active?'rgba(34,197,94,0.2)':'#1e1e1e'}`,
                        minWidth:210, maxWidth:250,
                        cursor: canReceive ? 'pointer' : 'default',
                        transform: canReceive ? 'scale(1.02)' : 'scale(1)',
                      }}>

                      {canReceive && (
                        <div className="text-center text-[9px] font-black uppercase tracking-widest py-1.5 rounded-xl" style={{background:'rgba(34,197,94,0.1)',color:G}}>
                          Clique p/ adicionar aqui
                        </div>
                      )}

                      {/* Header */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{background:parent.active?G:'#222'}}>
                          <span className="material-symbols-outlined text-base" style={{color:parent.active?'#000':'#555'}}>{parent.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-xs uppercase tracking-tighter truncate" style={{opacity:parent.active?1:0.35}}>{parent.name}</p>
                          <p className="text-[9px] font-bold uppercase tracking-widest" style={{color:parent.active?G:'#3a3a3a'}}>
                            {children.length} sub{children.length!==1?'cats':'cat'}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button onClick={e=>{e.stopPropagation();toggleActive(parent);}}
                          className="flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                          style={{background:parent.active?G:'#1e1e1e',color:parent.active?'#000':'#555'}}>
                          {parent.active?'● Ativo':'○ Oculto'}
                        </button>
                        <button onClick={e=>{e.stopPropagation();remove('categories',parent.id);}}
                          className="px-2.5 rounded-lg transition-all text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>

                      {/* Sub chips — clicáveis para selecionar */}
                      {children.length>0 && (
                        <div className="flex flex-col gap-1.5 pt-3 border-t border-[#1e1e1e]">
                          {children.map(sub => (
                            <div key={sub.id}
                              onClick={e=>{e.stopPropagation(); handleChipClick(sub.id);}}
                              className="flex items-center justify-between px-3 py-2 rounded-xl group/sub transition-all cursor-pointer"
                              style={{
                                background: selected===sub.id ? 'rgba(34,197,94,0.15)' : '#1a1a1a',
                                border: `1px solid ${selected===sub.id?G:'#252525'}`,
                                opacity: sub.active?1:0.4,
                              }}>
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-xs" style={{color:selected===sub.id?G:'#444'}}>{sub.icon}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wide">{sub.name}</span>
                                {selected===sub.id && <span className="text-[8px] font-black uppercase tracking-widest" style={{color:G}}>selecionado</span>}
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                <button onClick={e=>{e.stopPropagation();toggleActive(sub);}}
                                  className="material-symbols-outlined text-xs transition-colors"
                                  style={{color:sub.active?G:'#555'}}>
                                  {sub.active?'visibility':'visibility_off'}
                                </button>
                                <button onClick={e=>{e.stopPropagation();remove('categories',sub.id);}}
                                  className="material-symbols-outlined text-xs text-red-500/50 hover:text-red-500 transition-colors">
                                  close
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {children.length===0 && !canReceive && (
                        <p className="text-[9px] font-bold uppercase tracking-widest text-center text-[#2a2a2a]">
                          Sem subcategorias
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ════ BANNERS ════ */}
        {activeTab==='banners' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#111] border border-[#222]">
              <h3 className="font-black uppercase tracking-tighter text-sm mb-5">Novo Banner</h3>
              <form onSubmit={addBanner} className="flex flex-col gap-4">
                <input required placeholder="Título" value={newBanner.title} onChange={e=>setNewBanner({...newBanner,title:e.target.value})} className={inp} />
                <input placeholder="Link (/categoria/...)" value={newBanner.link} onChange={e=>setNewBanner({...newBanner,link:e.target.value})} className={inp} />
                <div className="relative p-8 rounded-xl flex flex-col items-center gap-2 cursor-pointer transition-all" style={{border:`2px dashed ${file?G:'#2a2a2a'}`,background:'#141414'}}>
                  <span className="material-symbols-outlined text-2xl text-[#333]">photo</span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#444]">Imagem 16:9</p>
                  {file && <p className="text-[10px] font-bold" style={{color:G}}>{file.name}</p>}
                  <input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
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

        {/* ════ CONFIG ════ */}
        {activeTab==='configuracoes' && (
          <div className="p-8 rounded-2xl bg-[#111] border border-[#222] max-w-lg">
            <h3 className="font-black uppercase tracking-tighter text-sm mb-7">Configurações Globais</h3>
            <form onSubmit={saveSettings} className="flex flex-col gap-5">
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest block mb-2" style={{color:G}}>WhatsApp</label>
                <input placeholder="5511999999999" value={settings.whatsapp} onChange={e=>setSettings({...settings,whatsapp:e.target.value})} className={inp} />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest block mb-2" style={{color:G}}>Endereço</label>
                <input placeholder="Rua Exemplo, 123 – SP" value={settings.address} onChange={e=>setSettings({...settings,address:e.target.value})} className={inp} />
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
