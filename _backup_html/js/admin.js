import { auth, db, signInWithEmailAndPassword, onAuthStateChanged, signOut, collection, getDocs, doc, setDoc, deleteDoc, firebaseConfig, cloudinaryConfig } from './firebase-config.js';

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

const productListObj = document.getElementById('admin-product-list');
const loadingInv = document.getElementById('loading-inventory');
const modal = document.getElementById('product-modal');
const closeModalBtn = document.getElementById('close-modal');
const cancelBtn = document.getElementById('cancel-btn');
const productForm = document.getElementById('product-form');
const addProductBtn = document.getElementById('add-product-btn');

// Cloudinary
const fileInput = document.getElementById('p-file');
const imgPreview = document.getElementById('p-img-preview');
const pImageUrl = document.getElementById('p-image-url');

// AUTH FLOW
if (!auth || !db) {
    loadingInv.innerHTML = '<span class="text-red-500">Erro: Configure suas chaves no firebase-config.js</span>';
} else {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            loginScreen.classList.add('hidden');
            dashboardScreen.classList.remove('hidden');
            loadInventory();
        } else {
            loginScreen.classList.remove('hidden');
            dashboardScreen.classList.add('hidden');
        }
    });
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
        loginError.classList.remove('hidden');
    }
});

logoutBtn.addEventListener('click', () => signOut(auth));

// INVENTORY CARGA
let productsData = [];

async function loadInventory() {
    loadingInv.classList.remove('hidden');
    productListObj.innerHTML = '';
    
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        productsData = [];
        querySnapshot.forEach((doc) => {
            productsData.push({ id: doc.id, ...doc.data() });
        });

        if(productsData.length === 0) {
            loadingInv.innerHTML = "Seu catálogo está vazio. Adicione um produto primeiro.";
            return;
        }

        loadingInv.classList.add('hidden');
        
        productsData.forEach(p => {
            productListObj.innerHTML += `
                <tr class="hover:bg-surface-container-low transition-colors group cursor-pointer" onclick="editProduct('${p.id}')">
                    <td class="p-4"><img src="${p.image}" class="w-12 h-12 object-cover rounded-md border border-neutral-800"></td>
                    <td class="p-4 font-bold uppercase tracking-tight text-white">${p.name}</td>
                    <td class="p-4 uppercase tracking-widest text-[#919191] text-xs">${p.category}</td>
                    <td class="p-4 font-black">R$ ${parseFloat(p.price).toFixed(2)}</td>
                    <td class="p-4">
                        <span class="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${p.status === 'ativo' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}">
                            ${p.status}
                        </span>
                    </td>
                    <td class="p-4 text-right">
                        <button class="material-symbols-outlined text-neutral-500 hover:text-white transition" onclick="event.stopPropagation(); deleteProduct('${p.id}')">delete</button>
                    </td>
                </tr>
            `;
        });
    } catch(err) {
        loadingInv.innerHTML = `<span class="text-red-500">Erro de leitura. Ajuste as Regras de Segurança do seu Firestore.</span>`;
    }
}

// MODAL AÇÕES
window.editProduct = (id) => {
    const p = productsData.find(x => x.id === id);
    if(!p) return;
    
    document.getElementById('modal-title').innerText = "Editar Produto";
    document.getElementById('product-id').value = p.id;
    document.getElementById('p-name').value = p.name;
    document.getElementById('p-price').value = p.price;
    document.getElementById('p-category').value = p.category;
    document.getElementById('p-desc').value = p.description;
    document.getElementById('p-featured').value = p.featured ? "true" : "false";
    document.getElementById('p-status').value = p.status;
    document.getElementById('p-image-url').value = p.image || '';
    
    if (p.image) {
        imgPreview.src = p.image;
        imgPreview.classList.remove('hidden');
    } else {
        imgPreview.classList.add('hidden');
    }

    modal.classList.remove('hidden');
};

addProductBtn.addEventListener('click', () => {
    productForm.reset();
    document.getElementById('modal-title').innerText = "Novo Produto";
    document.getElementById('product-id').value = 'new_' + Date.now();
    document.getElementById('p-image-url').value = '';
    imgPreview.classList.add('hidden');
    modal.classList.remove('hidden');
});

const fecharModal = () => modal.classList.add('hidden');
closeModalBtn.addEventListener('click', fecharModal);
cancelBtn.addEventListener('click', fecharModal);

// IMAGE UPLOAD FRONTEND (CLOUDINARY)
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (cloudinaryConfig.cloudName === "COLE_AQUI") {
        alert("Você precisa colar as chaves do Cloudinary em firebase-config.js para enviar imagens!");
        e.target.value = '';
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);

    const btn = document.getElementById('save-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = "Fazendo Upload... ⏳";
    btn.disabled = true;

    try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`, {
            method: "POST",
            body: formData
        });
        const data = await res.json();
        
        if (data.secure_url) {
            pImageUrl.value = data.secure_url;
            imgPreview.src = data.secure_url;
            imgPreview.classList.remove('hidden');
        } else {
            alert("Erro no upload: " + JSON.stringify(data));
        }
    } catch(err) {
        alert("Erro no servidor Cloudinary: " + err);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});

// SALVAR PRODUCT NO FIRESTORE
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('product-id').value;
    const isNew = id.startsWith('new_');
    const dbId = isNew ? Date.now().toString() : id;

    const dataObj = {
        name: document.getElementById('p-name').value,
        price: parseFloat(document.getElementById('p-price').value),
        category: document.getElementById('p-category').value,
        description: document.getElementById('p-desc').value,
        featured: document.getElementById('p-featured').value === "true",
        status: document.getElementById('p-status').value,
        image: document.getElementById('p-image-url').value || "https://fakeimg.pl/600x800/?text=Sem+Foto"
    };

    const btn = document.getElementById('save-btn');
    btn.innerHTML = "Salvando... ⏳";
    btn.disabled = true;

    try {
        await setDoc(doc(db, "products", dbId), dataObj);
        fecharModal();
        loadInventory();
    } catch(err) {
        alert("Erro ao salvar no banco de dados! " + err);
    } finally {
        btn.innerHTML = "Salvar Produto";
        btn.disabled = false;
    }
});

// EXCLUIR PRODUCT
window.deleteProduct = async (id) => {
    if(confirm("Tem certeza que quer apagar permanentemente esse produto?")) {
        try {
            await deleteDoc(doc(db, "products", id));
            loadInventory();
        } catch(err) {
            alert("Erro ao apagar!");
        }
    }
};
