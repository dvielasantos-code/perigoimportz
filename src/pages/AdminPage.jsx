import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // States para gerenciar os produtos
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'camisetas', brand: 'perigo', description: '', status: 'ativo' });
  const [file, setFile] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      if(u) loadProducts();
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

  const loadProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const deleteProduct = async (id) => {
    await deleteDoc(doc(db, "products", id));
    loadProducts();
  };

  const addProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    let imageUrl = '';

    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'produtos_perigo'); 
      try {
        const res = await fetch('https://api.cloudinary.com/v1_1/djua9ijum/image/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        imageUrl = data.secure_url;
      } catch(err) {
        alert('Erro ao subir imagem pro Cloudinary!');
        setLoading(false);
        return;
      }
    }

    try {
      await addDoc(collection(db, "products"), {
        name: newProduct.name,
        price: Number(newProduct.price),
        category: newProduct.category,
        brand: newProduct.brand,
        description: newProduct.description,
        status: newProduct.status,
        image: imageUrl,
        featured: true
      });
      alert('Produto cadastrado com sucesso na velocidade da luz!');
      setNewProduct({ name: '', price: '', category: 'camisetas', brand: 'perigo', description: '', status: 'ativo' });
      setFile(null);
      loadProducts();
    } catch(err) {
      alert('Erro no Firebase!');
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center text-white px-4">
        <h1 className="text-3xl font-black mb-8 uppercase tracking-tighter">Painel Admin</h1>
        <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-4 bg-surface-container-low p-8 rounded-2xl border border-surface-container">
          {error && <p className="text-error text-center text-sm font-bold">{error}</p>}
          <input type="email" placeholder="Email" className="p-3 rounded-lg bg-surface-container text-white outline-none" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Senha" className="p-3 rounded-lg bg-surface-container text-white outline-none" value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit" className="bg-primary hover:bg-white text-on-primary hover:text-black font-black uppercase tracking-widest py-3 rounded-lg transition-colors">Entrar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white p-4 md:p-8">
      <div className="flex justify-between items-center mb-8 border-b border-surface-container pb-4">
        <h1 className="text-2xl font-black uppercase tracking-tighter">PerigoImportz Admin</h1>
        <button onClick={() => signOut(auth)} className="bg-error px-4 py-2 font-bold rounded-lg hover:opacity-80 transition-opacity text-sm text-on-error">Sair</button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-surface-container-low p-6 rounded-2xl border border-surface-container">
          <h2 className="text-xl font-bold mb-6">➕ Novo Produto</h2>
          <form onSubmit={addProduct} className="flex flex-col gap-4">
            <input required placeholder="Nome do Produto" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="p-3 rounded-lg bg-surface-container text-white outline-none w-full" />
            
            <div className="flex gap-4">
              <input required type="number" step="0.01" placeholder="Preço (199.90)" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="p-3 rounded-lg bg-surface-container text-white outline-none w-1/2" />
              <select required value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="p-3 rounded-lg bg-surface-container text-white outline-none w-1/2">
                <option value="camisetas">Camisetas</option>
                <option value="calcas">Calças</option>
                <option value="tenis">Tênis</option>
                <option value="acessorios">Acessórios</option>
                <option value="bones">Bonés</option>
              </select>
            </div>

            <textarea required placeholder="Descrição do produto..." rows="3" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="p-3 rounded-lg bg-surface-container text-white outline-none w-full" />
            
            <div className="p-4 rounded-lg bg-surface-container border border-dashed border-primary/50 flex flex-col items-center justify-center gap-2">
              <span className="text-sm font-bold text-white/50">Imagem do Cloudinary</span>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="text-xs" />
            </div>

            <button type="submit" disabled={loading} className="mt-2 bg-primary hover:bg-white text-on-primary hover:text-black font-black uppercase tracking-widest py-4 rounded-lg transition-colors flex justify-center items-center">
              {loading ? <span className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" /> : "Publicar Produto"}
            </button>
          </form>
        </div>

        <div className="bg-surface-container-low p-6 rounded-2xl border border-surface-container h-fit max-h-[700px] overflow-y-auto custom-scrollbar">
          <h2 className="text-xl font-bold mb-6">📋 Produtos ({products.length})</h2>
          <div className="flex flex-col gap-3">
            {products.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-surface-container rounded-lg border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-md bg-white/5 overflow-hidden">
                    {p.image && <img src={p.image} className="w-full h-full object-cover grayscale" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{p.name}</h3>
                    <p className="text-xs text-white/50">R$ {p.price} • {p.category}</p>
                  </div>
                </div>
                <button onClick={() => { if(window.confirm('Excluir produto?')) deleteProduct(p.id) }} className="text-error hover:text-white text-xl p-2 font-bold cursor-pointer transition-colors">&times;</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
