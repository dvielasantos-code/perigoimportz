// Imagens placeholder (reutilizando as que temos)
const IMG = {
    hoodie: "https://lh3.googleusercontent.com/aida-public/AB6AXuAkRBANCTOuJYahk0NTooWbPUV6Q_UTNQDByw2wb-GRSpYruEnFYdIRNFN106MYNk0HSeyelbdANmDweAAs1gIp2uGzWPQ8xeggJNH_FH9zamzRQhBQ700cwtgvqgTpTxrjdmdpXBATzUf4YtYVE-lBfpJiHipH9m9YEto5_A-aBIE2lg1vdXuRNfPcR9YGY19W6ewTcCjl88jAiFXnuf5hu8F4Cy9eHBPgFpSC7qLPyr3Fy1bFF4XLmENwte5gnc4RY1CpRG0oh3w0",
    bolsa: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWG6CDEzV9LgS89Y80M85n00A2T6E8S_o_Fw64N9kQzY8-0wX4uB52G_d0cE-I8Z3H7l6FvC8L3zI9Q28N5wT2yR-H8wK9_6N20J6l8U__16091U40z7eHl4NlK8T7q3X3b9J5M7Lw7G6C1yQ89QY8Kj08f4wL6m--0H25Z8Cq8eT910X9Wk_5D",
    hero: "https://lh3.googleusercontent.com/aida-public/AB6AXuBdso03s2h1V8LfKMtiajCAAMOq8t0GfkW8B4cTVQeQO29ytbjJfXzkkYkfIOwWCOMCyN_PV81XZfRNn6deAxRSdOrSRh8P3ZvBFwd5phxoW3KWlygiW6vJGPAaO8j2S1IvWzuKpbwF-UGFHIyUXuU6xzn3lsa9pQxb03y0T7rXzXgFH4K00IYnefqSNR-SIYCJMbdGHoE-_DzEZcmITZZwHfzHQRwA-4qFB6KRIBMNNdZTdwXrkozGQke_Q_FOZdSfHWE5FaCosrgd",
    banner: "https://lh3.googleusercontent.com/aida-public/AB6AXuBR8WfMT6yGX8Qp6mJAVYg4ZjzaURdfQ-4zQd6vFb2NvbMfMnRBo7I0ns1KZWn9BM1gp0zL4yRZrecudGHQD6MmyPSkq_ZLz89njFzqG77SqTXrzWKJqNpgM2fSIOYakZes1Jfki-FpOEBZXCfcyhHm1AowjgI7Polcfjg1w-YDkXUMAGeu9WCJND6amT-tEGaLzglsjQ8NITY8zjItt-DvEiUJioZeOSfH37_TTJ80Z37s9Cng8j4kfiTUvX-SJDCPFNaDXIvmafg9",
};

export const data = {
    whatsapp: "5511999999999",
    address: "RUA AUGUSTA, 123. JARDINS - SP.",

    // Categorias principais (carrossel + rotas)
    categories: [
        { id: "camisetas", name: "Camisetas", icon: "apparel" },
        { id: "calcas", name: "Calças", icon: "view_agenda" },
        { id: "bones", name: "Bonés", icon: "flag" },
        { id: "tenis", name: "Tênis", icon: "footprint" },
        { id: "acessorios", name: "Acessórios", icon: "watch" }
    ],

    // Menu com subcategorias expansíveis
    menuCategories: [
        {
            id: "camisetas",
            name: "Camisetas",
            icon: "apparel",
            subcategories: [
                { id: "camiseta", name: "Camisetas" },
                { id: "regata", name: "Regatas" },
                { id: "moletom-top", name: "Moletons" },
                { id: "jaqueta", name: "Jaquetas" }
            ]
        },
        {
            id: "calcas",
            name: "Calças",
            icon: "view_agenda",
            subcategories: [
                { id: "calca", name: "Calças" },
                { id: "shorts", name: "Shorts" },
                { id: "moletom-bottom", name: "Moletom" }
            ]
        },
        { id: "bones", name: "Bonés", icon: "flag" },
        { id: "tenis", name: "Tênis", icon: "footprint" },
        { id: "acessorios", name: "Acessórios", icon: "watch" },
        {
            id: "marcas",
            name: "Marcas",
            icon: "verified",
            subcategories: [
                { id: "nike", name: "Nike" },
                { id: "adidas", name: "Adidas" },
                { id: "supreme", name: "Supreme" },
                { id: "stussy", name: "Stüssy" },
                { id: "carhartt", name: "Carhartt" }
            ]
        }
    ],

    products: [
        // ===== CAMISETAS (3) =====
        {
            id: 1,
            name: "CAMISETA GRAPHIC 'VOID'",
            price: 289.00,
            category: "camisetas",
            subcategory: "camiseta",
            brand: "supreme",
            image: IMG.hero,
            status: "ativo",
            featured: true,
            description: "Estampa frontal exclusiva com corte relaxado."
        },
        {
            id: 2,
            name: "REGATA OVERSIZED 'SHADOW'",
            price: 199.00,
            category: "camisetas",
            subcategory: "regata",
            brand: "stussy",
            image: IMG.hoodie,
            status: "ativo",
            featured: false,
            description: "Regata ampla em algodão 100% com acabamento premium."
        },
        {
            id: 3,
            name: "MOLETOM HEAVYWEIGHT 'NOIR'",
            price: 549.00,
            category: "camisetas",
            subcategory: "moletom-top",
            brand: "carhartt",
            image: IMG.banner,
            status: "ativo",
            featured: true,
            description: "Moletom 450gsm com capuz duplo oversized."
        },

        // ===== CALÇAS (3) =====
        {
            id: 4,
            name: "CARGO WIDE 'PHANTOM'",
            price: 459.00,
            category: "calcas",
            subcategory: "calca",
            brand: "carhartt",
            image: IMG.hoodie,
            status: "ativo",
            featured: true,
            description: "Calça cargo com 6 bolsos utilitários e corte amplo."
        },
        {
            id: 5,
            name: "SHORTS TACTICAL 'URBAN'",
            price: 319.00,
            category: "calcas",
            subcategory: "shorts",
            brand: "nike",
            image: IMG.hero,
            status: "ativo",
            featured: false,
            description: "Shorts tático com tecido ripstop resistente."
        },
        {
            id: 6,
            name: "MOLETOM JOGGER 'STEALTH'",
            price: 399.00,
            category: "calcas",
            subcategory: "moletom-bottom",
            brand: "adidas",
            image: IMG.banner,
            status: "ativo",
            featured: false,
            description: "Jogger em moletom com punho canelado."
        },

        // ===== BONÉS (3) =====
        {
            id: 7,
            name: "BONÉ DAD HAT 'MONOLITH'",
            price: 179.00,
            category: "bones",
            brand: "supreme",
            image: IMG.bolsa,
            status: "ativo",
            featured: true,
            description: "Dad hat com bordado frontal minimal."
        },
        {
            id: 8,
            name: "BUCKET HAT 'OBSCUR'",
            price: 219.00,
            category: "bones",
            brand: "stussy",
            image: IMG.hero,
            status: "ativo",
            featured: false,
            description: "Bucket reversível em nylon impermeável."
        },
        {
            id: 9,
            name: "SNAPBACK 'ARCHIVE'",
            price: 199.00,
            category: "bones",
            brand: "nike",
            image: IMG.hoodie,
            status: "ativo",
            featured: false,
            description: "Snapback estruturado com aba reta."
        },

        // ===== TÊNIS (3) =====
        {
            id: 10,
            name: "RUNNER 'DARKWAVE' V2",
            price: 1299.00,
            category: "tenis",
            brand: "nike",
            image: IMG.banner,
            status: "ativo",
            featured: true,
            description: "Tênis runner com entressola React e upper knit."
        },
        {
            id: 11,
            name: "HIGH-TOP 'CONCRETE'",
            price: 899.00,
            category: "tenis",
            brand: "adidas",
            image: IMG.hoodie,
            status: "ativo",
            featured: false,
            description: "Cano alto com sola vulcanizada e couro sintético."
        },
        {
            id: 12,
            name: "SLIDE 'MINIMAL' PRO",
            price: 349.00,
            category: "tenis",
            brand: "adidas",
            image: IMG.bolsa,
            status: "ativo",
            featured: false,
            description: "Chinelo slide com palmilha anatômica em EVA."
        },

        // ===== ACESSÓRIOS (3) =====
        {
            id: 13,
            name: "BOLSA TÁTICA NEO",
            price: 420.00,
            category: "acessorios",
            brand: "carhartt",
            image: IMG.bolsa,
            status: "ativo",
            featured: true,
            description: "Utilitário com múltiplas subdivisões."
        },
        {
            id: 14,
            name: "COLAR CHAIN 'BRUTALIST'",
            price: 259.00,
            category: "acessorios",
            brand: "supreme",
            image: IMG.hero,
            status: "ativo",
            featured: false,
            description: "Corrente grossa em aço inoxidável banhado a ouro."
        },
        {
            id: 15,
            name: "MEIA CREW 3-PACK 'ESSENTIALS'",
            price: 89.00,
            category: "acessorios",
            brand: "stussy",
            image: IMG.hoodie,
            status: "ativo",
            featured: false,
            description: "Kit 3 pares de meias crew em algodão penteado."
        }
    ]
};
