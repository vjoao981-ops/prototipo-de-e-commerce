/**
 * Módulo da vitrine de produtos: destaques da página inicial e catálogo
 * com busca, filtro por categoria, ordenação e paginação.
 */

import { adicionarAoCarrinho } from './carrinho.js';
import { formatarMoeda, normalizarTexto, escaparHtml } from './utils.js';

const PRODUTOS_POR_PAGINA = 20;

/* ---------- Renderização dos cards ---------- */

function criarHtmlCard(produto) {
    const nome = escaparHtml(produto.nome);

    return `
        <article class="produto-card">
            <a class="produto-link" href="produto.html?id=${produto.id}">
                <img class="produto-imagem" src="${escaparHtml(produto.imagem)}" alt="${nome}" loading="lazy">
                <h3>${nome}</h3>
                <p class="categoria">${escaparHtml(produto.categoria)} - ${escaparHtml(produto.marca)}</p>
                <p class="preco">${formatarMoeda(produto.preco)}</p>
            </a>
            <button type="button" class="btn-primario" data-acao="adicionar" data-id="${produto.id}">
                Adicionar ao carrinho
            </button>
        </article>
    `;
}

function renderizarProdutos(lista, container) {
    if (lista.length === 0) {
        container.innerHTML = '<p class="mensagem-vazia">Nenhum produto encontrado. Tente outra busca ou categoria.</p>';
        return;
    }

    container.innerHTML = lista.map(criarHtmlCard).join('');
}

function registrarAdicaoAoCarrinho(container) {
    container.addEventListener('click', evento => {
        const botao = evento.target.closest('[data-acao="adicionar"]');

        if (botao) {
            adicionarAoCarrinho(Number(botao.dataset.id));
        }
    });
}

/* ---------- Página inicial ---------- */

/**
 * Exibe os produtos em destaque na vitrine da página inicial.
 * @param {Array<object>} produtos
 */
export function iniciarDestaques(produtos) {
    const vitrine = document.getElementById('vitrine-destaques');
    const destaques = produtos.filter(produto => produto.destaque === true);

    renderizarProdutos(destaques, vitrine);
    registrarAdicaoAoCarrinho(vitrine);
}

/* ---------- Catálogo ---------- */

function preencherCategorias(select, produtos) {
    const categorias = [...new Set(produtos.map(produto => produto.categoria))]
        .sort((a, b) => a.localeCompare(b, 'pt-BR'));

    categorias.forEach(categoria => {
        const opcao = document.createElement('option');
        opcao.value = categoria;
        opcao.textContent = categoria;
        select.appendChild(opcao);
    });
}

function filtrarEOrdenar(produtos, { texto, categoria, ordenacao }) {
    const termo = normalizarTexto(texto);

    const resultado = produtos.filter(produto => {
        const correspondeBusca = termo === ''
            || normalizarTexto(produto.nome).includes(termo)
            || normalizarTexto(produto.marca).includes(termo);
        const correspondeCategoria = categoria === 'todas' || produto.categoria === categoria;

        return correspondeBusca && correspondeCategoria;
    });

    if (ordenacao === 'menor-preco') {
        resultado.sort((a, b) => a.preco - b.preco);
    } else if (ordenacao === 'maior-preco') {
        resultado.sort((a, b) => b.preco - a.preco);
    }

    return resultado;
}

function renderizarPaginacao(container, paginaAtual, totalPaginas) {
    if (totalPaginas <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = `<button type="button" class="btn-pagina" data-pagina="${paginaAtual - 1}"
                        ${paginaAtual === 1 ? 'disabled' : ''}>Anterior</button>`;

    for (let pagina = 1; pagina <= totalPaginas; pagina++) {
        const atual = pagina === paginaAtual ? ' aria-current="page"' : '';
        html += `<button type="button" class="btn-pagina" data-pagina="${pagina}"
                         aria-label="Página ${pagina}"${atual}>${pagina}</button>`;
    }

    html += `<button type="button" class="btn-pagina" data-pagina="${paginaAtual + 1}"
                     ${paginaAtual === totalPaginas ? 'disabled' : ''}>Próxima</button>`;

    container.innerHTML = html;
}

/**
 * Inicializa a página de catálogo: filtros, ordenação e paginação.
 * @param {Array<object>} produtos
 */
export function iniciarCatalogo(produtos) {
    const vitrine = document.getElementById('vitrine-catalogo');
    const campoBusca = document.getElementById('busca-nome');
    const filtroCategoria = document.getElementById('filtro-categoria');
    const ordenacao = document.getElementById('ordenacao');
    const paginacao = document.getElementById('paginacao');

    let paginaAtual = 1;

    function atualizar() {
        const filtrados = filtrarEOrdenar(produtos, {
            texto: campoBusca.value,
            categoria: filtroCategoria.value,
            ordenacao: ordenacao.value
        });

        const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PRODUTOS_POR_PAGINA));
        paginaAtual = Math.min(paginaAtual, totalPaginas);

        const inicio = (paginaAtual - 1) * PRODUTOS_POR_PAGINA;
        renderizarProdutos(filtrados.slice(inicio, inicio + PRODUTOS_POR_PAGINA), vitrine);
        renderizarPaginacao(paginacao, paginaAtual, totalPaginas);
    }

    function aoMudarFiltro() {
        paginaAtual = 1;
        atualizar();
    }

    preencherCategorias(filtroCategoria, produtos);

    campoBusca.addEventListener('input', aoMudarFiltro);
    filtroCategoria.addEventListener('change', aoMudarFiltro);
    ordenacao.addEventListener('change', aoMudarFiltro);

    paginacao.addEventListener('click', evento => {
        const botao = evento.target.closest('[data-pagina]');

        if (!botao || botao.disabled) {
            return;
        }

        paginaAtual = Number(botao.dataset.pagina);
        atualizar();
        document.getElementById('controles-catalogo').scrollIntoView();
    });

    registrarAdicaoAoCarrinho(vitrine);
    atualizar();
}