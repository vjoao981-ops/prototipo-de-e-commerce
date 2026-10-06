/**
 * Módulo do carrinho de compras.
 *
 * O carrinho armazena apenas o id e a quantidade de cada item. Nome, preço e
 * imagem são sempre obtidos da lista de produtos carregada, evitando preços
 * desatualizados no armazenamento local.
 */

import { formatarMoeda, escaparHtml } from './utils.js';

const CHAVE_ARMAZENAMENTO = 'carrinhoTech';
const QUANTIDADE_MAXIMA = 99;

let produtosPorId = new Map();
let itens = [];
let elementoQueAbriu = null;

let gaveta;
let fundo;
let botaoAbrir;

/* ---------- Persistência ---------- */

function lerItensSalvos() {
    try {
        const salvos = JSON.parse(localStorage.getItem(CHAVE_ARMAZENAMENTO));

        if (!Array.isArray(salvos)) {
            return [];
        }

        return salvos
            .filter(item => Number.isInteger(item?.id) && Number.isInteger(item?.quantidade) && item.quantidade > 0)
            .map(item => ({ id: item.id, quantidade: Math.min(item.quantidade, QUANTIDADE_MAXIMA) }));
    } catch (erro) {
        console.error('Não foi possível ler o carrinho salvo:', erro);
        return [];
    }
}

function salvarItens() {
    try {
        localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(itens));
    } catch (erro) {
        console.error('Não foi possível salvar o carrinho:', erro);
    }
}

/* ---------- Operações sobre os itens ---------- */

/**
 * Adiciona uma unidade do produto ao carrinho e abre a gaveta.
 * @param {number} idProduto
 */
export function adicionarAoCarrinho(idProduto) {
    if (!produtosPorId.has(idProduto)) {
        console.error(`Produto inexistente: ${idProduto}`);
        return;
    }

    const item = itens.find(i => i.id === idProduto);

    if (item) {
        item.quantidade = Math.min(item.quantidade + 1, QUANTIDADE_MAXIMA);
    } else {
        itens.push({ id: idProduto, quantidade: 1 });
    }

    atualizarCarrinho();
    abrirCarrinho();
}

function alterarQuantidade(idProduto, variacao) {
    const item = itens.find(i => i.id === idProduto);

    if (!item) {
        return;
    }

    item.quantidade += variacao;

    if (item.quantidade <= 0) {
        removerDoCarrinho(idProduto);
        return;
    }

    item.quantidade = Math.min(item.quantidade, QUANTIDADE_MAXIMA);
    atualizarCarrinho();
}

function removerDoCarrinho(idProduto) {
    itens = itens.filter(item => item.id !== idProduto);
    atualizarCarrinho();
}

function finalizarCompra() {
    if (itens.length === 0) {
        alert('Seu carrinho está vazio. Adicione produtos antes de finalizar.');
        return;
    }

    if (!confirm('Deseja realmente finalizar esta compra?')) {
        return;
    }

    itens = [];
    atualizarCarrinho();
    fecharCarrinho();
    alert('Compra realizada com sucesso! Obrigado por testar este protótipo.');
}

/* ---------- Renderização ---------- */

function atualizarCarrinho() {
    salvarItens();
    renderizarCarrinho();
}

function renderizarCarrinho() {
    const container = document.getElementById('itens-carrinho');
    const spanTotal = document.getElementById('total-carrinho');
    const contador = document.getElementById('contador-carrinho');

    if (itens.length === 0) {
        container.innerHTML = '<p class="mensagem-vazia">Seu carrinho está vazio.</p>';
    } else {
        container.innerHTML = itens.map(criarHtmlItem).join('');
    }

    // O total é calculado em centavos para evitar erros de ponto flutuante.
    const totalCentavos = itens.reduce((soma, item) => {
        return soma + Math.round(produtosPorId.get(item.id).preco * 100) * item.quantidade;
    }, 0);

    spanTotal.textContent = formatarMoeda(totalCentavos / 100);
    contador.textContent = itens.reduce((soma, item) => soma + item.quantidade, 0);
}

function criarHtmlItem(item) {
    const produto = produtosPorId.get(item.id);
    const nome = escaparHtml(produto.nome);

    return `
        <div class="item-carrinho">
            <img src="${escaparHtml(produto.imagem)}" alt="${nome}">
            <div class="item-info">
                <h4>${nome}</h4>
                <p>${formatarMoeda(produto.preco)} cada</p>
                <div class="item-quantidade">
                    <button type="button" class="btn-quantidade" data-acao="diminuir" data-id="${item.id}"
                            aria-label="Diminuir quantidade de ${nome}">&minus;</button>
                    <span aria-label="Quantidade">${item.quantidade}</span>
                    <button type="button" class="btn-quantidade" data-acao="aumentar" data-id="${item.id}"
                            aria-label="Aumentar quantidade de ${nome}">+</button>
                </div>
                <button type="button" class="btn-remover" data-acao="remover" data-id="${item.id}">Remover</button>
            </div>
        </div>
    `;
}

/* ---------- Gaveta (abrir, fechar e montagem) ---------- */

function abrirCarrinho() {
    elementoQueAbriu = document.activeElement;

    gaveta.classList.add('carrinho-visivel');
    gaveta.setAttribute('aria-hidden', 'false');
    fundo.classList.add('visivel');
    document.body.classList.add('carrinho-aberto');
    botaoAbrir?.setAttribute('aria-expanded', 'true');

    document.getElementById('btn-fechar-carrinho').focus();
}

function fecharCarrinho() {
    gaveta.classList.remove('carrinho-visivel');
    gaveta.setAttribute('aria-hidden', 'true');
    fundo.classList.remove('visivel');
    document.body.classList.remove('carrinho-aberto');
    botaoAbrir?.setAttribute('aria-expanded', 'false');

    if (elementoQueAbriu?.isConnected) {
        elementoQueAbriu.focus();
    }
}

function montarGaveta() {
    document.body.insertAdjacentHTML('beforeend', `
        <div id="carrinho-fundo" class="carrinho-fundo"></div>
        <aside id="carrinho-lateral" role="dialog" aria-modal="true" aria-labelledby="titulo-carrinho" aria-hidden="true">
            <div class="carrinho-cabecalho">
                <h2 id="titulo-carrinho">Seu carrinho</h2>
                <button type="button" class="btn-fechar" id="btn-fechar-carrinho">Fechar</button>
            </div>
            <div id="itens-carrinho"></div>
            <div class="carrinho-rodape">
                <h3>Total: <span id="total-carrinho">R$ 0,00</span></h3>
                <button type="button" id="btn-finalizar">Finalizar compra</button>
            </div>
        </aside>
    `);

    gaveta = document.getElementById('carrinho-lateral');
    fundo = document.getElementById('carrinho-fundo');
}

function registrarEventos() {
    botaoAbrir?.addEventListener('click', abrirCarrinho);
    fundo.addEventListener('click', fecharCarrinho);
    document.getElementById('btn-fechar-carrinho').addEventListener('click', fecharCarrinho);
    document.getElementById('btn-finalizar').addEventListener('click', finalizarCompra);

    document.addEventListener('keydown', evento => {
        if (evento.key === 'Escape' && gaveta.classList.contains('carrinho-visivel')) {
            fecharCarrinho();
        }
    });

    document.getElementById('itens-carrinho').addEventListener('click', evento => {
        const botao = evento.target.closest('[data-acao]');

        if (!botao) {
            return;
        }

        const id = Number(botao.dataset.id);

        switch (botao.dataset.acao) {
            case 'aumentar':
                alterarQuantidade(id, 1);
                break;
            case 'diminuir':
                alterarQuantidade(id, -1);
                break;
            case 'remover':
                removerDoCarrinho(id);
                break;
        }
    });
}

/* ---------- Inicialização ---------- */

/**
 * Inicializa o carrinho: monta a gaveta, restaura os itens salvos e registra
 * os eventos. Deve ser chamada após o carregamento dos produtos.
 * @param {Array<object>} produtos Lista completa de produtos.
 */
export function iniciarCarrinho(produtos) {
    produtosPorId = new Map(produtos.map(produto => [produto.id, produto]));
    botaoAbrir = document.getElementById('btn-abrir-carrinho');

    montarGaveta();
    registrarEventos();

    // Descarta itens salvos cujo produto não existe mais no catálogo.
    itens = lerItensSalvos().filter(item => produtosPorId.has(item.id));
    atualizarCarrinho();
}