/**
 * Módulo da página de detalhes do produto.
 * O produto exibido é identificado pelo parâmetro "id" da URL
 * (ex.: produto.html?id=3).
 */

import { adicionarAoCarrinho } from './carrinho.js';
import { formatarMoeda, escaparHtml } from './utils.js';

function obterIdDaUrl() {
    const parametros = new URLSearchParams(window.location.search);
    return Number.parseInt(parametros.get('id'), 10);
}

function criarHtmlDetalhes(produto) {
    const nome = escaparHtml(produto.nome);

    return `
        <div class="detalhes-layout">
            <img class="detalhes-imagem" src="${escaparHtml(produto.imagem)}" alt="${nome}">
            <div class="detalhes-info">
                <h1>${nome}</h1>
                <p class="detalhes-meta">
                    Categoria: ${escaparHtml(produto.categoria)} | Marca: ${escaparHtml(produto.marca)}
                </p>
                <p class="detalhes-descricao">${escaparHtml(produto.descricao)}</p>
                <p class="detalhes-preco">${formatarMoeda(produto.preco)}</p>
                <button type="button" class="btn-primario" data-acao="adicionar" data-id="${produto.id}">
                    Adicionar ao carrinho
                </button>
            </div>
        </div>
    `;
}

/**
 * Renderiza o produto indicado na URL ou uma mensagem de produto não encontrado.
 * @param {Array<object>} produtos
 */
export function iniciarPaginaProduto(produtos) {
    const container = document.getElementById('detalhes-produto');
    const produto = produtos.find(item => item.id === obterIdDaUrl());

    if (!produto) {
        document.title = 'Produto não encontrado | Meu E-commerce';
        container.innerHTML = `
            <div class="mensagem-vazia">
                <h1>Produto não encontrado</h1>
                <p><a href="catalogo.html">Voltar ao catálogo</a></p>
            </div>
        `;
        return;
    }

    document.title = `${produto.nome} | Meu E-commerce`;
    container.innerHTML = criarHtmlDetalhes(produto);

    container.querySelector('[data-acao="adicionar"]').addEventListener('click', () => {
        adicionarAoCarrinho(produto.id);
    });
}