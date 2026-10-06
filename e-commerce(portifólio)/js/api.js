/**
 * Camada de acesso aos dados.
 *
 * Este é o único módulo que conhece a origem dos produtos. Ao integrar um
 * back-end, apenas a constante URL_PRODUTOS (ou o corpo de carregarProdutos)
 * precisa ser alterada.
 */

const URL_PRODUTOS = './data/produtos.json';

/**
 * Busca a lista de produtos.
 * @returns {Promise<Array<object>>} Lista de produtos.
 * @throws {Error} Se a requisição falhar ou a resposta for inválida.
 */
export async function carregarProdutos() {
    const resposta = await fetch(URL_PRODUTOS);

    if (!resposta.ok) {
        throw new Error(`Falha ao carregar produtos (HTTP ${resposta.status}).`);
    }

    const dados = await resposta.json();

    if (!Array.isArray(dados.produtos)) {
        throw new Error('Formato de dados inválido: a propriedade "produtos" não é uma lista.');
    }

    return dados.produtos;
}