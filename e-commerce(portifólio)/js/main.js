/**
 * Ponto de entrada da aplicação.
 * Carrega os produtos e inicializa os módulos conforme a página atual.
 */

import { carregarProdutos } from './api.js';
import { iniciarCarrinho } from './carrinho.js';
import { iniciarDestaques, iniciarCatalogo } from './catalogo.js';
import { iniciarPaginaProduto } from './produto.js';

const CONTAINERS_DE_CONTEUDO = ['vitrine-destaques', 'vitrine-catalogo', 'detalhes-produto'];

function exibirErroDeCarregamento() {
    CONTAINERS_DE_CONTEUDO.forEach(id => {
        const container = document.getElementById(id);

        if (container) {
            container.innerHTML = '<p class="mensagem-vazia">Não foi possível carregar os produtos. Tente novamente mais tarde.</p>';
        }
    });
}

async function inicializar() {
    let produtos;

    try {
        produtos = await carregarProdutos();
    } catch (erro) {
        console.error('Erro ao carregar os produtos:', erro);
        exibirErroDeCarregamento();
        return;
    }

    iniciarCarrinho(produtos);

    if (document.getElementById('vitrine-destaques')) {
        iniciarDestaques(produtos);
    }

    if (document.getElementById('vitrine-catalogo')) {
        iniciarCatalogo(produtos);
    }

    if (document.getElementById('detalhes-produto')) {
        iniciarPaginaProduto(produtos);
    }
}

inicializar();