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



import { CustomIconsList, CustomIcon } from '../components/CustomIcons';

const G = '#22c55e';

// Funcao de renderizar icone, fallback para pacote
const ri = icon => <CustomIcon name={icon || 'misc'} className="w-6 h-6" />;

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
    name:'', price:'', promoPrice:'', category:'', brand:'', description:'', status:'ativo', featured:true, sizes:[],
  });
  const [newCat, setNewCat]         = useState({ name:'', icon:'tshirt', parentId:null });
  const [newBanner, setNewBanner]   = useState({ title:'', link:'' });
  const [selectedCats, setSelectedCats] = useState(new Set());

  // ─── Estado da tab Produtos ────────────────────────────────────────────────
  const [prodSearch,    setProdSearch]    = useState('');
  const [prodCatFilter, setProdCatFilter] = useState('__all__');
  const [selectedProds, setSelectedProds] = useState(new Set());
  const [editingProd,   setEditingProd]   = useState(null); // produto sendo editado no modal

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

  // ─── Seleção múltipla de produtos ──────────────────────────────────────────
  const toggleSelectProd = id => {
    const next = new Set(selectedProds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedProds(next);
  };

  const deleteSelectedProds = async () => {
    if (!window.confirm(`Excluir ${selectedProds.size} produto(s)?`)) return;
    setLoading(true);
    for (const id of Array.from(selectedProds)) {
      await deleteDoc(doc(db, 'products', id));
    }
    setSelectedProds(new Set());
    await loadAll();
    setLoading(false);
  };

  // ─── Toggle ativo/inativo produto ─────────────────────────────────────────
  const toggleProdActive = async p => {
    const next = p.status === 'ativo' ? 'inativo' : 'ativo';
    await setDoc(doc(db, 'products', p.id), { ...p, status: next });
    loadAll();
  };

  // ─── Atualizar produto no modal ───────────────────────────────────────────
  const updateProduct = async e => {
    e.preventDefault(); setLoading(true);
    let imageUrl = editingProd.image;
    // Se o user escolheu nova foto no modal
    if (editingProd._newFile) {
      const uploaded = await uploadCloud(editingProd._newFile);
      if (uploaded) imageUrl = uploaded;
    }
    await setDoc(doc(db, 'products', editingProd.id), {
      ...editingProd,
      image: imageUrl,
      price: Number(editingProd.price),
      promoPrice: editingProd.promoPrice ? Number(editingProd.promoPrice) : null,
      _newFile: undefined,
    });
    setEditingProd(null);
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

  // ─── Compressão Inteligente: Quadrado 1:1 com padding de cor de fundo ───────
  // Detecta a cor de fundo pelos cantos e preenche sem cortar nada
  const compressToWebP = (file, quality = 0.82) => new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const ow = img.width;
      const oh = img.height;

      // ── Passo 1: Detectar a cor de fundo pelos 4 cantos ──────────────────
      // Pinta a imagem em um canvas temporário para ler os pixels
      const tmpCanvas = document.createElement('canvas');
      tmpCanvas.width = ow; tmpCanvas.height = oh;
      const tmpCtx = tmpCanvas.getContext('2d');
      tmpCtx.drawImage(img, 0, 0);

      // Amostra os pixels das 4 esquinas (área 5x5 de cada canto)
      const sampleCorner = (x, y) => {
        try {
          const d = tmpCtx.getImageData(x, y, 5, 5).data;
          let r = 0, g = 0, b = 0, count = 0;
          for (let i = 0; i < d.length; i += 4) {
            // Ignora pixels totalmente transparentes
            if (d[i + 3] > 10) { r += d[i]; g += d[i+1]; b += d[i+2]; count++; }
          }
          if (count === 0) return [245, 245, 245]; // fallback branco-off
          return [Math.round(r/count), Math.round(g/count), Math.round(b/count)];
        } catch { return [245, 245, 245]; }
      };

      const corners = [
        sampleCorner(0, 0),
        sampleCorner(Math.max(0, ow-5), 0),
        sampleCorner(0, Math.max(0, oh-5)),
        sampleCorner(Math.max(0, ow-5), Math.max(0, oh-5)),
      ];

      // Média das 4 esquinas = cor de fundo
      const bg = corners.reduce(
        (acc, c) => [acc[0]+c[0], acc[1]+c[1], acc[2]+c[2]],
        [0, 0, 0]
      ).map(v => Math.round(v / corners.length));

      const bgColor = `rgb(${bg[0]},${bg[1]},${bg[2]})`;

      // ── Passo 2: Criar canvas quadrado com tamanho máximo 1080px ─────────
      const MAX = 1080;
      const side = Math.min(MAX, Math.max(ow, oh));
      const canvas = document.createElement('canvas');
      canvas.width = side; canvas.height = side;
      const ctx = canvas.getContext('2d');

      // Preenche fundo com a cor detectada
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, side, side);

      // ── Passo 3: Escalar a imagem para caber no quadrado (object-fit: contain) ──
      const scale = Math.min(side / ow, side / oh);
      const dw = Math.round(ow * scale);
      const dh = Math.round(oh * scale);
      const dx = Math.round((side - dw) / 2);
      const dy = Math.round((side - dh) / 2);

      ctx.drawImage(img, dx, dy, dw, dh);

      // ── Passo 4: Exportar como WebP ──────────────────────────────────────
      canvas.toBlob(blob => resolve(blob), 'image/webp', quality);
    };

    img.onerror = () => {
      // Fallback: se não conseguiu processar, sobe o arquivo original
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });


  const uploadCloud = async f => {
    const webpBlob = await compressToWebP(f);
    const fd = new FormData();
    fd.append('file', webpBlob, 'image.webp');
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
      sizes: newProduct.sizes || [],
    });
    setNewProduct({ name:'', price:'', promoPrice:'', category:'', brand:'', description:'', status:'ativo', featured:true, sizes:[] });
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

  // ─── Produtos filtrados ───────────────────────────────────────────────────
  const filteredProds = products.filter(p => {
    const matchCat = prodCatFilter === '__all__' || p.category === prodCatFilter;
    const q = prodSearch.toLowerCase();
    const matchQ = !q ||
      (p.name  || '').toLowerCase().includes(q) ||
      (p.brand || '').toLowerCase().includes(q) ||
      String(p.price).includes(q) ||
      String(p.promoPrice || '').includes(q) ||
      (p.category || '').toLowerCase().includes(q);
    return matchCat && matchQ;
  });

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

  const inp = 'p-2.5 rounded-md text-sm text-white outline-none w-full bg-[#1a1a1a] border border-[#2a2a2a] focus:border-green-500 transition-colors';

  // Tamanhos disponíveis
  const SIZE_OPTIONS = ['PP','P','M','G','GG','XG','U'];
  const toggleSize = (target, sz) => {
    const cur = target.sizes || [];
    const next = cur.includes(sz) ? cur.filter(s => s !== sz) : [...cur, sz];
    return next;
  };
    {id:'produtos',      label:'Produtos',      icon:'apparel'},
    {id:'categorias',    label:'Categorias',    icon:'category'},
    {id:'banners',       label:'Banners',       icon:'photo_library'},
    {id:'layout',        label:'Site Builder',  icon:'dashboard'},
    {id:'configuracoes', label:'Config',        icon:'settings'},
  ];

  return (
    <div className="min-h-screen flex text-white bg-[#0a0a0a]">

      {/* Sidebar - cantos menos arredondados */}
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
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[11px] font-black uppercase tracking-wider text-left transition-all"
              style={activeTab===t.id?{background:G,color:'#000'}:{color:'rgba(255,255,255,0.4)'}}>
              <span className="material-symbols-outlined text-base">{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-[#1e1e1e]">
          <button onClick={()=>signOut(auth)} className="w-full py-2.5 rounded-md text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 transition-all">
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
          <div className="flex flex-col gap-4">

            {/* Barra superior: busca + ações bulk */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[220px]">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#555] text-lg">search</span>
                <input
                  placeholder="Buscar por nome, marca, preço..."
                  value={prodSearch}
                  onChange={e=>setProdSearch(e.target.value)}
                  className="pl-10 pr-4 py-2.5 rounded-md text-sm text-white outline-none w-full bg-[#1a1a1a] border border-[#2a2a2a] focus:border-green-500 transition-colors"
                />
              </div>
              {selectedProds.size > 0 && (
                <button onClick={deleteSelectedProds} disabled={loading}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-md text-[10px] font-black uppercase tracking-widest transition-colors">
                  <span className="material-symbols-outlined text-sm">delete_sweep</span>
                  Excluir {selectedProds.size}
                </button>
              )}
            </div>

            {/* Abas por categoria */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={()=>setProdCatFilter('__all__')}
                className="px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all"
                style={prodCatFilter==='__all__'?{background:G,color:'#000'}:{background:'#1a1a1a',color:'#888',border:'1px solid #2a2a2a'}}>
                Todos ({products.length})
              </button>
              {categories.map(cat=>(
                <button key={cat.id}
                  onClick={()=>setProdCatFilter(cat.id)}
                  className="px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all"
                  style={prodCatFilter===cat.id?{background:G,color:'#000'}:{background:'#1a1a1a',color:'#888',border:'1px solid #2a2a2a'}}>
                  {cat.name} ({products.filter(p=>p.category===cat.id).length})
                </button>
              ))}
            </div>

            {/* Grid de produtos */}
            <div className="grid grid-cols-5 gap-4">
              {/* Lista ─ 2 colunas */}
              <div className="col-span-3 p-3 rounded-md bg-[#111] border border-[#1e1e1e] max-h-[75vh] overflow-y-auto">
                {/* Header selecionar tudo */}
                {filteredProds.length > 0 && (
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <input type="checkbox"
                      checked={filteredProds.length > 0 && filteredProds.every(p => selectedProds.has(p.id))}
                      onChange={() => {
                        const allIds = filteredProds.map(p=>p.id);
                        const allSelected = allIds.every(id=>selectedProds.has(id));
                        const next = new Set(selectedProds);
                        allIds.forEach(id => allSelected ? next.delete(id) : next.add(id));
                        setSelectedProds(next);
                      }}
                      className="w-4 h-4 accent-red-500 cursor-pointer"
                    />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#555]">
                      {filteredProds.length} produto(s)
                    </span>
                  </div>
                )}

                {filteredProds.length === 0 && (
                  <div className="py-16 text-center">
                    <span className="material-symbols-outlined text-5xl text-[#2a2a2a]">inventory_2</span>
                    <p className="text-xs font-bold uppercase tracking-widest mt-3 text-[#333]">Nenhum produto encontrado</p>
                  </div>
                )}

                {/* 2 colunas - linhas compactas horizontais */}
                <div className="grid grid-cols-2 gap-1.5">
                  {filteredProds.map(p=>(
                    <div key={p.id}
                      className="flex items-center gap-2 p-2 border transition-all"
                      style={{
                        background: selectedProds.has(p.id) ? 'rgba(239,68,68,0.07)' : '#191919',
                        borderColor: selectedProds.has(p.id) ? '#ef4444' : '#242424',
                        borderRadius: 6
                      }}>

                      {/* Checkbox */}
                      <input type="checkbox"
                        checked={selectedProds.has(p.id)}
                        onChange={()=>toggleSelectProd(p.id)}
                        className="w-3.5 h-3.5 accent-red-500 shrink-0 cursor-pointer"
                      />

                      {/* Thumbnail pequeno */}
                      <div className="w-8 h-10 shrink-0 bg-[#222] overflow-hidden" style={{borderRadius:4}}>
                        {p.image && <img src={p.image} className="w-full h-full object-cover"/>}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-[10px] uppercase tracking-tight truncate text-white" style={{opacity:p.status==='ativo'?1:0.45}}>
                          {p.name}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {p.promoPrice
                            ? <><span style={{color:G}} className="font-black text-[9px]">R${Number(p.promoPrice).toFixed(0)}</span><span className="line-through text-[8px] text-[#444]">R${Number(p.price).toFixed(0)}</span></>
                            : <span className="font-bold text-[9px] text-[#777]">R${Number(p.price).toFixed(0)}</span>}
                        </div>
                      </div>

                      {/* Ações compactas */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={p.status==='ativo'} onChange={()=>toggleProdActive(p)} />
                          <div className="w-6 h-3 bg-[#333] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1.5px] after:left-[1.5px] after:bg-white after:border after:rounded-full after:h-2 after:w-2 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                        <div className="flex gap-0.5">
                          <button onClick={()=>setEditingProd({...p})} className="p-0.5 text-[#444] hover:text-white transition-colors">
                            <span className="material-symbols-outlined" style={{fontSize:13}}>edit</span>
                          </button>
                          <button onClick={()=>remove('products',p.id)} className="p-0.5 text-[#444] hover:text-red-500 transition-colors">
                            <span className="material-symbols-outlined" style={{fontSize:13}}>delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formulário adicionar/editar */}
              <div className="col-span-2">
                {editingProd ? (
                  /* ── Modal de Edição ── */
                  <div className="p-4 rounded-md bg-[#111] border border-green-500/30 max-h-[75vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-black uppercase tracking-tighter text-sm" style={{color:G}}>Editando Produto</h3>
                      <button onClick={()=>setEditingProd(null)} className="text-[#555] hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                    <form onSubmit={updateProduct} className="flex flex-col gap-2.5">
                      <input required placeholder="Nome" value={editingProd.name} onChange={e=>setEditingProd({...editingProd,name:e.target.value})} className={inp}/>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{color:G}}>Preço</label>
                          <input required type="number" step="0.01" value={editingProd.price} onChange={e=>setEditingProd({...editingProd,price:e.target.value})} className={inp}/>
                        </div>
                        <div>
                          <label className="text-[9px] font-black uppercase tracking-widest block mb-1 text-red-400">Promo</label>
                          <input type="number" step="0.01" value={editingProd.promoPrice||''} onChange={e=>setEditingProd({...editingProd,promoPrice:e.target.value})} className={inp}/>
                        </div>
                      </div>
                      <select value={editingProd.category} onChange={e=>setEditingProd({...editingProd,category:e.target.value})} className={inp}>
                        <option value="">Categoria...</option>
                        {parentCats.map(c=>(
                          <optgroup key={c.id} label={c.name}>
                            <option value={c.id}>{c.name} (geral)</option>
                            {childrenOf(c.id).map(s=><option key={s.id} value={s.id}>↳ {s.name}</option>)}
                          </optgroup>
                        ))}
                      </select>
                      <input placeholder="Marca" value={editingProd.brand||''} onChange={e=>setEditingProd({...editingProd,brand:e.target.value})} className={inp}/>
                      <textarea rows={2} placeholder="Descrição" value={editingProd.description||''} onChange={e=>setEditingProd({...editingProd,description:e.target.value})} className={`${inp} resize-none`}/>
                      {/* Tamanhos */}
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{color:G}}>Tamanhos</label>
                        <div className="flex flex-wrap gap-1">
                          {SIZE_OPTIONS.map(sz=>(
                            <button key={sz} type="button"
                              onClick={()=>setEditingProd({...editingProd,sizes:toggleSize(editingProd,sz)})}
                              className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all"
                              style={(editingProd.sizes||[]).includes(sz)?{background:G,color:'#000'}:{background:'#1e1e1e',color:'#555',border:'1px solid #2a2a2a'}}>
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={editingProd.featured} onChange={e=>setEditingProd({...editingProd,featured:e.target.checked})} className="w-4 h-4 accent-green-500"/>
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{color:G}}>Destaque</span>
                      </label>
                      {/* Trocar foto */}
                      <div className="relative p-3 rounded-md flex items-center gap-3 cursor-pointer"
                        style={{border:`1px dashed ${editingProd._newFile?G:'#2a2a2a'}`,background:'#141414'}}>
                        {editingProd.image && <img src={editingProd.image} className="w-10 h-12 object-cover rounded shrink-0"/>}
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#555]">Trocar foto</p>
                          {editingProd._newFile && <p className="text-[10px] font-bold mt-0.5" style={{color:G}}>{editingProd._newFile.name}</p>}
                          {editingProd._newFile && <p className="text-[8px] text-[#555] mt-0.5">Será comprimida para WebP</p>}
                        </div>
                        <input type="file" accept="image/*" onChange={e=>setEditingProd({...editingProd,_newFile:e.target.files[0]})} className="absolute inset-0 opacity-0 cursor-pointer"/>
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" disabled={loading} className="flex-1 py-3 rounded-md text-black font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-opacity" style={{background:G}}>
                          {loading?'Salvando...':'Salvar'}
                        </button>
                        <button type="button" onClick={()=>setEditingProd(null)} className="py-3 px-4 rounded-md text-[#555] font-black text-[10px] uppercase tracking-widest border border-[#2a2a2a] hover:border-white transition-all">
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  /* ── Formulário: Adicionar Produto ── */
                  <div className="p-4 rounded-md bg-[#111] border border-[#1e1e1e] max-h-[75vh] overflow-y-auto">
                    <h3 className="font-black uppercase tracking-tighter text-sm mb-3">Adicionar Produto</h3>
                    <form onSubmit={addProduct} className="flex flex-col gap-2.5">
                      <input required placeholder="Nome do Produto" value={newProduct.name} onChange={e=>setNewProduct({...newProduct,name:e.target.value})} className={inp}/>
                      <div className="grid grid-cols-2 gap-2">
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
                      <textarea required rows={2} placeholder="Descrição..." value={newProduct.description} onChange={e=>setNewProduct({...newProduct,description:e.target.value})} className={`${inp} resize-none`}/>
                      {/* Tamanhos */}
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{color:G}}>Tamanhos Disponíveis</label>
                        <div className="flex flex-wrap gap-1">
                          {SIZE_OPTIONS.map(sz=>(
                            <button key={sz} type="button"
                              onClick={()=>setNewProduct({...newProduct,sizes:toggleSize(newProduct,sz)})}
                              className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all"
                              style={(newProduct.sizes||[]).includes(sz)?{background:G,color:'#000'}:{background:'#1e1e1e',color:'#555',border:'1px solid #2a2a2a'}}>
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={newProduct.featured} onChange={e=>setNewProduct({...newProduct,featured:e.target.checked})} className="w-4 h-4 accent-green-500"/>
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{color:G}}>Destaque</span>
                      </label>
                      {/* Upload de fotos com preview e reordenação */}
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{color:G}}>Fotos (arraste para reordenar)</label>
                        <div className="relative p-4 rounded-md flex flex-col items-center gap-2 cursor-pointer transition-all"
                          style={{border:`2px dashed ${files.length?G:'#2a2a2a'}`,background:'#141414'}}>
                          <span className="material-symbols-outlined text-2xl text-[#333]">upload</span>
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#444]">Até 7 fotos · Auto WebP</p>
                          <input type="file" multiple accept="image/*" onChange={e=>setFiles(Array.from(e.target.files).slice(0,7))} className="absolute inset-0 opacity-0 cursor-pointer"/>
                        </div>
                        {/* Preview com reordenação */}
                        {files.length > 0 && (
                          <div className="mt-2 grid grid-cols-4 gap-1.5">
                            {files.map((f,i)=>(
                              <div key={i} className="relative group">
                                <img src={URL.createObjectURL(f)} className="w-full aspect-square object-cover rounded" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                  {i > 0 && (
                                    <button type="button"
                                      onClick={()=>{
                                        const next=[...files];
                                        [next[i-1],next[i]]=[next[i],next[i-1]];
                                        setFiles(next);
                                      }}
                                      className="p-0.5 bg-black/60 rounded text-white">
                                      <span className="material-symbols-outlined text-xs">arrow_back</span>
                                    </button>
                                  )}
                                  {i < files.length-1 && (
                                    <button type="button"
                                      onClick={()=>{
                                        const next=[...files];
                                        [next[i],next[i+1]]=[next[i+1],next[i]];
                                        setFiles(next);
                                      }}
                                      className="p-0.5 bg-black/60 rounded text-white">
                                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                    </button>
                                  )}
                                  <button type="button"
                                    onClick={()=>setFiles(files.filter((_,fi)=>fi!==i))}
                                    className="p-0.5 bg-red-500/80 rounded text-white">
                                    <span className="material-symbols-outlined text-xs">close</span>
                                  </button>
                                </div>
                                {i===0 && <span className="absolute bottom-1 left-1 text-[8px] font-black uppercase" style={{color:G}}>Principal</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button type="submit" disabled={loading}
                        className="py-3 rounded-md text-black font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 mt-1 hover:opacity-90 transition-opacity"
                        style={{background:loading?'#333':G,color:'#000'}}>
                        {loading?<><span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"/>Comprimindo e enviando...</>:'Publicar no Catálogo'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
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
                    {CustomIconsList.map(ic=>(
                      <button key={ic.id} type="button" title={ic.label}
                        onClick={()=>setNewCat({...newCat,icon:ic.id})}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-lg transition-all text-white"
                        style={newCat.icon===ic.id?{background:'#22c55e',color:'#000',transform:'scale(1.15)'}:{background:'#252525'}}>
                        <CustomIcon name={ic.id} className="w-5 h-5" />
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

        {/* ══ SITE BUILDER (LAYOUT) ══ */}
        {activeTab==='layout' && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-4 flex flex-col gap-4">
              <div className="p-5 rounded-md bg-[#111] border border-[#1e1e1e]">
                <h3 className="text-xs font-black uppercase tracking-widest mb-4">Adicionar Seção</h3>
                <div className="flex flex-col gap-2">
                  <button onClick={async () => {
                    const title = prompt("Título da Coleção (ex: Novidades):");
                    if(title) {
                      await addDoc(collection(db, 'home_layout'), { 
                        type: 'collection', 
                        title, 
                        order: (data.home_layout?.length || 0),
                        active: true,
                        filter: 'featured'
                      });
                    }
                  }} className="w-full p-3 rounded-md bg-[#1a1a1a] border border-[#2a2a2a] text-[10px] font-bold uppercase tracking-widest hover:border-green-500 transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    + Coleção de Produtos
                  </button>
                  <button onClick={async () => {
                      await addDoc(collection(db, 'home_layout'), { 
                        type: 'categories', 
                        title: 'Navegar por',
                        order: (data.home_layout?.length || 0),
                        active: true
                      });
                  }} className="w-full p-3 rounded-md bg-[#1a1a1a] border border-[#2a2a2a] text-[10px] font-bold uppercase tracking-widest hover:border-green-500 transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">category</span>
                    + Carrossel de Categorias
                  </button>
                  <button onClick={async () => {
                      await addDoc(collection(db, 'home_layout'), { 
                        type: 'hero_banner', 
                        order: (data.home_layout?.length || 0),
                        active: true
                      });
                  }} className="w-full p-3 rounded-md bg-[#1a1a1a] border border-[#2a2a2a] text-[10px] font-bold uppercase tracking-widest hover:border-green-500 transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">featured_video</span>
                    + Banner Hero Principal
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-md bg-[#111] border border-[#1e1e1e]">
                <h3 className="text-xs font-black uppercase tracking-widest mb-4">Estrutura da Home</h3>
                <div className="flex flex-col gap-2">
                  {(data.home_layout || []).map((sec, idx) => (
                    <div key={sec.id} className="flex items-center gap-3 p-3 rounded-md bg-[#1a1a1a] border border-[#2a2a2a] group">
                      <div className="flex flex-col">
                        <button disabled={idx===0} onClick={async () => {
                          const prev = data.home_layout[idx-1];
                          await setDoc(doc(db, 'home_layout', sec.id), { ...sec, order: idx-1 });
                          await setDoc(doc(db, 'home_layout', prev.id), { ...prev, order: idx });
                        }} className="p-0.5 hover:text-green-500 disabled:opacity-30">
                          <span className="material-symbols-outlined text-xs">keyboard_arrow_up</span>
                        </button>
                        <button disabled={idx===(data.home_layout?.length || 0)-1} onClick={async () => {
                          const next = data.home_layout[idx+1];
                          await setDoc(doc(db, 'home_layout', sec.id), { ...sec, order: idx+1 });
                          await setDoc(doc(db, 'home_layout', next.id), { ...next, order: idx });
                        }} className="p-0.5 hover:text-green-500 disabled:opacity-30">
                          <span className="material-symbols-outlined text-xs">keyboard_arrow_down</span>
                        </button>
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-tighter text-white">
                          {sec.type === 'collection' ? `Coleção: ${sec.title}` : 
                           sec.type === 'hero_banner' ? 'Banner Principal' : 
                           sec.type === 'categories' ? 'Carr. Categorias' : sec.type}
                        </p>
                      </div>
                      <button onClick={() => deleteDoc(doc(db, 'home_layout', sec.id))} className="text-[#444] hover:text-red-500">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview Simulation */}
            <div className="col-span-8 p-6 rounded-md bg-[#000] border border-[#1e1e1e] min-h-[80vh]">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-green-500">Preview (Visualização)</h3>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
              </div>

              <div className="max-w-[375px] mx-auto border-4 border-[#1a1a1a] rounded-[2.5rem] overflow-hidden bg-[#131313] shadow-2xl">
                <div className="h-6 bg-[#1a1a1a]"></div>
                <div className="p-4 flex justify-between items-center border-b border-[#1a1a1a]">
                  <span className="material-symbols-outlined text-white text-sm">menu</span>
                  <span className="text-[10px] font-black uppercase tracking-tighter">PERIGOIMPORTZ</span>
                  <span className="material-symbols-outlined text-white text-sm">search</span>
                </div>
                
                <div className="overflow-y-auto h-[600px] no-scrollbar">
                  {(data.home_layout || []).map(sec => (
                    <div key={sec.id} className="border-b border-[#1a1a1a] relative">
                      {sec.type === 'hero_banner' && (
                        <div className="aspect-[3/4] bg-[#222] flex flex-col justify-end p-4">
                          <div className="h-2 w-12 bg-[#333] mb-2 rounded"></div>
                          <div className="h-6 w-3/4 bg-[#333] mb-4 rounded"></div>
                          <div className="h-8 w-24 bg-[#22c55e] rounded-sm"></div>
                        </div>
                      )}
                      {sec.type === 'categories' && (
                        <div className="p-4">
                          <p className="text-[8px] font-bold uppercase text-white/50 mb-3">Navegar por</p>
                          <div className="flex gap-2">
                            {[1,2,3].map(i => <div key={i} className="w-16 h-16 rounded bg-[#1a1a1a] shrink-0"></div>)}
                          </div>
                        </div>
                      )}
                      {sec.type === 'collection' && (
                        <div className="p-4">
                          <div className="mb-4">
                             <p className="text-sm font-black uppercase tracking-tighter text-white">{sec.title}</p>
                             <p className="text-[8px] text-white/40 uppercase">Curadoria</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                             {[1,2].map(i => (
                               <div key={i} className="flex flex-col gap-2">
                                 <div className="aspect-square bg-[#1a1a1a] rounded-md"></div>
                                 <div className="h-1.5 w-full bg-[#1a1a1a] rounded"></div>
                                 <div className="h-1.5 w-1/2 bg-[#1a1a1a] rounded"></div>
                               </div>
                             ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
