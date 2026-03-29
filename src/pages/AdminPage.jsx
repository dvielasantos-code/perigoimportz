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

  // Estados dos Formulários
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'camisetas', brand: 'perigo', description: '', status: 'ativo', featured: true });
  const [newCategory, setNewCategory] = useState({ id: '', name: '', icon: 'apparel' });
  const [newBanner, setNewBanner] = useState({ title: '', link: '' });
  const [newBrand, setNewBrand] = useState({ name: '' });

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
    let imageUrl = '';
    if (file) {
      imageUrl = await uploadCloudinary(file);
      if(!imageUrl) { setLoading(false); return; }
    }
    await addDoc(collection(db, "products"), { ...newProduct, price: Number(newProduct.price), image: imageUrl });
    alert('Produto cadastrado com sucesso!');
    setNewProduct({ name: '', price: '', category: 'camisetas', brand: 'perigo', description: '', status: 'ativo', featured: true });
    setFile(null);
    loadAllData();
    setLoading(false);
  };

  const addCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    await setDoc(doc(db, "categories", newCategory.id.toLowerCase().replace(/\s+/g, '-')), { ...newCategory, active: true });
    alert('Categoria salva!');
    setNewCategory({ id: '', name: '', icon: 'apparel' });
    loadAllData();
    setLoading(false);
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
          <div className="grid lg:grid-cols-2 gap-8 animate-fade-in">
             <div className="bg-[#121214] p-6 border border-white/5 h-fit max-h-[700px] overflow-y-auto custom-scrollbar">
              <h2 className="text-xl font-black mb-6 uppercase tracking-tighter">Gerenciar Produtos ({products.length})</h2>
              <div className="flex flex-col gap-2">
                {products.length === 0 && <p className="text-xs text-white/30 font-bold uppercase tracking-widest text-center py-8">Nenhum produto cadastrado.</p>}
                {products.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-[#1c1c1f] hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 bg-black overflow-hidden relative">
                        {p.image && <img src={p.image} className="w-full h-full object-cover transition-all" />}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-xs tracking-tighter uppercase">{p.name}</h3>
                        <p className="text-[10px] text-white/50 font-bold tracking-widest uppercase mt-1">R$ {p.price} • {p.category}</p>
                      </div>
                    </div>
                    <button onClick={() => deleteDocument('products', p.id)} className="text-white/20 hover:text-red-500 text-lg font-bold px-4 transition-colors">&times;</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#121214] p-6 border border-white/5">
              <h2 className="text-xl font-black mb-6 uppercase tracking-tighter">Adicionar Produto</h2>
              <form onSubmit={addProduct} className="flex flex-col gap-4 text-sm">
                <input required placeholder="Nome do Produto (Ex: Camiseta Monolith)" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="p-3 bg-[#1c1c1f] text-white outline-none w-full border border-white/5 focus:border-white/20" />
                
                <div className="flex gap-4">
                  <input required type="number" step="0.01" placeholder="Preço (199.90)" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="p-3 bg-[#1c1c1f] text-white outline-none w-1/2 border border-white/5" />
                  <select required value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="p-3 bg-[#1c1c1f] text-white outline-none w-1/2 border border-white/5 uppercase text-xs font-bold tracking-widest">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="flex gap-4 items-center mt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs uppercase tracking-widest font-bold text-white/70">
                    <input type="checkbox" checked={newProduct.featured} onChange={e => setNewProduct({...newProduct, featured: e.target.checked})} className="accent-white w-4 h-4" />
                    Produto em Destaque
                  </label>
                </div>

                <textarea required placeholder="Descrição detalhada do produto..." rows="3" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="p-3 bg-[#1c1c1f] text-white outline-none w-full border border-white/5 focus:border-white/20" />
                
                <div className="p-6 bg-[#1f1f22] border border-dashed border-white/20 flex flex-col items-center justify-center gap-3 transition-colors hover:border-white/40 cursor-pointer relative">
                  <span className="text-xs uppercase font-black text-white/50 tracking-widest">Foto do Cloudinary</span>
                  <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  {file && <span className="text-white text-xs font-bold bg-white/10 px-3 py-1 rounded-full">{file.name} selecionado</span>}
                </div>

                <button type="submit" disabled={loading} className="mt-4 bg-white hover:bg-white/80 text-black font-black uppercase tracking-widest py-4 transition-colors flex justify-center items-center text-xs">
                  {loading ? <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" /> : "Publicar Catálogo"}
                </button>
              </form>
            </div>
          </div>
          )}

          {activeTab === 'categorias' && (
          <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
             <div className="bg-[#121214] p-6 border border-white/5">
              <h2 className="text-xl font-black mb-6 uppercase tracking-tighter">Nova Categoria</h2>
              <form onSubmit={addCategory} className="flex flex-col gap-4 text-sm">
                <input required placeholder="ID da categoria (Sem espaço. Ex: moletons)" value={newCategory.id} onChange={e => setNewCategory({...newCategory, id: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="p-3 bg-[#1c1c1f] text-white outline-none w-full border border-white/5" />
                <input required placeholder="Nome de Exibição (Ex: Moletons Premium)" value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} className="p-3 bg-[#1c1c1f] text-white outline-none w-full border border-white/5" />
                <select value={newCategory.icon} onChange={e => setNewCategory({...newCategory, icon: e.target.value})} className="p-3 bg-[#1c1c1f] text-white outline-none w-full border border-white/5 text-xs font-bold uppercase tracking-widest">
                  <option value="apparel">Ícone Roupa</option>
                  <option value="steps">Ícone Tênis</option>
                  <option value="diamond">Ícone Acessório</option>
                  <option value="clock">Ícone Relógio</option>
                  <option value="glasses">Ícone Óculos</option>
                  <option value="hat">Ícone Boné</option>
                </select>
                <button type="submit" disabled={loading} className="mt-4 bg-white text-black font-black uppercase tracking-widest py-4 text-xs hover:bg-white/80">Criar Categoria</button>
              </form>
             </div>
             <div className="bg-[#121214] p-6 border border-white/5">
              <h2 className="text-xl font-black mb-6 uppercase tracking-tighter">Navegação ({categories.length})</h2>
              <div className="flex flex-col gap-2">
                {categories.map(c => (
                  <div key={c.id} className="flex justify-between p-4 bg-[#1c1c1f] text-xs font-bold uppercase tracking-widest">
                    <span>{c.name} ({c.id})</span>
                    <button onClick={() => deleteDocument('categories', c.id)} className="text-red-500 hover:text-white">&times;</button>
                  </div>
                ))}
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
