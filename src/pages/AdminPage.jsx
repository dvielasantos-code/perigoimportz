import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, setDoc, query, where } from 'firebase/firestore';

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Controle de Abas
  const [activeTab, setActiveTab] = useState('produtos');

  // Dados
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [brands, setBrands] = useState([]);
  const [settings, setSettings] = useState({ whatsapp: '', address: '' });

  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]); // Multiple files

  // Estados dos Formulários
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    price: '', 
    promoPrice: '',
    category: 'camisetas', 
    brand: 'perigo', 
    description: '', 
    status: 'ativo', 
    featured: true,
    images: [] // Array for multiple images
  });
  
  const [newCategory, setNewCategory] = useState({ 
    id: '', 
    name: '', 
    icon: 'apparel',
    parentId: null,
    active: true
  });
  const [newBanner, setNewBanner] = useState({ title: '', link: '' });
  const [newBrand, setNewBrand] = useState({ name: '' });

  const ICON_LIST = [
    { id: 'apparel', name: 'Camiseta' },
    { id: 'steps', name: 'Tênis' },
    { id: 'diamond', name: 'Acessório' },
    { id: 'watch', name: 'Relógio' },
    { id: 'glasses', name: 'Óculos' },
    { id: 'hat', name: 'Boné' },
    { id: 'laundry', name: 'Calça' },
    { id: 'checkroom', name: 'Jaqueta' },
    { id: 'dry_cleaning', name: 'Regata' },
    { id: 'styler', name: 'Conjunto' },
    { id: 'shopping_bag', name: 'Bolsa' },
    { id: 'workspace_premium', name: 'Premium' }
  ];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      if(u) loadAllData();
    });
    return () => unsub();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch(err) {
      setError('Credenciais inválidas');
    }
  };

  const loadAllData = async () => {
    // Carrega tudo do Firestore pro painel
    const pSnap = await getDocs(collection(db, "products"));
    setProducts(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    const cSnap = await getDocs(collection(db, "categories"));
    setCategories(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    const bSnap = await getDocs(collection(db, "banners"));
    setBanners(bSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    const brSnap = await getDocs(collection(db, "brands"));
    setBrands(brSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    const sSnap = await getDocs(collection(db, "settings"));
    sSnap.docs.forEach(d => {
      if(d.id === 'global') setSettings(d.data());
    });
  };

  const deleteDocument = async (col, id) => {
    if(window.confirm('Excluir item definitivamente?')) {
      await deleteDoc(doc(db, col, id));
      loadAllData();
    }
  };

  const uploadCloudinary = async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('upload_preset', 'produtos_perigo'); 
    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/djua9ijum/image/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      return data.secure_url;
    } catch(err) {
      alert('Erro no Cloudinary! Verifique a conexão.');
      return null;
    }
  };

  const addProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let imageUrls = [];
    
    // Upload de múltiplas fotos
    if (files.length > 0) {
      for (let f of files) {
        const url = await uploadCloudinary(f);
        if(url) imageUrls.push(url);
      }
    } else if (file) {
      // Fallback para arquivo único se ainda existir
      const url = await uploadCloudinary(file);
      if(url) imageUrls.push(url);
    }

    if (imageUrls.length === 0) {
       alert("Selecione pelo menos uma foto para o produto.");
       setLoading(false);
       return;
    }

    await addDoc(collection(db, "products"), { 
      ...newProduct, 
      price: Number(newProduct.price), 
      promoPrice: newProduct.promoPrice ? Number(newProduct.promoPrice) : null,
      image: imageUrls[0], // Foto principal
      images: imageUrls    // Todas as fotos
    });

    alert('Produto cadastrado com sucesso!');
    setNewProduct({ 
      name: '', 
      price: '', 
      promoPrice: '',
      category: 'camisetas', 
      brand: 'perigo', 
      description: '', 
      status: 'ativo', 
      featured: true,
      images: []
    });
    setFile(null);
    setFiles([]);
    loadAllData();
    setLoading(false);
  };

  const addCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    const catId = newCategory.id.toLowerCase().replace(/\s+/g, '-');
    await setDoc(doc(db, "categories", catId), { 
      ...newCategory, 
      id: catId,
      active: true 
    });
    alert('Categoria salva!');
    setNewCategory({ id: '', name: '', icon: 'apparel', parentId: null, active: true });
    loadAllData();
    setLoading(false);
  };

  const toggleCategoryStatus = async (cat) => {
    await setDoc(doc(db, "categories", cat.id), { ...cat, active: !cat.active });
    loadAllData();
  };

  const addBanner = async (e) => {
    e.preventDefault();
    setLoading(true);
    let imageUrl = '';
    if (file) {
      imageUrl = await uploadCloudinary(file);
      if(!imageUrl) { setLoading(false); return; }
    }
    await addDoc(collection(db, "banners"), { ...newBanner, image: imageUrl, active: true });
    alert('Banner de Destaque salvo!');
    setNewBanner({ title: '', link: '' });
    setFile(null);
    loadAllData();
    setLoading(false);
  };

  const addBrand = async (e) => {
    e.preventDefault();
    setLoading(true);
    let imageUrl = '';
    if (file) {
      imageUrl = await uploadCloudinary(file);
      if(!imageUrl) { setLoading(false); return; }
    }
    await setDoc(doc(db, "brands", newBrand.name.toLowerCase().replace(/\s+/g, '-')), { name: newBrand.name, image: imageUrl });
    alert('Marca salva!');
    setNewBrand({ name: '' });
    setFile(null);
    loadAllData();
    setLoading(false);
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    await setDoc(doc(db, "settings", "global"), settings);
    alert('Configurações Salvas!');
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col justify-center items-center text-white px-4 font-inter">
        <div className="w-16 h-16 bg-white flex items-center justify-center mb-6">
          <span className="text-black font-black text-2xl tracking-tighter">PI.</span>
        </div>
        <h1 className="text-3xl font-black mb-8 uppercase tracking-tighter">Painel de Acesso</h1>
        <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-4 bg-[#121214] p-8 rounded border border-white/5">
          {error && <p className="text-red-500 text-center text-sm font-bold">{error}</p>}
          <input type="email" placeholder="Email do Admin" className="p-3 bg-[#1c1c1f] text-white outline-none border border-white/5 focus:border-white/20 transition-colors" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Senha" className="p-3 bg-[#1c1c1f] text-white outline-none border border-white/5 focus:border-white/20 transition-colors" value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit" className="bg-white text-black hover:bg-white/80 font-black uppercase tracking-widest py-4 mt-2 transition-colors text-sm">Entrar no Sistema</button>
        </form>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#09090b] text-white font-inter flex flex-col md:flex-row">
      {/* Sidebar Menu */}
      <div className="w-full md:w-64 bg-[#121214] border-r border-white/5 flex flex-col">
        <div className="p-6 md:p-8 flex items-center gap-4 border-b border-white/5">
          <div className="w-10 h-10 bg-white flex items-center justify-center shrink-0">
            <span className="text-black font-black text-xl tracking-tighter">P.</span>
          </div>
          <div>
            <h1 className="font-black uppercase tracking-tighter text-sm">Studio</h1>
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Admin Control</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 flex flex-col gap-1">
          {[
            { id: 'produtos', label: 'Produtos', icon: '👕' },
            { id: 'categorias', label: 'Categorias', icon: '📂' },
            { id: 'banners', label: 'Banners', icon: '🖼️' },
            { id: 'configuracoes', label: 'Configurações', icon: '⚙️' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-4 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-black' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
              <span className="text-lg opacity-80">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button onClick={() => signOut(auth)} className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-xs font-bold uppercase tracking-widest py-3 transition-colors">Sair / Deslogar</button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 md:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <header className="mb-10">
            <h2 className="text-2xl font-black uppercase tracking-tighter">Gerenciamento de {activeTab}</h2>
            <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">Controle total sobre seu catálogo</p>
          </header>
          
          <div className="mb-4 text-xs text-white/60">
            {activeTab === 'produtos' && 'Adicione, edite ou remova produtos do seu catálogo. As alterações são sincronizadas em tempo real com o site.'}
            {activeTab === 'categorias' && 'Organize seu site gerenciando categorias. Crie categorias principais e exiba no menu principal do site.'}
            {activeTab === 'banners' && 'Configure os banners rotativos que aparecem no topo da página inicial do desktop e mobile.'}
            {activeTab === 'configuracoes' && 'Ajustes globais do sistema, atendimento e integrações.'}
          </div>

          {activeTab === 'produtos' && (
          <div className="grid lg:grid-cols-3 gap-8 animate-fade-in">
             <div className="lg:col-span-2 bg-[#121214] p-6 border border-white/5 h-fit max-h-[850px] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black uppercase tracking-tighter">Produtos no Catálogo ({products.length})</h2>
                <div className="flex gap-2">
                   <input placeholder="Pesquisar produto..." className="p-2 bg-[#1c1c1f] text-[10px] border border-white/5 outline-none w-48 font-bold uppercase tracking-widest" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {products.length === 0 && <p className="col-span-2 text-xs text-white/30 font-bold uppercase tracking-widest text-center py-8">Nenhum produto cadastrado.</p>}
                {products.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-[#1c1c1f] hover:bg-white/5 transition-colors group border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-20 bg-black overflow-hidden relative">
                        {p.image && <img src={p.image} className="w-full h-full object-cover transition-all" />}
                        {p.images && p.images.length > 1 && (
                          <div className="absolute bottom-1 right-1 bg-white text-black text-[8px] px-1 font-black">+{p.images.length - 1}</div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-xs tracking-tighter uppercase line-clamp-1">{p.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {p.promoPrice ? (
                            <>
                              <p className="text-[10px] text-red-500 font-black tracking-widest uppercase">R$ {p.promoPrice}</p>
                              <p className="text-[9px] text-white/30 line-through font-bold">R$ {p.price}</p>
                            </>
                          ) : (
                            <p className="text-[10px] text-white/50 font-bold tracking-widest uppercase">R$ {p.price}</p>
                          )}
                        </div>
                        <p className="text-[8px] text-white/30 font-black uppercase tracking-[0.2em] mt-1">{p.category}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                       <button onClick={() => deleteDocument('products', p.id)} className="text-white/20 hover:text-red-500 text-lg font-bold px-2 transition-colors">&times;</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#121214] p-6 border border-white/5 h-fit">
              <h2 className="text-xl font-black mb-6 uppercase tracking-tighter">Adicionar Produto</h2>
              <form onSubmit={addProduct} className="flex flex-col gap-4 text-sm">
                <input required placeholder="Nome do Produto (Ex: Camiseta Monolith)" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="p-3 bg-[#1c1c1f] text-white outline-none w-full border border-white/5 focus:border-white/20" />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Preço Normal</label>
                    <input required type="number" step="0.01" placeholder="199.90" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="p-3 bg-[#1c1c1f] text-white outline-none border border-white/5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-red-500/50 uppercase tracking-widest">Preço Promo (Opcional)</label>
                    <input type="number" step="0.01" placeholder="149.90" value={newProduct.promoPrice} onChange={e => setNewProduct({...newProduct, promoPrice: e.target.value})} className="p-3 bg-[#1c1c1f] text-white outline-none border border-white/5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Categoria</label>
                    <select required value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="p-3 bg-[#1c1c1f] text-white outline-none border border-white/5 uppercase text-[10px] font-bold tracking-widest">
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Destaque</label>
                    <div className="flex items-center h-full">
                      <label className="flex items-center gap-2 cursor-pointer text-[10px] uppercase tracking-widest font-bold text-white/70">
                        <input type="checkbox" checked={newProduct.featured} onChange={e => setNewProduct({...newProduct, featured: e.target.checked})} className="accent-white w-4 h-4" />
                        Sim
                      </label>
                    </div>
                  </div>
                </div>

                <textarea required placeholder="Descrição detalhada..." rows="4" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="p-3 bg-[#1c1c1f] text-white outline-none w-full border border-white/5 focus:border-white/20" />
                
                <div className="p-6 bg-[#1f1f22] border border-dashed border-white/20 flex flex-col items-center justify-center gap-3 transition-colors hover:border-white/40 cursor-pointer relative">
                  <span className="text-[10px] uppercase font-black text-white/50 tracking-[0.2em] text-center">Arraste ou Selecione até 7 fotos</span>
                  <input type="file" multiple accept="image/*" onChange={e => setFiles(Array.from(e.target.files).slice(0, 7))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  {files.length > 0 && <span className="text-white text-[10px] font-bold bg-white/10 px-3 py-1 rounded-full">{files.length} fotos selecionadas</span>}
                </div>

                <button type="submit" disabled={loading} className="mt-4 bg-white hover:bg-white/80 text-black font-black uppercase tracking-[0.3em] py-4 transition-colors flex justify-center items-center text-[10px]">
                  {loading ? <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" /> : "ADICIONAR AO CATÁLOGO"}
                </button>
              </form>
            </div>
          </div>
          )}

          {activeTab === 'categorias' && (
          <div className="flex flex-col gap-8 animate-fade-in">
            {/* Form de Criação Rapida */}
             <div className="bg-[#121214] p-6 border border-white/5">
              <h2 className="text-xl font-black mb-6 uppercase tracking-tighter">Criar Nova Categoria</h2>
              <form onSubmit={addCategory} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-sm">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Nome de Exibição</label>
                  <input required placeholder="Ex: Camisetas Oversized" value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value, id: e.target.value})} className="p-3 bg-[#1c1c1f] text-white outline-none border border-white/5" />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Categoria Pai (Opcional)</label>
                  <select value={newCategory.parentId || ''} onChange={e => setNewCategory({...newCategory, parentId: e.target.value || null})} className="p-3 bg-[#1c1c1f] text-white outline-none border border-white/5 text-xs font-bold uppercase">
                    <option value="">Nenhuma (Principal)</option>
                    {categories.filter(c => !c.parentId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Ícone Visual</label>
                  <div className="grid grid-cols-6 gap-1 bg-[#1c1c1f] p-1 border border-white/5 max-h-[46px] overflow-y-auto custom-scrollbar">
                    {ICON_LIST.map(icon => (
                      <button 
                        type="button" 
                        key={icon.id} 
                        onClick={() => setNewCategory({...newCategory, icon: icon.id})}
                        className={`p-1 flex items-center justify-center transition-all ${newCategory.icon === icon.id ? 'bg-white text-black' : 'text-white/40 hover:bg-white/10'}`}
                        title={icon.name}
                      >
                        <span className="material-symbols-outlined text-sm">{icon.id}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={loading} className="bg-white text-black font-black uppercase tracking-widest h-[46px] text-xs hover:bg-white/80 transition-colors">Criar Agora</button>
              </form>
             </div>

             {/* Mapa Mental / Tree View das Categorias */}
             <div className="bg-[#121214] p-8 border border-white/5 min-h-[500px]">
              <h2 className="text-xl font-black mb-10 uppercase tracking-tighter">Estrutura do Mapa Mental</h2>
              
              <div className="flex flex-wrap gap-12 items-start">
                {categories.filter(c => !c.parentId).map(parent => (
                  <div key={parent.id} className="flex flex-col items-center group relative">
                    {/* Categoria Pai */}
                    <div className={`w-[220px] p-4 border rounded-xl flex flex-col items-center gap-3 transition-all relative z-10 ${parent.active ? 'bg-white border-white' : 'bg-red-500/10 border-red-500/30'}`}>
                      <div className={`p-3 rounded-full ${parent.active ? 'bg-black text-white' : 'bg-red-500 text-white'}`}>
                        <span className="material-symbols-outlined text-2xl">{parent.icon}</span>
                      </div>
                      <span className={`font-black uppercase tracking-tighter text-sm ${parent.active ? 'text-black' : 'text-red-500/60'}`}>{parent.name}</span>
                      
                      <div className="flex items-center gap-2 mt-2 w-full pt-3 border-t border-black/10">
                        <button onClick={() => toggleCategoryStatus(parent)} className={`flex-1 py-1.5 rounded-lg text-white font-bold text-[9px] uppercase tracking-widest transition-colors ${parent.active ? 'bg-green-600' : 'bg-gray-600'}`}>
                          {parent.active ? 'ATIVO' : 'OCULTO'}
                        </button>
                        <button onClick={() => deleteDocument('categories', parent.id)} className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-xs">delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Linha Conectora para Subcategorias */}
                    {categories.some(sub => sub.parentId === parent.id) && (
                      <div className="w-[2px] h-8 bg-white/10" />
                    )}

                    {/* Subcategorias */}
                    <div className="flex flex-col gap-2 w-full">
                      {categories.filter(sub => sub.parentId === parent.id).map(sub => (
                        <div key={sub.id} className={`p-3 rounded-lg border flex items-center justify-between gap-4 group/sub transition-all ${sub.active ? 'bg-[#1c1c1f] border-white/5' : 'bg-red-500/5 border-red-500/20'}`}>
                          <div className="flex items-center gap-3">
                            <span className={`material-symbols-outlined text-sm ${sub.active ? 'text-white/40' : 'text-red-500/40'}`}>{sub.icon || 'subdirectory_arrow_right'}</span>
                            <span className={`text-[11px] font-bold uppercase tracking-widest ${sub.active ? 'text-white/80' : 'text-red-500/40'}`}>{sub.name}</span>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                            <button onClick={() => toggleCategoryStatus(sub)} className={`material-symbols-outlined text-sm ${sub.active ? 'text-green-500' : 'text-gray-500'}`}>
                              {sub.active ? 'visibility' : 'visibility_off'}
                            </button>
                            <button onClick={() => deleteDocument('categories', sub.id)} className="material-symbols-outlined text-sm text-red-500">close</button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Botão para add sub rápido */}
                    <button 
                      onClick={() => setNewCategory({...newCategory, parentId: parent.id})}
                      className="mt-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                      title="Adicionar Subcategoria"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                ))}

                {/* Bloco Vazio de Adição */}
                {categories.length === 0 && (
                   <div className="w-full flex justify-center items-center h-[300px] border border-dashed border-white/10 rounded-2xl">
                     <p className="text-white/20 font-bold uppercase tracking-[0.3em] text-xs">Crie sua primeira categoria principal acima.</p>
                   </div>
                )}
              </div>
             </div>
          </div>
          )}

          {activeTab === 'banners' && (
          <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
             <div className="bg-[#121214] p-6 border border-white/5">
              <h2 className="text-xl font-black mb-6 uppercase tracking-tighter">Novo Banner Inicial</h2>
              <form onSubmit={addBanner} className="flex flex-col gap-4 text-sm">
                <input required placeholder="Título do Banner" value={newBanner.title} onChange={e => setNewBanner({...newBanner, title: e.target.value})} className="p-3 bg-[#1c1c1f] text-white outline-none w-full border border-white/5" />
                <input placeholder="Link (Ex: /categoria/camisetas)" value={newBanner.link} onChange={e => setNewBanner({...newBanner, link: e.target.value})} className="p-3 bg-[#1c1c1f] text-white outline-none w-full border border-white/5" />
                
                <div className="p-6 bg-[#1f1f22] border border-dashed border-white/20 flex flex-col items-center justify-center gap-3 relative cursor-pointer">
                  <span className="text-xs uppercase font-black text-white/50 tracking-widest">Foto do Banner (Desktop 16:9)</span>
                  <input type="file" required accept="image/*" onChange={e => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  {file && <span className="text-white text-xs">{file.name}</span>}
                </div>

                <button type="submit" disabled={loading} className="mt-4 bg-white text-black font-black uppercase tracking-widest py-4 text-xs hover:bg-white/80">
                  {loading ? 'Enviando...' : 'Adicionar Banner'}
                </button>
              </form>
             </div>
             <div className="bg-[#121214] p-6 border border-white/5 h-fit max-h-[700px] overflow-y-auto custom-scrollbar">
              <h2 className="text-xl font-black mb-6 uppercase tracking-tighter">Banners Ativos ({banners.length})</h2>
              <div className="flex flex-col gap-2">
                {banners.map(b => (
                  <div key={b.id} className="flex flex-col gap-2 p-3 bg-[#1c1c1f]">
                    <div className="h-24 w-full bg-black relative overflow-hidden">
                      {b.image && <img src={b.image} className="w-full h-full object-cover " />}
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest mt-2">
                      <span>{b.title}</span>
                      <button onClick={() => deleteDocument('banners', b.id)} className="text-red-500 hover:text-white px-2">&times;</button>
                    </div>
                  </div>
                ))}
              </div>
             </div>
          </div>
          )}

          {activeTab === 'configuracoes' && (
          <div className="max-w-xl animate-fade-in bg-[#121214] p-6 border border-white/5">
            <h2 className="text-xl font-black mb-6 uppercase tracking-tighter">Configurações Gerais</h2>
            <form onSubmit={saveSettings} className="flex flex-col gap-4 text-sm">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-white/50 mb-2 block">Número do WhatsApp</label>
                <input placeholder="Ex: 5511999999999" value={settings.whatsapp} onChange={e => setSettings({...settings, whatsapp: e.target.value})} className="p-3 bg-[#1c1c1f] text-white outline-none w-full border border-white/5" />
                <p className="text-[10px] text-white/30 mt-1 uppercase tracking-widest">Usado no botão flutuante e rodapé.</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-white/50 mb-2 block">Endereço Físico</label>
                <input placeholder="Rua exemplo, 123..." value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})} className="p-3 bg-[#1c1c1f] text-white outline-none w-full border border-white/5" />
              </div>
              <button type="submit" disabled={loading} className="mt-6 bg-white text-black font-black uppercase tracking-widest py-4 text-xs hover:bg-white/80">Salvar Modificações</button>
            </form>
          </div>
          )}

        </div>
      </div>
    </div>
  );
}
