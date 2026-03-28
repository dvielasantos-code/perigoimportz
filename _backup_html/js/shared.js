const shared = {
    // Formata preço para Real
    formatPrice: (price) => {
        return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    },

    // Pega parâmetros da URL
    getParam: (param) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },

    // Gera link do WhatsApp
    getWhatsAppLink: (productName = "") => {
        let text = `Olá! Gostaria de saber mais sobre a PERIGOIMPORTZ.`;
        if (productName) {
            text = `Olá! Gostaria de saber mais sobre o produto: ${productName}`;
        }
        return `https://wa.me/${data.whatsapp}?text=${encodeURIComponent(text)}`;
    },

    // Filtra produtos
    getFilteredProducts: (categoryId = null, searchTerm = "") => {
        return data.products.filter(p => {
            const matchesCategory = categoryId ? p.category === categoryId : true;
            const matchesSearch = searchTerm ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase()) : true;
            return p.status === 'ativo' && matchesCategory && matchesSearch;
        });
    },

    // Renderiza Card de Produto (Desktop)
    renderProductCard: (p) => {
        const link = `item.html?id=${p.id}`;
        return `
            <div class="group cursor-pointer" onclick="window.location.href='${link}'">
                <div class="relative aspect-[3/4] overflow-hidden rounded-xl bg-surface-container-low mb-6 transition-transform duration-500 hover:scale-[1.02]">
                    <img alt="${p.name}" class="w-full h-full object-cover grayscale brightness-90 group-hover:brightness-100 transition-all duration-700" src="${p.image}"/>
                    ${p.featured ? '<div class="absolute top-6 left-6"><span class="bg-primary text-on-primary px-4 py-1 rounded-full font-label text-[10px] font-bold uppercase tracking-widest">Destaque</span></div>' : ''}
                </div>
                <div class="flex flex-col gap-2">
                    <div class="flex justify-between items-start">
                        <h3 class="font-headline text-2xl font-black tracking-tighter uppercase">${p.name}</h3>
                        <span class="font-label text-xl font-bold text-primary">${shared.formatPrice(p.price)}</span>
                    </div>
                    <p class="text-outline text-sm line-clamp-1">${p.description}</p>
                    <button class="mt-4 w-full py-4 bg-primary text-on-primary rounded-full font-label text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                        Ver produto
                    </button>
                </div>
            </div>
        `;
    },

    // Renderiza Card de Produto (Mobile)
    renderMobileProductCard: (p) => {
        const link = `m_item.html?id=${p.id}`;
        return `
            <div class="group" onclick="window.location.href='${link}'">
                <div class="relative overflow-hidden rounded-xl mb-4 bg-surface-container-lowest">
                    <img alt="${p.name}" class="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-500" src="${p.image}"/>
                </div>
                <div class="flex justify-between items-start px-2">
                    <div>
                        <h4 class="font-headline font-black text-xl leading-tight uppercase tracking-tighter mb-1">${p.name}</h4>
                        <p class="font-label text-sm text-outline uppercase tracking-widest">${p.category}</p>
                    </div>
                    <div class="text-right">
                        <span class="font-label font-bold text-xl text-primary">${shared.formatPrice(p.price)}</span>
                    </div>
                </div>
                <button class="mt-6 w-full bg-surface-container-high text-primary font-bold py-4 rounded-full border border-outline-variant/10 hover:bg-primary hover:text-on-primary transition-all uppercase text-xs tracking-widest">
                    Ver produto
                </button>
            </div>
        `;
    },

    // Inicializa busca nos headers
    initSearch: (inputSelector, isMobile = false) => {
        const input = document.querySelector(inputSelector);
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const term = input.value.trim();
                    if (term) {
                        const page = 'category.html';
                        window.location.href = `${page}?search=${encodeURIComponent(term)}`;
                    }
                }
            });
        }
    },

    // Injeta UI global (Botão Whats e Menu Sidebar)
    injectUI: () => {
        // WhatsApp Floating Button
        const waLink = shared.getWhatsAppLink();
        const waBtn = document.createElement('a');
        waBtn.href = waLink;
        waBtn.target = "_blank";
        waBtn.className = "fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-14 h-14 bg-green-500 rounded-full shadow-2xl flex items-center justify-center hover:bg-green-400 hover:scale-110 active:scale-95 transition-all z-[100]";
        waBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="white" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c-.003 1.396.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c.004-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.004-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>`;
        document.body.appendChild(waBtn);

        // Sidebar
        const catUrl = 'category.html';
        const sidebarHTML = `
            <div id="side-menu-overlay" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] hidden opacity-0 transition-opacity duration-300"></div>
            <div id="side-menu" class="fixed top-0 left-0 w-[80vw] max-w-sm h-full bg-[#131313] z-[201] transform -translate-x-full transition-transform duration-500 shadow-2xl flex flex-col border-r border-outline-variant/10">
                <div class="px-8 py-6 flex justify-between items-center border-b border-outline-variant/10">
                    <h2 class="text-2xl font-black font-headline tracking-tighter uppercase text-primary">MENU</h2>
                    <span id="close-menu" class="material-symbols-outlined cursor-pointer hover:rotate-90 transition-transform text-2xl text-on-surface">close</span>
                </div>
                <div class="flex flex-col p-8 gap-8 overflow-y-auto">
                    <div class="space-y-4">
                        <span class="font-label text-xs uppercase tracking-[0.2em] text-outline">Navegação</span>
                        <a href="index.html" class="block font-headline text-3xl font-extrabold text-on-background hover:text-primary transition-colors tracking-tighter">Início</a>
                        <a href="${catUrl}" class="block font-headline text-3xl font-extrabold text-on-background hover:text-primary transition-colors tracking-tighter">Catálogos</a>
                        <a href="${catUrl}?category=colecao" class="block font-headline text-3xl font-extrabold text-on-background hover:text-primary transition-colors tracking-tighter">Coleções</a>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', sidebarHTML);

        // Remove click block on menu buttons so we can use our own event
        document.querySelectorAll('header .material-symbols-outlined').forEach(icon => {
            if(icon.innerText === 'menu') {
                const parent = icon.closest('div');
                if(parent && parent.hasAttribute('onclick')) parent.removeAttribute('onclick');
                icon.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    document.getElementById('side-menu-overlay').classList.remove('hidden');
                    setTimeout(() => document.getElementById('side-menu-overlay').classList.remove('opacity-0'), 10);
                    document.getElementById('side-menu').classList.remove('-translate-x-full');
                }
            }
        });

        const closeMenu = () => {
            document.getElementById('side-menu-overlay').classList.add('opacity-0');
            document.getElementById('side-menu').classList.add('-translate-x-full');
            setTimeout(() => document.getElementById('side-menu-overlay').classList.add('hidden'), 300);
        };
        document.getElementById('close-menu').addEventListener('click', closeMenu);
        document.getElementById('side-menu-overlay').addEventListener('click', closeMenu);
    }
};

document.addEventListener('DOMContentLoaded', shared.injectUI);
