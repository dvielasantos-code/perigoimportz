const data = {
    whatsapp: "5511999999999", // Altere aqui
    address: "Rua do Curador, 123 - São Paulo, SP",
    categories: [
        { id: "camisetas", name: "Camisetas", icon: "apparel" },
        { id: "calcas", name: "Calças", icon: "bottom_panel_open" },
        { id: "bones", name: "Bonés", icon: "flag_filled" },
        { id: "tenis", name: "Tênis", icon: "steps" },
        { id: "jaquetas", name: "Jaquetas", icon: "dry_cleaning" },
        { id: "acessorios", name: "Acessórios", icon: "watch" }
    ],
    products: [
        {
            id: 1,
            name: "Oversized Noir Tee",
            category: "camisetas",
            price: 189.00,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBvBoPuCiMdw9OQx4anygi8prMFgV-HpRgtcaLLOlxY4r8PMHs0yE9otrDcXAxEJCjm5hFOjuB-5zTbQQ8NQS-1fk0uIMsDhZUot1RpPTGZTmP1UNXsO3vhJ2EfFhWOXEq-8H389v1fjF2zysUvdv8rjYAQph_WsUoLEzXlV9AY_sIubGjxirvR0mcXMJqyMFnOTY39zE_ZknjjkziPBV9PB_jbwmml-w_GlAGlt3FRXq5CY3nyIqXes4_uzOJ3OkcxPkMGSKN7CXNR",
            description: "Camiseta oversized em algodão premium com acabamento noir.",
            status: "ativo",
            featured: true
        },
        {
            id: 2,
            name: "Combat V2 Sneakers",
            category: "tenis",
            price: 849.00,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCFldClUOTDB2rYBfpAJa2BmwrLTz6Jqzf4oRHQFOZs2JjTt-DFcT8tpukhkE5DXXSdjEu-JTkMCUtvtu1n1Y3PeGJgNdHYnGyr133F52Gbm9VVwDWva5uUcO22DU-7EIdduBPmkWBh5oZJ1iLXvGe0ulvbbw0hiKRO03xPbN-lfZ4gOm5V9f0yAB3NrPV1QqbVKgtu2R3Ee8gQK8otF8Ggne8XfxbBjKOxWlU2ZydIKkwAG3tit6GwX7WGOrZ_PKosZKbqSrqjhX6L",
            description: "Sneakers técnicos de alta resistência com design minimalista.",
            status: "ativo",
            featured: true
        },
        {
            id: 3,
            name: "Utility Tech Jacket",
            category: "jaquetas",
            price: 520.00,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLS-8d82g0JX9IUm-nR0UBWjXKfQNquRNDkIRBR2RcRx6dgyPNNLosou-xfJtrt8z9vVod4nltmivjddM9ITOVZ7xeiHEmvnRk3FzUW4t64-YBgmCkJhDcFRXc93ZRfqSzAixTGIUAgiKp5US5kWCNNvkyDlvszeiWuJZjj07Wc8_KSIwevr_el_mD-JZSaeb-zEMGhrE94WGgear73Jj7N6D4dBrn3Pt_GB8ybsfAp_pq_iI7K8WF6vmTBDEuQALaK_ZqkOm0jZA1",
            description: "Jaqueta técnica multi-bolsos para uso urbano.",
            status: "ativo",
            featured: true
        },
        {
            id: 4,
            name: "Shadow Cargo Pants",
            category: "calcas",
            price: 349.00,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSABl6W0u7Xtu6BXCoyYDcSV6reyOgxiFo8jurV5Yvkfs6YN8OBuR1SPXdsnFXRCho6cB-b_Y2FX_7gu_kEFSz0-TIvvJH3MJWOAoBcB_OkepHjufKr8xuHVnQ-k9UNkhCm6knEAf2u-gpidD-y8UFzuqbERh0zSarD7VbDLBXyeqkb-VjBn9h_E9B1cm7nu7WpIuiXQWowH17iIXszEi0ELOJRa8MFJsDSXbzo7VEqPPA1tvZOHOAk2Zgm_Vy6bWYomsklRlE1M89",
            description: "Calças cargo com corte moderno e detalhes em preto fosco.",
            status: "ativo",
            featured: true
        },
        {
            id: 5,
            name: "Onyx Chronos",
            category: "acessorios",
            price: 2490.00,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDcZY0qgaAIz1f-Fint_iaoOymsDNyjugK7gJQ7gNGl6J_HdALKq3NnwidqIsi6cj_AhdcbCsKwQ91Kf91CEFAGplv38HWIN1JsTVCYInem3rvYpZB4sgsEAOpXcTmus3kKOP36lpaYdq7QQaJl76jFcRUBqSRp_A7kneAW9cVEsCcFvzxlhX6lvQE9-q3uZHH_y1vX4VpQqpxvIVqSozgXpZcN78oe9QcAlw8H2LeJRWDpY4vdrgX4E2KZDHiElZPDuWFQZXEI2-Cr",
            description: "Relógio minimalista com movimento automático e pulseira em aço.",
            status: "ativo",
            featured: false
        },
        {
            id: 6,
            name: "Vanguard Low",
            category: "tenis",
            price: 1850.00,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuABJoOiuVGHluHxJ20tJo_TUlLGGaW92vfueMArpfCI4W004yNrdBqa7eoPp0gABLamdEYuJHVHmBFZWv44_Ai-Dc_WDBi6RXGMbGewfEL08srsDzDey9suYCQN70nfzoHzs5Qo0idPwDzJy2d1rgyALxA2GPNwG4_j_4nq-mGgXZtjlta-fT_U45Ys63o0GtQikUKarsp_LdzEATvc7zYmsSEYcjzYy1b1mZQoKk9Dv-rt6VWcoS28aK5K85sSh-UC0X2-a8-Sw61-",
            description: "Sneaker handmade em couro italiano de alta gramatura.",
            status: "ativo",
            featured: false
        },
        {
            id: 7,
            name: "Sonic Zero",
            category: "acessorios",
            price: 3200.00,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA53WrCG-TNkhoMdO8NwZlTJiY2cXH4s75OV1XwzAXUd0lB9C6Amwk1irCgtzQ5rM6mPhNwesaFeveFwEhsRWWh0OSB4JWSn5gNa-FJZXUwfHOFfIH0TMkAeQx3L9oMjYSM8vjgRhfYVd1GiYbrOU3Xf42u8yjKW_k3_tQd1UvFm-bdJVA-ppM6IFGEdK93DqSyPDbVarqa00VM0Yg-vmo1ljCZ0nxHFSYyrPmo4iX0RI8_T4shWuf8sSgqXV1FHAOXm7XCKQnBDWPI",
            description: "Fones de ouvido high-fidelity com cancelamento de ruído.",
            status: "ativo",
            featured: false
        },
        {
            id: 8,
            name: "Urban Nomad Pack",
            category: "acessorios",
            price: 2100.00,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCWGUH-XM_1tasHPFpVuTK_SmvS_UhFUR4BLRRBm0ED959AISd78u6vZNfN5RzZ8Qp958CfwsMsQ4QT59-sukXl2ZQottMwq7W_o29St5RLIGZSREFuaYwmtrkHxKDqjr-C726SlGZNR-Ksc0a78XqWPpYm06qcwD4PGGeRYaBpGV5XeNVm_Gdcdq_R9oxuoJ-fHKA0OH0bqhAhNsIbotngzEgVTwNOqbnX2HNUiqSqTe0H2zYmYEQxApDzei5yHig-3N257gEAwZjA",
            description: "Mochila técnica em nylon balístico à prova d'água.",
            status: "ativo",
            featured: false
        },
        {
            id: 9,
            name: "Tactical Bucket Hat",
            category: "bones",
            price: 150.00,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBR8WfMT6yGX8Qp6mJAVYg4ZjzaURdfQ-4zQd6vFb2NvbMfMnRBo7I0ns1KZWn9BM1gp0zL4yRZrecudGHQD6MmyPSkq_ZLz89njFzqG77SqTXrzWKJqNpgM2fSIOYakZes1Jfki-FpOEBZXCfcyhHm1AowjgI7Polcfjg1w-YDkXUMAGeu9WCJND6amT-tEGaLzglsjQ8NITY8zjItt-DvEiUJioZeOSfH37_TTJ80Z37s9Cng8j4kfiTUvX-SJDCPFNaDXIvmafg9",
            description: "Chapéu bucket tático com tecido respirável.",
            status: "ativo",
            featured: false
        }
    ]
};

if (typeof module !== 'undefined') {
    module.exports = data;
}
