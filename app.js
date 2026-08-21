/* =========================================
   CATÁLOGO EDEPE - LÓGICA DA APLICAÇÃO
   ========================================= */

let materiais = [];

// Estado dos filtros
const estadoFiltros = {
    busca: "",
    nucleos: new Set(),
    tipos: new Set(),
    anos: new Set(),
    tags: new Set(),
    ordenacao: "az"
};

// Elementos DOM do Header Hero
const headerCollage = document.getElementById("headerCollage");
const totalHeroBadge = document.getElementById("totalHeroBadge");
const totalNucleosBadge = document.getElementById("totalNucleosBadge");

// Elementos DOM
const buscaInput = document.getElementById("busca");
const btnLimparBusca = document.getElementById("btnLimparBusca");
const ordenacaoSelect = document.getElementById("ordenacao");
const catalogoGrid = document.getElementById("catalogo");
const emptyState = document.getElementById("emptyState");
const contadorResultados = document.getElementById("contadorResultados");
const totalBadge = document.getElementById("totalBadge");
const secaoFiltrosAtivos = document.getElementById("secaoFiltrosAtivos");
const filtrosAtivosContainer = document.getElementById("filtrosAtivos");
const btnLimparChips = document.getElementById("btnLimparChips");
const temasPopularesContainer = document.getElementById("temasPopulares");
const btnLimpar = document.getElementById("btnLimpar");
const btnLimparSidebar = document.getElementById("btnLimparSidebar");
const btnTodasPesquisas = document.getElementById("btnTodasPesquisas");
const btnResetarBusca = document.getElementById("btnResetarBusca");

// Sidebar Lists
const listaNucleos = document.getElementById("listaNucleos");
const listaTipos = document.getElementById("listaTipos");
const listaAnos = document.getElementById("listaAnos");
const listaTagsSidebar = document.getElementById("listaTagsSidebar");

// Modal PDF
const modalPdf = document.getElementById("modalPdf");
const modalPdfTitulo = document.getElementById("modalPdfTitulo");
const modalPdfDownload = document.getElementById("modalPdfDownload");
const pdfFrame = document.getElementById("pdfFrame");
const fecharModal = document.getElementById("fecharModal");

// Toast
const toast = document.getElementById("toast");
const toastMensagem = document.getElementById("toastMensagem");

/* =========================================
   NORMALIZAÇÃO DE TEXTO
   ========================================= */
function normalizar(texto) {
    return (texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

/* =========================================
   CARREGAMENTO INICIAL
   ========================================= */
async function carregarDados() {
    try {
        const resposta = await fetch("dados.json");
        materiais = await resposta.json();

        renderizarCollageHeader();
        popularFiltrosSidebar();
        criarTemasPopulares();
        renderizar();

        // Verificar se há hash na URL para navegação direta
        verificarHashUrl();

    } catch (erro) {
        console.error("Erro ao carregar publicações:", erro);
        contadorResultados.textContent = "Erro ao carregar";
        catalogoGrid.innerHTML = `
            <div class="col-span-full text-center py-12 text-red-600 bg-red-50 rounded-xl">
                Ocorreu um erro ao carregar as publicações. Por favor, tente recarregar a página.
            </div>
        `;
    }
}

/* =========================================
   HEADER: COMPILADO DE CAPAS NO BACKGROUND
   ========================================= */
function renderizarCollageHeader() {
    if (!headerCollage || materiais.length === 0) return;

    // Gerar grade suficiente de capas para cobrir todo o banner
    const capas = [];
    while (capas.length < 32) {
        materiais.forEach(item => {
            if (item.capa) capas.push(item);
        });
        if (capas.length === 0) break;
    }

    headerCollage.innerHTML = capas.slice(0, 32).map(item => `
        <div class="aspect-[3/4] bg-slate-900/60 rounded-lg overflow-hidden shadow-sm border border-white/10 hover:border-white/30 transition-all">
            <img 
                src="${item.capa}" 
                alt="" 
                class="w-full h-full object-cover opacity-85 hover:opacity-100 hover:scale-105 transition-all duration-500" 
                loading="eager"
                onerror="this.parentElement.style.display='none'"
            >
        </div>
    `).join("");
}

/* =========================================
   MAPAS DE ESTILO E TEMAS (STITCH TOKENS)
   ========================================= */
const temaConfig = {
    "mulheres": {
        nome: "Mulheres",
        border: "border-theme-mulheres/40 hover:border-theme-mulheres",
        badge: "bg-theme-mulheres text-white",
        highlight: "bg-theme-mulheres/10 text-[#a7529a] border-theme-mulheres hover:bg-theme-mulheres/20",
        countBadge: "bg-theme-mulheres/20 text-[#a7529a]"
    },
    "habitacao": {
        nome: "Habitação e Raça",
        border: "border-theme-habitacao/40 hover:border-theme-habitacao",
        badge: "bg-theme-habitacao text-white",
        highlight: "bg-theme-habitacao/10 text-[#804e20] border-theme-habitacao hover:bg-theme-habitacao/20",
        countBadge: "bg-theme-habitacao/20 text-[#804e20]"
    },
    "direitos-humanos": {
        nome: "Direitos Humanos",
        border: "border-theme-direitos/40 hover:border-theme-direitos",
        badge: "bg-theme-direitos text-white",
        highlight: "bg-theme-direitos/10 text-[#3ca4bd] border-theme-direitos hover:bg-theme-direitos/20",
        countBadge: "bg-theme-direitos/20 text-[#3ca4bd]"
    },
    "infancia": {
        nome: "Infância e Juventude",
        border: "border-theme-infancia/40 hover:border-theme-infancia",
        badge: "bg-theme-infancia text-black font-semibold",
        highlight: "bg-theme-infancia/10 text-[#a37817] border-theme-infancia hover:bg-theme-infancia/20",
        countBadge: "bg-theme-infancia/30 text-[#a37817]"
    },
    "consumidor": {
        nome: "Consumidor",
        border: "border-theme-consumidor/40 hover:border-theme-consumidor",
        badge: "bg-theme-consumidor text-white",
        highlight: "bg-theme-consumidor/10 text-[#dd7129] border-theme-consumidor hover:bg-theme-consumidor/20",
        countBadge: "bg-theme-consumidor/20 text-[#dd7129]"
    },
    "idoso": {
        nome: "Pessoa Idosa / PCD",
        border: "border-theme-idoso/40 hover:border-theme-idoso",
        badge: "bg-theme-idoso text-white",
        highlight: "bg-theme-idoso/10 text-[#2a3289] border-theme-idoso hover:bg-theme-idoso/20",
        countBadge: "bg-theme-idoso/20 text-[#2a3289]"
    }
};

function obterInfoTema(item) {
    const texto = normalizar(`${item.tema || ""} ${item.titulo || ""} ${(item.tags || []).join(" ")}`);

    if (texto.includes("mulher") || texto.includes("genero") || texto.includes("lgbt") || texto.includes("maria da penha")) {
        return temaConfig["mulheres"];
    }
    if (texto.includes("habitac") || texto.includes("imoveis") || texto.includes("posse") || texto.includes("raca") || texto.includes("quilombola") || texto.includes("discriminacao")) {
        return temaConfig["habitacao"];
    }
    if (texto.includes("infancia") || texto.includes("jovem") || texto.includes("juventude") || texto.includes("educacao") || texto.includes("bullying") || texto.includes("familiar")) {
        return temaConfig["infancia"];
    }
    if (texto.includes("consumidor") || texto.includes("golpe") || texto.includes("fraude") || texto.includes("emprestimo")) {
        return temaConfig["consumidor"];
    }
    if (texto.includes("idoso") || texto.includes("deficiencia")) {
        return temaConfig["idoso"];
    }
    return temaConfig["direitos-humanos"];
}

function obterIconeTipo(tipo) {
    const t = normalizar(tipo);
    if (t.includes("cartilha")) return "description";
    if (t.includes("folder")) return "folder";
    if (t.includes("revista")) return "book";
    if (t.includes("material")) return "menu_book";
    return "article";
}

/* =========================================
   SIDEBAR DINÂMICA
   ========================================= */
function popularFiltrosSidebar() {
    if (totalBadge) totalBadge.textContent = materiais.length;
    if (totalHeroBadge) totalHeroBadge.textContent = materiais.length;

    // Núcleos
    const contagemNucleos = {};
    materiais.forEach(item => {
        if (!item.nucleo) return;
        item.nucleo.split(",").forEach(n => {
            const nucleoLimpo = n.trim();
            if (nucleoLimpo) {
                contagemNucleos[nucleoLimpo] = (contagemNucleos[nucleoLimpo] || 0) + 1;
            }
        });
    });

    if (totalNucleosBadge) totalNucleosBadge.textContent = Object.keys(contagemNucleos).length;

    listaNucleos.innerHTML = Object.entries(contagemNucleos)
        .sort((a, b) => a[0].localeCompare(b[0], "pt-BR"))
        .map(([nucleo, qtd]) => `
            <label class="flex items-center gap-2.5 text-xs text-on-surface hover:text-secondary cursor-pointer py-1 select-none transition-colors group">
                <input 
                    type="checkbox" 
                    value="${nucleo}" 
                    data-tipo-filtro="nucleos"
                    class="filtro-checkbox rounded border-outline-variant text-secondary focus:ring-secondary/30 w-4 h-4"
                >
                <span class="truncate font-medium">${nucleo}</span>
                <span class="opacity-60 ml-auto font-mono text-[11px]">(${qtd})</span>
            </label>
        `).join("");

    // Tipos
    const contagemTipos = {};
    materiais.forEach(item => {
        if (item.tipo) {
            contagemTipos[item.tipo] = (contagemTipos[item.tipo] || 0) + 1;
        }
    });

    listaTipos.innerHTML = Object.entries(contagemTipos)
        .sort((a, b) => b[1] - a[1])
        .map(([tipo, qtd]) => `
            <label class="flex items-center gap-2.5 text-xs text-on-surface hover:text-secondary cursor-pointer py-1 select-none transition-colors group">
                <input 
                    type="checkbox" 
                    value="${tipo}" 
                    data-tipo-filtro="tipos"
                    class="filtro-checkbox rounded border-outline-variant text-secondary focus:ring-secondary/30 w-4 h-4"
                >
                <span class="truncate font-medium">${tipo}</span>
                <span class="opacity-60 ml-auto font-mono text-[11px]">(${qtd})</span>
            </label>
        `).join("");

    // Anos
    const contagemAnos = {};
    materiais.forEach(item => {
        const ano = (item.data || "").split("/")[2];
        if (ano) {
            contagemAnos[ano] = (contagemAnos[ano] || 0) + 1;
        }
    });

    listaAnos.innerHTML = Object.entries(contagemAnos)
        .sort((a, b) => b[0] - a[0])
        .map(([ano, qtd]) => `
            <label class="flex items-center gap-2.5 text-xs text-on-surface hover:text-secondary cursor-pointer py-1 select-none transition-colors group">
                <input 
                    type="checkbox" 
                    value="${ano}" 
                    data-tipo-filtro="anos"
                    class="filtro-checkbox rounded border-outline-variant text-secondary focus:ring-secondary/30 w-4 h-4"
                >
                <span class="truncate font-medium">${ano}</span>
                <span class="opacity-60 ml-auto font-mono text-[11px]">(${qtd})</span>
            </label>
        `).join("");

    // Tags mais frequentes
    const contagemTags = {};
    materiais.forEach(item => {
        (item.tags || []).forEach(tag => {
            const t = tag.trim();
            if (t) {
                contagemTags[t] = (contagemTags[t] || 0) + 1;
            }
        });
    });

    listaTagsSidebar.innerHTML = Object.entries(contagemTags)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 14)
        .map(([tag, qtd]) => `
            <button 
                type="button" 
                class="tag-sidebar-btn text-[11px] bg-surface-container hover:bg-secondary-container hover:text-on-secondary-container px-2.5 py-1 rounded-lg transition-all text-on-surface-variant flex items-center gap-1 font-medium"
                data-tag="${tag}"
            >
                <span>${tag}</span>
                <span class="opacity-60 text-[10px]">(${qtd})</span>
            </button>
        `).join("");

    // Event listeners para checkboxes
    document.querySelectorAll(".filtro-checkbox").forEach(cb => {
        cb.addEventListener("change", (e) => {
            const tipo = e.target.dataset.tipoFiltro;
            const valor = e.target.value;
            if (e.target.checked) {
                estadoFiltros[tipo].add(valor);
            } else {
                estadoFiltros[tipo].delete(valor);
            }
            renderizar();
        });
    });

    // Event listeners para tags da sidebar
    document.querySelectorAll(".tag-sidebar-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            alternarTag(btn.dataset.tag);
        });
    });
}

/* =========================================
   TEMAS POPULARES / DESTAQUES
   ========================================= */
const destaquesCatalogo = [
    { label: "Mulheres e Gênero", termo: "mulheres", tema: "mulheres" },
    { label: "Habitação e Raça", termo: "habitação", tema: "habitacao" },
    { label: "Direitos Humanos", termo: "direitos humanos", tema: "direitos-humanos" },
    { label: "Infância e Juventude", termo: "infância", tema: "infancia" },
    { label: "Combate ao Racismo", termo: "racismo", tema: "habitacao" },
    { label: "Violência Doméstica", termo: "violência doméstica", tema: "mulheres" },
    { label: "Golpes e Fraudes", termo: "golpe", tema: "consumidor" },
    { label: "Educação em Direitos", termo: "educação", tema: "infancia" }
];

function contarTermo(termo) {
    const tNorm = normalizar(termo);
    return materiais.filter(item => {
        const texto = normalizar(`${item.titulo} ${item.tipo} ${item.nucleo} ${(item.tags || []).join(" ")}`);
        return texto.includes(tNorm);
    }).length;
}

function criarTemasPopulares() {
    temasPopularesContainer.innerHTML = "";

    destaquesCatalogo.forEach(item => {
        const quantidade = contarTermo(item.termo);
        const config = temaConfig[item.tema] || temaConfig["direitos-humanos"];

        const button = document.createElement("button");
        button.className = `flex items-center px-3.5 py-1.5 border rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shadow-2xs ${config.highlight}`;
        button.innerHTML = `
            <span class="mr-2">${item.label}</span>
            <span class="px-2 py-0.5 rounded-full text-xs font-mono font-bold ${config.countBadge}">
                ${quantidade}
            </span>
        `;

        button.addEventListener("click", () => {
            buscaInput.value = item.termo;
            estadoFiltros.busca = item.termo;
            btnLimparBusca.classList.remove("hidden");
            renderizar();
            buscaInput.focus();
        });

        temasPopularesContainer.appendChild(button);
    });
}

/* =========================================
   FILTRAGEM E ORDENAÇÃO
   ========================================= */
function filtrarItens() {
    let itens = [...materiais];

    // Busca textual
    if (estadoFiltros.busca) {
        const buscaNorm = normalizar(estadoFiltros.busca);
        itens = itens.filter(item => {
            const texto = normalizar([
                item.titulo,
                item.tipo,
                item.nucleo,
                item.data,
                item.tema,
                ...(item.tags || [])
            ].join(" "));
            return texto.includes(buscaNorm);
        });
    }

    // Núcleos
    if (estadoFiltros.nucleos.size > 0) {
        itens = itens.filter(item => {
            if (!item.nucleo) return false;
            const nucleosItem = item.nucleo.split(",").map(n => n.trim());
            return Array.from(estadoFiltros.nucleos).some(n => nucleosItem.includes(n));
        });
    }

    // Tipos
    if (estadoFiltros.tipos.size > 0) {
        itens = itens.filter(item => estadoFiltros.tipos.has(item.tipo));
    }

    // Anos
    if (estadoFiltros.anos.size > 0) {
        itens = itens.filter(item => {
            const ano = (item.data || "").split("/")[2];
            return estadoFiltros.anos.has(ano);
        });
    }

    // Tags
    if (estadoFiltros.tags.size > 0) {
        itens = itens.filter(item => {
            const tagsItem = (item.tags || []).map(t => normalizar(t));
            return Array.from(estadoFiltros.tags).some(tag => tagsItem.includes(normalizar(tag)));
        });
    }

    // Ordenação
    itens.sort((a, b) => {
        if (estadoFiltros.ordenacao === "za") {
            return b.titulo.localeCompare(a.titulo, "pt-BR");
        }
        if (estadoFiltros.ordenacao === "data-desc") {
            return converterDataParaTimestamp(b.data) - converterDataParaTimestamp(a.data);
        }
        if (estadoFiltros.ordenacao === "data-asc") {
            return converterDataParaTimestamp(a.data) - converterDataParaTimestamp(b.data);
        }
        return a.titulo.localeCompare(b.titulo, "pt-BR");
    });

    return itens;
}

function converterDataParaTimestamp(dataStr) {
    if (!dataStr) return 0;
    const partes = dataStr.split("/");
    if (partes.length === 3) {
        return new Date(`${partes[2]}-${partes[1]}-${partes[0]}`).getTime() || 0;
    }
    return 0;
}

/* =========================================
   ATUALIZAÇÃO DE CHIPS DE FILTROS ATIVOS
   ========================================= */
function atualizarFiltrosAtivos() {
    filtrosAtivosContainer.innerHTML = "";
    const chips = [];

    if (estadoFiltros.busca) {
        chips.push({
            label: `Busca: "${estadoFiltros.busca}"`,
            remover: () => {
                buscaInput.value = "";
                estadoFiltros.busca = "";
                btnLimparBusca.classList.add("hidden");
                renderizar();
            }
        });
    }

    estadoFiltros.nucleos.forEach(nucleo => {
        chips.push({
            label: `Núcleo: ${nucleo}`,
            remover: () => {
                estadoFiltros.nucleos.delete(nucleo);
                sincronizarCheckboxes();
                renderizar();
            }
        });
    });

    estadoFiltros.tipos.forEach(tipo => {
        chips.push({
            label: `Tipo: ${tipo}`,
            remover: () => {
                estadoFiltros.tipos.delete(tipo);
                sincronizarCheckboxes();
                renderizar();
            }
        });
    });

    estadoFiltros.anos.forEach(ano => {
        chips.push({
            label: `Ano: ${ano}`,
            remover: () => {
                estadoFiltros.anos.delete(ano);
                sincronizarCheckboxes();
                renderizar();
            }
        });
    });

    estadoFiltros.tags.forEach(tag => {
        chips.push({
            label: `#${tag}`,
            remover: () => {
                estadoFiltros.tags.delete(tag);
                renderizar();
            }
        });
    });

    if (chips.length > 0) {
        secaoFiltrosAtivos.classList.remove("hidden");
        chips.forEach(chip => {
            const span = document.createElement("span");
            span.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary/10 text-secondary border border-secondary/20 shadow-2xs";
            span.innerHTML = `
                <span>${chip.label}</span>
                <button type="button" class="hover:text-red-600 transition-colors flex items-center">
                    <span class="material-symbols-outlined text-sm">close</span>
                </button>
            `;
            span.querySelector("button").addEventListener("click", chip.remover);
            filtrosAtivosContainer.appendChild(span);
        });
    } else {
        secaoFiltrosAtivos.classList.add("hidden");
    }
}

function sincronizarCheckboxes() {
    document.querySelectorAll(".filtro-checkbox").forEach(cb => {
        const tipo = cb.dataset.tipoFiltro;
        const valor = cb.value;
        cb.checked = estadoFiltros[tipo].has(valor);
    });
}

function alternarTag(tag) {
    if (estadoFiltros.tags.has(tag)) {
        estadoFiltros.tags.delete(tag);
    } else {
        estadoFiltros.tags.add(tag);
    }
    renderizar();
}

/* =========================================
   RENDERIZAÇÃO DOS CARDS
   ========================================= */
function renderizar() {
    const itens = filtrarItens();
    atualizarFiltrosAtivos();

    contadorResultados.textContent = `${itens.length} ${itens.length === 1 ? 'publicação' : 'publicações'}`;

    if (itens.length === 0) {
        catalogoGrid.innerHTML = "";
        emptyState.classList.remove("hidden");
        return;
    }

    emptyState.classList.add("hidden");
    catalogoGrid.innerHTML = "";

    itens.forEach(item => {
        const temaInfo = obterInfoTema(item);
        const tipoIcone = obterIconeTipo(item.tipo);

        const card = document.createElement("article");
        card.id = item.id;
        card.className = `bg-surface-container-lowest border-2 ${temaInfo.border} rounded-2xl overflow-hidden flex flex-col hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] hover:-translate-y-1 transition-all duration-300 group`;

        card.innerHTML = `
            <!-- Capa do Documento -->
            <div class="aspect-[2/1] relative overflow-hidden bg-surface-container-high border-b border-outline-variant flex items-center justify-center p-3">
                <img
                    src="${item.capa}"
                    alt="${item.titulo}"
                    loading="lazy"
                    class="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500 rounded-md"
                    onerror="this.onerror=null; this.src='https://placehold.co/600x300/f0f4f8/0058be?text=Publica%C3%A7%C3%A3o+EDEPE';"
                >
            </div>

            <!-- Corpo do Card -->
            <div class="p-5 flex-1 flex flex-col">
                <!-- Badges de Tipo e Tema -->
                <div class="flex justify-between items-start mb-3 gap-2">
                    <span class="${temaInfo.badge} px-2.5 py-0.5 rounded-lg text-xs font-semibold shadow-2xs">
                        ${temaInfo.nome}
                    </span>
                    <span class="text-on-surface-variant text-xs flex items-center font-medium shrink-0 bg-surface-container-low px-2 py-0.5 rounded-md">
                        <span class="material-symbols-outlined text-[15px] mr-1 text-secondary">${tipoIcone}</span>
                        ${item.tipo}
                    </span>
                </div>

                <!-- Título -->
                <h4 class="text-base sm:text-lg font-bold font-title-md text-on-surface mb-2 leading-snug line-clamp-3 group-hover:text-secondary transition-colors" title="${item.titulo}">
                    ${item.titulo}
                </h4>

                <!-- Metadados: Data e Núcleo -->
                <div class="space-y-1.5 text-xs text-on-surface-variant mb-4">
                    <div class="flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-[15px] text-outline">event</span>
                        <span>Atualizado em ${item.data}</span>
                    </div>

                    ${item.nucleo ? `
                        <div class="flex items-start gap-1.5">
                            <span class="material-symbols-outlined text-[15px] text-secondary shrink-0 mt-0.5">hub</span>
                            <span class="font-semibold text-primary line-clamp-2">${item.nucleo}</span>
                        </div>
                    ` : ''}
                </div>

                <!-- Tags -->
                <div class="flex flex-wrap gap-1.5 mt-auto mb-4">
                    ${(item.tags || []).map(tag => `
                        <button
                            type="button"
                            class="tag-btn text-[11px] text-on-surface-variant bg-surface-container hover:bg-secondary/15 hover:text-secondary px-2.5 py-1 rounded-lg transition-colors font-medium cursor-pointer"
                            data-tag="${tag}"
                        >
                            #${tag}
                        </button>
                    `).join("")}
                </div>
            </div>

            <!-- Rodapé com Ações -->
            <div class="p-3.5 border-t border-outline-variant bg-surface-bright flex items-center gap-2">
                <button
                    type="button"
                    class="btn-visualizar flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
                    data-arquivo="${item.arquivo}"
                    data-titulo="${item.titulo}"
                >
                    <span class="material-symbols-outlined text-base">visibility</span> Visualizar
                </button>

                <a
                    href="${item.arquivo}"
                    target="_blank"
                    download
                    class="p-2 bg-surface-container hover:bg-secondary-container hover:text-on-secondary-container text-secondary rounded-xl transition-all flex items-center justify-center"
                    title="Baixar Arquivo"
                >
                    <span class="material-symbols-outlined text-lg">download</span>
                </a>

                <button
                    type="button"
                    class="btn-compartilhar p-2 bg-surface-container hover:bg-secondary-container hover:text-on-secondary-container text-secondary rounded-xl transition-all flex items-center justify-center cursor-pointer"
                    data-id="${item.id}"
                    title="Compartilhar Link"
                >
                    <span class="material-symbols-outlined text-lg">share</span>
                </button>
            </div>
        `;

        // Event listeners do card
        card.querySelector(".btn-visualizar").addEventListener("click", (e) => {
            const btn = e.currentTarget;
            abrirPdf(btn.dataset.arquivo, btn.dataset.titulo);
        });

        card.querySelector(".btn-compartilhar").addEventListener("click", (e) => {
            const btn = e.currentTarget;
            compartilhar(btn.dataset.id);
        });

        card.querySelectorAll(".tag-btn").forEach(tBtn => {
            tBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                alternarTag(tBtn.dataset.tag);
            });
        });

        catalogoGrid.appendChild(card);
    });
}

/* =========================================
   MODAL PDF
   ========================================= */
function abrirPdf(url, titulo) {
    if (!url.toLowerCase().endsWith('.pdf')) {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        if (url.toLowerCase().endsWith('.zip')) {
            link.download = '';
        }
        link.click();
        mostrarToast("Iniciando download do arquivo...");
        return;
    }
    modalPdfTitulo.textContent = titulo || "Visualização do Documento";
    modalPdfDownload.href = url;
    pdfFrame.src = url;
    modalPdf.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function fecharModalPdf() {
    modalPdf.classList.add("hidden");
    pdfFrame.src = "";
    document.body.style.overflow = "";
}

/* =========================================
   COMPARTILHAR E TOAST
   ========================================= */
function compartilhar(id) {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
            mostrarToast("Link direto copiado para a área de transferência!");
        }).catch(() => {
            mostrarToast("Link gerado: " + url);
        });
    } else {
        mostrarToast("Link gerado: " + url);
    }
}

function mostrarToast(texto) {
    toastMensagem.textContent = texto;
    toast.classList.add("toast-show");

    setTimeout(() => {
        toast.classList.remove("toast-show");
    }, 2800);
}

/* =========================================
   DEEP LINKING VIA HASH (#id)
   ========================================= */
function verificarHashUrl() {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;

    setTimeout(() => {
        const elemento = document.getElementById(hash);
        if (elemento) {
            elemento.scrollIntoView({ behavior: "smooth", block: "center" });
            elemento.classList.add("card-highlighted");
            setTimeout(() => {
                elemento.classList.remove("card-highlighted");
            }, 3000);
        }
    }, 300);
}

/* =========================================
   LIMPEZA DE FILTROS
   ========================================= */
function limparTodosFiltros() {
    buscaInput.value = "";
    btnLimparBusca.classList.add("hidden");
    estadoFiltros.busca = "";
    estadoFiltros.nucleos.clear();
    estadoFiltros.tipos.clear();
    estadoFiltros.anos.clear();
    estadoFiltros.tags.clear();
    estadoFiltros.ordenacao = "az";
    ordenacaoSelect.value = "az";

    sincronizarCheckboxes();
    renderizar();
}

/* =========================================
   EVENT LISTENERS GLOBAIS
   ========================================= */
buscaInput.addEventListener("input", (e) => {
    estadoFiltros.busca = e.target.value;
    if (e.target.value) {
        btnLimparBusca.classList.remove("hidden");
    } else {
        btnLimparBusca.classList.add("hidden");
    }
    renderizar();
});

btnLimparBusca.addEventListener("click", () => {
    buscaInput.value = "";
    estadoFiltros.busca = "";
    btnLimparBusca.classList.add("hidden");
    renderizar();
    buscaInput.focus();
});

ordenacaoSelect.addEventListener("change", (e) => {
    estadoFiltros.ordenacao = e.target.value;
    renderizar();
});

btnLimpar.addEventListener("click", limparTodosFiltros);
btnLimparSidebar.addEventListener("click", limparTodosFiltros);
btnTodasPesquisas.addEventListener("click", limparTodosFiltros);
btnLimparChips.addEventListener("click", limparTodosFiltros);
btnResetarBusca.addEventListener("click", limparTodosFiltros);

fecharModal.addEventListener("click", fecharModalPdf);
modalPdf.addEventListener("click", (e) => {
    if (e.target === modalPdf) {
        fecharModalPdf();
    }
});

window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modalPdf.classList.contains("hidden")) {
        fecharModalPdf();
    }
});

window.addEventListener("hashchange", verificarHashUrl);

/* =========================================
   INICIALIZAÇÃO
   ========================================= */
carregarDados();
