/* =========================================
   CATÁLOGO EDEPE - LÓGICA DA APLICAÇÃO
   ========================================= */

let materiais = [];

// Estado dos filtros
const estadoFiltros = {
    busca: "",
    nucleos: new Set(),
    temas: new Set(),
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
const listaTemas = document.getElementById("listaTemas");
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

// Botão Voltar ao Topo
const btnBackToTop = document.getElementById("btnBackToTop");

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
function obterConfigTema(temaNome) {
    const nome = normalizar(temaNome);
    
    // 1. #a7529a - mulheres, sexualidade, gênero, diversidade
    if (nome === "mulheres" || nome === "sexualidade" || nome === "genero" || nome === "gênero" || nome === "diversidade") {
        return {
            nome: temaNome,
            border: "border-theme-mulheres/40 hover:border-theme-mulheres",
            badge: "bg-theme-mulheres text-white",
            colorClass: "theme-mulheres",
            highlight: "bg-theme-mulheres/10 text-[#a7529a] border-theme-mulheres hover:bg-theme-mulheres/20",
            countBadge: "bg-theme-mulheres/20 text-[#a7529a]"
        };
    }
    
    // 2. #804e20 - habitação, raça, cor, comunidades tradicionais
    if (nome === "habitação" || nome === "habitacao" || nome === "raça" || nome === "raca" || nome === "cor" || nome === "comunidades tradicionais" || nome === "igualdade racial") {
        return {
            nome: temaNome,
            border: "border-theme-habitacao/40 hover:border-theme-habitacao",
            badge: "bg-theme-habitacao text-white",
            colorClass: "theme-habitacao",
            highlight: "bg-theme-habitacao/10 text-[#804e20] border-theme-habitacao hover:bg-theme-habitacao/20",
            countBadge: "bg-theme-habitacao/20 text-[#804e20]"
        };
    }
    
    // 3. #3ca4bd - direitos humanos, meio ambiente
    if (nome === "direitos humanos" || nome === "meio ambiente" || nome === "saúde" || nome === "saude" || nome === "liberdade religiosa" || nome === "defensores populares") {
        return {
            nome: temaNome,
            border: "border-theme-direitos/40 hover:border-theme-direitos",
            badge: "bg-theme-direitos text-white",
            colorClass: "theme-direitos",
            highlight: "bg-theme-direitos/10 text-[#3ca4bd] border-theme-direitos hover:bg-theme-direitos/20",
            countBadge: "bg-theme-direitos/20 text-[#3ca4bd]"
        };
    }
    
    // 4. #f2b630 - infância, juventude, família
    if (nome === "infância" || nome === "infancia" || nome === "juventude" || nome === "família" || nome === "familia" || nome === "educação" || nome === "educacao") {
        return {
            nome: temaNome,
            border: "border-theme-infancia/40 hover:border-theme-infancia",
            badge: "bg-theme-infancia text-black font-semibold",
            colorClass: "theme-infancia",
            highlight: "bg-theme-infancia/10 text-[#a37817] border-theme-infancia hover:bg-theme-infancia/20",
            countBadge: "bg-theme-infancia/30 text-[#a37817]"
        };
    }
    
    // 5. #2a3289 - pessoa idosa, deficiência
    if (nome === "pessoa idosa" || nome === "deficiência" || nome === "deficiencia" || nome === "idoso") {
        return {
            nome: temaNome,
            border: "border-theme-idoso/40 hover:border-theme-idoso",
            badge: "bg-theme-idoso text-white",
            colorClass: "theme-idoso",
            highlight: "bg-theme-idoso/10 text-[#2a3289] border-theme-idoso hover:bg-theme-idoso/20",
            countBadge: "bg-theme-idoso/20 text-[#2a3289]"
        };
    }
    
    // 6. #dd7129 - consumidor, criminal
    if (nome === "consumidor" || nome === "criminal") {
        return {
            nome: temaNome,
            border: "border-theme-consumidor/40 hover:border-theme-consumidor",
            badge: "bg-theme-consumidor text-white",
            colorClass: "theme-consumidor",
            highlight: "bg-theme-consumidor/10 text-[#dd7129] border-theme-consumidor hover:bg-theme-consumidor/20",
            countBadge: "bg-theme-consumidor/20 text-[#dd7129]"
        };
    }
    
    // Default fallback
    return {
        nome: temaNome,
        border: "border-outline-variant/40 hover:border-outline",
        badge: "bg-outline text-white",
        colorClass: "outline",
        highlight: "bg-outline/10 text-[#76777d] border-outline hover:bg-outline/20",
        countBadge: "bg-outline/20 text-[#76777d]"
    };
}

function obterInfoTema(item) {
    const temas = item.temas || [];
    const primeiroTema = temas[0] || "direitos humanos";
    return obterConfigTema(primeiroTema);
}

function obterIconeTipo(tipo) {
    const t = normalizar(tipo);
    if (t.includes("cartilha")) return "description";
    if (t.includes("folder")) return "map";
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

    const nucleosHTML = Object.entries(contagemNucleos)
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

    const selectAllNucleosHTML = `
        <label class="flex items-center gap-2.5 text-xs text-on-surface hover:text-secondary cursor-pointer py-1 select-none transition-colors group font-semibold border-b border-outline-variant/30 pb-1.5 mb-1.5">
            <input 
                type="checkbox" 
                data-select-all="nucleos"
                class="select-all-checkbox rounded border-outline-variant text-secondary focus:ring-secondary/30 w-4 h-4"
            >
            <span class="truncate">Selecionar todos</span>
        </label>
    `;

    listaNucleos.innerHTML = selectAllNucleosHTML + nucleosHTML;

    // Temas
    const contagemTemas = {};
    materiais.forEach(item => {
        if (!item.temas) return;
        item.temas.forEach(t => {
            const temaLimpo = t.trim();
            if (temaLimpo) {
                contagemTemas[temaLimpo] = (contagemTemas[temaLimpo] || 0) + 1;
            }
        });
    });

    const temasHTML = Object.entries(contagemTemas)
        .sort((a, b) => a[0].localeCompare(b[0], "pt-BR"))
        .map(([tema, qtd]) => `
            <label class="flex items-center gap-2.5 text-xs text-on-surface hover:text-secondary cursor-pointer py-1 select-none transition-colors group">
                <input 
                    type="checkbox" 
                    value="${tema}" 
                    data-tipo-filtro="temas"
                    class="filtro-checkbox rounded border-outline-variant text-secondary focus:ring-secondary/30 w-4 h-4"
                >
                <span class="truncate font-medium">${tema}</span>
                <span class="opacity-60 ml-auto font-mono text-[11px]">(${qtd})</span>
            </label>
        `).join("");

    const selectAllTemasHTML = `
        <label class="flex items-center gap-2.5 text-xs text-on-surface hover:text-secondary cursor-pointer py-1 select-none transition-colors group font-semibold border-b border-outline-variant/30 pb-1.5 mb-1.5">
            <input 
                type="checkbox" 
                data-select-all="temas"
                class="select-all-checkbox rounded border-outline-variant text-secondary focus:ring-secondary/30 w-4 h-4"
            >
            <span class="truncate">Selecionar todos</span>
        </label>
    `;

    listaTemas.innerHTML = selectAllTemasHTML + temasHTML;

    // Tipos
    const contagemTipos = {};
    materiais.forEach(item => {
        if (item.tipo) {
            contagemTipos[item.tipo] = (contagemTipos[item.tipo] || 0) + 1;
        }
    });

    const tiposHTML = Object.entries(contagemTipos)
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

    const selectAllTiposHTML = `
        <label class="flex items-center gap-2.5 text-xs text-on-surface hover:text-secondary cursor-pointer py-1 select-none transition-colors group font-semibold border-b border-outline-variant/30 pb-1.5 mb-1.5">
            <input 
                type="checkbox" 
                data-select-all="tipos"
                class="select-all-checkbox rounded border-outline-variant text-secondary focus:ring-secondary/30 w-4 h-4"
            >
            <span class="truncate">Selecionar todos</span>
        </label>
    `;

    listaTipos.innerHTML = selectAllTiposHTML + tiposHTML;

    // Anos
    const contagemAnos = {};
    materiais.forEach(item => {
        const ano = (item.data || "").split("/")[2];
        if (ano) {
            contagemAnos[ano] = (contagemAnos[ano] || 0) + 1;
        }
    });

    const anosHTML = Object.entries(contagemAnos)
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

    const selectAllAnosHTML = `
        <label class="flex items-center gap-2.5 text-xs text-on-surface hover:text-secondary cursor-pointer py-1 select-none transition-colors group font-semibold border-b border-outline-variant/30 pb-1.5 mb-1.5">
            <input 
                type="checkbox" 
                data-select-all="anos"
                class="select-all-checkbox rounded border-outline-variant text-secondary focus:ring-secondary/30 w-4 h-4"
            >
            <span class="truncate">Selecionar todos</span>
        </label>
    `;

    listaAnos.innerHTML = selectAllAnosHTML + anosHTML;

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
        .sort((a, b) => a[0].localeCompare(b[0], "pt-BR"))
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

    // Event listeners para checkboxes individuais
    document.querySelectorAll(".filtro-checkbox").forEach(cb => {
        cb.addEventListener("change", (e) => {
            const tipo = e.target.dataset.tipoFiltro;
            const valor = e.target.value;
            if (e.target.checked) {
                estadoFiltros[tipo].add(valor);
            } else {
                estadoFiltros[tipo].delete(valor);
            }
            sincronizarCheckboxes();
            renderizar();
        });
    });

    // Event listeners para checkboxes "Selecionar todos"
    document.querySelectorAll(".select-all-checkbox").forEach(cbAll => {
        cbAll.addEventListener("change", (e) => {
            const tipo = e.target.dataset.selectAll;
            const marcado = e.target.checked;
            const checkboxesGrupo = document.querySelectorAll(`.filtro-checkbox[data-tipo-filtro="${tipo}"]`);
            
            checkboxesGrupo.forEach(cb => {
                const valor = cb.value;
                if (marcado) {
                    estadoFiltros[tipo].add(valor);
                } else {
                    estadoFiltros[tipo].delete(valor);
                }
            });
            
            sincronizarCheckboxes();
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
function criarTemasPopulares() {
    temasPopularesContainer.innerHTML = "";

    // Contar a quantidade de materiais para cada tema presente em dados.json
    const contagemTemas = {};
    materiais.forEach(item => {
        if (item.temas) {
            item.temas.forEach(t => {
                const temaLimpo = t.trim();
                if (temaLimpo) {
                    contagemTemas[temaLimpo] = (contagemTemas[temaLimpo] || 0) + 1;
                }
            });
        }
    });

    // Ordenar decrescente e pegar os 5 principais
    const topTemas = Object.entries(contagemTemas)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"))
        .slice(0, 5);

    topTemas.forEach(([temaNome, qtd]) => {
        const config = obterConfigTema(temaNome);

        const button = document.createElement("button");
        button.className = `tema-destaque-btn flex items-center px-3.5 py-1.5 border rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shadow-2xs ${config.highlight}`;
        button.dataset.tema = temaNome;
        button.innerHTML = `
            <span class="mr-2">${temaNome}</span>
            <span class="count-badge px-2 py-0.5 rounded-full text-xs font-mono font-bold ${config.countBadge}">
                ${qtd}
            </span>
        `;

        button.addEventListener("click", () => {
            if (estadoFiltros.temas.has(temaNome)) {
                estadoFiltros.temas.delete(temaNome);
            } else {
                estadoFiltros.temas.add(temaNome);
            }
            sincronizarCheckboxes();
            renderizar();
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
                ...(item.temas || []),
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

    // Temas
    if (estadoFiltros.temas.size > 0) {
        itens = itens.filter(item => {
            const temasItem = item.temas || [];
            return Array.from(estadoFiltros.temas).some(t => temasItem.includes(t));
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

    estadoFiltros.temas.forEach(tema => {
        chips.push({
            label: `Tema: ${tema}`,
            remover: () => {
                estadoFiltros.temas.delete(tema);
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
                sincronizarCheckboxes();
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
    // Sincroniza os checkboxes individuais
    document.querySelectorAll(".filtro-checkbox").forEach(cb => {
        const tipo = cb.dataset.tipoFiltro;
        const valor = cb.value;
        cb.checked = estadoFiltros[tipo].has(valor);
    });

    // Sincroniza os checkboxes "Selecionar todos"
    document.querySelectorAll(".select-all-checkbox").forEach(cbAll => {
        const tipo = cbAll.dataset.selectAll;
        const checkboxesGrupo = document.querySelectorAll(`.filtro-checkbox[data-tipo-filtro="${tipo}"]`);
        
        if (checkboxesGrupo.length > 0) {
            const todosMarcados = Array.from(checkboxesGrupo).every(cb => cb.checked);
            cbAll.checked = todosMarcados;
        } else {
            cbAll.checked = false;
        }
    });

    // Sincroniza os botões de tags na sidebar
    document.querySelectorAll(".tag-sidebar-btn").forEach(btn => {
        const tag = btn.dataset.tag;
        if (estadoFiltros.tags.has(tag)) {
            btn.classList.remove("bg-surface-container", "text-on-surface-variant");
            btn.classList.add("bg-secondary", "text-white");
        } else {
            btn.classList.add("bg-surface-container", "text-on-surface-variant");
            btn.classList.remove("bg-secondary", "text-white");
        }
    });

    // Sincroniza os botões de temas em destaque
    document.querySelectorAll(".tema-destaque-btn").forEach(btn => {
        const tema = btn.dataset.tema;
        const config = obterConfigTema(tema);
        const countBadge = btn.querySelector(".count-badge");
        
        if (estadoFiltros.temas.has(tema)) {
            // Estado ativo: fundo sólido do tema correspondente
            let borderClass = config.border.split(" ")[0].replace("/40", "");
            btn.className = `tema-destaque-btn flex items-center px-3.5 py-1.5 border ${borderClass} rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shadow-2xs ${config.badge}`;
            const isTextBlack = config.badge.includes("text-black");
            countBadge.className = `count-badge px-2 py-0.5 rounded-full text-xs font-mono font-bold ${isTextBlack ? 'bg-black/10 text-black' : 'bg-white/20 text-white'}`;
        } else {
            // Estado inativo: estilo de destaque suave
            btn.className = `tema-destaque-btn flex items-center px-3.5 py-1.5 border rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shadow-2xs ${config.highlight}`;
            countBadge.className = `count-badge px-2 py-0.5 rounded-full text-xs font-mono font-bold ${config.countBadge}`;
        }
    });
}

function alternarTag(tag) {
    if (estadoFiltros.tags.has(tag)) {
        estadoFiltros.tags.delete(tag);
    } else {
        estadoFiltros.tags.add(tag);
    }
    sincronizarCheckboxes();
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
        const temas = item.temas || [];
        const primeiroTema = temas[0] || "direitos humanos";
        const temaInfoPrimeiro = obterConfigTema(primeiroTema);
        const tipoIcone = obterIconeTipo(item.tipo);

        const card = document.createElement("article");
        card.id = item.id;
        card.className = `bg-surface-container-lowest border-2 ${temaInfoPrimeiro.border} rounded-2xl overflow-hidden flex flex-col hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] hover:-translate-y-1 transition-all duration-300 group`;

        // Render all theme badges
        const badgesTemasHTML = temas.map(t => {
            const config = obterConfigTema(t);
            return `<button type="button" class="tema-badge-btn ${config.badge} px-2.5 py-0.5 rounded-lg text-[10px] sm:text-xs font-semibold shadow-2xs whitespace-nowrap hover:opacity-90 active:scale-95 transition-all cursor-pointer" data-tema="${t}">${config.nome}</button>`;
        }).join("");

        card.innerHTML = `
            <!-- Capa do Documento -->
            <div class="capa-container aspect-[4/3] relative overflow-hidden bg-${temaInfoPrimeiro.colorClass}/10 border-b border-outline-variant flex items-center justify-center p-3 cursor-pointer"
                 data-arquivo="${item.arquivo}"
                 data-titulo="${item.titulo}"
                 title="Visualizar publicação">
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
                <div class="flex justify-between items-start mb-3 gap-2 flex-wrap">
                    <div class="flex flex-wrap gap-1.5 max-w-[70%]">
                        ${badgesTemasHTML}
                    </div>
                    <span class="text-on-surface-variant text-xs flex items-center font-medium shrink-0 bg-surface-container-low px-2 py-0.5 rounded-md">
                        <span class="material-symbols-outlined text-[15px] mr-1 text-secondary">${tipoIcone}</span>
                        ${item.tipo}
                    </span>
                </div>

                <!-- Título -->
                <h4 class="text-base sm:text-lg font-bold font-title-md text-on-surface mb-2 leading-[1.1] line-clamp-3 group-hover:text-secondary transition-colors" title="${item.titulo}">
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
        card.querySelector(".capa-container").addEventListener("click", (e) => {
            const container = e.currentTarget;
            abrirPdf(container.dataset.arquivo, container.dataset.titulo);
        });

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

        card.querySelectorAll(".tema-badge-btn").forEach(tBadge => {
            tBadge.addEventListener("click", (e) => {
                e.stopPropagation();
                const tema = tBadge.dataset.tema;
                if (estadoFiltros.temas.has(tema)) {
                    estadoFiltros.temas.delete(tema);
                } else {
                    estadoFiltros.temas.add(tema);
                }
                sincronizarCheckboxes();
                renderizar();
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
    
    // Atualiza o atributo data do object
    pdfFrame.setAttribute("data", url);
    
    // Atualiza o link do fallback se existir
    const fallbackLink = document.getElementById("pdfFallbackLink");
    if (fallbackLink) {
        fallbackLink.href = url;
    }
    
    modalPdf.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function fecharModalPdf() {
    modalPdf.classList.add("hidden");
    pdfFrame.setAttribute("data", "");
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
    estadoFiltros.temas.clear();
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

// Mostrar/ocultar botão de voltar ao topo ao scrollar
window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
        btnBackToTop.classList.remove("opacity-0", "translate-y-10", "pointer-events-none");
        btnBackToTop.classList.add("opacity-100", "translate-y-0", "pointer-events-auto");
    } else {
        btnBackToTop.classList.add("opacity-0", "translate-y-10", "pointer-events-none");
        btnBackToTop.classList.remove("opacity-100", "translate-y-0", "pointer-events-auto");
    }
});

// Ação de voltar ao topo
btnBackToTop.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

/* =========================================
   INICIALIZAÇÃO
   ========================================= */
carregarDados();
